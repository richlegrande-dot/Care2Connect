# Deployment Version Control & Rollback Documentation

**Created:** February 7, 2026  
**Purpose:** Document exact configurations, test results, and rollback procedures for successful deployments

## Critical Finding: Rollback Failure Analysis

### Background
- **Target:** Rollback to 46.18% baseline configuration
- **Achieved:** 39.71% (REGRESSION of -22 cases)
- **Root Cause:** Incomplete documentation of deployment dependencies

---

## Investigation Report: 46.18% vs 39.71% Comparison

### Deployment Comparison Table

| Metric | 46.18% Baseline (18:59:56) | 39.71% Rollback (19:34:44) | Delta |
|--------|---------------------------|---------------------------|-------|
| **Pass Rate** | 157/340 cases | 135/340 cases | **-22 cases** |
| **Core30 Failures** | 8 failures | 11 failures | **+3 failures** |
| **category_wrong** | 65 cases (19.1%) | 87 cases (25.6%) | **+22 cases** |
| **urgency_over_assessed** | 57 cases (16.8%) | 57 cases (16.8%) | No change |
| **urgency_under_assessed** | 56 cases (16.5%) | 56 cases (16.5%) | No change |
| **Execution Time** | 1486ms | 1435ms | -51ms |

### Critical Finding

**The regression is EXCLUSIVELY in category classification:**
- ✅ **Urgency assessment unchanged** (57 over, 56 under - identical)
- ❌ **Category classification regressed by exactly +22 wrong classifications**
- ❌ **3 new Core30 failures:** T002, T013, T030 (ALL categoryMatch failures)

**Conclusion:** The 46.18% baseline requires specific category enhancement logic that was not properly captured in version control.

---

## Core30 Regression Analysis

### NEW Failures in 39.71% Rollback

| Case ID | Score | Expected | Failed Field | Issue |
|---------|-------|----------|--------------|-------|
| **T002** | 75% | 100% | categoryMatch | Category classification wrong |
| **T013** | 75% | 100% | categoryMatch | Category classification wrong |
| **T030** | 75% | 100% | categoryMatch | Category classification wrong |

### Shared Failures (Present in Both)

| Case ID | Score | Expected | Failed Field | Issue |
|---------|-------|----------|--------------|-------|
| T009 | 75% | 100% | urgencyMatch | Urgency under-assessment |
| T011 | 50%/75% | 100% | Various | Mixed category + urgency |
| T012 | 75% | 100% | urgencyMatch | Urgency assessment |
| T015 | 75% | 100% | urgencyMatch | Urgency assessment |
| T017 | 50%/75% | 100% | Various | Mixed category + urgency |
| T022 | 75% | 100% | urgencyMatch | Urgency assessment |
| T023 | 75% | 100% | urgencyMatch | Urgency assessment |
| T025 | 75% | 100% | urgencyMatch | Urgency assessment |

---

## Missing Documentation Elements (Root Cause)

### 1. ❌ Git Commit Status
**Problem:** 46.18% baseline exists only as uncommitted code modifications

**Uncommitted Files Found:**
```
M  backend/src/services/UrgencyAssessmentService.js
M  backend/src/services/storyExtractionService.ts
?? backend/src/services/CategoryEnhancements_v2c.js
?? backend/src/services/CategoryEnhancements_v3b.js
?? backend/src/services/UrgencyEnhancements_v3b.js
?? backend/src/services/UrgencyEnhancements_v3c.js
```

**Impact:** Simple "git checkout" revert destroyed working configuration, causing catastrophic 30.88% failure.

### 2. ❌ Module Dependency Tracking
**Problem:** No documentation of WHICH enhancement modules are required for 46% baseline

**Required Dependencies (discovered post-failure):**
- ✅ UrgencyEnhancements_v3b.js (Phase 1.5: Core30 hybrid thresholds)
- ✅ UrgencyEnhancements_v3c.js (Phase 3: Conservative urgency boosting)
- ✅ CategoryEnhancements_v2c.js (Phase 2: Category improvements)
- ❌ CategoryEnhancements_v4c.js (Phase 4: DISABLED - caused 40.88% regression)

### 3. ❌ Environment Variable State
**Problem:** No verification that all required environment variables are set

**Required Configuration:**
```bash
USE_V3B_ENHANCEMENTS='true'   # Phase 1.5: Core30 protection
USE_V2C_ENHANCEMENTS='true'   # Phase 2: Category improvements  
USE_V3C_ENHANCEMENTS='true'   # Phase 3: Conservative urgency enhancements
USE_V4C_ENHANCEMENTS='false'  # Phase 4: DISABLED - regression
```

