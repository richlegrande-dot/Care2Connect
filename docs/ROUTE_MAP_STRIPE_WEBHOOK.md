# 🗺️ Backend Route Map - Stripe Webhook

## Route Registration Path

```
backend/src/server.ts (Line 164)
│
├─ app.use('/api/payments', stripeWebhookRoutes)
│   │
│   └─ Mounts all routes from stripe-webhook.ts under /api/payments prefix
│
backend/src/routes/stripe-webhook.ts
│
├─ GET /stripe-webhook
│   └─ Final URL: /api/payments/stripe-webhook
│       └─ Public: https://api.care2connects.org/api/payments/stripe-webhook
│
└─ POST /stripe-webhook
    └─ Final URL: /api/payments/stripe-webhook
        └─ Public: https://api.care2connects.org/api/payments/stripe-webhook
```

---

## Route Details

### GET /api/payments/stripe-webhook

**File:** `backend/src/routes/stripe-webhook.ts` (Lines 12-41)  
**Mount:** `server.ts` Line 164 → `app.use('/api/payments', stripeWebhookRoutes)`  
**Final URL:** `/api/payments/stripe-webhook`  
**Public URL:** `https://api.care2connects.org/api/payments/stripe-webhook`

**Purpose:**
- Probe endpoint for humans and monitoring
- Confirms route is registered and reachable
- Returns webhook state and configuration

**Methods Supported:**
- ✅ GET (browser-friendly verification)

**Response:**
```json
{
  "ok": true,
  "endpoint": "stripe-webhook",
  "method": "POST",
  "description": "This endpoint accepts Stripe webhook POST requests",
  "signatureVerification": "enabled",
  "configured": true,
  "lastWebhook": {
    "receivedAt": "...",
    "eventType": "...",
    "verified": true,
    "error": null
  },
  "howToTest": {...},
  "url": "https://api.care2connects.org/api/payments/stripe-webhook"
}
```

**Security:**
- ✅ No secrets exposed
- ✅ Safe for public access
- ✅ Returns sanitized webhook state

---

### POST /api/payments/stripe-webhook

**File:** `backend/src/routes/stripe-webhook.ts` (Lines 56-118)  
**Mount:** `server.ts` Line 164 → `app.use('/api/payments', stripeWebhookRoutes)`  
**Final URL:** `/api/payments/stripe-webhook`  
**Public URL:** `https://api.care2connects.org/api/payments/stripe-webhook`

**Purpose:**
- Receives Stripe webhook events
- Verifies signature using STRIPE_WEBHOOK_SECRET
- Processes payment events
- Updates webhook tracker

**Methods Supported:**
- ✅ POST (Stripe webhook requests only)

**Middleware:**
- `rawBodyParser` - Preserves raw body for signature verification

**Response Codes:**
- `200` - Webhook received and processed successfully
- `400` - Invalid signature (when STRIPE_WEBHOOK_SECRET configured)
- `500` - Processing error
- `503` - Stripe not configured (missing STRIPE_SECRET_KEY)

**Events Handled:**
- `checkout.session.completed` - Payment checkout completed
- `payment_intent.succeeded` - Payment succeeded
- `payment_intent.payment_failed` - Payment failed
- Other events logged but not processed

**Security:**
- ✅ Signature verification required (when webhook secret configured)
- ✅ Raw body parsing for Stripe signature validation
- ✅ Safe error messages (no secret leakage)

---

## Routing Architecture

```
User Request
│
├─ Browser: https://api.care2connects.org/api/payments/stripe-webhook
│   │
│   └─ Cloudflare Tunnel
│       │
│       └─ localhost:3001 (Backend Express Server)
│           │
│           └─ app.use('/api/payments', stripeWebhookRoutes)
│               │
│               ├─ router.get('/stripe-webhook')  → 200 OK (webhook info)
│               └─ router.post('/stripe-webhook') → 200/400/503 (webhook processing)
│
└─ Stripe: POST https://api.care2connects.org/api/payments/stripe-webhook
    │
    └─ Cloudflare Tunnel
        │
        └─ localhost:3001 (Backend Express Server)
            │
            └─ app.use('/api/payments', stripeWebhookRoutes)
                │
                └─ router.post('/stripe-webhook', rawBodyParser, handler)
                    │
                    ├─ Verify signature with STRIPE_WEBHOOK_SECRET
                    ├─ Parse event
                    ├─ Update webhook tracker
                    ├─ Process event (checkout/payment)
                    └─ Return 200 OK
```

---

