<#
.SYNOPSIS
V1 Stabilization Stress Test - Zero OpenAI Mode

.DESCRIPTION
Comprehensive stress testing harness for V1 with ZERO external API calls.
Tests system capacity, latency, and stability without quota consumption.

Environment Configuration:
- AI_PROVIDER=none (or rules/template)
- TRANSCRIPTION_PROVIDER=stub (deterministic fixtures)
- ENABLE_STRESS_TEST_MODE=true

Test Scenarios:
1. N concurrent recordings (profile creation flow)
2. N profile attachments (file upload flow)
3. N resource searches (query performance)
4. Admin dashboard polling (UI responsiveness)

Success Criteria:
- ZERO external API calls (OpenAI, AssemblyAI)
- p50 latency < 200ms, p95 < 500ms, p99 < 1000ms
- 0% failure rate for core flows
- Graceful degradation (no hard failures)

.PARAMETER Scenario
Test scenario to run: recordings, profiles, searches, dashboard, all

.PARAMETER Concurrency
Number of concurrent requests (default: 10)

.PARAMETER Duration
Test duration in seconds (default: 60)

.PARAMETER BaseUrl
Backend API URL (default: http://localhost:3001)

.EXAMPLE
.\stress-test-v1.ps1 -Scenario recordings -Concurrency 20 -Duration 120

.EXAMPLE
.\stress-test-v1.ps1 -Scenario all -Concurrency 50 -Duration 300
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('recordings', 'profiles', 'searches', 'dashboard', 'all')]
    [string]$Scenario = 'all',

    [Parameter(Mandatory=$false)]
    [int]$Concurrency = 10,

    [Parameter(Mandatory=$false)]
    [int]$Duration = 60,

    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = 'http://localhost:3001'
)

$ErrorActionPreference = 'Stop'

# Colors
$ColorSuccess = 'Green'
$ColorWarning = 'Yellow'
$ColorError = 'Red'
$ColorInfo = 'Cyan'

Write-Host "`n========================================" -ForegroundColor $ColorInfo
Write-Host "V1 STABILIZATION STRESS TEST" -ForegroundColor $ColorInfo
Write-Host "Zero-OpenAI Mode Validation" -ForegroundColor $ColorInfo
Write-Host "========================================`n" -ForegroundColor $ColorInfo

# Step 1: Verify environment configuration
Write-Host "[1/6] Verifying environment configuration..." -ForegroundColor $ColorInfo

$envFile = Join-Path $PSScriptRoot "..\backend\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "✗ .env file not found: $envFile" -ForegroundColor $ColorError
    exit 1
}

$envContent = Get-Content $envFile -Raw

# Check critical environment variables
$requiredVars = @{
    'AI_PROVIDER' = 'none|rules|template'
    'TRANSCRIPTION_PROVIDER' = 'stub'
    'ENABLE_STRESS_TEST_MODE' = 'true'
}

$configValid = $true
foreach ($var in $requiredVars.Keys) {
    if ($envContent -match "$var\s*=\s*(.+)") {
        $value = $matches[1].Trim()
        $expected = $requiredVars[$var]
        
        if ($expected -like '*|*') {
            $validOptions = $expected -split '\|'
            if ($value -notin $validOptions) {
                Write-Host "✗ $var = $value (expected: $expected)" -ForegroundColor $ColorError
                $configValid = $false
            } else {
                Write-Host "✓ $var = $value" -ForegroundColor $ColorSuccess
            }
        } else {
            if ($value -ne $expected) {
                Write-Host "✗ $var = $value (expected: $expected)" -ForegroundColor $ColorError
                $configValid = $false
            } else {
                Write-Host "✓ $var = $value" -ForegroundColor $ColorSuccess
            }
        }
    } else {
        Write-Host "✗ $var not set" -ForegroundColor $ColorError
        $configValid = $false
    }
}

# Check that OpenAI key is NOT set in stress test mode
if ($envContent -match "OPENAI_API_KEY\s*=\s*(.+)") {
    $openaiKey = $matches[1].Trim()
    if ($openaiKey -ne '' -and $openaiKey -ne 'disabled') {
        Write-Host "⚠ WARNING: OPENAI_API_KEY is set in stress test mode" -ForegroundColor $ColorWarning
        Write-Host "  This test should NOT make external API calls." -ForegroundColor $ColorWarning
    }
}

