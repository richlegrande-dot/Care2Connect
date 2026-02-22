# Phase 6 Frontend V1 Implementation - Complete Specification

**Date:** December 16, 2025  
**Status:** 📋 **READY TO IMPLEMENT**  
**Backend Status:** ✅ COMPLETE (port 3003)  
**Reference:** See [PHASE_6_BACKEND_COMPLETION_STATUS.md](PHASE_6_BACKEND_COMPLETION_STATUS.md)

---

## Executive Summary

Implement the complete Care2Connect V1 frontend to match the Phase 6 backend donation pipeline. Every clickable button must have a working page, and any unimplemented features must be visibly disabled (not broken). The site must be simple, clean, ready-to-use, and preserve existing functionality.

**Core Flow:** Recording → Processing Animation → Draft Editor → Document Generation → QR/Stripe Payment

**Additional Features:** Profile Search, Recipient Access, Support Tickets, Functional Health Dashboard

---

## A) Global UI/Branding Requirements

### Branding Changes

**REPLACE ALL INSTANCES:**
- ❌ "Government supported"
- ❌ "Government-Supported Homeless Initiative"

**WITH:**
- ✅ "Community Support Portal"
- ✅ "Community-Supported Homeless Initiative"

### Design Principles

1. **Clean Minimalist Layout**
   - Improve spacing and typography
   - Use card-based design for content
   - Consistent header + footer on all pages
   - Mobile-friendly responsive design

2. **Button States**
   - **Working buttons:** Must navigate to functional pages
   - **Non-working buttons:** Must be visibly disabled with tooltip "Coming soon"
   - Clear hover and active states
   - Loading states for async operations

3. **Consistency**
   - Same header/footer across all pages
   - Consistent color scheme and typography
   - Standard error handling and messaging
   - Unified spacing and layout grid

---

## B) Pages to Build (Required Routes)

### 1. `/record` - Create a New Story

**Purpose:** Initial recording page for users to tell their story

**Features:**

1. **Contact Information Form**
   - Contact Type: Radio buttons (EMAIL, PHONE)
   - Contact Value: Text input with validation
   - Display Name: Optional text input
   - Clear instructions and labels

2. **Create Ticket**
   ```typescript
   // API Call
   POST /api/tickets/create
   {
     contactType: "EMAIL" | "PHONE",
     contactValue: string,
     displayName?: string
   }
   // Response: { id: string, ... }
   ```

3. **Audio Recording UI**
   - Use MediaRecorder API
   - Show recording timer
   - Visual waveform/indicator (optional but nice)
   - Preview playback before upload
   - "Start Recording" / "Stop Recording" / "Re-record" buttons

4. **Audio Upload**
   ```typescript
   // API Call
   POST /api/tickets/:id/upload-audio
   // Content-Type: multipart/form-data
   // File: audio file (WAV, MP3, OGG)
   // Max size: 50MB
   ```

5. **Progress Indication**
   - Show upload progress bar
   - Handle upload errors gracefully
   - Success message before navigation

6. **Navigation**
   - On successful upload: Navigate to `/process/[ticketId]`

**Error Handling:**
- Network errors
- Invalid audio format
- Upload failures
- Large file warnings

---

### 2. `/process/[id]` - Processing Animation + Polling

**Purpose:** Show processing animation while backend transcribes and analyzes audio

**Features:**

1. **Fun Animation**
   - Paper shuffling / documents processing animation
   - Loading spinner or Lottie animation
   - Progress indicators: "Transcribing...", "Analyzing...", "Generating draft..."
   - Estimated time remaining (optional)

2. **Start Processing (on page load)**
   ```typescript
   // Guard with "started" state to prevent duplicate calls
   POST /api/tickets/:id/process
   {
     audioFilePath: string // Already set by upload
   }
   // Response: 202 Accepted with pollUrl
   ```

3. **Status Polling (every 2 seconds)**
   ```typescript
   // Poll endpoint
   GET /api/tickets/:id/status
   // Response: {
   //   status: "PROCESSING" | "READY" | "ERROR",
   //   hasTranscription: boolean,
   //   hasDraft: boolean,
   //   hasDocument: boolean
   // }
   ```

