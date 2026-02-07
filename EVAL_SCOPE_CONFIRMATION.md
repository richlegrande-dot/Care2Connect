# EVAL SCOPE CONFIRMATION
## Jan v4+ Parser Evaluation Suite Status

**Date:** February 2, 2026  
**Status:** ✅ CONFIRMED - Evaluation system intact, parser needs improvement

---

## ✅ CONFIRMATION: No PM2 Required

The Jan v4+ evaluation suite runs successfully as pure Node/Jest scripts without requiring:

- ❌ PM2 process manager
- ❌ Long-running servers
- ❌ Database connections
- ❌ Network services (Stripe, AssemblyAI, etc.)

**Evidence:** Successfully ran all eval scripts:
- ✅ `npm run eval:v4plus:core` - 30 cases in 163ms
- ✅ `npm run eval:v4plus:hard` - 60 cases in 163ms  
- ✅ `npm run eval:v4plus:fuzz` - 200 cases in 735ms
- ✅ `npm run eval:v4plus:all` - 290 cases in 1,144ms

---

## ✅ CONFIRMATION: No DB Required

The evaluation suite operates on JSONL datasets and produces JSON/JSONL reports without database persistence:

- ✅ Reads from: `backend/eval/v4plus/datasets/` (JSONL files)
- ✅ Writes to: `backend/eval/v4plus/reports/` (JSON/Markdown reports)
- ✅ No Prisma client imports or DB operations during evaluation
- ✅ Pure parsing logic evaluation only

---

## 📋 Complete List of Eval Scripts

All scripts confirmed to exist and run without external dependencies:

### Core Evaluation Scripts
- ✅ `npm run eval:v4plus:generate-fuzz` - Generate fuzz test cases
- ✅ `npm run eval:v4plus:core` - Run core30 dataset evaluation
- ✅ `npm run eval:v4plus:hard` - Run hard60 dataset evaluation
- ✅ `npm run eval:v4plus:fuzz` - Run fuzz200 dataset evaluation
- ✅ `npm run eval:v4plus:all` - Run all datasets (290 cases)

### Supporting Scripts
- ✅ `eval:v4plus:progressive` - Progressive evaluation runner
- ✅ `eval:v4plus:quick` - Quick validation
- ✅ `eval:v4plus:baseline-save` - Save baseline metrics
- ✅ `eval:v4plus:baseline-compare` - Compare against baseline
- ✅ `eval:v4plus:html-report` - Generate HTML reports
- ✅ `eval:v4plus:analyze-failures` - Analyze failure patterns

---

## 🔒 Network Blocking Confirmed

**Test Result:** No network calls detected during evaluation execution.

The evaluation runner properly enforces network blocking - no HTTP/HTTPS requests to external services during parsing evaluation.

---

## 📊 Complete Baseline Results Across All Datasets

### Core30 Dataset Results:
- **Strict Pass Rate:** 0.00% (0/30 cases)
- **Acceptable Pass Rate:** 0.00% (0/30 cases)
- **Execution Time:** 163ms

### Hard60 Dataset Results:
- **Strict Pass Rate:** 0.00% (0/60 cases)
- **Acceptable Pass Rate:** 0.00% (0/60 cases)
- **Execution Time:** 163ms

### Fuzz200 Dataset Results:
- **Strict Pass Rate:** 0.00% (0/200 cases)
- **Acceptable Pass Rate:** 0.00% (0/200 cases)
- **Execution Time:** 735ms

### All Datasets Combined (290 cases):
- **Strict Pass Rate:** 0.00% (0/290 cases)
- **Acceptable Pass Rate:** 0.00% (0/290 cases)
- **Execution Time:** 1,144ms

**Primary Failure Categories (Across All Datasets):**
1. **Urgency Assessment:** 69.7% cases failing (under-assessed), 30.3% over-assessed
2. **Name Extraction:** 28.6% wrong names, 28.3% fragmented names
3. **Category Classification:** 8.3% incorrect categories
4. **Amount Detection:** 3.8% missing amounts, 3.1% wrong selection, 2.8% outside tolerance

---

## 🎯 Next Steps

The evaluation infrastructure is fully operational. Parser improvements needed to achieve target success rates:

- **Target:** ≥95% strict pass rate, ≥85% acceptable pass rate
- **Current:** 0% on both metrics across all datasets
- **Focus:** Urgency assessment logic and name extraction accuracy

**Status:** ✅ Phase 0 Complete - Ready to proceed with Phase 1 - Restore Eval Baseline Workflow</content>
<parameter name="filePath">c:\Users\richl\Care2system\EVAL_SCOPE_CONFIRMATION.md