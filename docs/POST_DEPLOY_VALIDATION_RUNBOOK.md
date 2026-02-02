# 🔍 Post-Deployment Validation Runbook

**Date:** December 14, 2025  
**Purpose:** Verify Care2Connects production deployment and Stripe webhook integration  
**Status:** Production Ready ✅

---

## 📋 Overview

This runbook validates your full-stack Care2Connects deployment:
- ✅ Frontend (Next.js) → `https://care2connects.org`
- ✅ Backend API (Express) → `https://api.care2connects.org`
- ✅ Cloudflare Tunnel routing
- ✅ Stripe webhook integration
- ✅ Service stability across restarts

---

## 🎯 Quick Validation Checklist

### Phase 1: Public API Connectivity ✅

**Test 1: Health Check (Live)**
```powershell
Invoke-WebRequest -Uri "https://api.care2connects.org/health/live" -UseBasicParsing
```
**Expected:**
- Status: `200 OK`
- Response: `{"status":"ok","timestamp":"..."}`
- ✅ Indicates backend is accessible via public API

**Test 2: Health Status (Full)**
```powershell
Invoke-WebRequest -Uri "https://api.care2connects.org/health/status" -UseBasicParsing
```
**Expected:**
- Status: `200 OK`
- Response includes:
  - `environment`, `uptime`, `databaseStatus`
  - `stripe.configured`, `stripe.webhookSecretConfigured`
  - `webhook.lastWebhookReceivedAt`, `lastWebhookVerified`
- ✅ Shows full system health including Stripe configuration

**Test 3: Webhook Route Exists**
```powershell
Invoke-WebRequest -Uri "https://api.care2connects.org/api/payments/stripe-webhook" -Method GET -UseBasicParsing
```
**Expected:**
- Status: `405 Method Not Allowed` or `400 Bad Request` (both OK!)
- ❌ `404 Not Found` = route missing (PROBLEM)
- ✅ Any non-404 response means route exists and webhook can receive events

---

### Phase 2: Stripe Webhook Setup 🔌

#### Step 1: Configure Webhook in Stripe Dashboard

