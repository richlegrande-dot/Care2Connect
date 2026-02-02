# Cloudflare Tunnel — Stripe Webhooks (Quick Guide)

Why this exists
- Stripe requires a publicly-accessible HTTPS endpoint for webhooks. `http://localhost` URLs are rejected by Stripe.
- Use Cloudflare Tunnel to expose your local backend securely over HTTPS.

Quick Tunnel (fastest, no Cloudflare account)
1. Start your backend locally (note the port; default is 3001).
2. Run the quick tunnel command printed by the admin helper (example):

   cloudflared tunnel --url http://localhost:3001

3. Cloudflare will return a public URL such as `https://xxxx.trycloudflare.com`.
4. In the Stripe Dashboard → Developers → Webhooks, add: `https://xxxx.trycloudflare.com/api/payments/stripe-webhook`
5. Send a test event from Stripe to verify your `/health/status` or lastWebhookReceivedAt updates.

Named Tunnel (stable custom domain)
- For production-like stability, create a named tunnel linked to your Cloudflare account. This requires logging into Cloudflare and following the Cloudflare Tunnels docs:
  https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/tunnels/
- After creating a named tunnel you can use a stable subdomain on your domain or `trycloudflare` alternatives.

Common issues
- Backend port mismatch: ensure the tunnel target port matches the port your server is listening on (e.g., 3001 vs 3002).
- Tunnel target wrong port: if you run the tunnel against the wrong port your webhook path will return 404.
- Backend not running: start your app before starting the tunnel.
- Wrong webhook path: use `/api/payments/stripe-webhook` unless you customized it.

Troubleshooting
- If Stripe cannot reach your endpoint, verify the Cloudflare public URL in a browser.
- Use `cloudflared tunnel --url http://localhost:<PORT>` and confirm the URL returned.
- If using a named tunnel, ensure DNS and Cloudflare settings are correct.

Security notes
- Do not share Stripe secret keys or webhook secrets. The helper endpoints and docs never print or store secrets.

