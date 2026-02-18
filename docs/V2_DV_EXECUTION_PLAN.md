# V2 Intake — DV Advocate Testing Execution Plan

> **Version**: 1.0
> **Date**: February 18, 2026
> **Status**: Ready to schedule
> **Safety Classification**: HIGH — errors may endanger DV survivors
> **Reference**: [V2_DV_SAFE_TESTING_PROTOCOL.md](V2_DV_SAFE_TESTING_PROTOCOL.md)

---

## Purpose

This execution plan provides the step-by-step schedule, logistics, and resource
requirements for conducting the DV-safe mode testing defined in the
[DV-Safe Testing Protocol](V2_DV_SAFE_TESTING_PROTOCOL.md). It covers browser
matrix testing, shared device simulation, screen reader validation, data retention
checks, and evidence capture procedures.

**This plan must be completed and signed off by a qualified DV advocate before
the V2 Intake system is exposed to DV/trafficking survivors.**

---

## 1. Testing Timeline

### Phase A: Preparation (Days 1–3)

| Day | Task | Owner | Deliverable |
|-----|------|-------|-------------|
| 1 | Set up staging environment with V2 enabled | Engineering | Staging URL + admin token |
| 1 | Prepare test devices (see Section 3) | QA Engineer | Device inventory list |
| 1 | Contact DV advocate for scheduling | Program Director | Confirmed date |
| 2 | Create test user accounts (3 types) | Engineering | JWT tokens per role |
| 2 | Prepare evidence capture templates | QA Engineer | Screenshot/video template |
| 2 | Pre-test: verify DV-safe mode activates | Engineering | Activation log |
| 3 | Prepare abuser simulation checklist | DV Specialist | Checklist printed |
| 3 | Brief all testers on protocol | QA Lead | Briefing notes signed |

### Phase B: Browser Matrix Testing (Days 4–5)

| Day | Browsers | Tester | Duration |
|-----|----------|--------|----------|
| 4 (AM) | Chrome (Windows), Firefox (Windows), Edge (Windows) | QA Engineer 1 | 3 hours |
| 4 (PM) | Chrome (macOS), Firefox (macOS), Safari (macOS) | QA Engineer 2 | 3 hours |
| 5 (AM) | Chrome (Android), Samsung Internet (Android) | QA Engineer 1 | 2 hours |
| 5 (PM) | Safari (iOS) | QA Engineer 2 | 1 hour |
| 5 (PM) | Re-test any failures from Day 4 | QA Engineer 1 | 2 hours |

### Phase C: Shared Device & Abuser Simulation (Day 6)

| Time | Test | Tester | Duration |
|------|------|--------|----------|
| AM | Library/public computer simulation | QA Engineer | 2 hours |
| AM | Shared home computer simulation | QA Engineer | 2 hours |
| PM | Abuser scenario simulation | DV Specialist + QA | 2 hours |

### Phase D: Screen Reader Testing (Day 7)

| Time | Screen Reader | Platform | Tester | Duration |
|------|--------------|----------|--------|----------|
| AM | NVDA | Windows | Accessibility Tester | 2 hours |
| AM | VoiceOver | macOS | Accessibility Tester | 2 hours |
| PM | TalkBack | Android | Accessibility Tester | 2 hours |
| PM | VoiceOver | iOS | Accessibility Tester | 1 hour |

### Phase E: Data Verification & Advocate Review (Days 8–9)

| Day | Task | Owner | Duration |
|-----|------|-------|----------|
| 8 | Data persistence verification (before/after panic) | QA Engineer | 3 hours |
| 8 | Audit log review | Engineering | 2 hours |
| 8 | Compile evidence pack | QA Lead | 2 hours |
| 9 | DV advocate review of all evidence | DV Advocate | 4 hours |
| 9 | Sign-off decision | DV Advocate | 1 hour |

### Phase F: Remediation (Days 10–12, if needed)

