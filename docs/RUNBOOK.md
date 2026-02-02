# CareConnect Server Runbook

## Quick Reference

**Backend Health**: http://localhost:3001/health/status  
**Frontend Health**: http://localhost:3000/health  
**Admin Diagnostics**: http://localhost:3001/admin/diagnostics (requires token)

---

## Emergency Response

### 🚨 Backend Won't Start

#### Symptom: Server crashes immediately on startup

**Step 1**: Check error message in terminal

**Common Errors**:

| Error Message | Solution |
|--------------|----------|
| "Missing required environment variable: DATABASE_URL" | Edit `backend/.env` and add `DATABASE_URL` |
| "Cannot find module '@prisma/client'" | Run `cd backend && npm install` |
| "Port 3001 already in use" | Kill existing process or use different port |
| "Cannot connect to database" | Check PostgreSQL is running and connection string is correct |

**Step 2**: Run integrity check
```bash
cd backend
npm run integrity:check
```

**Step 3**: Check environment file
```bash
cat backend/.env
# Verify DATABASE_URL exists
```

**Step 4**: Start in verbose mode
```bash
cd backend
npm run dev
# Watch for specific error messages
```

---

### 🚨 Frontend Won't Start

#### Symptom: "npm run dev" fails or hangs

**Step 1**: Check port availability
```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
# If occupied, kill process or use different port
```

**Step 2**: Clear Next.js cache
```bash
cd frontend
rm -rf .next
npm run dev
```

**Step 3**: Reinstall dependencies
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Step 4**: Check backend connectivity
```bash
curl http://localhost:3001/health/live
# Should return {"status":"alive"}
```

---

### 🚨 "Connection Refused" Error

#### Symptom: Browser shows "localhost refused to connect"

**Diagnosis**:
1. Server not running
2. Wrong port
3. Firewall blocking connection

**Fix**:
```bash
# Check if backend is running
curl http://localhost:3001/health/live

# Check if frontend is running
curl http://localhost:3000/health

# If either fails, start the server
cd backend && npm run dev  # Terminal 1
cd frontend && npm run dev  # Terminal 2
```

---

### 🚨 Database Connection Failed

#### Symptom: "Database connection failed" in health status

**Step 1**: Verify PostgreSQL is running
```bash
# Check service status (Windows)
Get-Service postgresql*

# Or check if port 5432 is listening
Get-NetTCPConnection -LocalPort 5432
```

**Step 2**: Test connection string
```bash
cd backend
npx prisma db pull
# If fails, DATABASE_URL is incorrect
```

**Step 3**: Check credentials
- Verify username/password in `.env`
- Ensure database exists
- Check user has permissions

**Step 4**: Trigger reconnection
The server will attempt automatic reconnection. Monitor logs:
```
⚠️  Database connection lost, attempting recovery...
🔄 Attempting database reconnection (1/5)...
```

If all attempts fail, restart the server after fixing the issue.

---

### 🚨 TypeScript Compilation Errors

#### Symptom: Red errors on startup, server won't start

**Quick Fix** (development only):
```bash
cd backend
$env:TS_NODE_TRANSPILE_ONLY='true'
npx nodemon --exec 'ts-node --transpile-only' src/server.ts
```

**Proper Fix**:
```bash
# Find and fix type errors
npm run typecheck

# Common errors:
# - Parameter order mismatch
# - Missing type imports
# - Incorrect return types
```

**After fixing**:
```bash
npm run dev
# Should start without transpile-only flag
```

---

### 🚨 Degraded Mode Active

#### Symptom: Health status shows degraded mode enabled

**Check what's degraded**:
```bash
curl http://localhost:3001/health/status | grep -A5 degraded
```

**Common Degraded Reasons**:

| Reason | Impact | Action Required? |
|--------|--------|------------------|
| `EVTS_MODEL_MISSING` | No server-side transcription | ⚠️ Optional: Install model |
| `STRIPE_KEYS_MISSING` | No card payments | ⚠️ Optional: Add Stripe keys |
| `SMTP_NOT_CONFIGURED` | No email notifications | ⚠️ Optional: Configure SMTP |
| `TYPESCRIPT_TRANSPILE_ONLY` | Type errors masked | ⚠️ Fix type errors |

