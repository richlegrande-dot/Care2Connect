# Stripe Setup: No-Secrets-Stored Wizard

This document describes the demo-safe "Setup Wizard" and the backend endpoints it relies on.

Principles

- The wizard never returns secret values (API keys, webhook secrets, SMTP passwords).
- All server endpoints return only presence booleans and guidance text.
- Operators must copy/paste secrets directly into their environment or secure secret store.

Endpoints

- `GET /admin/setup/stripe` — Returns flags: `hasSecret`, `hasPublishable`, `hasWebhookSecret`, and `guidance`. Does NOT include any key material.
- `GET /admin/setup/preflight` — Performs lightweight checks (health status, DB connectivity, stripe presence, email configured) and returns booleans only.

Keys confirmation safety

- For safety, the server requires a manual confirmation step when real API keys are present. After you verify keys in `backend/.env`, set `KEYS_VALIDATED=true` in that file to allow the server to start and use those keys.
- You can disable the guard (not recommended) by setting `KEYS_MANUAL_CONFIRM=false`.

How to use

1. Open the System Admin panel and create a short-lived admin token.
2. Visit the Setup Wizard at `/system/setup-wizard`.
3. If authenticated, the page will display preflight and Stripe presence checks. If not, it will show guidance and provide a copyable `.env` template.
4. Copy the template, fill your real secrets locally, and restart the backend.

Security notes

- Never paste secrets into the UI. The wizard is intentionally read-only and will not accept secret values.
- Rotate any secrets exposed via other means immediately.
