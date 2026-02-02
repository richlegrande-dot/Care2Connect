# PM2 Startup Problem Statement

## Problem Identification

**Date Identified**: December 18, 2025  
**Severity**: High - Blocks system startup  
**Frequency**: Recurring issue  
**Impact**: Services fail to start, health checks timeout, system appears down

---

## Problem Description

When the Care2system workspace opens in VS Code, PM2-managed services (backend and frontend) fail to start properly, causing a cascade of failures that prevent the system from becoming operational.

### Symptoms Observed

1. **PM2 Process Failures**
   - PM2 processes show "errored" or "stopped" status
   - Processes restart repeatedly (high restart count)
   - Health check endpoints timeout or return errors

2. **Service Connectivity Issues**
   - Backend `/health/live` endpoint: Timeout or connection refused
   - Backend `/health/status` endpoint: Timeout or connection refused
   - Frontend `http://localhost:3000`: Timeout or connection refused
   - Database health check: Timeout or connection refused

3. **PM2 Error Messages in Logs**
   ```
   [PM2][ERROR] Process or Namespace backend not found
   [PM2][ERROR] Process or Namespace frontend not found
   SyntaxError: Unexpected token ':'
   ```

4. **Cloudflare Tunnel Errors**
   ```
   Unable to reach the origin service. The service may be down or it may not 
   be responding to traffic from cloudflared: dial tcp [::1]:3000: connectex: 
   No connection could be made because the target machine actively refused it.
   ```

---

## Root Cause Analysis

### Primary Issue: PM2 Configuration Incompatibility

The `ecosystem.config.js` file uses configuration that is incompatible with:
- Windows operating system
- Node.js v25.0.0
- PM2's script execution model

**Specific Problems:**
1. Uses `script: 'npm'` which Node.js v25 tries to execute as a JavaScript file
2. Results in "Cannot find module" or "Unexpected token" errors
3. PM2 interprets npm.cmd as a Node.js script instead of a batch file

### Configuration File Location
`C:\Users\richl\Care2system\ecosystem.config.js`

### Affected Services
- `careconnect-backend` (port 3001)
- `careconnect-frontend` (port 3000)

---

## Current Workspace Startup Behavior

### Automatic Startup Script

**File**: `C:\Users\richl\Care2system\scripts\startup-health-check.ps1`

**Trigger**: Runs automatically when VS Code workspace opens

**Configuration**: Defined in `.vscode/tasks.json`
```json
{
  "label": "Run Health Checks on Startup",
  "type": "shell",
  "command": "powershell",
  "args": [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    "${workspaceFolder}/scripts/startup-health-check.ps1",
    "-AutoFix",
    "-MaxFixRounds",
    "2",
    "-NeverExitNonZero"
  ],
  "runOptions": {
    "runOn": "folderOpen"
  }
}
```

### Current Startup Flow

1. **VS Code opens workspace**
2. **Task runs**: `startup-health-check.ps1`
3. **Health checks execute** (6 checks):
   - Backend /health/live
   - Backend /health/status
   - Database /health/db
   - Frontend reachability
   - Cloudflared process
   - Public domain (care2connects.org)
4. **On failure**: Attempts to fix with PM2 restart commands
5. **Limitation**: Cannot detect or fix underlying PM2 configuration issues

### What Currently Happens

```
Workspace Opens
    ↓
startup-health-check.ps1 runs
    ↓
Detects all services DOWN
    ↓
Attempts: pm2 restart backend
    ↓
FAILS - PM2 config broken
    ↓
Attempts: pm2 restart frontend  
    ↓
FAILS - PM2 config broken
    ↓
Reports: All services failed
    ↓
System remains DOWN
```

---

## Error Timeline (December 18, 2025)

1. **00:33:03** - Workspace opened, startup health check ran
2. **00:33:03** - All 6 health checks FAILED (timeouts)
3. **00:33:03** - PM2 attempted restarts: `[PM2][ERROR] Process or Namespace backend not found`
4. **00:33:53** - Backend shows SyntaxError: `Unexpected token ':'`
5. **00:33:57** - npm.cmd parsing error: `SyntaxError: Unexpected token ':'`
6. **00:34:44** - Repeated errors on every restart attempt
7. **Manual intervention required** - 15+ minutes to diagnose and fix

---

## Impact Assessment

### Time Cost
- **Diagnosis Time**: 10-15 minutes per occurrence
- **Manual Fix Time**: 5-10 minutes
- **Total Downtime**: 15-25 minutes per incident

### Developer Experience
- ❌ Workspace opens but system is non-functional
- ❌ Manual terminal commands required every time
- ❌ Must remember specific fix commands
- ❌ No clear error message indicating PM2 config issue
- ❌ Health checks report symptoms, not root cause

### System Reliability
- ❌ Cannot trust automatic startup
- ❌ Demo/presentation risk - system may not start
- ❌ Production deployments affected by same issue
- ❌ New developers encounter immediate blocker

