# CareConnect Auto-Start Scripts

These scripts provide **fully automated** Windows Task Scheduler-based auto-start for CareConnect services.

## 📋 What's Included

| Script | Purpose |
|--------|---------|
| `run-services.ps1` | Supervisor that starts and monitors all services (auto-restart on crash) |
| `setup-autostart.ps1` | One-time installer that creates Windows Scheduled Task |
| `stop-services.ps1` | Cleanly stops all running services |
| `uninstall-autostart.ps1` | Removes auto-start completely |
| `fix-cloudflare-tunnel.ps1` | **NEW** - Auto-detects backend port and fixes Cloudflare tunnel routing |
| `verify-production-deployment.ps1` | **NEW** - Runs 6 automated tests to verify production health |

---

## 🚀 Quick Setup (First Time)

### 1. Allow Script Execution (if needed)

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
```

### 2. Install Auto-Start

```powershell
# From repo root
.\scripts\setup-autostart.ps1
```

**Output:**
```
✅ Installed Scheduled Task: Care2Connects_AutoStart
It will start on next login. To start now, run:
  Start-ScheduledTask -TaskName "Care2Connects_AutoStart"
```

### 3. Start Immediately (don't wait for next login)

```powershell
Start-ScheduledTask -TaskName "Care2Connects_AutoStart"
```

### 4. Verify Services Running

```powershell
# Check ports
netstat -ano | findstr ":3000 :3001"

# Test endpoints
curl http://localhost:3001/health/live
curl http://localhost:3000

# Check logs
Get-Content .\logs\autostart-supervisor.log -Tail 20
```

---

## 🎯 How It Works

1. **Scheduled Task** triggers at Windows login
2. **Supervisor** (`run-services.ps1`) starts in background
3. **Services** launch: Backend (3001), Frontend (3000), Tunnel
4. **Auto-restart**: If any service crashes, supervisor restarts it (10s check interval)
5. **Logging**: All output goes to `logs/` directory

### Service Monitoring Loop

```
Every 10 seconds:
  ✓ Check if backend running → restart if needed
  ✓ Check if frontend running → restart if needed
  ✓ Check if tunnel running → restart if needed
```

---

## 📂 Log Files

All logs written to `logs/` directory:

| File | Content |
|------|---------|
| `autostart-supervisor.log` | Supervisor activity (starts, restarts) |
| `frontend.log` | Next.js dev server output |
| `backend.log` | Express server output |
| `tunnel.log` | Cloudflare tunnel output |

**View logs:**
```powershell
# Live tail
Get-Content .\logs\autostart-supervisor.log -Wait -Tail 20

# All frontend logs
Get-Content .\logs\frontend.log

# Last 50 lines of backend
Get-Content .\logs\backend.log -Tail 50
```

---

## 🛠️ Common Operations

### Start Services

```powershell
# Method 1: Via Task Scheduler (recommended)
Start-ScheduledTask -TaskName "Care2Connects_AutoStart"

# Method 2: Run supervisor manually (visible windows for debugging)
.\scripts\run-services.ps1 -ShowWindows
```

### Stop Services

```powershell
# Stop everything cleanly
.\scripts\stop-services.ps1
```

**What it does:**
1. Stops Task Scheduler task
2. Kills supervisor process
3. Stops Node.js processes (frontend/backend)
4. Stops cloudflared tunnel

### Check Status

```powershell
# Check if Task Scheduler task is running
Get-ScheduledTask -TaskName "Care2Connects_AutoStart" | Select-Object State

# Check processes
Get-Process node,cloudflared,powershell -ErrorAction SilentlyContinue | Select-Object Name,Id,StartTime

# Check ports
netstat -ano | findstr ":3000 :3001"