4. **State Transitions**
   - PROCESSING: Show animation + progress
   - READY: Navigate to `/edit/[ticketId]`
   - ERROR: Show error message with retry option

5. **User Feedback**
   - Show current step in pipeline
   - "This usually takes 1-2 minutes" message
   - Option to cancel and return later (save ticket ID)

**Error Handling:**
- Processing failures
- Timeout after reasonable duration (5 minutes)
- Network errors during polling
- Provide ticket ID for later resume

---

### 3. `/edit/[id]` - Draft Editor + Generate Document + Payment

**Purpose:** Main editor for reviewing and editing the generated draft, creating documents, and initiating payments

**Features:**

1. **Load Ticket Data**
   ```typescript
   GET /api/tickets/:id?include=draft,documents,qr,attributions
   // Response: Complete ticket with all relations
   ```

2. **Header Section**
   - Display ticket ID (copyable)
   - Show current status badge
   - Show "Payment Received" banner if status === PAYMENT_RECEIVED
   - Last updated timestamp

3. **Draft Editor Fields (All Editable)**
   - **Title:** Text input
   - **Goal Amount:** Number input with currency symbol
   - **Currency:** Dropdown (USD, EUR, GBP, etc.)
   - **Beneficiary Name:** Text input
   - **Location:** Text input
   - **Story:** Rich text area (large, multi-line)
   - **Breakdown Bullets:** Dynamic list
     - Add/remove bullet points
     - Editable text for each
     - Stored in editableJson.breakdown array

4. **Save Draft Button**
   ```typescript
   PATCH /api/tickets/:id/draft
   {
     title: string,
     story: string,
     goalAmount: number,
     beneficiary?: string,
     location?: string,
     currency: string,
     breakdown: string[] // bullets
   }
   // Show "Saved" indicator
   ```

5. **Preview Section**
   - Live preview of how draft will look
   - Toggle between edit and preview modes

6. **Generate Document Section**
   ```typescript
   POST /api/tickets/:id/generate-doc
   {
     docType: "GOFUNDME_DRAFT" | "RECEIPT"
   }
   // Response: { documentId, filePath, type }
   ```
   - Button: "Generate GoFundMe Draft"
   - Button: "Generate Receipt" (if applicable)
   - Show success message with document info

7. **Document List**
   ```typescript
   GET /api/tickets/:id/documents
   // Response: Array of documents
   ```
   - Display generated documents with:
     - Document type
     - Created timestamp
     - Download button (link to file)
   - If backend file serving route missing, implement:
     ```typescript
     GET /api/tickets/:id/documents/:docId/download
     // Returns file buffer
     ```

8. **Payment Section**
   ```typescript
   POST /api/tickets/:id/create-payment
   {
     amount: number,
     currency: string,
     description?: string
   }
   // Response: { qrCodeData, checkoutUrl, checkoutSessionId }
   ```
   - Input: Amount (for processing fee/donation)
   - Input: Description (optional)
   - Button: "Create Payment QR Code"
   - Display:
     - QR code image (base64 data URL)
     - Stripe Checkout URL button ("Pay with Stripe")
     - Session ID for reference

9. **Donations Tracking Section** (NEW)
   - List all donations for this ticket
   - Show:
     - Timestamp
     - Amount + Currency
     - Sender last name (if available in metadata)
     - Payment status (PAID, CREATED, FAILED)
   - Show total amount for ticket
   - API endpoints (implement if missing):
     ```typescript
     GET /api/tickets/:id/donations
     // Returns array of StripeAttribution records
     
     GET /api/tickets/:id/donations/total
     // Returns { total: number, currency: string, count: number }
     ```

**Error Handling:**
- Validation errors on save
- Document generation failures
- Payment creation errors
- Handle missing draft data

**Auto-save:**
- Implement debounced auto-save (optional but nice)
- Show "Saving..." / "Saved" indicator

---

### 4. `/find` - Story Profile Search + Donation/Recipient Access

**Purpose:** Search for existing stories by contact info, donate or resume editing

**Features:**

1. **Search Bar**
   - Input: Email or Phone
   - Search button
   - Clear instructions: "Enter your email or phone to find your story"

