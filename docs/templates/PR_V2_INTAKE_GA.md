## V2 Intake Scaffold — GA Merge

### Summary

Merges the **V2 Intake system** (`v2-intake-scaffold` branch) into the target branch,
delivering the complete deterministic scoring engine, policy-driven placement system,
and all supporting infrastructure for General Availability.

### What's Included

| Category | Components |
|----------|-----------|
| **Scoring Engine** | 4-dimension scoring (housing, safety, vulnerability, chronicity), 0–100 scale |
| **Policy Pack** | `DEFAULT_POLICY_PACK` v1.0.0, waterfall rules, override floors |
| **Forms System** | 8 intake modules: consent → demographics → housing → safety → health → history → income → goals |
| **DV-Safe Module** | Panic button, storage clearing, log sanitization, signal redaction |
| **Calibration** | Clinical calibration report generator with statistics |
| **Fairness Monitor** | Group-level disparity detection (race, gender, disability) |
| **HMIS Export** | HUD-compliant CSV generation |
| **Explainability** | Human-readable scoring explanations for counselors |
| **Action Plans** | Auto-generated client action plans |
| **Audit Trail** | Deterministic input hashing, policy version tracking |

### Test Summary

- **195 unit tests** across 9 test files (--bail mode, ZERO_OPENAI_MODE=true)
- **Test areas**: scoring, validation, policyPack, calibration, fairnessMonitor, hmisExport, explainability, actionPlan, expandedTasks
- **Zero external dependencies** — no OpenAI, no network calls during testing
- **Deterministic** — same inputs always produce same scores and placements

### Pre-merge Checklist

- [ ] `V2 Intake Gate` CI check passes (195/195 tests)
- [ ] `Backend Tests` CI check passes
- [ ] `TypeScript Type Check` passes (--noEmit)
- [ ] `Lint and Format Check` passes
- [ ] Clinical calibration review document signed off
- [ ] DV-safe panic button verified in browser (Chromium + Firefox)
- [ ] Branch protection rules active on target branch
- [ ] No large files (>50MB) in commit history

### Architecture Notes

- **Source path**: `backend/src/intake/v2/`
- **Test path**: `backend/tests/intake_v2/`
- **No V1 breaking changes** — V1 parser and endpoints unchanged
- **Feature-flagged** — V2 endpoints under `/api/intake/v2/` prefix
- **Node 24 LTS** compatible

### Policy Pack Version

```
POLICY_PACK_VERSION = 'v1.0.0'
SCORING_ENGINE_VERSION = 'v1.0.0'
```

### Reviewer Notes

- Scoring constants live in `backend/src/intake/v2/policy/policyPack.ts`
- All dimension scores capped at 25 (maxDimensionScore)
- Tier thresholds: CRITICAL ≥70, HIGH ≥45, MODERATE ≥20, LOWER ≥0
- Override rules can only elevate (lower level number = higher priority)
