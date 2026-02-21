# Offline Recording & Sync Testing Guide

## Overview
This guide provides step-by-step instructions for testing the offline-first recording system and admin live monitoring features.

---

## A) Offline Recording & Sync Testing

### Test 1: Normal Online Recording (Baseline)

**Goal**: Verify the recording system works normally when online.

**Steps**:
1. Start backend: `cd v1-backend && node server.js`
2. Start frontend: `cd v1-frontend && npm run dev`
3. Navigate to: http://localhost:3000/tell-your-story
4. Verify sync status shows: "Connection OK" (green dot)
5. Click "Press to Record" and allow microphone
6. Record for 10 seconds and stop
7. Click "Save Recording"

**Expected Results**:
- ✅ Recording uploads immediately
- ✅ Success message appears
- ✅ Profile form appears with recordingId
- ✅ No pending uploads shown
- ✅ Backend logs show recording saved

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 2: Recording While Backend is Down

**Goal**: Verify offline save when backend is unreachable.

**Steps**:
1. Start frontend only: `cd v1-frontend && npm run dev`
2. Stop backend if running
3. Navigate to: http://localhost:3000/tell-your-story
4. Verify sync status shows: "Connection OK" (may still show online initially)
5. Click "Press to Record" and record for 10 seconds
6. Click "Save Recording"

**Expected Results**:
- ✅ Blue info banner appears: "Your story has been saved on this device and will upload automatically when the connection returns. Please don't clear the browser data on this kiosk."
- ✅ Recording saved to IndexedDB (check browser DevTools → Application → IndexedDB → CareConnectOffline)
- ✅ Pending uploads counter shows "1 recording pending upload"
- ✅ Profile form still appears (recordingId = 'offline-pending')
- ✅ No error messages shown

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 3: Automatic Sync When Backend Comes Online

**Goal**: Verify automatic sync when connectivity restores.

**Steps**:
1. Continue from Test 2 (recording saved offline)
2. Start backend: `cd v1-backend && node server.js`
3. Wait 5-10 seconds (sync runs every 60s, but will trigger immediately on startup)
4. Alternatively, refresh the page to force immediate sync check

**Expected Results**:
- ✅ Green success banner appears: "Your story has been safely uploaded! (1 recording)"
- ✅ Pending uploads counter decreases to 0
- ✅ Backend logs show recording upload
- ✅ Recording appears in admin story browser
- ✅ IndexedDB shows recording status = 'synced'

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 4: Simulated Network Loss During Recording

**Goal**: Test behavior when network drops while recording is in progress.

**Steps**:
1. Start both frontend and backend
2. Navigate to: http://localhost:3000/tell-your-story
3. Click "Press to Record" and START recording
4. While recording, use browser DevTools:
   - Press F12 → Network tab → Change "Online" to "Offline"
5. Stop recording
6. Click "Save Recording"

**Expected Results**:
- ✅ Sync status changes to "Working offline — your story will upload when the connection returns"
- ✅ Recording saves to IndexedDB
- ✅ Blue info banner about offline save
- ✅ Pending uploads counter increments

**Restore**:
7. Set DevTools Network back to "Online"
8. Wait for auto-sync or refresh page

**Expected Results**:
- ✅ Recording syncs automatically
- ✅ Success banner shown

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 5: Multiple Pending Recordings

**Goal**: Verify system handles multiple offline recordings correctly.

**Steps**:
1. Stop backend
2. Record and save Recording #1 offline
3. Refresh page or navigate back to /tell-your-story
4. Record and save Recording #2 offline
5. Record and save Recording #3 offline
6. Check pending uploads counter

**Expected Results**:
- ✅ Counter shows "3 recordings pending upload"
- ✅ Info banner on page load mentions pending uploads
- ✅ All 3 recordings visible in IndexedDB

**Sync Test**:
7. Start backend
8. Wait or refresh page

**Expected Results**:
- ✅ All 3 recordings sync in sequence
- ✅ Success banner: "(3 recordings)"
- ✅ Counter returns to 0
- ✅ All 3 recordings appear in admin story browser

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 6: Sync Status Indicator Behavior

**Goal**: Verify sync status indicator updates correctly.

**Scenarios to Test**:

| Scenario | Expected Indicator |
|----------|-------------------|
| Online + No pending | Green dot + "Connection OK" |
| Offline + No pending | Yellow dot + "Working offline..." |
| Online + Syncing | Green dot + Spinner + "Saving your story securely..." |
| Online + Pending | Green dot + "Connection OK" + Blue text "X recordings pending upload" |

