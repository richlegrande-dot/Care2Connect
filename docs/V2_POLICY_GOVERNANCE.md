# V2 Intake — Policy Pack Governance

> **Version**: 1.0
> **Last Updated**: February 18, 2026
> **Applies To**: V2 Intake Scoring Engine and Policy Pack constants
> **Status**: Active
> **Classification**: Governance — no UI required

---

## Purpose

This document formalizes the governance rules for modifying the V2 Intake Policy
Pack: the set of scoring weights, override rules, tier boundaries, and action plan
templates that determine how intake assessments are scored and how recommendations
are generated.

The V2 Intake scoring engine is deterministic and rule-based. There are no AI
models. All scoring decisions are traceable to constants defined in the Policy Pack.
This governance document ensures that changes to these constants follow a rigorous,
auditable, multi-stakeholder review process.

**Governing Principle**: No single person may unilaterally change scoring logic.

---

## 1. Who Can Modify Weights

### Authorized Roles

| Role | Permission Level | Can Modify Weights | Can Approve Changes |
|------|-----------------|-------------------|-------------------|
| Clinical Director | Full | Yes | Yes |
| Lead Social Worker | Propose | Yes (propose only) | Yes |
| DV Specialist | Domain-limited | Yes (DV weights only, propose) | Yes (DV items only) |
| Engineering Lead | Implementation | No (implements only) | No |
| System Administrator | None | No | No |
| Case Manager | None | No | No |

### Modification Authority Rules

1. **Weight changes** (scoring constants in `scoringConstants.ts`):
   - Must be proposed by Clinical Director OR Lead Social Worker
   - Must be reviewed by at least one other authorized role
   - Must include documented clinical rationale

2. **Override rule changes** (rules in `computeScore.ts`):
   - Must be proposed by Clinical Director
   - Must be reviewed by DV Specialist if override involves DV/trafficking
   - Must pass all regression tests before merge

3. **Tier boundary changes** (thresholds in `scoringConstants.ts`):
   - Must be proposed by Clinical Director
   - Must include impact analysis showing expected distribution shift
   - Must be reviewed by Lead Social Worker AND DV Specialist

4. **Action plan template changes** (templates in `actionPlan.ts`):
   - Must be proposed by any authorized role
   - Must be reviewed by Clinical Director
   - New resources must include verified contact information

---

## 2. Stakeholder Review Quorum

### Definition of Quorum

A quorum is the minimum set of approvals required before a Policy Pack change
can be merged and deployed. Different change types require different quorums.

### Quorum Requirements

| Change Type | Minimum Reviewers | Required Roles | Timeline |
|-------------|------------------|----------------|----------|
| Weight adjustment (single) | 2 | Clinical Director + 1 other | 5 business days |
| Weight adjustment (multiple) | 3 | Clinical Director + Lead SW + 1 other | 10 business days |
| Override add/remove | 3 | Clinical Director + DV Specialist + Lead SW | 10 business days |
| Tier boundary change | 3 | Clinical Director + Lead SW + DV Specialist | 15 business days |
| Action plan resource add | 2 | Any authorized + Clinical Director | 5 business days |
| Action plan resource remove | 2 | Clinical Director + Lead SW | 5 business days |
| Emergency safety fix | 1 | Clinical Director (with post-hoc review) | Immediate |

### Emergency Bypass

In extreme circumstances (e.g., a weight configuration is causing unsafe
recommendations), the Clinical Director may approve an emergency change with
only 1 reviewer. Requirements:

1. Document the emergency rationale
2. Apply the fix
3. Schedule a full quorum review within 5 business days
4. The post-hoc review may revert the change if consensus is not reached

---

## 3. Required Calibration Report Review

### Before Any Weight Change

Before submitting a weight change proposal, the proposer must:

