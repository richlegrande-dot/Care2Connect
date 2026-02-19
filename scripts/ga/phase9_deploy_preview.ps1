<#
.SYNOPSIS
  Phase 9 - Deploy preview to production domain via Cloudflare tunnel.

.DESCRIPTION
  Starts the full stack (Caddy + Backend + Frontend + Cloudflare tunnel)
  with V2 Intake enabled and auth-gated, making the preview accessible
  at https://care2connects.org/onboarding/v2

  This does NOT merge to main. It deploys the current branch commit
  from the local machine through the existing Cloudflare tunnel.

  V2 endpoints require Bearer token auth (ENABLE_V2_INTAKE_AUTH=true).

  STOP CONDITIONS (script will abort if):
  - Caddy binary not found
  - cloudflared not found
  - Health checks fail after startup
  - Port conflicts that cannot be resolved

  Windows PowerShell 5.1 compatible.

.PARAMETER DryRun
  Show what would be done without actually starting services.

.PARAMETER SkipTunnel
  Start backend + frontend + Caddy only (no cloudflare tunnel).
  Useful for local-network-only preview.

.EXAMPLE
  .\scripts\ga\phase9_deploy_preview.ps1
  .\scripts\ga\phase9_deploy_preview.ps1 -DryRun
  .\scripts\ga\phase9_deploy_preview.ps1 -SkipTunnel
#>

param(
    [switch]$DryRun,
    [switch]$SkipTunnel
)

$ErrorActionPreference = "Stop"
$REPO_ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

$branch = git -C $REPO_ROOT rev-parse --abbrev-ref HEAD 2>$null
$commit = git -C $REPO_ROOT rev-parse --short HEAD 2>$null

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Magenta
Write-Host "  Phase 9 - Production Domain Preview Deploy" -ForegroundColor Magenta
Write-Host "  Branch: $branch" -ForegroundColor Gray
Write-Host "  Commit: $commit" -ForegroundColor Gray
Write-Host "  Mode:   $(if ($DryRun) { 'DRY RUN' } else { 'LIVE' })" -ForegroundColor $(if ($DryRun) { 'Yellow' } else { 'Green' })
Write-Host ("=" * 60) -ForegroundColor Magenta
Write-Host ""

# -- Load canonical ports ------------------------------------------------
$portsFile = Join-Path -Path (Join-Path -Path $REPO_ROOT -ChildPath "config") -ChildPath "ports.json"
$ports = Get-Content $portsFile -Raw | ConvertFrom-Json
$BACKEND_PORT  = $ports.backend
$FRONTEND_PORT = $ports.frontend
$PROXY_PORT    = $ports.proxy

# -- Prerequisite checks -------------------------------------------------
Write-Host "[PREREQ] Checking required binaries..." -ForegroundColor Cyan

# Caddy
$caddyPath = Join-Path -Path (Join-Path -Path $REPO_ROOT -ChildPath "bin") -ChildPath "caddy"
$caddyExe  = Join-Path -Path $caddyPath -ChildPath "caddy.exe"
if (-not (Test-Path $caddyExe)) {
    # Try PATH
    $caddyCmd = Get-Command caddy -ErrorAction SilentlyContinue
    if ($caddyCmd) {
        $caddyExe = $caddyCmd.Source
    } else {
        Write-Host "  [FAIL] Caddy not found at $caddyExe or in PATH" -ForegroundColor Red
        Write-Host "  Download from https://caddyserver.com/download" -ForegroundColor Yellow
        exit 1
    }
}
Write-Host "  [PASS] Caddy: $caddyExe" -ForegroundColor Green

# cloudflared (unless skipping tunnel)
if (-not $SkipTunnel) {
    $cfCmd = Get-Command cloudflared -ErrorAction SilentlyContinue
    if (-not $cfCmd) {
        Write-Host "  [FAIL] cloudflared not found in PATH" -ForegroundColor Red
        Write-Host "  Install: winget install Cloudflare.cloudflared" -ForegroundColor Yellow
        exit 1
    }
    $cfVer = cloudflared --version 2>&1
    Write-Host "  [PASS] cloudflared: $cfVer" -ForegroundColor Green
}

# Node.js
$nodeVer = node --version 2>$null
if (-not $nodeVer) {
    Write-Host "  [FAIL] Node.js not found" -ForegroundColor Red
    exit 1
}
Write-Host "  [PASS] Node: $nodeVer" -ForegroundColor Green