| Task | Owner | Duration |
|------|-------|----------|
| Fix any issues identified by advocate | Engineering | 1–3 days |
| Re-test fixed items | QA Engineer | 1 day |
| Advocate re-review | DV Advocate | 2 hours |
| Final sign-off | DV Advocate | 30 min |

---

## 2. Required Personnel

| Role | Person | Availability Needed | Qualification |
|------|--------|-------------------|---------------|
| QA Engineer 1 | [TBD] | Days 4–8 (full days) | Browser testing experience |
| QA Engineer 2 | [TBD] | Days 4–5 (full days) | macOS/iOS testing experience |
| DV Specialist | [TBD] | Day 6 PM, Day 9 | Staff DV advocate (current) |
| DV Advocate Reviewer | [TBD] | Day 9 (4–5 hours) | See qualification requirements below |
| Accessibility Tester | [TBD] | Day 7 (full day) | Screen reader proficiency |
| Engineering Lead | [TBD] | Days 1–2, Day 8 | Server/environment setup |
| QA Lead | [TBD] | Days 3, 8 | Evidence compilation, coordination |

### DV Advocate Reviewer Qualifications

The advocate reviewer must meet **at least one** of:
- Certified DV advocate (state or national certification)
- Staff member at a NDVH-affiliated shelter or agency
- NNEDV Safety Net trained professional
- Licensed social worker with DV specialization (LCSW or equivalent)

---

## 3. Device & Software Inventory

### Required Devices

| # | Device | OS | Browsers to Test | Status |
|---|--------|----|-----------------|--------|
| 1 | Windows 10/11 PC | Windows | Chrome, Firefox, Edge | ☐ Available |
| 2 | MacBook (macOS) | macOS 13+ | Chrome, Firefox, Safari | ☐ Available |
| 3 | Android phone | Android 12+ | Chrome, Samsung Internet | ☐ Available |
| 4 | iPhone | iOS 16+ | Safari | ☐ Available |
| 5 | Public-simulation PC | Windows | Chrome (clean profile) | ☐ Available |

### Required Software

| Software | Purpose | Device |
|----------|---------|--------|
| NVDA (latest) | Screen reader testing | Windows PC |
| Chrome DevTools | Inspect storage, network | All desktops |
| OBS Studio or similar | Screen recording | All desktops |
| Browser Developer Tools | Clear profiles, inspect history | All |

### Clean Profile Setup

Before each browser test:

```
1. Create a new browser profile (or use Incognito/InPrivate)
2. Clear all browsing data
3. Disable password manager (or verify it doesn't prompt)
4. Set autocomplete to "off" in browser settings
5. Verify: no previous intake URLs in address bar suggestions
```

---

## 4. Browser Matrix Testing Procedure

For each browser in the matrix, execute these steps from the
[DV-Safe Testing Protocol](V2_DV_SAFE_TESTING_PROTOCOL.md) §1:

### Per-Browser Checklist (16 items)

| # | Test | Action | Expected Result | Pass/Fail |
|---|------|--------|----------------|-----------|
| 1 | Navigate to intake | Open V2 intake URL | Form loads | ☐ |
| 2 | Enable DV-safe mode | Set `consent_dv_safe_mode: true` | Mode activates | ☐ |
| 3 | Panic button visible | Look for Quick Exit button | Fixed position, always visible | ☐ |
| 4 | Click panic button | Click the button | Redirects to weather.gov | ☐ |
| 5 | Back button blocked | Press browser Back | Does NOT return to intake | ☐ |
| 6 | History clean | Check browser history | No intake URLs | ☐ |
| 7 | Tab title clean | Check during redirect | No intake text in title | ☐ |
| 8 | Escape key works | Press Escape | Same redirect as panic button | ☐ |
| 9 | Redirect speed | Measure time | < 500ms | ☐ |
| 10 | Address bar clean | Check after redirect | No intake URL | ☐ |
| 11 | URL suggestions clean | Type "care" or "intake" | No suggestions | ☐ |
| 12 | sessionStorage clear | DevTools > Application > Storage | No intake keys | ☐ |
| 13 | localStorage clear | DevTools > Application > Storage | No intake keys | ☐ |
| 14 | history.replaceState | DevTools > Console | Entry replaced | ☐ |
| 15 | Multiple rapid clicks | Click panic 5 times quickly | Single redirect, no errors | ☐ |
| 16 | Panic during save | Trigger panic while saving | Redirect, no error | ☐ |

