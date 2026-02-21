# V2 Intake — Scoring Calibration Protocol

> **Version**: 1.0
> **Last Updated**: February 18, 2026
> **Applies To**: V2 Intake Scoring Engine (Policy Pack v1.0.0+)
> **Status**: Active — must be followed for any scoring weight changes

---

## Purpose

This document defines the formal process for reviewing and modifying scoring weights
in the V2 Intake system. No scoring constants may be changed without completing this
protocol. This ensures clinical validity, governance accountability, and system
integrity.

---

## 1. Review Agenda Structure

Each clinical calibration session must follow this agenda:

### Pre-Session (1 week before)
1. Generate calibration report from current production/staging data
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     "https://staging.example.com/api/v2/intake/calibration" > report.json
   ```
2. Distribute report to all stakeholders
3. Distribute current scoring weight table (extracted from `computeScores.ts`)
4. Distribute edge-case scenarios for review

### Session Agenda (90 minutes recommended)

| Time | Topic | Lead |
|------|-------|------|
| 0:00–0:10 | Welcome, review ground rules | Facilitator |
| 0:10–0:25 | Calibration report walkthrough | Data Analyst |
| 0:25–0:45 | Dimension-by-dimension weight review | Clinical Lead |
| 0:45–1:00 | Override rule review | Clinical Lead |
| 1:00–1:15 | Edge-case scenario walkthrough | QA Engineer |
| 1:15–1:25 | Proposed changes summary | Facilitator |
| 1:25–1:30 | Sign-off vote | All |

### Post-Session (within 48 hours)
1. Document all approved changes
2. Create change request with specific constant updates
3. Implement changes in code
4. Run regression tests
5. Generate comparison calibration report
6. Bump POLICY_PACK_VERSION
7. Deploy to staging for verification

---

## 2. Weight Validation Checklist

Before approving any weight change, the review team must verify:

| # | Check | Verified |
|---|-------|----------|
| 1 | The signal being weighted is clinically meaningful for this CoC | ☐ |
| 2 | The point value reflects relative severity within its dimension | ☐ |
| 3 | The combined dimension scores produce expected Level placements for known personas | ☐ |
| 4 | No single signal can unintentionally dominate a dimension | ☐ |
| 5 | Dimension totals remain capped at 25 | ☐ |
| 6 | Total score remains capped at 100 | ☐ |
| 7 | The change does not create demographic bias (check calibration report) | ☐ |
| 8 | Edge cases (DV survivors, veterans, chronic, youth) still place correctly | ☐ |
| 9 | The change has been tested against at least 5 sample personas | ☐ |
| 10 | The fairness analysis shows no new bias (>10pt deviation) after the change | ☐ |

---

## 3. Override Rule Review Table

Current override floor rules must be reviewed at each calibration session:

| Override | Current Floor | Clinical Basis | Status |
|----------|--------------|----------------|--------|
| `fleeing_dv` | Level 0 | Federal mandate: DV survivors receive highest CE priority | ☐ Confirmed |
| `fleeing_trafficking` | Level 0 | Federal mandate: trafficking survivors receive highest CE priority | ☐ Confirmed |
| `veteran_unsheltered` | Level 1 | VA Partnership: unsheltered veterans receive emergency shelter minimum | ☐ Confirmed |
| `currently_chronic` | Level 1 | HUD definition: 12+ months or 4+ episodes = chronic; requires PSH track | ☐ Confirmed |
| `unaccompanied_minor` | Level 0 | Child welfare mandate: minors alone receive crisis intervention | ☐ Confirmed |

### Adding or Removing Overrides

To add a new override:
1. Clinical justification must be documented
2. Federal/state/local regulation reference (if applicable)
3. Impact analysis: how many existing sessions would change level?
4. Regression test added to cover the new override
5. Sign-off from at least 2 clinical stakeholders

To remove an override:
1. Justification for removal
2. Impact analysis on affected population
3. Alternative scoring mechanism (if any)
4. Legal review for federally mandated overrides (cannot be removed)
5. Sign-off from all review quorum members

---

## 4. Edge-Case Scenario Review Format

Each calibration session must review at least 5 edge-case scenarios:

### Scenario Template

```
Scenario: [Name]
────────────────────────────────────
Persona:        [Brief description]
Key Signals:    [List of active signals]
────────────────────────────────────
Expected Level: [0–5]
Expected Tier:  [CRITICAL/HIGH/MODERATE/LOWER]
Expected Override: [None / override name]
────────────────────────────────────
Actual Level:   [From scoring engine]
Actual Tier:    [From scoring engine]
Actual Override: [From scoring engine]
────────────────────────────────────
Match: ✅ / ❌
If ❌, proposed adjustment:
  Signal:       [which signal]
  Current:      [current points]
  Proposed:     [new points]
  Justification: [why]