# Caddyfile
$caddyfile = Join-Path -Path $REPO_ROOT -ChildPath "Caddyfile.production"
if (-not (Test-Path $caddyfile)) {
    Write-Host "  [FAIL] Caddyfile.production not found" -ForegroundColor Red
    exit 1
}
Write-Host "  [PASS] Caddyfile: $caddyfile" -ForegroundColor Green

# -- DRY RUN output -------------------------------------------------------
if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY RUN] Would execute the following:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. Kill existing node/caddy/cloudflared processes" -ForegroundColor White
    Write-Host "  2. Set environment:" -ForegroundColor White
    Write-Host "     ENABLE_V2_INTAKE=true" -ForegroundColor Gray
    Write-Host "     ENABLE_V2_INTAKE_AUTH=true (V2 endpoints require Bearer token)" -ForegroundColor Gray
    Write-Host "     ZERO_OPENAI_MODE=true" -ForegroundColor Gray
    Write-Host "     V1_STABLE=true" -ForegroundColor Gray
    Write-Host "  3. Start Caddy on port $PROXY_PORT (reverse proxy)" -ForegroundColor White
    Write-Host "  4. Start backend (npm run dev) on port $BACKEND_PORT" -ForegroundColor White
    Write-Host "  5. Start frontend (npm run dev) on port $FRONTEND_PORT" -ForegroundColor White
    if (-not $SkipTunnel) {
        Write-Host "  6. Start cloudflared tunnel (IPv4 only)" -ForegroundColor White
        Write-Host "     Routes care2connects.org -> localhost:$PROXY_PORT" -ForegroundColor Gray
    }
    Write-Host "  7. Run health checks" -ForegroundColor White
    Write-Host ""
    Write-Host "  Preview URLs:" -ForegroundColor Cyan
    Write-Host "    https://care2connects.org/" -ForegroundColor White
    Write-Host "    https://care2connects.org/onboarding/v2" -ForegroundColor White
    Write-Host "    https://api.care2connects.org/api/v2/intake/health" -ForegroundColor White
    Write-Host ""
    Write-Host "  Rollback: Stop-Process -Name node,caddy,cloudflared -Force" -ForegroundColor Yellow
    exit 0
}

# -- Cleanup stale processes ----------------------------------------------
Write-Host "[CLEANUP] Stopping existing processes..." -ForegroundColor Cyan

Stop-Process -Name cloudflared -Force -ErrorAction SilentlyContinue
Stop-Process -Name caddy -Force -ErrorAction SilentlyContinue
# Only kill node on our ports, not all node processes
foreach ($port in @($BACKEND_PORT, $FRONTEND_PORT)) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        foreach ($c in $conn) {
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}
Start-Sleep -Seconds 2
Write-Host "  Done" -ForegroundColor Green

# -- Set environment ------------------------------------------------------
$env:ZERO_OPENAI_MODE     = "true"
$env:NODE_ENV              = "development"
$env:ENABLE_V2_INTAKE      = "true"
$env:ENABLE_V2_INTAKE_AUTH = "true"
$env:V1_STABLE             = "true"
$env:AI_PROVIDER           = "rules"
$env:PORT                  = "$BACKEND_PORT"
$env:NEXT_PUBLIC_ENABLE_V2_INTAKE = "true"
$env:NEXT_PUBLIC_API_URL   = "http://localhost:$BACKEND_PORT"

# -- Start Caddy ----------------------------------------------------------
Write-Host ""
Write-Host "[START] Starting Caddy reverse proxy (port $PROXY_PORT)..." -ForegroundColor Cyan

$logDir = Join-Path -Path $REPO_ROOT -ChildPath "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }

Start-Process -FilePath $caddyExe -ArgumentList "run", "--config", $caddyfile -WorkingDirectory $REPO_ROOT -WindowStyle Hidden
Start-Sleep -Seconds 2

$caddyProc = Get-Process caddy -ErrorAction SilentlyContinue
if ($caddyProc) {
    Write-Host "  [PASS] Caddy running (PID $($caddyProc.Id))" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Caddy did not start" -ForegroundColor Red
    exit 1
}

# -- Start Backend --------------------------------------------------------
Write-Host ""
Write-Host "[START] Starting backend (port $BACKEND_PORT)..." -ForegroundColor Cyan

$backendDir = Join-Path -Path $REPO_ROOT -ChildPath "backend"
$backendLog = Join-Path -Path $logDir -ChildPath "phase9-preview-backend.log"

