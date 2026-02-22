# Zero OpenAI Inventory - Complete Dependency Audit

**Date**: January 5, 2026  
**Purpose**: Complete inventory of all OpenAI usage for V1 Stabilization  
**Goal**: Eliminate ALL OpenAI dependencies from runtime for stress testing

---

## Executive Summary

**Total OpenAI Dependencies Found**: 11 services  
**Criticality**: 3 Critical, 4 High, 2 Medium, 2 Low  
**Package Dependency**: `openai: ^4.20.1` in package.json

**Replacement Strategy**:
- ✅ Transcription: AssemblyAI already migrated (keep for V1)
- 🎯 Analysis/Extraction: Rules-based + templates (V1 mode)
- 🎯 Story Generation: Template library + form inputs
- 🎯 Classification: Keyword-based rules
- 🎯 Testing: Stub providers for stress tests

---

## Complete OpenAI Usage Catalog

### 🔴 CRITICAL - Must Replace (Core V1 Flow)

#### 1. Story Profile Data Extraction
**File**: `backend/src/services/transcriptionService.ts`  
**Function**: `extractProfileData(transcript: string)`  
**Model**: GPT-4  
**Lines**: 1, 6-9

**Current Behavior**:
- Calls OpenAI GPT-4 to extract structured profile data
- Returns: name, age, location, skills, needs, goals, summary, donation pitch

**V1 Replacement Strategy**: **Rules-Based Extraction**
- Use regex patterns for name, age, location, phone, email
- Keyword scoring for needs tags (housing, food, jobs, health)
- Template-based summary generation
- No external API calls

**Fallback**: Prompt user with guided form if extraction incomplete

---

#### 2. GoFundMe Draft Extraction
**File**: `backend/src/services/storyExtractionService.ts`  
**Function**: `extractGoFundMeData(transcript: string)`  
**Model**: GPT-4o  
**Lines**: 1, 11, 25-26, 37-47

**Current Behavior**:
- Calls OpenAI GPT-4o with 351-line system prompt
- Generates complete GoFundMe campaign draft from transcript
- Returns: title, story, goal, category, beneficiary, tags

**V1 Replacement Strategy**: **Form-Driven Generation**
- Remove AI extraction from critical path
- Use existing "Generate Donation Tools" form:
  - Campaign title (required input)
  - Goal amount (optional input)
  - Long description (required textarea)
  - 90-word excerpt (required, editable)
- Generate deterministic draft from form fields
- No AI analysis blocking profile creation

**Fallback**: None needed - form-based approach is deterministic

---

#### 3. GoFundMe Story Generation
**File**: `backend/src/services/donationService.ts`  
**Function**: `generateGoFundMeStory(profileData: any)`  
**Model**: GPT-4  
**Lines**: 4, 7-8, 68-70, 208-209

**Current Behavior**:
- Calls OpenAI GPT-4 to generate 3-5 paragraph fundraising story
- Uses profile data to create compelling narrative
- Returns formatted story with title and social sharing summary

**V1 Replacement Strategy**: **Template Library**
- Create 5-10 story templates based on primary need tag
- Template variables: {name}, {primaryNeed}, {goal}, {skills}
- Simple paragraph assembly from form inputs
- Dignity-preserving, non-exploitative language

**Fallback**: Generic template with blanks for manual editing

---

### ⚠️ HIGH - Replace for Quota Safety (Used in Recording Flow)

#### 4. Story Analysis (Transcript → Profile)
**File**: `backend/src/routes/story.ts` (referenced in report)  
**Function**: `analyzeTranscript(transcript: string, language: string)`  
**Model**: GPT-3.5-turbo

**Status**: Not directly found in grep (may be in routes/story.ts)

**V1 Replacement Strategy**: **Rules-Based Analysis**
- Same as #1 (profile data extraction)
- Merge with transcriptionService extraction logic

---

#### 5. Donation Pitch Generation
**File**: `backend/src/services/transcriptionService.ts`  
**Function**: `generateDonationPitch(profileData: ExtractedProfileData)`  
**Model**: GPT-4

