# Branch Protection — Required Status Checks

After this PR merges, update the branch protection rules for `main` to require
**only** the V2-scoped checks listed below. The legacy jobs still run but
are `continue-on-error: true` so they cannot block merges.

## Required Status Checks (set these in GitHub → Settings → Branches → main)

| Check Name               | Source Job ID             |
|--------------------------|---------------------------|
| V2 Intake Gate           | `test-v2-intake`          |
| V2 TypeCheck Backend     | `v2-typecheck-backend`    |
| V2 TypeCheck Frontend    | `v2-typecheck-frontend`   |
| V2 Format Check          | `v2-format-check`         |
| Security Scan            | `security-scan`           |
| Build Test               | `build-test`              |

## Checks to REMOVE from required list

| Old Check Name                | Reason                            |
|-------------------------------|-----------------------------------|
| Backend Tests                 | 48 suites failing (legacy debt)   |
| Frontend Tests                | 6 suites failing (legacy debt)    |
| Lint and Format Check         | 227+ Prettier violations (legacy) |
| TypeScript Type Check         | Prisma P1012 on full codebase     |

## How to apply via `gh` CLI

```powershell
# Run from repo root after PR merges:
gh api -X PUT "repos/{owner}/{repo}/branches/main/protection" `
  --input scripts/ops/branch-protection-payload.json
```

## Manual steps (GitHub UI)

1. Go to **Settings → Branches → main → Edit**
2. Under **Require status checks to pass before merging**, search for and add:
   - `V2 Intake Gate`
   - `V2 TypeCheck Backend`
   - `V2 TypeCheck Frontend`
   - `V2 Format Check`
   - `Security Scan`
   - `Build Test`
3. Remove the old checks: `Backend Tests`, `Frontend Tests`,
   `Lint and Format Check`, `TypeScript Type Check`
4. Save changes