## Mount Point Analysis

### server.ts Configuration

**Line 164:**
```typescript
app.use('/api/payments', stripeWebhookRoutes);
```

**What this means:**
- All routes in `stripe-webhook.ts` are prefixed with `/api/payments`
- Route file defines `/stripe-webhook`
- Final URL becomes: `/api/payments` + `/stripe-webhook` = `/api/payments/stripe-webhook`

**Common Mistake to Avoid:**
❌ Don't define full path in route file:
```typescript
// WRONG - would result in /api/payments/api/payments/stripe-webhook
router.post('/api/payments/stripe-webhook', ...)
```

✅ Correct approach (current implementation):
```typescript
// Route file: stripe-webhook.ts
router.post('/stripe-webhook', ...)  // Just the endpoint name

// Server file: server.ts
app.use('/api/payments', stripeWebhookRoutes)  // Adds prefix
```

---

## Verification Commands

### 1. Confirm Route Registration

```powershell
# Check if route is mounted
node -e "const { isWebhookRouteMounted } = require('./dist/routes/stripe-webhook'); console.log('Mounted:', isWebhookRouteMounted());"
```

### 2. Test Local Endpoint

```powershell
# GET request (probe)
Invoke-RestMethod "http://localhost:3001/api/payments/stripe-webhook"

# POST request (will fail signature - proves endpoint exists)
Invoke-WebRequest -Uri "http://localhost:3001/api/payments/stripe-webhook" `
  -Method POST `
  -Headers @{"stripe-signature"="test"} `
  -Body '{}' `
  -UseBasicParsing
```

### 3. Test Public Endpoint

```powershell
# GET request (probe)
Invoke-RestMethod "https://api.care2connects.org/api/payments/stripe-webhook"

# Health check (includes webhook endpoint status)
$health = Invoke-RestMethod "https://api.care2connects.org/health/status"
$health.services.stripe.webhookEndpointMounted
```

---

## Health Monitor Integration

**File:** `backend/src/monitoring/healthMonitor.ts`

**Added Fields:**
```typescript
{
  services: {
    stripe: {
      configured: boolean,
      detail: string,
      webhookEndpointMounted: boolean,      // ← NEW
      webhookSecretConfigured: boolean      // ← NEW
    }
  },
  webhook: {
    lastWebhookReceivedAt: string | null,
    lastWebhookEventType: string | null,
    lastWebhookVerified: boolean | null,
    lastWebhookError: string | null
  }
}
```

**Verification:**
```powershell
$health = Invoke-RestMethod "http://localhost:3001/health/status"
$health.services.stripe.webhookEndpointMounted  # true = route mounted
$health.services.stripe.webhookSecretConfigured # true = secret set
```

---

## File Ownership Matrix

| File | Owns | Responsibility |
|------|------|----------------|
| `server.ts` | Route mounting | Mounts `/api/payments` prefix |
| `stripe-webhook.ts` | Route handlers | Defines GET & POST `/stripe-webhook` |
| `webhookTracker.ts` | State management | Tracks last webhook received |
| `healthMonitor.ts` | Health reporting | Reports webhook endpoint status |
| `stripe.ts` (config) | Stripe client | Initializes Stripe SDK |

---

## Troubleshooting

### Route Not Found (404)

**Symptoms:**
- GET returns 404
- POST returns 404

**Check:**
1. Is backend running? `netstat -ano | findstr ":3001"`
2. Is route mounted? Check `server.ts` Line 164
3. Is TypeScript compiled? `npm run build` or dev mode auto-compile
4. Tunnel routing correct? `Get-Content C:\Users\richl\.cloudflared\config.yml`

### GET Works, POST Fails (400/503)

**This is expected!**
- 400 = Invalid signature (Stripe signature verification working)
- 503 = Stripe not configured (need STRIPE_SECRET_KEY)

**To fix 503:**
Add to `backend/.env`:
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Production Checklist

Before going live:

- [ ] Route mounted at `/api/payments/stripe-webhook` (verify in server.ts)
- [ ] GET handler returns 200 OK with webhook info
- [ ] POST handler requires valid Stripe signature
- [ ] STRIPE_WEBHOOK_SECRET configured
- [ ] Stripe Dashboard webhook created with public URL
- [ ] Test event sent and verified
- [ ] Health monitor shows `webhookEndpointMounted: true`
- [ ] No secrets logged or exposed in responses

---

**Route Map Version:** 1.0  
**Last Updated:** December 14, 2025  
**Status:** Production Ready ✅