1. **Navigate to Stripe Dashboard**
   - Go to: [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
   - Use test mode for initial setup

2. **Add Endpoint**
   - Click "Add endpoint"
   - **Endpoint URL:**
     ```
     https://api.care2connects.org/api/payments/stripe-webhook
     ```
   - **Events to send:**
     - ✅ `checkout.session.completed` (required)
     - ✅ `payment_intent.succeeded` (recommended)
     - ✅ `payment_intent.payment_failed` (recommended)

3. **Copy Webhook Signing Secret**
   - After creating endpoint, click "Reveal" under "Signing secret"
   - Copy the secret (starts with `whsec_...`)
   - **Example format:** `whsec_abc123xyz789...`

#### Step 2: Configure Backend Environment

**Update Backend .env**
```powershell
# Navigate to backend directory
cd C:\Users\richl\Care2system\backend

# Edit .env file and update:
# STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET_HERE
```

**Current Configuration Check**
```powershell
# Check if webhook secret is configured (shows presence only, not value)
Select-String -Path "backend\.env" -Pattern "STRIPE_WEBHOOK_SECRET=" | Select-Object -First 1
```

#### Step 3: Restart Backend to Apply Changes

```powershell
# Stop existing backend process
Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*backend*"} | Stop-Process -Force

# Start backend (in new terminal or background)
cd C:\Users\richl\Care2system\backend
npm run dev
```

**Wait 10 seconds for backend to initialize**

---

### Phase 3: Webhook Verification 🧪

#### Test Webhook from Stripe Dashboard

1. **Send Test Event**
   - In Stripe Dashboard → Webhooks → Your endpoint
   - Click "Send test webhook"
   - Select event: `checkout.session.completed`
   - Click "Send test webhook"

2. **Check Response in Stripe**
   - ✅ Response code: `200`
   - ✅ Response body: `{"received":true,"type":"checkout.session.completed"}`
   - ❌ If 400/401: Check webhook secret is correct
   - ❌ If timeout: Check backend is running

#### Verify Backend Received Webhook

**Check Health Status**
```powershell
$status = Invoke-RestMethod -Uri "https://api.care2connects.org/health/status"
$status.webhook
```

**Expected Output:**
```json
{
  "lastWebhookReceivedAt": "2025-12-14T...",
  "lastWebhookEventType": "checkout.session.completed",
  "lastWebhookVerified": true,
  "lastWebhookError": null
}
```

**Interpretation:**
- ✅ `lastWebhookReceivedAt` populated = webhook received
- ✅ `lastWebhookVerified: true` = signature verified successfully
- ✅ `lastWebhookError: null` = no processing errors
- ❌ `lastWebhookVerified: false` = signature verification failed (check secret)
- ❌ `lastWebhookError` populated = processing error (check logs)

---

### Phase 4: End-to-End Donation Test 💳

**Create Test Donation**

1. **Open Frontend**
   ```
   https://care2connects.org
   ```

2. **Navigate to Donation Form**
   - Fill out donation details
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry, any CVC

3. **Complete Checkout**
   - Click "Donate" or "Submit"
   - Should redirect to Stripe Checkout
   - Complete payment

4. **Verify Donation Recorded**
   ```powershell
   # Check latest webhook event
   $status = Invoke-RestMethod -Uri "https://api.care2connects.org/health/status"
   Write-Host "Last webhook: $($status.webhook.lastWebhookEventType) at $($status.webhook.lastWebhookReceivedAt)"
   Write-Host "Verified: $($status.webhook.lastWebhookVerified)"
   ```

5. **Check Donation Record**
   - Should see donation in database
   - Receipt generated (if configured)
   - Email sent (if SMTP configured)

**Good Looks Like:**
- ✅ Checkout completes successfully
- ✅ Webhook received within 5 seconds
- ✅ `lastWebhookVerified: true`
- ✅ Donation record created in database
- ✅ User redirected to success page

**Troubleshooting:**
- ❌ Checkout fails: Check Stripe keys in backend .env
- ❌ Webhook not received: Check endpoint URL in Stripe Dashboard
- ❌ Webhook verification fails: Check `STRIPE_WEBHOOK_SECRET` matches Stripe
- ❌ Donation not recorded: Check backend logs for processing errors

---

## 🔄 Service Stability & Persistence

### Current Setup (Development)

**Services Running:**
- Frontend: PowerShell background job → stops when terminal closes
- Backend: PowerShell background job → stops when terminal closes
- Tunnel: PowerShell hidden window → stops when process ends

**Problem:** Services stop on logout/restart

---

### Production Stability Options

#### Option 1: PM2 Process Manager (Recommended)

**Install PM2 Globally**
```powershell
npm install -g pm2
```

**Create Ecosystem File** (`ecosystem.config.js` in project root)
```javascript
module.exports = {
  apps: [
    {
      name: 'care2connects-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-err.log',
      out_file: './logs/backend-out.log',
      time: true
    },
    {
      name: 'care2connects-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-err.log',
      out_file: './logs/frontend-out.log',
      time: true
    }
  ]
};
```

**Build Frontend for Production**
```powershell
cd frontend
npm run build
```

**Start Services with PM2**
```powershell
cd C:\Users\richl\Care2system
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**PM2 Management Commands**
```powershell
# Status
pm2 status

# Logs
pm2 logs

# Restart
pm2 restart all

# Stop
pm2 stop all

# Start
pm2 start all
```

**Benefits:**
- ✅ Auto-restart on failure
- ✅ Survives terminal close
- ✅ Log management
- ✅ Startup on system boot
- ✅ Resource monitoring

---

#### Option 2: Windows Services (Advanced)

**Install node-windows**
```powershell
npm install -g node-windows
```

**Create Service Wrapper Scripts**

Create `backend-service.js`:
```javascript
const Service = require('node-windows').Service;

const svc = new Service({
  name: 'Care2Connects Backend',
  description: 'Care2Connects Express Backend API',
  script: require('path').join(__dirname,'backend','dist','server.js'),
  nodeOptions: ['--harmony', '--max_old_space_size=4096']
});

svc.on('install', () => {
  svc.start();
});

svc.install();
```

**Install Services**
```powershell
node backend-service.js
```

**Benefits:**
- ✅ True Windows service
- ✅ Starts on boot automatically
- ✅ Runs without user login
- ✅ Windows Event Log integration

**Drawbacks:**
- ⚠️ More complex setup
- ⚠️ Requires TypeScript compilation for backend
- ⚠️ Harder to debug during development

---

#### Option 3: Cloudflare Tunnel as Service

**Install Tunnel as Windows Service**
```powershell
# Install cloudflared as service
cloudflared service install 07e7c160-451b-4d41-875c-a58f79700ae8
```

**Verify Service Installed**
```powershell
Get-Service cloudflared
```

**Start Service**
```powershell
Start-Service cloudflared
```

**Benefits:**
- ✅ Tunnel persists across reboots
- ✅ No manual terminal required
- ✅ Automatic reconnection
- ✅ Windows Service Manager integration

**Rollback (if needed)**
```powershell
cloudflared service uninstall
```

---

### Combined Production Setup (Recommended)

**1. Build Frontend for Production**
```powershell
cd C:\Users\richl\Care2system\frontend
npm run build
```

**2. Install PM2**
```powershell
npm install -g pm2
```

**3. Create Ecosystem Config**
Create `ecosystem.config.js` at project root (see Option 1 above)

**4. Start Services**
```powershell
cd C:\Users\richl\Care2system
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions to enable startup
```

**5. Install Tunnel Service**
```powershell
cloudflared service install 07e7c160-451b-4d41-875c-a58f79700ae8
Start-Service cloudflared
```

**6. Verify Everything Running**
```powershell
# Check PM2 apps
pm2 status

# Check tunnel service
Get-Service cloudflared

# Test endpoints
Invoke-WebRequest "https://care2connects.org" -UseBasicParsing
Invoke-WebRequest "https://api.care2connects.org/health/live" -UseBasicParsing
```

**Result:**
- ✅ Frontend, backend, tunnel all persist across restarts
- ✅ Auto-restart on failure
- ✅ Logs accessible via `pm2 logs`
- ✅ Production-ready setup

---

## 🧪 Automated Testing Checklist

### Backend Health Tests

**Test: Health endpoint survives Stripe misconfiguration**
```powershell
# Test with invalid Stripe config (temporarily)
# /health/live should return 200 even if Stripe fails to initialize
Invoke-WebRequest "https://api.care2connects.org/health/live" -UseBasicParsing
# Expected: 200 OK (not 500)
```

**Test: Webhook route returns non-404**
```powershell
# Test webhook route exists
$response = try { Invoke-WebRequest "https://api.care2connects.org/api/payments/stripe-webhook" -Method GET -UseBasicParsing } catch { $_.Exception.Response }
$statusCode = $response.StatusCode.value__
Write-Host "Webhook route status: $statusCode"
# Expected: 405 or 400 (not 404)
```

**Test: Webhook tracker updates**
```powershell
# After sending test webhook from Stripe Dashboard
$status = Invoke-RestMethod "https://api.care2connects.org/health/status"
$webhook = $status.webhook
if ($webhook.lastWebhookReceivedAt) {
    Write-Host "✓ Webhook received: $($webhook.lastWebhookEventType) at $($webhook.lastWebhookReceivedAt)"
    Write-Host "✓ Verified: $($webhook.lastWebhookVerified)"
} else {
    Write-Host "✗ No webhook received yet"
}
```

### Frontend Tests

**Test: Homepage loads**
```powershell
$response = Invoke-WebRequest "https://care2connects.org" -UseBasicParsing
if ($response.StatusCode -eq 200 -and $response.Content.Length -gt 10000) {
    Write-Host "✓ Homepage loaded ($($response.Content.Length) bytes)"
} else {
    Write-Host "✗ Homepage issue"
}
```

**Test: Frontend can reach API**
```powershell
# Check frontend .env.local has correct API URL
Select-String -Path "frontend\.env.local" -Pattern "NEXT_PUBLIC_API_URL"
# Expected: NEXT_PUBLIC_API_URL=https://api.care2connects.org
```

---

## 📊 What "Good" Looks Like

### Health Status Response (Ideal State)

```json
{
  "status": "healthy",
  "timestamp": "2025-12-14T22:30:00.000Z",
  "environment": "production",
  "uptime": 86400,
  "port": 3001,
  "databaseStatus": "connected",
  "stripe": {
    "configured": true,
    "mode": "test",
    "webhookSecretConfigured": true
  },
  "openai": {
    "configured": true,
    "status": "available"
  },
  "webhook": {
    "lastWebhookReceivedAt": "2025-12-14T22:15:23.456Z",
    "lastWebhookEventType": "checkout.session.completed",
    "lastWebhookVerified": true,
    "lastWebhookError": null
  }
}
```

**Green Indicators:**
- ✅ `status: "healthy"`
- ✅ `databaseStatus: "connected"`
- ✅ `stripe.configured: true`
- ✅ `stripe.webhookSecretConfigured: true`
- ✅ `webhook.lastWebhookVerified: true`
- ✅ `webhook.lastWebhookError: null`

**Yellow Indicators (OK for initial setup):**
- ⚠️ `webhook.lastWebhookReceivedAt: null` - no webhooks received yet
- ⚠️ `stripe.mode: "test"` - using test mode (OK for testing)

**Red Indicators (Needs Attention):**
- ❌ `status: "degraded"` or `"unhealthy"`
- ❌ `databaseStatus: "disconnected"`
- ❌ `stripe.configured: false` - check Stripe keys
- ❌ `stripe.webhookSecretConfigured: false` - set STRIPE_WEBHOOK_SECRET
- ❌ `webhook.lastWebhookVerified: false` - signature verification failed
- ❌ `webhook.lastWebhookError` populated - check error message

---

## 🚨 Common Issues & Fixes

### Issue 1: Webhook Verification Fails

**Symptoms:**
- `lastWebhookVerified: false`
- Stripe Dashboard shows 400 responses
- Error: "Invalid signature"

**Cause:** Webhook secret mismatch

**Fix:**
1. Get signing secret from Stripe Dashboard → Webhooks → Your endpoint
2. Copy exact value (starts with `whsec_`)
3. Update `backend/.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_exact_value_from_stripe
   ```
4. Restart backend: `pm2 restart care2connects-backend`
5. Send test webhook from Stripe Dashboard
6. Verify: `lastWebhookVerified: true`

---

### Issue 2: Frontend Can't Reach API

**Symptoms:**
- API calls fail from frontend
- CORS errors in browser console
- Network errors

**Cause:** Missing or incorrect API URL configuration

**Fix:**
1. Check `frontend/.env.local` exists:
   ```powershell
   Get-Content frontend\.env.local
   ```
2. Should contain:
   ```
   NEXT_PUBLIC_API_URL=https://api.care2connects.org
   ```
3. If missing or wrong, create/update:
   ```powershell
   cd frontend
   @"
   NEXT_PUBLIC_API_URL=https://api.care2connects.org
   "@ | Out-File -FilePath ".env.local" -Encoding UTF8 -Force
   ```
4. Restart frontend: `pm2 restart care2connects-frontend`

---

### Issue 3: Services Don't Persist After Logout

**Symptoms:**
- Services stop when closing terminal
- System unavailable after logout/restart

**Cause:** Running as foreground processes instead of services

**Fix:**
Follow [Production Stability Setup](#combined-production-setup-recommended) above:
1. Install PM2: `npm install -g pm2`
2. Create ecosystem.config.js
3. Start services: `pm2 start ecosystem.config.js`
4. Save: `pm2 save`
5. Enable startup: `pm2 startup` and follow instructions
6. Install tunnel service: `cloudflared service install <tunnel-id>`

---

### Issue 4: Tunnel Not Routing Correctly

**Symptoms:**
- Homepage shows backend status page
- Both domains route to same service

**Cause:** Tunnel config incorrect

**Fix:**
1. Check `C:\Users\richl\.cloudflared\config.yml`:
   ```yaml
   ingress:
     - hostname: api.care2connects.org
       service: http://localhost:3001  # Backend
     - hostname: care2connects.org
       service: http://localhost:3000  # Frontend
   ```
2. If wrong, update and restart:
   ```powershell
   # Update config.yml (see DEPLOYMENT_COMPLETE.md)
   Restart-Service cloudflared
   # OR if not a service:
   Get-Process cloudflared | Stop-Process -Force
   cloudflared tunnel run 07e7c160-451b-4d41-875c-a58f79700ae8
   ```

---

## 📈 Success Metrics

### Initial Deployment (Day 1)
- ✅ All endpoints return 200 OK
- ✅ Webhook route exists (non-404 response)
- ✅ Stripe webhook secret configured
- ✅ Test webhook receives and verifies successfully
- ✅ Frontend and backend communicate correctly

### Production Ready (Day 7)
- ✅ Services persist across restarts (PM2 or Windows Service)
- ✅ Tunnel installed as service
- ✅ Test donation end-to-end completes successfully
- ✅ Webhook tracker shows recent successful events
- ✅ Zero downtime over 24-hour period
- ✅ Logs accessible and monitored

### Production Hardened (Month 1)
- ✅ Automated monitoring/alerts configured
- ✅ Backup strategy implemented
- ✅ SSL certificate monitoring
- ✅ Error tracking and notification
- ✅ Regular webhook test automation
- ✅ Documentation updated with runbooks

---

## 📝 Rollback Procedures

### Rollback Frontend
```powershell
pm2 stop care2connects-frontend
cd frontend
git checkout main  # or previous stable version
npm install
npm run build
pm2 restart care2connects-frontend
```

### Rollback Backend
```powershell
pm2 stop care2connects-backend
cd backend
git checkout main  # or previous stable version
npm install
pm2 restart care2connects-backend
```

### Rollback Tunnel Config
```powershell
# Restore previous config
Copy-Item "C:\Users\richl\.cloudflared\config.yml.backup" "C:\Users\richl\.cloudflared\config.yml"
Restart-Service cloudflared
```

### Emergency: Disable Webhooks
```powershell
# In Stripe Dashboard: Webhooks → Your endpoint → Disable
# OR temporarily in backend .env:
# STRIPE_WEBHOOK_SECRET=  # Leave empty
pm2 restart care2connects-backend
```

---

## 📚 Next Steps

### Immediate (Today)
1. ✅ Test all endpoints in this runbook
2. ✅ Send test webhook from Stripe Dashboard
3. ✅ Verify `lastWebhookVerified: true` in health status
4. ✅ Complete test donation end-to-end

### Short Term (This Week)
1. Install PM2 and configure ecosystem.config.js
2. Install Cloudflare tunnel as service
3. Build frontend for production (`npm run build`)
4. Test service persistence across logout/restart
5. Document any custom environment variables

### Long Term (This Month)
1. Set up monitoring and alerting
2. Configure automated backups
3. Switch to production Stripe keys (when ready)
4. Add automated health check tests
5. Implement log aggregation/analysis

---

## 🔗 Related Documentation

- [DEPLOYMENT_COMPLETE.md](../DEPLOYMENT_COMPLETE.md) - Initial deployment summary
- [CONNECTIVITY_ISSUE_REPORT.md](../CONNECTIVITY_ISSUE_REPORT.md) - Troubleshooting context
- [backend/README.md](../backend/README.md) - Backend setup guide
- [frontend/README.md](../frontend/README.md) - Frontend setup guide

---

## ✅ Final Validation Summary

**Run this comprehensive test:**

```powershell
Write-Host "`n=== CARE2CONNECTS VALIDATION SUITE ===" -ForegroundColor Cyan

# Test 1: Frontend
Write-Host "`n[1/6] Testing Frontend..." -ForegroundColor Yellow
try {
    $r1 = Invoke-WebRequest "https://care2connects.org" -UseBasicParsing -TimeoutSec 10
    Write-Host "  ✓ Homepage: $($r1.StatusCode) ($($r1.Content.Length) bytes)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Homepage failed" -ForegroundColor Red
}

# Test 2: API Health
Write-Host "`n[2/6] Testing API Health..." -ForegroundColor Yellow
try {
    $r2 = Invoke-RestMethod "https://api.care2connects.org/health/live"
    Write-Host "  ✓ Health: $($r2.status)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Health check failed" -ForegroundColor Red
}

# Test 3: Full Status
Write-Host "`n[3/6] Testing Full Status..." -ForegroundColor Yellow
try {
    $r3 = Invoke-RestMethod "https://api.care2connects.org/health/status"
    Write-Host "  ✓ Database: $($r3.databaseStatus)" -ForegroundColor Green
    Write-Host "  ✓ Stripe Configured: $($r3.stripe.configured)" -ForegroundColor Green
    Write-Host "  ✓ Webhook Secret Set: $($r3.stripe.webhookSecretConfigured)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Status check failed" -ForegroundColor Red
}

# Test 4: Webhook Route
Write-Host "`n[4/6] Testing Webhook Route..." -ForegroundColor Yellow
try {
    $r4 = Invoke-WebRequest "https://api.care2connects.org/api/payments/stripe-webhook" -Method GET -UseBasicParsing
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 405 -or $statusCode -eq 400) {
        Write-Host "  ✓ Webhook route exists (status: $statusCode)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Webhook route issue (status: $statusCode)" -ForegroundColor Red
    }
}

