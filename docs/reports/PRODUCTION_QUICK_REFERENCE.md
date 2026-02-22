# Production Operations - Quick Reference Card

**Last Updated:** January 14, 2026 (Hardened)  
**Print this and keep it handy!**

**📖 Full Guide:** [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md)

---

## 🚀 START STACK (SINGLE ATOMIC COMMAND)

```powershell
.\scripts\start-stack.ps1
```

**What happens:** Domain guard → Cleanup → Caddy → Backend → Frontend → Tunnel (IPv4) → Validation

**Time:** ~50 seconds  
**Exit code:** 0 = success, 1 = failure (auto-cleanup + diagnostics)

---

## 🛑 STOP STACK

```powershell
.\scripts\stop-stack.ps1
```

**Stops in order:** Tunnel → Frontend → Backend → Caddy

---

## 🔍 HEALTH CHECK

```powershell
.\scripts\monitor-stack.ps1
```

**Shows:** Port status, process health, routing validation

---

## 🤖 AUTO-RECOVERY WATCHDOG

```powershell
.\scripts\watchdog-stack.ps1
```

**Monitors every 30s:**
- Ports (8080, 3001, 3000)
- Processes (caddy, nodes, tunnel)
- Public endpoints

**Auto-restarts:** Failed components (2 failures → full stack restart)

**Logs:** `logs/watchdog-stack.log`

---

## 📊 CHECK HEALTH

```powershell
.\scripts\monitor-production-stack.ps1
```

**Exit code:** 0 = healthy, 1 = issues detected

---

## 🚨 SITE IS DOWN - EMERGENCY RECOVERY

```powershell
# Step 1: Nuclear stop
.\scripts\stop-production-stack.ps1 -Force

# Step 2: Wait
Start-Sleep -Seconds 5

# Step 3: Start fresh
.\scripts\start-production-stack.ps1

# Step 4: Verify
curl https://care2connects.org
```

**Recovery time:** ~2 minutes

---

## 🔍 QUICK DIAGNOSTICS

```powershell
# Check ports listening
netstat -ano | Select-String ":8080|:3000|:3001" | Select-String "LISTENING"

# Expected output:
# TCP 0.0.0.0:8080  LISTENING  (Caddy Proxy)
# TCP 0.0.0.0:3000  LISTENING  (Frontend)
# TCP 0.0.0.0:3001  LISTENING  (Backend)

# Check running processes
Get-Process caddy, node, cloudflared -ErrorAction SilentlyContinue
```

---

## ❌ COMMON ERROR MESSAGES & FIXES

### Error: "Port 8080 already in use"
```powershell
.\scripts\stop-production-stack.ps1 -Force
```

### Error: "Static asset has WRONG MIME TYPE"
**Cause:** Caddy not running  
**Fix:** Restart production stack

### Error: "Tunnel process died immediately"
**Cause:** Config error or ports not available  
**Fix:** Check Caddy is running on port 8080 first

### Error: "Domain guard violations found"
```powershell
.\scripts\domain-guard.ps1 -Fix
```

---

## 🌐 PUBLIC URLS

- Frontend: https://care2connects.org
- API: https://api.care2connects.org
- Health: https://api.care2connects.org/health/live

---

## 📁 KEY FILES

- **Caddy Config:** `Caddyfile.production`
- **Tunnel Config:** `C:\Users\richl\.cloudflared\config.yml`
- **Caddy Logs:** `logs\caddy-access.log`
- **Process PIDs:** `logs\production-stack-pids.json`

---

## 🔧 ONE-TIME SETUP (If Caddy Not Installed)

```powershell
.\scripts\install-caddy.ps1
```

---

## ✅ CORRECT vs ❌ WRONG

- ✅ `care2connects.org` (correct - with 's')
- ❌ `care2connect.org` (wrong - missing 's')

Domain guard blocks the wrong one automatically.

---

## 📞 IF TOTALLY STUCK

1. Open PowerShell as Administrator
2. Run: `Get-Process caddy, node, cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force`
3. Wait 10 seconds
4. Run: `.\scripts\start-production-stack.ps1`
5. Check: `curl https://care2connects.org`

---

## 🎯 ARCHITECTURE (How It Works)

```
Cloudflare Tunnel (IPv4-only)
         ↓
    Port 8080 (Caddy Reverse Proxy)
         ↓
    ┌────┴────┐
    ↓         ↓
Port 3000   Port 3001
(Frontend)  (Backend)
```

**Key:** Caddy is the single routing point. If Caddy is down, everything is down.

---

**Full docs:** [PRODUCTION_OPERATIONS_HARDENED.md](PRODUCTION_OPERATIONS_HARDENED.md)  
**Completion report:** [OPERATIONS_HARDENING_COMPLETE.md](OPERATIONS_HARDENING_COMPLETE.md)  
**Incident history:** [TUNNEL_INCIDENT_HISTORY_REPORT.md](TUNNEL_INCIDENT_HISTORY_REPORT.md)
