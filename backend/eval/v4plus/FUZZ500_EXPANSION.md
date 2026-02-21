# 500 Fuzz Cases Generated — Test Suite Expansion

**Date:** January 25, 2026  
**Status:** ✅ COMPLETE  
**New Total:** 590 test cases (30 core + 60 hard + 500 fuzz)

---

## 📊 Expansion Summary

### **Original Suite:**
- Core30: 30 baseline cases
- Hard60: 60 difficult curated cases
- Fuzz200: 200 deterministic fuzz cases
- **Total:** 290 cases

### **Expanded Suite:**
- Core30: 30 baseline cases
- Hard60: 60 difficult curated cases
- **Fuzz500: 500 deterministic fuzz cases** ✅ NEW
- **Total:** 590 cases

---

## 🎯 Fuzz500 Statistics

**Generated:** January 25, 2026  
**Seed:** 1234 (deterministic)  
**Count:** 500 cases  
**File:** `backend/eval/v4plus/datasets/fuzz500.jsonl`

### **Mutation Statistics:**
| Mutation Operation | Cases Applied |
|-------------------|---------------|
| insertFillerWords | 363 cases (72.6%) |
| insertIrrelevantNumbers | 286 cases (57.2%) |
| reorderClauses | 243 cases (48.6%) |
| insertIrrelevantKeywords | 244 cases (48.8%) |
| insertPunctuationChaos | 199 cases (39.8%) |
| insertAdversarialToken | 22 cases (4.4%) |

### **Label Confidence Statistics:**
- **Average Confidence:** 71.2%
- **Min Confidence:** 60.0%
- **Max Confidence:** 100.0%
- **Low Confidence (<75%):** 304 cases (60.8%)

This means 60.8% of fuzz cases have heavy enough mutations that expected outputs may be unreliable. These cases will use relaxed thresholds during evaluation.

---

## 🚀 New NPM Scripts

### **Generation:**
```bash
# Generate 200 fuzz cases (original)
npm run eval:v4plus:generate-fuzz

# Generate 500 fuzz cases (NEW)
npm run eval:v4plus:generate-fuzz500
```

### **Execution:**
```bash
# Run original suite (290 cases)
npm run eval:v4plus:all

# Run expanded suite (590 cases) (NEW)
npm run eval:v4plus:all500

# Run only fuzz500 (NEW)
npm run eval:v4plus:fuzz500
```

---

## 📈 Expected Performance Impact

### **Original Suite (290 cases):**
- Expected runtime: <3000ms
- Performance budget: 3000ms
- Avg latency: ~10ms/case

### **Expanded Suite (590 cases):**
- Expected runtime: ~5900ms (5.9 seconds)
- Performance budget: 6000ms (updated)
- Avg latency: ~10ms/case

**Note:** Performance budget not automatically updated in config. May show "Over Budget" warnings.

---

## 🔧 Implementation Details

### **Files Modified:**
1. **package.json:**
   - Added `eval:v4plus:generate-fuzz500` script
   - Added `eval:v4plus:fuzz500` script
   - Added `eval:v4plus:all500` script

2. **run_eval_v4plus.js:**
   - Added `fuzz500` dataset support in `loadDataset()`
   - Added `all500` composite dataset (core30 + hard60 + fuzz500)
   - Added `ensureFuzz500()` method for auto-generation/verification

### **Files Created:**
1. **fuzz500.jsonl:**
   - Location: `backend/eval/v4plus/datasets/fuzz500.jsonl`
   - Size: 501 lines (1 metadata + 500 cases)
   - Format: JSONL with datasetMeta header

---

## ✅ Verification

### **Metadata Validation:**
```json
{
  "_meta": true,
  "generatorVersion": "1.0.0",
  "seed": 1234,
  "count": 500,
  "createdAt": "2026-01-25T...",
  "confidenceStats": {
    "avg": 0.712,
    "min": 0.6,
    "max": 1.0,
    "lowConfidenceCount": 304
  }
}
```

### **Checksum:**
- Seed 1234 ensures reproducibility
- Same seed → identical fuzz500.jsonl every time
- Auto-verified on load (seed, count, version)

---

## 🎯 Usage Recommendations

### **For Stress Testing:**
Use `all500` (590 cases) to maximize parser stress:
```bash
npm run eval:v4plus:all500
```

### **For Quick Validation:**
Use `all` (290 cases) for faster iterations:
```bash
npm run eval:v4plus:all
```

### **For Fuzz-Only Analysis:**
Use `fuzz500` to isolate robustness testing:
```bash
npm run eval:v4plus:fuzz500
```

---

## 📊 Expected Results

### **Core30:**
- Should maintain 100% strict pass
- Any failures = regression

### **Hard60:**
- Expected: 60-80% strict pass
- These are intentionally difficult

### **Fuzz500:**
- Expected: 70-85% acceptable pass
- Many low-confidence cases (304)
- More mutation diversity than fuzz200

### **Overall (all500):**
- **Expected strict pass:** ~75-85%
- **Expected acceptable pass:** ~80-90%
- Performance: 5-6 seconds

---

## 🔍 Low Confidence Cases

**304 cases (60.8%)** have confidence <75%. These cases:
- Have heavy mutations (3-5 operations)
- May have unreliable expected outputs
- Use relaxed threshold (≥85% acceptable, not ≥95% strict)
- Won't dominate failure reports

**Example low-confidence case:**
- Mutations: reorderClauses + insertIrrelevantNumbers + insertAdversarialToken
- Confidence: 60%
- Threshold: Acceptable only (not counted against strict score)

---

## 📝 Next Steps

### **Immediate:**
1. ✅ Fuzz500 generated (complete)
2. ✅ NPM scripts added (complete)
3. ✅ Runner updated (complete)

### **To Run:**
```bash
# Full expanded suite
npm run eval:v4plus:all500

# Or step-by-step
npm run eval:v4plus:core      # Verify 100% (regression check)
npm run eval:v4plus:hard      # ~70% expected
npm run eval:v4plus:fuzz500   # ~80% expected
```

### **Analyze Reports:**
- Review `backend/eval/v4plus/reports/v4plus_all500_<timestamp>.md`
- Check "Failure Triage Snapshot" for top failures
- Check "Field Drift Overview" for systematic weaknesses
- Check "Low Confidence Fuzz Summary" for unreliable cases

---

## ⚙️ Configuration

### **Dataset Options:**
| Dataset | Cases | Description |
|---------|-------|-------------|
| `core30` | 30 | Baseline regression guard |
| `hard60` | 60 | Curated difficult cases |
| `fuzz200` | 200 | Original fuzz suite |
| `fuzz500` | 500 | Expanded fuzz suite (NEW) |
| `all` | 290 | core30 + hard60 + fuzz200 |
| `all500` | 590 | core30 + hard60 + fuzz500 (NEW) |

### **Auto-Generation:**
- Missing fuzz500.jsonl → auto-generates with seed 1234
- Existing fuzz500.jsonl → verifies metadata (seed, count, version)
- Mismatch → fails hard with regeneration instructions

---

## 🎉 Summary

✅ **500 fuzz cases successfully generated**  
✅ **590 total test cases now available**  
✅ **NPM scripts configured**  
✅ **Runner supports all500 dataset**  
✅ **Metadata verification enabled**  
✅ **Deterministic reproducibility maintained**

**Ready to run:** `npm run eval:v4plus:all500`

---

**Generated by:** AI Assistant  
**Date:** January 25, 2026  
**Mutation complexity:** 71.2% average confidence  
**Low confidence cases:** 304 (60.8%)  
**Total operations applied:** 1,357 mutations across 500 cases
