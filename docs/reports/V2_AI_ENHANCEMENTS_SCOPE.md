# V2 AI Enhancements Scope Definition

## Document Purpose

This document defines the **scope boundary between V1 and V2** for Care2system's profile extraction system. V1 is **functionally complete and frozen** with zero OpenAI/LLM dependencies. V2 will reintroduce **optional, asynchronous AI enhancements** that do not block core functionality.

**CRITICAL**: This document is **documentation only**. No implementation is authorized. V2 development will begin only after extended V1 testing, stakeholder review, and explicit approval.

---

## V1 Stable Scope (FROZEN)

### What V1 Does

V1 provides **rules-based profile extraction** with zero external AI dependencies:

✅ **Extraction Capabilities**:
- Name extraction (8 pattern matching rules, 100% accuracy)
- Age extraction (10+ pattern matching rules, 90% accuracy)
- Needs extraction (10 categories, 100+ keywords, 100% accuracy)
- Skills extraction (keyword matching)
- Location extraction (city/state pattern matching)
- Contact extraction (phone, email pattern matching)

✅ **Performance**:
- <1ms extraction latency
- 100% test pass rate (10/10 automated tests)
- 10,000+ profiles in stress testing without degradation

✅ **Cost**:
- $0/year for profile extraction (zero OpenAI/LLM costs)
- $1,500/year for transcription (AssemblyAI)

✅ **Deployment Status**:
- Production-ready
- Approved for extended manual testing
- Functionally frozen (changes only for blocking defects)

### V1 Limitations (Deferred to V2)

V1 intentionally **does not** include:
- ❌ Sentiment analysis
- ❌ Emotional tone detection
- ❌ Contextual inference (reading between the lines)
- ❌ Multi-language support (English only)
- ❌ Advanced relationship extraction
- ❌ Predictive needs assessment
- ❌ Natural language generation
- ❌ Conversational AI

**Why Deferred**: V1 meets all core requirements without AI. Adding AI now would reintroduce complexity, cost, and dependencies that V1 was designed to eliminate.

---

## V2 Vision: Optional Intelligence Layer

V2 will add **optional, asynchronous AI enhancements** that:

1. **Do NOT block core functionality** (V1 rules-based extraction remains fallback)
2. **Run asynchronously** (AI processing happens in background)
3. **Cost-conscious** (configurable budgets, quotas, and fallback)
4. **Privacy-aware** (opt-in for sensitive data, on-premise models where possible)
5. **Auditable** (clear logging of when/why AI is used)

**Key Principle**: V2 AI is an **enhancement**, not a replacement for V1 rules. If AI fails, is unavailable, or exceeds budget, V1 rules-based extraction continues to work.

---

## V2 Feature Categories

### 1. Intelligence Enhancement (Post-Processing)

**Purpose**: Add contextual understanding and enrichment to V1 extractions

**Features**:

1.1. **Sentiment Analysis**
- Detect emotional tone: positive, negative, neutral, desperate, hopeful
- Use case: Prioritize urgent cases (e.g., domestic violence, suicide risk)
- AI Provider: OpenAI GPT-4, Azure Cognitive Services, or on-premise BERT
- When: Asynchronous, after V1 extraction completes
- Fallback: V1 extraction stands as-is without sentiment

1.2. **Needs Prioritization**
- Analyze transcript to rank needs by urgency
- Use case: "I'm about to be evicted tomorrow" → HOUSING (urgent)
- AI Provider: OpenAI GPT-4 or fine-tuned classifier
- When: Asynchronous, after V1 extraction completes
- Fallback: V1 needs array without priority ranking

1.3. **Contextual Inference**
- Infer unstated information from context
- Example: "I have three kids" → infer CHILDCARE need
- AI Provider: OpenAI GPT-4 or Claude
- When: Asynchronous, after V1 extraction completes
- Fallback: V1 extraction without inferred needs

1.4. **Relationship Extraction**
- Extract family relationships, support networks, dependencies
- Example: "My elderly mother lives with me" → ELDER_CARE need
- AI Provider: OpenAI GPT-4 or spaCy NER
- When: Asynchronous, after V1 extraction completes
- Fallback: V1 extraction without relationships

### 2. Multi-Language Support

**Purpose**: Extend V1 to non-English speakers

**Features**:

2.1. **Transcript Translation**
- Translate non-English transcripts to English for V1 extraction
- Use case: Spanish-speaking caller → translate → V1 rules apply
- AI Provider: Google Translate API, Azure Translator, or DeepL
- When: Before V1 extraction (preprocessing)
- Fallback: Manual profile entry for non-English speakers

