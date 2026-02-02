# Test Data Generation Script for Admin Story Browser QA
# Creates 3 test recordings with different profile configurations

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Creating Test Recordings" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001"

# Function to create a mock audio file
function Create-MockAudioFile {
    param([string]$filename)
    
    $audioDir = "C:\Users\richl\Care2system\v1-backend\uploads\audio"
    if (!(Test-Path $audioDir)) {
        New-Item -ItemType Directory -Path $audioDir -Force | Out-Null
    }
    
    $filepath = Join-Path $audioDir $filename
    # Create a minimal WebM file (just header, not real audio)
    $bytes = [byte[]](0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0x42, 0x86, 0x81, 0x01)
    [System.IO.File]::WriteAllBytes($filepath, $bytes)
    
    return $filename
}

# Test Recording 1: Email only
Write-Host "Test 1: Creating recording with email-only profile" -ForegroundColor Yellow
try {
    $filename1 = Create-MockAudioFile "test-recording-1.webm"
    
    # Create recording
    $recording1Body = @{
        audioUrl = "http://localhost:3001/audio/$filename1"
        duration = 45
    } | ConvertTo-Json
    
    # Note: We need to simulate multipart/form-data for file upload
    # For testing, we'll use the direct API approach
    
    $audioUrl1 = "http://localhost:3001/audio/$filename1"
    
    Write-Host "  Created audio file: $filename1" -ForegroundColor Gray
    Write-Host "  Note: Use frontend to upload actual recording" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "  ❌ Failed: $_" -ForegroundColor Red
}

# Test Recording 2: Phone only
Write-Host "Test 2: Creating recording with phone-only profile" -ForegroundColor Yellow
try {
    $filename2 = Create-MockAudioFile "test-recording-2.webm"
    Write-Host "  Created audio file: $filename2" -ForegroundColor Gray
    Write-Host "  Note: Use frontend to upload actual recording" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "  ❌ Failed: $_" -ForegroundColor Red
}

# Test Recording 3: Both email and phone
Write-Host "Test 3: Creating recording with email + phone profile" -ForegroundColor Yellow
try {
    $filename3 = Create-MockAudioFile "test-recording-3.webm"
    Write-Host "  Created audio file: $filename3" -ForegroundColor Gray
    Write-Host "  Note: Use frontend to upload actual recording" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "  ❌ Failed: $_" -ForegroundColor Red
}

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Manual Testing Instructions" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To create test recordings via API:" -ForegroundColor White
Write-Host ""
Write-Host "1. Use the frontend at http://localhost:3000/tell-your-story" -ForegroundColor Gray
Write-Host "   OR use curl/PowerShell to POST to /api/recordings" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Then attach profiles with different combinations:" -ForegroundColor Gray
Write-Host "   - Email only: john.doe@example.com" -ForegroundColor Gray
Write-Host "   - Phone only: (555) 123-4567" -ForegroundColor Gray
Write-Host "   - Both: jane.smith@example.com + (555) 987-6543" -ForegroundColor Gray
Write-Host ""
Write-Host "Continuing with direct DB insertion for testing..." -ForegroundColor Yellow
Write-Host ""