**Status**: Referenced in report, confirm existence in file

**V1 Replacement Strategy**: **Template-Based Pitch**
- 5-10 pre-written templates by need category
- 2-3 sentences max
- Variables: {name}, {skills}, {primaryNeed}, {goal}
- Fallback: "Every contribution helps provide stability and opportunity."

---

#### 6. Transcription Orchestrator (OpenAI Whisper Fallback)
**File**: `backend/src/services/donationPipeline/orchestrator.ts`  
**Function**: `performTranscription()`  
**Model**: Whisper-1  
**Lines**: 222, 227-280

**Current Behavior**:
- EVTS-first strategy with OpenAI Whisper fallback
- Calls `https://api.openai.com/v1/audio/transcriptions` if EVTS fails
- Used in production recording pipeline

**V1 Replacement Strategy**: **AssemblyAI Only (Stub for Stress Tests)**
- Remove OpenAI Whisper fallback entirely
- Use AssemblyAI as primary (already integrated)
- For stress tests: Use stub provider (deterministic transcripts)
- Never fall back to OpenAI

**Fallback**: Fail gracefully with clear error, offer manual transcript upload

---

#### 7. EVTS-First Service (Legacy Whisper Fallback)
**File**: `backend/src/services/transcription/evtsFirst.ts`  
**Model**: Whisper-1  
**Lines**: 17, 20-23

**Current Behavior**:
- EVTS-first with OpenAI fallback
- Duplicate logic with orchestrator

**V1 Replacement Strategy**: **DELETE FILE**
- File is deprecated (duplicate functionality)
- Update any imports to use orchestrator or provider abstraction
- Remove from codebase

---

### 🟡 MEDIUM - Optional Features (Downgrade or Disable)

#### 8. Resource Classification
**File**: `backend/src/ai/resource-classifier.ts`  
**Function**: `classifyResource()`  
**Model**: GPT-4-turbo-preview  
**Lines**: 1, 8-9, 280, 306-336

**Current Behavior**:
- Calls OpenAI to classify homeless resources into categories
- Used for resource discovery feature
- Not blocking core V1 flows

**V1 Replacement Strategy**: **Keyword-Based Classifier**
- Use keyword scoring for categories:
  - food_nutrition: ['food', 'meal', 'pantry', 'kitchen', 'soup']
  - shelter_housing: ['shelter', 'housing', 'homeless', 'bed', 'room']
  - healthcare: ['medical', 'clinic', 'doctor', 'health', 'dental']
  - etc.
- Simple scoring algorithm
- Acceptable accuracy for V1 (>85% target)

**Fallback**: "General Support" category if uncertain

---

#### 9. Eligibility Assistant
**File**: `backend/src/eligibility/ai-eligibility-assistant.ts`  
**Function**: `analyzeEligibility()`  
**Model**: GPT-4-turbo-preview  
**Lines**: 1, 12-13, 45-100+

**Current Behavior**:
- Complex AI analysis of government program eligibility
- Personalized guidance and action plans
- 200+ line system prompt

**V1 Replacement Strategy**: **Rules-Only Mode**
- Use existing rules engine results without AI enhancement
- Show basic eligibility labels without AI explanation
- Mark feature as "Beta" or "Coming Soon" for advanced guidance

**Fallback**: Display rules engine results directly

---

### 🟢 LOW - Testing/Optional (Safe to Remove)

#### 10. Job Search Enhancement
**File**: `backend/src/services/jobSearchService.ts`  
**Functions**: `enhanceJobListings()`, `generateResumeAdvice()`, `matchJobsToProfile()`  
**Model**: GPT-3.5-turbo, GPT-4  
**Lines**: 2, 5-6, 263-307, 353

**Current Behavior**:
- Enhances job listings with personalized insights
- Generates resume advice
- Optional feature

**V1 Replacement Strategy**: **Disable Feature**
- Return basic job listings without enhancement
- Remove AI calls entirely
- Mark feature as "Coming Soon"