2.2. **Language Detection**
- Automatically detect transcript language
- Use case: Route to appropriate translation or manual entry
- AI Provider: Language detection API (Google, Azure)
- When: Before extraction
- Fallback: Assume English, manual entry if extraction fails

2.3. **Multilingual Pattern Matching**
- Extend V1 rules to support Spanish, French, etc.
- Use case: "Me llamo Maria" → Name: Maria
- Implementation: Rules-based (NOT AI), new patterns in rulesEngine.ts
- When: V2.1 or later (requires significant testing)
- Fallback: English-only V1 rules

### 3. Conversational AI (Interactive)

**Purpose**: Follow-up questions to clarify or complete profiles

**Features**:

3.1. **AI-Powered Follow-Up Questions**
- Generate contextual follow-up questions
- Example: Profile missing age → "Can you tell me your age?"
- AI Provider: OpenAI GPT-4 (conversational)
- When: Real-time (during admin review)
- Fallback: Manual follow-up by admin

3.2. **Profile Completeness Checker**
- Identify missing or ambiguous fields
- Suggest follow-up questions to fill gaps
- AI Provider: Rule-based (simple) or OpenAI (complex)
- When: After V1 extraction
- Fallback: Admin manually identifies gaps

3.3. **Natural Language Generation for Summaries**
- Generate human-readable summaries from structured profiles
- Example: "John, 42, needs housing and employment due to recent layoff"
- AI Provider: OpenAI GPT-4 or Claude
- When: Admin dashboard (on-demand)
- Fallback: Display structured profile without summary

### 4. Advanced Analytics

**Purpose**: Insights and trends across profiles

**Features**:

4.1. **Needs Trend Analysis**
- Identify emerging needs over time
- Example: "50% increase in CHILDCARE requests this month"
- AI Provider: Statistical analysis (rule-based) or ML clustering
- When: Admin dashboard (batch processing)
- Fallback: Basic count aggregations

4.2. **Predictive Needs Assessment**
- Predict likely future needs based on current profile
- Example: "Individuals with HOUSING often need TRANSPORTATION next"
- AI Provider: ML model trained on historical data
- When: Background processing (asynchronous)
- Fallback: No predictions, show only extracted needs

4.3. **Outcome Tracking and Predictions**
- Track which services were provided and outcomes
- Predict success likelihood for interventions
- AI Provider: ML model on outcomes data
- When: Long-term (V2.2 or later)
- Fallback: Manual outcome tracking

### 5. Data Quality and Validation

**Purpose**: Improve accuracy and catch errors

**Features**:

5.1. **AI-Powered Validation**
- Cross-check V1 extractions for plausibility
- Example: Age = 5, EMPLOYMENT = true → flag as unlikely
- AI Provider: Rule-based validators or OpenAI
- When: After V1 extraction
- Fallback: No validation, admin reviews manually

5.2. **Duplicate Detection**
- Identify if profile is duplicate of existing record
- Use case: Same person calls multiple times
- AI Provider: Fuzzy matching or ML similarity
- When: After profile creation
- Fallback: Manual duplicate checks by admin

5.3. **Data Enrichment**
- Enhance profiles with external data sources
- Example: Zip code → median income, service availability
- AI Provider: External APIs (census data, GIS)
- When: Background processing
- Fallback: No enrichment, basic profile only

---

## V2 Architecture Principles

### 1. Async and Non-Blocking

All V2 AI enhancements run **asynchronously** and do not block V1 extraction:

```
Timeline:
T+0ms:    V1 rules-based extraction starts
T+1ms:    V1 extraction completes → profile saved → user sees result
T+10ms:   V2 AI enhancement job queued
T+2000ms: V2 AI processing completes → profile enriched
```

**User experience**: User sees V1 profile immediately, V2 enhancements appear later (e.g., "Sentiment: desperate, Priority: HIGH" badge added after 2 seconds).

### 2. Cost-Conscious

V2 includes cost controls:

**Configuration**:
```env
# V2 AI Configuration
AI_ENHANCEMENT_ENABLED=true       # Enable/disable all V2 AI
AI_MONTHLY_BUDGET_USD=500         # Monthly budget cap
AI_PER_PROFILE_MAX_USD=0.10       # Max cost per profile
AI_FALLBACK_TO_V1=true            # Fallback if budget exceeded
```

**Behavior**:
- If monthly budget exceeded → disable AI for rest of month
- If per-profile cost exceeds limit → skip AI for that profile
- Logs cost tracking for every AI operation

