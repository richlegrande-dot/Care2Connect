# Speech Intelligence DB Loop - Implementation Complete ✅

## 📋 Overview

Comprehensive database-backed feedback/telemetry loop for the transcription system that enables continuous improvement, troubleshooting, and runtime optimization.

**Status:** ✅ Code Complete | ⏳ Testing Pending

---

## 🗂️ Database Schema

### New Models Added (6)

#### 1. **TranscriptionSession**
Main session tracker with 22 fields:
- `id`, `userId`, `source`, `engine`, `language`, `duration`
- `status`, `stage`, `errorMessage`, `errorCode`
- Consent flags: `consentToStoreText`, `consentToStoreMetrics`
- Timing: `startTime`, `endTime`, `retentionUntil`
- Quality metrics: `confidenceScore`, `wordCount`, `characterCount`
- Full text: `transcriptText` (stored only if consent=true)
- Relations: segments[], errors[], feedback[], analysis[]

#### 2. **TranscriptionSegment**
Chunk-level data for timeline analysis:
- `sessionId`, `text`, `confidence`, `startTime`, `endTime`
- Enables debugging specific audio segments

#### 3. **SpeechAnalysisResult**
Analyzer outputs:
- `sessionId`, `analyzerType`, `analysisData` (JSON)
- Examples: sentiment, keywords, quality scores, language detection

#### 4. **TranscriptionErrorEvent**
Error tracking with sanitization:
- `sessionId`, `errorStage`, `errorCode`, `sanitizedMessage`
- Relations: `session`, `createdAt`

#### 5. **TranscriptionFeedback**
Human-in-the-loop corrections:
- `sessionId`, `userId`, `feedbackType` (CORRECTION | RATING | QUALITY_ISSUE)
- `rating` (1-5), `issueType`, `comments`, `correctedText`

#### 6. **ModelTuningProfile**
Runtime config optimizations:
- `profileType` (GLOBAL | LANGUAGE | SOURCE)
- `scope` (e.g., "en", "fr", "WEB_RECORDING")
- `recommendedEngine`, `recommendedSettings` (JSON)
- `successRate`, `avgLatency`, `sampleCount`, `confidence`
- `lastComputed`, `validUntil`

### Enums Added (5)
- **TranscriptionSource**: WEB_RECORDING, UPLOAD, API, SYSTEM_SMOKE_TEST
- **TranscriptionEngine**: OPENAI, WHISPER_LOCAL, DEEPGRAM, ASSEMBLY_AI
- **TranscriptionStatus**: PROCESSING, SUCCESS, FAILED, TIMED_OUT
- **TranscriptionStage**: UPLOAD, PREPROCESSING, ENGINE_CALL, POSTPROCESSING, ANALYSIS
- **TuningScope**: GLOBAL, LANGUAGE, SOURCE

---

## 🔧 Services Implemented

### 📂 `backend/src/services/speechIntelligence/`

#### **sessionManager.ts** (243 lines)
**Purpose:** Manage transcription session lifecycle with privacy controls

**Key Functions:**
- `createSession()` - Initialize with consent flags, retention policy
- `updateSession()` - Update status, transcript (only if consent=true)
- `addSegments()` - Store chunk-level data
- `recordError()` - Log failures with sanitized messages
- `addAnalysisResult()` - Store analyzer outputs
- `addFeedback()` - Store human corrections
- `getSession()` - Retrieve with all relations
- `listSessions()` - Query with filters (engine, language, status, source)
- `redactSensitiveInfo()` - Remove emails/phones from text
- `sanitizeErrorMessage()` - Remove paths/tokens from errors

**Privacy Features:**
- Respects `consentToStoreText` flag (never stores transcript without consent)
- Automatic PII redaction: `[EMAIL]`, `[PHONE]`
- Error sanitization removes file paths, API keys
- Configurable retention period (default 30 days)

---

#### **runtimeTuning.ts** (280 lines)
**Purpose:** ML-based engine/settings selection from historical performance

**Key Functions:**
- `getRecommendation()` - Query tuning profiles by language/route, fallback to defaults
- `computeProfiles()` - Daily cron to recompute recommendations from accumulated data
- `computeGlobalProfile()` - Overall best engine selection
- `computeLanguageProfiles()` - Per-language optimization
- `computeRouteProfiles()` - Per-source optimization
- `selectBestEngine()` - Score engines by success rate + latency penalty

