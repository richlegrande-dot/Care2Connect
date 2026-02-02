# Production Transcript Validation Guide

**Purpose:** Validate urgency patterns against real production data WITHOUT overfitting to test cases

**Date:** January 27, 2026  
**Status:** Ready for production data collection

---

## 🎯 Why This Approach?

You correctly identified that examining test transcripts would lead to overfitting. This guide helps you:

1. **Collect real production data** safely and ethically
2. **Anonymize sensitive information** while preserving linguistic patterns
3. **Validate pattern coverage** using aggregate statistics
4. **Identify gaps** in vocabulary without seeing individual cases

---

## 📋 Step 1: Export Production Transcripts

### SQL Query to Export Anonymized Data

```sql
-- Export recent transcripts with manual urgency labels (if available)
SELECT 
  id,
  transcript_text,
  category,
  urgency_level_assigned,  -- If manually labeled
  created_at
FROM transcripts
WHERE created_at >= DATEADD(month, -3, GETDATE())  -- Last 3 months
  AND transcript_text IS NOT NULL
  AND LEN(transcript_text) > 50  -- Non-trivial transcripts
ORDER BY NEWID()  -- Random sampling
OFFSET 0 ROWS
FETCH NEXT 100 ROWS ONLY;  -- Sample size
```

### Export Format

Save as `production_transcripts.json`:

```json
[
  {
    "id": "uuid-here",
    "transcript": "Hi, my name is Sarah Johnson and I need help with...",
    "category": "HOUSING",
    "urgency_assigned": "HIGH",
    "created_at": "2026-01-15T10:30:00Z"
  }
]
```

---

## 🔒 Step 2: Anonymize Data

### Option A: Use Built-in Anonymization

```bash
cd backend/eval/v4plus/utils
node productionTranscriptValidator.js ../data/production_transcripts.json
```

The validator automatically anonymizes:
- Names → `[NAME]`
- Phone numbers → `[PHONE]`
- Emails → `[EMAIL]`
- Addresses → `[ADDRESS]`
- SSN → `[SSN]`
- Dollar amounts → Rounded to nearest $100

### Option B: Manual SQL-Level Anonymization

```sql
-- Anonymize at export time
SELECT 
  id,
  -- Replace names with placeholders using patterns
  REPLACE(REPLACE(transcript_text, 
    -- This is simplified - use proper regex in practice
    [actual_name], '[NAME]'), 
    [phone], '[PHONE]') AS transcript,
  category,
  urgency_level_assigned
FROM transcripts
```

---

## 📊 Step 3: Run Validation

```bash
cd backend/eval/v4plus/utils
node productionTranscriptValidator.js ../data/production_transcripts.json
```

### Expected Output

```
📊 Production Transcript Validator

⚠️  Privacy Note: This tool analyzes patterns without displaying individual transcripts

📄 Loaded 100 production transcripts

═══════════════════════════════════════════════
           PRODUCTION PATTERN VALIDATION REPORT
═══════════════════════════════════════════════

📊 URGENCY DISTRIBUTION:
   CRITICAL: 12 (12.0%)
   HIGH:     35 (35.0%)
   MEDIUM:   48 (48.0%)
   LOW:      3 (3.0%)
   NONE:     2 (2.0%)

🔤 TOP 20 URGENCY KEYWORDS FOUND:
   1. "help" - 87 transcripts (87.0%)
   2. "need" - 76 transcripts (76.0%)
   3. "urgent" - 42 transcripts (42.0%)
   4. "eviction" - 18 transcripts (18.0%)
   5. "rent" - 45 transcripts (45.0%)
   ...

💡 RECOMMENDATIONS:
   ⚠️  MEDIUM: 2.0% of transcripts matched NO urgency patterns
      → Review vocabulary coverage - may be missing common phrases

✅ Validation complete - patterns analyzed against 100 transcripts
```

---

## 🔍 Step 4: Interpret Results

### Green Flags ✅

- **Low NONE rate (<5%):** Most transcripts match at least one pattern
- **Balanced distribution:** Not all transcripts flagged as CRITICAL
- **High keyword coverage:** Top 20 keywords represent 80%+ of transcripts

### Red Flags ⚠️

- **High NONE rate (>20%):** Missing common urgency vocabulary
  - **Action:** Review top unmatched keywords and add patterns
  
- **Over-escalation (>30% CRITICAL):** Patterns too aggressive
  - **Action:** Tighten CRITICAL patterns, add more word boundaries
  
- **Under-escalation (<10% HIGH+CRITICAL):** Patterns too conservative
  - **Action:** Add more urgency indicators

### Yellow Flags ⚡

- **Unusual keyword frequency:** Term appears in >80% of transcripts
  - **Action:** May be filler word, consider removing from patterns
  
- **Missing expected terms:** "deadline", "emergency" appear in <5%
  - **Action:** Verify production data is representative

---

## 🛠️ Step 5: Iterate Without Overfitting

### Safe Iteration Process

1. **Identify gaps from aggregate stats** (not individual transcripts)
2. **Add general patterns** based on linguistic principles
3. **Re-run validation** on same production sample
4. **Compare distributions** - should see improvement
5. **Don't look at individual failing transcripts** until pattern coverage stabilizes

### Example: Adding Patterns Based on Stats

If validation shows:
- "court date" appears in 15% of transcripts
- But only 8% flagged as HIGH urgency
- And "court" has high vocabulary coverage

**Action:** Add temporal urgency pattern:
```javascript
/\b(court).*(date|hearing|tomorrow|this.*week)\b/i
```

This is **linguistically valid** and **not test-specific**.

---

## 📈 Step 6: Monitor Over Time

### Continuous Validation

```bash
# Run monthly validation
node productionTranscriptValidator.js \
  ../data/production_transcripts_jan_2026.json \
  > ../reports/validation_jan_2026.txt

# Compare month-over-month
diff ../reports/validation_dec_2025.txt ../reports/validation_jan_2026.txt
```

### Track Metrics

- **Pattern coverage trend:** Should improve over time
- **Distribution stability:** Should remain consistent month-to-month
- **New keyword discovery:** Identify emerging vocabulary

---

## ⚖️ Ethical Considerations

### DO ✅
- Export only necessary fields (transcript, category, timestamp)
- Anonymize all PII before storing locally
- Use aggregate statistics only
- Delete local copies after validation
- Get proper authorization for data access

### DON'T ❌
- Store raw production transcripts on development machines
- Share transcripts with anyone
- Look at individual transcripts to "fix" specific failures
- Use real names, phone numbers, or addresses in reports
- Keep data longer than needed for validation

---

## 🎓 Next Steps

1. **Coordinate with DBA/DevOps** to safely export production data
2. **Run initial validation** on sample of 100 transcripts
3. **Review aggregate statistics** (not individual cases)
4. **Identify 2-3 high-impact gaps** to address
5. **Add linguistically-valid patterns** based on gaps
6. **Re-validate** to measure improvement
7. **Repeat quarterly** to catch vocabulary drift

---

## 📞 Support

If you encounter issues:

1. **Pattern not matching expected keywords?**
   - Check regex syntax (word boundaries, case sensitivity)
   - Verify pattern level (CRITICAL vs HIGH vs MEDIUM)

2. **High NONE rate after adding patterns?**
   - Patterns may be too specific
   - Consider broader vocabulary coverage

3. **Validation script errors?**
   - Verify JSON format matches expected schema
   - Check file paths are correct

---

**Remember:** The goal is to validate patterns work on real data **without overfitting**. Use aggregate statistics to guide improvements, not individual test case inspection.
