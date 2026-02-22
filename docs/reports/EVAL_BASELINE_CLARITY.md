# Evaluation Baseline Clarity - Jan v4.0

**Date:** January 16, 2026  
**System:** Care2system Backend Evaluation Framework  
**Purpose:** Eliminate confusion around evaluation baselines and provide clear guidance

## 📊 Historical Baseline Confusion

Previous evaluations showed conflicting baselines:
- **6.7%** - Early v1 with major bugs
- **28%** - v1 with some fixes but simulation issues  
- **50%** - v2.5 baseline with mixed real/simulation
- **66.7%** - v3.0 with enhanced evaluation

**Root Cause:** Mixed evaluation modes, different datasets, and inconsistent scoring methods.

## 🎯 Jan v4.0 Canonical Evaluation System

### Environment Variables

```bash
# Evaluation Mode (default: real)
EVAL_MODE=real        # Use production parsing services
EVAL_MODE=simulation  # Use deterministic fallback simulation

# Dataset Selection (default: transcripts_golden_v4_core30)
EVAL_DATASET=transcripts_golden_v1           # Original 30 cases
EVAL_DATASET=transcripts_golden_v4_core30    # Jan v4.0 balanced core set
EVAL_DATASET=transcripts_golden_v4_extended  # Future 100+ case expansion

# Scoring Method (default: weighted)
EVAL_SCORING=binary    # Pass/fail only (0.0 or 1.0 per case)
EVAL_SCORING=weighted  # Weighted field scoring (0.0-1.0 per case, ≥0.85 passes)
```

### How to Run Each Mode

#### Real Mode (Production Services)
```bash
cd backend/eval/runners
EVAL_MODE=real npm run eval
```
**Uses:** 
- `transcriptSignalExtractor.extractSignals()`
- `StoryExtractionService.extractGoFundMeData()`
- Real parsing pipeline with ZERO_OPENAI_MODE=true

**Expected Baseline:** 
- Jan v4.0 Target: **80%+** overall pass rate
- Field accuracy: Name ≥90%, Category ≥90%, Urgency ≥80%, Amount ≥80%

#### Simulation Mode (Deterministic Fallback)
```bash
cd backend/eval/runners  
EVAL_MODE=simulation npm run eval
```
**Uses:**
- `parsingAdapter.simulatedExtractSignals()`
- Rules-based extraction from rulesEngine
- No external service dependencies

**Expected Baseline:**
- Simulation Target: **70%+** overall pass rate  
- Primarily for CI/CD and development environments
- Should track real mode trends but with lower absolute performance

### Output Always Includes

Every evaluation run now reports:
```json
{
  "evalMode": "real|simulation",
  "parserVersion": "git_hash_here", 
  "datasetVersion": "v4_core30",
  "scoringMode": "weighted|binary",
  "summary": {
    "passRate": 0.833,
    "weightedScore": 0.847,
    "fieldAccuracy": { "name": 0.90, "category": 0.87, "urgency": 0.80, "amount": 0.73 },
    "difficultyBreakdown": { "easy": 0.95, "medium": 0.85, "hard": 0.70, "adversarial": 0.80 }
  }
}
```

## 📈 Baseline Tracking Strategy

### Real Mode Baselines
- **Jan v4.0 Target:** 80%+ overall, 80%+ per field
- **Jan v3.0 Current:** ~67% overall (reference point)
- **Jan v2.5 Historical:** ~57% overall
- **Jan v1.0 Historical:** ~50% overall

### Simulation Mode Baselines  
- **Jan v4.0 Target:** 70%+ overall (tracking real mode)
- **Simulation Purpose:** Development/CI consistency, not production accuracy

### Why Previous Baselines Differed

1. **Mixed Modes:** Some runs used real services, others simulation
2. **Dataset Variations:** Different test case sets (v1 vs v2.5 vs v3.0) 
3. **Scoring Methods:** Binary vs weighted scoring
4. **Service Issues:** Real service failures causing fallback to simulation mid-evaluation

## 🔧 Implementation Details

### Jan v4.0 Runner (`run_parsing_eval.ts`)
- Single canonical evaluation entry point
- Automatic mode detection and fallback handling
- Comprehensive reporting with all baseline tracking fields
- Deterministic simulation when real services unavailable

### Parsing Adapter (`parsingAdapter.ts`)
- Stable interface for real service integration
- Robust fallback simulation using existing rulesEngine
- Performance monitoring and failure detection
- Zero external dependencies in simulation mode

### Dataset Management
- `transcripts_golden_v4_core30.jsonl` - Balanced 30-case core set
- Difficulty labels: easy/medium/hard/adversarial  
- Consistent test case IDs for tracking improvements over time
- Canonical expected outputs for each case

## 🚀 Usage Instructions

### Development Workflow
```bash
# Quick development check (simulation)
EVAL_MODE=simulation npm run eval

# Pre-commit validation (real services)  
EVAL_MODE=real npm run eval

# Specific dataset testing
EVAL_MODE=real EVAL_DATASET=transcripts_golden_v1 npm run eval
```

### CI/CD Integration
```bash
# CI pipeline should always use simulation for consistency
EVAL_MODE=simulation EVAL_SCORING=binary npm run eval
```

### Production Deployment Validation
```bash
# Full production validation before deployment
EVAL_MODE=real EVAL_SCORING=weighted npm run eval
```

## 🎯 Success Criteria

### Jan v4.0 Production Readiness Gates
- [x] **Baseline Clarity:** Single canonical evaluation system
- [ ] **Real Mode:** ≥80% overall pass rate with real services
- [ ] **Simulation Mode:** ≥70% overall pass rate (tracking real mode)
- [ ] **Field Accuracy:** All fields ≥80% accuracy
- [ ] **Stability:** <5% variance between runs on same dataset

### Monitoring & Alerting
- Track evaluation performance over time  
- Alert if real mode falls below 75% (15pp buffer)
- Alert if simulation diverges >10pp from real mode
- Monitor field-level accuracy trends for early detection of regressions

---

**Next Steps:**
1. Complete Jan v4.0 parsing engine implementation (Phase 1-3)
2. Validate both real and simulation modes achieve target baselines
3. Establish continuous monitoring for production deployment readiness