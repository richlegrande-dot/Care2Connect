# Production Invariants Evidence Pack
**Date**: January 13, 2026  
**Purpose**: Empirical proof that production invariants are enforced under realistic failure conditions  
**Status**: 🔬 IN PROGRESS

---

## ⚠️ CRITICAL: This is EVIDENCE, not CLAIMS

This document contains:
- Exact commands executed
- Complete outputs (verbatim)
- Timestamps of execution
- PASS/FAIL determination with justification

**NO NARRATIVE. ONLY PROOF.**

---

## 📋 Invariant Test Results Summary

| Invariant | Description | Status | Evidence Section |
|-----------|-------------|--------|------------------|
| **A** | Port conflicts fail-fast with PID reported | 🔬 TESTING | [§A](#invariant-a-port-conflict-fail-fast) |
| **B** | Config drift detected and blocks startup | 🔬 TESTING | [§B](#invariant-b-config-drift-detection) |
| **C** | /ops/health/production is authoritative | 🔬 TESTING | [§C](#invariant-c-unified-readiness-endpoint) |
| **D** | Tunnel fails hard if origin unreachable | 🔬 TESTING | [§D](#invariant-d-tunnel-fail-fast) |
| **E** | Regression tests cannot be skipped | 🔬 TESTING | [§E](#invariant-e-regression-tests-mandatory) |
| **F** | OpenAI disabled in ZERO_OPENAI_MODE | 🔬 TESTING | [§F](#invariant-f-openai-disabled) |

---

## Invariant A: Port Conflict Fail-Fast

**CLAIM**: If port 3001 or 3000 is already in use, system fails hard with PID reported

### Test A1: Backend Port Conflict (3001)

**Timestamp**: `[PENDING]`

**Setup Command**:
```powershell
# Start dummy process on port 3001
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m http.server 3001" -WindowStyle Minimized
Start-Sleep -Seconds 3
```

**Verification Command**:
```powershell
netstat -ano | Select-String ":3001" | Select-String "LISTENING"
```

**Verification Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Test Command**:
```powershell
cd C:\Users\richl\Care2system\backend
$env:NODE_ENV = "production"
$env:V1_STABLE = "true"
npm start
```

**Expected Behavior**:
- Backend should detect port conflict
- Exit with non-zero code
- Display error message with PID

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Exit Code**: `[PENDING]`

**Result**: ⏳ PENDING

---

### Test A2: Frontend Port Conflict (3000)

**Timestamp**: `[PENDING]`

**Setup Command**:
```powershell
# Start dummy process on port 3000
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m http.server 3000" -WindowStyle Minimized
Start-Sleep -Seconds 3
```

**Test Command**:
```powershell
cd C:\Users\richl\Care2system\frontend
npm run build
npm start
```

**Expected Behavior**:
- Frontend should detect port conflict
- Either fail with error OR bind to alternative port (acceptable)
- Clear message about port status

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Exit Code**: `[PENDING]`

**Result**: ⏳ PENDING

---

### Invariant A: FINAL VERDICT

**Status**: ⏳ PENDING  
**Justification**: [TO BE DETERMINED AFTER TESTING]

---

## Invariant B: Config Drift Detection

**CLAIM**: Configuration inconsistencies are detected and block startup/deployment

### Test B1: Port Drift Detection

**Timestamp**: `[PENDING]`

**Test Command**:
```powershell
.\scripts\validate-config-consistency.ps1 -Verbose
```

**Expected Behavior**:
- Validates port consistency across frontend/backend/tunnel configs
- Reports any mismatches
- Exit code: 0=OK, 1=Warnings, 2=Errors, 3=Critical

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Exit Code**: `[PENDING]`

**Result**: ⏳ PENDING

---

### Test B2: Intentional Drift Injection

**Timestamp**: `[PENDING]`

**Setup**: Temporarily modify backend/.env to use PORT=9999

**Test Command**:
```powershell
# Backup original
Copy-Item backend\.env backend\.env.backup-test

# Inject drift
$content = Get-Content backend\.env
$content = $content -replace 'PORT=3001', 'PORT=9999'
Set-Content backend\.env $content

# Run validation
.\scripts\validate-config-consistency.ps1
```

**Expected Behavior**:
- Detect port mismatch (9999 vs expected 3001/3003)
- Exit with non-zero code
- Clear error message

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Cleanup Command**:
```powershell
Move-Item -Force backend\.env.backup-test backend\.env
```

**Exit Code**: `[PENDING]`

**Result**: ⏳ PENDING

---

### Test B3: Backend Startup Blocks on Drift

**Timestamp**: `[PENDING]`

**Test**: Does backend startup actually check config drift?

**Command**:
```powershell
cd backend
$env:V1_STABLE = "true"
npm start
```

**Expected Behavior**:
- If config drift validation is integrated, startup should run validation
- Critical drift should block startup

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Invariant B: FINAL VERDICT

**Status**: ⏳ PENDING  
**Justification**: [TO BE DETERMINED AFTER TESTING]

---

## Invariant C: Unified Readiness Endpoint

**CLAIM**: /ops/health/production is authoritative and consistent across local/production/scripts

### Test C1: Local Endpoint Response

**Timestamp**: `[PENDING]`

**Prerequisites**: Backend running on localhost:3001

**Test Command**:
```powershell
curl http://localhost:3001/ops/health/production
```

**Expected Response**:
```json
{
  "status": "ready" | "ready-degraded" | "down",
  "timestamp": "<ISO timestamp>",
  "checks": { ... }
}
```

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**HTTP Status**: `[PENDING]`

**Result**: ⏳ PENDING

---

### Test C2: Production Endpoint Response

**Timestamp**: `[PENDING]`

**Test Command**:
```powershell
curl https://api.care2connects.org/ops/health/production
```

**Expected Response**: Same schema as local

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**HTTP Status**: `[PENDING]`

**Result**: ⏳ PENDING

---

### Test C3: Scripts Use Unified Endpoint

**Timestamp**: `[PENDING]`

**Audit Commands**:
```powershell
# Check which scripts reference the unified endpoint
Select-String -Path "scripts\*.ps1" -Pattern "/ops/health/production" -CaseSensitive

# Check tunnel-start.ps1 uses it
Select-String -Path "scripts\tunnel-start.ps1" -Pattern "/ops/health/production" -Context 2

# Check monitor script uses it
Select-String -Path "scripts\monitor-production-tunnel.ps1" -Pattern "/ops/health/production" -Context 2
```

**Expected Behavior**:
- tunnel-start.ps1 should reference unified endpoint
- monitor-production-tunnel.ps1 should reference unified endpoint
- prod-verify.ps1 should reference unified endpoint

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Test C4: Response Consistency Check

**Timestamp**: `[PENDING]`

**Test**: Compare local vs production responses for same system state

**Command**:
```powershell
$local = Invoke-RestMethod -Uri "http://localhost:3001/ops/health/production"
$prod = Invoke-RestMethod -Uri "https://api.care2connects.org/ops/health/production"

# Compare schemas
$local | ConvertTo-Json -Depth 5
$prod | ConvertTo-Json -Depth 5
```

**Expected Behavior**: Same JSON schema structure

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Invariant C: FINAL VERDICT

**Status**: ⏳ PENDING  
**Justification**: [TO BE DETERMINED AFTER TESTING]

---

## Invariant D: Tunnel Fail-Fast

**CLAIM**: Tunnel start fails hard if origin (backend/frontend) unreachable

### Test D1: Tunnel Start With Dead Backend

**Timestamp**: `[PENDING]`

**Setup**:
```powershell
# Ensure backend is NOT running
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*backend*" } | Stop-Process -Force

# Verify port 3001 is free
netstat -ano | Select-String ":3001"
```

**Test Command**:
```powershell
.\scripts\tunnel-start.ps1
```

**Expected Behavior**:
- Tunnel script should check backend health before starting tunnel
- Should fail with clear error message
- Exit with non-zero code

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Exit Code**: `[PENDING]`

**Result**: ⏳ PENDING

---

### Test D2: Tunnel Start With Dead Frontend

**Timestamp**: `[PENDING]`

**Setup**:
```powershell
# Ensure frontend is NOT running
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*frontend*" } | Stop-Process -Force

# Verify port 3000 is free
netstat -ano | Select-String ":3000"
```

**Test Command**:
```powershell
.\scripts\tunnel-start.ps1
```

**Expected Behavior**:
- Tunnel script should check frontend health
- Should fail OR warn appropriately

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Exit Code**: `[PENDING]`

**Result**: ⏳ PENDING

---

### Test D3: Tunnel Behavior With IPv6 Disabled

**Timestamp**: `[PENDING]`

**Test Command**:
```powershell
# Check tunnel config includes --edge-ip-version 4
Get-Content C:\Users\richl\.cloudflared\config.yml | Select-String "edge-ip-version"

# Check tunnel-start.ps1 includes --edge-ip-version 4
Get-Content scripts\tunnel-start.ps1 | Select-String "edge-ip-version"
```

**Expected Behavior**: Should find --edge-ip-version 4 flag

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Invariant D: FINAL VERDICT

**Status**: ⏳ PENDING  
**Justification**: [TO BE DETERMINED AFTER TESTING]

---

## Invariant E: Regression Tests Mandatory

**CLAIM**: Regression tests cannot be skipped - integrated into all deployment paths

### Test E1: PM2 Pre-Start Hook

**Timestamp**: `[PENDING]`

**Audit Command**:
```powershell
# Check ecosystem.prod.config.js for pre-start hooks
Get-Content ecosystem.prod.config.js | Select-String "pre" -Context 3
```

**Expected Behavior**: Should find reference to regression tests in pre-deploy hooks

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Test E2: Package.json Scripts

**Timestamp**: `[PENDING]`

**Audit Command**:
```powershell
# Check frontend package.json for regression test scripts
Get-Content frontend\package.json | Select-String "test:regression" -Context 2

# Check root package.json
Get-Content package.json | Select-String "test:regression" -Context 2
```

**Expected Behavior**: Should find test:regression scripts

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Test E3: VS Code Tasks

**Timestamp**: `[PENDING]`

**Audit Command**:
```powershell
# Check tasks.json for regression test task
Get-Content .vscode\tasks.json | Select-String "Critical Path Regression" -Context 5
```

**Expected Behavior**: Should find task defined

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Test E4: Actual Test Execution

**Timestamp**: `[PENDING]`

**Test Command**:
```powershell
.\scripts\critical-path-regression-tests.ps1 -Quick
```

**Expected Behavior**:
- Tests execute successfully
- Exit with 0 if all pass
- Exit with non-zero if any fail

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Exit Code**: `[PENDING]`

**Result**: ⏳ PENDING

---

### Invariant E: FINAL VERDICT

**Status**: ⏳ PENDING  
**Justification**: [TO BE DETERMINED AFTER TESTING]

---

## Invariant F: OpenAI Disabled

**CLAIM**: In ZERO_OPENAI_MODE, OpenAI is completely disabled - no code path calls it even if key exists

### Test F1: Health Endpoint Reports OpenAI Status

**Timestamp**: `[PENDING]`

**Test Command**:
```powershell
$env:ZERO_OPENAI_MODE = "true"
# Start backend or curl existing instance
curl http://localhost:3001/ops/health/production | ConvertFrom-Json | Select-Object -ExpandProperty openai
```

**Expected Response**:
```json
{
  "openai": "disabled"
}
```

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Test F2: Grep for OpenAI Usage

**Timestamp**: `[PENDING]`

**Audit Commands**:
```powershell
# Search for OpenAI imports
Select-String -Path "backend\src\**\*.ts" -Pattern "openai" -CaseSensitive

# Search for OPENAI_API_KEY usage
Select-String -Path "backend\src\**\*.ts" -Pattern "OPENAI_API_KEY"

# Search for ChatGPT/GPT references
Select-String -Path "backend\src\**\*.ts" -Pattern "(ChatGPT|GPT-|gpt-)" -CaseSensitive
```

**Expected Behavior**:
- Should find ZERO references in active code paths
- Or all references should be in legacy/unused code
- Or all references should be wrapped in ZERO_OPENAI_MODE checks

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Test F3: Environment Variable Audit

**Timestamp**: `[PENDING]`

**Audit Commands**:
```powershell
# Check all .env files for OPENAI_API_KEY
Get-ChildItem -Recurse -Filter ".env*" | ForEach-Object {
    Write-Host "`n=== $($_.FullName) ==="
    Get-Content $_.FullName | Select-String "OPENAI_API_KEY"
}
```

**Expected Behavior**:
- May exist in .env files (historical)
- Should be ignored when ZERO_OPENAI_MODE=true

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Test F4: Code Path Verification

**Timestamp**: `[PENDING]`

**Audit**: Check if any code path uses OpenAI without checking ZERO_OPENAI_MODE

**Command**:
```powershell
# Find all files mentioning openai
$files = Select-String -Path "backend\src\**\*.ts" -Pattern "openai" -List

# For each file, check if ZERO_OPENAI_MODE is checked
foreach ($file in $files) {
    Write-Host "`n=== $($file.Path) ==="
    $content = Get-Content $file.Path -Raw
    if ($content -match "ZERO_OPENAI_MODE") {
        Write-Host "✅ Has ZERO_OPENAI_MODE check"
    } else {
        Write-Host "⚠️ NO ZERO_OPENAI_MODE check found"
    }
}
```

**Expected Behavior**: All OpenAI usage should check ZERO_OPENAI_MODE first

**Actual Output**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Invariant F: FINAL VERDICT

**Status**: ⏳ PENDING  
**Justification**: [TO BE DETERMINED AFTER TESTING]

---

## 🔥 PHASE 2: Failure Injection Simulation Results

### Simulation 1: Backend Port Conflict

**Timestamp**: `[PENDING]`

**Scenario**: Port 3001 already in use by another process

**Simulation Command**: (See scripts/invariant-failure-sim.ps1)

**Expected Outcome**:
- Backend fails to start
- Clear error message with conflicting PID
- Exit code non-zero
- /ops/health/production returns 503 or unreachable

**Actual Outcome**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Simulation 2: Frontend Port Conflict

**Timestamp**: `[PENDING]`

**Scenario**: Port 3000 already in use

**Expected Outcome**:
- Frontend fails to start OR binds to alternative port
- Clear messaging

**Actual Outcome**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Simulation 3: Tunnel Origin Unreachable

**Timestamp**: `[PENDING]`

**Scenario**: Backend/frontend stopped, tunnel-start.ps1 executed

**Expected Outcome**:
- tunnel-start.ps1 checks health first
- Fails with non-zero exit
- Does NOT start tunnel

**Actual Outcome**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Simulation 4: Stale Cloudflared Process

**Timestamp**: `[PENDING]`

**Scenario**: Old cloudflared process running with outdated config

**Expected Outcome**:
- New tunnel start detects existing process
- Either kills and restarts OR warns user
- Does not create duplicate tunnel

**Actual Outcome**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Simulation 5: Config Drift (Tunnel Points to Wrong Port)

**Timestamp**: `[PENDING]`

**Scenario**: Tunnel config points to 3003, backend actually on 3001

**Expected Outcome**:
- Config validation detects mismatch
- Blocks startup OR warns clearly

**Actual Outcome**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Simulation 6: Zombie Node Processes

**Timestamp**: `[PENDING]`

**Scenario**: Crashed node processes holding ports

**Expected Outcome**:
- Port conflict detection identifies zombie PIDs
- Clear error message to kill specific PID

**Actual Outcome**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

### Simulation 7: PM2 False Positive

**Timestamp**: `[PENDING]`

**Scenario**: PM2 shows "online" but process is actually dead (0b memory)

**Expected Outcome**:
- Health checks detect process is not responding
- /ops/health/production returns "down"
- Monitoring alerts trigger

**Actual Outcome**:
```
[PENDING - ACTUAL OUTPUT WILL BE INSERTED]
```

**Result**: ⏳ PENDING

---

## 🔧 PHASE 3: Gaps Discovered and Minimal Patches

### Gap 1: [TO BE DETERMINED]

**Issue**: [DESCRIBE GAP IF FOUND]

**Root Cause**: [ANALYSIS]

**Minimal Patch**: [CODE CHANGES]

**Re-test Result**: [OUTCOME]

---

### Gap 2: [TO BE DETERMINED]

(Add sections as gaps are discovered)

---

## ✅ Final Evidence Summary

### Invariants Proven

| Invariant | Status | Confidence | Notes |
|-----------|--------|------------|-------|
| A - Port Conflicts | ⏳ PENDING | N/A | [Awaiting test results] |
| B - Config Drift | ⏳ PENDING | N/A | [Awaiting test results] |
| C - Unified Endpoint | ⏳ PENDING | N/A | [Awaiting test results] |
| D - Tunnel Fail-Fast | ⏳ PENDING | N/A | [Awaiting test results] |
| E - Tests Mandatory | ⏳ PENDING | N/A | [Awaiting test results] |
| F - OpenAI Disabled | ⏳ PENDING | N/A | [Awaiting test results] |

### Failure Simulations Passed

| Simulation | Status | Notes |
|------------|--------|-------|
| Backend Port Conflict | ⏳ PENDING | [Awaiting test] |
| Frontend Port Conflict | ⏳ PENDING | [Awaiting test] |
| Origin Unreachable | ⏳ PENDING | [Awaiting test] |
| Stale Tunnel Process | ⏳ PENDING | [Awaiting test] |
| Config Drift | ⏳ PENDING | [Awaiting test] |
| Zombie Processes | ⏳ PENDING | [Awaiting test] |
| PM2 False Positive | ⏳ PENDING | [Awaiting test] |

### Known Remaining Risks

[TO BE COMPLETED AFTER ALL TESTING]

---

**Evidence Pack Status**: 🔬 TESTING IN PROGRESS  
**Last Updated**: January 13, 2026  
**Next Action**: Execute invariant tests and failure simulations
