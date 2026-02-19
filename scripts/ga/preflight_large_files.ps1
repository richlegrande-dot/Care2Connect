<#
.SYNOPSIS
  Detect large files (>50MB) tracked by Git.

.DESCRIPTION
  Scans all Git-tracked files for anything over the size threshold.
  Exits non-zero if large files are found.

.PARAMETER ThresholdMB
  Size threshold in megabytes (default: 50)

.EXAMPLE
  .\scripts\ga\preflight_large_files.ps1
  .\scripts\ga\preflight_large_files.ps1 -ThresholdMB 25
#>

param(
    [int]$ThresholdMB = 50
)

$ErrorActionPreference = "Stop"
$REPO_ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Push-Location $REPO_ROOT

$thresholdBytes = $ThresholdMB * 1MB
$largeFiles = @()

Write-Host "Scanning for tracked files > ${ThresholdMB}MB..." -ForegroundColor Cyan

$trackedFiles = git ls-files 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to list git tracked files"
    Pop-Location
    exit 1
}

foreach ($file in $trackedFiles) {
    if (-not (Test-Path $file)) { continue }
    $size = (Get-Item $file).Length
    if ($size -gt $thresholdBytes) {
        $sizeMB = [math]::Round($size / 1MB, 1)
        $largeFiles += [PSCustomObject]@{
            File = $file
            SizeMB = $sizeMB
        }
        Write-Host "  [!] $file — ${sizeMB}MB" -ForegroundColor Red
    }
}

Pop-Location

if ($largeFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "$($largeFiles.Count) large file(s) found (>${ThresholdMB}MB)." -ForegroundColor Red
    Write-Host "Consider adding to .gitignore or using Git LFS." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "  No large files found." -ForegroundColor Green
    exit 0
}
