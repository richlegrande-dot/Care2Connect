# V2 Intake — Phase 8 Status Report

> **Phase**: 8 — GA Automation & Self-Service Troubleshooting
> **Date**: February 19, 2026
> **Branch**: `v2-intake-scaffold`
> **Tests**: 195/195 passed (9 suites, --bail mode)

---

## Executive Summary

Phase 8 delivers **automation scripts and tooling** to eliminate avoidable manual
steps in the GA (General Availability) process. Seven objectives (A–G) plus
cleanup tasks have been completed, producing **18 new files** across scripts,
configurations, tests, workflows, and documentation.

No scoring constants were modified. No endpoints were added. No frontend changes.
All 195 V2 intake tests continue to pass.

---

## Completed Objectives

### A. PR Creation + CI Watch Scripts

| Deliverable | Path |
|-------------|------|
| Idempotent PR creation script | `scripts/ga/gh_create_pr.ps1` |
| CI check watcher script | `scripts/ga/gh_watch_ci.ps1` |
| PR body template | `docs/templates/PR_V2_INTAKE_GA.md` |
| Automation guide | `docs/V2_PHASE8_GH_AUTOMATION.md` |

**What it replaces**: Manual browser-based PR creation and check monitoring.

**How it works**:
- `gh_create_pr.ps1` auto-detects OWNER/REPO from `git remote`, checks for
  existing PRs (idempotent), and uses the template body. Falls back gracefully
  if labels don't exist.
- `gh_watch_ci.ps1` polls PR check status every 30s, exits non-zero immediately
  if the `V2 Intake Gate` check fails (critical check), exits 0 when all pass.

---

### B. Branch Protection Automation

| Deliverable | Path |
|-------------|------|
| Protection script | `scripts/ga/gh_apply_branch_protection.ps1` |
| Main branch config | `config/branch_protection/main.json` |
| Develop branch config | `config/branch_protection/develop.json` |
| Updated doc | `docs/V2_BRANCH_PROTECTION_CONFIG.md` (Section 8 added) |

**What it replaces**: Manual GitHub Settings > Branches UI navigation.

**Config format**: Standard GitHub REST API branch protection payload with:
- Required status checks: Backend Tests, Frontend Tests, Lint, Type Check,
  V2 Intake Gate, Build Test
- 1 required review, dismiss stale reviews
- No force pushes, no deletions
- Admin enforcement on main

---

### C. CI Workflow Trigger Updates

| Change | File |
|--------|------|
| Added `v2-intake-scaffold` to push triggers | `.github/workflows/ci.yml` |
| Added `workflow_dispatch` trigger | `.github/workflows/ci.yml` |

**Before**: CI only ran on pushes to `main`/`develop` or PRs targeting them.
**After**: CI also runs on pushes to `v2-intake-scaffold` and can be manually
triggered via GitHub Actions UI or `gh workflow run`.

No job definitions were modified. The `test-v2-intake` (V2 Intake Gate) job
is unchanged.

---

### D. Outreach Packet Generator

| Deliverable | Path |
|-------------|------|
| Packet generator script | `scripts/ga/generate_outreach_packets.ts` |
| Example contacts config | `config/contacts/ga_contacts.example.json` |

**What it replaces**: Manual email drafting and calendar invite creation.

**Generates**: `.eml` (email) and `.ics` (calendar invite) files for each
stakeholder defined in the contacts config. Includes:
- Role-specific email body with meeting details
- Calendar event with alarm reminder
- Packet manifest (MANIFEST.md) listing all generated files

**Safety**: Does NOT send emails. Files are generated for human review.

---

### E. DV-Safe Playwright Tests

| Deliverable | Path |
|-------------|------|
| Playwright config | `playwright.config.ts` |
| Panic button test suite | `tests/e2e_dv_safe/panic_button.spec.ts` |
| CI workflow (dispatch only) | `.github/workflows/dv-safe-e2e.yml` |
| Documentation | `docs/V2_PHASE8_DV_SAFE_AUTOMATION.md` |

**What it replaces**: Manual Chromium/Firefox panic button verification.

