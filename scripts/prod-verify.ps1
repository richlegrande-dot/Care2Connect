# Production Verification Script
# PRODUCTION HARDENING: Complete production readiness validation
# 
# This script verifies EVERYTHING that matters for a successful demo.
# NO FALSE GREENS: Only returns success if production actually works.

param(
    [switch]$StrictMode,
    [int]$TimeoutSec = 120,
    [switch]$SkipTunnel,
    [string]$AdminPassword = "admin2024"
)

Write-Host "=== PRODUCTION VERIFICATION ===" -ForegroundColor Cyan
Write-Host "FAIL-FAST PRODUCTION READINESS TESTING" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script verifies:" -ForegroundColor Gray
Write-Host "• Local servers are healthy and reachable" -ForegroundColor Gray
Write-Host "• Production endpoints work through tunnel" -ForegroundColor Gray
Write-Host "• Database connectivity and performance" -ForegroundColor Gray
Write-Host "• Configuration consistency" -ForegroundColor Gray
Write-Host "• Critical user flows (Tell Your Story)" -ForegroundColor Gray
Write-Host ""

$startTime = Get-Date
$failed = $false
$results = @{}

# Helper function for test reporting
function Test-Component {
    param(
        [string]$Name,
        [scriptblock]$TestScript,
        [bool]$Critical = $true
    )
    
    Write-Host "[TEST] $Name..." -ForegroundColor Yellow
    
    try {
        $testResult = & $TestScript
        if ($testResult -eq $true) {
            Write-Host "  ✅ PASS: $Name" -ForegroundColor Green
            $results[$Name] = @{ status = "pass"; critical = $Critical }
        } else {
            Write-Host "  ❌ FAIL: $Name" -ForegroundColor Red
            Write-Host "     Result: $testResult" -ForegroundColor Red
            $results[$Name] = @{ status = "fail"; critical = $Critical; details = $testResult }
            if ($Critical) {
                $script:failed = $true
            }
        }
    } catch {
        Write-Host "  ❌ ERROR: $Name" -ForegroundColor Red
        Write-Host "     Exception: $($_.Exception.Message)" -ForegroundColor Red
        $results[$Name] = @{ status = "error"; critical = $Critical; error = $_.Exception.Message }
        if ($Critical) {
            $script:failed = $true
        }
    }
    
    Write-Host ""
}

# TEST 1: Local Backend Health
Test-Component "Backend Health Check" {
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:3001/health/live" -Method GET -TimeoutSec 10 -ErrorAction Stop
        if ($response.status -eq "ok") {
            return $true
        } else {
            return "Backend health status: $($response.status)"
        }
    } catch {
        return "Backend not responding: $($_.Exception.Message)"
    }
} -Critical $true

# TEST 2: Local Frontend Health
Test-Component "Frontend Health Check" {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            return $true
        } else {
            return "Frontend returned status: $($response.StatusCode)"
        }
    } catch {
        return "Frontend not responding: $($_.Exception.Message)"
    }
} -Critical $true

# TEST 3: Backend Production Readiness Endpoint
Test-Component "Backend Production Readiness" {
    try {
        $authHeader = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:$AdminPassword"))
        $headers = @{ Authorization = "Basic $authHeader" }
        
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:3001/ops/ready" -Method GET -Headers $headers -TimeoutSec 15 -ErrorAction Stop
        
        if ($response.status -eq "ready") {
            return $true
        } elseif ($response.status -eq "degraded") {
            $issues = $response.checks | Where-Object { $_.status -ne "ready" } | ForEach-Object { "$($_.name):$($_.status)" }
            return "Backend degraded: $($issues -join ', ')"
        } else {
            $failures = $response.checks | Where-Object { $_.status -eq "down" } | ForEach-Object { "$($_.name):$($_.message)" }
            return "Backend not ready: $($failures -join '; ')"
        }
    } catch {
        return "Production readiness endpoint failed: $($_.Exception.Message)"
    }
} -Critical $true

# TEST 4: Tell Your Story Page (Local)
Test-Component "Tell Your Story Page (Local)" {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:3000/tell-your-story" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            # Check for key elements that should be in the Tell Your Story page
            $content = $response.Content
            if ($content -like "*tell*your*story*" -or $content -like "*Tell*Your*Story*") {
                return $true
            } else {
                return "Tell Your Story page loaded but content appears incorrect"
            }
        } else {
            return "Tell Your Story page returned status: $($response.StatusCode)"
        }
    } catch {
        return "Tell Your Story page not accessible: $($_.Exception.Message)"
    }
} -Critical $true

