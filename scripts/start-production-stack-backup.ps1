# Single Production Stack Startup - Eliminates fragmented manual process
# This is the ONE command to start the entire production infrastructure

param(
    [switch]$SkipDomainGuard,
    [switch]$SkipTunnelValidation
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Care2Connects Production Stack Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$WorkspaceRoot = "C:\Users\richl\Care2system"
Set-Location $WorkspaceRoot

# Step 0: Domain Guard (prevent typos from entering production)
if (-not $SkipDomainGuard) {
    Write-Host "[0/7] Running domain guard..." -ForegroundColor Yellow
    try {
        & "$WorkspaceRoot\scripts\domain-guard.ps1"
        Write-Host "  ✓ Domain guard passed" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Domain guard failed" -ForegroundColor Red
        Write-Host "    Fix domain typos before starting production" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[0/7] Skipping domain guard" -ForegroundColor Yellow
}

Write-Host ""

# Step 1: Clean up any existing processes
Write-Host "[1/7] Cleaning up existing processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
$caddyProcesses = Get-Process -Name caddy -ErrorAction SilentlyContinue
$cloudflaredProcesses = Get-Process -Name cloudflared -ErrorAction SilentlyContinue

$killCount = 0
if ($nodeProcesses) {
    Write-Host "  Killing $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Gray
    $nodeProcesses | Stop-Process -Force
    $killCount += $nodeProcesses.Count
}
if ($caddyProcesses) {
    Write-Host "  Killing $($caddyProcesses.Count) Caddy process(es)" -ForegroundColor Gray
    $caddyProcesses | Stop-Process -Force
    $killCount += $caddyProcesses.Count
}
if ($cloudflaredProcesses) {
    Write-Host "  Killing $($cloudflaredProcesses.Count) Cloudflared process(es)" -ForegroundColor Gray
    $cloudflaredProcesses | Stop-Process -Force
    $killCount += $cloudflaredProcesses.Count
}

if ($killCount -gt 0) {
    Write-Host "  ✓ Killed $killCount existing process(es)" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "  ✓ No existing processes to clean up" -ForegroundColor Green
}

Write-Host ""

# Step 2: Validate port availability
Write-Host "[2/7] Validating port availability..." -ForegroundColor Yellow
$requiredPorts = @(3000, 3001, 8080)
$portsOk = $true

foreach ($port in $requiredPorts) {
    $listening = netstat -ano | Select-String ":$port.*LISTENING"
    if ($listening) {
        Write-Host "  ✗ Port $port already in use" -ForegroundColor Red
        $portsOk = $false
    } else {
        Write-Host "  ✓ Port $port available" -ForegroundColor Green
    }
}

if (-not $portsOk) {
    Write-Host ""
    Write-Host "✗ Required ports still in use after cleanup" -ForegroundColor Red
    Write-Host "  Wait a few seconds and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 3: Start Caddy reverse proxy (replaces reverse-proxy.js)
Write-Host "[3/7] Starting Caddy reverse proxy..." -ForegroundColor Yellow
$CaddyExe = "$WorkspaceRoot\bin\caddy\caddy.exe"
$CaddyConfig = "$WorkspaceRoot\Caddyfile.production"

if (-not (Test-Path $CaddyExe)) {
    Write-Host "  ✗ Caddy not installed" -ForegroundColor Red
    Write-Host "    Run: .\scripts\install-caddy.ps1" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $CaddyConfig)) {
    Write-Host "  ✗ Caddy config not found: $CaddyConfig" -ForegroundColor Red
    exit 1
}

# Validate Caddy config
Write-Host "  Validating Caddy configuration..." -ForegroundColor Gray
$validateResult = & $CaddyExe validate --config $CaddyConfig 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Invalid Caddy configuration" -ForegroundColor Red
    Write-Host "    $validateResult" -ForegroundColor Red
    exit 1
}

# Start Caddy
$caddyProc = Start-Process -FilePath $CaddyExe -ArgumentList "run", "--config", $CaddyConfig -PassThru -WindowStyle Minimized
Start-Sleep -Seconds 3

# Verify Caddy is listening
$caddyListening = netstat -ano | Select-String ":8080.*LISTENING"
if ($caddyListening) {
    Write-Host "  ✓ Caddy started (PID: $($caddyProc.Id), Port: 8080)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Caddy failed to bind to port 8080" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Start Frontend (Next.js on port 3000)
Write-Host "[4/7] Starting Frontend (Next.js)..." -ForegroundColor Yellow
$frontendScript = @"
Set-Location '$WorkspaceRoot\frontend'
Write-Host 'Starting Frontend on port 3000...' -ForegroundColor Cyan
npm run dev
"@

$frontendProc = Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript -PassThru -WindowStyle Minimized
Write-Host "  Started frontend process (PID: $($frontendProc.Id))" -ForegroundColor Gray
Write-Host "  Waiting for Next.js to compile..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# Verify frontend is listening
$frontendListening = netstat -ano | Select-String ":3000.*LISTENING"
if ($frontendListening) {
    Write-Host "  ✓ Frontend listening on port 3000" -ForegroundColor Green
} else {
    Write-Host "  ✗ Frontend failed to start" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 5: Start Backend (Express on port 3001)
Write-Host "[5/7] Starting Backend (Express)..." -ForegroundColor Yellow
$backendScript = @"
Set-Location '$WorkspaceRoot\backend'
Write-Host 'Starting Backend on port 3001...' -ForegroundColor Cyan
npm run dev
"@

$backendProc = Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript -PassThru -WindowStyle Minimized
Write-Host "  Started backend process (PID: $($backendProc.Id))" -ForegroundColor Gray
Write-Host "  Waiting for Express to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# Verify backend is listening
$backendListening = netstat -ano | Select-String ":3001.*LISTENING"
if ($backendListening) {
    Write-Host "  ✓ Backend listening on port 3001" -ForegroundColor Green
} else {
    Write-Host "  ✗ Backend failed to start" -ForegroundColor Red
    exit 1
}

# Test backend health endpoint
try {
    $healthCheck = Invoke-WebRequest -Uri "http://127.0.0.1:3001/health/live" -TimeoutSec 5 -UseBasicParsing
    Write-Host "  ✓ Backend health check: $($healthCheck.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Backend health check failed (may still be initializing)" -ForegroundColor Yellow
}

Write-Host ""

# Step 6: Verify local stack health through Caddy
Write-Host "[6/7] Verifying local stack through reverse proxy..." -ForegroundColor Yellow
try {
    $proxyTest = Invoke-WebRequest -Uri "http://127.0.0.1:8080" -Headers @{ Host = "care2connects.org" } -TimeoutSec 10 -UseBasicParsing
    Write-Host "  ✓ Caddy → Frontend: $($proxyTest.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Caddy → Frontend routing failed" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

try {
    $apiProxyTest = Invoke-WebRequest -Uri "http://127.0.0.1:8080/health/live" -Headers @{ Host = "api.care2connects.org" } -TimeoutSec 10 -UseBasicParsing
    Write-Host "  ✓ Caddy → Backend: $($apiProxyTest.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Caddy → Backend routing failed" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 7: Start Cloudflare Tunnel
Write-Host "[7/7] Starting Cloudflare Tunnel..." -ForegroundColor Yellow
$tunnelArgs = @()
if ($SkipTunnelValidation) {
    $tunnelArgs += "-SkipValidation"
}

try {
    & "$WorkspaceRoot\scripts\tunnel-start.ps1" @tunnelArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Tunnel startup failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ✗ Tunnel startup script error" -ForegroundColor Red
    Write-Host "    Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Production Stack Started Successfully" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Running Processes:" -ForegroundColor Cyan
Write-Host "  Caddy Proxy:  PID $($caddyProc.Id) → Port 8080" -ForegroundColor White
Write-Host "  Frontend:     PID $($frontendProc.Id) → Port 3000" -ForegroundColor White
Write-Host "  Backend:      PID $($backendProc.Id) → Port 3001" -ForegroundColor White
Write-Host "  Cloudflared:  Check tunnel-start.ps1 output for PID" -ForegroundColor White
Write-Host ""

Write-Host "Public URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:     https://care2connects.org" -ForegroundColor White
Write-Host "  API:          https://api.care2connects.org" -ForegroundColor White
Write-Host "  Health Check: https://api.care2connects.org/health/live" -ForegroundColor White
Write-Host ""

Write-Host "Logs:" -ForegroundColor Cyan
Write-Host "  Caddy:   $WorkspaceRoot\logs\caddy-access.log" -ForegroundColor White
Write-Host "  Windows: Check PowerShell windows (minimized)" -ForegroundColor White
Write-Host ""

Write-Host "To stop production stack:" -ForegroundColor Gray
Write-Host "  .\scripts\stop-production-stack.ps1" -ForegroundColor Gray
Write-Host ""

# Save PIDs for stop script
$pidsFile = "$WorkspaceRoot\logs\production-stack-pids.json"
$pids = @{
    Caddy = $caddyProc.Id
    Frontend = $frontendProc.Id
    Backend = $backendProc.Id
    StartedAt = (Get-Date).ToString("o")
}
$pids | ConvertTo-Json | Set-Content $pidsFile
Write-Host "Process IDs saved to: $pidsFile" -ForegroundColor Gray
Write-Host ""