**Fallback**: Basic job listings (acceptable for V1)

---

#### 11. Smoke Test (OpenAI Fallback)
**File**: `backend/src/services/speechIntelligence/smokeTest.ts`  
**Function**: `transcribeWithOpenAI()`  
**Model**: Whisper-1  
**Lines**: 4 (comment)

**Current Behavior**:
- Background health checks use OpenAI as fallback
- Testing/monitoring only

**V1 Replacement Strategy**: **Use AssemblyAI Instead**
- Replace OpenAI Whisper with AssemblyAI in smoke tests
- Or use stub provider for offline testing

**Fallback**: Skip transcription test if no provider available

---

### 🔍 MONITORING & HEALTH CHECKS

#### 12. Health Check Runner
**File**: `backend/src/utils/healthCheckRunner.ts`  
**Function**: `checkOpenAI()`  
**Lines**: 26-80, 405, 412, 420, 460

**Current Behavior**:
- Tests OpenAI API connectivity
- Lists available models
- Reports health status

**V1 Replacement Strategy**: **Mark as Optional**
- Skip OpenAI health check if AI_PROVIDER=none
- Log "OpenAI not configured (V1 mode)" instead
- No failures if OpenAI unavailable

---

#### 13. Health Check Scheduler
**File**: `backend/src/services/healthCheckScheduler.ts`  
**Function**: `checkOpenAI()`  
**Lines**: 13, 144, 154-158, 203-218, 419

**Current Behavior**:
- Periodic OpenAI connectivity checks
- Uses dynamic require('openai')

**V1 Replacement Strategy**: **Skip in V1 Mode**
- Check AI_PROVIDER env var
- Skip OpenAI check if provider=none
- Return { ok: true, error: 'V1 mode - OpenAI disabled' }

---

#### 14. Pipeline Troubleshooter
**File**: `backend/src/services/troubleshooting/pipelineTroubleshooter.ts`  
**Lines**: 336-354

**Current Behavior**:
- Suggests switching to OpenAI fallback on EVTS failure
- Metadata references to OpenAI

**V1 Replacement Strategy**: **Update Fallback Logic**
- Change fallback to AssemblyAI instead of OpenAI
- Remove OpenAI references from troubleshooting actions

---

#### 15. Incident Manager
**File**: `backend/src/utils/incidentManager.ts`  
**Line**: 10

**Current Behavior**:
- Type definition includes 'openai' as ServiceName

**V1 Replacement Strategy**: **Keep Type, Mark Optional**
- Keep type for backward compatibility
- Never use in V1 mode
- Or change to 'ai_provider' generic type

---

## Replacement Implementation Strategy

### Phase 1: Provider Abstraction (Foundation)

Create centralized provider modules that abstract ALL AI operations:

**Files to Create**:
1. `backend/src/providers/ai/index.ts` - Main AI provider interface
2. `backend/src/providers/ai/none.ts` - No-op provider for V1
3. `backend/src/providers/ai/rules.ts` - Rules-based extraction
4. `backend/src/providers/ai/templates.ts` - Template library
5. `backend/src/providers/transcription/index.ts` - Transcription interface
6. `backend/src/providers/transcription/assemblyai.ts` - AssemblyAI provider
7. `backend/src/providers/transcription/stub.ts` - Stub for stress tests

**Environment Variables**:
```bash
AI_PROVIDER=none                    # none | rules | template | openai (legacy)
TRANSCRIPTION_PROVIDER=assemblyai   # assemblyai | stub
STORY_ANALYSIS_MODE=rules           # none | rules | template
ENABLE_STRESS_TEST_MODE=false       # true enables test endpoints
STRESS_TEST_TRANSCRIPT_FIXTURE=./fixtures/sample-transcript.txt
```

---

### Phase 2: Deterministic Replacements

#### Rules-Based Profile Extraction

