import {
  getStripeClient,
  isStripeConfigured,
  isWebhookConfigured,
} from "../config/stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Phase 6: Stripe Integration Service
 *
 * Handles:
 * - Creating Checkout Sessions with RecordingTicket metadata
 * - Storing StripeAttribution records
 * - Webhook signature verification
 * - Payment status updates
 */

export interface CreateCheckoutSessionParams {
  ticketId: string;
  amount: number; // in dollars (will be converted to cents)
  currency?: string;
  description?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  checkoutSessionId: string;
  checkoutUrl: string | null;
  attributionId: string;
}

/**
 * Create a Stripe Checkout Session for a RecordingTicket
 * Stores attribution in database immediately
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams,
): Promise<CheckoutSessionResult> {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured. Contact administrator.");
  }

  // Verify ticket exists
  const ticket = await prisma.recordingTicket.findUnique({
    where: { id: params.ticketId },
  });

  if (!ticket) {
    throw new Error(`RecordingTicket with ID ${params.ticketId} not found`);
  }

  const stripe = getStripeClient();
  const amountCents = Math.round(params.amount * 100); // Convert to cents
  const currency = params.currency || "USD";

  // Create Checkout Session with ticket metadata
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: params.description || `Donation via Care2Connect`,
            description: `Ticket: ${ticket.displayName || ticket.id}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      ticketId: params.ticketId,
      source: "care2connect_donation_pipeline",
    },
  });

  // Store attribution in database
  const attribution = await prisma.stripe_attributions.create({
    data: {
      id: crypto.randomUUID(),
      ticketId: params.ticketId,
      checkoutSessionId: session.id,
      amount: params.amount,
      currency: currency,
      status: "CREATED",
      metadataSnapshot: session.metadata as any,
      updatedAt: new Date(),
    },
  });

  return {
    checkoutSessionId: session.id,
    checkoutUrl: session.url,
    attributionId: attribution.id,
  };
}

/**
 * Verify Stripe webhook signature
 * CRITICAL: Always verify webhook signatures to prevent attacks
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
): any {
  if (!isWebhookConfigured()) {
    throw new Error("Stripe webhook secret not configured");
  }

  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
    return event;
  } catch (err) {
    const error = err as Error;
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
}

/**
 * Handle checkout.session.completed webhook event
 * Updates StripeAttribution with payment details
 * NOTE: Full donor details are populated by payment_intent.succeeded webhook
 */
export async function handleCheckoutCompleted(session: any): Promise<void> {
  const checkoutSessionId = session.id;
  const paymentIntentId = session.payment_intent as string | null;

  // Find existing attribution
  const attribution = await prisma.stripe_attributions.findUnique({
    where: { checkoutSessionId },
  });

  if (!attribution) {
    console.warn(
      `[Stripe Webhook] No attribution found for session: ${checkoutSessionId}`,
    );
    return;
  }

  // Update attribution with payment intent and initial status
  // Donor details will be filled by payment_intent.succeeded webhook
  await prisma.stripe_attributions.update({
    where: { id: attribution.id },
    data: {
      paymentIntentId,
      status: "CREATED", // Will be updated to PAID by payment_intent.succeeded
      webhookEventId: session.id, // Idempotency: store event ID
      metadataSnapshot: session.metadata as any,
      stripeCreatedAt: new Date(session.created * 1000),
    },
  });

  console.log(
    `[Stripe] Checkout completed for ticket ${attribution.ticketId}, awaiting payment confirmation`,
  );
}

/**
 * Handle checkout.session.expired webhook event
 */
export async function handleCheckoutExpired(session: any): Promise<void> {
  const checkoutSessionId = session.id;

  const attribution = await prisma.stripe_attributions.findUnique({
    where: { checkoutSessionId },
  });

  if (!attribution) {
    return;
  }

  await prisma.stripe_attributions.update({
    where: { id: attribution.id },
    data: {
      status: "EXPIRED",
      webhookEventId: session.id,
    },
  });

  console.log(`[Stripe] Checkout expired for ticket ${attribution.ticketId}`);
}

/**
 * Get all attributions for a RecordingTicket
 */
export async function getTicketAttributions(ticketId: string) {
  return await prisma.stripe_attributions.findMany({
    where: { ticketId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Check if Stripe is ready for Phase 6 operations
 */
export function getStripeStatus() {
  return {
    configured: isStripeConfigured(),
    webhooksConfigured: isWebhookConfigured(),
    ready: isStripeConfigured() && isWebhookConfigured(),
    testMode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") || false,
  };
}

export default {
  createCheckoutSession,
  verifyWebhookSignature,
  handleCheckoutCompleted,
  handleCheckoutExpired,
  getTicketAttributions,
  getStripeStatus,
};
