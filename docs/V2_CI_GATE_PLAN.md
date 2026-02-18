# V2 Intake — CI Gate Plan

> **Date**: 2026-02-18
> **Branch**: `v2-intake-scaffold`
> **Status**: Plan — not yet implemented

---

## Overview

This document outlines the plan for adding a V2-specific CI gate job to the existing
`.github/workflows/ci.yml` pipeline. The gate ensures no V2 intake regressions merge
into `main` or `develop`.

---

## Current CI State

The existing CI file (`.github/workflows/ci.yml`, 365 lines) has three jobs:

| Job | Purpose |
|-----|---------|
| `test-backend` | Runs ALL backend tests (`npm test -- --coverage --watchAll=false`) with PostgreSQL service container |
| `test-frontend` | Runs frontend tests |
| `lint-and-format` | ESLint + Prettier checks |

The `test-backend` job already runs V2 tests since `npm test` picks up `tests/intake_v2/`.
However, there is no **dedicated V2 gate** that could be required as a branch protection rule
or easily identified in CI status checks.

---

## Proposed: `test-v2-intake` Job

### Job Definition

```yaml
  test-v2-intake:
    name: V2 Intake Gate
    runs-on: ubuntu-latest
    needs: [] # Independent — runs in parallel with test-backend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install backend dependencies
        working-directory: ./backend
        run: npm ci

      - name: Generate Prisma client
        working-directory: ./backend
        run: npx prisma generate

      - name: Run V2 Intake tests
        working-directory: ./backend
        run: npx jest tests/intake_v2/ --verbose --bail
        env:
          NODE_ENV: test
          ZERO_OPENAI_MODE: true

      - name: V2 gate summary
        if: always()
        run: echo "V2 Intake gate completed"
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **No database required** | All 195 V2 tests are pure unit tests — no Prisma queries, no PostgreSQL |
| **`--bail` flag** | Fail fast on first broken test to save CI minutes |
| **Parallel with `test-backend`** | No `needs: [test-backend]` dependency — runs independently |
| **No smoke test in CI** | Smoke test requires a running server + database, best left for staging |
| **Separate job name** | Allows GitHub branch protection rules to require `V2 Intake Gate` status check |

### What This Does NOT Include

- **Smoke test execution**: Requires live server + database. Not suitable for CI without
  additional Docker-compose orchestration.
- **Calibration/fairness endpoint tests**: These query the database and are covered by the
  smoke test in staging.
- **V1 gate tests**: Already covered by the existing `test-backend` job.

---

## Implementation Steps

When ready to implement:

1. Add the `test-v2-intake` job to `.github/workflows/ci.yml` after the existing jobs
2. Add `test-v2-intake` to any branch protection rules on `main`/`develop`
3. Verify the job passes on a test PR
4. (Optional) Add a badge to README:
   ```markdown
   ![V2 Intake Gate](https://github.com/{org}/{repo}/actions/workflows/ci.yml/badge.svg)
   ```

---

## Future Enhancements

| Enhancement | Priority | Description |
|-------------|----------|-------------|
| Smoke test in CI | P2 | Add Docker-compose to spin up server + test DB, run `v2_staging_smoke.ts` |
| Coverage threshold | P3 | Add `--coverageThreshold` for V2 files (e.g., 90% line coverage) |
| Performance gate | P3 | Assert `Time: < 5s` for V2 test suite duration |
| Matrix testing | P4 | Run V2 tests on Node 18 + Node 20 |

---

## Guardrails Compliance

| Guardrail | Status |
|-----------|--------|
| No scoring changes | ✅ — Plan only, no code changes |
| No UI changes | ✅ |
| No V1 changes | ✅ |
| No AI calls | ✅ |
| No breaking API changes | ✅ |

---

*Plan authored: 2026-02-18*
*Implementation deferred to Phase 5 or when branch protection rules are configured.*
