# V1 Zero-OpenAI: QA Defect Triage Rubric

## Document Purpose

This rubric provides **strict classification criteria** for issues discovered during V1 extended manual testing. It protects the production freeze by distinguishing **blocking defects** (fix immediately) from **non-blocking issues** (defer to V2).

**Effective Date**: 2026-01-05  
**Freeze Status**: V1 is functionally frozen  
**Authority**: Only blocking defects may result in code changes

---

## Classification Framework

### 🚨 BLOCKING DEFECT (Fix Immediately)

**Definition**: Issue that prevents core functionality or violates contractual accuracy/performance baselines.

**Criteria** (ALL must be true):
1. ✅ Breaks a core user flow (profile creation, story generation, admin access)
2. ✅ OR violates contractual baseline:
   - Name accuracy <92%
   - Age accuracy <88%
   - Needs accuracy <85%
   - Extraction latency >100ms average
   - OpenAI API calls >0
   - System crash or data loss
3. ✅ AND reproducible in V1 stable configuration
4. ✅ AND not caused by invalid input or user error
5. ✅ AND not present in Phase 6 automated test suite (new regression)

**Action**: Immediate fix authorized with minimal scope

**Examples**:
- ✅ Name extraction returns null for valid "My name is John" input
- ✅ Age extraction accuracy drops to 85% on production data
- ✅ System crashes when creating profile
- ✅ OpenAI API call detected in logs (zero-dependency violation)
- ✅ Profile creation latency exceeds 100ms consistently
- ✅ Database fails to save profiles (data loss)

---

### ⚠️ NON-BLOCKING ISSUE (Defer to V2)

**Definition**: Issue that affects quality or user experience but does not break core flow or violate baselines.

**Criteria** (ANY is true):
1. ❌ Does not prevent profile creation/completion
2. ❌ Accuracy/performance within contractual baselines
3. ❌ Affects optional features (not core flow)
4. ❌ Cosmetic or UI/UX improvement
5. ❌ Edge case with workaround available
6. ❌ Enhancement request (not defect)

**Action**: Document in V2 backlog, no immediate fix

**Examples**:
- ⚠️ Name extraction misses "Jr." suffix (accuracy still >92%)
- ⚠️ Age extraction fails for "I'm in my early thirties" (within 88% baseline)
- ⚠️ Needs keyword "unhoused" not recognized (workaround: use "homeless")
- ⚠️ Profile UI layout could be improved
- ⚠️ Admin dashboard chart colors are hard to read
- ⚠️ Extracted name has incorrect capitalization (John SMITH → John Smith)

---

### 🎯 ENHANCEMENT REQUEST (V2 Scope Only)

**Definition**: New feature, optimization, or intelligence improvement not present in V1 design.

**Criteria** (ANY is true):
1. ❌ Requests AI/LLM capability (sentiment, inference, translation)
2. ❌ Requests new extraction field (sentiment, relationships, context)
3. ❌ Requests optimization beyond baseline (>100% accuracy, <1ms latency)
4. ❌ "It would be nice if..." or "Can we also..."
5. ❌ Requests behavior change from V1 design spec

**Action**: Document in V2_AI_ENHANCEMENTS_SCOPE.md, no implementation

**Examples**:
- 🎯 "Can we detect urgency/desperation in voice tone?"
- 🎯 "Extract family relationships automatically"
- 🎯 "Support Spanish language transcripts"
- 🎯 "Rank needs by priority automatically"
- 🎯 "Generate follow-up questions"
- 🎯 "Improve name accuracy to 100% for all edge cases"

---

## Triage Decision Tree

```
Issue Reported
    │
    ├─→ Does it prevent profile creation? ───→ YES ───→ BLOCKING DEFECT 🚨
    │                                      └─→ NO
    │
    ├─→ Does it violate accuracy baseline? ──→ YES ───→ BLOCKING DEFECT 🚨
    │   (Name <92%, Age <88%, Needs <85%)  └─→ NO
    │
    ├─→ Does it violate performance baseline? → YES ───→ BLOCKING DEFECT 🚨
    │   (Latency >100ms, OpenAI calls >0)     └─→ NO
    │
    ├─→ Does it cause data loss or crash? ───→ YES ───→ BLOCKING DEFECT 🚨
    │                                        └─→ NO
    │
    ├─→ Is it a new feature request? ────────→ YES ───→ ENHANCEMENT 🎯
    │                                        └─→ NO
    │
    └─→ NON-BLOCKING ISSUE ⚠️
        (Document, defer to V2)
```

