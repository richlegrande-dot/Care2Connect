# V2 Intake — Branch Protection Configuration

> **Version**: 1.0
> **Date**: February 18, 2026
> **Branch**: `v2-intake-scaffold`
> **Status**: Configuration guide — apply via GitHub Settings > Branches

---

## Purpose

This document specifies the branch protection rules required to prevent unreviewed
or regression-causing changes from reaching `main` or `develop`. With the addition
of the `V2 Intake Gate` CI job, we can now enforce that all V2 intake tests pass
before any PR merges.

---

## 1. Required Status Checks

### `main` Branch

Navigate to **GitHub > Settings > Branches > Branch protection rules > `main`**

| Setting | Value |
|---------|-------|
| **Require status checks to pass before merging** | ✅ Enabled |
| **Require branches to be up to date before merging** | ✅ Enabled |

#### Required status checks (all must pass):

| Status Check Name | CI Job | Purpose |
|-------------------|--------|---------|
| `Backend Tests` | `test-backend` | V1 + V2 backend tests with PostgreSQL |
| `Frontend Tests` | `test-frontend` | Frontend tests |
| `Lint and Format Check` | `lint-and-format` | ESLint + Prettier |
| `TypeScript Type Check` | `type-check` | TSC --noEmit backend + frontend |
| **`V2 Intake Gate`** | **`test-v2-intake`** | **V2 intake unit tests (195 tests, --bail)** |
| `Build Test` | `build-test` | Full build verification |

### `develop` Branch

Same rules as `main`. Apply identical configuration.

### `v2-intake-scaffold` Branch (Feature Branch)

| Setting | Value |
|---------|-------|
| **Require status checks to pass before merging** | ✅ Enabled |
| **Required checks** | `V2 Intake Gate`, `Backend Tests` |
| **Require pull request reviews before merging** | ✅ Enabled |
| **Required approving reviews** | 1 |

---

## 2. Pull Request Requirements

### For PRs targeting `main`

| Setting | Value | Rationale |
|---------|-------|-----------|
| Require pull request reviews before merging | ✅ | Prevent unreviewed code |
| Required number of approving reviews | 1 (recommend 2 for scoring changes) | Governance oversight |
| Dismiss stale pull request approvals when new commits are pushed | ✅ | Re-review after changes |
| Require review from Code Owners | ✅ (if CODEOWNERS file exists) | Domain-specific review |
| Restrict who can dismiss pull request reviews | ✅ | Prevent approval bypass |

### For PRs targeting `develop`

| Setting | Value |
|---------|-------|
| Require pull request reviews | ✅ |
| Required approving reviews | 1 |
| Dismiss stale approvals | ✅ |

---

## 3. Push Restrictions

| Setting | Value | Rationale |
|---------|-------|-----------|
| **Restrict who can push to matching branches** | ✅ Enabled for `main` | No direct pushes |
| Allow force pushes | ❌ Disabled | Prevent history rewriting |
| Allow deletions | ❌ Disabled | Prevent branch deletion |
| Include administrators | ✅ | Admins also follow rules |

### Direct Push Prevention

No developer should push directly to `main`. All changes must go through:

```
feature-branch → PR → CI checks pass → Review approved → Merge
```

---

## 4. CODEOWNERS File (Recommended)

Create `.github/CODEOWNERS` to require domain-specific review:

```
# V2 Intake — require V2-knowledgeable reviewer
backend/src/intake/v2/          @clinical-lead @engineering-lead
backend/tests/intake_v2/        @clinical-lead @engineering-lead
docs/V2_*                       @clinical-lead

# V1 Parser — require V1 maintainer review
backend/src/services/transcript* @v1-maintainer
backend/src/services/parser*     @v1-maintainer

# Scoring constants — require clinical sign-off
backend/src/intake/v2/policy/    @clinical-lead
backend/src/intake/v2/scoring/   @clinical-lead

# CI pipeline — require DevOps review
.github/workflows/               @devops-lead

# Prisma schema — require DB admin review
backend/prisma/schema.prisma     @db-admin @engineering-lead
```

---

## 5. Configuration Steps (GitHub UI)

### Step-by-step for `main` branch:

1. Go to **repository** > **Settings** > **Branches**
2. Click **Add branch protection rule** (or edit existing)
3. **Branch name pattern**: `main`
4. Check: **Require a pull request before merging**
   - Check: **Require approvals** → Set to **1**
   - Check: **Dismiss stale pull request approvals when new commits are pushed**
5. Check: **Require status checks to pass before merging**
   - Check: **Require branches to be up to date before merging**
   - Search and add these status checks:
     - `Backend Tests`
     - `Frontend Tests`
     - `Lint and Format Check`
     - `TypeScript Type Check`
     - `V2 Intake Gate`
     - `Build Test`
6. Check: **Do not allow bypassing the above settings**
7. Check: **Restrict who can push to matching branches**
   - Add authorized teams/users only
8. Click **Create** / **Save changes**

### Step-by-step for `develop` branch:

1. Same as above but with branch name pattern: `develop`
2. Consider allowing 1 approving review (vs 2 for main)
3. Same required status checks

---

## 6. Verification

After configuration, verify protection is active:

```bash
# Attempt direct push to main (should be rejected)
git checkout main
echo "test" > /tmp/test.txt
git add /tmp/test.txt
git commit -m "test: direct push should fail"
git push origin main
# Expected: remote: error: GH006: Protected branch update failed

# Attempt force push (should be rejected)
git push --force origin main
# Expected: remote: error: Cannot force-push to protected branch
```

### CI Status Check Verification

1. Create a test PR from `v2-intake-scaffold` → `main`
2. Verify all 6 status checks appear as required
3. Verify the PR cannot be merged until all checks pass
4. Verify the `V2 Intake Gate` check specifically appears and runs

---

## 7. Emergency Override Procedure

In rare emergency situations (production hotfix), branch protection may need to
be temporarily relaxed:

1. **Two authorized personnel** must agree the override is necessary
2. Document the reason in the PR description
3. Temporarily allow admin bypass (Settings > Branches > uncheck "Include administrators")
4. Merge the hotfix
5. **Immediately re-enable** "Include administrators"
6. Create a follow-up issue documenting:
   - Why the override was needed
   - What checks were skipped
   - Who authorized the override
   - Post-merge test results

---

## Guardrails Compliance

| Guardrail | Status |
|-----------|--------|
| No scoring changes | ✅ — Documentation only |
| No UI changes | ✅ |
| No V1 changes | ✅ |
| No AI calls | ✅ |
| No new endpoints | ✅ |
| No migration changes | ✅ |

---

## 8. Automated Path (Phase 8B)

Instead of manually configuring branch protection through the GitHub UI,
use the automation script:

```powershell
# Apply protection to main (reads config/branch_protection/main.json)
.\scripts\ga\gh_apply_branch_protection.ps1

# Apply protection to develop
.\scripts\ga\gh_apply_branch_protection.ps1 -Branch develop

# Preview without applying
.\scripts\ga\gh_apply_branch_protection.ps1 -DryRun
```

**Config files**: `config/branch_protection/main.json` and `develop.json`

The script uses `gh api -X PUT` to apply protection rules via the GitHub REST API.
It auto-detects the repository from `git remote get-url origin` and verifies
the rules were applied by reading them back.

Requirements:
- GitHub CLI (`gh`) installed and authenticated
- Admin permissions on the repository
- Branch must exist on the remote

---

*Branch Protection Configuration — V2 Intake Phase 5 (updated Phase 8B)*
*Authored: 2026-02-18, Updated: 2026-02-19*
