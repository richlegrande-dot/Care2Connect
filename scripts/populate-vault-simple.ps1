# Populate Knowledge Vault with System Documentation
$headers = @{
    'x-admin-password' = 'admin2024'
    'Content-Type' = 'application/json'
}

Write-Host "`n=== POPULATING KNOWLEDGE VAULT ===" -ForegroundColor Cyan

$sources = @(
    @{
        title = "Speech Intelligence - EVTS Implementation"
        sourceType = "documentation"
        url = "file://EVTS_SMOKE_TEST_IMPLEMENTATION.md"
        file = "EVTS_SMOKE_TEST_IMPLEMENTATION.md"
    },
    @{
        title = "Stripe Payment Integration"
        sourceType = "documentation"
        url = "file://DONATION_SYSTEM_IMPLEMENTATION_SUMMARY.md"
        file = "DONATION_SYSTEM_IMPLEMENTATION_SUMMARY.md"
    },
    @{
        title = "GoFundMe Integration"
        sourceType = "documentation"
        url = "file://DONATION_TOOLS_IMPLEMENTATION_SUMMARY.md"
        file = "DONATION_TOOLS_IMPLEMENTATION_SUMMARY.md"
    },
    @{
        title = "Automated Troubleshooting"
        sourceType = "troubleshooting"
        url = "file://AUTO_TROUBLESHOOTING_IMPLEMENTATION.md"
        file = "AUTO_TROUBLESHOOTING_IMPLEMENTATION.md"
    },
    @{
        title = "Admin Authentication Fix"
        sourceType = "troubleshooting"
        url = "file://docs/ADMIN_AUTH_CONNECTIVITY_ROOT_CAUSE_AND_HARDENING.md"
        file = "docs\ADMIN_AUTH_CONNECTIVITY_ROOT_CAUSE_AND_HARDENING.md"
    },
    @{
        title = "Production Readiness Phase 6M"
        sourceType = "documentation"
        url = "file://PHASE_6M_PRODUCTION_READINESS_COMPLETE.md"
        file = "PHASE_6M_PRODUCTION_READINESS_COMPLETE.md"
    },
    @{
        title = "Database Hardening"
        sourceType = "documentation"
        url = "file://OPS_HARDENING_SUMMARY.md"
        file = "OPS_HARDENING_SUMMARY.md"
    },
    @{
        title = "Health Monitoring Setup"
        sourceType = "documentation"
        url = "file://AUTOMATED_MONITORING_SETUP.md"
        file = "AUTOMATED_MONITORING_SETUP.md"
    }
)

$success = 0
foreach ($source in $sources) {
    $filePath = Join-Path "C:\Users\richl\Care2system" $source.file
    
    if (Test-Path $filePath) {
        Write-Host "`nAdding: $($source.title)" -ForegroundColor Yellow
        
        $body = @{
            title = $source.title
            sourceType = $source.sourceType
            url = $source.url
        } | ConvertTo-Json -Compress
        
        try {
            $result = Invoke-RestMethod -Uri "http://localhost:3001/admin/knowledge/sources" -Method POST -Headers $headers -Body $body
            Write-Host "  ✅ Created: $($result.id)" -ForegroundColor Green
            $success++
        } catch {
            Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "`n⚠️  File not found: $filePath" -ForegroundColor Yellow
    }
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "✅ Successfully added: $success sources" -ForegroundColor Green

# Verify
try {
    $vault = Invoke-RestMethod -Uri "http://localhost:3001/admin/knowledge/sources?page=1&limit=100" -Headers $headers
    Write-Host "Total in vault: $($vault.pagination.total)" -ForegroundColor Cyan
} catch {
    Write-Host "Could not verify vault" -ForegroundColor Red
}
