# Production Invariants Documentation
**PRODUCTION HARDENING STATUS**: All production invariants implemented and operational  
**PURPOSE**: Document why specific hardening measures exist to prevent institutional memory loss  
**AUDIENCE**: Current and future contributors to prevent reintroduction of failure modes

---

## 🛡️ Production Invariant System

This system implements **production invariants** - conditions that MUST be true for the system to be considered "production ready". These invariants prevent the reintroduction of failure modes that caused the January 11, 2026 production incident.

### What Are Production Invariants?

Production invariants are **hard guarantees** enforced by code, not just documentation or best practices:
- ✅ **Enforceable**: Automated validation prevents violations
- ✅ **Fail-Fast**: System refuses to start if invariants are violated
- ✅ **Observable**: Current status is always visible and measurable  
- ✅ **Immutable**: Cannot be accidentally disabled or bypassed

---

## 🚨 Critical Production Invariants

### 1. Hard Failure Enforcement
**INVARIANT**: No "false green" states where tests pass but production fails  
**IMPLEMENTATION**: All critical failures result in non-zero exit codes

```typescript
// Backend environment validation (backend/src/server.ts)
if (isProduction && !envValidation.isValid) {
  console.error('🚨 [STARTUP] PRODUCTION MODE: Cannot start with environment validation errors');
  process.exit(1); // HARD EXIT - no exceptions
}
```

**WHY THIS EXISTS**: Original incident had PM2 showing "online" status while service was non-functional. This invariant ensures process status reflects actual service health.

### 2. Unified Readiness Contract  
**INVARIANT**: Single source of truth for production readiness assessment  
**IMPLEMENTATION**: Public `/ops/health/production` endpoint used by all automation

```javascript  
// All scripts now use unified endpoint (scripts/*)
$response = Invoke-RestMethod -Uri "https://api.care2connects.org/ops/health/production"
if ($response.status -notin @("ready", "ready-degraded")) {
  Write-Host "🚨 PRODUCTION NOT READY: $($response.message)" -ForegroundColor Red
  exit 1
}
```

**WHY THIS EXISTS**: Multiple health check endpoints created inconsistent results. Single contract prevents scripts from checking different endpoints.

### 3. Configuration Drift Immunity
**INVARIANT**: Configuration consistency across all components is automatically validated  
**IMPLEMENTATION**: Startup validation prevents mismatched configurations

```typescript
// Config drift validation (backend/src/config/configDriftValidation.ts)
export async function validateConfigDrift(): Promise<ConfigDriftResult> {
  // Validates port consistency, environment vars, API URLs, tunnel config
  const criticalIssues = allIssues.filter(issue => issue.severity === 'CRITICAL');
  return { valid: criticalIssues.length === 0, issues: allIssues };
}
```

**WHY THIS EXISTS**: Original incident caused by port configuration drift (docs said 3003, reality was 3001). This prevents all forms of configuration inconsistency.

### 4. IPv4 Tunnel Forcing
**INVARIANT**: Cloudflare tunnel MUST use IPv4 only to prevent Windows networking issues  
**IMPLEMENTATION**: `--edge-ip-version 4` parameter always applied

```powershell
# Tunnel startup (scripts/tunnel-start.ps1)  
$tunnelArgs += @("--edge-ip-version", "4")  # CRITICAL: Force IPv4 only
Write-Host "🔒 IPv4-only edge routing enabled (prevents ::1 connection issues)" -ForegroundColor Cyan
```

**WHY THIS EXISTS**: Original incident caused by IPv6/IPv4 binding incompatibility (`dial tcp [::1]:3000: connectex: No connection could be made`). IPv4 forcing eliminates this entire class of failures.

### 5. Critical Path Regression Safety Net
**INVARIANT**: Essential demo functionality must be validated before any deployment  
**IMPLEMENTATION**: Impossible-to-skip regression tests covering actual demo flow

```powershell
# Critical path validation (scripts/critical-path-regression-tests.ps1)
# Tests: Backend start, Frontend start, Tell Your Story page, Integration, Production URL
if ($criticalFailures -gt 0) {
  Write-Host "🚨 CRITICAL PATH FAILURES DETECTED" -ForegroundColor Red
  Write-Host "🛑 DEPLOYMENT BLOCKED until issues resolved" -ForegroundColor Red
  exit 3  # HARD BLOCK
}
```

**WHY THIS EXISTS**: Original incident occurred during live demo due to lack of pre-demo validation. This tests the EXACT demo flow to prevent false confidence.

