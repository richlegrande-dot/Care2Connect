# Pipeline Test Matrix

Comprehensive mapping of test scenarios to expected outcomes for the Care2Connect speech-to-revenue pipeline.

---

## Test Scenario → Expected Outcome Matrix

### **Complete Data Pipeline**

| Transcript | Signal Quality | Extracted Fields | Draft Quality | DOCX Valid | QR Valid | Notes |
|------------|---------------|------------------|---------------|------------|----------|-------|
| COMPLETE_TRANSCRIPT (Sarah Johnson) | HIGH | ✅ name<br>✅ age (28)<br>✅ email<br>✅ phone<br>✅ location<br>✅ goal ($3500)<br>✅ urgency (high) | COMPLETE<br>- Title: "Help Sarah Johnson Rebuild After Fire"<br>- Story: Full story with all details<br>- Goal: $3,500<br>- Tags: emergency_housing | ✅ Valid DOCX<br>✅ All fields present<br>✅ QR embedded<br>✅ Instructions included | ✅ Valid PNG<br>✅ Stripe session created<br>✅ Metadata includes ticketId | Happy path |

### **Partial Data Pipeline**

| Transcript | Signal Quality | Extracted Fields | Draft Quality | DOCX Valid | QR Valid | Notes |
|------------|---------------|------------------|---------------|------------|----------|-------|
| PARTIAL_TRANSCRIPT (Mike) | MEDIUM | ✅ name (Mike)<br>❌ age (null)<br>❌ email (null)<br>✅ phone (555-0123)<br>✅ location (Denver)<br>✅ goal ($1000)<br>❌ urgency (null) | PARTIAL<br>- Title: "Help Mike"<br>- Story: Basic story<br>- Goal: $1,000<br>- Missing fields: email, age | ✅ Valid DOCX<br>⚠️ Some fields null<br>✅ QR embedded<br>✅ Instructions included | ✅ Valid PNG<br>✅ Stripe session created | Follow-up questions generated |

### **Dry Recording Pipeline**

| Transcript | Signal Quality | Extracted Fields | Draft Quality | DOCX Valid | QR Valid | Notes |
|------------|---------------|------------------|---------------|------------|----------|-------|
| DRY_RECORDING ("...") | LOW | ❌ name (null)<br>❌ age (null)<br>❌ email (null)<br>❌ phone (null)<br>❌ location (null)<br>❌ goal (null)<br>❌ urgency (null) | ❌ NO DRAFT<br>(allowPartial=false) | ❌ N/A | ❌ N/A | Should generate comprehensive follow-up questions |

### **Emergency Housing Pipeline**

| Transcript | Signal Quality | Extracted Fields | Draft Quality | DOCX Valid | QR Valid | Notes |
|------------|---------------|------------------|---------------|------------|----------|-------|
| EMERGENCY_HOUSING_TRANSCRIPT (Jennifer Martinez) | HIGH | ✅ name<br>✅ age (34)<br>✅ email<br>✅ phone<br>✅ location (Chicago)<br>✅ goal ($4500)<br>✅ urgency (high) | COMPLETE<br>- Title includes "emergency"<br>- Story emphasizes urgency<br>- Goal: $4,500<br>- Tags: emergency_housing<br>- Urgency: HIGH | ✅ Valid DOCX<br>✅ All fields present<br>✅ QR embedded<br>✅ Urgency emphasized | ✅ Valid PNG<br>✅ Stripe session created | "Evicted", "lost apartment" → HIGH urgency |

### **Rental Assistance Pipeline**

| Transcript | Signal Quality | Extracted Fields | Draft Quality | DOCX Valid | QR Valid | Notes |
|------------|---------------|------------------|---------------|------------|----------|-------|
| RENTAL_ASSISTANCE_TRANSCRIPT (David Chen) | HIGH | ✅ name<br>✅ age (41)<br>✅ email<br>✅ phone<br>✅ location (Seattle)<br>✅ goal ($2200)<br>✅ urgency (medium) | COMPLETE<br>- Title: "Help David Chen with Rent"<br>- Story: Rental assistance context<br>- Goal: $2,200<br>- Tags: rental_assistance<br>- Urgency: MEDIUM | ✅ Valid DOCX<br>✅ All fields present<br>✅ QR embedded<br>✅ Instructions included | ✅ Valid PNG<br>✅ Stripe session created | "Behind on rent" → MEDIUM urgency |