**Tuning Logic:**
- Requires **30+ samples** before changing recommendations
- Scoring: `score = successRate - (latency / 10000)`
- Confidence: `1 - (1 / sqrt(sampleCount))`
- Profiles expire after 7 days

---

#### **intelligentTranscription.ts** (183 lines)
**Purpose:** Wrap existing TranscriptionService with DB loop

**Integration Flow:**
```
User Request
    ↓
1. Get tuning recommendation (engine, settings)
    ↓
2. Create session in DB (with consent flags)
    ↓
3. Call TranscriptionService.transcribe()
    ↓
4. Store segments, transcript (if consent), errors
    ↓
5. Run analysis (word count, sentiment, keywords)
    ↓
6. Update session status + metrics
    ↓
Response to User (+ sessionId for feedback)
```

**Key Functions:**
- `transcribe()` - Full pipeline with tuning + telemetry
- `analyzeTranscript()` - Extract word count, sentences, keywords, sentiment

---

#### **smokeTest.ts** (143 lines)
**Purpose:** Automated health checks for transcription system

**Tests Run:**
1. ✅ Session creation
2. ✅ Metric recording
3. ✅ Error logging
4. ✅ Analysis storage

**Schedule:** Every 24 hours (configurable via `SPEECH_SMOKE_TEST_INTERVAL_HOURS`)

**Output:**
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "results": {
    "session_creation": { "success": true },
    "metrics_storage": { "success": true },
    "error_logging": { "success": true },
    "analysis_storage": { "success": true }
  }
}
```

---

#### **retention.ts** (85 lines)
**Purpose:** Data retention policy enforcement

**Key Functions:**
- `cleanupExpiredSessions()` - Delete sessions past `retentionUntil` (100 per batch)
- `getRetentionStats()` - Report total/expiring/expired counts

**Schedule:** Daily at 2:00 AM

**Cascade Delete:** Automatically removes segments, errors, feedback, analysis

---

#### **scheduler.ts** (140 lines)
**Purpose:** Coordinate periodic tasks (cleanup, profiling, smoke tests)

**Scheduled Jobs:**
- **Cleanup:** 2:00 AM daily → `cleanupExpiredSessions()`
- **Profiles:** 3:00 AM daily → `computeProfiles()`
- **Smoke Tests:** Every 24h → `runTests()`

**Singleton Pattern:** Ensures only one scheduler instance

**Functions:**
- `start()` - Initialize all jobs
- `stop()` - Cleanup intervals
- `getLastSmokeTestResult()` - Expose results for health endpoint

---

#### **index.ts**
Module exports for all services.

---

## 🔌 API Endpoints

### 📂 `backend/src/routes/admin/speechIntelligence.ts` (225 lines)

#### **GET** `/admin/speech-intelligence/sessions`
List sessions with filters.

**Query Params:**
- `engine` - Filter by TranscriptionEngine
- `language` - Filter by language code
- `status` - Filter by TranscriptionStatus
- `source` - Filter by TranscriptionSource
- `skip` - Pagination offset (default: 0)
- `take` - Page size (default: 20, max: 100)

**Response:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "source": "WEB_RECORDING",
      "engine": "OPENAI",
      "language": "en",
      "status": "SUCCESS",
      "duration": 45.3,
      "startTime": "2024-01-15T10:00:00Z",
      "wordCount": 234
    }
  ],
  "total": 150
}
```

---

#### **GET** `/admin/speech-intelligence/sessions/:id`
Get detailed session view.

**Response:**
```json
{
  "session": {
    "id": "uuid",
    "transcriptText": "[Present if consent=true]",
    "segments": [...],
    "errors": [...],
    "feedback": [...],
    "analysis": [...]
  }
}
```

---

#### **POST** `/admin/speech-intelligence/sessions/:id/feedback`
Submit feedback on transcription quality.

**Body:**
```json
{
  "feedbackType": "RATING",
  "rating": 4,
  "issueType": "MISSING_WORDS",
  "comments": "Missed proper nouns",
  "correctedText": "Optional corrected version"
}
```

---

#### **GET** `/admin/speech-intelligence/tuning-profiles`
View computed recommendations.

