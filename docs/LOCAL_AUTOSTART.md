# CareConnect - Local Auto-Start Configuration

## Overview

This guide shows how to configure CareConnect services to start automatically when your Windows laptop boots. 

⚠️ **Critical Limitation**: Services will **ONLY** run when your laptop is:
- ✅ Powered on
- ✅ Connected to internet
- ✅ Not sleeping/hibernating

❌ **Will NOT work when**:
- Laptop is shut down
- Laptop is sleeping
- No internet connection
- Laptop is closed (unless "do nothing" on lid close)

---

## Prerequisites

1. Windows 10/11
2. Node.js installed (v18 or later)
3. Cloudflared installed at: `C:\Program Files (x86)\cloudflared\cloudflared.exe`
4. Admin access to your computer

---

## Part 1: Install Process Manager (PM2)

PM2 keeps Node.js applications running and restarts them on failure.

```powershell
# Install PM2 globally
npm install -g pm2
npm install -g pm2-windows-startup

# Configure PM2 to start on boot
pm2-startup install
```

---

## Part 2: Configure Backend Auto-Start

### Create PM2 Ecosystem File

Create `C:\Users\richl\Care2system\ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'careconnect-backend',
      cwd: 'C:\\Users\\richl\\Care2system\\backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: 'C:\\Users\\richl\\Care2system\\logs\\backend-error.log',
      out_file: 'C:\\Users\\richl\\Care2system\\logs\\backend-out.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'careconnect-frontend',
      cwd: 'C:\\Users\\richl\\Care2system\\frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: 'C:\\Users\\richl\\Care2system\\logs\\frontend-error.log',
      out_file: 'C:\\Users\\richl\\Care2system\\logs\\frontend-out.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
```

### Start and Save Services

```powershell
# Navigate to project root
cd C:\Users\richl\Care2system

# Create logs directory
New-Item -ItemType Directory -Force -Path ".\logs"

# Build frontend for production
cd frontend
npm run build
cd ..

# Build backend for production
cd backend
npm run build
cd ..

# Start services with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Verify services are running
pm2 status
```

Expected output:
```
┌─────┬──────────────────────────┬─────────┬─────────┬──────────┐
│ id  │ name                     │ status  │ restart │ uptime   │
├─────┼──────────────────────────┼─────────┼─────────┼──────────┤
│ 0   │ careconnect-backend      │ online  │ 0       │ 2m       │
│ 1   │ careconnect-frontend     │ online  │ 0       │ 2m       │
└─────┴──────────────────────────┴─────────┴─────────┴──────────┘
```

---

## Part 3: Configure Cloudflare Tunnel Auto-Start

### Option A: Windows Service (Recommended)

```powershell
# Run as Administrator
cd "C:\Program Files (x86)\cloudflared"

# Install as Windows service
.\cloudflared.exe service install

# Configure tunnel
# Ensure your config exists at: C:\Users\richl\.cloudflared\config.yml

# Start service
.\cloudflared.exe service start

# Verify service is running
Get-Service cloudflared
```

### Option B: Task Scheduler (Alternative)

Create `C:\Users\richl\Care2system\scripts\start-tunnel.ps1`:

```powershell
# Start Cloudflare Tunnel
$tunnelId = "07e7c160-451b-4d41-875c-a58f79700ae8"
$cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"

# Log file
$logFile = "C:\Users\richl\Care2system\logs\tunnel-$(Get-Date -Format 'yyyyMMdd').log"

# Start tunnel
Start-Process -FilePath $cloudflaredPath `
  -ArgumentList "tunnel", "run", $tunnelId `
  -WindowStyle Hidden `
  -RedirectStandardOutput $logFile `
  -RedirectStandardError $logFile

Write-Host "Cloudflare tunnel started. Logs: $logFile"
```

Create scheduled task:

```powershell
# Run as Administrator
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-ExecutionPolicy Bypass -File C:\Users\richl\Care2system\scripts\start-tunnel.ps1"

$trigger = New-ScheduledTaskTrigger -AtLogon

$principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName "CareConnect-Tunnel" `
  -Action $action `
  -Trigger $trigger `
  -Principal $principal `
  -Settings $settings `
  -Description "Start Cloudflare tunnel for CareConnect on login"
