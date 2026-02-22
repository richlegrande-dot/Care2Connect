# 📊 REGRESSION TROUBLESHOOTING REPORT

**Test Date:** February 7, 2026, 18:02:09.436Z  
**Configuration:** Current Baseline (44.24%)  
**Dataset:** all500 (590 total cases)  

---

## 🎯 Test Results Summary

| Metric | Value | Status |
|--------|-------|--------|
| **Pass Rate** | 44.24% (261/590) | ✅ Stable baseline |
| **Strict Passes** | 261/590 | ✅ Consistent |
| **Acceptable Passes** | 261/590 | ✅ Consistent |
| **Total Failures** | 329/590 (55.76%) | ❌ Target for improvement |
| **Average Latency** | 3.19ms | ✅ Excellent |
| **Total Time** | 1,880.36ms | ✅ Within budget (3000ms) |
| **Test Report** | `v4plus_all500_2026-02-07T18-02-09-443Z.json` | ✅ Archived |

---

## 🔧 Current System Configuration

### Service Versions
| Service | Version | Status | File Hash |
|---------|---------|---------|-----------|
| UrgencyAssessmentService.js | Git HEAD (Baseline) | ✅ Tracked | SHA in snapshot |
| CategoryClassificationService.js | Git HEAD | ✅ Tracked | SHA in snapshot |
| AmountDetectionService.js | Git HEAD | ✅ Tracked | SHA in snapshot |
| NameExtractionService.js | Git HEAD | ✅ Tracked | SHA in snapshot |
| EmergencyResponseService.js | Git HEAD | ✅ Tracked | SHA in snapshot |
| **All Enhancement Files** | v1b-v2b_41 (10 files) | ❌ NOT ACTIVE | Committed but disabled |

### Environment Configuration
```powershell
# Environment variables at test time
Remove-Item Env:USE_* -ErrorAction SilentlyContinue
# Result: NO enhancement variables set - pure baseline configuration
```

### UrgencyAssessmentService Settings (Baseline)
```javascript
Thresholds:
- CRITICAL: ≥0.80 
- HIGH: ≥0.50
- MEDIUM: ≥0.15
- LOW: <0.15

Boost System:
- Maximum boost per category: 0.08
- Cumulative scoring enabled
- Surgery detection: boosting to HIGH (0.55)
- Fallback patterns: 4 levels with regex matching

Performance:
- Engine: UrgencyAssessmentEngine (production)
- Fallback: Conservative patterns for unrecognized cases
- PII logging: DISABLED (security compliant)
```

---

## ❌ Critical Failure Analysis

### Top 5 Failure Buckets (336/590 total failures)

| Rank | Failure Type | Count | % of Total | % of Failures | Priority |
|------|-------------|-------|-----------|---------------|----------|
| 1 | **urgency_under_assessed** | 186 | 31.5% | 56.5% | 🔴 HIGH |
| 2 | **urgency_over_assessed** | 82 | 13.9% | 24.9% | 🟡 MEDIUM |
| 3 | **category_wrong** | 50 | 8.5% | 15.2% | 🟡 MEDIUM |
| 4 | **amount_missing** | 24 | 4.1% | 7.3% | 🟡 MEDIUM |
| 5 | **amount_outside_tolerance** | 17 | 2.9% | 5.2% | 🟢 LOW |

### Core30 Regressions (Critical Issues)

**10/30 core cases failing (33.3%)** - Indicates fundamental service issues

| Test Case | Score | Expected | Failed Fields | Issue |
|-----------|-------|----------|---------------|-------|
| T003 | 75.0% | 100% | urgencyMatch | Under-assessment |
| T007 | 75.0% | 100% | categoryMatch | Category wrong |
| T009 | 75.0% | 100% | urgencyMatch | Under-assessment |
| T011 | 75.0% | 100% | urgencyMatch | Under-assessment |
| T012 | 50.0% | 100% | categoryMatch, urgencyMatch | Multiple failures |
| T015 | 75.0% | 100% | urgencyMatch | Under-assessment |
| T018 | 75.0% | 100% | categoryMatch | Category wrong |
| T022 | 75.0% | 100% | urgencyMatch | Under-assessment |
| T023 | 75.0% | 100% | urgencyMatch | Under-assessment |
| T025 | 75.0% | 100% | urgencyMatch | Under-assessment |

