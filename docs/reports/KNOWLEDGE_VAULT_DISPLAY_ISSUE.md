# Knowledge Vault Display Issue - Problem Statement

**Date**: December 17, 2025  
**Status**: 🔴 BLOCKING - Content not visible in UI  
**Priority**: HIGH

---

## Issue Summary

The Knowledge Vault admin interface shows "0 chunks" for all knowledge sources, despite backend confirmation that 50 chunks were successfully created and stored. Users cannot view source content, only edit metadata.

---

## Observed Behavior

### Frontend Display
- All 12 knowledge sources appear in the vault grid
- Each source card shows "0 chunks" 
- Date shows 12/17/2025 (correct)
- Source type badge shows "DOC" (correct)
- Titles display correctly:
  - Testing Policy
  - Database Hardening
  - Health Monitoring
  - Production Phase 6M
  - Automated Troubleshooting
  - GoFundMe Testing
  - GoFundMe Integration
  - Stripe Testing Guide
  - Stripe Payment Integration
  - EVTS Quick Reference
  - Speech Intelligence EVTS
  - Test Source

### User Interaction
- Clicking on source cards does NOT navigate to detail view
- Only available action appears to be "edit"
- Cannot view chunk content
- Cannot browse documentation

### Backend Status
**Terminal Verification (Successful)**:
```powershell
Testing knowledge sources endpoint...
✅ Success! Found 12 sources
```

**Direct API Test (Confirmed working)**:
```powershell
$h=@{'x-admin-password'='admin2024'}
$r=Invoke-RestMethod 'http://localhost:3001/admin/knowledge/sources?page=1&limit=10' -Headers $h
# Returns: 12 sources
```

**Chunk Creation Log (Completed)**:
```
[Testing Policy] - Chunk 1/3 ✓, Chunk 2/3 ✓, Chunk 3/3 ✓
[Database Hardening] - Chunk 1/5 ✓ ... Chunk 5/5 ✓
[Health Monitoring] - Chunk 1/2 ✓, Chunk 2/2 ✓
[Production Phase 6M] - Chunk 1/13 ✓ ... Chunk 13/13 ✓
...
✅ Added 50 chunks total
```

---

## Data Verification

### Backend API Response Structure
The `/admin/knowledge/sources` endpoint returns sources with this structure:
```json
{
  "sources": [
    {
      "id": "uuid",
      "title": "Source Title",
      "sourceType": "DOC",
      "url": "file://path.md",
      "_count": {
        "chunks": 0  // ← Shows 0 despite chunks existing
      }
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 10
  }
}
```

### Expected vs Actual Chunk Counts

| Source                         | Expected Chunks | API Reports | UI Shows |
|--------------------------------|-----------------|-------------|----------|
| Testing Policy                 | 3               | 0           | 0        |
| Database Hardening             | 5               | 0           | 0        |
| Health Monitoring              | 2               | 0           | 0        |
| Production Phase 6M            | 13              | 0           | 0        |
| Automated Troubleshooting      | 4               | 0           | 0        |
| GoFundMe Testing               | 4               | 0           | 0        |
| GoFundMe Integration           | 4               | 0           | 0        |
| Stripe Testing Guide           | 5               | 0           | 0        |
| Stripe Payment Integration     | 4               | 0           | 0        |
| EVTS Quick Reference           | 2               | 0           | 0        |
| Speech Intelligence EVTS       | 4               | 0           | 0        |
| Test Source                    | 0               | 0           | 0        |

**Total**: Expected 50, API reports 0

---

## Technical Context

### Chunk Creation Process
1. ✅ Knowledge sources created (12 total)
2. ✅ Chunk creation script executed successfully
3. ✅ Each POST to `/admin/knowledge/sources/{sourceId}/chunks` returned success
4. ✅ Terminal confirmed "Added 50 chunks total"
5. ❌ Chunks not reflected in `_count` field

### API Endpoints Involved
- `GET /admin/knowledge/sources` - Returns sources with chunk counts
- `POST /admin/knowledge/sources/{sourceId}/chunks` - Creates chunks (appeared successful)
- `GET /admin/knowledge/sources/{sourceId}/chunks` - View chunks (untested)
- `GET /admin/knowledge/sources/{sourceId}` - Source detail (may not be working)