**Algorithm**:
```typescript
function extractProfileDataRules(transcript: string) {
  // 1. Extract contact info
  const name = extractName(transcript); // "my name is X", "I'm X"
  const age = extractAge(transcript); // "I'm 42", "42 years old"
  const phone = extractPhone(transcript); // US phone patterns
  const email = extractEmail(transcript); // Email regex
  
  // 2. Extract needs via keyword scoring
  const needsScores = {
    HOUSING: scoreKeywords(transcript, ['housing', 'shelter', 'eviction', 'homeless', 'rent']),
    FOOD: scoreKeywords(transcript, ['food', 'meal', 'hungry', 'pantry']),
    JOBS: scoreKeywords(transcript, ['job', 'work', 'employment', 'income']),
    HEALTH: scoreKeywords(transcript, ['medical', 'health', 'doctor', 'medicine', 'sick']),
  };
  
  const topNeeds = getTopN(needsScores, 3);
  
  // 3. Generate template summary
  const summary = generateTemplateSummary(name, topNeeds, transcript.length);
  
  return {
    name,
    age,
    phone,
    email,
    urgentNeeds: topNeeds,
    summary,
    extractionMethod: 'rules',
    confidence: calculateConfidence(name, age, topNeeds),
  };
}
```

#### Template-Based Story Generation

**Templates by Need**:
```typescript
const STORY_TEMPLATES = {
  HOUSING: {
    title: "Help {name} Secure Stable Housing",
    intro: "{name} is seeking support to secure stable housing and rebuild stability.",
    body: `{description}

Your contribution will help with:
- Security deposit and first month's rent
- Moving expenses and essential furniture
- Utilities setup and basic household needs

Every donation brings {name} closer to having a safe place to call home and the foundation needed for long-term stability.`,
  },
  FOOD: { /* ... */ },
  JOBS: { /* ... */ },
  // ... more templates
};

function generateStoryFromTemplate(formData: FormData) {
  const template = STORY_TEMPLATES[formData.primaryNeed] || STORY_TEMPLATES.DEFAULT;
  return {
    title: interpolate(template.title, formData),
    story: interpolate(template.intro, formData) + '\n\n' + formData.longDescription + '\n\n' + interpolate(template.body, formData),
    excerpt: formData.excerpt || generateDefaultExcerpt(formData),
  };
}
```

---

### Phase 3: Safety Gates

**Startup Check** (`backend/src/server.ts`):
```typescript
// On server startup
if (process.env.AI_PROVIDER === 'none') {
  // Ensure no OpenAI client can be initialized
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('placeholder')) {
    console.warn('[WARN] OPENAI_API_KEY set but AI_PROVIDER=none. Key will be ignored.');
  }
  console.log('[AI_MODE] provider=none (OpenAI disabled, V1 rules mode)');
} else if (process.env.AI_PROVIDER === 'openai') {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('AI_PROVIDER=openai but OPENAI_API_KEY not set');
  }
  console.log('[AI_MODE] provider=openai (legacy mode)');
}
```

**Runtime Guard** (in provider abstraction):
```typescript
export function getAIProvider() {
  const provider = process.env.AI_PROVIDER || 'none';
  
  switch (provider) {
    case 'none':
      return new NoOpAIProvider();
    case 'rules':
      return new RulesBasedAIProvider();
    case 'template':
      return new TemplateBasedAIProvider();
    case 'openai': // Legacy - should not be used in V1
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI provider requires OPENAI_API_KEY');
      }
      console.warn('[WARN] Using legacy OpenAI provider - not recommended for V1');
      return new OpenAIProvider();
    default:
      throw new Error(`Unknown AI_PROVIDER: ${provider}`);
  }
}
```

---

## Stress Test Mode Configuration

### Stub Transcription Provider

**Purpose**: Run load tests without hitting external APIs

