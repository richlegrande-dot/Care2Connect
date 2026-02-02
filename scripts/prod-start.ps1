# Production Startup Script with Health Verification
# PRODUCTION HARDENING: Ensures clean startup and verifies health before declaring success

param(
    [int]$HealthCheckTimeoutSec = 120,
    [int]$HealthCheckIntervalSec = 5,
    [switch]$StrictMode,
    [switch]$SkipTunnel
)

Write-Host "=== PRODUCTION STARTUP WITH HEALTH VERIFICATION ===" -ForegroundColor Cyan
Write-Host "Timeout: $HealthCheckTimeoutSec seconds" -ForegroundColor Gray
Write-Host "Interval: $HealthCheckIntervalSec seconds" -ForegroundColor Gray
Write-Host "Strict Mode: $(if($StrictMode) {'ENABLED'} else {'DISABLED'})" -ForegroundColor Gray
Write-Host ""

$startTime = Get-Date
$rootDir = "C:\Users\richl\Care2system"

# STEP 1: Clean up any existing processes
Write-Host "[1/7] Cleaning up existing processes..." -ForegroundColor Yellow

# Stop PM2 processes cleanly
Write-Host "  Stopping PM2 processes..." -ForegroundColor Gray
try {
    & npm run pm2:stop 2>$null
    & npm run pm2:delete 2>$null
    Start-Sleep -Seconds 2
    Write-Host "    ✅ PM2 processes stopped" -ForegroundColor Green
} catch {
    Write-Host "    ⚠️  PM2 cleanup failed (may not be running)" -ForegroundColor Yellow
}

# Kill any zombie Node.js processes
Write-Host "  Checking for zombie Node.js processes..." -ForegroundColor Gray
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.WorkingSet64 -eq 0 }
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "    Killed zombie process PID $($_.Id)" -ForegroundColor Gray
    }
    Write-Host "    ✅ Zombie processes cleaned up" -ForegroundColor Green
} else {
    Write-Host "    ✅ No zombie processes found" -ForegroundColor Green
}

# STEP 2: Validate configuration before startup
Write-Host "[2/7] Validating production configuration..." -ForegroundColor Yellow

# Set production environment variables
$env:NODE_ENV = "production"
$env:STRICT_PORT_MODE = if($StrictMode) {"true"} else {"false"}

# Validate frontend configuration
Write-Host "  Validating frontend configuration..." -ForegroundColor Gray
try {
    Set-Location "$rootDir\frontend"
    $frontendValidation = & node "scripts\validate-config.js"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ Frontend configuration valid" -ForegroundColor Green
    } else {
        Write-Host "    ❌ Frontend configuration invalid" -ForegroundColor Red
        if ($StrictMode) {
            Write-Host "🚨 STRICT MODE: Cannot continue with invalid configuration" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "    ⚠️  Frontend validation failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Set-Location $rootDir

# STEP 3: Start backend with port validation
Write-Host "[3/7] Starting backend server..." -ForegroundColor Yellow

Write-Host "  Starting backend in background..." -ForegroundColor Gray
$backendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\richl\Care2system"
    npm run dev:backend
}

# Wait for backend to start up
Write-Host "  Waiting for backend startup..." -ForegroundColor Gray
$backendReady = $false
$attempts = 0
$maxAttempts = 20

while (-not $backendReady -and $attempts -lt $maxAttempts) {
    Start-Sleep -Seconds 3
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/health/live" -Method GET -TimeoutSec 5 -ErrorAction Stop
        if ($response.status -eq "ok") {
            $backendReady = $true
            Write-Host "    ✅ Backend started and healthy" -ForegroundColor Green
        }
    } catch {
        $attempts++
        Write-Host "    Attempt $attempts/$maxAttempts - Backend not ready yet..." -ForegroundColor Gray
    }
}

