# V2 Intake — DV Advocate Testing Status

> **Date**: February 19, 2026
> **Phase**: 6B — Blocker Removal
> **Reference**: `docs/V2_DV_EXECUTION_PLAN.md` (456 lines)
> **Reference**: `docs/V2_DV_SAFE_TESTING_PROTOCOL.md`
> **Safety Classification**: HIGH — errors may endanger DV survivors

---

## Current Status: ⚠️ NOT YET SCHEDULED

The DV advocate evaluation has not been scheduled. The full execution plan
(6 phases, 9–12 business days) is complete and ready to execute. This
document provides coordination artifacts to lock the timeline and ownership.

---

## 1. Readiness Assessment

| Prerequisite | Status | Evidence |
|-------------|--------|----------|
| DV execution plan | ✅ Ready | `docs/V2_DV_EXECUTION_PLAN.md` (456 lines, 6 phases) |
| DV-safe testing protocol | ✅ Ready | `docs/V2_DV_SAFE_TESTING_PROTOCOL.md` |
| Panic button functional | ✅ Verified | `GET /panic-button` → 200, clears all storage |
| Consent module | ✅ Verified | First module in 8-module sequence |
| Safety module in schema | ✅ Verified | Module 4 of 8 in `GET /schema` |
| Auth enforcement | ✅ Verified | 401 without token |
| Staging environment live | ✅ Verified | Server running, all endpoints operational |

**All 7/7 prerequisites are satisfied.** Testing can begin as soon as
the DV advocate is identified and scheduled.

---

## 2. Critical Path Analysis

This is the **longest critical path** to General Availability.

```
Week 1          Week 2          Week 3
Days 1-3        Days 4-7        Days 8-12
┌──────────┐   ┌──────────┐   ┌──────────────────┐
│ Phase A: │   │ Phase B: │   │ Phase E: Review   │
│ Prep     │──►│ Browser  │──►│ Phase F: Remediate│
│          │   │ Matrix   │   │ (if needed)       │
└──────────┘   ├──────────┤   └──────────────────┘
               │ Phase C: │
               │ Shared   │
               │ Device   │
               ├──────────┤
               │ Phase D: │
               │ Screen   │
               │ Reader   │
               └──────────┘
```

### Timeline Estimate

| Phase | Days | Duration | Dependencies |
|-------|------|----------|-------------|
| A: Preparation | 1–3 | 3 days | DV advocate confirmed |
| B: Browser Matrix | 4–5 | 2 days | Phase A complete |
| C: Shared Device | 6 | 1 day | Phase A complete |
| D: Screen Reader | 7 | 1 day | Phase A complete |
| E: Review & Sign-off | 8–9 | 2 days | Phases B–D complete |
| F: Remediation | 10–12 | 0–3 days | Only if issues found |
| **Total** | | **9–12 business days** | |

---

## 3. Required Personnel

| # | Role | Qualifications | Identified | Contact |
|---|------|---------------|-----------|---------|
| 1 | **Certified DV Advocate** | State-certified or NNEDV-trained; 2+ years direct service | [ ] | ________________ |
| 2 | Clinical Director | Oversight authority | [ ] | ________________ |
| 3 | QA Engineer | Evidence capture experience | [ ] | ________________ |
| 4 | Accessibility Specialist | Screen reader proficiency (NVDA, VoiceOver, TalkBack) | [ ] | ________________ |
| 5 | IT Security | Data retention verification | [ ] | ________________ |
| 6 | Program Manager | Coordination lead | [ ] | ________________ |
| 7 | Note Taker | Documentation | [ ] | ________________ |

### Minimum Required for Valid Testing

- DV Advocate (mandatory — cannot be substituted)
- QA Engineer (mandatory — evidence capture)
- At least 3 of remaining 5 roles filled

---

## 4. Device & Software Matrix (Locked)

### Devices Required

| # | Device | OS | Purpose | Secured |
|---|--------|----|---------|---------|
| 1 | Windows desktop/laptop | Windows 10/11 | Browser + NVDA testing | [ ] |
| 2 | macOS laptop | macOS 13+ | Safari + VoiceOver testing | [ ] |
| 3 | Android phone/tablet | Android 12+ | Mobile browser + TalkBack | [ ] |
| 4 | iPhone/iPad | iOS 16+ | Safari mobile + VoiceOver | [ ] |
| 5 | Public computer simulation | Any | Library scenario | [ ] |

### Software Required

| # | Software | Platform | Purpose | Installed |
|---|----------|----------|---------|-----------|
| 1 | NVDA | Windows | Screen reader | [ ] |
| 2 | VoiceOver | macOS/iOS | Screen reader (built-in) | [ ] |
| 3 | TalkBack | Android | Screen reader (built-in) | [ ] |
| 4 | OBS/screen recorder | All | Evidence capture | [ ] |

