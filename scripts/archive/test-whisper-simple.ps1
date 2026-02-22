# Simple Whisper API Test Script
param(
    [string]$AudioFile = ""
)

$ErrorActionPreference = 'Continue'
$BackendUrl = "http://localhost:3001"

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "WHISPER API TEST" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend Health
Write-Host "[1/3] Checking backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BackendUrl/health/status" -UseBasicParsing -ErrorAction Stop
    Write-Host "  Backend: HEALTHY" -ForegroundColor Green
    Write-Host "  OpenAI: $($health.services.openai.healthy)" -ForegroundColor $(if($health.services.openai.healthy){'Green'}else{'Red'})
    Write-Host "  Speech: $($health.services.speech.healthy)" -ForegroundColor $(if($health.services.speech.healthy){'Green'}else{'Red'})
} catch {
    Write-Host "  Backend: UNHEALTHY" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: API Endpoints
Write-Host "[2/3] API Endpoints:" -ForegroundColor Yellow
Write-Host "  POST $BackendUrl/api/transcribe" -ForegroundColor White
Write-Host "  GET  $BackendUrl/api/transcribe/:id/status" -ForegroundColor White
Write-Host "  POST $BackendUrl/api/transcribe/:id/reprocess" -ForegroundColor White

Write-Host ""

# Test 3: Audio File Upload (if provided)
if ($AudioFile -and (Test-Path $AudioFile)) {
    Write-Host "[3/3] Testing transcription..." -ForegroundColor Yellow
    Write-Host "  File: $AudioFile" -ForegroundColor Gray
    Write-Host "  Note: Full upload test requires manual curl or Postman" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Quick test command:" -ForegroundColor Cyan
    Write-Host "  curl -X POST $BackendUrl/api/transcribe -F 'audio=@$AudioFile'" -ForegroundColor White
} else {
    Write-Host "[3/3] No audio file specified" -ForegroundColor Gray
    Write-Host "  Run: .\test-whisper-simple.ps1 -AudioFile 'audio.mp3'" -ForegroundColor White
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "SYSTEM READY FOR MANUAL TESTING" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open frontend: http://localhost:3000" -ForegroundColor White
Write-Host "2. Test API with Postman or curl" -ForegroundColor White
Write-Host "3. Check logs: pm2 logs careconnect-backend" -ForegroundColor White
Write-Host "4. Review guide: WHISPER_API_TESTING_GUIDE.md" -ForegroundColor White
Write-Host ""
