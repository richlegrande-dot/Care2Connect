# 🎯 Stripe Webhook Testing Guide

## Why Browser Shows "Cannot GET"

When you visit https://api.care2connects.org/api/payments/stripe-webhook in your browser, you were seeing:

```json
{
  "error": "Route not found",
  "message": "Cannot GET /api/payments/stripe-webhook"
}
```

**This is expected behavior** because:
- Stripe webhooks are **POST requests**
- Browsers make **GET requests**
- The original implementation only handled POST

---

## ✅ What's Fixed

Now visiting the webhook URL in your browser returns helpful diagnostics:

```json
{
  "ok": true,
  "endpoint": "stripe-webhook",
  "method": "POST",
  "description": "This endpoint accepts Stripe webhook POST requests",
  "signatureVerification": "enabled",
  "configured": true,
  "lastWebhook": {
    "receivedAt": "2025-12-14T...",
    "eventType": "checkout.session.completed",
    "verified": true,
    "error": null
  },
  "howToTest": {
    "browser": "This GET request - confirms endpoint is reachable",
    "real": "Send POST from Stripe Dashboard > Webhooks > Send test event",
    "cli": "stripe trigger payment_intent.succeeded --api-key=YOUR_SECRET_KEY"
  },
  "url": "https://api.care2connects.org/api/payments/stripe-webhook"
}
```

---

## 🧪 How to Test the Webhook (Properly)

### Method 1: Browser GET (Quick Check)

✅ **Visit:** https://api.care2connects.org/api/payments/stripe-webhook

**What this confirms:**
- Route is registered and mounted correctly
- Cloudflare tunnel is routing to backend
- Backend server is running
- Last webhook received (if any)

**What this does NOT test:**
- Actual webhook processing
- Signature verification
- Event handling logic

---

### Method 2: Stripe Dashboard (Real Test) ⭐ RECOMMENDED

1. **Go to Stripe Dashboard:**
   - Login to https://dashboard.stripe.com
   - Navigate to **Developers** → **Webhooks**

2. **Add Endpoint:**
   - Click **Add endpoint**
   - **Endpoint URL:** `https://api.care2connects.org/api/payments/stripe-webhook`
   - **Description:** Care2Connects Production Webhook

3. **Select Events:**
   Select these events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`

4. **Get Signing Secret:**
   - After creating, click **Reveal** next to "Signing secret"
   - Copy the secret (starts with `whsec_`)
   - **DO NOT commit this to git**

5. **Update Backend .env:**
   ```bash
   # In backend/.env
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
   ```

6. **Restart Backend:**
   ```powershell
   # Stop backend (Ctrl+C in backend terminal)
   # Restart
   cd C:\Users\richl\Care2system\backend
   npm run dev
   ```

7. **Send Test Event:**
   - In Stripe Dashboard → Webhooks → Your endpoint
   - Click **Send test webhook**
   - Select **checkout.session.completed**
   - Click **Send test webhook**

8. **Verify Receipt:**
   - Check response in Stripe Dashboard (should be 200 OK)
   - Visit: https://api.care2connects.org/health/status
   - Look for `webhook` section:
     ```json
     "webhook": {
       "lastWebhookReceivedAt": "2025-12-14T...",
       "lastWebhookEventType": "checkout.session.completed",
       "lastWebhookVerified": true,
       "lastWebhookError": null
     }
     ```

---

### Method 3: Stripe CLI (Developer Test)

1. **Install Stripe CLI:**
   ```powershell
   # Windows (using Scoop)
   scoop install stripe
   
   # Or download from https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe:**
   ```powershell
   stripe login
   ```

3. **Forward Webhooks to Local:**
   ```powershell
   stripe listen --forward-to http://localhost:3001/api/payments/stripe-webhook
   ```
   
   This will:
   - Show your webhook signing secret (copy to .env)
   - Forward live Stripe events to your local server

4. **Trigger Test Events:**
   ```powershell
   # In another terminal
   stripe trigger payment_intent.succeeded
   stripe trigger checkout.session.completed
   ```

---

### Method 4: cURL (Manual POST)

⚠️ **Note:** This will fail signature verification unless you construct a valid Stripe signature.

```powershell
# This will return 400 "Invalid signature" - which proves POST is working
Invoke-WebRequest -Uri "https://api.care2connects.org/api/payments/stripe-webhook" `
  -Method POST `
  -Headers @{"stripe-signature"="test_sig"} `
  -Body '{"type":"payment_intent.succeeded","data":{"object":{"id":"pi_test"}}}' `
  -ContentType "application/json"
```

Expected response: 400 with `{"error":"Invalid signature"}` (this is correct behavior)

---

## 🔍 Verification Checklist

After setup, verify everything is working:

### 1. Route is Reachable (GET)
```powershell
Invoke-RestMethod "https://api.care2connects.org/api/payments/stripe-webhook"
```
✅ Should return JSON with `"ok": true`