---

## 5. Evidence Capture Structure (Locked)

### Folder Structure

```
dv-testing-evidence/
├── phase-b-browser/
│   ├── chrome-windows/
│   ├── firefox-windows/
│   ├── edge-windows/
│   ├── chrome-macos/
│   ├── firefox-macos/
│   ├── safari-macos/
│   ├── chrome-android/
│   ├── samsung-android/
│   └── safari-ios/
├── phase-c-shared-device/
│   ├── library-simulation/
│   ├── home-simulation/
│   └── abuser-simulation/
├── phase-d-screen-reader/
│   ├── nvda-windows/
│   ├── voiceover-macos/
│   ├── talkback-android/
│   └── voiceover-ios/
├── phase-e-review/
│   ├── data-retention-verification/
│   ├── audit-log-review/
│   └── advocate-review-notes/
└── sign-off/
    └── advocate-sign-off-form.pdf
```

### File Naming Convention

```
{phase}-{browser/device}-{test-number}-{pass|fail}-{timestamp}.{ext}
Example: b-chrome-windows-007-pass-20260301-1423.png
```

---

## 6. Remediation Timeline (If Issues Found)

| Severity | Response Time | Owner | Process |
|----------|--------------|-------|---------|
| Critical (safety risk) | 24 hours | Engineering | Hotfix → re-test → advocate re-review |
| High (usability concern) | 3 business days | Engineering | Fix → regression test → advocate review |
| Medium (cosmetic/enhancement) | Before GA | Engineering | Log → schedule for post-pilot |
| Low (suggestion) | Backlog | Engineering | Document → prioritize later |

---

## 7. Sign-Off Format (Agreed)

The DV advocate sign-off form must include:

| Section | Content |
|---------|---------|
| Tester Name | Certified DV advocate name and credentials |
| Testing Dates | Start and end dates |
| Phases Completed | Checklist of A–E (F if applicable) |
| Issues Found | Numbered list with severity |
| Issues Resolved | Cross-reference to fixes |
| Outstanding Issues | Any deferred items with justification |
| Safety Assessment | "Safe / Conditionally Safe / Not Safe" |
| Recommendation | "Approve / Approve with Conditions / Do Not Approve" |
| Signature | Advocate signature and date |
| Witness | Clinical Director signature and date |

---

## 8. Coordination Brief

### For Program Manager

**Action required**: Identify and contact a certified DV advocate.

**Sourcing options**:
1. Internal DV specialist (if organization has one)
2. Partner organization DV advocate
3. State DV coalition referral
4. National Network to End Domestic Violence (NNEDV) referral

**Qualifications required**:
- State-certified DV advocate OR NNEDV-trained professional
- Minimum 2 years direct service with DV survivors
- Understanding of technology safety for DV populations
- Available for 9–12 business day engagement

**Estimated advocate time commitment**:
- Phase A briefing: 2 hours
- Phase C abuser simulation (observation): 2 hours
- Phase E evidence review: 4 hours
- Phase E sign-off decision: 1 hour
- **Total advocate hours**: ~9 hours across 9 days

---

## 9. Testing Kickoff Checklist

When advocate is confirmed, execute in order:

| # | Task | Owner | Timeline |
|---|------|-------|----------|
| 1 | Confirm advocate availability for 9-day window | Program Manager | Day 0 |
| 2 | Send execution plan to advocate for review | Engineering | Day 0 |
| 3 | Obtain advocate acknowledgment of protocol | Program Manager | Day 0+1 |
| 4 | Secure all test devices (5) | QA Engineer | Day 1 |
| 5 | Install screen readers and recording software | QA Engineer | Day 1 |
| 6 | Create evidence capture folder structure | QA Engineer | Day 1 |
| 7 | Generate test JWT tokens (3 role types) | Engineering | Day 2 |
| 8 | Verify staging environment is stable | Engineering | Day 2 |
| 9 | Brief all testers on protocol | QA Lead | Day 3 |
| 10 | Begin Phase B browser testing | QA Engineer | Day 4 |

---

## 10. Scheduling Status Tracker

| Date | Action | Status |
|------|--------|--------|
| 2026-02-19 | Coordination brief prepared | ✅ Ready |
| __________ | DV advocate identified | [ ] |
| __________ | Advocate availability confirmed | [ ] |
| __________ | Testing window locked (9-day block) | [ ] |
| __________ | Phase A prep complete | [ ] |
| __________ | Phases B–D testing complete | [ ] |
| __________ | Phase E advocate review complete | [ ] |
| __________ | Sign-off obtained or remediation begun | [ ] |

---

*DV Testing Status — Phase 6B*
*Generated: 2026-02-19*
*Safety Classification: HIGH*
