# Knowledge Vault GoFundMe Audit - Simplified Version
# Checks if GoFundMe process documentation exists in knowledge vault

param(
    [string]$AdminPassword = "admin2024",
    [string]$BackendUrl = "http://localhost:3001"
)

Write-Host "`n=== GoFundMe Knowledge Vault Audit ===`n" -ForegroundColor Cyan

$headers = @{
    'x-admin-password' = $AdminPassword
    'Content-Type' = 'application/json'
}

try {
    $sources = Invoke-RestMethod -Uri "$BackendUrl/admin/knowledge/sources?limit=100" -Method GET -Headers $headers
    
    Write-Host "Total Knowledge Sources: $($sources.data.Count)`n" -ForegroundColor Green
    
    # Filter GoFundMe related
    $gofundme = $sources.data | Where-Object { 
        $_.title -like "*GoFundMe*" -or 
        $_.title -like "*donation*" -or
        ($_.tags -and ($_.tags -contains "GOFUNDME" -or $_.tags -contains "DONATION_DRAFT"))
    }
    
    Write-Host "GoFundMe Sources Found: $($gofundme.Count)" -ForegroundColor $(if ($gofundme.Count -gt 0) { "Green" } else { "Red" })
    
    if ($gofundme.Count -gt 0) {
        foreach ($s in $gofundme) {
            Write-Host "  [+] $($s.title)" -ForegroundColor Green
            Write-Host "      ID: $($s.id)" -ForegroundColor Gray
            Write-Host "      Type: $($s.sourceType)" -ForegroundColor Gray
            Write-Host "      Chunks: $($s._count.chunks)" -ForegroundColor Gray
            Write-Host ""
        }
    }
    
    # Check for template
    Write-Host "Template Check (DONATION_DRAFT + TEMPLATE tags):" -ForegroundColor Cyan
    $templates = $gofundme | Where-Object {
        $_.tags -contains "DONATION_DRAFT" -and $_.tags -contains "TEMPLATE"
    }
    
    if ($templates.Count -gt 0) {
        Write-Host "  [+] Template FOUND - getDonationDraftTemplate() will work" -ForegroundColor Green
        foreach ($t in $templates) {
            Write-Host "      $($t.title)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  [-] Template NOT FOUND - getDonationDraftTemplate() will return null" -ForegroundColor Red
        Write-Host "      ACTION: Add source with tags DONATION_DRAFT and TEMPLATE" -ForegroundColor Yellow
    }
    
    Write-Host "`nNext Steps:" -ForegroundColor Cyan
    if ($gofundme.Count -eq 0) {
        Write-Host "  1. Run: .\scripts\populate-gofundme-knowledge.ps1" -ForegroundColor Yellow
        Write-Host "  2. This will add GoFundMe guide to knowledge vault" -ForegroundColor Gray
    } else {
        Write-Host "  [+] GoFundMe knowledge exists in vault" -ForegroundColor Green
        Write-Host "  [+] System can use this for draft generation" -ForegroundColor Green
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Audit Complete ===`n" -ForegroundColor Cyan
