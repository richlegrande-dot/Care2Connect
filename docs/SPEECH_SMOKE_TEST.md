# Speech Intelligence Smoke Test System

## Overview

The Speech Intelligence Smoke Test system performs automated health checks of the transcription pipeline, ensuring both EVTS (local) and OpenAI Whisper engines are functioning correctly.

## EVTS-First Strategy

The smoke test follows a **cost-optimized, reliability-focused strategy**:

1. **Prefer EVTS** (local/cheaper) when available
2. **Automatic fallback** to OpenAI Whisper if EVTS fails
3. **Database logging** of all attempts and results
4. **Validation rules** ensure transcription quality

## Configuration

### Environment Variables

```bash
# Speech Intelligence - Transcription Engines
EVTS_MODEL_PATH=/path/to/evts/model          # Path to EVTS model file
EVTS_BINARY_PATH=/path/to/evts/binary        # Path to EVTS executable

# Smoke Test Behavior
SPEECH_SMOKE_PREFER_EVTS=true                # Prefer EVTS over OpenAI (default: true)
SPEECH_SMOKE_FALLBACK_OPENAI=true            # Allow OpenAI fallback (default: true)
SPEECH_SMOKE_INTERVAL_HOURS=6                # Interval between smoke tests (default: 6)
```

### Execution Schedule

- **Initial run**: 30 seconds after server startup
- **Recurring interval**: Every 6 hours (configurable via `SPEECH_SMOKE_INTERVAL_HOURS`)
- **Mutex protection**: Prevents overlapping runs if a test takes longer than the interval

## Test Suite

The smoke test runs the following checks:

### 1. Database Operations
- Create TranscriptionSession
- Record metrics
- Record errors
- Add analysis results

### 2. Real Transcription Tests
- **English**: Transcribes `backend/fixtures/smoke-test-audio.wav`
- **Spanish**: Same audio file (language detection test)

For each test:
1. Check for audio fixture (skip if missing)
2. Verify file size > 1KB (skip if too small)
3. Attempt transcription with selected engine(s)
4. Validate results
5. Store in database

## Engine Selection Logic

```
┌─────────────────────────────────┐
│ Start Smoke Test                │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ SPEECH_SMOKE_PREFER_EVTS=true?  │
└────────┬──────────┬─────────────┘
         │ YES      │ NO
         ▼          ▼
    ┌────────┐  ┌──────────┐
    │ EVTS   │  │ OpenAI   │
    │ avail? │  │ API key? │
    └───┬────┘  └────┬─────┘
        │ YES        │ YES
        ▼            ▼
    ┌────────┐  ┌──────────┐
    │Try EVTS│  │Try OpenAI│
    └───┬────┘  └────┬─────┘
        │            │
        ▼            │
    ┌────────┐      │
    │Success?│      │
    └───┬────┘      │
        │ NO        │
        ▼           │
    ┌──────────────────┐
    │ FALLBACK_OPENAI? │
    └────┬──────────┬──┘
         │ YES      │ NO
         ▼          ▼
    ┌──────────┐ ┌──────┐
    │Try OpenAI│ │ FAIL │
    └────┬─────┘ └──────┘
         │
         ▼
    ┌─────────┐
    │ Success │
    └─────────┘
```

## Validation Rules

Transcription results are considered **VALID** if either:
- Transcript contains "hello" (case-insensitive, fuzzy match)
- Word count > 0 AND confidence > 0

## Database Storage

Each smoke test creates a `TranscriptionSession` with:

```typescript
{
  source: SYSTEM_SMOKE_TEST,
  engine: EVTS_VOSK | OPENAI,
  engineVersion: "smoke-test-v1",
  consentToStoreText: false,      // Never store transcript text
  consentToStoreMetrics: true,     // Always store metrics
  status: SUCCESS | FAILED,
  durationMs: <latency>,
  detectedLanguage: "en" | "es",
  wordCount: <count>,
  confidenceScore: <score>
}
```

### Analysis Result

