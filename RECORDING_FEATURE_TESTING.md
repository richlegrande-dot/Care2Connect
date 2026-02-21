# Story Recording Feature - Testing Guide

## Overview
The story recording feature allows users to:
1. Record their story via audio
2. Save it with their profile information (name + contact)
3. Search for their story later using name + contact
4. View and playback their recordings

## Backend Setup

### Data Storage
- Uses JSON-based file storage in `v1-backend/data/`
- `profiles.json` - PersonProfile records
- `recordings.json` - StoryRecording records

### API Endpoints

#### Recording Endpoints
```
POST /api/recordings
- Upload audio recording
- Body: multipart/form-data with 'audio' file and 'duration' (optional)
- Returns: { recordingId, audioUrl, duration, status, createdAt }

POST /api/recordings/attach-profile
- Link recording to user profile
- Body: { recordingId, name, email, phone }
- Returns: { profile, recording }

GET /api/recordings/:recordingId
- Get recording details
- Returns: { recording }
```

#### Profile Endpoints
```
GET /api/profiles/search
- Search profiles by name + contact
- Query params: name (required), email OR phone (required)
- Returns: { profiles: [{ id, name, email, phone, createdAt, recordings: [...] }] }

GET /api/profiles/:profileId
- Get profile with recordings
- Returns: { profile }

GET /api/admin/story-stats
- Get statistics
- Returns: { totalProfiles, totalRecordings, recordingsWithProfiles, recordingsWithoutProfiles }
```

## Frontend Pages

### 1. Tell Your Story (`/tell-your-story`)
**Flow:**
1. User clicks red "Press to Record" button
2. Recording interface appears with timer
3. User stops recording
4. Playback interface shows with "Save Recording" button
5. After saving, profile form appears
6. User fills name + (email OR phone)
7. Submits profile → Recording is linked to profile
8. Success message → Redirects to home

**Key Features:**
- MediaRecorder API for audio capture
- Real-time timer display
- Audio playback before saving
- Profile capture form with validation
- Error handling and loading states

### 2. Resume Your Story (`/resume-story`)
**Flow:**
1. User enters name
2. Selects search by email or phone
3. Enters contact information
4. Searches for profile
5. Results show matching profiles with recordings
6. Clicks on recording → Goes to story overview page

**Key Features:**
- Toggle between email/phone search
- Privacy-focused (requires both name + contact)
- Shows all recordings for matched profile
- Formatted dates and durations
- "No results found" with helpful tips

### 3. Story Overview (`/story/[recordingId]`)
**Flow:**
1. Displays recording details
2. Audio player with play/pause controls
3. Shows metadata (status, dates, ID)
4. Download link for audio file
5. Future features placeholder

**Key Features:**
- Custom audio player UI
- Download capability
- Recording metadata display
- Transcript section (when available)
- "Coming Soon" features preview

### 4. Homepage Updates
**Added:**
- "Already Started Your Story?" section
- Link to `/resume-story` page
- Instructions for searching

## End-to-End Testing Checklist

### Test 1: Complete Recording Flow
- [ ] Navigate to http://localhost:3000
- [ ] Click "Press to Tell Your Story" button
- [ ] Click red recording button
- [ ] Allow microphone access
- [ ] Speak for 10-15 seconds
- [ ] Click to stop recording
- [ ] Verify audio plays back correctly
- [ ] Click "Save Recording"
- [ ] Verify profile form appears
- [ ] Fill in name: "Test User"
- [ ] Fill in email: "test@example.com"
- [ ] Click "Complete & Save My Story"
- [ ] Verify success message
- [ ] Check that recording is saved

**Expected Results:**
- Recording captured as .webm file
- Audio URL: http://localhost:3001/audio/[timestamp].webm
- Profile created in `v1-backend/data/profiles.json`
- Recording created in `v1-backend/data/recordings.json`
- Recording linked to profile (personId field populated)

### Test 2: Search and Resume
- [ ] Navigate to http://localhost:3000
- [ ] Click "Find My Story" in the yellow card
- [ ] Enter name: "Test User"
- [ ] Select "Email" search
- [ ] Enter email: "test@example.com"
- [ ] Click "Search for My Story"
- [ ] Verify profile appears in results
- [ ] Verify recording is listed under profile
- [ ] Click on recording
- [ ] Verify story overview page loads

**Expected Results:**
- Search returns matching profile
- Profile shows correct name and creation date
- Recording listed with correct timestamp
- Story overview page displays recording details
- Audio player works correctly

### Test 3: Multiple Recordings
- [ ] Create a first recording with "John Doe" + "john@example.com"
- [ ] Create a second recording with same name and email
- [ ] Search for "John Doe" + "john@example.com"
- [ ] Verify both recordings appear under the same profile

**Expected Results:**
- Profile reused (not duplicated)
- Both recordings appear in search results
- Recordings sorted by creation date (newest first)

### Test 4: Profile Uniqueness
- [ ] Create recording with "Jane Smith" + "jane@example.com"
- [ ] Create recording with "Jane Smith" + "555-1234"
- [ ] Search for "Jane Smith" + "jane@example.com"
- [ ] Search for "Jane Smith" + "555-1234"

**Expected Results:**
- Two separate profiles created
- Each search returns only the matching profile
- No cross-contamination of recordings

