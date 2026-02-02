#!/usr/bin/env pwsh
# Simple test for GoFundMe draft generation

$ErrorActionPreference = "Stop"

Write-Host "`n=== Simple GoFundMe Draft Test ===" -ForegroundColor Cyan

# Test 1: Check knowledge vault
Write-Host "`n[1] Checking knowledge vault..." -ForegroundColor Yellow
try {
    $headers = @{
        'x-admin-password' = 'admin2024'
        'Content-Type' = 'application/json'
    }
    
    $response = Invoke-RestMethod `
        -Uri 'http://localhost:3001/admin/knowledge/sources' `
        -Headers $headers `
        -Method Get
    
    Write-Host "   Total sources: $($response.total)" -ForegroundColor Green
    
    if ($response.total -eq 0) {
        Write-Host "   [!] Knowledge vault is empty - populating..." -ForegroundColor Yellow
        & "$PSScriptRoot\populate-gofundme-knowledge.ps1"
        Start-Sleep -Seconds 2
    }
    
    # Check for template
    $hasTemplate = $false
    foreach ($source in $response.data) {
        if ($source.tags -contains "DONATION_DRAFT" -and $source.tags -contains "TEMPLATE") {
            $hasTemplate = $true
            Write-Host "   [+] Found template: $($source.title)" -ForegroundColor Green
            break
        }
    }
    
    if (-not $hasTemplate -and $response.total -gt 0) {
        Write-Host "   [-] Template not found in $($response.total) sources" -ForegroundColor Red
    }
} catch {
    Write-Host "   [!] Error checking vault: $_" -ForegroundColor Red
}

# Test 2: Create a test ticket with GoFundMe intent
Write-Host "`n[2] Creating test ticket..." -ForegroundColor Yellow

$testTicket = @{
    patientName = "Sarah Johnson"
    patientAge = 32
    location = "Seattle, WA"
    category = "Medical"
    goalAmount = 15000
    transcript = @"
Hi, my name is Sarah Johnson. I'm 32 years old and I live in Seattle, Washington.
I'm reaching out because I really need help with my medical expenses.

Last month, I was diagnosed with a serious condition that requires surgery.
The surgery costs about 15,000 dollars and my insurance only covers half of it.

I've been working as a teacher for the past 8 years, but I don't have enough savings
to cover this unexpected expense. The surgery is scheduled for next month and I need
to pay the deposit soon.

Without this surgery, my condition will get worse and I won't be able to work.
I'm asking for help because I don't know what else to do. Any amount would help me
get through this difficult time. Thank you so much for considering my request.
"@
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod `
        -Uri 'http://localhost:3001/api/admin/tickets' `
        -Method Post `
        -Headers @{
            'Content-Type' = 'application/json'
            'x-admin-password' = 'admin2024'
        } `
        -Body $testTicket
    
    $ticketId = $response.id
    Write-Host "   [+] Created ticket: $ticketId" -ForegroundColor Green
    
    # Test 3: Generate draft
    Write-Host "`n[3] Generating GoFundMe draft..." -ForegroundColor Yellow
    
    $draftRequest = @{
        ticketId = $ticketId
        platform = "gofundme"
    } | ConvertTo-Json
    
    $draftResponse = Invoke-RestMethod `
        -Uri 'http://localhost:3001/api/donations/draft' `
        -Method Post `
        -Headers @{
            'Content-Type' = 'application/json'
        } `
        -Body $draftRequest
    
    Write-Host "`n=== Generated Draft ===" -ForegroundColor Cyan
    Write-Host "Title: $($draftResponse.title)" -ForegroundColor White
    Write-Host "Category: $($draftResponse.category)" -ForegroundColor White
    Write-Host "Goal: `$$($draftResponse.goalAmount)" -ForegroundColor White
    Write-Host "`nStory:" -ForegroundColor White
    Write-Host $draftResponse.story -ForegroundColor Gray
    
    if ($draftResponse.usedKnowledge) {
        Write-Host "`n[+] Draft used knowledge vault!" -ForegroundColor Green
    } else {
        Write-Host "`n[-] Draft did NOT use knowledge vault" -ForegroundColor Red
    }
    
    Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
    
} catch {
    Write-Host "   [!] Error: $_" -ForegroundColor Red
    Write-Host "   Response: $($_.Exception.Response | Out-String)" -ForegroundColor Gray
}
