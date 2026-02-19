<#
.SYNOPSIS
  Phase 9 - Local Preview (one-command start for V2 Intake QA)

.DESCRIPTION
  Starts backend + frontend for local V2 Intake testing.
  Sets ENABLE_V2_INTAKE=true so V2 routes are active.
  Sets ZERO_OPENAI_MODE=true (no external API calls).
  Runs health checks and prints URLs.

  Windows PowerShell 5.1 compatible (ASCII-only, nested Join-Path).

.EXAMPLE
  .\scripts\ga\phase9_start_local_preview.ps1
#>

$ErrorActionPreference = "Stop"
$REPO_ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "  Phase 9 - Local Preview Startup" -ForegroundColor Cyan
Write-Host "  Branch: $(git -C $REPO_ROOT rev-parse --abbrev-ref HEAD 2>$null)" -ForegroundColor Gray
Write-Host "  Commit: $(git -C $REPO_ROOT rev-parse --short HEAD 2>$null)" -ForegroundColor Gray
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

# -- Load canonical ports ------------------------------------------------
$portsFile = Join-Path -Path (Join-Path -Path $REPO_ROOT -ChildPath "config") -ChildPath "ports.json"
if (-not (Test-Path $portsFile)) {
    Write-Error "Ports config not found: $portsFile"
    exit 1
}
$ports = Get-Content $portsFile -Raw | ConvertFrom-Json
$BACKEND_PORT  = $ports.backend   # 3001
$FRONTEND_PORT = $ports.frontend  # 3000

Write-Host "[CONFIG] Backend port : $BACKEND_PORT" -ForegroundColor Gray
Write-Host "[CONFIG] Frontend port: $FRONTEND_PORT" -ForegroundColor Gray

# -- Check Node version --------------------------------------------------
Write-Host ""
Write-Host "[CHECK] Node.js version..." -ForegroundColor Cyan
$nodeVer = node --version 2>$null
if (-not $nodeVer) {
    Write-Error "Node.js not found in PATH. Install Node 24 LTS."
    exit 1
}
Write-Host "  Node: $nodeVer" -ForegroundColor Green

$npmVer = npm --version 2>$null
Write-Host "  npm:  v$npmVer" -ForegroundColor Green

# Warn if not Node 24
if ($nodeVer -notmatch "^v2[4-9]") {
    Write-Host "  [WARN] Expected Node 24 LTS. Current: $nodeVer" -ForegroundColor Yellow
}

# -- Kill existing node processes on target ports -------------------------
Write-Host ""
Write-Host "[CLEANUP] Checking for processes on ports $BACKEND_PORT and $FRONTEND_PORT..." -ForegroundColor Cyan

$portConflicts = @()
foreach ($port in @($BACKEND_PORT, $FRONTEND_PORT)) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        foreach ($c in $conn) {
            $proc = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
            if ($proc) {
                $portConflicts += "  Port $port : $($proc.ProcessName) (PID $($proc.Id))"
                Write-Host "  Stopping $($proc.ProcessName) (PID $($proc.Id)) on port $port" -ForegroundColor Yellow
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            }
        }
    }
}
if ($portConflicts.Count -eq 0) {
    Write-Host "  No conflicts found" -ForegroundColor Green
} else {
    Start-Sleep -Seconds 2
}

# -- Install dependencies ------------------------------------------------
Write-Host ""
Write-Host "[DEPS] Installing backend dependencies..." -ForegroundColor Cyan
$backendDir = Join-Path -Path $REPO_ROOT -ChildPath "backend"
$backendLock = Join-Path -Path $backendDir -ChildPath "package-lock.json"

Push-Location $backendDir
try {
    if (Test-Path $backendLock) {
        npm ci --silent 2>$null
        Write-Host "  Backend: npm ci complete" -ForegroundColor Green
    } else {
        npm install --silent 2>$null
        Write-Host "  Backend: npm install complete" -ForegroundColor Green
    }
} finally {
    Pop-Location
}

Write-Host "[DEPS] Installing frontend dependencies..." -ForegroundColor Cyan
$frontendDir = Join-Path -Path $REPO_ROOT -ChildPath "frontend"
$frontendLock = Join-Path -Path $frontendDir -ChildPath "package-lock.json"