if (-not $backendReady) {
    Write-Host "    ❌ Backend failed to start within timeout" -ForegroundColor Red
    if ($StrictMode) {
        Write-Host "🚨 STRICT MODE: Backend startup required" -ForegroundColor Red
        exit 1
    }
}

# STEP 4: Start frontend
Write-Host "[4/7] Starting frontend server..." -ForegroundColor Yellow

Write-Host "  Starting frontend in background..." -ForegroundColor Gray
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\richl\Care2system\frontend"
    npm run dev
}

# Wait for frontend to start up
Write-Host "  Waiting for frontend startup..." -ForegroundColor Gray
$frontendReady = $false
$attempts = 0

while (-not $frontendReady -and $attempts -lt $maxAttempts) {
    Start-Sleep -Seconds 3
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            Write-Host "    ✅ Frontend started and responding" -ForegroundColor Green
        }
    } catch {
        $attempts++
        Write-Host "    Attempt $attempts/$maxAttempts - Frontend not ready yet..." -ForegroundColor Gray
    }
}

if (-not $frontendReady) {
    Write-Host "    ❌ Frontend failed to start within timeout" -ForegroundColor Red
    if ($StrictMode) {
        Write-Host "🚨 STRICT MODE: Frontend startup required" -ForegroundColor Red
        exit 1
    }
}

# STEP 5: Start Cloudflare tunnel (if not skipped)
if (-not $SkipTunnel) {
    Write-Host "[5/7] Starting Cloudflare tunnel..." -ForegroundColor Yellow
    
    try {
        & "$rootDir\scripts\fix-cloudflare-tunnel.ps1"
        Write-Host "    ✅ Tunnel configuration completed" -ForegroundColor Green
    } catch {
        Write-Host "    ❌ Tunnel startup failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($StrictMode) {
            Write-Host "🚨 STRICT MODE: Tunnel startup required" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "[5/7] Skipping tunnel startup (--SkipTunnel specified)" -ForegroundColor Yellow
}

# STEP 6: Comprehensive health verification
Write-Host "[6/7] Running comprehensive health verification..." -ForegroundColor Yellow

$healthChecks = @()
$healthEndTime = (Get-Date).AddSeconds($HealthCheckTimeoutSec)

while ((Get-Date) -lt $healthEndTime) {
    $checkResults = @{}
    
    # Check backend health
    try {
        $backendHealth = Invoke-RestMethod -Uri "http://localhost:3001/health/live" -Method GET -TimeoutSec 5 -ErrorAction Stop
        $checkResults["backend"] = $backendHealth.status -eq "ok"
        $checkResults["backend_status"] = $backendHealth.status
    } catch {
        $checkResults["backend"] = $false
        $checkResults["backend_error"] = $_.Exception.Message
    }
    
    # Check frontend health
    try {
        $frontendHealth = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        $checkResults["frontend"] = $frontendHealth.StatusCode -eq 200
    } catch {
        $checkResults["frontend"] = $false
        $checkResults["frontend_error"] = $_.Exception.Message
    }
    
    # Check production endpoints (if tunnel not skipped)
    if (-not $SkipTunnel) {
        try {
            $prodHealth = Invoke-RestMethod -Uri "https://api.care2connects.org/health/live" -Method GET -TimeoutSec 10 -ErrorAction Stop
            $checkResults["production"] = $prodHealth.status -eq "ok"
        } catch {
            $checkResults["production"] = $false
            $checkResults["production_error"] = $_.Exception.Message
        }
        
        try {
            $prodFrontend = Invoke-WebRequest -Uri "https://care2connects.org" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
            $checkResults["production_frontend"] = $prodFrontend.StatusCode -eq 200
        } catch {
            $checkResults["production_frontend"] = $false
            $checkResults["production_frontend_error"] = $_.Exception.Message
        }
    }
    
    $healthChecks += $checkResults
    
    # Check if all required services are healthy
    $allHealthy = $checkResults["backend"] -and $checkResults["frontend"]
    if (-not $SkipTunnel) {
        $allHealthy = $allHealthy -and $checkResults["production"] -and $checkResults["production_frontend"]
    }
    
    if ($allHealthy) {
        Write-Host "    ✅ All services are healthy!" -ForegroundColor Green
        break
    }
    
    # Show current status
    $status = @()
    if ($checkResults["backend"]) { $status += "Backend:✅" } else { $status += "Backend:❌" }
    if ($checkResults["frontend"]) { $status += "Frontend:✅" } else { $status += "Frontend:❌" }
    if (-not $SkipTunnel) {
        if ($checkResults["production"]) { $status += "Prod-API:✅" } else { $status += "Prod-API:❌" }
        if ($checkResults["production_frontend"]) { $status += "Prod-Web:✅" } else { $status += "Prod-Web:❌" }
    }
    
    Write-Host "    Status: $($status -join ' | ')" -ForegroundColor Gray
    Start-Sleep -Seconds $HealthCheckIntervalSec
}

# STEP 7: Final status report
Write-Host "[7/7] Production startup status report..." -ForegroundColor Yellow

$finalCheck = $healthChecks | Select-Object -Last 1
$totalTime = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)