**Test coverage** (11 tests):
1. Page load smoke test
2. Panic button element detection
3. localStorage clearing verification
4. sessionStorage clearing verification
5. DV-sensitive signal removal (5 signals: fleeing_dv, fleeing_trafficking,
   has_protective_order, experienced_violence_recently, feels_safe_current_location)
6. IndexedDB database deletion
7. Panic URL safety verification (google.com default)
8. Escape key handler testing
9. Browser back button safety (history replacement)
10. DV signal constant validation
11. Intake-prefixed key clearing

**CI integration**: Workflow dispatch only (not on every push). Supports
per-browser runs: `gh workflow run "DV-Safe E2E Tests" --field browser=chromium`

---

### F. Clinical Calibration Evidence Scripts

| Deliverable | Path |
|-------------|------|
| Persona card scorer | `scripts/ga/score_persona_cards.ts` |
| Calibration snapshot generator | `scripts/ga/run_calibration_snapshot.ts` |
| Documentation | `docs/V2_PHASE8_CALIBRATION_AUTOMATION.md` |

**What it replaces**: Manual clinical review sessions without data.

**5 Representative Personas**:

| Persona | Tier | Score | Key Signals |
|---------|------|-------|-------------|
| Maria — DV Survivor | CRITICAL | 50/100 | Fleeing DV, unsheltered, 2 children, no income |
| James — Stable | LOWER | 0/100 | Housed supported, employed, no health issues |
| Robert — Veteran | CRITICAL | 74/100 | Chronic homeless 48mo, 3+ conditions, 6+ ER visits |
| Youth — Aging Out | HIGH | 34/100 | Unsheltered, foster care, no income, no ID |
| Sandra — Moderate | MODERATE | 24/100 | Transitional, part-time income, 2 conditions |

All 5/5 personas match their expected tiers.

**Calibration snapshot output**:
- `calibration_report.json` — Full aggregate statistics
- `calibration_summary.md` — Human-readable review document with clinical checklist

---

### G. GA Gate Runner

| Deliverable | Path |
|-------------|------|
| Gate runner script | `scripts/ga/run_ga_gate.ps1` |

**What it replaces**: Manual checklist verification across multiple tools.

**8 automated checks**:
1. Git branch and working tree status
2. V2 unit tests (195 tests, --bail)
3. TypeScript type check (--noEmit)
4. Persona card tier matching (5/5)
5. Calibration snapshot generation
6. Large file detection (>50MB)
7. Key source file presence (7 files)
8. CI configuration verification (triggers, workflow_dispatch)

**Output**: `outreach/generated/GA_GATE_RESULT.md` — GO/NO-GO artifact with
full check details, suitable for stakeholder review.

**Modes**: Interactive (default, warnings don't fail) and CI (`-CIMode`, any
failure exits non-zero).

---

### Cleanup

| Change | Detail |
|--------|--------|
| `.gitignore` additions | `frontend/.next/cache/**`, `cloudflared.exe`, `outreach/generated/`, `playwright-report/`, `test-results/` |
| Large file detection | `scripts/ga/preflight_large_files.ps1` (configurable threshold, default 50MB) |
| npm scripts | Added `ga:personas`, `ga:calibration`, `ga:packets`, `ga:packets:dry`, `ga:verify`, `ga:verify:ci` to root `package.json` |

---

## New npm Scripts

```bash
npm run ga:personas       # Score 5 persona cards
npm run ga:calibration    # Generate calibration snapshot
npm run ga:packets        # Generate outreach .eml/.ics files
npm run ga:packets:dry    # Preview outreach generation
npm run ga:verify         # Run full GA gate (interactive)
npm run ga:verify:ci      # Run full GA gate (CI mode, strict)
```

---

## Files Created/Modified

### New Files (18)

