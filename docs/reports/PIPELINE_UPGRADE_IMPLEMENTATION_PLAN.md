# Care2Connect Pipeline Upgrade - Implementation Summary
**Date**: January 7, 2026  
**Agent**: GitHub Agent  
**Status**: 🚧 IN PROGRESS

---

## 🎯 Objective

Upgrade the speech-to-GoFundMe donation pipeline for robustness, zero-OpenAI operation, async processing, and missing info prompting.

---

## ✅ PHASE A: Zero-OpenAI Verification - COMPLETE

**Deliverable**: [ZERO_OPENAI_VERIFICATION.md](ZERO_OPENAI_VERIFICATION.md)

**Key Findings**:
- ✅ System already properly gated for V1_STABLE mode
- ✅ Health checks respect ZERO_OPENAI_MODE
- ✅ All transcription uses AssemblyAI
- ✅ All draft generation uses rules-based processing
- ✅ Smoke tests properly block OpenAI fallback
- ✅ **100% OpenAI-free in V1 mode - VERIFIED**

**Action**: No changes needed - system already compliant

---

## 🚧 PHASE B: Transcript Parsing Upgrade - IN PROGRESS

### Goal
Enhance AssemblyAI-only transcript processing with deterministic signal extraction and missing field detection.

### Components to Create

#### 1. TranscriptSignalExtractor Service
**File**: `backend/src/services/speechIntelligence/transcriptSignalExtractor.ts`

**Features**:
- Extract name candidates from transcript
- Extract contact info (email/phone) if mentioned
- Extract location hints (city, state, country)
- Categorize needs (HOUSING, FOOD, HEALTHCARE, EMPLOYMENT, SAFETY, etc.)
- Calculate urgency score (rules-based: 0.0-1.0)
- Identify top N key points from transcript
- Detect missing required fields

**Algorithm**:
```typescript
interface ExtractedSignals {
  nameCandidate: string | null;
  contactCandidates: {
    emails: string[];
    phones: string[];
  };
  locationCandidates: string[];
  needsCategories: NeedCategory[];
  urgencyScore: number; // 0.0-1.0
  keyPoints: string[]; // Top 5-10 sentences
  missingFields: string[]; // ['goalAmount', 'beneficiaryName', etc.]
  confidence: {
    name: number;
    location: number;
    needs: number;
  };
}
```

**Extraction Rules**:
- **Name**: Look for "My name is X", "I'm X", "I am X" patterns
- **Location**: City/state mentions, "I live in X", "from X"
- **Needs**: Keyword matching with confidence scoring
  - HOUSING: rent, eviction, homeless, shelter, apartment
  - FOOD: hungry, meals, groceries, food stamps
  - HEALTHCARE: medical, hospital, treatment, surgery, medicine
  - EMPLOYMENT: job, work, unemployed, laid off
  - SAFETY: abuse, violence, escape, protect
- **Urgency**: Time-sensitive words (urgent, emergency, immediate, deadline, eviction date)

#### 2. Required Fields Definition
**File**: `backend/src/schemas/donationDraftRequirements.ts`

```typescript
export interface DraftRequirements {
  required: {
    title: boolean;
    story: boolean;
    beneficiaryName: boolean; // Can be "Anonymous" temporarily
    goalAmount: boolean; // MUST be user-provided
  };
  recommended: {
    location: boolean;
    category: boolean;
    duration: boolean; // How long help is needed
  };
  optional: {
    email: boolean;
    phone: boolean;
    socialMedia: boolean;
  };
}

export const MINIMUM_STORY_LENGTH = 100; // characters
export const MINIMUM_TITLE_LENGTH = 10; // characters
export const MAXIMUM_STORY_LENGTH = 5000; // GoFundMe limit

export function validateDraftCompleteness(draft: DonationDraft): {
  isComplete: boolean;
  missingFields: string[];
  recommendedFields: string[];
  qualityScore: number; // 0.0-1.0
} {
  // Implementation
}
```

#### 3. Database Schema Updates
**File**: `prisma/schema.prisma`

Add NEEDS_INFO status and needsInfo field:

```prisma
model RecordingTicket {
  // Existing fields...
  status String @default("CREATED") 
  // Values: CREATED | PROCESSING | READY | NEEDS_INFO | ERROR
  
  needsInfo Json? // Structured data for missing fields
  // Example: {
  //   missingFields: ["goalAmount", "beneficiaryName"],
  //   suggestedQuestions: ["How much money do you need?", "What is your full name?"],
  //   currentDraftPreview: { title: "...", storyExcerpt: "..." }
  // }
}
```

