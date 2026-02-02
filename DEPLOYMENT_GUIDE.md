# Care2Connect.org - Production Deployment Guide

**Last Updated:** December 15, 2025  
**Primary Domain:** www.care2connect.org  
**Legacy Domain:** care2connects.org (maintained for backwards compatibility)

## 🚀 DEPLOYMENT STEPS

### 1. Start Backend Server

```powershell
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

**Expected Output:**
- Server running on port 3003
- Database connected successfully
- All routes mounted

### 2. Start Frontend Server

```powershell
cd frontend
npm install
npm run dev
```

**Expected Output:**
- Next.js dev server on port 3000
- All pages compiled successfully

### 3. Start Cloudflare Tunnel

```powershell
# Navigate to cloudflared directory or run from anywhere
cloudflared tunnel run 07e7c160-451b-4d41-875c-a58f79700ae8
```

**Expected Output:**
- Tunnel connected
- Routes active:
  - care2connect.org → localhost:3000
  - www.care2connect.org → localhost:3000
  - api.care2connect.org → localhost:3003
  - (Plus legacy care2connects.org domains)

**Verify Tunnel:**
```powershell
# Test public API endpoint
curl https://api.care2connect.org/health/live

# Should return JSON with "status": "alive"
```

### 4. Verify All Services

```powershell
# Check backend
curl http://localhost:3003/health/live

# Check frontend
curl http://localhost:3000

# Check public API
curl https://api.care2connect.org/health/live

# Check public frontend
curl https://www.care2connect.org
```

## 📋 FEATURE TESTING CHECKLIST

### Test 1: Tell Your Story Flow
1. Navigate to: https://www.care2connect.org/tell-your-story
2. Review and accept consent
3. (Optional) Fill in name, age, location, language
4. Click "Continue to Recording"
5. Click "Start Recording"
6. Speak for 30+ seconds
7. Click "Stop"
8. Play back recording to verify
9. Click "Create My Profile & Documents"
10. Watch processing animation
11. Verify automatic redirect to profile page

**Success Criteria:**
- All steps complete without errors
- Processing status updates every 2 seconds
- Profile page loads with ticket ID
- QR code displays
- GoFundMe draft available for download

### Test 2: Profile Search
1. Navigate to: https://www.care2connect.org/profiles
2. Enter the ticket ID from Test 1
3. Click "Search"
4. Verify profile information displays
5. Click "Resume" button
6. Confirm redirect to profile page

**Success Criteria:**
- Search finds ticket
- Status shows "COMPLETED"
- Assets marked as ready
- Resume button works

### Test 3: Support Ticket Submission
1. From profiles page, click "Get Support"
2. Fill in:
   - Ticket ID (optional)
   - Category
   - Message
   - Contact (optional)
3. Click "Submit Ticket"
4. Verify success message

**Success Criteria:**
- Form submits successfully
- Success toast notification appears
- Form resets after submission

### Test 4: Domain Compatibility
Test all domain variants:

```powershell
# Test care2connect.org (new primary)
curl -I https://care2connect.org
curl -I https://www.care2connect.org
curl -I https://api.care2connect.org/health/live

# Test care2connects.org (legacy)
curl -I https://care2connects.org
curl -I https://www.care2connects.org
curl -I https://api.care2connects.org/health/live
```

**Success Criteria:**
- All domains return 200 OK
- No CORS errors
- Frontend loads on all domain variants
- API responds on all API subdomains

### Test 5: System Admin Access
1. Navigate to: https://www.care2connect.org/system
2. Enter system password
3. Verify dashboard loads
4. Check admin features work

**Success Criteria:**
- Login works
- Dashboard displays system health
- Admin routes accessible after login

## 🔧 TROUBLESHOOTING

### Issue: "Failed to fetch" on Frontend

**Symptoms:**
- Frontend pages show "Unable to fetch..."
- Console shows CORS errors or network errors

**Solution:**
1. Verify backend is running: `curl http://localhost:3003/health/live`
2. Verify Cloudflare tunnel is running: `curl https://api.care2connect.org/health/live`
3. Check browser console for specific error
4. Verify CORS configuration includes the domain you're testing from

### Issue: Cloudflare Tunnel Not Starting

**Symptoms:**
- `cloudflared tunnel run` command fails
- "no such tunnel" error

**Solution:**
1. Verify config file exists: `C:\Users\richl\.cloudflared\config.yml`
2. Verify credentials file exists: `C:\Users\richl\.cloudflared\07e7c160-451b-4d41-875c-a58f79700ae8.json`
3. Check tunnel ID in config matches: `07e7c160-451b-4d41-875c-a58f79700ae8`
4. Restart cloudflared service:
```powershell
Stop-Process -Name cloudflared -Force -ErrorAction SilentlyContinue
cloudflared tunnel run 07e7c160-451b-4d41-875c-a58f79700ae8
```

### Issue: Processing Stuck at "Transcribing"

**Symptoms:**
- Story processing never completes
- Status stuck at TRANSCRIBING for > 2 minutes

