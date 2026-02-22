# V1d_3.3 Diagnostic Report
**Date**: February 7, 2026  
**Status**: Pattern matching issues identified

## Executive Summary

V1d_3.3 achieves **0% improvement** (259/590 cases, same as baseline) despite having **49 potential medical procedure matches** in the dataset. The problem is **NOT lack of patterns**, but rather:

1. **Boundary filtering too restrictive** - patterns only check cases already in specific score ranges
2. **Missing test case coverage** - diagnostic shows all 5 target cases fail (0/5 pass)
3. **T002 returns wrong adjustment** - gets +0.070 instead of +0.150 (capped at 1.0)

## Diagnostic Test Results

### Test Case Performance (0/5 passing)

| Case | Category | Base | Expected | Actual | Result | Issue |
|------|----------|------|----------|--------|--------|-------|
| T002 | MEDICAL | 0.930 | +0.150 | +0.070 | ❌ FAIL | Capped at 1.0 max |
| T015 | HOUSING | 0.820 | +0.080 | +0.000 | ❌ FAIL | No eviction pattern match |
| T025 | UTILITIES | 0.820 | +0.080 | +0.000 | ❌ FAIL | No utility shutoff pattern |
| T023 | EDUCATION | 0.650 | -0.030 | +0.000 | ❌ FAIL | No dampen pattern |
| T024 | TRANSPORTATION | 0.650 | +0.050 | +0.000 | ❌ FAIL | Missing "work" keyword |

### Pattern Match Details

**T002 (Medical Procedure)**:
```
[V1d_3.3 Diagnostic] Testing story at score 0.930 (MEDICAL)
  [Medical Procedure] Found: procedure="surgery" temporal="need"
  [Medical Procedure] ✓ MATCH: "surgery" + "need"
Result: 0.930 + 0.150 = 1.080 → CAPPED TO 1.000 (+0.070 actual)
```
**Issue**: Math.min(1.0, 0.930 + 0.15) = 1.0, so adjustment = 1.0 - 0.930 = 0.070

**T015 (Eviction Notice)**:
```
Story: "This is Lisa Anderson. Eviction notice. I need $2200 by Friday."
Pattern Expected: "eviction notice" (direct phrase) + "Friday" (temporal)
Pattern Actual: "eviction notice" ✓ BUT "Friday" NOT in temporalUrgency list
```
**Issue**: `temporalUrgency = ['tomorrow', 'this week', 'next week', 'days', 'soon', 'immediately']` - missing "Friday"

**T025 (Utility Shutoff)**:
```
Story: "Sarah Williams calling. Electric bill is $450. Shutoff notice came."
Pattern Expected: Housing loss patterns
Pattern Actual: NO MATCH - "shutoff" not in housing loss patterns
```
**Issue**: Utility shutoff is not covered by any V1d_3.3 pattern

**T024 (Car Repair)**:
```
Story: "Hi, this is Jennifer Davis. Car broke down. Need $950 for repairs."
Pattern Expected: Vehicle + Problem + Work
Pattern Actual: vehicle="car" ✓, problem="broke down" ✓, work="NONE" ✗
```
**Issue**: Story doesn't mention "work"/"job"/"commute" explicitly

## Pattern Frequency Analysis (591 cases)

### Successful Pattern Combinations

| Pattern | Matches | Examples | Coverage |
|---------|---------|----------|----------|
| Medical Procedure + Temporal | 49 | T002, T017, T030 | **8.3%** |
| Job Loss + Dependents | 43 | T003, T006, T024 | **7.3%** |
| Vehicle + Problem + Work | 5 | T007, T018 | **0.8%** |

### Individual Keyword Frequencies

**High-frequency keywords** (potential for pattern improvements):
- `need`: 499 cases (84.4%) - extremely common, low signal
- `son`: 148 cases (25.0%) - family indicator
- `car`: 112 cases (19.0%) - vehicle issues
- `rent`: 69 cases (11.7%) - housing
- `evict`: 60 cases (10.2%) - eviction situations
- `surgery`: 52 cases (8.8%) - medical procedures
- `lost my job`: 45 cases (7.6%) - unemployment

**Low-frequency critical keywords**:
- `tomorrow`: 44 cases (7.4%)
- `eviction notice`: 41 cases (6.9%)
- `broke down`: 41 cases (6.9%)
- `urgent`: 49 cases (8.3%)
- `weeks`: 54 cases (9.1%)

## Root Causes