| # | File | Purpose |
|---|------|---------|
| 1 | `scripts/ga/gh_create_pr.ps1` | Idempotent PR creation |
| 2 | `scripts/ga/gh_watch_ci.ps1` | CI check polling |
| 3 | `scripts/ga/gh_apply_branch_protection.ps1` | Branch protection via API |
| 4 | `scripts/ga/generate_outreach_packets.ts` | .eml/.ics generation |
| 5 | `scripts/ga/score_persona_cards.ts` | Persona card scoring |
| 6 | `scripts/ga/run_calibration_snapshot.ts` | Calibration report generation |
| 7 | `scripts/ga/run_ga_gate.ps1` | GO/NO-GO gate runner |
| 8 | `scripts/ga/preflight_large_files.ps1` | Large file detection |
| 9 | `config/branch_protection/main.json` | Main branch protection config |
| 10 | `config/branch_protection/develop.json` | Develop branch protection config |
| 11 | `config/contacts/ga_contacts.example.json` | Stakeholder contact template |
| 12 | `docs/templates/PR_V2_INTAKE_GA.md` | PR body template |
| 13 | `docs/V2_PHASE8_GH_AUTOMATION.md` | PR/CI automation guide |
| 14 | `docs/V2_PHASE8_DV_SAFE_AUTOMATION.md` | DV test automation guide |
| 15 | `docs/V2_PHASE8_CALIBRATION_AUTOMATION.md` | Calibration automation guide |
| 16 | `playwright.config.ts` | Playwright E2E configuration |
| 17 | `tests/e2e_dv_safe/panic_button.spec.ts` | DV-safe browser tests |
| 18 | `.github/workflows/dv-safe-e2e.yml` | DV test CI workflow |

### Modified Files (4)

| File | Change |
|------|--------|
| `.github/workflows/ci.yml` | Added `v2-intake-scaffold` push trigger + `workflow_dispatch` |
| `.gitignore` | Added 5 ignore patterns |
| `package.json` | Added 6 `ga:*` npm scripts |
| `docs/V2_BRANCH_PROTECTION_CONFIG.md` | Added Section 8 (Automated Path) |

---

## Guardrails Compliance

| Guardrail | Status | Evidence |
|-----------|--------|----------|
| No scoring changes | ✅ | `backend/src/intake/v2/scoring/**` unmodified |
| No new endpoints | ✅ | No route files touched |
| No frontend UI changes | ✅ | No files under `frontend/` modified |
| No V1 changes | ✅ | V1 parser untouched |
| ZERO_OPENAI_MODE | ✅ | All tests run with ZERO_OPENAI_MODE=true |
| No migration changes | ✅ | Prisma schema untouched |

---

## Manual Tasks Eliminated

| Previously Manual | Now Automated |
|-------------------|---------------|
| Create PR via browser | `scripts/ga/gh_create_pr.ps1` |
| Monitor CI checks in browser | `scripts/ga/gh_watch_ci.ps1` |
| Configure branch protection in GitHub UI | `scripts/ga/gh_apply_branch_protection.ps1` |
| Draft stakeholder emails manually | `scripts/ga/generate_outreach_packets.ts` |
| Create calendar invites manually | `scripts/ga/generate_outreach_packets.ts` |
| Manually test panic button in browsers | `tests/e2e_dv_safe/panic_button.spec.ts` |
| Run persona scoring by hand | `scripts/ga/score_persona_cards.ts` |
| Generate calibration data manually | `scripts/ga/run_calibration_snapshot.ts` |
| Check GA readiness manually | `scripts/ga/run_ga_gate.ps1` |
| Detect large files manually | `scripts/ga/preflight_large_files.ps1` |

---

## Remaining Human-Only Tasks

These cannot be automated and require human judgment:

1. **Clinical sign-off** — Review calibration summary with clinical director
2. **DV advocate review** — DV safety specialist reviews panic button behavior
3. **PR review and approval** — At least 1 reviewer must approve the GA PR
4. **Merge decision** — Human GO/NO-GO decision based on gate results
5. **Stakeholder notification** — Review and send generated outreach packets
6. **Production monitoring** — Post-merge observation period

---

## Verification

```
V2 Unit Tests:     195/195 passed (9 suites)
Persona Cards:     5/5 match expected tiers
Calibration:       Report + summary generated successfully
Scripts Created:   18 new files
Guardrails:        All 6 respected
```

---

*Phase 8 — GA Automation & Self-Service Troubleshooting*
*Completed: February 19, 2026*
