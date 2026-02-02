# Production Deployment Checklist
**PRODUCTION HARDENING**: Pre-deployment verification checklist to prevent demo failures

## 🚀 PRE-DEPLOYMENT CHECKLIST

### ✅ CRITICAL PATH REGRESSION VALIDATION (MANDATORY)
- [ ] **Run Regression Suite**: `.\scripts\critical-path-regression-tests.ps1` - ALL TESTS MUST PASS
- [ ] **Backend Startup**: Regression tests verify backend responds and is production-ready
- [ ] **Frontend Integration**: Regression tests confirm frontend-backend connectivity
- [ ] **Demo Page Validation**: Tell Your Story page loads successfully 
- [ ] **Production URLs** (if demo mode): `.\scripts\critical-path-regression-tests.ps1 -DemoMode`
- [ ] **Zero Critical Failures**: Exit code 0 required - no exceptions

### ✅ Configuration Verification
- [ ] **Config Drift Check**: `.\scripts\validate-config-consistency.ps1` passes without critical issues
- [ ] **Port Configuration**: Verify backend port matches tunnel config and documentation
- [ ] **Environment Variables**: Confirm all required .env variables are set and validated
- [ ] **Database Connection**: Test DATABASE_URL connectivity and performance
- [ ] **API Keys**: Verify STRIPE_SECRET_KEY, ASSEMBLYAI_API_KEY are configured (if needed)
- [ ] **V1 Stability**: Confirm V1_STABLE=true and ZERO_OPENAI_MODE=true

### ✅ Process Health Verification  
- [ ] **Kill Zombie Processes**: Run `taskkill /f /im node.exe` to clear any zombies
- [ ] **PM2 Daemon Reset**: Run `pm2 kill` if using PM2 to ensure clean state
- [ ] **Port Availability**: Verify ports 3000 and 3001 are available
- [ ] **Memory Check**: Ensure no processes showing 0MB memory usage

### ✅ Local Server Testing
- [ ] **Backend Health**: `http://localhost:3001/health/live` returns 200 OK
- [ ] **Frontend Health**: `http://localhost:3000` loads successfully  
- [ ] **Tell Your Story**: `http://localhost:3000/tell-your-story` loads and compiles
- [ ] **API Connectivity**: Frontend can reach backend APIs
- [ ] **Database Operations**: Test profile creation/retrieval works

### ✅ Tunnel Configuration
- [ ] **Config File Exists**: `C:\Users\richl\.cloudflared\config.yml` present
- [ ] **Credentials Valid**: Tunnel credentials file exists and valid
- [ ] **IPv4 Configuration**: All services use `http://127.0.0.1:PORT` not `localhost`
- [ ] **Port Matching**: Tunnel config matches actual server ports
- [ ] **No Stale Processes**: Kill any existing cloudflared processes

### ✅ Production Endpoint Testing
- [ ] **Tunnel Startup**: Start tunnel with `--edge-ip-version 4` flag
- [ ] **Production API**: `https://api.care2connects.org/health/live` returns 200 OK
- [ ] **Production Frontend**: `https://care2connects.org` loads successfully
- [ ] **Production Story Page**: `https://care2connects.org/tell-your-story` works
- [ ] **No Error Pages**: No 502, 1033, or connection refused errors
- [ ] **Response Times**: All endpoints respond within 10 seconds

### ✅ Demo-Specific Validation
- [ ] **Critical User Flow**: Test the exact demo path (homepage → tell your story)
- [ ] **Browser Compatibility**: Test in the browser that will be used for demo  
- [ ] **Network Stability**: Test on the network that will be used for demo
- [ ] **Fallback Ready**: Localhost servers available if production fails
- [ ] **Screen Sharing**: Test screen sharing of both localhost and production URLs

## 🛠️ DEPLOYMENT COMMANDS

### Quick Deployment (Recommended)
```powershell
# Complete production startup with verification
.\scripts\prod-start.ps1 -StrictMode

# Verify everything is working
.\scripts\prod-verify.ps1 -StrictMode
```

### Manual Step-by-Step Deployment
```powershell
# 1. Clean environment
taskkill /f /im node.exe
pm2 kill

# 2. Start servers
cd C:\Users\richl\Care2system
npm run dev

# 3. Validate configuration  
node frontend\scripts\validate-config.js

# 4. Start tunnel (with IPv4 hardening)
.\scripts\tunnel-start.ps1 -StrictMode

# 5. Run verification
.\scripts\prod-verify.ps1
```

## 🚨 FAILURE SCENARIOS & RESPONSES

### If Backend Won't Start
- **Check**: Port 3001 availability with `netstat -ano | findstr :3001`
- **Fix**: Kill occupying process or change PORT in .env
- **Verify**: Backend health endpoint responds correctly

### If Frontend Won't Start
- **Check**: Port 3000 availability and Next.js compilation errors
- **Fix**: Clear `.next` cache, reinstall node_modules if needed
- **Verify**: Homepage loads and Tell Your Story page compiles

### If Tunnel Fails (IPv6 Errors)
- **Check**: Tunnel logs for `dial tcp [::1]:3000` errors
- **Fix**: Ensure `--edge-ip-version 4` flag is used
- **Verify**: Production endpoints return 200 OK

### If Production URLs Return 502/1033
- **Check**: Local servers are actually running (not zombie processes)
- **Fix**: Restart servers, ensure tunnel config matches actual ports
- **Verify**: Both local and production endpoints work

## ⏰ TIMING RECOMMENDATIONS

### 30 Minutes Before Demo
- [ ] Run complete deployment checklist
- [ ] Verify all production endpoints
- [ ] Take screenshots of working system as backup

### 10 Minutes Before Demo  
- [ ] Quick verification of production URLs
- [ ] Open localhost URLs as fallback
- [ ] Verify screen sharing works with both URLs

### During Demo
- [ ] Have localhost:3000/tell-your-story ready in backup tab
- [ ] Monitor for any error indicators during presentation
- [ ] Switch to localhost immediately if production fails

## 📞 EMERGENCY CONTACTS & FALLBACKS

### If Production Completely Fails During Demo
1. **Immediate**: Switch to `http://localhost:3000/tell-your-story`
2. **Explain**: "This is our local development environment showing the same functionality"
3. **Continue**: Demo works identically on localhost

### If Both Production and Local Fail
1. **Have Ready**: Screenshots/video recording of working system
2. **Explain**: "Due to a network issue, let me show you recorded footage of the system"
3. **Follow Up**: Schedule another demo after fixing issues

---

**Last Updated**: January 13, 2026  
**Version**: 1.0 (Post-Incident Hardening)  
**Validated Against**: Production incident of January 11, 2026