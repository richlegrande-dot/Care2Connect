# GitHub Agent Prompt 1 — Fix Knowledge Vault Display + Unify Admin Auth + Add Audit Logging + Harden Prisma + Full Vault Population

**Role:** You are the Care2Connect GitHub implementation agent. Make the system production-safe. All tests are critical. No "demo mode" fallbacks. If Prisma DB isn't connected, the system must fail fast and/or return 503 depending on stage, per existing Phase 6L/6M hardening direction.

## Context (must respect)

* There are currently **two password-protected admin areas**:
  1. **System Health page** (was first and fully fleshed out)
  2. **Knowledge Vault** (recently added; currently embedded via System Status toggle)
* We want **ONE** password-protected place that contains **both** (Health stays the canonical home).
* **CRITICAL BUG:** Admin password unlock frequently fails with connectivity-style errors (looks like it's not even processing the password).
* **Knowledge Vault UI BUG:** Sources show, but each shows **"0 chunks"** even though backend scripts reported **50 chunks created**. Clicking source cards does not navigate to a detail view (only edit metadata).
* Requirement: **Logs must be clickable**, editable, and **every change must be logged** on another page.
* Requirement: Add a **new phase** that populates the vault with the **full breadth of system knowledge** (see "Original Knowledge Vault description" below). The system should be able to use this vault as its "system knowledge store" for LLM troubleshooting later.
* Prisma connectivity must be hardened further: **instant troubleshooting** when failing to connect / error, and system must **shut down** if DB isn't connected (startup gate + watchdog already exists; enhance).

## "Original Knowledge Vault" intent (must implement)

The Knowledge Vault is the admin knowledge store for:

* Donation generation process knowledge (draft GoFundMe-style inputs + editing workflow + document generation)
* Stripe donation attribution per RecordingTicket ID (precise totals; ledger entries: timestamp + donor last name + status + amount; single Stripe account with later manual distribution)
* Speech analysis + native language analysis troubleshooting knowledge
* System health checks, self-healing, and operational runbooks
* Support tickets + recording ticketing logs + troubleshooting patterns
* No secrets stored (no API keys, tokens, passwords)
* Must support adding/editing knowledge, and **track every change** in an audit log.

---

## Goals (deliverables)

### A) Unify admin access

1. Create a **single Admin Portal entry point** at:
   **`/health`** (or keep existing health route) with tabs:
   * **System Health** (existing)
   * **Knowledge Vault**
   * **Audit Log** (NEW)
2. Use the **same password** for all admin features.
3. Fix the auth "connectivity issue" so it **reliably processes passwords** and returns correct messages:
   * Wrong password ⇒ show **401** + "Invalid password"
   * Backend unreachable ⇒ show **network error / 503** + "Cannot reach server"
   * DB down ⇒ show **503** + "Database unavailable"

### B) Fix Knowledge Vault "0 chunks" + enable navigation

1. **Backend must return correct chunk counts** per source.
2. UI must display correct chunk counts.
3. Clicking a source card must open a **detail view** (modal or routed page) where admin can:
   * View chunks
   * Search chunks
   * Create/edit/delete chunks
   * Edit source metadata
4. Add a dedicated **source detail endpoint** and **chunks list endpoint** if missing.

### C) Audit log for all knowledge changes

1. Every create/update/delete of:
   * KnowledgeSource
   * KnowledgeChunk
   
   must create an audit entry in DB.
2. Add "Audit Log" tab/page that shows:
   * Timestamp
   * Actor (admin)
   * Action (CREATE/UPDATE/DELETE)
   * Entity type (SOURCE/CHUNK)
   * Entity ID
   * Before/after snapshots (safe; no secrets)
3. Audit entries must be clickable to see details and diff.

### D) "Full breadth" knowledge population phase

Add a new "populate vault" phase that:

1. Scans the repo for relevant docs and writes them into the vault:
   * `docs/**`, `PHASE_*.md`, testing guides, runbooks, health hardening docs, Stripe/GoFundMe docs you already maintain in-repo
2. Chunks them into usable pieces:
   * Chunk size target: ~800–1500 chars (or ~200–400 tokens), overlap ~10–15%
   * Tagging: derive from headings/filenames (e.g., `stripe`, `gofundme`, `health`, `database`, `evts`, `speech`, `donation-pipeline`, `ops`)
3. Stores **sources** and **chunks** with metadata:
   * `sourceType`, `title`, `url` (file path), `hash` of source content, `chunkIndex`, `tags`, `language`, `metadata`
4. Must be **idempotent**:
   * Re-running should update existing sources/chunks if content changed, without duplicating.
5. Provide an admin-only script:
   * `scripts/populate-knowledge-vault-full.ps1`
   * Shows summary: sources created/updated, chunks created/updated, totals
6. IMPORTANT: do not store secrets (redact common secret patterns automatically).

### E) Prisma hardening improvements (beyond current)

1. Strengthen existing DB gate/watchdog:
   * Startup: if DB unreachable ⇒ **exit(1)** (already exists; verify)
   * Runtime: if DB becomes unhealthy ⇒ set `dbReady=false`, return **503** for all non-health endpoints, attempt reconnect, then exit(1) if persistent failure
2. Add **instant troubleshooting diagnostics**:
   * `GET /health/db/details` returns:
     * ready
     * lastPingAt
     * failureCount
     * lastError (safe)
     * lastReconnectAttemptAt
     * suggestedActions array (human readable)
3. Fix the **DB failure simulation** test endpoints if currently not causing failures (it appears enable didn't affect watchdog pings). Ensure watchdog uses the same ping function that consults the simulation flag.

---

## Implementation requirements

### 1) Backend: Knowledge counts bug fix

The `GET /admin/knowledge/sources` currently returns `_count.chunks = 0`. Implement counts in a way that can't lie:

* Add a `groupBy` on `KnowledgeChunk` by `sourceId` and merge counts into the sources list response.
* Ensure you're reading/writing to the same DB (`DATABASE_URL`) and no shadow prisma client instances.
* Add a verification endpoint:
  * `GET /admin/knowledge/sources/:id` returns source + count + latest chunk preview
  * `GET /admin/knowledge/sources/:id/chunks?page&limit&query=` returns chunk list

### 2) Backend: Audit models + middleware

Add Prisma models:

* `KnowledgeAuditLog` with:
  * id, createdAt, actor, action, entityType, entityId
  * beforeJson, afterJson
* Implement logging in the knowledge routes (or service layer) so all writes create audit entries.

### 3) Frontend: Knowledge Vault UX

Update `KnowledgeVaultTab.tsx` so:

* Card click opens source detail view
* Show chunk count using the backend-provided count field
* Add chunk list UI with edit/save/delete
* Add search
* Provide optimistic updates OR refetch after save

### 4) Frontend: Unified Admin Portal at /health

* Keep System Health as primary tab.
* Add Knowledge Vault + Audit Log as additional tabs (same password gate).
* Remove duplicate password gates; one auth state controls all.

### 5) Authentication reliability fix

* Stop storing raw password in localStorage.
* Implement an `/admin/auth/login` endpoint that returns a short-lived signed session (cookie preferred).
* Frontend uses same-origin `/api/...` routes (Next rewrites) so CORS never breaks.
* On auth failure, show correct message (401 vs 503 vs fetch fail).

### 6) Tests (critical)

Update `/admin/db/self-test` to add:

* KnowledgeSource create/read/update/delete
* KnowledgeChunk create/read/update/delete
* Counts correctness test (source shows expected count after creating chunks)
* Audit log correctness (audit entry created for each operation)

Also add a small script `scripts/verify-knowledge-vault.ps1`:

* Lists sources + counts
* Fetches a source detail + chunks
* Writes PASS/FAIL summary

---

## Acceptance criteria (must all pass)

1. **Knowledge sources list shows correct chunk counts** (not all zero).
2. **Click source card opens detail** and shows chunks.
3. Admin can **create/edit/delete chunks**, and sees changes immediately.
4. **Audit log** records all source/chunk changes and is viewable in UI.
5. Single password unlocks **System Health + Knowledge Vault + Audit Log** from the Health page.
6. Auth failure messages are accurate:
   * wrong password => 401
   * backend unreachable => network error
   * db down => 503
7. DB failure simulation actually triggers watchdog failures + 503 behavior (dev-only).
8. `populate-knowledge-vault-full.ps1` populates vault with repo documentation, idempotently, with redaction, and results become visible in UI with real counts.

---

## Output required

1. Implement code changes.
2. Add/update docs:
   * `docs/ADMIN_PORTAL_AUTH_HARDENING.md` explaining why it failed and how it's prevented (include diagnostics + test steps).
   * `docs/KNOWLEDGE_VAULT_POPULATION.md` explaining the population script and redaction/idempotency.
3. Provide a short "How to test" section with commands and expected output.

---

## Current System Context

### Repository Structure
- **Backend**: `backend/` - Node.js/Express/TypeScript, Port 3001
- **Frontend**: `v1-frontend/` - Next.js 14.0.0, Port 3000
- **Database**: PostgreSQL via Prisma ORM

### Key Files
- `backend/src/routes/admin/knowledge.ts` - Knowledge Vault API routes
- `backend/src/routes/health.ts` - Health monitoring endpoints
- `backend/src/middleware/adminAuth.ts` - Admin authentication
- `backend/prisma/schema.prisma` - Database schema (6 migrations applied)
- `v1-frontend/components/admin/KnowledgeVaultTab.tsx` - Knowledge UI
- `v1-frontend/app/health/page.tsx` - Health monitoring page
- `v1-frontend/next.config.js` - API proxy configuration

### Current Database Schema (Knowledge Models)
```prisma
model KnowledgeSource {
  id          String   @id @default(uuid())
  title       String
  sourceType  KnowledgeSourceType
  url         String?
  chunks      KnowledgeChunk[]
  isDeleted   Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model KnowledgeChunk {
  id          String   @id @default(uuid())
  sourceId    String
  source      KnowledgeSource @relation(fields: [sourceId], references: [id])
  chunkText   String   @db.Text
  tags        String[]
  language    String?
  metadata    Json?
  createdAt   DateTime @default(now())
}

enum KnowledgeSourceType {
  DOC
  URL
  NOTE
  IMPORT
}
```

### Known Issues (see KNOWLEDGE_VAULT_DISPLAY_ISSUE.md)
- Sources show "0 chunks" despite 50 chunks created
- Backend `_count.chunks` returns 0 in API response
- Click navigation to source detail not working
- Admin auth occasionally fails with connectivity errors
- Rate limiting was blocking admin routes (fixed by exempting `/admin/*`)

### Environment
- Backend: `ADMIN_PASSWORD=admin2024`
- Frontend: Next.js rewrites configured for `/api/admin/*` → `/admin/*`
- Database: PostgreSQL connection via `DATABASE_URL`