**Decision Tree**:
- **Demo/Testing**: Degraded mode is acceptable
- **Production**: Should fix all degraded reasons

---

## Common Tasks

### Start Development Servers

```bash
# Terminal 1: Backend
cd C:\Users\richl\Care2system\backend
$env:OPENAI_API_KEY='your-key-here'
npm run dev

# Terminal 2: Frontend
cd C:\Users\richl\Care2system\frontend
npm run dev
```

**Expected Output**:
```
Backend:
✨ Server ready for requests
🚀 CareConnect Backend Server
📊 Port: 3001

Frontend:
✓ Ready in 2.4s
- Local: http://localhost:3000
```

---

### Stop Servers

**Graceful Shutdown**:
```
Ctrl+C in each terminal
```

**Force Kill**:
```powershell
# Backend (port 3001)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess

# Frontend (port 3000)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
```

---

### Restart Backend Only

```bash
# In backend terminal, press Ctrl+C then:
npm run dev

# Or if hung, force kill and restart
```

---

### Check Health Status

**Quick Check**:
```bash
curl http://localhost:3001/health/live
# Should return 200 {"status":"alive"}
```

**Full Status**:
```bash
curl http://localhost:3001/health/status | jq '.'
# Shows all services and degraded reasons
```

**From Browser**:
- Visit: http://localhost:3001/health/status
- Frontend dev panel (bottom-right corner)

---

### Generate Diagnostics Bundle

**Prerequisites**: Set `ADMIN_DIAGNOSTICS_TOKEN` in `.env`

```bash
# Generate diagnostics
curl -H "x-admin-token: YOUR_TOKEN" \
  http://localhost:3001/admin/diagnostics > diagnostics.json

# Or download via browser
# http://localhost:3001/admin/diagnostics
# (Add x-admin-token header)
```

**What's Included**:
- Current health status
- Server information (PID, uptime, memory, CPU)
- Environment config (secrets redacted)
- Missing resources list
- Recent log entries
- Version information

---

### Run Tests

```bash
cd backend
npm test

# Specific test file
npm test health.test.ts

# Watch mode
npm run test:watch
```

**Expected**: All tests should pass. If not, see test output for details.

---

### Run Integrity Check

```bash
cd backend
npm run integrity:check
```

**Checks**:
1. TypeScript compilation
2. All tests pass
3. No type errors

**Use Before**:
- Git commits
- Deployments
- Demos
- Pull requests

---

### View Health History

**API**:
```bash
curl http://localhost:3001/health/history?limit=10 | jq '.snapshots'
```

**Disk Log**:
```bash
# Last 10 entries
tail -n 10 backend/data/health/health-history.jsonl

# Format with jq
tail -n 5 backend/data/health/health-history.jsonl | jq '.'
```

**Analysis**:
```bash
# Count total checks
wc -l backend/data/health/health-history.jsonl

# Find failures
grep '"ok":false' backend/data/health/health-history.jsonl

# Count degraded occurrences
grep -c '"enabled":true' backend/data/health/health-history.jsonl
```

---

### Change Port

**Backend**:
```bash
cd backend
$env:PORT=3002
npm run dev
```

**Frontend**:
```bash
cd frontend
npx next dev -p 3003
```

**Update Environment**:
```bash
# frontend/.env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:3002
```

---

### Add Missing Environment Variable

**Step 1**: Open `.env` file
```bash
code backend/.env
```

**Step 2**: Add variable
```env
NEW_VARIABLE=value
```

**Step 3**: Restart server
```bash
# Ctrl+C, then:
npm run dev
```

**Verification**:
```bash
curl http://localhost:3001/health/status | grep NEW_VARIABLE
```

---

## Demo Recovery Procedures

### Before Demo: Pre-flight Check

```bash
# 1. Check backend health
curl http://localhost:3001/health/status | jq '.ok, .degraded'

# 2. Check frontend health
curl http://localhost:3000/health | jq '.status'

# 3. Run tests
cd backend && npm test

# 4. Verify ports not in use
Get-NetTCPConnection -LocalPort 3000,3001
```

