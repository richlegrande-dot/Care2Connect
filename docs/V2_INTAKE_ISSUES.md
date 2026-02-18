# V2 Intake — Remaining Work & Issues

> Generated from Phase 5 of the V2 Intake scaffold.
> Branch: `v2-intake-scaffold`

---

## P0 — Must-Have Before Beta

### ~~1. Prisma-backed Session Persistence~~ ✅ COMPLETED
**Resolved in**: Phase 2 Hardening (P0-1)
**Solution**: Added `V2IntakeSession` model to schema.prisma with full session state,
rewrote all 6 route endpoints to use `prisma.v2IntakeSession.*` CRUD.

### ~~2. Run Prisma Migration~~ ✅ COMPLETED
**Resolved**: `npx prisma db push` applied — `v2_intake_sessions` table created in DB.

### ~~3. Form Validation Hardening~~ ✅ COMPLETED
**Resolved in**: Phase 2 Hardening (continued)
**Solution**: Enhanced `validateModuleData()` in `default-intake-form.ts` with comprehensive
JSON Schema-style validation: type checking, enum constraints, string length bounds,
pattern/format validation (date, email, phone, zip), numeric range validation, array
item validation with maxItems, x-show-if conditional visibility, unknown field detection.
39 new tests in `validation.test.ts`.

### ~~4. Authentication / Authorization Wiring~~ ✅ COMPLETED
**Resolved in**: Phase 2 Hardening (Phase 2B)
**Solution**: Created `v2Auth.ts` middleware with JWT Bearer token auth, staged rollout
via `ENABLE_V2_INTAKE_AUTH` env var, ownership guard. Wired into session endpoints.

---

## P1 — Important for Production Readiness

### 5. Scoring Engine Refinement
**Current**: Point values are first-pass estimates based on SPDAT V4.01 mapping
**Target**: Review with clinical/CE stakeholders; adjust weights per local CoC priorities
**Files**: `backend/src/intake/v2/scoring/computeScores.ts`, `backend/src/intake/v2/constants.ts`
**Notes**: The POLICY_PACK_VERSION should be bumped when point values change. Scoring is fully deterministic so regression tests in `tests/intake_v2/scoring.test.ts` will catch unintended changes.

### ~~6. Task Library Expansion~~ ✅ COMPLETED
**Resolved in**: P1#6 implementation
**Solution**: Expanded task library from 25 to 52 templates. Added 27 new tasks covering:
trafficking-specific shelter, hotel/motel vouchers, protective order assistance, detox services,
crisis navigator warm handoff, transitional housing, utility assistance (LIHEAP), immigration
legal aid, Social Security screening, disability services, clothing/hygiene supplies, Lifeline
phone, ongoing mental health treatment, peer support, mailing address service, McKinney-Vento
school enrollment, comprehensive DV safety planning, Section 8 waitlist, relocation assistance,
family reunification, parenting support, senior services, youth aging-out services, housing
discrimination legal, matched savings (IDA), long-term recovery support, DV counseling,
workforce development (WIOA), and primary care medical home.
35 new tests in `expandedTasks.test.ts`.

### ~~7. HMIS / Coordinated Entry Export~~ ✅ COMPLETED
**Resolved in**: P1#7 implementation
**Solution**: Created `backend/src/intake/v2/exports/hmisExport.ts` with full HUD CSV 2024
field mapping (9 data elements). Functions: `buildHMISRecord()`, `buildHMISExport()`,
`hmisToCSV()`. DV-safe mode nullifies FirstName, LastName, and LivingSituation.
Added routes: `GET /export/hmis/:sessionId` (single), `GET /export/hmis` (bulk with ?since=).
Both support `?format=csv` for CSV download.
16 tests in `hmisExport.test.ts`.

### ~~8. Fairness & Audit Monitoring~~ ✅ COMPLETED
**Resolved in**: P1#8 implementation
**Solution**: Created `backend/src/intake/v2/audit/fairnessMonitor.ts` with:
- Audit trail: `recordAuditEvent()`, `getAuditEvents()` with type/session/since filters
- Fairness analysis: `analyzeFairness()` and `runFullFairnessAnalysis()` computing group
  distributions by race_ethnicity, gender, veteran_status with mean/median scores,
  tier distributions, and bias detection (>10 point deviation threshold).
Added route: `GET /audit/fairness` with optional `?dimension=` and `?since=` params.
19 tests in `fairnessMonitor.test.ts`.

---

## P2 — Quality & Polish

### ~~9. Frontend Accessibility Audit~~ ✅ COMPLETED
**Resolved in**: P2#9 implementation
**Solution**: Added WCAG 2.1 AA ARIA attributes throughout:
- `WizardModule.tsx`: `aria-required`, `aria-invalid`, `aria-describedby` on all form fields;
  error messages with `role="alert"`; `aria-hidden="true"` on decorative asterisks; `aria-label`
  on navigation buttons; `aria-busy` on submit; form-level `aria-label`; screen reader error
  announcement via `role="alert"` live region.
- `WizardProgress.tsx`: `aria-live="polite"` region for step changes; `role="progressbar"` on
  progress bar; `aria-current="step"` on current step; `aria-label` on step indicators;
  `role="navigation"` on step nav.
- `WizardResults.tsx`: `role="main"` with label; `aria-live="polite"` results announcement;
  `role="progressbar"` on score dimension bars with `aria-valuenow`/`aria-valuemin`/`aria-valuemax`.

### 10. DV-Safe Mode UX Testing
**Current**: QuickExitButton implemented; DV-safe auto-activation on consent/safety triggers
**Target**: User testing with DV advocates; verify panic button behavior across browsers; test history replacement
**Files**: `frontend/app/onboarding/v2/components/QuickExitButton.tsx`, `frontend/app/onboarding/v2/page.tsx`
**Notes**: Edge case: `replaceState` may not clear all back-button history in Safari. Need browser matrix testing.

