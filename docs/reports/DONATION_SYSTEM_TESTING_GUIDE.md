# Donation System Testing Guide

## Overview

This guide covers testing the new per-recording donation system with unique QR codes and editable 90-word excerpts.

**Key Features:**
- Each recording gets a unique donation URL: `/donate/[recordingId]`
- QR codes always encode the canonical donation URL
- Users can edit a ~90-word excerpt that appears on the donation page
- No AI/LLM - purely form-based and deterministic
- Works with or without Stripe configuration

---

## Prerequisites

Before testing, ensure:

1. **Backend running** on port 3001
   ```powershell
   cd C:\Users\richl\Care2system\v1-backend
   node server.js
   ```

2. **Frontend running** on port 3000
   ```powershell
   cd C:\Users\richl\Care2system\v1-frontend
   npm run dev
   ```

3. **PostgreSQL database running** (Docker container)
   ```powershell
   docker ps --filter "name=postgres"
   ```

4. **Database migrated** with new donation fields
   ```powershell
   cd v1-backend
   npx prisma migrate dev
   ```

---

## Test Scenario 1: Full Flow (New Recording)

### Step 1: Create a New Recording

1. Navigate to `http://localhost:3000/tell-your-story`
2. Grant microphone permission if prompted
3. Click "Start Recording"
4. Record for at least 5 seconds
5. Click "Stop Recording"
6. Fill in profile:
   - Name: "Jane Smith"
   - Email: "jane@example.com"
   - Phone: "555-0123"
7. Click "Save & Continue"
8. **Expected:** Redirected to Recording Overview page (`/story/[recordingId]`)

### Step 2: Navigate to Donation Tools

1. On Recording Overview page, locate the "Fundraising Tools" card
2. Click "Generate Donation Tools" button
3. **Expected:** Redirected to `/story/[recordingId]/donation-tools`
4. **Expected:** Form pre-filled with:
   - Campaign Title: "Support Jane's Journey"
   - Funding Goal: (empty)
   - Short Description: Pre-filled template text

### Step 3: Generate Draft Excerpt

1. Verify the pre-filled description
2. Optionally edit the description (add more details)
3. Click "Generate Draft Excerpt" button
4. **Expected:** 
   - Form transitions to show "Donation Page Excerpt (~90 words)" textarea
   - Excerpt is auto-generated from first ~90 words of description
   - Word count displayed below textarea
   - "Back to edit description" link visible

### Step 4: Edit the Excerpt

1. Review the auto-generated excerpt
2. Edit the text in the textarea:
   - Add or remove sentences
   - Adjust wording
   - Keep it around 70-110 words
3. Watch the word count update as you type
4. **Expected:** Word count updates in real-time

### Step 5: Save & Generate QR Code

1. Optionally add a funding goal (e.g., "1000")
2. Click "Save & Generate QR Code" button
3. **Expected:**
   - Loading spinner appears
   - Request sent to backend: `POST /api/recordings/:id/donation-settings`
   - Page transitions to show generated tools
   - Success banner appears: "Donation Tools Ready!"

### Step 6: Verify Generated Tools

**QR Code Section:**
1. Verify QR code image is displayed (300x300px canvas)
2. Verify "Donation Page URL" shows: `http://localhost:3000/donate/[recordingId]`
3. Click "Download QR Code (PNG)" button
4. **Expected:** PNG file downloads named `donation-qr-[recordingId].png`
5. Open the PNG file - verify it's a valid QR code

**Excerpt Preview Section:**
1. Verify "Page Title" shows your campaign title
2. Verify "Excerpt" shows your edited text
3. Verify word count is displayed
4. If you set a goal, verify it shows: "Funding Goal: $1000"

### Step 7: Preview Donation Page

1. Click "Preview Donation Page" button
2. **Expected:** Opens `/donate/[recordingId]` in new tab
3. Verify donation page shows:
   - Campaign title in header
   - First name only (e.g., "Supporting Jane's journey")
   - Your edited excerpt in the story section
   - Funding goal (if set) in the sidebar
   - Donation form with amount buttons ($10, $25, $50)
   - "Donate with Card" button (or "Donations Not Available" if Stripe not configured)

### Step 8: Test Donation Page (Stripe Configured)

**If Stripe keys are configured:**