```typescript
{
  analyzerVersion: "smoke-test-v1",
  resultJson: {
    engineAttempted: ["EVTS_VOSK", "OPENAI"],
    engineUsed: "OPENAI",
    fallbackUsed: true,
    transcript: "<first 50 chars>",
    validated: true
  },
  qualityScore: <confidence>,
  warnings: ["EVTS unavailable, used OpenAI fallback"]
}
```

## Health Endpoints

### GET /health/speech-smoke-test

Returns the latest smoke test results:

```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "duration": 1234,
  "tests": [
    {
      "name": "db_create_session",
      "passed": true
    },
    {
      "name": "real_transcription_en",
      "passed": true,
      "message": "Transcription PASSED with OPENAI",
      "engineAttempted": ["EVTS_VOSK", "OPENAI"],
      "engineUsed": "OPENAI",
      "fallbackUsed": true,
      "latencyMs": 850,
      "detectedLanguage": "en",
      "wordCount": 2
    }
  ],
  "sessionId": "abc-123",
  "engineUsed": "OPENAI",
  "fallbackUsed": true
}
```

### POST /admin/speech/smoke-test

Manually trigger a smoke test (admin only):

```bash
curl -X POST http://localhost:3003/admin/speech/smoke-test
```

## Audio Fixtures

### Location
`backend/fixtures/smoke-test-audio.wav`

### Format Requirements
- Format: WAV (PCM)
- Duration: 1-3 seconds
- Content: "hello world" spoken clearly
- Sample rate: 16kHz recommended
- Channels: Mono (1 channel)
- File size: > 1KB

### Creating Custom Fixtures

To replace the default fixture with a real recording:

```bash
# Record with ffmpeg (if available)
ffmpeg -f avfoundation -i ":0" -t 2 -ar 16000 -ac 1 backend/fixtures/smoke-test-audio.wav

# Or use the generator script
cd backend/fixtures
node create-smoke-audio.js
```

**Note**: The default fixture is silence/noise. For production, replace with an actual "hello world" recording.

## Monitoring & Alerts

### Success Indicators
- ✅ All database operations pass
- ✅ Real transcription returns valid results
- ✅ Transcription latency < 5 seconds
- ✅ Confidence score > 0.7

### Warning Conditions
- ⚠️ EVTS unavailable (fallback to OpenAI)
- ⚠️ Latency > 5 seconds
- ⚠️ Confidence score < 0.7

### Failure Conditions
- ❌ Database operations fail
- ❌ No transcription engine available
- ❌ Both EVTS and OpenAI fail
- ❌ Validation rules not met

## Verification Script

Check smoke test status with the verification script:

```bash
# Run database verification (includes smoke test checks)
.\scripts\verify-db.ps1

# Expected output includes:
# ✓ Last smoke test: 2024-01-15T10:30:00.000Z
# ✓ Engine used: OPENAI
# ✓ Fallback used: true
# ✓ Session ID: abc-123
```

## Troubleshooting

### EVTS Not Available

If EVTS is consistently unavailable:

1. **Check model path**: Verify `EVTS_MODEL_PATH` points to a valid file
2. **Check binary**: Verify `EVTS_BINARY_PATH` is executable
3. **Check permissions**: Ensure the process has read access
4. **Review logs**: Check for EVTS-specific errors

```bash
# Test EVTS manually
$env:EVTS_MODEL_PATH
Test-Path $env:EVTS_MODEL_PATH
```

### OpenAI Fallback Always Used

If OpenAI is always used despite EVTS being configured:

1. **Check preference flag**: Verify `SPEECH_SMOKE_PREFER_EVTS=true`
2. **Check EVTS errors**: Review console logs for EVTS failure messages
3. **Test EVTS directly**: Run EVTS command manually with the fixture file

### Smoke Test Never Runs

If smoke tests don't execute:

1. **Check interval**: Verify `SPEECH_SMOKE_INTERVAL_HOURS` is reasonable (default: 6)
2. **Check scheduler**: Verify `SpeechIntelligenceScheduler.start()` was called
3. **Check logs**: Look for "[SpeechIntel] Running smoke tests..." messages
4. **Manual trigger**: Use `POST /admin/speech/smoke-test` endpoint

### Validation Always Fails

If transcription validation fails:

1. **Check audio fixture**: Verify `smoke-test-audio.wav` exists and is > 1KB
2. **Check transcript content**: Review what text is being returned
3. **Check language detection**: Ensure language matches expected
4. **Relax validation**: Modify validation rules if needed for your use case

## Best Practices

### Development
- Use OpenAI only (EVTS setup not required)
- Set `SPEECH_SMOKE_INTERVAL_HOURS=24` for less frequent tests
- Monitor console logs for smoke test results

### Staging
- Configure both EVTS and OpenAI
- Set `SPEECH_SMOKE_INTERVAL_HOURS=6` for regular checks
- Monitor `/health/speech-smoke-test` endpoint

### Production
- **Always configure both engines** for redundancy
- Set `SPEECH_SMOKE_PREFER_EVTS=true` to prefer cheaper option
- Set `SPEECH_SMOKE_FALLBACK_OPENAI=true` for reliability
- Set `SPEECH_SMOKE_INTERVAL_HOURS=6` for 4x daily checks
- Alert on consecutive failures (3+ in a row)
- Monitor fallback rate (high rate indicates EVTS issues)

## Integration Examples

### Prometheus Metrics

```typescript
// Export smoke test metrics for Prometheus
app.get('/metrics', (req, res) => {
  const lastTest = scheduler.getLastSmokeTestResult();
  
  res.send(`
# HELP speech_smoke_test_success Last smoke test success (1=pass, 0=fail)
speech_smoke_test_success ${lastTest?.success ? 1 : 0}

# HELP speech_smoke_test_latency_ms Last smoke test latency in milliseconds
speech_smoke_test_latency_ms ${lastTest?.latencyMs || 0}

# HELP speech_smoke_test_fallback_used Whether OpenAI fallback was used (1=yes, 0=no)
speech_smoke_test_fallback_used ${lastTest?.fallbackUsed ? 1 : 0}
  `);
});
```

### Alerting Rules

```yaml
# Alert if smoke test fails
- alert: SpeechSmokeTestFailing
  expr: speech_smoke_test_success == 0
  for: 18h  # 3 consecutive failures at 6h intervals
  annotations:
    summary: "Speech transcription smoke test is failing"

# Alert if always using fallback
- alert: SpeechEVTSUnavailable
  expr: speech_smoke_test_fallback_used == 1
  for: 24h
  annotations:
    summary: "EVTS consistently unavailable, always falling back to OpenAI"
```

## API Reference

### SmokeTestRunner Methods

```typescript
// Run full test suite
async runTests(): Promise<SmokeTestResult>

// Individual test methods (private)
private async testCreateSession()
private async testRecordMetrics()
private async testRecordError()
private async testAddAnalysis()
private async testRealTranscription(language: 'en' | 'es')

// Engine methods (private)
private async checkEVTSAvailable(): Promise<boolean>
private async transcribeWithEVTS(audioPath: string, languageHint: string)
private async transcribeWithOpenAI(audioPath: string)
```

### SpeechIntelligenceScheduler Methods

```typescript
// Start scheduled tasks
start(): void

// Stop all tasks
stop(): void

// Manually trigger smoke test
async runSmokeTestsNow(): Promise<SmokeTestResult>

// Get last test result
getLastSmokeTestResult(): SmokeTestResult | null
```

## Change Log

### v1.0 (2024-01-15)
- Initial implementation with EVTS-first strategy
- OpenAI fallback support
- Mutex protection against overlapping runs
- Database logging of all results
- Comprehensive validation rules
- Health endpoint integration
- 6-hour default interval (reduced from 24h)

---

**Last Updated**: 2024-01-15  
**Maintained By**: Care2System Engineering Team