Push-Location $frontendDir
try {
    if (Test-Path $frontendLock) {
        npm ci --silent 2>$null
        Write-Host "  Frontend: npm ci complete" -ForegroundColor Green
    } else {
        npm install --silent 2>$null
        Write-Host "  Frontend: npm install complete" -ForegroundColor Green
    }
} finally {
    Pop-Location
}

# -- Set environment for V2 preview --------------------------------------
$env:ZERO_OPENAI_MODE    = "true"
$env:NODE_ENV             = "development"
$env:ENABLE_V2_INTAKE     = "true"
$env:ENABLE_V2_INTAKE_AUTH = "true"
$env:V1_STABLE            = "true"
$env:AI_PROVIDER          = "rules"
$env:PORT                 = "$BACKEND_PORT"

# Frontend env
$env:NEXT_PUBLIC_ENABLE_V2_INTAKE = "true"
$env:NEXT_PUBLIC_API_URL = "http://localhost:$BACKEND_PORT"

Write-Host ""
Write-Host "[ENV] Preview environment variables set:" -ForegroundColor Cyan
Write-Host "  ENABLE_V2_INTAKE      = true" -ForegroundColor White
Write-Host "  ENABLE_V2_INTAKE_AUTH = true  (auth required on V2 endpoints)" -ForegroundColor White
Write-Host "  ZERO_OPENAI_MODE      = true  (no external API calls)" -ForegroundColor White
Write-Host "  V1_STABLE             = true" -ForegroundColor White
Write-Host "  AI_PROVIDER           = rules (deterministic)" -ForegroundColor White
Write-Host "  NODE_ENV              = development" -ForegroundColor White
Write-Host "  NEXT_PUBLIC_API_URL   = http://localhost:$BACKEND_PORT" -ForegroundColor White

# -- Start Backend --------------------------------------------------------
Write-Host ""
Write-Host "[START] Starting backend (port $BACKEND_PORT)..." -ForegroundColor Cyan

$backendLogDir = Join-Path -Path $REPO_ROOT -ChildPath "logs"
if (-not (Test-Path $backendLogDir)) { New-Item -ItemType Directory -Path $backendLogDir -Force | Out-Null }
$backendLog = Join-Path -Path $backendLogDir -ChildPath "phase9-backend.log"

$backendJob = Start-Job -ScriptBlock {
    param($dir, $log, $port, $env_vars)
    Set-Location $dir
    $env:ZERO_OPENAI_MODE     = "true"
    $env:NODE_ENV              = "development"
    $env:ENABLE_V2_INTAKE      = "true"
    $env:ENABLE_V2_INTAKE_AUTH = "true"
    $env:V1_STABLE             = "true"
    $env:AI_PROVIDER           = "rules"
    $env:PORT                  = $port
    & npm run dev 2>&1 | Tee-Object -FilePath $log
} -ArgumentList $backendDir, $backendLog, "$BACKEND_PORT", $null

Write-Host "  Backend job started (ID: $($backendJob.Id))" -ForegroundColor Green
Write-Host "  Log: $backendLog" -ForegroundColor Gray

# -- Start Frontend -------------------------------------------------------
Write-Host ""
Write-Host "[START] Starting frontend (port $FRONTEND_PORT)..." -ForegroundColor Cyan

$frontendLog = Join-Path -Path $backendLogDir -ChildPath "phase9-frontend.log"

$frontendJob = Start-Job -ScriptBlock {
    param($dir, $log, $apiUrl)
    Set-Location $dir
    $env:NEXT_PUBLIC_ENABLE_V2_INTAKE = "true"
    $env:NEXT_PUBLIC_API_URL = $apiUrl
    & npm run dev 2>&1 | Tee-Object -FilePath $log
} -ArgumentList $frontendDir, $frontendLog, "http://localhost:$BACKEND_PORT"

Write-Host "  Frontend job started (ID: $($frontendJob.Id))" -ForegroundColor Green
Write-Host "  Log: $frontendLog" -ForegroundColor Gray

# -- Wait for services to become ready ------------------------------------
Write-Host ""
Write-Host "[HEALTH] Waiting for services to start..." -ForegroundColor Cyan

$maxWait = 60
$interval = 3
$elapsed = 0
$backendReady = $false
$frontendReady = $false

