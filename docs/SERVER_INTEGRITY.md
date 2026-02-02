# Server Integrity Documentation

## Overview

The CareConnect backend now includes enterprise-grade server integrity features:
- **Health Monitoring**: Periodic checks with history tracking
- **Self-Healing**: Automatic recovery from common failures
- **Self-Troubleshooting**: Comprehensive diagnostics with secret redaction
- **Graceful Degradation**: Non-critical services can fail without crashing

---

## Health Endpoints

### 1. Liveness Check
**Endpoint**: `GET /health/live`

**Purpose**: Confirms the server process is running.

**Response** (200 OK):
```json
{
  "status": "alive",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Use Case**: Kubernetes/Docker liveness probes, supervisor health checks.

---

### 2. Readiness Check
**Endpoint**: `GET /health/ready`

**Purpose**: Confirms the server is ready to handle requests. Returns 200 if core services (DB, storage) are operational, or 503 if not ready.

**Response** (200 OK):
```json
{
  "status": "ready",
  "degraded": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "database": true,
    "storage": true
  },
  "degradedReasons": ["EVTS_MODEL_MISSING", "STRIPE_KEYS_MISSING"]
}
```

**Response** (503 Service Unavailable):
```json
{
  "status": "not_ready",
  "degraded": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "database": false,
    "storage": true
  },
  "degradedReasons": ["DATABASE_CONNECTION_FAILED"]
}
```

**Use Case**: Kubernetes readiness probes, load balancer health checks.

---

### 3. Full Health Status
**Endpoint**: `GET /health/status`

**Purpose**: Returns comprehensive health information for all subsystems.

**Response** (200 OK):
```json
{
  "ok": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptimeSec": 3600,
  "mode": "development",
  "build": {
    "commit": "abc123def456",
    "node": "v18.19.0",
    "tsTranspileOnly": true
  },
  "services": {
    "db": {
      "ok": true,
      "detail": "Connected"
    },
    "storage": {
      "ok": true,
      "detail": "All directories exist"
    },
    "speech": {
      "nvtAvailable": true,
      "evtsAvailable": false,
      "modelInstalled": false,
      "detail": "NVT: browser-only (available), EVTS: model missing (degraded to NVT/manual)"
    },
    "stripe": {
      "configured": false,
      "detail": "Running in no-keys mode (QR donations only)"
    },
    "smtp": {
      "configured": false,
      "detail": "Using mailto: fallback"
    }
  },
  "degraded": {
    "enabled": true,
    "reasons": [
      "EVTS_MODEL_MISSING",
      "STRIPE_KEYS_MISSING",
      "SMTP_NOT_CONFIGURED",
      "TYPESCRIPT_TRANSPILE_ONLY"
    ]
  }
}
```

**Use Case**: Monitoring dashboards, debugging, operations.

---

### 4. Health History
**Endpoint**: `GET /health/history?limit=50`

**Purpose**: Returns the last N periodic health snapshots.

**Query Parameters**:
- `limit` (optional, default: 50): Number of snapshots to return

**Response** (200 OK):
```json
{
  "count": 10,
  "snapshots": [
    { /* snapshot 1 */ },
    { /* snapshot 2 */ },
    // ... up to limit
  ]
}
```

**Use Case**: Trend analysis, incident investigation.

---

## Admin Diagnostics Endpoint

### GET /admin/diagnostics
**Authentication**: Requires `x-admin-token` header matching `ADMIN_DIAGNOSTICS_TOKEN` env var.

**Purpose**: Generate comprehensive diagnostics bundle for troubleshooting.

**Query Parameters**:
- `format=json` (optional): Return inline JSON instead of downloadable file

**Response** (200 OK):
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "server": {
    "pid": 12345,
    "uptime": 3600,
    "platform": "win32",
    "arch": "x64",
    "nodeVersion": "v18.19.0",
    "memoryUsage": {
      "rss": 123456789,
      "heapTotal": 98765432,
      "heapUsed": 87654321,
      "external": 1234567
    },
    "cpuUsage": {
      "user": 123456,
      "system": 654321
    }
  },
  "config": {
    "environment": {
      "DATABASE_URL": "[REDACTED - KEY EXISTS]",
      "OPENAI_API_KEY": "[REDACTED - KEY EXISTS]",
      "NODE_ENV": "development",
      "PORT": "3001"
    },
    "port": "3001",
    "nodeEnv": "development",
    "frontendUrl": "http://localhost:3000"
  },
  "health": { /* Latest health status snapshot */ },
  "missingResources": ["models/vosk-model", "models/whisper"],
  "recentLogs": ["[log line 1]", "[log line 2]", ...],
  "versions": {
    "node": "v18.19.0",
    "npm": "1.0.0",
    "commit": "abc123def456"
  }
}
```

