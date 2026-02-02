# Recording Error Handling - Quick Reference

## 🎯 What Changed

### Before
- Generic `alert()`: "Unable to access microphone. Please check permissions."
- No retry logic
- No diagnostics
- No operational visibility

### After
- **8+ specific error messages** mapped from DOMException types
- **Automatic retry** for transient errors (microphone busy)
- **Diagnostics panel** with device capability checks
- **Backend error logging** (non-PII) for operational insights
- **Dismissible banners** with accessibility support
- **Disabled button** when recording impossible

---

## 📋 Error Messages

| Browser Error | What User Sees |
|--------------|----------------|
| Permission blocked | "Microphone access is blocked. Please allow microphone access in your browser settings, or ask a staff member for help." |
| No microphone | "No microphone was found. Check that a microphone is connected and enabled." |
| Mic in use by another app | "Your microphone seems to be in use by another app. Close other apps using the microphone and try again." → **AUTO-RETRIES ONCE** |
| Settings mismatch | "This device can't match the requested microphone settings. Try another microphone or device." |
| API unsupported | "Recording is not available: MediaRecorder API not supported" |

---

## 🔧 Key Features

### 1. Self-Healing Retry
- **Triggers for**: AbortError, NotReadableError, TrackStartError
- **Wait time**: 1.5 seconds
- **Retry limit**: 1 attempt
- **User feedback**: "Microphone seems busy. Retrying in a moment..."

### 2. Diagnostics Panel
Access via "Troubleshoot microphone" link

**Checks:**
- ✓ Recording API Support
- ✓ Secure Context (HTTPS)
- ✓ Microphone Detected
- ✓ Permission State

**Provides:**
- Suggested actions (step-by-step guidance)
- "Try Recording Again" button (if fixable)

### 3. Banner System
- **Types**: Error (red), Success (green), Info (blue), Warning (yellow)
- **Dismissible**: Click button or press Escape
- **Auto-dismiss**: Success messages (3 seconds)
- **Accessible**: ARIA role="alert", keyboard navigable

### 4. Backend Logging
**Endpoint**: `POST /api/system/recording-error-log`

**Logs:**
- Error name (e.g., "NotAllowedError")
- Permission state (granted/denied/prompt)
- Has audio input (true/false)
- Truncated user agent (first 3 words)
- Timestamp

**NO PII**: No profile IDs, emails, phones

---

## 🧪 Quick Test Checklist

- [ ] Normal recording works (happy path)
- [ ] Block mic → See "Microphone access is blocked" banner
- [ ] Click "Troubleshoot" → See diagnostics panel
- [ ] Use mic in another app → See retry attempt
- [ ] Press Escape → Banner dismisses
- [ ] Check backend console → See `[RECORDING_ERROR]` log

---

## 📂 Files Modified

| File | Purpose |
|------|---------|
| `v1-frontend/app/tell-your-story/page.tsx` | Recording UI with banners, retry, diagnostics |
| `v1-frontend/src/lib/recordingDiagnostics.ts` | Diagnostics module, error mappings |
| `v1-backend/server.js` | Error logging endpoint |

---

## 🚀 How to Use

### As a Developer
1. Start backend: `cd v1-backend && node server.js`
2. Start frontend: `cd v1-frontend && npm run dev`
3. Navigate to: http://localhost:3000/tell-your-story
4. Test scenarios from `RECORDING_ERROR_HANDLING_TEST_GUIDE.md`

### As a User
1. Click "Press to Record"
2. If error occurs:
   - Read banner message for guidance
   - Click "Troubleshoot microphone" for diagnostics
   - Follow suggested actions
   - Try recording again

---

## 🔒 Security & Privacy

✅ **No PII in logs**
- Backend logs only error metadata
- User agent truncated to first 3 words
- No profile IDs, emails, or phone numbers

✅ **Best-effort logging**
- Never blocks user experience
- Failed logging is silent (user never sees error)

✅ **Secure context required**
- Recording only works on HTTPS or localhost
- Diagnostics check warns if not secure

---

## 🎨 UX Highlights

### Retry Flow
1. User clicks record
2. Mic is busy → Blue info banner: "Microphone seems busy. Retrying in a moment..."
3. Button shows "Retrying..." + spinner
4. Waits 1.5 seconds
5. Retries automatically
6. **Success**: Green banner "Microphone connected!"
7. **Failure**: Red banner with specific error message

### Diagnostics Flow
1. User clicks "Troubleshoot microphone"
2. Panel slides down with 4 checks
3. Each check shows ✓ (green) or ✗ (red)
4. "What you can do:" section lists steps
5. If fixable: "Try Recording Again" button
6. If not fixable: Explanation + staff assistance suggestion

### Banner Behavior
- **Error**: Stays until dismissed
- **Success**: Auto-dismisses after 3 seconds
- **Info**: Stays until dismissed
- **Warning**: Stays until dismissed
- **All**: Keyboard dismissible (Escape key)

---

## 🛠️ Troubleshooting

### "Recording is not available"
**Cause**: Browser doesn't support MediaRecorder API  
**Fix**: Use Chrome, Firefox, or Edge (latest versions)

### Banner says "Microphone access is blocked"
**Cause**: Permission denied  
**Fix**: Click lock icon in address bar → Site settings → Microphone → Allow

### "No microphone was found"
**Cause**: No audio input device detected  
**Fix**: 
- Plug in microphone
- Windows Settings → Privacy & security → Microphone → Enable

### Retry keeps failing
**Cause**: Microphone truly in use by another app  
**Fix**: Close Zoom, Teams, or other apps using microphone

---

## 📊 Success Metrics

✅ **Implementation Complete**
- Diagnostics module: 220 lines
- Recording page: Enhanced with banners, retry, diagnostics
- Backend endpoint: Error logging
- Test guide: 10 scenarios + edge cases

✅ **No Regressions**
- Admin portal: Unchanged
- Donation flow: Unchanged
- Database: Unchanged
- Email/receipts: Unchanged

✅ **Accessibility**
- ARIA compliant
- Keyboard navigable
- Screen reader friendly

---

*Quick Reference v1.0 | Last Updated: January 27, 2025*
