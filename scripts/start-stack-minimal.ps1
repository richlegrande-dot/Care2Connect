# Minimal Production Stack Startup
param([switch]$SkipDomainGuard)

$ErrorActionPreference = "Stop"
$WorkspaceRoot = "C:\Users\richl\Care2system"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Production Stack Startup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Domain guard
if (-not $SkipDomainGuard) {
    Write-Host "[1/6] Running domain guard..." -ForegroundColor Yellow
    & "$WorkspaceRoot\scripts\domain-guard-test.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Domain violations found (proceeding anyway for test)" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Step 2: Clean up processes
Write-Host "[2/6] Cleaning up processes..." -ForegroundColor Yellow
Get-Process caddy, node, cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "  OK: Processes cleaned" -ForegroundColor Green
Write-Host ""

# Step 3: Start Caddy
Write-Host "[3/6] Starting Caddy (port 8080)..." -ForegroundColor Yellow
$CaddyExe = "$WorkspaceRoot\bin\caddy\caddy.exe"
$caddyProc = Start-Process -FilePath $CaddyExe -ArgumentList "run", "--config", "$WorkspaceRoot\Caddyfile.production" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3

$listening = Get-NetTCPConnection -State Listen -LocalPort 8080 -ErrorAction SilentlyContinue
if ($listening) {
    Write-Host "  OK: Caddy listening (PID: $($caddyProc.Id))" -ForegroundColor Green
} else {
    Write-Host "  FAIL: Caddy not listening" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Start Backend
Write-Host "[4/6] Starting Backend (port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$WorkspaceRoot\backend'; npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 8

$backendPort = Get-NetTCPConnection -State Listen -LocalPort 3001 -ErrorAction SilentlyContinue
if ($backendPort) {
    Write-Host "  OK: Backend listening" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Backend not listening yet" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Start Frontend
Write-Host "[5/6] Starting Frontend (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$WorkspaceRoot\frontend'; npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 10

$frontendPort = Get-NetTCPConnection -State Listen -LocalPort 3000 -ErrorAction SilentlyContinue
if ($frontendPort) {
    Write-Host "  OK: Frontend listening" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Frontend not listening yet (may still be compiling)" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Verify routing
Write-Host "[6/6] Verifying Caddy routing..." -ForegroundColor Yellow
try {
    $test = Invoke-WebRequest -Uri "http://127.0.0.1:8080/health/live" -Headers @{ Host = "api.care2connects.org" } -TimeoutSec 5 -UseBasicParsing
    Write-Host "  OK: Backend route working ($($test.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "  WARNING: Backend route not ready: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "Production Stack Started" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  Caddy:    Port 8080 (PID: $($caddyProc.Id))" -ForegroundColor White
Write-Host "  Backend:  Port 3001" -ForegroundColor White
Write-Host "  Frontend: Port 3000" -ForegroundColor White
Write-Host ""
Write-Host "Test: curl http://127.0.0.1:8080/health/live -H 'Host: api.care2connects.org'" -ForegroundColor Gray
Write-Host ""
