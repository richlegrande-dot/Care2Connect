# Knowledge Vault Population Script
# Populates the Knowledge Vault with system documentation for AI-assisted troubleshooting and processing

param(
    [string]$AdminPassword = "admin2024",
    [string]$BackendUrl = "http://localhost:3001"
)

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     KNOWLEDGE VAULT POPULATION SCRIPT                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$headers = @{
    'x-admin-password' = $AdminPassword
    'Content-Type' = 'application/json'
}

# Knowledge sources to populate
$knowledgeSources = @(
    @{
        title = "Speech Intelligence - EVTS System"
        description = "EVTS (Edge Voice-to-Text Service) implementation, smoke tests, and troubleshooting. 95% cost reduction vs OpenAI API."
        sourceType = "documentation"
        priority = "high"
        url = "file://EVTS_SMOKE_TEST_IMPLEMENTATION.md"
        filePath = "EVTS_SMOKE_TEST_IMPLEMENTATION.md"
    },
    @{
        title = "Speech Intelligence - EVTS Quick Reference"
        description = "Quick reference for EVTS configuration, usage, and smoke test procedures."
        sourceType = "documentation"
        priority = "high"
        url = "file://EVTS_SMOKE_TEST_QUICK_REF.md"
        filePath = "EVTS_SMOKE_TEST_QUICK_REF.md"
    },
    @{
        title = "Stripe Payment Processing - Implementation"
        description = "Stripe webhook integration, automated testing, payment flow validation, and donation tracking."
        sourceType = "documentation"
        priority = "high"
        url = "file://DONATION_SYSTEM_IMPLEMENTATION_SUMMARY.md"
        filePath = "DONATION_SYSTEM_IMPLEMENTATION_SUMMARY.md"
    },
    @{
        title = "Stripe Payment Processing - Testing Guide"
        description = "Complete testing procedures for Stripe webhooks, checkout sessions, and donation processing."
        sourceType = "documentation"
        priority = "high"
        url = "file://DONATION_SYSTEM_TESTING_GUIDE.md"
        filePath = "DONATION_SYSTEM_TESTING_GUIDE.md"
    },
    @{
        title = "GoFundMe Integration - Implementation"
        description = "GoFundMe donation tools, QR code generation, campaign management, and tracking."
        sourceType = "documentation"
        priority = "high"
        url = "file://DONATION_TOOLS_IMPLEMENTATION_SUMMARY.md"
        filePath = "DONATION_TOOLS_IMPLEMENTATION_SUMMARY.md"
    },
    @{
        title = "GoFundMe Integration - Testing Guide"
        description = "Testing procedures for GoFundMe QR codes, campaign creation, and donation tracking."
        sourceType = "documentation"
        priority = "medium"
        url = "file://DONATION_TOOLS_TESTING_GUIDE.md"
        filePath = "DONATION_TOOLS_TESTING_GUIDE.md"
    },
    @{
        title = "System Troubleshooting - Automated"
        description = "Automated troubleshooting implementation, health checks, self-healing, and error detection."
        sourceType = "troubleshooting"
        priority = "high"
        url = "file://AUTO_TROUBLESHOOTING_IMPLEMENTATION.md"
        filePath = "AUTO_TROUBLESHOOTING_IMPLEMENTATION.md"
    },
    @{
        title = "Admin Authentication - Root Cause Analysis"
        description = "Authentication troubleshooting, CORS issues, API proxy configuration, and hardening measures."
        sourceType = "troubleshooting"
        priority = "high"
        url = "file://docs/ADMIN_AUTH_CONNECTIVITY_ROOT_CAUSE_AND_HARDENING.md"
        filePath = "docs/ADMIN_AUTH_CONNECTIVITY_ROOT_CAUSE_AND_HARDENING.md"
    },
    @{
        title = "Production Readiness - Phase 6M"
        description = "Phase 6M production features: Stripe automation, EVTS transcription, Knowledge Vault, and operational hardening."
        sourceType = "documentation"
        priority = "high"
        url = "file://PHASE_6M_PRODUCTION_READINESS_COMPLETE.md"
        filePath = "PHASE_6M_PRODUCTION_READINESS_COMPLETE.md"
    },
    @{
        title = "Health Monitoring and Dashboards"
        description = "Automated monitoring setup, health check scheduler, service status tracking, and alerting."
        sourceType = "documentation"
        priority = "medium"
        url = "file://AUTOMATED_MONITORING_SETUP.md"
        filePath = "AUTOMATED_MONITORING_SETUP.md"
    },
    @{
        title = "Autostart Configuration"
        description = "System startup automation, service initialization, and troubleshooting startup issues."
        sourceType = "documentation"
        priority = "medium"
        url = "file://AUTOSTART_COMPLETE.md"
        filePath = "AUTOSTART_COMPLETE.md"
    },
    @{
        title = "Database Operations - Hardening"
        description = "Database startup gate, connection pooling, watchdog monitoring, and failure recovery."
        sourceType = "documentation"
        priority = "high"
        url = "file://OPS_HARDENING_SUMMARY.md"
        filePath = "OPS_HARDENING_SUMMARY.md"
    },
    @{
        title = "Offline Recording Implementation"
        description = "Browser-based offline recording with IndexedDB, audio chunking, and sync mechanisms."
        sourceType = "documentation"
        priority = "medium"
        url = "file://OFFLINE_RECORDING_IMPLEMENTATION_SUMMARY.md"
        filePath = "OFFLINE_RECORDING_IMPLEMENTATION_SUMMARY.md"
    },
    @{
        title = "System Testing Policy"
        description = "Testing policy update: all tests critical to system integrity, no optional tests."
        sourceType = "policy"
        priority = "high"
        url = "file://TESTING_POLICY_UPDATE.md"
        filePath = "TESTING_POLICY_UPDATE.md"
    }
)