**Steps**:
1. Test each scenario by:
   - Toggling network on/off (DevTools)
   - Recording offline
   - Starting backend to trigger sync
2. Observe indicator changes

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 7: IndexedDB Data Verification

**Goal**: Verify IndexedDB stores correct data structure.

**Steps**:
1. Record an offline recording
2. Open browser DevTools → Application → IndexedDB → CareConnectOffline → offlineRecordings
3. Inspect the stored recording

**Expected Data Structure**:
```json
{
  "offlineRecordingId": "uuid-string",
  "audioBlob": Blob,
  "duration": 15,
  "createdAt": "2025-12-05T12:34:56.789Z",
  "status": "pending",
  "profileDraft": null
}
```

**Verify**:
- ✅ offlineRecordingId is a valid UUID
- ✅ audioBlob has size > 0
- ✅ duration matches recording length
- ✅ status is "pending" initially
- ✅ After sync, status changes to "synced" and recordingIdFromServer is set

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 8: Browser Data Persistence (Kiosk Scenario)

**Goal**: Verify recordings persist after browser refresh.

**Steps**:
1. Stop backend
2. Record an offline recording
3. Verify pending uploads counter shows 1
4. Close browser tab
5. Reopen http://localhost:3000/tell-your-story

**Expected Results**:
- ✅ Info banner: "You have 1 recording waiting to upload..."
- ✅ Pending uploads counter: 1
- ✅ IndexedDB still contains the recording
- ✅ Can record additional stories

**Status**: ⬜ Pass | ⬜ Fail

---

## B) Admin Recording Health Monitoring Testing

### Test 9: Generate Recording Errors

**Goal**: Create various recording errors to populate the health dashboard.

**Steps**:
1. Navigate to: http://localhost:3000/tell-your-story

**Scenario 1: Block Microphone Permission**
2. Block microphone in browser settings
3. Click "Press to Record"
4. Error should log to backend

**Scenario 2: No Microphone Connected**
5. Disable microphone in Windows Settings
6. Click "Press to Record"
7. Error should log

**Scenario 3: Offline Error**
8. Set DevTools Network to "Offline"
9. Click "Press to Record"
10. Should log connectivity = 'offline'

**Expected Backend Console Output**:
```
[RECORDING_ERROR] {
  errorName: 'NotAllowedError',
  permissionState: 'denied',
  hasAudioInput: true,
  userAgentSnippet: 'Mozilla/5.0 Windows',
  connectivity: 'online',
  kioskId: 'unknown',
  timestamp: '2025-12-05T12:34:56.789Z'
}
```

**Verify Database**:
```sql
SELECT * FROM recording_issue_logs ORDER BY created_at DESC LIMIT 5;
```

**Expected Results**:
- ✅ Errors logged to recording_issue_logs table
- ✅ No userId or recordingId present (privacy)
- ✅ Connectivity field populated
- ✅ kioskId defaults to 'unknown'

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 10: Admin Health Dashboard Access

**Goal**: Verify admin can access health dashboard.

**Steps**:
1. Navigate to: http://localhost:3001/admin/login
2. Enter password: `Hayfield::`
3. Click "Story Browser" → Should see nav sidebar
4. Click "Recording Health" in sidebar
5. Should load health dashboard

**Expected Results**:
- ✅ Page loads without authentication errors
- ✅ Summary cards display at top:
  - Issues (24h)
  - Offline Saves (24h)
  - Most Common Error
  - Last Issue timestamp
- ✅ Filters visible: Time Window, Error Type, Connectivity
- ✅ Issues table shows recent errors

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 11: Health Dashboard Summary Cards

**Goal**: Verify summary statistics are accurate.

**Steps**:
1. Generate at least 5 different errors (from Test 9)
2. Refresh admin health dashboard
3. Check summary cards

**Expected Results**:
- ✅ "Issues (24h)" shows correct count (≥5)
- ✅ "Most Common Error" shows the error that occurred most
- ✅ "Last Issue" shows time ago (e.g., "2m ago")
- ✅ If offline errors exist, "Offline Saves (24h)" > 0

**Verify Calculations**:
- Count errors in last 24 hours manually
- Compare with dashboard summary
- Should match exactly

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 12: Health Dashboard Filters

**Goal**: Verify filters work correctly.

**Test Filters**:

**Time Window Filter**:
1. Generate error now
2. Set filter to "Last Hour" → Should show recent error
3. Set filter to "Last 7 Days" → Should show all errors
4. Set filter to "All Time" → Should show everything

