# V2 Intake — Calibration Session Status

> **Date**: February 19, 2026
> **Phase**: 6B — Blocker Removal
> **Reference**: `docs/V2_CALIBRATION_SESSION_BRIEF.md`
> **Reference**: `docs/V2_SCORING_CALIBRATION_PROTOCOL.md`

---

## Current Status: ⚠️ NOT YET SCHEDULED

The calibration session has not been scheduled. All preparation materials
are complete. This document provides the scheduling artifacts needed to
remove this blocker.

---

## 1. Readiness Assessment

| Prerequisite | Status | Evidence |
|-------------|--------|----------|
| Calibration session brief | ✅ Ready | `docs/V2_CALIBRATION_SESSION_BRIEF.md` (324 lines) |
| Scoring calibration protocol | ✅ Ready | `docs/V2_SCORING_CALIBRATION_PROTOCOL.md` |
| Policy governance framework | ✅ Ready | `docs/V2_POLICY_GOVERNANCE.md` |
| Edge-case persona cards (5) | ✅ Ready | Embedded in session brief §4 |
| Calibration data (6 sessions) | ✅ Available | `GET /api/v2/intake/calibration` |
| Fairness analysis (3 reports) | ✅ Available | `GET /api/v2/intake/audit/fairness` |
| Scoring engine frozen | ✅ Confirmed | Policy pack v1.0.0, no modifications |
| Meeting agenda (90 min) | ✅ Ready | Session brief §5 |
| Sign-off template | ✅ Ready | Session brief §6 |
| Version bump protocol | ✅ Ready | Session brief §7 |

**All 10/10 prerequisites are satisfied.** The session can be scheduled immediately.

---

## 2. Required Participants

### Quorum (3 of 4 + Clinical Director mandatory)

| # | Role | Identified | Confirmed | Contact |
|---|------|-----------|-----------|---------|
| 1 | Clinical Director | [ ] | [ ] | ________________ |
| 2 | Lead Social Worker | [ ] | [ ] | ________________ |
| 3 | DV Specialist | [ ] | [ ] | ________________ |
| 4 | CE Coordinator | [ ] | [ ] | ________________ |

### Recommended Attendees

| # | Role | Identified | Confirmed | Contact |
|---|------|-----------|-----------|---------|
| 5 | Engineering Lead | [ ] | [ ] | ________________ |
| 6 | QA Engineer | [ ] | [ ] | ________________ |
| 7 | Data Analyst | [ ] | [ ] | ________________ |
| 8 | Program Director | [ ] | [ ] | ________________ |

---

## 3. Scheduling Constraints

| Constraint | Detail |
|------------|--------|
| Duration | 2 hours (90 min session + 30 min buffer) |
| Format | In-person preferred; video acceptable |
| Materials lead time | 1 week before session |
| Quorum requirement | 3/4 core roles + Clinical Director |
| Scoring freeze | Active — no scoring changes during review period |
| Follow-up buffer | 1–2 business days for sign-off |

---

## 4. Outreach Email Draft

**Subject**: V2 Intake Scoring Calibration Session — Scheduling Request

---

Dear [Clinical Director / Team],

We are ready to schedule the **V2 Intake Scoring Calibration Session**, a
required governance step before the V2 Intake system can proceed to General
Availability.

**Purpose**: Review the deterministic scoring weights and override rules used
by the V2 Intake system to ensure they align with clinical priorities for
housing placement decisions.

**What you'll review**:
- 4 scoring dimensions (housing stability, safety/crisis, vulnerability/health,
  chronicity/system involvement)
- 5 edge-case persona scenarios (DV survivor, stable individual, veteran,
  youth aging out, moderate needs)
- Override floor rules (DV, trafficking, veteran, chronic, minor)
- Fairness analysis across demographic groups
- Calibration data from 6 pilot sessions

**Duration**: 90 minutes (2-hour block with buffer)

**Pre-session materials**: Will be distributed 1 week before the session.
No preparation is required beyond reviewing the materials.

