# Care2System Backend Runbook

## Quick Reference

**Health Status:** `GET /health/status`  
**Admin Diagnostics:** `GET /admin/diagnostics?token=<ADMIN_DIAGNOSTICS_TOKEN>`  
**Demo Status:** `GET /demo/status`  
**Metrics:** `GET /metrics?token=<METRICS_TOKEN>`  

---

## Recovery Playbooks

### Demo Day Quick Recovery

**Symptom:** Port 3001 already in use, server won't start before demo

**Quick Fix (< 30 seconds):**
```bash
# Enable demo safe mode for auto port selection
set DEMO_SAFE_MODE=true
npm start
# Server will find available port (3002, 3003, etc.) automatically
```

**Alternative (kill existing process):**
```bash
# Find process using port 3001
netstat -ano | findstr :3001
# Kill process (replace <PID> with actual PID)
taskkill /PID <PID> /F
npm start
```

**Prevention:** Always enable `DEMO_SAFE_MODE=true` for demos/pilots

---

### Port Conflicts

**Symptom:** `EADDRINUSE: address already in use`

**Diagnosis:**
```bash
# Windows
netstat -ano | findstr :<PORT>
tasklist /FI "PID eq <PID>"

# Linux/Mac
lsof -i :<PORT>
kill -9 <PID>
```

**Solution Options:**
1. **Auto Port Selection:** Set `DEMO_SAFE_MODE=true` and restart
2. **Kill Conflicting Process:** `taskkill /PID <PID> /F` (Windows)
3. **Change Port:** Set `PORT=3002` in .env

---

### Database Connection Failed

**Symptom:** Health status shows `db: { ok: false }` or 503 on all endpoints

**Diagnosis:**
```bash
# Check diagnostics
curl http://localhost:3001/admin/diagnostics?token=<TOKEN>
# Look for: health.services.db.ok = false
```

**Most Likely Causes:**
1. **Invalid credentials:** Verify `DATABASE_URL` in .env
2. **Network issue:** Test connectivity to Supabase
3. **Supabase service down:** Check Supabase dashboard

**Recovery Steps:**
```bash
# 1. Verify DATABASE_URL format
# postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?schema=public

# 2. Test connection manually
curl -X GET https://<supabase-project>.supabase.co/rest/v1/

# 3. Check self-healing logs
tail -f data/health/health-history.jsonl | grep "reconnect"

# 4. Restart server (self-healing will retry automatically)
npm start
```

**Auto-Recovery:** Self-healing attempts 5 reconnects with exponential backoff. If max attempts exceeded, alert is sent (if `ALERT_MODE` configured).

---

### TypeScript Compilation Errors in Production

**Symptom:** Server refuses to start with message about `--transpile-only` or missing `dist/` directory

**Cause:** Production policy enforces type safety. Running with `--transpile-only` masks type errors.

**Solution:**
```bash
# 1. Fix all TypeScript errors
npm run typecheck
# Review and fix all TS errors

# 2. Build compiled version
npm run build

# 3. Start production server (runs from dist/)
npm run start:prod
```

**Prevention:** Never use `ts-node --transpile-only` in production. Always run `npm run build` before deployment.

---

### Storage Connection Failed

**Symptom:** Health status shows `storage: { ok: false }` or file uploads fail

**Diagnosis:**
```bash
# Check diagnostics
curl http://localhost:3001/admin/diagnostics?token=<TOKEN>
# Look for: health.services.storage.ok = false
```

**Recovery Steps:**
```bash
# 1. Verify storage credentials
# SUPABASE_URL=https://<project>.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# 2. Check storage bucket exists
# Login to Supabase dashboard → Storage → Verify "donations" bucket

# 3. Verify bucket policy (public read)
# See: backend/supabase-storage-setup.sql

# 4. Test storage manually
curl -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  https://<project>.supabase.co/storage/v1/bucket/donations
```

---

### Missing Resources (models/, uploads/, etc.)

**Symptom:** Diagnostics shows `missingResources: ["models", "uploads"]`

**Cause:** File permissions issue or incomplete deployment

**Recovery:**
```bash
# 1. Create missing directories
mkdir -p backend/models/vosk-model
mkdir -p backend/models/whisper
mkdir -p backend/data/health
mkdir -p backend/receipts
mkdir -p backend/uploads

# 2. Fix permissions
chmod 755 backend/models backend/uploads backend/receipts

# 3. Verify
curl http://localhost:3001/admin/diagnostics?token=<TOKEN>
# Check: missingResources should be []
```