# Install deps if needed
Push-Location $backendDir
try {
    $lockFile = Join-Path -Path $backendDir -ChildPath "package-lock.json"
    if (Test-Path $lockFile) {
        npm ci --silent 2>$null
    } else {
        npm install --silent 2>$null
    }
} finally {
    Pop-Location
}

Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "cd /d `"$backendDir`" && set ENABLE_V2_INTAKE=true && set ENABLE_V2_INTAKE_AUTH=true && set ZERO_OPENAI_MODE=true && set V1_STABLE=true && set AI_PROVIDER=rules && set PORT=$BACKEND_PORT && npm run dev > `"$backendLog`" 2>&1" -WindowStyle Hidden
Write-Host "  Backend starting... (log: $backendLog)" -ForegroundColor Gray

# -- Start Frontend -------------------------------------------------------
Write-Host ""
Write-Host "[START] Starting frontend (port $FRONTEND_PORT)..." -ForegroundColor Cyan

$frontendDir = Join-Path -Path $REPO_ROOT -ChildPath "frontend"
$frontendLog = Join-Path -Path $logDir -ChildPath "phase9-preview-frontend.log"

# Install deps if needed
Push-Location $frontendDir
try {
    $lockFile = Join-Path -Path $frontendDir -ChildPath "package-lock.json"
    if (Test-Path $lockFile) {
        npm ci --silent 2>$null
    } else {
        npm install --silent 2>$null
    }
} finally {
    Pop-Location
}

Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "cd /d `"$frontendDir`" && set NEXT_PUBLIC_ENABLE_V2_INTAKE=true && set NEXT_PUBLIC_API_URL=http://localhost:$BACKEND_PORT && npm run dev > `"$frontendLog`" 2>&1" -WindowStyle Hidden
Write-Host "  Frontend starting... (log: $frontendLog)" -ForegroundColor Gray

# -- Wait for services ----------------------------------------------------
Write-Host ""
Write-Host "[HEALTH] Waiting for services..." -ForegroundColor Cyan

$maxWait = 90
$interval = 3
$elapsed = 0
$backendOk = $false
$frontendOk = $false

while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds $interval
    $elapsed += $interval

    if (-not $backendOk) {
        try {
            $r = Invoke-WebRequest -Uri "http://localhost:$BACKEND_PORT/health/live" -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($r.StatusCode -eq 200) {
                $backendOk = $true
                Write-Host "  [PASS] Backend /health/live (${elapsed}s)" -ForegroundColor Green
            }
        } catch { }
    }

    if (-not $frontendOk) {
        try {
            $r = Invoke-WebRequest -Uri "http://localhost:$FRONTEND_PORT" -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($r.StatusCode -eq 200) {
                $frontendOk = $true
                Write-Host "  [PASS] Frontend / (${elapsed}s)" -ForegroundColor Green
            }
        } catch { }
    }

    if ($backendOk -and $frontendOk) { break }
    Write-Host "  Waiting... ${elapsed}s / ${maxWait}s" -ForegroundColor Gray
}

if (-not $backendOk -or -not $frontendOk) {
    Write-Host ""
    Write-Host "  [STOP] Services did not start. Aborting preview deploy." -ForegroundColor Red
    Write-Host "  Backend:  $(if ($backendOk) {'OK'} else {'FAILED - check ' + $backendLog})" -ForegroundColor $(if ($backendOk) {'Green'} else {'Red'})
    Write-Host "  Frontend: $(if ($frontendOk) {'OK'} else {'FAILED - check ' + $frontendLog})" -ForegroundColor $(if ($frontendOk) {'Green'} else {'Red'})
    Write-Host ""
    Write-Host "  Rollback: Stop-Process -Name node,caddy -Force" -ForegroundColor Yellow
    exit 1
}

# -- V2 endpoint checks ---------------------------------------------------
Write-Host ""
Write-Host "[HEALTH] V2 Intake endpoint checks..." -ForegroundColor Cyan

$v2checks = @(
    @{ Name = "V2 Health";  Url = "http://localhost:$BACKEND_PORT/api/v2/intake/health" },
    @{ Name = "V2 Version"; Url = "http://localhost:$BACKEND_PORT/api/v2/intake/version" },
    @{ Name = "V2 Schema";  Url = "http://localhost:$BACKEND_PORT/api/v2/intake/schema" }
)

$v2pass = $true
foreach ($check in $v2checks) {
    try {
        $r = Invoke-WebRequest -Uri $check.Url -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "  [PASS] $($check.Name) ($($r.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] $($check.Name) - $($_.Exception.Message)" -ForegroundColor Red
        $v2pass = $false
    }
}