#### 4. Unit Tests
**File**: `backend/src/tests/transcriptSignalExtractor.test.ts`

Test fixtures with 10-20 sample transcripts covering:
- Clear name mention
- No name mention (anonymous)
- Multiple needs categories
- High urgency indicators
- Low urgency indicators
- Location mentions (various formats)
- Contact info (emails, phones)
- Missing critical info

---

## 🚧 PHASE C: Async Pipeline & Timeouts - PLANNED

### Goal
Convert pipeline to job-based architecture with polling instead of long HTTP requests.

### Components to Create

#### 1. Job-Based Orchestration
**File**: `backend/src/services/donationPipeline/jobOrchestrator.ts`

**New Endpoints**:
```typescript
POST /api/tickets/:id/process
// Starts background processing job
// Returns: { jobId, ticketId, status: "QUEUED" }

GET /api/tickets/:id/status
// Polls for current status
// Returns: {
//   status: "PROCESSING" | "READY" | "NEEDS_INFO" | "ERROR",
//   stage: "TRANSCRIPTION" | "ANALYSIS" | "DRAFT" | "COMPLETE",
//   progress: 0-100,
//   lastUpdated: timestamp,
//   needsInfo?: { ... },
//   draft?: { ... },
//   qr?: { ... }
// }
```

**Job Queue** (in-process for V1):
```typescript
class JobQueue {
  private queue: Map<string, Job> = new Map();
  
  async addJob(ticketId: string): Promise<string> {
    const jobId = uuidv4();
    this.queue.set(jobId, {
      id: jobId,
      ticketId,
      status: 'QUEUED',
      createdAt: new Date()
    });
    
    // Start processing asynchronously
    setImmediate(() => this.processJob(jobId));
    
    return jobId;
  }
  
  async processJob(jobId: string): Promise<void> {
    // Run orchestrator.processTicket() in background
    // Update ticket status as pipeline progresses
    // Handle errors gracefully
  }
}
```

#### 2. Retry Logic with Backoff
**File**: `backend/src/utils/retryWithBackoff.ts`

```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries: number;
    initialDelay: number; // milliseconds
    maxDelay: number;
    backoffMultiplier: number;
    retryableErrors?: string[]; // Error messages to retry
  }
): Promise<T> {
  // Exponential backoff: 2s, 8s, 32s, etc.
}
```

**Apply to**:
- AssemblyAI API calls (transient failures)
- Disk operations (audio file reads)
- Database writes (connection issues)

#### 3. Timeout Configuration
**File**: `backend/.env`

```env
# Pipeline Timeouts (milliseconds)
TRANSCRIPTION_TIMEOUT=120000  # 2 minutes for AssemblyAI
ANALYSIS_TIMEOUT=10000        # 10 seconds for keyword extraction
DRAFT_GENERATION_TIMEOUT=15000 # 15 seconds for draft creation
QR_GENERATION_TIMEOUT=10000   # 10 seconds for QR + Stripe

# Retry Settings
MAX_RETRY_ATTEMPTS=2
RETRY_INITIAL_DELAY=2000     # 2 seconds
RETRY_MAX_DELAY=30000        # 30 seconds
```

---

## 🚧 PHASE D: GoFundMe Draft Generation - PLANNED

### Goal
Improve draft quality, add "needs info" gating, better story formatting.

### Components to Update

#### 1. Draft Builder Service
**File**: `backend/src/services/donationPipeline/draftBuilder.ts` (NEW)

**Features**:
- **Title Generation**: "Help {Name} with {PrimaryNeed}"
- **Story Formatting**:
  - Clean whitespace
  - Paragraph splitting (sentence boundaries)
  - Add "How funds will help" bullet section
  - 90-word excerpt for preview
- **Needs Info Detection**: If required fields missing → status: NEEDS_INFO
- **Editable JSON Structure**:
  ```json
  {
    "title": "Help Sarah with Rent and Stability",
    "story": "...",
    "excerpt": "90-word summary...",
    "howFundsHelp": [
      "First month's rent and security deposit",
      "Transportation to job interviews",
      "Basic necessities while getting back on feet"
    ],
    "breakdown": ["key point 1", "key point 2", ...],
    "sentiment": "urgent",
    "suggestedCategories": ["housing", "family", "emergency"],
    "qualityScore": 0.95,
    "missingFields": [],
    "templateUsed": "uuid",
    "knowledgeUsed": ["uuid1", "uuid2"]
  }
  ```

#### 2. Frontend Status Display
**File**: `frontend/app/story/[recordingId]/page.tsx`