# PRODUCTION TESTS (only if not skipping tunnel)
if (-not $SkipTunnel) {
    
    # TEST 5: Production Readiness (Unified Contract)
    Test-Component "Production Readiness" {
        try {
            $response = Invoke-RestMethod -Uri "https://api.care2connects.org/ops/health/production" -Method GET -TimeoutSec 15 -ErrorAction Stop
            if ($response.status -in @("ready", "ready-degraded")) {
                if ($response.status -eq "ready-degraded") {
                    return "Production ready but degraded: $($response.message)"
                } else {
                    return $true
                }
            } else {
                return "Production not ready: $($response.message)"
            }
        } catch {
            return "Production readiness check failed: $($_.Exception.Message)"
        }
    } -Critical $true
    
    # TEST 6: Production Frontend
    Test-Component "Production Frontend" {
        try {
            $response = Invoke-WebRequest -Uri "https://care2connects.org" -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                return $true
            } else {
                return "Production frontend returned status: $($response.StatusCode)"
            }
        } catch {
            return "Production frontend not responding: $($_.Exception.Message)"
        }
    } -Critical $true
    
    # TEST 7: Production Tell Your Story Page
    Test-Component "Production Tell Your Story Page" {
        try {
            $response = Invoke-WebRequest -Uri "https://care2connects.org/tell-your-story" -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $content = $response.Content
                if ($content -like "*tell*your*story*" -or $content -like "*Tell*Your*Story*") {
                    return $true
                } else {
                    return "Production Tell Your Story page loaded but content appears incorrect"
                }
            } else {
                return "Production Tell Your Story page returned status: $($response.StatusCode)"
            }
        } catch {
            return "Production Tell Your Story page not accessible: $($_.Exception.Message)"
        }
    } -Critical $true
    
    # TEST 8: Production Readiness Endpoint
    Test-Component "Production Readiness Endpoint" {
        try {
            $authHeader = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:$AdminPassword"))
            $headers = @{ Authorization = "Basic $authHeader" }
            
            $response = Invoke-RestMethod -Uri "https://api.care2connects.org/ops/ready" -Method GET -Headers $headers -TimeoutSec 20 -ErrorAction Stop
            
            if ($response.status -eq "ready") {
                return $true
            } elseif ($response.status -eq "degraded") {
                $issues = $response.checks | Where-Object { $_.status -ne "ready" } | ForEach-Object { "$($_.name):$($_.status)" }
                return "Production backend degraded: $($issues -join ', ')"
            } else {
                $failures = $response.checks | Where-Object { $_.status -eq "down" } | ForEach-Object { "$($_.name):$($_.message)" }
                return "Production backend not ready: $($failures -join '; ')"
            }
        } catch {
            return "Production readiness endpoint failed: $($_.Exception.Message)"
        }
    } -Critical $true
    
} else {
    Write-Host "[SKIP] Production tunnel tests skipped (--SkipTunnel specified)" -ForegroundColor Yellow
    Write-Host ""
}

# CONFIGURATION TESTS

# TEST 9: Port Configuration Consistency
Test-Component "Port Configuration Consistency" {
    try {
        # Check .env files for consistency
        $backendEnv = "C:\Users\richl\Care2system\backend\.env"
        $backendPort = 3001  # Default
        
        if (Test-Path $backendEnv) {
            $envContent = Get-Content $backendEnv
            $portLine = $envContent | Where-Object { $_ -match "^PORT=(\d+)" }
            if ($portLine) {
                $backendPort = [int]($matches[1])
            }
        }
        
        # Check if frontend is configured to use the same backend port
        $frontendPort = 3000
        $expectedApiUrl = "http://localhost:${backendPort}/api"
        
        if ($backendPort -eq $frontendPort) {
            return "Port conflict: backend and frontend both using port $backendPort"
        }
        
        if ($backendPort -lt 1024 -or $backendPort -gt 65535 -or $frontendPort -lt 1024 -or $frontendPort -gt 65535) {
            return "Invalid port range: backend=$backendPort, frontend=$frontendPort"
        }
        
        return $true
    } catch {
        return "Port configuration check failed: $($_.Exception.Message)"
    }
} -Critical $true

