# V1 Manual Test Plan - CareConnect System
**Version**: 1.0  
**Date**: January 7, 2026  
**Status**: Ready for QA Testing

---

## Test Environment Setup

### Prerequisites
- [ ] Backend running on http://localhost:3001
- [ ] Frontend running on http://localhost:3000
- [ ] PM2 services online (`pm2 list`)
- [ ] Environment variables configured (.env)
- [ ] Database connected (check `/health/status`)

### Quick Health Check
```powershell
# Check backend health
Invoke-RestMethod -Uri "http://localhost:3001/health/live"

# Expected: { status: "alive", ... }
```

---

## Test Suite 1: Recording Flow

### Test 1.1: Basic Recording Creation
**Objective**: Create a new voice recording

**Steps**:
1. Navigate to http://localhost:3000
2. Click "Start Recording" or "Create Profile"
3. Allow microphone permissions
4. Speak for 30-60 seconds (introduce yourself, describe situation)
5. Click "Stop Recording"
6. Verify upload completes

**Expected Results**:
- ✅ Microphone permission granted
- ✅ Recording indicator shows while speaking
- ✅ Audio waveform visible
- ✅ Upload completes without errors
- ✅ Redirect to ticket/recording page

**Fail Conditions**:
- ❌ Microphone permission denied → Should show clear error message
- ❌ Upload times out → Should retry or show error
- ❌ No recording created → Check network/backend logs

---

### Test 1.2: Permission Denial Handling
**Objective**: Verify graceful handling when mic access denied

**Steps**:
1. Navigate to recording page
2. Deny microphone permissions in browser
3. Attempt to start recording

**Expected Results**:
- ✅ Clear error message: "Microphone access required"
- ✅ Instructions to enable permissions
- ✅ No console errors
- ✅ Page remains functional

---

### Test 1.3: Busy Microphone Handling
**Objective**: Handle mic already in use by another app

**Steps**:
1. Open another app using microphone (Zoom, Discord, etc.)
2. Try to start recording in CareConnect

**Expected Results**:
- ✅ Error message: "Microphone in use by another application"
- ✅ Suggestion to close other apps
- ✅ No crash or freeze

---

### Test 1.4: Offline Recording
**Objective**: Test offline recording capability

**Steps**:
1. Disconnect from internet
2. Create a recording
3. Complete recording
4. Reconnect to internet

**Expected Results**:
- ✅ Recording captured locally
- ✅ Message: "Saved locally - will sync when online"
- ✅ Auto-sync on reconnect
- ✅ Ticket created in database after sync

---

## Test Suite 2: Profile Creation & Search

### Test 2.1: Profile from Recording
**Objective**: Generate profile from voice recording

**Steps**:
1. Complete a recording (Test 1.1)
2. Wait for transcription to complete
3. Navigate to profile page
4. Verify profile data populated

**Expected Results**:
- ✅ Name extracted from transcript
- ✅ Needs/situation summarized
- ✅ Profile created in database
- ✅ View count starts at 0

---

### Test 2.2: Profile Search (Admin)
**Objective**: Search for profiles by name

**Steps**:
1. Log in to admin panel
2. Navigate to "Profile Search"
3. Enter a known profile name
4. Click "Search"

**Expected Results**:
- ✅ Matching profiles displayed
- ✅ PII masked in list view (email: us***@domain.com, phone: 555***1234)
- ✅ Click profile to view full details
- ✅ Rate limit prevents rapid searches

---

### Test 2.3: Public Search Privacy
**Objective**: Verify public search requires name + contact

**Steps**:
1. Go to public search page (if available)
2. Try to search with only name
3. Try to search with only email/phone
4. Search with name + email/phone

**Expected Results**:
- ✅ Search fails without both name AND contact
- ✅ Error doesn't reveal if profile exists
- ✅ Generic message: "No matching profile found"
- ✅ Rate limited (5 requests per 15 min)

---

## Test Suite 3: Donation Tools & Draft Generation

### Test 3.1: Generate Donation Tools
**Objective**: Create GoFundMe draft from recording

**Steps**:
1. Complete recording with clear needs stated
2. Navigate to "Generate Donation Tools"
3. Click "Create Draft"
4. Wait for draft generation

**Expected Results**:
- ✅ Draft title generated: "Help [Name] with [Need]"
- ✅ Story structured in 5 sections
- ✅ 90-word excerpt created
- ✅ Goal amount suggested
- ✅ Quality score displayed (0.0-1.0)

---

