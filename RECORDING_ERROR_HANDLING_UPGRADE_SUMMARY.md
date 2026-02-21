# Recording Pipeline Error Handling Upgrade - Summary

## Overview
Upgraded the recording pipeline from generic alert() errors to a comprehensive error handling system with diagnostics, self-healing retry logic, and user-friendly guidance.

## Changes Implemented

### 1. Frontend: Recording Page (`v1-frontend/app/tell-your-story/page.tsx`)

#### New State Management
- `banner`: Display error/success/info/warning messages (dismissible)
- `isRetrying`: Track retry attempt in progress
- `showTroubleshooting`: Control diagnostics panel visibility
- `diagnostics`: Store device capability check results
- `recordingDisabled`: Disable button when recording impossible
- `retryCountRef`: Limit retries to 1 attempt

#### New UI Components

**Banner System**
- Role: `alert` with `aria-live="polite"` for accessibility
- Types: error (red), success (green), warning (yellow), info (blue)
- Dismissible via button click or Escape key
- Auto-dismiss for success messages (3 seconds)

**Enhanced Record Button**
- Shows "Retrying..." during retry attempt
- Disabled when `recordingDisabled === true`
- Opacity reduced when disabled (50%)
- Cursor changes to not-allowed when disabled

**Troubleshooting Panel**
- Triggered by "Troubleshoot microphone" link
- Shows 4 diagnostic checks:
  - Recording API Support (getUserMedia, MediaRecorder)
  - Secure Context (HTTPS/localhost)
  - Microphone Detected (enumerateDevices)
  - Permission State (granted/denied/prompt)
- Displays suggested actions from diagnostics
- "Try Recording Again" button if canRecord === true
- Closeable via button or manual dismissal

**Retry Indicator**
- Spinner animation during retry
- "Preparing microphone..." text
- Visible when `isRetrying === true`

#### Enhanced Recording Logic

**getUserMedia Error Handling**
```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  // ... recording setup
} catch (error) {
  const errorMessage = getRecordingErrorMessage(error)
  
  // Log to backend (non-blocking)
  logRecordingError(error.name, permissionState, hasAudio)
  
  // Check for transient errors
  if (isTransientError(error) && retryCount === 0) {
    // Show retry message
    setBanner({ type: 'info', message: 'Retrying...', visible: true })
    setIsRetrying(true)
    
    // Wait 1.5 seconds
    await delay(1500)
    
    // Retry once
    try {
      const retryStream = await navigator.mediaDevices.getUserMedia(...)
      // Success! Continue recording
    } catch (retryError) {
      // Retry failed, show error
      setBanner({ type: 'error', message: getRecordingErrorMessage(retryError), visible: true })
    }
  } else {
    // Not transient or already retried
    setBanner({ type: 'error', message: errorMessage, visible: true })
  }
}
```

**Initial Diagnostics Check**
```typescript
useEffect(() => {
  const checkCapabilities = async () => {
    const results = await runRecordingDiagnostics()
    setDiagnostics(results)
    if (!results.canRecord) {
      setRecordingDisabled(true)
      setBanner({ type: 'warning', message: results.errorDetails, visible: true })
    }
  }
  checkCapabilities()
}, [])
```

---

### 2. Diagnostics Module (`v1-frontend/src/lib/recordingDiagnostics.ts`)

#### Interfaces
```typescript
interface DiagnosticResult {
  hasApi: boolean;              // getUserMedia + MediaRecorder support
  hasSecureContext: boolean;     // HTTPS or localhost
  hasAudioInput: boolean;        // Audio device detected
  permissionState: 'granted' | 'denied' | 'prompt' | 'unknown';
  suggestedActions: string[];    // User-friendly guidance
  canRecord: boolean;            // Overall recording capability
  errorDetails?: string;         // Human-readable explanation
}
```

#### Key Functions

**`runRecordingDiagnostics()`**
- Checks all recording prerequisites
- Returns comprehensive DiagnosticResult
- Provides actionable guidance in `suggestedActions` array
- Example suggested actions:
  - "Click 'Allow' when your browser asks for microphone access"
  - "Check Windows Settings → Privacy & security → Microphone"
  - "Make sure a microphone is plugged in and enabled"

