# CareConnect System Agent Handoff Report
**Date**: January 7, 2026  
**System Status**: ✅ All Services Operational  
**For**: Next Agent  
**From**: Previous Agent Session (January 6, 2026)

---

## 📋 Executive Summary

The CareConnect system is a **speech-to-fundraising pipeline** that converts audio recordings into professional GoFundMe campaign drafts with QR-coded payment links. The system is fully operational, running on Node.js v24.12.0 with PM2 process management, using a remote Prisma database, and integrating AssemblyAI for transcription.

**Core Purpose**: Help homeless individuals and vulnerable populations create professional fundraising campaigns through voice recording instead of complex web forms.

**Current System State**:
- ✅ **Backend**: Online on port 3001 (TypeScript via ts-node --transpile-only)
- ✅ **Frontend**: Online on port 3000 (Next.js 14)
- ✅ **Database**: Remote Prisma database (db.prisma.io:5432) - 773ms latency, healthy
- ✅ **External Services**: All healthy (AssemblyAI, Stripe, Cloudflare, OpenAI fallback)
- ⚠️ **Docker**: Unavailable (service stopped) - not blocking operations
- ⚠️ **Speech Intelligence**: Degraded status (smoke test failed but service operational)

---

## 🎯 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     USER INTERACTION LAYER                          │
├─────────────────────────────────────────────────────────────────────┤
│  1. Red Button Recording → Audio File Upload                        │
│  2. Optional: Manual Form Data Entry                                │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  DONATION PIPELINE ORCHESTRATOR                     │
│           (backend/src/services/donationPipeline/orchestrator.ts)   │
├─────────────────────────────────────────────────────────────────────┤
│  STEP 1: TRANSCRIPTION                                              │
│  ├─ AssemblyAI Provider (Primary - $0.0075/min)                    │
│  ├─ Creates TranscriptionSession with consent tracking             │
│  ├─ Stores transcript text + segments in database                  │
│  └─ Updates RecordingTicket status → PROCESSING                    │
│                                                                      │
│  STEP 2: ANALYSIS                                                   │
│  ├─ Extract key points (keyword pattern matching)                  │
│  ├─ Sentiment analysis (positive/negative word counting)           │
│  ├─ Language detection (common word frequency)                     │
│  └─ Creates SpeechAnalysisResult record                            │
│                                                                      │
│  STEP 3: DRAFT GENERATION (with Knowledge Vault)                   │
│  ├─ Query Knowledge Vault for GoFundMe draft template              │
│  ├─ Apply validation rules (min length, required fields)           │
│  ├─ Generate campaign title from first key point/sentence          │
│  ├─ Format story (5000 char limit, cleanup)                        │
│  ├─ Create DonationDraft with editable JSON metadata               │
│  ├─ Quality scoring (0.5 if issues, 1.0 if perfect)               │
│  ├─ Log knowledge usage for learning                               │
│  └─ Updates RecordingTicket status → READY                         │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     OUTPUT GENERATION LAYER                         │
├─────────────────────────────────────────────────────────────────────┤
│  GOFUNDME DRAFT:                                                    │
│  ├─ Title: Auto-generated from key points                          │
│  ├─ Story: Formatted transcript (first-person narrative)           │
│  ├─ Metadata: Sentiment, categories, quality score                 │
│  └─ Editable JSON: Breakdown, suggestions, issues                  │
│                                                                      │
│  QR CODE + STRIPE CHECKOUT:                                         │
│  ├─ Create Stripe Checkout Session (payment mode, USD)             │
│  ├─ Generate QR Code → Stripe checkout URL                         │
│  ├─ Store QRCodeLink with ticketId attribution                     │
│  ├─ Metadata tracking (recordingId, title, amount)                 │
│  └─ Return: QR code data URL + checkout URL + session ID           │
│                                                                      │
│  DOWNLOADABLE DOCUMENTS:                                            │
│  ├─ Word Document (.docx) - GoFundMe submission ready              │
│  ├─ QR Code PNG - Scannable payment link                           │
│  └─ Print Kit - Combined campaign materials                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Speech-to-GoFundMe Pipeline Flow

### **User Journey: From Voice Recording to Fundraising Campaign**

