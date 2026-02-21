# System Diagnostics Panel

**Version:** 1.6  
**Access:** `/system`  
**Password:** `blueberry:y22`  
**Authentication:** JWT Bearer Token (30-minute sessions)

## Overview

The System Diagnostics Panel provides enterprise-grade monitoring, testing, and troubleshooting capabilities for the CareConnect platform. This password-protected console enables operations teams to:

- Monitor real-time system health across all services
- Run safe integrity tests without disrupting production
- View and analyze user-reported errors with AI-powered root cause analysis
- Track historical health metrics with live graphs
- Quickly diagnose and resolve issues during demos or production incidents

---

## Table of Contents

1. [Access & Authentication](#access--authentication)
2. [Dashboard Overview](#dashboard-overview)
3. [Health Monitoring](#health-monitoring)
4. [Safe Test Runner](#safe-test-runner)
5. [User Error Console](#user-error-console)
6. [Root Cause Analysis](#root-cause-analysis)
7. [Configuration](#configuration)
8. [Security](#security)
9. [Troubleshooting](#troubleshooting)

---

## Access & Authentication

### Accessing the System Panel

1. Navigate to `/system` in your browser
2. Enter the system password: `blueberry:y22`
3. Click "Login" to receive a JWT token
4. Token is valid for 30 minutes and stored in sessionStorage

### Lockout Protection

- **Max Attempts:** 5 failed login attempts
- **Lockout Duration:** 5 minutes
- **Remaining Attempts:** Displayed on failed login
- **Lockout Reset:** Automatic after 5 minutes

### Session Management

- **Token Storage:** Browser sessionStorage (secure, tab-specific)
- **Token Expiry:** 30 minutes from login
- **Auto-Logout:** Token cleared on manual logout
- **Persistence:** Token survives page refreshes within the same tab

### Logout

Click the "Logout" button in the top-right corner to:
- Clear your session token
- Return to login screen
- Invalidate the JWT on the client side

---

## Dashboard Overview

The main dashboard provides at-a-glance status of all critical systems:

### Status Cards

**System Status Card**
- **Ready** (Green): All systems operational
- **Degraded** (Yellow): Some services impaired but functional
- **Unhealthy** (Red): Critical failure requiring immediate attention

**Database Card**
- **Connected** (Green): Postgres/Supabase connection active
- **Disconnected** (Red): Database unavailable

**Storage Card**
- **Connected** (Green): Supabase Storage operational
- **Disconnected** (Red): File storage unavailable

**User Errors Card**
- Count of recent user-reported errors
- Click to jump to Error Console section

### Degraded Reasons Alert

When status is "degraded", an orange alert banner displays specific issues:
- Database connectivity problems
- Storage service outages
- External API failures
- Configuration issues

---

## Health Monitoring

### Live Health Graph

**Refresh Rate:** 30 seconds  
**Data Points:** Last 50 health snapshots  
**Chart Type:** Line graph with 4 metrics

#### Metrics Tracked

1. **Ready (Green Line)**
   - Value: 1 = Ready, 0 = Not Ready
   - System is fully operational and accepting requests

2. **Degraded (Yellow Line)**
   - Value: 1 = Degraded, 0 = Normal
   - Some services impaired but system functional

3. **DB OK (Blue Line)**
   - Value: 1 = Connected, 0 = Disconnected
   - Postgres database connection status

4. **Storage OK (Purple Line)**
   - Value: 1 = Connected, 0 = Disconnected
   - Supabase Storage connection status

### Summary Cards

Below the graph, four summary cards display counts:
- **Ready Count:** Total "ready" states in last 50 snapshots
- **Degraded Count:** Total "degraded" states
- **DB OK Count:** Times database was connected
- **Storage OK Count:** Times storage was connected

### Interpreting the Graph

- **All Green/Blue/Purple Lines at 1:** Perfect health
- **Yellow Line Spikes:** Temporary degradation
- **Sudden Drops to 0:** Service outages
- **Sustained Low Values:** Chronic issues requiring investigation

---

## Safe Test Runner

### Overview

The Safe Test Runner executes 5 non-invasive integrity checks without disrupting production:

**Safety Guarantees:**
- ✅ No database writes or deletes
- ✅ No production service restarts
- ✅ No Jest test suite execution (too heavy for production)
- ✅ No external API calls that cost money
- ✅ Only reads and lightweight writes to test directories

### Running Tests

1. Click **"Run Tests"** button in the Test Runner section
2. Tests execute sequentially (typically 1-3 seconds total)
3. Results display in real-time with ✓/✗ indicators
4. Each test shows duration in milliseconds

### Test Suite

#### 1. Storage Writable
**Purpose:** Verify filesystem write permissions  
**Method:** Creates test file in `data/test/` directory  
**Pass Criteria:** File created and deleted successfully  
**Typical Duration:** 5-20ms

#### 2. Health Ready
**Purpose:** Verify health check endpoint responds  
**Method:** Internal call to `/health/status`  
**Pass Criteria:** Returns `{ ready: true }` or `{ ready: false }`  
**Typical Duration:** 10-30ms

#### 3. QR Generation
**Purpose:** Verify QR code library functional  
**Method:** Generate QR code for test URL  
**Pass Criteria:** QR code buffer created successfully  
**Typical Duration:** 20-50ms

#### 4. Word Export
**Purpose:** Verify docx library functional  
**Method:** Create minimal Word document in memory  
**Pass Criteria:** Document buffer created successfully  
**Typical Duration:** 30-100ms

#### 5. Support Ticket Write
**Purpose:** Verify support ticket file path writable  
**Method:** Create test file in `data/support-tickets/`  
**Pass Criteria:** File created and deleted successfully  
**Typical Duration:** 5-20ms

### Test Results

**Format:**
```
✓ storageWritable     (15ms)
✓ healthReady        (22ms)
✓ qrGeneration       (45ms)
✓ wordExport         (78ms)
✓ supportTicketWrite (12ms)

Started: 2024-01-15T10:30:45.123Z
Finished: 2024-01-15T10:30:45.295Z
Total: 172ms
```

### When to Run Tests

- **Before Demos:** Verify all systems functional
- **After Deployment:** Confirm deployment successful
- **During Incidents:** Isolate failing components
- **Routine Checks:** Daily or weekly health validation

---

## User Error Console

### Overview

Displays the 10 most recent user-reported errors with root cause analysis. Errors are automatically logged when users encounter issues on the frontend.

### Error Table Columns

| Column | Description |
|--------|-------------|
| **Time** | Timestamp when error occurred (relative time, e.g., "2 minutes ago") |
| **Category** | Error classification (Network, Config, Stripe, Database, etc.) |
| **Page** | URL where error occurred (e.g., `/tell-story`, `/gfm/extract`) |
| **Suspected Cause** | AI-generated hypothesis about the root cause |
| **Confidence** | High (green), Medium (yellow), Low (gray) |
| **Status** | New, Triaged, Resolved (future feature) |

### Viewing Error Details

1. Click any error row in the table
2. Modal opens with full error information:
   - **Timestamp:** Exact date/time
   - **Error Message:** Full error text
   - **Page:** URL where error occurred
   - **Root Cause Analysis Panel:**
     - Category
     - Suspected Cause
     - Recommended Fix
     - Confidence Level

### Error Categories

The system automatically classifies errors into 15+ categories:

1. **Network** - Connectivity, timeouts, fetch failures
2. **Config** - Missing environment variables
3. **Stripe** - Payment processing issues
4. **Models** - AI model file problems
5. **Export** - Word document generation failures
6. **QR** - QR code generation errors
7. **Permissions** - File/directory access denied
8. **Port** - Port conflicts (EADDRINUSE)
9. **Database** - Postgres/Prisma errors
10. **Storage** - Supabase Storage issues
11. **TypeScript** - Compilation errors
12. **SMTP** - Email service failures
13. **Media** - Microphone/audio permissions
14. **Recording** - Recording API failures
15. **Unknown** - Unclassified errors

---

## Root Cause Analysis

### How It Works

The system uses **deterministic pattern matching** (no API keys required) to analyze errors:

1. **Error Capture:** Frontend logs errors to `/errors/report` (public endpoint)
2. **Pattern Matching:** Backend analyzes error message, stack trace, and page context
3. **Classification:** Matches against 15+ predefined patterns
4. **Recommendation:** Returns suspected cause and recommended fix

### Analysis Example

**Error:**
```
fetch failed: connect ECONNREFUSED 127.0.0.1:3001
Page: /tell-story
```

**Root Cause Analysis:**
- **Category:** Network
- **Suspected Cause:** Backend server is not responding. The connection was actively refused, likely because the server is not running or is unreachable.
- **Recommended Fix:** Check if the backend server is running on port 3001. Verify network connectivity and firewall settings. If using Docker, ensure container is up.
- **Confidence:** High

### Confidence Levels

- **High (Green):** Strong pattern match, clear diagnosis
- **Medium (Yellow):** Partial match, multiple possible causes
- **Low (Gray):** No pattern match, generic diagnosis

### Pattern Examples

| Pattern | Category | Suspected Cause | Recommended Fix |
|---------|----------|----------------|-----------------|
| `DATABASE_URL is not defined` | Config | Missing environment variable | Check `.env` file has `DATABASE_URL` set |
| `EACCES: permission denied` | Permissions | File permissions too restrictive | Run `chmod 755` on data directories |
| `Stripe is not configured` | Stripe | Stripe keys not set | Set `STRIPE_SECRET_KEY` or enable `NO_KEYS_MODE=true` |
| `model file not found` | Models | AI models not downloaded | Download Vosk/Whisper to `backend/models/` |
| `EADDRINUSE` | Port | Port conflict | Enable `DEMO_SAFE_MODE=true` or kill process on port |

---

## Configuration

### Environment Variables

**Required:**
```bash
SYSTEM_PANEL_PASSWORD=blueberry:y22
JWT_SECRET=your-secret-key-here
```

**Optional:**
```bash
# Use separate secret for admin sessions (defaults to JWT_SECRET)
ADMIN_SESSION_SECRET=your-admin-secret-here
```

### Backend Routes

The system panel uses these protected routes:

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/admin/auth` | POST | None | Login endpoint, returns JWT |
| `/admin/run-tests` | POST | Bearer | Runs 5 safe tests |
| `/admin/user-errors` | GET | Bearer | Lists last 100 errors |
| `/admin/user-errors/:id` | GET | Bearer | Get specific error details |
| `/health/history` | GET | Bearer | Health snapshots for graph |
| `/errors/report` | POST | None | Public error logging endpoint |

### Frontend Configuration

**Required Environment Variables:**
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

**Session Storage Keys:**
```
system-admin-token       # JWT token
system-admin-expires     # Expiry timestamp (ms since epoch)
system-admin-failed      # Failed attempt count
system-admin-locked      # Lockout expiry timestamp
```

---

## Security

### Password Security

- **Storage:** Password stored only in backend `.env` file
- **Transmission:** HTTPS required in production (enforced by Vercel/Fly.io)
- **Validation:** Backend validates password, never sent to frontend after login
- **Token:** JWT signed with `JWT_SECRET`, includes expiry

### JWT Token Security

- **Algorithm:** HS256 (HMAC with SHA-256)
- **Signing Key:** `JWT_SECRET` or `ADMIN_SESSION_SECRET` from `.env`
- **Payload:** `{ type: 'system-admin', iat, exp }`
- **Expiry:** 30 minutes (1800 seconds)
- **Validation:** Every protected endpoint verifies token signature and type

### Lockout Protection

- **Rate Limiting:** 5 attempts per 5 minutes
- **Client-Side Enforcement:** Prevents brute force attempts
- **Reset:** Automatic after 5 minutes
- **No Backend Tracking:** Lockout state stored in client sessionStorage only

### HTTPS Enforcement

**Production:**
- ✅ Vercel (frontend) enforces HTTPS automatically
- ✅ Fly.io (backend) enforces HTTPS automatically
- ✅ No plaintext password transmission

**Development:**
- ⚠️ HTTP acceptable for localhost only
- ⚠️ Never expose dev environment publicly

### Access Control

**Who Should Have Access:**
- Operations team members
- System administrators
- Demo presenters
- On-call engineers during incidents

**Who Should NOT Have Access:**
- End users
- General public
- Third-party integrations
- Untrusted team members

---

## Troubleshooting

### Can't Log In

**Problem:** "Invalid password" error  
**Solution:**
1. Check `.env` file has `SYSTEM_PANEL_PASSWORD=blueberry:y22`
2. Restart backend server to reload environment variables
3. Verify no extra spaces or quotes around password

**Problem:** "Failed to connect to backend"  
**Solution:**
1. Check `NEXT_PUBLIC_BACKEND_URL` in frontend `.env`
2. Verify backend server is running on correct port
3. Check browser console for CORS errors

**Problem:** Locked out after 5 attempts  
**Solution:**
1. Wait 5 minutes for automatic unlock
2. Or clear sessionStorage: `sessionStorage.clear()` in browser console

### Tests Failing

**Problem:** `storageWritable` fails  
**Solution:**
1. Check file permissions: `chmod 755 backend/data`
2. Verify disk space available: `df -h`
3. Check SELinux/AppArmor if on Linux

**Problem:** `healthReady` fails  
**Solution:**
1. Check backend health endpoint: `curl http://localhost:3001/health/status`
2. Review backend logs for startup errors
3. Verify database and storage connections

**Problem:** `qrGeneration` or `wordExport` fails  
**Solution:**
1. Check npm packages installed: `cd backend && npm install`
2. Verify `qrcode` and `docx` in `package.json`
3. Check for TypeScript errors: `npm run typecheck`

### Graph Not Loading

**Problem:** Empty health graph  
**Solution:**
1. Wait 30 seconds for first poll
2. Check browser console for API errors
3. Verify `/health/history` endpoint accessible
4. Check JWT token not expired

**Problem:** Graph shows no data  
**Solution:**
1. Backend may have just started (no history yet)
2. Wait 1-2 minutes for health data to accumulate
3. Check backend is writing to health history in memory/database

### Errors Not Appearing

**Problem:** User errors table is empty  
**Solution:**
1. Check `backend/data/user-errors/` directory exists
2. Verify write permissions: `chmod 755 backend/data/user-errors`
3. Test error logging: `POST /errors/report` with test error
4. Check JSONL files exist: `ls -la backend/data/user-errors/`

**Problem:** Root cause analysis shows "Unknown"  
**Solution:**
1. This is normal for errors that don't match predefined patterns
2. Review full error message and stack trace in detail modal
3. Add new pattern to `rootCauseAnalyzer.ts` if error is common

---

## Best Practices

### Before Demos

1. **Run Tests:** Click "Run Tests" and verify all 5 pass (✓)
2. **Check Health:** Verify "Ready" status and all metrics at 100%
3. **Clear Errors:** Review any recent errors and resolve if needed
4. **Test Recording:** Make a test recording to verify audio pipeline

### During Incidents

1. **Check Status Cards:** Identify which service is down
2. **Review Errors:** Look for patterns in recent user errors
3. **Run Tests:** Isolate failing component
4. **Check Logs:** Backend logs for detailed error messages
5. **Apply Fix:** Use root cause recommendations

### Routine Maintenance

- **Daily:** Review user errors for new issues
- **Weekly:** Run full test suite and verify 100% pass rate
- **Monthly:** Review degraded reasons trends
- **Quarterly:** Update root cause patterns based on new error types

### Security Hygiene

- **Never commit** `.env` files with password
- **Rotate password** quarterly or after suspected compromise
- **Limit access** to operations team only
- **Use HTTPS** always in production
- **Monitor access** via backend logs

---

## API Reference

### POST /admin/auth

**Request:**
```json
{
  "password": "blueberry:y22"
}
```

**Response (200):**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 1800
}
```

**Response (401):**
```json
{
  "ok": false,
  "error": "Invalid password"
}
```

### POST /admin/run-tests

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "ok": true,
  "startedAt": "2024-01-15T10:30:45.123Z",
  "finishedAt": "2024-01-15T10:30:45.295Z",
  "results": [
    { "test": "storageWritable", "ok": true, "duration": 15 },
    { "test": "healthReady", "ok": true, "duration": 22 },
    { "test": "qrGeneration", "ok": true, "duration": 45 },
    { "test": "wordExport", "ok": true, "duration": 78 },
    { "test": "supportTicketWrite", "ok": true, "duration": 12 }
  ]
}
```

### GET /admin/user-errors

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "ok": true,
  "count": 42,
  "errors": [
    {
      "id": "uuid-here",
      "timestamp": "2024-01-15T10:30:45.123Z",
      "message": "fetch failed",
      "page": "/tell-story",
      "rootCause": {
        "category": "Network",
        "suspectedCause": "Backend server not responding",
        "recommendedFix": "Check backend server is running",
        "confidence": "high"
      }
    }
  ]
}
```

### POST /errors/report (Public)

**Request:**
```json
{
  "message": "Error message here",
  "stack": "Error stack trace",
  "page": "/tell-story",
  "userAgent": "Mozilla/5.0...",
  "context": { "additional": "data" }
}
```

**Response (200):**
```json
{
  "ok": true,
  "errorId": "uuid-here"
}
```

---

## Version History

**v1.6 (Current)**
- System Diagnostics Panel implementation
- JWT-based authentication
- Safe test runner (5 tests)
- User error console with root cause analysis
- Live health monitoring graph
- Processing overlay animation

**Previous Versions:**
- v1.5: Ops Hardening Phase (alerting, metrics, demo mode)
- v1.4: Health monitoring system
- v1.3: Funding wizard and donation system
- v1.2: Recording error handling
- v1.1: GoFundMe extraction features
- v1.0: Initial CareConnect platform

---

## Support

For issues with the System Panel:

1. **Check this documentation first**
2. **Review backend logs:** `backend/logs/` or `docker logs care2system-backend`
3. **Check browser console:** F12 → Console tab
4. **Contact operations team:** [support channel]
5. **File incident ticket:** [ticketing system]

---

**Last Updated:** January 2024  
**Maintained By:** Operations Team  
**Questions?** Contact system administrators.
