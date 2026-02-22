#Requires -Version 5.1
<#
.SYNOPSIS
    CI guard: fails if any file matching known report/handoff patterns is staged or
    present in the repository tree.

.DESCRIPTION
    Run this in CI (or locally before pushing) to catch assistant-generated reports
    being accidentally committed to main.

    Blocked patterns:
    - docs/reports/**
    - docs/handoffs/**
    - AGENT_HANDOFF_*.md       (anywhere in tree)
    - NAVIGATOR_HANDOFF_*.md   (anywhere in tree)
    - SYSTEM_STATE_REPORT*.md  (anywhere in tree)
    - PHASE*_COMPLETION_REPORT_*.md (anywhere in tree)

.PARAMETER Mode
    "staged"  — scan git index (what's about to be committed); default in CI.
    "tree"    — scan the full tracked file tree (repo audit mode).

.EXAMPLE
    powershell -File scripts/ci/check-no-reports.ps1
    powershell -File scripts/ci/check-no-reports.ps1 -Mode tree

.OUTPUTS
    Exit 0 — no blocked files found.
    Exit 1 — blocked files found; list printed.

#>
[CmdletBinding()]
param(
    [ValidateSet("staged","tree")]
    [string]$Mode = "staged"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ---------------------------------------------------------------------------
# Blocked patterns (applied against forward-slash normalised paths)
# ---------------------------------------------------------------------------
$blockedPatterns = @(
    '^docs/reports/',
    '^docs/handoffs/',
    'AGENT_HANDOFF_.*\.md$',
    'NAVIGATOR_HANDOFF_.*\.md$',
    'SYSTEM_STATE_REPORT.*\.md$',
    'PHASE[0-9A-Za-z._-]*_COMPLETION_REPORT_[0-9A-Za-z._-]*\.md$'
)

# ---------------------------------------------------------------------------
# Allowlist: paths explicitly exempted (one canonical phase completion report).
# Add the current canonical path here when a phase completes.
# ---------------------------------------------------------------------------
$allowlist = @(
    'docs/PHASE11_COMPLETION_REPORT_2026-02-22.md'
)

# ---------------------------------------------------------------------------
# Get file list
# ---------------------------------------------------------------------------
if ($Mode -eq "staged") {
    # Only files staged for the next commit (added/modified)
    $files = @(git diff --cached --name-only --diff-filter=ACM 2>$null)
} else {
    # All tracked files in the repo
    $files = @(git ls-files 2>$null)
}

# Normalise to forward slashes
$files = $files | ForEach-Object { $_ -replace '\\','/' }

# ---------------------------------------------------------------------------
# Check each file against blocked patterns
# ---------------------------------------------------------------------------
$violations = @()
foreach ($file in $files) {
    if ($allowlist -contains $file) { continue }
    foreach ($pattern in $blockedPatterns) {
        if ($file -match $pattern) {
            $violations += $file
            break
        }
    }
}

# ---------------------------------------------------------------------------
# Result
# ---------------------------------------------------------------------------
if ($violations.Count -eq 0) {
    Write-Host "[check-no-reports] OK -- no blocked report files found (mode: $Mode)."
    exit 0
} else {
    Write-Host ""
    Write-Host "[check-no-reports] FAIL -- $($violations.Count) blocked file(s) found." -ForegroundColor Red
    Write-Host ""
    Write-Host "  These files match report/handoff patterns that must NOT be committed to main."
    Write-Host "  Store them in the 'reports-archive/*' branch, a PR description, or a GitHub issue."
    Write-Host ""
    $violations | ForEach-Object { Write-Host "  BLOCKED: $_" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "  See docs/REPORTS_POLICY.md for the full policy."
    Write-Host ""
    exit 1
}
