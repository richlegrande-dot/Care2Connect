# Production Stack Operations - Hardened Infrastructure

**Last Updated:** January 14, 2026  
**Status:** ✅ OPERATIONAL HARDENING COMPLETE

---

## 🎯 WHAT CHANGED - Recurring Blocker ELIMINATED

### ❌ OLD FRAGILE ARCHITECTURE (Recurring 502/404 Failures)
```
Cloudflare Tunnel → Port 8080 (reverse-proxy.js - manual Node process)
                         ↓
                    Frontend 3000 OR Backend 3001
                    
PROBLEM: If reverse-proxy.js dies → entire site 404 + wrong MIME types
PROBLEM: Manual startup of 4 separate processes (human error)
PROBLEM: IPv6 binding issues on Windows (tunnel tries ::1 first)
PROBLEM: Stale cloudflared processes with old config
PROBLEM: Domain typos recurring (care2connect.org vs care2connects.org)
```

### ✅ NEW ROBUST ARCHITECTURE (Self-Validating, Single Entrypoint)
```
Cloudflare Tunnel (IPv4-only, validated) → Port 8080 (Caddy - production-grade)
                                                 ↓
                            Frontend 3000 OR Backend 3001
                            
SOLUTION: Caddy (single binary, supervised, health checks built-in)
SOLUTION: One command starts everything (start-production-stack.ps1)
SOLUTION: --edge-ip-version 4 ALWAYS (never tries ::1)
SOLUTION: Stale process killer before every start
SOLUTION: Domain guard blocks care2connect.org from entering codebase
```

---

## 📋 ONE-COMMAND PRODUCTION OPERATIONS

### Start Production (The Only Command You Need)
```powershell
.\scripts\start-production-stack.ps1
```

**What it does:**
1. ✅ Runs domain guard (blocks care2connect.org typo)
2. ✅ Kills all existing processes (Caddy, Node, Cloudflared)
3. ✅ Validates ports available (3000, 3001, 8080)
4. ✅ Starts Caddy reverse proxy (port 8080)
5. ✅ Starts Frontend (port 3000)
6. ✅ Starts Backend (port 3001)
7. ✅ Validates local routing (Caddy → Frontend/Backend)
8. ✅ Starts Cloudflare Tunnel (IPv4-only, validated)
9. ✅ Validates public endpoints (MIME types, status codes)

**Exit Codes:**
- `0` = Success (all services healthy)
- `1` = Failure (diagnostics printed, actionable commands shown)

**Logs:**
- Caddy: `C:\Users\richl\Care2system\logs\caddy-access.log`
- PIDs: `C:\Users\richl\Care2system\logs\production-stack-pids.json`

### Stop Production
```powershell
.\scripts\stop-production-stack.ps1
```

Gracefully stops all services. Use `-Force` to hard-kill remaining processes.

---

## 🛡️ PERMANENT GUARDS AGAINST RECURRING FAILURES

### 1. Reverse Proxy Failure (Eliminated)

**Old Problem:** `reverse-proxy.js` dies → site returns 404 + `text/html` MIME on JS files

**New Solution:** Caddy (production-grade reverse proxy)
- Config: [Caddyfile.production](Caddyfile.production)
- Installation: `.\scripts\install-caddy.ps1`
- Features: Health checks, auto-retry, structured logging

**Caddy Configuration:**
```caddyfile
:8080 {
    @frontend host care2connects.org
    handle @frontend {
        reverse_proxy 127.0.0.1:3000 {
            health_uri /
            health_interval 10s
        }
    }
    
    @api host api.care2connects.org
    handle @api {
        reverse_proxy 127.0.0.1:3001 {
            health_uri /health/live
            health_interval 10s
        }
    }
}
```

### 2. IPv6 Binding Issue (Eliminated)

**Old Problem:** Windows Next.js binds IPv4 only, tunnel tries IPv6 first → connection refused

**New Solution:** `--edge-ip-version 4` ALWAYS forced in [tunnel-start.ps1](scripts/tunnel-start.ps1)

```powershell
cloudflared tunnel --config config.yml run $TunnelName --edge-ip-version 4
```

### 3. Stale Tunnel Processes (Eliminated)

**Old Problem:** 24+ hour old cloudflared processes ignoring config updates

**New Solution:** Hard kill ALL cloudflared before every start

```powershell
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
```

### 4. Domain Typo Recurrence (Prevented)

**Old Problem:** `care2connect.org` (wrong) keeps appearing in code

**New Solution:** [domain-guard.ps1](scripts/domain-guard.ps1) runs before every production start