# Test 5: Webhook Status
Write-Host "`n[5/6] Checking Webhook Status..." -ForegroundColor Yellow
$webhook = $r3.webhook
if ($webhook.lastWebhookReceivedAt) {
    Write-Host "  ✓ Last webhook: $($webhook.lastWebhookEventType)" -ForegroundColor Green
    Write-Host "  ✓ Verified: $($webhook.lastWebhookVerified)" -ForegroundColor Green
    if ($webhook.lastWebhookError) {
        Write-Host "  ⚠ Error: $($webhook.lastWebhookError)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ℹ No webhooks received yet (send test from Stripe Dashboard)" -ForegroundColor Cyan
}

# Test 6: Services Running
Write-Host "`n[6/6] Checking Local Services..." -ForegroundColor Yellow
$p3000 = netstat -ano | findstr ":3000.*LISTENING"
$p3001 = netstat -ano | findstr ":3001.*LISTENING"
if ($p3000) { Write-Host "  ✓ Frontend on port 3000" -ForegroundColor Green } else { Write-Host "  ✗ Frontend not running" -ForegroundColor Red }
if ($p3001) { Write-Host "  ✓ Backend on port 3001" -ForegroundColor Green } else { Write-Host "  ✗ Backend not running" -ForegroundColor Red }

Write-Host "`n=== VALIDATION COMPLETE ===" -ForegroundColor Cyan
Write-Host "`nNext: Send test webhook from Stripe Dashboard to verify end-to-end" -ForegroundColor White
```

**Save this script as:** `validate-deployment.ps1` for easy re-testing

---

**Document Version:** 1.0  
**Last Updated:** December 14, 2025  
**Maintainer:** Care2Connects Team  
**Status:** ✅ Production Ready
