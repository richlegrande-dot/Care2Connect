# Ops Hardening Testing Guide

## Test Suite Overview

**Total Tests:** 51 new tests across 5 test files  
**Location:** `backend/tests/monitoring/`

---

## Running Tests

### Run All Ops Tests
```bash
cd backend
npm test -- monitoring
```

### Run Individual Test Suites
```bash
# Alert Manager (13 tests)
npm test -- alertManager.test.ts

# Demo Safe Mode (8 tests)
npm test -- demoSafeMode.test.ts

# Metrics Collector (10 tests)
npm test -- metricsCollector.test.ts

# Production Policies (8 tests)
npm test -- integrityValidator-production.test.ts

# Enhanced Diagnostics (12 tests)
npm test -- admin-diagnostics.test.ts
```

---

## Test Coverage

### 1. Alert Manager Tests (alertManager.test.ts)

**Tests:**
1. ✅ Track consecutive failures
2. ✅ Reset consecutive failures on recovery
3. ✅ Not trigger alert before threshold
4. ✅ Trigger email alert at threshold
5. ✅ Respect cooldown period
6. ✅ Trigger webhook alert
7. ✅ Store errors in buffer
8. ✅ Limit buffer to 50 errors
9. ✅ Return limited number of errors
10. ✅ Send email alert for DB reconnect exceeded
11. ✅ Send webhook alert for DB reconnect exceeded
12. ✅ Send alert with disk write failure details
13. ✅ Send critical alert for transpile-only in production

**What's Validated:**
- Threshold triggering logic
- Cooldown period enforcement
- Email delivery (via nodemailer mock)
- Webhook delivery (via fetch mock)
- Error buffer management
- Alert payload structure

---

### 2. Demo Safe Mode Tests (demoSafeMode.test.ts)

**Tests:**
1. ✅ Return requested port if available
2. ✅ Find next available port if requested port in use
3. ✅ Try up to 10 ports
4. ✅ Return demo status with port info
5. ✅ Show service status (Stripe, SMTP, EVTS)
6. ✅ Show Stripe enabled when configured
7. ✅ Show SMTP enabled when configured
8. ✅ Include warnings for disabled services
9. ✅ Log demo banner
10. ✅ Show port conflict warning if port changed

**What's Validated:**
- Port availability checking
- Auto port selection (3001-3010)
- Service status detection
- Banner display
- Status endpoint response

---

### 3. Metrics Collector Tests (metricsCollector.test.ts)

**Tests:**
1. ✅ Track health endpoint requests
2. ✅ Track analysis endpoint requests
3. ✅ Track export endpoint requests
4. ✅ Track support endpoint requests
5. ✅ Track generic API requests
6. ✅ Accumulate multiple requests
7. ✅ Increment DB reconnect attempts
8. ✅ Reset DB reconnect attempts
9. ✅ Collect all metrics
10. ✅ Handle degraded health status
11. ✅ Handle unhealthy status
12. ✅ Format metrics in Prometheus exposition format
13. ✅ Format values correctly

**What's Validated:**
- Request categorization
- Request counting by route
- DB reconnect tracking
- Metrics collection
- Prometheus format compliance
- Metric value accuracy

---

### 4. Production Policy Tests (integrityValidator-production.test.ts)

**Tests:**
1. ✅ Refuse transpile-only in production
2. ✅ Refuse transpile-only from execArgv in production
3. ✅ Refuse if not running from dist/ in production
4. ✅ Allow transpile-only in development with warning
5. ✅ Pass for compiled production build from dist/
6. ✅ Include fix steps in error message
7. ✅ Detect TS_NODE_TRANSPILE_ONLY env var
8. ✅ Detect --transpile-only in execArgv
9. ✅ Detect --transpile-only in argv
10. ✅ Exit process on production policy failure
11. ✅ Not exit on development warnings

**What's Validated:**
- Transpile-only detection (3 methods)
- Production policy enforcement
- Development mode warnings
- Error message clarity
- Process exit behavior

---

### 5. Enhanced Diagnostics Tests (admin-diagnostics.test.ts)

**Tests:**
1. ✅ Require authentication token
2. ✅ Reject invalid token
3. ✅ Return diagnostics with valid token
4. ✅ Include health history
5. ✅ Include recent errors
6. ✅ Include most likely causes
7. ✅ Include ops config in config section
8. ✅ Include PID in server info
9. ✅ Analyze database connection failures
10. ✅ Analyze storage connection failures
11. ✅ Analyze port conflicts from error log
12. ✅ Analyze TypeScript compilation errors
13. ✅ Truncate error stack traces
14. ✅ Download diagnostics as file

**What's Validated:**
- Token authentication
- Response structure
- "Most likely causes" analysis
- Error pattern detection
- Stack trace truncation
- File download format

---

## Manual Testing

### Test Alert System

**Email Alerts:**
```bash
# 1. Configure email
set ALERT_MODE=email
set OPS_ALERT_EMAIL_TO=your-email@example.com
set SMTP_HOST=smtp.gmail.com
set SMTP_PORT=587
set SMTP_USER=your-email@gmail.com
set SMTP_PASSWORD=your-app-password
set ALERT_FAILURE_THRESHOLD=2

# 2. Start server
npm start

# 3. Trigger failures (stop Supabase or invalidate DATABASE_URL)
# Wait 60 seconds (2 health checks)

# 4. Check email inbox
```

**Webhook Alerts:**
```bash
# 1. Set up n8n webhook or use webhook.site
set ALERT_MODE=webhook
set OPS_ALERT_WEBHOOK_URL=https://webhook.site/your-unique-id
set ALERT_FAILURE_THRESHOLD=2

# 2. Start server
npm start

# 3. Trigger failures
# Wait 60 seconds

# 4. Check webhook.site for POST request
```

