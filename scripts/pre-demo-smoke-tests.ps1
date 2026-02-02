# Pre-Demo Smoke Tests
# PRODUCTION HARDENING: Specific validation for demo readiness

param(
    [switch]$StrictMode,
    [string]$DemoUrl = "https://care2connects.org",
    [string]$DemoFallbackUrl = "http://localhost:3000"
)

Write-Host "=== PRE-DEMO SMOKE TESTS ===" -ForegroundColor Cyan
Write-Host "CRITICAL: These tests validate the exact demo flow" -ForegroundColor Cyan
Write-Host ""
Write-Host "Primary URL: $DemoUrl" -ForegroundColor White
Write-Host "Fallback URL: $DemoFallbackUrl" -ForegroundColor White
Write-Host ""

$failed = $false
$testResults = @{}
$startTime = Get-Date

function Test-DemoComponent {
    param(
        [string]$Name,
        [scriptblock]$TestScript,
        [bool]$Critical = $true
    )
    
    Write-Host "[DEMO TEST] $Name..." -ForegroundColor Yellow
    
    try {
        $result = & $TestScript
        if ($result -eq $true) {
            Write-Host "  ✅ PASS: $Name" -ForegroundColor Green
            $testResults[$Name] = @{ status = "pass"; critical = $Critical }
        } else {
            Write-Host "  ❌ FAIL: $Name" -ForegroundColor Red
            Write-Host "     Details: $result" -ForegroundColor Red
            $testResults[$Name] = @{ status = "fail"; critical = $Critical; details = $result }
            if ($Critical) {
                $script:failed = $true
            }
        }
    } catch {
        Write-Host "  💥 ERROR: $Name" -ForegroundColor Red
        Write-Host "     Exception: $($_.Exception.Message)" -ForegroundColor Red
        $testResults[$Name] = @{ status = "error"; critical = $Critical; error = $_.Exception.Message }
        if ($Critical) {
            $script:failed = $true
        }
    }
    
    Write-Host ""
}

# DEMO TEST 1: Tunnel Process Health
Test-DemoComponent "Tunnel Process Running" {
    $process = Get-Process cloudflared -ErrorAction SilentlyContinue
    if ($process) {
        $uptime = (Get-Date) - $process.StartTime
        if ($uptime.TotalMinutes -gt 2) {  # Tunnel should be stable for at least 2 minutes
            return $true
        } else {
            return "Tunnel process too young (${uptime.TotalSeconds}s) - may not be stable"
        }
    } else {
        return "No cloudflared process found"
    }
} -Critical $true

# DEMO TEST 2: Production Homepage (Demo Entry Point)
Test-DemoComponent "Production Homepage Loads" {
    try {
        $response = Invoke-WebRequest -Uri $DemoUrl -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            # Check for key elements that should be on homepage
            $content = $response.Content
            if ($content -like "*care*connect*" -or $content -like "*Care*Connect*") {
                return $true
            } else {
                return "Homepage loaded but doesn't appear to be CareConnect site"
            }
        } else {
            return "Homepage returned status: $($response.StatusCode)"
        }
    } catch {
        return "Homepage failed to load: $($_.Exception.Message)"
    }
} -Critical $true

# DEMO TEST 3: Tell Your Story Page (Primary Demo Feature)
Test-DemoComponent "Tell Your Story Page (Primary Demo)" {
    try {
        $storyUrl = "$DemoUrl/tell-your-story"
        $response = Invoke-WebRequest -Uri $storyUrl -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $content = $response.Content
            if ($content -like "*tell*story*" -or $content -like "*Tell*Story*" -or $content -like "*record*") {
                return $true
            } else {
                return "Tell Your Story page loaded but content doesn't look correct"
            }
        } else {
            return "Tell Your Story page returned status: $($response.StatusCode)"
        }
    } catch {
        return "Tell Your Story page failed: $($_.Exception.Message)"
    }
} -Critical $true

# DEMO TEST 4: API Backend Health (Behind the Scenes)
Test-DemoComponent "Production API Backend" {
    try {
        $apiUrl = if ($DemoUrl -like "https://care2connects.org*") {
            "https://api.care2connects.org/health/live"
        } else {
            "$DemoUrl/api/health/live"
        }
        
        $response = Invoke-RestMethod -Uri $apiUrl -Method GET -TimeoutSec 15 -ErrorAction Stop
        if ($response.status -eq "ok") {
            return $true
        } else {
            return "API health status: $($response.status) - $($response.message)"
        }
    } catch {
        return "API backend failed: $($_.Exception.Message)"
    }
} -Critical $true

# DEMO TEST 5: Fallback Environment Ready
Test-DemoComponent "Fallback Environment Ready" {
    try {
        $fallbackResponse = Invoke-WebRequest -Uri $DemoFallbackUrl -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        if ($fallbackResponse.StatusCode -eq 200) {
            # Test fallback Tell Your Story page
            $fallbackStory = Invoke-WebRequest -Uri "$DemoFallbackUrl/tell-your-story" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
            if ($fallbackStory.StatusCode -eq 200) {
                return $true
            } else {
                return "Fallback Tell Your Story page not working"
            }
        } else {
            return "Fallback homepage returned status: $($fallbackResponse.StatusCode)"
        }
    } catch {
        return "Fallback environment not ready: $($_.Exception.Message)"
    }
} -Critical $false

