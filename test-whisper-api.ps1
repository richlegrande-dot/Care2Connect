# Whisper API Manual Test Script
# Tests the audio transcription functionality

param(
    [string]$AudioFile = "",
    [string]$BackendUrl = "http://localhost:3001",
    [switch]$Verbose
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "WHISPER API MANUAL TEST SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend Health Check
Write-Host "[1/5] Checking backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BackendUrl/health/status" -UseBasicParsing
    if ($health.status -eq "healthy") {
        Write-Host "  ✓ Backend is healthy" -ForegroundColor Green
        $openaiStatus = if($health.services.openai.healthy){'✓'}else{'✗'}
        $openaiColor = if($health.services.openai.healthy){'Green'}else{'Red'}
        Write-Host "  OpenAI: $openaiStatus" -ForegroundColor $openaiColor
        $speechStatus = if($health.services.speech.healthy){'✓'}else{'✗'}
        $speechColor = if($health.services.speech.healthy){'Green'}else{'Red'}
        Write-Host "  Speech: $speechStatus" -ForegroundColor $speechColor
    } else {
        throw "Backend status: $($health.status)"
    }
} catch {
    Write-Host "  ✗ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Check OpenAI Configuration
Write-Host "[2/5] Verifying OpenAI configuration..." -ForegroundColor Yellow
try {
    $openaiCheck = Invoke-RestMethod -Uri "$BackendUrl/health/status" -UseBasicParsing
    $openaiHealthy = $openaiCheck.services.openai.healthy
    
    if ($openaiHealthy) {
        Write-Host "  ✓ OpenAI API is configured and responding" -ForegroundColor Green
    } else {
        Write-Host "  ✗ OpenAI API is not healthy" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ✗ Failed to verify OpenAI: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Check for Audio File
Write-Host "[3/5] Checking audio file..." -ForegroundColor Yellow

if ([string]::IsNullOrEmpty($AudioFile)) {
    Write-Host "  ℹ No audio file specified. Looking for sample files..." -ForegroundColor Cyan
    
    # Check common locations
    $sampleLocations = @(
        "uploads/audio/*.mp3",
        "uploads/audio/*.wav",
        "uploads/audio/*.m4a",
        "test-audio/*.mp3",
        "test-audio/*.wav"
    )
    
    $foundFiles = @()
    foreach ($pattern in $sampleLocations) {
        $files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
        $foundFiles += $files
    }
    
    if ($foundFiles.Count -gt 0) {
        Write-Host "  Found sample audio files:" -ForegroundColor Green
        foreach ($file in $foundFiles | Select-Object -First 5) {
            $sizeKB = [math]::Round($file.Length/1024, 2)
            Write-Host "    - $($file.Name) - Size: $sizeKB KB" -ForegroundColor Gray
        }
        $AudioFile = $foundFiles[0].FullName
        Write-Host "  Selected file: $($foundFiles[0].Name)" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "  ℹ No audio files found. You can:" -ForegroundColor Yellow
        Write-Host "    1. Provide an audio file: .\test-whisper-api.ps1 -AudioFile 'path\to\audio.mp3'" -ForegroundColor White
        Write-Host "    2. Record a short audio clip and save as test-audio.mp3" -ForegroundColor White
        Write-Host "    3. Download a sample: https://www2.cs.uic.edu/~i101/SoundFiles/preamble.wav" -ForegroundColor White
        Write-Host ""
        Write-Host "To continue with API endpoint tests only, press any key..." -ForegroundColor Cyan
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    }
}

if (-not [string]::IsNullOrEmpty($AudioFile) -and (Test-Path $AudioFile)) {
    $fileInfo = Get-Item $AudioFile
    Write-Host "  ✓ Audio file found: $($fileInfo.Name)" -ForegroundColor Green
    Write-Host "    Size: $([math]::Round($fileInfo.Length/1KB, 2)) KB" -ForegroundColor Gray
    Write-Host "    Type: $($fileInfo.Extension)" -ForegroundColor Gray
} elseif (-not [string]::IsNullOrEmpty($AudioFile)) {
    Write-Host "  ✗ Audio file not found: $AudioFile" -ForegroundColor Red
    $AudioFile = ""
}

Write-Host ""

# Test 4: Test Transcription Endpoint (if audio file available)
if (-not [string]::IsNullOrEmpty($AudioFile)) {
    Write-Host "[4/5] Testing transcription endpoint..." -ForegroundColor Yellow
    
    try {
        # Prepare multipart form data
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        $bodyLines = @(
            "--$boundary",
            "Content-Disposition: form-data; name=`"audio`"; filename=`"$(Split-Path $AudioFile -Leaf)`"",
            "Content-Type: application/octet-stream$LF",
            [System.IO.File]::ReadAllText($AudioFile),
            "--$boundary--$LF"
        )
        
        # Read file as bytes
        $fileBytes = [System.IO.File]::ReadAllBytes($AudioFile)
        
        # Build proper multipart form
        $encoding = [System.Text.Encoding]::UTF8
        $bodyBytes = @()
        
        # Add form boundary and headers
        $bodyBytes += $encoding.GetBytes("--$boundary$LF")
        $bodyBytes += $encoding.GetBytes("Content-Disposition: form-data; name=`"audio`"; filename=`"$(Split-Path $AudioFile -Leaf)`"$LF")
        $bodyBytes += $encoding.GetBytes("Content-Type: application/octet-stream$LF$LF")
        
        # Add file content
        $bodyBytes += $fileBytes
        
        # Add closing boundary
        $bodyBytes += $encoding.GetBytes("$LF--$boundary--$LF")
        
        Write-Host "  Uploading and transcribing..." -ForegroundColor Cyan
        Write-Host "  (This may take 5-30 seconds depending on audio length)" -ForegroundColor Gray
        
        $response = Invoke-RestMethod `
            -Uri "$BackendUrl/api/transcribe" `
            -Method Post `
            -ContentType "multipart/form-data; boundary=$boundary" `
            -Body $bodyBytes `
            -TimeoutSec 60
        
        Write-Host "  ✓ Transcription successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "  Results:" -ForegroundColor Cyan
        Write-Host "  --------" -ForegroundColor Cyan
        Write-Host "  Audio File ID: $($response.data.audioFileId)" -ForegroundColor White
        
        if ($response.data.transcript) {
            Write-Host "  Transcript: `"$($response.data.transcript.transcript)`"" -ForegroundColor White
            if ($response.data.transcript.language) {
                Write-Host "  Language: $($response.data.transcript.language)" -ForegroundColor Gray
            }
            if ($response.data.transcript.duration) {
                Write-Host "  Duration: $($response.data.transcript.duration)s" -ForegroundColor Gray
            }
        }
        
        if ($response.data.profileData) {
            Write-Host ""
            Write-Host "  Extracted Profile Data:" -ForegroundColor Cyan
            $response.data.profileData | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Gray
        }
        
        # Save audio file ID for status check
        $script:audioFileId = $response.data.audioFileId
        
    } catch {
        Write-Host "  ✗ Transcription failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($Verbose) {
            Write-Host "  Details: $($_.Exception)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    
    # Test 5: Check Transcription Status
    if ($script:audioFileId) {
        Write-Host "[5/5] Checking transcription status..." -ForegroundColor Yellow
        
        try {
            $status = Invoke-RestMethod `
                -Uri "$BackendUrl/api/transcribe/$($script:audioFileId)/status" `
                -UseBasicParsing
            
            Write-Host "  ✓ Status retrieved successfully" -ForegroundColor Green
            Write-Host "  Transcribed: $($status.transcribed)" -ForegroundColor White
            Write-Host "  Processed: $($status.processed)" -ForegroundColor White
            
        } catch {
            Write-Host "  ✗ Status check failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "[5/5] Skipped status check (no audio file processed)" -ForegroundColor Gray
    }
} else {
    Write-Host "[4/5] Skipped transcription test (no audio file)" -ForegroundColor Gray
    Write-Host "[5/5] Skipped status check (no audio file)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend Status: ✓ Healthy" -ForegroundColor Green
Write-Host "OpenAI API: ✓ Configured" -ForegroundColor Green

if (-not [string]::IsNullOrEmpty($AudioFile)) {
    if ($script:audioFileId) {
        Write-Host "Transcription: ✓ Successful" -ForegroundColor Green
    } else {
        Write-Host "Transcription: ✗ Failed" -ForegroundColor Red
    }
} else {
    Write-Host "Transcription: - Not tested (no audio file)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "API Endpoints Available:" -ForegroundColor Cyan
Write-Host "  POST   $BackendUrl/api/transcribe" -ForegroundColor White
Write-Host "  GET    $BackendUrl/api/transcribe/:audioFileId/status" -ForegroundColor White
Write-Host "  POST   $BackendUrl/api/transcribe/:audioFileId/reprocess" -ForegroundColor White
Write-Host ""
Write-Host "For more testing:" -ForegroundColor Cyan
Write-Host "  • Open frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  • View health: http://localhost:3001/health/status" -ForegroundColor White
Write-Host "  • Run with audio: .\test-whisper-api.ps1 -AudioFile 'your-audio.mp3'" -ForegroundColor White
Write-Host ""