**Error Type Filter**:
1. Set to "Permission Blocked" (NotAllowedError)
2. Should only show NotAllowedError entries
3. Set to "No Microphone" (NotFoundError)
4. Should only show NotFoundError entries

**Connectivity Filter**:
1. Set to "Online" → Should only show connectivity='online'
2. Set to "Offline" → Should only show connectivity='offline'

**Expected Results**:
- ✅ Table updates immediately when filter changes
- ✅ Filtered count matches displayed rows
- ✅ Pagination resets to page 1 on filter change
- ✅ Multiple filters combine correctly (AND logic)

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 13: Health Dashboard Table Display

**Goal**: Verify issue table displays correct information.

**Expected Columns**:
- Time (formatted as "2m ago", "1h ago", etc.)
- Kiosk ID (default: "unknown")
- Connectivity (badge: green for online, yellow for offline)
- Error Type (e.g., "NotAllowedError")
- Description (user-friendly, e.g., "Microphone access blocked")
- Permission (e.g., "denied", "prompt", "N/A")

**Verify**:
- ✅ All columns present
- ✅ Time formatted as relative ("Xm ago")
- ✅ Connectivity badge colored correctly
- ✅ Description maps error name to friendly text
- ✅ No PII displayed (no names, emails, phones)

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 14: Health Dashboard Pagination

**Goal**: Verify pagination works when > 20 issues exist.

**Steps**:
1. Generate 25+ errors (repeat Test 9 scenarios)
2. Refresh health dashboard
3. Should see "Page 1 of 2"
4. Click "Next" button

**Expected Results**:
- ✅ Shows first 20 issues on page 1
- ✅ "Next" button enabled, "Previous" disabled
- ✅ Page 2 shows remaining issues
- ✅ "Previous" button enabled, "Next" disabled
- ✅ Pagination info: "Showing 1 to 20 of 25 issues"

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 15: Health Dashboard Auto-Refresh

**Goal**: Verify dashboard polls for new data every 60 seconds.

**Steps**:
1. Open health dashboard
2. Note current "Last Issue" timestamp
3. In another tab, generate a new recording error
4. Wait 60 seconds
5. Watch dashboard (do not refresh manually)

**Expected Results**:
- ✅ Dashboard updates automatically after ~60 seconds
- ✅ "Last Issue" timestamp updates
- ✅ "Issues (24h)" counter increments
- ✅ New row appears in table
- ✅ No manual refresh required

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 16: Privacy Verification (CRITICAL)

**Goal**: Ensure NO PII appears in health dashboard or logs.

**Steps**:
1. Create a user profile with:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "(555) 123-4567"
2. Generate recording errors
3. Check:
   - Browser console
   - Backend console logs
   - Admin health dashboard
   - Database: `SELECT * FROM recording_issue_logs;`

**MUST NOT CONTAIN**:
- ❌ User names
- ❌ Email addresses
- ❌ Phone numbers
- ❌ User IDs
- ❌ Recording IDs
- ❌ Full user agent strings (only first 3 words)

**Expected to See**:
- ✅ Error names (NotAllowedError, etc.)
- ✅ Permission states (granted/denied/prompt)
- ✅ Connectivity status (online/offline)
- ✅ Truncated user agent (e.g., "Mozilla/5.0 Windows")
- ✅ Kiosk ID (default: "unknown")
- ✅ Timestamps

**Status**: ⬜ Pass | ⬜ Fail

---

## C) Integration & Edge Cases

### Test 17: Offline Recording + Profile Attachment

**Goal**: Verify profile attachment works with offline-synced recordings.

**Steps**:
1. Stop backend
2. Record offline
3. Enter profile: Name = "Offline User", Email = "offline@test.com"
4. Submit profile (will fail, but data stored locally)
5. Start backend
6. Wait for sync

**Expected Results**:
- ✅ Recording syncs first
- ✅ Profile may need manual re-submission (current limitation)
- ✅ Future enhancement: sync profile with recording

**Note**: Profile attachment for offline recordings is a known limitation. User must re-submit profile after sync.

**Status**: ⬜ Pass | ⬜ Fail | ⬜ Known Limitation

---

### Test 18: Concurrent Recordings on Multiple Kiosks

**Goal**: Simulate multiple kiosks recording simultaneously.

**Steps**:
1. Open 3 browser windows (incognito/private mode)
2. Navigate each to tell-your-story page
3. Record simultaneously in all 3 windows
4. Generate different errors:
   - Window 1: Block microphone (NotAllowedError)
   - Window 2: Record successfully
   - Window 3: Go offline, record, save offline