Write-Host ""
Write-Host "=== PRODUCTION STARTUP COMPLETE ===" -ForegroundColor Green
Write-Host "Total startup time: $totalTime seconds" -ForegroundColor White

if ($finalCheck["backend"]) {
    Write-Host "✅ Backend: HEALTHY (http://localhost:3001)" -ForegroundColor Green
} else {
    Write-Host "❌ Backend: FAILED" -ForegroundColor Red
    if ($finalCheck["backend_error"]) {
        Write-Host "   Error: $($finalCheck["backend_error"])" -ForegroundColor Red
    }
}

if ($finalCheck["frontend"]) {
    Write-Host "✅ Frontend: HEALTHY (http://localhost:3000)" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend: FAILED" -ForegroundColor Red
    if ($finalCheck["frontend_error"]) {
        Write-Host "   Error: $($finalCheck["frontend_error"])" -ForegroundColor Red
    }
}

if (-not $SkipTunnel) {
    if ($finalCheck["production"]) {
        Write-Host "✅ Production API: HEALTHY (https://api.care2connects.org)" -ForegroundColor Green
    } else {
        Write-Host "❌ Production API: FAILED" -ForegroundColor Red
        if ($finalCheck["production_error"]) {
            Write-Host "   Error: $($finalCheck["production_error"])" -ForegroundColor Red
        }
    }
    
    if ($finalCheck["production_frontend"]) {
        Write-Host "✅ Production Web: HEALTHY (https://care2connects.org)" -ForegroundColor Green
    } else {
        Write-Host "❌ Production Web: FAILED" -ForegroundColor Red
        if ($finalCheck["production_frontend_error"]) {
            Write-Host "   Error: $($finalCheck["production_frontend_error"])" -ForegroundColor Red
        }
    }
}

# Success criteria
$success = $finalCheck["backend"] -and $finalCheck["frontend"]
if (-not $SkipTunnel) {
    $success = $success -and $finalCheck["production"] -and $finalCheck["production_frontend"]
}

if ($success) {
    Write-Host ""
    Write-Host "🚀 PRODUCTION SYSTEM IS READY FOR DEMO!" -ForegroundColor Green -BackgroundColor Black
    Write-Host ""
    exit 0
} else {
    Write-Host ""
    Write-Host "⚠️  PRODUCTION SYSTEM HAS ISSUES - Check failures above" -ForegroundColor Yellow -BackgroundColor Black
    
    if ($StrictMode) {
        Write-Host "🚨 STRICT MODE: Exiting due to health check failures" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "📋 FLEXIBLE MODE: Continuing despite issues (use -StrictMode for fail-fast)" -ForegroundColor Yellow
        exit 0
    }
}