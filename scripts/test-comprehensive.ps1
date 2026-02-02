#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Comprehensive System Test Suite for Care2system V1 Production
    
.DESCRIPTION
    Complete validation suite covering server, tunnel, database connectivity
    and all V1 hardening features without requiring deployment.
    
.PARAMETER TestMode
    Test scope: 'local', 'production', or 'all'
    
.PARAMETER SkipDatabase
    Skip database connectivity tests
    
.PARAMETER SkipTunnel
    Skip tunnel connectivity tests
    
.PARAMETER SkipStress
    Skip stress testing validation
    
.PARAMETER Quick
    Run only essential tests for rapid validation
    
.EXAMPLE
    .\scripts\comprehensive-system-test.ps1
    
.EXAMPLE
    .\scripts\comprehensive-system-test.ps1 -TestMode production -Quick
#>

param(
    [ValidateSet('local', 'production', 'all')]
    [string]$TestMode = 'all',
    [switch]$SkipDatabase,
    [switch]$SkipTunnel, 
    [switch]$SkipStress,
    [switch]$Quick
)

# Colors for output
$Green = if ($PSVersionTable.PSVersion.Major -ge 6) { "`e[32m" } else { "" }
$Red = if ($PSVersionTable.PSVersion.Major -ge 6) { "`e[31m" } else { "" }
$Yellow = if ($PSVersionTable.PSVersion.Major -ge 6) { "`e[33m" } else { "" }
$Blue = if ($PSVersionTable.PSVersion.Major -ge 6) { "`e[34m" } else { "" }
$Cyan = if ($PSVersionTable.PSVersion.Major -ge 6) { "`e[36m" } else { "" }
$Reset = if ($PSVersionTable.PSVersion.Major -ge 6) { "`e[0m" } else { "" }

$script:TestResults = @()

function Write-ColorOutput {
    param($Message, $Color = $Reset)
    Write-Host "$Color$Message$Reset"
}

function Write-TestResult {
    param($TestName, $Status, $Details = "")
    
    $statusColor = switch ($Status) {
        "PASS" { $Green }
        "FAIL" { $Red }
        "SKIP" { $Yellow }
        "WARN" { $Yellow }
    }
    
    $icon = switch ($Status) {
        "PASS" { "✅" }
        "FAIL" { "❌" }
        "SKIP" { "⏭️" }
        "WARN" { "⚠️" }
    }
    
    $result = @{
        Name = $TestName
        Status = $Status
        Details = $Details
        Timestamp = Get-Date
    }
    $script:TestResults += $result
    
    Write-ColorOutput "$icon $TestName - $Status" $statusColor
    if ($Details) {
        Write-ColorOutput "   $Details" $Cyan
    }
}

function Test-ServerHealth {
    Write-ColorOutput "🔍 Testing Server Health..." $Blue
    
    $port = $env:PORT
    if (-not $port) { $port = "3001" }
    $baseUrl = "http://localhost:$port"
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/health/live" -Method Get -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-TestResult "Server Liveness" "PASS" "Server responding on port $port"
            
            # Test readiness
            try {
                $readyResponse = Invoke-RestMethod -Uri "$baseUrl/ops/ready" -Method Get -TimeoutSec 15
                if ($readyResponse.status -eq 'ready') {
                    Write-TestResult "Server Readiness" "PASS" "System reports ready"
                } else {
                    Write-TestResult "Server Readiness" "WARN" "System status: $($readyResponse.status)"
                }
            } catch {
                Write-TestResult "Server Readiness" "FAIL" "Readiness check failed"
            }
            
            return $true
        } else {
            Write-TestResult "Server Liveness" "FAIL" "Status: $($response.StatusCode)"
            return $false
        }
    } catch {
        Write-TestResult "Server Health" "FAIL" "Cannot connect: $($_.Exception.Message)"
        return $false
    }
}

