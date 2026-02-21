import { Router, Request, Response } from "express";
import qrcode from "qrcode";
import { resolveStripeKeysFromEnv } from "../utils/stripeKeyDetector";

const router = Router();

/**
 * Generate QR code for donation page
 * POST /api/qr/generate
 * Body: { url: string, size?: number }
 */
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { url, size = 300 } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    // Generate QR code as data URL
    const qrDataUrl = await qrcode.toDataURL(url, {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });

    return res.status(200).json({
      success: true,
      qrCodeUrl: qrDataUrl,
      url,
    });
  } catch (error: any) {
    console.error("[QR] Generation error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to generate QR code",
      message: error.message,
    });
  }
});

/**
 * Generate QR code as PNG buffer
 * GET /api/qr/download/:encodedUrl
 */
router.get("/download/:encodedUrl", async (req: Request, res: Response) => {
  try {
    const url = decodeURIComponent(req.params.encodedUrl);
    const size = parseInt(req.query.size as string) || 300;

    // Generate QR code as PNG buffer
    const qrBuffer = await qrcode.toBuffer(url, {
      width: size,
      margin: 2,
      type: "png",
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename="qr-code.png"`);
    res.send(qrBuffer);
  } catch (error: any) {
    console.error("[QR] Download error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to generate QR code",
      message: error.message,
    });
  }
});

export default router;

// Status endpoint to report stripe/qr configuration for tests
router.get("/status", (req: Request, res: Response) => {
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
