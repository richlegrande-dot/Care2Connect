# Quick Start Guide - "Start Server and Send Link"

## 🚀 Instant Testing Command

When you want to start the server and run comprehensive tests, just say:

**"start server and send link"**

This triggers a complete automated workflow that:
1. ✅ Starts all services (PM2)
2. ✅ Waits for initialization
3. ✅ Tests all endpoints
4. ✅ Checks network connectivity
5. ✅ Verifies tunnel status
6. ✅ Runs integration tests
7. ✅ Provides shareable link

## 📋 How to Use

### Method 1: VS Code Task (Recommended)
1. Press `Ctrl+Shift+P`
2. Type "Run Task"
3. Select **"Start Server and Send Link"**

### Method 2: Terminal Command
```powershell
.\scripts\start-server-and-test.ps1
```

### Method 3: Keyboard Shortcut
- Press `Ctrl+Shift+B` (runs default test task)

## 🧪 What Gets Tested

### Phase 1: Service Startup
- PM2 backend service
- PM2 frontend service
- Port availability (3000, 3003)

### Phase 2: Health Checks
- Backend liveness
- Frontend accessibility
- Service restart on failure

### Phase 3: Backend API Testing
- `/health/status` - Overall health
- `/health/live` - Liveness probe
- Critical services: Prisma, OpenAI, Stripe
- Optional services: Cloudflare, Tunnel, Speech

### Phase 4: Frontend Testing
- Homepage (/)
- Tell Your Story page
- Profiles page
- Health Dashboard

### Phase 5: Network & Tunnel
- DNS resolution
- Cloudflared process check
- External tunnel access (HTTPS)
- API tunnel access

### Phase 6: Cloudflare API
- API connectivity
- Zone information
- DNS records check
- Tunnel CNAME verification

### Phase 7: Integration
- Backend → Database
- Frontend → Backend
- End-to-end flow

## 📊 Test Results

The script provides:
- ✅ **PASS** - Test succeeded
- ❌ **FAIL** - Test failed (needs attention)
- ⚠️ **WARN** - Optional feature (non-critical)

### Success Criteria
- **100% FUNCTIONAL**: All tests pass, 0-3 warnings
- **DEGRADED**: Core working, ≤2 failures
- **UNHEALTHY**: >2 failures, needs troubleshooting

## 🔗 Output

At the end, you get:
- Test summary (passed/failed/warnings)
- Pass rate percentage
- Overall health status
- **Shareable link**: https://care2connects.org/tell-your-story

## 🛠️ Troubleshooting

If tests fail:

### Backend Issues
```powershell
pm2 restart care2connect-backend-dev
pm2 logs care2connect-backend-dev
```

### Frontend Issues
```powershell
pm2 restart care2connect-frontend-dev
pm2 logs care2connect-frontend-dev
```

### Port Conflicts
```powershell
Get-NetTCPConnection -LocalPort 3000,3003 -State Listen
# Stop conflicting processes if needed
```

### Full Reset
```powershell
pm2 delete all
pm2 start ecosystem.dev.config.js
.\scripts\start-server-and-test.ps1
```

## ⚙️ Configuration

Script location: `scripts/start-server-and-test.ps1`

Skip startup phase:
```powershell
.\scripts\start-server-and-test.ps1 -SkipStartup
```

## 🎯 Expected Results

**Typical Healthy Output:**
```
Total Tests:    25-30
Passed:         20-25
Failed:         0
Warnings:       2-5
Pass Rate:      85-100%
STATUS:         HEALTHY - 100% FUNCTIONAL
```

**Common Warnings (Non-Critical):**
- Cloudflare API (HTTP 400) - API token scope issue
- External Tunnel Access - DNS propagation delay
- DNS Records - Not fully propagated yet

These warnings are normal for development and don't affect local functionality.

## 📝 Notes

- First run may take 10-15 seconds for services to start
- Subsequent runs are faster (~5 seconds)
- Tests run automatically, no user interaction needed
- Results are color-coded for easy reading
- Script exits with code 0 (success), 1 (degraded), or 2 (unhealthy)

## 🔄 Automation

The comprehensive test also runs:
- **On workspace open** - Basic health check only
- **On demand** - Full testing via command
- **Before deployment** - CI/CD integration ready

---

**Quick Command:** Just type "start server and send link" or use `Ctrl+Shift+B`

**Support:** Check logs with `pm2 logs` or health status at http://localhost:3003/health/status