$successCount = 0
$failureCount = 0
$skippedCount = 0

foreach ($source in $knowledgeSources) {
    Write-Host "Processing: $($source.title)" -ForegroundColor Yellow
    
    # Check if file exists
    $filePath = Join-Path $PSScriptRoot "..\$($source.filePath)"
    if (-not (Test-Path $filePath)) {
        Write-Host "  ⚠️  File not found: $filePath" -ForegroundColor Yellow
        $skippedCount++
        continue
    }
    
    # Read file content
    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Split content into chunks (max 4000 chars each)
        $chunkSize = 4000
        $chunks = @()
        
        if ($content.Length -le $chunkSize) {
            $chunks += $content
        } else {
            for ($i = 0; $i -lt $content.Length; $i += $chunkSize) {
                $end = [Math]::Min($i + $chunkSize, $content.Length)
                $chunks += $content.Substring($i, $end - $i)
            }
        }
        
        # Create knowledge source
        $body = @{
            title = $source.title
            description = $source.description
            sourceType = $source.sourceType
            priority = $source.priority
            url = $source.url
            content = $content
            metadata = @{
                filePath = $source.filePath
                chunkCount = $chunks.Count
                totalLength = $content.Length
            }
        } | ConvertTo-Json -Depth 10
        
        try {
            $response = Invoke-RestMethod -Uri "$BackendUrl/admin/knowledge/sources" -Method POST -Headers $headers -Body $body
            Write-Host "  ✅ Created source: $($response.id)" -ForegroundColor Green
            Write-Host "     Chunks: $($chunks.Count), Size: $($content.Length) bytes" -ForegroundColor Cyan
            $successCount++
        } catch {
            if ($_.Exception.Response.StatusCode.value__ -eq 409) {
                Write-Host "  ⚠️  Already exists (skipped)" -ForegroundColor Yellow
                $skippedCount++
            } else {
                Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
                $failureCount++
            }
        }
    } catch {
        Write-Host "  ❌ Error reading file: $($_.Exception.Message)" -ForegroundColor Red
        $failureCount++
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    SUMMARY                                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "✅ Created:  $successCount sources" -ForegroundColor Green
Write-Host "⚠️  Skipped: $skippedCount sources" -ForegroundColor Yellow
Write-Host "❌ Failed:   $failureCount sources" -ForegroundColor Red

# Verify total count
try {
    $allSources = Invoke-RestMethod -Uri "$BackendUrl/admin/knowledge/sources?page=1&limit=100" -Headers $headers
    Write-Host "`n📊 Total sources in vault: $($allSources.pagination.total)" -ForegroundColor Cyan
} catch {
    Write-Host "`n❌ Could not verify vault contents" -ForegroundColor Red
}

Write-Host "`n✨ Knowledge Vault population complete!" -ForegroundColor Green
Write-Host "   The AI can now reference this documentation for troubleshooting and processing." -ForegroundColor Cyan
Write-Host ""
