import { Router, Request, Response } from 'express';
import { stripe, isStripeConfigured } from '../config/stripe';
import { PaymentService } from '../services/paymentService';
import StripeService from '../services/stripeService'; // Phase 6
import Stripe from 'stripe';
import { updateWebhookReceived, getWebhookState } from '../utils/webhookTracker';
import FileStore from '../services/fileStore';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

const router = Router();

/**
 * Check if webhook event already processed (idempotency)
 */
async function isEventProcessed(stripeEventId: string): Promise<boolean> {
  const existing = await prisma.stripeEvent.findUnique({
    where: { stripeEventId },
  });
  return !!existing;
}

/**
 * Record webhook event for idempotency
 */
async function recordWebhookEvent(event: Stripe.Event, error?: string): Promise<void> {
  await prisma.stripeEvent.create({
    data: {
      stripeEventId: event.id,
      type: event.type,
      stripeCreated: new Date(event.created * 1000),
      livemode: event.livemode,
      processedAt: new Date(),
      error: error || null,
    },
  });
}

/**
 * Extract donor last name from Stripe billing details
 * Privacy: Only store last name, never full name
 */
function extractDonorLastName(name: string | null | undefined): string | null {
  if (!name) return null;
  
  const tokens = name.trim().split(/\s+/);
  if (tokens.length === 0) return null;
  
  // Return last token as "last name"
  return tokens[tokens.length - 1] || null;
}

/**
 * Hash email for deduplication without storing actual email
 */
function hashEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

/**
 * GET /api/payments/stripe-webhook
 * Public probe endpoint - confirms webhook route is registered and reachable
 * Returns helpful info for humans and monitoring without leaking secrets
 */
router.get('/stripe-webhook', (req: Request, res: Response) => {
  const webhookState = getWebhookState();
  const isConfigured = !!process.env.STRIPE_WEBHOOK_SECRET;
  
  res.status(200).json({
    ok: true,
    endpoint: 'stripe-webhook',
    method: 'POST',
    description: 'This endpoint accepts Stripe webhook POST requests',
    signatureVerification: isConfigured ? 'enabled' : 'disabled',
    configured: isConfigured,
    lastWebhook: {
      receivedAt: webhookState.lastWebhookReceivedAt || null,
      eventType: webhookState.lastWebhookEventType || null,
      verified: webhookState.lastWebhookVerified,
      error: webhookState.lastWebhookError || null,
    },
    howToTest: {
      browser: 'This GET request - confirms endpoint is reachable',
      real: 'Send POST from Stripe Dashboard > Webhooks > Send test event',
      cli: 'stripe trigger payment_intent.succeeded --api-key=YOUR_SECRET_KEY',
    },
    url: 'https://api.care2connects.org/api/payments/stripe-webhook',
    note: isConfigured 
      ? 'Webhook endpoint is configured and ready to receive events'
      : 'Webhook endpoint exists but STRIPE_WEBHOOK_SECRET not configured (will accept but not verify)',
  });
});

// Raw body parser middleware for this specific route
// This should be applied before the webhook endpoint
const rawBodyParser = (req: Request, res: Response, next: any) => {
  if (req.originalUrl === '/api/payments/stripe-webhook') {
    let data = '';
    req.setEncoding('utf8');
    
    req.on('data', (chunk) => {
      data += chunk;
    });
    
    req.on('end', () => {
      (req as any).rawBody = data;
      next();
    });
  } else {
    next();
  }
};

