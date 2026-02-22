# Cloudflare Tunnel Incident History Report
**Compiled:** January 14, 2026  
**Report For:** Next Agent  
**Scope:** Last 10 Documented Tunnel-Related Incidents  
**Purpose:** Pattern analysis and prevention recommendations

---

## 🚨 EXECUTIVE SUMMARY

**Recurring Problem:** Cloudflare tunnel failures have caused **2 critical production outages in the last 4 days** (January 11 and January 14, 2026), with multiple documented incidents stretching back to December 2025.

**Common Failure Patterns:**
1. **Reverse proxy failures** - Port 8080 not listening (most recent, Jan 14)
2. **IPv6/IPv4 binding conflicts** - Windows + Next.js incompatibility (Jan 11)
3. **Port configuration drift** - Backend port mismatches between docs and reality
4. **Stale tunnel processes** - Old processes not respecting config updates
5. **Domain name typos** - `care2connect.org` vs `care2connects.org` confusion

**Business Impact:**
- ❌ Live demo presentation interrupted (Jan 11)
- ❌ Complete production site inaccessibility (Jan 11, Jan 14)
- ❌ Static assets returning 404 with wrong MIME types (Jan 14)
- ⚠️ Potential stakeholder confidence damage

---

## 📋 DOCUMENTED INCIDENTS (Last 10)

### INCIDENT #1: Reverse Proxy Not Running (CRITICAL)
**Date:** January 14, 2026 (Today)  
**Duration:** ~30 minutes  
**Severity:** CRITICAL - Complete production failure  
**Status:** ✅ RESOLVED  

#### Problem Description
Production site `care2connects.org` displayed only security icon. DevTools showed:
- All `_next/static/chunks/*.js` files returning 404
- CSS/JS served as `text/html` instead of proper MIME types
- Error: "Refused to apply style... MIME type ('text/html') is not supported"

#### Root Cause
**Reverse proxy not running on port 8080**

Architecture requires:
```
Cloudflare Tunnel (port 8080) → reverse-proxy.js (port 8080)
  ↓                                ↓
  → Port 3000 (frontend)           → Port 3001 (backend)
```

Problem: `reverse-proxy.js` was not running, so Cloudflare tunnel had nothing to route to.

#### Error Evidence
```bash
# netstat showed port 8080 NOT listening
netstat -ano | Select-String ":8080"
# (empty result)

# Browser DevTools:
Failed to load resource: the server responded with a status of 404 (Not Found)
main-app.js:1 Refused to apply style from 'https://care2connects.org/_next/static/css/app/layout.css' 
because its MIME type ('text/html') is not a supported stylesheet MIME type
```

#### Solution Applied
```powershell
# 1. Killed hanging node processes
Stop-Process -Name node -Force  # 7 processes cleaned up

# 2. Restarted frontend (port 3000)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\richl\Care2system\frontend'; npm run dev"

# 3. Restarted backend (port 3001)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\richl\Care2system\backend'; npm run dev"

# 4. Restarted reverse proxy (port 8080)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\richl\Care2system'; node reverse-proxy.js"
```

#### Verification
```powershell
# Port listeners confirmed:
netstat -ano | Select-String ":8080"  # TCP 0.0.0.0:8080 LISTENING PID 19348
netstat -ano | Select-String ":3000"  # TCP 0.0.0.0:3000 LISTENING PID 52492

# Static assets working:
Invoke-WebRequest https://care2connects.org/_next/static/chunks/main-app.js
# StatusCode: 200, ContentType: application/javascript

Invoke-WebRequest https://care2connects.org/_next/static/css/app/layout.css
# StatusCode: 200, ContentType: text/css
```

#### Lessons Learned
- **Single point of failure:** Reverse proxy is critical but not monitored
- **No auto-restart:** Process crashes require manual intervention
- **Silent failure:** No alerting when reverse proxy goes down

---

### INCIDENT #2: IPv6 Binding Conflict (CRITICAL)
**Date:** January 11, 2026  
**Duration:** ~40 minutes (partial resolution)  
**Severity:** CRITICAL - Live demo failure  
**Status:** ⚠️ PARTIALLY RESOLVED (local working, production unstable)  

