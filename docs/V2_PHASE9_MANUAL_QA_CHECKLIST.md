# V2 Phase 9 - Manual QA Checklist

> **Branch**: `v2-intake-scaffold`
> **Commit**: `a08c194`
> **Date**: 2026-02-19
> **Tester**: _______________
> **Environment**: [ ] Local  [ ] Production Domain (tunnel)

---

## Pre-Flight Checks

### 1. Services Running

| Check | Command | Expected | Result |
|-------|---------|----------|--------|
| Backend alive | `curl http://localhost:3001/health/live` | 200 + `{ "status": "alive" }` | [ ] PASS [ ] FAIL |
| Frontend alive | Open http://localhost:3000 in browser | Page loads | [ ] PASS [ ] FAIL |
| V2 enabled | `curl http://localhost:3001/api/v2/intake/health` | 200 (not 404) | [ ] PASS [ ] FAIL |
| V2 auth active | `curl -X POST http://localhost:3001/api/v2/intake/session` | 401 Unauthorized | [ ] PASS [ ] FAIL |

### 2. Preview Gate Verification

| Check | Expected | Result |
|-------|----------|--------|
| V2 API requires Bearer token for mutations | POST /session returns 401 without token | [ ] PASS [ ] FAIL |
| V2 Wizard UI loads (no auth needed for viewing) | /onboarding/v2 shows the wizard form | [ ] PASS [ ] FAIL |
| ZERO_OPENAI_MODE confirmed | No OpenAI API calls made (check logs) | [ ] PASS [ ] FAIL |

---

## UI Walkthrough - V2 Intake Wizard

**URL**: http://localhost:3000/onboarding/v2 (or https://care2connects.org/onboarding/v2)

### Step 1: Wizard Loads

| Check | Action | Expected | Result |
|-------|--------|----------|--------|
| Page renders | Navigate to /onboarding/v2 | Wizard form appears with modules | [ ] PASS [ ] FAIL |
| Feature flag gate | If NEXT_PUBLIC_ENABLE_V2_INTAKE=false | Should show "not available" message | [ ] PASS [ ] FAIL [ ] N/A |
| Module list visible | Look at left sidebar/progress | Module names visible (Demographics, Housing, Safety, etc.) | [ ] PASS [ ] FAIL |
| Responsive design | Resize browser to mobile width | Form adjusts, no horizontal overflow | [ ] PASS [ ] FAIL |

### Step 2: Module Navigation

| Check | Action | Expected | Result |
|-------|--------|----------|--------|
| First module renders | View first module form fields | Input fields visible and interactive | [ ] PASS [ ] FAIL |
| Progress indicator | Check wizard progress bar | Shows current position and total modules | [ ] PASS [ ] FAIL |
| Navigation between modules | Click next/previous | Moves between modules smoothly | [ ] PASS [ ] FAIL |

### Step 3: Data Entry

| Check | Action | Expected | Result |
|-------|--------|----------|--------|
| Text input | Type in a text field | Text appears, no errors | [ ] PASS [ ] FAIL |
| Selection input | Select from dropdown/radio | Selection registers correctly | [ ] PASS [ ] FAIL |
| Validation | Submit empty required field | Shows validation error | [ ] PASS [ ] FAIL |
| Draft saving | Fill data, refresh page | Draft restored (if not DV-safe mode) | [ ] PASS [ ] FAIL |

---

## API Endpoint Checks

### Health & Info Endpoints (No Auth Required)

```powershell
# Run these in PowerShell (Invoke-WebRequest)

# 1. Backend health
Invoke-WebRequest -Uri "http://localhost:3001/health/live" -UseBasicParsing | Select-Object StatusCode,Content

# 2. V2 Intake health
Invoke-WebRequest -Uri "http://localhost:3001/api/v2/intake/health" -UseBasicParsing | Select-Object StatusCode,Content

# 3. V2 Version
Invoke-WebRequest -Uri "http://localhost:3001/api/v2/intake/version" -UseBasicParsing | Select-Object StatusCode,Content

# 4. V2 Schema
Invoke-WebRequest -Uri "http://localhost:3001/api/v2/intake/schema" -UseBasicParsing | Select-Object StatusCode,Content

# 5. Panic button
Invoke-WebRequest -Uri "http://localhost:3001/api/v2/intake/panic-button" -UseBasicParsing | Select-Object StatusCode,Content
```

| Endpoint | Expected Status | Expected Body (key fields) | Result |
|----------|----------------|----------------------------|--------|
| /health/live | 200 | `status: "alive"` | [ ] PASS [ ] FAIL |
| /api/v2/intake/health | 200 | `featureFlag: true, authEnabled: true` | [ ] PASS [ ] FAIL |
| /api/v2/intake/version | 200 | Version + policy pack info | [ ] PASS [ ] FAIL |
| /api/v2/intake/schema | 200 | Array of module schemas | [ ] PASS [ ] FAIL |
| /api/v2/intake/panic-button | 200/302 | Redirect to safe page | [ ] PASS [ ] FAIL |

### Auth-Protected Endpoints (Require Bearer Token)

```powershell
# Must include Authorization header
# These should FAIL without a token (401)

# Without token (expect 401)
Invoke-WebRequest -Uri "http://localhost:3001/api/v2/intake/session" -Method POST -UseBasicParsing
# Expected: 401 Unauthorized

# With token (expect 201 or appropriate response)
# $headers = @{ "Authorization" = "Bearer YOUR_TOKEN" }
# Invoke-WebRequest -Uri "http://localhost:3001/api/v2/intake/session" -Method POST -Headers $headers -UseBasicParsing
```

