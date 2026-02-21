# Care2Connect - Deployment Readiness Quick Reference

## Critical Rule

**⚠️ NEVER deploy if Cloudflare or Tunnel services are down**

Even if the health endpoint reports "healthy", the server is **NOT deployment ready** if critical infrastructure services fail.

---

## Deployment Readiness Check

```powershell
# Run deployment readiness verification
.\scripts\verify-deployment-ready.ps1
```

### Expected Output (READY):

```
🚀 DEPLOYMENT READY
   All critical services are operational
   - Database: Connected
   - Cloudflare: Configured
   - Tunnel: Active

   You can proceed with deployment.
```

### Expected Output (NOT READY):

```
❌ NOT DEPLOYMENT READY

   CRITICAL services are DOWN:
   - Cloudflare API
   - Tunnel

   DO NOT DEPLOY until these are fixed.
```

---

## Critical Services

### 1. Database
- **Impact if down:** Application cannot store or retrieve data
- **Deployment blocker:** YES
- **Fix:** Check DATABASE_URL in backend/.env

### 2. Cloudflare API
- **Impact if down:** DNS and CDN services won't work
- **Deployment blocker:** YES
- **Fix:** Verify CLOUDFLARE_API_TOKEN in backend/.env

### 3. Tunnel
- **Impact if down:** Public access to application WILL NOT WORK
- **Deployment blocker:** YES
- **Fix:** 
  - Ensure cloudflared tunnel is running
  - Verify CLOUDFLARE_TUNNEL_ID in backend/.env
  - Check DNS nameservers point to Cloudflare

---

## Optional Services

These services can fail without blocking deployment:
- **OpenAI:** Transcription will be degraded but system works
- **Stripe:** Payment features won't work but core features work
- **Speech:** Recording features affected but core features work

---

## Deployment Workflow

```powershell
# 1. Start all services
.\scripts\start-all.ps1

# 2. Wait for startup (15 seconds)
Start-Sleep -Seconds 15

# 3. Verify database integrity
.\scripts\verify-db.ps1

# 4. CRITICAL: Check deployment readiness
.\scripts\verify-deployment-ready.ps1

# 5. If step 4 shows "DEPLOYMENT READY", proceed with deployment
# 6. If step 4 shows "NOT DEPLOYMENT READY", fix critical services first
```

---

## Why This Matters

### Health Status vs Deployment Ready

The health endpoint reports:
- **healthy:** 0 failures or 1-2 optional service failures
- **degraded:** 1-2 optional service failures
- **unhealthy:** Critical service failure OR 3+ optional failures

**PROBLEM:** Cloudflare and Tunnel are marked as "optional" services, so if they fail:
- Health status = "healthy" or "degraded" (still technically running)
- **BUT** deployment readiness = NOT READY (public site won't work)

### Real-World Impact

If you deploy with Cloudflare or Tunnel down:
- Backend server runs fine on localhost:3003 ✅
- Health checks report "healthy" ✅
- Database works ✅
- **BUT:**
  - care2connect.org shows "Bad Gateway" ❌
  - Users cannot access the site ❌
  - DNS doesn't resolve ❌
  - Tunnel connection fails ❌

---

## Troubleshooting

### Cloudflare API Failing

**Error:** "HTTP 400" or "Invalid API token"

**Fix:**
1. Check backend/.env for CLOUDFLARE_API_TOKEN
2. Verify token is valid in Cloudflare dashboard
3. Regenerate token if needed
4. Restart backend after updating .env

### Tunnel Failing

**Error:** "External check failed" or "Tunnel not running"

**Fix:**
1. Check if cloudflared tunnel is running:
   ```powershell
   Get-Process -Name cloudflared
   ```
2. Verify CLOUDFLARE_TUNNEL_ID in backend/.env
3. Check DNS nameservers:
   ```powershell
   .\scripts\verify-domain.ps1
   ```
4. Ensure nameservers point to Cloudflare (not Argeweb)
5. See docs/DOMAIN_FIX_RUNBOOK.md for full DNS setup

---

## Commands

```powershell
# Quick deployment check
.\scripts\verify-deployment-ready.ps1

# Full database verification
.\scripts\verify-db.ps1

# DNS verification
.\scripts\verify-domain.ps1

# Health status (JSON)
curl http://localhost:3003/health/status

# Health status (detailed)
curl http://localhost:3003/health/ready
```

---

## Exit Codes

- **0:** Deployment ready (all critical services healthy)
- **1:** NOT deployment ready (critical service down or backend unreachable)

Use in CI/CD:
```powershell
.\scripts\verify-deployment-ready.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment blocked - fix critical services"
    exit 1
}
```

---

## Remember

✅ **Database + Cloudflare + Tunnel healthy** = Deployment ready  
❌ **Any critical service down** = DO NOT DEPLOY  
⚠️ **"Healthy" status alone** = NOT ENOUGH, check deployment script
