#!/usr/bin/env pwsh
# Quick knowledge vault status check

Write-Host "`n=== Knowledge Vault Status ===" -ForegroundColor Cyan

try {
    $h = @{'x-admin-password' = 'admin2024'}
    $r = Invoke-RestMethod 'http://localhost:3001/admin/knowledge/sources' -Headers $h
    
    Write-Host "`nTotal Sources: $($r.total)" -ForegroundColor Yellow
    
    if ($r.total -eq 0) {
        Write-Host "`n[-] Knowledge vault is EMPTY" -ForegroundColor Red
        Write-Host "    Run: .\scripts\populate-gofundme-knowledge.ps1" -ForegroundColor Gray
    } else {
        Write-Host "`nSources:" -ForegroundColor Yellow
        $r.data | ForEach-Object {
            Write-Host "  - $($_.title)" -ForegroundColor White
            Write-Host "    Type: $($_.sourceType)  |  Tags: $($_.tags -join ', ')" -ForegroundColor Gray
        }
        
        # Check for template
        $template = $r.data | Where-Object { 
            $_.tags -contains "DONATION_DRAFT" -and $_.tags -contains "TEMPLATE" 
        }
        
        if ($template) {
            Write-Host "`n[+] TEMPLATE FOUND: $($template.title)" -ForegroundColor Green
            Write-Host "    getDonationDraftTemplate() will work!" -ForegroundColor Green
        } else {
            Write-Host "`n[-] NO TEMPLATE with DONATION_DRAFT + TEMPLATE tags" -ForegroundColor Red
            Write-Host "    getDonationDraftTemplate() will return null" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    
} catch {
    Write-Host "`nERROR: $_" -ForegroundColor Red
    Write-Host "Is backend running? http://localhost:3001" -ForegroundColor Yellow
}