### **Missing Name Pipeline**

| Transcript | Signal Quality | Extracted Fields | Draft Quality | DOCX Valid | QR Valid | Notes |
|------------|---------------|------------------|---------------|------------|----------|-------|
| NO_NAME_TRANSCRIPT | LOW | ❌ name (null)<br>✅ age (30)<br>✅ email<br>✅ phone<br>✅ location<br>✅ goal ($1500)<br>✅ urgency (low) | PARTIAL<br>- Title: "Help Campaign" (generic)<br>- Story: No personalization<br>- Goal: $1,500<br>- Missing: name | ⚠️ Valid DOCX<br>❌ No name field<br>✅ QR embedded | ✅ Valid PNG<br>✅ Stripe session created | Follow-up questions generated for name |

---

## Edge Case Matrix

### **Special Characters & Unicode**

| Input | Signal Extraction | Draft Generation | DOCX Generation | QR Generation | Expected Outcome |
|-------|------------------|------------------|-----------------|---------------|------------------|
| Unicode name: "María José González" | ✅ Extracted correctly | ✅ Preserved in draft | ✅ Rendered correctly | ✅ QR works | Full Unicode support |
| Emoji in transcript: "I need help 🏠" | ✅ Extracted | ✅ Preserved or stripped | ✅ Handled gracefully | ✅ QR works | Emoji support |
| HTML entities: "Bob & Carol" | ✅ Extracted | ✅ "&amp;" or "&" | ✅ Rendered correctly | ✅ QR works | Entity handling |
| Very long name (50+ chars) | ✅ Extracted | ✅ Included in full | ✅ Rendered (may wrap) | ✅ QR works | No truncation |

### **Boundary Values**

| Input | Signal Extraction | Draft Generation | DOCX Generation | QR Generation | Expected Outcome |
|-------|------------------|------------------|-----------------|---------------|------------------|
| Goal: $0 | ✅ Extracted as 0 | ⚠️ Default to $500 | ✅ Valid DOCX | ❌ Stripe rejects | Validation error |
| Goal: $999,999 | ✅ Extracted | ✅ Included | ✅ Valid DOCX | ✅ Valid QR | Maximum supported |
| Age: 0 | ✅ Extracted as 0 | ⚠️ Flag as suspicious | ✅ Valid DOCX | ✅ Valid QR | Validation warning |
| Age: 150 | ✅ Extracted | ⚠️ Flag as suspicious | ✅ Valid DOCX | ✅ Valid QR | Validation warning |
| Transcript: 24KB+ | ✅ Extracted (may truncate) | ✅ Generated | ✅ Valid DOCX (large) | ✅ Valid QR | Performance test |
| Transcript: 2 words | ✅ Extracted (minimal) | ❌ Likely null draft | ❌ N/A | ❌ N/A | Follow-up questions |

### **Provider Failures**

| Input | Signal Extraction | Draft Generation | DOCX Generation | QR Generation | Expected Outcome |
|-------|------------------|------------------|-----------------|---------------|------------------|
| `null` transcript | ❌ Returns null | ❌ No draft | ❌ N/A | ❌ N/A | Graceful error |
| `undefined` transcript | ❌ Returns null | ❌ No draft | ❌ N/A | ❌ N/A | Graceful error |
| Non-string input | ❌ Returns null | ❌ No draft | ❌ N/A | ❌ N/A | Type error caught |
| Empty string `""` | ✅ Returns empty signals | ❌ No draft | ❌ N/A | ❌ N/A | Follow-up questions |
| AssemblyAI error | ❌ N/A (upstream) | ❌ N/A | ❌ N/A | ❌ N/A | Error propagated |

---

## Performance Matrix

### **Pipeline Segment Performance**