```

---

## Part 4: Unified Start Script

Create `C:\Users\richl\Care2system\start-complete-system.ps1`:

```powershell
# CareConnect Complete System Startup Script
# Starts backend, frontend, and Cloudflare tunnel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " CareConnect System Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# 1. Check prerequisites
Write-Host "[1/5] Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Node.js not found" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green

# Check PM2
$pm2Version = pm2 --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ PM2 not installed. Run: npm install -g pm2" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ PM2: v$pm2Version" -ForegroundColor Green

# Check cloudflared
$cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "  ✗ Cloudflared not found at: $cloudflaredPath" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Cloudflared: Found" -ForegroundColor Green

Write-Host ""

# 2. Stop existing services
Write-Host "[2/5] Stopping existing services..." -ForegroundColor Yellow
pm2 delete all 2>$null | Out-Null
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "  ✓ Cleaned up existing processes" -ForegroundColor Green
Write-Host ""

# 3. Start backend & frontend with PM2
Write-Host "[3/5] Starting backend & frontend..." -ForegroundColor Yellow
cd C:\Users\richl\Care2system
pm2 start ecosystem.config.js
Start-Sleep -Seconds 5

$pm2Status = pm2 status --no-color 2>$null
if ($pm2Status -match "online.*online") {
    Write-Host "  ✓ Services started successfully" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Some services may have issues. Check: pm2 logs" -ForegroundColor Yellow
}
Write-Host ""

# 4. Start Cloudflare tunnel
Write-Host "[4/5] Starting Cloudflare tunnel..." -ForegroundColor Yellow
$tunnelId = "07e7c160-451b-4d41-875c-a58f79700ae8"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\richl\Care2system; & '$cloudflaredPath' tunnel run $tunnelId" -WindowStyle Minimized
Start-Sleep -Seconds 3

$tunnelProcess = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($tunnelProcess) {
    Write-Host "  ✓ Tunnel started (PID: $($tunnelProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "  ✗ Tunnel failed to start" -ForegroundColor Red
}
Write-Host ""