function Test-DatabaseConnectivity {
    if ($SkipDatabase) {
        Write-TestResult "Database Connectivity" "SKIP" "Skipped by parameter"
        return
    }
    
    Write-ColorOutput "🔍 Testing Database Connectivity..." $Blue
    
    $port = $env:PORT
    if (-not $port) { $port = "3001" }
    $baseUrl = "http://localhost:$port"
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/ops/ready" -Method Get -TimeoutSec 15
        
        if ($response.services -and $response.services.database) {
            $dbStatus = $response.services.database
            
            if ($dbStatus.healthy -eq $true) {
                Write-TestResult "Database Health" "PASS" "Database healthy: $($dbStatus.reason)"
                
                # Test DB_MODE configuration
                $dbMode = $env:DB_MODE
                if ($dbMode) {
                    Write-TestResult "Database Mode" "PASS" "DB_MODE=$dbMode"
                } else {
                    Write-TestResult "Database Mode" "WARN" "DB_MODE not configured"
                }
                
            } else {
                Write-TestResult "Database Health" "FAIL" "Database unhealthy: $($dbStatus.reason)"
            }
        } else {
            Write-TestResult "Database Health" "WARN" "Database status not reported"
        }
        
        # Test simple database query
        try {
            $queryResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/search?query=test&limit=1" -Method Get -TimeoutSec 10
            Write-TestResult "Database Query Test" "PASS" "Database queries working"
        } catch {
            Write-TestResult "Database Query Test" "WARN" "Query test failed: $($_.Exception.Message)"
        }
        
    } catch {
        Write-TestResult "Database Connectivity" "FAIL" "Error testing database: $($_.Exception.Message)"
    }
}

function Test-TunnelConnectivity {
    if ($SkipTunnel) {
        Write-TestResult "Tunnel Connectivity" "SKIP" "Skipped by parameter"
        return
    }
    
    Write-ColorOutput "🔍 Testing Tunnel Connectivity..." $Blue
    
    $tunnelUrl = $env:TUNNEL_URL
    if (-not $tunnelUrl) {
        Write-TestResult "Tunnel Configuration" "SKIP" "TUNNEL_URL not configured"
        return
    }
    
    try {
        $response = Invoke-WebRequest -Uri "$tunnelUrl/health/live" -Method Get -TimeoutSec 15
        if ($response.StatusCode -eq 200) {
            Write-TestResult "Tunnel Liveness" "PASS" "Tunnel responding"
            
            # Test tunnel readiness
            try {
                $readyResponse = Invoke-RestMethod -Uri "$tunnelUrl/ops/ready" -Method Get -TimeoutSec 15
                if ($readyResponse.status -eq 'ready') {
                    Write-TestResult "Tunnel Readiness" "PASS" "System ready through tunnel"
                } else {
                    Write-TestResult "Tunnel Readiness" "WARN" "Tunnel status: $($readyResponse.status)"
                }
            } catch {
                Write-TestResult "Tunnel Readiness" "WARN" "Tunnel readiness check failed"
            }
            
        } else {
            Write-TestResult "Tunnel Liveness" "FAIL" "Tunnel status: $($response.StatusCode)"
        }
    } catch {
        Write-TestResult "Tunnel Connectivity" "FAIL" "Cannot connect through tunnel: $($_.Exception.Message)"
    }
    
    # Check cloudflared process
    try {
        $processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
        if ($processes) {
            $processCount = $processes.Count
            Write-TestResult "Cloudflare Tunnel Process" "PASS" "cloudflared running ($processCount processes)"
        } else {
            Write-TestResult "Cloudflare Tunnel Process" "WARN" "No cloudflared processes found"
        }
    } catch {
        Write-TestResult "Cloudflare Tunnel Process" "SKIP" "Cannot check processes"
    }
}

