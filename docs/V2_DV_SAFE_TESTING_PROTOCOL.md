# V2 Intake — DV-Safe Mode Testing Protocol

> **Version**: 1.0
> **Last Updated**: February 18, 2026
> **Applies To**: V2 Intake DV-Safe Mode features
> **Status**: Active — must be completed before user-facing deployment
> **Safety Classification**: HIGH — errors in DV-safe mode may endanger survivors

---

## Purpose

This document defines the formal testing protocol for DV-safe mode features in the
V2 Intake system. DV-safe mode is a safety-critical feature designed to protect
domestic violence and trafficking survivors from being discovered by abusers while
using the intake form.

**This is not engineering testing — this is safety governance.**

Failures in DV-safe mode can have life-threatening consequences. Every item in this
protocol must be verified by qualified personnel before the system is exposed to
DV survivors.

---

## 1. Browser Matrix Testing Steps

### Required Browser Matrix

| Browser | Version | Platform | Tester | Result | Date |
|---------|---------|----------|--------|--------|------|
| Chrome | Latest | Windows 10/11 | | ☐ | |
| Chrome | Latest | macOS | | ☐ | |
| Chrome | Latest | Android | | ☐ | |
| Firefox | Latest | Windows 10/11 | | ☐ | |
| Firefox | Latest | macOS | | ☐ | |
| Safari | Latest | macOS | | ☐ | |
| Safari | Latest | iOS | | ☐ | |
| Edge | Latest | Windows 10/11 | | ☐ | |
| Samsung Internet | Latest | Android | | ☐ | |

### Per-Browser Test Steps

For each browser in the matrix:

1. **Navigate to intake form** — Open the V2 intake wizard
2. **Enable DV-safe mode** — Set `consent_dv_safe_mode: true` in the consent module
3. **Verify panic button visible** — Confirm the Quick Exit button is rendered
4. **Click panic button** — Verify:
   - [ ] Browser redirects to `weather.gov` (or configured safe URL)
   - [ ] Browser back button does NOT return to the intake form
   - [ ] No intake-related content visible in browser history
   - [ ] No intake-related content visible in the tab title during redirect
5. **Test Escape key** — Press Escape key:
   - [ ] Same behavior as clicking the panic button
   - [ ] Redirect occurs within < 500ms
6. **Check address bar** — After redirect:
   - [ ] No intake URL visible in the address bar
   - [ ] No intake URL in browser suggestions when typing
7. **Check browser history** — Open browser history:
   - [ ] No intake URLs listed
   - [ ] `history.replaceState()` has replaced the entry

### Known Browser-Specific Risks

| Browser | Risk | Mitigation |
|---------|------|-----------|
| Safari (iOS) | `replaceState` may not clear all back-button entries | Test with 3+ navigation steps before panic |
| Chrome (Android) | Tab switcher may show page preview thumbnail | Verify thumbnail clears on redirect |
| Firefox | Password manager may prompt to save form data | Verify no prompts appear for DV forms |
| All | Autocomplete may cache field values | Verify `autocomplete="off"` on all DV-sensitive fields |

---

## 2. Shared-Device Simulation Steps

DV survivors often use shared or public computers. These tests simulate those conditions.

### Library / Public Computer Simulation

1. **Setup**: Use a clean browser profile (no saved data)
2. **Complete partial intake** with DV-safe mode enabled
3. **Trigger panic button**
4. **Close browser completely**
5. **Reopen browser**
6. **Verify**:
   - [ ] No intake URLs in "Recently Closed Tabs"
   - [ ] No intake data in browser autofill suggestions
   - [ ] No intake data in localStorage (should be cleared)
   - [ ] No intake data in sessionStorage (should be cleared)
   - [ ] No draft saved (DV-safe mode disables draft saving)

### Shared Home Computer Simulation

1. **Setup**: Use a browser with existing profile (normal browsing history)
2. **Complete full intake** with DV-safe mode enabled
3. **Trigger panic button**
4. **Switch to another user account on the device** (or simulate)
5. **Check for traces**:
   - [ ] No intake data in shared browser history
   - [ ] No intake-related cookies
   - [ ] No intake-related entries in browser download history
   - [ ] No cached images or assets that reveal intake usage

### Abuser Scenario Simulation

1. **Assume the perspective of an abuser** checking a survivor's device
2. **Check**:
   - [ ] Browser history — no intake URLs
   - [ ] Browser suggestions — typing "care" or "intake" shows nothing
   - [ ] Recently visited — no intake-related entries
   - [ ] Form autofill — no intake field values stored
   - [ ] Downloads — no intake-related downloads
   - [ ] Cookies — no identifiable intake cookies persisted

---

## 3. Panic Button Validation Checklist