# 5. Verify services
Write-Host "[5/5] Verifying services..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test backend
try {
    $backendTest = Invoke-WebRequest -Uri "http://localhost:3001/health/live" -UseBasicParsing -TimeoutSec 5
    if ($backendTest.StatusCode -eq 200) {
        Write-Host "  ✓ Backend (3001): Online" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Backend (3001): Offline" -ForegroundColor Red
}

# Test frontend
try {
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    if ($frontendTest.StatusCode -eq 200) {
        Write-Host "  ✓ Frontend (3000): Online" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Frontend (3000): Offline" -ForegroundColor Red
}

# Test public URL (after 10 seconds for tunnel to connect)
Write-Host "  ⏳ Waiting for tunnel connection..." -ForegroundColor Gray
Start-Sleep -Seconds 10

try {
    $publicTest = Invoke-WebRequest -Uri "https://care2connects.org" -UseBasicParsing -TimeoutSec 10
    if ($publicTest.StatusCode -eq 200) {
        Write-Host "  ✓ Public URL (care2connects.org): Online" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠ Public URL: Not accessible yet (may take 30s)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ✓ System Startup Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Gray
Write-Host "  pm2 status          - Check service status" -ForegroundColor Gray
Write-Host "  pm2 logs            - View service logs" -ForegroundColor Gray
Write-Host "  pm2 restart all     - Restart all services" -ForegroundColor Gray
Write-Host "  pm2 stop all        - Stop all services" -ForegroundColor Gray
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Gray
Write-Host "  Local:  http://localhost:3000" -ForegroundColor Gray
Write-Host "  Public: https://care2connects.org" -ForegroundColor Gray
Write-Host "  System: https://care2connects.org/system" -ForegroundColor Gray
Write-Host ""
```

Make it executable and create shortcut:

```powershell
# Create desktop shortcut
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$Home\Desktop\Start CareConnect.lnk")
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-ExecutionPolicy Bypass -File C:\Users\richl\Care2system\start-complete-system.ps1"
$Shortcut.WorkingDirectory = "C:\Users\richl\Care2system"
$Shortcut.IconLocation = "shell32.dll,16"
$Shortcut.Description = "Start CareConnect System"
$Shortcut.Save()

Write-Host "✓ Desktop shortcut created: Start CareConnect"
```

---

## Part 5: Verify Auto-Start

### Test Auto-Start

1. **Restart your computer**
2. **Wait 2-3 minutes** after login
3. **Check services**:
   ```powershell
   # Check PM2 services
   pm2 status

   # Check tunnel
   Get-Process cloudflared

   # Test local URLs
   curl http://localhost:3001/health/live
   curl http://localhost:3000

   # Test public URL
   curl https://care2connects.org
   ```

### Expected Results

```
✓ PM2 shows 2 apps online (backend, frontend)
✓ Cloudflared process running
✓ localhost:3001 returns {"status":"alive"}
✓ localhost:3000 loads homepage
✓ care2connects.org accessible (after 30-60s)
```

---

## Troubleshooting

### Services Don't Start on Boot

1. **Check PM2 startup script**:
   ```powershell
   pm2 startup
   # Follow instructions to reinstall
   ```

2. **Check Task Scheduler** (if using Option B):
   - Open Task Scheduler
   - Find "CareConnect-Tunnel"
   - Right-click → Run
   - Check "History" tab for errors

3. **Check Windows Event Viewer**:
   - Windows Logs → Application
   - Look for Node.js or PM2 errors

### Services Stop After Sleep/Hibernate

**Configure Power Settings**:

```powershell
# Prevent sleep when plugged in
powercfg /change monitor-timeout-ac 0
powercfg /change disk-timeout-ac 0
powercfg /change standby-timeout-ac 0

# Keep network active
powercfg /setacvalueindex SCHEME_CURRENT SUB_NONE CONNECTIVITYINSTANDBY 1
```

**OR** Create a scheduled task to restart services on resume:

```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-ExecutionPolicy Bypass -Command pm2 restart all"

$trigger = New-ScheduledTaskTrigger -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration ([TimeSpan]::MaxValue)
$trigger.StateChange = 8  # 8 = OnSessionUnlock

Register-ScheduledTask -TaskName "CareConnect-Resume" `
  -Action $action `
  -Trigger $trigger `
  -Description "Restart CareConnect services after sleep"
```

### Port Already in Use

```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill process (replace PID)
taskkill /PID [PID] /F

# Restart services
pm2 restart all
```

### Logs and Debugging

```powershell
# View all logs
pm2 logs

# View specific service
pm2 logs careconnect-backend

# View tunnel logs
Get-Content C:\Users\richl\Care2system\logs\tunnel-*.log -Tail 50

# Clear logs
pm2 flush
```

---

## Limitations Reminder

### ❌ This Setup Does NOT Provide

- 24/7 availability (only when laptop is on)
- Automatic recovery from network outages
- Protection from laptop crashes
- Public service reliability
- Professional hosting guarantees

### ✅ This Setup DOES Provide

- Automatic start on laptop boot
- Recovery from service crashes (PM2)
- Easy manual management
- Good for personal testing/demos
- Free (no hosting costs)

---

## Maintenance

### Update Services

```powershell
# Pull latest code
cd C:\Users\richl\Care2system
git pull

# Rebuild
cd backend
npm install
npm run build
cd ../frontend
npm install
npm run build

# Restart services
pm2 restart all

# Verify
pm2 status
```

### Backup Configuration

```powershell
# Backup PM2 config
pm2 save

# Backup tunnel config
Copy-Item -Path "$HOME\.cloudflared\*" -Destination "C:\Users\richl\Care2system\backups\cloudflared" -Recurse
```

---

## Alternative: Manual Start Script

If auto-start causes issues, use manual start:

Create `C:\Users\richl\Care2system\start-manual.ps1`:

```powershell
Write-Host "Starting CareConnect services..." -ForegroundColor Cyan

# Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\richl\Care2system\backend; npm start" -WindowStyle Minimized

# Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\richl\Care2system\frontend; npm start" -WindowStyle Minimized

# Tunnel
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\richl\Care2system; & 'C:\Program Files (x86)\cloudflared\cloudflared.exe' tunnel run 07e7c160-451b-4d41-875c-a58f79700ae8" -WindowStyle Minimized

Write-Host "✓ All services started in background windows" -ForegroundColor Green
```

---

## Next Steps

1. ✅ Install PM2 and configure auto-start
2. ✅ Test services start on boot
3. ✅ Configure power settings to prevent sleep
4. ✅ Create desktop shortcut for manual control
5. ✅ Monitor services for first week
6. 📋 Consider migrating to Always-On Cloud Hosting for production

**For true 24/7 availability**, see [ALWAYS_ON_DEPLOYMENT.md](./ALWAYS_ON_DEPLOYMENT.md)
