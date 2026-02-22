# Recording Error Handling - Test Guide

## Overview
This guide covers testing the new recording error handling system with diagnostics, self-healing retry logic, and user-friendly error messages.

## System Components

### Frontend Changes
- **File**: `v1-frontend/app/tell-your-story/page.tsx`
- **New Features**:
  - Banner system for error/success/info messages (dismissible, ARIA-compliant)
  - Automatic retry logic for transient errors (AbortError, NotReadableError, TrackStartError)
  - Diagnostics panel showing device capabilities
  - Disabled button state when recording impossible
  - "Troubleshoot microphone" button
  - Backend error logging (non-PII)

### Diagnostics Module
- **File**: `v1-frontend/src/lib/recordingDiagnostics.ts`
- **Functions**:
  - `runRecordingDiagnostics()` - Comprehensive capability check
  - `getRecordingErrorMessage()` - Maps DOMException names to user-friendly messages
  - `isTransientError()` - Identifies errors worth retrying
  - `logRecordingError()` - Sends non-PII error data to backend
  - `checkMicrophonePermission()` - Uses Permissions API
  - `hasAudioInputDevice()` - Enumerates audio devices

### Backend Changes
- **File**: `v1-backend/server.js`
- **New Endpoint**: `POST /api/system/recording-error-log`
  - Logs non-PII error data to console
  - Best-effort (never blocks user experience)
  - Data logged: errorName, permissionState, hasAudioInput, truncated userAgent

## Error Message Mappings

| DOMException Error | User-Friendly Message |
|--------------------|----------------------|
| NotAllowedError | "Microphone access is blocked. Please allow microphone access in your browser settings..." |
| PermissionDeniedError | Same as NotAllowedError |
| SecurityError | Same as NotAllowedError |
| NotFoundError | "No microphone was found. Check that a microphone is connected and enabled." |
| DevicesNotFoundError | Same as NotFoundError |
| NotReadableError | "Your microphone seems to be in use by another app. Close other apps using the microphone and try again." |
| TrackStartError | Same as NotReadableError |
| AbortError | Same as NotReadableError |
| OverconstrainedError | "This device can't match the requested microphone settings. Try another microphone or device." |
| ConstraintNotSatisfiedError | Same as OverconstrainedError |
| TypeError | "Recording setup failed. Please refresh the page and try again." |
| Default | "We couldn't start the microphone. Please try again or ask a staff member for help." |

## Test Scenarios

### Test 1: Normal Recording Flow (Happy Path)
**Goal**: Verify recording works without errors

1. Navigate to http://localhost:3000/tell-your-story
2. Click "Press to Record" button
3. **Expected**:
   - Green success banner: "Microphone connected!"
   - Banner auto-dismisses after 3 seconds
   - Recording interface shows "Recording in Progress"
   - Timer increments
4. Click stop button
5. **Expected**:
   - Audio playback appears
   - "Recording Complete!" message shown

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 2: Blocked Microphone Permission
**Goal**: Verify NotAllowedError handling

1. Block microphone in browser settings:
   - Chrome: Click lock icon in address bar → Site settings → Microphone → Block
   - Firefox: Click shield icon → Permissions → Microphone → Block
   - Edge: Same as Chrome
2. Navigate to http://localhost:3000/tell-your-story
3. Click "Press to Record"
4. **Expected**:
   - Red error banner: "Microphone access is blocked. Please allow microphone access in your browser settings, or ask a staff member for help."
   - Banner is dismissible (click Dismiss or press Escape)
   - Record button NOT disabled (user can retry after fixing)
   - Backend console shows: `[RECORDING_ERROR] { errorName: 'NotAllowedError', permissionState: 'denied', ... }`

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 3: No Microphone Connected
**Goal**: Verify NotFoundError handling

1. Disable all microphones in Windows:
   - Windows Settings → Privacy & security → Microphone → Turn off "Let apps access your microphone"
   - OR physically unplug USB microphone
2. Navigate to http://localhost:3000/tell-your-story
3. Click "Press to Record"
4. **Expected**:
   - Red error banner: "No microphone was found. Check that a microphone is connected and enabled."
   - Backend logs error
   - No retry attempted (not a transient error)

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 4: Microphone In Use (Transient Error)
**Goal**: Verify retry logic for NotReadableError

1. Open another app using microphone (Zoom, Teams, etc.)
2. Navigate to http://localhost:3000/tell-your-story
3. Click "Press to Record"
4. **Expected**:
   - Blue info banner: "Microphone seems busy. Retrying in a moment..."
   - "Preparing microphone..." text shows
   - Record button shows "Retrying..."
   - After 1.5 seconds, attempts retry
   - If still busy: Red error banner with NotReadableError message
   - If now available: Green success banner + recording starts

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 5: Diagnostics Panel
**Goal**: Verify troubleshooting UI