5. Check admin health dashboard

**Expected Results**:
- ✅ All errors logged separately
- ✅ Each error has unique ID
- ✅ Dashboard shows all 3 events
- ✅ No data conflicts or overwrites

**Status**: ⬜ Pass | ⬜ Fail

---

### Test 19: Browser Storage Limits

**Goal**: Verify behavior when IndexedDB quota approached.

**Steps**:
1. Record 50+ offline recordings (large audio files)
2. Check browser storage usage (DevTools → Application → Storage)
3. Attempt to save one more recording

**Expected Results**:
- ✅ Browser prompts for storage quota increase (if needed)
- ✅ Error handling for quota exceeded
- ✅ Graceful degradation (alert user)

**Note**: Most browsers allow 50MB+ for IndexedDB. This test may require generating large audio files.

**Status**: ⬜ Pass | ⬜ Fail | ⬜ Not Tested (Quota Not Reached)

---

### Test 20: Cleanup of Old Synced Recordings

**Goal**: Verify old synced recordings are cleaned up after 7 days.

**Steps**:
1. Record and sync a recording
2. Verify status = 'synced' in IndexedDB
3. Manually change createdAt timestamp to 8 days ago (DevTools)
4. Refresh page or wait for sync service to run cleanup

**Expected Results**:
- ✅ Synced recordings older than 7 days are deleted from IndexedDB
- ✅ Backend recording remains intact
- ✅ No impact on pending recordings

**Status**: ⬜ Pass | ⬜ Fail | ⬜ Manual Testing Required

---

## Success Criteria

### Offline Recording & Sync
- ✅ Recordings save to IndexedDB when backend unreachable
- ✅ Sync service auto-uploads when connectivity returns
- ✅ Sync status indicator accurate at all times
- ✅ Multiple pending recordings handled correctly
- ✅ No data loss during offline→online transition
- ✅ User receives clear messaging about offline saves

### Admin Health Monitoring
- ✅ All recording errors logged to database
- ✅ Health dashboard displays accurate summary statistics
- ✅ Filters work correctly (time, error type, connectivity)
- ✅ Dashboard auto-refreshes every 60 seconds
- ✅ Pagination works for > 20 issues
- ✅ **NO PII displayed anywhere** (critical)

### Privacy & Security
- ✅ No user names in error logs
- ✅ No emails in error logs
- ✅ No phone numbers in error logs
- ✅ No user IDs or recording IDs in issue logs
- ✅ User agent truncated to 3 words max
- ✅ Admin auth required for health dashboard

---

## Rollback Plan

If critical issues arise, rollback these changes:

1. **Frontend**:
   - Delete: `v1-frontend/src/lib/offlineRecordingStore.ts`
   - Delete: `v1-frontend/src/lib/recordingSyncService.ts`
   - Delete: `v1-frontend/app/admin/recording-health/page.tsx`
   - Revert: `v1-frontend/app/tell-your-story/page.tsx` (remove offline logic)
   - Revert: `v1-frontend/components/AdminLayout.tsx` (remove Recording Health link)

2. **Backend**:
   - Revert: `v1-backend/server.js` (remove health endpoints)
   - Revert: `v1-backend/prisma/schema.prisma` (remove RecordingIssueLog model)
   - Run: `npx prisma migrate dev --name rollback_recording_health`

3. **Database**:
   - `DROP TABLE recording_issue_logs;` (if needed)

---

## Quick Test Script (Windows PowerShell)

```powershell
# Quick test: Offline save and sync
Write-Host "1. Starting backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "cd C:\Users\richl\Care2system\v1-backend; node server.js"

Start-Sleep -Seconds 3

Write-Host "2. Starting frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "cd C:\Users\richl\Care2system\v1-frontend; npm run dev"

Start-Sleep -Seconds 5

Write-Host "3. Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3000/tell-your-story"

Write-Host "4. Waiting 5 seconds, then stopping backend..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Stop backend (find process on port 3001 and kill it)
$backendProcess = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($backendProcess) {
    Stop-Process -Id $backendProcess -Force
    Write-Host "Backend stopped. Now record offline and observe behavior." -ForegroundColor Yellow
}

Write-Host "5. Restart backend to test sync:" -ForegroundColor Cyan
Write-Host "   cd v1-backend; node server.js" -ForegroundColor Green
```

---

*Last Updated: December 5, 2025*  
*Status: Ready for Testing*