1. On the donation page, select an amount (e.g., $25)
2. Click "Donate with Card"
3. **Expected:** Redirected to Stripe Checkout
4. Verify:
   - Checkout session shows correct amount
   - Description mentions the recordingId
   - Cancel URL goes back to `/story/[recordingId]/donation-tools`
   - Success URL goes to `/donate/success?session_id=...&recording=[recordingId]`

**If Stripe keys are NOT configured:**

1. **Expected:** Yellow banner appears at top:
   - "Donations Not Enabled"
   - "This page is for preview/testing only"
2. "Donate with Card" button is disabled
3. Button text changes to "Donations Not Available"

### Step 9: Test QR Code with Phone

1. Download the QR code PNG from Step 6
2. Open the PNG on your computer
3. Use your phone camera or QR scanner app to scan the code
4. **Expected:** 
   - Phone browser opens to `http://localhost:3000/donate/[recordingId]`
   - (Note: If testing locally, you'll need to use your computer's IP address instead of localhost, or deploy to a public URL)

### Step 10: Edit Existing Settings

1. Go back to `/story/[recordingId]/donation-tools`
2. **Expected:** 
   - Tools section shows (QR code + preview)
   - Your saved settings are displayed
3. Click "Edit Settings" button
4. **Expected:**
   - Form reappears with saved values pre-filled
   - Title, goal, and excerpt are loaded from database
5. Make changes to the excerpt
6. Click "Save & Generate QR Code" again
7. **Expected:** Settings updated, QR code regenerated

---

## Test Scenario 2: Edge Cases

### Test 2.1: Recording Without Profile Name

1. Create a recording with incomplete profile data
2. Try to generate donation tools
3. **Expected:** Error or generic fallback text

### Test 2.2: Very Long Title

1. Enter a campaign title with 200+ characters
2. Save settings
3. **Expected:** Title is saved (no validation error)
4. Check donation page - verify title displays correctly without breaking layout

### Test 2.3: Excerpt Too Short

1. Try to save an excerpt with only 5 words
2. **Expected:** Backend returns 400 error: "Excerpt must be between 10 and 200 words"
3. Frontend shows error message

### Test 2.4: Excerpt Too Long

1. Generate an excerpt with 250+ words
2. Try to save
3. **Expected:** Backend returns 400 error: "Excerpt must be between 10 and 200 words"
4. Frontend shows error message

### Test 2.5: HTML Injection Attempt

1. Enter excerpt with HTML tags: `<script>alert('XSS')</script>`
2. Save settings
3. **Expected:** 
   - Backend sanitizes HTML (removes tags)
   - Excerpt saved as plain text only
4. Verify on donation page - no script executes, only text displays

### Test 2.6: Special Characters

1. Enter excerpt with special characters: `I'm sharing my story—it's important! ❤️`
2. Save settings
3. **Expected:** Characters are preserved
4. Verify on donation page - displays correctly

### Test 2.7: No Goal Set

1. Generate tools without entering a funding goal
2. **Expected:** 
   - Tools generated successfully
   - Donation page shows no goal section
   - Donation form still works

---

## Test Scenario 3: Privacy & Security

### Test 3.1: Verify No PII in URL

1. Create a recording with full profile (name, email, phone)
2. Generate donation tools
3. Check the donation URL displayed
4. **Expected:** 
   - URL contains ONLY the recordingId (opaque UUID)
   - No name, email, phone, or other PII in URL
   - Format: `http://localhost:3000/donate/[uuid]`

### Test 3.2: Verify Only First Name on Donation Page

1. Create recording with profile name: "Jane Elizabeth Smith"
2. Visit donation page
3. **Expected:** 
   - Page shows: "Supporting Jane's journey"
   - Only first name visible
   - Last name is NOT displayed

### Test 3.3: Backend Response Check

1. Open browser DevTools (F12)
2. Navigate to `/donate/[recordingId]`
3. Go to Network tab
4. Find the request to `GET /api/donations/recording/:id`
5. Check response JSON
6. **Expected:** Response includes:
   - ✅ `recordingId`
   - ✅ `title`
   - ✅ `excerpt`
   - ✅ `goal`
   - ✅ `firstName` (only)
   - ✅ `createdAt`
   - ❌ NO `email`
   - ❌ NO `phone`
   - ❌ NO full `name`