**Solution:**
1. Check backend logs for errors
2. Verify OpenAI API key is set (or check fallback is working):
```powershell
cd backend
npx ts-node -e "console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET')"
```
3. Check database for incident logs:
```sql
SELECT * FROM incidents WHERE service = 'openai' ORDER BY "firstSeenAt" DESC LIMIT 5;
```
4. If OpenAI unavailable, verify fallback transcription is being used (check backend logs for "[Transcription] Using fallback")

### Issue: QR Code or Document Not Found

**Symptoms:**
- 404 error when trying to view QR code or download document
- "Document not found on server" error

**Solution:**
1. Verify uploads directory exists:
```powershell
Test-Path backend\uploads\gofundme-drafts
# If false, create it:
New-Item -ItemType Directory -Force -Path backend\uploads\gofundme-drafts
```
2. Check ProfileTicket in database has URLs set:
```sql
SELECT id, "qrCodeUrl", "gofundmeDraftUrl" FROM "profile_tickets" WHERE id = 'YOUR_TICKET_ID';
```
3. Restart backend server to ensure route handlers are properly mounted

### Issue: Support Ticket Submit Fails

**Symptoms:**
- "Failed to submit support ticket" error
- 500 Internal Server Error

**Solution:**
1. Verify support ticket route is mounted:
```powershell
curl http://localhost:3003/api/support/ticket -X POST -H "Content-Type: application/json" -d '{"category":"test","message":"test"}'
```
2. Check database table exists:
```sql
SELECT * FROM "support_tickets" LIMIT 1;
```
3. If table doesn't exist, run migrations:
```powershell
cd backend
npx prisma db push
```

## 🔐 SECURITY CHECKLIST

- [ ] Environment variables are not committed to git
- [ ] `.env` file is in `.gitignore`
- [ ] System admin password is strong (SYSTEM_PANEL_PASSWORD)
- [ ] JWT secret is randomly generated and secure
- [ ] API keys are masked in logs (never printed in full)
- [ ] CORS only allows specified domains
- [ ] Admin routes require authentication (systemAuth middleware)
- [ ] Database connection uses SSL

## 📊 MONITORING

### Health Checks
- **Live Check:** https://api.care2connect.org/health/live
- **Full Health:** https://api.care2connect.org/health/status
- **Dashboard:** https://www.care2connect.org/health

### Logs
- **Backend Console:** Real-time server logs
- **Database Incidents:** `SELECT * FROM incidents ORDER BY "firstSeenAt" DESC;`
- **Support Tickets:** `SELECT * FROM "support_tickets" ORDER BY "createdAt" DESC;`
- **Health Checks:** `SELECT * FROM "health_check_runs" ORDER BY "createdAt" DESC;`

### Key Metrics to Monitor
1. **API Response Time:** Should be < 500ms for most requests
2. **Transcription Success Rate:** Check incidents for OpenAI failures
3. **Pipeline Completion Rate:** % of tickets reaching COMPLETED status
4. **Support Ticket Volume:** Track user issues and categories

## 🎯 POST-DEPLOYMENT TASKS

### Immediate (Do Now)
1. [ ] Test story recording on production domain
2. [ ] Verify profile search works
3. [ ] Test support ticket submission
4. [ ] Check admin login works
5. [ ] Verify QR code generation
6. [ ] Test document download

### Short-term (Within 24 Hours)
1. [ ] Add health check graphs to dashboard
2. [ ] Implement recurring health check scheduler
3. [ ] Add self-heal functionality
4. [ ] Update remaining "Government" → "Community" text
5. [ ] Test speech intelligence smoke tests

### Medium-term (Within 1 Week)
1. [ ] Set up monitoring alerts for incidents
2. [ ] Implement automated backup for database
3. [ ] Add rate limiting for story uploads
4. [ ] Create admin UI for managing support tickets
5. [ ] Add email notifications for critical incidents

## 📞 SUPPORT CONTACTS

**Technical Issues:**
- Check logs first: `backend/` console output
- Database queries: Use Prisma Studio (`npx prisma studio`)
- Cloudflare dashboard: Check tunnel status

**API Keys & Services:**
- OpenAI: Check quota and billing
- Stripe: Verify webhook secret and keys
- Cloudflare: Check tunnel is active and zone is configured

## 🎉 SUCCESS INDICATORS

Your deployment is successful when:
- ✅ https://www.care2connect.org loads
- ✅ Story recording works end-to-end
- ✅ Processing completes within 2 minutes
- ✅ QR codes are generated
- ✅ GoFundMe drafts are downloadable
- ✅ Profile search finds tickets
- ✅ Support tickets submit successfully
- ✅ No CORS errors in browser console
- ✅ All health checks return "healthy"
- ✅ Admin login works

---

**Deployment Complete! 🚀**

For ongoing maintenance and feature development, see [PRODUCTION_V1_STATUS.md](PRODUCTION_V1_STATUS.md)
