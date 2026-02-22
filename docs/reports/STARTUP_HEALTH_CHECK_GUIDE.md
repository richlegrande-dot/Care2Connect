# Startup Health Check - Quick Reference

## What It Does

The startup health check script (`scripts/startup-health-check.ps1`) runs automatically when you open the workspace and:

1. **Checks all critical services**
2. **Attempts to fix common issues automatically**
3. **Provides specific troubleshooting guidance**
4. **Reports clear actionable steps**

## Auto-Triggered Execution

✅ **Runs automatically on workspace open** via VS Code task:
- Task: "Run Health Checks on Startup"
- Configured in: `.vscode/tasks.json`
- Execution policy: Bypass (no manual approval needed)

## What Gets Checked

### 1. PM2 Services
- Backend process status
- Frontend process status
- PM2 availability

### 2. Port Status  
- Port 3003 (Backend)
- Port 3000 (Frontend)
- Detects port conflicts

### 3. Backend Health
- Health endpoint response
- Service status (prisma, openai, stripe, cloudflare, tunnel)
- Overall system health (healthy vs degraded)

### 4. Cloudflare Tunnel
- cloudflared process running
- Public domain accessibility

### 5. Cloudflare API
- Token validity
- Zone configuration
- Environment file presence

## Auto-Fix Features

### Backend Auto-Start
**Trigger:** Backend not running on port 3003  
**Action:** Automatically runs `start-all.ps1`  
**Result:** Backend + Frontend started in 10 seconds

### Port Conflict Detection
**Trigger:** Port 3003 or 3000 blocked  
**Action:** Identifies blocking process by name  
**Result:** Shows which process to kill

### Service-Specific Guidance
Each failing service gets specific troubleshooting steps:

- **prisma**: Check `DATABASE_URL` in backend/.env
- **cloudflare**: Check `CLOUDFLARE_API_TOKEN` validity
- **tunnel**: Shows command to start: `cloudflared tunnel run`
- **openai**: Check `OPENAI_API_KEY` configuration
- **stripe**: Check STRIPE keys configuration

## Output Examples

### All Healthy
```
✅ ALL CHECKS PASSED

System Status: HEALTHY
```

### Issues Detected with Auto-Fix
```
⚠️ ISSUES DETECTED: 3

Issues Found:
  1. Backend not listening on port 3003
  2. Frontend not listening on port 3000
  3. PM2 not installed or not running

🔧 AUTO-FIX APPLIED
Some issues were automatically resolved. Please review status above.

RECOMMENDED ACTIONS:
1. Review troubleshooting messages above
2. Run: .\scripts\start-all.ps1 (if services not running)
3. Run: .\scripts\verify-deployment-ready.ps1 (check critical services)
4. Check backend/.env for missing or invalid credentials
5. View detailed health: http://localhost:3003/health/status
```

## Manual Execution

```powershell
# Run manually anytime
.\scripts\startup-health-check.ps1

# Expected: Full health check with auto-troubleshooting
```

## Integration with Other Scripts

Works seamlessly with:
- `start-all.ps1` - Auto-calls this if backend not running
- `verify-deployment-ready.ps1` - For deployment verification
- `verify-db.ps1` - For database integrity checks

## Quick Links Provided

After each run, shows:
- Health Status: http://localhost:3003/health/status
- Health History: http://localhost:3003/health/history?window=24h
- Public Site: https://care2connects.org

## Common Issues and Auto-Fixes

| Issue | Detection | Auto-Fix | Manual Action |
|-------|-----------|----------|---------------|
| Backend not running | Port 3003 check fails | Runs start-all.ps1 | Review startup output |
| Port blocked | Process detection | Shows blocking process | Kill process manually |
| Missing .env | File existence check | None | Create from .env.example |
| Invalid token | API call fails | None | Regenerate in dashboard |
| Tunnel down | cloudflared check | None | Run: cloudflared tunnel run |
| DNS issue | HTTP check fails | None | Wait for propagation |

## Benefits

1. **Immediate feedback** - Know what's wrong instantly
2. **Auto-recovery** - Common issues fixed automatically
3. **Time savings** - No manual diagnosis needed
4. **Clear guidance** - Specific steps for each problem
5. **Always current** - Runs on every workspace open

## When to Re-Run Manually

- After changing backend/.env configuration
- After updating Cloudflare settings
- After system restart
- When services seem unstable
- Before deployment (`verify-deployment-ready.ps1` is better for this)

## Advanced Troubleshooting

If auto-fix doesn't resolve issues:

```powershell
# 1. Check detailed health
curl http://localhost:3003/health/status

# 2. Verify deployment readiness
.\scripts\verify-deployment-ready.ps1

# 3. Test database integrity
.\scripts\verify-db.ps1

# 4. Check cloudflared logs
Get-Process cloudflared | Select-Object Id, CPU, WorkingSet

# 5. Manually restart services
.\scripts\stop-all.ps1
.\scripts\start-all.ps1
```

## Related Documentation

- [GITHUB_AGENT_COMPLETION_REPORT.md](GITHUB_AGENT_COMPLETION_REPORT.md) - Complete feature list
- [scripts/verify-deployment-ready.ps1](scripts/verify-deployment-ready.ps1) - Deployment checks
- [scripts/verify-db.ps1](scripts/verify-db.ps1) - Database verification
- [docs/DOMAIN_FIX_RUNBOOK.md](docs/DOMAIN_FIX_RUNBOOK.md) - DNS troubleshooting

---

**Last Updated:** December 16, 2025  
**Status:** ✅ Production Ready
