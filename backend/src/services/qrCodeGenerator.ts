import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import { createCheckoutSession } from './stripeService';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Phase 6: QR Code Generator Service (Phase 6E: Enhanced with versioning)
 * 
 * Creates QR codes linking to Stripe Checkout Sessions
 * Integrates with StripeAttribution for payment tracking
 * 
 * Phase 6E Features:
 * - Version tracking (increment on amount change)
 * - Audit trail (QRCodeHistory)
 * - Regeneration rules (new QR when amount changes)
 * - Scan counting
 */

export interface CreatePaymentQROptions {
  ticketId: string;
  amount: number; // in dollars
  currency?: string;
  description?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreatePaymentQRResult {
  success: boolean;
  qrCodeId?: string;
  checkoutSessionId?: string;
  checkoutUrl?: string;
  qrCodeData?: string; // base64 data URL
  qrImagePath?: string; // file path if saved
  error?: string;
}

/**
 * Create a complete payment flow: Stripe Checkout + QR Code + Attribution
 * Phase 6E: Enhanced with versioning and regeneration logic
 */
export async function createPaymentQR(options: CreatePaymentQROptions): Promise<CreatePaymentQRResult> {
  try {
    console.log(`[QR Generator] Creating payment QR for ticket ${options.ticketId}`);

    // Verify ticket exists
    const ticket = await prisma.recordingTicket.findUnique({
      where: { id: options.ticketId },
    });

    if (!ticket) {
      throw new Error(`Ticket ${options.ticketId} not found`);
    }

    // Convert amount to cents
    const amountCents = Math.round(options.amount * 100);

    // Build URLs
    const baseUrl = process.env.FRONTEND_URL || 'https://care2connects.org';
    const successUrl = options.successUrl || `${baseUrl}/payment-success?ticket=${options.ticketId}`;
    const cancelUrl = options.cancelUrl || `${baseUrl}/payment-cancel?ticket=${options.ticketId}`;

    // Check for existing QR code
    const existingQR = await prisma.qRCodeLink.findUnique({
      where: { ticketId: options.ticketId },
    });

    let shouldRegenerateQR = false;
    let regenerationReason = 'initial_creation';

    if (existingQR) {
      // Check if amount changed (requires new QR)
      if (existingQR.amountCents && existingQR.amountCents !== amountCents) {
        shouldRegenerateQR = true;
        regenerationReason = 'amount_changed';
        console.log(`[QR Generator] Amount changed from $${existingQR.amountCents / 100} to $${amountCents / 100}, regenerating QR`);
      } else {
        // Amount same, reuse existing QR
        console.log(`[QR Generator] Reusing existing QR code for ticket ${options.ticketId}`);
        return {
          success: true,
          qrCodeId: existingQR.id,
          checkoutUrl: existingQR.targetUrl,
          qrCodeData: await QRCode.toDataURL(existingQR.targetUrl, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 300,
            margin: 2,
          }),
          qrImagePath: existingQR.imageStorageUrl || undefined,
        };
      }
    }

    // Create NEW Stripe Checkout Session (always create new session)
    const checkoutResult = await createCheckoutSession({
      ticketId: options.ticketId,
      amount: options.amount,
      currency: options.currency,
      description: options.description || `Donation for ${ticket.displayName || 'Campaign'}`,
      successUrl,
      cancelUrl,
    });

    if (!checkoutResult.checkoutUrl) {
      throw new Error('Failed to create Stripe Checkout Session');
    }

    // Generate QR Code
    const qrCodeData = await QRCode.toDataURL(checkoutResult.checkoutUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
    });

    // Optionally save QR code image to file
    let qrImagePath: string | undefined;
    if (process.env.SAVE_QR_IMAGES === 'true') {
      const qrDir = path.join(process.cwd(), 'storage', 'qr-codes');
      if (!fs.existsSync(qrDir)) {
        fs.mkdirSync(qrDir, { recursive: true });
      }

      qrImagePath = path.join(qrDir, `qr-${options.ticketId}-v${existingQR ? existingQR.version + 1 : 1}.png`);
      const base64Data = qrCodeData.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(qrImagePath, base64Data, 'base64');
    }

    let qrCode;