**Response:**
```json
{
  "profiles": [
    {
      "profileType": "LANGUAGE",
      "scope": "en",
      "recommendedEngine": "OPENAI",
      "successRate": 0.95,
      "avgLatency": 2345,
      "sampleCount": 150,
      "confidence": 0.92
    }
  ]
}
```

---

#### **POST** `/admin/speech-intelligence/compute-profiles`
Trigger profile recomputation (manual).

**Response:**
```json
{
  "success": true,
  "profilesComputed": 5
}
```

---

#### **GET** `/admin/speech-intelligence/stats`
Overall system statistics (30-day window).

**Response:**
```json
{
  "stats": {
    "totalSessions": 1234,
    "successRate": 0.92,
    "avgDuration": 42.5,
    "totalErrors": 98,
    "feedbackCount": 45,
    "engineBreakdown": {
      "OPENAI": 980,
      "WHISPER_LOCAL": 254
    }
  }
}
```

---

## 🔗 Integration Points

### **server.ts** (2 changes)
1. **Scheduler Startup** (line ~447):
   ```typescript
   if (process.env.SPEECH_TELEMETRY_ENABLED === 'true') {
     const scheduler = getSpeechIntelligenceScheduler();
     scheduler.start();
     console.log('🎙️ Speech Intelligence scheduler started');
   }
   ```

2. **Route Mounting** (line ~196):
   ```typescript
   app.use('/admin/speech-intelligence', speechIntelligenceAdminRoutes);
   ```

### **health.ts** (1 addition)
**GET** `/health/speech-smoke-test` - Returns last smoke test results from scheduler

---

## ⚙️ Environment Variables

Added to **backend/.env**:

```bash
# Speech Intelligence Configuration
SPEECH_TELEMETRY_ENABLED=true
SPEECH_STORE_TRANSCRIPTS_DEFAULT=false
SPEECH_RETENTION_DAYS=30
SPEECH_REDACTION_ENABLED=true
SPEECH_SMOKE_TEST_INTERVAL_HOURS=24
```

---

## 🧪 Testing Requirements

### ✅ Unit Tests (Created: `backend/tests/speechIntelligence.test.ts`)

1. **Session Creation**
   - ✅ Session created with consent flags
   - ✅ Transcript not stored without consent
   - ✅ Redaction applied when storing

2. **Error Handling**
   - ✅ Error events created on failure
   - ✅ Error messages sanitized

3. **Tuning**
   - ✅ Returns defaults when no profiles exist
   - ⏳ Profile selection works with data

### ⏳ Integration Test (Pending)

**Scenario:**
1. Run transcription via IntelligentTranscriptionService
2. Verify DB records created (session, segments, analysis)
3. Accumulate 30+ sessions
4. Trigger profile computation
5. Verify recommendations updated

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│  User Request   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  IntelligentTranscriptionService    │
│  1. Get tuning recommendation       │
│  2. Create session (w/ consent)     │
│  3. Call TranscriptionService       │
│  4. Store segments/errors           │
│  5. Run analysis                    │
│  6. Update session metrics          │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│        PostgreSQL Database          │
│  ┌─────────────────────────────┐   │
│  │  TranscriptionSession       │   │
│  │  ├─ segments[]              │   │
│  │  ├─ errors[]                │   │
│  │  ├─ feedback[]              │   │
│  │  └─ analysis[]              │   │
│  └─────────────────────────────┘   │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Daily Scheduler (3am)              │
│  └─ RuntimeTuning.computeProfiles() │
│     ├─ Aggregate sessions           │
│     ├─ Score engines                │
│     └─ Update recommendations       │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  ModelTuningProfile (updated)       │
│  ├─ recommendedEngine               │
│  ├─ successRate                     │
│  ├─ avgLatency                      │
│  └─ confidence                      │
└─────────────────────────────────────┘
```

---

## 🚀 Next Steps

### 1. Restart Backend ⚠️
```powershell
Get-Job "BackendServer" | Stop-Job
Get-Job "BackendServer" | Remove-Job -Force
Start-Job -ScriptBlock { 
  Set-Location "C:\Users\richl\Care2system\backend"
  npx ts-node --transpile-only src/server.ts 
} -Name "BackendServer"
```

### 2. Verify Scheduler Started
Check logs for: `🎙️ Speech Intelligence scheduler started`

### 3. Test Smoke Tests
```bash
curl http://localhost:3003/health/speech-smoke-test
```

### 4. Test Admin Endpoints
```bash
# List sessions
curl http://localhost:3003/admin/speech-intelligence/sessions