### Test 3.2: Edit Draft
**Objective**: Manually edit generated draft

**Steps**:
1. Generate a draft (Test 3.1)
2. Click "Edit Draft"
3. Modify title, story, goal amount
4. Click "Save"

**Expected Results**:
- ✅ Changes saved to database
- ✅ Updated timestamp reflects edit
- ✅ Quality score recalculated (if applicable)
- ✅ Original draft preserved in history

---

### Test 3.3: NEEDS_INFO Workflow
**Objective**: Handle incomplete draft data

**Steps**:
1. Create recording with minimal info (just say "I need help")
2. Attempt to generate draft
3. Observe NEEDS_INFO status

**Expected Results**:
- ✅ Status changes to "NEEDS_INFO"
- ✅ Missing fields listed (e.g., goal amount, location)
- ✅ Suggested questions displayed
- ✅ Form to provide missing data

**Then**:
4. Fill in missing fields
5. Submit

**Expected Results**:
- ✅ Processing resumes automatically
- ✅ Draft generated with complete data
- ✅ Status changes to "READY"

---

## Test Suite 4: QR Code & Stripe Integration

### Test 4.1: Generate QR Code
**Objective**: Create payment QR code for draft

**Steps**:
1. Complete draft generation
2. Click "Generate QR Code"
3. Wait for Stripe session creation

**Expected Results**:
- ✅ QR code image displayed
- ✅ Stripe checkout URL created
- ✅ Version = 1 for first QR
- ✅ Amount in cents stored

---

### Test 4.2: QR Code Versioning
**Objective**: Test QR version increments on amount change

**Steps**:
1. Generate QR for $500 goal
2. Edit draft, change goal to $750
3. Regenerate QR code

**Expected Results**:
- ✅ New QR code created
- ✅ Version incremented to 2
- ✅ Old QR still accessible in history
- ✅ History shows reason: "amount_changed"

---

### Test 4.3: QR Code Reuse
**Objective**: Verify QR reused when amount unchanged

**Steps**:
1. Generate QR for $500
2. Edit draft (change story, NOT amount)
3. Request QR code again

**Expected Results**:
- ✅ Same QR code returned
- ✅ Version still 1
- ✅ No new Stripe session created
- ✅ Scan count unchanged

---

### Test 4.4: Stripe Preview Mode
**Objective**: Test donation flow without real payment

**Steps**:
1. Scan QR code or visit Stripe URL
2. Complete checkout form (use test card: 4242 4242 4242 4242)
3. Submit payment

**Expected Results**:
- ✅ Stripe test mode active
- ✅ Checkout page loads
- ✅ Test card accepted
- ✅ Webhook fires (check logs)
- ✅ Payment recorded in admin dashboard

---

## Test Suite 5: Admin Dashboards

### Test 5.1: Admin Login
**Objective**: Access admin panel securely

**Steps**:
1. Navigate to /admin/login
2. Enter credentials
3. Click "Login"

**Expected Results**:
- ✅ Login successful with correct credentials
- ✅ Failed login shows generic error (not revealing user existence)
- ✅ Rate limited after 5 failed attempts (15 min lockout)
- ✅ Session cookie set (HttpOnly, Secure in prod)

---

### Test 5.2: Story Browser
**Objective**: View and manage user stories

**Steps**:
1. Log in to admin
2. Navigate to "Story Browser"
3. View list of recordings/profiles

**Expected Results**:
- ✅ Stories displayed with masked PII
- ✅ Email shown as: us***@domain.com
- ✅ Phone shown as: 555***1234
- ✅ Name shown as: Jo** S****
- ✅ Pagination works (10 per page)
- ✅ Click story to view full details

---

### Test 5.3: Recording Health Dashboard
**Objective**: Monitor system health

**Steps**:
1. Navigate to /admin/ops/status or /health-dashboard
2. View service statuses

**Expected Results**:
- ✅ Database: healthy (green)
- ✅ AssemblyAI: healthy (green) or disabled
- ✅ Stripe: healthy (green)
- ✅ OpenAI: **DISABLED** (Zero-OpenAI mode)
- ✅ Speech Intelligence: healthy or degraded
- ✅ Latency metrics displayed
- ✅ Open incidents count shown

---

### Test 5.4: Incidents & Logs
**Objective**: Review system incidents

**Steps**:
1. Navigate to admin incidents page
2. View list of recent incidents

