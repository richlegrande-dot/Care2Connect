#!/usr/bin/env pwsh
# Test GoFundMe draft generation by calling the API with test data

$ErrorActionPreference = "Stop"
$outputFile = "$PSScriptRoot\..\test-output.txt"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logLine = "[$timestamp] $Message"
    Write-Host $logLine
    Add-Content -Path $outputFile -Value $logLine
}

# Clear previous output
if (Test-Path $outputFile) {
    Remove-Item $outputFile
}

Write-Log "=== GoFundMe Draft Generation Test ==="
Write-Log ""

# Check if backend is running
Write-Log "[1] Checking backend status..."
try {
    $response = Invoke-RestMethod 'http://localhost:3001/health' -TimeoutSec 3
    Write-Log "   Backend is running"
} catch {
    Write-Log "   ERROR: Backend not running - $_"
    Write-Log "   Please start backend with: cd backend; npm run dev"
    exit 1
}

# Check knowledge vault status
Write-Log ""
Write-Log "[2] Checking knowledge vault..."
try {
    $headers = @{'x-admin-password' = 'admin2024'}
    $kvResponse = Invoke-RestMethod 'http://localhost:3001/admin/knowledge/sources' -Headers $headers
    Write-Log "   Total sources: $($kvResponse.total)"
    
    if ($kvResponse.total -eq 0) {
        Write-Log "   WARNING: Knowledge vault is empty!"
        Write-Log "   Populating vault..."
        & "$PSScriptRoot\populate-gofundme-knowledge.ps1" | Out-File -Append -FilePath $outputFile
        Start-Sleep -Seconds 2
        
        # Re-check
        $kvResponse = Invoke-RestMethod 'http://localhost:3001/admin/knowledge/sources' -Headers $headers
        Write-Log "   After population: $($kvResponse.total) sources"
    }
    
    # Check for template
    $hasTemplate = $false
    foreach ($source in $kvResponse.data) {
        if ($source.tags -contains "DONATION_DRAFT" -and $source.tags -contains "TEMPLATE") {
            $hasTemplate = $true
            Write-Log "   Found template: $($source.title)"
            break
        }
    }
    
    if (-not $hasTemplate) {
        Write-Log "   ERROR: No template with DONATION_DRAFT + TEMPLATE tags found!"
    }
} catch {
    Write-Log "   ERROR: Failed to check vault - $_"
}

# Create a test user and profile
Write-Log ""
Write-Log "[3] Creating test data..."
try {
    # Check if test user exists
    $testEmail = "gofundme-test@test.com"
    
    # Create or get user
    $userData = @{
        email = $testEmail
        password = "TestPass123!"
        role = "USER"
        location = "Seattle, WA"
    } | ConvertTo-Json
    
    try {
        $userResponse = Invoke-RestMethod `
            -Uri 'http://localhost:3001/api/auth/register' `
            -Method Post `
            -Headers @{'Content-Type' = 'application/json'} `
            -Body $userData
        
        $userId = $userResponse.user.id
        Write-Log "   Created user: $userId"
    } catch {
        # User might already exist, try to login
        $loginData = @{
            email = $testEmail
            password = "TestPass123!"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod `
            -Uri 'http://localhost:3001/api/auth/login' `
            -Method Post `
            -Headers @{'Content-Type' = 'application/json'} `
            -Body $loginData
        
        $userId = $loginResponse.user.id
        Write-Log "   Using existing user: $userId"
    }
    
    # Create profile
    $profileData = @{
        name = "Sarah Johnson"
        bio = "I'm a 32-year-old teacher from Seattle who needs help with medical expenses"
        skills = "Teaching, writing"
        urgentNeeds = "Medical surgery funding"
        longTermGoals = "Return to work after surgery"
        housingStatus = "STABLE"
    } | ConvertTo-Json
    
    $profileResponse = Invoke-RestMethod `
        -Uri "http://localhost:3001/api/profiles" `
        -Method Post `
        -Headers @{
            'Content-Type' = 'application/json'
            'x-user-id' = $userId
        } `
        -Body $profileData
    
    $profileId = $profileResponse.id
    Write-Log "   Created profile: $profileId"
    
} catch {
    Write-Log "   ERROR: Failed to create test data - $_"
    exit 1
}

# Generate GoFundMe story
Write-Log ""
Write-Log "[4] Generating GoFundMe draft..."
try {
    $storyResponse = Invoke-RestMethod `
        -Uri "http://localhost:3001/api/donations/gofundme/$profileId/story" `
        -Method Get
    
    Write-Log ""
    Write-Log "=== Generated Story ==="
    Write-Log $storyResponse.data.story
    Write-Log ""
    Write-Log "=== Test Complete ==="
    
    if ($storyResponse.data.story -match "knowledge" -or $storyResponse.data.story.Length -gt 200) {
        Write-Log ""
        Write-Log "SUCCESS: Draft generated with $($storyResponse.data.story.Length) characters"
    } else {
        Write-Log ""
        Write-Log "WARNING: Draft seems short ($($storyResponse.data.story.Length) chars)"
    }
    
} catch {
    Write-Log "   ERROR: Failed to generate draft - $_"
    Write-Log "   Details: $($_.Exception.Message)"
    exit 1
}

Write-Log ""
Write-Log "Test output saved to: $outputFile"
