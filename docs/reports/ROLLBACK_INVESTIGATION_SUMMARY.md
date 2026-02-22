# Rollback Investigation Summary - February 7, 2026

## Executive Summary

**Problem:** Attempted rollback to 46.18% baseline achieved only 39.71% (-22 cases, -6.47 percentage points)

**Root Cause:** Incomplete documentation - 46.18% baseline existed only as uncommitted code with no version tracking

**Impact:** Category classification regressed by exactly +22 wrong classifications (Core30 +3 failures)

---

## Key Findings

### 1. Regression Analysis

| Metric | 46.18% Target | 39.71% Achieved | Delta |
|--------|---------------|-----------------|-------|
| Pass Rate | 157/340 | 135/340 | **-22 cases** |
| Core30 Failures | 8 | 11 | **+3** |
| category_wrong | 65 (19.1%) | 87 (25.6%) | **+22** |
| urgency_over | 57 (16.8%) | 57 (16.8%) | 0 |
| urgency_under | 56 (16.5%) | 56 (16.5%) | 0 |

**Critical Insight:** Urgency metrics identical → v3b/v3c working. Category metrics regressed → v2c not working properly.

### 2. New Core30 Failures (All Category-Related)
- **T002:** categoryMatch failure
- **T013:** categoryMatch failure  
- **T030:** categoryMatch failure

### 3. Uncommitted Dependencies
```
M  backend/src/services/UrgencyAssessmentService.js  (v3b/v3c integration)
M  backend/src/services/storyExtractionService.ts
?? backend/src/services/CategoryEnhancements_v2c.js  (Phase 2 - REQUIRED)
?? backend/src/services/UrgencyEnhancements_v3b.js   (Phase 1.5 - REQUIRED)
?? backend/src/services/UrgencyEnhancements_v3c.js   (Phase 3 - REQUIRED)
```

---

## Missing Documentation (Why Rollback Failed)

### ❌ What Was Missing:

1. **Git Commit Status** - 46% existed only as uncommitted code
2. **Module Dependencies** - No record of which enhancement files required
3. **Environment Variables** - No verification checklist
4. **Integration Code** - v3b/v3c application logic in UrgencyAssessmentService.js unmarked
5. **Statistical Validation** - Single test run, no stability proof
6. **Category Enhancement Status** - v2c integration not verified

### ✅ What Should Exist:

1. **All code committed** with descriptive message including test results
2. **VERSION_MANIFEST.md** with full configuration snapshot
3. **10-run median test results** (σ < 0.5%) proving stability
4. **Git tag** with pass rate in tag name (e.g., `v3-baseline-46pct-validated`)
5. **Integration status** documenting every modified file with line numbers
6. **Rollback procedure** with validation checklist

---

## Required Documentation Standards

### Deployment Manifest Template

```json
{
  "git": {
    "commit": "<full-sha>",
    "tag": "v3-baseline-46pct-validated",
    "uncommitted_changes": "none"
  },
  "enhancements": {
    "v3b": { "enabled": true, "file": "UrgencyEnhancements_v3b.js", "git_status": "committed" },
    "v2c": { "enabled": true, "file": "CategoryEnhancements_v2c.js", "git_status": "committed" },
    "v3c": { "enabled": true, "file": "UrgencyEnhancements_v3c.js", "git_status": "committed" },
    "v4c": { "enabled": false, "file": "CategoryEnhancements_v4c.js", "git_status": "committed" }
  },
  "environment": {
    "USE_V3B_ENHANCEMENTS": "true",
    "USE_V2C_ENHANCEMENTS": "true",
    "USE_V3C_ENHANCEMENTS": "true",
    "USE_V4C_ENHANCEMENTS": "false"
  },
  "test_results": {
    "median_pass_rate": 46.18,
    "std_dev": 0.5,
    "run_count": 10,
    "core30_failures": 8,
    "stable": true
  }
}
```

### 10-Run Validation Protocol

**Acceptance Criteria:**
- ✅ Median within ±1% of target
- ✅ Standard deviation < 0.5%
- ✅ Core30 failures consistent across runs
- ✅ No catastrophic outliers (±2% from median)

**Usage:**
```bash
node backend/eval/multi_run_evaluation.js 10 all
```

---

## Immediate Actions Required

### Phase 1: Investigate Category Regression
1. Add debug logging to jan-v3-analytics-runner.js line 1708
2. Verify CategoryEnhancements_v2c.enhanceCategory() is called
3. Compare category classifications between 46% and 39% runs
4. Identify why +22 cases now classified incorrectly