2. **Backend Integration**
   ```typescript
   // Implement if missing
   GET /api/profiles/search?contact=xxx
   // Returns: Array of matching RecordingTickets
   // Search by: contactValue (case-insensitive, trim whitespace)
   ```

3. **Results Display**
   - Show cards for each matching ticket
   - Card contents:
     - **Display Name** (or "Unnamed Story")
     - **Status** badge (DRAFT, RECORDING, PROCESSING, READY, PUBLISHED, PAYMENT_RECEIVED)
     - **Created At** (formatted date)
     - **Last Updated** (formatted date)
     - **Goal Amount** (if draft exists)
   
4. **Action Buttons per Card**
   - **"Donate" Button:**
     - Opens QR code section
     - Shows existing QR if available:
       ```typescript
       GET /api/tickets/:id/qr-code
       // Returns: { qrCodeData, targetUrl, createdAt }
       ```
     - Or creates new payment:
       ```typescript
       POST /api/tickets/:id/create-payment
       { amount: 25, currency: "USD", description: "Donation" }
       ```
     - Display QR + Stripe Checkout button
   
   - **"Access as Recipient" Button:**
     - Route to `/resume/[ticketId]`
     - Or directly to `/edit/[id]` if status === READY

5. **No Results State**
   - Clear message: "No stories found with that contact info"
   - Link to create new story: `/record`

**Important Rules:**
- **Recipient Access:** Uses ONLY phone/email entered - NO verification step
- **Credential Changes:** Only allowed via support ticket reset request
- **Do NOT delete recordings** on credential mismatch

---

### 5. `/resume/[id]` - Pick Up Where They Left Off

**Purpose:** Resume editing a story by verifying contact info

**Features:**

1. **Contact Verification Prompt**
   - "Please enter the phone/email you used when creating this story"
   - Input: Contact value
   - Submit button

2. **Verification Logic**
   ```typescript
   // Load ticket
   GET /api/tickets/:id
   
   // Compare entered value to ticket.contactValue
   if (match) {
     // Allow access
     navigate to appropriate page based on status:
     - DRAFT or RECORDING: /record (with ticket ID)
     - PROCESSING: /process/[id]
     - READY: /edit/[id]
   } else {
     // Show mismatch message
   }
   ```

3. **Mismatch Handling**
   - Clear message: "That contact info doesn't match this story"
   - Option: "Request Profile Reset"
   - Link to support ticket form with:
     - Pre-filled ticket ID
     - Category: "Profile Reset Request"
     - Message template: "I need to update the contact info for this story"

4. **Security Note**
   - Display: "For security, we don't show the stored contact info"
   - "If you've changed your email/phone, submit a reset request"

**Important:**
- Do NOT delete recordings on verification failure
- Do NOT show stored contact info
- Must create support ticket for credential changes

---

### 6. `/support` - User Support Ticket Submission

**Purpose:** Allow users to submit support requests, including profile reset requests

**Features:**

1. **Support Ticket Form**
   - **Ticket ID** (optional): If requesting help with specific story
   - **Contact Info:** Email or phone
   - **Category:** Dropdown
     - Technical Issue
     - Profile Reset Request ⭐
     - Question
     - Other
   - **Message:** Text area (required)
   - Submit button

2. **Backend Integration**
   ```typescript
   // Implement if missing
   POST /api/support/tickets
   {
     ticketId?: string,
     contact: string,
     category: string,
     message: string,
     requestType: string
   }
   // Returns: { supportTicketId, status: "PENDING" }
   ```

3. **Profile Reset Request Flow**
   - When category === "Profile Reset Request"
   - Show additional field:
     - **New Contact Info:** What they want to change to
   - Clear explanation:
     - "An admin will review and approve your request"
     - "Your recordings and story will NOT be deleted"
     - "This usually takes 1-2 business days"

4. **Success State**
   - Show confirmation message
   - Display support ticket ID
   - "We'll review your request and update your story profile"
   - Link to check status (future feature, can be disabled for now)

5. **Admin Panel Note**
   - Admin panel can remain private/internal for now
   - User submission must work
   - Admin approval flow can be implemented later

**Backend Endpoints Needed (if missing):**
```typescript
// Create support ticket
POST /api/support/tickets

// Admin endpoints (can be implemented later)
GET /admin/support/pending
POST /admin/support/:id/approve
POST /admin/support/:id/reject
```

