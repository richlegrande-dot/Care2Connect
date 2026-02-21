# V2 Phase 8 — GitHub Automation (PR + CI)

> **Created**: Phase 8A
> **Scripts**: `scripts/ga/gh_create_pr.ps1`, `scripts/ga/gh_watch_ci.ps1`
> **Prerequisite**: [GitHub CLI](https://cli.github.com/) installed and authenticated

---

## Quick Start

```powershell
# 1. Create the GA pull request (idempotent — safe to run multiple times)
.\scripts\ga\gh_create_pr.ps1

# 2. Watch CI checks until they complete
.\scripts\ga\gh_watch_ci.ps1

# Dry-run mode (no side effects)
.\scripts\ga\gh_create_pr.ps1 -DryRun
```

---

## What Each Script Does

### `gh_create_pr.ps1`

1. Verifies `gh` CLI is installed and authenticated
2. Auto-detects the GitHub `OWNER/REPO` from `git remote get-url origin`
3. Checks if an open PR already exists for `v2-intake-scaffold → main`
4. If exists: prints URL and exits cleanly (exit 0)
5. If not: creates PR using body template from `docs/templates/PR_V2_INTAKE_GA.md`
6. Falls back to creating without labels if label creation fails

**Parameters:**

| Parameter | Default | Description |
|-----------|---------|-------------|
| `-Base` | `main` | Target branch for the PR |
| `-DryRun` | `$false` | Print what would happen without creating |

### `gh_watch_ci.ps1`

1. Finds the open PR for `v2-intake-scaffold`
2. Polls check status every 30 seconds
3. Reports pass/fail with color-coded output
4. Exits `0` when all checks pass
5. Exits `1` immediately if `V2 Intake Gate` fails (critical check)
6. Exits `2` on timeout

**Parameters:**

| Parameter | Default | Description |
|-----------|---------|-------------|
| `-PRNumber` | auto-detect | Override PR number |
| `-PollInterval` | `30` | Seconds between polls |
| `-Timeout` | `20` | Max minutes to wait |

---

## PR Body Template

The PR body is loaded from `docs/templates/PR_V2_INTAKE_GA.md`. Edit that file
to customize the PR description. If the template file doesn't exist, a built-in
fallback is used.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `gh: command not found` | Install from https://cli.github.com/ |
| `Not authenticated` | Run `gh auth login` and follow prompts |
| `No open PR found` | Run `gh_create_pr.ps1` first |
| Labels don't exist | Script auto-retries without labels |
| Checks stuck pending | GitHub Actions may be delayed; increase `-Timeout` |
