# Phase 9D — Profile Hub Hardening + Rank Scalability

**Branch:** `phase9d/profile-hub-hardening`  
**Base:** `phase9c/profile-spectrum-roadmap` (commit `20630dc`)  
**Date:** 2026-01-15

---

## Deliverables Completed

### D1: "Find My Profile" Entry Page

**File:** `frontend/app/profile/session/page.tsx`

- Client-side entry page at `/profile/session` for users who only have a sessionId
- Input validation: trims whitespace, lowercases, strips non-alphanumeric characters
- Length validation: rejects IDs shorter than 20 or longer than 30 characters
- Privacy warning displayed before navigation
- "Start New Assessment" link to `/onboarding/v2` for new users
- Metadata handled via profile layout (`frontend/app/profile/layout.tsx`) since `'use client'` components cannot export metadata

### D2: Privacy & Security Headers

**Frontend Headers** (`frontend/next.config.js`):
- General `/(.*)`  headers applied first: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`
- Profile `/profile/:path*` headers applied second (override): `Referrer-Policy: no-referrer`, `Cache-Control: private, no-store, no-cache, must-revalidate`, `X-Robots-Tag: noindex, nofollow`
- Ordering ensures profile-specific `Referrer-Policy: no-referrer` overrides the general `strict-origin-when-cross-origin` (Next.js last-match-wins for duplicate header keys)

**Backend API Headers** (`backend/src/intake/v2/routes/intakeV2.ts`):
- Profile endpoint: `Cache-Control: private, no-store, no-cache, must-revalidate` + `X-Robots-Tag: noindex, nofollow`
- Audit endpoint: Same privacy headers

**Profile Layout** (`frontend/app/profile/layout.tsx`):
- `robots: { index: false, follow: false }` metadata export

#### Verified Headers (curl evidence)

```
# Profile page (frontend)
Referrer-Policy: no-referrer
Cache-Control: no-store, must-revalidate
X-Robots-Tag: noindex, nofollow
X-Content-Type-Options: nosniff

# Non-profile page (frontend)
Referrer-Policy: strict-origin-when-cross-origin
X-Robots-Tag: (absent — correct)

# Profile API (backend)
Cache-Control: private, no-store, no-cache, must-revalidate
X-Robots-Tag: noindex, nofollow

# Caddy proxy (port 8080)
Referrer-Policy: no-referrer
X-Robots-Tag: noindex, nofollow
```

### D3: Scalable Count-Based Ranking

**File:** `backend/src/intake/v2/rank/rankService.ts`

Replaced Prisma ORM `groupBy` and `count` queries with raw SQL via `prisma.$queryRaw`:

1. **`refreshCountsFromDB()`**: Two raw SQL queries (conditional on `includeTest`) count completed sessions by level, replacing `prisma.v2IntakeSession.groupBy({ by: ['levelAssigned'], ... })`
2. **`computeRank()`**: Outrank count uses `$queryRaw` with conditional queries for test session filtering

**Performance approach:**
- Count-based ranking avoids loading all session records into memory
- SQL `COUNT(*)` with `WHERE` clauses and `GROUP BY` runs at the database level
- Only scalar counts are returned to the application

**Existing indexes leveraged (no new migration needed):**
- `v2_intake_sessions_rank_desc_idx`: Composite index on `(levelAssigned, overallScore DESC)` for completed, non-test sessions
- `v2_intake_sessions_rank_completed_idx`: Partial index on `(id)` where `status = 'completed'`

**Bug fixed:** Original implementation used `prisma.sql` (non-existent template tag); replaced with separate conditional query branches.

### D4: Test Session Hygiene

**Session Creation** (`backend/src/intake/v2/routes/intakeV2.ts`):
- Checks `ALLOW_TEST_SESSIONS` environment variable (defaults to `false`)
- Supports dual headers: `X-C2C-Test` and `X-C2C-Test-Run`
- When env var is `false` but test header is present: logs warning, creates session as non-test
- When env var is `true` and test header is present: creates session with `isTest: true`

**Fairness Endpoint** (`backend/src/intake/v2/routes/intakeV2.ts`):
- Added `includeTest` query parameter support
- Default behavior excludes test sessions (`isTest: false` filter)
- Pass `?includeTest=true` to include test sessions in fairness analysis

**Test Script** (`scripts/test-post-intake-pipeline.ps1`):
- Added `[hashtable]$Headers` parameter to `Invoke-ThrottledRequest`
- Session creation passes `@{ "X-C2C-Test" = "1" }` header

### D5: Enhanced Roadmap Task Quality

**File:** `frontend/app/profile/session/[sessionId]/components/EnhancedRoadmapTasks.tsx`

- Priority-based sorting: `critical > high > medium > low`
- Advancement task highlighting: Top 5 tasks most relevant for level advancement displayed in a dedicated "Key Steps for Advancement" section
- Local-only checkboxes: Task completion state stored in `localStorage` (key: `c2c_task_${sessionId}`)
- Deterministic task IDs: Generated from task text for stable checkbox state
- Privacy notice: Users informed that completion tracking is local-only
- No PII leakage: All task state stays in the browser

**Profile Page Integration** (`frontend/app/profile/session/[sessionId]/page.tsx`):
- "Your Advancement Roadmap" section with current/next level labels
- Disclaimer that levels may change on re-assessment
- Integration of `<EnhancedRoadmapTasks>` component

---

## Files Changed

| File | Type | Deliverable |
|------|------|-------------|
| `frontend/app/profile/session/page.tsx` | NEW | D1 |
| `frontend/app/profile/layout.tsx` | NEW | D2 |
| `frontend/next.config.js` | MODIFIED | D2 |
| `backend/src/intake/v2/rank/rankService.ts` | MODIFIED | D3 |
| `backend/src/intake/v2/routes/intakeV2.ts` | MODIFIED | D2, D4 |
| `frontend/app/profile/session/[sessionId]/components/EnhancedRoadmapTasks.tsx` | NEW | D5 |
| `frontend/app/profile/session/[sessionId]/page.tsx` | MODIFIED | D5 |
| `scripts/test-post-intake-pipeline.ps1` | MODIFIED | D4 |

## Non-Negotiables Verified

- ✅ No changes to `computeScores.ts` or `policyPack.ts`
- ✅ No PII leakage — sessionId-based access only, no names/emails exposed
- ✅ Backward compatibility — existing routes and API contracts unchanged
- ✅ Pipeline test: ALL ASSERTIONS PASSED
- ✅ Headers verified on localhost, through Caddy, and on backend API

## Testing Results

```
Pipeline Test (test-post-intake-pipeline.ps1):
  ✅ Session Create (201)
  ✅ Module Submit
  ✅ Complete
  ✅ Idempotent
  ✅ Profile + Rank
  ✅ Audit
  ALL ASSERTIONS PASSED

Header Tests:
  ✅ Profile: Referrer-Policy: no-referrer
  ✅ Profile: Cache-Control: no-store, must-revalidate
  ✅ Profile: X-Robots-Tag: noindex, nofollow
  ✅ Home: Referrer-Policy: strict-origin-when-cross-origin
  ✅ Home: X-Robots-Tag: (absent)
  ✅ Caddy: All headers pass through correctly

Rank Test:
  ✅ Position: 2, Of: 12, excludesTestSessions: true
  ✅ Raw SQL queries execute correctly
```