---

### 7. `/health` - Fully Functional Health Dashboard

**Purpose:** Live system health monitoring with graphs, support log, and self-heal capability

**Features:**

1. **Live Health Graph**
   ```typescript
   GET /health/history?window=24h&limit=100
   // Returns: Array of HealthCheckRun records
   ```
   - Display time-series graph using Chart.js or Recharts
   - X-axis: Time (last 24 hours)
   - Y-axis: Health status (HEALTHY, DEGRADED, DOWN)
   - Multiple lines:
     - Overall system health
     - Database health
     - Cloudflare API health
     - Tunnel status
     - OpenAI API health
     - Stripe API health

2. **Current Status Panel**
   - Live indicators for each service:
     - ✅ Database: Connected
     - ✅ Cloudflare: Healthy
     - ✅ Tunnel: Active
     - ✅ OpenAI: Available
     - ✅ Stripe: Available
     - ✅ EVTS: Available (or ⚠️ Fallback to OpenAI)
   - Last check timestamp
   - Refresh button

3. **Support Ticket Log**
   ```typescript
   // Implement if missing
   GET /api/support/recent?limit=10
   // Or: GET /admin/support/recent (if auth required)
   // Returns: Array of recent SupportTicket records
   ```
   - Display recent support tickets (last 10)
   - Show:
     - Ticket ID
     - Category
     - Status (PENDING, IN_PROGRESS, RESOLVED)
     - Created timestamp
     - Contact info (partial, e.g., "j***@example.com")

4. **Self-Heal Button**
   ```typescript
   POST /admin/self-heal/run
   // Returns: {
   //   dnsCheck: { status, actions },
   //   tunnelCheck: { status, actions },
   //   dbCheck: { status, actions },
   //   transcriptionCheck: { status, actions, engineUsed }
   // }
   ```
   - Prominent "Run Self-Heal" button
   - Show modal with results:
     - Success/failure for each check
     - Actions taken
     - Timestamp
   - Loading state during execution
   - Error handling for failures

5. **Authentication**
   - If auth required, use existing SystemAuthModal flow
   - Must work on production domains (care2connects.org)
   - Store auth token in localStorage/sessionStorage
   - Auto-refresh on 401 errors

6. **System Offline Banner**
   - If database is DOWN:
     - Show prominent "System Offline" banner
     - Disable record flow (/record page shows warning)
     - Display last known good timestamp
   - If other services DOWN:
     - Show warnings but don't block entire system

7. **Window Selection**
   - Dropdown to select time window:
     - Last Hour
     - Last 6 Hours
     - Last 24 Hours (default)
     - Last 7 Days
     - Last 30 Days
   - Update graph on selection

**Graph Configuration:**
- Use Chart.js or Recharts
- Responsive design
- Tooltips on hover showing exact values
- Legend for multiple lines
- Color-coded status (green=HEALTHY, yellow=DEGRADED, red=DOWN)

---

## C) Donation Tracking UI (Per RecordingTicket)

### Display Requirements

**Location:** `/edit/[id]` page (Donations section)

**Also Display On:** `/find` detail view (optional)

**Features:**

1. **Donations List**
   - Table or cards showing all donations
   - Columns:
     - **Timestamp:** Formatted date/time
     - **Amount:** With currency symbol
     - **Currency:** USD, EUR, etc.
     - **Sender:** Last name (if available in metadata)
     - **Status:** Badge (PAID, CREATED, FAILED, REFUNDED)
   - Sort by date (newest first)

2. **Total Amount Display**
   - Prominent display at top of section
   - Example: "Total Donations: $127.50 USD"
   - Count: "3 donations"

3. **Backend Integration**
   ```typescript
   // Implement if missing
   GET /api/tickets/:id/donations
   // Returns: Array of StripeAttribution records
   // Include: amount, currency, status, createdAt, metadataSnapshot
   
   GET /api/tickets/:id/donations/total
   // Returns: {
   //   total: number,
   //   currency: string,
   //   count: number,
   //   lastDonation: string (timestamp)
   // }
   ```

4. **Empty State**
   - If no donations: "No donations yet"
   - Encourage sharing QR code

