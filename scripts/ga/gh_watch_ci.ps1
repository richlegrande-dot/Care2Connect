<#
.SYNOPSIS
  Watch CI checks on the V2 Intake GA pull request.

.DESCRIPTION
  Polls the PR's status checks until they complete, then reports pass/fail.
  Exits non-zero if the V2 Intake Gate check fails.

.PARAMETER PRNumber
  PR number to watch. If omitted, finds the open PR for v2-intake-scaffold.

.PARAMETER PollInterval
  Seconds between poll attempts (default: 30)

.PARAMETER Timeout
  Maximum minutes to wait (default: 20)

.EXAMPLE
  .\scripts\ga\gh_watch_ci.ps1
  .\scripts\ga\gh_watch_ci.ps1 -PRNumber 42 -PollInterval 15
#>

param(
    [int]$PRNumber = 0,
    [int]$PollInterval = 30,
    [int]$Timeout = 20
)

$ErrorActionPreference = "Stop"
$REPO_ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# Required checks — the V2 Intake Gate is the critical one
$CRITICAL_CHECKS = @("V2 Intake Gate")
$ALL_CHECKS = @(
    "V2 Intake Gate",
    "Backend Tests",
    "Frontend Tests",
    "Lint and Format Check",
    "TypeScript Type Check",
    "Build Test"
)

# ── Helpers ─────────────────────────────────────────────────────
function Get-RepoSlug {
    Push-Location $REPO_ROOT
    try {
        $remote = git remote get-url origin 2>&1
        if ($remote -match "github\.com[:/](.+?)(?:\.git)?$") {
            return $Matches[1]
        }
        Write-Error "Cannot parse repo slug from remote"
        exit 1
    } finally {
        Pop-Location
    }
}

function Find-PR {
    param([string]$Repo)
    $prs = gh pr list --repo $Repo --head "v2-intake-scaffold" --base "main" --json number,url --limit 1 2>&1 |
        ConvertFrom-Json
    if ($prs.Count -gt 0) {
        return $prs[0]
    }
    # Also check develop
    $prs = gh pr list --repo $Repo --head "v2-intake-scaffold" --base "develop" --json number,url --limit 1 2>&1 |
        ConvertFrom-Json
    if ($prs.Count -gt 0) {
        return $prs[0]
    }
    return $null
}

# ── Main ────────────────────────────────────────────────────────
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) not found. Install from https://cli.github.com/"
    exit 1
}

$repo = Get-RepoSlug
Write-Host "Repository: $repo" -ForegroundColor Cyan

# Find PR
if ($PRNumber -eq 0) {
    $pr = Find-PR -Repo $repo
    if (-not $pr) {
        Write-Error "No open PR found for v2-intake-scaffold. Run gh_create_pr.ps1 first."
        exit 1
    }
    $PRNumber = $pr.number
    Write-Host "Found PR #$PRNumber — $($pr.url)" -ForegroundColor Green
} else {
    Write-Host "Watching PR #$PRNumber" -ForegroundColor Green
}

# Poll loop
$startTime = Get-Date
$maxTime = $startTime.AddMinutes($Timeout)
$iteration = 0

Write-Host ""
Write-Host "Polling CI checks every ${PollInterval}s (timeout: ${Timeout}min)..." -ForegroundColor Yellow
Write-Host ("=" * 60)

while ((Get-Date) -lt $maxTime) {
    $iteration++
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)
    Write-Host ""
    Write-Host "[$elapsed min] Poll #$iteration" -ForegroundColor Cyan

    # Get check status
    $checksJson = gh pr checks $PRNumber --repo $repo --json name,state,conclusion 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "  Failed to fetch checks: $checksJson"
        Start-Sleep -Seconds $PollInterval
        continue
    }

    $checks = $checksJson | ConvertFrom-Json

    if ($checks.Count -eq 0) {
        Write-Host "  No checks found yet. Waiting..." -ForegroundColor DarkGray
        Start-Sleep -Seconds $PollInterval
        continue
    }

    # Display status
    $pending = 0
    $passed = 0
    $failed = 0
    $criticalFailed = $false

    foreach ($check in $checks) {
        $icon = switch ($check.state) {
            "SUCCESS"    { "[PASS]" }
            "FAILURE"    { "[FAIL]" }
            "PENDING"    { "[....]" }
            "QUEUED"     { "[WAIT]" }
            "IN_PROGRESS" { "[RUN.]" }
            default      { "[ ?? ]" }
        }

        $color = switch ($check.state) {
            "SUCCESS"    { "Green" }
            "FAILURE"    { "Red" }
            default      { "Yellow" }
        }

        Write-Host "  $icon $($check.name)" -ForegroundColor $color

        switch ($check.state) {
            "SUCCESS"    { $passed++ }
            "FAILURE"    {
                $failed++
                if ($CRITICAL_CHECKS -contains $check.name) {
                    $criticalFailed = $true
                }
            }
            default      { $pending++ }
        }
    }

    Write-Host "  --- Pass: $passed | Fail: $failed | Pending: $pending ---" -ForegroundColor Cyan

    # Decision logic
    if ($criticalFailed) {
        Write-Host ""
        Write-Host ("=" * 60) -ForegroundColor Red
        Write-Host "CRITICAL CHECK FAILED: V2 Intake Gate did not pass." -ForegroundColor Red
        Write-Host "The PR cannot be merged until this is fixed." -ForegroundColor Red
        Write-Host ("=" * 60) -ForegroundColor Red
        exit 1
    }

    if ($pending -eq 0) {
        Write-Host ""
        Write-Host ("=" * 60) -ForegroundColor Green
        if ($failed -eq 0) {
            Write-Host "ALL CHECKS PASSED ($passed/$($checks.Count))" -ForegroundColor Green
            Write-Host "PR #$PRNumber is ready for review and merge." -ForegroundColor Green
        } else {
            Write-Host "CHECKS COMPLETED: $passed passed, $failed failed" -ForegroundColor Yellow
            Write-Host "Non-critical checks failed. V2 Intake Gate passed." -ForegroundColor Yellow
            Write-Host "Review failures before merging." -ForegroundColor Yellow
        }
        Write-Host ("=" * 60) -ForegroundColor Green
        exit 0
    }

    Start-Sleep -Seconds $PollInterval
}

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Red
Write-Host "TIMEOUT: Checks did not complete within $Timeout minutes." -ForegroundColor Red
Write-Host "Check GitHub Actions directly." -ForegroundColor Red
Write-Host ("=" * 60) -ForegroundColor Red
exit 2
