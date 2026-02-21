# Automated Parsing Training Loop - Jan v.2.5

A comprehensive evaluation and continuous improvement system for the Care2system parsing helper. This system tests parsing quality against golden datasets and provides detailed analysis for iterative improvement.

## 🎯 Purpose

This is **NOT** machine learning training. This is a continuous evaluation pipeline that:

- Tests parsing helper against labeled transcript datasets
- Compares actual vs expected outputs with field-specific rules  
- Logs failures and diagnostics to structured files
- Generates progress reports and trend analysis over time
- Identifies fragile test cases that fail frequently
- Provides actionable recommendations for improvement

## 🔒 Privacy & Safety

- ✅ No OpenAI or paid AI providers
- ✅ No PII stored in evaluation outputs
- ✅ Phone/email redaction in all logs  
- ✅ Only hashed transcript references for correlation
- ✅ Safe to share results with funders/stakeholders

## 📁 Structure

```
backend/eval/
├── datasets/           # Golden standard test cases
│   ├── README.md
│   └── transcripts_golden_v1.jsonl
├── runners/           # Evaluation execution scripts  
│   ├── run_parsing_eval.ts
│   └── analyze_eval_logs.ts
├── outputs/           # Results and analysis reports
│   └── README.md
├── schemas/           # JSON schemas for validation
│   ├── golden_dataset.schema.json
│   ├── eval_result.schema.json  
│   └── error_record.schema.json
├── utils/             # Helper utilities
│   ├── redact.ts      # PII redaction
│   ├── hash.ts        # Secure hashing  
│   ├── diff.ts        # Field comparison
│   ├── buckets.ts     # Failure categorization
│   └── trace.ts       # Debug tracing
└── README.md
```

## 🚀 Usage

### Basic Evaluation

```bash
# Run evaluation against golden dataset
npm run eval:parsing

# Run with debug tracing (creates larger files)  
npm run eval:parsing:trace

# Analyze all historical results
npm run eval:analyze

# Run evaluation then analysis
npm run eval:all
```

### Environment Variables

```bash
# Enable detailed debug tracing during evaluation
TRACE_PARSING=true

# Export trace data to files (warning: large files)
TRACE_EXPORT=true
```

## 📊 Output Files

### Per Evaluation Run
- `eval-results-YYYY-MM-DD.json` - Complete detailed results
- `eval-summary-YYYY-MM-DD.md` - Human-readable summary
- `eval-errors-YYYY-MM-DD.jsonl` - Failed cases with failure categories
- `eval-trace-YYYY-MM-DD.jsonl` - Debug traces (if enabled)

### Analysis Reports  
- `eval-trends.json` - Historical performance data
- `eval-trends-summary.md` - Trend analysis and recommendations
- `fragile-cases-report.md` - Frequently failing test cases

## 🎯 Evaluation Process

1. **Load Golden Dataset**: Reads test cases from JSONL file
2. **Run Parser**: Executes parsing helper on each transcript
3. **Compare Results**: Field-by-field comparison with expected outputs
4. **Categorize Failures**: Groups failures into actionable buckets
5. **Generate Reports**: Creates detailed and summary reports
6. **Track Trends**: Updates historical analysis

## 📈 Failure Categories

The system automatically categorizes failures into buckets:

- `AMOUNT_FALSE_POSITIVE_WAGE` - Goal amount confused with hourly wage
- `AMOUNT_FALSE_POSITIVE_AGE` - Goal amount confused with age  
- `NAME_FALSE_POSITIVE_LOCATION` - Name confused with location
- `CATEGORY_MISCLASSIFICATION` - Wrong story category assigned
- `URGENCY_UNDERSCORED/OVERSCORED` - Incorrect urgency assessment
- `FALLBACK_USED_UNEXPECTEDLY` - Fallback when direct extraction should work
- `CONFIDENCE_TOO_HIGH/LOW` - Confidence calibration issues

## 🔧 Field Comparison Rules

### Goal Amount
- Exact match OR within specified tolerance
- Handles null/missing amounts correctly
- Detects false positives (wages, ages, dates)

### Name  
- Exact match (case insensitive) by default
- Optional fuzzy matching with similarity threshold
- Filters out location false positives

### Category
- Exact match required
- Maps to predefined categories (HOUSING, HEALTHCARE, etc.)

### Urgency Level
- Exact match on LOW/MEDIUM/HIGH/CRITICAL
- Tracks under/over-estimation patterns

## 📝 Adding Test Cases

1. Create realistic but **fictional** scenarios in `datasets/transcripts_golden_v1.jsonl`
2. Use fake names, locations, and contact information  
3. Provide accurate expected outputs for all fields
4. Include challenging edge cases and common failure patterns
5. Validate JSON format before committing

### Example Test Case
```json
{
  "id": "T016",
  "description": "Housing emergency with clear amount",
  "transcriptText": "Hi, this is Alex Smith. I need help with rent...",
  "segments": [...],
  "expected": {
    "name": "Alex Smith", 
    "category": "HOUSING",
    "urgencyLevel": "HIGH",
    "goalAmount": 1200,
    "missingFields": []
  },
  "expectations": {
    "allowFuzzyName": false,
    "amountTolerance": 50
  }
}
```

## 🔍 Debugging & Tracing

Enable tracing to debug parsing behavior:

```bash
TRACE_PARSING=true TRACE_EXPORT=true npm run eval:parsing
```

This creates detailed execution traces showing:
- Which regex patterns matched
- Keyword category scores  
- Confidence calculations per field
- Fallback tier usage
- Performance timing

## 📊 Interpreting Results

### Pass Rate
- Overall percentage of test cases that pass all field checks
- Target: >90% for production readiness

### Field Accuracy  
- Per-field success rates
- Identifies specific areas needing improvement

### Confidence Scores
- Average confidence by field
- Helps calibrate confidence thresholds

### Fallback Usage
- How often fallback logic is used vs direct extraction
- High fallback usage indicates weak primary patterns

### Failure Buckets
- Most common failure patterns
- Provides specific areas for code improvements

## 🎯 Improvement Workflow

1. **Run Evaluation**: `npm run eval:parsing`
2. **Review Results**: Check summary report and failure buckets
3. **Fix Issues**: Update parsing rules based on failure categories  
4. **Re-evaluate**: Run evaluation again to measure improvement
5. **Track Trends**: Use `npm run eval:analyze` to see progress over time
6. **Iterate**: Repeat cycle for continuous improvement

## ⚡ Integration Notes

The evaluation runner simulates parsing calls but needs to be integrated with actual parsing services:

```typescript
// Replace simulation in run_parsing_eval.ts with:
import { transcriptSignalExtractor } from '../../services/transcriptSignalExtractor';
import { storyExtractionService } from '../../services/storyExtractionService';

// In simulateParsingResults method:
const signals = await transcriptSignalExtractor.extractSignals(testCase.transcriptText);
const story = await storyExtractionService.extractStory(signals);
```

## 🔐 Security Considerations

- Golden datasets contain fictional data only
- Output files redact all PII automatically
- Trace files are optional and should be cleaned regularly
- All file outputs are safe for version control and sharing

## 📞 Support

For questions about the evaluation system:
1. Check output summaries and error logs first
2. Review failure bucket classifications  
3. Use trace mode for detailed debugging
4. Consult trend reports for historical context

---

**Remember**: This system measures and improves parsing quality without requiring machine learning infrastructure or paid AI services.