# Get stats
curl http://localhost:3003/admin/speech-intelligence/stats

# View profiles
curl http://localhost:3003/admin/speech-intelligence/tuning-profiles
```

### 5. Integration Test
Run full transcription flow and verify DB records:
```typescript
const service = new IntelligentTranscriptionService();
const result = await service.transcribe({
  audioBuffer: testAudio,
  language: 'en',
  source: TranscriptionSource.WEB_RECORDING,
  consentToStoreText: true,
  consentToStoreMetrics: true
});

// Verify sessionId returned
// Query DB for session, segments, analysis
```

---

## 📝 Files Created/Modified

### Created (8 files, 1300+ lines total)
- [backend/src/services/speechIntelligence/sessionManager.ts](backend/src/services/speechIntelligence/sessionManager.ts) - 243 lines
- [backend/src/services/speechIntelligence/runtimeTuning.ts](backend/src/services/speechIntelligence/runtimeTuning.ts) - 280 lines
- [backend/src/services/speechIntelligence/intelligentTranscription.ts](backend/src/services/speechIntelligence/intelligentTranscription.ts) - 183 lines
- [backend/src/services/speechIntelligence/smokeTest.ts](backend/src/services/speechIntelligence/smokeTest.ts) - 143 lines
- [backend/src/services/speechIntelligence/retention.ts](backend/src/services/speechIntelligence/retention.ts) - 85 lines
- [backend/src/services/speechIntelligence/scheduler.ts](backend/src/services/speechIntelligence/scheduler.ts) - 140 lines
- [backend/src/services/speechIntelligence/index.ts](backend/src/services/speechIntelligence/index.ts) - 10 lines
- [backend/src/routes/admin/speechIntelligence.ts](backend/src/routes/admin/speechIntelligence.ts) - 225 lines
- [backend/tests/speechIntelligence.test.ts](backend/tests/speechIntelligence.test.ts) - 90 lines

### Modified (4 files)
- [backend/prisma/schema.prisma](backend/prisma/schema.prisma) - Added 6 models, 5 enums
- [backend/src/server.ts](backend/src/server.ts) - Added scheduler startup + route mounting
- [backend/src/routes/health.ts](backend/src/routes/health.ts) - Added smoke test endpoint
- [backend/.env](backend/.env) - Added 5 configuration variables

---

## 🎯 Success Criteria

✅ **Database Schema**
- 6 models created with proper relations
- 5 enums defined
- Migration applied successfully

✅ **Services**
- Session management with consent enforcement
- Runtime tuning with ML-based recommendations
- Intelligent transcription wrapper
- Smoke test automation
- Retention policy enforcement
- Scheduler coordination

✅ **Admin API**
- 7 endpoints for troubleshooting
- Filtering, pagination, stats
- Feedback submission
- Profile viewing/recomputation

✅ **Privacy & Security**
- Consent flag enforcement
- PII redaction (emails, phones)
- Error sanitization (paths, keys)
- Configurable retention

⏳ **Testing** (Pending)
- Unit tests created
- Integration test needed
- End-to-end validation needed

---

## 🔍 Troubleshooting

### Problem: Scheduler not starting
**Check:** `SPEECH_TELEMETRY_ENABLED=true` in .env
**Solution:** Verify environment variable, restart backend

### Problem: Smoke tests failing
**Check:** `/health/speech-smoke-test` endpoint response
**Debug:** Review logs for specific test failures
**Solution:** Ensure Prisma client connected, database accessible

### Problem: Profiles not computing
**Check:** Minimum 30 sessions in database
**Debug:** Call `/admin/speech-intelligence/compute-profiles` manually
**Solution:** Accumulate more sessions, check daily cron execution

### Problem: Transcripts not storing
**Check:** `consentToStoreText=true` on session creation
**Debug:** Query session in database, check consent flag
**Solution:** Ensure consent passed through from frontend

---

## 📚 References

- [GitHub Specification](https://github.com/user/repo/issues/123) (placeholder)
- [Prisma Schema Docs](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [Node-cron Syntax](https://www.npmjs.com/package/node-cron)

---

**Implementation Status:** ✅ COMPLETE (Awaiting Testing)  
**Last Updated:** 2024-01-15  
**Agent:** GitHub Copilot (Claude Sonnet 4.5)