**Expected Results**:
- ✅ Incidents sorted by timestamp (newest first)
- ✅ Severity shown (critical, warn, info)
- ✅ Service name and stage shown
- ✅ No PII in incident messages
- ✅ Click incident for full details
- ✅ Resolved incidents marked

---

## Test Suite 6: Zero-OpenAI Verification

### Test 6.1: Verify OpenAI Disabled in Health
**Objective**: Confirm OpenAI not checked in V1 mode

**Steps**:
1. Ensure V1_STABLE=true and ZERO_OPENAI_MODE=true in .env
2. Navigate to /health/status
3. Inspect OpenAI service status

**Expected Results**:
- ✅ OpenAI status: "disabled"
- ✅ Reason: "OpenAI disabled in V1_STABLE/ZERO_OPENAI_MODE"
- ✅ No API call made to api.openai.com
- ✅ Mode: "V1_STABLE"

---

### Test 6.2: Transcription Uses AssemblyAI Only
**Objective**: Verify transcription doesn't fall back to OpenAI

**Steps**:
1. Create a recording
2. Monitor network requests (browser DevTools)
3. Wait for transcription to complete

**Expected Results**:
- ✅ POST request to api.assemblyai.com
- ✅ NO request to api.openai.com
- ✅ Transcription completes successfully
- ✅ Logs show: "TRANSCRIPTION_COMPLETED" with AssemblyAI provider

---

### Test 6.3: Draft Generation Uses Rules Only
**Objective**: Verify draft generation doesn't use AI

**Steps**:
1. Generate draft from recording
2. Monitor network requests
3. Check logs for AI provider usage

**Expected Results**:
- ✅ NO request to api.openai.com
- ✅ Draft generated using rules-based logic
- ✅ Logs show: AI_PROVIDER=rules
- ✅ Title follows pattern: "Help [Name] with [Need]"

---

## Test Suite 7: Stress & Load Testing

### Test 7.1: Concurrent Recordings
**Objective**: Test system under load

**Steps**:
1. Open 10 browser tabs
2. Start recording in each tab simultaneously
3. Stop all recordings after 30 seconds

**Expected Results**:
- ✅ All recordings complete successfully
- ✅ No timeouts or crashes
- ✅ Backend remains responsive
- ✅ PM2 shows stable memory usage

---

### Test 7.2: Admin Pagination
**Objective**: Test large dataset handling

**Steps**:
1. Ensure 100+ recordings exist in database
2. Navigate through admin story browser pages

**Expected Results**:
- ✅ Pagination loads quickly (<2 seconds)
- ✅ No memory leaks
- ✅ Filtering works correctly
- ✅ Sort by date/status works

---

### Test 7.3: Database Latency (Remote DB)
**Objective**: Monitor remote database performance

**Steps**:
1. Ensure DB_MODE=remote
2. Perform 20 operations (create, read, update)
3. Observe latency in logs

**Expected Results**:
- ✅ Average latency <1 second
- ✅ No connection timeouts
- ✅ Connection pooling active
- ✅ Warning logged: "Using remote database"

---

## Test Suite 8: Error Handling & Recovery

### Test 8.1: Network Interruption During Upload
**Objective**: Handle network failures gracefully

**Steps**:
1. Start recording
2. Stop recording
3. Disconnect internet before upload completes
4. Reconnect internet

**Expected Results**:
- ✅ Upload queued locally
- ✅ Message: "Saving offline - will sync when online"
- ✅ Auto-retry on reconnect
- ✅ Upload completes after reconnect

---

### Test 8.2: Transcription Timeout
**Objective**: Handle long transcription times

**Steps**:
1. Set STUB_TRANSCRIPTION_DELAY_MS=300000 (5 minutes)
2. Create recording
3. Wait for timeout

**Expected Results**:
- ✅ Ticket status: "TRANSCRIPTION_TIMEOUT"
- ✅ User notified of timeout
- ✅ Retry button available
- ✅ Manual retry succeeds

---

### Test 8.3: Database Connection Lost
**Objective**: Recover from DB disconnect

**Steps**:
1. Stop database (if local Docker)
2. Attempt to create recording
3. Restart database

**Expected Results**:
- ✅ Error message: "Database temporarily unavailable"
- ✅ Retry button shown
- ✅ Auto-reconnect after DB restart
- ✅ Queued operations complete

---

## Test Suite 9: Security & Privacy

### Test 9.1: CSRF Protection
**Objective**: Verify CSRF tokens required

**Steps**:
1. Attempt POST request without CSRF token
2. Observe rejection