**Security**:
- All sensitive environment variables are redacted (`[REDACTED - KEY EXISTS]` or `[NOT SET]`)
- Actual secret values are never exposed
- Token-protected endpoint

---

## Degraded Mode

### What is Degraded Mode?

The server can run in **degraded mode** when non-critical services are unavailable. This ensures:
- Users can still access core functionality
- System remains stable and doesn't crash
- Clear visibility into what's missing

### Degraded Reasons

| Reason | Impact | Mitigation |
|--------|--------|------------|
| `EVTS_MODEL_MISSING` | Server-side speech transcription unavailable | Falls back to browser-based NVT or manual transcript upload |
| `STRIPE_KEYS_MISSING` | Card payments disabled | QR code donations remain available |
| `SMTP_NOT_CONFIGURED` | Email notifications disabled | Support tickets use mailto: links instead |
| `TYPESCRIPT_TRANSPILE_ONLY` | TypeScript errors may be masked | Run `npm run typecheck` to validate |

### How to Check Degraded Mode

**From API**:
```bash
curl http://localhost:3001/health/status
```

**From Frontend** (dev only):
Look for the System Status panel in the bottom-right corner.

---

## Self-Healing Behaviors

### 1. Automatic Directory Creation
**What**: Missing required directories are automatically created on startup and during health checks.

**Directories**:
- `receipts/` - Donation receipts
- `uploads/` - User file uploads
- `data/support-tickets/` - Support ticket storage
- `data/health/` - Health history logs
- `models/` - Speech recognition models

**Trigger**: Runs during:
- Server startup
- Periodic health checks (every 30s)

---

### 2. Database Reconnection
**What**: Automatic database reconnection with exponential backoff.

**Behavior**:
- Detects connection loss during periodic checks (every 60s)
- Attempts up to 5 reconnection attempts
- Backoff: 2s, 4s, 8s, 16s, 32s
- Resets attempt counter on success

**Monitoring**: Watch server logs for:
```
⚠️  Database connection lost, attempting recovery...
🔄 Attempting database reconnection (1/5)...
✅ Database reconnected successfully
```

---

### 3. Graceful Shutdown
**What**: Clean shutdown on SIGTERM/SIGINT signals.

**Behavior**:
1. Close database connections
2. Stop health monitoring
3. Log shutdown message
4. Exit with code 0

**Trigger**: Ctrl+C, PM2 restart, Docker stop

---

### 4. Uncaught Exception Handling
**What**: Logs uncaught exceptions and exits for supervisor restart.

**Behavior**:
- Logs error with full stack trace
- Exits with code 1 to trigger supervisor restart
- Prevents zombie processes

---

## Startup Integrity Validation

### What is Integrity Check?

On startup, the server validates:
- Required environment variables exist
- Critical dependencies are installed
- TypeScript compilation passes (production only)
- Required directories exist (auto-creates if missing)

### Run Manually

```bash
npm run integrity:check
```

This runs:
1. TypeScript type checking (`npm run typecheck`)
2. Full test suite (`npm test`)

### Validation Behavior

**Development Mode**:
- Warnings for missing optional services (Stripe, SMTP)
- Auto-creates missing directories
- Allows transpile-only mode (with warning)

**Production Mode**:
- **Refuses to start** if critical errors found
- Requires compiled `dist/` directory
- Strict environment variable validation

---

## Periodic Health Monitoring

### Configuration

**Interval**: 30 seconds (default)

**Output**:
- In-memory ring buffer (last 50 snapshots)
- Disk append-only log: `data/health/health-history.jsonl`

### Accessing History

**API**:
```bash
curl http://localhost:3001/health/history?limit=20
```

**Disk Log** (with admin token):
```bash
curl -H "x-admin-token: YOUR_TOKEN" \
  http://localhost:3001/admin/health-logs > health.jsonl
```

**Analysis**:
```bash
# View last 10 entries
tail -n 10 data/health/health-history.jsonl

# Count degraded occurrences
grep -c '"enabled":true' data/health/health-history.jsonl
```

---

## Common Startup Issues

### Issue: "Missing required environment variable: DATABASE_URL"

**Cause**: `.env` file missing or incomplete.

**Fix**:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your database connection string
```

---

### Issue: "TypeScript transpile-only warning"

**Cause**: Server started with `--transpile-only` flag, masking type errors.

**Impact**: Type errors won't prevent server from starting.

**Fix**:
```bash
# Validate types
npm run typecheck

