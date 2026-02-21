# Donation System Implementation Summary

## Overview

Successfully implemented a per-recording donation system where **every recording gets its own unique QR code** that links to a **donation page** showing a **~90-word excerpt** that users can edit.

**Key Principle:** No AI/LLM - purely form-based and deterministic.

---

## What Was Built

### 1. Database Schema Changes

**File:** `v1-backend/prisma/schema.prisma`

**Changes:** Extended `Recording` model with 4 new optional fields:

```prisma
model Recording {
  // ... existing fields ...
  
  // Donation settings (V1.5 feature)
  donationTitle   String?  // Campaign title for donation page
  donationExcerpt String?  @db.Text // ~90-word excerpt for donation landing page
  donationGoal    Int?     // Optional donation goal in cents
  donationSlug    String?  // Optional short slug for future use
}
```

**Migration:** `20251205184706_add_donation_fields/migration.sql`

**Result:** All existing recordings unaffected (nullable fields), new recordings can have donation settings.

---

### 2. Backend API Endpoints

**File:** `v1-backend/server.js` (added ~120 lines)

#### Endpoint 1: Save Donation Settings

```javascript
POST /api/recordings/:id/donation-settings
```

**Request Body:**
```json
{
  "donationTitle": "Support Jane's Journey",
  "donationGoal": 100000,  // cents ($1000)
  "donationExcerpt": "I'm sharing my story to ask for help..."
}
```

**Features:**
- Validates title and excerpt are present
- Sanitizes excerpt (removes HTML tags)
- Validates word count (10-200 words)
- Saves to database
- Logs event: `[DONATION_SETTINGS_SAVED]`

**Response:**
```json
{
  "success": true,
  "recording": {
    "id": "uuid",
    "donationTitle": "Support Jane's Journey",
    "donationGoal": 100000,
    "donationExcerpt": "I'm sharing my story..."
  }
}
```

#### Endpoint 2: Fetch Donation Info (Public)

```javascript
GET /api/donations/recording/:id
```

**Purpose:** Public endpoint for the donation landing page

**Features:**
- Returns only first name (privacy protection)
- Excludes email and phone (PII)
- Returns 404 if donation settings not configured
- Logs page view: `[DONATION_PAGE_VIEW]` (no PII)

**Response:**
```json
{
  "success": true,
  "donation": {
    "recordingId": "uuid",
    "title": "Support Jane's Journey",
    "excerpt": "I'm sharing my story...",
    "goal": 100000,
    "firstName": "Jane",  // Only first name
    "createdAt": "2025-12-05T18:47:06.123Z"
  }
}
```

**Privacy:** No `email`, `phone`, or full `name` in response.

---

### 3. Donation Tools Page (Updated)

**File:** `v1-frontend/app/story/[id]/donation-tools/page.tsx`

**Major Changes:**

#### Before (Old Flow):
1. User fills form (title, goal, description)
2. Click "Generate Donation Tools"
3. Creates Stripe checkout → shows QR for checkout URL

#### After (New Flow):
1. User fills form (title, goal, description)
2. Click "Generate Draft Excerpt" → extracts ~90 words
3. User edits excerpt in textarea (with word count)
4. Click "Save & Generate QR Code"
5. Saves to DB, generates QR for `/donate/[recordingId]`

**Key Features:**

**Excerpt Generation:**
```typescript
const generateExcerpt = (text: string): string => {
  const words = text.trim().split(/\s+/)
  const targetWords = Math.min(words.length, 90)
  return words.slice(0, targetWords).join(' ')
}
```

**Editable Textarea:**
- Word count display
- Real-time updates as user types
- "Back to edit description" link
- Validation on save (10-200 words)

**QR Code:**
- Always uses canonical URL: `/donate/[recordingId]`
- Generated with qrcode library + canvas
- 300x300px, 2px margin
- Download as PNG
- Shows underlying URL for verification

