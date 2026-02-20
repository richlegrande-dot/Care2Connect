# V2 Phase 9B.2 Session Report — Ranking Scalability Hardening

**Date:** 2026-02-20
**Branch:** `phase9b.2/rank-scalability`
**Parent:** `phase9b.1/migration-requestid-test-tagging` @ `457d2d3`
**Commit:** `a6d1044`

---

## Summary

Phase 9B.2 hardens the V2 Intake ranking system for scale (10K–1M sessions) with predictable latency, minimal DB load, and safe concurrent behavior. All changes are additive — no scoring logic was modified.

## Changes Implemented

### A) Composite Index with DESC Ordering + EXPLAIN Proof

- **Migration:** `20260220_rank_snapshot_optimized_index/migration.sql`
- Dropped old ASC-only composite index `v2_intake_sessions_rank_composite_idx`
- Created `v2_intake_sessions_rank_desc_idx` with:
  - `status, isTest, stabilityLevel ASC, totalScore DESC, completedAt ASC, id ASC`
- Created partial index `v2_intake_sessions_rank_completed_idx`:
  - `stabilityLevel ASC, totalScore DESC, completedAt ASC, id ASC`
  - `WHERE status = 'COMPLETED' AND isTest = false`
- **EXPLAIN ANALYZE proof:** groupBy query uses `Index Only Scan` via partial index

### B) Rank Snapshot Fields + Completion-Time Compute

- **Schema:** Added `rankPosition Int?`, `rankOf Int?`, `rankComputedAt DateTime?`, `rankSortKey String?`
- **Completion handler:** Stage 9 — best-effort `computeAndStoreSnapshot()` after transaction commit
- **Profile endpoint:** Snapshot-first with 15-minute freshness check, fallback to live compute
- **Audit:** Added `RANK_COMPUTE_FAILED` event type + `rankPosition`/`rankOf` to meta allowlist
- Error in rank compute never blocks the completion response

### C) Partitioned Level Ranking

- **Response shape:**
  ```json
  {
    "rank": {
      "position": 5,
      "of": 21,
      "global": { "position": 5, "of": 21 },
      "level": { "position": 2, "of": 5, "level": 3 },
      "sortKey": "L3|S10|T2026-02-20T13:02:12.119Z|IDcmluwg55p...",
      "excludesTestSessions": true,
      "fromSnapshot": true
    }
  }
  ```
- Global rank = sum(counts for levels < L) + levelRank
- Level rank = 1 + count(same-level sessions that outrank)
- Backward compatible: `rank.position` and `rank.of` still present at top level

### D) In-Memory Count Cache with TTL

- **Module:** `backend/src/intake/v2/rank/rankService.ts`
- Caches `completedCountsByLevel` grouped by stabilityLevel
- TTL: 30 seconds (configurable via `setCacheTTL()`)
- Invalidated on completion + bulk recompute
- `includeTest=true` bypasses cache (rare admin path)
- Reduces DB hits: groupBy query fires once per 30s instead of per request

### E) Scalability Test Script

- **Script:** `scripts/test-rank-scalability.ps1`
- Modes: `local` (creates N test sessions) and `prodsafe` (read-only)
- Assertions (27 total):
  - Shape validation (11 checks)
  - Position bounds (10 checks)
  - Determinism (5 checks: rank consistent across repeated queries)
  - Snapshot behavior (1 check: second read uses fromSnapshot=true)
- Latency report: p50/p95/avg/min/max

### F) Admin Bulk Rank Refresh CLI

- **Script:** `scripts/recompute-ranks.ts`
- Usage: `npx tsx scripts/recompute-ranks.ts [--dry-run] [--batch-size N]`
- Iterates all completed non-test sessions in sorted order
- Writes rankPosition/rankOf in batches (default 100)
- Dry-run verified: 11 sessions processed, 0 errors, 0.71s
- Live verified: 11 sessions processed, 0 errors, 1.96s

---

## Files Changed

| File | Change |
|------|--------|
| `backend/prisma/schema.prisma` | +4 rank snapshot fields, replaced composite index with raw SQL reference |
| `backend/prisma/migrations/20260220_.../migration.sql` | DESC composite index + partial index |
| `backend/src/intake/v2/rank/rankService.ts` | **NEW** — 426 lines: rank compute, cache, snapshot, bulk recompute |
| `backend/src/intake/v2/audit/auditWriter.ts` | +RANK_COMPUTE_FAILED type, +rankPosition/rankOf meta keys |
| `backend/src/intake/v2/routes/intakeV2.ts` | Completion handler Stage 9 + profile snapshot-first path |
| `scripts/test-rank-scalability.ps1` | **NEW** — 292 lines: scalability test with p50/p95 |
| `scripts/recompute-ranks.ts` | **NEW** — 80 lines: admin bulk rank CLI |

## Test Evidence

### Local Scalability Test (N=10)
```
27 passed, 0 failed
p50: 274ms
p95: 460ms
Average: 314.6ms
```

### EXPLAIN ANALYZE — Partial Index Used
```
GroupAggregate (cost=0.14..8.17 rows=1 width=12) (actual time=0.084..0.088 rows=3 loops=1)
  -> Index Only Scan using v2_intake_sessions_rank_completed_idx
     Index Cond: ("stabilityLevel" IS NOT NULL)
     Heap Fetches: 11
Planning Time: 0.320 ms
Execution Time: 0.222 ms
```

### Profile Snapshot Behavior
```
First call:  fromSnapshot=false  (live compute + stored)
Second call: fromSnapshot=true   (served from snapshot)
```

### Bulk Recompute CLI
```
Dry-run:  11 processed, 0 errors, 0.71s
Live:     11 processed, 0 errors, 1.96s
Sample:   Rank 1 → cmluubscd000oz83o97lc35yd (1/11)
```

---

## Non-Negotiables Verified

- [x] `computeScores.ts` untouched — PolicyPack v1.0.0 frozen
- [x] Rank determinism preserved: stabilityLevel ASC → totalScore DESC → completedAt ASC → id ASC
- [x] isTest=true excluded by default from all rank operations
- [x] Production sanity: read-only prodsafe mode available
- [x] Error sanitization: RANK_COMPUTE_FAILED never exposes raw error strings

## Architecture

```
Profile Request
     │
     ▼
┌─────────────────────┐
│  Snapshot Check      │  Is rankComputedAt < 15min old?
│  (session fields)    │
└──────┬──────────────┘
       │ fresh → return snapshot
       │ stale ↓
┌─────────────────────┐
│  Live Rank Compute   │  getRank() in rankService.ts
│  ┌───────────────┐  │
│  │ Count Cache    │  │  30s TTL, groupBy stabilityLevel
│  │ (in-memory)    │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ Partitioned    │  │  global = Σ(levels < L) + levelRank
│  │ Level Rank     │  │  level = outrank within same level
│  └───────────────┘  │
└──────┬──────────────┘
       │
       ▼
  Best-effort snapshot update (async)
```
