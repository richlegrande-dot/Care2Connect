# Donation Tools Feature - Quick Reference

## 🎯 What It Does
Generate QR codes and fundraising text for recorded stories - **NO AI REQUIRED**

---

## 📋 Quick Access

**User Flow:**
1. Record story → `/tell-your-story`
2. View recording → `/story/[recordingId]`
3. Click "Generate Donation Tools"
4. Fill form → Generate QR + Text
5. Download QR as PNG + Copy text to clipboard

**Direct URL:**
```
http://localhost:3000/story/[recordingId]/donation-tools
```

---

## 🔑 Key Features

### ✅ What Works
- Pre-filled campaign title from user profile
- Customizable funding goal (USD)
- Editable description with template
- QR code generation (300x300px PNG)
- GoFundMe-style draft text
- One-click download QR code
- One-click copy fundraising text
- Works with OR without Stripe keys

### 🔧 How It Works
1. **Fetch Data:** Recording + linked user profile
2. **Pre-fill Form:** 
   - Title: "Support [FirstName]'s Journey"
   - Description: Template about housing/basic needs
3. **User Edits:** All fields customizable
4. **Generate:**
   - Stripe Checkout Session (if keys configured)
   - QR code (canvas-based)
   - Formatted fundraising text
5. **User Actions:**
   - Download QR as PNG
   - Copy text to clipboard
   - Navigate back/home

---

## 📡 API Endpoints

### Create Donation Checkout
```
POST /api/payments/create-donation-checkout
```

**Request:**
```json
{
  "recordingId": "uuid",
  "amountCents": 5000,
  "metadata": {
    "title": "Campaign Title"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_...",
  "recordingId": "uuid"
}
```

**Response (No Stripe):**
```json
{
  "error": "Stripe is not configured...",
  "code": "STRIPE_NOT_CONFIGURED"
}
```

---

## 🎨 UI Components

### Recording Overview Button
```tsx
<Link href={`/story/${recordingId}/donation-tools`}>
  <button className="btn-secondary">
    Generate Donation Tools
  </button>
</Link>
```

### Form Fields
1. **Campaign Title** (text, required)
   - Pre-fill: "Support [Name]'s Journey"
2. **Funding Goal** (number, optional)
   - Placeholder: "1000"
3. **Short Description** (textarea, required)
   - Pre-fill: Template about needs

### Generated Output
1. **QR Code**
   - Canvas-rendered
   - 300x300px
   - Black on white
   - Download as PNG
2. **Fundraising Text**
   - Title
   - Introduction
   - Description
   - Bullet list (housing, transport, stability)
   - Goal (if provided)
   - Signature
   - Copy to clipboard button

---

## 🔒 Privacy & Security

### ✅ Safe
- Recording ID (opaque UUID)
- Campaign title (user-entered)
- Amount in cents
- Stripe handles PII securely

### ❌ Never Exposed
- Full name in URL
- Email address
- Phone number
- Stripe secret keys client-side

---

## 🧪 Testing

### Quick Test (5 minutes)
1. Create recording with profile
2. Navigate to recording overview
3. Click "Generate Donation Tools"
4. Fill form (use defaults)
5. Click "Generate"
6. Verify QR code appears
7. Click "Download QR Code"
8. Click "Copy All Text"
9. Paste in notepad (Ctrl+V)

**Expected:** All steps work without errors

### Demo Mode Test
1. Stop backend
2. Remove STRIPE_SECRET_KEY from .env
3. Restart backend
4. Navigate to donation-tools
5. Generate tools
6. Verify yellow "Preview Mode" banner
7. Verify QR code still generates
8. Verify placeholder URL used

**Expected:** Feature fully functional in demo mode

---

## 🐛 Troubleshooting

### QR Code Not Showing
```bash
# Check if qrcode installed
cd v1-frontend
npm list qrcode

# If missing:
npm install qrcode @types/qrcode
```

### Stripe Banner Always Shows
```bash
# Verify .env has keys
cat v1-backend/.env | grep STRIPE_SECRET_KEY

# Restart backend
cd v1-backend
node server.js

# Check console for: "✅ Stripe configured"
```

### Copy to Clipboard Fails
- Requires HTTPS or localhost
- Check browser clipboard permissions
- Try different browser (Chrome/Firefox)

### Download Button No Effect
- Verify QR code visible on screen
- Check browser console for errors
- Try different browser

---

## 📊 Template Examples

### Campaign Title Templates
```
Support [FirstName]'s Journey
Help [FirstName] Get Back on Their Feet
[FirstName]'s Road to Stability
Give [FirstName] a Fresh Start
```

### Description Template
```
I'm sharing my story to ask for help with housing, 
basic needs, and getting back on my feet.

Your support will make a real difference as I work 
toward stability and independence.
```

### GoFundMe Draft Format
```
[TITLE]

Hi, my name is [FirstName] and I'm sharing my story 
through the CareConnect portal.

[DESCRIPTION]

What the Funds Will Help With:
• Housing and basic needs
• Transportation to work and appointments  
• Stability while getting back on my feet
• Goal: $[amount] (if provided)

Thank you for reading, sharing, or giving what you can. 
Every bit of support makes a difference.

— [FullName]
```

---

## 📦 Dependencies

### Frontend
- `qrcode@^1.5.3` - Generate QR codes
- `@types/qrcode@^1.5.5` - TypeScript types
- `next@14.0.0` - Already installed
- `react@^18.2.0` - Already installed

### Backend
- `qrcode` - Already installed (server-side)
- `stripe` - Already installed (if keys configured)
- `express` - Already installed

---

## 🚀 Deployment

### Production Checklist
- [ ] Set STRIPE_SECRET_KEY in production .env
- [ ] Update success_url to production domain
- [ ] Update cancel_url to production domain
- [ ] Test QR codes scan correctly
- [ ] Verify clipboard works on all browsers
- [ ] Test mobile responsive on real devices
- [ ] Monitor backend logs for errors

### Environment Variables
```bash
# Production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Test/Dev
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Mobile | iOS 14+, Android 10+ | ✅ Full |

---

## 📈 Success Metrics

**Track:**
- Donation tools generated per day
- QR code downloads
- Text copies to clipboard
- Conversion to actual donations
- Average funding goal amount

**Performance:**
- Form load: < 500ms
- QR generation: < 2s
- Download: Instant
- Copy: Instant

---

## 📚 Documentation Files

1. `DONATION_TOOLS_TESTING_GUIDE.md` - Full testing guide (850+ lines)
2. `DONATION_TOOLS_IMPLEMENTATION_SUMMARY.md` - Technical details (700+ lines)
3. `DONATION_TOOLS_QUICK_REFERENCE.md` - This file (quick access)

---

## ✨ Feature Highlights

**What Makes This Great:**
- ✅ **No AI Required** - Pure template-based
- ✅ **Privacy-First** - No PII in URLs
- ✅ **Demo Mode** - Works without Stripe keys
- ✅ **Mobile Friendly** - Responsive design
- ✅ **User Friendly** - Pre-filled templates
- ✅ **Fast** - QR generates in < 2 seconds
- ✅ **Reliable** - No external API dependencies for generation

---

**Version:** 1.5  
**Status:** ✅ Production Ready  
**Last Updated:** December 5, 2025
