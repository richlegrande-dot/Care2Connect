# Whisper API Testing Guide

## Quick Start

### System Status
✅ Backend: Running on http://localhost:3001  
✅ Frontend: Running on http://localhost:3000  
✅ OpenAI API: Configured and healthy  
✅ Whisper endpoint: Available at `/api/transcribe`

---

## API Endpoints

### 1. Transcribe Audio
**POST** `/api/transcribe`

**Headers:**
```
Content-Type: multipart/form-data
```

**Body (Form Data):**
- `audio`: Audio file (MP3, WAV, M4A, WebM, OGG - max 25MB)
- `userId`: (optional) User ID string

**Response:**
```json
{
  "success": true,
  "data": {
    "audioFileId": "uuid",
    "transcript": {
      "transcript": "transcribed text...",
      "language": "en",
      "duration": 10.5
    },
    "profileData": {
      // Extracted profile information
    }
  }
}
```

---

### 2. Get Transcription Status
**GET** `/api/transcribe/:audioFileId/status`

**Response:**
```json
{
  "id": "uuid",
  "filename": "audio-file.mp3",
  "transcribed": true,
  "processed": true,
  "transcript": "transcribed text...",
  "createdAt": "2026-01-05T..."
}
```

---

### 3. Reprocess Transcript
**POST** `/api/transcribe/:audioFileId/reprocess`

**Body:**
```json
{
  "transcript": "corrected transcript text..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profileData": {
      // Re-extracted profile information
    }
  }
}
```

---

## Testing Methods

### Method 1: PowerShell Test Script
```powershell
# Run automated tests
.\test-whisper-api.ps1

# Test with specific audio file
.\test-whisper-api.ps1 -AudioFile "path\to\audio.mp3"

# Verbose output
.\test-whisper-api.ps1 -AudioFile "audio.mp3" -Verbose
```

---

### Method 2: cURL (PowerShell)
```powershell
# Upload and transcribe
curl -X POST http://localhost:3001/api/transcribe `
  -F "audio=@test-audio.mp3" `
  -F "userId=test-user-123"

# Check status
curl http://localhost:3001/api/transcribe/{audioFileId}/status
```

---

### Method 3: Frontend Web Interface
1. Open: http://localhost:3000
2. Navigate to voice input or recording feature
3. Upload or record audio
4. View transcription results

---

### Method 4: Postman / Thunder Client
**Import this collection:**

```json
{
  "name": "Whisper API Tests",
  "requests": [
    {
      "name": "Transcribe Audio",
      "method": "POST",
      "url": "http://localhost:3001/api/transcribe",
      "body": {
        "type": "formdata",
        "formdata": [
          {
            "key": "audio",
            "type": "file",
            "src": "path/to/audio.mp3"
          }
        ]
      }
    },
    {
      "name": "Get Status",
      "method": "GET",
      "url": "http://localhost:3001/api/transcribe/{{audioFileId}}/status"
    }
  ]
}
```

---

## Sample Audio Files

### Get Sample Audio:
```powershell
# Download sample audio file
Invoke-WebRequest -Uri "https://www2.cs.uic.edu/~i101/SoundFiles/preamble.wav" `
  -OutFile "test-audio.wav"
```

### Record Your Own:
1. **Windows Voice Recorder**: Record → Save as MP3/M4A
2. **Online Tool**: https://online-voice-recorder.com/
3. **Browser**: Use WebRTC recording in frontend

---

## Expected Behavior

### Supported Audio Formats:
- MP3 (audio/mpeg)
- WAV (audio/wav)
- M4A (audio/m4a)
- WebM (audio/webm)
- OGG (audio/ogg)

### File Size Limit:
- Maximum: 25MB per file

### Processing Time:
- Short clips (<10s): 5-10 seconds
- Medium clips (10-60s): 10-30 seconds  
- Long clips (>60s): 30+ seconds

### Language Support:
- OpenAI Whisper supports 90+ languages
- Auto-detection enabled
- English optimized

---

## Health Checks

### Verify System Ready:
```powershell
# Check backend health
Invoke-WebRequest http://localhost:3001/health/status -UseBasicParsing

# Check OpenAI specifically
curl http://localhost:3001/health/status | jq '.services.openai'

# Check speech service
curl http://localhost:3001/health/status | jq '.services.speech'
```

### Expected Healthy Response:
```json
{
  "status": "healthy",
  "services": {
    "openai": {
      "healthy": true,
      "lastChecked": "2026-01-05T...",
      "latency": 500
    },
    "speech": {
      "healthy": true,
      "lastChecked": "2026-01-05T...",
      "latency": 0
    }
  }
}
```

---

## Troubleshooting

### Issue: "OpenAI API not healthy"
**Fix:**
1. Check `.env` file has `OPENAI_API_KEY`
2. Verify API key is valid: https://platform.openai.com/api-keys
3. Restart backend: `pm2 restart careconnect-backend`

### Issue: "No audio file uploaded"
**Fix:**
- Ensure `Content-Type: multipart/form-data`
- Use form field name `audio`
- File must be <25MB
- Check file format is supported

### Issue: "Transcription timeout"
**Fix:**
- Large files take longer
- Check OpenAI API quota/limits
- Verify internet connection
- Try smaller audio file first

### Issue: "Audio file not found"
**Fix:**
- Ensure uploads/audio directory exists
- Check file permissions
- Verify backend storage configuration

---

## Quick Test Commands

```powershell
# 1. Check system health
.\test-whisper-api.ps1

# 2. Download sample and test
Invoke-WebRequest -Uri "https://www2.cs.uic.edu/~i101/SoundFiles/preamble.wav" -OutFile "test.wav"
.\test-whisper-api.ps1 -AudioFile "test.wav"

# 3. Check PM2 status
pm2 status
pm2 logs careconnect-backend --lines 20

# 4. View backend logs
pm2 logs careconnect-backend
```

---

## Manual Testing Checklist

- [ ] Backend health check passes
- [ ] OpenAI service is healthy
- [ ] Can upload small audio file (<1MB)
- [ ] Transcription completes successfully
- [ ] Transcript text is accurate
- [ ] Can retrieve transcription status
- [ ] Can upload larger file (5-10MB)
- [ ] Error handling works (invalid file, wrong format)
- [ ] Frontend integration works
- [ ] Profile data extraction works

---

## Environment Info

**Backend URL:** http://localhost:3001  
**Frontend URL:** http://localhost:3000  
**Upload Directory:** `uploads/audio/`  
**Max File Size:** 25MB  
**Timeout:** 60 seconds

**API Key Status:**
- OpenAI: ✅ Configured (sk-proj-...bAkA)

---

## Next Steps

1. **Run the test script**: `.\test-whisper-api.ps1`
2. **Open frontend**: http://localhost:3000
3. **Check backend logs**: `pm2 logs careconnect-backend`
4. **Monitor health**: http://localhost:3001/health/status

**For issues, check:**
- Backend logs: `pm2 logs`
- Browser console (F12)
- Network tab for API calls
