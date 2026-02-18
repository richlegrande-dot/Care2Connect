# V2 Intake — Calibration Session Scheduling Brief

> **Version**: 1.0
> **Date**: February 18, 2026
> **Status**: Ready to schedule
> **Reference**: [V2_SCORING_CALIBRATION_PROTOCOL.md](V2_SCORING_CALIBRATION_PROTOCOL.md)
> **Reference**: [V2_POLICY_GOVERNANCE.md](V2_POLICY_GOVERNANCE.md)

---

## Purpose

This brief provides everything needed to schedule and prepare for the first
clinical scoring calibration session for the V2 Intake system. The session
reviews the deterministic scoring weights and override rules to ensure clinical
validity before production use.

**No scoring changes happen in this document** — this is scheduling and preparation only.
Changes are proposed and approved during the session itself, following the
[Scoring Calibration Protocol](V2_SCORING_CALIBRATION_PROTOCOL.md).

---

## 1. Session Objectives

| # | Objective | Deliverable |
|---|-----------|-------------|
| 1 | Review current scoring weights (4 dimensions × signal set) | Validated weight table |
| 2 | Review override floor rules (DV, trafficking, veteran, chronic, minor) | Confirmed or amended rules |
| 3 | Walk through 5+ edge-case personas against scoring engine | Pass/fail per persona |
| 4 | Review calibration report from staging data | Distribution analysis |
| 5 | Identify any weight adjustments needed | Change proposals (if any) |
| 6 | Vote on proposed changes | Sign-off or defer |
| 7 | Set POLICY_PACK_VERSION bump plan (if changes approved) | Version bump commit plan |

---

## 2. Required Stakeholders

### Quorum (minimum required for valid session)

| Role | Responsibility | Required |
|------|---------------|----------|
| **Clinical Director** | Lead weight review, sign-off authority | ✅ Required |
| **Lead Social Worker** | Propose weights, validate personas | ✅ Required |
| **DV Specialist** | Review DV/trafficking overrides and safety scoring | ✅ Required |
| **CE Coordinator** | Validate level/tier placements against CoC policy | ✅ Required |

### Recommended Attendees

| Role | Responsibility | Required |
|------|---------------|----------|
| Engineering Lead | Explain scoring mechanics, run live demos | Recommended |
| QA Engineer | Present test results, run regression tests live | Recommended |
| Program Director | Organizational accountability, resource allocation | Optional |
| Data Analyst | Present calibration data, distribution analysis | Recommended |

### Quorum Rule

A session is valid only if **at least 3 of 4 quorum members** are present,
including the Clinical Director.

---

## 3. Pre-Session Materials (Prepare 1 Week Before)

### Material Checklist

| # | Material | Source | Prepared By | ☐ |
|---|----------|--------|-------------|---|
| 1 | Calibration report (JSON + summary) | `GET /api/v2/intake/calibration` | Engineering | ☐ |
| 2 | Current scoring weight table | Extract from `computeScores.ts` | Engineering | ☐ |
| 3 | Dimension breakdown summary | Extract from `policyPack.ts` | Engineering | ☐ |
| 4 | Override rules table | Extract from `computeScores.ts` | Engineering | ☐ |
| 5 | Edge-case persona cards (5 minimum) | See Section 4 | Clinical Lead | ☐ |
| 6 | Fairness analysis report | `GET /api/v2/intake/audit/fairness` | Engineering | ☐ |
| 7 | Current POLICY_PACK_VERSION | `v1.0.0` (confirm in code) | Engineering | ☐ |
| 8 | Printed sign-off template | See Calibration Protocol §5 | Facilitator | ☐ |

### Generating the Calibration Report

```bash
# From staging environment
export TOKEN="<admin-jwt-token>"

# Calibration data
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://staging.example.com/api/v2/intake/calibration" \
  | jq . > calibration_report_$(date +%Y-%m-%d).json

# Fairness analysis
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://staging.example.com/api/v2/intake/audit/fairness" \
  | jq . > fairness_report_$(date +%Y-%m-%d).json
```

