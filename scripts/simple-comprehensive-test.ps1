#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Care2system Comprehensive Test Suite
    
.DESCRIPTION
    Tests server, tunnel, database connectivity and V1 hardening features
    
.PARAMETER Quick
    Run essential tests only
    
.PARAMETER SkipDatabase
    Skip database tests
    
.PARAMETER SkipTunnel
    Skip tunnel tests
#>

param(
    [switch]$Quick,
    [switch]$SkipDatabase,
    [switch]$SkipTunnel
)

$script:TestResults = @()

function Write-TestResult {
    param($TestName, $Status, $Details = "")
    
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
    
    Write-Host "$icon $TestName - $Status"
    if ($Details) {
        Write-Host "   $Details"
    }
}

function Test-ServerHealth {
    Write-Host "🔍 Testing Server Health..."
    
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
    
    Write-Host "🔍 Testing Database Connectivity..."
    
    $port = $env:PORT
    if (-not $port) { $port = "3001" }
    $baseUrl = "http://localhost:$port"
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/ops/ready" -Method Get -TimeoutSec 15
        
        if ($response.services -and $response.services.database) {
            $dbStatus = $response.services.database
            
            if ($dbStatus.healthy -eq $true) {
                Write-TestResult "Database Health" "PASS" "Database healthy"
                
                # Test DB_MODE configuration
                $dbMode = $env:DB_MODE
                if ($dbMode) {
                    Write-TestResult "Database Mode" "PASS" "DB_MODE=$dbMode"
                } else {
                    Write-TestResult "Database Mode" "WARN" "DB_MODE not configured"
                }
                
            } else {
                Write-TestResult "Database Health" "FAIL" "Database unhealthy"
            }
        } else {
            Write-TestResult "Database Health" "WARN" "Database status not reported"
        }
        
        # Test simple database query
        try {
            $queryResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/search?query=test&limit=1" -Method Get -TimeoutSec 10
            Write-TestResult "Database Query Test" "PASS" "Database queries working"
        } catch {
            Write-TestResult "Database Query Test" "WARN" "Query test failed"
        }
        
    } catch {
        Write-TestResult "Database Connectivity" "FAIL" "Error testing database"
    }
}

function Test-TunnelConnectivity {
    if ($SkipTunnel) {
        Write-TestResult "Tunnel Connectivity" "SKIP" "Skipped by parameter"
        return
    }
    
    Write-Host "🔍 Testing Tunnel Connectivity..."
    
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
                    Write-TestResult "Tunnel Readiness" "WARN" "Tunnel status issue"
                }
            } catch {
                Write-TestResult "Tunnel Readiness" "WARN" "Tunnel readiness check failed"
            }
            
        } else {
            Write-TestResult "Tunnel Liveness" "FAIL" "Tunnel status error"
        }
    } catch {
        Write-TestResult "Tunnel Connectivity" "FAIL" "Cannot connect through tunnel"
    }
    
    # Check cloudflared process
    try {
        $processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
        if ($processes) {
            $processCount = $processes.Count
            Write-TestResult "Cloudflare Tunnel Process" "PASS" "cloudflared running (count: $processCount)"
        } else {
            Write-TestResult "Cloudflare Tunnel Process" "WARN" "No cloudflared processes found"
        }
    } catch {
        Write-TestResult "Cloudflare Tunnel Process" "SKIP" "Cannot check processes"
    }
}

function Test-V1HardeningFeatures {
    Write-Host "🔍 Testing V1 Hardening Features..."
    
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
    Write-Host "🔍 Testing Configuration Consistency..."
    
    # Check critical environment variables
    $criticalVars = @{
        'V1_STABLE' = 'V1 stable mode'
        'ZERO_OPENAI_MODE' = 'Zero-OpenAI mode'
        'DB_MODE' = 'Database mode'
        'NODE_ENV' = 'Node environment'
    }
    
    $missingVars = @()
    
    foreach ($var in $criticalVars.Keys) {
        $value = (Get-Item "Env:$var" -ErrorAction SilentlyContinue)?.Value
        if (-not $value) {
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

function Show-TestSummary {
    Write-Host ""
    Write-Host "📊 COMPREHENSIVE SYSTEM TEST RESULTS"
    Write-Host "===================================="
    
    $totalTests = $script:TestResults.Count
    $passedTests = ($script:TestResults | Where-Object { $_.Status -eq "PASS" }).Count
    $failedTests = ($script:TestResults | Where-Object { $_.Status -eq "FAIL" }).Count
    $skippedTests = ($script:TestResults | Where-Object { $_.Status -eq "SKIP" }).Count
    $warnTests = ($script:TestResults | Where-Object { $_.Status -eq "WARN" }).Count
    
    Write-Host "Total Tests: $totalTests"
    Write-Host "✅ Passed: $passedTests"
    Write-Host "❌ Failed: $failedTests"
    Write-Host "⏭️ Skipped: $skippedTests" 
    Write-Host "⚠️  Warnings: $warnTests"
    
    if ($failedTests -gt 0) {
        Write-Host ""
        Write-Host "❌ FAILED TESTS:"
        $failed = $script:TestResults | Where-Object { $_.Status -eq "FAIL" }
        foreach ($test in $failed) {
            Write-Host "   • $($test.Name): $($test.Details)"
        }
    }
    
    $successRate = if ($totalTests -gt 0) { ($passedTests / $totalTests) * 100 } else { 0 }
    Write-Host ""
    Write-Host "Success Rate: $([math]::Round($successRate, 1))%"
    
    if ($failedTests -eq 0 -and $successRate -ge 90) {
        Write-Host ""
        Write-Host "🎉 COMPREHENSIVE SYSTEM TEST PASSED!"
        return 0
    } elseif ($failedTests -eq 0) {
        Write-Host ""
        Write-Host "⚠️  SYSTEM TEST PASSED WITH WARNINGS"
        return 0
    } else {
        Write-Host ""
        Write-Host "❌ SYSTEM TEST FAILED"
        return 1
    }
}

# Main execution
Write-Host "🔍 COMPREHENSIVE SYSTEM TEST SUITE"
Write-Host "Care2system V1 + Production Invariants"
Write-Host "======================================"
Write-Host "Quick Mode: $Quick"
Write-Host "Skip Database: $SkipDatabase"
Write-Host "Skip Tunnel: $SkipTunnel"
Write-Host ""

$startTime = Get-Date

# Execute test suite
$serverHealthy = Test-ServerHealth

if ($serverHealthy) {
    Test-DatabaseConnectivity
    Test-TunnelConnectivity
    Test-V1HardeningFeatures
    Test-ConfigurationConsistency
} else {
    Write-TestResult "Test Suite" "FAIL" "Server not healthy, skipping additional tests"
}

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host ""
Write-Host "Test Duration: $([math]::Round($duration, 1)) seconds"

# Show results and exit
$exitCode = Show-TestSummary
exit $exitCode