function Test-V1HardeningFeatures {
    Write-ColorOutput "🔍 Testing V1 Hardening Features..." $Blue
    
    $port = $env:PORT
    if (-not $port) { $port = "3001" }
    $baseUrl = "http://localhost:$port"
    
    # Test correlation ID middleware
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/health/live" -Method Get -TimeoutSec 5
        $requestId = $response.Headers['X-Request-Id']
        
        if ($requestId) {
            Write-TestResult "Correlation ID Middleware" "PASS" "X-Request-Id present"
            
            # Test custom ID preservation
            $customId = "test-custom-$(Get-Random)"
            $headers = @{ 'X-Request-Id' = $customId }
            $customResponse = Invoke-WebRequest -Uri "$baseUrl/health/live" -Method Get -Headers $headers -TimeoutSec 5
            $returnedId = $customResponse.Headers['X-Request-Id'][0]
            
            if ($returnedId -eq $customId) {
                Write-TestResult "Correlation ID Preservation" "PASS" "Custom IDs preserved"
            } else {
                Write-TestResult "Correlation ID Preservation" "WARN" "Custom ID handling issue"
            }
        } else {
            Write-TestResult "Correlation ID Middleware" "FAIL" "X-Request-Id header missing"
        }
    } catch {
        Write-TestResult "Correlation ID Middleware" "FAIL" "Error testing correlation IDs"
    }
    
    # Test Zero-OpenAI mode
    $isZeroMode = $env:ZERO_OPENAI_MODE -eq 'true' -or $env:V1_STABLE -eq 'true'
    
    if ($isZeroMode) {
        try {
            $response = Invoke-RestMethod -Uri "$baseUrl/ops/ready" -Method Get -TimeoutSec 10
            
            if ($response.services -and $response.services.openai) {
                $openaiStatus = $response.services.openai
                
                if (-not $openaiStatus.healthy -and $openaiStatus.reason -match 'disabled') {
                    Write-TestResult "Zero-OpenAI Mode" "PASS" "OpenAI correctly disabled"
                } else {
                    Write-TestResult "Zero-OpenAI Mode" "FAIL" "OpenAI should be disabled"
                }
            } else {
                Write-TestResult "Zero-OpenAI Mode" "WARN" "OpenAI status not reported"
            }
        } catch {
            Write-TestResult "Zero-OpenAI Mode" "FAIL" "Error checking Zero-OpenAI mode"
        }
    } else {
        Write-TestResult "Zero-OpenAI Mode" "SKIP" "Not in Zero-OpenAI mode"
    }
    
    # Test stub provider (if configured)
    if ($env:TRANSCRIPTION_PROVIDER -eq 'stub') {
        $stubPath = ".\backend\src\providers\transcription\stub.ts"
        if (Test-Path $stubPath) {
            $stubContent = Get-Content $stubPath -Raw
            
            $stubModes = @('FAST', 'NORMAL', 'SLOW', 'ERROR')
            $foundModes = ($stubModes | Where-Object { $stubContent -match $_ }).Count
            
            if ($foundModes -ge 3) {
                Write-TestResult "Enhanced Stub Provider" "PASS" "Found $foundModes stub modes"
            } else {
                Write-TestResult "Enhanced Stub Provider" "WARN" "Limited stub modes"
            }
        } else {
            Write-TestResult "Enhanced Stub Provider" "FAIL" "Stub provider not found"
        }
    } else {
        Write-TestResult "Enhanced Stub Provider" "SKIP" "Not using stub provider"
    }
}