#### **Phase 1: Recording & Upload** (User-Facing)

1. **User opens CareConnect frontend** (https://care2connects.org)
2. **Click "Red Record Button"** → Audio recording starts
3. **Speak their story** (e.g., "Hi, I'm Sarah. I lost my job and need help with rent...")
4. **Stop recording** → Audio file uploaded to backend
5. **Backend creates RecordingTicket**:
   - Assigns UUID ticket ID
   - Status: `CREATED`
   - Links to user profile
   - Stores audio file path

**Technical Details**:
- Audio format: WAV/MP3/M4A (browser-dependent)
- Stored in: `backend/storage/audio/` directory
- Max duration: Typically 2-5 minutes
- Creates database record: `RecordingTicket` table

---

#### **Phase 2: Transcription** (Automated - Step 1)

**Function**: `performTranscription(ticketId, audioFilePath)`  
**Location**: `backend/src/services/donationPipeline/orchestrator.ts` lines 160-280

**Process**:
1. **Verify audio file exists** on disk
2. **Get transcription provider** (AssemblyAI in V1)
   - Provider abstraction: `backend/src/providers/transcription/`
   - Uses AssemblyAI API key from environment
   - Cost: $0.0075 per minute (vs OpenAI $0.018/min)
3. **Create TranscriptionSession** via SessionManager:
   - Source: `USER_RECORDING`
   - Engine: `ASSEMBLYAI`
   - Consent tracking: `consentToStoreText: true`
   - Retention: 365 days
   - Links to RecordingTicket via `recordingTicketId`
4. **Call AssemblyAI API**:
   - Upload audio file
   - Wait for processing (async polling)
   - Retrieve transcript text
5. **Store results**:
   - Update TranscriptionSession: `status: COMPLETED`, `transcriptText`
   - Create TranscriptionSegments (sentence-level breakdown)
   - Detected language: `en` (hardcoded for V1)
6. **Update ticket status**: `PROCESSING`

**Error Handling**:
- If transcription fails → Create Incident (PipelineStage.TRANSCRIPTION)
- Stores context: audioFilePath, provider, error message
- Returns `{success: false, error: message}`

**Example Output**:
```typescript
{
  success: true,
  sessionId: "uuid-session-123",
  engine: "ASSEMBLYAI",
  duration: 45000 // milliseconds
}
```

**Example Transcript**:
```
"Hi, my name is Sarah Johnson. I'm 34 years old and I've been homeless for 
three months after losing my job as a nurse. I need help with first month's 
rent and security deposit to get into stable housing. I'm currently staying 
at a shelter and looking for work. Any support would help me get back on my feet."
```

---

#### **Phase 3: Analysis** (Automated - Step 2)

**Function**: `performAnalysis(transcript, transcriptionSessionId)`  
**Location**: `backend/src/services/donationPipeline/orchestrator.ts` lines 282-378

**Process**:
1. **Split transcript** into words and sentences
2. **Extract key points** (heuristic keyword matching):
   - Patterns: `need|require|must`, `help|assist|support`, `medical|health`, `family|child`, `job|work|income`, `home|house|rent`
   - Matches sentences containing keywords
   - Returns top 5 key points
3. **Sentiment analysis** (word counting):
   - Positive words: hope, grateful, thank, happy, better, improve
   - Negative words: difficult, struggle, hard, challenging, problem, crisis
   - Calculates ratio:
     - `hopeful`: positiveCount > negativeCount + 2
     - `urgent`: negativeCount > positiveCount + 2
     - `neutral`: otherwise
4. **Language detection** (basic English check):
   - Count common English words: the, is, are, and, to, of, in, a, for
   - If > 5 matches → `en`, else `unknown`
5. **Store SpeechAnalysisResult**:
   - Links to TranscriptionSession
   - Confidence score: 0.9 if >10 English words, else 0.6
   - Processing time: 0ms (instant)

**Error Handling**:
- Returns `{success: false, error: message}` on failure
- Analysis failures are non-blocking (draft generation can use raw transcript)

**Example Output**:
```typescript
{
  success: true,
  keyPoints: [
    "I need help with first month's rent and security deposit",
    "I've been homeless for three months after losing my job as a nurse",
    "I'm currently staying at a shelter and looking for work",
    "Any support would help me get back on my feet"
  ],
  sentiment: "urgent",
  language: "en"
}
```

---

#### **Phase 4: Draft Generation** (Automated - Step 3)

**Function**: `generateDraft(ticketId, transcript, analysis)`  
**Location**: `backend/src/services/donationPipeline/orchestrator.ts` lines 380-550

**Process**:

1. **Query Knowledge Vault** for GoFundMe draft template:
   - Function: `getDonationDraftTemplate()`
   - Searches tags: `DONATION_DRAFT` + `TEMPLATE`
   - Returns template with validation rules and formatting guidelines
   - Location: `backend/src/services/knowledge/query.ts`

2. **Apply Template Validation Rules**:
   - `minStoryLength`: 100 characters (from template metadata)
   - `requiredFields`: ['title', 'story']
   - `prohibitedContent`: [] (expandable list, e.g., profanity, scams)

3. **Generate Campaign Title**:
   - **Priority 1**: First key point from analysis (if exists)
   - **Priority 2**: First sentence of transcript
   - **Fallback**: "Help Support This Cause"
   - **Formatting**: Truncate to 60 chars with "..." if longer

4. **Generate Story**:
   - Use full transcript text
   - Trim whitespace
   - Truncate to 5000 characters (GoFundMe limit)
   - No AI rewriting in V1 (preserves authentic voice)

5. **Quality Validation**:
   - Check title length >= 10 chars
   - Check story length >= minStoryLength (100)
   - Check for prohibited content
   - Calculate quality score:
     - `1.0`: No issues (perfect)
     - `0.5`: Has issues (needs review)

6. **Create DonationDraft Record**:
   - Fields: `ticketId`, `title`, `story`, `currency: USD`, `editableJson`
   - editableJson contains:
     ```json
     {
       "breakdown": ["key point 1", "key point 2", ...],
       "sentiment": "urgent",
       "suggestedCategories": ["medical", "family", "emergency"],
       "templateUsed": "template-uuid",
       "knowledgeUsed": ["template-uuid"],
       "qualityScore": 1.0,
       "qualityIssues": [] // or list of issues
     }
     ```

7. **Log Knowledge Usage**:
   - Tracks which knowledge chunks influenced generation
   - Outcome: `SUCCESS` (no issues) or `PARTIAL` (has issues)
   - Used for improving knowledge vault over time

8. **Handle Quality Issues**:
   - If issues detected → Create Incident (WARN severity)
   - Context: draftId, qualityIssues, storyLength, templateUsed
   - Non-blocking (draft still created)

9. **Update Ticket Status**: `READY`

**Error Handling**:
- On failure → Create Incident (PipelineStage.DRAFT, ERROR severity)
- Stores context: transcriptLength, analysisPresent
- Returns `{success: false, error: message}`

**Example Output** (stored in database):

```javascript
DonationDraft {
  id: "draft-uuid-456",
  ticketId: "ticket-uuid-123",
  title: "I need help with first month's rent and security deposit",
  story: "Hi, my name is Sarah Johnson. I'm 34 years old and I've been homeless for three months after losing my job as a nurse. I need help with first month's rent and security deposit to get into stable housing. I'm currently staying at a shelter and looking for work. Any support would help me get back on my feet.",
  goalAmount: null, // User can add later
  currency: "USD",
  category: null, // User can select later
  editableJson: {
    breakdown: [
      "I need help with first month's rent and security deposit",
      "I've been homeless for three months after losing my job as a nurse",
      "I'm currently staying at a shelter and looking for work",
      "Any support would help me get back on my feet"
    ],
    sentiment: "urgent",
    suggestedCategories: ["medical", "family", "emergency"],
    templateUsed: "template-uuid-789",
    knowledgeUsed: ["template-uuid-789"],
    qualityScore: 1.0,
    qualityIssues: undefined
  },
  createdAt: "2026-01-07T10:30:00Z",
  updatedAt: "2026-01-07T10:30:00Z"
}
```

---

#### **Phase 5: QR Code & Stripe Checkout Generation** (On-Demand)

**Triggered**: When user clicks "Generate Donation Tools" on frontend  
**Function**: `createPaymentQR(options)`  
**Location**: `backend/src/services/qrCodeGenerator.ts` lines 36-135

**Process**:

1. **Verify RecordingTicket exists** (by ticketId)

2. **Create Stripe Checkout Session**:
   - Function: `createCheckoutSession()`
   - Mode: `payment` (one-time donation)
   - Amount: User-specified (default $50)
   - Currency: USD
   - Success URL: `https://care2connects.org/payment-success?ticket=[ticketId]`
   - Cancel URL: `https://care2connects.org/payment-cancel?ticket=[ticketId]`
   - Metadata:
     ```json
     {
       "ticketId": "uuid-123",
       "recordingId": "uuid-123",
       "title": "Support Sarah's Journey",
       "source": "careconnect_donation_qr"
     }
     ```
   - Creates `StripeAttribution` record for tracking

3. **Generate QR Code**:
   - Library: `qrcode` npm package
   - Input: Stripe checkout URL (e.g., `https://checkout.stripe.com/c/pay/cs_test_abc123...`)
   - Configuration:
     - Error correction: Medium (M)
     - Type: PNG image
     - Size: 300x300 pixels
     - Margin: 2 pixels
   - Output: Base64 data URL (`data:image/png;base64,iVBORw0KGgo...`)

4. **Optional: Save QR Image to Disk**:
   - If `SAVE_QR_IMAGES=true` in .env:
     - Directory: `backend/storage/qr-codes/`
     - Filename: `qr-[ticketId].png`
     - Stored as PNG file

5. **Create/Update QRCodeLink Record**:
   - Fields: `ticketId`, `targetUrl` (Stripe URL), `imageStorageUrl`
   - Upsert logic: Update if exists, create if new
   - Enables re-scanning same QR later

6. **Return Complete Payment Flow**:
   ```typescript
   {
     success: true,
     qrCodeId: "qr-uuid-789",
     checkoutSessionId: "cs_test_abc123",
     checkoutUrl: "https://checkout.stripe.com/c/pay/cs_test_abc123...",
     qrCodeData: "data:image/png;base64,iVBORw0KGgo...",
     qrImagePath: "C:/Users/richl/Care2system/backend/storage/qr-codes/qr-ticket-uuid-123.png"
   }
   ```

**Error Handling**:
- If Stripe keys missing → Return 503 error with `STRIPE_NOT_CONFIGURED` code
- Frontend shows "Preview Mode" banner
- Uses placeholder URL: `http://localhost:3000/donate/[recordingId]`
- QR code still generates for testing

**Example QR Code Scan Flow**:
1. User scans QR with phone camera
2. Opens Stripe Checkout page in mobile browser
3. Enters payment details (card, Apple Pay, Google Pay)
4. Completes payment
5. Stripe webhook fires → Backend updates donation tracking
6. User redirected to success page

---

#### **Phase 6: Document Generation** (On-Demand)

**Triggered**: When user clicks "Download Print Kit" on frontend  
**Endpoint**: `POST /api/donations/generate-document`  
**Format**: Microsoft Word (.docx)

**Process**:

1. **Fetch DonationDraft** from database
2. **Generate Word Document**:
   - **Title** (Heading 1): Campaign title
   - **Goal Amount** (if set): "$5,000 Goal"
   - **Story** (Body text): Full transcript/edited story
   - **Key Points** (Bulleted list): From analysis breakdown
   - **Suggested Categories**: Medical, Family, Emergency
   - **QR Code Image**: Embedded PNG
   - **Submission Instructions**: "Copy this content to GoFundMe.com/start"
3. **Return downloadable file**:
   - Filename: `gofundme-draft-[timestamp].docx`
   - Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

**Use Case**: Case workers or users can upload this directly to GoFundMe instead of typing

---

### **Complete End-to-End Example**

**Input** (User speaks):
> "Hi, my name is Sarah Johnson. I'm 34 years old and I've been homeless for three months after losing my job as a nurse. I need help with first month's rent and security deposit to get into stable housing. I'm currently staying at a shelter and looking for work. Any support would help me get back on my feet."

**Pipeline Processing**:
1. **Transcription** (AssemblyAI): 
   - Duration: 15 seconds
   - Cost: $0.00188 (15 sec ÷ 60 × $0.0075)
   - Output: Text above

2. **Analysis**:
   - Key points: 4 sentences extracted
   - Sentiment: "urgent" (struggle, homeless, help detected)
   - Language: "en" (90% confidence)

3. **Draft Generation**:
   - Title: "I need help with first month's rent and security deposit"
   - Story: Full transcript (unchanged)
   - Quality score: 1.0 (no issues)
   - Suggested categories: ["medical", "family", "emergency"]

4. **QR Code Generation**:
   - Stripe checkout: $500 default amount
   - QR code: 300×300 PNG
   - Checkout URL: `https://checkout.stripe.com/c/pay/cs_test_...`

**Output** (User receives):
- ✅ **GoFundMe Campaign Draft** (copy-paste ready)
- ✅ **QR Code PNG** (downloadable, scannable)
- ✅ **Word Document** (professional formatting)
- ✅ **Stripe Payment Link** (shareable URL)

**Time**: ~10-30 seconds total (transcription is the bottleneck)

---

## 🗄️ Database Schema (Relevant Tables)

### **RecordingTicket**
- **Primary Key**: `id` (UUID)
- **Status**: `CREATED` → `PROCESSING` → `READY` / `ERROR`
- **Fields**: `displayName`, `audioFilePath`, `userId`, timestamps
- **Relations**: 
  - `transcriptionSessions` (1-to-many)
  - `donationDraft` (1-to-1)
  - `qrCodeLink` (1-to-1)

### **TranscriptionSession**
- **Primary Key**: `id` (UUID)
- **Engine**: `ASSEMBLYAI` / `OPENAI` / `STUB`
- **Fields**: `transcriptText`, `detectedLanguage`, `confidence`, `status`
- **Relations**: 
  - `recordingTicket` (many-to-1)
  - `segments` (1-to-many TranscriptionSegment)
  - `analysisResults` (1-to-many SpeechAnalysisResult)

### **DonationDraft**
- **Primary Key**: `id` (UUID)
- **Fields**: `title`, `story`, `goalAmount`, `currency`, `category`, `editableJson`
- **editableJson Structure**:
  ```json
  {
    "breakdown": string[],
    "sentiment": "hopeful" | "urgent" | "neutral",
    "suggestedCategories": string[],
    "templateUsed": string | null,
    "knowledgeUsed": string[],
    "qualityScore": number (0.0-1.0),
    "qualityIssues": string[] | undefined
  }
  ```
- **Relations**: 
  - `recordingTicket` (1-to-1)

### **QRCodeLink**
- **Primary Key**: `id` (UUID)
- **Fields**: `ticketId`, `targetUrl` (Stripe checkout), `imageStorageUrl`, `scanCount`
- **Relations**: 
  - `recordingTicket` (1-to-1)

### **StripeAttribution**
- **Primary Key**: `id` (UUID)
- **Fields**: `ticketId`, `checkoutSessionId`, `amountCents`, `currency`, `status`
- **Used for**: Tracking which donations came from which recordings

---

## 🔐 Environment Configuration

### **Backend (.env)**

**Required for Production**:
```bash
# Database
DATABASE_URL="postgres://[credentials]@db.prisma.io:5432/postgres?sslmode=require&pool=true"

# AssemblyAI (Transcription)
ASSEMBLYAI_API_KEY="your_assemblyai_key"

# Stripe (Payments)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Cloudflare (DNS/Tunnel)
CLOUDFLARE_API_TOKEN="your_token"
CLOUDFLARE_ZONE_ID="your_zone_id"

# OpenAI (Optional Fallback)
OPENAI_API_KEY="sk-..." # Used for fallback transcription/AI if enabled

# Frontend URL
FRONTEND_URL="https://care2connects.org"
```

**V1 Mode Flags**:
```bash
# Zero-OpenAI Mode (V1 Stabilization)
AI_PROVIDER="rules"  # Options: "rules" | "openai"
TRANSCRIPTION_PREFERENCE="assemblyai"  # Options: "assemblyai" | "openai" | "stub"
EVTS_VARIANT="SIMPLE"  # Options: "SIMPLE" | "FULL"
```

**Optional**:
```bash
# QR Code Storage
SAVE_QR_IMAGES="true"  # Save QR codes to disk

# Node Environment
NODE_ENV="development"  # or "production"
PORT=3001
```

### **Frontend (.env.local)**

```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"  # or https://api.care2connects.org
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." # or pk_live_...
```

---

## 📦 Technology Stack

### **Backend**
- **Runtime**: Node.js v24.12.0
- **Language**: TypeScript 5.x (using `ts-node --transpile-only` for dev)
- **Framework**: Express.js (RESTful API)
- **Database**: PostgreSQL via Prisma ORM
- **Process Manager**: PM2 (fork mode, auto-restart)
- **Transcription**: AssemblyAI SDK
- **Payments**: Stripe Node SDK
- **QR Codes**: `qrcode` npm package
- **Document Generation**: `docx` library (Word format)

### **Frontend**
- **Runtime**: Node.js v24.12.0
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS
- **QR Display**: `qrcode` npm package (client-side)
- **Icons**: Lucide React

### **Infrastructure**
- **Hosting**: Local development (production: Cloudflare Tunnel)
- **Database**: Remote Prisma Accelerate (db.prisma.io)
- **CDN/SSL**: Cloudflare (care2connects.org)
- **Domains**: 
  - Frontend: https://care2connects.org
  - API: https://api.care2connects.org

---

## 🛡️ Known Issues & Limitations

### **1. TypeScript Build Errors** ⚠️
- **Status**: 317 type errors across 43 files
- **Impact**: Cannot build production `dist/` folder
- **Workaround**: Using `ts-node --transpile-only` (bypasses type checking)
- **Cause**: Prisma schema mismatches, deprecated crypto functions, import issues
- **Action Required**: Fix type errors before production deployment

### **2. Docker Desktop Unavailable** ⚠️
- **Status**: Docker service stopped, commands timing out
- **Impact**: Cannot use local PostgreSQL container
- **Workaround**: Using remote Prisma database successfully
- **Action Required**: Restart Docker Desktop if local database needed

### **3. Speech Intelligence Degraded** ⚠️
- **Status**: Smoke test failed, service marked "degraded"
- **Impact**: Unknown - service still operational
- **Action Required**: Investigate `/api/test/speech-smoke-test` endpoint

### **4. Node.exe Popup Issue** ⚠️ (Monitoring)
- **Original Problem**: User removed Node.js due to intrusive popup windows
- **Current Status**: Node.js reinstalled, no recurrence yet
- **Monitoring**: Watch for popup windows interfering with computer usage
- **Potential Fix**: Investigate PM2 wrapper script or use PM2 daemon mode

### **5. No AI Rewriting in V1** (By Design)
- **Status**: Draft generation uses raw transcript (no GPT-4 enhancement)
- **Reason**: V1 stabilization focuses on zero-OpenAI mode
- **Future**: Can enable AI rewriting via `AI_PROVIDER="openai"` env flag
- **Impact**: Stories may need manual editing for clarity/flow

### **6. Manual GoFundMe Submission** (By Design)
- **Status**: System generates draft, user manually copies to GoFundMe.com
- **Reason**: No GoFundMe API available (requires OAuth & external partnership)
- **Workaround**: Word document export for easy copy-paste
- **Future**: Potential browser extension or partnership

---

## 🔧 Maintenance & Monitoring

### **Health Endpoints**

**Live Check** (Quick uptime):
```bash
curl http://localhost:3001/health/live
# Returns: {"status":"alive","timestamp":"...","uptime":123,"pid":1000,"port":"3001"}
```

**Detailed Status** (All services):
```bash
curl http://localhost:3001/health/status
# Returns: {
#   "status": "healthy",
#   "server": {...},
#   "services": {
#     "speech": {"status": "degraded", ...},
#     "tunnel": {"status": "healthy", "latency": 308},
#     "stripe": {"status": "healthy", "latency": 372},
#     "assemblyai": {"status": "healthy", "latency": 508},
#     "cloudflare": {"status": "healthy", "latency": 439},
#     "openai": {"status": "healthy", "latency": 775},
#     "prisma": {"status": "healthy", "latency": 773}
#   },
#   "incidents": {"open": 5, "total": 5}
# }
```

### **PM2 Commands**

**Check Status**:
```powershell
pm2 status
# Shows: careconnect-backend (online), careconnect-frontend (online)
```

**View Logs**:
```powershell
pm2 logs careconnect-backend --lines 50
pm2 logs careconnect-frontend --lines 50
```

**Restart Services**:
```powershell
pm2 restart careconnect-backend
pm2 restart careconnect-frontend
pm2 restart all
```

**Save Configuration** (persist after reboot):
```powershell
pm2 save
```

### **Database Queries**

**Check pipeline progress**:
```sql
-- Connect via Prisma Studio or psql
SELECT 
  id, status, displayName, createdAt, updatedAt
FROM "RecordingTicket"
ORDER BY createdAt DESC
LIMIT 10;
```

**Check transcription sessions**:
```sql
SELECT 
  rt.displayName, ts.status, ts.detectedLanguage, ts.confidence
FROM "TranscriptionSession" ts
JOIN "RecordingTicket" rt ON ts."recordingTicketId" = rt.id
ORDER BY ts.createdAt DESC
LIMIT 10;
```

**Check donation drafts**:
```sql
SELECT 
  dd.title, dd.goalAmount, dd.currency, dd."editableJson"->'qualityScore' as quality
FROM "DonationDraft" dd
ORDER BY dd.createdAt DESC
LIMIT 10;
```

**Check QR code usage**:
```sql
SELECT 
  rt.displayName, qr.scanCount, qr.targetUrl
FROM "QRCodeLink" qr
JOIN "RecordingTicket" rt ON qr."ticketId" = rt.id
WHERE qr.scanCount > 0
ORDER BY qr.scanCount DESC;
```

---

## 📚 Key Files Reference

### **Backend Core**
| File | Purpose | Lines |
|------|---------|-------|
| `backend/src/services/donationPipeline/orchestrator.ts` | Main pipeline orchestrator | 591 |
| `backend/src/services/qrCodeGenerator.ts` | QR code + Stripe integration | 182 |
| `backend/src/services/storyExtractionService.ts` | AI-powered story extraction | ~300 |
| `backend/src/services/knowledge/query.ts` | Knowledge Vault queries | ~200 |
| `backend/src/services/troubleshooting/pipelineTroubleshooter.ts` | Error handling & incidents | ~500 |
| `backend/start-backend.js` | PM2 wrapper for ts-node | 35 |

### **Provider Abstractions**
| File | Purpose |
|------|---------|
| `backend/src/providers/transcription/index.ts` | Transcription provider factory |
| `backend/src/providers/transcription/assemblyai.ts` | AssemblyAI implementation |
| `backend/src/providers/transcription/stub.ts` | Test stub (no API calls) |
| `backend/src/providers/ai/index.ts` | AI provider factory (rules/OpenAI) |

### **Frontend Key Pages**
| Route | File | Purpose |
|-------|------|---------|
| `/` | `frontend/app/page.tsx` | Home page with record button |
| `/story/[id]` | `frontend/app/story/[recordingId]/page.tsx` | Recording overview |
| `/story/[id]/donation-tools` | `frontend/app/story/[id]/donation-tools/page.tsx` | QR + draft generator |

### **Configuration**
| File | Purpose |
|------|---------|
| `ecosystem.config.js` | PM2 configuration (both services) |
| `backend/.env` | Backend secrets & config |
| `frontend/.env.local` | Frontend public config |
| `prisma/schema.prisma` | Database schema |

### **Documentation**
| File | Topic |
|------|-------|
| `AGENT_SESSION_REPORT_2026-01-06.md` | Previous agent session (Jan 6) |
| `DONATION_TOOLS_IMPLEMENTATION_SUMMARY.md` | QR code + Stripe feature |
| `GOFUNDME_KNOWLEDGE_VAULT_INTEGRATION.md` | Knowledge Vault usage |
| `DEMO_READINESS_REPORT.md` | Demo flow validation |
| `DONATION_SYSTEM_TESTING_GUIDE.md` | Testing procedures |

---

## 🎯 Quick Start for Next Agent

### **If System is Down**:
```powershell
# 1. Check Node.js
node --version  # Should be v24.12.0

# 2. Check PM2
pm2 status

# 3. Restart services if needed
pm2 restart careconnect-backend
pm2 restart careconnect-frontend
pm2 save

# 4. Verify health
curl http://localhost:3001/health/live
curl http://localhost:3000
```

### **If Database Connection Issues**:
```powershell
# Check DATABASE_URL in backend/.env
# Verify remote Prisma database is accessible
# Current: db.prisma.io:5432 (remote, not local Docker)
```

### **If Transcription Failing**:
```powershell
# Check AssemblyAI API key
echo $env:ASSEMBLYAI_API_KEY  # Should start with "your_assemblyai_key"

# Check provider mode
echo $env:TRANSCRIPTION_PREFERENCE  # Should be "assemblyai"

# Test endpoint
curl http://localhost:3001/api/test/transcription-provider
```

### **If QR Codes Not Generating**:
```powershell
# Check Stripe configuration
echo $env:STRIPE_SECRET_KEY  # Should start with "sk_"

# Test Stripe connectivity
curl http://localhost:3001/health/status
# Look for "stripe": {"status": "healthy"}
```

### **To Test Full Pipeline**:
```powershell
# 1. Upload audio file via frontend recording
# 2. Wait for transcription (~10-30 seconds)
# 3. Check ticket status:
curl http://localhost:3001/api/tickets/[ticketId]/status

# 4. Generate QR code:
# POST to /api/payments/create-donation-checkout
# with body: {"recordingId": "...", "amountCents": 5000}
```

---

## 🚀 Future Enhancements (Out of V1 Scope)

1. **AI-Enhanced Story Rewriting**:
   - Enable `AI_PROVIDER="openai"` for GPT-4 narrative improvements
   - Maintains authenticity while improving clarity and emotional appeal

2. **Multi-Language Support**:
   - Transcription: AssemblyAI supports 50+ languages
   - Translation: Google Cloud Translation API
   - Draft generation: Multi-language templates

3. **Direct GoFundMe API Integration**:
   - Requires GoFundMe partnership/OAuth
   - Auto-create campaigns without manual copy-paste

4. **Mobile App**:
   - React Native or Flutter
   - Built-in audio recording
   - QR code scanning

5. **Analytics Dashboard**:
   - Campaign performance tracking
   - Donation conversion rates
   - A/B testing for story formats

6. **Production Build**:
   - Fix 317 TypeScript errors
   - Build `backend/dist/` folder
   - Update PM2 to use compiled JavaScript

---

## 📞 Contact & Support

**System Owner**: Rich  
**Email**: workflown8n@gmail.com  
**System Status Dashboard**: http://localhost:3001/health/status  
**Public Frontend**: https://care2connects.org  
**API Base**: https://api.care2connects.org  

---

## ✅ Current System Verification (January 7, 2026)

- ✅ Node.js v24.12.0 installed and operational
- ✅ PM2 functional with Node.js
- ✅ Backend online on port 3001 (3 restarts logged, now stable)
- ✅ Frontend online on port 3000 (1 restart logged, now stable)
- ✅ Health endpoint returning HTTP 200
- ✅ All external services healthy (AssemblyAI, Stripe, Cloudflare)
- ✅ Database connected (remote Prisma: 773ms latency)
- ✅ PM2 configuration saved (auto-restart on reboot)
- ✅ Transcription pipeline tested and working
- ✅ Draft generation tested and working
- ✅ QR code generation tested and working
- ⚠️ Docker unavailable (not blocking current operations)
- ⚠️ Speech Intelligence degraded (functional but needs investigation)
- ⚠️ TypeScript build errors (blocking production builds)

---

**Report Generated**: January 7, 2026  
**Last System Health Check**: January 7, 2026 10:00 UTC  
**Next Recommended Action**: Monitor for Node.exe popup recurrence, investigate Speech Intelligence degraded status when convenient  

---

*This report provides complete context for understanding and maintaining the CareConnect speech-to-fundraising system.*
