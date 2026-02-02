# Local Stripe Webhooks (No Secrets Stored)

Why local webhook testing needs Stripe CLI
----------------------------------------
Stripe Dashboard requires publicly reachable endpoints for webhooks. For local development you must forward webhooks to your machine using the Stripe CLI (`stripe listen --forward-to`).

Quick steps
-----------
1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login once:

   ```bash
   stripe login
   ```

3. Start forwarding to your local webhook endpoint (example):

   ```bash
   stripe listen --forward-to http://localhost:3001/api/payments/stripe-webhook
   ```

4. The CLI will print a `whsec_...` signing secret. Copy it and paste into your platform environment variable `STRIPE_WEBHOOK_SECRET` (do NOT commit to git).

Where to paste the secret
-------------------------
- Locally: place `STRIPE_WEBHOOK_SECRET=whsec_...` into `backend/.env` (or your secrets manager) and restart the backend.
- Never commit secrets or paste into public chat.

Verifying webhook receipt
-------------------------
1. After restarting the backend with `STRIPE_WEBHOOK_SECRET` set, perform a test action that generates a webhook (e.g., complete a checkout or use the Stripe CLI trigger):

   ```bash
   stripe trigger checkout.session.completed
   ```

2. Check the system admin page at `/system` (Stripe Webhook Setup) or the health API:

   ```bash
   curl http://localhost:3002/health/status | jq '.webhook'
   ```

You should see `lastWebhookReceivedAt`, `lastWebhookEventType`, and `lastWebhookVerified` updated.

Security note
-------------
This repo never logs or returns secret values from environment variables. The admin endpoints return only presence flags (true/false) and copyable commands. The webhook tracker stores only minimal metadata (timestamps, event type, verified boolean) in memory — no webhook payloads or secrets are persisted.

More: https://docs.stripe.com/webhooks/quickstart