### 4. ❌ Code Integration Status
**Problem:** Enhancement modules exist but integration code may be incomplete

**Discovered Issue:** UrgencyAssessmentService.js modifications to apply v3b/v3c logic were uncommitted and partially lost during rollback attempts.

### 5. ❌ Statistical Validation Missing
**Problem:** Single 46.18% test run - no verification of stability vs "one-time luck"

**Current Status:** Unknown if 46% is reproducible or statistical outlier

**Required:** 10-run median testing protocol to confirm deployment stability

### 6. ❌ Category Enhancement Integration
**Problem:** CategoryEnhancements_v2c.js is loaded but may not be properly integrated in evaluation flow

**Symptom:** +22 category_wrong failures suggest v2c not working as expected in 39.71% rollback

---

## Required Documentation Standards

### A. Version Control Requirements

#### Mandatory Pre-Deployment Checklist:
- [ ] **All code committed to git** (no uncommitted changes in working directory)
- [ ] **All enhancement modules committed** (v2c, v3b, v3c files tracked)
- [ ] **Git tag created** with format: `v{phase}-baseline-{percent}pct-validated`
- [ ] **Environment variables documented** in VERSION_MANIFEST.md
- [ ] **Test results attached** to git commit message

#### Example Git Commit Message:
```
Phase 3 Baseline - Statistically Validated 46% Pass Rate

Test Results (10-run median):
- Pass Rate: 46.18% ± 0.8% (median: 46.18%, range: 45.4% - 46.9%)
- Core30 Failures: 8 (T009, T011, T012, T015, T017, T022, T023, T025)
- Execution Time: 1486ms (within 3000ms budget)
- Standard Deviation: 0.5% (acceptable)

Configuration:
- USE_V3B_ENHANCEMENTS=true
- USE_V2C_ENHANCEMENTS=true
- USE_V3C_ENHANCEMENTS=true
- USE_V4C_ENHANCEMENTS=false

Dependencies:
- UrgencyEnhancements_v3b.js (Core30 hybrid thresholds)
- UrgencyEnhancements_v3c.js (Conservative urgency boosting)
- CategoryEnhancements_v2c.js (Category improvements)

Integration Status:
- UrgencyAssessmentService.js: Modified to apply v3b hybrid thresholds + v3c boosts
- jan-v3-analytics-runner.js: v2c/v4c enhancement flow configured
- run_eval_v4plus.js: Environment variables configured

Known Issues:
- 8 Core30 failures remaining (urgency under-assessment)
- category_wrong: 65 cases (19.1%) - requires Phase 4 improvements
- urgency_under_assessed: 56 cases (16.5%) - may need additional v3c tuning
```

### B. Deployment Manifest (VERSION_MANIFEST.md)

#### Required Sections:

**1. Code Version**
- Git commit SHA (long format)
- Git branch name
- Git tag (if tagged deployment)
- Uncommitted changes status: MUST be "none" for production

**2. Enhancement Configuration**
```json
{
  "enhancements": {
    "v3b": {
      "enabled": true,
      "file": "backend/src/services/UrgencyEnhancements_v3b.js",
      "description": "Phase 1.5: Core30 hybrid thresholds (baseline 0.80/0.50 for protected cases)",
      "git_status": "committed"
    },
    "v2c": {
      "enabled": true,
      "file": "backend/src/services/CategoryEnhancements_v2c.js",
      "description": "Phase 2: Category improvements with Core30 protection",
      "git_status": "committed"
    },
    "v3c": {
      "enabled": true,
      "file": "backend/src/services/UrgencyEnhancements_v3c.js",
      "description": "Phase 3: Conservative urgency boosting (confidence 0.40/0.35/0.30)",
      "git_status": "committed"
    },
    "v4c": {
      "enabled": false,
      "file": "backend/src/services/CategoryEnhancements_v4c.js",
      "description": "Phase 4: Contextual category matching - DISABLED (caused 40.88% regression)",
      "git_status": "committed"
    }
  }
}
```

**3. Environment Variables**
```bash
# Urgency Enhancements
USE_V3B_ENHANCEMENTS='true'
USE_V3A_ENHANCEMENTS='false'  # Superseded by v3b
USE_V3C_ENHANCEMENTS='true'

# Category Enhancements
USE_V2C_ENHANCEMENTS='true'
USE_V4C_ENHANCEMENTS='false'

# Legacy Flags
USE_V2_URGENCY='false'  # Use v1 with enhancements, not v2
```