**Load Existing Settings:**
- If donation settings exist, pre-fills form
- Shows tools immediately if saved
- Edit button to update settings

---

### 4. Public Donation Landing Page (New)

**File:** `v1-frontend/app/donate/[id]/page.tsx` (370 lines)

**Design:** Clean, trust-focused, mobile-responsive

**Layout:**

```
┌─────────────────────────────────────────┐
│  Header (CareConnect logo)              │
├─────────────────────────────────────────┤
│  ┌──────────────────┬─────────────────┐ │
│  │ Story Section    │ Donation Form   │ │
│  │ - Title + icon   │ - Goal (if set) │ │
│  │ - First name     │ - Quick amounts │ │
│  │ - Excerpt (~90w) │ - Custom input  │ │
│  │ - CareConnect    │ - Donate button │ │
│  │   info banner    │ - Share button  │ │
│  └──────────────────┴─────────────────┘ │
├─────────────────────────────────────────┤
│  Footer (copyright, link to home)       │
└─────────────────────────────────────────┘
```

**Key Sections:**

1. **Title Card:**
   - Campaign title (e.g., "Support Jane's Journey")
   - "Supporting [FirstName]'s journey"
   - Heart icon in gradient circle

2. **Story Content:**
   - "Their Story" heading
   - The editable excerpt (prose styling)
   - Whitespace preserved (whitespace-pre-wrap)

3. **CareConnect Info Banner:**
   - Blue background
   - Info icon
   - "Shared via CareConnect Portal" notice

4. **Donation Form (Sidebar):**
   - Funding goal display (if set)
   - Quick amount buttons: $10, $25, $50
   - Custom amount input
   - "Donate with Card" button
   - Secure payment notice (Stripe logo)
   - Share button (copy link)

5. **Demo Mode Banner (if Stripe not configured):**
   - Yellow background
   - Warning icon
   - "Donations Not Enabled" message
   - Button disabled

**Behavior:**

**With Stripe Configured:**
- Creates checkout session via existing endpoint
- Redirects to Stripe Checkout
- Success URL: `/donate/success?session_id=...&recording=[id]`
- Cancel URL: `/story/[id]/donation-tools`

**Without Stripe Configured:**
- Shows yellow banner
- Button disabled ("Donations Not Available")
- Page still functional for preview

**Mobile Responsive:**
- Grid switches to single column on mobile
- Sticky sidebar on desktop
- Tappable buttons (min 44x44px)

---

## Privacy & Security Implementation

### 1. URL Privacy
- ✅ URLs contain **ONLY** `recordingId` (opaque UUID)
- ❌ NO name, email, phone in URL
- Format: `https://domain.com/donate/a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### 2. API Response Privacy
- ✅ Returns `firstName` only (e.g., "Jane")
- ❌ NO full name, email, phone
- See endpoint response JSON above

### 3. HTML Sanitization
```javascript
const sanitizedExcerpt = donationExcerpt
  .replace(/<[^>]*>/g, '') // Remove HTML tags
  .trim();
```
- Prevents XSS attacks
- User can't inject `<script>` tags

### 4. Logging (Analytics-Ready, No PII)
```javascript
console.log(`[DONATION_PAGE_VIEW] recordingId: ${id} timestamp: ${timestamp}`);
```
- Only recordingId and timestamp
- No user data logged

---

## User Flows

### Flow 1: Admin/Staff Creating Donation Tools

1. Record audio story
2. Attach profile (name, email, phone)
3. View Recording Overview → see "Fundraising Tools" card
4. Click "Generate Donation Tools"
5. Form pre-fills with:
   - Title: "Support [FirstName]'s Journey"
   - Description: Template about housing/needs
6. Edit description as needed
7. Click "Generate Draft Excerpt"
8. Review ~90-word excerpt
9. Edit excerpt to perfect it
10. Set funding goal (optional)
11. Click "Save & Generate QR Code"
12. Download QR code PNG
13. Share QR code (print, post online, etc.)
14. Click "Preview Donation Page" to verify

### Flow 2: Donor Scanning QR Code

1. Donor scans QR code with phone camera
2. Opens `/donate/[recordingId]` in browser
3. Reads campaign title
4. Reads story excerpt (~90 words)
5. Sees CareConnect notice
6. Chooses donation amount ($10, $25, $50, or custom)
7. Clicks "Donate with Card"
8. Redirects to Stripe Checkout
9. Enters payment details
10. Completes donation
11. Redirects to success page

### Flow 3: Editing Existing Settings

1. Admin goes back to `/story/[recordingId]/donation-tools`
2. Page loads with existing settings (from DB)
3. Tools section shows QR + preview
4. Click "Edit Settings"
5. Form reappears with saved values
6. Make changes to excerpt
7. Click "Save & Generate QR Code" again
8. Settings updated in DB
9. QR code regenerated (same URL)

---

## Technical Architecture

### Data Flow: Save Settings

```
Frontend Form
    ↓