---

## 🔍 Observability and Monitoring

### Real-Time Invariant Status

#### Production Readiness Endpoint
```bash
# Single source of truth for production status
curl https://api.care2connects.org/ops/health/production

# Returns:
# 200 + {"status": "ready"} = All invariants satisfied
# 200 + {"status": "ready-degraded"} = Core invariants OK, warnings present  
# 503 + {"status": "down"} = Critical invariants violated
```

#### Configuration Drift Monitoring
```powershell
# Validate all configuration consistency
.\scripts\validate-config-consistency.ps1

# Exit codes:
# 0 = No drift detected
# 1 = Warnings (StrictMode treats as errors)
# 2 = Errors detected
# 3 = Critical configuration issues
```

#### Regression Test Status
```powershell
# Validate critical demo functionality
.\scripts\critical-path-regression-tests.ps1

# Exit codes:
# 0 = All tests passed
# 1 = Warnings only (demo can proceed)
# 2 = StrictMode warnings
# 3 = Critical failures (deployment blocked)
```

---

## 🚀 Integration Points

### Startup Integration
All services validate invariants on startup:
- **Backend**: Environment validation, config drift check, port validation
- **Frontend**: Backend connectivity, configuration validation
- **Tunnel**: Health verification, IPv4 forcing, endpoint validation

### Deployment Integration  
All deployment paths enforce invariants:
- **PM2**: Pre-start validation hooks 
- **Package.json**: Regression test scripts
- **VS Code Tasks**: Integrated validation commands
- **Production Checklist**: Mandatory regression tests

### CI/CD Integration (Future)
```yaml
# .github/workflows/deploy.yml (template)
- name: Validate Production Invariants
  run: |
    .\scripts\validate-config-consistency.ps1 -StrictMode
    .\scripts\critical-path-regression-tests.ps1 -StrictMode
```

---

## ⚠️ Institutional Memory Protection

### Why These Specific Measures?

Each production invariant addresses a specific failure mode from the January 11, 2026 incident:

| Original Failure Mode | Invariant Solution | Prevention Mechanism |
|----------------------|-------------------|---------------------|
| **PM2 showing "online" with 0MB memory** | Hard failure enforcement | Process status must reflect actual service health |
| **Port config drift (docs ≠ reality)** | Config drift immunity | Automatic validation prevents any configuration inconsistency |
| **IPv6/IPv4 binding issues on Windows** | IPv4 tunnel forcing | Eliminates entire class of networking failures |
| **No pre-demo validation** | Critical path regression tests | Tests actual demo flow, impossible to skip |
| **Multiple inconsistent health checks** | Unified readiness contract | Single source of truth for all automation |

### What NOT to Change

🚨 **CRITICAL**: The following configurations must NEVER be modified without understanding the failure modes they prevent:

1. **Never remove `--edge-ip-version 4`** from tunnel startup - this prevents IPv6/IPv4 binding failures
2. **Never bypass regression tests** in deployment paths - these test the actual demo flow
3. **Never use soft failures** for critical validation - hard exits prevent false confidence  
4. **Never create alternative health endpoints** - unified contract prevents inconsistency
5. **Never disable config drift validation** - prevents configuration inconsistency failures

### Future Contributor Guidelines

If you are modifying production deployment or validation logic:

✅ **DO**:
- Add new invariants for newly discovered failure modes
- Enhance existing validation to be more comprehensive  
- Improve error messages and diagnostics
- Add observability for invariant status

❌ **DON'T**:
- Soften hard failures to warnings
- Create bypass mechanisms for convenience
- Add configuration without drift validation
- Remove existing invariant validations

---

## 📋 Quick Reference Commands

### Daily Operations
```powershell
# Check all invariants before demo
.\scripts\critical-path-regression-tests.ps1 -DemoMode

# Validate configuration consistency  
.\scripts\validate-config-consistency.ps1

# Check production readiness
curl https://api.care2connects.org/ops/health/production
```

### Troubleshooting
```powershell
# If regression tests fail
.\scripts\critical-path-regression-tests.ps1 -Verbose

# If config drift detected
.\scripts\validate-config-consistency.ps1 -FixDrift

# If production not ready
curl https://api.care2connects.org/ops/ready  # Detailed admin view
```

---

**SUMMARY**: These production invariants exist because **they directly prevented a class of failures that caused a live demo to fail**. They are not theoretical best practices - they are proven solutions to real production failures. Future contributors must understand this context to avoid reintroducing the same failure modes.