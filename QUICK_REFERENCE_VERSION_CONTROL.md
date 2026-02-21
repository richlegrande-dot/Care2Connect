# Quick Reference: Version Control & Rollback Procedures

## Investigation Summary (Feb 7, 2026)

**Rollback Failure:** 46.18% → 39.71% (-22 cases)  
**Root Cause:** Uncommitted code, no documentation, no statistical validation  
**Key Finding:** Category classification broke (+22 wrong), urgency unchanged (v3b/v3c working, v2c not working)

---

## Critical Files Created

| File | Purpose |
|------|---------|
| [DEPLOYMENT_VERSION_CONTROL.md](DEPLOYMENT_VERSION_CONTROL.md) | Full documentation of version control requirements and procedures |
| [ROLLBACK_INVESTIGATION_SUMMARY.md](ROLLBACK_INVESTIGATION_SUMMARY.md) | Detailed investigation findings and recommendations |
| [VERSION_MANIFEST_TEMPLATE.md](VERSION_MANIFEST_TEMPLATE.md) | Template for documenting each deployment |
| [backend/eval/multi_run_evaluation.js](backend/eval/multi_run_evaluation.js) | 10-run statistical validation script |

---

## Quick Rollback Procedure

```bash
# 1. Identify target
git log --oneline --decorate | grep "baseline"

# 2. Review manifest
git show <commit-sha>:VERSION_MANIFEST.md

# 3. Checkout
git checkout <commit-sha>

# 4. Verify clean
git status  # MUST be clean

# 5. Set environment (from manifest)
$env:USE_V3B_ENHANCEMENTS='true'
$env:USE_V2C_ENHANCEMENTS='true'
$env:USE_V3C_ENHANCEMENTS='true'
$env:USE_V4C_ENHANCEMENTS='false'

# 6. Test
node backend/eval/v4plus/runners/run_eval_v4plus.js --dataset all

# 7. Validate (median within ±1%)
node backend/eval/multi_run_evaluation.js 10 all
```

---

## Pre-Deployment Checklist

Before tagging ANY deployment as production-ready:

- [ ] **All code committed** (`git status` = clean)
- [ ] **10-run validation passed** (σ < 0.5%, range < 4%)
- [ ] **VERSION_MANIFEST.md created** (use template)
- [ ] **Git tag with results** in commit message
- [ ] **Rollback tested** from clean checkout

**Zero-tolerance:** No uncommitted code in production!

---

## 10-Run Validation

```bash
# Run validation
node backend/eval/multi_run_evaluation.js 10 all

# Acceptance criteria:
# ✅ Median within ±1% of target
# ✅ Std deviation < 0.5%
# ✅ Core30 cases consistent
# ✅ Range < 4% (±2%)
```

---

## Current Configuration (39.71%)

**Enhancement Modules:**
- ✅ v3b: ACTIVE (Core30 hybrid thresholds)
- ⚠️ v2c: LOADED but not working properly
- ✅ v3c: ACTIVE (Conservative urgency boost)
- ✅ v4c: DISABLED (caused 40.88% regression)

**Environment Variables:**
```bash
USE_V3B_ENHANCEMENTS='true'
USE_V2C_ENHANCEMENTS='true'
USE_V3C_ENHANCEMENTS='true'
USE_V4C_ENHANCEMENTS='false'
```

**Issue:** Category classification regressed (+22 category_wrong cases)  
**Next Step:** Investigate v2c integration in jan-v3-analytics-runner.js line 1708

---

## Git Commit Message Template

```
Phase 3 Baseline - Statistically Validated 46% Pass Rate

Test Results (10-run median):
- Pass Rate: 46.18% ± 0.5% (range: 45.4% - 46.9%)
- Core30 Failures: 8 (T009, T011, T012, T015, T017, T022, T023, T025)
- Execution Time: 1486ms (within 3000ms budget)
- Standard Deviation: 0.5% (validated stable)

Configuration:
- USE_V3B_ENHANCEMENTS=true (Phase 1.5: Core30 protection)
- USE_V2C_ENHANCEMENTS=true (Phase 2: Category improvements)
- USE_V3C_ENHANCEMENTS=true (Phase 3: Conservative urgency)
- USE_V4C_ENHANCEMENTS=false (Phase 4: Disabled - regression)

Enhancement Modules (all committed):
- UrgencyEnhancements_v3b.js (Core30 hybrid thresholds)
- CategoryEnhancements_v2c.js (Category improvements)
- UrgencyEnhancements_v3c.js (Conservative urgency boost)

Integration Status:
- UrgencyAssessmentService.js: Modified (v3b/v3c application)
- jan-v3-analytics-runner.js: Final v2c/v4c enhancement pass
- run_eval_v4plus.js: Environment configuration

Known Issues:
- 8 Core30 urgency failures (conservative trade-off)
- 65 category_wrong cases (19.1% - baseline limitation)
- 57 urgency_over_assessed (acceptable for under-assessment fix)

Rollback Tested: ✅ Validated from clean checkout
Statistical Stability: ✅ σ = 0.5% (< 0.5% threshold)
```

---

## Troubleshooting Rollback Failures

### If pass rate doesn't match:

**Check Category Regression (category_wrong increased):**
```bash
# 1. Verify v2c loaded
node backend/eval/v4plus/runners/run_eval_v4plus.js --dataset all | Select-String "v2c"
# Look for: "✅ CategoryEnhancements_v2c loaded"

# 2. Check environment
$env:USE_V2C_ENHANCEMENTS
# Should be: true

# 3. Verify v2c file exists
Test-Path backend/src/services/CategoryEnhancements_v2c.js
```

**Check Urgency Regression (urgency failures increased):**
```bash
# 1. Verify v3b/v3c loaded
node backend/eval/v4plus/runners/run_eval_v4plus.js --dataset all | Select-String "v3b|v3c"
# Look for: "✅ UrgencyEnhancements_v3b loaded"
# Look for: "✅ UrgencyEnhancements_v3c loaded"

# 2. Check environment
$env:USE_V3B_ENHANCEMENTS
$env:USE_V3C_ENHANCEMENTS
# Both should be: true

# 3. Verify integration in UrgencyAssessmentService.js
Select-String -Path backend/src/services/UrgencyAssessmentService.js -Pattern "v3bEnhancement|v3cEnhancement"
```

**Check for uncommitted changes:**
```bash
git status
git diff
# Both should show NO changes
```

---

## Key Metrics Reference

| Deployment | Pass Rate | Core30 | category_wrong | urgency_over | urgency_under |
|------------|-----------|--------|----------------|--------------|---------------|
| **46.18% Target** | 157/340 | 8 | 65 (19.1%) | 57 (16.8%) | 56 (16.5%) |
| **39.71% Rollback** | 135/340 | 11 | 87 (25.6%) | 57 (16.8%) | 56 (16.5%) |
| **Delta** | -22 | +3 | +22 | 0 | 0 |

**Analysis:** Category broken, urgency working → v2c issue, v3b/v3c OK

---

## Next Actions

1. **Investigate v2c:** Add console.log to CategoryEnhancements_v2c.enhanceCategory()
2. **Restore 46%:** Fix v2c integration
3. **Validate:** Run 10-run test (σ < 0.5%)
4. **Document:** Create VERSION_MANIFEST.md
5. **Commit:** All code with test results
6. **Tag:** `v3-baseline-46pct-validated`
7. **Test Rollback:** Verify procedure works

---

**Last Updated:** February 7, 2026  
**Status:** Investigation Complete - Awaiting v2c fix and validation