### Frontend Component
**File**: `v1-frontend/components/admin/KnowledgeVaultTab.tsx`
- Fetches sources on mount via `fetchSources()`
- Displays chunk count from `source._count.chunks` (if present)
- Click handler may not be implemented for navigation

---

## Discrepancy Analysis

### Possible Data Layer Issues
1. **Database Write Failure**: Chunks not actually persisted despite success responses
2. **Count Aggregation**: `_count.chunks` computed incorrectly in Prisma query
3. **Soft Delete Filter**: Chunks marked as deleted or filtered out
4. **Foreign Key Mismatch**: Chunks created with wrong `sourceId` reference
5. **Transaction Rollback**: Chunks created then rolled back

### Possible API Layer Issues
1. **Include Statement Missing**: Prisma query not including chunk count
2. **Different Database Instance**: Backend reading from different DB than writes went to
3. **Caching**: Stale data cached, not reflecting new chunks
4. **Query Filter**: Backend filtering out chunks unintentionally

### Possible Frontend Issues
1. **UI Mapping**: Frontend not correctly displaying chunk count from API
2. **Click Handler**: Detail view navigation not implemented
3. **Data Transform**: Response data transformed incorrectly before display
4. **State Update**: React state not updating after data fetch

---

## System Configuration

### Backend
- **Port**: 3001
- **Database**: PostgreSQL via Prisma
- **Migrations**: 6 applied (confirmed up-to-date)
- **Rate Limiting**: Admin routes exempted (fixed earlier)
- **Authentication**: Working (password: admin2024)

### Frontend
- **Port**: 3000
- **Framework**: Next.js 14.0.0
- **API Proxy**: Next.js rewrites configured
- **Component**: `KnowledgeVaultTab.tsx`

### Database Schema
```prisma
model KnowledgeSource {
  id          String   @id @default(uuid())
  title       String
  sourceType  KnowledgeSourceType
  url         String?
  chunks      KnowledgeChunk[]  // ← Relation to chunks
  isDeleted   Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model KnowledgeChunk {
  id          String   @id @default(uuid())
  sourceId    String   // ← Foreign key
  source      KnowledgeSource @relation(fields: [sourceId], references: [id])
  chunkText   String   @db.Text
  tags        String[]
  language    String?
  metadata    Json?
  createdAt   DateTime @default(now())
}
```

---

## Reproduction Steps

1. Navigate to `http://localhost:3000/health#knowledge`
2. Enter admin password: `admin2024`
3. Click "Knowledge Vault" tab
4. Observe: All sources show "0 chunks"
5. Attempt to click on any source card
6. Observe: Cannot navigate to detail view

---

## Impact

### User Experience
- ❌ Cannot view knowledge vault content
- ❌ Cannot browse documentation chunks
- ❌ Cannot verify AI-assisted processing has data
- ❌ Cannot validate chunk quality or content

### System Functionality
- ⚠️ Knowledge vault appears empty to end users
- ⚠️ AI-assisted troubleshooting may not have context
- ⚠️ Knowledge retrieval features non-functional
- ⚠️ Audit trail visible but content invisible

### Business Impact
- Knowledge vault unusable for intended purpose
- Manual verification required for every troubleshooting task
- AI processing lacks documentation context
- Demo-blocking issue for knowledge features

---

## Current Status

- **Backend**: Running, API responding
- **Frontend**: Running, UI rendering
- **Database**: Accessible, migrations applied
- **Chunk Creation**: Reported successful (50 chunks)
- **Chunk Display**: Broken (shows 0)
- **Chunk Navigation**: Non-functional

---

## Open Questions

1. Are chunks actually in the database?
2. Is the Prisma `_count` aggregation working?
3. Does the frontend receive chunk count in API response?
4. Is there a click handler for viewing source details?
5. Can chunks be queried directly via `/admin/knowledge/sources/{id}/chunks`?
6. Are there any console errors in browser DevTools?
7. Are there any backend logs showing chunk retrieval failures?

---

## Files Referenced

- `v1-frontend/components/admin/KnowledgeVaultTab.tsx` - Frontend display
- `backend/src/routes/admin/knowledge.ts` - API routes
- `backend/prisma/schema.prisma` - Database schema
- `scripts/add-content-chunks.ps1` - Chunk creation script
- `backend/src/server.ts` - Rate limiting configuration (recently modified)

---

**End of Problem Statement**