### Evidence Capture Per Browser

For each browser, capture:

1. **Screenshot**: Panic button visible on intake form
2. **Screenshot**: Weather.gov after panic redirect
3. **Screenshot**: Browser history showing no intake URLs
4. **Screenshot**: DevTools storage showing cleared data
5. **Screen recording** (optional): Full test sequence

### File Naming Convention

```
evidence/
  dv-test-{date}/
    browser-matrix/
      chrome-windows-{date}-panic-button.png
      chrome-windows-{date}-redirect.png
      chrome-windows-{date}-history-clean.png
      chrome-windows-{date}-storage-clear.png
      chrome-windows-{date}-results.md
      firefox-windows-{date}-...
      safari-ios-{date}-...
```

---

## 5. Shared Device Simulation Procedure

### Test 5A: Library / Public Computer

| Step | Action | Verify | ☐ |
|------|--------|--------|---|
| 1 | Use clean browser profile | No existing data | ☐ |
| 2 | Navigate to V2 intake | Form loads | ☐ |
| 3 | Enable DV-safe mode | Quick Exit appears | ☐ |
| 4 | Fill in 3+ modules of intake | Data entered | ☐ |
| 5 | Trigger panic button | Redirected to weather.gov | ☐ |
| 6 | Close browser completely | Browser closed | ☐ |
| 7 | Reopen browser | Fresh session | ☐ |
| 8 | Check "Recently Closed Tabs" | No intake tabs | ☐ |
| 9 | Check autofill suggestions | No intake data | ☐ |
| 10 | Check localStorage | No intake keys | ☐ |
| 11 | Check sessionStorage | Empty | ☐ |
| 12 | Verify no draft saved | No draft in DB for DV-safe session | ☐ |

### Test 5B: Shared Home Computer

| Step | Action | Verify | ☐ |
|------|--------|--------|---|
| 1 | Use browser with existing profile | Normal browsing history exists | ☐ |
| 2 | Complete full intake with DV-safe | Session completed | ☐ |
| 3 | Trigger panic button | Redirected | ☐ |
| 4 | Switch to another user perspective | "Another person" checks | ☐ |
| 5 | Check shared browser history | No intake URLs | ☐ |
| 6 | Check cookies | No identifiable intake cookies | ☐ |
| 7 | Check downloads | No intake-related downloads | ☐ |
| 8 | Check cached images/assets | No intake assets cached | ☐ |

### Test 5C: Abuser Scenario

**IMPORTANT**: This test must be conducted with a DV Specialist present.

| Step | Action | Check | ☐ |
|------|--------|-------|---|
| 1 | Assume abuser perspective | Checking survivor's device | ☐ |
| 2 | Open browser history | No intake URLs found | ☐ |
| 3 | Type "care" in address bar | No intake suggestions | ☐ |
| 4 | Type "intake" in address bar | No intake suggestions | ☐ |
| 5 | Check "Recently Visited" | No intake entries | ☐ |
| 6 | Check form autofill | No intake field values | ☐ |
| 7 | Check downloads | No intake downloads | ☐ |
| 8 | Check cookies list | No identifiable cookies | ☐ |
| 9 | Check browser bookmarks | No intake bookmarks | ☐ |
| 10 | Overall assessment | **No trace of intake use** | ☐ |

---

## 6. Screen Reader Validation Procedure

### Per Screen Reader (8 items)

