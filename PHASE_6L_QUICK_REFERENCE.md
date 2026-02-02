# Phase 6L Quick Reference Guide

## Database Health Monitoring

### Check Database Status
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3003/health/db"

# Response when healthy:
{
  "ready": true,
  "lastPingAt": "2024-12-16T12:30:45Z",
  "lastError": null,
  "failureCount": 0,
  "message": "Database connection is healthy"
}
```

### Server Startup Logs to Watch
```
✅ DATABASE STARTUP GATE: PASSED
✅ Database watchdog started
🚀 HTTP Server successfully bound
```

## Donation Tracking

### Get Donation Ledger
```bash
GET /api/tickets/:ticketId/donations

# Response:
{
  "success": true,
  "count": 3,
  "donations": [
    {
      "amount": 50.00,
      "currency": "USD",
      "status": "PAID",
      "donor": "Smith",
      "country": "US",
      "paidAt": "2024-12-16T10:31:15Z"
    }
  ]
}
```

### Get Donation Totals
```bash
GET /api/tickets/:ticketId/donations/total

# Response:
{
  "total": 250.00,
  "breakdown": {
    "paid": 350.00,
    "refunded": 100.00,
    "net": 250.00
  },
  "counts": {
    "paid": 7,
    "refunded": 2
  }
}
```

## Webhook Events

### Stripe Events Handled
- ✅ `payment_intent.succeeded` - Payment completed (updates donor info)
- ✅ `charge.refunded` - Refund processed
- ✅ `charge.dispute.created` - Chargeback filed
- ✅ `checkout.session.expired` - Session timeout
- ✅ `checkout.session.completed` - Checkout success

### Webhook Idempotency
- Events stored in `stripe_events` table
- Duplicate events automatically skipped
- Check logs: `"Event {id} already processed, skipping"`

## Database Models

### StripeEvent (Idempotency)
```prisma
model StripeEvent {
  stripeEventId String @unique  // Prevents duplicates
  type          String
  processedAt   DateTime
}
```

### StripeAttribution (Enhanced)
```prisma
model StripeAttribution {
  paymentIntentId String? @unique
  donorLastName   String?        // Privacy: last name only
  donorCountry    String?
  donorEmailHash  String?        // SHA256 hash
  paidAt          DateTime?
  refundedAt      DateTime?
}
```

## Privacy Principles

✅ **Donor Information**
- Store last name only (never full name)
- Hash emails with SHA256
- Country-level location only
- Never log/commit donor PII

✅ **Example Processing**
- "John Smith" → Store: "Smith"
- "john@example.com" → Store: SHA256 hash
- Address: "123 Main St, New York, USA" → Store: "US"

## Troubleshooting

### Server Won't Start
Check logs for:
```
❌ DATABASE_URL validation failed
❌ Database connection failed
❌ Schema integrity check failed
```

**Solution:**
1. Verify `.env` has `DATABASE_URL`
2. Test connection: `npx prisma db pull`
3. Apply migrations: `npx prisma migrate deploy`

### Database Unavailable (Runtime)
```
[DB Watchdog] ❌ Ping failed (1/3)
[DB Watchdog] Attempting reconnect...
```

**Actions:**
- Watchdog attempts 5 reconnects (5s intervals)
- Server returns 503 to clients
- Server exits if all reconnects fail
- Supervisor should restart server

### Webhook Not Processing
Check:
1. Event already processed? (idempotency check)
2. Stripe signature valid?
3. PaymentIntent linked to attribution?

## Monitoring Commands

```powershell
# Check server health
Invoke-RestMethod "http://localhost:3003/health/live"

# Check database health
Invoke-RestMethod "http://localhost:3003/health/db"

# Watch logs (tail in PowerShell)
Get-Content backend/logs/app.log -Wait -Tail 20

# Test donation endpoint
Invoke-RestMethod "http://localhost:3003/api/tickets/YOUR_TICKET_ID/donations"
```

## Key Files

- `backend/src/utils/dbStartupGate.ts` - Startup gate + watchdog
- `backend/src/middleware/dbReadyCheck.ts` - Request-level protection
- `backend/src/routes/stripe-webhook.ts` - Enhanced webhook handler
- `backend/src/routes/tickets.ts` - Donation endpoints
- `backend/prisma/schema.prisma` - StripeEvent + StripeAttribution

## Migration

```bash
# Apply Phase 6L migration
cd backend
npx prisma migrate deploy

# Verify
npx prisma migrate status
# Should show: "Database schema is up to date!"
```

## Success Indicators

✅ Startup logs show: "DATABASE STARTUP GATE: PASSED"  
✅ Watchdog active: "Database watchdog started"  
✅ Health endpoint returns `ready: true`  
✅ Donations show donor last names  
✅ Totals include refund breakdown  
✅ Duplicate webhook events are skipped

---

**Status:** Phase 6L Complete ✅  
**Version:** 1.0  
**Last Updated:** December 16, 2024