5. **Refresh Button**
   - Allow manual refresh of donation list
   - Auto-refresh on page load

---

## D) Prisma Integrity: System Must Stop if DB Not Connected

### Backend Requirement (Already Implemented)

✅ Backend already fails-fast without DATABASE_URL

### Frontend Requirements

1. **Health Check on App Load**
   ```typescript
   // Check on app initialization
   GET /health/live
   // If fails or returns dbStatus: "DOWN"
   // Show "System Offline" mode
   ```

2. **System Offline Banner**
   - Persistent banner at top of all pages
   - Red background, prominent text
   - Message: "⚠️ System Offline - Database connection lost. Please try again later."
   - Display last known good timestamp (if available)

3. **Disabled Functionality**
   - Disable `/record` page:
     - Show warning: "Recording is unavailable while system is offline"
     - Hide recording controls
   - Disable all write operations
   - Show read-only mode where applicable

4. **Periodic Health Check**
   - Poll health endpoint every 30 seconds
   - Auto-recover when database comes back online
   - Show recovery message: "✅ System Online - You can now create stories"

5. **Error Pages**
   - Custom 500 page for database errors
   - Link to /health page for status
   - Contact support option

---

## E) EVTS-First Transcription Preference

### Important: Cost Optimization

**Preference:** Use local EVTS (cheaper) first, fallback to OpenAI if EVTS fails

### Backend Implementation

1. **Environment Variable**
   ```bash
   # Add to backend/.env
   TRANSCRIPTION_PREFERENCE=EVTS_FIRST
   # Options: EVTS_FIRST, OPENAI_ONLY, EVTS_WHISPER_FIRST, EVTS_VOSK_FIRST
   ```

2. **Selection Logic in Orchestrator**
   ```typescript
   // backend/src/services/donationPipeline/orchestrator.ts
   // Update performTranscription() function
   
   async function performTranscription(audioFilePath: string) {
     const preference = process.env.TRANSCRIPTION_PREFERENCE || 'OPENAI_ONLY';
     
     let transcript = null;
     let engineUsed = null;
     
     if (preference.startsWith('EVTS')) {
       // Try EVTS first
       try {
         if (preference === 'EVTS_WHISPER_FIRST') {
           transcript = await transcribeWithEVTSWhisper(audioFilePath);
           engineUsed = 'EVTS_WHISPER';
         } else if (preference === 'EVTS_VOSK_FIRST') {
           transcript = await transcribeWithEVTSVosk(audioFilePath);
           engineUsed = 'EVTS_VOSK';
         } else {
           // Try Whisper first, then Vosk
           try {
             transcript = await transcribeWithEVTSWhisper(audioFilePath);
             engineUsed = 'EVTS_WHISPER';
           } catch {
             transcript = await transcribeWithEVTSVosk(audioFilePath);
             engineUsed = 'EVTS_VOSK';
           }
         }
       } catch (evtsError) {
         console.warn('EVTS transcription failed, falling back to OpenAI', evtsError);
         // Fallback to OpenAI
         transcript = await transcribeWithOpenAI(audioFilePath);
         engineUsed = 'OPENAI';
       }
     } else {
       // Use OpenAI directly
       transcript = await transcribeWithOpenAI(audioFilePath);
       engineUsed = 'OPENAI';
     }
     
     return { transcript, engineUsed };
   }
   ```

3. **EVTS Integration Functions**
   ```typescript
   async function transcribeWithEVTSWhisper(audioFilePath: string): Promise<string> {
     const evtsBinaryPath = process.env.EVTS_WHISPER_BINARY_PATH;
     const evtsModelPath = process.env.EVTS_WHISPER_MODEL_PATH;
     
     if (!evtsBinaryPath || !evtsModelPath) {
       throw new Error('EVTS Whisper not configured');
     }
     
     // Execute EVTS Whisper binary
     // Return transcript text
   }
   
   async function transcribeWithEVTSVosk(audioFilePath: string): Promise<string> {
     const evtsBinaryPath = process.env.EVTS_VOSK_BINARY_PATH;
     const evtsModelPath = process.env.EVTS_VOSK_MODEL_PATH;
     
     if (!evtsBinaryPath || !evtsModelPath) {
       throw new Error('EVTS Vosk not configured');
     }
     
     // Execute EVTS Vosk binary
     // Return transcript text
   }
   
   async function transcribeWithOpenAI(audioFilePath: string): Promise<string> {
     // Existing OpenAI implementation
     // Already implemented in orchestrator.ts
   }
   ```