1. **Generate a calibration report** from the current system:
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     "https://production.example.com/api/v2/intake/calibration?since=30d"
   ```

2. **Review the report** for:
   - [ ] Current level distribution — are levels distributed as expected?
   - [ ] Current tier distribution — are tiers distributed as expected?
   - [ ] Per-dimension averages — are any dimensions underweighted or overweighted?
   - [ ] Override frequency — are overrides firing at expected rates?
   - [ ] Top contributors — are the right signals dominating?

3. **Attach the report** to the change proposal with annotations explaining
   which metrics motivate the change.

### After Weight Change (Pre-Deployment)

After the change is implemented but before it is deployed:

1. **Generate a calibration report** from the staging system using test data
2. **Compare with the pre-change report**:
   - [ ] Level distribution shift is within expected bounds
   - [ ] No tier boundary crosses for edge cases that should remain stable
   - [ ] Override frequency changes are explained and expected
   - [ ] Dimension averages move in the intended direction
   - [ ] No unintended contributor rank changes

3. **If unexpected changes occur**: STOP. Return to the review quorum.

---

## 4. Required Regression Test Pass

### Automated Test Gates

No Policy Pack change may be deployed unless ALL of the following pass:

| Gate | Command | Required Result |
|------|---------|-----------------|
| Unit tests | `npx jest tests/intake_v2/ --verbose` | 100% pass |
| Scoring determinism | `npx jest tests/intake_v2/scoring.test.ts` | All pass |
| Fairness audit | `npx jest tests/intake_v2/fairness.test.ts` | All pass |
| Edge cases | `npx jest tests/intake_v2/edgeCases.test.ts` | All pass |
| Explainability | `npx jest tests/intake_v2/explainability.test.ts` | All pass |
| HMIS export | `npx jest tests/intake_v2/hmis.test.ts` | All pass |
| Calibration | `npx jest tests/intake_v2/calibration.test.ts` | All pass |
| Action plan | `npx jest tests/intake_v2/actionPlan.test.ts` | All pass |

### Manual Test Cases

In addition to automated tests, the following manual checks are required:

1. **Maria scenario** (crisis/DV persona):
   - Score: Level 0 CRITICAL with DV override
   - Action plan includes DV hotline
   - HMIS export nullifies PII
   - Explainability redacts DV signals

2. **James scenario** (stable persona):
   - Score: Level 4 or 5 (stable)
   - No override triggers
   - Resources appropriate for stable housing

3. **Robert scenario** (veteran persona):
   - Score: appropriate level based on needs
   - Veteran-specific resources in action plan
   - No false DV triggers

### Regression Test Failure Protocol

If any test fails after a weight change:

1. **Do not deploy** — the change must not go to production
2. **Document the failure** with:
   - Test name and assertion that failed
   - Expected vs. actual values
   - Whether the failure is due to the weight change or a pre-existing issue
3. **Either**:
   - Fix the weight change to pass all tests, OR
   - Update test expectations if the new behavior is clinically correct
     (requires quorum approval for test changes)
4. **Re-run all gates** after any fix

---

## 5. Version Bump Rules

### Policy Pack Versioning

The Policy Pack follows a simplified semantic versioning scheme:

```
POLICY_PACK_VERSION = "MAJOR.MINOR"
```

| Version Component | When to Bump | Examples |
|-------------------|-------------|---------|
| MAJOR | Override added/removed, tier boundaries changed, structural changes | 1.0 → 2.0 |
| MINOR | Weight adjusted, action plan resource changed, text updates | 1.0 → 1.1 |

### Scoring Engine Versioning

The Scoring Engine follows the same scheme:

```
SCORING_ENGINE_VERSION = "MAJOR.MINOR"
```

| Version Component | When to Bump | Examples |
|-------------------|-------------|---------|
| MAJOR | Algorithm changed, new computation logic, override logic change | 1.0 → 2.0 |
| MINOR | Bug fix in existing logic, performance optimization | 1.0 → 1.1 |

### Version Bump Procedure

1. Update `POLICY_PACK_VERSION` in `backend/src/intake/v2/constants.ts`
2. Update `SCORING_ENGINE_VERSION` in `backend/src/intake/v2/constants.ts` (if engine changed)
3. Add a changelog entry (see Section 8)
4. Run all regression tests
5. Git commit with message: `chore(v2): bump policy pack vX.Y → vX.Z — [summary]`
6. Tag the commit: `policy-pack-vX.Z`

### Version Tracking

The version endpoint (`GET /api/v2/intake/version`) reports the current
Policy Pack and Scoring Engine versions. The calibration endpoint records
which versions were active when each session was scored. This enables
retrospective analysis of scoring behavior across versions.

---

## 6. Rollback Protocol

### When to Rollback

A rollback is required when:
- A deployed weight change produces unsafe scoring in production
- A deployed change causes test failures that were missed
- Stakeholder review identifies a clinical error post-deployment
- The Clinical Director orders a rollback for any reason

### Rollback Procedure

1. **Identify the target version**:
   - Check `git log` for the last known-good Policy Pack commit
   - Verify the target version number

2. **Revert the change**:
   ```bash
   git revert <commit-hash>
   ```

3. **Run all regression tests** on the reverted code

4. **Deploy the revert** to production

5. **Verify production** using the staging smoke test:
   ```bash
   npx tsx scripts/v2_staging_smoke.ts $PROD_URL $AUTH_TOKEN
   ```

6. **Notify stakeholders**:
   - Clinical Director
   - Lead Social Worker
   - DV Specialist (if DV-related)
   - Engineering Lead

7. **Document the rollback**:
   - Reason for rollback
   - Commits reverted
   - Impact assessment (how many sessions were scored with the bad weights)
   - Corrective actions planned

### Rollback Timeline

| Severity | Detection to Rollback | Notification |
|----------|----------------------|--------------|
| Safety-critical (unsafe scoring) | < 1 hour | Immediate |
| Accuracy concern (wrong level) | < 4 hours | Same day |
| Minor (cosmetic, text) | < 24 hours | Next business day |

---

## 7. Audit Log Retention Rules

### What is Logged

The V2 Intake system logs the following audit events:

| Event Type | Data Recorded | Retention |
|------------|--------------|-----------|
| Intake session created | Session ID, timestamp, V2 version | 7 years |
| Scoring completed | Session ID, total score, level, tier, overrides, policy pack version | 7 years |
| Override triggered | Session ID, override name, trigger signal | 7 years |
| DV-safe mode activated | Session ID, activation trigger | 7 years |
| HMIS export generated | Session ID, export format, nullification applied | 7 years |
| Calibration report generated | Query params, result count, requester | 3 years |
| Weight change deployed | Old version, new version, proposer, approvers | Permanent |
| Rollback executed | Reason, commits, impact assessment | Permanent |

### Retention Periods

| Category | Retention Period | Justification |
|----------|-----------------|---------------|
| Client scoring data | 7 years | HUD compliance, CoC reporting requirements |
| DV-safe mode events | 7 years | Safety audit trail, VAWA compliance |
| HMIS export records | 7 years | HUD HMIS Data Standards requirement |
| Calibration reports | 3 years | Statistical analysis, no PII |
| Policy Pack changes | Permanent | Governance audit trail, never delete |
| System error logs | 1 year | Operational troubleshooting |
| Access logs | 1 year | Security monitoring |

### Data Retention Policy

1. **No premature deletion**: Data within its retention period must not be deleted
   for any reason other than a legal hold or court order.

2. **Automated purge**: After the retention period expires, data should be purged
   in the next scheduled maintenance window.

3. **Legal holds**: If litigation or investigation is pending, all relevant data
   must be preserved regardless of retention period. Contact legal counsel.

4. **PII handling**: Client PII (names, dates of birth, SSNs if collected) must
   be encrypted at rest and in transit. DV-safe mode data receives additional
   protections (see DV-Safe Testing Protocol).

5. **Backup retention**: Backups follow the same retention rules as primary data.
   Do not retain backups beyond the retention period of the data they contain.

---

## 8. Changelog

All Policy Pack changes must be recorded here in reverse chronological order.

### Format

```
## [vX.Y] — YYYY-MM-DD