| Endpoint | Without Token | With Token | Result |
|----------|--------------|------------|--------|
| POST /session | 401 | 201 (session created) | [ ] PASS [ ] FAIL |
| PUT /session/{id} | 401 | 200 (session updated) | [ ] PASS [ ] FAIL |
| POST /session/{id}/complete | 401 | 200 (session scored) | [ ] PASS [ ] FAIL |
| GET /session/{id} | 401 | 200 (session data) | [ ] PASS [ ] FAIL |

---

## DV Safety Checks

**CRITICAL**: These checks ensure DV (Domestic Violence) safety features work correctly.

### Quick Exit / Panic Button

| Check | Action | Expected | Result |
|-------|--------|----------|--------|
| Quick Exit button visible | Load wizard in DV-safe mode | "Exit" button visible at top | [ ] PASS [ ] FAIL |
| Quick Exit behavior | Click "Exit" button | Immediately navigates away (e.g., Google) | [ ] PASS [ ] FAIL |
| No browser history | After Quick Exit, press Back | Should NOT return to wizard | [ ] PASS [ ] FAIL |
| Backend panic endpoint | GET /api/v2/intake/panic-button | Returns safe redirect/content | [ ] PASS [ ] FAIL |

### No Data Retention (DV Mode)

| Check | Action | Expected | Result |
|-------|--------|----------|--------|
| Draft NOT saved in DV mode | Fill form in DV mode, close tab | No `v2-intake-draft` in localStorage | [ ] PASS [ ] FAIL |
| Session storage cleared | Quick exit, check sessionStorage | No V2 intake data retained | [ ] PASS [ ] FAIL |
| No URL params with PII | Check browser URL during wizard | No personal data in URL | [ ] PASS [ ] FAIL |

### How to verify "No data retention":
```javascript
// Run in browser DevTools console after Quick Exit:
console.log('localStorage:', localStorage.getItem('v2-intake-draft'));
// Expected: null

console.log('sessionStorage keys:', Object.keys(sessionStorage));
// Expected: no v2-intake-related keys
```

---

## Production Domain Checks (If Tunnel Active)

Only applicable if `npm run ga:preview:deploy` was run.

| Check | URL | Expected | Result |
|-------|-----|----------|--------|
| Frontend loads over HTTPS | https://care2connects.org/ | Page loads, valid cert | [ ] PASS [ ] FAIL |
| V2 Wizard over HTTPS | https://care2connects.org/onboarding/v2 | Wizard loads | [ ] PASS [ ] FAIL |
| API health over HTTPS | https://api.care2connects.org/health/live | 200 | [ ] PASS [ ] FAIL |
| V2 health over HTTPS | https://api.care2connects.org/api/v2/intake/health | 200 | [ ] PASS [ ] FAIL |
| CORS headers correct | Check Network tab in DevTools | No CORS errors on API calls | [ ] PASS [ ] FAIL |
| Security headers | Check Response headers | X-Content-Type-Options, X-Frame-Options present | [ ] PASS [ ] FAIL |

---

## Evidence Capture Instructions

### Before Starting
1. Create evidence folder:
   ```powershell
   npm run ga:evidence
   ```
2. Note the folder path that opens in Explorer.

### During Testing
For each major check:

1. **Screenshots**: Use `Win+Shift+S` (Snipping Tool) to capture:
   - Wizard page rendering
   - Health check responses in browser
   - Quick Exit behavior (before and after)
   - Any error states encountered
   - Save to: `evidence/{timestamp}/screenshots/`

2. **API Responses**: Save curl/PowerShell output:
   ```powershell
   # Save API responses to files
   Invoke-WebRequest -Uri "http://localhost:3001/api/v2/intake/health" -UseBasicParsing | Select-Object -ExpandProperty Content | Out-File "evidence\api_responses\v2_health.json"
   Invoke-WebRequest -Uri "http://localhost:3001/api/v2/intake/version" -UseBasicParsing | Select-Object -ExpandProperty Content | Out-File "evidence\api_responses\v2_version.json"
   Invoke-WebRequest -Uri "http://localhost:3001/api/v2/intake/schema" -UseBasicParsing | Select-Object -ExpandProperty Content | Out-File "evidence\api_responses\v2_schema.json"
   ```

3. **Logs**: Copy service logs after testing:
   ```powershell
   Copy-Item logs\phase9-*.log evidence\{timestamp}\logs\
   ```

4. **Notes**: Record observations in `evidence/{timestamp}/notes/tester_notes.md`

### After Testing
1. Review all evidence files are saved
2. Commit evidence folder (optional - for audit trail)
3. Report any FAIL items with screenshot references

---

## Summary Table

| Category | Total Checks | Pass | Fail | N/A |
|----------|-------------|------|------|-----|
| Pre-Flight | 4 | | | |
| Preview Gate | 3 | | | |
| UI Walkthrough | 8 | | | |
| API (No Auth) | 5 | | | |
| API (Auth) | 4 | | | |
| DV Safety | 6 | | | |
| Production Domain | 6 | | | |
| **TOTAL** | **36** | | | |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Tester | | | |
| Engineering Lead | | | |
| Clinical Reviewer | | | |
| DV Safety Specialist | | | |

---

*End of Manual QA Checklist*