### 11. Localization / i18n
**Current**: All text is English-only
**Target**: Externalize all user-facing strings; support Spanish as first additional language
**Files**: All frontend components; `backend/src/intake/v2/forms/default-intake-form.ts` (module titles/descriptions)
**Notes**: The JSON Schema `title` and `description` fields should become locale keys.

### ~~12. Frontend Error Handling & Offline Mode~~ ✅ COMPLETED
**Resolved in**: P2#12 implementation
**Solution**: Added to `page.tsx`:
- `fetchWithRetry()` — automatic retry with exponential backoff (3 retries, 1s base delay)
- localStorage draft saving — auto-saves form progress on every step, 24h expiry
- Draft recovery banner — "Continue where you left off" or "Start New" on page load
- `clearDraft()` on successful completion
- DV-safe mode protection — no drafts saved when dvSafeMode is active
- Dismissable error alerts with retry capability

### ~~13. Loading & Progress UX~~ ✅ COMPLETED
**Resolved in**: P2#13 implementation
**Solution**: Added to `page.tsx`:
- `SkeletonLoader` component — animated skeleton UI matching form layout
- `SaveToast` component — "Progress saved" confirmation toast (2s auto-dismiss)
- `DraftRecoveryBanner` component — restore/discard previous draft
- Skeleton loader replaces simple spinner during schema fetch

---

## P3 — Future Enhancements

### 14. Policy Pack Versioning UI
**Current**: Version string stored in constants; explainability card includes version
**Target**: Admin UI to compare scoring outcomes across policy pack versions; A/B testing framework
**Notes**: See `docs/V2_INTK_SPEC.md` Section 12

### 15. Navigator / Case Manager Dashboard
**Current**: No navigator-facing UI
**Target**: Dashboard showing intake queue, priority sorting, bulk actions, case notes
**Notes**: This is a significant new feature area, depends on auth roles being established

### 16. Paper/Kiosk Mode
**Current**: Web-only wizard
**Target**: Print-friendly intake form; kiosk mode with larger touch targets and simplified flow
**Notes**: See `docs/V2_INTK_SPEC.md` Open Questions

### 17. Multi-Session Reassessment
**Current**: One-shot intake
**Target**: Allow re-intake at 30/60/90 day intervals; track stability level trajectory over time
**Notes**: Requires `reassessment_of` FK on `intake_responses` table

---

## File Index

| File | Status | Purpose |
|------|--------|---------|
| `docs/V2_INTK_SPEC.md` | ✅ Complete | Full specification document |
| `backend/src/intake/v2/constants.ts` | ✅ Complete | Constants, types, thresholds |
| `backend/src/intake/v2/index.ts` | ✅ Complete | Barrel exports (incl. HMIS + audit) |
| `backend/src/intake/v2/forms/default-intake-form.ts` | ✅ Hardened | Module schemas + comprehensive validation |
| `backend/src/intake/v2/scoring/computeScores.ts` | ✅ Complete | 4-dimension scoring engine |
| `backend/src/intake/v2/explainability/buildExplanation.ts` | ✅ Complete | Explainability card builder |
| `backend/src/intake/v2/action_plans/generatePlan.ts` | ✅ Expanded | Deterministic task library (52 tasks) |
| `backend/src/intake/v2/exports/hmisExport.ts` | ✅ Complete | HMIS CSV 2024 export |
| `backend/src/intake/v2/audit/fairnessMonitor.ts` | ✅ Complete | Audit trail + fairness monitoring |
| `backend/src/intake/v2/routes/intakeV2.ts` | ✅ Complete | API routes (10 endpoints + health + panic) |
| `backend/prisma/migrations/20260218_v2_intake_tables/migration.sql` | ⚠️ Not applied | Migration SQL |
| `frontend/app/onboarding/v2/page.tsx` | ✅ Enhanced | Wizard page + offline mode + skeleton loaders |
| `frontend/app/onboarding/v2/types.ts` | ✅ Complete | Shared TypeScript types |
| `frontend/app/onboarding/v2/components/WizardProgress.tsx` | ✅ Accessible | Step indicator + ARIA |
| `frontend/app/onboarding/v2/components/WizardModule.tsx` | ✅ Accessible | Dynamic form renderer + ARIA |
| `frontend/app/onboarding/v2/components/WizardResults.tsx` | ✅ Accessible | Results display + ARIA |
| `frontend/app/onboarding/v2/components/QuickExitButton.tsx` | ✅ Complete | DV-safe panic button |
| `backend/tests/intake_v2/scoring.test.ts` | ✅ 12/12 pass | Scoring engine tests |
| `backend/tests/intake_v2/explainability.test.ts` | ✅ 4/4 pass | Explainability tests |
| `backend/tests/intake_v2/actionPlan.test.ts` | ✅ 13/13 pass | Action plan tests |
| `backend/tests/intake_v2/policyPack.test.ts` | ✅ 29/29 pass | Policy pack tests |
| `backend/tests/intake_v2/validation.test.ts` | ✅ 39/39 pass | Validation tests |
| `backend/tests/intake_v2/expandedTasks.test.ts` | ✅ 35/35 pass | Expanded task library tests |
| `backend/tests/intake_v2/hmisExport.test.ts` | ✅ 16/16 pass | HMIS export tests |
| `backend/tests/intake_v2/fairnessMonitor.test.ts` | ✅ 19/19 pass | Fairness monitoring tests |
| `backend/scripts/run_v2_intake_local.ts` | ✅ Complete | Manual test harness |