# Fix errors, then restart without transpile-only
npm run dev
```

---

### Issue: "EVTS_MODEL_MISSING in degraded mode"

**Cause**: Whisper/Vosk model not installed.

**Impact**: Server-side speech transcription unavailable. Falls back to browser-based NVT or manual transcript.

**Fix** (optional):
```bash
# Download and extract model
mkdir -p backend/models/vosk-model
# ... download from https://alphacephei.com/vosk/models
```

**Alternative**: Use browser-based speech recognition (NVT) or manual transcript upload.

---

### Issue: "Port 3001 already in use"

**Cause**: Another process using port 3001.

**Fix**:
```powershell
# Find process using port
Get-NetTCPConnection -LocalPort 3001 | Select-Object OwningProcess

# Kill process
Stop-Process -Id <PID>

# Or use different port
$env:PORT=3002; npm run dev
```

---

## Rate Limiting

**Health endpoints are exempt from rate limiting** to ensure monitoring tools can poll frequently without hitting limits.

**Configuration** (in `server.ts`):
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  skip: (req) => req.path.startsWith('/health'), // Exempt
});
```

---

## Environment Variables

### Required (Critical)

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@localhost:5432/careconnect` |

### Optional (Degraded Mode)

| Variable | Purpose | Default Behavior |
|----------|---------|------------------|
| `OPENAI_API_KEY` | AI chat assistant | Stub responses |
| `STRIPE_SECRET_KEY` | Card payments | QR donations only |
| `STRIPE_PUBLIC_KEY` | Card payments | QR donations only |
| `SMTP_HOST` | Email notifications | mailto: fallback |
| `SMTP_USER` | Email notifications | mailto: fallback |
| `SMTP_PASSWORD` | Email notifications | mailto: fallback |
| `ADMIN_DIAGNOSTICS_TOKEN` | Admin diagnostics endpoint | Endpoint disabled |

### Configuration

| Variable | Purpose | Default |
|----------|---------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `FRONTEND_URL` | CORS origin | `http://localhost:3000` |
| `GIT_COMMIT` | Build commit hash | `unknown` |

---

## Demo Stability Checklist

Before demos or production deployment:

- [ ] Run `npm run integrity:check` (passes all tests)
- [ ] Check `/health/status` (no critical failures)
- [ ] Verify database connection (DB service shows ✅)
- [ ] Test frontend can reach backend (`/health` route works)
- [ ] Review degraded mode reasons (acceptable?)
- [ ] Check recent logs for errors (`data/health/health-history.jsonl`)
- [ ] Verify ports not in use (3001 backend, 3000 frontend)
- [ ] Test graceful shutdown (Ctrl+C, server cleans up)
- [ ] Optional: Generate diagnostics bundle for backup

**Quick Demo Check**:
```bash
# Backend health
curl http://localhost:3001/health/status | jq '.services'

# Frontend health
curl http://localhost:3000/health

# Run tests
cd backend && npm test
```

---

## Monitoring Integration

### Prometheus (Future)

Health endpoint is ready for Prometheus scraping:
```yaml
scrape_configs:
  - job_name: 'careconnect'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/health/status'
    scrape_interval: 30s
```

### Kubernetes

Example liveness/readiness probes:
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3001
  initialDelaySeconds: 10
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3001
  initialDelaySeconds: 5
  periodSeconds: 10
```

### Docker Compose

Already configured in `docker-compose.yml`:
```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:3001/health/live"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

## Best Practices

1. **Monitor Health History**: Regularly review `data/health/health-history.jsonl` for trends
2. **Set Admin Token**: Always configure `ADMIN_DIAGNOSTICS_TOKEN` in production
3. **Use Supervisors**: Run with PM2 or Docker restart policies for automatic recovery
4. **Check Before Deploy**: Run `npm run integrity:check` before deployments
5. **Test Degraded Mode**: Verify system works with optional services disabled
6. **Log Rotation**: Implement log rotation for `data/health/health-history.jsonl`
7. **Alert on Failures**: Set up alerts for `/health/ready` returning 503

---

## Troubleshooting Tools

### Generate Diagnostics Bundle
```bash
curl -H "x-admin-token: YOUR_TOKEN" \
  http://localhost:3001/admin/diagnostics > diagnostics.json
```

### View Live Health Status
```bash
watch -n 5 'curl -s http://localhost:3001/health/status | jq .'
```

### Analyze Health History
```bash
# Count snapshots
wc -l data/health/health-history.jsonl

# Last 5 statuses
tail -n 5 data/health/health-history.jsonl | jq '.ok'

# Find when degraded mode started
grep '"enabled":true' data/health/health-history.jsonl | head -1
```

---

## Support

For issues or questions:
1. Check `/health/status` for current system state
2. Generate diagnostics bundle with `/admin/diagnostics`
3. Review `data/health/health-history.jsonl` for patterns
4. Check server logs for error messages
5. Run `npm run integrity:check` to validate setup