### Test 3.4: Database Check (Admin)

1. Connect to PostgreSQL:
   ```powershell
   docker exec -it [container-id] psql -U careconnect_user -d careconnect
   ```
2. Query recording:
   ```sql
   SELECT id, "donationTitle", "donationGoal", "donationExcerpt" 
   FROM recordings 
   WHERE id = '[your-recording-id]';
   ```
3. **Expected:** 
   - Title, goal, and excerpt are stored
   - No email or phone in this table (those are in user_profiles)

---

## Test Scenario 4: Multiple Recordings

### Test 4.1: Same User, Different Stories

1. Create Recording 1 for "Jane Smith" - set donation tools
2. Create Recording 2 for "Jane Smith" - set different donation tools
3. Visit `/donate/[recording1-id]` - verify Recording 1 excerpt
4. Visit `/donate/[recording2-id]` - verify Recording 2 excerpt
5. **Expected:** Each recording has its own unique donation page

### Test 4.2: Different Users

1. Create Recording A for "Jane Smith"
2. Create Recording B for "John Doe"
3. Generate donation tools for both
4. **Expected:** 
   - Each has unique QR code
   - Each has unique donation URL
   - No data cross-contamination

---

## Test Scenario 5: Backend Logging

### Test 5.1: Verify Donation Settings Saved Event

1. Generate donation tools
2. Check backend console logs
3. **Expected:** Log entry:
   ```
   [DONATION_SETTINGS_SAVED] recordingId: [uuid] wordCount: 87
   ```

### Test 5.2: Verify Donation Page View Event

1. Visit `/donate/[recordingId]`
2. Check backend console logs
3. **Expected:** Log entry:
   ```
   [DONATION_PAGE_VIEW] recordingId: [uuid] timestamp: 2025-12-05T18:47:06.123Z
   ```
4. **Verify:** No PII in the log (only recordingId and timestamp)

---

## Test Scenario 6: Mobile Responsiveness

### Test 6.1: Mobile Donation Tools Page

1. Open DevTools (F12)
2. Toggle device emulation (iPhone 12)
3. Navigate to `/story/[recordingId]/donation-tools`
4. **Expected:**
   - Form fields stack vertically
   - Buttons are full-width
   - QR code is centered
   - Text is readable

### Test 6.2: Mobile Donation Landing Page

1. Keep device emulation on (iPhone 12)
2. Navigate to `/donate/[recordingId]`
3. **Expected:**
   - Story and donation form stack on mobile (md:grid-cols-1)
   - Amount buttons are tappable (min 44x44px)
   - Text is legible
   - No horizontal scroll

---

## Common Issues & Solutions

### Issue 1: QR Code Not Displaying

**Symptoms:** Canvas element is blank after clicking "Save & Generate QR Code"

**Solutions:**
- Check browser console for errors
- Verify `qrcode` package is installed: `npm list qrcode`
- Verify import statement in page.tsx
- Check if canvas ref is correctly set

### Issue 2: Excerpt Not Pre-filling

**Symptoms:** After clicking "Generate Draft Excerpt", textarea is empty

**Solutions:**
- Check that description field has content
- Verify `generateExcerpt` function logic
- Check console for errors
- Ensure word splitting logic handles edge cases (empty strings, multiple spaces)

### Issue 3: Backend 404 on Save

**Symptoms:** Error when clicking "Save & Generate QR Code"

**Solutions:**
- Verify backend is running on port 3001
- Check endpoint exists: `POST /api/recordings/:id/donation-settings`
- Verify recordingId is valid UUID
- Check Prisma schema migration ran successfully

### Issue 4: Donation Page Shows "Not Found"

**Symptoms:** `/donate/[recordingId]` returns 404

**Solutions:**
- Verify donation settings were saved (check database)
- Ensure recording has `donationExcerpt` field populated
- Check backend endpoint: `GET /api/donations/recording/:id`
- Verify recordingId is correct

---

## Performance Benchmarks

Expected performance metrics:

| Action | Expected Time |
|--------|---------------|
| Load donation-tools page | < 500ms |
| Generate excerpt | Instant |
| Save donation settings | < 1s |
| Generate QR code | < 2s |
| Download QR code | Instant |
| Load donation page | < 500ms |

If any action exceeds these benchmarks, investigate:
- Network latency
- Database query performance
- Frontend rendering issues