**Add Pipeline Status Component**:
```tsx
<PipelineStatus 
  status="NEEDS_INFO" 
  stage="DRAFT"
  progress={75}
  needsInfo={{
    missingFields: ['goalAmount'],
    questions: ['How much money do you need to raise?'],
    suggestions: ['$500', '$1000', '$2000', '$5000']
  }}
/>
```

**Add Missing Info Form**:
```tsx
<MissingInfoForm
  ticketId={recordingId}
  missingFields={needsInfo.missingFields}
  onSubmit={async (data) => {
    await fetch(`/api/tickets/${recordingId}/provide-info`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    // Resume pipeline
  }}
/>
```

#### 3. "Needs Info" Endpoint
**File**: `backend/src/routes/tickets.ts`

```typescript
POST /api/tickets/:id/provide-info
// Body: { goalAmount: 5000, beneficiaryName: "Sarah Johnson" }
// Updates ticket, resumes pipeline
// Returns: { status: "PROCESSING", resumedFrom: "DRAFT" }
```

---

## 🚧 PHASE E: QR Code Uniqueness - PLANNED

### Goal
Ensure each user gets unique QR, handle regeneration, maintain audit trail.

### Components to Update

#### 1. QR Generator Enhancement
**File**: `backend/src/services/qrCodeGenerator.ts`

**Add Versioning**:
```prisma
model QRCodeLink {
  id String @id @default(uuid())
  ticketId String @unique
  targetUrl String
  imageStorageUrl String?
  version Int @default(1) // ← NEW: Increment on amount change
  amountCents Int // ← NEW: Track amount for change detection
  scanCount Int @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  ticket RecordingTicket @relation(fields: [ticketId], references: [id])
  history QRCodeHistory[] // ← NEW: Audit trail
}

model QRCodeHistory {
  id String @id @default(uuid())
  qrCodeId String
  version Int
  amountCents Int
  targetUrl String
  createdAt DateTime @default(now())
  reason String // "initial_creation" | "amount_changed" | "user_requested"
  
  qrCode QRCodeLink @relation(fields: [qrCodeId], references: [id])
}
```

**Update Logic**:
```typescript
async function createOrUpdateQR(ticketId: string, amountCents: number): Promise<QRCodeLink> {
  const existing = await prisma.qRCodeLink.findUnique({ where: { ticketId } });
  
  if (existing) {
    // Check if amount changed
    if (existing.amountCents !== amountCents) {
      // Archive old version to history
      await prisma.qRCodeHistory.create({
        data: {
          qrCodeId: existing.id,
          version: existing.version,
          amountCents: existing.amountCents,
          targetUrl: existing.targetUrl,
          reason: 'amount_changed'
        }
      });
      
      // Create new Stripe session + QR
      const newSession = await createCheckoutSession({ ticketId, amount: amountCents });
      const newQRData = await QRCode.toDataURL(newSession.checkoutUrl);
      
      // Update existing record with new version
      return await prisma.qRCodeLink.update({
        where: { id: existing.id },
        data: {
          targetUrl: newSession.checkoutUrl,
          version: existing.version + 1,
          amountCents: amountCents,
          updatedAt: new Date()
        }
      });
    } else {
      // Same amount, return existing QR
      return existing;
    }
  } else {
    // Create new QR (first time)
    const session = await createCheckoutSession({ ticketId, amount: amountCents });
    const qrData = await QRCode.toDataURL(session.checkoutUrl);
    
    const qr = await prisma.qRCodeLink.create({
      data: {
        ticketId,
        targetUrl: session.checkoutUrl,
        version: 1,
        amountCents
      }
    });
    
    // Create history entry
    await prisma.qRCodeHistory.create({
      data: {
        qrCodeId: qr.id,
        version: 1,
        amountCents,
        targetUrl: session.checkoutUrl,
        reason: 'initial_creation'
      }
    });
    
    return qr;
  }
}
```

---

## 🚧 PHASE F: Testing & Documentation - PLANNED

### Goal
End-to-end tests, stress test mode, comprehensive testing guide.

### Components to Create

#### 1. End-to-End Pipeline Test
**File**: `backend/src/tests/pipeline-e2e.test.ts`