```powershell
# Manual run:
.\scripts\domain-guard.ps1

# Auto-fix typos:
.\scripts\domain-guard.ps1 -Fix
```

**Scans:** All `.ts`, `.tsx`, `.js`, `.jsx`, `.ps1`, `.yml`, `.env*`, `Caddyfile*`

**Blocks:** `care2connect.org` (missing 's'), localhost in `.env.local` production URLs

### 5. Port Configuration Drift (Prevented)

**Old Problem:** Docs say port 3003, reality is 3001

**New Solution:** Port validation before every start

```powershell
# Required ports checked:
8080 → Caddy Reverse Proxy (CRITICAL)
3000 → Frontend (CRITICAL)
3001 → Backend (CRITICAL)
```

---

## 📊 MONITORING & RECOVERY

### Continuous Production Monitoring
```powershell
.\scripts\monitor-production-stack.ps1 -Continuous -IntervalSeconds 30
```

**Detects:**
1. ❌ Caddy not listening on port 8080
2. ❌ Static assets returning `text/html` (MIME mismatch - indicates proxy failure)
3. ❌ Cloudflare tunnel process dead
4. ❌ Frontend/Backend ports down
5. ❌ Public endpoints returning 502/404

**Auto-Restart Mode:**
```powershell
.\scripts\monitor-production-stack.ps1 -Continuous -AutoRestart
```

Automatically restarts stack if critical failures detected.

### Single Health Check
```powershell
.\scripts\monitor-production-stack.ps1
```

Exit code: `0` = healthy, `1` = failures detected

---

## 🚨 EMERGENCY RECOVERY PROCEDURES

### If Production Site Goes Down

**1. Fast Diagnosis (30 seconds):**
```powershell
# Check if services running
netstat -ano | Select-String ":8080|:3000|:3001" | Select-String "LISTENING"

# Run health check
.\scripts\monitor-production-stack.ps1
```

**2. Nuclear Restart (2 minutes):**
```powershell
.\scripts\stop-production-stack.ps1 -Force
.\scripts\start-production-stack.ps1
```

**3. Verify Public URLs:**
```powershell
curl https://care2connects.org
curl https://api.care2connects.org/health/live
```

### Common Failure Classes & Recovery

| **Symptom** | **Root Cause** | **Recovery** |
|-------------|----------------|--------------|
| Static assets 404 + `text/html` MIME | Caddy not running on 8080 | Restart production stack |
| Error 502 Bad Gateway | Backend down or tunnel misconfigured | Check backend logs, restart stack |
| Error 1033 Cloudflare Tunnel | Tunnel can't reach origin | Verify Caddy on 8080, restart tunnel |
| ERR_CONNECTION_REFUSED | IPv6 binding issue | Restart tunnel (forces IPv4) |
| care2connect.org in errors | Domain typo in config | Run `domain-guard.ps1 -Fix` |

---

## 📁 FILES & CONFIGURATION

### Production Stack Scripts (Start Here)
- ✅ [start-production-stack.ps1](scripts/start-production-stack.ps1) - **ONE command to start everything**
- ✅ [stop-production-stack.ps1](scripts/stop-production-stack.ps1) - Graceful shutdown
- ✅ [monitor-production-stack.ps1](scripts/monitor-production-stack.ps1) - Health checks & recovery
- ✅ [tunnel-start.ps1](scripts/tunnel-start.ps1) - IPv4-only tunnel startup with validation
- ✅ [domain-guard.ps1](scripts/domain-guard.ps1) - Typo prevention (care2connect vs care2connects)
- ✅ [install-caddy.ps1](scripts/install-caddy.ps1) - Caddy installation (run once)

### Configuration Files
- ✅ [Caddyfile.production](Caddyfile.production) - Reverse proxy config (replaces reverse-proxy.js)
- ✅ `C:\Users\richl\.cloudflared\config.yml` - Tunnel config (routes to 127.0.0.1:8080)

### Tunnel Configuration (Updated)
```yaml
tunnel: 07e7c160-451b-4d41-875c-a58f79700ae8
credentials-file: C:\Users\richl\.cloudflared\07e7c160-451b-4d41-875c-a58f79700ae8.json

# All traffic routes through Caddy on port 8080
ingress:
  - hostname: api.care2connects.org
    service: http://127.0.0.1:8080
  - hostname: www.care2connects.org
    service: http://127.0.0.1:8080
  - hostname: care2connects.org
    service: http://127.0.0.1:8080
  - service: http_status:404
```

### Domain Configuration (PERMANENT)
- ✅ Correct: `care2connects.org` (with 's')
- ❌ Wrong: `care2connect.org` (missing 's' - BLOCKED by domain-guard.ps1)