| # | Test | Expected | NVDA | VoiceOver | TalkBack |
|---|------|----------|------|-----------|----------|
| 1 | Panic button announced | "Quick Exit, button" | ☐ | ☐ | ☐ |
| 2 | Tab to panic button | Focus achieved | ☐ | ☐ | ☐ |
| 3 | Escape key with SR active | Redirect triggers | ☐ | ☐ | ☐ |
| 4 | No SR/Escape conflict | Escape not consumed by SR | ☐ | ☐ | ☐ |
| 5 | DV fields not announced loudly | Neutral labels used | ☐ | ☐ | ☐ |
| 6 | Error messages neutral | No DV terminology in aria | ☐ | ☐ | ☐ |
| 7 | Redacted values handled | "[REDACTED]" read | ☐ | ☐ | ☐ |
| 8 | Panic redirect time with SR | < 1 second | ☐ | ☐ | ☐ |

### Screen Reader Escape Key Note

Some screen readers intercept Escape for their own navigation. If Escape
conflict is detected:

1. Document the specific SR version and behavior
2. Verify Enter/Space on focused panic button still works
3. Document this as a known limitation with workaround
4. Ensure the workaround is included in user-facing help text

---

## 7. Data Retention Verification

### Before Panic (DV-Safe Mode Active)

| # | Check | How to Verify | Expected | ☐ |
|---|-------|--------------|----------|---|
| 1 | Draft saving disabled | Check localStorage for draft key | No key present | ☐ |
| 2 | Server session saved | Query DB for session ID | Record exists | ☐ |
| 3 | Session marked DV-safe | Check `dvSafeMode` field in DB | `true` | ☐ |
| 4 | No client-side DV data | Check all browser storage | No sensitive data | ☐ |

### After Panic

| # | Check | How to Verify | Expected | ☐ |
|---|-------|--------------|----------|---|
| 1 | sessionStorage empty | DevTools > Application | All keys cleared | ☐ |
| 2 | localStorage clean | DevTools > Application | No intake keys | ☐ |
| 3 | Server session retained | Query DB | Record still exists | ☐ |
| 4 | Session resumable | API call with session ID | Data accessible | ☐ |

### After Completion (DV-Safe Mode)

| # | Check | How to Verify | Expected | ☐ |
|---|-------|--------------|----------|---|
| 1 | Explainability: DV redacted | Check response JSON | `[REDACTED]` for DV signals | ☐ |
| 2 | HMIS: FirstName null | Check HMIS export | `null` | ☐ |
| 3 | HMIS: LastName null | Check HMIS export | `null` | ☐ |
| 4 | HMIS: LivingSituation null | Check HMIS export | `null` | ☐ |
| 5 | Action plan has DV resources | Check action plan | Hotline + safety plan present | ☐ |
| 6 | Audit trail recorded | Query audit events | DV-safe session logged | ☐ |

---

## 8. Evidence Capture & Documentation

### Required Evidence Artifacts

| Artifact | Format | Quantity |
|----------|--------|----------|
| Browser matrix results | Markdown table per browser | 9 browsers |
| Panic button screenshots | PNG | 2 per browser (before + after) |
| Storage clearance screenshots | PNG | 1 per browser |
| History verification screenshots | PNG | 1 per browser |
| Shared device simulation log | Markdown | 3 scenarios |
| Abuser simulation sign-off | Signed checklist | 1 |
| Screen reader test results | Markdown table | 3 screen readers |
| Data retention results | Markdown table | 3 states |
| Audit log query results | JSON | 1 |
| DV advocate sign-off form | Signed document | 1 |

### Evidence Pack Structure