```typescript
describe('Pipeline E2E Tests (Zero-OpenAI)', () => {
  it('should complete full pipeline: recording → draft → QR', async () => {
    // 1. Create ticket
    const ticket = await createRecordingTicket({
      displayName: 'Test User',
      audioFilePath: './fixtures/test-audio.wav'
    });
    
    // 2. Start processing
    const job = await jobQueue.addJob(ticket.id);
    
    // 3. Poll for READY or NEEDS_INFO
    let status;
    for (let i = 0; i < 60; i++) {
      await sleep(1000);
      status = await getTicketStatus(ticket.id);
      if (['READY', 'NEEDS_INFO', 'ERROR'].includes(status.status)) {
        break;
      }
    }
    
    // 4. If NEEDS_INFO, provide missing data
    if (status.status === 'NEEDS_INFO') {
      await provideInfo(ticket.id, {
        goalAmount: 5000,
        beneficiaryName: 'Test User'
      });
      
      // Wait for READY
      await waitForStatus(ticket.id, 'READY', 60000);
    }
    
    // 5. Generate QR
    const qr = await generateQR(ticket.id, 5000);
    
    // 6. Verify database records
    expect(await prisma.transcriptionSession.count({ where: { recordingTicketId: ticket.id } })).toBe(1);
    expect(await prisma.donationDraft.count({ where: { ticketId: ticket.id } })).toBe(1);
    expect(await prisma.qRCodeLink.count({ where: { ticketId: ticket.id } })).toBe(1);
    expect(await prisma.stripeAttribution.count({ where: { ticketId: ticket.id } })).toBe(1);
  });
  
  it('should handle missing fields gracefully', async () => {
    // Test with minimal transcript (missing name, goal)
  });
  
  it('should retry on AssemblyAI transient failures', async () => {
    // Mock AssemblyAI to fail once, succeed on retry
  });
});
```

#### 2. Stress Test Mode
**File**: `backend/src/providers/transcription/stub.ts`

**Add Delay Simulation**:
```typescript
export class StubProvider implements TranscriptionProvider {
  async transcribe(audioPath: string): Promise<TranscriptionResult> {
    // Simulate AssemblyAI processing time
    const delay = process.env.STUB_TRANSCRIPTION_DELAY_MS || '10000';
    await sleep(parseInt(delay));
    
    return {
      transcript: 'Simulated transcript for stress test...',
      confidence: 0.95,
      source: 'stub'
    };
  }
}
```

**Environment**:
```env
TRANSCRIPTION_PREFERENCE=stub
STUB_TRANSCRIPTION_DELAY_MS=30000  # Simulate 30-second processing
```

#### 3. Testing Guide
**File**: `PIPELINE_TESTING_GUIDE_V1.md`

**Contents**:
- Manual test checklist (step-by-step)
- Expected behaviors for each status
- Troubleshooting common issues
- How to run stress tests
- How to verify zero-OpenAI mode
- Performance benchmarks
- Edge case scenarios

---

## 📋 Implementation Tracking

| Phase | Status | Files Changed | Tests Added | Docs Created |
|-------|--------|---------------|-------------|--------------|
| A: OpenAI Audit | ✅ DONE | 0 | 0 | 1 (verification) |
| B: Transcript Parsing | 🚧 TODO | ~5 | ~3 | 0 |
| C: Async Pipeline | 🚧 TODO | ~8 | ~2 | 0 |
| D: Draft Generation | 🚧 TODO | ~6 | ~2 | 0 |
| E: QR Uniqueness | 🚧 TODO | ~3 | ~2 | 0 |
| F: Testing | 🚧 TODO | ~5 | ~10 | 1 (guide) |
| **TOTAL** | **17% DONE** | **~27** | **~19** | **3** |

---

## ⚠️ Important Notes

### Scope Considerations

This is a **massive upgrade** covering:
- Signal extraction algorithms
- Database schema changes (migrations required)
- New API endpoints (polling, info submission)
- Frontend components (status display, forms)
- Job queue architecture
- Retry logic infrastructure
- Comprehensive testing suite

**Estimated Total Work**: 40-60 hours for full implementation

**Recommendation**: Given the scope, I should:
1. ✅ Provide complete specification (this document)
2. ⚠️ Ask if you want me to:
   - **Option A**: Implement all phases now (will take significant time)
   - **Option B**: Implement highest-priority phase (B or C)
   - **Option C**: Create detailed implementation tickets for each phase

### Breaking Changes

- Database migration required (NEEDS_INFO status, needsInfo field, QRCodeHistory table)
- Frontend must handle new NEEDS_INFO status
- Existing tickets may need migration script for new schema

---

## 🎯 Next Steps (Pending Your Direction)

**Completed**:
- ✅ Phase A: Zero-OpenAI verification

**Awaiting Decision**:
- Should I proceed with full implementation?
- Should I prioritize specific phases?
- Should I create detailed tickets instead?

---

**Document Created**: January 7, 2026  
**Status**: Specification complete, awaiting implementation direction