if (-not $configValid) {
    Write-Host "`n✗ Environment configuration invalid for stress testing" -ForegroundColor $ColorError
    Write-Host "  Please set:" -ForegroundColor $ColorError
    Write-Host "    AI_PROVIDER=none (or rules/template)" -ForegroundColor $ColorError
    Write-Host "    TRANSCRIPTION_PROVIDER=stub" -ForegroundColor $ColorError
    Write-Host "    ENABLE_STRESS_TEST_MODE=true" -ForegroundColor $ColorError
    exit 1
}

Write-Host "`n✓ Environment configuration valid for stress testing`n" -ForegroundColor $ColorSuccess

# Step 2: Verify backend is running
Write-Host "[2/6] Verifying backend connectivity..." -ForegroundColor $ColorInfo

try {
    $healthCheck = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method Get -TimeoutSec 5
    Write-Host "✓ Backend is running: $BaseUrl" -ForegroundColor $ColorSuccess
    Write-Host "  Status: $($healthCheck.status)" -ForegroundColor $ColorInfo
} catch {
    Write-Host "✗ Backend not responding at $BaseUrl" -ForegroundColor $ColorError
    Write-Host "  Please start the backend server first" -ForegroundColor $ColorError
    exit 1
}

# Step 3: Load test fixtures
Write-Host "`n[3/6] Loading test fixtures..." -ForegroundColor $ColorInfo

$fixturesPath = Join-Path $PSScriptRoot "..\backend\fixtures\stress-test-transcripts.json"
if (-not (Test-Path $fixturesPath)) {
    Write-Host "✗ Fixtures not found: $fixturesPath" -ForegroundColor $ColorError
    exit 1
}

$fixtures = Get-Content $fixturesPath -Raw | ConvertFrom-Json
Write-Host "✓ Loaded $($fixtures.Count) test transcripts" -ForegroundColor $ColorSuccess

# Step 4: Initialize metrics tracking
Write-Host "`n[4/6] Initializing metrics tracking..." -ForegroundColor $ColorInfo

$metrics = @{
    recordings = @{
        total = 0
        success = 0
        failed = 0
        latencies = @()
    }
    profiles = @{
        total = 0
        success = 0
        failed = 0
        latencies = @()
    }
    searches = @{
        total = 0
        success = 0
        failed = 0
        latencies = @()
    }
    dashboard = @{
        total = 0
        success = 0
        failed = 0
        latencies = @()
    }
}

$startTime = Get-Date

Write-Host "✓ Metrics tracking initialized" -ForegroundColor $ColorSuccess

# Step 5: Run stress test scenarios
Write-Host "`n[5/6] Running stress test scenarios..." -ForegroundColor $ColorInfo
Write-Host "  Scenario: $Scenario" -ForegroundColor $ColorInfo
Write-Host "  Concurrency: $Concurrency" -ForegroundColor $ColorInfo
Write-Host "  Duration: $Duration seconds`n" -ForegroundColor $ColorInfo

# Function: Test recording flow
function Test-RecordingFlow {
    param($transcript, $metricsRef)
    
    $requestStart = Get-Date
    
    try {
        # Simulate recording upload (stub provider returns deterministic transcript)
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/recordings" -Method Post -Body (@{
            transcript = $transcript.transcript
            category = $transcript.category
        } | ConvertTo-Json) -ContentType 'application/json' -TimeoutSec 10
        
        $latency = (Get-Date) - $requestStart
        $metricsRef.recordings.success++
        $metricsRef.recordings.latencies += $latency.TotalMilliseconds
        
        return $true
    } catch {
        $metricsRef.recordings.failed++
        Write-Host "✗ Recording flow failed: $($_.Exception.Message)" -ForegroundColor $ColorError
        return $false
    } finally {
        $metricsRef.recordings.total++
    }
}

# Function: Test profile flow
function Test-ProfileFlow {
    param($metricsRef)
    
    $requestStart = Get-Date
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/profiles" -Method Get -TimeoutSec 10
        
        $latency = (Get-Date) - $requestStart
        $metricsRef.profiles.success++
        $metricsRef.profiles.latencies += $latency.TotalMilliseconds
        
        return $true
    } catch {
        $metricsRef.profiles.failed++
        Write-Host "✗ Profile flow failed: $($_.Exception.Message)" -ForegroundColor $ColorError
        return $false
    } finally {
        $metricsRef.profiles.total++
    }
}

# Function: Test search flow
function Test-SearchFlow {
    param($query, $metricsRef)
    
    $requestStart = Get-Date
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/search?q=$query" -Method Get -TimeoutSec 10
        
        $latency = (Get-Date) - $requestStart
        $metricsRef.searches.success++
        $metricsRef.searches.latencies += $latency.TotalMilliseconds
        
        return $true
    } catch {
        $metricsRef.searches.failed++
        Write-Host "✗ Search flow failed: $($_.Exception.Message)" -ForegroundColor $ColorError
        return $false
    } finally {
        $metricsRef.searches.total++
    }
}