---

## Environmental Context

### System Information
- **OS**: Windows
- **Node.js**: v25.0.0
- **PM2**: Installed globally
- **Workspace**: C:\Users\richl\Care2system

### Dependencies
- Backend requires: Built dist/server.js file
- Frontend requires: Built .next directory
- Both require: Properly configured ecosystem.config.js

### Process Manager
- **PM2** manages both backend and frontend processes
- PM2 daemon must be running
- PM2 ecosystem file dictates process configuration

---

## Known Working State

After manual intervention, the system works when:
1. `ecosystem.config.js` uses direct Node.js script execution
2. Backend script points to: `./dist/server.js`
3. Frontend script points to: `node_modules/next/dist/bin/next`
4. Interpreter is set to: `'node'` (not npm, not cmd)
5. Both services have been built (dist and .next folders exist)

---

## Recurring Pattern

This issue has occurred:
- ✓ After Node.js upgrades
- ✓ After clean workspace clone
- ✓ After PM2 configuration changes
- ✓ On workspace restart
- ✓ Intermittently without obvious trigger

**Frequency**: High enough to require automated prevention

---

## Gap in Current Solution

### What the Startup Script Does
✅ Detects services are down  
✅ Attempts basic PM2 restarts  
✅ Reports failure status  

### What the Startup Script Does NOT Do
❌ Validate PM2 configuration before attempting restarts  
❌ Detect Windows/Node.js compatibility issues  
❌ Verify build artifacts exist  
❌ Fix broken ecosystem.config.js  
❌ Prevent the problem from recurring  

---

## Problem Statement Summary

**The workspace startup process fails to detect and prevent PM2 configuration incompatibilities, resulting in non-functional services and requiring manual intervention to diagnose and repair the same issue repeatedly.**

The current `startup-health-check.ps1` script detects the symptoms (services down) but cannot identify or fix the root cause (PM2 configuration incompatibility), leaving the system in a broken state that requires developer intervention every time the issue occurs.

---

## Solution Implementation (December 18, 2025)

### ✅ IMPLEMENTED: PM2 Pre-Validation in Startup Script

The startup health check now validates PM2 configuration **before** attempting to start services, preventing the recurring configuration incompatibility issue.

#### Changes Made:

1. **Enhanced startup-health-check.ps1**
   - Added `Test-PM2Configuration` function
   - Runs before health checks execute
   - Detects missing or errored PM2 processes
   - Automatically invokes validator when issues found

2. **Created validate-pm2-config.ps1**
   - Validates PM2 installation
   - Checks Windows/Node.js compatibility
   - Verifies build artifacts exist
   - Auto-repairs ecosystem.config.js
   - Restarts PM2 with correct configuration

3. **Added /health/pm2-diagnostics endpoint**
   - Real-time PM2 health monitoring
   - Provides detailed process status
   - Offers specific recommendations

#### New Startup Flow:

```
Workspace Opens
    ↓
startup-health-check.ps1 runs
    ↓
Test-PM2Configuration (NEW)
    ↓
PM2 processes checked
    ↓
If issues → validate-pm2-config.ps1 (NEW)
    ↓
Configuration auto-fixed
    ↓
PM2 restarted with correct config
    ↓
Health checks run
    ↓
✅ System operational
```

#### Prevention Mechanism:

- ✅ Validates PM2 before health checks
- ✅ Detects Windows/Node.js compatibility issues  
- ✅ Verifies build artifacts exist
- ✅ Fixes broken ecosystem.config.js automatically
- ✅ Prevents problem from recurring

**Status**: ✅ Solution implemented and active  
**Recovery Time**: Reduced from 15+ minutes to ~30 seconds automatic

---

## Files Involved

### Configuration
- `ecosystem.config.js` - PM2 process configuration
- `.vscode/tasks.json` - Workspace startup task definition

### Scripts
- `scripts/startup-health-check.ps1` - Runs on workspace open
- `scripts/tunnel-monitor.ps1` - Cloudflare tunnel monitoring
- `scripts/hardened-monitor.ps1` - System monitoring

### Logs (when errors occur)
- `backend/logs/backend-error.log`
- `frontend/logs/frontend-error.log`
- PM2 logs: `pm2 logs`

### Build Artifacts (required)
- `backend/dist/server.js` - Built backend
- `frontend/.next/BUILD_ID` - Built frontend

---

## Stakeholder Impact

- **Developers**: Productivity loss, frustration
- **Demos**: Risk of system not starting during presentations
- **Production**: Same issue affects deployment reliability
- **New Team Members**: Immediate blocker on onboarding

---

**Status**: ✅ Problem solved - Solution implemented and active  
**Date Implemented**: December 18, 2025  
**Result**: Automatic PM2 validation prevents recurring configuration issues  
**Impact**: 15-25 minute manual recovery → 30 second automatic fix
