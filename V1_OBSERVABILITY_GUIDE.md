# V1 Zero-OpenAI Observability & Audit Guide

## Overview

V1 Zero-OpenAI Mode is designed for complete observability, auditability, and transparency. This guide documents logging patterns, audit trails, traceability mechanisms, and admin dashboard features to ensure QA teams, auditors, and stakeholders can verify zero-dependency operation.

---

## Critical Verification Points

### 1. Rules-Based Provider Confirmation

**What to Check**: System must use rules-based extraction, not OpenAI

**Log Pattern**:
```
[AI Provider] Initializing provider: rules
[AI Provider] Using: Rules-Based Provider (type: rules)
```

**Verification Steps**:
1. Check backend logs on startup
2. Confirm `AI_PROVIDER=rules` in backend/.env
3. Verify no OpenAI API keys present
4. Confirm provider initialization logs show "rules"

**Red Flags** 🚨:
- "Using: OpenAI Provider"
- "API Key configured for OpenAI"
- Any reference to GPT-3.5, GPT-4, or OpenAI models

---

### 2. Zero OpenAI API Calls

**What to Check**: No external AI API calls during profile extraction

**Log Pattern**:
```
[API Audit] OpenAI calls: 0
[API Audit] External AI requests: 0
[Cost Tracking] OpenAI cost: $0.00
```

**Verification Steps**:
1. Enable API audit logging in .env: `ENABLE_API_AUDIT=true`
2. Create 10-20 test profiles
3. Check logs for API call count
4. Confirm 0 OpenAI requests
5. Verify cost tracking shows $0

**Red Flags** 🚨:
- Any OpenAI API call count > 0
- Presence of OpenAI request logs
- Non-zero OpenAI cost
- HTTP requests to api.openai.com

---

### 3. Profile and Recording Traceability

**What to Check**: Every profile has unique ID and links to source recording

**Log Pattern**:
```
[Profile Extraction] Started for recording: rec_abc123xyz
[Profile Extraction] Name: John Smith (pattern: 1, confidence: high)
[Profile Extraction] Age: 42 (pattern: 3, confidence: medium)
[Profile Extraction] Needs: HOUSING, EMPLOYMENT (keywords: 5)
[Profile Extraction] Completed: profile_def456uvw (total: 1ms)
[Traceability] Recording: rec_abc123xyz → Profile: profile_def456uvw
```

**Verification Steps**:
1. Create a test profile
2. Note the recording ID from logs
3. Note the profile ID from logs
4. Query database: `SELECT * FROM profiles WHERE id = 'profile_def456uvw'`
5. Confirm recording_id column matches rec_abc123xyz
6. Verify profile has created_at timestamp

**Database Schema**:
```sql
profiles (
  id VARCHAR PRIMARY KEY,           -- profile_xyz123
  recording_id VARCHAR NOT NULL,    -- rec_abc456
  name VARCHAR,
  age INTEGER,
  needs TEXT[],
  extraction_metadata JSONB,        -- Contains pattern info
  created_at TIMESTAMP
)
```

---

## Logging Architecture

### Log Levels

| Level | Purpose | Examples |
|-------|---------|----------|
| **INFO** | Normal operation | Provider initialization, profile creation, API audit |
| **DEBUG** | Detailed diagnostics | Pattern matching, regex evaluation, extraction steps |
| **WARN** | Non-critical issues | Missing optional fields, low confidence extractions |
| **ERROR** | Critical failures | Database errors, invalid input, system failures |

### Log Categories

#### 1. AI Provider Initialization

```
[AI Provider] Initializing provider: rules
[AI Provider] Using: Rules-Based Provider (type: rules)
[AI Provider] OpenAI integration: DISABLED
```

**Purpose**: Confirm system is using rules-based extraction  
**When**: Backend startup, environment change  
**Verify**: No OpenAI provider logs

---

#### 2. Profile Extraction