---

## Regression Testing Checklist

Before deploying, verify:

- [ ] Existing recording workflow still works (no breaking changes)
- [ ] Audio upload still works
- [ ] Profile attachment still works
- [ ] Recording Overview page displays correctly
- [ ] Old recordings without donation settings don't crash
- [ ] Admin endpoints still work
- [ ] Stripe checkout flow for non-donation payments still works
- [ ] No console errors on any page
- [ ] No TypeScript compilation errors
- [ ] Database schema is up to date
- [ ] All new endpoints have proper error handling

---

## Clean Up Test Data

After testing, clean up:

### Option 1: SQL (specific recording)
```sql
DELETE FROM recording_event_logs WHERE "recordingId" = '[test-recording-id]';
DELETE FROM recordings WHERE id = '[test-recording-id]';
```

### Option 2: SQL (all test data)
```sql
TRUNCATE TABLE recording_event_logs CASCADE;
TRUNCATE TABLE recordings CASCADE;
TRUNCATE TABLE user_profiles CASCADE;
```

### Option 3: Prisma Studio
```powershell
cd v1-backend
npx prisma studio
# Navigate to tables and delete test records
```

---

## Success Criteria

The feature is ready for production when:

1. ✅ All test scenarios pass
2. ✅ No console errors in browser or backend
3. ✅ QR codes scan correctly on mobile devices
4. ✅ Donation page loads in < 500ms
5. ✅ Excerpt word count is accurate
6. ✅ No PII in URLs (only opaque recordingId)
7. ✅ Backend logs include [DONATION_PAGE_VIEW] events
8. ✅ Stripe integration works (or gracefully handles no-keys mode)
9. ✅ Mobile responsive design works on iOS and Android
10. ✅ Edit settings flow works (can update excerpt after initial save)
11. ✅ Multiple recordings can have separate donation settings
12. ✅ HTML injection is prevented (sanitization works)

---

## Deployment Checklist

Before going live:

1. [ ] Set production BASE_URL in environment variables:
   - `NEXT_PUBLIC_BASE_URL=https://your-domain.com`
2. [ ] Configure Stripe production keys:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
3. [ ] Update success/cancel URLs in checkout endpoint to production domain
4. [ ] Test QR code generation with production URL
5. [ ] Test donation flow end-to-end in production
6. [ ] Verify HTTPS is working (required for secure payment processing)
7. [ ] Set up monitoring for [DONATION_PAGE_VIEW] logs
8. [ ] Create analytics dashboard (future enhancement)

---

## Future Enhancements (V2+)

Ideas to consider:

1. **Save QR Code to Database** - Store QR code image URL for faster loading
2. **Analytics Dashboard** - Track page views, donations, conversion rates
3. **Social Sharing Buttons** - Twitter, Facebook, LinkedIn share buttons
4. **Email Templates** - "Email this story to a friend" feature
5. **Multi-language Support** - Spanish, other languages
6. **Custom QR Code Styling** - Branded QR codes with logo
7. **Progress Tracking** - Show donation progress bar on landing page
8. **Donor Comments** - Allow donors to leave messages
9. **Matching Campaigns** - "Double your impact" features
10. **Recurring Donations** - Monthly giving options

---

## Support & Troubleshooting

For issues, check:

1. **Browser Console** (F12) - Frontend errors
2. **Backend Console** - API errors and logs
3. **Network Tab** (F12) - API request/response details
4. **Prisma Studio** - Database state: `npx prisma studio`
5. **Docker Logs** - PostgreSQL logs: `docker logs [container-id]`

If you encounter a bug not covered in this guide, document:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS version
- Console errors (if any)
- Network logs (if API-related)

---

## Contact

For questions or issues with this feature, refer to the implementation docs:
- `DONATION_TOOLS_IMPLEMENTATION_SUMMARY.md`
- Prisma schema: `v1-backend/prisma/schema.prisma`
- Frontend page: `v1-frontend/app/story/[id]/donation-tools/page.tsx`
- Donation landing page: `v1-frontend/app/donate/[id]/page.tsx`
- Backend endpoints: `v1-backend/server.js` (lines 430-530)

---

**Last Updated:** December 5, 2025  
**Version:** 1.5  
**Feature:** Per-Recording Donation System with Unique QR Codes
