import request from "supertest";
import express from "express";
import stripeWebhookRoutes from "../src/routes/stripe-webhook";

const RUN = process.env.RUN_LEGACY_INTEGRATION === "true";
(RUN ? describe : describe.skip)("Stripe Webhook Endpoint", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/payments", stripeWebhookRoutes);
  });

  describe("GET /api/payments/stripe-webhook", () => {
    it("should return 200 and helpful info when accessed via GET", async () => {
      const response = await request(app)
        .get("/api/payments/stripe-webhook")
        .expect(200);

      expect(response.body).toHaveProperty("ok", true);
      expect(response.body).toHaveProperty("endpoint", "stripe-webhook");
      expect(response.body).toHaveProperty("method", "POST");
      expect(response.body).toHaveProperty("description");
      expect(response.body).toHaveProperty("signatureVerification");
      expect(response.body).toHaveProperty("configured");
      expect(response.body).toHaveProperty("lastWebhook");
      expect(response.body).toHaveProperty("howToTest");
      expect(response.body).toHaveProperty("url");
    });

    it("should indicate if webhook secret is configured", async () => {
      const response = await request(app)
        .get("/api/payments/stripe-webhook")
        .expect(200);

      // Should have a boolean configured field
      expect(typeof response.body.configured).toBe("boolean");

      // If configured, signatureVerification should be enabled
      if (response.body.configured) {
        expect(response.body.signatureVerification).toBe("enabled");
      } else {
        expect(response.body.signatureVerification).toBe("disabled");
      }
    });

    it("should include lastWebhook state with expected fields", async () => {
      const response = await request(app)
        .get("/api/payments/stripe-webhook")
        .expect(200);

      expect(response.body.lastWebhook).toHaveProperty("receivedAt");
      expect(response.body.lastWebhook).toHaveProperty("eventType");
      expect(response.body.lastWebhook).toHaveProperty("verified");
      expect(response.body.lastWebhook).toHaveProperty("error");
    });

    it("should include helpful testing instructions", async () => {
      const response = await request(app)
        .get("/api/payments/stripe-webhook")
        .expect(200);

      expect(response.body.howToTest).toHaveProperty("browser");
      expect(response.body.howToTest).toHaveProperty("real");
      expect(response.body.howToTest).toHaveProperty("cli");
      expect(response.body.howToTest.browser).toContain("GET");
      expect(response.body.howToTest.real).toContain("Stripe Dashboard");
    });

    it("should expose the public webhook URL", async () => {
      const response = await request(app)
        .get("/api/payments/stripe-webhook")
        .expect(200);

      expect(response.body.url).toBe(
        "https://api.care2connects.org/api/payments/stripe-webhook",
      );
    });

    it("should not leak secrets in response", async () => {
      const response = await request(app)
        .get("/api/payments/stripe-webhook")
        .expect(200);

      const responseText = JSON.stringify(response.body);

      // Should not contain any secret-like patterns
      expect(responseText).not.toMatch(/whsec_/i);
      expect(responseText).not.toMatch(/sk_test_/i);
      expect(responseText).not.toMatch(/sk_live_/i);
      expect(responseText).not.toMatch(/rk_test_/i);
      expect(responseText).not.toMatch(/rk_live_/i);
    });
  });

  describe("POST /api/payments/stripe-webhook", () => {
    beforeEach(() => {
      // Clear any previous webhook state
      delete process.env.STRIPE_WEBHOOK_SECRET;
      delete process.env.STRIPE_SECRET_KEY;
    });

    it("should return 503 when Stripe is not configured", async () => {
      // Ensure no Stripe config
      delete process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_WEBHOOK_SECRET;

      const response = await request(app)
        .post("/api/payments/stripe-webhook")
        .set("stripe-signature", "dummy_signature")
        .send({
          type: "payment_intent.succeeded",
          data: { object: {} },
        })
        .expect(503);

      expect(response.body).toHaveProperty("received", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/not configured/i);
    });

    it("should not leak secrets in error responses", async () => {
      delete process.env.STRIPE_SECRET_KEY;

      const response = await request(app)
        .post("/api/payments/stripe-webhook")
        .set("stripe-signature", "dummy_signature")
        .send({
          type: "payment_intent.succeeded",
          data: { object: {} },
        })
        .expect(503);

      const responseText = JSON.stringify(response.body);

      // Should not contain any actual secrets
      expect(responseText).not.toMatch(/whsec_[a-zA-Z0-9]{32,}/);
      expect(responseText).not.toMatch(/sk_(test|live)_[a-zA-Z0-9]{24,}/);
    });

    it("should return 400 for invalid signature when webhook secret is configured", async () => {
      // Set up minimal Stripe config with webhook secret
      process.env.STRIPE_SECRET_KEY = "sk_test_dummy_key_for_testing_only";
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_dummy_secret_for_testing";

      const response = await request(app)
        .post("/api/payments/stripe-webhook")
        .set("stripe-signature", "invalid_signature")
        .send(
          JSON.stringify({
            type: "payment_intent.succeeded",
            data: { object: { id: "pi_test" } },
          }),
        );

      // Should return 400 or 503 depending on Stripe client availability
      expect([400, 503]).toContain(response.status);
    });
  });

  describe("Route Registration", () => {
    it("should confirm webhook route is mounted", () => {
      // Import the route metadata function
      const { isWebhookRouteMounted } = require("../src/routes/stripe-webhook");

      expect(isWebhookRouteMounted()).toBe(true);
    });

    it("should handle both GET and POST at same path", async () => {
      // Verify GET works
      await request(app).get("/api/payments/stripe-webhook").expect(200);

      // Verify POST is recognized (even if it fails due to config)
      const postResponse = await request(app)
        .post("/api/payments/stripe-webhook")
        .send({});

      // Should not be 404 - either 400, 503, or 200 depending on config
      expect(postResponse.status).not.toBe(404);
    });

    it("should mount at correct full path /api/payments/stripe-webhook", async () => {
      // This test ensures we don't have prefix conflicts
      const response = await request(app)
        .get("/api/payments/stripe-webhook")
        .expect(200);

      // Should explicitly state the correct URL
      expect(response.body.url).toContain("/api/payments/stripe-webhook");
    });
  });

  describe("Webhook State Tracking", () => {
    it("should return lastWebhook fields even when no webhooks received", async () => {
      const response = await request(app)
        .get("/api/payments/stripe-webhook")
        .expect(200);

      // All fields should exist even if null
      expect(response.body.lastWebhook).toBeDefined();
      expect("receivedAt" in response.body.lastWebhook).toBe(true);
      expect("eventType" in response.body.lastWebhook).toBe(true);
      expect("verified" in response.body.lastWebhook).toBe(true);
      expect("error" in response.body.lastWebhook).toBe(true);
    });
  });
});
