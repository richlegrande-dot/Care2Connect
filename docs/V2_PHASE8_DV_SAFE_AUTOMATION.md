# V2 Phase 8 — DV-Safe Automation

> **Created**: Phase 8E
> **Test file**: `tests/e2e_dv_safe/panic_button.spec.ts`
> **CI workflow**: `.github/workflows/dv-safe-e2e.yml`
> **Config**: `playwright.config.ts`

---

## Purpose

Automates verification of DV (Domestic Violence) safety features in the browser,
replacing the manual requirement to open Chromium/Firefox and visually inspect
panic button behavior.

## What's Tested

| Test | Description |
|------|-------------|
| Page loads | Basic smoke test — app renders |
| Panic button exists | Verifies panic button element on intake pages |
| localStorage cleared | All localStorage removed after panic |
| sessionStorage cleared | All sessionStorage removed after panic |
| No DV signals remain | Sensitive signals (fleeing_dv, etc.) fully erased |
| IndexedDB deletable | IndexedDB databases can be deleted |
| Safe URL navigation | Panic button targets google.com (or configured URL) |
| Escape key handling | Tests whether Escape key triggers cleanup |
| Back button safety | Browser history replaced after panic |
| Redaction constants | DV_SENSITIVE_SIGNALS set matches spec |
| Prefixed key clearing | All intake-prefixed storage keys removed |

## Running Locally

```bash
# Install Playwright (one-time)
npx playwright install chromium

# Run DV-safe tests
npx playwright test tests/e2e_dv_safe/

# Run against specific browser
npx playwright test tests/e2e_dv_safe/ --project=firefox

# Run with UI mode
npx playwright test tests/e2e_dv_safe/ --ui

# Debug a specific test
npx playwright test tests/e2e_dv_safe/ -g "localStorage is cleared"
```

## Running in CI

The DV-safe tests have their own GitHub Actions workflow (workflow_dispatch only):

```bash
# Trigger via gh CLI
gh workflow run "DV-Safe E2E Tests" --field browser=chromium
gh workflow run "DV-Safe E2E Tests" --field browser=all
```

## DV-Sensitive Signals

These signals from `dvSafe.ts` are verified to be completely cleared:

- `fleeing_dv` — Client fleeing domestic violence
- `fleeing_trafficking` — Client fleeing trafficking situation
- `has_protective_order` — Active protective/restraining order
- `experienced_violence_recently` — Recent violence exposure
- `feels_safe_current_location` — Current safety assessment

## Architecture Notes

- Tests mirror the `DV_SENSITIVE_SIGNALS` set from `backend/src/intake/v2/dvSafe.ts`
- Default panic URL: `https://www.google.com` (configurable via `DV_PANIC_BUTTON_URL` env var)
- Storage clearing covers: localStorage, sessionStorage, IndexedDB
- Tests seed synthetic data, then verify complete removal