**4. Test Results (10-Run Median)**
```json
{
  "test_runs": 10,
  "dataset": "all",
  "total_cases": 340,
  "statistics": {
    "pass_rate": {
      "median": 46.18,
      "mean": 46.25,
      "std_dev": 0.5,
      "min": 45.4,
      "max": 46.9,
      "confidence_interval": "±0.8%"
    },
    "execution_time": {
      "median": 1486,
      "mean": 1492,
      "budget": 3000,
      "status": "within_budget"
    }
  },
  "core30_failures": {
    "count": 8,
    "cases": ["T009", "T011", "T012", "T015", "T017", "T022", "T023", "T025"],
    "stable": true
  },
  "failure_buckets": {
    "category_wrong": 65,
    "urgency_over_assessed": 57,
    "urgency_under_assessed": 56
  }
}
```

**5. Integration Status**
```
Files Modified for Integration:
- backend/src/services/UrgencyAssessmentService.js
  * Lines 20-43: v3b/v3c imports
  * Lines 51-82: Constructor initialization of v3bEnhancement, v3cEnhancement
  * Lines 271-310: assess() method - v3b hybrid thresholds + v3c boost application
  
- backend/eval/jan-v3-analytics-runner.js
  * Lines 16-25: v2c/v4c module loading
  * Lines 1690-1745: Final category enhancement pass (v2c then v4c)
  
- backend/eval/v4plus/runners/run_eval_v4plus.js
  * Lines 15-20: Environment variable configuration
```

**6. Known Issues and Limitations**
- List of Core30 failures with case IDs
- Top 3 failure buckets with counts
- Performance bottlenecks if any
- Stability concerns (if std dev > 1%)

### C. 10-Run Median Testing Protocol

#### Requirements:
1. **Run count:** Exactly 10 consecutive runs on same dataset
2. **Dataset:** "all" (340 cases including Core30)
3. **Environment:** No changes between runs
4. **Metrics captured:**
   - Pass rate (%)
   - Core30 failure count and case IDs
   - Total execution time (ms)
   - Top 5 failure buckets with counts

#### Acceptance Criteria:
- ✅ **Median within ±1% of target** (e.g., target 46%, acceptable range: 45%-47%)
- ✅ **Standard deviation < 0.5%** (proves stability, not luck)
- ✅ **Core30 failures consistent** (same cases failing across runs)
- ✅ **No catastrophic outliers** (min/max within ±2% of median)

#### Implementation Script: `multi_run_evaluation.js`

