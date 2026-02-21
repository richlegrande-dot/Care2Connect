# Production Stack Monitor
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Production Stack Health Check" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Load canonical port configuration
$portsConfigPath = Join-Path (Split-Path -Parent $PSScriptRoot) "config\ports.json"
if (Test-Path $portsConfigPath) {
    $portsConfig = Get-Content $portsConfigPath | ConvertFrom-Json
    $ProxyPort = $portsConfig.proxy
    $BackendPort = $portsConfig.backend
    $FrontendPort = $portsConfig.frontend
    Write-Host "Loaded ports from config/ports.json" -ForegroundColor DarkGray
} else {
    Write-Host "WARNING: config/ports.json not found, using defaults" -ForegroundColor Yellow
    $ProxyPort = 8080
    $BackendPort = 3001
    $FrontendPort = 3000
}

$allHealthy = $true

# Check ports
Write-Host "[1/3] Checking port listeners..." -ForegroundColor Yellow
$ports = @(
    @{ Port = $ProxyPort; Name = "Caddy Proxy" },
    @{ Port = $BackendPort; Name = "Backend" },
    @{ Port = $FrontendPort; Name = "Frontend" }
)

foreach ($svc in $ports) {
    $listening = Get-NetTCPConnection -State Listen -LocalPort $svc.Port -ErrorAction SilentlyContinue
    if ($listening) {
        Write-Host "  OK: $($svc.Name) on port $($svc.Port)" -ForegroundColor Green
    } else {
        Write-Host "  FAIL: $($svc.Name) NOT listening on port $($svc.Port)" -ForegroundColor Red
        $allHealthy = $false
    }
}

Write-Host ""

# Check Caddy routing
Write-Host "[2/3] Testing Caddy routing..." -ForegroundColor Yellow
try {
    $test = Invoke-WebRequest -Uri "http://127.0.0.1:$ProxyPort/health/live" -Headers @{ Host = "api.care2connects.org" } -TimeoutSec 5 -UseBasicParsing
    $contentType = $test.Headers["Content-Type"]
    if ($test.StatusCode -eq 200) {
        Write-Host "  OK: Backend routing ($($test.StatusCode), $contentType)" -ForegroundColor Green
    }
} catch {
    Write-Host "  FAIL: Backend routing failed: $_" -ForegroundColor Red
    $allHealthy = $false
}

Write-Host ""

# Check processes
Write-Host "[3/3] Checking processes..." -ForegroundColor Yellow
$caddy = Get-Process caddy -ErrorAction SilentlyContinue
$node = Get-Process node -ErrorAction SilentlyContinue

if ($caddy) {
    Write-Host "  OK: Caddy running ($($caddy.Count) process)" -ForegroundColor Green
} else {
    Write-Host "  FAIL: Caddy not running" -ForegroundColor Red
    $allHealthy = $false
}

if ($node) {
    Write-Host "  OK: Node running ($($node.Count) processes)" -ForegroundColor Green
} else {
    Write-Host "  FAIL: Node not running" -ForegroundColor Red
    $allHealthy = $false
}

Write-Host ""
Write-Host "======================================" -ForegroundColor $(if ($allHealthy) { "Green" } else { "Red" })
Write-Host $(if ($allHealthy) { "ALL SYSTEMS HEALTHY" } else { "ISSUES DETECTED" }) -ForegroundColor $(if ($allHealthy) { "Green" } else { "Red" })
Write-Host "======================================" -ForegroundColor $(if ($allHealthy) { "Green" } else { "Red" })
Write-Host ""

if ($allHealthy) {
    exit 0
} else {
    Write-Host "Recovery: .\scripts\start-stack-minimal.ps1 -SkipDomainGuard" -ForegroundColor Yellow
    exit 1
}