**`getRecordingErrorMessage(error)`**
- Maps DOMException error names to user-friendly messages
- Covers 8+ error types:
  - NotAllowedError → "Microphone access is blocked..."
  - NotFoundError → "No microphone was found..."
  - NotReadableError → "Your microphone seems to be in use..."
  - OverconstrainedError → "This device can't match the requested microphone settings..."
  - TypeError → "Recording setup failed. Please refresh the page..."
  - Default → "We couldn't start the microphone. Please try again..."

**`isTransientError(error)`**
- Returns true for errors worth retrying:
  - AbortError
  - NotReadableError
  - TrackStartError
- Returns false for permanent errors (NotAllowedError, NotFoundError, etc.)

**`logRecordingError(errorName, permissionState, hasAudioInput)`**
- Sends non-PII error data to backend
- Best-effort (never blocks user experience)
- Truncates user agent to first 3 words
- Data sent:
  - errorName: DOMException.name
  - permissionState: 'granted' | 'denied' | 'prompt' | 'unknown'
  - hasAudioInput: boolean
  - userAgent: truncated string
  - timestamp: ISO 8601 string

**`checkMicrophonePermission()`**
- Uses Permissions API if available
- Returns 'granted', 'denied', 'prompt', or 'unknown'
- Graceful fallback for Safari (no Permissions API)

**`hasAudioInputDevice()`**
- Calls enumerateDevices()
- Filters for `kind === 'audioinput'`
- Returns boolean

**`hasMediaRecordingSupport()`**
- Checks for navigator.mediaDevices.getUserMedia
- Checks for MediaRecorder API
- Returns boolean

**`isSecureContext()`**
- Checks window.isSecureContext
- Checks for HTTPS protocol
- Checks for localhost hostname
- Returns boolean

---

### 3. Backend: Error Logging Endpoint (`v1-backend/server.js`)

#### New Endpoint: `POST /api/system/recording-error-log`

**Request Body**
```json
{
  "errorName": "NotAllowedError",
  "permissionState": "denied",
  "hasAudioInput": true,
  "userAgent": "Mozilla/5.0 Windows",
  "timestamp": "2025-01-27T12:34:56.789Z"
}
```

**Response**
```json
{
  "success": true
}
```

**Behavior**
- Logs to console for operational visibility
- Format: `[RECORDING_ERROR] { errorName, permissionState, ... }`
- Never blocks user experience (always returns 200)
- Silently fails if logging fails
- Can be extended to store in database for analytics
- **No PII logged**: No profile IDs, emails, phones, or full user agents

**Example Console Output**
```
[RECORDING_ERROR] {
  errorName: 'NotAllowedError',
  permissionState: 'denied',
  hasAudioInput: true,
  userAgentSnippet: 'Mozilla/5.0 Windows',
  timestamp: '2025-01-27T12:34:56.789Z'
}
```

---

## User Experience Flow

### Scenario 1: Normal Recording (Happy Path)
1. User clicks "Press to Record"
2. Browser prompts for permission
3. User clicks "Allow"
4. **Green banner**: "Microphone connected!" (auto-dismisses in 3s)
5. Recording starts
6. User clicks stop
7. Audio playback appears

### Scenario 2: Blocked Permission
1. User clicks "Press to Record"
2. Permission denied
3. **Red banner**: "Microphone access is blocked. Please allow microphone access in your browser settings, or ask a staff member for help."
4. User clicks "Troubleshoot microphone"
5. **Diagnostics panel** shows:
   - Permission: denied ⚠
   - Suggested actions: "Click the lock icon in your browser's address bar..."
6. User fixes permission
7. Clicks "Try Recording Again"
8. Recording starts

### Scenario 3: Microphone In Use (Transient Error)
1. User clicks "Press to Record"
2. Microphone is busy (Zoom, Teams, etc.)
3. **Blue banner**: "Microphone seems busy. Retrying in a moment..."
4. **Button shows**: "Retrying..."
5. **Spinner appears**: "Preparing microphone..."
6. After 1.5 seconds, retries
7. **If successful**: Green banner, recording starts
8. **If still busy**: Red banner with NotReadableError message, no second retry

