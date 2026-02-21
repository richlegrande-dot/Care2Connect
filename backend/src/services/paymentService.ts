import { stripe, isStripeConfigured, getStripeClient } from "../config/stripe";
import FileStore from "./fileStore";

export const PaymentService = {
  createCheckoutSession: async ({
    clientSlug,
    amountCents,
    successUrl,
    cancelUrl,
  }: any) => {
    if (!isStripeConfigured()) throw new Error("Stripe not configured");

    const stripeClient = getStripeClient();

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Donation for ${clientSlug}` },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // Persist a donation record to FileStore
    FileStore.saveDonation({
      sessionId: session.id,
      clientSlug,
      amountCents,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return { sessionId: session.id, url: session.url };
  },
  handleCheckoutComplete: async (sessionId: string) => {
    // Mark donation as completed in FileStore
    FileStore.updateDonationStatus(sessionId, { status: "completed" });
  },
  getDonationsByClient: async (clientSlug: string) => {
    // For now, no DB: return empty stub
    return [];
  },
};

export default PaymentService;
