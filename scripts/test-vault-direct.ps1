#!/usr/bin/env pwsh
# Direct HTTP test - save results to file

$outputFile = "C:\Users\richl\Care2system\knowledge-vault-test-result.json"

Write-Host "Testing knowledge vault..." -ForegroundColor Cyan

try {
    $headers = @{
        'x-admin-password' = 'admin2024'
    }
    
    $response = Invoke-RestMethod `
        -Uri 'http://localhost:3001/admin/knowledge/sources?page=1&limit=20' `
        -Headers $headers `
        -Method Get
    
    # Save to file
    $response | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile -Encoding UTF8
    
    Write-Host "✅ Saved to: $outputFile" -ForegroundColor Green
    Write-Host "Total sources: $($response.total)" -ForegroundColor Yellow
    
    if ($response.total -gt 0) {
        Write-Host "`nSources:" -ForegroundColor Yellow
        $response.data | ForEach-Object {
            Write-Host "  - $($_.title)" -ForegroundColor White
        }
    } else {
        Write-Host "`n❌ No sources found" -ForegroundColor Red
        Write-Host "   Running population script..." -ForegroundColor Yellow
        
        & "C:\Users\richl\Care2system\scripts\populate-gofundme-knowledge.ps1"
        
        Write-Host "`n   Re-checking vault..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        
        $response2 = Invoke-RestMethod `
            -Uri 'http://localhost:3001/admin/knowledge/sources' `
            -Headers $headers
        
        Write-Host "   After population: $($response2.total) sources" -ForegroundColor $(if ($response2.total -gt 0) { "Green" } else { "Red" })
        
        $response2 | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile -Encoding UTF8
    }
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    $_.Exception | Out-File -FilePath $outputFile -Encoding UTF8
}

Write-Host "`nDone! Check: $outputFile" -ForegroundColor Cyan