POST /api/recordings/:id/donation-settings
    ↓
Validate input
    ↓
Sanitize HTML
    ↓
Check word count
    ↓
prisma.recording.update()
    ↓
Log event
    ↓
Return success
    ↓
Frontend: Generate QR code (canvas)
    ↓
Display tools
```

### Data Flow: Load Donation Page

```
User visits /donate/[id]
    ↓
GET /api/donations/recording/:id
    ↓
prisma.recording.findUnique()
    ↓
Extract first name from profile
    ↓
Log [DONATION_PAGE_VIEW]
    ↓
Return donation info
    ↓
Frontend: Render page
    ↓
User clicks Donate
    ↓
POST /api/payments/create-donation-checkout
    ↓
Create Stripe session
    ↓
Return checkoutUrl
    ↓
Redirect to Stripe
```

---

## QR Code Implementation

**Library:** `qrcode@^1.5.3` (canvas-based)

**Generation:**
```typescript
import QRCode from 'qrcode'

const generateQRCode = async (url: string) => {
  await QRCode.toCanvas(canvasRef.current, url, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' }
  })
  
  const dataUrl = canvasRef.current.toDataURL('image/png')
  setQrCodeDataUrl(dataUrl)
}
```

**Download:**
```typescript
const downloadQRCode = () => {
  const link = document.createElement('a')
  link.download = `donation-qr-${recordingId}.png`
  link.href = qrCodeDataUrl
  link.click()
}
```

**URL Format:**
```
http://localhost:3000/donate/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Production:**
```
https://careconnect.org/donate/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

Set via: `NEXT_PUBLIC_BASE_URL` environment variable

---

## Testing Coverage

See `DONATION_SYSTEM_TESTING_GUIDE.md` for comprehensive test scenarios.

**Quick Test (5 minutes):**
1. Create recording
2. Generate donation tools
3. Edit excerpt
4. Save & generate QR
5. Preview donation page
6. Verify excerpt displays

**Full Test (30 minutes):**
- All user flows
- Edge cases (empty fields, long text, HTML injection)
- Privacy checks (no PII in URLs)
- Mobile responsiveness
- Stripe integration (configured & demo mode)

---

## Configuration

### Development (Demo Mode)

**Backend:** `v1-backend/.env`
```env
# Stripe keys commented out or not set
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

**Frontend:** `v1-frontend/.env.local`
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Result:**
- Donation pages show yellow banner
- QR codes use localhost URL
- Donate button disabled
- All other features work

### Production (Live Mode)

**Backend:** `v1-backend/.env`
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Frontend:** `v1-frontend/.env.local`
```env
NEXT_PUBLIC_BASE_URL=https://careconnect.org
```

**Result:**
- QR codes use production URL
- Donate button creates real Stripe sessions
- Payments processed live

---

## Files Modified/Created

### Modified (3 files)

1. **`v1-backend/prisma/schema.prisma`** (+4 lines)
   - Added donation fields to Recording model

