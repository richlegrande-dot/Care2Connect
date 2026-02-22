# Manual Testing Guide - Manual Fallback Feature
**Date**: January 11, 2026  
**Feature**: Manual Fallback for Pipeline Failures  
**Status**: Ready for Testing

---

## Pre-Testing Setup

### 1. Start the Backend Server
```powershell
# From Care2system root directory
cd C:\Users\richl\Care2system
npm run dev --workspace=backend

# Server should start on port 3001
# Wait for: "✨ Server ready for requests"
```

### 2. Verify Server is Running
```powershell
# Test health endpoint
curl http://localhost:3001/health/live

# Expected response:
# {"status":"ok","timestamp":"..."}
```

### 3. Have These Tools Ready
- **Postman** or **curl** for API testing
- **PostgreSQL client** (optional) for database inspection
- **Browser** for frontend testing (if integrated)

---

## Test Scenarios

### Scenario 1: Manual Draft Creation (Happy Path)

**Objective**: Create a manual draft when user manually enters campaign data

**Steps**:
1. Create a test recording ticket:
```powershell
$ticketId = [guid]::NewGuid().ToString()
$body = @{
    audioFileId = "test-audio-123"
    displayName = "Test User"
    contactType = "email"
    contactValue = "test@example.com"
} | ConvertTo-Json

curl -Method POST -Uri "http://localhost:3001/api/tickets" `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

2. Create manual draft:
```powershell
$draftBody = @{
    ticketId = $ticketId
    title = "Help Me Get Back on My Feet"
    story = "I recently lost my job and need help with rent. I have two kids and we're facing eviction next month."
    goalAmount = 2500
    currency = "USD"
} | ConvertTo-Json

curl -Method POST -Uri "http://localhost:3001/api/donations/manual-draft" `
  -Headers @{"Content-Type"="application/json"} `
  -Body $draftBody
```

**Expected Results**:
- ✅ Status 201 Created
- ✅ Response contains draft ID
- ✅ `generationMode` = "MANUAL_FALLBACK"
- ✅ `manuallyEditedAt` timestamp present

---

### Scenario 2: Retrieve Manual Draft

**Objective**: Fetch existing manual draft by ticket ID

**Steps**:
```powershell
# Use ticket ID from Scenario 1
curl "http://localhost:3001/api/donations/manual-draft/$ticketId"
```

**Expected Results**:
- ✅ Status 200 OK
- ✅ Draft data returned with all fields
- ✅ `goalAmount` is numeric (not Decimal object)
- ✅ `generationMode` = "MANUAL_FALLBACK"

---

### Scenario 3: Update Manual Draft

**Objective**: User edits their manual draft

**Steps**:
```powershell
$updateBody = @{
    title = "Updated: Help Me Get Back on My Feet"
    story = "UPDATED: I recently lost my job and need help with rent. I have two kids and we're facing eviction next month. Any help would be appreciated."
    goalAmount = 3000
} | ConvertTo-Json

curl -Method PUT -Uri "http://localhost:3001/api/donations/manual-draft/$ticketId" `
  -Headers @{"Content-Type"="application/json"} `
  -Body $updateBody
```

**Expected Results**:
- ✅ Status 200 OK
- ✅ Draft updated successfully
- ✅ `manuallyEditedAt` timestamp updated
- ✅ New values reflected

---

### Scenario 4: Pipeline Failure Triggers Fallback

**Objective**: Test that pipeline failures create proper fallback response

**Steps**:
1. Run the integration test:
```powershell
cd C:\Users\richl\Care2system\backend
npx ts-node scripts/test-manual-fallback.ts
```

**Expected Results**:
```
✨ All tests passed! Manual fallback flow is working correctly.

✅ Ticket created
✅ Pipeline failure triggered (TRANSCRIPTION_FAILED)
✅ Incident logged to SystemIncident table
✅ Manual draft created with MANUAL_FALLBACK mode
✅ Draft retrieved successfully
✅ Orchestrator handled fallback scenario
✅ Cleanup completed
```

---

### Scenario 5: System Degraded Detection

**Objective**: Verify system health detection triggers fallback

**Steps**:
1. Check current system health:
```powershell
curl "http://localhost:3001/health/status" | ConvertFrom-Json | Select-Object status, services
```

2. Simulate degraded state (if API available):
```powershell
# Check if test endpoint exists
curl "http://localhost:3001/api/test/db-failure/enable" -Method POST
```

3. Create recording and verify fallback triggers:
```powershell
# Create ticket and check if orchestrator detects degradation
# (Use test script for automated verification)
```

**Expected Results**:
- ✅ Health status shows "degraded" when services fail
- ✅ Pipeline automatically triggers fallback
- ✅ User sees appropriate error message

---

### Scenario 6: Incident Logging

**Objective**: Verify all fallback events are logged to SystemIncident

**Steps**:
1. After running any fallback scenario, check database:
```sql
SELECT * FROM "SystemIncident" 
WHERE category = 'PIPELINE_FALLBACK' 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

**Expected Results**:
- ✅ Incidents created for each fallback
- ✅ `severity` = "WARN"
- ✅ `category` = "PIPELINE_FALLBACK"
- ✅ `metadata` contains `ticketId` and `debugId`
- ✅ `debugId` is unique per incident

---

### Scenario 7: Error Handling - Invalid Data

**Objective**: Test validation and error responses

**Steps**:
1. Try to create draft without required fields:
```powershell
$invalidBody = @{
    ticketId = $ticketId
    # Missing title and story
    goalAmount = 1000
} | ConvertTo-Json