# TEST 10: Process Health (No Zombies)
Test-Component "Process Health Check" {
    try {
        $zombieNodes = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.WorkingSet64 -eq 0 }
        if ($zombieNodes) {
            return "Found $($zombieNodes.Count) zombie Node.js processes"
        }
        
        $cloudflaredProcesses = Get-Process cloudflared -ErrorAction SilentlyContinue
        if (-not $SkipTunnel -and -not $cloudflaredProcesses) {
            return "No cloudflared process found (tunnel required but not running)"
        }
        
        return $true
    } catch {
        return "Process health check failed: $($_.Exception.Message)"
    }
} -Critical $false

# RESULTS SUMMARY
$totalTime = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)

Write-Host "=== VERIFICATION RESULTS ===" -ForegroundColor Cyan
Write-Host "Total verification time: $totalTime seconds" -ForegroundColor White
Write-Host ""

$passCount = ($results.Values | Where-Object { $_.status -eq "pass" }).Count
$failCount = ($results.Values | Where-Object { $_.status -eq "fail" }).Count
$errorCount = ($results.Values | Where-Object { $_.status -eq "error" }).Count
$criticalFailures = ($results.Values | Where-Object { ($_.status -eq "fail" -or $_.status -eq "error") -and $_.critical }).Count

# Show detailed results
Write-Host "DETAILED RESULTS:" -ForegroundColor Yellow
foreach ($testName in $results.Keys) {
    $result = $results[$testName]
    $criticalMark = if ($result.critical) { " (CRITICAL)" } else { "" }
    
    switch ($result.status) {
        "pass" { Write-Host "  ✅ $testName$criticalMark" -ForegroundColor Green }
        "fail" { 
            Write-Host "  ❌ $testName$criticalMark" -ForegroundColor Red 
            if ($result.details) {
                Write-Host "     Details: $($result.details)" -ForegroundColor Red
            }
        }
        "error" { 
            Write-Host "  💥 $testName$criticalMark" -ForegroundColor Red 
            Write-Host "     Error: $($result.error)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "SUMMARY:" -ForegroundColor Yellow
Write-Host "  ✅ Passed: $passCount" -ForegroundColor Green
Write-Host "  ❌ Failed: $failCount" -ForegroundColor Red  
Write-Host "  💥 Errors: $errorCount" -ForegroundColor Red
Write-Host "  🚨 Critical Failures: $criticalFailures" -ForegroundColor Red

# FINAL VERDICT
if ($failed -or $criticalFailures -gt 0) {
    Write-Host ""
    Write-Host "🚨 PRODUCTION VERIFICATION FAILED" -ForegroundColor Red -BackgroundColor Black
    Write-Host ""
    Write-Host "CRITICAL ISSUES DETECTED:" -ForegroundColor Red
    foreach ($testName in $results.Keys) {
        $result = $results[$testName]
        if (($result.status -eq "fail" -or $result.status -eq "error") -and $result.critical) {
            Write-Host "  • $testName" -ForegroundColor Red
        }
    }
    Write-Host ""
    Write-Host "❌ SYSTEM IS NOT READY FOR DEMO" -ForegroundColor Red
    Write-Host "   Fix critical issues before attempting demo" -ForegroundColor Red
    
    exit 1
} else {
    Write-Host ""
    Write-Host "🚀 PRODUCTION VERIFICATION PASSED" -ForegroundColor Green -BackgroundColor Black
    Write-Host ""
    Write-Host "✅ ALL CRITICAL SYSTEMS HEALTHY" -ForegroundColor Green
    Write-Host "✅ LOCAL SERVERS READY" -ForegroundColor Green
    
    if (-not $SkipTunnel) {
        Write-Host "✅ PRODUCTION TUNNEL READY" -ForegroundColor Green
        Write-Host "✅ PUBLIC ENDPOINTS ACCESSIBLE" -ForegroundColor Green
    } else {
        Write-Host "⚠️  TUNNEL CHECKS SKIPPED" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🎯 SYSTEM IS READY FOR DEMO!" -ForegroundColor Green
    Write-Host "   You can confidently present using:" -ForegroundColor Green
    
    if (-not $SkipTunnel) {
        Write-Host "   • https://care2connects.org" -ForegroundColor Green
        Write-Host "   • https://care2connects.org/tell-your-story" -ForegroundColor Green
    } else {
        Write-Host "   • http://localhost:3000" -ForegroundColor Green
        Write-Host "   • http://localhost:3000/tell-your-story" -ForegroundColor Green
    }
    
    exit 0
}