4. **Update Smoke Test**
   ```typescript
   // backend/src/services/speechIntelligence/smokeTest.ts
   // Already implements EVTS-first with OpenAI fallback
   // Ensure production transcription uses same logic
   ```

5. **Environment Variables Needed**
   ```bash
   # EVTS Configuration
   TRANSCRIPTION_PREFERENCE=EVTS_FIRST
   EVTS_WHISPER_BINARY_PATH=/path/to/whisper.cpp/main
   EVTS_WHISPER_MODEL_PATH=/path/to/ggml-base.en.bin
   EVTS_VOSK_BINARY_PATH=/path/to/vosk/binary
   EVTS_VOSK_MODEL_PATH=/path/to/vosk/model
   
   # Fallback
   OPENAI_API_KEY=sk-...
   ```

### EVTS Preference Recommendation

**Question:** EVTS_WHISPER vs EVTS_VOSK default?

**Recommendation: EVTS_WHISPER (Whisper.cpp)**

**Reasons:**
- Better accuracy for English
- More similar to OpenAI Whisper (consistency)
- Good performance on modern CPUs
- Widely tested and maintained

**Configuration:**
```bash
TRANSCRIPTION_PREFERENCE=EVTS_WHISPER_FIRST
```

**Fallback Order:**
1. EVTS Whisper.cpp (local)
2. OpenAI Whisper API (cloud)

**Cost Impact:**
- EVTS: $0 (local compute)
- OpenAI fallback: ~$0.006 per minute
- Estimated savings: 80-90% if EVTS succeeds most of the time

### Frontend Indication

**Show engine used in processing page (optional):**
- "Transcribing with EVTS (local)..."
- Or: "Transcribing with OpenAI (cloud)..."

**No user action required** - automatic selection

---

## Deliverables Checklist

### Pages ✅

- [ ] `/record` - Create story with audio recording
- [ ] `/process/[id]` - Processing animation with polling
- [ ] `/edit/[id]` - Draft editor + document + payment
- [ ] `/find` - Profile search + donation/access
- [ ] `/resume/[id]` - Resume with contact verification
- [ ] `/support` - Support ticket submission
- [ ] `/health` - Functional health dashboard

### API Integration ✅

- [ ] All endpoints integrated to `http://localhost:3003`
- [ ] Error handling for all API calls
- [ ] Loading states for async operations
- [ ] Success/failure messages

### UI/UX ✅

- [ ] Branding updated ("Community Support Portal")
- [ ] Disabled buttons for unimplemented features
- [ ] Consistent header/footer on all pages
- [ ] Mobile-friendly responsive design
- [ ] Clean minimal styling
- [ ] Button states (hover, active, disabled)

### Backend Endpoints (Implement if Missing) ✅

- [ ] `GET /api/profiles/search?contact=xxx`
- [ ] `POST /api/support/tickets`
- [ ] `GET /api/support/recent?limit=10`
- [ ] `GET /api/tickets/:id/donations`
- [ ] `GET /api/tickets/:id/donations/total`
- [ ] `GET /api/tickets/:id/documents/:docId/download`

### EVTS Integration ✅

- [ ] Environment variable `TRANSCRIPTION_PREFERENCE`
- [ ] EVTS Whisper integration in orchestrator
- [ ] EVTS Vosk integration (optional)
- [ ] Fallback to OpenAI on EVTS failure
- [ ] Update smoke test to use same logic
- [ ] Verify cost savings (prefer EVTS)

### Documentation ✅

- [ ] Create `docs/FRONTEND_PHASE6_TESTS.md`
- [ ] Document API endpoints used
- [ ] Document environment variables
- [ ] Document EVTS configuration
- [ ] Create end-to-end test checklist

---

## Testing Checklist

### Create: `docs/FRONTEND_PHASE6_TESTS.md`

**Contents:**

