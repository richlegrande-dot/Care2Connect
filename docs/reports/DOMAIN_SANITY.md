# Domain Sanity Report
**Date**: January 13, 2026  
**Phase**: Production Domain Validation  
**Status**: ❌ **CRITICAL ISSUES FOUND**

---

## 🚨 Executive Summary

**CRITICAL**: The codebase contains mixed references to BOTH `care2connect.org` (INCORRECT - without 's') and `care2connects.org` (CORRECT - with 's'). This domain confusion is causing production deployment failures.

**CORRECT DOMAIN**: `care2connects.org`  
**INCORRECT DOMAIN**: `care2connect.org` (must be eliminated)

---

## 📋 Files Requiring Immediate Correction

### 🔴 CRITICAL: Production Code Files (Backend)

#### 1. **backend/.env** (Line 138)
```env
CLOUDFLARE_DOMAIN=care2connect.org  ❌ WRONG
```
**Should be:**
```env
CLOUDFLARE_DOMAIN=care2connects.org  ✅ CORRECT
```

#### 2. **backend/src/ops/healthCheckRunner.ts** (Line 484)
```typescript
const domain = process.env.CLOUDFLARE_DOMAIN || 'care2connect.org';  ❌ WRONG
```
**Should be:**
```typescript
const domain = process.env.CLOUDFLARE_DOMAIN || 'care2connects.org';  ✅ CORRECT
```

#### 3. **backend/src/services/healthCheckScheduler.ts** (Line 335)
```typescript
const domain = process.env.CLOUDFLARE_DOMAIN || 'care2connect.org';  ❌ WRONG
```
**Should be:**
```typescript
const domain = process.env.CLOUDFLARE_DOMAIN || 'care2connects.org';  ✅ CORRECT
```

#### 4. **backend/src/routes/health.ts** (Lines 457-464)
```typescript
const expectedHostnames = [
  'care2connect.org',         ❌ WRONG
  'www.care2connect.org',     ❌ WRONG
  'api.care2connect.org',     ❌ WRONG
  'care2connect.org',         ❌ WRONG (duplicate)
  'www.care2connect.org',     ❌ WRONG (duplicate)
  'api.care2connects.org',    ✅ CORRECT
  'care2connect.org',         ❌ WRONG (triplicate!)
  'api.care2connect.org'      ❌ WRONG (duplicate)
];
```
**Should be:**
```typescript
const expectedHostnames = [
  'care2connects.org',         ✅ CORRECT
  'www.care2connects.org',     ✅ CORRECT
  'api.care2connects.org'      ✅ CORRECT
];
```

#### 5. **backend/src/server.ts** (Lines 287-290)
```typescript
// Backup care2connect.org domain for migration  ❌ WRONG COMMENT
'https://care2connect.org',      ❌ WRONG
'https://api.care2connect.org',  ❌ WRONG
'https://www.care2connect.org',  ❌ WRONG
```
**Should be REMOVED** - These are fallback CORS entries that should not exist.

#### 6. **backend/src/routes/story.ts** (Lines 238, 398, 539)
```typescript
profilePageUrl: `https://www.care2connect.org/profile/${ticketId}`,  ❌ WRONG
```
**Should be:**
```typescript
profilePageUrl: `https://www.care2connects.org/profile/${ticketId}`,  ✅ CORRECT
```

---

### 🟠 HIGH PRIORITY: Cloudflare Tunnel Configuration

#### 7. **C:\Users\richl\.cloudflared\config.yml**
```yaml
ingress:
  # New care2connect.org domain  ❌ WRONG COMMENT
  - hostname: api.care2connect.org  ❌ WRONG
    service: http://127.0.0.1:3001
  - hostname: www.care2connect.org  ❌ WRONG
    service: http://127.0.0.1:3000
  - hostname: care2connect.org      ❌ WRONG
    service: http://127.0.0.1:3000
  # Production care2connects.org domain  ✅ CORRECT COMMENT
  - hostname: api.care2connects.org     ✅ CORRECT
    service: http://127.0.0.1:3001
  - hostname: www.care2connect.org      ❌ WRONG (should be care2connects.org)
    service: http://127.0.0.1:3000
  - hostname: care2connect.org          ❌ WRONG (should be care2connects.org)
    service: http://127.0.0.1:3000