```javascript
/**
 * Multi-Run Evaluation for Statistical Validation
 * Runs evaluation N times and calculates median/statistics
 */

const { execSync } = require('child_process');
const fs = require('fs');

const RUN_COUNT = 10;
const DATASET = 'all';
const RUNNER_PATH = 'backend/eval/v4plus/runners/run_eval_v4plus.js';

async function runMultiEvaluation() {
  const results = [];
  
  console.log(`🔁 Running ${RUN_COUNT} evaluations for statistical validation...\n`);
  
  for (let i = 1; i <= RUN_COUNT; i++) {
    console.log(`📊 Run ${i}/${RUN_COUNT}...`);
    
    try {
      const output = execSync(`node ${RUNNER_PATH} --dataset ${DATASET}`, {
        encoding: 'utf-8'
      });
      
      // Parse results from output
      const passRateMatch = output.match(/STRICT.*?(\d+\.\d+)%.*?\((\d+)\/(\d+)\)/);
      const timeMatch = output.match(/Total Time:\s*(\d+\.\d+)\s*ms/);
      const core30Match = output.match(/(\d+) core30 baseline case\(s\) failed/);
      
      if (passRateMatch) {
        results.push({
          run: i,
          passRate: parseFloat(passRateMatch[1]),
          passing: parseInt(passRateMatch[2]),
          total: parseInt(passRateMatch[3]),
          executionTime: timeMatch ? parseFloat(timeMatch[1]) : null,
          core30Failures: core30Match ? parseInt(core30Match[1]) : 0
        });
        
        console.log(`   ✅ Pass Rate: ${passRateMatch[1]}%, Time: ${timeMatch[1]}ms\n`);
      }
    } catch (error) {
      console.error(`   ❌ Run ${i} failed:`, error.message);
    }
  }
  
  // Calculate statistics
  const passRates = results.map(r => r.passRate).sort((a, b) => a - b);
  const executionTimes = results.map(r => r.executionTime).sort((a, b) => a - b);
  
  const median = passRates[Math.floor(passRates.length / 2)];
  const mean = passRates.reduce((a, b) => a + b, 0) / passRates.length;
  const variance = passRates.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / passRates.length;
  const stdDev = Math.sqrt(variance);
  
  const timeMedian = executionTimes[Math.floor(executionTimes.length / 2)];
  const timeMean = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
  
  // Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 STATISTICAL VALIDATION REPORT');
  console.log('='.repeat(60));
  console.log(`\n📈 Pass Rate Statistics:`);
  console.log(`   Median:     ${median.toFixed(2)}%`);
  console.log(`   Mean:       ${mean.toFixed(2)}%`);
  console.log(`   Std Dev:    ${stdDev.toFixed(2)}%`);
  console.log(`   Min:        ${passRates[0].toFixed(2)}%`);
  console.log(`   Max:        ${passRates[passRates.length - 1].toFixed(2)}%`);
  console.log(`   Range:      ${(passRates[passRates.length - 1] - passRates[0]).toFixed(2)}%`);
  
  console.log(`\n⏱️  Execution Time:`);
  console.log(`   Median:     ${timeMedian.toFixed(0)}ms`);
  console.log(`   Mean:       ${timeMean.toFixed(0)}ms`);
  
  console.log(`\n✅ Acceptance Criteria:`);
  console.log(`   Stability (σ < 0.5%):     ${stdDev < 0.5 ? '✅ PASS' : '❌ FAIL'} (${stdDev.toFixed(2)}%)`);
  console.log(`   Range (< ±2%):            ${(passRates[passRates.length - 1] - passRates[0]) < 4 ? '✅ PASS' : '❌ FAIL'}`);
  
  // Save results
  const report = {
    timestamp: new Date().toISOString(),
    run_count: RUN_COUNT,
    dataset: DATASET,
    statistics: {
      pass_rate: { median, mean, std_dev: stdDev, min: passRates[0], max: passRates[passRates.length - 1] },
      execution_time: { median: timeMedian, mean: timeMean }
    },
    raw_results: results,
    acceptance: {
      stability_pass: stdDev < 0.5,
      range_pass: (passRates[passRates.length - 1] - passRates[0]) < 4
    }
  };
  
  const reportPath = `multi_run_validation_${new Date().toISOString().replace(/:/g, '-')}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Report saved: ${reportPath}`);
  
  return report;
}

runMultiEvaluation().catch(console.error);
```

---

## Rollback Procedure (Updated)

### Phase 1: Pre-Rollback Verification
```bash
# 1. Identify target deployment
git log --oneline --decorate | grep "baseline"

# 2. Read VERSION_MANIFEST.md from target commit
git show <commit-sha>:VERSION_MANIFEST.md

# 3. Verify all required files exist
git show <commit-sha>:backend/src/services/CategoryEnhancements_v2c.js
git show <commit-sha>:backend/src/services/UrgencyEnhancements_v3b.js
git show <commit-sha>:backend/src/services/UrgencyEnhancements_v3c.js
```

### Phase 2: Execute Rollback
```bash
# 1. Checkout target commit
git checkout <commit-sha>

# 2. Verify no uncommitted changes
git status  # MUST show "nothing to commit, working tree clean"

# 3. Set environment variables (from VERSION_MANIFEST.md)
$env:USE_V3B_ENHANCEMENTS='true'
$env:USE_V2C_ENHANCEMENTS='true'
$env:USE_V3C_ENHANCEMENTS='true'
$env:USE_V4C_ENHANCEMENTS='false'

# 4. Verify module files exist
Test-Path backend/src/services/CategoryEnhancements_v2c.js
Test-Path backend/src/services/UrgencyEnhancements_v3b.js
Test-Path backend/src/services/UrgencyEnhancements_v3c.js
```

### Phase 3: Validation Testing
```bash
# 1. Single test run
node backend/eval/v4plus/runners/run_eval_v4plus.js --dataset all

# 2. Compare with expected results (from VERSION_MANIFEST.md)
# Expected: 46.18% ± 1%, 8 Core30 failures

# 3. If PASS: Run 10-run validation
node multi_run_evaluation.js

# 4. If median matches ±1%: Rollback successful
# 5. If median differs >1%: ROLLBACK FAILED - investigate differences
```

### Phase 4: Rollback Failure Investigation
```bash
# If validation fails, check these systematically:

# 1. Environment variables
Get-ChildItem env: | Select-String "V2C|V3B|V3C|V4C"

# 2. Module loading logs
node backend/eval/v4plus/runners/run_eval_v4plus.js --dataset all | Select-String "Enhancement"

# 3. Git status
git status
git diff

# 4. Compare failure buckets
# If category_wrong increased → v2c not working
# If urgency failures increased → v3b/v3c not working
# If both increased → multiple integration issues
```