---

## Detailed Classification Examples

### Example 1: Name Extraction Fails for Multi-Part Hispanic Names

**Report**: "Name extraction returns 'Rodriguez' instead of 'Maria Elena Rodriguez' for transcript: 'My name is Maria Elena Rodriguez'"

**Triage**:
- ❓ Does it prevent profile creation? → NO (profile created, name partial)
- ❓ Does it violate accuracy baseline? → **Check production data**
  - If <92% of all names extracted correctly → YES → **BLOCKING DEFECT** 🚨
  - If ≥92% of all names extracted correctly → NO → Non-blocking
- ❓ Is there a workaround? → YES (admin can edit name manually)

**Classification**:
- If name accuracy <92% overall → **BLOCKING DEFECT** 🚨 (baseline violation)
- If name accuracy ≥92% overall → **NON-BLOCKING ISSUE** ⚠️ (edge case, defer to V2)

**Action**:
- **Blocking**: Minimal pattern fix to restore baseline
- **Non-blocking**: Document in V2 backlog as "Improve multi-part name handling"

---

### Example 2: Age Extraction Returns "N/A" for Valid Input

**Report**: "Age extraction fails for transcript: 'I just celebrated my 42nd birthday last week'"

**Triage**:
- ❓ Does it prevent profile creation? → NO (profile created, age field blank)
- ❓ Does it violate accuracy baseline? → **Check production data**
  - If <88% of all ages extracted correctly → YES → **BLOCKING DEFECT** 🚨
  - If ≥88% of all ages extracted correctly → NO → Non-blocking
- ❓ Is pattern in V1 design spec? → NO (this pattern not in rulesEngine.ts)

**Classification**:
- If age accuracy <88% overall → **BLOCKING DEFECT** 🚨 (baseline violation)
- If age accuracy ≥88% overall → **ENHANCEMENT REQUEST** 🎯 (new pattern)

**Action**:
- **Blocking**: Add pattern to restore baseline only if accuracy drops
- **Enhancement**: Document in V2 backlog as "Expand age pattern coverage"

---

### Example 3: System Crashes When Creating Profile

**Report**: "Backend throws uncaught exception and crashes when processing transcript with special characters"

**Triage**:
- ❓ Does it prevent profile creation? → YES
- ❓ Does it cause system crash? → YES
- ❓ Is it reproducible? → YES

**Classification**: **BLOCKING DEFECT** 🚨

**Action**: Immediate fix to handle special characters gracefully (error handling, not feature addition)

---

### Example 4: Request for Sentiment Analysis

**Report**: "Can we detect if someone sounds desperate or urgent?"

**Triage**:
- ❓ Does it prevent profile creation? → NO
- ❓ Is it a new feature request? → YES (sentiment analysis not in V1)
- ❓ Is it AI/LLM capability? → YES

**Classification**: **ENHANCEMENT REQUEST** 🎯

**Action**: Document in V2_AI_ENHANCEMENTS_SCOPE.md under "Sentiment Analysis" (already listed)

---

### Example 5: OpenAI API Call Detected

**Report**: "Admin logs show 1 OpenAI API call during profile creation"

**Triage**:
- ❓ Does it violate zero-OpenAI baseline? → YES
- ❓ Is it reproducible? → YES
- ❓ Is V1_STABLE=true and AI_PROVIDER=rules? → Check configuration

**Classification**: **BLOCKING DEFECT** 🚨 (zero-dependency violation)

**Action**: Immediate investigation and fix to eliminate OpenAI call

---

### Example 6: UI Improvement Request

**Report**: "Admin dashboard charts are hard to read with current color scheme"

