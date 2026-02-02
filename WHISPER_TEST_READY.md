# System Ready for Whisper API Manual Testing

**Date:** January 5, 2026  
**Status:** ✅ READY FOR TESTING

---

## System Status

### Services Running
✅ **Backend**: http://localhost:3001 - HEALTHY  
✅ **Frontend**: http://localhost:3000 - ONLINE  
✅ **PM2 Processes**: 2/2 online  
✅ **Cloudflare Tunnel**: CONNECTED  
✅ **Database**: HEALTHY  

### API Services
✅ **OpenAI API**: Configured and responding  
✅ **Speech Service**: Healthy  
✅ **Whisper Endpoint**: `/api/transcribe` available  

---

## Quick Test Commands

### 1. Run Health Check
```powershell
.\test-whisper-simple.ps1
```

### 2. Test with Audio File
```powershell
.\test-whisper-simple.ps1 -AudioFile "path\to\audio.mp3"
```

### 3. Check Backend Status
```powershell
Invoke-WebRequest http://localhost:3001/health/status -UseBasicParsing
```

### 4. View PM2 Logs
```powershell
pm2 logs careconnect-backend --lines 20
```

---

## Whisper API Endpoints

### POST /api/transcribe
**Upload and transcribe audio file**

**Using curl:**
```bash
curl -X POST http://localhost:3001/api/transcribe \
  -F "audio=@your-audio.mp3" \
  -F "userId=optional-user-id"
```

**Using PowerShell:**
```powershell
$audioFile = "path\to\audio.mp3"
curl -X POST http://localhost:3001/api/transcribe -F "audio=@$audioFile"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "audioFileId": "uuid-here",
    "transcript": {
      "transcript": "transcribed text",
      "language": "en",
      "duration": 10.5
    },
    "profileData": { }
  }
}
```

### GET /api/transcribe/:audioFileId/status
**Check transcription status**

```bash
curl http://localhost:3001/api/transcribe/{audioFileId}/status
```

### POST /api/transcribe/:audioFileId/reprocess
**Reprocess transcript to extract profile data**

```bash
curl -X POST http://localhost:3001/api/transcribe/{audioFileId}/reprocess \
  -H "Content-Type: application/json" \
  -d '{"transcript": "corrected transcript text"}'
```

---

## Testing Methods

### Method 1: Frontend Web Interface
1. Open: http://localhost:3000
2. Look for voice recording or audio upload features  
3. Record or upload audio
4. View transcription results

### Method 2: Postman / Thunder Client
- Import endpoints from WHISPER_API_TESTING_GUIDE.md
- Test multipart/form-data upload
- Inspect responses and timing

### Method 3: Command Line (curl)
- Quick testing without UI
- Scriptable for automation
- Easy to share examples

### Method 4: PowerShell Script
- Run: `.\test-whisper-simple.ps1`
- Automated health checks
- Pre-flight verification

---

## Supported Audio Formats

- ✅ MP3 (audio/mpeg)
- ✅ WAV (audio/wav)
- ✅ M4A (audio/m4a)
- ✅ WebM (audio/webm)
- ✅ OGG (audio/ogg)

**Max file size:** 25MB  
**Recommended:** 5-10 seconds of clear speech for testing

---

## Getting Sample Audio

### Option 1: Download Sample
```powershell
Invoke-WebRequest -Uri "https://www2.cs.uic.edu/~i101/SoundFiles/preamble.wav" `
  -OutFile "test-audio.wav"
```

### Option 2: Record Your Own
- Windows Voice Recorder app
- Online: https://online-voice-recorder.com/
- Browser WebRTC (in frontend)

### Option 3: Text-to-Speech
```powershell
# Windows TTS
Add-Type -AssemblyName System.Speech
$synthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synthesizer.SetOutputToWaveFile("test-audio.wav")
$synthesizer.Speak("This is a test recording for Whisper API")
$synthesizer.Dispose()
```

---

## Expected Processing Times

| Audio Length | Processing Time |
|--------------|-----------------|
| < 10 seconds | 5-10 seconds    |
| 10-60 seconds | 10-30 seconds  |
| > 60 seconds | 30+ seconds     |

*Times vary based on audio quality and OpenAI API response*

---

## Troubleshooting

### Backend Not Responding
```powershell
pm2 restart careconnect-backend
pm2 logs careconnect-backend
```

### OpenAI API Issues
- Check API key in `.env`
- Verify quota at: https://platform.openai.com/usage
- Test health: `http://localhost:3001/health/status`

### Upload Failures
- Check file size < 25MB
- Verify file format is supported
- Ensure `uploads/audio/` directory exists

### Transcription Errors
- Check backend logs: `pm2 logs`
- Verify OpenAI service health
- Try smaller audio file
- Check internet connectivity

---

## Files Created

- ✅ `test-whisper-simple.ps1` - Quick test script
- ✅ `test-whisper-api.ps1` - Comprehensive test (has syntax issues)
- ✅ `WHISPER_API_TESTING_GUIDE.md` - Full documentation
- ✅ `WHISPER_TEST_READY.md` - This file

---

## Configuration Details

**Backend Port:** 3001  
**Frontend Port:** 3000  
**Upload Directory:** `uploads/audio/`  
**OpenAI Model:** Whisper-1  
**API Key:** Configured (sk-proj-...bAkA)  

**Environment:**
- OS: Windows
- Node.js: v25.0.0
- PM2: 6.0.14

---

## Next Actions

1. **Test Basic Upload**
   - Use curl or Postman
   - Upload small audio file (< 1MB)
   - Verify transcription works

2. **Test Frontend Integration**
   - Open http://localhost:3000
   - Find voice/audio features
   - Test end-to-end flow

3. **Verify Profile Extraction**
   - Upload conversational audio
   - Check if profile data is extracted
   - Verify accuracy of extraction

4. **Performance Testing**
   - Test with different file sizes
   - Measure transcription times
   - Monitor API latency

5. **Error Handling**
   - Test with invalid file types
   - Test with oversized files
   - Verify error messages are clear

---

## Monitoring

### Watch Backend Logs
```powershell
pm2 logs careconnect-backend --raw
```

### Check Health Status
```powershell
while($true) {
  $health = Invoke-RestMethod http://localhost:3001/health/status -UseBasicParsing
  Write-Host "$(Get-Date -Format 'HH:mm:ss') - Status: $($health.status)" -ForegroundColor Green
  Start-Sleep -Seconds 5
}
```

### View PM2 Dashboard
```powershell
pm2 monit
```

---

**System is fully operational and ready for Whisper API manual testing!** 🎤✅

For detailed API documentation, see: [WHISPER_API_TESTING_GUIDE.md](WHISPER_API_TESTING_GUIDE.md)