---

### Health Degraded State

**Symptom:** Health status is `degraded` with warnings

**Diagnosis:**
```bash
# Check health details
curl http://localhost:3001/health/status
# Look at: degradedReasons array
```

**Common Degraded Reasons:**

1. **Stripe not configured:** Expected in demo mode. Set `STRIPE_SECRET_KEY` for production.
2. **SMTP not configured:** Email receipts disabled. Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` to enable.
3. **EVTS not configured:** Event webhooks disabled. Set `EVTS_WEBHOOK_URL` to enable.
4. **Missing models:** Speech-to-text disabled. Download Vosk/Whisper models.

**Decision:** Degraded is OK for demos (NO_KEYS_MODE). For production, resolve all warnings.

---

### Verify Donation Flow (No-Keys Mode)

**Goal:** Test complete donation flow without Stripe/SMTP in demo mode

**Steps:**
```bash
# 1. Ensure NO_KEYS_MODE enabled
set NO_KEYS_MODE=true
npm start

# 2. Check health (should be "ready" or "degraded")
curl http://localhost:3001/health/status

# 3. Create mock donation
curl -X POST http://localhost:3001/api/qr \
  -H "Content-Type: application/json" \
  -d '{"amount": 25, "purpose": "Test Donation"}'
# Response: { qrUrl: "...", donationId: "..." }

# 4. Retrieve donation
curl http://localhost:3001/api/donations/<donationId>

# 5. Check receipts directory
ls backend/receipts/
# Should see receipt-<donationId>.pdf
```

**Expected:** All steps succeed. Donation created, receipt generated (but not emailed).

---

### Verify Word Export Quickly

**Goal:** Test Word document generation without full funding wizard

**Steps:**
```bash
# 1. Prepare test data
curl -X POST http://localhost:3001/api/analysis \
  -H "Content-Type: application/json" \
  -d '{
    "callType": "Donor Call",
    "recordingName": "Test Recording",
    "transcriptText": "Test transcript",
    "sentiment": "positive",
    "keyPoints": ["Point 1", "Point 2"],
    "actionItems": ["Action 1"]
  }'
# Response: { id: "analysis-123" }

# 2. Generate Word document
curl -X POST http://localhost:3001/api/export \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "analysis-123",
    "format": "word"
  }'
# Response: { url: "https://...storage.../report.docx" }

# 3. Download and verify
# Open URL in browser, verify Word document opens correctly
```

---

### How to Use Admin Diagnostics

**Purpose:** Comprehensive troubleshooting bundle with health history, error logs, and suggested fixes

**Usage:**
```bash
# Get diagnostics JSON (for automation)
curl http://localhost:3001/admin/diagnostics?token=<TOKEN>&format=json

# Download diagnostics file (for support tickets)
curl -O http://localhost:3001/admin/diagnostics?token=<TOKEN>
# Saves as: diagnostics-<timestamp>.json
```

**What's Included:**
- **Current Health:** Database, storage, Stripe, SMTP, EVTS status
- **Health History:** Last 10 health snapshots (trend analysis)
- **Recent Errors:** Last 50 application errors with stack traces
- **Most Likely Causes:** AI-analyzed troubleshooting suggestions
- **Missing Resources:** List of required directories/files not found
- **Recent Logs:** Last 100 log lines
- **Server Info:** PID, uptime, memory, CPU, Node version
- **Config:** Environment, ports, feature flags

**Interpreting Results:**
- `health.status = "ready"` → All systems operational
- `health.status = "degraded"` → Some non-critical services down (check `degradedReasons`)
- `health.status = "unhealthy"` → Critical service down (DB or storage)
- `mostLikelyCauses` → Start troubleshooting here

---

### How to Interpret /health/status Degraded Reasons

**Degraded vs Unhealthy:**
- **Unhealthy:** Critical services down (DB, storage) → Server cannot function
- **Degraded:** Optional services down (Stripe, SMTP, EVTS) → Server functions but features limited

**Degraded Reasons:**

| Reason | Impact | Action |
|--------|--------|--------|
| `stripe-not-configured` | Donations fail | Set `STRIPE_SECRET_KEY` or use `NO_KEYS_MODE=true` |
| `smtp-not-configured` | Email receipts disabled | Set SMTP credentials or use `NO_KEYS_MODE=true` |
| `evts-not-configured` | Event webhooks disabled | Set `EVTS_WEBHOOK_URL` or ignore for demos |
| `models-missing` | Speech-to-text disabled | Download Vosk/Whisper models to `backend/models/` |

**Demo Mode:** All degraded reasons are expected when `NO_KEYS_MODE=true`. This is intentional for demos/pilots.

---

## Health Alerting

**Purpose:** Automatic notifications when health checks fail repeatedly

**Configuration:**
```env
# Alert mode: none, email, webhook
ALERT_MODE=none