| # | Test | Expected | Result |
|---|------|----------|--------|
| 1 | Panic button visible when DV-safe mode enabled | Always visible, fixed position | ☐ |
| 2 | Panic button NOT visible when DV-safe mode disabled | Not rendered | ☐ |
| 3 | Click triggers immediate redirect | < 500ms to weather.gov | ☐ |
| 4 | Escape key triggers same redirect | < 500ms to weather.gov | ☐ |
| 5 | sessionStorage cleared on panic | All intake keys removed | ☐ |
| 6 | localStorage cleared on panic | All intake keys removed | ☐ |
| 7 | history.replaceState called | Intake URL replaced in history | ☐ |
| 8 | Back button after panic | Does NOT return to intake | ☐ |
| 9 | Panic works during module 1 (consent) | Yes | ☐ |
| 10 | Panic works during module 4 (safety) | Yes | ☐ |
| 11 | Panic works during module 8 (goals) | Yes | ☐ |
| 12 | Panic works on results page | Yes | ☐ |
| 13 | Panic works while saving is in progress | Yes, no error | ☐ |
| 14 | Multiple rapid clicks do not cause errors | Single redirect | ☐ |
| 15 | Button has accessible label | `aria-label` present | ☐ |
| 16 | Button label is neutral (doesn't say "DV") | Neutral text like "Quick Exit" | ☐ |

---

## 4. Screen Reader Accessibility Test Steps

DV survivors with disabilities must be able to use the panic button effectively.

### Setup
- NVDA (Windows), VoiceOver (macOS/iOS), TalkBack (Android)

### Test Steps (per screen reader)

| # | Test | Expected | NVDA | VO | TB |
|---|------|----------|------|----|----|
| 1 | Panic button is announced | "Quick Exit, button" | ☐ | ☐ | ☐ |
| 2 | Panic button accessible via Tab | Focused with Tab key | ☐ | ☐ | ☐ |
| 3 | Escape key works with screen reader active | Redirect triggers | ☐ | ☐ | ☐ |
| 4 | No conflict with screen reader Escape handling | Escape is not consumed by SR | ☐ | ☐ | ☐ |
| 5 | DV-sensitive fields not auto-announced loudly | Not read aloud in a way that could be overheard | ☐ | ☐ | ☐ |
| 6 | Error messages for safety module use neutral language | No specific DV terminology in aria-live | ☐ | ☐ | ☐ |
| 7 | Results page: redacted values not announced | "[REDACTED]" or neutral placeholder | ☐ | ☐ | ☐ |
| 8 | Time from panic trigger to redirect (with SR active) | < 1 second | ☐ | ☐ | ☐ |

### Critical Screen Reader Considerations

- **Escape key conflict**: Some screen readers use Escape to exit forms or virtual
  cursor mode. The panic button must work even when the screen reader intercepts
  Escape for its own purposes. Alternative: ensure the button has focus and Enter/Space
  also triggers the panic flow.
- **Audio leakage**: If a screen reader announces "Domestic violence hotline" or
  "Fleeing DV" aloud, this could be overheard by an abuser. Verify that all
  DV-sensitive content uses neutral labels in `aria-label` attributes.

---

## 5. Data Persistence Verification Steps

### Before Panic (DV-Safe Mode Active)

| # | Check | Expected | Result |
|---|-------|----------|--------|
| 1 | Draft saving disabled | No localStorage draft key | ☐ |
| 2 | Server session saved normally | Data in PostgreSQL | ☐ |
| 3 | Session marked as DV-safe | `dvSafeMode: true` in DB | ☐ |
| 4 | No client-side cache of DV fields | No sensitive data in browser storage | ☐ |

### After Panic

| # | Check | Expected | Result |
|---|-------|----------|--------|
| 1 | sessionStorage is empty | All keys cleared | ☐ |
| 2 | localStorage has no intake keys | Draft key absent | ☐ |
| 3 | Server session retains data | Session still in DB (not deleted) | ☐ |
| 4 | Server session can be resumed | Navigator can access via API | ☐ |

### After Intake Completion (DV-Safe Mode)

| # | Check | Expected | Result |
|---|-------|----------|--------|
| 1 | Explainability card: DV values redacted | `[REDACTED]` for sensitive signals | ☐ |
| 2 | HMIS export: FirstName nullified | `null` | ☐ |
| 3 | HMIS export: LastName nullified | `null` | ☐ |
| 4 | HMIS export: LivingSituation nullified | `null` | ☐ |
| 5 | Action plan still includes DV resources | DV hotline, safety plan present | ☐ |
| 6 | Audit trail records DV-safe session | Audit event logged | ☐ |

---

## 6. Post-Test Audit Log Review

After completing all tests, review the system audit trail:

### Audit Verification Steps

1. **Query audit events** for the test period:
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     "https://staging.example.com/api/v2/intake/audit/fairness?since=TEST_START_DATE"
   ```

2. **Verify**:
   - [ ] All DV-safe test sessions are recorded
   - [ ] No PII leaked in audit event data
   - [ ] Audit events do not contain raw DV status values
   - [ ] Audit timestamps are accurate
   - [ ] Session IDs in audit match test session IDs

3. **Data retention check**:
   - [ ] Audit events can be queried by date range
   - [ ] Audit events can be filtered by session ID
   - [ ] No orphaned audit records

---

## 7. Required Advocate Sign-Off Format

Testing must be reviewed and signed off by a qualified DV advocate before the system
is exposed to survivors.

```
╔══════════════════════════════════════════════════════════╗
║         DV-SAFE MODE TESTING SIGN-OFF                   ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  System: V2 Intake — Care2Connect                       ║
║  Date: [Date]                                           ║
║  Testing Period: [Start Date] — [End Date]              ║
║                                                          ║
║  Browser Matrix:                                        ║
║    [X/Y] browsers tested and passed                     ║
║                                                          ║
║  Shared Device Tests:                                   ║
║    Library simulation:  PASS / FAIL                     ║
║    Home simulation:     PASS / FAIL                     ║
║    Abuser simulation:   PASS / FAIL                     ║
║                                                          ║
║  Panic Button:                                          ║
║    [X/16] checks passed                                 ║
║                                                          ║
║  Screen Reader:                                         ║
║    NVDA:       PASS / FAIL / NOT TESTED                 ║
║    VoiceOver:  PASS / FAIL / NOT TESTED                 ║
║    TalkBack:   PASS / FAIL / NOT TESTED                 ║
║                                                          ║
║  Data Persistence: PASS / FAIL                          ║
║  Audit Log Review: PASS / FAIL                          ║
║                                                          ║
║  Overall Assessment:                                    ║
║    [ ] APPROVED for survivor use                        ║
║    [ ] CONDITIONAL — list required fixes below          ║
║    [ ] REJECTED — safety concerns identified            ║
║                                                          ║
║  Required Fixes (if conditional):                       ║
║    1. ________________________________________          ║
║    2. ________________________________________          ║
║    3. ________________________________________          ║
║                                                          ║
║  Safety Concerns (if rejected):                         ║
║    _______________________________________________      ║
║                                                          ║
║  Advocate Reviewer:                                     ║
║    Name:         ___________________________            ║
║    Organization:  ___________________________           ║
║    Credential:    ___________________________           ║
║    Signature:     ___________________________           ║
║    Date:          ___________________________           ║
║                                                          ║
║  Technical Reviewer:                                    ║
║    Name:         ___________________________            ║
║    Signature:     ___________________________           ║
║    Date:          ___________________________           ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

### Advocate Qualifications

The advocate reviewer must meet at least one of the following:
- Certified DV advocate (state or national certification)
- Staff member at a NDVH-affiliated shelter or agency
- NNEDV Safety Net trained professional
- Licensed social worker with DV specialization (LCSW or equivalent)

### Sign-Off Requirements

- **APPROVED**: All tests pass, no safety concerns. System may be deployed.
- **CONDITIONAL**: Minor issues found that can be fixed. List specific items.
  System may not launch until fixes are verified and advocate re-reviews.
- **REJECTED**: Safety concerns that could endanger survivors. System must NOT
  be launched until all concerns are resolved and a full re-test is completed.

---

## Appendix A: DV-Safe Mode Feature Inventory

| Feature | File | Status |
|---------|------|--------|
| Quick Exit button | `QuickExitButton.tsx` | Implemented |
| Escape key handler | `QuickExitButton.tsx` | Implemented |
| history.replaceState | `QuickExitButton.tsx` | Implemented |
| sessionStorage clear | `QuickExitButton.tsx` | Implemented |
| Safe redirect (weather.gov) | `QuickExitButton.tsx` | Implemented |
| Auto-activation (consent) | `intakeV2.ts` | Implemented |
| Auto-activation (safety DV) | `intakeV2.ts` | Implemented |
| Auto-activation (safety trafficking) | `intakeV2.ts` | Implemented |
| PII redaction in explainability | `buildExplanation.ts` | Implemented |
| HMIS export nullification | `hmisExport.ts` | Implemented |
| Draft saving disabled | `page.tsx` | Implemented |

## Appendix B: NNEDV Safety Net Guidelines Reference

The implementation follows NNEDV (National Network to End Domestic Violence)
Safety Net guidelines for technology safety:
- Website visitors should be able to leave the site quickly
- History should be cleared or replaced
- No identifying information stored on the device
- Safe landing page should be an innocuous, commonly-visited site

Reference: https://www.techsafety.org

---

*End of V2 DV-Safe Mode Testing Protocol*
