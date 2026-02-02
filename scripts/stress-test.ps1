#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Stress Test Harness for CareConnect V1 System
    
.DESCRIPTION
    Creates multiple concurrent recordings to test system performance and stability.
    Uses stub transcription provider to avoid external API costs.
    Requires ENABLE_STRESS_TEST_MODE=true and valid X-STRESS-TEST-KEY header.
    
.PARAMETER TicketCount
    Number of concurrent tickets to create (default: 10)
    
.PARAMETER Delay
    Delay between ticket creations in milliseconds (default: 100)
    
.PARAMETER StubMode
    Stub provider mode: fast, normal, slow, error, random, needs_info (default: fast)
    
.PARAMETER BaseUrl
    Base URL for the backend API (default: http://localhost:3001)
    
.PARAMETER MaxWaitTime  
    Maximum time to wait for all tickets to complete in seconds (default: 300)
    
.PARAMETER Verbose
    Show detailed output for each request
    
.EXAMPLE
    .\scripts\stress-test.ps1 -TicketCount 20 -StubMode fast
    
.EXAMPLE
    .\scripts\stress-test.ps1 -TicketCount 5 -StubMode random -Verbose
#>

param(
    [int]$TicketCount = 10,
    [int]$Delay = 100,
    [ValidateSet('fast', 'normal', 'slow', 'error', 'random', 'needs_info')]
    [string]$StubMode = 'fast',
    [string]$BaseUrl = 'http://localhost:3001',
    [int]$MaxWaitTime = 300,
    [switch]$Verbose,
    [switch]$SkipValidation
)

# Colors for output
$Green = if ($PSVersionTable.PSVersion.Major -ge 6) { "`e[32m" } else { "" }
$Red = if ($PSVersionTable.PSVersion.Major -ge 6) { "`e[31m" } else { "" }
$Yellow = if ($PSVersionTable.PSVersion.Major -ge 6) { "`e[33m" } else { "" }
$Blue = if ($PSVersionTable.PSVersion.Major -ge 6) { "`e[34m" } else { "" }
$Reset = if ($PSVersionTable.PSVersion.Major -ge 6) { "`e[0m" } else { "" }

function Write-ColorOutput {
    param($Message, $Color = $Reset)
    Write-Host "$Color$Message$Reset"
}

function Test-StressTestMode {
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/ops/ready" -Method Get -TimeoutSec 10
        
        if ($response -and $response.stressTestMode -eq $true) {
            return $true
        } else {
            Write-ColorOutput "❌ Stress test mode not enabled on backend" $Red
            Write-ColorOutput "   Add ENABLE_STRESS_TEST_MODE=true to .env and restart backend" $Yellow
            return $false
        }
    } catch {
        Write-ColorOutput "❌ Could not check stress test mode: $($_.Exception.Message)" $Red
        return $false
    }
}

function Get-StressTestKey {
    $key = $env:X_STRESS_TEST_KEY
    if (-not $key) {
        Write-ColorOutput "❌ X_STRESS_TEST_KEY environment variable not set" $Red
        Write-ColorOutput "   Set X_STRESS_TEST_KEY=your_test_key_here" $Yellow
        return $null
    }
    return $key
}

function Test-BackendHealth {
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/health/live" -Method Get -TimeoutSec 5
        if ($response -and $response.status -eq 'alive') {
            return $true
        }
    } catch {
        Write-ColorOutput "❌ Backend health check failed: $($_.Exception.Message)" $Red
        return $false
    }
}

function Create-TestTicket {
    param($TicketIndex, $StressTestKey)
    
    try {
        # Create a fake audio file for testing (minimal WAV header + silence)
        $audioContent = [byte[]](0x52,0x49,0x46,0x46,0x24,0x00,0x00,0x00,0x57,0x41,0x56,0x45,0x66,0x6d,0x74,0x20,0x10,0x00,0x00,0x00,0x01,0x00,0x01,0x00,0x44,0x11,0x00,0x00,0x88,0x58,0x01,0x00,0x02,0x00,0x10,0x00,0x64,0x61,0x74,0x61,0x00,0x00,0x00,0x00)
        
        # Headers for stress test
        $headers = @{
            'X-STRESS-TEST-KEY' = $StressTestKey
            'Content-Type' = 'audio/wav'
        }
        
        if ($Verbose) {
            Write-ColorOutput "  Creating ticket $TicketIndex..." $Blue
        }
        
        # POST to create recording with stub mode environment variable
        $originalStubMode = $env:STUB_MODE
        $env:STUB_MODE = $StubMode
        
        $createResponse = Invoke-RestMethod -Uri "$BaseUrl/api/recordings" -Method Post -Body $audioContent -Headers $headers -TimeoutSec 30
        
        if ($createResponse -and $createResponse.id) {
            return @{
                Success = $true
                TicketId = $createResponse.id
                JobId = $createResponse.jobId
                Index = $TicketIndex
            }
        } else {
            return @{
                Success = $false
                Error = "No ticket ID returned"
                Index = $TicketIndex
            }
        }
        
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            Index = $TicketIndex
        }
    } finally {
        if ($originalStubMode) {
            $env:STUB_MODE = $originalStubMode
        } else {
            Remove-Item Env:STUB_MODE -ErrorAction SilentlyContinue
        }
    }
}