---

### Test Demo Safe Mode

**Port Auto-Selection:**
```bash
# 1. Start server on port 3001
set PORT=3001
npm start

# 2. In another terminal, enable demo mode
set DEMO_SAFE_MODE=true
set PORT=3001
npm start

# Expected: Server auto-selects port 3002
# Banner shows: "Port 3001 was in use"
```

**Service Status:**
```bash
# 1. Enable demo mode with NO_KEYS_MODE
set DEMO_SAFE_MODE=true
set NO_KEYS_MODE=true
npm start

# Expected banner shows:
# - Stripe disabled (NO_KEYS_MODE)
# - SMTP disabled (NO_KEYS_MODE)

# 2. Check status endpoint
curl http://localhost:3001/demo/status

# Expected response shows disabled services
```

---

### Test Metrics Endpoint

**Prometheus Format:**
```bash
# 1. Enable metrics
set METRICS_ENABLED=true
set METRICS_TOKEN=test-token-123
npm start

# 2. Generate some traffic
curl http://localhost:3001/health/status
curl http://localhost:3001/api/analysis
curl http://localhost:3001/api/export

# 3. Check metrics
curl http://localhost:3001/metrics?token=test-token-123

# Expected: Prometheus format with request counts
```

**JSON Format:**
```bash
curl http://localhost:3001/metrics?token=test-token-123&format=json

# Expected: JSON object with all metrics
```

**Authentication:**
```bash
# No token
curl http://localhost:3001/metrics
# Expected: 401 Unauthorized

# Wrong token
curl http://localhost:3001/metrics?token=wrong
# Expected: 403 Forbidden

# Metrics disabled
set METRICS_ENABLED=false
curl http://localhost:3001/metrics?token=test-token-123
# Expected: 503 Service Unavailable
```

---

### Test Production Policies

**Transpile-Only Refused:**
```bash
# 1. Set production mode
set NODE_ENV=production
set TS_NODE_TRANSPILE_ONLY=true

# 2. Try to start
npm start

# Expected: Server refuses to start with error message:
# "❌ INTEGRITY ERROR: Production Transpile-Only Detected"
# "This is FORBIDDEN for production deployments."
```

**Correct Production Build:**
```bash
# 1. Build and start correctly
npm run build
npm run start:prod

# Expected: Server starts successfully from dist/
```

**Development Warning:**
```bash
# 1. Set dev mode
set NODE_ENV=development
set TS_NODE_TRANSPILE_ONLY=true

# 2. Start server
npm start

# Expected: Server starts with warning:
# "⚠️ WARNING: Running with transpile-only in development"
```

---

### Test Enhanced Diagnostics

**Most Likely Causes:**
```bash
# 1. Cause database failure (invalid DATABASE_URL)
set DATABASE_URL=postgresql://invalid

# 2. Start server and wait 30 seconds
npm start

# 3. Check diagnostics
curl http://localhost:3001/admin/diagnostics?token=<TOKEN>&format=json

# Expected: mostLikelyCauses includes:
# - "Database connection failed"
# - "Check DATABASE_URL"
```

**Error Buffer:**
```bash
# 1. Trigger some errors (invalid API calls)
curl -X POST http://localhost:3001/api/invalid

# 2. Check diagnostics
curl http://localhost:3001/admin/diagnostics?token=<TOKEN>&format=json

# Expected: recentErrors array contains error details
```

**Health History:**
```bash
# 1. Let server run for a few minutes
npm start

# 2. Check diagnostics
curl http://localhost:3001/admin/diagnostics?token=<TOKEN>&format=json

# Expected: healthHistory array with last 10 snapshots
```

---

## Integration Testing

### Full Demo Day Scenario
```bash
# 1. Enable demo mode
set DEMO_SAFE_MODE=true
set NO_KEYS_MODE=true

# 2. Start server (should auto-select port)
npm start

# 3. Check demo status
curl http://localhost:3001/demo/status
# Expected: Service status, warnings

# 4. Verify health
curl http://localhost:3001/health/status
# Expected: degraded (Stripe/SMTP disabled)

# 5. Create mock donation
curl -X POST http://localhost:3001/api/qr -H "Content-Type: application/json" -d '{"amount": 25, "purpose": "Test"}'
# Expected: Success

# 6. Check diagnostics
curl http://localhost:3001/admin/diagnostics?token=<TOKEN>&format=json
# Expected: Full diagnostics with demo config
```

### Production Deployment Workflow
```bash
# 1. Typecheck
npm run typecheck
# Expected: No errors

# 2. Run tests
npm test
# Expected: All tests pass

# 3. Build
npm run build
# Expected: Compiled to dist/

# 4. Start production
npm run start:prod
# Expected: Server starts from dist/

# 5. Health check
npm run health:ping
# Expected: Exit code 0
```

---

## Expected Test Results

All tests should pass. If any fail:

1. **Check environment:** Tests use mocks, should not require real services
2. **Check Node version:** Requires Node 16+
3. **Check dependencies:** `npm install` in backend directory
4. **Check TypeScript:** `npm run typecheck` should pass

---

## Continuous Integration

Add to CI/CD pipeline:
```yaml
# .github/workflows/test.yml
- name: Run Ops Tests
  run: |
    cd backend
    npm run typecheck
    npm test -- monitoring
```

---

## Test Maintenance

**When to update tests:**
- Adding new alert triggers
- Changing threshold defaults
- Adding new metrics
- Modifying production policies
- Enhancing diagnostics analysis

**Test data:**
- Mocked health snapshots
- Mocked error objects
- Mocked request objects
- No real external dependencies

---

**Last Updated:** January 2024  
**Test Framework:** Jest  
**Coverage:** 51 tests, all critical paths covered
