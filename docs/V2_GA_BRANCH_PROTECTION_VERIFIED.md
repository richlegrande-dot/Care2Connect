# V2 Intake — GA Branch Protection Verification

> **Date**: February 19, 2026
> **Phase**: 6B — Blocker Removal
> **Verified By**: Engineering (automated audit)
> **Reference**: `docs/V2_BRANCH_PROTECTION_CONFIG.md`

---

## Purpose

This document verifies the CI pipeline configuration and branch protection
readiness for the V2 Intake system. It covers the `test-v2-intake` job in
the CI workflow, its integration with downstream jobs, and the branch
protection rules that must be applied.

---

## 1. CI Job Verification: `test-v2-intake`

### 1.1 Job Configuration (Verified in `.github/workflows/ci.yml`)

| Property | Expected | Actual | Status |
|----------|----------|--------|--------|
| Job name | `test-v2-intake` | `test-v2-intake` | ✅ MATCH |
| Display name | `V2 Intake Gate` | `V2 Intake Gate` | ✅ MATCH |
| Runner | `ubuntu-latest` | `ubuntu-latest` | ✅ MATCH |
| Node version | 24 (Active LTS) | `${{ env.NODE_VERSION }}` → `'24'` | ✅ MATCH |
| Working directory | `./backend` | `./backend` | ✅ MATCH |
| Test command | `npx jest tests/intake_v2/ --verbose --bail` | Exact match | ✅ MATCH |
| Environment: `NODE_ENV` | `test` | `test` | ✅ MATCH |
| Environment: `ZERO_OPENAI_MODE` | `true` | `'true'` | ✅ MATCH |
| Gate summary step | Always runs | `if: always()` | ✅ MATCH |
| Database required | No | No database service | ✅ CORRECT |

### 1.2 CI Job Steps (6 total)

| # | Step | Action | Status |
|---|------|--------|--------|
| 1 | Checkout code | `actions/checkout@v4` | ✅ Present |
| 2 | Setup Node.js | `actions/setup-node@v4` with cache | ✅ Present |
| 3 | Install dependencies | `npm ci` in `./backend` | ✅ Present |
| 4 | Generate Prisma client | `npx prisma generate` in `./backend` | ✅ Present |
| 5 | Run V2 Intake tests | `npx jest tests/intake_v2/ --verbose --bail` | ✅ Present |
| 6 | Gate summary | Always runs, echoes completion | ✅ Present |

### 1.3 Downstream Integration

| Downstream Job | `needs` Array Includes `test-v2-intake` | Status |
|----------------|----------------------------------------|--------|
| `build-test` | ✅ Yes (line 247) | ✅ WIRED |
| `notify-slack` | ✅ Yes (line 381) | ✅ WIRED |

This means:
- `build-test` will **not run** unless `test-v2-intake` passes
- `notify-slack` will report V2 gate status to Slack
- V2 gate failure blocks the entire build pipeline

### 1.4 Local Execution Verification

```
$ cd backend && npx jest tests/intake_v2/ --verbose --bail

Test Suites: 9 passed, 9 total
Tests:       195 passed, 195 total
Snapshots:   0 total
Time:        2.944 s

RESULT: PASS ✅
```

### 1.5 Remote Execution Status

| Item | Status | Detail |
|------|--------|--------|
| GitHub Actions run | ⚠️ NOT VERIFIED | No git remote configured |
| Reason | No remote repository | `git remote -v` returns empty |
| Risk | LOW | Job config is standard; local tests pass consistently |
| Remediation | Push to GitHub → CI triggers automatically | < 5 minutes |

---

## 2. CI Workflow Structure Verification

### 2.1 Full Job Dependency Graph

```
test-backend ─────────┐
test-frontend ────────┤
lint-and-format ──────┼──► build-test ──► (deploy stages)
type-check ───────────┤
test-v2-intake ───────┘
                      │
security-scan ────────┤
                      ├──► notify-slack
build-test ───────────┘
```

### 2.2 Trigger Configuration

| Trigger | Branches | Status |
|---------|----------|--------|
| `push` | `main`, `develop` | ✅ Configured |
| `pull_request` | `main`, `develop` | ✅ Configured |