function Wait-ForTicketCompletion {
    param($TicketId, $JobId)
    
    $maxAttempts = $MaxWaitTime * 2  # Check every 500ms
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        try {
            $statusResponse = Invoke-RestMethod -Uri "$BaseUrl/api/tickets/$TicketId/status" -Method Get -TimeoutSec 5
            
            if ($statusResponse -and $statusResponse.status) {
                $status = $statusResponse.status
                if ($status -eq 'READY' -or $status -eq 'NEEDS_INFO' -or $status -eq 'ERROR') {
                    return @{
                        Success = ($status -ne 'ERROR')
                        Status = $status
                        Duration = $attempt * 0.5
                        Response = $statusResponse
                    }
                }
            }
            
            Start-Sleep -Milliseconds 500
            $attempt++
            
        } catch {
            if ($Verbose) {
                Write-ColorOutput "    Status check failed (attempt $attempt): $($_.Exception.Message)" $Yellow
            }
            $attempt++
            Start-Sleep -Milliseconds 500
        }
    }
    
    return @{
        Success = $false
        Status = 'TIMEOUT'
        Duration = $MaxWaitTime
        Error = "Timed out after $MaxWaitTime seconds"
    }
}

# Main execution
Write-ColorOutput "🧪 CareConnect V1 Stress Test Harness" $Blue
Write-ColorOutput "   Tickets: $TicketCount | Mode: $StubMode | Delay: ${Delay}ms | Max Wait: ${MaxWaitTime}s" $Blue
Write-ColorOutput ""

# Validation checks
if (-not $SkipValidation) {
    Write-ColorOutput "[1/4] Testing backend health..." $Yellow
    if (-not (Test-BackendHealth)) {
        Write-ColorOutput "❌ Backend not responding. Start with: .\scripts\dev-up.ps1" $Red
        exit 1
    }
    Write-ColorOutput "✅ Backend is alive" $Green
    
    Write-ColorOutput "[2/4] Checking stress test mode..." $Yellow  
    if (-not (Test-StressTestMode)) {
        exit 1
    }
    Write-ColorOutput "✅ Stress test mode enabled" $Green
    
    Write-ColorOutput "[3/4] Validating stress test key..." $Yellow
    $stressTestKey = Get-StressTestKey
    if (-not $stressTestKey) {
        exit 1
    }
    Write-ColorOutput "✅ Stress test key configured" $Green
    
    Write-ColorOutput "[4/4] Configuring stub provider..." $Yellow
    Write-ColorOutput "✅ Using stub mode: $StubMode" $Green
} else {
    Write-ColorOutput "⚠️ Skipping validation checks" $Yellow
    $stressTestKey = $env:X_STRESS_TEST_KEY
    if (-not $stressTestKey) {
        Write-ColorOutput "❌ X_STRESS_TEST_KEY required even when skipping validation" $Red
        exit 1
    }
}

Write-ColorOutput ""
Write-ColorOutput "🚀 Starting stress test..." $Blue

# Track results
$results = @()
$startTime = Get-Date

# Create tickets with delays
Write-ColorOutput "📝 Creating $TicketCount tickets..." $Yellow
for ($i = 1; $i -le $TicketCount; $i++) {
    $result = Create-TestTicket -TicketIndex $i -StressTestKey $stressTestKey
    $results += $result
    
    if ($result.Success) {
        if ($Verbose) {
            Write-ColorOutput "  ✅ Ticket $i created: $($result.TicketId)" $Green
        } else {
            Write-Host "." -NoNewline
        }
    } else {
        if ($Verbose) {
            Write-ColorOutput "  ❌ Ticket $i failed: $($result.Error)" $Red
        } else {
            Write-Host "X" -NoNewline  
        }
    }
    
    if ($i -lt $TicketCount) {
        Start-Sleep -Milliseconds $Delay
    }
}