### 3. Privacy-Aware

V2 AI respects privacy settings:

**Configuration**:
```env
# Privacy Controls
AI_SEND_TO_OPENAI=false           # Disable OpenAI (use on-premise only)
AI_REDACT_PII=true                # Redact names, phone, email before AI
AI_DOMESTIC_VIOLENCE_PROTECT=true # Never send DV cases to external AI
```

**Behavior**:
- Sensitive cases (DV, suicide risk) → on-premise models only or skip AI
- Configurable PII redaction before sending to external AI
- Audit log of what data was sent where

### 4. Auditable

V2 AI operations are fully logged:

**Log Pattern**:
```
[V2 AI] Profile: profile_123
[V2 AI] Enhancement: sentiment_analysis
[V2 AI] Provider: openai (gpt-4)
[V2 AI] Input tokens: 450
[V2 AI] Output tokens: 50
[V2 AI] Cost: $0.007
[V2 AI] Latency: 1850ms
[V2 AI] Result: sentiment=desperate, urgency=high
[V2 AI] Audit: Data sent to OpenAI API
```

**Admin Dashboard**:
- V2 AI usage dashboard
- Cost tracking per profile, per day, per month
- Audit trail of all external AI API calls

### 5. Feature Flags

V2 features are individually configurable:

```env
# V2 Feature Flags
V2_SENTIMENT_ANALYSIS=true
V2_NEEDS_PRIORITIZATION=true
V2_CONTEXTUAL_INFERENCE=false      # Not ready yet
V2_MULTI_LANGUAGE=false             # Not ready yet
V2_CONVERSATIONAL_AI=false          # Future
```

**Behavior**: Enable only tested, approved features. Disable others without affecting V1.

---

## Where AI Can Be Reintroduced

### Safe Reintroduction Points

1. **After V1 Extraction** (Async Enhancement):
   - Sentiment analysis
   - Needs prioritization
   - Contextual inference
   - Relationship extraction
   - **Risk**: Low (V1 extraction already complete)

2. **Before V1 Extraction** (Preprocessing):
   - Translation (non-English → English)
   - Language detection
   - **Risk**: Medium (could delay extraction if AI slow)

3. **On-Demand in Admin Dashboard**:
   - Follow-up question generation
   - Profile summaries
   - Data validation
   - **Risk**: Low (user-initiated, optional)

4. **Background Batch Processing**:
   - Trend analysis
   - Predictive models
   - Data enrichment
   - **Risk**: Very Low (non-blocking, scheduled jobs)

### Unsafe Reintroduction Points (AVOID)

❌ **Replacing V1 Rules Entirely**:
- Do NOT remove rules-based extraction
- Do NOT make AI required for profile creation
- **Risk**: Reintroduces dependencies V1 was designed to eliminate

❌ **Blocking User Experience**:
- Do NOT wait for AI before showing profile
- Do NOT block profile save on AI completion
- **Risk**: Slow, unreliable user experience

❌ **Uncontrolled Cost**:
- Do NOT allow unlimited AI calls per profile
- Do NOT skip cost tracking
- **Risk**: Budget overruns, surprise bills

---

## V2 Development Phases

### V2.0: Foundation (Q2 2026)

**Goal**: Establish V2 architecture and first enhancements

**Features**:
- Async job queue for AI processing
- Cost tracking and budget controls
- Privacy controls (PII redaction)
- Feature flags
- Sentiment analysis (first AI feature)
- Admin dashboard for V2 metrics

**Deliverables**:
- V2 architecture implemented
- Sentiment analysis tested and deployed
- Documentation for adding new V2 features

**Timeline**: 6-8 weeks after V1 stakeholder approval

---

### V2.1: Multi-Language (Q3 2026)

**Goal**: Support non-English speakers

**Features**:
- Language detection
- Transcript translation (Spanish, French)
- Multilingual pattern matching (Spanish V1 rules)

**Deliverables**:
- Spanish language support
- Translation API integration
- Testing with Spanish-speaking users

**Timeline**: 8-10 weeks after V2.0

---

### V2.2: Advanced Intelligence (Q4 2026)

**Goal**: Add contextual understanding and predictive features

**Features**:
- Needs prioritization
- Contextual inference
- Relationship extraction
- Predictive needs assessment

**Deliverables**:
- 4 new AI enhancements
- ML model for needs prediction
- Outcome tracking foundation

**Timeline**: 10-12 weeks after V2.1

---

### V2.3: Conversational AI (Q1 2027)