```
docs/V2_DV_TESTING_EVIDENCE_YYYY-MM-DD/
├── README.md                    (summary + sign-off status)
├── browser-matrix/
│   ├── chrome-windows.md
│   ├── firefox-windows.md
│   ├── edge-windows.md
│   ├── chrome-macos.md
│   ├── firefox-macos.md
│   ├── safari-macos.md
│   ├── chrome-android.md
│   ├── samsung-android.md
│   └── safari-ios.md
├── shared-device/
│   ├── library-simulation.md
│   ├── home-simulation.md
│   └── abuser-simulation.md
├── screen-readers/
│   ├── nvda-results.md
│   ├── voiceover-results.md
│   └── talkback-results.md
├── data-retention/
│   ├── before-panic.md
│   ├── after-panic.md
│   └── after-completion.md
├── audit-log/
│   └── audit-events.json
├── screenshots/
│   └── (all captured images)
└── sign-off/
    └── dv-advocate-sign-off.pdf
```

---

## 9. Sign-Off Process

### Step 1: Compile Results

QA Lead compiles all evidence into the evidence pack structure above.

### Step 2: Advocate Review Meeting

| Duration | 4–5 hours |
|----------|-----------|
| Attendees | DV Advocate Reviewer, QA Lead, DV Specialist, Engineering Lead |
| Materials | Complete evidence pack, access to staging environment |

### Agenda

| Time | Topic |
|------|-------|
| 0:00–0:30 | Overview of DV-safe mode features |
| 0:30–1:30 | Review browser matrix results |
| 1:30–2:30 | Review shared device & abuser simulation |
| 2:30–3:00 | Review screen reader results |
| 3:00–3:30 | Live demonstration on staging |
| 3:30–4:00 | Advocate questions & concerns |
| 4:00–4:30 | Sign-off decision |

### Step 3: Sign-Off Decision

The advocate marks one of:

- **APPROVED** — All tests pass, no safety concerns. Production deployment may proceed.
- **CONDITIONAL** — Minor issues found. List specific items that must be fixed.
  Re-testing required before launch.
- **REJECTED** — Safety concerns that could endanger survivors. System must NOT
  launch until all concerns are resolved and full re-test is completed.

### Step 4: Document Decision

Use the sign-off form from [DV-Safe Testing Protocol](V2_DV_SAFE_TESTING_PROTOCOL.md) §7.

---

## 10. Known Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Safari history.replaceState incomplete | Medium | High | Test with 3+ nav steps; document limitation |
| Chrome Android tab preview thumbnail | Low | High | Verify thumbnail clears; add to known issues |
| Screen reader Escape conflict | Medium | Medium | Ensure Enter/Space alternative works |
| Password manager prompts | Low | Medium | Verify autocomplete="off" on all DV fields |
| Autofill caching | Low | High | Clear form fields programmatically on panic |
| Device shared with abuser | Always | Critical | Test 5C must pass with DV Specialist present |

---

## 11. Scheduling Recommendations

| Factor | Recommendation |
|--------|---------------|
| **Total Duration** | 9–12 business days (including remediation buffer) |
| **DV Advocate Availability** | Schedule 2+ weeks in advance |
| **Timing** | After calibration session, before production deployment |
| **Prerequisites** | V2 must be deployed and enabled on staging |
| **Budget** | DV advocate reviewer time (4–5 hours), QA time (5 full days) |
| **Blocker for Production** | Yes — sign-off is required before DV survivors access V2 |

### Suggested Scheduling Steps

1. Identify DV advocate reviewer (see qualifications in Section 2)
2. Coordinate with QA team availability (5 days consecutive preferred)
3. Ensure staging environment is stable
4. Book advocate review day (Day 9) first, work backward
5. Send advance materials 1 week before testing begins:
   - This execution plan
   - DV-Safe Testing Protocol
   - Staging URL and credentials
   - Feature inventory (Protocol Appendix A)

---

## Guardrails Compliance

| Guardrail | Status |
|-----------|--------|
| No scoring changes | ✅ — Execution plan only, no code changes |
| No UI changes | ✅ |
| No V1 changes | ✅ |
| No AI calls | ✅ |
| No new endpoints | ✅ |
| No migration changes | ✅ |

---

*DV Advocate Testing Execution Plan — V2 Intake Phase 5*
*Authored: 2026-02-18*