```

### Required Edge Cases (minimum)

1. **DV survivor with children, unsheltered** — Must place Level 0, CRITICAL
2. **Veteran, housed, stable income** — Should place Level 4–5, LOWER
3. **Youth aging out, couch surfing, no ID** — Evaluate Level 2–3
4. **Chronic homeless, substance use, ER frequent flyer** — Must respect chronic override
5. **Moderate risk, employed, some health needs** — Should place Level 3–4

Additional scenarios should be drawn from real intake data patterns observed in the
calibration report.

---

## 5. Required Sign-Off Format

All weight changes require sign-off using this format:

```
╔══════════════════════════════════════════════════════════╗
║           SCORING WEIGHT CHANGE APPROVAL                ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Policy Pack Version: v1.0.0 → v1.1.0                  ║
║  Date: [Date]                                           ║
║  Session ID: [Calibration session identifier]           ║
║                                                          ║
║  Changes Summary:                                       ║
║    [List each change: signal, old value, new value]     ║
║                                                          ║
║  Impact Analysis:                                       ║
║    [X] sessions would change level/tier                 ║
║    [Y] sessions change by ≤ 1 level                     ║
║    [Z] sessions change by > 1 level                     ║
║                                                          ║
║  Fairness Check: PASS / FAIL                            ║
║  Regression Tests: PASS / FAIL                          ║
║                                                          ║
║  Approvals (minimum 2 required):                        ║
║                                                          ║
║  Clinical Lead: _____________ Date: ________            ║
║  CE Coordinator: ____________ Date: ________            ║
║  Program Director: __________ Date: ________            ║
║  QA Engineer: _______________ Date: ________            ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

---

## 6. Version Bump Protocol After Approval

After sign-off, the version bump must follow this exact sequence:

### Step 1: Update Constants
```typescript
// backend/src/intake/v2/constants.ts
export const POLICY_PACK_VERSION = 'v1.1.0'; // was v1.0.0
```

### Step 2: Update Policy Pack
```typescript
// backend/src/intake/v2/policy/policyPack.ts
// Update the specific point values that were approved
```

### Step 3: Update Tests
```bash
# Run existing tests — SOME MAY FAIL due to weight changes
cd backend
npx jest tests/intake_v2/ --verbose

# Update test expectations to match new weights
# Add new test cases for edge scenarios reviewed in session
```

### Step 4: Generate Comparison Report
```bash
# Before deployment, compare old vs new calibration
# Run against staging data with both pack versions
```

### Step 5: Commit with Governance Reference
```bash
git commit -m "policy(v2-intake): Bump POLICY_PACK to v1.1.0

Changes approved in calibration session [SESSION_ID] on [DATE].
Sign-off: [Clinical Lead], [CE Coordinator].

Weight changes:
  - [signal]: [old] → [new] (justification)

Impact: [X] sessions affected, [Y] ≤ 1 level change.
Fairness check: PASS.
Regression tests: [N] passing."
```

### Step 6: Deploy to Staging
- Verify with smoke test script
- Generate calibration report on staging
- Compare with pre-change report

### Step 7: Production Deploy
- Only after staging verification passes
- Monitor fairness endpoint for 48 hours post-deploy
- Generate calibration report after 1 week

---

## 7. Regression Test Procedure After Weight Changes

### Automated Tests

```bash
# Run full V2 test suite
cd backend
npx jest tests/intake_v2/ --verbose

# Run scoring-specific tests
npx jest tests/intake_v2/scoring.test.ts --verbose

# Run policy pack tests
npx jest tests/intake_v2/policyPack.test.ts --verbose
```

### Manual Verification

1. Run the 4-persona test harness:
   ```bash
   npx tsx scripts/run_v2_intake_local.ts
   ```
   Verify each persona places at the expected level.

2. Run the staging smoke test:
   ```bash
   npx tsx scripts/v2_staging_smoke.ts https://staging.example.com $TOKEN
   ```

3. Generate calibration report and compare with baseline:
   ```bash
   # Save baseline before changes
   curl ... /calibration > baseline.json

   # After changes
   curl ... /calibration > updated.json

   # Compare
   diff baseline.json updated.json
   ```

### Fairness Verification

After any weight change, run the fairness analysis:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://staging.example.com/api/v2/intake/audit/fairness" | jq .
```

Verify:
- No demographic group shows mean score deviation > 10 points
- Tier distribution does not disproportionately affect any group
- If bias is detected, the weight change must be reviewed before production deploy

---

## Appendix A: Current Signal-to-Point Mapping

See `backend/src/intake/v2/policy/policyPack.ts` for the authoritative values.
A human-readable summary should be exported before each calibration session.

## Appendix B: Calibration Report Fields

The calibration endpoint (`GET /api/v2/intake/calibration`) returns:
- `totalSessions` — Number of completed intakes analyzed
- `levelDistribution` — Count per Stability Level (0–5)
- `tierDistribution` — Count per Priority Tier
- `meanTotalScore` / `medianTotalScore` — Central tendency
- `dimensionAverages` — Per-dimension mean, median, min, max, stdDev
- `overrideFrequency` — How often each override fires
- `topContributorsByFrequency` — Most common scoring signal contributors
- `tierVsLevelMatrix` — Cross-tabulation of tier vs level

---

*End of V2 Scoring Calibration Protocol*