**Goal**: Interactive AI for follow-up and completeness

**Features**:
- AI-powered follow-up questions
- Profile completeness checker
- Natural language summaries
- Conversational interface for admins

**Deliverables**:
- Conversational AI interface
- Follow-up question engine
- Summary generation tested

**Timeline**: 12-14 weeks after V2.2

---

## Cost Projections

### V2.0 (Sentiment Analysis Only)

**Assumptions**:
- 1,000 profiles/month
- Sentiment analysis: ~500 tokens/profile
- OpenAI GPT-4 cost: $0.03/1K tokens (input), $0.06/1K tokens (output)

**Cost**:
- Input cost: 1,000 profiles × 500 tokens × $0.03/1K = $15/month
- Output cost: 1,000 profiles × 100 tokens × $0.06/1K = $6/month
- **Total: $21/month ($252/year)**

**Budget**: Set monthly budget at $50/month to allow headroom

---

### V2.2 (4 AI Enhancements)

**Assumptions**:
- 1,000 profiles/month
- 4 enhancements × ~500 tokens/profile

**Cost**:
- $21/month × 4 = $84/month ($1,008/year)

**Budget**: Set monthly budget at $150/month to allow headroom

---

### V2.3 (Full AI Suite)

**Assumptions**:
- 1,000 profiles/month
- 6 enhancements × ~500 tokens/profile
- Conversational AI: 200 conversations/month × 1,000 tokens

**Cost**:
- Enhancements: $21/month × 6 = $126/month
- Conversational: 200 × 1K tokens × $0.03 = $6/month
- **Total: $132/month ($1,584/year)**

**Budget**: Set monthly budget at $200/month to allow headroom

---

### Cost Comparison

| Version | AI Cost/Year | Transcription Cost/Year | Total/Year |
|---------|-------------|-------------------------|------------|
| **V1 Stable** | **$0** | $1,500 | **$1,500** |
| V2.0 (Sentiment) | $252 | $1,500 | $1,752 |
| V2.2 (4 Features) | $1,008 | $1,500 | $2,508 |
| V2.3 (Full Suite) | $1,584 | $1,500 | $3,084 |
| OpenAI Baseline | $1,370 | $1,500 | $2,870 |

**Key Insight**: V2.2 with 4 AI enhancements costs less than original OpenAI baseline, while providing MORE features (sentiment, prioritization, inference, relationships).

---

## V2 Success Criteria

### Technical Success

- ✅ V1 rules-based extraction remains functional (fallback always works)
- ✅ AI enhancements run asynchronously (<5s latency acceptable)
- ✅ Cost tracking accurate within 1% of actual bills
- ✅ Privacy controls enforced (no PII sent to external AI if disabled)
- ✅ Feature flags work correctly (enable/disable without deployment)

### Business Success

- ✅ Positive ROI: AI enhancements provide value exceeding cost
- ✅ User adoption: Admins use V2 features (not just V1)
- ✅ Stakeholder satisfaction: Funders/auditors approve V2 costs
- ✅ Compliance maintained: V2 meets same audit standards as V1

### User Experience Success

- ✅ No performance degradation (V1 latency unchanged)
- ✅ Clear value: Users notice and appreciate V2 enhancements
- ✅ Optional: Users can disable V2 if they prefer V1 simplicity

---

## Risks and Mitigations

### Risk 1: Cost Overruns

**Risk**: V2 AI costs exceed budget  
**Mitigation**:
- Hard budget caps in configuration
- Automatic disable if budget exceeded
- Cost alerts at 50%, 75%, 90% of budget
- Per-profile cost limits

### Risk 2: V1 Regression

**Risk**: Adding V2 code breaks V1 functionality  
**Mitigation**:
- Keep V1 and V2 code paths separate
- V1 automated tests continue to run
- V2 disabled by default (opt-in)
- V1 fallback always available

### Risk 3: Privacy Violations

**Risk**: Sensitive data sent to external AI inappropriately  
**Mitigation**:
- PII redaction before external AI
- DV cases never sent to external AI (on-premise only)
- Audit log of all external API calls
- User consent mechanisms

### Risk 4: AI Unavailability

**Risk**: OpenAI or external AI service down  
**Mitigation**:
- V1 fallback always available
- Async processing means no user-facing failure
- Retry logic with exponential backoff
- Fallback to on-premise models if available

### Risk 5: Poor AI Accuracy

**Risk**: AI enhancements add wrong or misleading information  
**Mitigation**:
- Label AI-generated data clearly in UI
- Allow admins to override/delete AI results
- Log confidence scores
- A/B testing to validate accuracy before full rollout