```
[Profile Extraction] Started for recording: rec_12345
[Profile Extraction] Transcript length: 450 characters
[Profile Extraction] Name: John Smith
  - Pattern matched: 1 (NAME_IS)
  - Confidence: high
  - Latency: 0ms
[Profile Extraction] Age: 42
  - Pattern matched: 3 (AGE_NUMBER_ONLY)
  - Confidence: medium
  - Latency: 0ms
[Profile Extraction] Needs detected: 3
  - HOUSING (keywords: apartment, rent, eviction)
  - EMPLOYMENT (keywords: job, work, laid off)
  - HEALTHCARE (keywords: doctor, medication)
  - Total score: 8
  - Latency: 0ms
[Profile Extraction] Skills: construction, forklift operator
[Profile Extraction] Location: Miami, FL
[Profile Extraction] Contact: (555) 123-4567, john.smith@example.com
[Profile Extraction] Completed: profile_67890
  - Total latency: 1ms
  - Extraction method: rules
  - OpenAI calls: 0
```

**Purpose**: Full audit trail of extraction logic  
**When**: Every profile creation  
**Verify**: Latency <100ms, OpenAI calls = 0

---

#### 3. API Audit

```
[API Audit] Session: session_abc123
[API Audit] Profiles created: 5
[API Audit] OpenAI calls: 0
[API Audit] AssemblyAI calls: 5
[API Audit] Total cost: $0.00 (OpenAI: $0.00, AssemblyAI: $0.50)
[API Audit] Average extraction latency: 0.8ms
[API Audit] Success rate: 100% (5/5)
```

**Purpose**: Track all external API usage and costs  
**When**: End of session, batch operations, periodic audit  
**Verify**: OpenAI calls = 0, OpenAI cost = $0.00

---

#### 4. Pattern Matching (DEBUG)

```
[Rules Engine] Evaluating name patterns for: "My name is John Smith"
[Rules Engine] Pattern 1 (NAME_IS) - MATCH: "John Smith"
[Rules Engine] Pattern 2 (I_AM_NAME) - NO MATCH
[Rules Engine] Pattern 3 (MY_NAME_IS) - NO MATCH
[Rules Engine] Best match: Pattern 1 (confidence: high)
```

**Purpose**: Detailed extraction debugging  
**When**: DEBUG logging enabled  
**Verify**: Pattern matching logic correctness

---

#### 5. Database Operations

```
[Database] Inserting profile: profile_12345
[Database] Recording ID: rec_67890
[Database] Insert completed: 2ms
[Database] Audit trail created
```

**Purpose**: Track database interactions  
**When**: Profile creation, updates, queries  
**Verify**: Successful inserts, audit trail creation

---

## Admin Dashboard

### Health Dashboard (`/admin/health`)

**Purpose**: Real-time system status and configuration verification

**Key Metrics**:

1. **System Configuration**
   - AI Provider: `rules` ✅
   - Transcription Provider: `assemblyai`
   - OpenAI Status: `Disabled` ✅
   - V1 Stable Mode: `Enabled` ✅

2. **Performance Metrics**
   - Total Profiles: 1,543
   - Average Extraction Time: 0.9ms ✅
   - Success Rate: 98.5%
   - Uptime: 15 days

3. **Cost Tracking**
   - OpenAI Cost (30 days): $0.00 ✅
   - AssemblyAI Cost (30 days): $125.00
   - Total AI Cost: $125.00

4. **API Audit**
   - OpenAI Calls (24h): 0 ✅
   - AssemblyAI Calls (24h): 87
   - External API Errors: 2

**Verification Steps**:
1. Navigate to `/admin/health`
2. Confirm AI Provider = `rules`
3. Confirm OpenAI Status = `Disabled`
4. Confirm OpenAI Cost = $0.00
5. Confirm OpenAI Calls = 0

---

### Profile Dashboard (`/admin/profiles`)

**Purpose**: Review recent profile extractions

**Key Features**:

1. **Recent Profiles Table**
   - Profile ID
   - Recording ID (click to view transcript)
   - Name, Age, Needs
   - Extraction Latency
   - Created At

2. **Extraction Method Filter**
   - Filter by: `rules` (V1), `openai` (disabled), `manual`
   - Should only show `rules` entries ✅

3. **Audit Trail**
   - Click profile → View extraction metadata
   - Pattern numbers used
   - Confidence scores
   - Keywords detected
   - Full transcript

**Verification Steps**:
1. Navigate to `/admin/profiles`
2. Select "Last 24 hours"
3. Confirm all profiles show extraction method: `rules`
4. Click any profile to view metadata
5. Verify pattern numbers and keywords are logged

---

### Logs Viewer (`/admin/logs`)

**Purpose**: Search and filter backend logs

**Key Features**:

