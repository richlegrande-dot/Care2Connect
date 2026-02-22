# PM2 Troubleshooting & Fix Plan

**Date:** February 2, 2026  
**Issue:** PM2 services show "online" but consume 0 memory, causing critical path test failures  
**Priority:** HIGH - Blocks production readiness validation  

---

## Problem Analysis

### Current Issues
1. **PM2 False Positive Status**: Services appear "online" but aren't actually running (0 memory usage)
2. **Frontend Startup Failure**: "ENOWORKSPACES" error preventing Next.js startup
3. **Backend Readiness Endpoint**: `/ops/health/production` returns 404 despite code existing
4. **Test Dependencies**: Critical path tests require both services running on ports 3000/3001

### Root Causes Identified
- **Workspace Configuration**: npm workspaces preventing individual service startup
- **PM2 Configuration**: `ecosystem.config.js` may have incorrect paths or startup commands
- **Route Registration**: Backend readiness endpoint not properly mounted
- **Environment Issues**: Missing environment variables or dependencies

---

## Diagnostic Plan

### Phase 1: PM2 Configuration Analysis
**Duration:** 15 minutes  

#### 1.1 Examine PM2 Configuration
- [ ] Review `ecosystem.config.js` for correct paths
- [ ] Verify startup commands match working manual commands
- [ ] Check environment variables and working directory settings
- [ ] Validate process names and ports

#### 1.2 Check PM2 Logs
- [ ] Run `pm2 logs` to see actual startup errors
- [ ] Check individual service logs: `pm2 logs backend` and `pm2 logs frontend`
- [ ] Review PM2 error logs for configuration issues

#### 1.3 Test PM2 Commands
- [ ] Stop all PM2 processes: `pm2 stop all`
- [ ] Delete PM2 processes: `pm2 delete all`
- [ ] Restart PM2 daemon: `pm2 kill && pm2 startup`
- [ ] Try starting one service at a time

### Phase 2: Workspace Configuration Fix
**Duration:** 20 minutes  

#### 2.1 Analyze Workspace Issues
- [ ] Check root `package.json` workspaces configuration
- [ ] Review frontend and backend `package.json` files
- [ ] Identify dependency conflicts causing ENOWORKSPACES

#### 2.2 Test Manual Service Startup
- [ ] Start backend manually: `cd backend && npm run dev`
- [ ] Start frontend manually: `cd frontend && npm run dev`
- [ ] Verify services respond on correct ports (3000/3001)

#### 2.3 Fix Workspace Dependencies
- [ ] Run `npm install` in root directory
- [ ] Run `npm install` in frontend and backend directories
- [ ] Clear node_modules and reinstall if needed

### Phase 3: Backend Route Registration
**Duration:** 10 minutes  

#### 3.1 Investigate Route Mounting
- [ ] Check `backend/src/server.ts` or main application file
- [ ] Verify `/ops` routes are properly registered
- [ ] Ensure `backend/src/routes/ops.ts` exports are correct

#### 3.2 Test Route Accessibility
- [ ] Start backend service manually
- [ ] Test endpoint: `curl http://localhost:3001/ops/health/production`
- [ ] Check if other `/ops` endpoints work

### Phase 4: PM2 Configuration Update
**Duration:** 15 minutes  

#### 4.1 Update Ecosystem Configuration
- [ ] Fix any path or command issues found in Phase 1
- [ ] Add proper environment variables
- [ ] Set correct working directories
- [ ] Configure proper restart policies

#### 4.2 Test Updated Configuration
- [ ] Start services with updated PM2 config
- [ ] Verify both services show proper memory usage
- [ ] Test service accessibility on expected ports

---

## Implementation Steps

### Step 1: Immediate Diagnostics
```powershell
# Check current PM2 status
pm2 status
pm2 logs --lines 50

# Check workspace configuration
Get-Content package.json | Select-String workspaces
Get-Content frontend/package.json | Select-String name
Get-Content backend/package.json | Select-String name
```

### Step 2: Clean PM2 Restart
```powershell
# Clean slate PM2 restart
pm2 stop all
pm2 delete all
pm2 kill

# Check ecosystem config
Get-Content ecosystem.config.js
```

### Step 3: Manual Service Testing
```powershell
# Test backend startup
cd backend
npm run dev
# (In new terminal) Test endpoint: curl http://localhost:3001/health

# Test frontend startup  
cd frontend
npm run dev
# Verify http://localhost:3000 loads
```

### Step 4: Fix and Restart PM2
```powershell
# After fixes, restart PM2
pm2 start ecosystem.config.js
pm2 status
pm2 logs --lines 10
```

---

## Expected Outcomes

### Success Criteria
- [ ] **PM2 Status**: Both services show "online" with actual memory usage (>0MB)
- [ ] **Backend Accessibility**: `http://localhost:3001/health` returns 200 OK
- [ ] **Frontend Accessibility**: `http://localhost:3000` loads successfully  
- [ ] **Readiness Endpoint**: `/ops/health/production` returns proper health status
- [ ] **Critical Path Tests**: All 8 tests pass (100% success rate)

### Validation Commands
```powershell
# Verify PM2 services
pm2 status

# Test service endpoints
Invoke-RestMethod http://localhost:3001/health
Invoke-RestMethod http://localhost:3001/ops/health/production
Invoke-WebRequest http://localhost:3000

# Run critical path tests
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/critical-path-regression-tests.ps1
```

---

## Fallback Plans

### Plan A: Docker Compose Alternative
If PM2 continues to fail:
- Use `docker-compose.yml` for consistent service management
- Test with `docker-compose up -d`
- Validate services run properly in containers

### Plan B: Manual Service Management
If both PM2 and Docker fail:
- Document manual startup procedures
- Create PowerShell scripts for service management
- Update test scripts to handle manual service startup

### Plan C: Service Dependencies Analysis
If services still fail to start:
- Check database connectivity requirements
- Validate environment variable dependencies
- Ensure all npm packages are properly installed

---

## Next Actions After PM2 Fix

1. **Re-run Critical Path Tests**: Validate 100% success with working services
2. **Complete Navigator Evaluation**: Resume Jan v4+ parser testing with proper infrastructure
3. **Production Readiness**: Confirm system ready for deployment
4. **Documentation Update**: Record working PM2 configuration and troubleshooting steps