| Operation | Input Size | Expected Time | Test Enforcement | Notes |
|-----------|-----------|---------------|------------------|-------|
| Signal extraction | 100 words | < 50ms | ✅ Yes | Rules-based, deterministic |
| Signal extraction | 1000 words | < 100ms | ✅ Yes | Linear complexity |
| Draft generation (rules) | Complete signals | < 500ms | ✅ Yes | No AI calls |
| Draft generation (AI) | Complete signals | < 5s | ❌ No (not used in V1) | OpenAI disabled |
| DOCX generation | 1 page | < 1s | ✅ Yes | Includes ZIP compression |
| DOCX generation | 5 pages | < 2s | ✅ Yes | Multiple sections |
| QR generation | Standard URL | < 500ms | ✅ Yes | PNG encoding |
| Stripe session (mocked) | Standard request | < 100ms | ✅ Yes | Mocked in tests |
| Stripe session (real) | Standard request | < 3s | ❌ No (integration test) | Network latency |
| **Full pipeline (mocked)** | Complete transcript | **< 5s** | **✅ Yes** | **End-to-end** |

### **Batch Processing Performance**

| Batch Size | Expected Time | Memory Usage | Test Enforcement | Notes |
|-----------|---------------|--------------|------------------|-------|
| 5 drafts | < 3s | < 50MB | ✅ Yes | No degradation |
| 10 drafts | < 6s | < 100MB | ⚠️ Warning only | May vary |
| 5 DOCX files | < 10s | < 100MB | ✅ Yes | Includes compression |
| 10 QR codes | < 5s | < 50MB | ✅ Yes | PNG generation |

---

## Fixture → Expected Output Reference

### **COMPLETE_TRANSCRIPT (Sarah Johnson)**

**Input Signals:**
- Name: "Sarah Johnson"
- Age: 28
- Email: sarah.johnson@email.com
- Phone: (555) 123-4567
- Location: Springfield, IL
- Goal Amount: $3,500
- Urgency: HIGH (fire, lost everything)

**Expected Draft:**
```
Title: Help Sarah Johnson Rebuild After Fire
Story: [Full story with all details from transcript]
Goal: $3,500
Tags: emergency_housing
Urgency: HIGH
```

**Expected DOCX:**
- ✅ Valid ZIP structure
- ✅ Title included
- ✅ Story included (full text)
- ✅ Goal: $3,500
- ✅ Contact info: email + phone
- ✅ Location: Springfield, IL
- ✅ QR code embedded
- ✅ Instructions included

**Expected QR:**
- ✅ Valid PNG data URL
- ✅ Stripe session: deterministic ID in test mode
- ✅ Metadata: ticketId, recordingId
- ✅ Amount: $3,500

---

### **PARTIAL_TRANSCRIPT (Mike)**

**Input Signals:**
- Name: "Mike"
- Age: null
- Email: null
- Phone: (555) 555-0123
- Location: Denver
- Goal Amount: $1,000
- Urgency: null

**Expected Draft:**
```
Title: Help Mike
Story: [Basic story with limited details]
Goal: $1,000
Tags: housing_assistance
Urgency: MEDIUM (default)
Missing Fields: email, age
```

**Expected DOCX:**
- ✅ Valid ZIP structure
- ✅ Title: "Help Mike"
- ✅ Story: abbreviated
- ✅ Goal: $1,000
- ⚠️ Contact info: phone only (no email)
- ✅ Location: Denver
- ✅ QR code embedded
- ✅ Instructions included

**Expected Follow-Up Questions:**
- "What is your email address?"
- "How old are you?"

---

### **DRY_RECORDING ("...")**

**Input Signals:**
- All fields: null

**Expected Draft:**
- ❌ No draft generated (allowPartial=false)
- ✅ Follow-up questions generated

**Expected Follow-Up Questions:**
- "What is your full name?"
- "How old are you?"
- "What is your email address?"
- "What is your phone number?"
- "Where are you located?"
- "How much money do you need?"
- "What do you need the money for?"

**Expected DOCX:**
- ❌ N/A (no draft to export)

**Expected QR:**
- ❌ N/A (no goal amount)

---

### **EMERGENCY_HOUSING_TRANSCRIPT (Jennifer Martinez)**

**Input Signals:**
- Name: "Jennifer Martinez"
- Age: 34
- Email: jmartinez@email.com
- Phone: (555) 987-6543
- Location: Chicago, IL
- Goal Amount: $4,500
- Urgency: HIGH (evicted, lost apartment)

**Expected Draft:**
```
Title: Help Jennifer Martinez - Emergency Housing
Story: [Emphasizes urgency and emergency keywords]
Goal: $4,500
Tags: emergency_housing, eviction
Urgency: HIGH
```

