# Ops Hardening Quick Reference

## 🚀 Demo Day Checklist

```bash
# 1. Enable demo safe mode
set DEMO_SAFE_MODE=true

# 2. Start server (will auto-select port if needed)
npm start

# 3. Check demo status
curl http://localhost:3001/demo/status

# 4. Verify health
curl http://localhost:3001/health/status
```

---

## 🔥 Emergency Commands

### Port Conflict (< 30 seconds)
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or enable auto port selection
set DEMO_SAFE_MODE=true
npm start
```

### Health Check Failed
```bash
# Get diagnostics
curl http://localhost:3001/admin/diagnostics?token=<TOKEN>&format=json

# Check most likely causes
curl http://localhost:3001/admin/diagnostics?token=<TOKEN>&format=json | grep mostLikelyCauses
```

### Database Connection Lost
```bash
# Server will auto-reconnect (5 attempts)
# Check logs:
tail -f data/health/health-history.jsonl

# Manual restart:
npm start
```

---

## 📊 Monitoring Endpoints

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `/health/status` | Full health check | `curl http://localhost:3001/health/status` |
| `/health/ready` | Readiness probe | `curl http://localhost:3001/health/ready` |
| `/demo/status` | Demo readiness | `curl http://localhost:3001/demo/status` |
| `/metrics?token=X` | Prometheus metrics | `curl http://localhost:3001/metrics?token=<TOKEN>` |
| `/admin/diagnostics?token=X` | Full diagnostics | `curl http://localhost:3001/admin/diagnostics?token=<TOKEN>` |

---

## ⚙️ Configuration Cheatsheet

### Enable Alerting (Email)
```env
ALERT_MODE=email
OPS_ALERT_EMAIL_TO=ops@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ALERT_FAILURE_THRESHOLD=3
ALERT_COOLDOWN_MINUTES=15
```

### Enable Alerting (Webhook)
```env
ALERT_MODE=webhook
OPS_ALERT_WEBHOOK_URL=https://n8n.example.com/webhook/ops-alert
ALERT_FAILURE_THRESHOLD=3
ALERT_COOLDOWN_MINUTES=15
```

### Enable Metrics
```env
METRICS_ENABLED=true
METRICS_TOKEN=your-random-secret-token
```

### Enable Demo Safe Mode
```env
DEMO_SAFE_MODE=true
```

---

## 🛠️ Production Deployment

```bash
# 1. Typecheck (find errors)
npm run typecheck

# 2. Run tests
npm test

# 3. Build compiled version
npm run build

# 4. Start production server
npm run start:prod
```

**CRITICAL:** Never use `--transpile-only` in production. Server will refuse to start.

---

## 🩺 Diagnostics Interpretation

### Health Status
- **ready** ✅ - All systems operational
- **degraded** ⚠️ - Optional services down (Stripe, SMTP, etc.)
- **unhealthy** ❌ - Critical service down (DB or storage)

### Most Likely Causes
Check `/admin/diagnostics` → `mostLikelyCauses` array for AI-analyzed suggestions:
- Database connection failed → Check DATABASE_URL
- Port already in use → Enable DEMO_SAFE_MODE
- TypeScript compilation errors → npm run typecheck
- Storage connection failed → Check Supabase credentials

### Recent Errors
Check `/admin/diagnostics` → `recentErrors` array for last 50 errors with stack traces.

---

## 📈 Metrics (Prometheus Format)

```bash
# Get metrics
curl http://localhost:3001/metrics?token=<TOKEN>

# Get JSON format
curl http://localhost:3001/metrics?token=<TOKEN>&format=json
```

**Available Metrics:**
- `care2system_uptime_seconds` - Server uptime
- `care2system_health_ready_ok` - 1 = healthy, 0 = down
- `care2system_health_degraded` - 1 = degraded, 0 = ready/unhealthy
- `care2system_db_reconnect_attempts` - DB reconnection attempts
- `care2system_memory_usage_bytes` - Memory usage
- `care2system_request_count_total{route="..."}` - Request counts

---

## 🔔 Alert Triggers

Alerts fire when:
1. **Health Check Failed** - 3 consecutive failures (configurable)
2. **DB Reconnect Exceeded** - Self-healing exhausted retries
3. **Disk Write Failure** - Receipts/logs can't be written
4. **Transpile-Only in Production** - Type errors masked

**Cooldown:** 15 minutes between duplicate alerts (configurable)

---

## 🎯 Demo Safe Mode Features

When `DEMO_SAFE_MODE=true`:
- ✅ Auto port selection (3001-3010)
- ✅ Beautiful startup banner with URLs
- ✅ Service status display (Stripe, SMTP, etc.)
- ✅ `/demo/status` endpoint for validation
- ✅ Warnings for disabled services

---

## 🚨 Common Issues

### "Port 3001 in use"
```bash
set DEMO_SAFE_MODE=true
npm start
```

### "Database connection failed"
```bash
# Check DATABASE_URL in .env
# Verify Supabase dashboard is up
# Server will auto-reconnect (up to 5 attempts)
```

### "TypeScript errors in production"
```bash
npm run typecheck  # Find errors
# Fix errors
npm run build      # Compile
npm run start:prod # Start
```

### "Metrics not showing"
```env
METRICS_ENABLED=true
METRICS_TOKEN=your-token-here
```

---

## 📞 Support Workflow

1. **Check health:** `GET /health/status`
2. **Get diagnostics:** `GET /admin/diagnostics?token=X`
3. **Review "Most Likely Causes"** in diagnostics response
4. **Check error buffer:** `recentErrors` array in diagnostics
5. **Review recovery playbook:** See `backend/RUNBOOK.md`
6. **Send alert (if configured):** Email/webhook sent automatically

---

## 📚 Documentation

- **Full Playbooks:** `backend/RUNBOOK.md`
- **Implementation Summary:** `OPS_HARDENING_SUMMARY.md`
- **Test Coverage:** 51 tests in `backend/tests/monitoring/`
- **Environment Variables:** `backend/.env`

---

**Version:** 1.6.0  
**Last Updated:** January 2024