### Changed
- Description of what changed

### Rationale
- Clinical justification

### Reviewers
- Name (Role) — APPROVED
- Name (Role) — APPROVED

### Regression
- Tests: X/X passed
- Calibration: reviewed
```

### Current Changelog

```
## [v1.0] — 2026-02-18

### Initial Release
- 30 scoring signals across 8 modules
- 5 override rules (DV, trafficking, chronic health crisis, veteran, youth aging out)
- 6 urgency levels (0=CRITICAL through 5=SELF-RESOLVE)
- 4 tiers (EMERGENCY, RAPID, TRANSITIONAL, PREVENTION)
- Action plan generation with per-tier resource matching
- DV-safe mode with PII redaction and HMIS nullification
- Fairness audit endpoint
- HMIS CSV/JSON export
- Calibration reporting framework

### Rationale
- Initial policy pack based on HUD standards, CoC best practices,
  and clinical input from shelter operations team

### Reviewers
- Pending clinical review

### Regression
- 167+ tests passing across 8+ suites
- Fairness audit: all demographic groups within ±1 level tolerance
- Edge cases: 0-input, max-input, DV override, chronic health override verified
```

---

## Appendix A: Policy Pack File Inventory

| File | Purpose | Change Frequency |
|------|---------|-----------------|
| `constants.ts` | Version strings, feature flags | Every release |
| `scoringConstants.ts` | Weights, tier boundaries, level thresholds | Rare (governance-gated) |
| `computeScore.ts` | Scoring algorithm, override logic | Very rare |
| `buildExplanation.ts` | Explainability card text, redaction rules | Moderate |
| `actionPlan.ts` | Resource templates, tier-to-resource mapping | Moderate |
| `hmisExport.ts` | HMIS field mapping, nullification rules | Rare |
| `fairnessAudit.ts` | Demographic parity checks | Rare |
| `calibrationTypes.ts` | Calibration report types | Rare |
| `generateCalibrationReport.ts` | Report computation | Rare |

## Appendix B: Governance Decision Matrix

For quick reference, use this matrix to determine the approval path:

```
┌─────────────────────────┬────────────────────────┬──────────────┐
│ What Changed?           │ Who Must Approve?      │ Timeline     │
├─────────────────────────┼────────────────────────┼──────────────┤
│ Single weight           │ CD + 1                 │ 5 days       │
│ Multiple weights        │ CD + LSW + 1           │ 10 days      │
│ Override add/remove     │ CD + DV + LSW          │ 10 days      │
│ Tier boundary           │ CD + LSW + DV          │ 15 days      │
│ Action plan resource    │ Any + CD               │ 5 days       │
│ Emergency safety fix    │ CD only (+ post-hoc)   │ Immediate    │
└─────────────────────────┴────────────────────────┴──────────────┘

Legend:
  CD  = Clinical Director
  LSW = Lead Social Worker
  DV  = DV Specialist
```

## Appendix C: Related Documents

| Document | Location | Purpose |
|----------|----------|---------|
| V2 Intake Spec | `docs/V2_INTAKE_SPEC.md` | Full system specification |
| Scoring Calibration Protocol | `docs/V2_SCORING_CALIBRATION_PROTOCOL.md` | Clinical review process |
| DV-Safe Testing Protocol | `docs/V2_DV_SAFE_TESTING_PROTOCOL.md` | DV safety testing |
| Staging Checklist | `docs/V2_STAGING_CHECKLIST.md` | Deployment verification |
| Navigator Status Report | `docs/V2_NAVIGATOR_STATUS_2026-02-18.md` | Phase 2 completion status |
| Issue Tracker | `docs/V2_INTAKE_ISSUES.md` | Deferred items and bugs |

---

*End of V2 Policy Pack Governance Document*
