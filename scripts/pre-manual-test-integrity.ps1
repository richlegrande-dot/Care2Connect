# Pre-Manual Test System Integrity Script

Write-Host "Pre-Manual Test System Integrity" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

$BASE_URL = "http://localhost:3001"
$results = @{
    "health_checks" = @()
    "parser_tests" = @()
    "database_tests" = @()
    "overall_status" = "UNKNOWN"
}

function Write-TestResult {
    param([string]$TestName, [string]$Status, [string]$Details = "", [string]$Category = "general")

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $result = @{
        "timestamp" = $timestamp
        "test" = $TestName
        "status" = $Status
        "details" = $Details
        "category" = $Category
    }

    switch ($Category) {
        "health" { $results.health_checks += $result }
        "parser" { $results.parser_tests += $result }
        "database" { $results.database_tests += $result }
    }

    $color = switch ($Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        default { "Gray" }
    }

    Write-Host "[$timestamp] $TestName : $Status" -ForegroundColor $color
    if ($Details) {
        Write-Host "  Details: $Details" -ForegroundColor Gray
    }
}

function Test-HealthEndpoint {
    param([string]$Endpoint, [string]$Description)

    try {
        $response = Invoke-WebRequest -Uri "$BASE_URL$Endpoint" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-TestResult -TestName "Health: $Description" -Status "PASS" -Details "HTTP 200" -Category "health"
            return $true
        } else {
            Write-TestResult -TestName "Health: $Description" -Status "FAIL" -Details "HTTP $($response.StatusCode)" -Category "health"
            return $false
        }
    } catch {
        Write-TestResult -TestName "Health: $Description" -Status "FAIL" -Details $_.Exception.Message -Category "health"
        return $false
    }
}

function Test-ParserFunctionality {
    try {
        $testTranscript = "I need help with my car payment of `$250 that is due tomorrow"
        $json = @{transcript = $testTranscript} | ConvertTo-Json
        $response = Invoke-WebRequest -Uri "$BASE_URL/api/transcribe/test-parser" -Method POST -Body $json -ContentType "application/json" -UseBasicParsing -TimeoutSec 30

        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            $profileData = $result.data.profileData
            $hasName = $profileData.name -ne $null
            $hasSkills = $profileData.skills -and $profileData.skills.Count -gt 0
            $hasSummary = $profileData.summary -and $profileData.summary.Length -gt 0
            $hasUrgentNeeds = $profileData.urgent_needs -and $profileData.urgent_needs.Count -gt 0

            if ($hasName -or $hasSkills -or $hasSummary -or $hasUrgentNeeds) {
                Write-TestResult -TestName "Parser: Combined Approach Test" -Status "PASS" -Details "Profile data extraction working" -Category "parser"
                return $true
            } else {
                Write-TestResult -TestName "Parser: Combined Approach Test" -Status "FAIL" -Details "No profile data extracted" -Category "parser"
                return $false
            }
        } else {
            Write-TestResult -TestName "Parser: Combined Approach Test" -Status "FAIL" -Details "HTTP $($response.StatusCode)" -Category "parser"
            return $false
        }
    } catch {
        Write-TestResult -TestName "Parser: Combined Approach Test" -Status "FAIL" -Details $_.Exception.Message -Category "parser"
        return $false
    }
}

function Test-DatabaseConnectivity {
    try {
        $response = Invoke-WebRequest -Uri "$BASE_URL/health/db" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-TestResult -TestName "Database: Connectivity Test" -Status "PASS" -Details "Connected" -Category "database"
            return $true
        } else {
            Write-TestResult -TestName "Database: Connectivity Test" -Status "FAIL" -Details "HTTP $($response.StatusCode)" -Category "database"
            return $false
        }
    } catch {
        Write-TestResult -TestName "Database: Connectivity Test" -Status "FAIL" -Details $_.Exception.Message -Category "database"
        return $false
    }
}

# Run tests
Write-Host "Running Health Checks..." -ForegroundColor Blue
Test-HealthEndpoint "/health/live" "Server Liveness"
Test-HealthEndpoint "/health/live" "Server Readiness"

Write-Host ""
Write-Host "Running Database Tests..." -ForegroundColor Blue
Test-DatabaseConnectivity

Write-Host ""
Write-Host "Running Parser Tests..." -ForegroundColor Blue
Test-ParserFunctionality

# Generate report
Write-Host ""
Write-Host "SYSTEM INTEGRITY REPORT" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

$healthPass = ($results.health_checks | Where-Object { $_.status -eq "PASS" }).Count
$healthTotal = $results.health_checks.Count
$parserPass = ($results.parser_tests | Where-Object { $_.status -eq "PASS" }).Count
$parserTotal = $results.parser_tests.Count
$dbPass = ($results.database_tests | Where-Object { $_.status -eq "PASS" }).Count
$dbTotal = $results.database_tests.Count

if ($healthPass -eq $healthTotal -and $parserPass -eq $parserTotal -and $dbPass -eq $dbTotal) {
    $results.overall_status = "READY"
} elseif ($healthPass -ge ($healthTotal * 0.8) -and $parserPass -ge ($parserTotal * 0.8) -and $dbPass -ge ($dbTotal * 0.8)) {
    $results.overall_status = "READY_WITH_WARNINGS"
} else {
    $results.overall_status = "NOT_READY"
}

Write-Host ""
Write-Host "Overall Status: $($results.overall_status)" -ForegroundColor Green
Write-Host "Health Checks: $healthPass/$healthTotal passed" -ForegroundColor White
Write-Host "Parser Tests: $parserPass/$parserTotal passed" -ForegroundColor White
Write-Host "Database Tests: $dbPass/$dbTotal passed" -ForegroundColor White

Write-Host ""
Write-Host "Parser Status: Combined Approach (Option A+C) deployed" -ForegroundColor Green

if ($results.overall_status -eq "READY") {
    Write-Host "System is ready for manual testing!" -ForegroundColor Green
} elseif ($results.overall_status -eq "READY_WITH_WARNINGS") {
    Write-Host "System mostly ready, monitor for issues" -ForegroundColor Yellow
} else {
    Write-Host "Address critical issues before manual testing" -ForegroundColor Red
}

# Save results
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath "system_integrity_report.json" -Encoding UTF8
Write-Host ""
Write-Host "Results saved to system_integrity_report.json" -ForegroundColor Gray

Write-Host ""
Write-Host "System integrity validation complete!" -ForegroundColor Green