    if (existingQR && shouldRegenerateQR) {
      // Archive old version to history
      await prisma.qRCodeHistory.create({
        data: {
          qrCodeId: existingQR.id,
          version: existingQR.version,
          amountCents: existingQR.amountCents || 0,
          targetUrl: existingQR.targetUrl,
          reason: regenerationReason,
        },
      });

      // Update existing record with new version
      qrCode = await prisma.qRCodeLink.update({
        where: { id: existingQR.id },
        data: {
          targetUrl: checkoutResult.checkoutUrl,
          imageStorageUrl: qrImagePath,
          version: existingQR.version + 1,
          amountCents: amountCents,
          updatedAt: new Date(),
        },
      });

      console.log(`[QR Generator] QR code updated to version ${qrCode.version}`);
    } else {
      // Create new QR code
      qrCode = await prisma.qRCodeLink.create({
        data: {
          ticketId: options.ticketId,
          targetUrl: checkoutResult.checkoutUrl,
          imageStorageUrl: qrImagePath,
          version: 1,
          amountCents: amountCents,
        },
      });

      // Create initial history entry
      await prisma.qRCodeHistory.create({
        data: {
          qrCodeId: qrCode.id,
          version: 1,
          amountCents: amountCents,
          targetUrl: checkoutResult.checkoutUrl,
          reason: 'initial_creation',
        },
      });

      console.log(`[QR Generator] QR code created: ${qrCode.id}`);
    }

    return {
      success: true,
      qrCodeId: qrCode.id,
      checkoutSessionId: checkoutResult.checkoutSessionId,
      checkoutUrl: checkoutResult.checkoutUrl,
      qrCodeData,
      qrImagePath,
    };

  } catch (error: any) {
    console.error('[QR Generator] Error creating payment QR:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get existing QR code for a ticket
 */
export async function getTicketQRCode(ticketId: string) {
  const qrLink = await prisma.qRCodeLink.findUnique({
    where: { ticketId },
  });

  if (!qrLink) {
    return null;
  }

  // Regenerate QR code data if needed
  const qrCodeData = await QRCode.toDataURL(qrLink.targetUrl, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 2,
  });

  return {
    id: qrLink.id,
    ticketId: qrLink.ticketId,
    targetUrl: qrLink.targetUrl,
    qrCodeData,
    imageStorageUrl: qrLink.imageStorageUrl,
    createdAt: qrLink.createdAt,
  };
}

/**
 * Get QR code as PNG buffer
 */
export async function getQRCodeBuffer(url: string): Promise<Buffer> {
  return await QRCode.toBuffer(url, {
    errorCorrectionLevel: 'M',
    type: 'png',
    width: 300,
    margin: 2,
  });
}

/**
 * Get QR code history for a ticket (Phase 6E)
 */
export async function getQRCodeHistory(ticketId: string) {
  const qrLink = await prisma.qRCodeLink.findUnique({
    where: { ticketId },
    include: {
      history: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!qrLink) {
    return null;
  }

  return {
    currentVersion: qrLink.version,
    currentAmount: qrLink.amountCents ? qrLink.amountCents / 100 : null,
    scanCount: qrLink.scanCount,
    history: qrLink.history.map(h => ({
      version: h.version,
      amount: h.amountCents / 100,
      reason: h.reason,
      createdAt: h.createdAt,
    })),
  };
}

/**
 * Increment scan count for a QR code (Phase 6E)
 */
export async function incrementQRScanCount(ticketId: string): Promise<void> {
  await prisma.qRCodeLink.updateMany({
    where: { ticketId },
    data: {
      scanCount: {
        increment: 1,
      },
    },
  });
}

/**
 * Force regenerate QR code (admin action, Phase 6E)
 */
export async function forceRegenerateQR(
  ticketId: string,
  reason: string = 'user_requested'
): Promise<CreatePaymentQRResult> {
  // Get existing QR to get amount
  const existingQR = await prisma.qRCodeLink.findUnique({
    where: { ticketId },
  });

  if (!existingQR || !existingQR.amountCents) {
    throw new Error('Cannot regenerate QR without existing amount');
  }

  // Archive current version
  await prisma.qRCodeHistory.create({
    data: {
      qrCodeId: existingQR.id,
      version: existingQR.version,
      amountCents: existingQR.amountCents,
      targetUrl: existingQR.targetUrl,
      reason,
    },
  });

  // Create new QR with same amount (will increment version)
  return await createPaymentQR({
    ticketId,
    amount: existingQR.amountCents / 100,
  });
}

export default {
  createPaymentQR,
  getTicketQRCode,
  getQRCodeBuffer,
  getQRCodeHistory,
  incrementQRScanCount,
  forceRegenerateQR,
};