**Required attendees** (quorum: 3 of 4 + Clinical Director):
1. Clinical Director (mandatory)
2. Lead Social Worker
3. DV Specialist
4. CE Coordinator

**Recommended attendees**: Engineering Lead, QA Engineer, Data Analyst

**Scheduling**: Please provide your availability for a 2-hour block within
the next 2 weeks. Preferred times: [insert preferred windows].

The scoring engine is currently frozen at Policy Pack v1.0.0. No changes
will be made to scoring logic outside of this calibration session process.

If changes are proposed during the session, they will follow the formal
version bump protocol documented in our governance framework.

Please reply with your availability or delegate to a scheduling contact.

Thank you,
[Engineering Team]

---

## 5. Calendar Invite Template

```
Title:     V2 Intake — Scoring Calibration Session
Duration:  2 hours (90 min session + 30 min buffer)
Location:  [Conference room / Video link]
Required:  Clinical Director, Lead Social Worker, DV Specialist, CE Coordinator
Optional:  Engineering Lead, QA Engineer, Data Analyst, Program Director

Agenda:
  0:00–0:10  Introduction & ground rules
  0:10–0:25  Current scoring model walkthrough (4 dimensions)
  0:25–0:55  Persona card review (5 scenarios, 6 min each)
  0:55–1:05  Break
  1:05–1:20  Calibration data review & fairness analysis
  1:20–1:30  Discussion: proposed adjustments (if any)

Pre-read (attached):
  - V2 Scoring Weight Table
  - Edge-Case Persona Cards (5)
  - Calibration Report (6 sessions)
  - Fairness Analysis Report

Reference docs (shared folder):
  - V2_SCORING_CALIBRATION_PROTOCOL.md
  - V2_POLICY_GOVERNANCE.md
  - V2_CALIBRATION_SESSION_BRIEF.md
```

---

## 6. Success Criteria

The calibration session is successful when:

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | Quorum met (3/4 + Clinical Director) | Attendance sign-in |
| 2 | All 5 persona cards reviewed | Facilitator checklist |
| 3 | Scoring output for each persona discussed | Meeting notes |
| 4 | Calibration data reviewed | Facilitator checklist |
| 5 | Fairness analysis reviewed | Meeting notes |
| 6 | Decision recorded: change or no-change | Sign-off template |
| 7 | If changes: version bump protocol initiated | Change request filed |
| 8 | If no changes: sign-off obtained | Signed template |

---

## 7. Post-Session Actions

### If No Changes Required

| # | Action | Owner | Timeline |
|---|--------|-------|----------|
| 1 | Record "no changes" decision | Facilitator | Same day |
| 2 | Obtain Clinical Director sign-off | Program Manager | 1 business day |
| 3 | Update this document with session date and outcome | Engineering | Same day |

### If Changes Required

| # | Action | Owner | Timeline |
|---|--------|-------|----------|
| 1 | Document proposed changes with rationale | Clinical Lead | Same day |
| 2 | File change request per governance protocol | Engineering | 1 business day |
| 3 | Implement changes in isolated branch | Engineering | 1–3 business days |
| 4 | Run full regression (195 tests) | Engineering | Same day as change |
| 5 | Bump POLICY_PACK_VERSION | Engineering | With change commit |
| 6 | Schedule follow-up review if needed | Program Manager | 1 week |
| 7 | Update this document | Engineering | After implementation |

---

## 8. Scheduling Status Tracker

| Date | Action | Status |
|------|--------|--------|
| 2026-02-19 | Outreach email prepared | ✅ Ready to send |
| __________ | Outreach email sent | [ ] |
| __________ | Participant responses received | [ ] |
| __________ | Session date confirmed | [ ] |
| __________ | Pre-session materials distributed | [ ] |
| __________ | Session conducted | [ ] |
| __________ | Sign-off obtained | [ ] |

---

*Calibration Session Status — Phase 6B*
*Generated: 2026-02-19*
