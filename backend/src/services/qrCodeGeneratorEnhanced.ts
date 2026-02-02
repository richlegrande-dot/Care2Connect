/**
 * Updated QR Code Generation for Manual Mode
 * 
 * Ensures QR/Stripe works identically for automated and manual drafts
 */

import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import { createCheckoutSession } from './stripeService';
import { GenerationMode } from '../types/fallback';

const prisma = new PrismaClient();

export interface EnhancedCreatePaymentQROptions {
  ticketId: string;
  amount: number;
  currency?: string;
  description?: string;
  successUrl?: string;
  cancelUrl?: string;
  generationMode?: GenerationMode;
  draftId?: string;
}

/**
 * Create payment QR with generation mode metadata
 */
export async function createPaymentQRWithMode(
  options: EnhancedCreatePaymentQROptions
): Promise<any> {
  
  const {
    ticketId,
    amount,
    currency = 'USD',
    description,
    successUrl,
    cancelUrl,
    generationMode = 'AUTOMATED',
    draftId
  } = options;

  console.log(`[QR Generator] Creating QR for ticket ${ticketId} (${generationMode} mode)`);

  // Verify ticket exists
  const ticket = await prisma.recordingTicket.findUnique({
    where: { id: ticketId }
  });

  if (!ticket) {
    throw new Error(`Ticket ${ticketId} not found`);
  }

  const amountCents = Math.round(amount * 100);

  // Build URLs
  const baseUrl = process.env.FRONTEND_URL || 'https://care2connects.org';
  const finalSuccessUrl = successUrl || `${baseUrl}/payment-success?ticket=${ticketId}`;
  const finalCancelUrl = cancelUrl || `${baseUrl}/payment-cancel?ticket=${ticketId}`;

  // Create Stripe Checkout Session with enhanced metadata
  const checkoutResult = await createCheckoutSession({
    ticketId,
    amount,
    currency,
    description: description || `Donation for ${ticket.displayName || 'Campaign'}`,
    successUrl: finalSuccessUrl,
    cancelUrl: finalCancelUrl,
    metadata: {
      ticketId,
      generationMode,
      source: generationMode === 'MANUAL_FALLBACK' ? 'manual_fallback' : 'automated',
      draftId: draftId || '',
      recordingId: ticket.recordingId || ''
    }
  });

  if (!checkoutResult.checkoutUrl) {
    throw new Error('Failed to create Stripe Checkout Session');
  }

  // Generate QR Code
  const qrCodeData = await QRCode.toDataURL(checkoutResult.checkoutUrl, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 2
  });

  // Save/update QR code link with generation mode
  let qrCode = await prisma.qRCodeLink.findUnique({
    where: { ticketId }
  });

  if (qrCode) {
    qrCode = await prisma.qRCodeLink.update({
      where: { id: qrCode.id },
      data: {
        targetUrl: checkoutResult.checkoutUrl,
        amountCents,
        metadata: {
          generationMode,
          draftId,
          checkoutSessionId: checkoutResult.checkoutSessionId
        },
        updatedAt: new Date()
      }
    });
  } else {
    qrCode = await prisma.qRCodeLink.create({
      data: {
        ticketId,
        targetUrl: checkoutResult.checkoutUrl,
        amountCents,
        version: 1,
        metadata: {
          generationMode,
          draftId,
          checkoutSessionId: checkoutResult.checkoutSessionId
        }
      }
    });
  }

  console.log(`[QR Generator] QR created for ${generationMode} draft: ${qrCode.id}`);

  return {
    success: true,
    qrCodeId: qrCode.id,
    checkoutSessionId: checkoutResult.checkoutSessionId,
    checkoutUrl: checkoutResult.checkoutUrl,
    qrCodeData,
    generationMode
  };
}

/**
 * Generate QR from manual draft
 */
export async function generateQRFromManualDraft(
  ticketId: string,
  draftId: string
): Promise<any> {
  
  // Get draft
  const draft = await prisma.donationDraft.findUnique({
    where: { id: draftId }
  });

  if (!draft) {
    throw new Error(`Draft ${draftId} not found`);
  }

  if (draft.ticketId !== ticketId) {
    throw new Error('Draft ticket ID mismatch');
  }

  // Generate QR with manual mode metadata
  return await createPaymentQRWithMode({
    ticketId,
    amount: draft.goalAmount,
    currency: draft.currency || 'USD',
    description: draft.title,
    generationMode: 'MANUAL_FALLBACK',
    draftId: draft.id
  });
}