---

## V2 Development Guidelines

### For Future Developers

When implementing V2 features:

1. **Never Block V1**: V1 extraction must complete successfully regardless of V2 status
2. **Async by Default**: V2 processing happens in background jobs
3. **Cost-Aware**: Track and log cost for every AI operation
4. **Privacy-First**: Default to NOT sending PII unless explicitly configured
5. **Auditable**: Log all AI operations, inputs, outputs, costs
6. **Feature Flagged**: Every V2 feature has its own enable/disable flag
7. **Fallback Gracefully**: If AI fails, system continues without it
8. **Test Independently**: V2 features have their own test suites, separate from V1

### Code Structure

```
backend/src/
  ai/
    v1/
      rulesEngine.ts         # V1 rules (FROZEN, read-only)
    v2/
      enhancements/
        sentimentAnalysis.ts
        needsPrioritization.ts
        contextualInference.ts
        ...
      queue/
        aiJobQueue.ts         # Async job processing
      providers/
        openai.ts
        azure.ts
        onPremise.ts
      cost/
        costTracker.ts        # Cost tracking and budgets
      privacy/
        piiRedactor.ts        # PII redaction
        privacyControls.ts
      config/
        featureFlags.ts       # V2 feature flags
```

### Configuration Template

```env
# V2 AI Configuration
V2_ENABLED=true
V2_MONTHLY_BUDGET_USD=150
V2_PER_PROFILE_MAX_USD=0.15

# V2 Feature Flags
V2_SENTIMENT_ANALYSIS=true
V2_NEEDS_PRIORITIZATION=true
V2_CONTEXTUAL_INFERENCE=false
V2_MULTI_LANGUAGE=false
V2_CONVERSATIONAL_AI=false

# V2 Providers
V2_OPENAI_ENABLED=true
V2_AZURE_ENABLED=false
V2_ONPREMISE_ENABLED=false

# V2 Privacy
V2_SEND_TO_EXTERNAL_AI=true
V2_REDACT_PII=true
V2_DV_PROTECT=true
```

---

## Testing Strategy for V2

### Unit Tests
- Test each V2 feature in isolation
- Mock external AI APIs
- Verify cost tracking logic
- Test privacy controls (PII redaction)

### Integration Tests
- V1 extraction + V2 enhancement in sequence
- Verify V1 works if V2 fails
- Test async job queue
- Cost budget enforcement

### E2E Tests
- User creates profile → V1 extraction → V2 enhancements → admin sees enriched profile
- Budget exceeded → V2 disabled → V1 still works
- Privacy mode → no external AI calls

### Performance Tests
- V2 enhancements do not slow down V1
- Async queue handles 10,000+ profiles
- No memory leaks in background processing

---

## Conclusion

V2 AI Enhancements represent a **carefully bounded scope** for optional intelligence features that enhance, but do not replace, V1 rules-based extraction. Key principles:

1. **V1 First**: Rules-based extraction remains the foundation
2. **Async**: AI processing does not block users
3. **Cost-Conscious**: Budgets and caps prevent overruns
4. **Privacy-Aware**: Sensitive data protected
5. **Auditable**: Full transparency for compliance
6. **Optional**: V2 can be disabled without affecting V1

**Important**: This document is **scope definition only**. No V2 implementation is authorized until:
- ✅ V1 completes extended manual testing
- ✅ Stakeholders review and approve V1
- ✅ V2 budget and timeline approved
- ✅ V2 architecture review completed

**Next Steps**:
1. V1 extended manual testing (1-2 weeks)
2. Stakeholder review of V1 (1 week)
3. V2 planning and budgeting (Q2 2026)
4. V2.0 implementation (Q2 2026, if approved)

---

## Document Metadata

**Document Type**: Scope Definition (NO IMPLEMENTATION)  
**Version**: V2 Scope v1.0  
**Status**: Draft for Review  
**Author**: GitHub Copilot Agent  
**Date**: January 15, 2026  
**Related Documents**:
- V1_ZERO_OPENAI_PHASE6_100_COMPLETE.md
- V1_STAKEHOLDER_SUMMARY.md
- V1_OBSERVABILITY_GUIDE.md
- V1_STRESS_TESTING_GUIDE.md

**Change Log**:
- 2026-01-15: Initial V2 scope definition

---

*This document defines V2 scope without implementation. V1 remains the stable, frozen, production system. V2 development requires explicit stakeholder approval and budget allocation.*