---

## Current State Assessment (February 7, 2026)

### Status: ❌ INCOMPLETE ROLLBACK

**Target:** 46.18% baseline  
**Achieved:** 39.71% (-22 cases)  
**Primary Issue:** Category classification regression (+22 category_wrong cases)

### Immediate Actions Required:

1. **Verify v2c Integration**
   - Confirm CategoryEnhancements_v2c.js is loaded
   - Add debug logging to jan-v3-analytics-runner.js line 1708
   - Check if v2c.enhanceCategory() is actually being called

2. **Commit All Working Code**
   - UrgencyAssessmentService.js modifications (v3b/v3c integration)
   - CategoryEnhancements_v2c.js (untracked file)
   - UrgencyEnhancements_v3b.js (untracked file)
   - UrgencyEnhancements_v3c.js (untracked file)

3. **Run 10-Run Validation**
   - Create multi_run_evaluation.js script
   - Establish baseline stability metrics
   - Document statistical variance

4. **Create VERSION_MANIFEST.md**
   - Document current working state
   - Include test results once 46% restored
   - Tag commit: `v3-baseline-46pct-validated`

### Next Deployment Requirements:

**Before ANY deployment is considered "production-ready":**
- ✅ All code committed to git (no uncommitted files)
- ✅ VERSION_MANIFEST.md created with full configuration
- ✅ 10-run median validation completed (σ < 0.5%)
- ✅ Git tag created with test results in commit message
- ✅ Rollback procedure tested and verified

---

## Lessons Learned

### Critical Failures:
1. **46% baseline existed only as uncommitted code** → Caused rollback failure
2. **No dependency documentation** → Unknown which modules were required
3. **Single test run accepted as "stable"** → May have been statistical outlier
4. **Integration code not tracked** → v3b/v3c modifications to UrgencyAssessmentService.js lost
5. **Category enhancement not verified** → v2c may not be properly integrated

### Required Changes:
1. **Zero-tolerance policy for uncommitted code in production**
2. **Mandatory 10-run validation before deployment acceptance**
3. **Full dependency manifest with git status for each module**
4. **Integration status documentation for all modified files**
5. **Statistical stability verification (σ < 0.5%)**

---

## Appendix: Test Results

### 46.18% Baseline Results (2026-02-07T18:59:56)
```
Pass Rate: 46.18% (157/340)
Core30 Failures: 8
  - T009 (urgencyMatch): 75%
  - T011 (urgencyMatch): 75%
  - T012 (categoryMatch, urgencyMatch): 50%
  - T015 (urgencyMatch): 75%
  - T017 (urgencyMatch): 75%
  - T022 (urgencyMatch): 75%
  - T023 (urgencyMatch): 75%
  - T025 (urgencyMatch): 75%

Top Failure Buckets:
  1. category_wrong: 65 cases (19.1%)
  2. urgency_over_assessed: 57 cases (16.8%)
  3. urgency_under_assessed: 56 cases (16.5%)

Execution Time: 1486ms (within 3000ms budget)
```

### 39.71% Rollback Results (2026-02-07T19:34:44)
```
Pass Rate: 39.71% (135/340) [-22 cases]
Core30 Failures: 11 [+3 NEW]
  - T002 (categoryMatch): 75% [NEW]
  - T009 (urgencyMatch): 75%
  - T011 (categoryMatch, urgencyMatch): 50%
  - T012 (urgencyMatch): 75%
  - T013 (categoryMatch): 75% [NEW]
  - T015 (urgencyMatch): 75%
  - T017 (categoryMatch, urgencyMatch): 50%
  - T022 (urgencyMatch): 75%
  - T023 (urgencyMatch): 75%
  - T025 (urgencyMatch): 75%
  - T030 (categoryMatch): 75% [NEW]

Top Failure Buckets:
  1. category_wrong: 87 cases (25.6%) [+22 cases]
  2. urgency_over_assessed: 57 cases (16.8%) [no change]
  3. urgency_under_assessed: 56 cases (16.5%) [no change]

Execution Time: 1435ms (within 3000ms budget)
```

### Delta Analysis:
- **Pass Rate:** -6.47 percentage points (-22 cases)
- **Core30:** +3 new failures (ALL categoryMatch)
- **category_wrong:** +22 cases (exactly matches -22 pass rate delta)
- **Urgency metrics:** Identical (confirms v3b/v3c working, v2c not working)

---

**Document Version:** 1.0  
**Last Updated:** February 7, 2026  
**Next Review:** After successful 46% restoration and 10-run validation
