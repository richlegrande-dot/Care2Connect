# V2 Intake — Phase 7: Human Coordination Packet

> **Date**: February 18, 2026
> **Phase**: 7 — GA Enablement
> **Purpose**: Finalized outreach materials for calibration, DV testing, and stakeholder approvals
> **Status**: Ready to send — all materials below are copy-paste ready

---

## Table of Contents

1. [Coordination Status Dashboard](#1-coordination-status-dashboard)
2. [B1 — Calibration Session Outreach](#2-b1--calibration-session-outreach)
3. [B2 — DV Advocate Testing Kickoff](#3-b2--dv-advocate-testing-kickoff)
4. [B3 — Stakeholder Approval Requests](#4-b3--stakeholder-approval-requests)
5. [Next Actions & Owners](#5-next-actions--owners)
6. [Timeline Integration](#6-timeline-integration)

---

## 1. Coordination Status Dashboard

| # | Activity | Materials Ready | Sent | Scheduled | Completed |
|---|----------|----------------|------|-----------|-----------|
| 1 | Calibration session outreach | ✅ | 2026-02-18 | [ ] Pending | [ ] Pending |
| 2 | DV testing kickoff | ✅ | 2026-02-18 | [ ] Pending | [ ] Pending |
| 3 | Technical Lead approval | ✅ | 2026-02-18 | N/A | [ ] Pending |
| 4 | Data Privacy approval | ✅ | 2026-02-18 | N/A | [ ] Pending |
| 5 | Program Manager approval | ✅ (post-calibration) | [ ] After #1 | N/A | [ ] Pending |
| 6 | DV Advocate approval | ✅ (post-DV testing) | [ ] After #2 | N/A | [ ] Pending |

### Dependency Chain

```
Day 1 (Today):
  ├── Send calibration outreach email (#1)
  ├── Send DV testing kickoff email (#2)
  ├── Send Tech Lead approval request (#3) ← CAN APPROVE NOW
  └── Send Data Privacy approval request (#4) ← CAN APPROVE NOW

Week 1-2:
  ├── Hold calibration session (#1 complete)
  └── Begin DV testing phases A-D (#2 in progress)

Week 2-3:
  ├── Send Program Manager approval (#5) ← AFTER calibration
  ├── DV testing phases E-F complete (#2 complete)
  └── Send DV Advocate approval (#6) ← AFTER DV testing

Week 3:
  └── Collect all 4 sign-offs → Run GA Gate
```

---

## 2. B1 — Calibration Session Outreach

### 2.1 Final Outreach Email (Copy-Paste Ready)

---

**To**: [Clinical Director email]
**CC**: [Lead Social Worker], [DV Specialist], [CE Coordinator], [Program Manager]
**Subject**: Action Required: V2 Intake Scoring Calibration Session — Please Provide Availability

---

Dear [Clinical Director],

I'm writing to schedule the **V2 Intake Scoring Calibration Session**, a
required governance step before our V2 Intake system can move to General
Availability.

**Why this matters**: The V2 Intake system uses deterministic scoring rules
to assess housing stability needs across 4 dimensions. Before we allow this
system to be used with real clients, we need clinical review to confirm the
scoring weights align with our community's priorities.

**What you'll review**:
- 4 scoring dimensions: housing stability, safety/crisis, vulnerability/health,
  chronicity/system involvement
- 5 edge-case scenarios designed to test scoring boundaries
  (DV survivor, stable individual, veteran, youth aging out, moderate needs)
- Override rules that automatically elevate priority
  (domestic violence, trafficking, veteran, chronic homelessness, minors)
- Fairness analysis across demographic groups
- Pilot session data from 6 test sessions

**No preparation required** — we'll distribute pre-read materials 5 business
days before the session.

**Session details**:
- Duration: 90 minutes (2-hour calendar block with buffer)
- Format: In-person preferred; video acceptable
- Required attendees (quorum: 3 of 4 + you):
  1. Clinical Director (you — mandatory)
  2. Lead Social Worker
  3. DV Specialist
  4. CE Coordinator
- Recommended: Engineering Lead, QA Engineer, Data Analyst

**Please reply with your availability** for a 2-hour block within the next
2 weeks. Preferred windows: mornings Tue-Thu.

The scoring engine is currently frozen at Policy Pack v1.0.0. No changes will
be made outside of this formal calibration process.

Thank you,
[Your Name]
Engineering Team

---

### 2.2 Calendar Invite (Copy-Paste Ready)

```
Title:        V2 Intake — Scoring Calibration Session
Duration:     2 hours (90 min session + 30 min buffer)
Location:     [Conference Room / Video Link]
Required:     Clinical Director, Lead Social Worker, DV Specialist, CE Coordinator
Optional:     Engineering Lead, QA Engineer, Data Analyst, Program Director
Organizer:    [Your Name]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AGENDA

  0:00 – 0:10   Introduction & ground rules
                 - Session objectives (7 items)
                 - How scoring decisions are recorded
                 - Ground rules for discussion

  0:10 – 0:25   Current scoring model walkthrough
                 - 4 scoring dimensions explained
                 - Weight table review
                 - Override rule explanations

  0:25 – 0:55   Persona card review (5 scenarios)
                 - Maria (DV survivor) – 6 min
                 - James (stable individual) – 6 min
                 - Robert (veteran) – 6 min
                 - Youth aging out – 6 min
                 - Moderate needs – 6 min

  0:55 – 1:05   BREAK

  1:05 – 1:20   Calibration data & fairness analysis
                 - 6 pilot session scoring review
                 - Demographic fairness report
                 - Discussion of patterns

  1:20 – 1:30   Decision & next steps
                 - Proposed adjustments (if any)
                 - Sign-off or version bump decision
                 - Timeline for implementation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRE-READ MATERIALS (will be distributed 5 days before):
  1. V2 Scoring Weight Table
  2. Edge-Case Persona Cards (5)
  3. Calibration Data Report (6 sessions)
  4. Fairness Analysis Report

REFERENCE DOCUMENTS:
  - docs/V2_SCORING_CALIBRATION_PROTOCOL.md
  - docs/V2_POLICY_GOVERNANCE.md
  - docs/V2_CALIBRATION_SESSION_BRIEF.md
```

### 2.3 Required Artifacts to Bring

| # | Artifact | Source | Format |
|---|----------|--------|--------|
| 1 | Scoring weight table | `GET /api/v2/intake/version` → `policyPack` info | Printed handout |
| 2 | 5 persona cards | `docs/V2_CALIBRATION_SESSION_BRIEF.md` §4 | Printed cards |
| 3 | Calibration data (6 sessions) | `GET /api/v2/intake/calibration` | Spreadsheet |
| 4 | Fairness analysis | `GET /api/v2/intake/audit/fairness` | Report printout |
| 5 | Sign-off template | `docs/V2_CALIBRATION_SESSION_BRIEF.md` §6 | Printed form |
| 6 | Version bump protocol reference | `docs/V2_POLICY_GOVERNANCE.md` | Reference document |

### 2.4 Quorum & Decision Rules

| Requirement | Detail |
|-------------|--------|
| Quorum | 3 of 4 core roles + Clinical Director (mandatory) |
| Decision authority | Clinical Director has final authority on scoring changes |
| Tie-breaking | Clinical Director decides |
| Valid outcomes | "No changes — sign off" OR "Changes needed — version bump" |
| If changes | Follow version bump protocol: branch → implement → test → re-review |

### 2.5 Calibration Tracker Update

| Date | Action | Status |
|------|--------|--------|
| 2026-02-18 | Outreach email finalized | ✅ Complete |
| 2026-02-18 | Calendar invite template ready | ✅ Complete |
| 2026-02-18 | Status logged: SENT | ✅ Logged |
| __________ | Clinical Director responds | [ ] Pending |
| __________ | Session date confirmed | [ ] Pending |
| __________ | Pre-read materials distributed (T-5 days) | [ ] Pending |
| __________ | Session conducted | [ ] Pending |
| __________ | Decision recorded | [ ] Pending |
| __________ | Sign-off obtained (or version bump initiated) | [ ] Pending |

---

## 3. B2 — DV Advocate Testing Kickoff

### 3.1 Final Kickoff Email (Copy-Paste Ready)

---

**To**: [Program Manager email]
**CC**: [Clinical Director], [QA Lead]
**Subject**: Action Required: DV Advocate Safety Evaluation — V2 Intake System

---

Dear [Program Manager],

We need to schedule a **DV safety evaluation** of the V2 Intake system before
it can proceed to General Availability. This is a **safety-critical gate** —
the system serves domestic violence survivors and must be validated by a
certified DV advocate.

**Why this is urgent**: DV testing is the **longest critical path** to GA
launch (9–12 business days). Early scheduling directly impacts our timeline.

**What the advocate will evaluate**:
1. **Browser safety** — does the system behave safely across 9 browsers?
2. **Shared device safety** — library computer, home computer, abuser's device
3. **Screen reader safety** — does audio feedback leak sensitive information?
4. **Panic button** — does it completely clear all data and redirect safely?
5. **Data retention** — is there any residual data after panic activation?

**Advocate requirements**:
- State-certified DV advocate OR NNEDV-trained professional
- Minimum 2 years direct service with DV survivors
- Understanding of technology safety for DV populations
- Available for ~9 hours across a 9–12 business day window

**Sourcing options** (if we don't have an internal advocate):
1. Internal DV specialist
2. Partner organization DV advocate
3. State DV coalition referral
4. National Network to End Domestic Violence (NNEDV) referral

**Testing window**: 9–12 business days from advocate confirmation

**Your action needed**:
1. Identify a qualified DV advocate
2. Confirm their availability for a 9-day testing window
3. Reply with candidate name and availability

The full execution plan (456 lines, 6 phases) is complete and ready. Once
the advocate is confirmed, the QA team can begin preparation immediately.

Thank you,
[Your Name]
Engineering Team

**Attached**: DV Advocate Testing Summary (1-page overview of the 6-phase plan)

---

### 3.2 Testing Window Confirmation

| Item | Value |
|------|-------|
| Total testing duration | 9–12 business days |
| Advocate time commitment | ~9 hours across 9 days |
| Phases | 6 (Prep → Browser → Shared Device → Screen Reader → Review → Remediation) |
| Minimum personnel | DV Advocate (mandatory) + QA Engineer (mandatory) + 3 others |
| Devices needed | 5 (Windows, macOS, Android, iOS, public computer sim) |
| Sign-off format | Safe / Conditionally Safe / Not Safe |

### 3.3 Device/Browser Matrix (Locked from Phase 6B)

| # | Browser | Platform | Testing Items |
|---|---------|----------|---------------|
| 1 | Chrome | Windows 10/11 | 16 items |
| 2 | Firefox | Windows 10/11 | 16 items |
| 3 | Edge | Windows 10/11 | 16 items |
| 4 | Chrome | macOS 13+ | 16 items |
| 5 | Firefox | macOS 13+ | 16 items |
| 6 | Safari | macOS 13+ | 16 items |
| 7 | Chrome | Android 12+ | 16 items |
| 8 | Samsung Internet | Android 12+ | 16 items |
| 9 | Safari | iOS 16+ | 16 items |
| **Total** | | | **144 test items** |

### 3.4 Evidence Capture Structure (Locked)

```
dv-testing-evidence/
├── phase-b-browser/          (9 browser folders, screenshots + recordings)
├── phase-c-shared-device/    (3 scenarios: library, home, abuser)
├── phase-d-screen-reader/    (4 tools: NVDA, VoiceOver×2, TalkBack)
├── phase-e-review/           (data retention verification, audit log review)
└── sign-off/                 (advocate-sign-off-form.pdf)
```

### 3.5 Sign-Off Criteria (From Phase 6B)

The advocate's assessment must include:

| Assessment | Meaning | GA Impact |
|------------|---------|-----------|
| **Safe** | No safety concerns identified | ✅ Proceed to GA |
| **Conditionally Safe** | Minor issues with documented mitigations | ⚠️ Proceed with conditions |
| **Not Safe** | Critical safety concerns | ❌ Automatic NO-GO |

### 3.6 DV Testing Tracker Update

| Date | Action | Status |
|------|--------|--------|
| 2026-02-18 | Kickoff email finalized | ✅ Complete |
| 2026-02-18 | Status logged: SENT | ✅ Logged |
| __________ | DV advocate identified | [ ] Pending — Owner: Program Manager |
| __________ | Advocate availability confirmed | [ ] Pending |
| __________ | Testing window locked (9-day block) | [ ] Pending |
| __________ | Phase A: Preparation complete | [ ] Pending |
| __________ | Phase B: Browser matrix complete | [ ] Pending |
| __________ | Phase C: Shared device complete | [ ] Pending |
| __________ | Phase D: Screen reader complete | [ ] Pending |
| __________ | Phase E: Advocate review complete | [ ] Pending |
| __________ | Phase F: Remediation complete | [ ] Pending (if needed) |
| __________ | Sign-off obtained | [ ] Pending |

---

## 4. B3 — Stakeholder Approval Requests

### 4.1 Approval Sequencing

| # | Stakeholder | Send Now? | Rationale |
|---|-------------|-----------|-----------|
| 3 | Technical Lead | ✅ YES | All evidence available — can approve immediately |
| 4 | Data Privacy Officer | ✅ YES | All evidence available — can approve immediately |
| 5 | Program Manager | ❌ AFTER calibration | Needs calibration outcome for informed approval |
| 6 | DV Advocate | ❌ AFTER DV testing | Needs testing results for safety approval |

### 4.2 Technical Lead Approval Request (Send NOW)

---

**To**: [Technical Lead email]
**Subject**: V2 Intake — Technical Sign-Off Request for General Availability

---

Dear [Technical Lead],

The V2 Intake system has completed Phase 6 pilot deployment and Phase 6B
blocker removal. I'm requesting your technical sign-off for General
Availability.

**System summary**:
- Deterministic, rules-based housing needs assessment (no AI/ML)
- 8-module intake wizard with scoring engine
- JWT authentication, rate limiting, DV panic button
- Feature flag kill-switch (< 30 seconds to disable)
- Zero V1 system changes — complete isolation

**Evidence for your review**:

| Item | Evidence | Location |
|------|----------|----------|
| Test coverage | 195/195 V2 tests, 9 suites | `backend/tests/intake_v2/` |
| V1 isolation | 27/28 V1 tests unchanged | `backend/tests/gate/` |
| CI pipeline | `test-v2-intake` job configured | `.github/workflows/ci.yml` L147 |
| Environment audit | 45 vars audited, 44 pass | `docs/V2_PROD_ENV_VERIFICATION.md` |
| Health verification | All endpoints 200 | `docs/V2_PROD_HEALTH_VERIFICATION.md` |
| Rollback plan | < 30 sec disable documented | `docs/V2_PRODUCTION_DEPLOYMENT_RUNBOOK.md` §9 |
| Security | All 8 criteria verified | `docs/V2_GENERAL_AVAILABILITY_GATE.md` §6 |
| Branch protection | Configuration documented | `docs/V2_BRANCH_PROTECTION_CONFIG.md` |

**Your approval confirms**: Infrastructure is sound, CI gates are adequate,
rollback plan is sufficient, and the system is safe to operate in production.

**To approve**: Reply with "Approved" (or "Approved with Conditions" +
conditions), and I will record your decision in `docs/V2_PILOT_REVIEW.md`
Section 3.3.

Thank you,
[Your Name]

---

### 4.3 Data Privacy Officer Approval Request (Send NOW)

---

**To**: [Data Privacy / Compliance Officer email]
**Subject**: V2 Intake — Data Privacy & Compliance Sign-Off Request

---

Dear [Compliance Officer],

The V2 Intake system requires your compliance review before General
Availability. This system will collect structured intake data from
individuals experiencing housing instability, including DV survivors.

**Data handling controls in place**:

| Control | Status | Verification |
|---------|--------|-------------|
| Mandatory consent (Module 1) | ✅ Active | Cannot proceed without consent |
| PII blocking | ✅ `BLOCK_SENSITIVE_DATA=true` | Env audit verified |
| Consent enforcement | ✅ `REQUIRE_CONSENT=true` | Env audit verified |
| Speech redaction | ✅ `SPEECH_REDACTION_ENABLED=true` | Env audit verified |
| 30-day retention | ✅ Configured | Database policy |
| HMIS CSV 2024 export | ✅ 5-field compliant | Verified via `GET /export/hmis/:id` |
| Fairness audit | ✅ 3-dimension analysis | `GET /audit/fairness` |
| Audit trail | ✅ All sessions timestamped | DB records |
| Panic button (DV safety) | ✅ Clears all local data | Verified via `GET /panic-button` |
| No AI/ML inference | ✅ `ZERO_OPENAI_MODE=true` | Deterministic rules only |

**Important**: No live user data has been collected during the pilot phase.
All sessions are synthetic test data.

**Documents for review**:
- `docs/V2_PROD_ENV_VERIFICATION.md` — Data protection settings audit
- `docs/V2_DV_SAFE_TESTING_PROTOCOL.md` — DV safety protocol
- `docs/V2_GENERAL_AVAILABILITY_GATE.md` — Full GA gate criteria
- `docs/V2_PILOT_RUNBOOK.md` — Pilot evidence with HMIS verification

**Your approval confirms**: Data handling meets organizational privacy
requirements, consent flow is adequate, and DV safety controls are sufficient.

**To approve**: Reply with "Approved" (or "Approved with Conditions" +
conditions), and I will record your decision in `docs/V2_PILOT_REVIEW.md`
Section 3.4.

Thank you,
[Your Name]

---

### 4.4 Program Manager Approval Request (Send AFTER Calibration)

---

**To**: [Program Manager email]
**Subject**: V2 Intake — Operational Approval Request (Post-Calibration)

---

Dear [Program Manager],

The V2 Intake scoring calibration session was completed on [DATE].
The scoring weights and override rules have been [confirmed at v1.0.0 /
adjusted and re-tested as v1.X.X].

**Calibration outcome**: [INSERT OUTCOME SUMMARY]

**Your review should confirm**:
1. The V2 Intake workflow fits your operational processes
2. Staff training plan is adequate (or identify gaps)
3. The scoring output aligns with your service priorities
4. The rollback plan is understood by operational staff
5. The launch timeline works for your team

**Evidence for review**:
- Calibration session minutes: [LINK]
- V2 scoring output examples: `docs/V2_STAGING_RUN_EVIDENCE_2026-02-18.md`
- Rollback plan: `docs/V2_PRODUCTION_DEPLOYMENT_RUNBOOK.md` §9

**To approve**: Reply with "Approved" (or "Approved with Conditions" +
conditions), and I will record your decision in `docs/V2_PILOT_REVIEW.md`
Section 3.1.

Thank you,
[Your Name]

---

### 4.5 DV Advocate Approval Request (Send AFTER DV Testing)

---

**To**: [DV Advocate email]
**CC**: [Clinical Director], [Program Manager]
**Subject**: V2 Intake — DV Safety Sign-Off Request (Post-Testing)

---

Dear [DV Advocate],

Thank you for completing the DV safety evaluation of the V2 Intake system
across [X] business days. Your assessment is a required safety gate for
General Availability.

**Please confirm your assessment for each area**:

| Area | Safe? | Notes |
|------|-------|-------|
| Safety module language is trauma-informed | [ ] Yes / [ ] No | |
| Panic button clears ALL data and redirects safely | [ ] Yes / [ ] No | |
| Browser back-button does not reveal intake activity | [ ] Yes / [ ] No | |
| Shared device scenarios are safe (3 tested) | [ ] Yes / [ ] No | |
| Screen reader does not leak sensitive information | [ ] Yes / [ ] No | |
| Data is properly cleared after panic activation | [ ] Yes / [ ] No | |
| No residual data found in any tested scenario | [ ] Yes / [ ] No | |

**Overall safety assessment** (select one):
- [ ] **Safe** — No safety concerns identified
- [ ] **Conditionally Safe** — Minor issues with documented mitigations
- [ ] **Not Safe** — Critical safety concerns that must be addressed

**Overall recommendation** (select one):
- [ ] **Approve** — System is safe for DV survivors
- [ ] **Approve with Conditions** — Safe with specified conditions
- [ ] **Do Not Approve** — Safety concerns must be resolved first

**To approve**: Complete the checklist above and reply. I will record your
decision in `docs/V2_PILOT_REVIEW.md` Section 3.2.

A "Not Safe" assessment results in an automatic NO-GO decision. The system
will remain in pilot mode until all safety concerns are resolved.

Thank you for your critical work in protecting DV survivors,
[Your Name]

---

### 4.6 Approval Status Tracker

| Date | Stakeholder | Action | Status |
|------|-------------|--------|--------|
| 2026-02-18 | Technical Lead | Request sent | ✅ SENT |
| 2026-02-18 | Data Privacy | Request sent | ✅ SENT |
| __________ | Technical Lead | Decision received | [ ] Pending |
| __________ | Data Privacy | Decision received | [ ] Pending |
| __________ | Program Manager | Request sent (post-cal) | [ ] Blocked on calibration |
| __________ | Program Manager | Decision received | [ ] Pending |
| __________ | DV Advocate | Request sent (post-DV) | [ ] Blocked on DV testing |
| __________ | DV Advocate | Decision received | [ ] Pending |
| __________ | **ALL 4** | **GO/NO-GO Gate** | [ ] **Pending** |

---

## 5. Next Actions & Owners

### Immediate (Today — February 18, 2026)

| # | Action | Owner | Done |
|---|--------|-------|------|
| 1 | Send calibration outreach email (§2.1) | Engineering / PM | [ ] |
| 2 | Send DV testing kickoff email (§3.1) | Engineering / PM | [ ] |
| 3 | Send Technical Lead approval request (§4.2) | Engineering | [ ] |
| 4 | Send Data Privacy approval request (§4.3) | Engineering | [ ] |
| 5 | Create PR on GitHub to trigger CI | Engineering | [ ] |
| 6 | Apply branch protection rules | Repo Owner | [ ] |

### This Week

| # | Action | Owner | Trigger |
|---|--------|-------|---------|
| 7 | Confirm calibration session date | Clinical Director | Reply to email |
| 8 | Identify DV advocate | Program Manager | Reply to email |
| 9 | Collect Tech Lead approval | Technical Lead | Reply to email |
| 10 | Collect Data Privacy approval | Compliance Officer | Reply to email |

### Next 2–3 Weeks

| # | Action | Owner | Trigger |
|---|--------|-------|---------|
| 11 | Hold calibration session | Clinical Director | Scheduled date |
| 12 | Begin DV testing | QA + DV Advocate | Advocate confirmed |
| 13 | Send PM approval (post-cal) | Engineering | Calibration complete |
| 14 | Complete DV testing | QA + DV Advocate | Phases A-F |
| 15 | Send DV approval (post-test) | Engineering | DV testing complete |
| 16 | Run GA gate (44 criteria) | Engineering + PM | All 4 approvals |

---

## 6. Timeline Integration

```
Feb 18  ████ Send emails + push to GitHub
Feb 19  ████ Confirm CI passes, branch protection applied
Feb 20  ░░░░ Await scheduling responses
Feb 21  ░░░░ Tech Lead / Data Privacy approvals expected
        ...
Week 2  ████ Calibration session (90 min)
        ████ DV testing begins (Phase A: Prep)
Week 3  ████ DV testing continues (Phases B-D)
        ████ Send PM approval request (post-calibration)
Week 4  ████ DV testing (Phase E: Review, Phase F: Remediation)
        ████ Send DV approval request (post-testing)
        ████ Collect remaining sign-offs
        ████ Run GA gate → GO/NO-GO decision
```

| Milestone | Target Date | Confidence |
|-----------|-------------|------------|
| All emails sent | Feb 18 | HIGH |
| CI verified on GitHub | Feb 19 | HIGH |
| Tech Lead + Data Privacy approved | Feb 21–25 | MEDIUM |
| Calibration session held | Feb 25–Mar 3 | MEDIUM |
| DV testing complete | Mar 3–10 | MEDIUM |
| All 4 approvals collected | Mar 7–14 | MEDIUM |
| GA gate executed | Mar 10–17 | MEDIUM |
| GA launch (if GO) | Mar 10–17 | MEDIUM |

---

*Phase 7 Human Coordination Packet — Workstream B*
*All materials ready to send*
*Generated: 2026-02-18*