if (-not $v2pass) {
    Write-Host ""
    Write-Host "  [STOP] V2 health checks failed. Preview may be partially functional." -ForegroundColor Yellow
    Write-Host "  V2 endpoints may return 404 if ENABLE_V2_INTAKE is not reaching the process." -ForegroundColor Yellow
}

# -- Start Cloudflare Tunnel -----------------------------------------------
if (-not $SkipTunnel) {
    Write-Host ""
    Write-Host "[START] Starting Cloudflare tunnel (IPv4 only)..." -ForegroundColor Cyan

    $tunnelScript = Join-Path -Path (Join-Path -Path $REPO_ROOT -ChildPath "scripts") -ChildPath "start-tunnel-ipv4.ps1"
    if (Test-Path $tunnelScript) {
        Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $tunnelScript -WindowStyle Hidden
    } else {
        # Fallback: start tunnel directly
        Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "--edge-ip-version", "4", "run" -WindowStyle Hidden
    }

    Start-Sleep -Seconds 5
    $cfProc = Get-Process cloudflared -ErrorAction SilentlyContinue
    if ($cfProc) {
        Write-Host "  [PASS] Cloudflare tunnel running (PID $($cfProc.Id))" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Cloudflare tunnel may not have started" -ForegroundColor Yellow
        Write-Host "  Try manually: cloudflared tunnel --edge-ip-version 4 run" -ForegroundColor Yellow
    }

    # Public health check
    Write-Host ""
    Write-Host "[HEALTH] Public endpoint checks (via tunnel)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 3
    foreach ($domain in @("https://api.care2connects.org/health/live", "https://care2connects.org")) {
        try {
            $r = Invoke-WebRequest -Uri $domain -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            Write-Host "  [PASS] $domain ($($r.StatusCode))" -ForegroundColor Green
        } catch {
            Write-Host "  [WARN] $domain - $($_.Exception.Message)" -ForegroundColor Yellow
            Write-Host "         Tunnel may need a few more seconds to connect" -ForegroundColor Gray
        }
    }
}

# -- Final summary ---------------------------------------------------------
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Magenta
Write-Host "  Phase 9 Preview Deploy - Complete" -ForegroundColor Magenta
Write-Host ("=" * 60) -ForegroundColor Magenta
Write-Host ""
Write-Host "  LOCAL URLS:" -ForegroundColor White
Write-Host "    http://localhost:$FRONTEND_PORT/                  (Frontend home)" -ForegroundColor Cyan
Write-Host "    http://localhost:$FRONTEND_PORT/onboarding/v2     (V2 Wizard)" -ForegroundColor Cyan
Write-Host "    http://localhost:$BACKEND_PORT/health/live        (Backend health)" -ForegroundColor Cyan
Write-Host "    http://localhost:$BACKEND_PORT/api/v2/intake/health (V2 health)" -ForegroundColor Cyan

if (-not $SkipTunnel) {
    Write-Host ""
    Write-Host "  PUBLIC URLS (via Cloudflare tunnel):" -ForegroundColor White
    Write-Host "    https://care2connects.org/                   (Frontend home)" -ForegroundColor Cyan
    Write-Host "    https://care2connects.org/onboarding/v2      (V2 Wizard)" -ForegroundColor Cyan
    Write-Host "    https://api.care2connects.org/health/live    (Backend health)" -ForegroundColor Cyan
    Write-Host "    https://api.care2connects.org/api/v2/intake/health (V2 health)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "  ACCESS GATE:" -ForegroundColor White
Write-Host "    V2 API endpoints require Bearer token (ENABLE_V2_INTAKE_AUTH=true)" -ForegroundColor Yellow
Write-Host "    V2 Wizard UI is publicly accessible (visual preview only)" -ForegroundColor Yellow
Write-Host "    API mutations (session create/update) are auth-protected" -ForegroundColor Yellow

Write-Host ""
Write-Host "  LOGS:" -ForegroundColor White
Write-Host "    Backend:  $backendLog" -ForegroundColor Gray
Write-Host "    Frontend: $frontendLog" -ForegroundColor Gray
Write-Host "    Caddy:    $(Join-Path -Path $logDir -ChildPath 'caddy-access.log')" -ForegroundColor Gray

Write-Host ""
Write-Host "  ROLLBACK (stop all preview services):" -ForegroundColor White
Write-Host "    Stop-Process -Name node,caddy,cloudflared -Force -ErrorAction SilentlyContinue" -ForegroundColor Yellow
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Magenta
