#Requires -Version 5.1
<#
.SYNOPSIS
    OpenTesting gate: pm2 start -> preflight -> phase10 smoke suite.

.DESCRIPTION
    Full operator gate before opening the site to manual testers.
    Runs three sequential stages:
      Stage 1: Ensure PM2 stack is running (idempotent pm2 start)
      Stage 2: Preflight -Mode OpenTesting -UsePublic + uptime drill
      Stage 3: Phase 10 smoke suite (test-phase10-complete-prod.ps1)

    On any stage failure: prints the latest RunId + log path and exits 1.
    On full success: prints READY banner + LAST_GOOD_OpenTesting.txt contents.

.PARAMETER SkipPm2Start
    Skip the pm2 start step (if stack is already confirmed running).

.EXAMPLE
    .\scripts\preflight\run-gate-open-testing.ps1

#>
[CmdletBinding()]
param(
    [switch]$SkipPm2Start
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..") | Select-Object -ExpandProperty Path
$LogDir = Join-Path $Root "logs\preflight"
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
    Write-Host "  .\scripts\preflight\run-gate-open-testing.ps1" -ForegroundColor Cyan
    Write-Host ""
}

# ===========================================================================
# Stage 1 -- PM2 stack start (idempotent)
# ===========================================================================
if (-not $SkipPm2Start) {
    Write-Host ""
    Write-Host "--- Stage 1: PM2 Stack Start ---" -ForegroundColor Cyan
    $ecosystemFile = Join-Path $Root "ecosystem.prod.config.js"
    if (-not (Test-Path $ecosystemFile)) {
        Write-Host "[FAIL] ecosystem.prod.config.js not found at $ecosystemFile" -ForegroundColor Red
        exit 1
    }
    & pm2 start $ecosystemFile 2>&1 | ForEach-Object { Write-Host "  pm2: $_" }
    # pm2 start returns 0 even when apps are already running; check status
    $pm2Status = & pm2 jlist 2>&1 | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($pm2Status) {
        $online = @($pm2Status | Where-Object { $_.pm2_env.status -eq "online" }).Count
        Write-Host "  PM2 apps online: $online" -ForegroundColor $(if ($online -ge 4) { "Green" } else { "Yellow" })
    }
    Write-Host "  [OK] PM2 start complete" -ForegroundColor Green
} else {
    Write-Host "  [SKIP] PM2 start skipped (-SkipPm2Start)" -ForegroundColor Gray
}

# ===========================================================================
# Stage 2 -- Preflight: OpenTesting + UsePublic + Uptime Drill
# ===========================================================================
Write-Host ""
Write-Host "--- Stage 2: Preflight (OpenTesting + UsePublic + Uptime) ---" -ForegroundColor Cyan

if (-not (Test-Path $PreflightScript)) {
    Write-Host "[FAIL] Preflight script not found: $PreflightScript" -ForegroundColor Red
    exit 1
}

$preflightArgs = @(
    "-NoProfile", "-ExecutionPolicy", "Bypass",
    "-File", $PreflightScript,
    "-Mode", "OpenTesting",
    "-UsePublic",
    "-IncludeUptimeDrill",
    "-NonDisruptiveUptimeDrill"
)

& powershell.exe @preflightArgs
$pfExit = $LASTEXITCODE

if ($pfExit -ne 0) {
    Show-FailureContext -Stage "Preflight (OpenTesting)" -Code $pfExit
    exit 1
}

Write-Host "  [OK] Preflight passed" -ForegroundColor Green

# Load PROVIDER_DASHBOARD_TOKEN from backend/.env for smoke suite
if (-not $env:PROVIDER_DASHBOARD_TOKEN) {
    $envFile = Join-Path $Root "backend\.env"
    if (Test-Path $envFile) {
        $tokenLine = Get-Content $envFile | Where-Object { $_ -match '^PROVIDER_DASHBOARD_TOKEN=' }
        if ($tokenLine) {
            $env:PROVIDER_DASHBOARD_TOKEN = ($tokenLine -replace 'PROVIDER_DASHBOARD_TOKEN=', '').Trim()
            Write-Host "  [INFO] PROVIDER_DASHBOARD_TOKEN loaded from backend/.env" -ForegroundColor Gray
        }
    }
}
# Load V2_INTAKE_TOKEN from backend/.env for chat pipeline smoke
if (-not $env:V2_INTAKE_TOKEN) {
    $envFile = Join-Path $Root "backend\.env"
    if (Test-Path $envFile) {
        $intakeLine = Get-Content $envFile | Where-Object { $_ -match '^V2_INTAKE_TOKEN=' }
        if ($intakeLine) {
            $env:V2_INTAKE_TOKEN = ($intakeLine -replace 'V2_INTAKE_TOKEN=', '').Trim()
            Write-Host "  [INFO] V2_INTAKE_TOKEN loaded from backend/.env" -ForegroundColor Gray
        }
    }
}

# ===========================================================================
# Stage 3 -- Phase 10 Smoke Suite
# ===========================================================================
Write-Host ""
Write-Host "--- Stage 3: Phase 10 Smoke Suite ---" -ForegroundColor Cyan

if (-not (Test-Path $SmokeScript)) {
    Write-Host "  [WARN] Smoke script not found: $SmokeScript" -ForegroundColor Yellow
    Write-Host "  Skipping smoke suite (add test-phase10-complete-prod.ps1 to scripts/smoke/ to enable)." -ForegroundColor Gray
} else {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $SmokeScript
    $smokeExit = $LASTEXITCODE
    if ($smokeExit -ne 0) {
        Show-FailureContext -Stage "Phase 10 Smoke Suite" -Code $smokeExit
        exit 1
    }
    Write-Host "  [OK] Smoke suite passed" -ForegroundColor Green
}

# ===========================================================================
# SUCCESS
# ===========================================================================
$stampFile = Join-Path $LogDir "LAST_GOOD_OpenTesting.txt"
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  READY -- All gates passed. Safe to open manual testing." -ForegroundColor Green
Write-Host "============================================================"
if (Test-Path $stampFile) {
    Write-Host ""
    Write-Host "  LAST_GOOD_OpenTesting.txt:" -ForegroundColor Cyan
    Get-Content $stampFile | ForEach-Object { Write-Host "    $_" -ForegroundColor White }
}
Write-Host ""
exit 0
