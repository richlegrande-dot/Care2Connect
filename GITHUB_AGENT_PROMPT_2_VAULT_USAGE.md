# GitHub Agent Prompt 2 — Make the System *Use* Knowledge Vault for Compute + Troubleshooting

**Role:** GitHub agent. Extend backend processing so Knowledge Vault actively improves reliability and troubleshooting for production flows.

**Prerequisites:** Prompt 1 must be completed first (vault display fixed, audit logging working, full population complete).

---

## Goal

When donation generation or native language/speech processing runs, the system should query the Knowledge Vault and use relevant chunks to:

* Improve generation quality (GoFundMe-style draft + editing guidance)
* Provide step-by-step Stripe/QR attribution correctness
* Troubleshoot common failures (EVTS/OpenAI fallback, language detection edge cases)
* Generate better error reports and self-healing suggestions

---

## Requirements

### A) Retrieval service

Create `KnowledgeRetrievalService` that can:

* `searchChunks(query, { tags?, sourceType?, limit })`
* Rank results using a simple first version:
  * Prefer tag match + title match + chunk text match
  * Use Postgres full-text search if available; fallback to `ILIKE` safely
* Return top N chunks with:
  * chunkId, sourceId, title, snippet, tags, metadata

Add endpoint (admin-only):

* `GET /admin/knowledge/search?q=...&tags=...`

### B) "Knowledge usage" logging

Add Prisma model `KnowledgeUsageLog`:

* id, createdAt
* taskType (DONATION_DRAFT | NATIVE_LANGUAGE | TROUBLESHOOTING | OTHER)
* ticketId (nullable), transcriptionSessionId (nullable)
* queryText
* chunkIds (String[])
* outcome (SUCCESS | FAIL)
* notes (nullable)

Every time a pipeline step uses knowledge chunks, log it.

### C) Integrate into donation pipeline

In donation pipeline orchestrator:

1. Before draft generation:
   * Query vault for "GoFundMe draft structure", "donation story best practices", "Care2Connect donation pipeline"
   * Inject retrieved chunk text into the LLM/system prompt context (or into heuristic generator if not using LLM)
2. Before document generation:
   * Query vault for "GoFundMe document formatting" rules, and apply.
3. Before creating Stripe checkout + QR mapping:
   * Query vault for "Stripe metadata ticketId attribution", "donation totals ledger requirements"
   * Validate that checkout session metadata includes ticketId and idempotency rules; if mismatch, fail loudly.

### D) Integrate into native language / speech processing

In speech intelligence service:

* On language detection uncertainty / empty transcript / EVTS error:
  * Query vault for troubleshooting chunks tagged `speech`, `evts`, `language`
  * Include the results in the error report and in KnowledgeUsageLog with taskType=NATIVE_LANGUAGE
* Provide a structured "Troubleshooting hints" array in API response if processing fails.

### E) Admin UI enhancements

In Knowledge Vault detail view:

* Add a "Use in troubleshooting" quick action:
  * Copies chunk IDs and tags into clipboard
* In Audit Log tab:
  * Add filter for entity type and date range
* Add a new tab "Usage Logs" (optional but recommended) showing KnowledgeUsageLog records.

### F) Acceptance criteria

1. Donation pipeline logs show that knowledge retrieval ran, with logged chunk IDs.
2. If draft generation fails, response includes troubleshooting hints derived from the vault.
3. Native language analysis failures include vault-based troubleshooting hints.
4. No secrets stored; logs remain privacy-safe.
5. KnowledgeUsageLog records are viewable in admin UI.

---

## Output required

* Code changes + migrations
* Update `/admin/db/self-test` to validate KnowledgeUsageLog writes
* Add `docs/KNOWLEDGE_AUGMENTED_PROCESSING.md` explaining:
  * Retrieval method
  * Where it's injected
  * How failures use vault data
  * How to test end-to-end

---

## Current System Context

### Donation Pipeline Components
- `backend/src/services/donationPipeline/orchestrator.ts` - Main pipeline orchestrator
- `backend/src/services/donationPipeline/draftGenerator.ts` - GoFundMe draft generation
- `backend/src/services/donationPipeline/documentGenerator.ts` - Document generation
- Stripe integration already exists with metadata tracking

### Speech Intelligence Components
- `backend/src/services/speechIntelligence/` - Speech processing services
- `backend/src/services/speechIntelligence/smokeTest.ts` - EVTS testing
- Native language detection service exists
- EVTS with OpenAI fallback already implemented

### Integration Points
1. **Donation Pipeline**: Query vault before draft generation, document generation, and Stripe checkout
2. **Speech Processing**: Query vault on errors/uncertainty, add troubleshooting hints to responses
3. **Troubleshooting**: Use vault for automated troubleshooting suggestions in self-healing

### Required Services
- `backend/src/services/knowledge/retrieval.ts` (NEW) - Knowledge search/ranking
- `backend/src/services/knowledge/query.ts` (exists, may need updates)
- Integration hooks in existing pipeline and speech services

### Database Models to Add
```prisma
model KnowledgeUsageLog {
  id                     String   @id @default(uuid())
  createdAt              DateTime @default(now())
  taskType               KnowledgeTaskType
  ticketId               String?
  transcriptionSessionId String?
  queryText              String
  chunkIds               String[]
  outcome                KnowledgeUsageOutcome
  notes                  String?
}

enum KnowledgeTaskType {
  DONATION_DRAFT
  NATIVE_LANGUAGE
  TROUBLESHOOTING
  OTHER
}

enum KnowledgeUsageOutcome {
  SUCCESS
  FAIL
}
```

### Search Strategy
1. Start with simple Postgres text search (`ILIKE` + tag matching)
2. Rank by: exact tag match (highest) > title match > text match
3. Return top 5-10 chunks per query
4. Include source title + snippet + full chunk text
5. Log every retrieval for analysis
