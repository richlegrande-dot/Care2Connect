# Knowledge-Assisted Compute Frontend - Quick Reference

## 🚀 Quick Start

### Accessing the Incidents Dashboard

1. **Navigate**: Go to `http://localhost:3002/admin/knowledge`
2. **Click**: "🔍 Incidents" button in the header
3. **Alternative**: Direct URL `http://localhost:3002/admin/knowledge/incidents`

**Authentication**: Uses same admin password as Health page and Knowledge Vault

---

## 📊 Incidents List Page

**Route**: `/admin/knowledge/incidents`

### Statistics Dashboard

Top section shows 4 key metrics:
- **Total Incidents**: All-time count
- **Open**: Currently unresolved incidents
- **Resolved**: Manually resolved
- **Auto-Resolved**: Automatically fixed by self-heal

### Filters

- **Status**: OPEN | RESOLVED | AUTO_RESOLVED
- **Stage**: TRANSCRIPTION | ANALYSIS | DRAFT | STRIPE | WEBHOOK | DB
- **Severity**: INFO | WARN | ERROR | CRITICAL
- **Ticket ID**: Filter to specific ticket

### Incidents Table

Columns:
- **Timestamp**: When incident occurred
- **Stage**: Pipeline stage where failure happened
- **Severity**: Color-coded badges (🔴 Critical/Error, 🟡 Warning, 🔵 Info)
- **Ticket**: Related donation ticket (or "System-wide")
- **Status**: Current resolution status
- **Knowledge**: Number of matched knowledge chunks

**Click any row** to view detailed incident page.

### Pagination

- 50 incidents per page
- Previous/Next buttons at bottom
- Total count displayed

---

## 🔍 Incident Detail Page

**Route**: `/admin/knowledge/incidents/[incidentId]`

### Header Section

Shows:
- **Severity Badge**: Color-coded (Critical=Purple, Error=Red, Warn=Yellow, Info=Blue)
- **Status Badge**: Current state (Open=Orange, Resolved=Green, Auto-Resolved=Teal)
- **Stage Badge**: Pipeline stage
- **Error Message**: Full error description
- **Error Code**: System error code (if available)
- **Timestamps**: Created, Updated, Resolved (if applicable)
- **Related Ticket**: Link to ticket detail page

### Action Buttons

**For OPEN Incidents:**

#### 🔍 Investigate
- Re-runs diagnostics:
  - Checks audio file exists
  - Verifies session data
  - Validates draft quality
  - Tests QR link validity
  - Checks database connection
- Searches Knowledge Vault for new symptom matches
- Updates `contextJson` with investigation results
- Shows result banner with findings

#### 🔧 Self-Heal
- Attempts automated recovery based on stage:
  - **TRANSCRIPTION**: Switches engine (EVTS→OpenAI), marks for retry
  - **DRAFT**: Regenerates draft from transcript
  - **STRIPE**: Invalidates old QR code, generates new one
- **Warning prompt** shown before execution
- Shows success/failure banner with action details
- Only whitelisted actions are executed (security constraint)

#### ✓ Mark Resolved
- Changes status to RESOLVED
- Sets `resolvedAt` timestamp
- Disables Investigate/Self-Heal actions

#### 📝 Add Notes
- Opens textarea for admin notes
- Notes appended to `contextJson.adminNotes[]` array
- Timestamped and stored permanently

**For RESOLVED Incidents:**
- **Reopen** button to change status back to OPEN

### 📚 Knowledge Vault Matches Section

Shows all matched knowledge chunks:

**Each match displays:**
- **Source Title**: Knowledge source name
- **Relevance Score**: Percentage match (if calculated)
- **Reason**: Why this knowledge was matched (e.g., "Symptom match: empty_transcript")
- **Content**: Full chunk text (usually 200-500 words)
- **Tags**: Category labels (TROUBLESHOOTING, DONATION_DRAFT, TRANSCRIPTION, etc.)
- **Suggested Actions**: Extracted from metadata.actions
  - Action type + description + payload
- **View Source Link**: Navigate to full knowledge source editor

**Example:**
```
Source: "EVTS Transcription Troubleshooting"
Score: 87%
Reason: "Symptom match: empty_transcript, audio_file_missing"

[Text explaining common EVTS failure scenarios...]

Tags: [TROUBLESHOOTING] [TRANSCRIPTION] [EVTS]

Suggested Actions:
- SWITCH_ENGINE: Switch from EVTS to OpenAI transcription
- REGENERATE_TRANSCRIPT: Re-attempt transcription with new settings

[View Source →]
```