1. **Log Search**
   - Search by: keyword, profile ID, recording ID, date range
   - Filter by: log level (INFO, DEBUG, WARN, ERROR)

2. **Critical Filters**
   - "OpenAI" → Should return 0 results for V1 operations ✅
   - "Rules-Based Provider" → Should return startup logs
   - "API Audit" → Should show OpenAI calls = 0

3. **Downloadable Logs**
   - Export logs for auditor review
   - CSV, JSON, or plain text format

**Verification Steps**:
1. Navigate to `/admin/logs`
2. Search: "OpenAI calls"
3. Confirm all results show "OpenAI calls: 0"
4. Search: "Rules-Based Provider"
5. Confirm provider initialization logs present

---

## Audit Trail Schema

### Profile Extraction Metadata

Every profile includes extraction metadata in JSONB format:

```json
{
  "extraction_metadata": {
    "version": "v1-stable",
    "provider": "rules",
    "timestamp": "2026-01-15T10:30:45Z",
    "latency_ms": 1,
    "patterns_used": {
      "name": {
        "pattern_id": 1,
        "pattern_name": "NAME_IS",
        "confidence": "high",
        "matched_text": "John Smith"
      },
      "age": {
        "pattern_id": 3,
        "pattern_name": "AGE_NUMBER_ONLY",
        "confidence": "medium",
        "matched_text": "42"
      },
      "needs": [
        {
          "category": "HOUSING",
          "keywords": ["apartment", "rent", "eviction"],
          "score": 3
        },
        {
          "category": "EMPLOYMENT",
          "keywords": ["job", "work", "laid off"],
          "score": 3
        }
      ]
    },
    "openai_calls": 0,
    "total_api_calls": 0,
    "cost_usd": 0.00
  }
}
```

**Query Example**:
```sql
-- Find all profiles with OpenAI calls (should be 0)
SELECT id, name, extraction_metadata->'openai_calls' as openai_calls
FROM profiles
WHERE (extraction_metadata->>'openai_calls')::int > 0;

-- Expected result: 0 rows
```

---

## Environment Variable Audit

### Required Configuration

```bash
# V1 Stable Configuration (LOCKED)
V1_STABLE=true
ZERO_OPENAI_MODE=true
AI_PROVIDER=rules

# Transcription
TRANSCRIPTION_PROVIDER=assemblyai
ASSEMBLYAI_API_KEY=<your-key>

# OpenAI (DISABLED)
OPENAI_API_KEY=   # Blank or removed
OPENAI_MODEL=     # Blank or removed

# Audit and Logging
ENABLE_API_AUDIT=true
ENABLE_DETAILED_LOGGING=true
LOG_LEVEL=INFO
```

### Verification Script

```bash
# Check V1 configuration
cat backend/.env | grep -E "(V1_STABLE|AI_PROVIDER|OPENAI)"

# Expected output:
# V1_STABLE=true
# AI_PROVIDER=rules
# OPENAI_API_KEY=
# OPENAI_MODEL=
```

---

## QA Testing Checklist

### Pre-Deployment Verification

Before deploying V1 to production:

- [ ] **1. Provider Verification**
  - [ ] Backend logs show "Rules-Based Provider"
  - [ ] Admin dashboard shows AI Provider = `rules`
  - [ ] No OpenAI provider logs present

- [ ] **2. API Audit**
  - [ ] Create 10 test profiles
  - [ ] Verify OpenAI calls = 0 in logs
  - [ ] Confirm OpenAI cost = $0.00
  - [ ] Check API audit summary

- [ ] **3. Traceability**
  - [ ] Every profile has unique ID
  - [ ] Every profile links to recording ID
  - [ ] Extraction metadata is logged
  - [ ] Database queries work correctly

- [ ] **4. Dashboard Checks**
  - [ ] `/admin/health` shows correct configuration
  - [ ] `/admin/profiles` shows only rules-based profiles
  - [ ] `/admin/logs` searchable and accurate

- [ ] **5. Log Verification**
  - [ ] Search logs for "OpenAI calls: 0" → All results = 0
  - [ ] Search logs for "Rules-Based Provider" → Present
  - [ ] No ERROR logs during profile creation
  - [ ] Latency logs show <100ms average

