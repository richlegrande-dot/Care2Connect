<#
.SYNOPSIS
  Idempotent PR creation for V2 Intake GA merge.

.DESCRIPTION
  Creates a pull request from v2-intake-scaffold → main using the gh CLI.
  If a PR already exists, prints its URL and exits cleanly.

.PARAMETER Base
  Target branch (default: main)

.PARAMETER DryRun
  Print what would happen without creating anything.

.EXAMPLE
  .\scripts\ga\gh_create_pr.ps1
  .\scripts\ga\gh_create_pr.ps1 -Base develop -DryRun
#>

param(
    [string]$Base = "main",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$HEAD_BRANCH = "v2-intake-scaffold"
$REPO_ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# ── Prerequisite Check ──────────────────────────────────────────
function Assert-GhCli {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        Write-Error "ERROR: GitHub CLI (gh) is not installed. Install from https://cli.github.com/"
        exit 1
    }
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "ERROR: Not authenticated with gh. Run 'gh auth login' first."
        exit 1
    }
}

# ── Detect Repo ─────────────────────────────────────────────────
function Get-RepoSlug {
    Push-Location $REPO_ROOT
    try {
        $remote = git remote get-url origin 2>&1
        if ($remote -match "github\.com[:/](.+?)(?:\.git)?$") {
            return $Matches[1]
        }
        Write-Error "Cannot parse GitHub repo from remote: $remote"
        exit 1
    } finally {
        Pop-Location
    }
}

# ── Check for Existing PR ──────────────────────────────────────
function Find-ExistingPR {
    param([string]$Repo)
    $existing = gh pr list --repo $Repo --head $HEAD_BRANCH --base $Base --json number,url,state --limit 1 2>&1
    if ($LASTEXITCODE -eq 0 -and $existing -ne "[]" -and $existing -ne "") {
        $pr = $existing | ConvertFrom-Json
        if ($pr.Count -gt 0) {
            return $pr[0]
        }
    }
    return $null
}

# ── Load PR Body Template ──────────────────────────────────────
function Get-PRBody {
    $templatePath = Join-Path $REPO_ROOT "docs" "templates" "PR_V2_INTAKE_GA.md"
    if (Test-Path $templatePath) {
        return Get-Content $templatePath -Raw
    }
    return @"
## V2 Intake Scaffold - GA Merge

Merges the V2 Intake system (scoring engine, policy pack, calibration, DV-safe module,
fairness monitor, HMIS export, and all 195 unit tests) into the main branch.

### Pre-merge Checklist
- [ ] All CI checks pass (V2 Intake Gate, Backend Tests, Lint, Type Check)
- [ ] Clinical calibration review completed
- [ ] DV-safe panic button verified
- [ ] Branch protection rules active on main

### Test Summary
- 195 V2 intake unit tests (--bail mode)
- 8 module areas covered
- Zero OpenAI dependency (ZERO_OPENAI_MODE=true)
"@
}

# ── Main ────────────────────────────────────────────────────────
Assert-GhCli
$repo = Get-RepoSlug
Write-Host "Repository: $repo" -ForegroundColor Cyan
Write-Host "PR: $HEAD_BRANCH → $Base" -ForegroundColor Cyan

# Check for existing PR
$existingPR = Find-ExistingPR -Repo $repo
if ($existingPR) {
    Write-Host ""
    Write-Host "PR already exists:" -ForegroundColor Green
    Write-Host "  #$($existingPR.number) - $($existingPR.url)" -ForegroundColor Yellow
    Write-Host "  State: $($existingPR.state)" -ForegroundColor Yellow
    exit 0
}

# Create new PR
$body = Get-PRBody
$title = "feat: V2 Intake Scaffold - GA Merge to $Base"

if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY RUN] Would create PR:" -ForegroundColor Magenta
    Write-Host "  Title: $title"
    Write-Host "  Head:  $HEAD_BRANCH"
    Write-Host "  Base:  $Base"
    Write-Host "  Body:  ($(($body -split "`n").Count) lines from template)"
    exit 0
}

Write-Host ""
Write-Host "Creating PR..." -ForegroundColor Yellow

# Write body to temp file to avoid escaping issues
$tempBody = [System.IO.Path]::GetTempFileName()
$body | Set-Content -Path $tempBody -Encoding UTF8

try {
    $result = gh pr create `
        --repo $repo `
        --head $HEAD_BRANCH `
        --base $Base `
        --title $title `
        --body-file $tempBody `
        --label "v2-intake,ga-readiness" 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "PR created successfully!" -ForegroundColor Green
        Write-Host "  URL: $result" -ForegroundColor Yellow
    } else {
        Write-Warning "gh pr create returned non-zero. Output: $result"
        # Try without labels (labels may not exist)
        $result = gh pr create `
            --repo $repo `
            --head $HEAD_BRANCH `
            --base $Base `
            --title $title `
            --body-file $tempBody 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "PR created (without labels):" -ForegroundColor Green
            Write-Host "  URL: $result" -ForegroundColor Yellow
        } else {
            Write-Error "Failed to create PR: $result"
            exit 1
        }
    }
} finally {
    Remove-Item $tempBody -ErrorAction SilentlyContinue
}
