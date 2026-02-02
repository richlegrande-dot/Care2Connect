# Phase 6M Hardening - Quick Reference

## 🚀 Quick Start

### Start All Hardened Components

```powershell
# 1. Backend (hardened Prisma automatically loaded)
cd C:\Users\richl\Care2system\backend
npm run dev

# 2. Tunnel Monitor (separate window)
Start-Process powershell -ArgumentList "-NoExit -Command .\scripts\tunnel-monitor.ps1" -WindowStyle Minimized

# 3. System Monitor (separate window)
.\scripts\hardened-monitor.ps1
```

---

## 🔍 Health Checks

### Quick Status Check
```bash
curl http://localhost:3001/health/status
```

### Check Prisma Health
```bash
curl http://localhost:3001/health/status | jq '.services.prisma'
```

### Check Recovery Stats
```bash
curl http://localhost:3001/health/recovery-stats
```

---

## 🛠️ Manual Recovery

### Trigger Recovery (requires admin password)
```bash
curl -X POST http://localhost:3001/health/recover \
  -H "x-admin-password: admin2024"
```

### PowerShell Version
```powershell
$h = @{'x-admin-password'='admin2024'}
Invoke-RestMethod 'http://localhost:3001/health/recover' -Method POST -Headers $h
```

---

## 📊 What's Hardened

### 1. Prisma Database ✅
- **File**: `backend/src/lib/prisma.ts`
- **Features**:
  - 3 retry attempts on failure
  - 30-second query timeout
  - Circuit breaker after 5 failures
  - Slow query logging (>5s)
  - Automatic reconnection

### 2. Cloudflare Tunnel ✅
- **File**: `scripts/tunnel-monitor.ps1`
- **Features**:
  - Process monitoring every 30s
  - Auto-restart on failure
  - Max 5 restarts/hour
  - Connectivity testing
  - Detailed logging

### 3. Server Health ✅
- **File**: `backend/src/ops/autoRecoveryService.ts`
- **Features**:
  - Service health detection
  - Automatic recovery
  - Recovery history tracking
  - Success rate statistics

### 4. System Monitor ✅
- **File**: `scripts/hardened-monitor.ps1`
- **Features**:
  - All-component monitoring
  - Auto-recovery triggers
  - Rate limiting (5 min cooldown)
  - Comprehensive logging

---

## 🔧 Configuration

### Prisma Retry Settings
```typescript
// backend/src/lib/prisma.ts
maxRetries: 3
retryDelay: 1000ms (exponential backoff)
queryTimeout: 30000ms
circuitBreakerThreshold: 5
```

### Tunnel Monitor Settings
```powershell
# scripts/tunnel-monitor.ps1
$CheckInterval = 30      # seconds
$MaxRestarts = 5         # per hour
```

### System Monitor Settings
```powershell
# scripts/hardened-monitor.ps1
$Interval = 60          # seconds
RecoveryCooldown = 5    # minutes
```

---

## 📝 Log Files

- **System Monitor**: `logs/system-monitor.log`
- **Tunnel Monitor**: `logs/tunnel-monitor.log`

View logs:
```powershell
Get-Content logs\system-monitor.log -Tail 50 -Wait
Get-Content logs\tunnel-monitor.log -Tail 50 -Wait
```

---

## ⚡ Common Commands

### Check Backend Status
```powershell
Invoke-RestMethod 'http://localhost:3001/health/live'
```

### Check All Services
```powershell
$health = Invoke-RestMethod 'http://localhost:3001/health/status'
$health.services | ConvertTo-Json
```

### Check Tunnel Process
```powershell
Get-Process cloudflared -ErrorAction SilentlyContinue
```

### Restart Backend
```powershell
Get-Process node | Where-Object { $_.Path -like '*backend*' } | Stop-Process -Force
cd backend; npm run dev
```

### Test Production Site
```powershell
Invoke-WebRequest 'https://care2connects.org' -UseBasicParsing
```

---

## 🚨 Troubleshooting

### Prisma Retry Not Working
```powershell
# Check backend logs for retry messages
# Look for: "[Prisma] Retry 1/3: P1001"
```

### Circuit Breaker Triggered
```powershell
# Check consecutive failures
$stats = Invoke-RestMethod 'http://localhost:3001/health/recovery-stats'
$stats.stats.consecutiveFailures

# Trigger recovery
Invoke-RestMethod 'http://localhost:3001/health/recover' -Method POST -Headers @{'x-admin-password'='admin2024'}
```

### Tunnel Not Restarting
```powershell
# Check tunnel monitor is running
Get-Process powershell | Where-Object { $_.MainWindowTitle -like '*tunnel-monitor*' }

# Check logs
Get-Content logs\tunnel-monitor.log -Tail 20

# Manual restart
Get-Process cloudflared | Stop-Process -Force
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel run care2connects
```

### Auto-Recovery Cooldown
```powershell
# Recovery attempts are rate-limited to once per 5 minutes
# Wait for cooldown or manually trigger
```

---

## ✅ Verification Tests

### Test 1: Prisma Hardening
```powershell
$h = @{'x-admin-password'='admin2024'}
$test = @{title='Test';description='Test';sourceType='NOTE'} | ConvertTo-Json
$created = Invoke-RestMethod 'http://localhost:3001/admin/knowledge/sources' -Method POST -Headers (@{} + $h + @{'Content-Type'='application/json'}) -Body $test
Invoke-RestMethod "http://localhost:3001/admin/knowledge/sources/$($created.id)" -Method DELETE -Headers $h
```
✅ Should create and delete without errors

### Test 2: Auto-Recovery
```powershell
$h = @{'x-admin-password'='admin2024'}
$result = Invoke-RestMethod 'http://localhost:3001/health/recover' -Method POST -Headers $h
$result.message
```
✅ Should return "All services healthy - no recovery needed"

### Test 3: Health Status
```powershell
$health = Invoke-RestMethod 'http://localhost:3001/health/status'
$health.status
```
✅ Should return "healthy"

### Test 4: Tunnel Connectivity
```powershell
$response = Invoke-WebRequest 'https://care2connects.org' -UseBasicParsing
$response.StatusCode
```
✅ Should return 200

---

## 📚 Documentation

- **Full Guide**: `PHASE_6M_HARDENING_COMPLETE.md`
- **Code Files**:
  - Prisma: `backend/src/lib/prisma.ts`
  - Auto-Recovery: `backend/src/ops/autoRecoveryService.ts`
  - Health Routes: `backend/src/routes/health.ts`
  - Tunnel Monitor: `scripts/tunnel-monitor.ps1`
  - System Monitor: `scripts/hardened-monitor.ps1`

---

## 🎯 Production Checklist

- [x] Prisma hardening deployed
- [x] Auto-recovery service active
- [x] Health endpoints tested
- [x] Tunnel monitor created
- [x] System monitor created
- [ ] Start tunnel monitor on boot (optional)
- [ ] Start system monitor on boot (optional)
- [ ] Set up log rotation (optional)
- [ ] Configure email alerts (optional)

---

**Status**: ✅ PRODUCTION READY  
**Last Updated**: December 18, 2025  
**Note**: Markdown linting warnings present but do not affect functionality