- [ ] **6. Environment Audit**
  - [ ] V1_STABLE=true
  - [ ] AI_PROVIDER=rules
  - [ ] OPENAI_API_KEY blank or removed
  - [ ] No OpenAI-related environment variables

---

## Stakeholder Verification

### For Auditors

1. **Request audit report**:
   ```bash
   curl http://localhost:8000/admin/audit/v1-report
   ```

2. **Review report sections**:
   - Configuration: AI Provider = rules
   - API Calls: OpenAI = 0
   - Cost: OpenAI = $0.00
   - Profiles: Total extraction latency
   - Traceability: All profiles have recording IDs

3. **Export data**:
   ```bash
   curl http://localhost:8000/admin/audit/v1-export > v1-audit.json
   ```

4. **Verify**:
   - No OpenAI API usage
   - All profiles use rules-based extraction
   - Complete audit trail present

---

### For Non-Technical Stakeholders

**Key Questions and Answers**:

**Q: Is the system using AI?**  
A: No. V1 uses rules-based pattern matching, not AI or machine learning.

**Q: Are we paying for OpenAI?**  
A: No. OpenAI is disabled. Cost = $0/month.

**Q: Can we verify this?**  
A: Yes. Admin dashboard shows:
- AI Provider: `rules`
- OpenAI Status: `Disabled`
- OpenAI Cost: $0.00
- OpenAI API Calls: 0

**Q: How can we audit this over time?**  
A: The system logs every profile extraction with:
- Extraction method (should always be `rules`)
- OpenAI API call count (should always be 0)
- Cost tracking (should always be $0 for OpenAI)

All logs are searchable and exportable for auditor review.

---

## Continuous Monitoring

### Daily Checks

1. **Morning Health Check**:
   - Visit `/admin/health`
   - Confirm AI Provider = `rules`
   - Check OpenAI calls (24h) = 0

2. **Weekly Audit**:
   - Export logs for the week
   - Search for "OpenAI calls:"
   - Verify all results = 0

3. **Monthly Report**:
   - Generate audit report
   - Review cost tracking
   - Confirm $0 OpenAI spend
   - Check profile extraction trends

---

### Automated Alerts

Configure alerts for:

1. **OpenAI Call Detection** 🚨
   - Trigger: Any OpenAI API call detected
   - Action: Immediate alert to ops team
   - Escalation: Block deployment if detected

2. **Provider Configuration Change** ⚠️
   - Trigger: AI_PROVIDER changed from `rules`
   - Action: Alert to ops team
   - Escalation: Require approval for changes

3. **High Latency** ⚠️
   - Trigger: Average extraction latency >100ms
   - Action: Performance investigation
   - Escalation: Check for database issues

4. **Low Success Rate** ⚠️
   - Trigger: Profile creation success rate <95%
   - Action: Review failed extractions
   - Escalation: Check input data quality

---

## Troubleshooting

### Issue: "OpenAI calls detected in logs"

**Cause**: AI_PROVIDER not set to `rules` or code regression  
**Fix**:
1. Check backend/.env: `AI_PROVIDER=rules`
2. Restart backend
3. Review git history for code changes
4. Run: `npm run test:qa:v1` to verify rules engine

---

### Issue: "Missing profile metadata"

**Cause**: Logging configuration disabled  
**Fix**:
1. Check backend/.env: `ENABLE_DETAILED_LOGGING=true`
2. Restart backend
3. Create test profile
4. Verify extraction_metadata is populated

---

### Issue: "Admin dashboard shows OpenAI enabled"

**Cause**: Cached configuration or stale data  
**Fix**:
1. Clear browser cache
2. Restart backend
3. Check backend/.env for correct V1 settings
4. Verify provider initialization logs

---

## Conclusion

V1 Zero-OpenAI Mode provides complete observability and auditability through:

- ✅ Detailed logging of all extraction operations
- ✅ Zero OpenAI API call verification
- ✅ Full profile and recording traceability
- ✅ Admin dashboards for real-time monitoring
- ✅ Audit trail for compliance and review
- ✅ Continuous monitoring and alerting

**For questions or issues**, refer to:
- V1 Phase 6 Complete Report: `V1_ZERO_OPENAI_PHASE6_100_COMPLETE.md`
- Stress Testing Guide: `V1_STRESS_TESTING_GUIDE.md`
- Stakeholder Summary: `V1_STAKEHOLDER_SUMMARY.md`