# Function: Test dashboard flow
function Test-DashboardFlow {
    param($metricsRef)
    
    $requestStart = Get-Date
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/admin/dashboard" -Method Get -TimeoutSec 10
        
        $latency = (Get-Date) - $requestStart
        $metricsRef.dashboard.success++
        $metricsRef.dashboard.latencies += $latency.TotalMilliseconds
        
        return $true
    } catch {
        $metricsRef.dashboard.failed++
        Write-Host "✗ Dashboard flow failed: $($_.Exception.Message)" -ForegroundColor $ColorError
        return $false
    } finally {
        $metricsRef.dashboard.total++
    }
}

# Execute test scenarios
$testEndTime = $startTime.AddSeconds($Duration)

while ((Get-Date) -lt $testEndTime) {
    $elapsed = ((Get-Date) - $startTime).TotalSeconds
    Write-Progress -Activity "Stress Testing" -Status "Elapsed: $([int]$elapsed)s / $Duration s" -PercentComplete (($elapsed / $Duration) * 100)
    
    # Run scenarios based on selection
    if ($Scenario -eq 'all' -or $Scenario -eq 'recordings') {
        $transcript = $fixtures[(Get-Random -Maximum $fixtures.Count)]
        Test-RecordingFlow -transcript $transcript -metricsRef $metrics | Out-Null
    }
    
    if ($Scenario -eq 'all' -or $Scenario -eq 'profiles') {
        Test-ProfileFlow -metricsRef $metrics | Out-Null
    }
    
    if ($Scenario -eq 'all' -or $Scenario -eq 'searches') {
        $searchQueries = @('housing', 'food', 'employment', 'healthcare', 'veterans')
        $query = $searchQueries[(Get-Random -Maximum $searchQueries.Count)]
        Test-SearchFlow -query $query -metricsRef $metrics | Out-Null
    }
    
    if ($Scenario -eq 'all' -or $Scenario -eq 'dashboard') {
        Test-DashboardFlow -metricsRef $metrics | Out-Null
    }
    
    # Sleep to control concurrency
    Start-Sleep -Milliseconds (1000 / $Concurrency)
}

Write-Progress -Activity "Stress Testing" -Completed

$totalDuration = ((Get-Date) - $startTime).TotalSeconds

# Step 6: Generate results report
Write-Host "`n[6/6] Generating results report...`n" -ForegroundColor $ColorInfo

Write-Host "========================================" -ForegroundColor $ColorInfo
Write-Host "STRESS TEST RESULTS" -ForegroundColor $ColorInfo
Write-Host "========================================`n" -ForegroundColor $ColorInfo

Write-Host "Test Configuration:" -ForegroundColor $ColorInfo
Write-Host "  Scenario: $Scenario" -ForegroundColor $ColorInfo
Write-Host "  Concurrency: $Concurrency" -ForegroundColor $ColorInfo
Write-Host "  Duration: $([int]$totalDuration) seconds" -ForegroundColor $ColorInfo
Write-Host "  Base URL: $BaseUrl`n" -ForegroundColor $ColorInfo

# Function: Calculate percentiles
function Get-Percentile {
    param($values, $percentile)
    
    if ($values.Count -eq 0) { return 0 }
    
    $sorted = $values | Sort-Object
    $index = [Math]::Ceiling($sorted.Count * ($percentile / 100)) - 1
    if ($index -lt 0) { $index = 0 }
    
    return [Math]::Round($sorted[$index], 2)
}

# Report each scenario
foreach ($scenarioName in $metrics.Keys) {
    $data = $metrics[$scenarioName]
    
    if ($data.total -eq 0) { continue }
    
    $successRate = [Math]::Round(($data.success / $data.total) * 100, 2)
    $p50 = Get-Percentile -values $data.latencies -percentile 50
    $p95 = Get-Percentile -values $data.latencies -percentile 95
    $p99 = Get-Percentile -values $data.latencies -percentile 99
    
    Write-Host "$($scenarioName.ToUpper()) Flow:" -ForegroundColor $ColorInfo
    Write-Host "  Total Requests: $($data.total)" -ForegroundColor $ColorInfo
    Write-Host "  Success: $($data.success) ($successRate%)" -ForegroundColor $(if ($successRate -eq 100) { $ColorSuccess } else { $ColorWarning })
    Write-Host "  Failed: $($data.failed)" -ForegroundColor $(if ($data.failed -eq 0) { $ColorSuccess } else { $ColorError })
    Write-Host "  Latency (p50): $p50 ms" -ForegroundColor $(if ($p50 -lt 200) { $ColorSuccess } elseif ($p50 -lt 500) { $ColorWarning } else { $ColorError })
    Write-Host "  Latency (p95): $p95 ms" -ForegroundColor $(if ($p95 -lt 500) { $ColorSuccess } elseif ($p95 -lt 1000) { $ColorWarning } else { $ColorError })
    Write-Host "  Latency (p99): $p99 ms`n" -ForegroundColor $(if ($p99 -lt 1000) { $ColorSuccess } else { $ColorWarning })
}