### Scenario 4: No Microphone Connected
1. User clicks "Press to Record"
2. **Red banner**: "No microphone was found. Check that a microphone is connected and enabled."
3. No retry (not a transient error)
4. User clicks "Troubleshoot microphone"
5. **Diagnostics panel** shows:
   - Microphone Detected: ✗
   - Suggested actions: "Check that a microphone is plugged in..."

### Scenario 5: Unsupported Browser
1. Page loads
2. **Diagnostics check runs** on mount
3. MediaRecorder not supported
4. **Yellow banner**: "Recording is not available: MediaRecorder API not supported"
5. **Record button disabled** (grayed out)
6. User clicks "Troubleshoot microphone"
7. **Diagnostics panel** shows:
   - Recording API Support: ✗
   - Suggested actions: "Try updating your browser or using Chrome/Firefox..."

---

## Error Message Mapping Table

| DOMException Error | Transient? | User Message | Retry? |
|-------------------|-----------|--------------|--------|
| NotAllowedError | No | "Microphone access is blocked. Please allow microphone access in your browser settings, or ask a staff member for help." | No |
| PermissionDeniedError | No | Same as NotAllowedError | No |
| SecurityError | No | Same as NotAllowedError | No |
| NotFoundError | No | "No microphone was found. Check that a microphone is connected and enabled." | No |
| DevicesNotFoundError | No | Same as NotFoundError | No |
| NotReadableError | **Yes** | "Your microphone seems to be in use by another app. Close other apps using the microphone and try again." | **Yes (once)** |
| TrackStartError | **Yes** | Same as NotReadableError | **Yes (once)** |
| AbortError | **Yes** | Same as NotReadableError | **Yes (once)** |
| OverconstrainedError | No | "This device can't match the requested microphone settings. Try another microphone or device." | No |
| ConstraintNotSatisfiedError | No | Same as OverconstrainedError | No |
| TypeError | No | "Recording setup failed. Please refresh the page and try again." | No |
| (any other) | No | "We couldn't start the microphone. Please try again or ask a staff member for help." | No |

---

## Technical Implementation Details

### Retry Logic
- **Retry limit**: 1 attempt per error
- **Retry delay**: 1500ms (1.5 seconds)
- **Retry counter**: `retryCountRef.current` (ref, not state)
- **Reset**: Counter resets to 0 on successful recording start
- **User feedback**: "Retrying..." on button, info banner, spinner

### State Management
- `banner.visible`: Controls banner display
- `banner.type`: Controls styling (error/success/info/warning)
- `banner.message`: User-friendly error message
- `isRetrying`: Disables button during retry
- `recordingDisabled`: Disables button when recording impossible
- `showTroubleshooting`: Shows/hides diagnostics panel
- `diagnostics`: Stores latest diagnostic results

### Performance
- Diagnostics run once on mount (non-blocking)
- Backend logging is async, non-blocking
- Failed logging never shows error to user
- Retry delay (1.5s) feels natural, not too long

### Accessibility
- Banner: `role="alert"`, `aria-live="polite"`
- Button: `aria-label`, `disabled` attribute (not just aria-disabled)
- Keyboard navigation: Escape dismisses banner
- Focus management: Banner is focusable, dismissible

---

## Files Modified

### Created
1. `v1-frontend/src/lib/recordingDiagnostics.ts` (220 lines)
   - Comprehensive diagnostics module
   - Error message mappings
   - Transient error detection
   - Backend logging function

2. `RECORDING_ERROR_HANDLING_TEST_GUIDE.md` (270 lines)
   - 10 test scenarios
   - Edge cases
   - Browser compatibility checklist
   - Accessibility verification

3. `RECORDING_ERROR_HANDLING_UPGRADE_SUMMARY.md` (this file)
   - Implementation details
   - User experience flows
   - Error mapping table

