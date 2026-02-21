# Stripe Webhook & Cloudflare Tunnel Guide

This document explains how to provide a public HTTPS URL for Stripe webhooks using Cloudflare Tunnel.

- Stripe rejects localhost for webhook delivery; you must provide a public HTTPS endpoint.
- Option 1: Provide a production `PUBLIC_URL` environment variable pointing to your domain.
- Option 2: Use `cloudflared` to create a temporary public URL that forwards to your local backend.

When using Cloudflare Tunnel, point Stripe's webhook endpoint to: `<PUBLIC_URL>/api/payments/stripe-webhook`.

Security notes:
- Do not paste secret keys into public channels. Store Stripe keys in your local `.env` only.
- If you enable webhook signing (`STRIPE_WEBHOOK_SECRET`), incoming webhooks will be verified.