function Test-ConfigurationConsistency {
    Write-ColorOutput "🔍 Testing Configuration Consistency..." $Blue
    
    # Check critical environment variables
    $criticalVars = @{
        'V1_STABLE' = 'V1 stable mode'
        'ZERO_OPENAI_MODE' = 'Zero-OpenAI mode'
        'DB_MODE' = 'Database mode'
        'NODE_ENV' = 'Node environment'
    }
    
    $missingVars = @()
    $validVars = @()
    
    foreach ($var in $criticalVars.Keys) {
        $value = (Get-Item "Env:$var" -ErrorAction SilentlyContinue)?.Value
        if ($value) {
            $validVars += "$var=$value"
        } else {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -eq 0) {
        Write-TestResult "Critical Environment Variables" "PASS" "All variables configured"
    } else {
        Write-TestResult "Critical Environment Variables" "WARN" "Missing: $($missingVars -join ', ')"
    }
    
    # Validate V1 mode consistency
    $v1Stable = $env:V1_STABLE -eq 'true'
    $zeroOpenAI = $env:ZERO_OPENAI_MODE -eq 'true'
    
    if ($v1Stable -and $zeroOpenAI) {
        Write-TestResult "V1 Mode Consistency" "PASS" "V1_STABLE and ZERO_OPENAI_MODE aligned"
    } elseif ($v1Stable -and -not $zeroOpenAI) {
        Write-TestResult "V1 Mode Consistency" "FAIL" "V1_STABLE requires ZERO_OPENAI_MODE=true"
    } else {
        Write-TestResult "V1 Mode Consistency" "SKIP" "Not in V1 stable mode"
    }
}

function Test-SecurityFeatures {
    Write-ColorOutput "🔍 Testing Security Features..." $Blue
    
    $port = $env:PORT
    if (-not $port) { $port = "3001" }
    $baseUrl = "http://localhost:$port"
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/health/live" -Method Get -TimeoutSec 10
        
        # Check security headers
        $securityHeaders = @('X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection')
        $foundHeaders = @()
        
        foreach ($header in $securityHeaders) {
            if ($response.Headers[$header]) {
                $foundHeaders += $header
            }
        }
        
        if ($foundHeaders.Count -ge 2) {
            Write-TestResult "Security Headers" "PASS" "Found $($foundHeaders.Count) security headers"
        } else {
            Write-TestResult "Security Headers" "WARN" "Limited security headers"
        }
        
        # Check for request tracing
        if ($response.Headers['X-Request-Id']) {
            Write-TestResult "Request Tracing" "PASS" "X-Request-Id header present"
        } else {
            Write-TestResult "Request Tracing" "FAIL" "X-Request-Id header missing"
        }
        
    } catch {
        Write-TestResult "Security Features" "FAIL" "Error testing security features"
    }
}

function Test-StressCapabilities {
    if ($SkipStress) {
        Write-TestResult "Stress Test Capabilities" "SKIP" "Skipped by parameter"
        return
    }
    
    Write-ColorOutput "🔍 Testing Stress Test Capabilities..." $Blue
    
    # Check if stress test script exists
    $stressScript = ".\scripts\stress-test.ps1"
    if (Test-Path $stressScript) {
        Write-TestResult "Stress Test Script" "PASS" "stress-test.ps1 found"
        
        # Check stress test configuration
        if ($env:ENABLE_STRESS_TEST_MODE -eq 'true') {
            Write-TestResult "Stress Test Environment" "PASS" "Stress testing enabled"
            
            if (-not $Quick -and $env:X_STRESS_TEST_KEY) {
                try {
                    Write-ColorOutput "Running lightweight stress test..." $Cyan
                    $stressOutput = & $stressScript -TicketCount 2 -StubMode fast -Quick 2>&1
                    $stressExitCode = $LASTEXITCODE
                    
                    if ($stressExitCode -eq 0) {
                        Write-TestResult "Stress Test Execution" "PASS" "Lightweight test successful"
                    } else {
                        Write-TestResult "Stress Test Execution" "WARN" "Stress test had issues"
                    }
                } catch {
                    Write-TestResult "Stress Test Execution" "WARN" "Error running stress test"
                }
            } else {
                Write-TestResult "Stress Test Execution" "SKIP" "Quick mode or missing test key"
            }
        } else {
            Write-TestResult "Stress Test Environment" "SKIP" "Stress testing not enabled"
        }
    } else {
        Write-TestResult "Stress Test Capabilities" "FAIL" "stress-test.ps1 not found"
    }
}

