# Reports Policy — Care2Connect Repository

## Rule

**AI-generated session reports, handoffs, and phase summaries must NOT be committed to `main`.**

This repository is a production codebase. All commits to `main` go through the build pipeline and become build artifacts. Bulk markdown reports bloat the repo, inflate CI times, and risk leaking context (model prompts, system state, operational detail) into public history.

---

## What belongs in `main`

| Type | Location | Examples |
|------|----------|---------|
| **Runbooks** | `docs/` | `DEPLOYMENT_RUNBOOK_WINDOWS.md`, `OPS_RUNBOOK.md` |
| **Architecture docs** | `docs/` | `API_DOCUMENTATION.md`, `SYSTEM_ARCHITECTURE.*` |
| **API contracts** | `docs/` | `api-endpoints.md`, `V2_INTK_SPEC.md` |
| **Operational guides** | `docs/` | `DEVELOPER_GUIDE.md`, `STRIPE_*.md` |
| **Testing guides** | `docs/` | `TESTING_GUIDE.md`, `V2_DV_SAFE_TESTING_PROTOCOL.md` |
| **One canonical phase completion report** | `docs/` | `PHASE11_COMPLETION_REPORT_2026-02-22.md` |

---

## What does NOT belong in `main`

| Type | Reason |
|------|--------|
| `AGENT_HANDOFF_*.md` | Generated for AI context transfer, not operators |
| `NAVIGATOR_HANDOFF_*.md` | Same — AI-to-AI session state |
| `SYSTEM_STATE_REPORT*.md` | Snapshot reports for AI review |
| `PHASE*_COMPLETION_REPORT_*.md` (non-canonical) | Per-session phase reports |
| `docs/reports/` (all) | Bulk report dumps |
| `docs/handoffs/` (all) | Bulk handoff dumps |

---

## Where to store AI session reports

| Storage location | When to use |
|-----------------|------------|
| `reports-archive/*` branch | Preserve full history of a session without touching `main` |
| PR description / PR comment | Attach a session summary to the PR it relates to |
| GitHub issue | Track a decision or investigation outcome |
| Local file (gitignored) | Temporary working notes — never committed |

The current archive branch is: **`reports-archive/2026-02-22`**

---

## Enforcement

1. **`.gitignore`** — blocked patterns ignore future report drops automatically.
2. **`scripts/ci/check-no-reports.ps1`** — run this locally or in CI to catch violations before push:
   ```powershell
   # Check staged files (before commit)
   .\scripts\ci\check-no-reports.ps1

   # Audit entire tree
   .\scripts\ci\check-no-reports.ps1 -Mode tree
   ```
3. **PR reviews** — reviewers should reject PRs that add files matching blocked patterns.

---

## Adding legitimate docs

Before adding a new doc to `docs/`, ask:

- Would a new engineer need this to operate or develop the system? → `docs/` is fine.
- Is this a summary of what an AI agent did? → Use PR description or archive branch.
- Is this a one-time status snapshot? → Do not commit.