if (-not $Verbose) {
    Write-Host ""  # New line after progress dots
}

$successfulCreations = $results | Where-Object { $_.Success } | Measure-Object
Write-ColorOutput "📊 Created $($successfulCreations.Count)/$TicketCount tickets successfully" $Blue

if ($successfulCreations.Count -eq 0) {
    Write-ColorOutput "❌ No tickets created successfully. Exiting." $Red
    exit 1
}

# Wait for completion
Write-ColorOutput "⏳ Waiting for ticket completion..." $Yellow
$completionResults = @()

foreach ($result in $results | Where-Object { $_.Success }) {
    if ($Verbose) {
        Write-ColorOutput "  Waiting for ticket $($result.Index) ($($result.TicketId))..." $Blue
    }
    
    $completion = Wait-ForTicketCompletion -TicketId $result.TicketId -JobId $result.JobId
    $completionResults += $completion
    
    if ($completion.Success) {
        if ($Verbose) {
            Write-ColorOutput "    ✅ Completed in $($completion.Duration)s - Status: $($completion.Status)" $Green
        }
    } else {
        if ($Verbose) {
            Write-ColorOutput "    ❌ Failed: $($completion.Status) - $($completion.Error)" $Red
        }
    }
}

# Calculate statistics
$endTime = Get-Date
$totalDuration = ($endTime - $startTime).TotalSeconds

$successful = $completionResults | Where-Object { $_.Success }
$failed = $completionResults | Where-Object { -not $_.Success }
$timedOut = $completionResults | Where-Object { $_.Status -eq 'TIMEOUT' }
$errors = $completionResults | Where-Object { $_.Status -eq 'ERROR' }
$needsInfo = $completionResults | Where-Object { $_.Status -eq 'NEEDS_INFO' }

if ($successful.Count -gt 0) {
    $avgDuration = ($successful | Measure-Object -Property Duration -Average).Average
    $minDuration = ($successful | Measure-Object -Property Duration -Minimum).Minimum  
    $maxDuration = ($successful | Measure-Object -Property Duration -Maximum).Maximum
}

# Results summary
Write-ColorOutput ""
Write-ColorOutput "📈 STRESS TEST RESULTS" $Blue
Write-ColorOutput "========================" $Blue
Write-ColorOutput "Total Tickets: $TicketCount" $Reset
Write-ColorOutput "✅ Successful: $($successful.Count)" $Green
Write-ColorOutput "❌ Failed: $($failed.Count)" $Red
Write-ColorOutput "⏰ Timed Out: $($timedOut.Count)" $Yellow
Write-ColorOutput "🚨 Errors: $($errors.Count)" $Red
Write-ColorOutput "ℹ️  Needs Info: $($needsInfo.Count)" $Blue

if ($successful.Count -gt 0) {
    Write-ColorOutput ""
    Write-ColorOutput "⏱️  PERFORMANCE METRICS" $Blue
    Write-ColorOutput "=====================" $Blue
    Write-ColorOutput "Total Test Time: $([math]::Round($totalDuration, 2))s" $Reset
    Write-ColorOutput "Average Completion: $([math]::Round($avgDuration, 2))s" $Reset
    Write-ColorOutput "Fastest Completion: $([math]::Round($minDuration, 2))s" $Reset  
    Write-ColorOutput "Slowest Completion: $([math]::Round($maxDuration, 2))s" $Reset
    
    $throughput = $successful.Count / $totalDuration
    Write-ColorOutput "Throughput: $([math]::Round($throughput, 2)) tickets/second" $Reset
}

# Success criteria
$successRate = if ($TicketCount -gt 0) { ($successful.Count / $TicketCount) * 100 } else { 0 }
Write-ColorOutput ""
Write-ColorOutput "🎯 SUCCESS RATE: $([math]::Round($successRate, 1))%" $(if ($successRate -ge 90) { $Green } elseif ($successRate -ge 75) { $Yellow } else { $Red })

# Final verdict
if ($successRate -ge 90) {
    Write-ColorOutput ""
    Write-ColorOutput "🎉 STRESS TEST PASSED! System performance is excellent." $Green
    exit 0
} elseif ($successRate -ge 75) {
    Write-ColorOutput ""
    Write-ColorOutput "⚠️ STRESS TEST WARNING: System performance is acceptable but could be improved." $Yellow
    exit 0
} else {
    Write-ColorOutput ""
    Write-ColorOutput "❌ STRESS TEST FAILED: System performance is below acceptable threshold." $Red
    Write-ColorOutput "   Investigate errors and performance bottlenecks." $Red
    exit 1
}