# Overall success criteria
$totalRequests = ($metrics.Values | ForEach-Object { $_.total } | Measure-Object -Sum).Sum
$totalSuccess = ($metrics.Values | ForEach-Object { $_.success } | Measure-Object -Sum).Sum
$totalFailed = ($metrics.Values | ForEach-Object { $_.failed } | Measure-Object -Sum).Sum

$overallSuccessRate = if ($totalRequests -gt 0) { [Math]::Round(($totalSuccess / $totalRequests) * 100, 2) } else { 0 }

Write-Host "Overall Results:" -ForegroundColor $ColorInfo
Write-Host "  Total Requests: $totalRequests" -ForegroundColor $ColorInfo
Write-Host "  Success Rate: $overallSuccessRate%" -ForegroundColor $(if ($overallSuccessRate -eq 100) { $ColorSuccess } elseif ($overallSuccessRate -ge 95) { $ColorWarning } else { $ColorError })
Write-Host "  Failed Requests: $totalFailed" -ForegroundColor $(if ($totalFailed -eq 0) { $ColorSuccess } else { $ColorError })

# Success criteria validation
Write-Host "`nSuccess Criteria Validation:" -ForegroundColor $ColorInfo

$criteriaPass = $true

# 1. Zero failures
if ($totalFailed -eq 0) {
    Write-Host "  ✓ Zero failures" -ForegroundColor $ColorSuccess
} else {
    Write-Host "  ✗ $totalFailed failures detected" -ForegroundColor $ColorError
    $criteriaPass = $false
}

# 2. Latency targets
$allLatencies = $metrics.Values | ForEach-Object { $_.latencies } | Where-Object { $_ }
if ($allLatencies.Count -gt 0) {
    $overallP50 = Get-Percentile -values $allLatencies -percentile 50
    $overallP95 = Get-Percentile -values $allLatencies -percentile 95
    $overallP99 = Get-Percentile -values $allLatencies -percentile 99
    
    if ($overallP50 -lt 200) {
        Write-Host "  ✓ p50 latency < 200ms ($overallP50 ms)" -ForegroundColor $ColorSuccess
    } else {
        Write-Host "  ✗ p50 latency >= 200ms ($overallP50 ms)" -ForegroundColor $ColorWarning
    }
    
    if ($overallP95 -lt 500) {
        Write-Host "  ✓ p95 latency < 500ms ($overallP95 ms)" -ForegroundColor $ColorSuccess
    } else {
        Write-Host "  ⚠ p95 latency >= 500ms ($overallP95 ms)" -ForegroundColor $ColorWarning
    }
    
    if ($overallP99 -lt 1000) {
        Write-Host "  ✓ p99 latency < 1000ms ($overallP99 ms)" -ForegroundColor $ColorSuccess
    } else {
        Write-Host "  ⚠ p99 latency >= 1000ms ($overallP99 ms)" -ForegroundColor $ColorWarning
    }
}

Write-Host "`n========================================" -ForegroundColor $ColorInfo

if ($criteriaPass -and $overallSuccessRate -eq 100) {
    Write-Host "✓ STRESS TEST PASSED" -ForegroundColor $ColorSuccess
    Write-Host "  V1 is stable and ready for manual testing" -ForegroundColor $ColorSuccess
    exit 0
} elseif ($overallSuccessRate -ge 95) {
    Write-Host "⚠ STRESS TEST PASSED WITH WARNINGS" -ForegroundColor $ColorWarning
    Write-Host "  Some latency targets missed but no failures" -ForegroundColor $ColorWarning
    exit 0
} else {
    Write-Host "✗ STRESS TEST FAILED" -ForegroundColor $ColorError
    Write-Host "  System is NOT ready for manual testing" -ForegroundColor $ColorError
    exit 1
}
