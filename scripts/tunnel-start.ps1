# Production-Grade Cloudflare Tunnel Startup
# Eliminates IPv6/IPv4 binding issues and stale process failures

param(
    [switch]$SkipValidation
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cloudflare Tunnel Production Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$TunnelName = "care2connects-tunnel"
$TunnelConfigPath = "C:\Users\richl\.cloudflared\config.yml"
$WorkspaceRoot = "C:\Users\richl\Care2system"

# Validation endpoints (checked after tunnel starts)
$ValidationEndpoints = @(
    @{
        Url = "https://care2connects.org"
        ExpectedContentType = "text/html"
        Description = "Frontend homepage"
    },
    @{
        Url = "https://care2connects.org/_next/static/chunks/webpack.js"
        ExpectedContentType = "application/javascript"
        Description = "Frontend static asset"
    },
    @{
        Url = "https://api.care2connects.org/health/live"
        ExpectedContentType = "application/json"
        Description = "Backend health endpoint"
    }
)

# Step 1: Kill any stale cloudflared processes
Write-Host "[1/5] Killing stale cloudflared processes..." -ForegroundColor Yellow
$staleTunnels = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
if ($staleTunnels) {
    Write-Host "  Found $($staleTunnels.Count) stale process(es)" -ForegroundColor Gray
    foreach ($proc in $staleTunnels) {
        Write-Host "  Killing PID $($proc.Id) (started $($proc.StartTime))" -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force
    }
    Start-Sleep -Seconds 2
    Write-Host "  ✓ Stale processes killed" -ForegroundColor Green
} else {
    Write-Host "  ✓ No stale processes found" -ForegroundColor Green
}

# Step 2: Validate tunnel config exists
Write-Host "[2/5] Validating tunnel configuration..." -ForegroundColor Yellow
if (-not (Test-Path $TunnelConfigPath)) {
    Write-Host "  ✗ Tunnel config not found: $TunnelConfigPath" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Config found: $TunnelConfigPath" -ForegroundColor Green

# Read and validate config uses 127.0.0.1 (not localhost)
$configContent = Get-Content $TunnelConfigPath -Raw
if ($configContent -match "localhost") {
    Write-Host "  ⚠ WARNING: Config contains 'localhost' - should use '127.0.0.1'" -ForegroundColor Yellow
    Write-Host "    IPv6 binding issues may occur!" -ForegroundColor Yellow
}

# Step 3: Verify required services are running
Write-Host "[3/5] Verifying required services..." -ForegroundColor Yellow
$requiredPorts = @(
    @{ Port = 8080; Name = "Reverse Proxy (Caddy)" },
    @{ Port = 3000; Name = "Frontend (Next.js)" },
    @{ Port = 3001; Name = "Backend (Express)" }
)

$allServicesReady = $true
foreach ($service in $requiredPorts) {
    $listening = netstat -ano | Select-String ":$($service.Port).*LISTENING"
    if ($listening) {
        Write-Host "  ✓ $($service.Name) listening on port $($service.Port)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($service.Name) NOT listening on port $($service.Port)" -ForegroundColor Red
        $allServicesReady = $false
    }
}

if (-not $allServicesReady) {
    Write-Host ""
    Write-Host "✗ Prerequisites not met. Start services first:" -ForegroundColor Red
    Write-Host "  .\scripts\start-production-stack.ps1" -ForegroundColor Yellow
    exit 1
}

# Step 4: Start tunnel with IPv4-only edge
Write-Host "[4/5] Starting Cloudflare tunnel (IPv4-only)..." -ForegroundColor Yellow
Write-Host "  Tunnel: $TunnelName" -ForegroundColor Gray
Write-Host "  Config: $TunnelConfigPath" -ForegroundColor Gray
Write-Host "  Edge IP Version: 4 (IPv4 only - prevents Windows IPv6 issues)" -ForegroundColor Gray

# Start tunnel in background
$tunnelStartScript = @"
Set-Location '$WorkspaceRoot'
cloudflared tunnel --config '$TunnelConfigPath' run $TunnelName --edge-ip-version 4
"@

$proc = Start-Process powershell -ArgumentList "-NoExit", "-Command", $tunnelStartScript -PassThru -WindowStyle Minimized
Write-Host "  Started tunnel process (PID: $($proc.Id))" -ForegroundColor Gray

# Wait for tunnel to register connections
Write-Host "  Waiting for tunnel connections to register..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# Verify process still running
$stillRunning = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue
if (-not $stillRunning) {
    Write-Host "  ✗ Tunnel process died immediately after start" -ForegroundColor Red
    Write-Host "    Check logs in the spawned window" -ForegroundColor Red
    exit 1
}

# Check if tunnel registered connections
$tunnelInfo = cloudflared tunnel info $TunnelName 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Tunnel process running (PID: $($proc.Id))" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Could not verify tunnel registration" -ForegroundColor Yellow
}


# Step 5: Validate public endpoints
if (-not $SkipValidation) {
    Write-Host "[5/5] Validating public endpoints..." -ForegroundColor Yellow
    Write-Host "  Waiting 5 seconds for Cloudflare propagation..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
    
    $validationPassed = $true
    foreach ($endpoint in $ValidationEndpoints) {
        Write-Host "  Testing: $($endpoint.Url)" -ForegroundColor Gray
        try {
            $response = Invoke-WebRequest -Uri $endpoint.Url -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
            $contentType = $response.Headers["Content-Type"]
            
            if ($contentType -like "$($endpoint.ExpectedContentType)*") {
                Write-Host "    ✓ $($endpoint.Description): $($response.StatusCode) (MIME: $contentType)" -ForegroundColor Green
            } else {
                Write-Host "    ✗ $($endpoint.Description): Wrong MIME type" -ForegroundColor Red
                Write-Host "      Expected: $($endpoint.ExpectedContentType)" -ForegroundColor Red
                Write-Host "      Got: $contentType" -ForegroundColor Red
                $validationPassed = $false
            }
        } catch {
            Write-Host "    ✗ $($endpoint.Description): Failed to reach" -ForegroundColor Red
            Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
            $validationPassed = $false
        }
    }
    
    if (-not $validationPassed) {
        Write-Host ""
        Write-Host "✗ Endpoint validation failed" -ForegroundColor Red
        Write-Host "  Tunnel is running but public endpoints not serving correctly" -ForegroundColor Red
        Write-Host "  Check:" -ForegroundColor Yellow
        Write-Host "    1. Caddy reverse proxy config (Caddyfile.production)" -ForegroundColor Yellow
        Write-Host "    2. Cloudflare tunnel config (uses 127.0.0.1, not localhost)" -ForegroundColor Yellow
        Write-Host "    3. Cloudflare cache (may need purging)" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "  ✓ All endpoints validated successfully" -ForegroundColor Green
} else {
    Write-Host "[5/5] Skipping validation (--SkipValidation flag)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Tunnel Started Successfully" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Tunnel Details:" -ForegroundColor Cyan
Write-Host "  Name: $TunnelName" -ForegroundColor White
Write-Host "  PID: $($proc.Id)" -ForegroundColor White
Write-Host "  Edge IP Version: 4 (IPv4 only)" -ForegroundColor White
Write-Host "  Public URLs:" -ForegroundColor White
Write-Host "    - https://care2connects.org" -ForegroundColor White
Write-Host "    - https://api.care2connects.org" -ForegroundColor White
Write-Host ""
Write-Host "To stop: Get-Process -Id $($proc.Id) | Stop-Process" -ForegroundColor Gray
Write-Host ""

    
    # Check if all endpoints are healthy
    $allHealthy = $checkResults["prod_api"] -and $checkResults["prod_frontend"] -and $checkResults["story_page"]
    
    if ($allHealthy) {
        Write-Host "  ✅ All production endpoints are healthy!" -ForegroundColor Green
        break
    }
    
    # Show current status
    $apiStatus = if ($checkResults["prod_api"]) { "API:✅" } else { "API:❌" }
    $frontendStatus = if ($checkResults["prod_frontend"]) { "Web:✅" } else { "Web:❌" }
    $storyStatus = if ($checkResults["story_page"]) { "Story:✅" } else { "Story:❌" }
    
    Write-Host "  Status: $apiStatus | $frontendStatus | $storyStatus" -ForegroundColor Gray
    Start-Sleep -Seconds $HealthCheckIntervalSec
}

# Final status report
Write-Host ""
Write-Host "=== TUNNEL STARTUP COMPLETE ===" -ForegroundColor Green

$finalCheck = $healthChecks | Select-Object -Last 1

Write-Host "Tunnel PID: $($tunnelProcess.Id)" -ForegroundColor White
Write-Host "IPv4 Mode: ENABLED (--edge-ip-version 4)" -ForegroundColor Cyan
Write-Host "Configuration: $configPath" -ForegroundColor White

if ($finalCheck["prod_api"]) {
    Write-Host "✅ Production API: HEALTHY (https://api.care2connect.org)" -ForegroundColor Green
} else {
    Write-Host "❌ Production API: FAILED" -ForegroundColor Red
    if ($finalCheck["prod_api_error"]) {
        Write-Host "   Error: $($finalCheck["prod_api_error"])" -ForegroundColor Red
    }
}

if ($finalCheck["prod_frontend"]) {
    Write-Host "✅ Production Web: HEALTHY (https://care2connects.org)" -ForegroundColor Green
} else {
    Write-Host "❌ Production Web: FAILED" -ForegroundColor Red
    if ($finalCheck["prod_frontend_error"]) {
        Write-Host "   Error: $($finalCheck["prod_frontend_error"])" -ForegroundColor Red
    }
}

if ($finalCheck["story_page"]) {
    Write-Host "✅ Tell Your Story: HEALTHY (https://care2connects.org/tell-your-story)" -ForegroundColor Green
} else {
    Write-Host "❌ Tell Your Story: FAILED" -ForegroundColor Red
    if ($finalCheck["story_page_error"]) {
        Write-Host "   Error: $($finalCheck["story_page_error"])" -ForegroundColor Red
    }
}

# Success determination
$success = $finalCheck["prod_api"] -and $finalCheck["prod_frontend"] -and $finalCheck["story_page"]

if ($success) {
    Write-Host ""
    Write-Host "🚀 TUNNEL IS READY FOR DEMO!" -ForegroundColor Green -BackgroundColor Black
    Write-Host "   All production endpoints are accessible and healthy" -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host ""
    Write-Host "🚨 TUNNEL HEALTH CHECK FAILED - Production endpoints not accessible" -ForegroundColor Red -BackgroundColor Black
    Write-Host "📋 PRODUCTION INVARIANT: Tunnel must be fully healthy to prevent demo failures" -ForegroundColor Red
    Write-Host "🔧 IMMEDIATE ACTION: Fix health check issues before proceeding" -ForegroundColor Red
    
    # PRODUCTION INVARIANT: Always kill tunnel process on critical health failures
    Write-Host "🛑 Stopping tunnel process to prevent false-green state" -ForegroundColor Red
    Stop-Process -Id $tunnelProcess.Id -Force -ErrorAction SilentlyContinue
    
    # HARD EXIT: Never allow production tunnel with failed health checks
    Write-Host "❌ HARD EXIT: Tunnel health verification failed" -ForegroundColor Red
    exit 1
}