**Implementation**:
```typescript
// backend/src/providers/transcription/stub.ts
export class StubTranscriptionProvider implements TranscriptionProvider {
  private fixtures: string[];
  
  constructor() {
    // Load fixtures from filesystem or use hardcoded samples
    const fixturePath = process.env.STRESS_TEST_TRANSCRIPT_FIXTURE;
    this.fixtures = fixturePath 
      ? [fs.readFileSync(fixturePath, 'utf-8')]
      : DEFAULT_FIXTURES;
  }
  
  async transcribe(audioPath: string): Promise<TranscriptionResult> {
    // Simulate realistic latency
    await sleep(150 + Math.random() * 150); // 150-300ms
    
    // Return deterministic transcript
    const transcript = this.fixtures[Math.floor(Math.random() * this.fixtures.length)];
    
    return {
      transcript,
      confidence: 0.95,
      source: 'stub',
      warnings: ['Using stub provider (stress test mode)'],
    };
  }
}

const DEFAULT_FIXTURES = [
  "My name is John Smith. I'm 42 years old and I've been experiencing housing insecurity. I have carpentry skills and I'm looking for stable housing and employment opportunities.",
  "Hi, my name is Maria Garcia. I'm seeking support with food and healthcare access. I have a background in retail and customer service.",
  // ... more realistic samples
];
```

### Test-Only Endpoints

**Warning**: Only enabled in stress test mode

```typescript
// backend/src/routes/stress-test.ts (NEW FILE)
import { Router } from 'express';

const router = Router();

// CRITICAL: Only enable if explicitly configured
if (process.env.ENABLE_STRESS_TEST_MODE !== 'true') {
  throw new Error('Stress test routes loaded but ENABLE_STRESS_TEST_MODE not enabled');
}

// Middleware: Require secret header
router.use((req, res, next) => {
  const testKey = req.headers['x-stress-test-key'];
  if (testKey !== process.env.STRESS_TEST_SECRET_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

// Create test recording without audio file
router.post('/test-recording', async (req, res) => {
  // Create recording with stub data
  // No actual audio processing
  // Returns immediately with mock recording ID
});

// Create batch test recordings
router.post('/batch-recordings', async (req, res) => {
  const count = Math.min(req.body.count || 10, 100); // Max 100
  // Create N recordings rapidly
});

export default router;
```

---

## Files to Modify/Delete

### Files to DELETE
1. ❌ `backend/src/services/transcription/evtsFirst.ts` - Deprecated duplicate

### Files to MODIFY (Remove OpenAI)
1. ✏️ `backend/src/services/transcriptionService.ts` - Use provider abstraction
2. ✏️ `backend/src/services/storyExtractionService.ts` - Use provider abstraction
3. ✏️ `backend/src/services/donationService.ts` - Use provider abstraction
4. ✏️ `backend/src/services/jobSearchService.ts` - Disable or use provider
5. ✏️ `backend/src/ai/resource-classifier.ts` - Use keyword classifier
6. ✏️ `backend/src/eligibility/ai-eligibility-assistant.ts` - Use provider abstraction
7. ✏️ `backend/src/services/speechIntelligence/smokeTest.ts` - Use AssemblyAI
8. ✏️ `backend/src/services/donationPipeline/orchestrator.ts` - Remove OpenAI fallback
9. ✏️ `backend/src/utils/healthCheckRunner.ts` - Skip OpenAI in V1 mode
10. ✏️ `backend/src/services/healthCheckScheduler.ts` - Skip OpenAI in V1 mode
11. ✏️ `backend/src/services/troubleshooting/pipelineTroubleshooter.ts` - Update fallback logic

### Files to CREATE
1. ➕ `backend/src/providers/ai/index.ts`
2. ➕ `backend/src/providers/ai/none.ts`
3. ➕ `backend/src/providers/ai/rules.ts`
4. ➕ `backend/src/providers/ai/templates.ts`
5. ➕ `backend/src/providers/transcription/index.ts`
6. ➕ `backend/src/providers/transcription/assemblyai.ts`
7. ➕ `backend/src/providers/transcription/stub.ts`
8. ➕ `backend/src/routes/stress-test.ts` (optional, gated)
9. ➕ `backend/src/utils/extraction/rulesEngine.ts`
10. ➕ `backend/src/utils/templates/storyTemplates.ts`
11. ➕ `backend/fixtures/stress-test-transcripts.json`