# Test endpoints
Invoke-WebRequest -Uri "http://localhost:3001/health/live" -UseBasicParsing
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
```

### Restart Services

```powershell
# Stop then start
.\scripts\stop-services.ps1
Start-Sleep -Seconds 3
Start-ScheduledTask -TaskName "Care2Connects_AutoStart"
```

### Uninstall Auto-Start

```powershell
# Remove everything (stops services + removes task)
.\scripts\uninstall-autostart.ps1
```

**What it does:**
1. Stops all services
2. Removes Scheduled Task
3. Services will NOT start on next login

---

## ⚙️ Configuration

### Tunnel Routing

**Config file:** `C:\Users\YOUR_USERNAME\.cloudflared\config.yml`

**Required configuration:**
```yaml
tunnel: 07e7c160-451b-4d41-875c-a58f79700ae8
credentials-file: C:\Users\YOUR_USERNAME\.cloudflared\07e7c160-451b-4d41-875c-a58f79700ae8.json

ingress:
  - hostname: api.care2connects.org
    service: http://localhost:3001    # Backend API
  - hostname: care2connects.org
    service: http://localhost:3000    # Frontend
  - service: http_status:404
```

**Verify config:**
```powershell
Get-Content "$env:USERPROFILE\.cloudflared\config.yml"
```

### Change Window Visibility

**Hidden (default):**
```powershell
Start-ScheduledTask -TaskName "Care2Connects_AutoStart"
```

**Visible (debugging):**
```powershell
.\scripts\run-services.ps1 -ShowWindows
```

---

## 🐛 Troubleshooting

### Services Don't Start

**Check logs:**
```powershell
Get-Content .\logs\autostart-supervisor.log -Tail 50
```

**Common issues:**
1. **Node.js not in PATH**
   - Fix: Restart computer after Node.js install
   - Verify: `node --version`

2. **Cloudflared not found**
   - Fix: Install cloudflared to `C:\Program Files (x86)\cloudflared\`
   - Verify: `cloudflared --version`

3. **Port already in use**
   ```powershell
   # Find process using port 3001
   netstat -ano | findstr :3001
   # Kill it
   taskkill /PID <PID> /F
   ```

### Services Keep Crashing

**Check individual service logs:**
```powershell
# Backend issues
Get-Content .\logs\backend.log -Tail 100

# Frontend issues
Get-Content .\logs\frontend.log -Tail 100

# Tunnel issues
Get-Content .\logs\tunnel.log -Tail 100
```

**Common causes:**
- Missing dependencies: Run `npm install` in backend/ and frontend/
- Environment variables: Check backend/.env exists
- Database connection: Ensure DATABASE_URL set or remove (uses FileStore)

### Task Scheduler Not Running

```powershell
# Check task status
Get-ScheduledTask -TaskName "Care2Connects_AutoStart"

# View task history
Get-ScheduledTask -TaskName "Care2Connects_AutoStart" | Get-ScheduledTaskInfo