1. Navigate to http://localhost:3000/tell-your-story
2. Click "Troubleshoot microphone" link (below record button)
3. **Expected**:
   - Blue diagnostics panel appears
   - Shows 4 checks:
     - Recording API Support: ✓ (should be green)
     - Secure Context (HTTPS): ✓ (green on localhost)
     - Microphone Detected: ✓ or ✗
     - Permission: granted/denied/prompt
   - Shows "What you can do:" with suggested actions
   - If canRecord === true: Shows "Try Recording Again" button
   - Close button (✕) dismisses panel

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 6: Recording Disabled on Unsupported Browser
**Goal**: Verify button disabling

1. Open browser DevTools Console
2. Run: `delete window.MediaRecorder` (to simulate unsupported browser)
3. Refresh page
4. **Expected**:
   - Yellow warning banner on page load: "Recording is not available: MediaRecorder API not supported"
   - Record button is disabled (grayed out, opacity 50%)
   - Cursor shows not-allowed icon on hover

**Note**: Refresh page to restore MediaRecorder after test

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 7: Banner Keyboard Dismissal
**Goal**: Verify accessibility

1. Trigger any error (block microphone permission)
2. Banner appears
3. Click banner to focus it
4. Press Escape key
5. **Expected**:
   - Banner dismisses
   - Focus moves appropriately
6. Also test clicking "Dismiss" button
7. **Expected**:
   - Banner dismisses

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 8: Backend Error Logging
**Goal**: Verify non-PII logging

1. Open backend terminal/console
2. Trigger any recording error (e.g., block microphone)
3. **Expected Console Output**:
```
[RECORDING_ERROR] {
  errorName: 'NotAllowedError',
  permissionState: 'denied',
  hasAudioInput: true,
  userAgentSnippet: 'Mozilla/5.0 Windows',  // truncated, no full UA string
  timestamp: '2025-01-27T12:34:56.789Z'
}
```

4. **Verify**:
   - No profile ID
   - No email/phone
   - No full user agent string
   - Just error metadata

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 9: Retry Counter Limit
**Goal**: Verify only 1 retry attempt

1. Simulate transient error twice in a row
2. **Expected**:
   - First error: Retry attempted
   - Second error (after retry fails): No second retry
   - Error banner shown immediately

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 10: Success Banner Auto-Dismiss
**Goal**: Verify UX polish

1. Navigate to tell-your-story page
2. Click "Press to Record"
3. Allow microphone
4. **Expected**:
   - Green success banner: "Microphone connected!"
   - Banner auto-dismisses after 3 seconds
   - Recording continues uninterrupted

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## Edge Cases

### Edge Case 1: Permission Prompt Dismissed
- User clicks "Press to Record"
- Browser shows permission prompt
- User clicks "Not now" or closes prompt
- **Expected**: Banner shows NotAllowedError message

### Edge Case 2: Page Not HTTPS (Production)
- Access site over HTTP (not localhost)
- **Expected**: 
  - Recording disabled
  - Diagnostics show "Secure Context: ✗"
  - Suggested action: "Recording requires HTTPS..."

### Edge Case 3: Multiple Errors in Quick Succession
- Trigger error
- Dismiss banner
- Trigger different error immediately
- **Expected**: New error replaces old banner message

---

## Browser Compatibility Testing

Test in these browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

---

## Accessibility Checklist

- [ ] Banner has `role="alert"`
- [ ] Banner has `aria-live="polite"`
- [ ] Banner is keyboard-dismissible (Escape key)
- [ ] Record button has `aria-label`
- [ ] Disabled button has `disabled` attribute (not just aria-disabled)
- [ ] Focus management works correctly
- [ ] Screen reader announces errors

---

## Performance Verification

- [ ] Diagnostics run on mount without blocking UI
- [ ] Backend logging never blocks user experience
- [ ] Failed logging doesn't show error to user
- [ ] Retry delay (1.5s) feels natural, not too long

---

## Rollback Plan

If issues arise, revert these files:
1. `v1-frontend/app/tell-your-story/page.tsx` - Recording page
2. `v1-frontend/src/lib/recordingDiagnostics.ts` - Diagnostics module
3. `v1-backend/server.js` - Backend error logging endpoint

Keep admin portal, database, and donation logic untouched.

---

## Success Criteria

✅ All 10 test scenarios pass  
✅ No console errors in browser DevTools  
✅ Backend logs errors correctly (non-PII)  
✅ User experience feels polished and helpful  
✅ No regressions in normal recording flow  
✅ Accessibility requirements met  

---

## Notes

- **Do NOT test** donation flow, Stripe, receipts, email, or admin story browser (unchanged)
- Focus only on recording UI improvements
- All changes are isolated to tell-your-story page + diagnostics module
- Backend endpoint is best-effort, never required for functionality