**All Green?** ✅ Ready for demo  
**Issues Found?** ⚠️ Fix before proceeding

---

### During Demo: Quick Recovery

#### Scenario 1: Backend Crashes

```bash
# Terminal 1: Restart backend immediately
cd backend
npm run dev

# Takes ~10 seconds to restart
# Frontend will automatically reconnect
```

#### Scenario 2: Frontend Crashes

```bash
# Terminal 2: Restart frontend immediately
cd frontend
npm run dev

# Takes ~5 seconds to restart
```

#### Scenario 3: Database Connection Lost

**Check health status**:
```bash
curl http://localhost:3001/health/status | jq '.services.db'
```

**If reconnection fails**:
1. Check PostgreSQL is running
2. Restart backend (automatic reconnection will retry)

---

### After Demo: Post-mortem

**Review health history**:
```bash
tail -n 50 backend/data/health/health-history.jsonl | jq '.'
```

**Check for failures**:
```bash
grep '"ok":false' backend/data/health/health-history.jsonl
```

**Generate diagnostics**:
```bash
curl -H "x-admin-token: YOUR_TOKEN" \
  http://localhost:3001/admin/diagnostics > post-demo-diagnostics.json
```

---

## Production Deployment

### Using PM2 (Recommended)

**Install PM2**:
```bash
npm install -g pm2
```

**Start Backend**:
```bash
cd backend
pm2 start ecosystem.config.js
```

**Monitor**:
```bash
pm2 logs careconnect-backend
pm2 monit
```

**Restart**:
```bash
pm2 restart careconnect-backend
```

**Stop**:
```bash
pm2 stop careconnect-backend
pm2 delete careconnect-backend
```

---

### Using Docker

**Build & Run**:
```bash
docker-compose up -d
```

**View Logs**:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Restart**:
```bash
docker-compose restart backend
```

**Stop**:
```bash
docker-compose down
```

**Health Check**:
```bash
docker-compose ps
# Should show "healthy" status
```

---

## Monitoring

### Real-time Health Dashboard

```bash
# Watch health status (updates every 5 seconds)
watch -n 5 'curl -s http://localhost:3001/health/status | jq ".services, .degraded"'
```

### Alert on Failures

```bash
# Simple shell script for alerting
while true; do
  STATUS=$(curl -s http://localhost:3001/health/ready | jq -r '.status')
  if [ "$STATUS" != "ready" ]; then
    echo "ALERT: Server not ready! Status: $STATUS"
    # Add notification logic here
  fi
  sleep 30
done
```

---

## Troubleshooting Decision Tree

```
Server won't start?
├─ Error message contains "port"?
│  └─ Yes → Kill process on that port → Retry
│  └─ No → Continue
├─ Error message contains "environment"?
│  └─ Yes → Check .env file → Add missing vars → Retry
│  └─ No → Continue
├─ Error message contains "module"?
│  └─ Yes → Run npm install → Retry
│  └─ No → Continue
└─ Unknown error?
   └─ Run npm run integrity:check → Review output

Server starts but health check fails?
├─ Database failure?
│  └─ Check PostgreSQL running → Verify connection string
├─ Storage failure?
│  └─ Check disk space → Verify permissions
└─ Other service failure?
   └─ Check health/status → Review degraded reasons

Frontend can't reach backend?
├─ Check backend is running (curl http://localhost:3001/health/live)
├─ Check CORS settings in backend/src/server.ts
└─ Verify NEXT_PUBLIC_BACKEND_URL in frontend/.env.local
```

---

## Contact & Support

**Self-Service**:
1. Check health status: `/health/status`
2. Generate diagnostics: `/admin/diagnostics`
3. Review this runbook

**Documentation**:
- [SERVER_INTEGRITY.md](./SERVER_INTEGRITY.md) - Detailed health system docs
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development setup

**Logging**:
- Health history: `backend/data/health/health-history.jsonl`
- Server logs: Check terminal output or PM2 logs
- Error logs: `backend/logs/` (if configured)