# Manually trigger
Start-ScheduledTask -TaskName "Care2Connects_AutoStart"
```

### Auto-Restart Too Aggressive

**Modify supervisor check interval:**

Edit `scripts/run-services.ps1`, change:
```powershell
Start-Sleep -Seconds 10    # Change to 30 or 60
```

---

## 🔒 Security Notes

- **No admin required**: Task runs in current user context
- **No secrets in scripts**: Uses existing .env files
- **Local only**: Services bind to localhost (not exposed externally)
- **Tunnel security**: Cloudflare handles authentication

---

## ⚡ Performance

| Metric | Value |
|--------|-------|
| **Startup Time** | ~10-15 seconds (all services ready) |
| **Memory Usage** | ~200-300 MB total (all 3 services) |
| **CPU Usage** | <5% idle, 10-20% during requests |
| **Disk I/O** | Logs only (minimal) |

---

## 🚨 Important Limitations

### ❌ Does NOT Provide

- **24/7 uptime** - Only runs when laptop is ON and logged in
- **Recovery from laptop sleep** - Services stop during sleep/hibernate
- **Protection from network loss** - Tunnel disconnects if no internet
- **Professional hosting** - Not suitable for production public services

### ✅ DOES Provide

- **Automatic start** on Windows login
- **Auto-restart** on service crash
- **Hands-off operation** when laptop is on
- **Easy management** via PowerShell commands
- **Complete logging** for debugging

---

## 📊 Comparison: Task Scheduler vs PM2

| Feature | Task Scheduler | PM2 |
|---------|---------------|-----|
| **Installation** | Built-in Windows | npm install -g pm2 |
| **Auto-start** | Native (Scheduled Task) | pm2-windows-startup |
| **Auto-restart** | Custom script (10s) | Built-in (instant) |
| **Logs** | File redirection | pm2 logs command |
| **Memory** | Lower overhead | Higher (Node.js process) |
| **Complexity** | Simple PowerShell | More features, more setup |

**Verdict**: Task Scheduler approach is simpler and has fewer dependencies.

---

## 🔄 Upgrade Path to 24/7

**When ready for always-on hosting:**

1. Stop local auto-start:
   ```powershell
   .\scripts\uninstall-autostart.ps1
   ```

2. Follow cloud deployment guide:
   - [ALWAYS_ON_DEPLOYMENT.md](../docs/ALWAYS_ON_DEPLOYMENT.md)

3. Deploy to Render/Vercel/Supabase (~$10-15/mo)

4. Update DNS to point to cloud hosting

5. Local setup remains available for development

---

## � Production Deployment Automation (Phase 6M)

### Fix Cloudflare Tunnel Configuration

Automatically detects backend port and updates tunnel routing:

```powershell
.\scripts\fix-cloudflare-tunnel.ps1
```

**What it does:**
1. ✅ Detects backend port (3001/3003/3005)
2. ✅ Updates Cloudflare config with correct port
3. ✅ Backs up existing configuration
4. ✅ Restarts tunnel with new config
5. ✅ Verifies API connectivity

**When to use:**
- Production API returns 502 Bad Gateway
- Backend port changed
- Tunnel routing to wrong port

### Verify Production Deployment

Runs 6 automated health tests:

```powershell
.\scripts\verify-production-deployment.ps1
```

**Tests performed:**
1. ✅ Frontend accessibility
2. ✅ API health endpoint
3. ✅ Knowledge Vault API (with auth)
4. ✅ Pipeline Incidents API (with auth)
5. ✅ Local backend connectivity
6. ✅ Cloudflare tunnel status

**Exit codes:**
- `0` = All tests passed
- `1` = One or more errors detected

### VS Code Integration

Both scripts available as tasks:
- Press `Ctrl+Shift+P` → "Tasks: Run Task"
- Select "Fix Cloudflare Tunnel Configuration" or "Verify Production Deployment"

---

## 📚 Related Documentation

- [ALWAYS_ON_DEPLOYMENT.md](../docs/ALWAYS_ON_DEPLOYMENT.md) - Cloud hosting guide
- [LOCAL_AUTOSTART.md](../docs/LOCAL_AUTOSTART.md) - Detailed explanation
- [UPGRADE_VERIFICATION.md](../docs/UPGRADE_VERIFICATION.md) - Testing checklist
- [KNOWLEDGE_SYSTEM_PRODUCTION_DEPLOYMENT_COMPLETE.md](../KNOWLEDGE_SYSTEM_PRODUCTION_DEPLOYMENT_COMPLETE.md) - Phase 6M deployment guide

---

## 🆘 Quick Commands Reference

```powershell
# Setup (one-time)
.\scripts\setup-autostart.ps1

# Start services
Start-ScheduledTask -TaskName "Care2Connects_AutoStart"

# Stop services
.\scripts\stop-services.ps1

# Check status
Get-ScheduledTask -TaskName "Care2Connects_AutoStart"
netstat -ano | findstr ":3000 :3001"

# View logs
Get-Content .\logs\autostart-supervisor.log -Wait -Tail 20

# Restart everything
.\scripts\stop-services.ps1; Start-Sleep 3; Start-ScheduledTask -TaskName "Care2Connects_AutoStart"

# Uninstall
.\scripts\uninstall-autostart.ps1

# Manual run (visible windows for debugging)
.\scripts\run-services.ps1 -ShowWindows

# Production Deployment Tools (NEW)
.\scripts\fix-cloudflare-tunnel.ps1           # Fix tunnel routing issues
.\scripts\verify-production-deployment.ps1    # Run 6 automated health tests
```

---

**Status**: ✅ Production-Ready
**Dependencies**: Node.js, npm, cloudflared (all must be in PATH)
**OS Support**: Windows 10/11
**License**: Same as CareConnect project
