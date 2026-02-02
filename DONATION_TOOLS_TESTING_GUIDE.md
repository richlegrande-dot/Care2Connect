# Donation Tools Feature - Testing Guide

**Feature:** Manual "Generate Donation Tools" flow (V1.5)  
**Date:** December 5, 2025  
**Type:** Deterministic, user-guided (no AI/LLM)

---

## Overview

The Donation Tools feature allows users to:
1. Create a campaign title, goal, and description for their recorded story
2. Generate a QR code linking to a Stripe donation checkout
3. Get a GoFundMe-style draft text they can copy and paste

**Key Constraints:**
- ✅ No AI APIs used (purely template-based)
- ✅ Reuses existing Stripe integration
- ✅ Works in "demo mode" when Stripe is not configured
- ✅ No PII exposed in URLs beyond opaque recordingId

---

## Prerequisites

Before testing:
1. ✅ Backend server running on port 3001
2. ✅ Frontend server running on port 3000
3. ✅ PostgreSQL database connected
4. ✅ At least one recording created with linked user profile

### Required for Complete System Validation:
- Stripe keys configured in backend `.env` (critical for payment flow integrity):
  ```
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

---

## Test Scenario 1: Full Flow (Stripe Configured)

### Prerequisites
- Stripe keys are set in backend environment variables
- User has created a recording with a profile (name required)

### Steps

**1. Create a Test Recording**
```
1. Navigate to http://localhost:3000/tell-your-story
2. Allow microphone access
3. Record a 10-second audio clip
4. Click "Save Recording"
5. Fill out profile form:
   - Name: "Jane Doe"
   - Email: jane@example.com (optional)
   - Phone: 555-0123 (optional)
6. Submit profile
7. Note the recordingId from the URL
```

**2. Navigate to Recording Overview**
```
1. Go to http://localhost:3000/story/[recordingId]
2. Verify page loads with:
   - Audio player
   - Recording details
   - Status badge
   - "Fundraising Tools" card (green/emerald gradient)
3. Verify "Generate Donation Tools" button is visible
```

**3. Click Generate Donation Tools**
```
1. Click "Generate Donation Tools" button
2. Verify navigation to /story/[recordingId]/donation-tools
3. Verify page loads with:
   - Header: "Generate Donation Tools"
   - Form with 3 fields:
     * Campaign Title (pre-filled: "Support Jane's Journey")
     * Funding Goal (optional, empty)
     * Short Description (pre-filled with template)
```

**4. Fill Out Form**
```
1. Review pre-filled Campaign Title
   - Should show: "Support [FirstName]'s Journey"
2. Optionally edit title to: "Help Jane Get Back on Her Feet"
3. Enter Funding Goal: 1000
4. Review pre-filled description
5. Optionally customize description
6. Click "Generate Donation Tools"
```

**5. Verify QR Code Generation**
```
1. Wait for generation to complete (1-2 seconds)
2. Verify QR code appears:
   - Square QR code image (300x300px)
   - Black and white design
   - Donation link shown below QR code
   - Link format: https://checkout.stripe.com/c/pay/cs_test_...
3. Click "Download QR Code"
4. Verify PNG file downloads:
   - Filename: donation-qr-[recordingId].png
   - Opens in image viewer
```

**6. Verify GoFundMe Draft Text**
```
1. Scroll to "Draft Fundraising Text" section
2. Verify text includes:
   - Title from form
   - Introduction: "Hi, my name is Jane..."
   - Description from form
   - Bullet points:
     * Housing and basic needs
     * Transportation to work and appointments
     * Stability while getting back on my feet
     * Goal: $1000 (if entered)
   - Closing: "Thank you for reading..."
   - Signature: "— Jane Doe"
3. Click "Copy All Text"
4. Verify alert: "Copied to clipboard!"
5. Paste into a text editor (Ctrl+V or Cmd+V)
6. Verify full text copied correctly
```

**7. Test Donation Flow (Optional)**
```
1. Scan QR code with mobile device OR
2. Copy donation link and open in browser
3. Verify Stripe Checkout page loads
4. Verify campaign name appears: "Help Jane Get Back on Her Feet"
5. Verify amount or donation form
6. DO NOT complete payment (test mode only)
7. Click "Back" or close tab
```

**8. Navigation**
```
1. From donation-tools page, click "Back to Recording"
2. Verify return to /story/[recordingId]
3. Navigate back to donation-tools
4. Click "Add Another Recording"
5. Verify navigation to /tell-your-story
6. Navigate back to donation-tools
7. Click "Go Home"
8. Verify navigation to /
```

### Expected Results
- ✅ All form fields work correctly
- ✅ QR code generates and displays
- ✅ QR code downloads as PNG file
- ✅ GoFundMe text copies to clipboard
- ✅ Stripe checkout URL works
- ✅ All navigation buttons work
- ✅ No console errors
- ✅ Mobile responsive (test on small screen)

---

## Test Scenario 2: Demo Mode (Stripe NOT Configured)

### Prerequisites
- Stripe keys are NOT set in backend environment variables
- User has created a recording with a profile

### Steps

**1. Start Backend Without Stripe Keys**
```
1. Stop backend server
2. Remove or comment out STRIPE_SECRET_KEY from .env
3. Start backend: node server.js
4. Verify console shows: "⚠️  STRIPE_SECRET_KEY not set. Stripe payments disabled."
```

**2. Navigate to Donation Tools**
```
1. Go to http://localhost:3000/story/[recordingId]/donation-tools
2. Fill out form:
   - Title: "Support John's Journey"
   - Goal: 500
   - Description: (use default or customize)
