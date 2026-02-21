#!/usr/bin/env pwsh
# verify-urgency-checksum.ps1
# Verifies UrgencyAssessmentService.js hasn't drifted from known-good version

param(
    [switch]$Quiet = $false
)

$servicePath = "backend\src\services\UrgencyAssessmentService.js"
$checksumPath = "backend\src\services\urgency_snapshots\urgency.checksum.txt"
$safePath = "backend\src\services\urgency_snapshots\UrgencyAssessmentService.v_safe.js"

if (-not (Test-Path $servicePath)) {
    Write-Error "UrgencyAssessmentService.js not found at $servicePath"
    exit 1
}

if (-not (Test-Path $checksumPath)) {
    Write-Warning "Checksum file not found. Generating from v_safe.js..."
    if (Test-Path $safePath) {
        $hash = (Get-FileHash -Algorithm SHA256 $safePath).Hash
        Set-Content -Path $checksumPath -Value $hash
        Write-Host "[OK] Checksum generated: $hash"
    } else {
        Write-Error "v_safe.js not found. Cannot generate checksum."
        exit 1
    }
}

$expectedHash = (Get-Content $checksumPath).Trim()
$actualHash = (Get-FileHash -Algorithm SHA256 $servicePath).Hash

if ($expectedHash -eq $actualHash) {
    if (-not $Quiet) {
        Write-Host "[OK] UrgencyAssessmentService checksum VALID" -ForegroundColor Green
        Write-Host "   Expected: $expectedHash"
        Write-Host "   Actual:   $actualHash"
    }
    exit 0
} else {
    Write-Host "[ERROR] UrgencyAssessmentService checksum MISMATCH" -ForegroundColor Red
    Write-Host "   Expected: $expectedHash"
    Write-Host "   Actual:   $actualHash"
    Write-Host ""
    Write-Host "[WARN] UrgencyAssessmentService.js has been modified!" -ForegroundColor Yellow
    Write-Host "   This may cause evaluation regression."
    Write-Host ""
    Write-Host "To restore known-good version:"
    Write-Host "   .\scripts\restore-urgency-safe.ps1"
    exit 1
}
