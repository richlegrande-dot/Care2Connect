<#
.SYNOPSIS
  Create evidence capture folder for Phase 9 QA.

.DESCRIPTION
  Creates a timestamped folder under outreach/generated/phase9_evidence/
  with subfolders for screenshots, logs, api_responses, and notes.
  Opens the folder in Explorer.

.EXAMPLE
  .\scripts\ga\phase9_create_evidence_folder.ps1
#>

$ErrorActionPreference = "Stop"
$REPO_ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$evidenceBase = Join-Path -Path (Join-Path -Path (Join-Path -Path $REPO_ROOT -ChildPath "outreach") -ChildPath "generated") -ChildPath "phase9_evidence"
$evidenceDir = Join-Path -Path $evidenceBase -ChildPath $timestamp

# Create folder structure
$subfolders = @("screenshots", "logs", "api_responses", "notes")
foreach ($sub in $subfolders) {
    $subPath = Join-Path -Path $evidenceDir -ChildPath $sub
    New-Item -ItemType Directory -Path $subPath -Force | Out-Null
}

# Create README in the evidence folder
$readmeContent = @"
# Phase 9 QA Evidence - $timestamp

## Folder Structure
- screenshots/  - Browser screenshots of each test step
- logs/         - Service logs captured during testing
- api_responses/ - curl/API response captures
- notes/        - Tester notes and observations

## Commit Under Test
- Branch: $(git -C $REPO_ROOT rev-parse --abbrev-ref HEAD 2>$null)
- Commit: $(git -C $REPO_ROOT rev-parse --short HEAD 2>$null)
- Date:   $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Test Environment
- Local backend:  http://localhost:3001
- Local frontend: http://localhost:3000
- Public domain:  https://care2connects.org (if tunnel active)

## Checklist Reference
See docs/V2_PHASE9_MANUAL_QA_CHECKLIST.md
"@

$readmePath = Join-Path -Path $evidenceDir -ChildPath "README.md"
Set-Content -Path $readmePath -Value $readmeContent -Encoding UTF8

Write-Host ""
Write-Host "Phase 9 Evidence Folder Created" -ForegroundColor Green
Write-Host "  Path: $evidenceDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Subfolders:" -ForegroundColor White
foreach ($sub in $subfolders) {
    Write-Host "    - $sub/" -ForegroundColor Gray
}
Write-Host ""

# Open in Explorer
explorer.exe $evidenceDir

Write-Host "  Opened in Explorer." -ForegroundColor Green
Write-Host ""