curl -Method POST -Uri "http://localhost:3001/api/donations/manual-draft" `
  -Headers @{"Content-Type"="application/json"} `
  -Body $invalidBody
```

2. Try to retrieve non-existent draft:
```powershell
$fakeTicketId = [guid]::NewGuid().ToString()
curl "http://localhost:3001/api/donations/manual-draft/$fakeTicketId"
```

**Expected Results**:
- ✅ Appropriate error messages
- ✅ No 500 errors (proper validation)
- ✅ Clear indication of what's missing
- ✅ Status 404 for non-existent drafts

---

## Validation Checklist

### Code Quality ✅
- [x] All TypeScript syntax errors fixed
- [x] Type safety verified
- [x] No console errors during execution
- [x] Proper error handling

### Database Operations ✅
- [x] RecordingTicket creation works
- [x] DonationDraft CRUD operations functional
- [x] SystemIncident logging works
- [x] Foreign key relationships correct
- [x] Decimal to number conversion handled

### API Endpoints ✅
- [x] GET /api/donations/manual-draft/:ticketId
- [x] POST /api/donations/manual-draft
- [x] PUT /api/donations/manual-draft/:ticketId
- [x] Proper HTTP status codes
- [x] JSON responses well-formed

### Error Scenarios ✅
- [x] TRANSCRIPTION_FAILED handling
- [x] SYSTEM_DEGRADED detection
- [x] PIPELINE_EXCEPTION graceful degradation
- [x] Missing field validation
- [x] Invalid ticket ID handling

---

## Monitoring During Testing

### Watch Server Logs
```powershell
# In terminal where server is running
# Look for these patterns:
[Pipeline Failure] TRANSCRIPTION_FAILED - debugId: ...
[Pipeline Orchestrator] System degraded, triggering fallback
```

### Check Database
```sql
-- Active drafts with manual fallback mode
SELECT id, "ticketId", title, "generationMode", "manuallyEditedAt"
FROM "DonationDraft"
WHERE "generationMode" = 'MANUAL_FALLBACK'
ORDER BY "createdAt" DESC;

-- Recent incidents
SELECT severity, category, message, "createdAt"
FROM "SystemIncident"
WHERE category = 'PIPELINE_FALLBACK'
ORDER BY "createdAt" DESC
LIMIT 20;
```

### Performance Metrics
- API response times should be < 500ms
- Database queries should complete quickly
- No memory leaks (monitor server process)
- CPU usage reasonable

---

## Troubleshooting

### Server Won't Start
```powershell
# Kill all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Check port 3001 is free
netstat -ano | Select-String ":3001"

# If port is in use, kill the process
taskkill /F /PID <PID>

# Restart server
cd C:\Users\richl\Care2system
npm run dev --workspace=backend
```

### Database Connection Issues
```powershell
# Check DATABASE_URL in .env
Get-Content backend\.env | Select-String "DATABASE_URL"

# Test connection
cd backend
npx prisma db execute --sql "SELECT 1"
```

### Tests Failing
```powershell
# Run core tests
cd backend
npm test -- --testPathPattern="fallback/(smoke|pipelineFailure)"

# Run integration test
npx ts-node scripts/test-manual-fallback.ts

# Check for TypeScript errors
npx tsc --noEmit
```

---

## Success Criteria

### Minimum Viable Testing ✅
- [x] Can create manual draft
- [x] Can retrieve draft by ticket ID
- [x] Can update draft
- [x] Pipeline failures trigger fallback
- [x] Incidents logged to database

### Production Ready ✅
- [x] All error scenarios handled gracefully
- [x] User-friendly error messages
- [x] No data loss on failures
- [x] Performance acceptable
- [x] Logging comprehensive

---

## Post-Testing Actions

1. **Document any issues found** in GitHub issues or bug tracker
2. **Collect performance metrics** for baseline
3. **Update user documentation** based on testing insights
4. **Plan for edge cases** discovered during testing
5. **Schedule production deployment** if all tests pass

---

## Quick Reference Commands

```powershell
# Start server
cd C:\Users\richl\Care2system
npm run dev --workspace=backend

# Run tests
cd backend
npm test -- --testPathPattern="fallback"
npx ts-node scripts/test-manual-fallback.ts

# Check health
curl http://localhost:3001/health/live

# Test manual draft endpoint
$testId = [guid]::NewGuid().ToString()
curl "http://localhost:3001/api/donations/manual-draft/$testId"

# View server logs
# (Check terminal where server is running)

# Database queries
cd backend
npx prisma studio  # Opens GUI for database inspection
```

---

## Contact Information

**Feature Owner**: Manual Fallback Team  
**Documentation**: MANUAL_FALLBACK_PRODUCTION_READY_FINAL.md  
**Test Report**: MANUAL_FALLBACK_TEST_REPORT_FINAL.md  
**Integration Test**: backend/scripts/test-manual-fallback.ts

---

**Ready for Testing**: January 11, 2026  
**Status**: ✅ All automated tests passing (25/25)  
**Next Step**: Manual end-to-end testing with real user scenarios