3. Click "Generate Donation Tools"
```

**3. Verify Demo Mode Banner**
```
1. After generation completes, verify yellow banner appears:
   - Icon: Warning triangle
   - Heading: "Preview Mode"
   - Text: "Stripe is not configured in this environment. The QR code and links shown are for layout and testing purposes only..."
2. Verify banner is clearly visible at top of generated tools
```

**4. Verify QR Code Still Generates**
```
1. Verify QR code appears (placeholder URL)
2. Verify donation link shows: http://localhost:3000/donate/[recordingId]
3. Click "Download QR Code"
4. Verify PNG downloads successfully
5. Scan QR code (will go to placeholder page)
```

**5. Verify GoFundMe Text Still Works**
```
1. Verify draft text generates correctly
2. Click "Copy All Text"
3. Verify clipboard copy works
4. Verify all text formatting preserved
```

### Expected Results
- ✅ Yellow "Preview Mode" banner clearly visible
- ✅ QR code generates with placeholder URL
- ✅ Download still works
- ✅ Copy to clipboard still works
- ✅ User understands this is demo/testing mode
- ✅ No errors or crashes

---

## Test Scenario 3: Edge Cases

### Test 3A: Recording Without Profile
```
1. Create recording WITHOUT submitting profile form
2. Navigate to /story/[recordingId]/donation-tools
3. Verify form loads but:
   - Campaign title is generic (no name to pre-fill)
   - Description is generic
4. User can still fill out form manually
5. Generation works but GoFundMe text may show "Unknown" for name
```

### Test 3B: Very Long Campaign Title
```
1. Enter 200-character campaign title
2. Verify form accepts it
3. Generate tools
4. Verify title displays correctly (may wrap)
5. Verify copy to clipboard works
```

### Test 3C: No Funding Goal
```
1. Leave "Funding Goal" field empty
2. Generate tools
3. Verify default amount used ($50)
4. Verify GoFundMe text does NOT include goal bullet point
5. Verify QR code still generates
```

### Test 3D: Special Characters in Description
```
1. Enter description with:
   - Line breaks (Enter key)
   - Quotation marks ("test")
   - Apostrophes (can't, won't)
   - Emojis (❤️ 🙏)
2. Generate tools
3. Verify formatting preserved in GoFundMe text
4. Verify copy to clipboard works
```

### Test 3E: Network Interruption
```
1. Start filling out form
2. Disconnect network (turn off WiFi)
3. Click "Generate Donation Tools"
4. Verify error handling:
   - Error message displays
   - Form data not lost
   - User can retry after reconnecting
```

### Expected Results
- ✅ Edge cases handled gracefully
- ✅ No crashes or blank screens
- ✅ Helpful error messages
- ✅ Form data preserved on errors

---

## Test Scenario 4: Mobile Responsiveness

### Steps
```
1. Open donation-tools page on mobile device or:
   - Chrome DevTools → Toggle Device Toolbar
   - Select "iPhone 12 Pro" or "Pixel 5"
2. Verify form layout:
   - Inputs are full-width
   - Text is readable (not too small)
   - Buttons are tappable (min 44x44px)
3. Fill out form
4. Generate tools
5. Verify QR code:
   - Scaled appropriately
   - Not cut off
   - Download button accessible
6. Verify GoFundMe text:
   - Scrollable if needed
   - Copy button accessible
7. Verify navigation buttons:
   - Stack vertically on small screens
   - All buttons tappable
```

### Expected Results
- ✅ All elements visible and usable on mobile
- ✅ No horizontal scrolling required
- ✅ Text readable without zooming
- ✅ Buttons large enough to tap accurately
- ✅ QR code appropriately sized

---

## Test Scenario 5: Privacy & Security

### Steps
```
1. Generate donation tools for a recording
2. Inspect donation URL:
   - Verify NO full name in URL
   - Verify NO email in URL
   - Verify NO phone in URL
   - Only recordingId should be visible (UUID)
3. Open browser DevTools → Network tab
4. Generate tools again
5. Inspect API requests:
   - Verify Stripe secret key NOT sent to frontend
   - Verify only recordingId in request body