```
**Should be:**
```yaml
ingress:
  # Production care2connects.org domain
  - hostname: api.care2connects.org
    service: http://127.0.0.1:3001
  - hostname: www.care2connects.org
    service: http://127.0.0.1:3000
  - hostname: care2connects.org
    service: http://127.0.0.1:3000
  - service: http_status:404
```

---

### 🟡 MEDIUM PRIORITY: Frontend Code Files

#### 8. **frontend/app/tell-your-story/page.tsx** (Line 34)
```typescript
return 'https://api.care2connects.org';  ✅ CORRECT (no change needed)
```

#### 9. **frontend/app/health/page.tsx** (Line 406)
```typescript
headers: { 'Host': 'care2connects.org' }  ✅ CORRECT (no change needed)
```

---

### ✅ DOCUMENTATION FILES (Historical References - OK)

The following files contain references to both domains in **historical context** (incident reports, status reports). These do NOT need changes as they document the confusion:

- PRODUCTION_DOMAIN_DEPLOYMENT_ISSUE_REPORT_2026-01-13.md (explains the issue)
- PRODUCTION_INCIDENT_REPORT_2026-01-13.md (historical tunnel config)
- CONNECTIVITY_ISSUE_REPORT.md (documents Stripe webhook typo)
- DNS_PROBLEM_STATUS_REPORT.md (old DNS debugging)
- DEPLOYMENT_GUIDE.md (OLD - needs archival or update)
- docs/DOMAIN_FIX_RUNBOOK.md (OLD - documents wrong domain)

---

## 🔧 Required Fixes Summary

### Backend Code Files (6 files)
1. `backend/.env` - Change CLOUDFLARE_DOMAIN value
2. `backend/src/ops/healthCheckRunner.ts` - Change default domain
3. `backend/src/services/healthCheckScheduler.ts` - Change default domain
4. `backend/src/routes/health.ts` - Remove wrong domain entries
5. `backend/src/server.ts` - Remove CORS fallback for wrong domain
6. `backend/src/routes/story.ts` - Fix profile URLs (3 locations)

### Tunnel Configuration (1 file)
7. `C:\Users\richl\.cloudflared\config.yml` - Remove all care2connect.org entries, keep only care2connects.org

---

## 🎯 Verification Commands

After fixes are applied, run these searches to confirm NO instances of wrong domain exist:

```powershell
# Should return ZERO matches in production code
grep -r "care2connect\.org" backend/src/
grep -r "care2connect\.org" frontend/app/
grep -r "care2connect\.org" backend/.env

# Tunnel config should only have care2connects.org
Get-Content C:\Users\richl\.cloudflared\config.yml | Select-String "care2connect\.org"
# Should return: NO MATCHES

# Should return ONLY care2connects.org
Get-Content C:\Users\richl\.cloudflared\config.yml | Select-String "care2connects\.org"
# Should return: 3 matches (api, www, root)
```

---

## 📊 Impact Analysis

| **Component** | **Current State** | **Risk** |
|--------------|------------------|----------|
| **Backend Health Checks** | Using wrong domain | 🔴 HIGH - Health checks fail |
| **Cloudflare Tunnel** | Mixed domains | 🔴 HIGH - Routing confusion |
| **CORS Configuration** | Both domains allowed | 🟠 MEDIUM - Security risk |
| **Story Profile URLs** | Wrong domain embedded | 🟠 MEDIUM - Broken links |
| **Environment Variables** | Wrong domain set | 🔴 HIGH - Configuration drift |

---

## ✅ Domain Correctness Confirmation

After manual review and automated search:

**CORRECT DOMAIN (production)**: `care2connects.org` ✅  
**Subdomains**:
- `api.care2connects.org` ✅
- `www.care2connects.org` ✅

**INCORRECT DOMAIN (must be removed)**: `care2connect.org` ❌  
**Incorrect Subdomains**:
- `api.care2connect.org` ❌
- `www.care2connect.org` ❌

---

**Next Step**: Proceed to PHASE 2 - Fix all domain references in the 7 files identified above.