### Phase 2: Restore Full Integration
1. Verify v2c module loading: `console.log` in v2c.enhanceCategory()
2. Check environment variable: `USE_V2C_ENHANCEMENTS='true'`
3. Test single case showing category regression
4. Fix integration if broken

### Phase 3: Document Working Configuration
1. Run single test → verify 46% restored
2. Run 10-run validation → prove stability
3. Commit all code with full test results in commit message
4. Create VERSION_MANIFEST.md
5. Tag commit: `v3-baseline-46pct-validated`

### Phase 4: Test Rollback Procedure
1. Make trivial change and commit
2. Follow rollback procedure in DEPLOYMENT_VERSION_CONTROL.md
3. Verify 46% restored successfully
4. Document any additional steps discovered

---

## Rollback Checklist (Updated)

```bash
# Pre-Rollback
[ ] Identify target commit SHA
[ ] Read VERSION_MANIFEST.md from target
[ ] Verify all enhancement modules exist in target commit
[ ] Document current state for comparison

# Execute Rollback
[ ] git checkout <target-sha>
[ ] Verify: git status shows "working tree clean"
[ ] Set all environment variables from VERSION_MANIFEST.md
[ ] Verify all enhancement modules loaded (check console logs)

# Validate
[ ] Run single test: node backend/eval/v4plus/runners/run_eval_v4plus.js --dataset all
[ ] Compare pass rate: within ±1% of manifest? 
[ ] Compare Core30 failures: same count and cases?
[ ] Compare failure buckets: category_wrong within ±5 cases?

# If Validation Fails
[ ] Check environment variables: Get-ChildItem env: | Select-String "V2C|V3B|V3C"
[ ] Check module loading: Look for "Enhancement loaded" messages
[ ] Compare git diff: git diff <target-sha> (should be empty)
[ ] Check failure pattern: category vs urgency regression identifies broken module
```

---

## Prevention Measures

### Mandatory Before Production:
1. ✅ All code committed (no uncommitted files)
2. ✅ 10-run validation completed (σ < 0.5%)
3. ✅ VERSION_MANIFEST.md created
4. ✅ Git tag with test results
5. ✅ Rollback procedure tested

### Zero-Tolerance Policies:
- **No uncommitted code in production deployments**
- **No deployment acceptance without 10-run validation**
- **No git tags without VERSION_MANIFEST.md**
- **No "stable" claims without statistical proof (σ < 0.5%)**

---

## Tools Created

### 1. DEPLOYMENT_VERSION_CONTROL.md
- Full documentation of version control requirements
- Rollback procedure with validation steps
- Git commit message template with test results
- VERSION_MANIFEST.md schema and examples

### 2. multi_run_evaluation.js
- Automated 10-run testing with statistics
- Calculates median, mean, std dev, min, max
- Checks acceptance criteria automatically
- Generates detailed JSON report
- Saves to: `backend/eval/v4plus/reports/multi-run-validations/`

---

## Current Status

**Configuration:**
- ✅ v3b enhancements: ACTIVE (Core30 hybrid thresholds)
- ✅ v3c enhancements: ACTIVE (Conservative urgency boosting)
- ⚠️  v2c enhancements: LOADED but not working as expected
- ✅ v4c enhancements: DISABLED (caused 40.88% regression)

**Next Steps:**
1. Investigate v2c category enhancement application
2. Restore 46% pass rate
3. Run 10-run validation
4. Commit everything with VERSION_MANIFEST.md
5. Tag as `v3-baseline-46pct-validated`

---

## Lessons Learned

### What Went Wrong:
1. **Assumed git history contained working code** → It didn't (uncommitted)
2. **Accepted single 46% test as stable** → No proof of reproducibility
3. **No dependency documentation** → Unknown which modules required
4. **No integration tracking** → Lost track of code modifications
5. **No rollback testing** → Procedure never validated

### What Changed:
1. **Zero-tolerance for uncommitted production code**
2. **Mandatory 10-run validation (σ < 0.5%)**
3. **Full VERSION_MANIFEST.md for every deployment**
4. **Git tags must include test results**
5. **Rollback procedures must be tested before production**

---

**Document Version:** 1.0  
**Investigation Date:** February 7, 2026  
**Investigator:** AI Assistant  
**Status:** Investigation Complete - Actions Pending