### Modified
1. `v1-frontend/app/tell-your-story/page.tsx`
   - Added banner UI component
   - Enhanced startRecording() with retry logic
   - Added diagnostics check on mount
   - Added troubleshooting panel
   - Added state management for banner, diagnostics, retry

2. `v1-backend/server.js`
   - Added `POST /api/system/recording-error-log` endpoint
   - Non-PII error logging to console
   - Best-effort, never blocks user experience

---

## Constraints Followed

✅ **No modifications** to:
- Donation flow
- Stripe integration
- Receipt system
- Email functionality
- Admin story browser

✅ **No PII in error logs**:
- No profile IDs
- No email addresses
- No phone numbers
- No full user agent strings

✅ **Accessibility requirements**:
- ARIA roles on banners
- Keyboard dismissal (Escape key)
- Disabled states on buttons
- Screen reader friendly

✅ **Self-healing behavior**:
- Automatic retry for transient errors
- User guidance for permanent errors
- Diagnostics to identify issues

---

## Next Steps (Optional Enhancements)

### Database Storage for Error Analytics
Add a `RecordingError` table to track errors over time:
```prisma
model RecordingError {
  id              String   @id @default(cuid())
  errorName       String
  permissionState String
  hasAudioInput   Boolean
  userAgent       String
  timestamp       DateTime
  createdAt       DateTime @default(now())
}
```

### Rate Limiting for Error Logging
Prevent log spam if user retries many times:
- Limit to 5 error logs per IP per minute
- Use existing rate limiter middleware

### Admin Dashboard for Error Visibility
Create admin page showing:
- Error frequency by type
- Most common errors
- Device/browser breakdown

### Browser-Specific Guidance
Detect browser from user agent and show specific instructions:
- Chrome: "Click lock icon → Site settings → Microphone → Allow"
- Firefox: "Click shield icon → Permissions → Microphone → Allow"
- Safari: "Safari menu → Settings for This Website → Microphone → Allow"

---

## Testing Summary

See `RECORDING_ERROR_HANDLING_TEST_GUIDE.md` for full test plan.

**Critical Tests**:
1. Normal recording (happy path)
2. Blocked microphone permission (NotAllowedError)
3. No microphone connected (NotFoundError)
4. Microphone in use (NotReadableError + retry)
5. Diagnostics panel display and accuracy
6. Recording disabled on unsupported browser
7. Banner keyboard dismissal (Escape)
8. Backend error logging (verify non-PII)
9. Retry counter limit (only 1 retry)
10. Success banner auto-dismiss

**Browser Compatibility**:
- Chrome/Edge (Chromium)
- Firefox
- Safari (macOS/iOS)
- Mobile Chrome (Android)
- Mobile Safari (iOS)

---

## Success Metrics

✅ **User Experience**:
- No more generic "Unable to access microphone" alerts
- Clear, actionable error messages
- Automatic retry for transient issues
- Troubleshooting guidance built-in

✅ **Operational Visibility**:
- Backend logs all recording errors
- Error data includes context (permission state, device presence)
- No PII logged, privacy-safe

✅ **Accessibility**:
- ARIA compliant
- Keyboard navigable
- Screen reader friendly

✅ **Performance**:
- Non-blocking diagnostics
- Best-effort logging
- Fast retry (1.5s delay)

✅ **Maintainability**:
- Clean separation of concerns (diagnostics module)
- Well-documented error mappings
- Comprehensive test guide

---

## Rollback Instructions

If issues arise, revert these commits:

1. `v1-frontend/app/tell-your-story/page.tsx`
2. `v1-frontend/src/lib/recordingDiagnostics.ts`
3. `v1-backend/server.js` (remove error logging endpoint)

No database changes, no impact on other features.

---

## Documentation References

- Error Message Mapping: See "Error Message Mapping Table" above
- Test Scenarios: See `RECORDING_ERROR_HANDLING_TEST_GUIDE.md`
- User Flows: See "User Experience Flow" above
- Accessibility: See "Accessibility Checklist" in test guide

---

*Last Updated: January 27, 2025*  
*Status: Implementation Complete, Ready for Testing*
