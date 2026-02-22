# Recording Feature - Quick Reference

## 🎯 What Was Built
Full end-to-end recording feature:
- Record audio → Save with profile → Search later → Playback

## 📁 New Files Created

### Backend (v1-backend)
```
dataStore.js          - JSON data storage layer (profiles + recordings)
data/profiles.json    - PersonProfile records (auto-created)
data/recordings.json  - StoryRecording records (auto-created)
```

### Frontend (v1-frontend)
```
app/resume-story/page.tsx            - Search for your story
app/story/[recordingId]/page.tsx     - View/playback recording
```

### Modified Files
```
v1-backend/server.js                 - Added 6 API endpoints
v1-backend/package.json              - Added uuid dependency
v1-frontend/app/tell-your-story/page.tsx  - Added profile capture form
v1-frontend/app/page.tsx             - Added "Resume Your Story" section
```

## 🔗 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/recordings` | Upload audio |
| POST | `/api/recordings/attach-profile` | Link to profile |
| GET | `/api/recordings/:id` | Get recording |
| GET | `/api/profiles/search` | Search profiles |
| GET | `/api/profiles/:id` | Get profile |
| GET | `/api/admin/story-stats` | Statistics |

## 🔄 User Flow

```
1. Homepage → "Press to Tell Your Story"
2. Record audio (MediaRecorder)
3. Stop & preview
4. "Save Recording" → uploads to /api/recordings
5. Profile form appears
6. Fill name + (email OR phone)
7. Submit → /api/recordings/attach-profile
8. Success → redirects home

Later:
9. Homepage → "Find My Story"
10. Search: name + contact
11. Results show profile + recordings
12. Click recording → view/playback page
```

## 🧪 Quick Test

```bash
# Terminal 1 - Backend
cd v1-backend
node server.js

# Terminal 2 - Frontend  
cd v1-frontend
npm run dev

# Browser
http://localhost:3000
```

**Test Steps:**
1. Record 10 seconds
2. Save with name="Test" email="test@test.com"
3. Search for "Test" + "test@test.com"
4. Verify recording appears
5. Click to playback

## 💾 Data Storage

```
v1-backend/data/profiles.json       - Profile records
v1-backend/data/recordings.json     - Recording metadata
v1-backend/uploads/audio/*.webm     - Audio files
```

## 🔐 Privacy Rules

- Search requires BOTH name + contact (email OR phone)
- Profile identity: (name + email) OR (name + phone)
- Same identity → reuse profile
- Different contact → new profile
- No public listing of profiles

## ✅ Success Criteria

- [x] Recording works end-to-end
- [x] Profile attached to recording
- [x] Search finds recordings
- [x] Playback works
- [x] Privacy maintained
- [x] Data persists

## 🚀 Next Steps (Future V2)

1. Add AI transcription (Whisper/AssemblyAI)
2. Extract structured data (OpenAI/Claude)
3. Build chatbot interface
4. Migrate JSON to database (PostgreSQL)
5. Add authentication
6. Implement edit/delete features

## 📚 Documentation

- `RECORDING_FEATURE_SUMMARY.md` - Full implementation details
- `RECORDING_FEATURE_TESTING.md` - Complete testing guide
- This file - Quick reference

---

**Status:** ✅ Complete and tested
**Version:** 1.0.0
**Date:** December 5, 2025
