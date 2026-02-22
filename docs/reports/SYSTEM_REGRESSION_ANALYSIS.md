# SYSTEM REGRESSION ANALYSIS
**Date**: February 7, 2026  
**Status**: 🚨 CRITICAL - 8 percentage point regression from peak

## Executive Summary

The system achieved **51.53% (304/590 cases)** at 14:41 today, then regressed to **43.90% (259/590 cases)** - a loss of **45 cases**. All Phase 3/4 implementation work is now STOPPED pending root cause analysis and recovery plan.

## Timeline of Performance

| Time | Pass Rate | Cases | Config | Status |
|------|-----------|-------|--------|--------|
| 14:05 | 39.66% | 234/590 | Unknown | Low baseline |
| 14:41 | **51.53%** | **304/590** | **PEAK** | ✅ Best performance |
| 15:32 | 43.90% | 259/590 | V1b+V2a | ⚠️ Regression start |
| 16:06 | 43.90% | 259/590 | V1b+V2a+V1d_3.2 | ⚠️ No improvement |
| 16:XX | 43.73% | 258/590 | V1b+V2a+V1d_3.3 | ❌ Further regression |

**Loss from peak**: 304 → 259 = **-45 cases (-7.6 percentage points)**

## Critical Questions

### Q1: What configuration achieved 51.53%?

**UNKNOWN** - The 14:41 report shows 304/590 but doesn't document which enhancements were enabled. Based on context:

**Hypothesis**: V1c_3.1 + V2a was likely active
- Prior reports show V1c_3.1 testing
- Timing matches conservative enhancement work
- 13 core30 regressions match V1c_3.1 pattern

**Evidence needed**:
- Console logs from 14:41 run
- Environment variables used
- Service configuration at that time

### Q2: Why did we switch to V1b+V2a (43.90%)?

**Timeline analysis**:
- 14:41: 51.53% (likely V1c_3.1)
- 15:32: 43.90% (explicitly V1b+V2a)

**Hypothesis**: Intentional baseline reset
- Documentation shows "V1b + V2a (Baseline)" explicitly
- Plan documents use 259/590 as baseline
- Likely switched to "proven" baseline for incremental testing

**Problem**: Lost 45 cases by abandoning working configuration!

### Q3: What broke between 51% and 43%?

**Not a bug** - this is a **configuration change**:
- V1c_3.1 (or similar) = 304 cases
- V1b+V2a "baseline" = 259 cases
- Difference: -45 cases

**V1c_3.1 was abandoned** despite being the best performer!

## Phase 3/4 Implementation Impact

### V1d_3.2 Testing (Phases 3-4)
- Result: 259/590 (43.90%) - **ZERO improvement**
- Issue: Pattern combinations too restrictive
- Outcome: Wasted implementation effort

### V1d_3.3 Testing (Quick fixes)
- Result: 258/590 (43.73%) - **-1 case regression**
- Fixes: Widened boundaries, added patterns
- Outcome: Slight degradation, still no improvement

### Root Cause of Phase 3/4 Failure

**Started from wrong baseline**:
- Should have enhanced 304-case configuration
- Instead enhanced 259-case "baseline"
- Lost 45 cases of "free" performance

## Configuration Archaeology

### Working Configuration (51.53% - 304 cases)

**Most likely**: V1c_3.1 + V2a
- Timing matches V1c_3.1 development
- Conservative enhancement approach
- Known to have 13 core30 regressions (documented in report)

**Service chain**:
```
UrgencyAssessmentService
  ├─ V1c_3.1 (Conservative Urgency Enhancement)
  └─ V2a (Category Intelligence)
```

**Environment variables**:
```bash
USE_V1C_31_ENHANCEMENTS=true
USE_V2A_ENHANCEMENTS=true
```

### "Baseline" Configuration (43.90% - 259 cases)

**Documented**: V1b + V2a
```bash
USE_V1B_ENHANCEMENTS=true
USE_V2A_ENHANCEMENTS=true
```

**Why chosen**: Labeled as "proven baseline" for incremental testing

**Problem**: 45 cases worse than actual peak!

## Recovery Analysis

### Option 1: Return to V1c_3.1 + V2a (RECOMMENDED)

**Pros**:
- Already achieved 51.53%
- No new development needed
- Immediate recovery to peak

**Cons**:
- 13 core30 regressions present
- Need to verify configuration details

**Effort**: < 1 hour (config change only)

**Expected result**: 304/590 cases (51.53%)

### Option 2: Fix V1c_3.1 core30 regressions

**Pros**:
- Could exceed 51.53%
- Addresses known issues
- Cleaner solution

**Cons**:
- Requires investigation of 13 failing cases
- Unknown time to fix
- Risk of breaking other cases

**Effort**: 4-8 hours

**Expected result**: 310-320/590 cases (52-54%)

### Option 3: Start fresh from V1c_3.1 base

**Pros**:
- Begin from best known state
- Apply learnings from Phase 3/4
- Avoid V1b limitations