### 💡 Recommendations Section

Shows raw JSON of recommended actions:
- Extracted from Knowledge Vault `metadata.actions`
- Includes action type, description, payload
- Collapsible section

### 🔍 Context & Diagnostics Section

Full incident context JSON:
- Original error details
- Pipeline stage context (audio file path, engine used, etc.)
- Investigation results (if investigated)
- Admin notes (if added)
- Collapsible section
- Scrollable (max height 400px)

---

## 🎨 Color Coding Reference

### Severity Colors

| Severity | Background | Text | Use Case |
|----------|-----------|------|----------|
| INFO | Blue-100 | Blue-800 | Informational events |
| WARN | Yellow-100 | Yellow-800 | Quality issues, non-critical |
| ERROR | Red-100 | Red-800 | Pipeline failures |
| CRITICAL | Purple-100 | Purple-800 | System-wide emergencies |

### Status Colors

| Status | Background | Text | Meaning |
|--------|-----------|------|---------|
| OPEN | Orange-100 | Orange-800 | Needs attention |
| RESOLVED | Green-100 | Green-800 | Manually fixed |
| AUTO_RESOLVED | Teal-100 | Teal-800 | Self-heal succeeded |

---

## 📡 API Integration

### Backend Endpoints Used

All routes require `x-admin-password` header with admin token.

#### List Incidents
```
GET http://localhost:3005/admin/incidents
Query params: page, limit, status, stage, severity, ticketId
```

#### Get Statistics
```
GET http://localhost:3005/admin/incidents/stats
Query params: ticketId (optional)
```

#### Get Incident Detail
```
GET http://localhost:3005/admin/incidents/:id
Includes: full ticket, all knowledgeBindings with chunk content
```

#### Investigate Incident
```
POST http://localhost:3005/admin/incidents/:id/investigate
Response: Updated incident with new diagnostics in contextJson
```

#### Self-Heal Incident
```
POST http://localhost:3005/admin/incidents/:id/self-heal
Response: { success, message, details[] }
```

#### Update Incident
```
PATCH http://localhost:3005/admin/incidents/:id
Body: { status?, notes? }
```

### Token Storage

Admin token stored in `localStorage.getItem('adminToken')` after authentication via AdminPasswordGate.

---

## 🔄 Workflow Examples

### Example 1: Investigating a Transcription Failure

1. Navigate to Incidents page
2. Filter by **Stage: TRANSCRIPTION**, **Status: OPEN**
3. Click on incident with "empty_transcript" error
4. Review Knowledge Vault matches (likely shows "EVTS Troubleshooting" article)
5. Click **🔍 Investigate**
   - System checks audio file existence
   - Searches for symptom matches
   - Updates diagnostics
6. Review investigation results in blue banner
7. If audio file missing:
   - Click **📝 Add Notes**: "Audio file missing from uploads folder"
   - Click **✓ Mark Resolved**
8. If audio file exists:
   - Click **🔧 Self-Heal**
   - Confirm warning prompt
   - System switches engine to OpenAI
   - Marks ticket for retry
   - View success banner

### Example 2: Monitoring Draft Quality Issues

1. Navigate to Incidents page
2. Filter by **Stage: DRAFT**, **Severity: WARN**
3. Review incidents where `story.length < 100` (quality threshold)
4. Click incident to see which Knowledge Vault template was used
5. Review **Knowledge Matches** to see "Donation Draft Template"
6. Check **Context & Diagnostics** → `qualityIssues[]` array
7. If template is incorrect:
   - Navigate to Knowledge Vault
   - Edit template metadata
   - Click **🔧 Self-Heal** on incident to regenerate
8. If story is genuinely short:
   - Click **📝 Add Notes**: "User submitted brief personal story"
   - Click **✓ Mark Resolved**

### Example 3: Tracking System-Wide Issues

1. Navigate to Incidents page
2. Filter by **Ticket ID**: Leave empty (system-wide)
3. Look for **Stage: DB** or **Stage: WEBHOOK** incidents
4. Click incident to see error details
5. Review error code (e.g., "ECONNREFUSED", "WEBHOOK_TIMEOUT")
6. Check **Context & Diagnostics** for connection details
7. If database is down:
   - Fix database service
   - Click **Reopen** if previously resolved
   - Click **🔍 Investigate** to verify connection
