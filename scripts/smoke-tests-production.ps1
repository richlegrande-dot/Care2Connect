# Production Smoke Tests for care2connects.org
$ErrorActionPreference = "Continue"

Write-Host "`n╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PRODUCTION SMOKE TESTS: care2connects.org  ║" -ForegroundColor Cyan  
Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Cyan

$tests = @(
    @{Name="Homepage"; URL="https://care2connects.org"; Critical=$true}
    @{Name="Tell Your Story (Demo Page)"; URL="https://care2connects.org/tell-your-story"; Critical=$true}
    @{Name="Profiles Page"; URL="https://care2connects.org/profiles"; Critical=$false}
    @{Name="API Health Live"; URL="https://api.care2connects.org/health/live"; Critical=$true}
    @{Name="API Production Health"; URL="https://api.care2connects.org/ops/health/production"; Critical=$true}
)

$passed = 0
$failed = 0
$criticalPassed = 0
$criticalTotal = ($tests | Where-Object { $_.Critical }).Count

foreach ($test in $tests) {
    $testType = if ($test.Critical) { "[CRITICAL]" } else { "[STANDARD]" }
    Write-Host "`n$testType $($test.Name)" -ForegroundColor $(if ($test.Critical) { "Magenta" } else { "Yellow" })
    Write-Host "  URL: $($test.URL)" -ForegroundColor DarkGray
    
    try {
        $response = Invoke-WebRequest -Uri $test.URL -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ PASS - Status: 200" -ForegroundColor Green
            $passed++
            if ($test.Critical) { $criticalPassed++ }
            
            # Additional validation for specific endpoints
            if ($test.URL -match "/health/live") {
                $json = $response.Content | ConvertFrom-Json
                Write-Host "     Backend port: $($json.port), uptime: $([math]::Round($json.uptime, 1))s" -ForegroundColor DarkGreen
            }
            elseif ($test.URL -match "/ops/health/production") {
                $json = $response.Content | ConvertFrom-Json
                Write-Host "     Production status: $($json.status)" -ForegroundColor DarkGreen
            }
        }
        else {
            Write-Host "  ❌ FAIL - Status: $($response.StatusCode)" -ForegroundColor Red
            $failed++
        }
    }
    catch {
        Write-Host "  ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              TEST RESULTS SUMMARY             ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`nTimestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')" -ForegroundColor White
Write-Host "Domain: care2connects.org" -ForegroundColor White
Write-Host "`nCritical Tests: $criticalPassed / $criticalTotal" -ForegroundColor $(if ($criticalPassed -eq $criticalTotal) { "Green" } else { "Red" })
Write-Host "Total Passed: $passed / $($tests.Count)" -ForegroundColor Green
Write-Host "Total Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "Pass Rate: $([math]::Round(($passed / $tests.Count) * 100, 1))%" -ForegroundColor White

if ($criticalPassed -eq $criticalTotal) {
    Write-Host "`n✅ ALL CRITICAL TESTS PASSED" -ForegroundColor Green
    Write-Host "" 
    Write-Host "Production Status: OPERATIONAL" -ForegroundColor Green
    Write-Host "Demo Page Status: WORKING" -ForegroundColor Green  
    Write-Host "Backend Health: ALIVE" -ForegroundColor Green
    Write-Host "Production Ready: YES" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 care2connects.org is ready for production traffic" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "`n❌ CRITICAL TEST FAILURES" -ForegroundColor Red
    Write-Host "Production deployment blocked" -ForegroundColor Red
    exit 1
}