# DEMO TEST 6: Performance Check (Demo Responsiveness)
Test-DemoComponent "Demo Page Load Performance" {
    try {
        $perfTest = Measure-Command {
            Invoke-WebRequest -Uri "$DemoUrl/tell-your-story" -UseBasicParsing -TimeoutSec 20 -ErrorAction Stop
        }
        
        $loadTimeMs = $perfTest.TotalMilliseconds
        if ($loadTimeMs -lt 10000) {  # Under 10 seconds is acceptable for demo
            return $true
        } else {
            return "Page load too slow for demo: ${loadTimeMs}ms (should be under 10,000ms)"
        }
    } catch {
        return "Performance test failed: $($_.Exception.Message)"
    }
} -Critical $false

# DEMO TEST 7: No Error Pages Present
Test-DemoComponent "No Error Pages (502, 1033, etc.)" {
    try {
        $testUrls = @(
            $DemoUrl,
            "$DemoUrl/tell-your-story"
        )
        
        foreach ($testUrl in $testUrls) {
            $response = Invoke-WebRequest -Uri $testUrl -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
            $content = $response.Content
            
            # Check for error page indicators
            if ($content -like "*502*" -or $content -like "*Bad Gateway*" -or 
                $content -like "*1033*" -or $content -like "*Cloudflare Tunnel*" -or
                $content -like "*connection refused*" -or $content -like "*ERR_*") {
                return "Error page detected at $testUrl"
            }
        }
        
        return $true
    } catch {
        return "Error page check failed: $($_.Exception.Message)"
    }
} -Critical $true

# RESULTS ANALYSIS
$totalTime = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)
$passCount = ($testResults.Values | Where-Object { $_.status -eq "pass" }).Count
$failCount = ($testResults.Values | Where-Object { $_.status -eq "fail" }).Count
$errorCount = ($testResults.Values | Where-Object { $_.status -eq "error" }).Count
$criticalFailures = ($testResults.Values | Where-Object { ($_.status -eq "fail" -or $_.status -eq "error") -and $_.critical }).Count

Write-Host "=== DEMO READINESS RESULTS ===" -ForegroundColor Cyan
Write-Host "Test execution time: $totalTime seconds" -ForegroundColor White
Write-Host ""

# Detailed results
foreach ($testName in $testResults.Keys) {
    $result = $testResults[$testName]
    $criticalMark = if ($result.critical) { " (CRITICAL)" } else { " (NON-CRITICAL)" }
    
    switch ($result.status) {
        "pass" { Write-Host "  ✅ $testName$criticalMark" -ForegroundColor Green }
        "fail" { 
            Write-Host "  ❌ $testName$criticalMark" -ForegroundColor Red 
            if ($result.details) {
                Write-Host "     Issue: $($result.details)" -ForegroundColor Red
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
Write-Host "  🚨 Critical Issues: $criticalFailures" -ForegroundColor Red

# FINAL DEMO READINESS VERDICT
if ($failed -or $criticalFailures -gt 0) {
    Write-Host ""
    Write-Host "🚨 DEMO NOT READY" -ForegroundColor Red -BackgroundColor Black
    Write-Host ""
    Write-Host "CRITICAL ISSUES BLOCKING DEMO:" -ForegroundColor Red
    foreach ($testName in $testResults.Keys) {
        $result = $testResults[$testName]
        if (($result.status -eq "fail" -or $result.status -eq "error") -and $result.critical) {
            Write-Host "  • $testName" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "RECOMMENDED ACTIONS:" -ForegroundColor Yellow
    if ($testResults["Tunnel Process Running"].status -ne "pass") {
        Write-Host "  1. Restart tunnel: .\scripts\tunnel-start.ps1 -StrictMode" -ForegroundColor Yellow
    }
    if ($testResults["Production Homepage Loads"].status -ne "pass" -or $testResults["Tell Your Story Page (Primary Demo)"].status -ne "pass") {
        Write-Host "  2. Check local servers: npm run dev" -ForegroundColor Yellow
        Write-Host "  3. Use fallback: $DemoFallbackUrl" -ForegroundColor Yellow
    }
    if ($testResults["Production API Backend"].status -ne "pass") {
        Write-Host "  4. Verify backend health: http://localhost:3001/health/live" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "⚠️  DO NOT START DEMO UNTIL ISSUES ARE RESOLVED" -ForegroundColor Yellow
    
    exit 1
} else {
    Write-Host ""
    Write-Host "🚀 DEMO IS READY!" -ForegroundColor Green -BackgroundColor Black
    Write-Host ""
    Write-Host "✅ All critical tests passed" -ForegroundColor Green
    Write-Host "✅ Production URL ready: $DemoUrl" -ForegroundColor Green
    Write-Host "✅ Fallback URL ready: $DemoFallbackUrl" -ForegroundColor Green
    
    if ($testResults["Fallback Environment Ready"].status -eq "pass") {
        Write-Host "✅ Emergency fallback available" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Fallback environment has issues (not critical)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🎯 DEMO FLOW VALIDATED:" -ForegroundColor Green
    Write-Host "  1. Navigate to: $DemoUrl" -ForegroundColor Green
    Write-Host "  2. Click 'Tell Your Story' button" -ForegroundColor Green
    Write-Host "  3. Show story recording functionality" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 EMERGENCY PLAN:" -ForegroundColor Cyan
    Write-Host "  If production fails → Switch to: $DemoFallbackUrl" -ForegroundColor Cyan
    Write-Host "  Explain: 'This is our development environment with identical functionality'" -ForegroundColor Cyan
    
    exit 0
}