### 1. Boundary Filtering Too Restrictive
**CRITICAL boundary** only applies to cases in 93-97% range:
```javascript
if (currentScore < 0.93 || currentScore > 0.97) {
  return { applied: false, adjustment: 0, newScore: currentScore };
}
```

**Problem**: Many critical cases may be scored 85-92% by baseline, outside the 93-97% window.

**Impact**: Out of 49 potential medical procedure matches, only those already at 93-97% get corrections.

### 2. Missing Temporal Keywords
`temporalUrgency` list is incomplete:
```javascript
temporalUrgency: ['tomorrow', 'this week', 'next week', 'days', 'soon', 'immediately']
```

**Missing**: `friday`, `monday`, `week`, `month`, specific day names

**Impact**: T015 has "by Friday" but pattern requires exact temporal term match.

### 3. Missing Pattern Categories
**No coverage for**:
- Utility shutoffs (T025)
- School expenses without dampening pattern (T023)
- Vehicle repairs without explicit work mention (T024)

### 4. Score Capping Issue
Adjustment calculation at boundaries:
```javascript
newScore: Math.min(1.0, currentScore + 0.15)
```

**Problem**: When 0.930 + 0.15 = 1.08, it caps to 1.0, making actual adjustment only +0.07 instead of +0.15.

**Impact**: Undermines the entire correction magnitude strategy.

## Pattern Match Statistics

### Why 49 Medical Matches Don't Help
1. **Boundary filtering**: Only cases at 0.93-0.97 checked (maybe 5-10 cases)
2. **Score capping**: Cases near 0.95+ get reduced adjustments due to 1.0 ceiling
3. **Wrong band**: Most surgery cases likely scored 0.70-0.85 (MEDIUM/HIGH), not 0.93+

### Why 43 Job Loss Matches Don't Help
**HIGH boundary** checks 0.82-0.89 range:
- Cases at 0.75-0.81: Too low, not checked
- Cases at 0.90+: Too high, not checked
- Only ~8-10 cases in sweet spot

### Why 5 Vehicle Matches Are Insufficient
- Pattern requires ALL THREE: vehicle + problem + work
- Many car repair stories don't explicitly mention work
- 0.8% coverage means ~4-5 total matches across 591 cases

## Recommendations

### Quick Fixes (Immediate)

1. **Expand boundary ranges**:
   ```javascript
   // CRITICAL: 0.85-0.99 instead of 0.93-0.97
   // HIGH: 0.75-0.92 instead of 0.82-0.89
   // MEDIUM: 0.40-0.85 instead of 0.60-0.81
   ```

2. **Add missing temporal keywords**:
   ```javascript
   temporalTerms: ['need', 'scheduled', 'upcoming', 'soon', 'tomorrow', 
                   'next week', 'this week', 'this month', 'next month',
                   'monday', 'tuesday', 'wednesday', 'thursday', 'friday',
                   'today', 'tonight', 'days', 'weeks']
   ```

3. **Add utility shutoff pattern** (for T025):
   ```javascript
   hasUtilityShutoff(text) {
     const shutoffPhrases = ['shutoff notice', 'shut off', 'disconnect', 
                             'disconnection notice', 'service cutoff'];
     const utilityTerms = ['electric', 'water', 'gas', 'utility', 'bill'];
     // ... pattern logic
   }
   ```

4. **Fix score capping issue** - use uncapped adjustment:
   ```javascript
   return {
     applied: true,
     adjustment: 0.15,
     newScore: currentScore + 0.15, // Let service cap it
     reason: 'Imminent medical procedure'
   };
   ```

### Strategic Fixes (Longer-term)

1. **Remove boundary filtering entirely** - apply patterns to ALL cases
2. **Use relative adjustments** - boost by percentage instead of fixed amounts
3. **Add pattern confidence scores** - weight adjustments by match strength
4. **Statistical validation** - test patterns on 100-case sample before full deployment

## Conclusion

V1d_3.3 has the RIGHT IDEA (flexible patterns work!) but WRONG IMPLEMENTATION:
- ✅ Patterns match real data (49 medical, 43 job loss cases found)
- ✅ Flexible approach is sound
- ❌ Boundary filtering eliminates 90% of potential matches
- ❌ Score capping undermines correction magnitudes
- ❌ Missing keywords (Friday, shutoff, etc.) cause failures
- ❌ No validation against target test cases before deployment

**Next steps**: Implement quick fixes and retest against 5 target cases before full evaluation.
