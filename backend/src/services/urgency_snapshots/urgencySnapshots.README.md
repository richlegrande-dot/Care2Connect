# Urgency Assessment Service Snapshots

**Purpose:** Prevent dependency drift and provide known-good rollback versions

## Version History

### v_current.js
- **Date:** January 30, 2026 (pre-fix)
- **Status:** Contains aggressive boosts and lowered thresholds
- **Issues:** Causes 12 urgency failures on Core30, PII logging
- **Pass Rate:** 56.67% Core30 (regression from 96.67%)

### v_safe.js
- **Date:** January 30, 2026 (post-fix)
- **Status:** Stable thresholds, bounded boosts, no PII logging
- **Target:** Restore Core30 to ≥95% pass rate
- **Thresholds:** CRITICAL≥0.80, HIGH≥0.60, MEDIUM≥0.30, LOW<0.30
- **Boosts:** Capped at +0.15 total, no hard overrides

## Usage

### Verify Current Service Hasn't Drifted
```powershell
.\scripts\verify-urgency-checksum.ps1
```

### Restore Known-Good Version
```powershell
.\scripts\restore-urgency-safe.ps1
```

## Checksum Protection

`urgency.checksum.txt` contains SHA256 hash of v_safe.js. Verification script checks active UrgencyAssessmentService.js against this hash to detect unauthorized changes.

## Integration Rules

1. **No Console Logging of Transcripts** - PII risk
2. **Deterministic Scoring** - Same input = same output
3. **Bounded Boosts** - Category/temporal boosts capped at +0.15 total
4. **Stable Thresholds** - Must not be lowered without gate validation
5. **Core30 Regression Guard** - Any change must maintain ≥95% Core30 pass rate

## Change Policy

To modify UrgencyAssessmentService.js:
1. Run `npm run eval:v4plus:core` to establish baseline
2. Make changes
3. Run `npm run eval:v4plus:core` to verify no regression
4. If Core30 pass rate drops <95%, revert immediately
5. Update checksum: `Get-FileHash -Algorithm SHA256 backend\src\services\UrgencyAssessmentService.js`
6. Create new snapshot version with date suffix

## Restoration Procedure

If urgency service shows unexpected behavior:
1. Check current checksum: `.\scripts\verify-urgency-checksum.ps1`
2. If mismatch, review changes: `git diff backend/src/services/UrgencyAssessmentService.js` (if in repo)
3. Restore safe version: `.\scripts\restore-urgency-safe.ps1`
4. Re-run evaluation: `npm run eval:v4plus:core`
5. Verify Core30 ≥95% restored
