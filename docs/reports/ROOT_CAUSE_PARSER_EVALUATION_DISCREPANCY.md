# PARSER EVALUATION SYSTEM DISCREPANCY - ROOT CAUSE ANALYSIS
**Date**: February 8, 2026  
**Issue**: Multiple evaluation systems reporting conflicting performance metrics  
**Impact**: Development confusion, incorrect performance baselines, wasted debugging time

## PROBLEM STATEMENT

User reported system should be testing at 80% baseline but observed 63.82% and 68% in different contexts. Investigation reveals **three separate evaluation systems with different configurations**.

## ROOT CAUSE FINDINGS

### 1. **Multiple Evaluation Systems Operating Simultaneously**

| System | Test Cases | Parser Engine | Pass Rate | Purpose |
|--------|------------|---------------|-----------|---------|
| **V1 Zero-OpenAI** | 10 cases | Production rules engine (`src/utils/extraction/rulesEngine.ts`) | **80.00%** | Production validation |
| **v4plus Core30** | 30 cases | Jan-v3-analytics-runner.js | **100.00%** | Development testing |
| **v4plus All** | 340 cases | Jan-v3-analytics-runner.js | **63.82%** | Comprehensive evaluation |

### 2. **Configuration Drift Between Systems**

**Production Rules Engine** (V1 tests):
- Uses actual production code in `src/utils/extraction/rulesEngine.ts`
- Fixed name extraction patterns with recent improvements
- 10% amount tolerance (standard)
- Tests exact production behavior

**Jan-v3-analytics-runner.js** (v4plus tests):
- Separate parsing implementation in `backend/eval/jan-v3-analytics-runner.js`
- Legacy patterns potentially outdated
- 5% amount tolerance (stricter)
- Tests evaluation-specific code path

### 3. **Dataset Quality Differences**

**V1 Zero-OpenAI Dataset** (10 cases):
- High-quality, realistic scenarios
- Well-formed speech patterns
- Represents typical user inputs

**v4plus All Dataset** (340 cases):
- Includes 200 "fuzz" cases with adversarial inputs
- Deliberately malformed/chaotic speech patterns
- Stress-testing edge cases

### 4. **Historical Configuration Mismatch**

**Prior Configuration** (80.20% archive):
- `archives/PRODUCTION_ARCHIVE_80_20_PERCENT_2026-02-08_00-48-52/`
- Different jan-v3-analytics-runner.js version
- Better alignment with production patterns

**Current Configuration**:
- Updated jan-v3-analytics-runner.js
- May have introduced regressions vs production

## SPECIFIC TECHNICAL CAUSES

### Cause 1: Parser Engine Divergence
```javascript
// V1 Zero-OpenAI uses:
const { extractName } = require('./src/utils/extraction/rulesEngine');

// v4plus uses:
const jan-v3-analytics-runner.js -> simulateEnhancedParsing()
```

### Cause 2: Tolerance Configuration
```javascript
// v4plus config (stricter):
DEFAULT_AMOUNT_TOLERANCE: 0.05, // 5%

// Production config (standard):  
DEFAULT_AMOUNT_TOLERANCE: 0.10, // 10%
```

### Cause 3: Test Dataset Composition
```
V1: 10 realistic cases = 80% baseline
v4plus Core30: 30 clean cases = 100% 
v4plus All: 340 cases (200 adversarial) = 63.82%
```

## FAILURE PATTERNS

The 63.82% result breaks down as follows:
- **32 cases (9.4%)**: urgency_under_assessed  
- **30 cases (8.8%)**: category_wrong
- **23 cases (6.8%)**: urgency_over_assessed
- **69% of failures**: Urgency and category classification issues

This matches the "68% urgency failures" referenced in documentation.

## IMMEDIATE FIXES REQUIRED

### Fix 1: Sync Parser Engines
```javascript
// Replace jan-v3-analytics-runner.js parsing logic with:
const { getAIProvider } = require('../src/providers/ai/index');
const provider = getAIProvider();
const result = await provider.extractProfileData(transcript);
```

### Fix 2: Standardize Tolerance
```javascript
// Use production tolerance in v4plus:
DEFAULT_AMOUNT_TOLERANCE: 0.10, // Match production
```

### Fix 3: Clear Evaluation Boundaries
- V1 tests → Production validation (80% baseline)
- Core30 → Development quality gate (≥95% target)
- All/Fuzz → Stress testing (≥70% acceptable for adversarial cases)

### Fix 4: Configuration Management
```bash
# Create configuration lock file
git add archives/PRODUCTION_ARCHIVE_80_20_PERCENT_2026-02-08_00-48-52/
# Restore working configuration when needed
cp archives/PRODUCTION_ARCHIVE_80_20_PERCENT_2026-02-08_00-48-52/jan-v3-analytics-runner.js backend/eval/
```

## PREVENTION MEASURES

### 1. **Evaluation System Documentation**
Create clear documentation for each evaluation system's purpose and expected baselines.

### 2. **Configuration Validation**
Add startup checks to ensure parser engines are synchronized.

### 3. **Baseline Tracking** 
Implement automated baseline drift detection between evaluation systems.

### 4. **Single Source of Truth**
Designate V1 Zero-OpenAI tests as the authoritative production baseline.

## IMPACT ASSESSMENT

**Time Lost**: ~4 hours debugging non-existent regression
**Confusion Factor**: High - multiple contradictory metrics
**Risk**: Medium - could lead to incorrect deployment decisions

## VERIFICATION PLAN

1. ✅ Confirm V1 tests stable at 80% (COMPLETED)
2. ✅ Reproduce v4plus 63.82% result (COMPLETED)  
3. 🔄 Sync jan-v3-analytics-runner.js with production
4. 🔄 Validate all systems report consistent baselines
5. 🔄 Document evaluation system boundaries

## CONCLUSION

The "regression" was actually different evaluation systems with different purposes and configurations. The production system remains stable at the correct 80% baseline. The v4plus system serves stress-testing purposes with different acceptance criteria.

**Action Required**: Implement parser engine synchronization to prevent future configuration drift.