### Generating the Weight Table

```bash
# Human-readable weight summary
cd backend
grep -A 2 "points:" src/intake/v2/policy/policyPack.ts | head -100
```

Or extract from the scoring test fixtures:

```bash
cd backend
npx jest tests/intake_v2/scoring.test.ts --verbose 2>&1 | head -50
```

---

## 4. Edge-Case Persona Cards

Prepare at least 5 persona cards using this template. The first 3 are pre-built
personas from Phase 4 staging verification:

### Persona 1: Maria (DV Survivor)

```
Scenario: DV Survivor with Children, Unsheltered
────────────────────────────────────
Persona:        Maria, 28, fleeing DV with 2 children, no income, unsheltered
Key Signals:    fleeing_dv=true, unsheltered=true, children=2, income=$0,
                no_id=true, mental_health=true
────────────────────────────────────
Expected Level: 0 (Crisis)
Expected Tier:  CRITICAL
Expected Override: fleeing_dv → Level 0 floor
────────────────────────────────────
Run against engine and record:
Actual Level:   [ ]
Actual Tier:    [ ]
Actual Override: [ ]
Match: ☐
```

### Persona 2: James (Stable Housing)

```
Scenario: Housed Individual, Stable Employment
────────────────────────────────────
Persona:        James, 45, renting apartment, employed full-time, no barriers
Key Signals:    housed=true, income=$3200/mo, employed=true, no_health_issues=true
────────────────────────────────────
Expected Level: 4-5 (Stable)
Expected Tier:  LOWER
Expected Override: None
────────────────────────────────────
Run against engine and record:
Actual Level:   [ ]
Actual Tier:    [ ]
Actual Override: [ ]
Match: ☐
```

### Persona 3: Robert (Veteran, Chronic)

```
Scenario: Veteran, Chronic Homeless, Substance Use
────────────────────────────────────
Persona:        Robert, 52, veteran, unsheltered 14 months, substance use,
                ER visits, no income
Key Signals:    veteran=true, unsheltered=true, chronic_duration=14mo,
                substance_use=true, er_frequent=true, income=$0
────────────────────────────────────
Expected Level: 1 (Emergency)
Expected Tier:  HIGH
Expected Override: currently_chronic → Level 1 floor, veteran_unsheltered → Level 1
────────────────────────────────────
Run against engine and record:
Actual Level:   [ ]
Actual Tier:    [ ]
Actual Override: [ ]
Match: ☐
```

### Persona 4: Youth Aging Out (To Be Prepared)

```
Scenario: Youth Aging Out of Foster Care
────────────────────────────────────
Persona:        [Name], 18, aging out, couch surfing, no ID, part-time job
Key Signals:    age=18, couch_surfing=true, no_id=true, income=$800/mo,
                aging_out=true
────────────────────────────────────
Expected Level: 2-3
Expected Tier:  MODERATE
Expected Override: Review — may trigger unaccompanied_minor if under 18
────────────────────────────────────
Run against engine and record:
Actual Level:   [ ]
Actual Tier:    [ ]
Actual Override: [ ]
Match: ☐
```

### Persona 5: Moderate Risk (To Be Prepared)

```
Scenario: Moderate Risk, Employed, Some Health Needs
────────────────────────────────────
Persona:        [Name], 38, doubled up, part-time employed, diabetes,
                some barriers to housing
Key Signals:    doubled_up=true, income=$1200/mo, chronic_health=true,
                transportation_barrier=true
────────────────────────────────────
Expected Level: 3-4
Expected Tier:  MODERATE to LOWER
Expected Override: None
────────────────────────────────────
Run against engine and record:
Actual Level:   [ ]
Actual Tier:    [ ]
Actual Override: [ ]
Match: ☐
```

---

## 5. Session Agenda (90 Minutes)

