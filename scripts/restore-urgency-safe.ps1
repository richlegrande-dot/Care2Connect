#!/usr/bin/env pwsh
# restore-urgency-safe.ps1
# Restores UrgencyAssessmentService.js to known-good v_safe version

param(
    [switch]$Force = $false,
    [switch]$Backup = $true
)

$servicePath = "backend\src\services\UrgencyAssessmentService.js"
$safePath = "backend\src\services\urgency_snapshots\UrgencyAssessmentService.v_safe.js"
$backupPath = "backend\src\services\urgency_snapshots\UrgencyAssessmentService.v_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').js"

if (-not (Test-Path $safePath)) {
    Write-Error "v_safe.js not found at $safePath"
    exit 1
}

# Verify checksum first (unless Force)
if (-not $Force) {
    Write-Host "Checking current service status..."
    $verifyResult = & ".\scripts\verify-urgency-checksum.ps1" -Quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Service already matches v_safe. No restore needed." -ForegroundColor Green
        exit 0
    }
    Write-Host "[WARN] Service has drifted. Proceeding with restore..." -ForegroundColor Yellow
}

# Backup current version
if ($Backup -and (Test-Path $servicePath)) {
    Write-Host "[BACKUP] Backing up current version to: $backupPath"
    Copy-Item $servicePath $backupPath
}

# Restore v_safe
Write-Host "[RESTORE] Restoring v_safe.js to active location..."
Copy-Item $safePath $servicePath -Force

# Verify restoration
$verifyResult = & ".\scripts\verify-urgency-checksum.ps1" -Quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] UrgencyAssessmentService.js restored successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Run evaluation: npm run eval:v4plus:core"
    Write-Host "  2. Verify Core30 pass rate >= 95%"
    if ($Backup) {
        Write-Host "  3. Backup saved at: $backupPath"
    }
} else {
    Write-Host "[ERROR] Restoration failed. Checksum still invalid." -ForegroundColor Red
    exit 1
}