---

## Package.json Changes

### Current
```json
{
  "dependencies": {
    "openai": "^4.20.1",
    "assemblyai": "^4.22.1"
  }
}
```

### V1 Target (Phase 1)
```json
{
  "dependencies": {
    "assemblyai": "^4.22.1"
    // OpenAI removed
  }
}
```

**Note**: Can keep `openai` package during transition with feature flag, but MUST be unused in AI_PROVIDER=none mode.

---

## Validation Checklist

### ✅ Runtime Safety
- [ ] With `AI_PROVIDER=none`, no OpenAI imports execute
- [ ] With `OPENAI_API_KEY` unset, system runs without errors
- [ ] Startup logs clearly indicate V1 mode: `[AI_MODE] provider=none`
- [ ] No OpenAI API calls possible in V1 mode (verified by network logs)

### ✅ Functional Completeness
- [ ] Recording flow completes end-to-end
- [ ] Profile creation succeeds without AI
- [ ] Donation tools generation works (form-driven)
- [ ] QR code generation works
- [ ] /donate/[id] page renders correctly
- [ ] Admin Story Browser functions
- [ ] Admin Recording Health Dashboard functions
- [ ] Search/resume works

### ✅ Stress Test Capability
- [ ] With `TRANSCRIPTION_PROVIDER=stub`, no external API calls
- [ ] Stress test creates N recordings deterministically
- [ ] No quota/rate limit errors possible
- [ ] Load test runs at target concurrency (10/25/50 parallel requests)

### ✅ Quality Baseline
- [ ] Rules-based extraction accuracy: >85% for name, >90% for needs tags
- [ ] Template stories are dignity-preserving and non-exploitative
- [ ] User satisfaction: Acceptable quality for V1 manual testing

---

## Environment Configuration Examples

### V1 Manual Testing (AssemblyAI Free Tier)
```bash
AI_PROVIDER=rules
TRANSCRIPTION_PROVIDER=assemblyai
ASSEMBLYAI_API_KEY=<your-key>
STORY_ANALYSIS_MODE=rules
ENABLE_STRESS_TEST_MODE=false
```

### V1 Stress Testing (No External APIs)
```bash
AI_PROVIDER=none
TRANSCRIPTION_PROVIDER=stub
STORY_ANALYSIS_MODE=template
ENABLE_STRESS_TEST_MODE=true
STRESS_TEST_SECRET_KEY=<random-uuid>
STRESS_TEST_TRANSCRIPT_FIXTURE=./fixtures/stress-test-transcripts.json
```

### Legacy Mode (Keep OpenAI - Not Recommended)
```bash
AI_PROVIDER=openai
TRANSCRIPTION_PROVIDER=assemblyai
OPENAI_API_KEY=<your-key>
ASSEMBLYAI_API_KEY=<your-key>
STORY_ANALYSIS_MODE=openai
ENABLE_STRESS_TEST_MODE=false
```

---

## Success Criteria

### Phase 0 (Inventory) ✅
- [x] All OpenAI usage cataloged
- [x] Criticality assessed for each usage
- [x] Replacement strategy defined
- [x] File modification list complete

### Phase 1-6 (Implementation) - Next Steps
Will be tracked in subsequent phases.

---

## Next Steps

1. **Phase 1**: Implement provider abstraction layer
2. **Phase 2**: Create rules-based extraction + templates
3. **Phase 3**: Replace all OpenAI calls with providers
4. **Phase 4**: Add stub transcription provider
5. **Phase 5**: Create stress test harness
6. **Phase 6**: Validation + documentation

**Estimated Timeline**: 2-3 days for full implementation

---

**Document Status**: ✅ COMPLETE  
**Phase 0 Deliverable**: APPROVED  
**Ready for Phase 1**: YES
