# CareConnect Operations Runbook

**Version:** 1.6  
**Last Updated:** January 2024

---

## Quick Access

- **System Panel:** `/system` (password: `blueberry:y22`)
- **Health Check:** `GET /health/status`
- **User Errors:** `GET /admin/user-errors` (requires auth)
- **Run Tests:** `POST /admin/run-tests` (requires auth)

---

## System Diagnostics Console

### Accessing the Console

```bash
# Navigate to system panel
https://your-domain.com/system

# Password
blueberry:y22
```

**Features:**
- Real-time health monitoring
- Safe integrity test runner
- User error console with root cause analysis
- Live health graphs (30s polling)
- Session-based authentication (30min expiry)

---

## Pre-Demo Checklist

Run this checklist **5 minutes before every demo**:

### 1. Access System Panel
- [ ] Navigate to `/system`
- [ ] Login with password: `blueberry:y22`

### 2. Check System Status
- [ ] Verify "Ready" status (green)
- [ ] Database: Connected (green)
- [ ] Storage: Connected (green)
- [ ] User Errors: <5 recent errors

### 3. Run Safe Tests
- [ ] Click "Run Tests" button
- [ ] Verify all 5 tests pass (✓):
  - ✓ storageWritable
  - ✓ healthReady
  - ✓ qrGeneration
  - ✓ wordExport
  - ✓ supportTicketWrite
- [ ] Total execution time: <500ms

### 4. Test User Flow
- [ ] Navigate to homepage
- [ ] Click "Tell Your Story"
- [ ] Test microphone permissions (allow if prompted)
- [ ] Record 5-second test: "This is a test recording"
- [ ] Verify processing overlay appears
- [ ] Verify redirect to GoFundMe extraction

### 5. Verify Demo Safe Mode (if needed)
```bash
# Check backend .env
DEMO_SAFE_MODE=true
NO_KEYS_MODE=true
ALERT_MODE=silent
```

### 6. Clear Test Data (optional)
```bash
# If you created test data during prep
rm -rf backend/data/test/*
rm -rf backend/data/uploads/test-*
```

---

## Incident Response

### Degraded Status Alert

**Symptoms:** Yellow "Degraded" status in System Panel

**Steps:**
1. Check degraded reasons alert banner
2. Identify failing service:
   - Database connection issues
   - Storage unavailable
   - External API timeouts
3. Check recent user errors for patterns
4. Run safe tests to isolate component
5. Apply recommended fix from root cause analysis

### Database Connection Lost

**Symptoms:** Database card shows "Disconnected" (red)

**Quick Fixes:**
```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Test connection manually
psql $DATABASE_URL -c "SELECT 1;"

# Verify Supabase status
curl https://status.supabase.com/api/v2/status.json

# Restart backend (if connection pooling issue)
pm2 restart care2system-backend
# OR
docker restart care2system-backend
```

### Storage Connection Lost

**Symptoms:** Storage card shows "Disconnected" (red)

**Quick Fixes:**
```bash
# Check Supabase storage credentials
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test storage endpoint
curl "$SUPABASE_URL/storage/v1/bucket" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"

# Verify bucket exists
curl "$SUPABASE_URL/storage/v1/bucket/care2system-uploads" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

### Port Conflict (EADDRINUSE)

**Symptoms:** Backend won't start, "address already in use" error

**Quick Fixes:**
```bash
# Option 1: Enable Demo Safe Mode (auto-finds port)
echo "DEMO_SAFE_MODE=true" >> backend/.env
pm2 restart care2system-backend

# Option 2: Kill process on port 3001
lsof -ti:3001 | xargs kill -9
pm2 restart care2system-backend

# Option 3: Change port
echo "PORT=3002" >> backend/.env
pm2 restart care2system-backend
```

### Tests Failing

**Test:** `storageWritable` ✗

**Fix:**
```bash
# Create data directories
mkdir -p backend/data/test
mkdir -p backend/data/uploads
mkdir -p backend/data/user-errors