# Email alerting (requires SMTP)
OPS_ALERT_EMAIL_TO=ops@example.com

# Webhook alerting (n8n-compatible)
OPS_ALERT_WEBHOOK_URL=https://n8n.example.com/webhook/ops-alert

# Thresholds
ALERT_FAILURE_THRESHOLD=3          # Consecutive failures before alert
ALERT_COOLDOWN_MINUTES=15          # Minutes between alerts
```

**Alert Triggers:**
1. **Health Check Failed:** `/health/ready` returns 503 for N consecutive checks
2. **Database Reconnect Exceeded:** Self-healing exhausted max reconnect attempts
3. **Disk Write Failure:** Receipt or file generation failed due to permissions/disk space
4. **Transpile-Only in Production:** Server attempted to start with type errors masked

**Email Format:**
```
Subject: [ALERT] Health Check Failed - Care2System Backend

Alert: Health Check Failed
Severity: high
Threshold: 3 consecutive failures

Current Status: unhealthy
Degraded Reasons:
  - Database connection failed

Suggested Fix:
  1. Check DATABASE_URL in .env
  2. Verify Supabase dashboard is operational
  3. Check network connectivity
  4. Review logs: data/health/health-history.jsonl

View diagnostics:
  http://localhost:3001/admin/diagnostics?token=<TOKEN>

