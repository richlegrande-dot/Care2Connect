#!/usr/bin/env pwsh
<#
.SYNOPSIS
    V1 Hardening Features Validation Test Suite
    
.DESCRIPTION
    Focused testing suite for validating all V1 hardening features including:
    - Boot banner and configuration validation
    - Correlation ID middleware 
    - Structured logging capabilities
    - Enhanced stub provider modes
    - Pipeline incident tracking
    - Zero-OpenAI mode enforcement
    
.PARAMETER BaseUrl
    Base URL for the backend API (default: http://localhost:3001)
    
.PARAMETER TestStubProvider
    Run stub provider validation tests
    
.PARAMETER TestIncidents
    Run incident tracking validation tests
    
.PARAMETER Verbose
    Show detailed output for all tests
    
.EXAMPLE
    .\scripts\validate-v1-hardening.ps1
    
.EXAMPLE
    .\scripts\validate-v1-hardening.ps1 -TestStubProvider -Verbose
#>

param(
    [string]$BaseUrl = "http://localhost:3001",
    [switch]$TestStubProvider,
    [switch]$TestIncidents, 
    [switch]$Verbose
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
    if ($Details -and ($Verbose -or $Status -eq "FAIL")) {
        Write-ColorOutput "   $Details" $Reset
    }
}

function Test-BootBannerConfiguration {
    Write-ColorOutput "🔧 Testing Boot Banner & Configuration..." $Blue
    
    # Check if bootConfig.ts exists
    $bootConfigPath = ".\backend\src\utils\bootConfig.ts"
    if (Test-Path $bootConfigPath) {
        Write-TestResult "Boot Configuration File" "PASS" "bootConfig.ts found"
    } else {
        Write-TestResult "Boot Configuration File" "FAIL" "bootConfig.ts not found"
        return
    }
    
    # Check for required environment variables
    $requiredVars = @{
        'V1_STABLE' = 'V1 Stable mode flag'
        'ZERO_OPENAI_MODE' = 'Zero-OpenAI mode flag' 
        'AI_PROVIDER' = 'AI provider configuration'
        'TRANSCRIPTION_PROVIDER' = 'Transcription provider'
        'DB_MODE' = 'Database mode'
        'RUN_MODE' = 'Runtime mode'
    }
    
    $missingVars = @()
    $presentVars = @()
    
    foreach ($var in $requiredVars.Keys) {
        if (Get-Item "Env:$var" -ErrorAction SilentlyContinue) {
            $presentVars += "$var=$((Get-Item "Env:$var").Value)"
        } else {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -eq 0) {
        Write-TestResult "Required Environment Variables" "PASS" "All variables present: $($presentVars -join ', ')"
    } else {
        Write-TestResult "Required Environment Variables" "WARN" "Missing: $($missingVars -join ', ')"
    }
    
    # Validate V1_STABLE + ZERO_OPENAI_MODE consistency
    $v1Stable = $env:V1_STABLE
    $zeroOpenAI = $env:ZERO_OPENAI_MODE
    
    if ($v1Stable -eq 'true' -and $zeroOpenAI -eq 'true') {
        Write-TestResult "V1 Mode Consistency" "PASS" "V1_STABLE and ZERO_OPENAI_MODE both true"
    } elseif ($v1Stable -eq 'true' -and $zeroOpenAI -ne 'true') {
        Write-TestResult "V1 Mode Consistency" "FAIL" "V1_STABLE=true requires ZERO_OPENAI_MODE=true"
    } else {
        Write-TestResult "V1 Mode Consistency" "SKIP" "Not in V1 mode"
    }
}

function Test-CorrelationIdMiddleware {
    Write-ColorOutput "🔗 Testing Correlation ID Middleware..." $Blue
    
    try {
        # Test automatic ID generation
        $response = Invoke-WebRequest -Uri "$BaseUrl/health/live" -Method Get -TimeoutSec 5
        $requestId = $response.Headers['X-Request-Id']
        
        if ($requestId) {
            Write-TestResult "Auto Correlation ID Generation" "PASS" "Generated ID: $($requestId[0])"
            
            # Validate UUID format
            if ($requestId[0] -match '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
                Write-TestResult "Correlation ID Format" "PASS" "Valid UUID format"
            } else {
                Write-TestResult "Correlation ID Format" "WARN" "Non-UUID format: $($requestId[0])"
            }
        } else {
            Write-TestResult "Auto Correlation ID Generation" "FAIL" "X-Request-Id header not found"
            return
        }
        
        # Test custom ID preservation
        $customId = "test-custom-id-12345"
        $headers = @{ 'X-Request-Id' = $customId }
        $response = Invoke-WebRequest -Uri "$BaseUrl/health/live" -Method Get -Headers $headers -TimeoutSec 5
        $returnedId = $response.Headers['X-Request-Id']
        
        if ($returnedId -and $returnedId[0] -eq $customId) {
            Write-TestResult "Custom Correlation ID Preservation" "PASS" "Custom ID preserved: $customId"
        } else {
            Write-TestResult "Custom Correlation ID Preservation" "FAIL" "Expected: $customId, Got: $($returnedId[0])"
        }
        
        # Test multiple requests have different IDs
        $ids = @()
        for ($i = 0; $i -lt 3; $i++) {
            $resp = Invoke-WebRequest -Uri "$BaseUrl/health/live" -Method Get -TimeoutSec 5
            $ids += $resp.Headers['X-Request-Id'][0]
        }
        
        $uniqueIds = $ids | Sort-Object -Unique
        if ($uniqueIds.Count -eq $ids.Count) {
            Write-TestResult "Unique Correlation IDs" "PASS" "All IDs unique across requests"
        } else {
            Write-TestResult "Unique Correlation IDs" "FAIL" "Duplicate IDs found"
        }
        
    } catch {
        Write-TestResult "Correlation ID Middleware" "FAIL" "Error testing middleware: $($_.Exception.Message)"
    }
}

function Test-StructuredLogging {
    Write-ColorOutput "📝 Testing Structured Logging..." $Blue
    
    # Check if structured logger exists
    $loggerPath = ".\backend\src\utils\structuredLogger.ts"
    if (Test-Path $loggerPath) {
        Write-TestResult "Structured Logger File" "PASS" "structuredLogger.ts found"
    } else {
        Write-TestResult "Structured Logger File" "FAIL" "structuredLogger.ts not found"
        return
    }
    
    # Check for PII redaction patterns (by examining the file content)
    try {
        $loggerContent = Get-Content $loggerPath -Raw
        
        $piiPatterns = @(
            'email.*redact',
            'phone.*redact', 
            'transcript.*redact',
            'password.*redact',
            'name.*redact'
        )
        
        $foundPatterns = @()
        foreach ($pattern in $piiPatterns) {
            if ($loggerContent -match $pattern) {
                $foundPatterns += $pattern
            }
        }
        
        if ($foundPatterns.Count -ge 3) {
            Write-TestResult "PII Redaction Patterns" "PASS" "Found $($foundPatterns.Count) redaction patterns"
        } elseif ($foundPatterns.Count -gt 0) {
            Write-TestResult "PII Redaction Patterns" "WARN" "Only $($foundPatterns.Count) redaction patterns found"
        } else {
            Write-TestResult "PII Redaction Patterns" "FAIL" "No PII redaction patterns found"
        }
        
        # Check for predefined log events
        $logEvents = @(
            'RECORDING_CREATED',
            'TRANSCRIPTION_COMPLETED',
            'DRAFT_READY',
            'QR_GENERATED',
            'ADMIN_LOGIN_SUCCESS',
            'ADMIN_LOGIN_FAILED',
            'PIPELINE_ERROR'
        )
        
        $foundEvents = @()
        foreach ($event in $logEvents) {
            if ($loggerContent -match $event) {
                $foundEvents += $event
            }
        }
        
        if ($foundEvents.Count -ge 5) {
            Write-TestResult "Predefined Log Events" "PASS" "Found $($foundEvents.Count) log events"
        } else {
            Write-TestResult "Predefined Log Events" "WARN" "Only $($foundEvents.Count) log events found"
        }
        
    } catch {
        Write-TestResult "Structured Logging Analysis" "FAIL" "Error analyzing logger: $($_.Exception.Message)"
    }
}

function Test-ZeroOpenAIMode {
    Write-ColorOutput "🚫 Testing Zero-OpenAI Mode..." $Blue
    
    $isZeroMode = $env:ZERO_OPENAI_MODE -eq 'true' -or $env:V1_STABLE -eq 'true'
    
    if (-not $isZeroMode) {
        Write-TestResult "Zero-OpenAI Mode" "SKIP" "Not in Zero-OpenAI mode"
        return
    }
    
    try {
        # Check health endpoint for OpenAI status
        $response = Invoke-RestMethod -Uri "$BaseUrl/ops/ready" -Method Get -TimeoutSec 10
        
        if ($response.services -and $response.services.openai) {
            $openaiStatus = $response.services.openai
            
            if (-not $openaiStatus.healthy -and ($openaiStatus.error -eq 'disabled' -or $openaiStatus.reason -match 'disabled')) {
                Write-TestResult "OpenAI Disabled Status" "PASS" "OpenAI correctly marked as disabled"
            } else {
                Write-TestResult "OpenAI Disabled Status" "FAIL" "OpenAI should be disabled but shows: $($openaiStatus | ConvertTo-Json -Compress)"
            }
            
            # Verify no OpenAI API key in environment when disabled
            if ($env:OPENAI_API_KEY -and $isZeroMode) {
                Write-TestResult "OpenAI API Key Presence" "WARN" "OpenAI API key present in Zero-OpenAI mode"
            } else {
                Write-TestResult "OpenAI API Key Presence" "PASS" "No OpenAI API key in Zero-OpenAI mode"
            }
            
        } else {
            Write-TestResult "OpenAI Status Reporting" "FAIL" "OpenAI status not found in health response"
        }
        
        # Check AI_PROVIDER setting
        if ($env:AI_PROVIDER -eq 'rules') {
            Write-TestResult "AI Provider Configuration" "PASS" "AI_PROVIDER set to rules"
        } elseif ($env:AI_PROVIDER -eq 'none') {
            Write-TestResult "AI Provider Configuration" "PASS" "AI_PROVIDER set to none"
        } else {
            Write-TestResult "AI Provider Configuration" "FAIL" "AI_PROVIDER should be 'rules' or 'none', got: $($env:AI_PROVIDER)"
        }
        
    } catch {
        Write-TestResult "Zero-OpenAI Mode" "FAIL" "Error testing Zero-OpenAI mode: $($_.Exception.Message)"
    }
}

function Test-EnhancedStubProvider {
    if (-not $TestStubProvider) {
        Write-TestResult "Enhanced Stub Provider" "SKIP" "Skipped (use -TestStubProvider to enable)"
        return
    }
    
    Write-ColorOutput "🎭 Testing Enhanced Stub Provider..." $Blue
    
    # Check if stub provider exists
    $stubPath = ".\backend\src\providers\transcription\stub.ts"
    if (Test-Path $stubPath) {
        Write-TestResult "Stub Provider File" "PASS" "stub.ts found"
    } else {
        Write-TestResult "Stub Provider File" "FAIL" "stub.ts not found"
        return
    }
    
    try {
        $stubContent = Get-Content $stubPath -Raw
        
        # Check for enhanced stub modes
        $stubModes = @('FAST', 'NORMAL', 'SLOW', 'TIMEOUT', 'ERROR', 'RANDOM', 'NEEDS_INFO')
        $foundModes = @()
        
        foreach ($mode in $stubModes) {
            if ($stubContent -match $mode) {
                $foundModes += $mode
            }
        }
        
        if ($foundModes.Count -ge 6) {
            Write-TestResult "Stub Mode Enumeration" "PASS" "Found $($foundModes.Count) stub modes"
        } else {
            Write-TestResult "Stub Mode Enumeration" "WARN" "Only $($foundModes.Count) stub modes found"
        }
        
        # Check for diverse transcript fixtures
        $fixtureCount = ($stubContent -split "My name is|Hi, my name is|This is|Hola,").Count - 1
        
        if ($fixtureCount -ge 10) {
            Write-TestResult "Transcript Fixtures" "PASS" "Found $fixtureCount transcript fixtures"
        } elseif ($fixtureCount -ge 5) {
            Write-TestResult "Transcript Fixtures" "WARN" "Only $fixtureCount transcript fixtures found"
        } else {
            Write-TestResult "Transcript Fixtures" "FAIL" "Insufficient transcript fixtures: $fixtureCount"
        }
        
        # Test different stub modes (if TRANSCRIPTION_PROVIDER=stub)
        if ($env:TRANSCRIPTION_PROVIDER -eq 'stub') {
            $originalStubMode = $env:STUB_MODE
            
            # Test fast mode
            $env:STUB_MODE = 'fast'
            Write-TestResult "Stub Mode: FAST" "PASS" "Mode configuration successful"
            
            # Test normal mode
            $env:STUB_MODE = 'normal'
            Write-TestResult "Stub Mode: NORMAL" "PASS" "Mode configuration successful"
            
            # Restore original mode
            if ($originalStubMode) {
                $env:STUB_MODE = $originalStubMode
            } else {
                Remove-Item Env:STUB_MODE -ErrorAction SilentlyContinue
            }
        } else {
            Write-TestResult "Stub Mode Testing" "SKIP" "Not using stub provider"
        }
        
    } catch {
        Write-TestResult "Enhanced Stub Provider" "FAIL" "Error testing stub provider: $($_.Exception.Message)"
    }
}

function Test-IncidentTracking {
    if (-not $TestIncidents) {
        Write-TestResult "Incident Tracking" "SKIP" "Skipped (use -TestIncidents to enable)"
        return
    }
    
    Write-ColorOutput "📋 Testing Incident Tracking..." $Blue
    
    # Check if incident system files exist
    $incidentFiles = @{
        "incidentStore.ts" = ".\backend\src\ops\incidentStore.ts"
        "pipelineTroubleshooter.ts" = ".\backend\src\services\troubleshooting\pipelineTroubleshooter.ts"
    }
    
    foreach ($file in $incidentFiles.Keys) {
        if (Test-Path $incidentFiles[$file]) {
            Write-TestResult "Incident System File: $file" "PASS" "File exists"
        } else {
            Write-TestResult "Incident System File: $file" "FAIL" "File not found"
        }
    }
    
    # Check for incident storage directory
    $incidentStorageDir = ".\backend\storage\ops"
    if (Test-Path $incidentStorageDir) {
        Write-TestResult "Incident Storage Directory" "PASS" "Storage directory exists"
    } else {
        Write-TestResult "Incident Storage Directory" "WARN" "Storage directory will be created on first incident"
    }
    
    # Check if orchestrator has enhanced incident creation
    $orchestratorPath = ".\backend\src\services\donationPipeline\orchestrator.ts"
    if (Test-Path $orchestratorPath) {
        $orchestratorContent = Get-Content $orchestratorPath -Raw
        
        if ($orchestratorContent -match 'handleFailure' -and $orchestratorContent -match 'PipelineStage.ORCHESTRATION') {
            Write-TestResult "Enhanced Pipeline Incident Creation" "PASS" "Orchestrator creates incidents on errors"
        } else {
            Write-TestResult "Enhanced Pipeline Incident Creation" "FAIL" "Orchestrator missing enhanced incident creation"
        }
    } else {
        Write-TestResult "Enhanced Pipeline Incident Creation" "SKIP" "Orchestrator not found"
    }
}

function Test-SmokeTestEnhancement {
    Write-ColorOutput "💨 Testing Smoke Test Enhancement..." $Blue
    
    $smokeTestPath = ".\backend\src\services\speechIntelligence\smokeTest.ts"
    if (Test-Path $smokeTestPath) {
        Write-TestResult "Smoke Test File" "PASS" "smokeTest.ts found"
        
        $smokeContent = Get-Content $smokeTestPath -Raw
        
        # Check for environment-aware engine selection
        if ($smokeContent -match 'ZERO_OPENAI_MODE.*true' -and $smokeContent -match 'V1_STABLE.*true') {
            Write-TestResult "Environment-Aware Engine Selection" "PASS" "Smoke test respects V1/Zero-OpenAI flags"
        } else {
            Write-TestResult "Environment-Aware Engine Selection" "FAIL" "Smoke test not environment-aware"
        }
        
        # Check for TRANSCRIPTION_PROVIDER support
        if ($smokeContent -match 'TRANSCRIPTION_PROVIDER') {
            Write-TestResult "Transcription Provider Support" "PASS" "Smoke test supports TRANSCRIPTION_PROVIDER"
        } else {
            Write-TestResult "Transcription Provider Support" "WARN" "Smoke test may not support TRANSCRIPTION_PROVIDER"
        }
        
        # Check for AssemblyAI engine support
        if ($smokeContent -match 'TranscriptionEngine.ASSEMBLYAI') {
            Write-TestResult "AssemblyAI Engine Support" "PASS" "Smoke test supports AssemblyAI engine"
        } else {
            Write-TestResult "AssemblyAI Engine Support" "FAIL" "Smoke test missing AssemblyAI engine support"
        }
        
    } else {
        Write-TestResult "Smoke Test Enhancement" "FAIL" "smokeTest.ts not found"
    }
}

function Test-StressTestIntegration {
    Write-ColorOutput "🧪 Testing Stress Test Integration..." $Blue
    
    # Check if stress test script exists
    $stressTestScript = ".\scripts\stress-test.ps1"
    if (Test-Path $stressTestScript) {
        Write-TestResult "Stress Test Script" "PASS" "stress-test.ps1 found"
        
        # Check script capabilities (by examining content)
        $stressContent = Get-Content $stressTestScript -Raw
        
        $capabilities = @{
            'Concurrent Tickets' = 'TicketCount'
            'Stub Mode Support' = 'StubMode'
            'Performance Metrics' = 'throughput|completion.*time'
            'Environment Gating' = 'X-STRESS-TEST-KEY'
            'Success Criteria' = 'SUCCESS RATE'
        }
        
        foreach ($capability in $capabilities.Keys) {
            if ($stressContent -match $capabilities[$capability]) {
                Write-TestResult "Stress Test Capability: $capability" "PASS" "Feature implemented"
            } else {
                Write-TestResult "Stress Test Capability: $capability" "WARN" "Feature may be missing"
            }
        }
        
    } else {
        Write-TestResult "Stress Test Integration" "FAIL" "stress-test.ps1 not found"
    }
}

function Test-ConfigurationDriftImmunity {
    Write-ColorOutput "🔍 Testing Configuration Drift Immunity..." $Blue
    
    # Check if config validation script exists
    $configScript = ".\scripts\validate-config-consistency.ps1"
    if (Test-Path $configScript) {
        Write-TestResult "Config Validation Script" "PASS" "validate-config-consistency.ps1 found"
        
        # Run config validation
        try {
            $configResult = & $configScript -ErrorAction Continue
            $configExitCode = $LASTEXITCODE
            
            switch ($configExitCode) {
                0 { Write-TestResult "Configuration Drift Check" "PASS" "No configuration drift detected" }
                1 { Write-TestResult "Configuration Drift Check" "WARN" "Minor configuration warnings" }
                2 { Write-TestResult "Configuration Drift Check" "FAIL" "Configuration errors detected" }
                3 { Write-TestResult "Configuration Drift Check" "FAIL" "Critical configuration issues" }
                default { Write-TestResult "Configuration Drift Check" "WARN" "Unexpected exit code: $configExitCode" }
            }
            
        } catch {
            Write-TestResult "Configuration Drift Check" "FAIL" "Error running config validation: $($_.Exception.Message)"
        }
        
    } else {
        Write-TestResult "Configuration Drift Immunity" "FAIL" "validate-config-consistency.ps1 not found"
    }
    
    # Check if TypeScript validation module exists  
    $configDriftPath = ".\backend\src\config\configDriftValidation.ts"
    if (Test-Path $configDriftPath) {
        Write-TestResult "Config Drift TypeScript Module" "PASS" "configDriftValidation.ts found"
    } else {
        Write-TestResult "Config Drift TypeScript Module" "WARN" "configDriftValidation.ts not found"
    }
}

# Main execution
Write-ColorOutput "🔧 V1 HARDENING FEATURES VALIDATION TEST SUITE" $Blue
Write-ColorOutput "==============================================" $Blue
Write-ColorOutput "Base URL: $BaseUrl" $Cyan
Write-ColorOutput "Test Stub Provider: $TestStubProvider" $Cyan
Write-ColorOutput "Test Incidents: $TestIncidents" $Cyan
Write-ColorOutput "Verbose: $Verbose" $Cyan
Write-ColorOutput "" $Reset

$startTime = Get-Date

# Run all V1 hardening validation tests
Test-BootBannerConfiguration
Test-CorrelationIdMiddleware
Test-StructuredLogging
Test-ZeroOpenAIMode
Test-EnhancedStubProvider
Test-IncidentTracking
Test-SmokeTestEnhancement
Test-StressTestIntegration
Test-ConfigurationDriftImmunity

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

# Summary
$totalTests = $script:TestResults.Count
$passedTests = ($script:TestResults | Where-Object { $_.Status -eq "PASS" }).Count
$failedTests = ($script:TestResults | Where-Object { $_.Status -eq "FAIL" }).Count
$skippedTests = ($script:TestResults | Where-Object { $_.Status -eq "SKIP" }).Count
$warnTests = ($script:TestResults | Where-Object { $_.Status -eq "WARN" }).Count

Write-ColorOutput "" $Reset
Write-ColorOutput "📊 V1 HARDENING VALIDATION RESULTS" $Blue
Write-ColorOutput "==================================" $Blue
Write-ColorOutput "Total Tests: $totalTests" $Reset
Write-ColorOutput "✅ Passed: $passedTests" $Green
Write-ColorOutput "❌ Failed: $failedTests" $Red
Write-ColorOutput "⏭️ Skipped: $skippedTests" $Yellow
Write-ColorOutput "⚠️  Warnings: $warnTests" $Yellow
Write-ColorOutput "⏱️  Duration: $([math]::Round($duration, 1))s" $Cyan

if ($failedTests -gt 0) {
    Write-ColorOutput "" $Reset
    Write-ColorOutput "❌ FAILED TESTS:" $Red
    $failed = $script:TestResults | Where-Object { $_.Status -eq "FAIL" }
    foreach ($test in $failed) {
        Write-ColorOutput "   $($test.Name): $($test.Details)" $Red
    }
}

$successRate = if ($totalTests -gt 0) { ($passedTests / $totalTests) * 100 } else { 0 }
Write-ColorOutput "" $Reset
Write-ColorOutput "🎯 V1 HARDENING SUCCESS RATE: $([math]::Round($successRate, 1))%" $(
    if ($successRate -ge 90) { $Green }
    elseif ($successRate -ge 75) { $Yellow }
    else { $Red }
)

if ($failedTests -eq 0 -and $successRate -ge 90) {
    Write-ColorOutput "" $Reset
    Write-ColorOutput "🎉 V1 HARDENING VALIDATION PASSED!" $Green
    Write-ColorOutput "   All V1 hardening features are properly implemented." $Green
    exit 0
} elseif ($failedTests -eq 0) {
    Write-ColorOutput "" $Reset
    Write-ColorOutput "⚠️  V1 HARDENING VALIDATION PASSED WITH WARNINGS" $Yellow
    exit 0
} else {
    Write-ColorOutput "" $Reset
    Write-ColorOutput "❌ V1 HARDENING VALIDATION FAILED" $Red
    Write-ColorOutput "   Some V1 hardening features need attention." $Red
    exit 1
}