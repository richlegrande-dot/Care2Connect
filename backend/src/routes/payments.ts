import { Router, Request, Response } from "express";
import { PaymentService } from "../services/paymentService";
import { isStripeConfigured, getStripeError } from "../config/stripe";

const router = Router();

// POST /api/payments/create-checkout-session
router.post("/create-checkout-session", async (req: Request, res: Response) => {
  try {
    // Check Stripe configuration first
    if (!isStripeConfigured()) {
      return res.status(500).json({
        error: getStripeError(),
        code: "STRIPE_NOT_CONFIGURED",
      });
    }

    const { clientSlug, amountCents } = req.body;

    // Validate input
    if (!clientSlug || typeof clientSlug !== "string") {
      return res.status(400).json({
        error: "clientSlug is required and must be a string",
      });
    }

    if (!amountCents || typeof amountCents !== "number") {
      return res.status(400).json({
        error: "amountCents is required and must be a number",
      });
    }

    const result = await PaymentService.createCheckoutSession({
      clientSlug,
      amountCents,
      successUrl: `${process.env.APP_DOMAIN || "http://localhost:3000"}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.APP_DOMAIN || "http://localhost:3000"}/donate/cancel?client=${clientSlug}`,
    });

    res.json(result);
  } catch (error: any) {
    console.error("Create checkout session error:", error);

    if (error.message.includes("Client not found")) {
      return res.status(404).json({ error: error.message });
    }

    if (error.message.includes("Invalid amount")) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({
      error: "Failed to create checkout session",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/payments/session/:sessionId
router.get("/session/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    // For now, just return basic info from database
    // In a full implementation, you might want to verify with Stripe
    const donation = await PaymentService.getDonationsByClient(""); // This needs proper implementation

    res.json({
      sessionId,
      status: "This endpoint needs full implementation",
      message: "Payment status can be checked here",
    });
  } catch (error: any) {
    console.error("Get session error:", error);
    res.status(500).json({ error: "Failed to retrieve session" });
  }
});

export default router;