---

## 🔍 Regression Detection Instructions

### **When Performance Drops Below 44.24%**

If future tests show pass rate **< 44.24%** (< 261/590):

1. **Immediate Actions:**
   ```powershell
   # Check environment variables
   Get-ChildItem Env:USE_*
   # Should be EMPTY - if not, remove them
   
   # Verify service file integrity
   git status backend/src/services/
   # Should show "nothing to commit"
   
   # Check for uncommitted changes
   git diff HEAD backend/src/services/UrgencyAssessmentService.js
   # Should be EMPTY
   ```

2. **Restore Baseline:**
   ```powershell
   # From Git
   git checkout HEAD -- backend/src/services/
   
   # OR from snapshot
   Copy-Item snapshots/services-20260207-113840/* backend/src/services/ -Force
   
   # Clear environment
   Remove-Item Env:USE_* -ErrorAction SilentlyContinue
   
   # Re-test
   cd backend/eval/v4plus
   node runners/run_eval_v4plus.js --dataset all500
   # Expected: ~261/590 (±3 cases tolerance)
   ```

### **When Performance Exceeds 44.24%**

If future tests show pass rate **> 44.24%** (> 261/590):

1. **Document Improvement:**
   ```powershell
   # Create new milestone
   Copy-Item templates/MILESTONE_TEMPLATE.md `
     milestones/MILESTONE_2026-02-XX_[Description].md
   
   # Record what changed
   # - Service modifications made
   # - Environment variables used  
   # - Enhancement files activated
   # - Results vs baseline (e.g., "275/590 vs 261/590 = +14 cases")
   ```

2. **Preserve Configuration:**
   ```powershell
   # Create snapshot
   powershell -ExecutionPolicy Bypass -File scripts/pre-modification-check.ps1
   
   # Commit together
   git add milestones/ snapshots/ backend/src/services/
   git commit -m "Improvement: +X cases (YYY/590 vs 261 baseline)"
   ```

---

## 📋 Configuration Verification Checklist

Run this before any critical testing:

```powershell
# Execute verification script
powershell -ExecutionPolicy Bypass -File verify-baseline-recovery.ps1

# Expected output:
# [OK] Baseline test report found
# [OK] Pass rate verified: 44.24%  
# [OK] Snapshot directory exists (services-20260207-113840)
# [OK] 12 service files captured
# [OK] Enhancement files found: 10
# [OK] All prevention scripts ready
# [OK] Git commits found
# [OK] Repository clean
```

---

## 🔬 Service Analysis (Root Cause Context)

### UrgencyAssessmentService.js Analysis

**Primary Issue: Under-Assessment (186 failures)**

The current service uses conservative thresholds that often fail to escalate urgent cases:

```javascript
Current Thresholds:
- CRITICAL: ≥0.80 (too high, medical emergencies scoring ~0.75)
- HIGH: ≥0.50 (reasonable) 
- MEDIUM: ≥0.15 (reasonable)

Observed Scoring:
- Surgery cases: ~0.55 after boost (should be CRITICAL ≥0.80)
- Eviction cases: ~0.29 (should be HIGH ≥0.50)
- Job loss cases: ~0.21 (should be MEDIUM, often scoring MEDIUM correctly)
```

**Recommended Threshold Adjustment:**
```javascript
Proposed Thresholds:
- CRITICAL: ≥0.75 (lower by 0.05)
- HIGH: ≥0.45 (lower by 0.05)  
- MEDIUM: ≥0.15 (unchanged)

Expected Impact: +30-50 cases (48.1%-56.6% estimated pass rate)
```

### CategoryClassificationService.js Analysis

**Secondary Issue: Category Wrong (50 failures)**

Examples from failures:
- Medical cases → categorized as "OTHER" instead of "MEDICAL"
- Housing cases → categorized as "UTILITIES" instead of "HOUSING"  
- Transportation cases → missing detection patterns

**Service Status:** Baseline service functional but needs enhanced pattern matching

---

## ⚡ Performance Characteristics

### Latency Analysis
```
Current Performance (44.24% config):
- Average Latency: 3.19ms ✅ EXCELLENT
- Total Test Time: 1,880.36ms ✅ Within Budget  
- Budget Limit: 3,000ms  
- Headroom: 1,119.64ms available for enhancements

