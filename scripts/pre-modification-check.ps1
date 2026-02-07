# Pre-Modification Safety Check
# Usage: .\scripts\pre-modification-check.ps1

param([switch]$Force)

Write-Host "Pre-Modification Safety Check" -ForegroundColor Cyan
Write-Host "==============================`n" -ForegroundColor Cyan

$failed = $false

# Check 1: Git status
Write-Host "Check 1: Git Status" -ForegroundColor Yellow
$gitStatus = git status --porcelain backend/src/services/
if ($gitStatus) {
    Write-Host "FAILED: Uncommitted changes in services/" -ForegroundColor Red
    Write-Host $gitStatus
    Write-Host "`nCommit current state first:" -ForegroundColor Yellow
    Write-Host "  git add backend/src/services/" -ForegroundColor Cyan
    Write-Host "  git commit -m 'Checkpoint before modifications'" -ForegroundColor Cyan
    $failed = $true
} else {
    Write-Host "PASSED: Git is clean`n" -ForegroundColor Green
}

# Check 2: Baseline documented
Write-Host "Check 2: Baseline Documentation" -ForegroundColor Yellow
$latestReport = Get-ChildItem backend/eval/v4plus/reports/*.json -ErrorAction SilentlyContinue | 
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
if (-not $latestReport) {
    Write-Host "FAILED: No baseline test report found" -ForegroundColor Red
    Write-Host "Run evaluation first:" -ForegroundColor Yellow
    Write-Host "  cd backend/eval/v4plus" -ForegroundColor Cyan
    Write-Host "  node runners/run_eval_v4plus.js --dataset all500" -ForegroundColor Cyan
    $failed = $true
} else {
    $report = Get-Content $latestReport.FullName | ConvertFrom-Json
    $age = (Get-Date) - $latestReport.LastWriteTime
    Write-Host "PASSED: Baseline found" -ForegroundColor Green
    Write-Host "  Rate: $($report.summary.strictPassRate)" -ForegroundColor Gray
    Write-Host "  Cases: $($report.summary.strictPasses)/$($report.metadata.totalCases)" -ForegroundColor Gray
    Write-Host "  Age: $($age.TotalHours.ToString('0.0')) hours`n" -ForegroundColor Gray
}

# Check 3: Create snapshots
Write-Host "Check 3: Configuration Snapshot" -ForegroundColor Yellow
if (-not (Test-Path "snapshots")) {
    New-Item -ItemType Directory -Path "snapshots" -Force | Out-Null
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'

# Save environment
$envFile = "snapshots/env-$timestamp.txt"
Get-ChildItem Env:USE_* -ErrorAction SilentlyContinue | Out-String | Out-File $envFile
Write-Host "PASSED: Environment saved to $envFile" -ForegroundColor Green

# Backup services
$backupDir = "snapshots/services-$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Copy-Item backend/src/services/*.js $backupDir/ -ErrorAction SilentlyContinue
Write-Host "PASSED: Services backed up to $backupDir`n" -ForegroundColor Green

# Check 4: Git branch
Write-Host "Check 4: Git Branch Strategy" -ForegroundColor Yellow
$currentBranch = git rev-parse --abbrev-ref HEAD 2>$null
if ($currentBranch -eq "master" -or $currentBranch -eq "main") {
    Write-Host "WARNING: On master/main branch" -ForegroundColor Yellow
    Write-Host "  Consider: git checkout -b enhancement/description`n" -ForegroundColor Cyan
} else {
    Write-Host "PASSED: On feature branch: $currentBranch`n" -ForegroundColor Green
}

# Summary
Write-Host "==============================" -ForegroundColor Cyan
if ($failed -and -not $Force) {
    Write-Host "SAFETY CHECK FAILED" -ForegroundColor Red
    Write-Host "Fix issues above before proceeding" -ForegroundColor Red
    Write-Host "==============================" -ForegroundColor Cyan
    exit 1
}

Write-Host "SAFETY CHECK PASSED" -ForegroundColor Green
Write-Host "==============================`n" -ForegroundColor Cyan
Write-Host "Rollback commands:" -ForegroundColor Cyan
Write-Host "  git checkout HEAD -- backend/src/services/" -ForegroundColor Gray
Write-Host "  Copy-Item $backupDir/* backend/src/services/ -Force`n" -ForegroundColor Gray
exit 0