**Cons**:
- Requires full Phase 3/4 redesign
- Significant time investment
- No guarantee of improvement

**Effort**: 2-3 days

**Expected result**: Uncertain (could be 310-350 cases if successful)

## Investigation Tasks

### CRITICAL - Verify 51% Configuration

1. **Check console logs** from 14:41 run
   - Look for enhancement loading messages
   - Confirm V1c_3.1 vs V1b

2. **Test configurations**:
   ```bash
   # Test V1c_3.1 + V2a
   USE_V1C_31_ENHANCEMENTS=true USE_V2A_ENHANCEMENTS=true
   
   # Compare to V1b + V2a
   USE_V1B_ENHANCEMENTS=true USE_V2A_ENHANCEMENTS=true
   ```

3. **Document findings** in recovery plan

### HIGH - Analyze core30 regressions

The 51% run had 13 core30 failures:
- T007, T009, T011, T012, T018, T019, T021, T022, T023, T024, T027, T028, T030

**Pattern analysis**:
- 12 cases: urgencyMatch failures (urgency assessment)
- 3 cases: categoryMatch failures (T007, T012, T018)

**Hypothesis**: V1c_3.1 may be too conservative on urgency

### MEDIUM - Phase 3/4 lessons learned

**What went wrong**:
1. Started from suboptimal baseline (259 vs 304 cases)
2. No baseline verification before enhancement work
3. Pattern-based approach showed zero improvement
4. Surgical precision assumptions didn't match data

**What to preserve**:
1. Diagnostic tooling (pattern frequency analysis)
2. Boundary correction magnitude insights (+0.08, +0.15)
3. Keyword research on actual dataset

## Recommended Recovery Plan

### Phase 1: Immediate Recovery (< 1 hour)

1. **Verify V1c_3.1 configuration**:
   ```bash
   cd C:\Users\richl\Care2system\backend\eval\v4plus
   $env:USE_V1C_31_ENHANCEMENTS='true'
   $env:USE_V2A_ENHANCEMENTS='true'
   node runners/run_eval_v4plus.js --dataset all500
   ```

2. **Confirm 51% result**
   - Expected: 304/590 cases
   - If different: Investigate environment differences

3. **Archive Phase 3/4 work**:
   - Move V1d_3.2, V1d_3.3 files to archive/
   - Document lessons learned
   - Update strategy documents

### Phase 2: Core30 Fix (4-8 hours)

1. **Analyze 13 failing cases**
   - Run detailed diagnostics on each
   - Identify systematic issues
   - Group by failure pattern

2. **Targeted fixes**
   - Focus on urgency assessment tweaks
   - Don't break existing 304 passing cases
   - Test incrementally

3. **Validation**
   - Aim for 310+ cases (52%+)
   - No new core30 regressions
   - Document changes

### Phase 3: Strategic Approach (Optional)

Only if Phase 2 succeeds and time permits:

1. **Category intelligence** (V2b approach)
   - Build on V1c_3.1 base
   - Target category failures (T007, T012, T018)
   - Conservative incremental changes

2. **Statistical thresholds** (not pattern-based)
   - Use actual score distributions
   - Avoid keyword matching fragility
   - Data-driven adjustments

## Key Takeaways

### Critical Mistake

**We abandoned a 51% working solution to test enhancements on a 43% baseline.**

This cost us:
- 45 cases of performance
- Days of development time
- Failed Phase 3/4 implementations

### Prevention

**Always**:
1. Document exact configuration for peak results
2. Verify baseline before enhancement work
3. Test enhancements on best-known configuration
4. Never assume "baseline" means "best"

### Success Criteria for Recovery

- ✅ **Minimum**: Return to 304/590 (51.53%)
- ✅ **Target**: Achieve 310/590 (52.5%+)
- ✅ **Stretch**: Reach 320/590 (54%+)

**Timeline**: Target recovery within 1 business day

## Archive Instructions

### Files to Archive

Move to `archive/phase3_4_abandoned/`:
- UrgencyEnhancements_v1d_32.js
- UrgencyEnhancements_v1d_33.js
- V1D_32_DESIGN_COMPLETE.md
- V1D_33_DIAGNOSTIC_REPORT.md
- test_v1d_32_design.js
- test_v1d_33_diagnostic.js
- analyze_pattern_frequency.js
- PHASE_3.2_ROOT_CAUSE_STRATEGIC_PLAN.md (reference)

### Document Lessons

Create `PHASE_3_4_POSTMORTEM.md`:
- What was attempted
- Why it failed
- Key learnings
- What to avoid next time

## Next Steps

1. ⚠️ **STOP** all Phase 3/4 work immediately
2. 🔍 **VERIFY** V1c_3.1 + V2a achieves 51%
3. 📦 **ARCHIVE** failed implementations
4. 🎯 **RECOVER** to 51% baseline
5. 📈 **OPTIMIZE** V1c_3.1 core30 issues
6. 📋 **PLAN** next approach from stable base

---

**Status**: ANALYSIS COMPLETE - Awaiting recovery execution
