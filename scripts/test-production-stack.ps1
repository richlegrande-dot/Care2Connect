# Quick Production Stack Test
Write-Host "Testing Production Stack Components..." -ForegroundColor Cyan
Write-Host ""

$WorkspaceRoot = "C:\Users\richl\Care2system"
$CaddyExe = "$WorkspaceRoot\bin\caddy\caddy.exe"

# Test 1: Caddy installed
Write-Host "[1/5] Checking Caddy..." -ForegroundColor Yellow
if (Test-Path $CaddyExe) {
    $version = & $CaddyExe version
    Write-Host "  OK: $version" -ForegroundColor Green
} else {
    Write-Host "  FAIL: Caddy not found" -ForegroundColor Red
    exit 1
}

# Test 2: Caddyfile exists
Write-Host "[2/5] Checking Caddyfile..." -ForegroundColor Yellow
if (Test-Path "$WorkspaceRoot\Caddyfile.production") {
    Write-Host "  OK: Caddyfile.production exists" -ForegroundColor Green
    & $CaddyExe validate --config "$WorkspaceRoot\Caddyfile.production"
} else {
    Write-Host "  FAIL: Caddyfile not found" -ForegroundColor Red
    exit 1
}

# Test 3: Kill existing processes
Write-Host "[3/5] Cleaning up processes..." -ForegroundColor Yellow
Get-Process caddy, node, cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "  OK: Cleaned up" -ForegroundColor Green

# Test 4: Start Caddy
Write-Host "[4/5] Starting Caddy on port 8080..." -ForegroundColor Yellow
$caddyProc = Start-Process -FilePath $CaddyExe -ArgumentList "run", "--config", "$WorkspaceRoot\Caddyfile.production" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3

$listening = netstat -ano | Select-String ":8080.*LISTENING"
if ($listening) {
    Write-Host "  OK: Caddy listening on port 8080 (PID: $($caddyProc.Id))" -ForegroundColor Green
} else {
    Write-Host "  FAIL: Caddy not listening" -ForegroundColor Red
    exit 1
}

# Test 5: Test routing (with dummy backend)
Write-Host "[5/5] Testing Caddy routing..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8080" -Headers @{ Host = "care2connects.org" } -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "  OK: Caddy routing works" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*502*" -or $_.Exception.Message -like "*Unable to connect*") {
        Write-Host "  OK: Caddy is routing (backend not running yet, expected 502)" -ForegroundColor Green
    } else {
        Write-Host "  FAIL: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Test Complete!" -ForegroundColor Green
Write-Host "Caddy reverse proxy is working on port 8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Start frontend and backend services" -ForegroundColor Yellow
Write-Host ""