### Test 5: Privacy Validation
- [ ] Try searching with only name (no contact)
- [ ] Try searching with only email (no name)
- [ ] Verify error messages appear

**Expected Results:**
- Backend returns 400 error
- Frontend shows validation error
- No data leakage

### Test 6: Edge Cases
- [ ] Record very short audio (2 seconds)
- [ ] Record longer audio (2 minutes)
- [ ] Submit profile with only phone (no email)
- [ ] Submit profile with only email (no phone)
- [ ] Try to save recording without profile form
- [ ] Enter special characters in name
- [ ] Enter invalid email format

**Expected Results:**
- All recordings save successfully
- Profile form validates correctly
- Special characters handled properly
- Invalid emails rejected with error message

## Data Files

### Check Data Storage
After tests, verify files exist:
```
v1-backend/data/profiles.json
v1-backend/data/recordings.json
v1-backend/uploads/audio/[timestamp].webm
```

### Sample Profile Record
```json
{
  "id": "uuid-v4",
  "name": "Test User",
  "email": "test@example.com",
  "phone": null,
  "createdAt": "2025-12-05T...",
  "updatedAt": "2025-12-05T..."
}
```

### Sample Recording Record
```json
{
  "id": "uuid-v4",
  "personId": "uuid-v4-from-profile",
  "audioUrl": "http://localhost:3001/audio/1733426789123.webm",
  "storagePath": "http://localhost:3001/audio/1733426789123.webm",
  "duration": 15,
  "transcript": null,
  "status": "new",
  "createdAt": "2025-12-05T...",
  "updatedAt": "2025-12-05T..."
}
```

## Admin Statistics

Check stats endpoint:
```
GET http://localhost:3001/api/admin/story-stats
```

Expected response:
```json
{
  "success": true,
  "stats": {
    "totalProfiles": 3,
    "totalRecordings": 5,
    "recordingsWithProfiles": 5,
    "recordingsWithoutProfiles": 0
  }
}
```

## Known Limitations (V1)

1. **No Authentication**: Anyone can search any profile with correct name + contact
2. **No Transcription**: Audio not automatically transcribed (coming in V2)
3. **No Data Extraction**: No AI-powered profile extraction (coming in V2)
4. **No Chatbot**: No conversational AI interface (coming in V2)
5. **JSON Storage**: Simple file-based storage (migrate to database in production)
6. **No Edit/Delete**: Users cannot edit or delete recordings (add in future)
7. **No Email/Phone Verification**: Contact info not verified (add in production)

## Troubleshooting

### Backend Not Starting
```bash
cd v1-backend
npm install
node server.js
```

### Frontend Not Starting
```bash
cd v1-frontend
npm install
npm run dev
```

### Audio Not Recording
- Check browser microphone permissions
- Try Chrome/Edge (best MediaRecorder support)
- Check browser console for errors

### Search Not Finding Profile
- Verify exact name match (case-insensitive)
- Verify exact email/phone match
- Check that profile form was submitted after recording
- Inspect `v1-backend/data/profiles.json`

### Audio Not Playing
- Check that file exists in `v1-backend/uploads/audio/`
- Verify URL is accessible: http://localhost:3001/audio/[filename].webm
- Check browser console for CORS errors

## Next Steps (Future Enhancements)

1. **Transcription Integration**
   - Add Whisper API or similar
   - Store transcript in recording record
   - Display in story overview

2. **Data Extraction**
   - Use OpenAI/Claude to extract structured data
   - Parse name, age, needs, goals
   - Generate donation pitch

3. **Chatbot Interface**
   - Add conversational AI
   - Attach to profile + recording context
   - Help refine needs and goals

4. **Database Migration**
   - Migrate from JSON to PostgreSQL/Supabase
   - Use Prisma schema from `backend/` folder
   - Add indexes for search performance

5. **Authentication**
   - Add user accounts
   - Email/SMS verification
   - Secure profile access

6. **Edit/Delete Features**
   - Allow users to edit profile info
   - Allow recording deletion
   - Add recording notes/tags

## Success Criteria

✅ **Recording Flow Complete**
- Audio captured and saved
- Profile attached to recording
- User can find recording later

✅ **Search Flow Complete**
- Privacy-preserving search
- Multiple recordings per profile
- Profile uniqueness maintained

✅ **Data Integrity**
- No duplicate profiles for same identity
- All recordings linked to profiles
- JSON files properly formatted

✅ **User Experience**
- Accessible UI following government standards
- Clear error messages
- Loading states and feedback
- Mobile-responsive design

## Test Coverage

- ✅ Record → Save → Profile → Search → View
- ✅ Multiple recordings per profile
- ✅ Profile uniqueness rules
- ✅ Privacy validation
- ✅ Edge cases and error handling
- ✅ Audio playback and download
- ✅ Data persistence

## Production Checklist (When Ready)

- [ ] Migrate JSON storage to database
- [ ] Add user authentication
- [ ] Implement email/phone verification
- [ ] Add HTTPS for production domain
- [ ] Configure CORS for production URLs
- [ ] Add rate limiting to prevent abuse
- [ ] Implement data retention policy
- [ ] Add backup/restore procedures
- [ ] Set up monitoring and alerts
- [ ] Add analytics and usage tracking
- [ ] Implement GDPR compliance features
- [ ] Add content moderation for recordings
- [ ] Set up CDN for audio file delivery
- [ ] Add file size limits and validation
