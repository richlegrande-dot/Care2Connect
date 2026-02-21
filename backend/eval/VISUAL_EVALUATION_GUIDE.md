# Jan v4.0 Visual Evaluation System

## Quick Start with Enhanced Visualization 🚀

The Jan v4.0 parsing system now includes comprehensive visual feedback during evaluation, making it easy to track progress and understand results in real-time.

### Visual Features ✨

- **🟢🟡🔴 Color-coded Status Indicators**: Instant visual feedback on pass/fail rates
- **Progress Bars**: Real-time progress tracking with ASCII progress bars
- **Live Statistics**: Running pass rates and performance metrics during execution
- **Detailed Field Analysis**: Field-by-field accuracy breakdown with visual bars
- **Production Readiness Assessment**: Clear indicators of deployment readiness
- **Comprehensive Reporting**: Enhanced markdown reports with visual elements

### Running Visual Evaluations

#### Option 1: NPM Scripts (Recommended)
```bash
# Quick visual demo with all enhancements
npm run eval:v4:demo

# Production-ready evaluation
npm run eval:v4:production  

# Safe mode (no external dependencies)
npm run eval:parsing:safe

# Binary scoring for detailed analysis
npm run eval:parsing:binary
```

#### Option 2: Direct Execution
```bash
# Navigate to evaluation directory
cd backend/eval/runners

# Run with full visualization
node visual_runner.js

# Run in simulation mode (no real services)
EVAL_MODE=simulation node visual_runner.js

# Run with specific dataset
node visual_runner.js transcripts_golden_v4_core30
```

### Visual Output Examples

#### Real-Time Progress Display
```
🏃‍♂️ STARTING EVALUATION EXECUTION
────────────────────────────────────────────────────────────────────────────────

🔍 [23.3%] [███████████████████────────────────────────────────]
📋 Case 7/30: v4_007_urgency_consequence_severe
📝 Description: High urgency from severe consequences - losing home
🎯 Difficulty: MEDIUM
✅ Result: PASS (145ms)
  📊 Avg Confidence: 87.2%
  🎯 Field Confidence: name: 95%, category: 89%, urgencyLevel: 82%, goalAmount: 85%
📊 Running Pass Rate: 85.7% (6/7)
```

#### Comprehensive Results Summary
```
📋 COMPREHENSIVE RESULTS SUMMARY
================================================================================
🎯 OVERALL PERFORMANCE:
  🟢 Pass Rate: 86.7% (26/30)
  ⏱️  Execution Time: 4.2s
  📊 Avg Time/Case: 140ms
  🟢 Weighted Score: 88.4%

🎯 FIELD ACCURACY BREAKDOWN:
──────────────────────────────────────────────────
  🟢 name           : 93.3% [████████████████████]
  🟢 category       : 90.0% [██████████████████──]
  🟡 urgencyLevel   : 83.3% [████████████████▒───]
  🟡 goalAmount     : 80.0% [████████████████────]

🚀 PRODUCTION READINESS ASSESSMENT:
──────────────────────────────────────────────────
  ✅ Overall Pass Rate  : 86.7% (target: 85.0%)
  ✅ Urgency Accuracy   : 83.3% (target: 80.0%)
  ✅ Amount Accuracy    : 80.0% (target: 80.0%)
  ✅ Name Accuracy      : 93.3% (target: 90.0%)
  ✅ Category Accuracy  : 90.0% (target: 90.0%)

================================================================================
🟢 PRODUCTION READINESS: 5/5 criteria met
🎉 SYSTEM READY FOR PRODUCTION DEPLOYMENT!
================================================================================
```

### Enhanced Markdown Reports

The system now generates comprehensive markdown reports with:

- **Visual progress indicators** using emoji and progress bars
- **Color-coded status tables** for easy interpretation
- **Production readiness matrices** with clear pass/fail indicators
- **Detailed error analysis** with categorized failure buckets
- **Actionable recommendations** based on performance results

### Configuration Options

| Environment Variable | Options | Default | Visual Impact |
|---------------------|---------|---------|---------------|
| `EVAL_MODE` | `real` \| `simulation` | `real` | Shows mode prominently in header |
| `EVAL_SCORING` | `binary` \| `weighted` | `weighted` | Affects final score calculation and display |
| `ZERO_OPENAI_MODE` | `true` \| `false` | `false` | Adds safety indicator when enabled |

### Visual Progress Features

#### Progress Bars
- **50-character width** progress bars for overall evaluation
- **20-character mini-bars** for individual field accuracy
- **Real-time updates** showing completion percentage

#### Status Indicators
- **🟢 Green**: Excellent performance (≥90% for names/categories, ≥85% for overall)
- **🟡 Yellow**: Good performance (≥80% for fields, ≥70% for overall)  
- **🟠 Orange**: Fair performance (≥70% for fields)
- **🔴 Red**: Needs improvement (<70%)

#### Production Readiness
- **✅ Checkmark**: Criterion met (ready for production)
- **❌ X-mark**: Criterion not met (needs improvement)
- **Summary status**: Overall readiness assessment with emoji

### Output Files

The visual system generates enhanced output files:

- `eval-results-YYYY-MM-DD.json` - Detailed JSON results with full data
- `eval-summary-YYYY-MM-DD.md` - **Enhanced visual markdown** with tables and indicators
- `eval-errors-YYYY-MM-DD.jsonl` - Error analysis with failure buckets
- `eval-trace-YYYY-MM-DD.jsonl` - Debug traces (if tracing enabled)

### Troubleshooting with Visual Feedback

The visual system provides clear error messages and troubleshooting guidance:

```
💥 EVALUATION FAILED
████████████████████████████████████████████████████████████████████████████████
Error: Dataset not found

🔧 Troubleshooting:
   1. Try simulation mode: EVAL_MODE=simulation node visual_runner.js
   2. Disable OpenAI: ZERO_OPENAI_MODE=true node visual_runner.js
   3. Check dataset exists: ls ../datasets/
   4. Review documentation: JAN_V4_QUICK_REFERENCE.md
████████████████████████████████████████████████████████████████████████████████
```

### Integration with Jan v4.0 System

The visual evaluation system seamlessly integrates with all Jan v4.0 parsing engines:

- **UrgencyAssessmentEngine**: Visual confidence scores for 6-layer detection
- **AmountDetectionEngine**: Multi-pass results with fallback tier indicators  
- **MultiFieldCoordinationEngine**: Cross-field validation results
- **FragmentProcessor**: Speech quality metrics and processing results

This provides immediate visual feedback on how well each engine component is performing and where improvements may be needed.

---

**Ready to evaluate?** Run `npm run eval:v4:demo` to see the Jan v4.0 system in action with full visual feedback!