6. Check Stripe Checkout metadata:
   - Can include recordingId (opaque UUID)
   - Can include title (user-entered, safe)
   - Should NOT include PII
```

### Expected Results
- ✅ No PII in donation URLs
- ✅ No Stripe secrets exposed client-side
- ✅ Only opaque IDs in public URLs
- ✅ Metadata safe for Stripe webhooks

---

## Test Scenario 6: Admin Verification

### Steps
```
1. As user, generate donation tools
2. Complete a test donation (use Stripe test card)
3. Log into admin panel: http://localhost:3001/admin/login
   - Password: Hayfield::
4. Navigate to Donation Ledger
5. Verify donation appears with:
   - Recording ID (if tracked)
   - Amount
   - Status: "completed"
6. Verify no duplicate entries
```

### Expected Results
- ✅ Donations tracked in ledger
- ✅ Recording association preserved (if implemented)
- ✅ No data corruption

---

## Common Issues & Solutions

### Issue: QR Code Not Displaying
**Symptoms:** Blank space where QR code should be  
**Solutions:**
1. Check browser console for errors
2. Verify qrcode package installed: `npm list qrcode`
3. Verify canvas element exists in DOM
4. Try clearing browser cache

### Issue: "Stripe Not Configured" Banner Always Shows
**Symptoms:** Yellow banner appears even with Stripe keys set  
**Solutions:**
1. Verify .env file has STRIPE_SECRET_KEY
2. Restart backend server after adding keys
3. Check backend console for "✅ Stripe configured" message
4. Verify no typos in environment variable name

### Issue: Copy to Clipboard Doesn't Work
**Symptoms:** Alert shows but text not copied  
**Solutions:**
1. Verify browser supports Clipboard API
2. Test in HTTPS or localhost (required for clipboard access)
3. Check browser permissions for clipboard
4. Try in different browser

### Issue: Download QR Code Button Does Nothing
**Symptoms:** Click has no effect  
**Solutions:**
1. Verify QR code generated (visible on screen)
2. Check browser console for errors
3. Verify canvas has data (right-click → inspect)
4. Try in different browser

### Issue: Form Pre-fill Not Working
**Symptoms:** Title and description fields are empty  
**Solutions:**
1. Verify recording has linked user profile
2. Check profile has name field populated
3. Verify API endpoint returns profile data
4. Check browser console for fetch errors

---

## Performance Benchmarks

**Expected Load Times:**
- Form page load: < 500ms
- QR code generation: < 2 seconds
- Download QR code: Instant
- Copy to clipboard: Instant

**Browser Support:**
- Chrome/Edge 90+: ✅ Full support
- Firefox 88+: ✅ Full support
- Safari 14+: ✅ Full support
- Mobile browsers: ✅ Full support

---

## Regression Testing Checklist

After any code changes, verify:

- [ ] Recording Overview page still loads correctly
- [ ] "Generate Donation Tools" button appears
- [ ] Donation tools page loads without errors
- [ ] Form accepts valid input
- [ ] QR code generates
- [ ] Download QR code works
- [ ] Copy to clipboard works
- [ ] Navigation buttons work
- [ ] Stripe configured mode works
- [ ] Stripe NOT configured mode shows banner
- [ ] Mobile layout looks correct
- [ ] No console errors
- [ ] No PII in URLs
- [ ] Backend logging works

---

## Test Data Cleanup

After testing, clean up test data:

**Recordings:**
```sql
-- Delete test recordings (optional)
DELETE FROM recordings WHERE audio_url LIKE '%test%';
```

**QR Codes:**
```bash
# Delete generated QR code files
rm v1-backend/uploads/qr/qr-*.png
```

**Mock Donations:**
```
# Mock donations are in-memory only (restart backend to clear)
```

---

## Success Criteria

**Feature is ready for production when:**

✅ All 6 test scenarios pass  
✅ No console errors in any scenario  
✅ Mobile responsive on iOS and Android  
✅ Works with and without Stripe configured  
✅ QR codes download correctly  
✅ Clipboard copy works reliably  
✅ No PII exposed in URLs or network requests  
✅ Performance meets benchmarks  
✅ Admin can verify donations (when Stripe configured)  

---

## Known Limitations

1. **Profile Required for Name Pre-fill**
   - If recording has no linked profile, form uses generic text
   - User can manually enter any text

2. **No Real-Time Validation**
   - Funding goal not validated against Stripe limits until generation
   - User will see error if amount too high (>$5000)

3. **Placeholder URL in Demo Mode**
   - When Stripe not configured, URL goes to non-functional page
   - Production should always have Stripe configured

4. **No Edit After Generation**
   - User must refresh page to start over
   - Future: Add "Edit" button to regenerate

---

**End of Testing Guide**  
**Version:** 1.5  
**Last Updated:** December 5, 2025
