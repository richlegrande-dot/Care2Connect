import { Router, Request, Response } from "express";
import QRCode from "qrcode";
import { body, param, query } from "express-validator";
import { validateRequest } from "../middleware/validateRequest";
import { resolveStripeKeysFromEnv } from "../utils/stripeKeyDetector";
// import { PaymentService } from '../services/paymentService'; // Disabled for demo

const router = Router();

/**
 * POST /api/qr/generate
 * Generate QR code for donation URL
 */
router.post(
  "/generate",
  [
    body("url").isURL().withMessage("Valid URL is required"),
    body("publicSlug")
      .isString()
      .notEmpty()
      .withMessage("Public slug is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { url, publicSlug } = req.body;

      // Generate QR code as data URL (base64)
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });

      // Also generate as buffer for file saving if needed
      const qrCodeBuffer = await QRCode.toBuffer(url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });

      res.json({
        success: true,
        data: {
          qrCodeUrl: qrCodeDataUrl,
          donationUrl: url,
          publicSlug,
          instructions: [
            "1. Show this QR code to potential donors",
            "2. They can scan it with their phone camera",
            "3. It will open your donation page directly",
            "4. They can donate securely with debit/credit card",
          ],
        },
      });
    } catch (error) {
      console.error("QR generation error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate QR code",
      });
    }
  },
);

/**
 * POST /api/qr/donation-page
 * Generate QR code for internal donation page
 */
router.post(
  "/donation-page",
  [
    body("publicSlug")
      .isString()
      .notEmpty()
      .withMessage("Public slug is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { publicSlug } = req.body;
      const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const donationUrl = `${baseUrl}/donate/${publicSlug}`;

      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(donationUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });

      res.json({
        success: true,
        data: {
          qrCodeUrl: qrCodeDataUrl,
          donationUrl,
          publicSlug,
          message: "QR code generated successfully",
        },
      });
    } catch (error) {
      console.error("QR generation error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate donation QR code",
      });
    }
  },
);

/**
 * POST /api/stripe/checkout
 * Create Stripe checkout session for donation
 */
router.post(
  "/checkout",
  [
    body("publicSlug")
      .isString()
      .notEmpty()
      .withMessage("Public slug is required"),
    body("amount").isNumeric().withMessage("Amount is required"),
    body("donorEmail").optional().isEmail().withMessage("Invalid email format"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { publicSlug, amount, donorEmail } = req.body;

      // Convert amount to cents
      const amountCents = Math.round(parseFloat(amount) * 100);

      if (amountCents < 50) {
        // Minimum $0.50
        return res.status(400).json({
          success: false,
          error: "Minimum donation amount is $0.50",
        });
      }

      if (amountCents > 500000) {
        // Maximum $5,000
        return res.status(400).json({
          success: false,
          error: "Maximum donation amount is $5,000",
        });
      }

      const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

      // PaymentService disabled for demo - return mock data
      const checkoutResult = {
        checkoutUrl: `${baseUrl}/donate/${publicSlug}/checkout`,
        sessionId: "mock-session-id",
      };
      /* const checkoutResult = await PaymentService.createCheckoutSession({
        clientSlug: publicSlug,
        amountCents,
        successUrl: `${baseUrl}/donate/${publicSlug}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/donate/${publicSlug}?cancelled=true`
      }); */

      res.json({
        success: true,
        data: {
          checkoutUrl: checkoutResult.checkoutUrl,
          sessionId: checkoutResult.sessionId,
        },
      });
    } catch (error) {
      console.error("Checkout creation error:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
      });
    }
  },
);

/**
 * GET /api/stripe/status
 * Check Stripe configuration status
 */
router.get("/status", (req, res) => {
  const { secret, publishable } = resolveStripeKeysFromEnv();
  const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;
  const checkoutMode = (
    process.env.STRIPE_CHECKOUT_MODE || "redirect_only"
  ).toLowerCase();

  const requirements = {
    secretKey: !!secret,
    publishableKey: !!publishable,
    webhookSecret: hasWebhookSecret,
  };

  let configured = false;
  if (checkoutMode === "redirect_only") {
    configured = !!secret; // publishable not required
  } else {
    configured = !!secret && !!publishable;
  }

  res.json({
    success: true,
    data: {
      configured,
      checkoutMode,
      webhookConfigured: hasWebhookSecret,
      publishableKey: publishable || null,
      testMode: process.env.NODE_ENV !== "production",
      requirements,
    },
  });
});

export default router;
