<#
.SYNOPSIS
  Apply branch protection rules via GitHub REST API (gh api).

.DESCRIPTION
  Reads branch protection config from config/branch_protection/<branch>.json
  and applies it using the GitHub API. No browser required.

.PARAMETER Branch
  Branch to protect (default: main). Must have a matching JSON config file.

.PARAMETER Profile
  Optional profile name to use (e.g. v2_only, full). If specified, loads
  <branch>.<profile>.json instead of <branch>.json.

.PARAMETER DryRun
  Show the API call that would be made without executing it.

.EXAMPLE
  .\scripts\ga\gh_apply_branch_protection.ps1
  .\scripts\ga\gh_apply_branch_protection.ps1 -Branch main -Profile v2_only
  .\scripts\ga\gh_apply_branch_protection.ps1 -Branch main -Profile full -DryRun
#>

param(
    [string]$Branch = "main",
    [string]$Profile = "",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$REPO_ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# ── Prerequisite Check ──────────────────────────────────────────
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) not found. Install from https://cli.github.com/"
    exit 1
}

# ── Detect Repo ─────────────────────────────────────────────────
Push-Location $REPO_ROOT
try {
    $remote = git remote get-url origin 2>&1
    if ($remote -match "github\.com[:/](.+?)(?:\.git)?$") {
        $repoSlug = $Matches[1]
    } else {
        Write-Error "Cannot parse GitHub repo from remote: $remote"
        exit 1
    }
} finally {
    Pop-Location
}

$owner, $repo = $repoSlug -split '/', 2
Write-Host "Repository: $owner/$repo" -ForegroundColor Cyan
Write-Host "Branch:     $Branch" -ForegroundColor Cyan
if ($Profile) {
    Write-Host "Profile:    $Profile" -ForegroundColor Cyan
}

# ── Load Config ─────────────────────────────────────────────────
$configFilename = if ($Profile) { "$Branch.$Profile.json" } else { "$Branch.json" }
$configPath = Join-Path -Path (Join-Path -Path (Join-Path -Path $REPO_ROOT -ChildPath "config") -ChildPath "branch_protection") -ChildPath $configFilename
if (-not (Test-Path $configPath)) {
    Write-Error "Config not found: $configPath"
    Write-Host "Available configs:" -ForegroundColor Yellow
    Get-ChildItem (Join-Path -Path (Join-Path -Path (Join-Path -Path $REPO_ROOT -ChildPath "config") -ChildPath "branch_protection") -ChildPath "*.json") |
        ForEach-Object { Write-Host "  - $($_.BaseName)" -ForegroundColor Yellow }
    exit 1
}

$configJson = Get-Content $configPath -Raw
if ($Profile) {
    Write-Host ""
    Write-Host "Config loaded from: $configPath" -ForegroundColor Green
    Write-Host "                    (Profile: $Profile)" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Config loaded from: $configPath" -ForegroundColor Green
}

# Parse to show summary
$config = $configJson | ConvertFrom-Json
Write-Host ""
Write-Host "Protection Settings:" -ForegroundColor Cyan
Write-Host "  Required checks: $($config.required_status_checks.contexts -join ', ')" -ForegroundColor White
Write-Host "  Require up-to-date: $($config.required_status_checks.strict)" -ForegroundColor White
Write-Host "  Enforce admins: $($config.enforce_admins)" -ForegroundColor White
Write-Host "  Required reviews: $($config.required_pull_request_reviews.required_approving_review_count)" -ForegroundColor White
Write-Host "  Dismiss stale reviews: $($config.required_pull_request_reviews.dismiss_stale_reviews)" -ForegroundColor White
Write-Host "  Allow force pushes: $($config.allow_force_pushes)" -ForegroundColor White
Write-Host "  Allow deletions: $($config.allow_deletions)" -ForegroundColor White

# ── API Call ────────────────────────────────────────────────────
$apiPath = "repos/$owner/$repo/branches/$Branch/protection"

if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY RUN] Would execute:" -ForegroundColor Magenta
    Write-Host "  gh api -X PUT $apiPath --input $configPath" -ForegroundColor White
    Write-Host ""
    Write-Host "Request body:" -ForegroundColor Magenta
    Write-Host $configJson
    exit 0
}

Write-Host ""
Write-Host "Applying branch protection..." -ForegroundColor Yellow

$result = gh api -X PUT $apiPath --input $configPath 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host ("=" * 50) -ForegroundColor Green
    Write-Host "Branch protection applied to '$Branch'" -ForegroundColor Green
    Write-Host ("=" * 50) -ForegroundColor Green

    # Verify
    Write-Host ""
    Write-Host "Verifying..." -ForegroundColor Cyan
    $verify = gh api "repos/$owner/$repo/branches/$Branch/protection" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $verifyObj = $verify | ConvertFrom-Json
        $checks = $verifyObj.required_status_checks.contexts
        Write-Host "  Active required checks:" -ForegroundColor Green
        foreach ($check in $checks) {
            Write-Host "    [x] $check" -ForegroundColor Green
        }
    }
} else {
    Write-Host ""
    Write-Host ("=" * 50) -ForegroundColor Red
    Write-Host "Failed to apply branch protection!" -ForegroundColor Red
    Write-Host "Error: $result" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common causes:" -ForegroundColor Yellow
    Write-Host "  - Insufficient permissions (need admin access)" -ForegroundColor Yellow
    Write-Host "  - GitHub Free plan limits (some features require Pro/Team)" -ForegroundColor Yellow
    Write-Host "  - Branch does not exist on remote" -ForegroundColor Yellow
    Write-Host ("=" * 50) -ForegroundColor Red
    exit 1
}