---

## ✅ SUCCESS CRITERIA (All Met)

This operational blocker is ELIMINATED because:

1. ✅ Production no longer depends on manually starting `reverse-proxy.js`
   - **Solution:** Caddy (production-grade, supervised)

2. ✅ Tunnel ALWAYS uses IPv4 and 127.0.0.1 origin targets
   - **Solution:** `--edge-ip-version 4` hardcoded, config uses 127.0.0.1

3. ✅ Starting production is ONE command, not 4 separate processes
   - **Solution:** `start-production-stack.ps1`

4. ✅ Static assets never return HTML MIME due to missing proxy
   - **Solution:** Caddy health checks + monitoring detects MIME mismatches

5. ✅ Domain typos cannot re-enter without being caught
   - **Solution:** `domain-guard.ps1` runs on every production start

---

## 📈 HISTORICAL CONTEXT

### Incidents That Led to This Hardening
- **Jan 14, 2026:** Reverse proxy not running → complete site failure (404 + wrong MIME)
- **Jan 11, 2026:** IPv6 binding during live demo → Error 502, Error 1033, 40 min outage
- **Dec 14, 2025:** Split routing misconfiguration → both domains routed to backend
- **Recurring:** Domain typo (care2connect vs care2connects) in multiple sessions
- **Recurring:** Stale cloudflared processes ignoring config updates

### Prevention Measures Implemented
1. ✅ Replaced fragile `reverse-proxy.js` with Caddy
2. ✅ Single production startup script with validation
3. ✅ IPv4-only tunnel edge (eliminates Windows IPv6 issue)
4. ✅ Stale process cleanup before every start
5. ✅ Domain guard prevents typo recurrence
6. ✅ Monitoring detects proxy failures + MIME mismatches
7. ✅ All routing through port 8080 (single supervision point)

**Full incident history:** [TUNNEL_INCIDENT_HISTORY_REPORT.md](TUNNEL_INCIDENT_HISTORY_REPORT.md)

---

## 🔧 INSTALLATION (First-Time Setup)

### Install Caddy (Run Once)
```powershell
.\scripts\install-caddy.ps1
```

Installs Caddy v2.7.6 to `C:\Program Files\Caddy\caddy.exe` and adds to PATH.

### Verify Installation
```powershell
caddy version
# Expected: v2.7.6

caddy validate --config Caddyfile.production
# Expected: Valid configuration
```

---

## 🎯 OPERATIONS CHEAT SHEET

| **Task** | **Command** |
|----------|-------------|
| Start production | `.\scripts\start-production-stack.ps1` |
| Stop production | `.\scripts\stop-production-stack.ps1` |
| Health check | `.\scripts\monitor-production-stack.ps1` |
| Continuous monitoring | `.\scripts\monitor-production-stack.ps1 -Continuous` |
| Check for domain typos | `.\scripts\domain-guard.ps1` |
| Fix domain typos | `.\scripts\domain-guard.ps1 -Fix` |
| Install Caddy | `.\scripts\install-caddy.ps1` |
| Validate Caddy config | `caddy validate --config Caddyfile.production` |
| View Caddy logs | `Get-Content logs\caddy-access.log -Tail 50 -Wait` |
| Check running processes | `netstat -ano \| Select-String ":8080\|:3000\|:3001"` |

---

## 📞 SUPPORT & TROUBLESHOOTING

### Logs Location
```
C:\Users\richl\Care2system\logs\
  ├── caddy-access.log          (Reverse proxy traffic)
  └── production-stack-pids.json (Running process IDs)
```

### Process Management
```powershell
# View all running services
Get-Process caddy, node, cloudflared -ErrorAction SilentlyContinue

# Kill specific process
Stop-Process -Name caddy -Force

# Nuclear cleanup (use if stuck)
Get-Process caddy, node, cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Configuration Validation
```powershell
# Validate Caddy config
caddy validate --config Caddyfile.production

# Check tunnel config
Get-Content "C:\Users\richl\.cloudflared\config.yml"

# Verify domain references
.\scripts\domain-guard.ps1
```

---

**For detailed incident history and root cause analysis:**  
→ [TUNNEL_INCIDENT_HISTORY_REPORT.md](TUNNEL_INCIDENT_HISTORY_REPORT.md)

**For legacy documentation (pre-hardening):**  
→ [PRODUCTION_INCIDENT_REPORT_2026-01-13.md](PRODUCTION_INCIDENT_REPORT_2026-01-13.md)

---

**This infrastructure eliminates the top 5 recurring tunnel failure classes.**  
**Production reliability: Fragile → Robust.**