#### Problem Description
During live demo presentation, production site returned:
- **Error 502 - Bad Gateway**
- **Error 1033 - Cloudflare Tunnel Error**
- **ERR_CONNECTION_REFUSED** on localhost attempts

#### Root Cause
**Windows + Next.js IPv6/IPv4 incompatibility**

Next.js binds to IPv4 only (`0.0.0.0:3000`), but Cloudflare tunnel on Windows tries IPv6 first (`[::1]:3000`).

#### Error Evidence
```
2026-01-11T19:42:39Z ERR error="Unable to reach the origin service. 
The service may be down or it may not be responding to traffic from cloudflared: 
dial tcp [::1]:3000: connectex: No connection could be made because 
the target machine actively refused it." 
connIndex=2 event=1 ingressRule=5 originService=http://localhost:3000
```

#### Additional Issues Found
1. **Backend port mismatch:**
   - Tunnel config: `localhost:3001`
   - Documentation: Port `3003`
   - Actual runtime: Port `3001` (from .env default)
   
2. **PM2 process corruption:**
   - Processes showing "online" but with `0b` memory
   - Daemon corrupted from previous crashes

3. **Stale tunnel process:**
   - PID 47860, started 24+ hours prior
   - Not respecting config updates

#### Solutions Attempted (Partial Success)
```powershell
# Attempt 1: Kill and restart tunnel
Get-Process cloudflared | Stop-Process -Force
cloudflared tunnel --url http://localhost:3001 --no-autoupdate
# Result: ❌ Created temp tunnel (trycloudflare.com), wrong type

# Attempt 2: Named tunnel with URL override
cloudflared tunnel run --url http://localhost:3001 careconnect-backend
# Result: ⚠️ Started but IPv6 errors persisted

# Attempt 3: Use fix script
.\scripts\fix-cloudflare-tunnel.ps1
# Result: ⚠️ Tunnel started, still 502 errors

# Attempt 4: Bypass PM2, use direct npm
pm2 kill
cd C:\Users\richl\Care2system
npm run dev  # Uses concurrently for both services
# Result: ✅ Local servers working
```

#### Final Status
- ✅ Local: `localhost:3000` and `localhost:3001` working
- ❌ Production: `care2connects.org` still failing with tunnel errors
- ⚠️ Workaround: Demo continued using localhost

#### Lessons Learned
- **Known Windows limitation:** IPv6/IPv4 tunnel issue documented in community
- **Port configuration drift:** Documentation doesn't match runtime reality
- **PM2 unreliable:** Direct npm run more stable in this environment

---