### 2. Health Endpoint Shows Webhook Config
```powershell
$health = Invoke-RestMethod "https://api.care2connects.org/health/status"
$health.services.stripe
$health.webhook
```
✅ `stripe.webhookEndpointMounted` should be `true`  
✅ `stripe.webhookSecretConfigured` should be `true` (if secret is set)

### 3. Webhook Receives Test Events
- Send test event from Stripe Dashboard
- Check `/health/status` for `lastWebhookVerified: true`
- Check Stripe Dashboard shows 200 OK response

---

## 🛡️ Security Notes

### What's Safe to Share:
- ✅ Webhook URL: `https://api.care2connects.org/api/payments/stripe-webhook`
- ✅ Publishable key (starts with `pk_`)
- ✅ Health check responses (no secrets leaked)

### What to NEVER Share:
- ❌ Webhook signing secret (`whsec_...`)
- ❌ Secret key (`sk_test_...` or `sk_live_...`)
- ❌ Restricted keys (`rk_...`)
- ❌ Backend `.env` file contents

### Signature Verification:
- ✅ **Always enabled** when `STRIPE_WEBHOOK_SECRET` is set
- ⚠️ If secret is missing: webhook accepts events but marks as unverified
- 🔒 Production: **Must have** webhook secret configured

---

## 📊 Monitoring Webhook Health

### Check Last Webhook Received:
```powershell
# Quick check
Invoke-RestMethod "https://api.care2connects.org/api/payments/stripe-webhook"

# Full health status
$health = Invoke-RestMethod "https://api.care2connects.org/health/status"
$health.webhook | ConvertTo-Json
```

### Expected Output (Healthy):
```json
{
  "lastWebhookReceivedAt": "2025-12-14T10:30:00.000Z",
  "lastWebhookEventType": "checkout.session.completed",
  "lastWebhookVerified": true,
  "lastWebhookError": null
}
```

### Troubleshooting States:

**No Webhooks Received Yet:**
```json
{
  "lastWebhookReceivedAt": null,
  "lastWebhookEventType": null,
  "lastWebhookVerified": null,
  "lastWebhookError": null
}
```
→ Send test event from Stripe Dashboard

**Signature Verification Failed:**
```json
{
  "lastWebhookVerified": false,
  "lastWebhookError": "Invalid signature"
}
```
→ Check `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard

**Webhook Not Configured:**
```json
{
  "configured": false,
  "signatureVerification": "disabled"
}
```
→ Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in backend/.env

---

## 🚀 Production Deployment

### Before Going Live:

1. **Switch to Live Keys:**
   ```bash
   # backend/.env
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...  # From production webhook endpoint
   ```

2. **Create Production Webhook in Stripe:**
   - Use live mode (toggle in top-right of Stripe Dashboard)
   - Create new webhook with same URL
   - Copy live webhook secret

3. **Test in Production:**
   - Make a real $1 test donation
   - Verify webhook received and verified
   - Check donation record created in database

4. **Monitor Continuously:**
   - Set up alerts for `lastWebhookVerified: false`
   - Monitor `/health/status` for webhook errors
   - Check Stripe Dashboard webhook delivery attempts

---

## 📝 Quick Reference

| What | URL | Expected Response |
|------|-----|-------------------|
| Browser Test | https://api.care2connects.org/api/payments/stripe-webhook | 200 OK with webhook info |
| Health Check | https://api.care2connects.org/health/status | Full system health including webhook state |
| Stripe Webhook Setup | https://dashboard.stripe.com/webhooks | Create endpoint here |
| Send Test Event | Stripe Dashboard → Webhooks → Send test | 200 OK response |

---

## 🐛 Common Issues

### Issue: GET returns 404
**Cause:** Backend not running or tunnel not routing correctly  
**Fix:** 
```powershell
# Check backend
netstat -ano | findstr ":3001"
# Check tunnel
Get-Process cloudflared
```

### Issue: POST returns 503 "not configured"
**Cause:** Missing `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET`  
**Fix:** Add keys to backend/.env and restart

### Issue: POST returns 400 "Invalid signature"
**Cause:** Webhook secret mismatch or incorrect payload format  
**Fix:** 
- Verify `STRIPE_WEBHOOK_SECRET` matches Dashboard
- Use Stripe Dashboard "Send test event" instead of manual cURL

### Issue: Webhook received but not verified
**Cause:** `STRIPE_WEBHOOK_SECRET` not set  
**Fix:** Add webhook secret to backend/.env:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

---

## ✅ Success Criteria

Your webhook is fully operational when:

- [x] GET request returns 200 OK with webhook info
- [x] `configured: true` in GET response
- [x] `signatureVerification: "enabled"` in GET response
- [x] Stripe Dashboard test event returns 200 OK
- [x] `/health/status` shows `lastWebhookVerified: true`
- [x] Test donation completes end-to-end
- [x] Donation record created in database

---

**Last Updated:** December 14, 2025  
**Status:** Production Ready ✅
