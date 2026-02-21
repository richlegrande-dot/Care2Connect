# Demo Sanity Checklist

**Quick 60-Second Pre-Demo Verification**

Use this checklist before every demo or presentation to ensure CareConnect is fully operational.

---

## Pre-Demo Checklist (60 seconds)

### Step 1: Access System Panel (10 seconds)
```
✓ Navigate to: http://localhost:3000/system
✓ Password: blueberry:y22
✓ Panel loads successfully
```

**PASS looks like:**
- ✅ Password accepted
- ✅ Dashboard displays immediately
- ✅ No error messages

**FAIL? Do this:**
1. Check backend is running: `curl http://localhost:3001/health/status`
2. If not running: `cd backend && npm run dev`
3. If frontend error: `cd frontend && npm run dev`

---

### Step 2: Check System Status Cards (15 seconds)
```
✓ System Status: Ready (green) or Degraded (yellow)
✓ Database: Connected (green) or note if intentionally disabled
✓ Storage: Connected (green) or note if intentionally disabled
✓ User Errors: Count < 10 (or investigate if higher)
```

**PASS looks like:**
- ✅ **Ready** status in strict/demo mode
- ✅ All enabled features showing green
- ✅ No unexpected "Disconnected" states

**FAIL? Do this:**
1. **Status: Unhealthy (red)**
   - Click status card for details
   - Check blocking reasons
   - Fix missing services or switch to demo mode: `FEATURE_INTEGRITY_MODE=demo`

2. **Database: Disconnected**
   ```bash
   # Start PostgreSQL
   docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=password postgres
   ```

3. **Storage: Disconnected**
   - Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
   - Or disable storage: `FEATURE_STORAGE_ENABLED=false`

---

### Step 3: Run Safe Tests (20 seconds)
```
✓ Click "Run Tests" button
✓ Wait for tests to complete (typically 150-300ms)
✓ Verify all required tests pass (✓)
```

**PASS looks like:**
```
✓ storageWritable     (15ms)
✓ healthReady        (22ms)
✓ qrGeneration       (45ms)
✓ wordExport         (78ms)
✓ supportTicketWrite (12ms)

Total: 172ms
```

**FAIL? Do this:**
1. **storageWritable fails:**
   ```bash
   mkdir -p backend/data/test backend/data/uploads
   chmod 755 backend/data/test backend/data/uploads
   ```

2. **healthReady fails:**
   - Backend not responding
   - Restart: `cd backend && npm run dev`

3. **qrGeneration or wordExport fails:**
   ```bash
   cd backend
   npm install qrcode docx
   ```

4. **supportTicketWrite fails:**
   ```bash
   mkdir -p backend/data/support-tickets
   chmod 755 backend/data/support-tickets
   ```

---

### Step 4: Test Core User Flow (10 seconds)
```
✓ Navigate to homepage: http://localhost:3000
✓ Click "Tell Your Story" button
✓ Verify recording page loads
✓ (Optional) Test microphone permission prompt
```

**PASS looks like:**
- ✅ Homepage loads with hero section
- ✅ "Tell Your Story" button visible and clickable
- ✅ Recording page loads without errors
- ✅ Microphone permission prompt appears (if testing audio)

**FAIL? Do this:**
1. **404 errors:**
   - Frontend not running: `cd frontend && npm run dev`

2. **Blank page or React errors:**
   - Check browser console (F12)
   - Clear cache and reload (Ctrl+Shift+R)

3. **Microphone permission denied:**
   - Browser setting: Allow microphone for localhost
   - Chrome: chrome://settings/content/microphone

---

### Step 5: Verify Integrity Mode (5 seconds)
```
✓ Check terminal output for "DEMO SAFE MODE" banner (if enabled)
✓ Note integrity mode: strict, demo, or dev
✓ Confirm no unexpected blocking reasons
```

**PASS looks like:**
```
🔧 Integrity Mode: demo
✅ Ready: YES
✓ donations
✓ email
✓ transcription
✓ storage
✓ database
```

**FAIL? Do this:**
1. **Integrity Mode: strict, Ready: NO**
   - Either fix missing services
   - Or switch to demo mode: `FEATURE_INTEGRITY_MODE=demo`

2. **Unexpected blocking reasons:**
   - Review each reason in System Panel
   - Fix or disable corresponding feature

---

## Quick Reference: Common Issues

### Issue: Backend won't start
```bash
# Check for port conflicts
lsof -ti:3001 | xargs kill -9

# Enable demo safe mode
echo "DEMO_SAFE_MODE=true" >> backend/.env

# Start backend
cd backend && npm run dev
```

### Issue: Frontend won't start
```bash
# Check for port conflicts
lsof -ti:3000 | xargs kill -9

# Install dependencies
cd frontend && npm install

# Start frontend
npm run dev
```

### Issue: Database connection fails
```bash
# Start PostgreSQL with Docker
docker run -d --name postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=password \
  postgres

# Or disable database feature
echo "FEATURE_DATABASE_ENABLED=false" >> backend/.env
```

### Issue: "Degraded Mode Active" warnings
**This is normal in demo mode!**
- Degraded mode allows the system to run without all services
- Check System Panel to see which services are missing
- Either fix missing services or continue with degraded functionality

### Issue: Tests failing in System Panel
```bash
# Fix all permission issues at once
cd backend
mkdir -p data/test data/uploads data/support-tickets data/user-errors
chmod -R 755 data/

# Reinstall dependencies
npm install
```

---

## Environment Mode Quick Guide

| Mode | Use Case | Behavior | Missing Services |
|------|----------|----------|------------------|
| **strict** | Production | Refuses to start if required services missing | Exit with code 1 |
| **demo** | Presentations | Starts with warnings, blocks affected features | Shows banner |
| **dev** | Development | Starts with warnings, all features attempt to work | Logs warnings |

**Recommended for demos:** `FEATURE_INTEGRITY_MODE=demo`

---

## 60-Second Success Criteria

Before your demo, verify:

- [ ] System Panel accessible with password
- [ ] Status shows "Ready" or "Degraded" (not "Unhealthy")
- [ ] All 5 safe tests pass (✓✓✓✓✓)
- [ ] Homepage loads correctly
- [ ] Recording page accessible
- [ ] No red error messages in System Panel

**If all checkboxes pass: YOU'RE READY TO DEMO! 🚀**

---

## Emergency Demo Recovery

**If demo breaks mid-presentation:**

1. **Navigate to System Panel immediately**
   - http://localhost:3000/system
   - Shows exactly what's wrong

2. **Run Tests to isolate issue**
   - Click "Run Tests"
   - Note which test fails

3. **Check User Errors**
   - Scroll to bottom of System Panel
   - Check most recent errors for clues

4. **Restart services if needed**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev

   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

5. **Use Demo Safe Mode fallback**
   ```bash
   DEMO_SAFE_MODE=true npm run dev
   ```

---

## Post-Demo Checklist

After demo:

- [ ] Review User Errors in System Panel
- [ ] Check for any alerts (if ALERT_MODE enabled)
- [ ] Note any issues for later investigation
- [ ] (Optional) Export metrics if METRICS_ENABLED

---

**Questions?**
- See: [SYSTEM_PANEL.md](./SYSTEM_PANEL.md) for full documentation
- See: [OPS_RUNBOOK.md](./OPS_RUNBOOK.md) for operational procedures

**Last Updated:** December 2025  
**Version:** 1.6 (Ops Hardening + Strict Integrity)
