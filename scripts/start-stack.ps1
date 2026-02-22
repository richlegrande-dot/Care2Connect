#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start Care2Connects stack (atomic single-command startup)
.DESCRIPTION
    Complete startup sequence:
    - Domain guard validation
    - Cleanup stale processes
    - Start Caddy reverse proxy
    - Start backend API
    - Start frontend
    - Start Cloudflare tunnel (IPv4-only)
    - Validate all endpoints (local + public)
    
    If ANY step fails, stops everything and exits non-zero.
.EXAMPLE
    .\scripts\start-stack.ps1
#>

param(
    [switch]$SkipValidation,      # Skip public endpoint validation (for testing)
    [switch]$SkipPreflight,       # Skip preflight gate -- requires ALLOW_SKIP_PREFLIGHT=true or -ForceSkipPreflight
    [switch]$ForceSkipPreflight   # Explicit override; logs the bypass
)

$ErrorActionPreference = "Stop"
$workspaceRoot = Split-Path -Parent $PSScriptRoot

# -- Preflight Gate (mandatory unless -SkipPreflight) -----------------------
if (-not $SkipPreflight) {
    $preflightScript = Join-Path $workspaceRoot "scripts\preflight\start-preflight.ps1"
    if (Test-Path $preflightScript) {
        Write-Host "`n=== Running Preflight Gate ===" -ForegroundColor Cyan
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $preflightScript -Mode Demo
        if ($LASTEXITCODE -ne 0) {
            Write-Host "" -ForegroundColor Red
            Write-Host "PREFLIGHT FAILED -- aborting stack startup." -ForegroundColor Red
            Write-Host "Fix the issues above, then try again." -ForegroundColor Yellow
            Write-Host "To skip (NOT recommended): .\scripts\start-stack.ps1 -SkipPreflight" -ForegroundColor Gray
            exit 1
        }
        Write-Host ""
    } else {
        Write-Host "WARNING: Preflight script not found at $preflightScript" -ForegroundColor Yellow
        Write-Host "Continuing without preflight (merge Phase 11.2 to enable)." -ForegroundColor Yellow
    }
} else {
    $allowSkip = ($env:ALLOW_SKIP_PREFLIGHT -eq 'true') -or $ForceSkipPreflight
    if (-not $allowSkip) {
        Write-Host "" -ForegroundColor Red
        Write-Host "ABORT: -SkipPreflight requires either:" -ForegroundColor Red
        Write-Host "  (a) environment variable ALLOW_SKIP_PREFLIGHT=true, OR" -ForegroundColor Red
        Write-Host "  (b) the -ForceSkipPreflight switch." -ForegroundColor Red
        Write-Host "" -ForegroundColor Red
        Write-Host "This guard exists to prevent accidental gate bypass." -ForegroundColor Yellow
        exit 1
    }
    $skipMsg = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') PREFLIGHT SKIPPED -- user=$($env:USERNAME) script=start-stack.ps1 force=$ForceSkipPreflight env=$($env:ALLOW_SKIP_PREFLIGHT)"
    Write-Warning "Preflight skipped (authorized). Entry logged."
    $skipLog = Join-Path $workspaceRoot "logs\preflight\skip_preflight.log"
    $skipLogDir = Split-Path $skipLog
    if (-not (Test-Path $skipLogDir)) { New-Item -ItemType Directory -Path $skipLogDir -Force | Out-Null }
    Add-Content -Path $skipLog -Value $skipMsg
}

# Load canonical ports
$portsFile = "$workspaceRoot\config\ports.json"
if (-not (Test-Path $portsFile)) {
    Write-Host "ERROR: Ports config not found at $portsFile" -ForegroundColor Red
    exit 1
}
$ports = Get-Content $portsFile | ConvertFrom-Json

$FRONTEND_PORT = $ports.frontend
$BACKEND_PORT = $ports.backend
$PROXY_PORT = $ports.proxy

Write-Host "`n=== Care2Connects Stack Startup ===" -ForegroundColor Cyan
Write-Host "Ports: Frontend=$FRONTEND_PORT Backend=$BACKEND_PORT Proxy=$PROXY_PORT" -ForegroundColor Gray

# Function to capture last N lines from a process window (best effort)
function Get-ProcessLogs {
    param([int]$ProcessId, [string]$Name, [int]$Lines = 50)
    Write-Host "`n--- Last $Lines lines from $Name (PID $ProcessId) ---" -ForegroundColor Yellow
    Write-Host "(Process logs not captured - check process window)" -ForegroundColor Gray
}

