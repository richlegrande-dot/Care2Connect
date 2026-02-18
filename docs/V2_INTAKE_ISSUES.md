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

### 6. Task Library Expansion
**Current**: 25 task templates covering core crisis/housing/health scenarios
**Target**: Expand to 50+ tasks, add local resource links, agency-specific referral paths
**Files**: `backend/src/intake/v2/action_plans/generatePlan.ts`
**Notes**: Each task template is a simple JSON object with trigger conditions — easy to add more without code changes.

### 7. HMIS / Coordinated Entry Export
**Current**: Export table exists (`coordinated_entry_events`) but no export logic implemented
**Target**: Implement HMIS CSV export conforming to HUD CSV Specifications 2024
**Files**: New file `backend/src/intake/v2/exports/hmisExport.ts`, route addition in `routes/intakeV2.ts`
**Notes**: See `docs/V2_INTK_SPEC.md` Section 10 for field mapping. Required fields: PersonalID, DateOfIntake, LivingSituation, etc.

### 8. Fairness & Audit Monitoring
**Current**: Scoring produces traceable contributors but no aggregate fairness checks
**Target**: Implement demographic parity monitoring (aggregate tier distributions by race, gender, age) and audit log
**Files**: New service `backend/src/intake/v2/audit/fairnessMonitor.ts`
**Notes**: See `docs/V2_INTK_SPEC.md` Section 9. Goal: detect if any demographic group is systematically scored higher/lower than expected.

---

## P2 — Quality & Polish

### 9. Frontend Accessibility Audit
**Current**: Basic semantic HTML with Tailwind styling
**Target**: Full WCAG 2.1 AA compliance — keyboard navigation, screen reader labels, focus management, color contrast
**Files**: All files in `frontend/app/onboarding/v2/components/`
**Notes**: Priority areas: WizardModule form fields need proper `aria-label` and error announcements; WizardProgress needs `aria-live` region.

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

### 12. Frontend Error Handling & Offline Mode
**Current**: Basic try/catch with error state display
**Target**: Retry logic, offline draft saving (localStorage), session recovery after browser close
**Files**: `frontend/app/onboarding/v2/page.tsx`

### 13. Loading & Progress UX
**Current**: Simple spinner during API calls
**Target**: Skeleton loaders, estimated time indicator, module-level save confirmation toasts
**Files**: `frontend/app/onboarding/v2/page.tsx`, `frontend/app/onboarding/v2/components/WizardModule.tsx`

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
| `backend/src/intake/v2/index.ts` | ✅ Complete | Barrel exports |
| `backend/src/intake/v2/forms/default-intake-form.ts` | ✅ Hardened | Module schemas + comprehensive validation |
| `backend/src/intake/v2/scoring/computeScores.ts` | ✅ Complete | 4-dimension scoring engine |
| `backend/src/intake/v2/explainability/buildExplanation.ts` | ✅ Complete | Explainability card builder |
| `backend/src/intake/v2/action_plans/generatePlan.ts` | ✅ Complete | Deterministic task library |
| `backend/src/intake/v2/routes/intakeV2.ts` | ✅ Prisma-backed | API routes (6 endpoints + health + panic) |
| `backend/prisma/migrations/20260218_v2_intake_tables/migration.sql` | ⚠️ Not applied | Migration SQL |
| `frontend/app/onboarding/v2/page.tsx` | ✅ Complete | Wizard page |
| `frontend/app/onboarding/v2/types.ts` | ✅ Complete | Shared TypeScript types |
| `frontend/app/onboarding/v2/components/WizardProgress.tsx` | ✅ Complete | Step indicator |
| `frontend/app/onboarding/v2/components/WizardModule.tsx` | ✅ Complete | Dynamic form renderer |
| `frontend/app/onboarding/v2/components/WizardResults.tsx` | ✅ Complete | Results display |
| `frontend/app/onboarding/v2/components/QuickExitButton.tsx` | ✅ Complete | DV-safe panic button |
| `backend/tests/intake_v2/scoring.test.ts` | ✅ 12/12 pass | Scoring engine tests |
| `backend/tests/intake_v2/explainability.test.ts` | ✅ 4/4 pass | Explainability tests |
| `backend/tests/intake_v2/actionPlan.test.ts` | ✅ 13/13 pass | Action plan tests |
| `backend/scripts/run_v2_intake_local.ts` | ✅ Complete | Manual test harness |
