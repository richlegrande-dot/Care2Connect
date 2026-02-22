# 🚀 CareConnect Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- OpenAI API key
- Stripe test keys (optional for donation features)
- Modern browser (Chrome, Firefox, or Safari)

## Installation

### 1. Clone & Install Dependencies

```bash
# Backend setup
cd backend
npm install

# Frontend setup (new terminal)
cd frontend
npm install
```

### 2. Configure Environment

```bash
# Backend environment
cd backend
cp .env.example .env
```

Edit `backend/.env` with your keys:
```env
OPENAI_API_KEY=your_openai_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
JWT_SECRET=your_random_secret_here
```

### 3. Start Services

```bash
# Terminal 1: Start backend
cd backend
npm run dev
# Backend running on http://localhost:3001

# Terminal 2: Start frontend
cd frontend
npm run dev
# Frontend running on http://localhost:3000
```

### 4. Validate System

```bash
# Run validation script
node validate-demo.js
# Should show: Overall Readiness: 100%
```

## Demo Flow

1. **Open Browser:** Navigate to `http://localhost:3000`
2. **Allow Microphone:** Click "Allow" when prompted
3. **Press Record:** Click the big red button
4. **Speak Story:** Tell your fundraising story (30-60 seconds)
5. **Watch Magic:** AI extracts fields and generates campaign
6. **Answer Questions:** Fill in any missing information
7. **Review Campaign:** See professional GoFundMe preview
8. **Generate QR:** Create donation QR code
9. **Export Document:** Download Word doc with instructions

## Troubleshooting

### Microphone Not Working
- Check browser permissions in settings
- Try different browser
- Use "Type Your Story Instead" button

### API Errors
- Verify OpenAI API key in `.env`
- Check internet connection
- Use manual input mode as fallback

### Port Conflicts
```bash
# Change backend port
# In backend/.env: PORT=3002

# Change frontend port
# Run: npm run dev -- -p 3001
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests (requires servers running)
cd frontend
npx playwright test
```

## Demo Tips

- **Clear Audio:** Find quiet space to record
- **Speak Naturally:** Don't rush, take your time
- **Include Details:** Name, location, amount, reason
- **Have Backup:** Prepare manual story text just in case
- **Test First:** Run through demo once before presenting

## Support

- **Validation:** Run `node validate-demo.js` anytime
- **Documentation:** See `FEATURE_CONFIRMATION_REPORT.md`
- **Demo Script:** See `DEMO_SCRIPT.md`
- **Readiness:** See `DEMO_READINESS_REPORT.md`

## Quick Commands Reference

```bash
# Start everything
npm run dev         # In both backend and frontend

# Run tests
npm test            # In both directories

# Build for production
npm run build       # In both directories

# Validate system
node validate-demo.js   # From root directory
```

---

**Status Check:**
```bash
✅ Backend running on :3001
✅ Frontend running on :3000
✅ OpenAI API key configured
✅ Microphone permissions granted
🎉 Ready for demo!
```