2. **`v1-backend/server.js`** (+120 lines)
   - Added 2 new endpoints

3. **`v1-frontend/app/story/[id]/donation-tools/page.tsx`** (refactored)
   - Changed from Stripe checkout to canonical URL
   - Added excerpt generation and editing
   - Added save to database logic
   - Improved UI/UX

### Created (3 files)

1. **`v1-frontend/app/donate/[id]/page.tsx`** (370 lines)
   - Public donation landing page

2. **`DONATION_SYSTEM_TESTING_GUIDE.md`** (850+ lines)
   - Comprehensive testing guide

3. **`DONATION_SYSTEM_QUICK_REFERENCE.md`** (this file)
   - Implementation summary

### Database Migration

1. **`v1-backend/prisma/migrations/20251205184706_add_donation_fields/migration.sql`**
   - Auto-generated by Prisma

---

## Dependencies

### Backend
- `@prisma/client@^7.1.0` (existing)
- No new dependencies

### Frontend
- `qrcode@^1.5.3` (NEW)
- `@types/qrcode@^1.5.5` (NEW)

**Install:**
```powershell
cd v1-frontend
npm install qrcode @types/qrcode
```

---

## Performance Metrics

**Expected Performance:**

| Action | Expected Time |
|--------|---------------|
| Load donation-tools page | < 500ms |
| Generate excerpt | Instant |
| Save donation settings | < 1s |
| Generate QR code | < 2s |
| Download QR code | Instant |
| Load donation page | < 500ms |
| Create Stripe session | < 1s |

---

## Known Limitations

1. **Profile required** - Need a profile with a name to generate tools
2. **No real-time word count validation** - Checked on save, not live (now fixed - shows live)
3. **Demo mode URL is placeholder** - Shows localhost URL if Stripe not configured
4. **No edit history** - Can update, but no version tracking
5. **QR not persisted** - Regenerated on demand (performance: fine for V1)

---

## Future Enhancements (V2+)

1. **Persist QR codes** - Save to `/uploads/qr/` and store URL in DB
2. **Analytics dashboard** - Track views, donations, conversion rates
3. **Social sharing** - Twitter/Facebook share buttons
4. **Email templates** - "Email this story" feature
5. **Multi-language** - Spanish, other languages
6. **Custom QR styling** - Branded QR codes with logo
7. **Progress bar** - Show donation progress toward goal
8. **Donor comments** - Allow donors to leave messages
9. **Matching campaigns** - "Double your impact" features
10. **Recurring donations** - Monthly giving options

---

## Deployment Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_BASE_URL` to production domain
- [ ] Configure Stripe production keys
- [ ] Test QR code generation with production URL
- [ ] Test end-to-end donation flow
- [ ] Verify HTTPS is working
- [ ] Check privacy: no PII in URLs
- [ ] Verify excerpt sanitization works
- [ ] Test on mobile devices (iOS + Android)
- [ ] Set up monitoring for [DONATION_PAGE_VIEW] logs
- [ ] Create admin documentation

---

## Success Criteria

The feature is production-ready when:

✅ All test scenarios pass  
✅ No console errors  
✅ QR codes scan correctly  
✅ Donation page loads < 500ms  
✅ Word count is accurate  
✅ No PII in URLs  
✅ Backend logging works  
✅ Stripe integration works  
✅ Mobile responsive  
✅ Edit settings flow works  
✅ HTML injection prevented  

---

## Support & Maintenance

**For bugs/issues:**
1. Check browser console (F12)
2. Check backend logs
3. Check database with Prisma Studio: `npx prisma studio`
4. Review this document + testing guide

**For questions:**
- Technical details: This document
- Testing procedures: `DONATION_SYSTEM_TESTING_GUIDE.md`
- Quick reference: `DONATION_SYSTEM_QUICK_REFERENCE.md`

---

**Last Updated:** December 5, 2025  
**Version:** 1.5  
**Status:** ✅ COMPLETE  
**Next:** Manual UAT