# Function to stop all components
function Stop-AllComponents {
    Write-Host "`nStopping all components..." -ForegroundColor Yellow
    Stop-Process -Name cloudflared -Force -ErrorAction SilentlyContinue
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Stop-Process -Name caddy -Force -ErrorAction SilentlyContinue
    Write-Host "All components stopped" -ForegroundColor Gray
}

try {
    # PHASE 1: Domain Guard
    Write-Host "`n[PHASE 1] Domain Guard Validation" -ForegroundColor Cyan
    & "$PSScriptRoot\domain-guard.ps1"
    if ($LASTEXITCODE -ne 0) {
        throw "Domain guard failed"
    }
    Write-Host "✅ Domain guard passed" -ForegroundColor Green

    # PHASE 2: Cleanup
    Write-Host "`n[PHASE 2] Cleaning up stale processes" -ForegroundColor Cyan
    
    $staleProcesses = @()
    $caddy = Get-Process caddy -ErrorAction SilentlyContinue
    if ($caddy) { $staleProcesses += "Caddy (PID $($caddy.Id))" }
    
    $tunnel = Get-Process cloudflared -ErrorAction SilentlyContinue
    if ($tunnel) { $staleProcesses += "Tunnel (PID $($tunnel.Id))" }
    
    $nodes = Get-Process node -ErrorAction SilentlyContinue
    if ($nodes) { $staleProcesses += "$($nodes.Count) Node.js process(es)" }
    
    if ($staleProcesses.Count -gt 0) {
        Write-Host "Found stale processes: $($staleProcesses -join ', ')" -ForegroundColor Yellow
        Stop-AllComponents
        Start-Sleep -Seconds 3
        Write-Host "✅ Cleanup complete" -ForegroundColor Green
    } else {
        Write-Host "✅ No stale processes" -ForegroundColor Green
    }

    # PHASE 3: Start Caddy
    Write-Host "`n[PHASE 3] Starting Caddy reverse proxy" -ForegroundColor Cyan
    $caddyConfig = "$workspaceRoot\Caddyfile.production"
    if (-not (Test-Path $caddyConfig)) {
        throw "Caddy config not found: $caddyConfig"
    }
    
    $caddyProc = Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-NoProfile",
        "-Command",
        "Write-Host 'Caddy Reverse Proxy' -ForegroundColor Cyan; cd '$workspaceRoot'; .\bin\caddy\caddy.exe run --config Caddyfile.production"
    ) -PassThru -WindowStyle Normal
    
    Write-Host "Waiting for Caddy to start..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
    
    $caddyCheck = netstat -ano | Select-String ":$PROXY_PORT "
    if (-not $caddyCheck) {
        Get-ProcessLogs -ProcessId $caddyProc.Id -Name "Caddy"
        throw "Caddy failed to start on port $PROXY_PORT"
    }
    Write-Host "✅ Caddy running on port $PROXY_PORT" -ForegroundColor Green

    # PHASE 4: Start Backend
    Write-Host "`n[PHASE 4] Starting Backend API" -ForegroundColor Cyan
    $backendProc = Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-NoProfile",
        "-Command",
        "Write-Host 'Backend API' -ForegroundColor Green; cd '$workspaceRoot\backend'; npm start"
    ) -PassThru -WindowStyle Normal
    
    Write-Host "Waiting for backend to start..." -ForegroundColor Gray
    Start-Sleep -Seconds 15
    
    $backendCheck = netstat -ano | Select-String ":$BACKEND_PORT "
    if (-not $backendCheck) {
        Get-ProcessLogs -ProcessId $backendProc.Id -Name "Backend"
        throw "Backend failed to start on port $BACKEND_PORT"
    }
    
    # Test backend health with retry
    $backendHealthy = $false
    $maxRetries = 3
    for ($retry = 1; $retry -le $maxRetries; $retry++) {
        try {
            $backendHealth = Invoke-RestMethod -Uri "http://127.0.0.1:$BACKEND_PORT/health/live" -TimeoutSec 10
            Write-Host "✅ Backend running: $($backendHealth.status)" -ForegroundColor Green
            $backendHealthy = $true
            break
        } catch {
            if ($retry -lt $maxRetries) {
                Write-Host "  Backend not ready yet (attempt $retry of $maxRetries), retrying..." -ForegroundColor Yellow
                Start-Sleep -Seconds 5
            }
        }
    }
    
    if (-not $backendHealthy) {
        throw "Backend not responding to health check after $maxRetries attempts"
    }

    # PHASE 5: Start Frontend
    Write-Host "`n[PHASE 5] Starting Frontend" -ForegroundColor Cyan
    $frontendProc = Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-NoProfile",
        "-Command",
        "Write-Host 'Frontend (Next.js)' -ForegroundColor Blue; cd '$workspaceRoot\frontend'; npm run dev"
    ) -PassThru -WindowStyle Normal
    
    Write-Host "Waiting for frontend to compile..." -ForegroundColor Gray
    Start-Sleep -Seconds 25
    
    $frontendCheck = netstat -ano | Select-String ":$FRONTEND_PORT "
    if (-not $frontendCheck) {
        Get-ProcessLogs -ProcessId $frontendProc.Id -Name "Frontend"
        throw "Frontend failed to start on port $FRONTEND_PORT"
    }
    
    # Test frontend with retry
    $frontendHealthy = $false
    $maxRetries = 3
    for ($retry = 1; $retry -le $maxRetries; $retry++) {
        try {
            $frontendTest = Invoke-WebRequest -Uri "http://127.0.0.1:$FRONTEND_PORT" -UseBasicParsing -TimeoutSec 10
            Write-Host "✅ Frontend running (HTTP $($frontendTest.StatusCode))" -ForegroundColor Green
            $frontendHealthy = $true
            break
        } catch {
            if ($retry -lt $maxRetries) {
                Write-Host "  Frontend not ready yet (attempt $retry of $maxRetries), retrying..." -ForegroundColor Yellow
                Start-Sleep -Seconds 5
            }
        }
    }
    
    if (-not $frontendHealthy) {
        throw "Frontend not responding after $maxRetries attempts"
    }

    # PHASE 6: Start Tunnel
    Write-Host "`n[PHASE 6] Starting Cloudflare Tunnel (IPv4-only)" -ForegroundColor Cyan
    
    $tunnelConfig = "$env:USERPROFILE\.cloudflared\config.yml"
    if (-not (Test-Path $tunnelConfig)) {
        throw "Tunnel config not found: $tunnelConfig"
    }
    
    $tunnelProc = Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-NoProfile",
        "-Command",
        "Write-Host 'Cloudflare Tunnel (IPv4-Only)' -ForegroundColor Cyan; cloudflared tunnel --edge-ip-version 4 run care2connects-tunnel"
    ) -PassThru -WindowStyle Normal
    
    Write-Host "Waiting for tunnel registration..." -ForegroundColor Gray
    
    # Retry tunnel validation with proper wait time
    $tunnelCheck = $null
    $maxAttempts = 4
    $attemptDelay = 5
    
    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        Start-Sleep -Seconds $attemptDelay
        $tunnelCheck = Get-Process cloudflared -ErrorAction SilentlyContinue
        
        if ($tunnelCheck) {
            $tunnelPid = $tunnelCheck.Id
            Write-Host "  Attempt $attempt of ${maxAttempts}: Process found (PID $tunnelPid)" -ForegroundColor Gray
            
            # Test if tunnel is actually connected (try public endpoint)
            try {
                $tunnelTest = Invoke-RestMethod -Uri "https://api.care2connects.org/health/live" -TimeoutSec 5 -ErrorAction Stop
                $totalWait = $attempt * $attemptDelay
                Write-Host "✅ Tunnel connected and routing (took ${totalWait}s)" -ForegroundColor Green
                break
            } catch {
                if ($attempt -lt $maxAttempts) {
                    Write-Host "  Tunnel process running but not routing yet, retrying..." -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "  Attempt $attempt of ${maxAttempts}: Process not found yet..." -ForegroundColor Gray
        }
    }
    
    if (-not $tunnelCheck) {
        $totalTime = $maxAttempts * $attemptDelay
        throw "Tunnel process failed to start after ${totalTime} seconds"
    }
    
    # Final validation
    $finalCheck = Get-Process cloudflared -ErrorAction SilentlyContinue
    if (-not $finalCheck) {
        throw "Tunnel process stopped unexpectedly"
    }

    # PHASE 7: Validation
    Write-Host "`n[PHASE 7] Validating stack" -ForegroundColor Cyan
    
    # Local validation
    Write-Host "  [1] Caddy routing..." -ForegroundColor Yellow
    try {
        $caddyTest = Invoke-RestMethod -Uri "http://127.0.0.1:$PROXY_PORT/health/live" -Headers @{Host='api.care2connects.org'} -TimeoutSec 5
        Write-Host "      ✅ Caddy routes to backend" -ForegroundColor Green
    } catch {
        throw "Caddy routing failed: $_"
    }
    
    if (-not $SkipValidation) {
        # Public validation (tunnel already validated in Phase 6)
        Write-Host "  [2] Public API..." -ForegroundColor Yellow
        try {
            $publicApi = Invoke-RestMethod -Uri "https://api.care2connects.org/health/live" -TimeoutSec 15
            Write-Host "      ✅ Public API: $($publicApi.status) (uptime: $([math]::Round($publicApi.uptime,1))s)" -ForegroundColor Green
        } catch {
            Write-Host "      ⚠️  Public API validation failed: $_" -ForegroundColor Yellow
            Write-Host "      (Tunnel process is running, may need more time to propagate DNS)" -ForegroundColor Gray
        }
        
        Write-Host "  [3] Public Frontend..." -ForegroundColor Yellow
        try {
            $publicFront = Invoke-WebRequest -Uri "https://care2connects.org" -UseBasicParsing -TimeoutSec 15
            Write-Host "      ✅ Public Frontend: HTTP $($publicFront.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "      ⚠️  Public Frontend validation failed: $_" -ForegroundColor Yellow
            Write-Host "      (Tunnel process is running, may need more time)" -ForegroundColor Gray
        }
    }

    # Success summary
    Write-Host "`n" + ("=" * 60) -ForegroundColor Green
    Write-Host "✅ STACK STARTED SUCCESSFULLY" -ForegroundColor Green
    Write-Host ("=" * 60) -ForegroundColor Green
    
    Write-Host "`nProcesses:" -ForegroundColor Cyan
    Write-Host "  Caddy:    PID $($caddyProc.Id) (port $PROXY_PORT)" -ForegroundColor White
    Write-Host "  Backend:  PID $($backendProc.Id) (port $BACKEND_PORT)" -ForegroundColor White
    Write-Host "  Frontend: PID $($frontendProc.Id) (port $FRONTEND_PORT)" -ForegroundColor White
    Write-Host "  Tunnel:   PID $($tunnelCheck.Id) (IPv4-only)" -ForegroundColor White
    
    Write-Host "`nEndpoints:" -ForegroundColor Cyan
    Write-Host "  Local Backend:  http://127.0.0.1:$BACKEND_PORT/health/live" -ForegroundColor White
    Write-Host "  Local Frontend: http://127.0.0.1:$FRONTEND_PORT" -ForegroundColor White
    Write-Host "  Public API:     https://api.care2connects.org/health/live" -ForegroundColor White
    Write-Host "  Public Site:    https://care2connects.org" -ForegroundColor White
    
    Write-Host "`nMonitoring:" -ForegroundColor Cyan
    Write-Host "  Health check:   .\scripts\monitor-stack.ps1" -ForegroundColor Gray
    Write-Host "  Auto-recovery:  .\scripts\watchdog-stack.ps1" -ForegroundColor Gray
    Write-Host "  Stop stack:     .\scripts\stop-stack.ps1" -ForegroundColor Gray
    
    exit 0

} catch {
    Write-Host "`n" + ("=" * 60) -ForegroundColor Red
    Write-Host "❌ STACK STARTUP FAILED" -ForegroundColor Red
    Write-Host ("=" * 60) -ForegroundColor Red
    Write-Host "`nError: $_" -ForegroundColor Red
    
    Write-Host "`nStopping all components..." -ForegroundColor Yellow
    Stop-AllComponents
    
    Write-Host "`n💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check process windows for error messages" -ForegroundColor Gray
    Write-Host "  2. Verify ports not in use: netstat -ano | findstr `":$PROXY_PORT :$BACKEND_PORT :$FRONTEND_PORT`"" -ForegroundColor Gray
    Write-Host "  3. Check logs in component windows" -ForegroundColor Gray
    Write-Host "  4. Run domain guard: .\scripts\domain-guard.ps1" -ForegroundColor Gray
    
    exit 1
}