**Expected Results**:
- ✅ Request rejected with 403
- ✅ Error: "Invalid CSRF token"
- ✅ Legitimate requests work

---

### Test 9.2: XSS Prevention
**Objective**: Test XSS injection protection

**Steps**:
1. Submit recording with `<script>alert('XSS')</script>` in name field
2. View recording in admin

**Expected Results**:
- ✅ Script tags escaped/sanitized
- ✅ No JavaScript execution
- ✅ Displayed as plain text

---

### Test 9.3: SQL Injection Prevention
**Objective**: Test SQL injection protection

**Steps**:
1. Search for profile with name: `'; DROP TABLE users; --`
2. Observe no error

**Expected Results**:
- ✅ Query parameterized (Prisma handles this)
- ✅ No database error
- ✅ Search returns no results (or proper results)

---

## Test Suite 10: Boot Banner & Configuration

### Test 10.1: Verify Boot Banner
**Objective**: Ensure structured boot banner displays

**Steps**:
1. Restart backend: `pm2 restart careconnect-backend`
2. Check logs: `pm2 logs careconnect-backend --lines 50`

**Expected Output**:
```
╔════════════════════════════════════════════════════════════════╗
║                    CARECONNECT BACKEND v1.0                    ║
╠════════════════════════════════════════════════════════════════╣
║ [BOOT] runMode=dev  v1Stable=true  zeroOpenAI=true            ║
║        aiProvider=rules      transcription=assemblyai         ║
║        dbMode=local   port=3001 nodeEnv=development           ║
╚════════════════════════════════════════════════════════════════╝
```

**Expected Results**:
- ✅ Banner displayed on startup
- ✅ All flags shown correctly
- ✅ V1_STABLE=true
- ✅ ZERO_OPENAI_MODE=true
- ✅ AI_PROVIDER=rules
- ✅ DB_MODE=local or remote

---

### Test 10.2: Configuration Validation
**Objective**: Ensure invalid configs rejected

**Steps**:
1. Set conflicting flags: V1_STABLE=true, ZERO_OPENAI_MODE=false
2. Restart backend

**Expected Results**:
- ✅ Error logged: "V1_STABLE=true requires ZERO_OPENAI_MODE=true"
- ✅ Server exits in prod mode
- ✅ Server warns in dev mode but continues

---

## Acceptance Criteria

### Must Pass (All Suites)
- [ ] All recording flows work (basic, permission denied, offline)
- [ ] Profile creation and search functional
- [ ] Draft generation completes with quality score
- [ ] NEEDS_INFO workflow prompts for missing data
- [ ] QR codes generate and version correctly
- [ ] Admin login secure with rate limiting
- [ ] PII masked in all admin views
- [ ] Zero-OpenAI mode verified (no api.openai.com calls)
- [ ] Health dashboard shows all services
- [ ] Incidents logged for all failures
- [ ] Boot banner displays correct configuration
- [ ] Structured logs with correlation IDs

### Performance Targets
- [ ] Page load <2 seconds
- [ ] Recording upload <5 seconds
- [ ] Transcription <2 minutes (AssemblyAI)
- [ ] Draft generation <10 seconds
- [ ] QR generation <5 seconds
- [ ] Admin pagination <2 seconds
- [ ] Health check <1 second

### Security Requirements
- [ ] All admin endpoints require authentication
- [ ] Rate limiting active (5 failed logins per 15 min)
- [ ] PII redacted in logs
- [ ] Secrets not exposed in /health/status
- [ ] CSRF protection enabled
- [ ] XSS/SQL injection prevented
- [ ] Cookies: HttpOnly, Secure (prod), SameSite=Lax

---

## Test Execution Checklist

### Pre-Test
- [ ] Backend running (`pm2 list` shows online)
- [ ] Frontend running (http://localhost:3000 accessible)
- [ ] Database connected (`/health/live` returns status:alive)
- [ ] Environment configured (.env has all required flags)
- [ ] Test data cleared (optional, for clean slate)

### During Test
- [ ] Record results for each test (pass/fail)
- [ ] Capture screenshots of failures
- [ ] Save error messages and logs
- [ ] Note performance metrics (latency, load times)

### Post-Test
- [ ] Review all failures with dev team
- [ ] File bugs for critical issues
- [ ] Document workarounds for known issues
- [ ] Update test plan based on findings

---

**Test Plan Version**: 1.0  
**Last Updated**: January 7, 2026  
**Approved By**: [QA Lead Name]  
**Status**: ✅ Ready for Execution