```markdown
# Phase 6 Frontend End-to-End Tests

## Test 1: Complete Recording Flow

1. Navigate to `/record`
2. Select contact type: EMAIL
3. Enter email: test@example.com
4. Enter display name: "Test User"
5. Click "Record Audio"
6. Record 10 seconds of audio
7. Click "Stop Recording"
8. Review audio playback
9. Click "Upload"
10. Verify navigation to `/process/[id]`

## Test 2: Processing Flow

1. On `/process/[id]` page
2. Verify processing starts automatically
3. Observe polling status updates
4. Wait for status to become READY
5. Verify navigation to `/edit/[id]`

## Test 3: Draft Editor

1. On `/edit/[id]` page
2. Verify auto-generated draft fields populated
3. Edit title, story, goal amount
4. Click "Save Draft"
5. Verify "Saved" indicator
6. Click "Generate Document"
7. Verify document appears in list
8. Click download button
9. Verify Word doc downloads

## Test 4: Payment Creation

1. On `/edit/[id]` page
2. Scroll to Payment section
3. Enter amount: 100
4. Click "Create Payment QR"
5. Verify QR code displays
6. Verify Stripe Checkout button appears
7. Click Stripe button (test in Stripe test mode)
8. Complete test payment
9. Verify webhook updates status to PAYMENT_RECEIVED

## Test 5: Profile Search

1. Navigate to `/find`
2. Enter email: test@example.com
3. Click "Search"
4. Verify story card appears
5. Click "Donate"
6. Verify QR code displays
7. Click "Access as Recipient"
8. Verify navigation to `/resume/[id]`

## Test 6: Resume Access

1. On `/resume/[id]` page
2. Enter correct email
3. Verify navigation to `/edit/[id]`
4. Try again with wrong email
5. Verify error message
6. Click "Request Profile Reset"
7. Verify navigation to `/support`

## Test 7: Support Ticket

1. Navigate to `/support`
2. Fill out support form
3. Select category: "Profile Reset Request"
4. Enter message
5. Click "Submit"
6. Verify confirmation message
7. Verify support ticket ID displayed

## Test 8: Health Dashboard

1. Navigate to `/health`
2. Verify graph displays with data
3. Verify all service indicators show status
4. Click "Run Self-Heal"
5. Verify modal displays results
6. Close modal
7. Verify support ticket log displays

## Test 9: System Offline

1. Stop database (simulate failure)
2. Refresh any page
3. Verify "System Offline" banner displays
4. Navigate to `/record`
5. Verify recording disabled
6. Restart database
7. Wait for auto-recovery
8. Verify banner disappears

## Test 10: Mobile Responsiveness

1. Open on mobile device or responsive mode
2. Test all pages on small screen
3. Verify buttons are tappable
4. Verify forms are usable
5. Verify graphs are readable
6. Verify navigation works
```

---

## Acceptance Test Script (Browser + API)

### Full Story → Draft → Doc → QR → Stripe Webhook → PAYMENT_RECEIVED Loop

**Prerequisites:**
- Backend running on port 3003
- Frontend running (Next.js dev or production)
- Stripe in test mode with webhook configured
- Database connected and healthy

**Test Steps:**

1. **Create Story**
   - Browser: Navigate to `/record`
   - Fill form: email: test@example.com, name: "Test"
   - Record 10 seconds of audio ("Hello, this is a test story...")
   - Upload audio
   - Capture ticket ID from URL

2. **Processing**
   - Browser: Auto-navigate to `/process/[id]`
   - Wait for READY status
   - API: Verify transcript created
     ```powershell
     GET /api/tickets/:id?include=transcriptions
     ```

3. **Edit Draft**
   - Browser: Auto-navigate to `/edit/[id]`
   - Verify draft fields populated
   - Edit title: "Help Fund My Medical Bills"
   - Edit goal: 5000
   - Edit story: Add more details
   - Click "Save Draft"
   - API: Verify draft updated
     ```powershell
     GET /api/tickets/:id?include=draft
     ```

4. **Generate Document**
   - Browser: Click "Generate GoFundMe Draft"
   - Wait for document generation
   - Click download button
   - Verify Word doc opens correctly