| Time | Topic | Lead | Materials |
|------|-------|------|-----------|
| 0:00–0:10 | Welcome, ground rules, quorum check | Facilitator | Attendance sheet |
| 0:10–0:25 | Calibration report walkthrough | Data Analyst | Report JSON + charts |
| 0:25–0:45 | Dimension-by-dimension weight review | Clinical Lead | Weight table |
| 0:45–1:00 | Override rule review (5 overrides) | Clinical Lead + DV Specialist | Override table |
| 1:00–1:15 | Edge-case persona walkthrough (5 personas) | QA Engineer | Persona cards |
| 1:15–1:25 | Proposed changes summary + discussion | Facilitator | Change proposals |
| 1:25–1:30 | Sign-off vote | All quorum members | Sign-off template |

### Session Ground Rules

1. All discussion stays confidential
2. No scoring changes are made during the session — only proposed
3. Changes require majority quorum vote
4. DV-related changes require DV Specialist approval
5. If no consensus, defer to next session (do not rush)
6. All proposed changes must include clinical rationale

---

## 6. Post-Session Action Items

If the session results in approved changes:

| Step | Action | Owner | Timeline |
|------|--------|-------|----------|
| 1 | Document approved changes in sign-off form | Facilitator | Within 24 hours |
| 2 | Create engineering change request | Clinical Lead | Within 24 hours |
| 3 | Implement weight changes in code | Engineering Lead | Within 48 hours |
| 4 | Update regression tests | QA Engineer | Within 48 hours |
| 5 | Run full test suite | QA Engineer | Before merge |
| 6 | Bump POLICY_PACK_VERSION | Engineering Lead | With code changes |
| 7 | Deploy to staging | Engineering Lead | After tests pass |
| 8 | Generate comparison calibration report | Data Analyst | On staging |
| 9 | Clinical review of staging results | Clinical Lead | Within 1 week |
| 10 | Production deployment (if approved) | Engineering Lead | See Deployment Runbook |

If no changes are approved:
- Document "No changes — current weights validated" in session minutes
- Schedule next calibration session (recommended: quarterly)
- No code changes needed — POLICY_PACK_VERSION stays at v1.0.0

---

## 7. Version Bump Protocol Summary

If changes are approved, follow the version bump sequence from the
[Scoring Calibration Protocol](V2_SCORING_CALIBRATION_PROTOCOL.md) §6:

```
v1.0.0  →  v1.1.0   (weight adjustments — minor version bump)
v1.0.0  →  v2.0.0   (override rule changes — major version bump)
v1.0.0  →  v1.0.1   (test-only updates — patch version bump)
```

The commit message must reference the calibration session ID, approvers, and
specific changes made.

---

## 8. Scheduling Recommendations

| Factor | Recommendation |
|--------|---------------|
| **Timing** | Schedule 2–4 weeks before planned production deployment |
| **Duration** | 90 minutes (book 2 hours to allow overrun) |
| **Format** | In-person preferred; video conference acceptable |
| **Frequency** | First session before deployment, then quarterly |
| **Recording** | Record session (with consent) for audit trail |
| **Follow-up** | Schedule follow-up session within 1 week if changes approved |

### Suggested Scheduling Steps

1. Identify available dates for all 4 quorum members
2. Book 2-hour block
3. Send calendar invite with:
   - Agenda (Section 5)
   - Pre-read materials list (Section 3)
   - Link to this brief
   - Link to Scoring Calibration Protocol
4. Send pre-session materials 1 week before
5. Day-of: confirm quorum 15 minutes before start

---

## Guardrails Compliance

| Guardrail | Status |
|-----------|--------|
| No scoring changes | ✅ — Scheduling brief only, no code changes |
| No UI changes | ✅ |
| No V1 changes | ✅ |
| No AI calls | ✅ |
| No new endpoints | ✅ |

---

*Calibration Session Scheduling Brief — V2 Intake Phase 5*
*Authored: 2026-02-18*