while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds $interval
    $elapsed += $interval

    # Check backend
    if (-not $backendReady) {
        try {
            $r = Invoke-WebRequest -Uri "http://localhost:$BACKEND_PORT/health/live" -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($r.StatusCode -eq 200) {
                $backendReady = $true
                Write-Host "  [PASS] Backend /health/live (${elapsed}s)" -ForegroundColor Green
            }
        } catch { }
    }

    # Check frontend
    if (-not $frontendReady) {
        try {
            $r = Invoke-WebRequest -Uri "http://localhost:$FRONTEND_PORT" -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($r.StatusCode -eq 200) {
                $frontendReady = $true
                Write-Host "  [PASS] Frontend / (${elapsed}s)" -ForegroundColor Green
            }
        } catch { }
    }

    if ($backendReady -and $frontendReady) { break }

    $pct = [math]::Floor(($elapsed / $maxWait) * 100)
    Write-Host "  Waiting... ${elapsed}s / ${maxWait}s ($pct%)" -ForegroundColor Gray
}

if (-not $backendReady) {
    Write-Host "  [FAIL] Backend did not start within ${maxWait}s" -ForegroundColor Red
    Write-Host "  Check log: $backendLog" -ForegroundColor Yellow
}
if (-not $frontendReady) {
    Write-Host "  [FAIL] Frontend did not start within ${maxWait}s" -ForegroundColor Red
    Write-Host "  Check log: $frontendLog" -ForegroundColor Yellow
}

# -- Run V2 health checks ------------------------------------------------
Write-Host ""
Write-Host "[HEALTH] V2 Intake endpoint checks..." -ForegroundColor Cyan

$checks = @(
    @{ Name = "/health/live";              Url = "http://localhost:$BACKEND_PORT/health/live" },
    @{ Name = "/api/v2/intake/health";     Url = "http://localhost:$BACKEND_PORT/api/v2/intake/health" },
    @{ Name = "/api/v2/intake/version";    Url = "http://localhost:$BACKEND_PORT/api/v2/intake/version" }
)

$allPass = $true
foreach ($check in $checks) {
    try {
        $r = Invoke-WebRequest -Uri $check.Url -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($r.StatusCode -eq 200) {
            Write-Host "  [PASS] $($check.Name)" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] $($check.Name) - Status $($r.StatusCode)" -ForegroundColor Red
            $allPass = $false
        }
    } catch {
        Write-Host "  [FAIL] $($check.Name) - $($_.Exception.Message)" -ForegroundColor Red
        $allPass = $false
    }
}

# -- Print Summary --------------------------------------------------------
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "  Phase 9 Local Preview - Summary" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

if ($backendReady -and $frontendReady -and $allPass) {
    Write-Host "  STATUS: ALL SERVICES RUNNING" -ForegroundColor Green
} else {
    Write-Host "  STATUS: PARTIAL - Check failures above" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  LOCAL URLs:" -ForegroundColor White
Write-Host "    Frontend (home):     http://localhost:$FRONTEND_PORT/" -ForegroundColor Cyan
Write-Host "    V2 Intake Wizard:    http://localhost:$FRONTEND_PORT/onboarding/v2" -ForegroundColor Cyan
Write-Host "    Backend API:         http://localhost:$BACKEND_PORT/" -ForegroundColor Cyan
Write-Host "    Backend Health:      http://localhost:$BACKEND_PORT/health/live" -ForegroundColor Cyan
Write-Host "    V2 Health:           http://localhost:$BACKEND_PORT/api/v2/intake/health" -ForegroundColor Cyan
Write-Host "    V2 Version:          http://localhost:$BACKEND_PORT/api/v2/intake/version" -ForegroundColor Cyan
Write-Host "    V2 Schema:           http://localhost:$BACKEND_PORT/api/v2/intake/schema" -ForegroundColor Cyan
Write-Host "    Panic Button:        http://localhost:$BACKEND_PORT/api/v2/intake/panic-button" -ForegroundColor Cyan

Write-Host ""
Write-Host "  LOGS:" -ForegroundColor White
Write-Host "    Backend:  $backendLog" -ForegroundColor Gray
Write-Host "    Frontend: $frontendLog" -ForegroundColor Gray

Write-Host ""
Write-Host "  STOP COMMAND:" -ForegroundColor White
Write-Host "    Get-Job | Stop-Job; Get-Job | Remove-Job" -ForegroundColor Yellow
Write-Host "    # Or close this terminal" -ForegroundColor Gray

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