5. **Create Payment**
   - Browser: Scroll to Payment section
   - Enter amount: 25
   - Click "Create Payment QR"
   - Verify QR code displays
   - Copy Stripe Checkout URL

6. **Complete Payment**
   - Browser: Open Stripe Checkout URL in new tab
   - Fill test card: 4242 4242 4242 4242
   - Expiry: 12/34, CVC: 123
   - Click "Pay"
   - Verify success page

7. **Webhook Verification**
   - Wait 5 seconds for webhook
   - Browser: Refresh `/edit/[id]`
   - Verify "Payment Received" banner displays
   - Verify ticket status badge shows PAYMENT_RECEIVED
   - API: Verify attribution created
     ```powershell
     GET /api/tickets/:id?include=attributions
     # Verify StripeAttribution exists with status=PAID
     ```

8. **Donation Tracking**
   - Browser: Scroll to Donations section
   - Verify donation appears in list
   - Verify total shows $25.00

9. **Search and Donate Again**
   - Browser: Navigate to `/find`
   - Enter email: test@example.com
   - Click "Search"
   - Verify story card appears
   - Click "Donate"
   - Verify QR code appears
   - Click Stripe button
   - Complete another test payment (different amount: $50)
   - Wait for webhook
   - Refresh page
   - Verify total now shows $75.00

**Success Criteria:**
- ✅ All steps complete without errors
- ✅ Transcript generated from audio
- ✅ Draft created and editable
- ✅ Document generated and downloadable
- ✅ Payment QR code created
- ✅ Stripe Checkout works
- ✅ Webhook updates ticket status
- ✅ Attribution recorded in database
- ✅ Donations tracked correctly
- ✅ Total amount calculated correctly

---

## EVTS Configuration Confirmation

### Preference Locked In ✅

**Selected Strategy:** EVTS-first (cheaper/local) with automatic fallback to OpenAI

**Primary Engine:** EVTS Whisper (Whisper.cpp)

**Fallback Order:**
1. EVTS Whisper.cpp (local, $0)
2. OpenAI Whisper API (cloud, $0.006/min)

**Environment Configuration:**
```bash
# backend/.env
TRANSCRIPTION_PREFERENCE=EVTS_WHISPER_FIRST
EVTS_WHISPER_BINARY_PATH=/path/to/whisper.cpp/main
EVTS_WHISPER_MODEL_PATH=/path/to/ggml-base.en.bin
OPENAI_API_KEY=sk-...
```

**Cost Impact:**
- Estimated EVTS success rate: 80-90%
- Monthly savings: ~$0.50-$1.00 per environment
- No impact on user experience (automatic fallback)

**Implementation Status:**
- ✅ Smoke test already uses EVTS-first
- ⏳ Production orchestrator needs update
- ⏳ Environment variables need configuration
- ⏳ EVTS binaries need installation

---

## Quick Start Commands

### Development

```powershell
# Backend (already running)
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# Visit: http://localhost:3000
```

### Testing

```powershell
# Health check
curl http://localhost:3003/health/live

# Create test ticket
$ticket = Invoke-RestMethod -Uri 'http://localhost:3003/api/tickets/create' -Method POST -Body (@{
  contactType = "EMAIL"
  contactValue = "test@example.com"
  displayName = "Test User"
} | ConvertTo-Json) -ContentType 'application/json'

# View in browser
Start-Process "http://localhost:3000/edit/$($ticket.id)"
```

---

## Summary

This document provides a complete specification for implementing the Care2Connect V1 frontend to match the Phase 6 backend donation pipeline. All pages, API integrations, and features are documented with specific requirements, API endpoints, and testing procedures.

**Next Action:** Begin frontend implementation following this specification, starting with the `/record` page.

**Reference Documents:**
- [PHASE_6_BACKEND_COMPLETION_STATUS.md](PHASE_6_BACKEND_COMPLETION_STATUS.md) - Backend API reference
- [GITHUB_AGENT_COMPLETION_REPORT.md](GITHUB_AGENT_COMPLETION_REPORT.md) - Overall project status

**Status:** 📋 Ready for GitHub Agent or developer implementation

---

**Document Version:** 1.0  
**Last Updated:** December 16, 2025  
**Author:** GitHub Copilot Agent
