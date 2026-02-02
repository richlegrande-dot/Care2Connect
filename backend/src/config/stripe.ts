import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Log configuration status at startup
if (!STRIPE_SECRET_KEY) {
  console.warn("⚠️  Stripe secret key is not configured. Stripe features are disabled.");
} else {
  console.log("✅ Stripe secret key configured");
}

if (!STRIPE_WEBHOOK_SECRET) {
  console.warn("⚠️  Stripe webhook secret not configured. Incoming webhook events will be ignored.");
} else {
  console.log("✅ Stripe webhook secret configured");
}

// Create Stripe client only if key exists
export const stripe = STRIPE_SECRET_KEY 
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  : null;

/**
 * Check if Stripe payments are fully configured
 */
export const isStripeConfigured = (): boolean => {
  return Boolean(STRIPE_SECRET_KEY);
};

/**
 * Check if Stripe webhooks are configured
 */
export const isWebhookConfigured = (): boolean => {
  return Boolean(STRIPE_WEBHOOK_SECRET);
};

/**
 * Get Stripe client with error handling
 * Throws controlled error if Stripe is not configured
 */
export const getStripeClient = (): Stripe => {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please contact the administrator.");
  }
  return stripe;
};

/**
 * Get webhook secret with validation
 */
export const getWebhookSecret = (): string => {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe webhook secret is not configured.");
  }
  return STRIPE_WEBHOOK_SECRET;
};

/**
 * Get user-friendly error message for missing configuration
 */
export const getStripeError = (): string => {
  if (!STRIPE_SECRET_KEY) {
    return "Stripe is not configured. Please contact the administrator.";
  }
  return "";
};