> **Note**: The `v2-intake-scaffold` branch is not in the trigger list.
> CI will run when a PR is opened from `v2-intake-scaffold` → `main` or `develop`.
> This is the expected workflow — code enters protected branches via PR only.

---

## 3. Branch Protection Rules (Configuration Ready)

### 3.1 Documented Configuration

The following rules are fully documented in `docs/V2_BRANCH_PROTECTION_CONFIG.md`
and ready to apply:

#### `main` Branch

| Rule | Setting |
|------|---------|
| Require pull request before merging | ✅ Enabled |
| Required approvals | 1 |
| Dismiss stale reviews | ✅ Enabled |
| Require status checks | `test-backend`, `test-v2-intake`, `build-test` |
| Require branches up to date | ✅ Enabled |
| Restrict push access | ✅ No direct push |
| Allow force push | ❌ Disabled |
| Allow deletion | ❌ Disabled |

#### `develop` Branch

| Rule | Setting |
|------|---------|
| Require pull request before merging | ✅ Enabled |
| Required approvals | 1 |
| Require status checks | `test-backend`, `test-v2-intake` |
| Allow force push | ❌ Disabled |

#### `v2-intake-scaffold` Branch

| Rule | Setting |
|------|---------|
| Require pull request before merging | ✅ Enabled |
| Required approvals | 1 |
| Require status checks | `test-v2-intake` |
| Allow force push | ❌ Disabled |

### 3.2 Application Status

| Item | Status | Detail |
|------|--------|--------|
| Rules documented | ✅ Complete | `docs/V2_BRANCH_PROTECTION_CONFIG.md` |
| Rules applied to GitHub | ⚠️ NOT APPLIED | No remote configured |
| `gh` CLI available | ❌ Not installed | Workaround: GitHub web UI |
| CODEOWNERS file | ⚠️ Recommended, not created | Documented in config |

### 3.3 Remediation Steps

To apply branch protection after remote is configured:

1. Navigate to GitHub repository → Settings → Branches
2. Click "Add branch protection rule"
3. Follow step-by-step instructions in `docs/V2_BRANCH_PROTECTION_CONFIG.md`
4. Apply for `main`, `develop`, and `v2-intake-scaffold`
5. Verify: attempt direct push to `main` — should be rejected

**Alternative (CLI)**:
```powershell
winget install GitHub.cli
gh auth login
# Then use gh api calls per V2_BRANCH_PROTECTION_CONFIG.md Appendix
```

---

## 4. Verification Summary

| Area | Items | Pass | Warn | Fail |
|------|-------|------|------|------|
| CI Job Config | 10 | 10 | 0 | 0 |
| CI Job Steps | 6 | 6 | 0 | 0 |
| Downstream Wiring | 2 | 2 | 0 | 0 |
| Local Execution | 1 | 1 | 0 | 0 |
| Remote Execution | 1 | 0 | 1 | 0 |
| Branch Protection Config | 3 | 1 | 2 | 0 |
| **TOTAL** | **23** | **20** | **3** | **0** |

### Remaining Actions (Blocker 2 & 3)

| # | Action | Owner | Time | Removes |
|---|--------|-------|------|---------|
| 1 | Configure git remote | Engineering | 5 min | Remote prerequisite |
| 2 | Push `v2-intake-scaffold` branch | Engineering | 2 min | Remote CI trigger |
| 3 | Verify CI run on GitHub Actions | Engineering | 5 min | Blocker 2 |
| 4 | Apply branch protection rules | Repo Admin | 15 min | Blocker 3 |
| 5 | (Optional) Install `gh` CLI | Engineering | 5 min | CLI automation |
| 6 | (Optional) Create CODEOWNERS | Engineering | 10 min | Path-based reviews |

### Verdict

**CONDITIONALLY PASS** — CI job is correctly configured and tested locally.
Branch protection rules are fully documented. Both await remote repository
configuration (Blocker 1) to become enforceable. No configuration defects found.

---

*GA Branch Protection Verification — Phase 6B*
*Verified: 2026-02-19T01:00Z*