8. Click **✓ Mark Resolved** once database is back

---

## 🚨 Troubleshooting

### Incidents page shows "No admin token found"

**Fix**: Authenticate first via Health page or Knowledge Vault page.

```
1. Go to http://localhost:3002/admin/knowledge
2. Enter admin password (from .env ADMIN_PASSWORD)
3. Return to incidents page
```

### API returns 401 Unauthorized

**Fix**: Token expired or invalid.

```
1. Clear localStorage: localStorage.removeItem('adminToken')
2. Refresh page
3. Re-authenticate with password
```

### Investigate button shows no changes

**Possible causes**:
- All diagnostics passed (no issues found)
- No new knowledge matches available
- Check **Context & Diagnostics** → `investigation` object for details

### Self-Heal button does nothing

**Possible causes**:
- No whitelisted actions available for this stage
- Check **Recommendations** section for suggested actions
- If recommendations exist but self-heal fails, action may require manual intervention

### Knowledge matches not appearing

**Possible causes**:
- No knowledge tagged for this stage (e.g., missing `appliesToStages: ["TRANSCRIPTION"]`)
- No symptom matches (error doesn't match `metadata.symptoms[]`)
- Knowledge chunk text doesn't contain relevant keywords

**Fix**: Add troubleshooting knowledge to vault:
1. Go to Knowledge Vault admin
2. Create new source (DOCUMENTATION type)
3. Add chunk with:
   - Tags: `TROUBLESHOOTING`, stage name
   - Metadata: `{"appliesToStages": ["DRAFT"], "symptoms": ["short_story"]}`
   - Content: Troubleshooting steps

---

## 📱 Mobile Responsiveness

- Grid layouts collapse to single column on mobile
- Tables scroll horizontally if needed
- Filters stack vertically on narrow screens
- Action buttons wrap to multiple rows

---

## 🔗 Navigation Links

From Incidents page:
- **Back to Knowledge Vault**: Click "🔍 Incidents" button again (or use browser back)
- **View Ticket**: Click ticket ID in detail page
- **View Knowledge Source**: Click "View Source →" under knowledge matches
- **Audit Logs**: Return to Knowledge Vault, click "View Audit Logs"

From other pages:
- **Knowledge Vault → Incidents**: Click "🔍 Incidents" button in header
- **Direct URL**: `http://localhost:3002/admin/knowledge/incidents`

---

## 🎯 Next Steps

### Remaining Frontend Tasks

1. ✅ **Incidents list page** - COMPLETE
2. ✅ **Incident detail page** - COMPLETE
3. ✅ **Investigate/self-heal actions** - COMPLETE (built into detail page)
4. ⏳ **Enhance ticket processing UI** - Show incident preview in ticket details
5. ⏳ **Knowledge Vault runtime toggles** - Add "Active for Runtime" flags and usage stats

### Backend Complete

All backend functionality is ready:
- ✅ Database models (PipelineIncident, KnowledgeBinding)
- ✅ KnowledgeQueryService (search, recommendations, templates)
- ✅ PipelineTroubleshooter (failure handling, investigate, self-heal)
- ✅ Admin Incidents API (5 endpoints)
- ✅ Pipeline integration (draft + transcription)

---

## 📖 Related Documentation

- **Full Implementation Guide**: `KNOWLEDGE_ASSISTED_COMPUTE_IMPLEMENTATION.md`
- **API Documentation**: See "API Routes" section in implementation guide
- **Knowledge Vault Metadata**: See "Metadata Conventions" section
- **Self-Heal Actions**: See "Whitelisted Actions" matrix

---

## 💡 Tips

1. **Filter aggressively**: Use status + severity filters to focus on critical issues
2. **Check Knowledge matches first**: Often provides immediate solution
3. **Investigate before Self-Heal**: Diagnostics may reveal manual fix is needed
4. **Add notes liberally**: Future you will thank you
5. **Use ticket ID filter**: Great for tracking per-user issues
6. **Watch the statistics**: Spikes in ERROR severity = system issue

---

**Frontend Pages Created:**
- ✅ `/frontend/app/admin/knowledge/incidents/page.tsx` (List view)
- ✅ `/frontend/app/admin/knowledge/incidents/[incidentId]/page.tsx` (Detail view)

**Next**: Test the pages by starting the frontend server and navigating to the incidents dashboard!