**Triage**:
- ❓ Does it prevent core functionality? → NO
- ❓ Is it cosmetic/UX improvement? → YES
- ❓ Does it affect extraction accuracy/performance? → NO

**Classification**: **NON-BLOCKING ISSUE** ⚠️

**Action**: Document in V2 backlog as UI improvement

---

## Baseline Verification Procedure

When an extraction accuracy issue is reported, verify against contractual baselines:

### Step 1: Run Automated Test Suite

```bash
cd backend
npm run test:qa:v1
```

**Expected**: 10/10 tests passing
- Name: 100% (10/10)
- Age: 90% (9/10)
- Needs: 100% (10/10)

**If PASSING**: Issue is likely edge case → Non-blocking
**If FAILING**: Regression detected → Blocking defect

---

### Step 2: Check Production Metrics

Query admin dashboard or database:

```sql
-- Name extraction success rate (last 1000 profiles)
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN name IS NOT NULL AND name != '' THEN 1 END) as extracted,
  ROUND(100.0 * COUNT(CASE WHEN name IS NOT NULL AND name != '' THEN 1 END) / COUNT(*), 2) as accuracy
FROM profiles
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 1000;

-- Expected: accuracy >= 92%
```

**If ≥92%**: Within baseline → Non-blocking  
**If <92%**: Baseline violation → Blocking defect

---

### Step 3: Reproduce in Test Environment

```bash
# Enable test mode
export ENABLE_TEST_MODE=true
export TEST_USE_STUBBED_TRANSCRIPTS=true

# Create profile with reported transcript
curl -X POST http://localhost:8000/api/stories/extract-profile \
  -H "Content-Type: application/json" \
  -d '{"transcript": "<REPORTED_TRANSCRIPT>"}'

# Check extraction_metadata for pattern matching
```

**If reproduces**: Investigate further  
**If cannot reproduce**: Likely invalid input or user error → Non-blocking

---

## Fix Approval Criteria

Before implementing ANY code change:

### ✅ Required Approvals

1. **Classification Confirmed**: Issue triaged as BLOCKING DEFECT by QA lead
2. **Baseline Violation Verified**: Metrics show <92% name, <88% age, or <85% needs accuracy
3. **Minimal Scope Defined**: Fix scope limited to restoring baseline only
4. **No Side Effects**: Fix does not alter other extraction patterns
5. **Test Coverage**: Fix includes automated test to prevent regression

### ❌ Rejection Criteria (Do NOT Fix)

- Non-blocking issue or enhancement request
- Accuracy/performance within baselines
- Requesting new feature or intelligence
- Cosmetic or UX improvement
- No reproducible failure case

---

## Defect Reporting Template

### For QA Team to Report Issues

```markdown
**Issue ID**: V1-DEFECT-001
**Reporter**: [Name]
**Date**: [YYYY-MM-DD]
**Severity**: [BLOCKING / NON-BLOCKING / ENHANCEMENT]

**Summary**: [One-line description]

**Transcript**: 
```
[Exact transcript that caused issue]
```

**Expected Result**:
- Name: [Expected value]
- Age: [Expected value]
- Needs: [Expected values]

**Actual Result**:
- Name: [Actual value]
- Age: [Actual value]
- Needs: [Actual values]

**Reproducibility**: [Always / Sometimes / Once]

**Baseline Impact**:
- Does it prevent profile creation? [YES/NO]
- Does it violate accuracy baseline? [YES/NO]
- Does it violate performance baseline? [YES/NO]

**Environment**:
- V1_STABLE: [true/false]
- AI_PROVIDER: [value]
- Backend logs: [Attach relevant logs]

**Triage**: [To be filled by QA lead]
```

---

## Escalation Protocol

### Level 1: QA Team
- Reproduce issue
- Fill defect report
- Classify using triage decision tree
- Document in issue tracker

### Level 2: QA Lead
- Review classification
- Verify baseline impact
- Approve/reject blocking status
- Escalate to dev team if blocking

### Level 3: Dev Team
- Receive blocking defects only
- Implement minimal fix
- Add regression test
- Update documentation
- Deploy fix to test environment