# Fix permissions
chmod 755 backend/data
chmod 755 backend/data/*

# Check disk space
df -h
```

**Test:** `healthReady` ✗

**Fix:**
```bash
# Check backend is running
curl http://localhost:3001/health/status

# Check logs
tail -f backend/logs/app.log
# OR
pm2 logs care2system-backend

# Restart backend
pm2 restart care2system-backend
```

**Test:** `qrGeneration` ✗ or `wordExport` ✗

**Fix:**
```bash
# Reinstall dependencies
cd backend
npm install

# Verify packages
npm list qrcode
npm list docx

# Check TypeScript errors
npm run typecheck
```

---

## Root Cause Analysis Quick Reference

### Common Error Categories

| Category | Common Causes | Quick Fix |
|----------|---------------|-----------|
| **Network** | Backend down, connectivity issues | Check backend status, verify firewall |
| **Config** | Missing env vars | Check `.env` file, restart server |
| **Stripe** | Keys not set | Set `STRIPE_SECRET_KEY` or `NO_KEYS_MODE=true` |
| **Models** | AI files missing | Download Vosk/Whisper to `backend/models/` |
| **Export** | Word gen fails | Check storage config, verify `docx` package |
| **QR** | QR gen fails | Verify `qrcode` package installed |
| **Permissions** | File access denied | `chmod 755` data directories |
| **Port** | Port conflict | Enable `DEMO_SAFE_MODE` or kill process |
| **Database** | Connection fails | Check `DATABASE_URL`, verify Supabase |
| **Storage** | Upload fails | Check `SUPABASE_URL` and credentials |
| **TypeScript** | Compile errors | Run `npm run typecheck`, fix errors |
| **SMTP** | Email fails | Check `SMTP_HOST` or `NO_KEYS_MODE=true` |
| **Media** | Mic denied | User must grant browser permissions |
| **Recording** | Recording fails | Check browser compatibility (Chrome/Edge) |

### Confidence Levels

- **High (Green):** Clear diagnosis, recommended fix likely to resolve
- **Medium (Yellow):** Multiple possible causes, try fixes in order
- **Low (Gray):** Unknown error, check full stack trace and logs

---

## Health Monitoring

### Metrics Tracked

1. **Ready** - System fully operational
2. **Degraded** - Some services impaired
3. **DB OK** - Database connection active
4. **Storage OK** - File storage accessible

### Polling Intervals

- **Status Cards:** 10 seconds
- **Health Graph:** 30 seconds
- **User Errors:** 30 seconds

### Interpreting the Graph

**Normal Operation:**
- All metrics at 1.0 (100%)
- Flat green/blue/purple lines
- No yellow spikes

**Degraded State:**
- Yellow line at 1.0
- Green line drops to 0
- Check degraded reasons banner

**Critical Failure:**
- Red status
- Multiple metrics at 0
- Check error console immediately

---

## Safe Test Runner

### When to Run Tests

- ✅ Before every demo (mandatory)
- ✅ After deployments (verify success)
- ✅ During incidents (isolate component)
- ✅ Weekly health checks (routine)
- ✅ After configuration changes
- ❌ Not during active user sessions (can cause brief delays)

### Test Descriptions

| Test | What It Checks | Pass Criteria | Typical Time |
|------|----------------|---------------|--------------|
| `storageWritable` | File write permissions | Creates/deletes test file | 5-20ms |
| `healthReady` | Health endpoint responds | Returns status object | 10-30ms |
| `qrGeneration` | QR library functional | Generates QR code buffer | 20-50ms |
| `wordExport` | Word library functional | Creates docx buffer | 30-100ms |
| `supportTicketWrite` | Support file path writable | Creates/deletes ticket file | 5-20ms |

### Expected Results

**All Passing:**
```
✓ storageWritable     (15ms)
✓ healthReady        (22ms)
✓ qrGeneration       (45ms)
✓ wordExport         (78ms)
✓ supportTicketWrite (12ms)

Total: 172ms
```

**Failure Indicators:**
- ✗ Any test shows red X
- Duration >200ms (performance issue)
- Timeout (>5s, critical failure)

---

## User Error Console

### Reviewing Errors

1. Navigate to System Panel (`/system`)
2. Scroll to "User Errors" section
3. Click any error row for details
4. Review root cause analysis panel
5. Apply recommended fix

### Error Prioritization

**High Priority (Investigate Immediately):**
- Errors affecting >5 users
- "High confidence" root causes
- Categories: Database, Storage, Recording
- Page: `/tell-story` (core user flow)

**Medium Priority (Investigate Within 24h):**
- Isolated errors (<5 occurrences)
- "Medium confidence" root causes
- Categories: Export, QR, Email
- Page: `/gfm/extract`, `/funding`

**Low Priority (Monitor):**
- Single occurrence
- "Low confidence" root causes
- Categories: Unknown, Network (transient)
- Status: "Resolved" (already fixed)

### Bulk Error Patterns

If you see 10+ errors with same root cause:
1. **System-wide issue** - requires immediate fix
2. Check degraded reasons in System Panel
3. Run safe tests to identify failing component
4. Apply fix to backend/config
5. Restart services
6. Verify errors stop appearing

---

## Configuration Reference

### Required Environment Variables

**Backend (.env):**
```bash
# Core
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key

# System Panel
SYSTEM_PANEL_PASSWORD=blueberry:y22

# Storage
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Optional Hardening
DEMO_SAFE_MODE=false
NO_KEYS_MODE=false
ALERT_MODE=log
METRICS_ENABLED=true
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_BACKEND_URL=https://api.your-domain.com
```

### Demo Mode Settings

**For Presentations/Demos:**
```bash
DEMO_SAFE_MODE=true      # Auto-find port, skip heavy checks
NO_KEYS_MODE=true        # Disable Stripe, SMTP requirements
ALERT_MODE=silent        # Suppress console warnings
```

**For Production:**
```bash
DEMO_SAFE_MODE=false
NO_KEYS_MODE=false
ALERT_MODE=log
METRICS_ENABLED=true
```

---

## Deployment Verification

After deploying new version:

### 1. Backend Health
```bash
# Check health endpoint
curl https://api.your-domain.com/health/status

# Expected response
{
  "ready": true,
  "dbOk": true,
  "storageOk": true,
  "degradedReasons": []
}
```

### 2. System Panel Access
- [ ] Navigate to `/system`
- [ ] Login successful
- [ ] Status: "Ready" (green)
- [ ] All tests pass

### 3. Core User Flow
- [ ] Homepage loads
- [ ] Recording page accessible
- [ ] Microphone permission prompt works
- [ ] Recording → Processing overlay → GoFundMe extraction
- [ ] No errors in System Panel

### 4. Error Logging
```bash
# Test error reporting
curl -X POST https://api.your-domain.com/errors/report \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test error from deployment verification",
    "page": "/test",
    "context": { "deployment": "v1.6" }
  }'

# Verify in System Panel
# Should see error in User Errors table
```

---

## Password Management

### Current Password
```
blueberry:y22
```

### Changing Password

1. **Update backend .env:**
```bash
nano backend/.env
# Change: SYSTEM_PANEL_PASSWORD=new-password-here
```

2. **Restart backend:**
```bash
pm2 restart care2system-backend
# OR
docker restart care2system-backend
```

3. **Notify team:**
- Update password manager
- Email operations team
- Update this runbook

### Password Recovery

If you forget the password:

1. **SSH into backend server**
2. **View .env file:**
```bash
cat backend/.env | grep SYSTEM_PANEL_PASSWORD
```
3. **Copy password** (e.g., `blueberry:y22`)

---

## Monitoring Scripts

### Health Check Script

```bash
#!/bin/bash
# health-check.sh
# Run every 5 minutes via cron

BACKEND_URL="https://api.your-domain.com"

# Check health
STATUS=$(curl -s "$BACKEND_URL/health/status")
READY=$(echo $STATUS | jq -r '.ready')

if [ "$READY" != "true" ]; then
  echo "❌ System degraded at $(date)"
  echo $STATUS | jq '.'
  
  # Send alert (example: Slack)
  curl -X POST $SLACK_WEBHOOK_URL \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"🚨 CareConnect system degraded: $STATUS\"}"
else
  echo "✅ System healthy at $(date)"
fi
```

### Error Count Alert

```bash
#!/bin/bash
# error-alert.sh
# Run every 15 minutes via cron

# Get admin token
TOKEN=$(curl -s -X POST "$BACKEND_URL/admin/auth" \
  -H 'Content-Type: application/json' \
  -d '{"password":"blueberry:y22"}' \
  | jq -r '.token')

# Get error count
ERROR_COUNT=$(curl -s "$BACKEND_URL/admin/user-errors" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.count')

if [ "$ERROR_COUNT" -gt 10 ]; then
  echo "⚠️ High error count: $ERROR_COUNT errors"
  # Send alert
fi
```

---

## Support & Escalation

### Level 1: Self-Service
1. Check System Panel diagnostics
2. Review this runbook
3. Run safe tests to isolate issue
4. Apply recommended fix from root cause analysis

### Level 2: Team Support
1. Post in #operations Slack channel
2. Include:
   - Error message
   - Root cause analysis
   - Steps already tried
   - System Panel screenshot

### Level 3: Engineering Escalation
1. Create GitHub issue
2. Tag: `priority-high`, `ops-incident`
3. Include:
   - Full error logs
   - System Panel diagnostics export
   - Reproduction steps
   - User impact assessment

---

## Quick Commands

### Backend Management

```bash
# Restart backend
pm2 restart care2system-backend

# View logs
pm2 logs care2system-backend --lines 100

# Check process status
pm2 status

# View environment
pm2 env care2system-backend
```

### Health Checks

```bash
# Quick health check
curl http://localhost:3001/health/status | jq '.'

# Detailed diagnostics
curl http://localhost:3001/health/diagnostic | jq '.'

# Database connection
psql $DATABASE_URL -c "SELECT version();"

# Storage check
curl "$SUPABASE_URL/storage/v1/bucket" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

### Log Analysis

```bash
# Find errors in logs
grep -i error backend/logs/app.log | tail -20

# Count error types
grep -i error backend/logs/app.log | cut -d' ' -f5 | sort | uniq -c

# Watch logs live
tail -f backend/logs/app.log | grep --color error
```

---

## Version History

**v1.6 (Current)**
- System Diagnostics Panel
- JWT-based admin authentication
- Safe test runner (5 tests)
- User error console with root cause analysis
- Live health monitoring graphs
- Processing overlay animation

**v1.5**
- Ops hardening: alerting, demo mode, metrics
- Production-grade error handling
- Enhanced health diagnostics

**v1.4**
- Health monitoring system (43 tests)
- Automated health checks

**v1.3**
- Funding wizard implementation
- Stripe integration

---

**Questions?** Contact Operations Team  
**Emergency?** Page on-call engineer  
**Last Updated:** January 2024
