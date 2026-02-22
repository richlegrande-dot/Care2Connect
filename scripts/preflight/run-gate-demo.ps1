#Requires -Version 5.1
<#
.SYNOPSIS
    Demo gate: preflight (Demo + UseCaddy) -> smoke suite.

.DESCRIPTION
    Operator gate for demo sessions.
    Runs two sequential stages:
      Stage 1: Preflight -Mode Demo -UseCaddy
      Stage 2: Phase 10 smoke suite (or shorter demo smoke if available)

    On any stage failure: prints the latest RunId + log path and exits 1.
    On full success: prints READY banner + LAST_GOOD_Demo.txt contents.

.EXAMPLE
    .\scripts\preflight\run-gate-demo.ps1

#>
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..") | Select-Object -ExpandProperty Path
$LogDir          = Join-Path $Root "logs\preflight"
$PreflightScript = Join-Path $Root "scripts\preflight\start-preflight.ps1"
$SmokeScript     = Join-Path $Root "scripts\smoke\test-phase10-complete-prod.ps1"

function Get-LatestRunId {
    if (-not (Test-Path $LogDir)) { return $null }
    $latest = Get-ChildItem (Join-Path $LogDir "preflight_*.log") -ErrorAction SilentlyContinue |
              Sort-Object LastWriteTime -Descending |
              Select-Object -First 1
    if ($latest) { return $latest.BaseName } else { return $null }
}

function Show-FailureContext {
    param([string]$Stage, [int]$Code)
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "  GATE FAILED at: $Stage (exit $Code)" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    $runId = Get-LatestRunId
    if ($runId) {
        $logPath = Join-Path $LogDir "$runId.log"
        Write-Host "  RunId  : $runId" -ForegroundColor Yellow
        Write-Host "  Log    : $logPath" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  First failure in log:" -ForegroundColor Gray
        if (Test-Path $logPath) {
            Select-String "\[FAIL\]" $logPath | Select-Object -First 5 |
                ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
        }
    }
    Write-Host ""
    Write-Host "  Fix the issue above, then re-run:" -ForegroundColor Yellow
    Write-Host "  .\scripts\preflight\run-gate-demo.ps1" -ForegroundColor Cyan
    Write-Host ""
}

# ===========================================================================
# Stage 1 -- Preflight: Demo + UseCaddy
# ===========================================================================
Write-Host ""
Write-Host "--- Stage 1: Preflight (Demo + UseCaddy) ---" -ForegroundColor Cyan

if (-not (Test-Path $PreflightScript)) {
    Write-Host "[FAIL] Preflight script not found: $PreflightScript" -ForegroundColor Red
    exit 1
}

$preflightArgs = @(
    "-NoProfile", "-ExecutionPolicy", "Bypass",
    "-File", $PreflightScript,
    "-Mode", "Demo",
    "-UseCaddy"
)

& powershell.exe @preflightArgs
$pfExit = $LASTEXITCODE

if ($pfExit -ne 0) {
    Show-FailureContext -Stage "Preflight (Demo + UseCaddy)" -Code $pfExit
    exit 1
}

Write-Host "  [OK] Preflight passed" -ForegroundColor Green

# ===========================================================================
# Stage 2 -- Smoke Suite
# ===========================================================================
Write-Host ""
Write-Host "--- Stage 2: Smoke Suite ---" -ForegroundColor Cyan

if (-not (Test-Path $SmokeScript)) {
    Write-Host "  [WARN] Smoke script not found: $SmokeScript" -ForegroundColor Yellow
    Write-Host "  Skipping smoke suite." -ForegroundColor Gray
} else {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $SmokeScript
    $smokeExit = $LASTEXITCODE
    if ($smokeExit -ne 0) {
        Show-FailureContext -Stage "Smoke Suite" -Code $smokeExit
        exit 1
    }
    Write-Host "  [OK] Smoke suite passed" -ForegroundColor Green
}

# ===========================================================================
# SUCCESS
# ===========================================================================
$stampFile = Join-Path $LogDir "LAST_GOOD_Demo.txt"
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  READY -- Demo gate passed. Safe to proceed with demo." -ForegroundColor Green
Write-Host "============================================================"
if (Test-Path $stampFile) {
    Write-Host ""
    Write-Host "  LAST_GOOD_Demo.txt:" -ForegroundColor Cyan
    Get-Content $stampFile | ForEach-Object { Write-Host "    $_" -ForegroundColor White }
}
Write-Host ""
exit 0