-- Automated Alert --
```

**Webhook Payload (JSON):**
```json
{
  "alert": "Health Check Failed",
  "severity": "high",
  "status": "unhealthy",
  "degradedReasons": ["Database connection failed"],
  "threshold": 3,
  "suggestedFix": "1. Check DATABASE_URL...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Metrics Endpoint

**Purpose:** Prometheus-compatible metrics for dashboards (Grafana, n8n, etc.)

**Configuration:**
```env
METRICS_ENABLED=true
METRICS_TOKEN=your-secret-token-here
```

**Usage:**
```bash
# Prometheus format (default)
curl http://localhost:3001/metrics?token=<TOKEN>

# JSON format (for custom dashboards)
curl http://localhost:3001/metrics?token=<TOKEN>&format=json
```

**Available Metrics:**
- `care2system_uptime_seconds` - Server uptime
- `care2system_health_ready_ok` - Health status (1 = ready, 0 = unhealthy/degraded)
- `care2system_health_degraded` - Degraded mode (1 = degraded, 0 = ready/unhealthy)
- `care2system_db_reconnect_attempts` - Database reconnection attempts
- `care2system_memory_usage_bytes` - Memory usage (RSS)
- `care2system_memory_usage_heap_bytes` - Heap memory usage
- `care2system_request_count_total{route="health|analysis|export|support|api"}` - Request counts by route group

**Grafana Dashboard Example:**
```
Panel: Health Status Over Time
Query: care2system_health_ready_ok
Type: Graph (1 = healthy, 0 = down)

Panel: Database Reconnect Attempts
Query: rate(care2system_db_reconnect_attempts[5m])
Type: Graph (spikes indicate DB issues)

Panel: Memory Usage
Query: care2system_memory_usage_bytes / 1024 / 1024
Type: Graph (MB)
```

---

## Demo Safe Mode

**Purpose:** Auto port selection and service status display for demos/pilots

**Configuration:**
```env
DEMO_SAFE_MODE=true
```

**Features:**
1. **Auto Port Selection:** If port 3001 in use, tries 3002, 3003, ..., 3010
2. **Service Status Display:** Shows which optional services (Stripe, SMTP, EVTS) are disabled
3. **Demo Banner:** Beautiful startup banner with URLs and warnings
4. **Demo Status Endpoint:** `GET /demo/status` for automated checks

**Startup Banner Example:**
```
╔═══════════════════════════════════════════════════════════╗
║                  🎯 DEMO SAFE MODE ACTIVE                 ║
╚═══════════════════════════════════════════════════════════╝

✅ Server running on auto-selected port: 3002
   (Port 3001 was in use)

📍 Demo URLs:
   Backend:  http://localhost:3002
   Health:   http://localhost:3002/health/status
   Demo:     http://localhost:3002/demo/status

⚠️  Services Disabled (NO_KEYS_MODE):
   - Stripe payments (mock donations only)
   - Email receipts (receipts saved locally)

✅ Available Services:
   - Database (Supabase)
   - Storage (Supabase)
   - QR code generation
   - Word document export

╔═══════════════════════════════════════════════════════════╗
║              🚀 READY FOR DEMO PRESENTATION               ║
╚═══════════════════════════════════════════════════════════╝
```

**Demo Status Endpoint:**
```bash
curl http://localhost:3002/demo/status
```
Response:
```json
{
  "demoModeEnabled": true,
  "requestedPort": 3001,
  "actualPort": 3002,
  "portAutoSelected": true,
  "frontendUrl": "http://localhost:3003",
  "backendUrl": "http://localhost:3002",
  "services": {
    "stripe": { "enabled": false, "reason": "NO_KEYS_MODE" },
    "smtp": { "enabled": false, "reason": "NO_KEYS_MODE" },
    "evts": { "enabled": false, "reason": "Not configured" }
  },
  "warnings": [
    "Port 3001 was in use, auto-selected 3002",
    "Stripe disabled: donations will be mocked",
    "SMTP disabled: receipts will not be emailed"
  ]
}
```

---

## Production Build Policies

**Purpose:** Enforce type safety in production to prevent masked errors

**Policies:**
1. **Refuse transpile-only mode:** Production server refuses to start with `--transpile-only` flag
2. **Require compiled dist/:** Production server must run from compiled `dist/` directory
3. **Warn in dev mode:** Development allows transpile-only but logs loud warnings

**Error Messages:**

**Transpile-only detected:**
```
❌ INTEGRITY ERROR: Production Transpile-Only Detected

Running with --transpile-only in production masks type errors!

This is FORBIDDEN for production deployments.

How to fix:
  1. Fix all TypeScript errors: npm run typecheck
  2. Build compiled version: npm run build
  3. Start production server: npm run start:prod

Current environment: production
```

**Missing dist/ directory:**
```
❌ INTEGRITY ERROR: Not Running from Compiled Dist

Production server must run from compiled dist/ directory.

How to fix:
  1. Build compiled version: npm run build
  2. Start production server: npm run start:prod

Current directory: C:\Users\...\backend
Expected directory: C:\Users\...\backend\dist
```

**How to Deploy Correctly:**
```bash
# 1. Typecheck
npm run typecheck

# 2. Run tests
npm test

# 3. Build compiled version
npm run build

# 4. Start production server
npm run start:prod
```

---

## Environment Variables Reference

### Alerting
```env
ALERT_MODE=none                                    # Alert mode: none, email, webhook
OPS_ALERT_EMAIL_TO=ops@example.com                # Email recipient for alerts
OPS_ALERT_WEBHOOK_URL=https://n8n.../ops-alert    # Webhook URL (n8n-compatible)
ALERT_FAILURE_THRESHOLD=3                         # Consecutive failures before alert
ALERT_COOLDOWN_MINUTES=15                         # Minutes between duplicate alerts
```

### Demo Safe Mode
```env
DEMO_SAFE_MODE=false                              # Enable auto port selection
```

### Metrics
```env
METRICS_ENABLED=false                             # Enable /metrics endpoint
METRICS_TOKEN=your-secret-token                   # Token for /metrics auth
```

### Admin Diagnostics
```env
ADMIN_DIAGNOSTICS_TOKEN=your-admin-token          # Token for /admin/diagnostics
```

---

## Endpoint Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/health/status` | GET | None | Detailed health status |
| `/health/ready` | GET | None | Readiness probe (503 if unhealthy) |
| `/health/live` | GET | None | Liveness probe (always 200) |
| `/health/startup` | GET | None | Startup probe (validates integrity) |
| `/admin/diagnostics` | GET | Token | Comprehensive diagnostics bundle |
| `/admin/health-logs` | GET | Token | Download health history log |
| `/demo/status` | GET | None | Demo mode status and warnings |
| `/metrics` | GET | Token | Prometheus-compatible metrics |

---

## Support Contacts

**Health Issues:** Check `/admin/diagnostics` first  
**Demo Preparation:** Enable `DEMO_SAFE_MODE=true`  
**Production Deployment:** Follow build policies (npm run build → start:prod)  
**Alerting Setup:** Configure `ALERT_MODE` and SMTP/webhook  

---

**Last Updated:** 2024-01-15  
**Version:** 1.6.0 (Ops Hardening)