### Level 4: Stakeholder
- Approve deployment of fixes
- Review non-blocking backlog
- Approve V2 scope additions
- Sign off on production deployment

---

## V1 Freeze Exceptions

The ONLY circumstances that permit V1 code changes:

### Exception 1: Baseline Violation
- Name accuracy drops below 92% on production data
- Age accuracy drops below 88% on production data
- Needs accuracy drops below 85% on production data
- **Fix scope**: Add/modify patterns to restore baseline only

### Exception 2: Zero-Dependency Violation
- OpenAI API call detected in logs
- External AI dependency introduced
- **Fix scope**: Remove dependency, restore rules-based provider

### Exception 3: Critical Failure
- System crash preventing all profile creation
- Data loss or corruption
- Security vulnerability
- **Fix scope**: Minimal error handling or security patch

### Exception 4: Environment Configuration
- Deployment-specific settings (URLs, ports, keys)
- Infrastructure requirements (database, caching)
- **Fix scope**: Configuration only, no logic changes

---

## Non-Blocking Issue Backlog

Document all non-blocking issues for V2 consideration:

### Documentation Format

```markdown
## V2 Backlog: Non-Blocking Issues

### Issue: [Description]
- **Reported**: [Date]
- **Impact**: [Describe effect on UX/quality]
- **Workaround**: [Manual fix or alternative]
- **V2 Category**: [Sentiment Analysis / Multi-Language / Conversational AI / etc.]
- **Priority**: [High / Medium / Low]

**Example**:
### Issue: Name extraction misses "Jr." suffix
- **Reported**: 2026-01-07
- **Impact**: Name shows as "John Smith" instead of "John Smith Jr."
- **Workaround**: Admin can manually edit name field
- **V2 Category**: Enhanced Name Parsing
- **Priority**: Low (accuracy still >92%)
```

---

## Metrics for Manual Testing Phase

Track these metrics during 1-2 week testing period:

### Daily Metrics
- Total profiles created: [count]
- Name extraction accuracy: [%]
- Age extraction accuracy: [%]
- Needs extraction accuracy: [%]
- Average extraction latency: [ms]
- OpenAI API calls: [count] (MUST BE 0)

### Weekly Summary
- Total defects reported: [count]
  - Blocking: [count]
  - Non-blocking: [count]
  - Enhancements: [count]
- Defects fixed: [count]
- Baseline violations: [count] (target: 0)
- Zero-dependency violations: [count] (target: 0)

### Approval Threshold
**V1 approved for production if**:
- ✅ Zero blocking defects unresolved
- ✅ All baselines maintained for 7+ consecutive days
- ✅ Zero OpenAI API calls detected
- ✅ No critical failures or data loss
- ✅ Stakeholder sign-off obtained

---

## Summary: Quick Reference

| Classification | Criteria | Action |
|----------------|----------|--------|
| 🚨 **BLOCKING DEFECT** | Prevents core flow OR violates baseline OR crashes system | **FIX IMMEDIATELY** (minimal scope) |
| ⚠️ **NON-BLOCKING ISSUE** | Affects quality but within baselines, has workaround | **DOCUMENT** → Defer to V2 |
| 🎯 **ENHANCEMENT REQUEST** | New feature, AI capability, optimization beyond baseline | **DOCUMENT** → V2 scope only |

**Golden Rule**: When in doubt, classify as NON-BLOCKING and escalate to QA lead for review.

**V1 Protection**: Functional freeze means V1 code is read-only except for blocking defects that violate contractual baselines.

---

## Contact and Escalation

**QA Lead**: [Contact info]  
**Dev Team**: [Contact info]  
**Product Owner**: [Contact info]  
**Emergency Escalation**: [Contact info for critical failures]

---

**Document Version**: 1.0  
**Effective Date**: 2026-01-05  
**Review Date**: After V1 production deployment  
**Status**: Active during V1 Extended Manual Testing Phase

---

*This rubric protects V1 production freeze while ensuring legitimate defects are addressed promptly. All enhancements belong to V2 scope.*