// POST /api/payments/stripe-webhook
router.post('/stripe-webhook', rawBodyParser, async (req: Request, res: Response) => {
  const sig = req.get('stripe-signature');
  
  // If Stripe not configured at all, return 503 with safe message
  if (!stripe) {
    console.error('⚠️ Stripe client not configured, cannot process webhook');
    const payload = (req as any).rawBody || req.body;
    FileStore.saveWebhookEvent({ verified: false, reason: 'stripe_not_configured', payload: typeof payload === 'string' ? payload : JSON.parse(JSON.stringify(payload)) });
    return res.status(503).json({ 
      received: false, 
      error: 'Webhook not configured',
      message: 'STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET missing - cannot process webhook',
      note: 'Payload saved for debugging'
    });
  }

  let event: Stripe.Event | null = null;

  const rawBody = (req as any).rawBody || JSON.stringify(req.body);

  if (process.env.STRIPE_WEBHOOK_SECRET) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig!, process.env.STRIPE_WEBHOOK_SECRET);
      // Mark webhook as verified
      updateWebhookReceived(event.type, true);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      FileStore.saveWebhookEvent({ verified: false, reason: 'signature_invalid', payload: rawBody, error: err.message });
      updateWebhookReceived((req.body && req.body.type) || 'unknown', false, err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }
  } else {
    // No webhook secret: accept the payload but mark as unverified
    try {
      const parsed = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
      event = parsed as Stripe.Event;
      FileStore.saveWebhookEvent({ verified: false, reason: 'no_webhook_secret', payload: event });
    } catch (e: any) {
      // store raw payload if JSON parse fails
      FileStore.saveWebhookEvent({ verified: false, reason: 'no_webhook_secret', payload: rawBody });
    }
  }

  // **IDEMPOTENCY CHECK**: Prevent duplicate processing
  if (!event) {
    console.error('[Webhook] Event is null after verification');
    return res.status(400).json({ error: 'Event could not be verified' });
  }
  
  const alreadyProcessed = await isEventProcessed(event.id);
  if (alreadyProcessed) {
    console.log(`[Webhook] ✅ Event ${event.id} already processed, skipping`);
    return res.json({ received: true, type: event.type, idempotent: true });
  }

  // Handle the event
  let processingError: string | undefined;
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Checkout session completed:', session.id);
        
        // Check if this is a Phase 6 donation (has ticketId metadata)
        if (session.metadata?.ticketId) {
          console.log(`[Phase 6] Processing donation for ticket: ${session.metadata.ticketId}`);
          await StripeService.handleCheckoutCompleted(session);
        } else {
          // Legacy payment flow
          await PaymentService.handleCheckoutComplete(session.id);
        }
        break;

      case 'checkout.session.expired':
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        console.log('⏰ Checkout session expired:', expiredSession.id);
        
        if (expiredSession.metadata?.ticketId) {
          await StripeService.handleCheckoutExpired(expiredSession);
        }
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('✅ Payment intent succeeded:', paymentIntent.id);
        
        // Enhanced tracking: Update attribution with payment details
        const attribution = await prisma.stripeAttribution.findFirst({
          where: { paymentIntentId: paymentIntent.id },
        });

        if (attribution) {
          console.log(`[Webhook] Updating attribution ${attribution.id} with payment details`);
          
          // Extract donor details from latest charge
          const latestCharge = paymentIntent.latest_charge as Stripe.Charge;
          const chargeDetails = latestCharge || (await stripe.charges.retrieve(paymentIntent.latest_charge as string));
          
          const donorLastName = extractDonorLastName(chargeDetails.billing_details?.name);
          const donorCountry = chargeDetails.billing_details?.address?.country || null;
          const donorEmailHash = hashEmail(chargeDetails.billing_details?.email);

          await prisma.stripeAttribution.update({
            where: { id: attribution.id },
            data: {
              status: 'PAID',
              chargeId: chargeDetails.id,
              donorLastName,
              donorCountry,
              donorEmailHash,
              stripeCreatedAt: new Date(paymentIntent.created * 1000),
              paidAt: new Date(),
            },
          });

          console.log(`[Webhook] ✅ Attribution updated: ${donorLastName ? `Donor: ${donorLastName}` : 'Anonymous'}`);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Payment failed:', failedPayment.id);
        
        // Update attribution status to FAILED
        await prisma.stripeAttribution.updateMany({
          where: { paymentIntentId: failedPayment.id },
          data: { status: 'FAILED' },
        });
        break;

      case 'charge.refunded':
        const charge = event.data.object as Stripe.Charge;
        console.log('💰 Charge refunded:', charge.id);
        
        // Update attribution status to REFUNDED
        const refundedAttribution = await prisma.stripeAttribution.findFirst({
          where: { chargeId: charge.id },
        });

        if (refundedAttribution) {
          await prisma.stripeAttribution.update({
            where: { id: refundedAttribution.id },
            data: {
              status: 'REFUNDED',
              refundedAt: new Date(),
            },
          });
          console.log(`[Webhook] ✅ Attribution ${refundedAttribution.id} marked as refunded`);
        }
        break;

      case 'charge.dispute.created':
        const dispute = event.data.object as Stripe.Dispute;
        console.log('⚠️ Dispute created for charge:', dispute.charge);
        
        // Update attribution status to DISPUTED
        await prisma.stripeAttribution.updateMany({
          where: { chargeId: dispute.charge as string },
          data: { status: 'DISPUTED' },
        });
        break;

      default:
        console.log(`🔍 Unhandled event type: ${event.type}`);
    }

    // **RECORD EVENT FOR IDEMPOTENCY**
    await recordWebhookEvent(event);

    // Return 200 to acknowledge receipt of the event
    res.json({ received: true, type: event.type });
  } catch (error: any) {
    processingError = error.message || String(error);
    console.error('❌ Error processing webhook:', error);
    
    // Record event with error for idempotency (don't retry same event)
    await recordWebhookEvent(event, processingError);
    
    // Record processing error
    updateWebhookReceived((event && event.type) || 'unknown', true, processingError);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Export route metadata for health checks
export const isWebhookRouteMounted = () => {
  // This function exists to confirm the route file is loaded
  // Health monitor will check this to verify endpoint registration
  return true;
};

export default router;