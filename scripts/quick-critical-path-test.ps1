# Quick Critical Path Test (Non-hanging version)
param([int]$TimeoutSec = 30)

$ErrorActionPreference = "Stop"

Write-Host "=== QUICK CRITICAL PATH TEST ===" -ForegroundColor Cyan
Write-Host "Testing essential functionality with timeouts" -ForegroundColor White

$results = @()

# Test 1: Backend basic health
Write-Host "[1/4] Backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health/live" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Backend responding (200)" -ForegroundColor Green
        $results += @{ Test = "Backend Health"; Status = "PASS" }
    } else {
        Write-Host "  ❌ Backend returned $($response.StatusCode)" -ForegroundColor Red
        $results += @{ Test = "Backend Health"; Status = "FAIL" }
    }
} catch {
    Write-Host "  ❌ Backend not responding: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Test = "Backend Health"; Status = "FAIL" }
}

# Test 2: Frontend basic test
Write-Host "[2/4] Frontend health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Frontend responding (200)" -ForegroundColor Green
        $results += @{ Test = "Frontend Health"; Status = "PASS" }
    } else {
        Write-Host "  ❌ Frontend returned $($response.StatusCode)" -ForegroundColor Red
        $results += @{ Test = "Frontend Health"; Status = "FAIL" }
    }
} catch {
    Write-Host "  ❌ Frontend not responding: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Test = "Frontend Health"; Status = "FAIL" }
}

# Test 3: PM2 Status
Write-Host "[3/4] PM2 services..." -ForegroundColor Yellow
try {
    $pm2Status = pm2 jlist 2>$null | ConvertFrom-Json
    $backendService = $pm2Status | Where-Object { $_.name -eq "careconnect-backend" -and $_.pm2_env.status -eq "online" }
    $frontendService = $pm2Status | Where-Object { $_.name -eq "careconnect-frontend" -and $_.pm2_env.status -eq "online" }
    
    if ($backendService -and $frontendService) {
        Write-Host "  ✅ Both services online in PM2" -ForegroundColor Green
        $results += @{ Test = "PM2 Services"; Status = "PASS" }
    } elseif ($backendService) {
        Write-Host "  ⚠️  Backend online, frontend offline in PM2" -ForegroundColor Yellow
        $results += @{ Test = "PM2 Services"; Status = "PARTIAL" }
    } else {
        Write-Host "  ❌ Services not running in PM2" -ForegroundColor Red
        $results += @{ Test = "PM2 Services"; Status = "FAIL" }
    }
} catch {
    Write-Host "  ❌ PM2 check failed: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Test = "PM2 Services"; Status = "FAIL" }
}

# Test 4: Backend production readiness (non-blocking)
Write-Host "[4/4] Production readiness..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/ops/health/production" -Method GET -TimeoutSec 5
    if ($response.status -eq "ready") {
        Write-Host "  ✅ Production ready" -ForegroundColor Green
        $results += @{ Test = "Production Readiness"; Status = "PASS" }
    } elseif ($response.status -eq "ready-degraded") {
        Write-Host "  ⚠️  Production ready with warnings" -ForegroundColor Yellow
        $results += @{ Test = "Production Readiness"; Status = "PARTIAL" }
    } else {
        Write-Host "  ❌ Production not ready: $($response.status)" -ForegroundColor Red
        $results += @{ Test = "Production Readiness"; Status = "FAIL" }
    }
} catch {
    Write-Host "  ❌ Readiness check failed: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Test = "Production Readiness"; Status = "FAIL" }
}

# Summary
Write-Host ""
Write-Host "=== QUICK TEST SUMMARY ===" -ForegroundColor Cyan

$passed = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$partial = ($results | Where-Object { $_.Status -eq "PARTIAL" }).Count
$failed = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$total = $results.Count

Write-Host "Results: $passed PASS, $partial PARTIAL, $failed FAIL (Total: $total)" -ForegroundColor White

$results | ForEach-Object {
    $color = switch ($_.Status) {
        "PASS" { "Green" }
        "PARTIAL" { "Yellow" }  
        "FAIL" { "Red" }
    }
    Write-Host "  $($_.Status): $($_.Test)" -ForegroundColor $color
}

if ($failed -eq 0 -and $partial -eq 0) {
    Write-Host "✅ ALL TESTS PASSED" -ForegroundColor Green -BackgroundColor Black
    exit 0
} elseif ($failed -eq 0) {
    Write-Host "⚠️  TESTS PASSED WITH WARNINGS" -ForegroundColor Yellow -BackgroundColor Black
    exit 1
} else {
    Write-Host "❌ CRITICAL FAILURES DETECTED" -ForegroundColor Red -BackgroundColor Black
    exit 2
}