function Show-TestSummary {
    Write-ColorOutput "" $Reset
    Write-ColorOutput "📊 COMPREHENSIVE SYSTEM TEST RESULTS" $Blue
    Write-ColorOutput "====================================" $Blue
    
    $totalTests = $script:TestResults.Count
    $passedTests = ($script:TestResults | Where-Object { $_.Status -eq "PASS" }).Count
    $failedTests = ($script:TestResults | Where-Object { $_.Status -eq "FAIL" }).Count
    $skippedTests = ($script:TestResults | Where-Object { $_.Status -eq "SKIP" }).Count
    $warnTests = ($script:TestResults | Where-Object { $_.Status -eq "WARN" }).Count
    
    Write-ColorOutput "Total Tests: $totalTests" $Reset
    Write-ColorOutput "✅ Passed: $passedTests" $Green
    Write-ColorOutput "❌ Failed: $failedTests" $Red
    Write-ColorOutput "⏭️ Skipped: $skippedTests" $Yellow
    Write-ColorOutput "⚠️  Warnings: $warnTests" $Yellow
    
    if ($failedTests -gt 0) {
        Write-ColorOutput "" $Reset
        Write-ColorOutput "❌ FAILED TESTS:" $Red
        $failed = $script:TestResults | Where-Object { $_.Status -eq "FAIL" }
        foreach ($test in $failed) {
            Write-ColorOutput "   • $($test.Name): $($test.Details)" $Red
        }
    }
    
    $successRate = if ($totalTests -gt 0) { ($passedTests / $totalTests) * 100 } else { 0 }
    Write-ColorOutput "" $Reset
    Write-ColorOutput "🎯 SUCCESS RATE: $([math]::Round($successRate, 1))%" $(
        if ($successRate -ge 90) { $Green }
        elseif ($successRate -ge 75) { $Yellow }
        else { $Red }
    )
    
    if ($failedTests -eq 0 -and $successRate -ge 90) {
        Write-ColorOutput "" $Reset
        Write-ColorOutput "🎉 COMPREHENSIVE SYSTEM TEST PASSED!" $Green
        return 0
    } elseif ($failedTests -eq 0) {
        Write-ColorOutput "" $Reset
        Write-ColorOutput "⚠️  SYSTEM TEST PASSED WITH WARNINGS" $Yellow
        return 0
    } else {
        Write-ColorOutput "" $Reset
        Write-ColorOutput "❌ SYSTEM TEST FAILED" $Red
        return 1
    }
}

# Main execution
Write-ColorOutput "🔍 COMPREHENSIVE SYSTEM TEST SUITE" $Blue
Write-ColorOutput "Care2system V1 + Production Invariants" $Cyan
Write-ColorOutput "======================================" $Blue
Write-ColorOutput "Test Mode: $TestMode" $Cyan
Write-ColorOutput "Quick Mode: $Quick" $Cyan
Write-ColorOutput "Skip Database: $SkipDatabase" $Cyan
Write-ColorOutput "Skip Tunnel: $SkipTunnel" $Cyan
Write-ColorOutput "Skip Stress: $SkipStress" $Cyan
Write-ColorOutput "" $Reset

$startTime = Get-Date

# Execute test suite
$serverHealthy = Test-ServerHealth

if ($serverHealthy -or $TestMode -eq 'local') {
    Test-DatabaseConnectivity
    Test-TunnelConnectivity
    Test-V1HardeningFeatures
    Test-ConfigurationConsistency
    Test-SecurityFeatures
    
    if (-not $Quick) {
        Test-StressCapabilities
    }
} else {
    Write-TestResult "Test Suite" "FAIL" "Server not healthy, skipping additional tests"
}

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-ColorOutput "" $Reset
Write-ColorOutput "⏱️  Test Duration: $([math]::Round($duration, 1)) seconds" $Cyan

# Show results and exit
$exitCode = Show-TestSummary
exit $exitCode