Historical Performance:
- Enhancement-heavy configs: 40ms+ average (SLOW)
- Baseline config: 2.30-3.19ms average (FAST)
```

**Performance Recommendation:** Maintain latency <5ms average when implementing improvements

---

## 🚨 Red Flag Indicators

### Immediate Investigation Required If:

1. **Pass rate drops below 42%** (< 248/590)
   - Critical regression detected
   - May indicate service corruption or environment contamination

2. **Core30 failures exceed 12** (currently 10)
   - Fundamental service logic breakdown
   - Requires immediate attention before any enhancements

3. **Average latency exceeds 10ms**
   - Performance degradation detected  
   - May indicate inefficient enhancement implementation

4. **under_assessed failures exceed 200** (currently 186)
   - Thresholds too conservative
   - Patient safety concern (urgency under-detected)

5. **No enhancement variables but pass rate differs from 44.24%**
   - Service file modified without documentation
   - Version control gap detected

---

## 💾 Backup & Recovery Information

### Current Snapshot Location
```
Primary: snapshots/services-20260207-113840/
Files: 12 service files + environment.txt
Status: Committed in Git (commit dc0b753)
Recovery: Copy-Item snapshots/services-20260207-113840/* backend/src/services/ -Force
```

### Git Checkpoints
```
Latest commits:
- 20e3cb3: Session summary and verification
- 7b0e50e: Baseline recovery completion  
- 78d816d: Milestone documentation
- dc0b753: Prevention system + service snapshots
```

### Milestone Documentation  
```
Current: milestones/MILESTONE_2026-02-07_Baseline_Recovery.md
Template: templates/MILESTONE_TEMPLATE.md  
Next: milestones/MILESTONE_2026-02-XX_[Enhancement].md
```

---

## 📈 Improvement Roadmap

### Phase 1: Fix Under-Assessment (Target: 49-53%)
```
Focus: urgency_under_assessed (186 → ~120 failures)
Method: Threshold tuning (CRITICAL 0.80→0.75, HIGH 0.50→0.45)  
Timeline: 1-2 test cycles
Expected: +30-50 cases improvement
```

### Phase 2: Fix Over-Assessment (Target: 52-57%)  
```
Focus: urgency_over_assessed (82 → ~50 failures)
Method: Add constraints to prevent false escalation
Timeline: 2-3 test cycles  
Expected: +15-25 cases improvement
```

### Phase 3: Fix Categories (Target: 55-60%)
```
Focus: category_wrong (50 → ~30 failures)
Method: Enhanced pattern matching in CategoryClassificationService
Timeline: 2-3 test cycles
Expected: +10-15 cases improvement
```

### Phase 4: Fine-Tuning (Target: 57-61%)
```
Focus: Remaining failure buckets
Method: Systematic improvement of amount detection, name extraction
Timeline: 3-4 test cycles
Expected: +10-20 cases improvement
```

**Final Target: 341-361/590 (57.8%-61.2%) pass rate**

---

## 📝 Version Information

| Component | Version | Commit | Status |
|-----------|---------|---------|---------|
| Test Suite | v4.0+ | Current | Active |
| Dataset | all500 (590 cases) | Current | Active |
| Baseline Configuration | Feb 7 Recovery | dc0b753 | ✅ Stable |
| Prevention System | v1.0 | 7b0e50e | ✅ Operational |
| Documentation | Complete | 20e3cb3 | ✅ Current |

---

## 🎯 Success Criteria for Future Tests

### ✅ Green Light (Continue)
- Pass rate: ≥44.24% (≥261/590)
- Core30 failures: ≤10
- Average latency: ≤10ms
- Environment: Clean (no USE_* variables unless documented)
- Git status: Clean or documented changes

### ⚠️ Yellow Light (Monitor)  
- Pass rate: 42-44% (248-260/590)
- Core30 failures: 11-12
- Average latency: 10-20ms
- Minor environment/Git inconsistencies

### 🔴 Red Light (Stop & Investigate)
- Pass rate: <42% (<248/590)
- Core30 failures: >12  
- Average latency: >20ms
- Environment contamination
- Uncommitted service changes

---

**Report Generated:** Feb 7, 2026, 18:15:00  
**Next Review:** After next test cycle or if regressions detected  
**Contact:** Use verification script or check milestone documentation