**Expected DOCX:**
- ✅ Valid ZIP structure
- ✅ Title emphasizes "Emergency"
- ✅ Story highlights eviction context
- ✅ Goal: $4,500
- ✅ Full contact info
- ✅ QR code embedded
- ✅ Urgency markers visible

---

### **RENTAL_ASSISTANCE_TRANSCRIPT (David Chen)**

**Input Signals:**
- Name: "David Chen"
- Age: 41
- Email: dchen@email.com
- Phone: (555) 246-8135
- Location: Seattle, WA
- Goal Amount: $2,200
- Urgency: MEDIUM (behind on rent, not evicted yet)

**Expected Draft:**
```
Title: Help David Chen with Rent
Story: [Rental assistance context]
Goal: $2,200
Tags: rental_assistance
Urgency: MEDIUM
```

**Expected DOCX:**
- ✅ Valid ZIP structure
- ✅ Title: rental assistance focus
- ✅ Story: explains rent situation
- ✅ Goal: $2,200
- ✅ Full contact info
- ✅ QR code embedded

---

## Test Coverage by Pipeline Stage

### **Stage 1: Signal Extraction**

| Test Category | Coverage | Critical Paths |
|---------------|----------|----------------|
| Complete data | ✅ 100% | All fields extracted |
| Partial data | ✅ 100% | Some fields null |
| Missing name | ✅ 100% | No name field |
| Dry recording | ✅ 100% | All fields null |
| Special characters | ✅ 100% | Unicode, emoji, entities |
| Boundary values | ✅ 100% | Very long text, edge values |
| Provider failures | ✅ 100% | Null, undefined, non-string |

### **Stage 2: Draft Generation**

| Test Category | Coverage | Critical Paths |
|---------------|----------|----------------|
| Complete draft | ✅ 100% | All fields present |
| Partial draft | ✅ 100% | Missing fields handled |
| No draft | ✅ 100% | Too little data |
| Title generation | ✅ 100% | Various name formats |
| Story generation | ✅ 100% | Rules-based templating |
| Goal formatting | ✅ 100% | Currency, amounts |
| Tags | ✅ 90% | Category classification |
| Urgency detection | ✅ 100% | Keyword-based urgency |

### **Stage 3: DOCX Export**

| Test Category | Coverage | Critical Paths |
|---------------|----------|----------------|
| Document structure | ✅ 100% | Valid ZIP/XML |
| Content inclusion | ✅ 100% | All fields rendered |
| QR embedding | ✅ 100% | Media files in package |
| Special characters | ✅ 100% | Unicode, entities |
| Instructions | ✅ 100% | Optional inclusion |
| Performance | ✅ 100% | < 2s generation |

### **Stage 4: QR + Stripe**

| Test Category | Coverage | Critical Paths |
|---------------|----------|----------------|
| QR generation | ✅ 100% | Valid PNG output |
| Stripe session | ✅ 100% | Mocked API calls |
| Database persistence | ✅ 100% | QRCodeLink records |
| Metadata attribution | ✅ 100% | ticketId, recordingId |
| Error handling | ✅ 100% | API failures, validation |

---

## Validation Checklist

Use this checklist when adding new test scenarios:

- [ ] **Fixture Created** - Transcript fixture added to `fixtures.ts`
- [ ] **Expected Output Defined** - Expected signals/draft added to `drafts.ts`
- [ ] **Signal Extraction Test** - Validates extracted fields
- [ ] **Draft Generation Test** - Validates draft content
- [ ] **DOCX Export Test** - Validates document structure
- [ ] **QR Generation Test** - Validates QR + Stripe
- [ ] **Edge Case Coverage** - Special characters, boundaries
- [ ] **Performance Test** - Enforces time budget
- [ ] **Error Handling Test** - Null, undefined, invalid inputs
- [ ] **Documentation Updated** - This matrix updated with new scenario

---

## Related Documentation

- [Pipeline Testing Guide](./PIPELINE_TESTING_README.md) - How to run tests
- [Startup Runbook](./STARTUP_RUNBOOK.md) - Server startup procedures
- [Fixtures Reference](./backend/tests/fixtures/transcripts/pipeline/fixtures.ts) - Transcript data

---

**Last Updated**: January 11, 2026
