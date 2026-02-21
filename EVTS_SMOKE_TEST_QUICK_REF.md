# EVTS-First Smoke Test - Quick Reference

## Quick Start

### 1. Environment Setup
```bash
# Required for development (choose one)
OPENAI_API_KEY=sk-...                    # OpenAI Whisper API

# Required for production (both)
EVTS_MODEL_PATH=/path/to/evts/model
EVTS_BINARY_PATH=/path/to/evts/binary
OPENAI_API_KEY=sk-...                    # Fallback

# Configuration (all settings critical for production behavior)
SPEECH_SMOKE_PREFER_EVTS=true            # Default: true
SPEECH_SMOKE_FALLBACK_OPENAI=true        # Default: true
SPEECH_SMOKE_INTERVAL_HOURS=6            # Default: 6
```

### 2. Check Status
```bash
# PowerShell
curl http://localhost:3003/health/speech-smoke-test | ConvertFrom-Json

# Or use verification script
.\scripts\verify-db.ps1
```

### 3. Manual Trigger
```bash
# PowerShell
$headers = @{ "Authorization" = "Bearer $env:ADMIN_DIAGNOSTICS_TOKEN" }
Invoke-RestMethod -Uri "http://localhost:3003/admin/speech/smoke-test" -Method POST -Headers $headers
```

## Engine Selection Logic

```
PREFER_EVTS=true + EVTS available → Try EVTS
  └─ EVTS fails + FALLBACK_OPENAI=true → Use OpenAI
     └─ OpenAI fails → Test fails

PREFER_EVTS=false + OpenAI key set → Use OpenAI
  └─ OpenAI fails → Test fails

No engines available → Test skipped (success)
```

## Validation Rules

Transcription is **VALID** if:
- Contains "hello" (case-insensitive) **OR**
- wordCount > 0 AND confidence > 0

## Database Storage

Every smoke test creates:
- **TranscriptionSession** (source=SYSTEM_SMOKE_TEST)
  - consentToStoreText = false (never stores transcript)
  - consentToStoreMetrics = true (always stores metrics)
- **TranscriptionAnalysisResult** (analyzer=smoke-test-v1)
  - Contains engine tracking and validation results

## Health Endpoint Response

```json
{
  "success": true,                      // Overall success
  "timestamp": "2024-01-15T10:30:00Z",  // Last run time
  "engineUsed": "OPENAI",               // Engine that succeeded
  "engineAttempted": ["EVTS_VOSK", "OPENAI"],  // All engines tried
  "fallbackUsed": true,                 // Whether fallback triggered
  "latencyMs": 850,                     // Transcription latency
  "tests": [                            // Individual test results
    {
      "name": "real_transcription_en",
      "passed": true,
      "message": "Transcription PASSED with OPENAI"
    }
  ]
}
```

## Common Commands

```bash
# Check smoke test status
curl http://localhost:3003/health/speech-smoke-test

# Run verification script
.\scripts\verify-db.ps1

# Check backend logs for smoke tests
pm2 logs backend | grep SpeechIntel

# Query smoke test sessions
psql $DATABASE_URL -c "SELECT * FROM \"TranscriptionSession\" WHERE source = 'SYSTEM_SMOKE_TEST' ORDER BY \"createdAt\" DESC LIMIT 5;"

# Check audio fixture
Test-Path backend\fixtures\smoke-test-audio.wav
```

## Troubleshooting

### Smoke test never runs
- Check: `SPEECH_SMOKE_INTERVAL_HOURS` (default: 6)
- Wait: Initial run after 30 seconds
- Check logs: `pm2 logs backend | grep "Running smoke tests"`

### EVTS always unavailable
- Check: `$env:EVTS_MODEL_PATH` exists
- Check: `$env:EVTS_BINARY_PATH` is executable
- Test: Run EVTS command manually
- Expected: `fallbackUsed: true` in response

### OpenAI fallback fails
- Check: `$env:OPENAI_API_KEY` is set
- Check: API key has credits
- Check logs: Look for OpenAI error messages

### Validation always fails
- Check: Audio fixture exists (>1KB)
- Check: Transcript content in logs
- Consider: Relax validation rules if needed

## Production Checklist

- [ ] Configure EVTS (model + binary paths)
- [ ] Configure OpenAI API key
- [ ] Set `SPEECH_SMOKE_INTERVAL_HOURS=6`
- [ ] Replace fixture with real "hello world" recording
- [ ] Monitor `/health/speech-smoke-test` endpoint
- [ ] Set up alerts for consecutive failures
- [ ] Track fallback rate (should be < 20%)

## Monitoring Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Success Rate | > 95% | < 90% for 24h |
| EVTS Usage | > 80% | < 50% for 24h |
| Latency | < 2s | > 5s |
| Fallback Rate | < 20% | > 50% for 24h |

## Files Reference

| File | Purpose |
|------|---------|
| `backend/src/services/speechIntelligence/smokeTest.ts` | Main implementation |
| `backend/src/services/speechIntelligence/scheduler.ts` | Scheduling logic |
| `backend/src/routes/health.ts` | Health endpoint |
| `backend/fixtures/smoke-test-audio.wav` | Test audio (2s, 62KB) |
| `scripts/verify-db.ps1` | Verification script |
| `docs/SPEECH_SMOKE_TEST.md` | Full documentation |

## Default Values

```typescript
SPEECH_SMOKE_PREFER_EVTS = true        // Prefer local EVTS
SPEECH_SMOKE_FALLBACK_OPENAI = true    // Allow OpenAI fallback
SPEECH_SMOKE_INTERVAL_HOURS = 6        // Test every 6 hours
```

## Cost Impact

| Configuration | Daily Cost | Monthly Cost |
|---------------|------------|--------------|
| EVTS only | $0.00 | $0.00 |
| OpenAI only | $0.024 | $0.72 |
| EVTS + Fallback | ~$0.005 | ~$0.15 |

(Based on 4 tests/day at 6-hour intervals, assuming 80% EVTS success rate)

---

**Quick Links**:
- [Full Documentation](./docs/SPEECH_SMOKE_TEST.md)
- [Implementation Report](./EVTS_SMOKE_TEST_IMPLEMENTATION.md)
- [Speech Intelligence Overview](./SPEECH_INTELLIGENCE_IMPLEMENTATION.md)