### INCIDENT #3: Backend Port Mismatch
**Date:** January 11, 2026 (during Incident #2)  
**Duration:** ~15 minutes  
**Severity:** HIGH - Caused API routing failures  
**Status:** ✅ RESOLVED  

#### Problem Description
Cloudflare tunnel couldn't reach backend API endpoints after port change.

#### Root Cause
**Configuration drift between documentation and reality:**
- Handoff doc dated Jan 11: "Backend on port 3003"
- Tunnel config: API routes pointed to `localhost:3001`
- Actual backend: Started on port `3001` (from .env)

#### Solution Applied
```yaml
# Updated tunnel config.yml
ingress:
  - hostname: api.care2connects.org
    service: http://localhost:3001  # ✅ Changed back to 3001
  - hostname: care2connects.org
    service: http://localhost:3000
  - service: http_status:404
```

#### Prevention
- ✅ Documented correct port as 3001 in handoff
- ✅ Backend .env file PORT=3001
- ✅ Tunnel config matches actual port

---

### INCIDENT #4: Wrong Domain References
**Date:** January 14, 2026  
**Duration:** ~20 minutes  
**Severity:** HIGH - Prevented frontend from connecting to backend  
**Status:** ✅ RESOLVED  

#### Problem Description
Frontend making requests to localhost instead of production domain. Mixed domain references found in codebase.

#### Root Cause
**Frontend `.env.local` file had:**
1. Comment with wrong domain: `# For production, the system will use https://api.care2connect.org` ❌ (missing 's')
2. Localhost URLs: `NEXT_PUBLIC_BACKEND_URL=http://localhost:3003` ❌

#### Error Evidence
```bash
# Incorrect domain references found:
frontend/.env.local:
  # For production, the system will use https://api.care2connect.org  ❌ Wrong
  NEXT_PUBLIC_BACKEND_URL=http://localhost:3003  ❌ Localhost
  NEXT_PUBLIC_API_URL=http://localhost:3003      ❌ Localhost
```

#### Solution Applied
```diff
# frontend/.env.local
- # For production, the system will use https://api.care2connect.org  ❌
- NEXT_PUBLIC_BACKEND_URL=http://localhost:3003  ❌
- NEXT_PUBLIC_API_URL=http://localhost:3003      ❌

+ # For production domain testing, use care2connects.org  ✅
+ NEXT_PUBLIC_BACKEND_URL=https://api.care2connects.org  ✅
+ NEXT_PUBLIC_API_URL=https://api.care2connects.org      ✅
```

#### Verification
```bash
grep -r "care2connect\.org" backend/src frontend/app
# Result: ✅ No incorrect domain references found
```

#### Lessons Learned
- **Typo persistence:** `care2connect.org` vs `care2connects.org` recurring issue
- **Hidden config files:** `.env.local` not checked in previous fixes
- **Next.js precedence:** `.env.local` overrides other env files in dev mode

---

### INCIDENT #5: Backend Module Import Errors
**Date:** January 14, 2026  
**Duration:** ~30 minutes  
**Severity:** HIGH - Backend couldn't start  
**Status:** ✅ RESOLVED  

#### Problem Description
Backend startup failed with cascading TypeScript module import errors.

#### Root Cause
**Multiple import path errors:**
1. ❌ `Cannot find module '../middlewares/adminAuth'` (wrong path - should be singular)
2. ❌ `Multiple exports with the same name "getEnvProof"` (duplicate export)
3. ❌ `ReferenceError: getPortConfig is not defined` (missing import)

#### Solution Applied
```typescript
// Fix 1: Corrected middleware path
- import { authenticateAdmin } from '../middlewares/adminAuth';
+ import { authenticateAdmin } from '../middleware/adminAuth';

// Fix 2: Removed duplicate export in envProof.ts line 143
- export function getEnvProof() { ... }  // Duplicate removed

// Fix 3: Added missing import
- import { getServiceConfig } from './config/runtimePorts';
+ import { getServiceConfig, getPortConfig } from './config/runtimePorts';
```

#### Workaround Applied
Used `tsx` runtime instead of `ts-node` for better ESM/CommonJS handling:
```powershell
npx tsx src/server.ts
```

---

### INCIDENT #6: Split Routing Configuration Error
**Date:** December 14, 2025  
**Duration:** ~45 minutes  
**Severity:** HIGH - Frontend not accessible  
**Status:** ✅ RESOLVED  

#### Problem Description
Public URL `https://care2connects.org` displayed backend status page instead of Next.js frontend homepage.

#### Root Cause
**Tunnel configuration routing both domains to backend:**
```yaml
# Incorrect config:
ingress:
  - hostname: care2connects.org
    service: http://localhost:3003      # ❌ Backend
  - hostname: api.care2connects.org
    service: http://localhost:3003      # ❌ Backend (correct for this one)
```

#### Solution Applied
```yaml
# Corrected config:
tunnel: 07e7c160-451b-4d41-875c-a58f79700ae8
credentials-file: C:\Users\richl\.cloudflared\07e7c160-451b-4d41-875c-a58f79700ae8.json

ingress:
  - hostname: api.care2connects.org
    service: http://localhost:3001     # ✅ Backend API
  - hostname: care2connects.org
    service: http://localhost:3000     # ✅ Frontend UI
  - service: http_status:404           # ✅ Catch-all
```

#### Verification
- ✅ `https://care2connects.org` → Frontend homepage ("Your Story Matters")
- ✅ `https://api.care2connects.org/health/live` → Backend health JSON

---

### INCIDENT #7: PM2 Process State Corruption
**Date:** January 11, 2026 (recurring issue)  
**Duration:** Multiple occurrences  
**Severity:** MEDIUM - Complicated troubleshooting  
**Status:** ⚠️ RECURRING (workaround: avoid PM2)  

#### Problem Description
PM2 processes showing as "online" but with `0b` memory usage, not actually running.

#### Error Evidence
```
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ careconnect-backe… │ fork     │ 1    │ online    │ 0%       │ 0b       │
│ 1  │ careconnect-front… │ fork     │ 0    │ online    │ 0%       │ 0b       │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

#### Root Cause
Stale PM2 daemon state from previous hard crashes (Ctrl+C interruptions).

#### Solutions Attempted
```powershell
# Attempt 1: Restart processes
pm2 restart all
# Result: ❌ Still 0b memory

# Attempt 2: Kill daemon
pm2 kill
pm2 delete all
pm2 start ecosystem.prod.config.js
# Result: ❌ Still corrupted

# Attempt 3: Bypass PM2 entirely
npm run dev  # Uses concurrently
# Result: ✅ Stable, works consistently
```

#### Current Workaround
**Don't use PM2 in this environment** - use direct `npm run dev` or `concurrently`.

---

### INCIDENT #8: Stale Tunnel Processes
**Date:** January 11, 2026  
**Duration:** N/A (discovered during troubleshooting)  
**Severity:** LOW-MEDIUM - Prevents config updates  
**Status:** ✅ RESOLVED  

#### Problem Description
Cloudflare tunnel process from previous day still running, not respecting configuration file updates.

#### Evidence
```powershell
Get-Process cloudflared
# PID 47860, StartTime: 1/10/2026 9:31:35 PM (24+ hours old)
```

#### Root Cause
Tunnel process not automatically restarting after config changes. Running for 24+ hours with stale configuration.

#### Solution
```powershell
Get-Process cloudflared | Stop-Process -Force
cloudflared tunnel --config C:\Users\richl\.cloudflared\config.yml run careconnect-backend
```

---

### INCIDENT #9: Tunnel Health Check Failures
**Date:** January 10, 2026 (multiple times in health logs)  
**Duration:** Intermittent  
**Severity:** LOW - Transient failures  
**Status:** ⚠️ RECURRING  

#### Problem Description
Health monitoring logs show intermittent tunnel check failures:

```json
{
  "error": "Tunnel check failed - public API not reachable",
  "healthy": false,
  "latency": null,
  "timestamp": "2026-01-10T08:34:29.289Z"
}
```

#### Pattern Analysis
From `backend/data/health/health-history.jsonl`:
- 2 failures out of 53 checks in 24-hour window (~3.8% failure rate)
- Failures at: 08:34:29 and 08:45:12 (roughly 10 minutes apart)
- Most checks passing, suggesting transient issues

#### Suspected Causes
1. Cloudflare network hiccups
2. Tunnel connection instability
3. Backend slow to respond during high load

---

### INCIDENT #10: Cloudflare Cache Serving Stale Content
**Date:** December 14, 2025 (during split routing fix)  
**Duration:** ~60 seconds  
**Severity:** LOW - Cosmetic, temporary  
**Status:** ✅ RESOLVED  

#### Problem Description
After updating tunnel configuration, production site still showed old content (backend status page instead of frontend).

#### Root Cause
**Cloudflare edge cache** serving stale content for 30-60 seconds after tunnel config changes.

#### Solution
```bash
# Wait 60 seconds OR purge cache manually
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

#### Prevention
Add cache purge step to `fix-cloudflare-tunnel.ps1` script.

---

## 🔍 PATTERN ANALYSIS

### Failure Frequency
```
December 2025: 2 incidents (cache, routing)
January 1-10:  1 incident (health checks)
January 11:    3 incidents (IPv6, PM2, ports) ← CRITICAL DAY
January 14:    2 incidents (reverse proxy, imports) ← TODAY
```

**Trend:** Incidents increasing in frequency and severity.

### Root Cause Distribution
1. **Configuration Issues (40%):**
   - Port mismatches (3x)
   - Domain typos (1x)
   - Routing errors (1x)
   
2. **Process Management (30%):**
   - Reverse proxy not running (1x)
   - PM2 corruption (1x recurring)
   - Stale tunnel processes (1x)
   
3. **Platform Limitations (20%):**
   - IPv6/IPv4 Windows issue (1x critical)
   - Cloudflare cache (1x)
   
4. **Code Errors (10%):**
   - Import path errors (1x)

### Common Symptoms
- ✅ **Error 502 Bad Gateway** → Backend unreachable
- ✅ **Error 1033 Tunnel Error** → Tunnel config/DNS issue
- ✅ **Connection Refused** → Service not running or wrong port
- ✅ **404 on static assets** → Reverse proxy failure
- ✅ **MIME type errors** → Wrong service routing

---

## 🛡️ PREVENTION RECOMMENDATIONS

### IMMEDIATE ACTIONS (High Priority)

#### 1. Implement Reverse Proxy Monitoring
**Problem:** No alerting when reverse proxy crashes (Incident #1)

**Solution:**
```powershell
# Add to startup scripts:
# scripts/monitor-reverse-proxy.ps1

while ($true) {
    $proxy = Get-Process -Name node -ErrorAction SilentlyContinue | 
             Where-Object { $_.CommandLine -like "*reverse-proxy.js*" }
    
    if (-not $proxy) {
        Write-Host "⚠️ Reverse proxy not running! Restarting..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", 
            "cd 'C:\Users\richl\Care2system'; node reverse-proxy.js"
    }
    
    Start-Sleep -Seconds 60
}
```

#### 2. Fix IPv6 Binding (Incident #2)
**Problem:** Windows + Next.js IPv6 incompatibility

**Solution A (Recommended):** Force tunnel to use IPv4
```powershell
cloudflared tunnel --config C:\Users\richl\.cloudflared\config.yml run care2connects-tunnel --edge-ip-version 4
```

**Solution B:** Add reverse proxy that handles both IPv4/IPv6
```javascript
// Add to reverse-proxy.js
const server = http.createServer(proxy.web.bind(proxy));
server.listen(3000, '::', () => {  // Listen on IPv6
    console.log('Proxy listening on IPv6 and IPv4');
});
```

#### 3. Create Health Check Dashboard
**Problem:** No real-time visibility into service status

**Solution:**
```powershell
# scripts/check-all-services.ps1

$services = @{
    "Frontend (3000)" = "http://localhost:3000"
    "Backend (3001)" = "http://localhost:3001/health/live"
    "Reverse Proxy (8080)" = "http://localhost:8080"
}

foreach ($service in $services.GetEnumerator()) {
    try {
        $response = Invoke-WebRequest $service.Value -TimeoutSec 5
        Write-Host "✅ $($service.Key): OK"
    } catch {
        Write-Host "❌ $($service.Key): FAILED"
    }
}
```

#### 4. Standardize Port Configuration
**Problem:** Port mismatches between docs and reality (Incident #3)

**Solution:**
```bash
# Create single source of truth: config/ports.json
{
  "frontend": 3000,
  "backend": 3001,
  "reverseProxy": 8080,
  "tunnel": "localhost:8080"
}

# Update all scripts to read from this file
```

#### 5. Add Pre-commit Domain Validation
**Problem:** Recurring typos `care2connect.org` vs `care2connects.org` (Incident #4)

**Solution:**
```bash
# .git/hooks/pre-commit
#!/bin/bash
if git diff --cached | grep -i "care2connect\.org" | grep -v "care2connects\.org"; then
    echo "❌ Found incorrect domain 'care2connect.org' (missing 's')"
    echo "   Correct domain is 'care2connects.org'"
    exit 1
fi
```

---

### MEDIUM-TERM IMPROVEMENTS

#### 1. Automated Startup Scripts
**Goal:** One-command startup with health verification

```powershell
# scripts/start-production.ps1

# Kill existing processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start services in order
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
Start-Sleep -Seconds 5

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
Start-Sleep -Seconds 5

Start-Process powershell -ArgumentList "-NoExit", "-Command", "node reverse-proxy.js"
Start-Sleep -Seconds 5

Start-Process powershell -ArgumentList "-NoExit", "-Command", 
    "cloudflared tunnel --config C:\Users\richl\.cloudflared\config.yml run care2connects-tunnel --edge-ip-version 4"

# Verify all services
Write-Host "Verifying services..."
.\scripts\check-all-services.ps1
```

#### 2. Process Watchdog Service
**Goal:** Auto-restart crashed services

```powershell
# scripts/watchdog.ps1

$services = @(
    @{ Name="Frontend"; Port=3000; Command="cd frontend; npm run dev" },
    @{ Name="Backend"; Port=3001; Command="cd backend; npm run dev" },
    @{ Name="Reverse Proxy"; Port=8080; Command="node reverse-proxy.js" }
)

while ($true) {
    foreach ($service in $services) {
        $port = $service.Port
        $listening = netstat -ano | Select-String ":$port.*LISTENING"
        
        if (-not $listening) {
            Write-Host "⚠️ $($service.Name) not responding on port $port. Restarting..."
            Start-Process powershell -ArgumentList "-NoExit", "-Command", $service.Command
        }
    }
    
    Start-Sleep -Seconds 30
}
```

#### 3. Enhanced Logging
**Goal:** Better incident forensics

```javascript
// Add to reverse-proxy.js
proxy.on('error', (err, req, res) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        error: err.message,
        url: req.url,
        target: req.headers.host
    };
    
    fs.appendFileSync('reverse-proxy-errors.log', JSON.stringify(logEntry) + '\n');
    
    if (res.writeHead) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Bad Gateway - Reverse proxy error logged');
    }
});
```

---

### LONG-TERM SOLUTIONS

#### 1. Replace Cloudflare Tunnel with NGinx
**Rationale:** Remove dependency on Cloudflare tunnel and Windows IPv6 issues

**Architecture:**
```
Internet → Cloudflare CDN → VPS with NGinx → localhost services
```

**Benefits:**
- ✅ No IPv6/IPv4 binding issues
- ✅ Better control over routing
- ✅ More reliable process management
- ✅ Industry-standard solution

#### 2. Containerize with Docker
**Rationale:** Eliminate PM2, Windows-specific issues, and process management problems

```dockerfile
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    restart: always
    
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    restart: always
    
  reverse-proxy:
    image: nginx:alpine
    ports:
      - "8080:80"
    depends_on:
      - frontend
      - backend
    restart: always
```

**Benefits:**
- ✅ Automatic process restart
- ✅ Consistent environment
- ✅ No PM2 corruption
- ✅ Health checks built-in

#### 3. Implement Circuit Breaker Pattern
**Rationale:** Prevent cascading failures

```typescript
// Add to backend health checks
class TunnelCircuitBreaker {
    private failures = 0;
    private lastCheck = Date.now();
    
    async checkHealth() {
        if (this.failures >= 3 && Date.now() - this.lastCheck < 60000) {
            return { status: 'circuit_open', message: 'Too many failures, waiting...' };
        }
        
        try {
            const response = await fetch('https://api.care2connects.org/health/live');
            this.failures = 0;
            return { status: 'healthy' };
        } catch (error) {
            this.failures++;
            this.lastCheck = Date.now();
            return { status: 'unhealthy', error };
        }
    }
}
```

---

## 📞 EMERGENCY PROCEDURES

### If Production Site Goes Down

#### Step 1: Quick Diagnosis (2 minutes)
```powershell
# Check all ports
netstat -ano | Select-String ":3000|:3001|:8080" | Select-String "LISTENING"

# Expected output:
# TCP 0.0.0.0:3000  LISTENING  (Frontend)
# TCP 0.0.0.0:3001  LISTENING  (Backend)
# TCP 0.0.0.0:8080  LISTENING  (Reverse Proxy)

# Check node processes
Get-Process node | Select-Object Id, @{N='Memory';E={$_.WorkingSet64/1MB}}, StartTime

# Check tunnel
Get-Process cloudflared
```

#### Step 2: Fast Recovery (5 minutes)
```powershell
# Nuclear option - restart everything
cd C:\Users\richl\Care2system

# Kill all
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

# Start fresh
.\scripts\start-production.ps1  # If script exists
# OR manually:
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
Start-Sleep 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
Start-Sleep 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node reverse-proxy.js"
Start-Sleep 5

# Verify
Invoke-WebRequest https://care2connects.org -TimeoutSec 120
```

#### Step 3: Verify and Document
```powershell
# Check production
curl https://care2connects.org
curl https://api.care2connects.org/health/live

# Document incident
# Add to this file with date, symptoms, root cause, solution
```

---

## 🎯 ACTION ITEMS FOR NEXT AGENT

### CRITICAL (Do First - 30 minutes)
- [ ] Implement reverse proxy monitoring script
- [ ] Add `--edge-ip-version 4` to tunnel startup
- [ ] Create `scripts/check-all-services.ps1` health check
- [ ] Test production site end-to-end

### HIGH PRIORITY (Next Session - 1 hour)
- [ ] Create unified `scripts/start-production.ps1` startup script
- [ ] Add pre-commit hook for domain name validation
- [ ] Document current port configuration in `config/ports.json`
- [ ] Set up process watchdog service

### MEDIUM PRIORITY (Future Sessions - 2-3 hours)
- [ ] Enhanced logging in reverse-proxy.js
- [ ] Circuit breaker pattern for tunnel health
- [ ] Automated incident reporting
- [ ] Cloudflare cache auto-purge after config changes

### LONG-TERM (Architectural Changes)
- [ ] Evaluate Docker containerization
- [ ] Consider moving to VPS + NGinx
- [ ] Implement full CI/CD pipeline
- [ ] Add Prometheus/Grafana monitoring

---

## 📚 RELATED DOCUMENTATION

- [PRODUCTION_INCIDENT_REPORT_2026-01-13.md](PRODUCTION_INCIDENT_REPORT_2026-01-13.md) - Jan 11 critical failure
- [AGENT_HANDOFF_PRODUCTION_FIX_2026-01-14.md](AGENT_HANDOFF_PRODUCTION_FIX_2026-01-14.md) - Today's fixes
- [AGENT_HANDOFF_SMOKE_TESTS_2026-01-11.md](AGENT_HANDOFF_SMOKE_TESTS_2026-01-11.md) - Jan 11 resolution
- [FIX_APPLIED_SPLIT_ROUTING.md](FIX_APPLIED_SPLIT_ROUTING.md) - Dec 14 routing fix
- `scripts/fix-cloudflare-tunnel.ps1` - Tunnel auto-fix script
- `reverse-proxy.js` - Critical routing component

---

## 🔐 CONFIGURATION REFERENCE

### Current System State (as of Jan 14, 2026)
```yaml
Architecture:
  Cloudflare Tunnel → Port 8080 (reverse-proxy.js)
    ├── care2connects.org → localhost:3000 (Frontend)
    └── api.care2connects.org → localhost:3001 (Backend)

Tunnel ID: 07e7c160-451b-4d41-875c-a58f79700ae8
Tunnel Name: care2connects-tunnel
Config File: C:\Users\richl\.cloudflared\config.yml

Services:
  - Frontend: Port 3000, Next.js 14.0.3
  - Backend: Port 3001, Express + TypeScript
  - Reverse Proxy: Port 8080, Node.js http-proxy
  - Database: Remote PostgreSQL (db.prisma.io)

Correct Domain: care2connects.org (with 's')
Wrong Domain: care2connect.org (typo - no 's')
```

---

**Report Compiled By:** GitHub Copilot Agent  
**For:** Next Agent Session  
**Date:** January 14, 2026  
**Session:** Production Domain Fix and Test Coverage
