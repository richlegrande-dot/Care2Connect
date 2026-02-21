import {
  detectStripeKeyType,
  resolveStripeKeysFromEnv,
} from "../../utils/stripeKeyDetector";

describe("Stripe key detector", () => {
  it("detects secret key by prefix", () => {
    expect(detectStripeKeyType("sk_test_abc")).toBe("secret");
  });

  it("detects publishable key by prefix", () => {
    expect(detectStripeKeyType("pk_test_abc")).toBe("publishable");
  });

  it("returns unknown for others", () => {
    expect(detectStripeKeyType("xyz")).toBe("unknown");
  });

  it("resolveStripeKeysFromEnv prefers STRIPE_KEY", () => {
    const prev = process.env.STRIPE_KEY;
    process.env.STRIPE_KEY = "sk_test_resolve";
    const res = resolveStripeKeysFromEnv();
    expect(res.secret).toBe("sk_test_resolve");
    process.env.STRIPE_KEY = prev as any;
  });
});
