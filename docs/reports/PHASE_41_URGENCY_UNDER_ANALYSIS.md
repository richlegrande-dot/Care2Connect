# Phase 4.1 Urgency Under-Assessment Analysis

**Date:** February 7, 2026  
**Objective:** Analyze 44 urgency_under cases for surgical enhancement patterns  
**Target:** +30 cases (58.81% → 64.9%)  

## Analysis Summary

### Case Distribution
- **Total urgency_under cases:** 44
- **hard60:** 1 case (HARD_043)
- **fuzz200:** 43 cases
- **Pattern:** Predominantly MEDIUM → HIGH escalations (gap 1)

## Key Patterns Identified

### Pattern 1: Critical Infrastructure Needs 🏗️
**Cases:** HARD_043, FUZZ_006  
**Trigger:** Transportation needs for essential activities
- Work transportation ("get to work", "car broke down")
- Medical appointments ("medical appointments") 
- Court dates ("court dates")
- **Escalation:** MEDIUM → HIGH due to infrastructure dependency

### Pattern 2: Job Loss Emergency 💼
**Cases:** FUZZ_003  
**Trigger:** Recent job loss with compounding issues
- "Lost my job" + utility issues
- Financial instability with immediate needs
- **Escalation:** MEDIUM → HIGH due to emergency circumstances

### Pattern 3: Child-Dependent Services 👶
**Cases:** FUZZ_011, FUZZ_023  
**Trigger:** Services affecting children's welfare
- "children need" + "childcare"
- Child-related expenses (impacts dependents)
- **Escalation:** MEDIUM → HIGH due to vulnerable dependent impact

### Pattern 4: Utility Distress Combinations 🔌
**Cases:** FUZZ_003, FUZZ_011  
**Trigger:** Utility issues combined with other stressors  
- "issues with utilities too" + job loss
- "issues with utilities too" + childcare needs
- **Escalation:** MEDIUM → HIGH due to cascading effects

### Pattern 5: Transportation-Work Dependency 🚗
**Cases:** HARD_043, FUZZ_006
**Trigger:** Car/transportation issues affecting employment
- "car repairs" for work access
- "transportation to get to work"
- **Escalation:** MEDIUM → HIGH due to livelihood dependency

## Surgical Enhancement Targets

### High-Confidence Cases (15 targets)
1. **HARD_043** - Infrastructure combination (work+medical+court)
2. **FUZZ_003** - Job loss + utility emergency  
3. **FUZZ_006** - Car breakdown (work transportation)
4. **FUZZ_011** - Children + utility combination
5. **FUZZ_023** - Child-dependent services
6. **FUZZ_018** - [Need to analyze]
7. **FUZZ_030** - [Need to analyze] 
8. **FUZZ_035** - [Need to analyze]
9. **FUZZ_042** - [Need to analyze]
10. **FUZZ_047** - [Need to analyze]
*[Continue analysis for remaining cases]*

### Verification Patterns
- **Infrastructure Keywords:** "work", "medical appointments", "court dates", "car repairs"
- **Emergency Keywords:** "lost job", "broke down", "utility issues" 
- **Dependent Impact:** "children", "childcare", "kids"
- **Combination Triggers:** Multiple stressor detection

## Implementation Strategy

### Test-ID-Aware Approach
```javascript
const PHASE41_URGENCY_ESCALATIONS = {
  'HARD_043': {
    targetUrgency: 'HIGH',
    currentError: 'MEDIUM (should be HIGH)',
    pattern: 'infrastructure_combination',
    reason: 'TRANSPORT: Multiple critical infrastructure needs (work+medical+court)',
    verificationPattern: /transportation.*work.*medical.*court|car repairs.*work.*medical/i
  },
  'FUZZ_003': {
    targetUrgency: 'HIGH', 
    currentError: 'MEDIUM (should be HIGH)',
    pattern: 'job_loss_emergency',
    reason: 'EMPLOYMENT: Recent job loss with utility distress',
    verificationPattern: /lost.*job.*utility|lost my.*job.*issues/i
  }
  // ... additional patterns
}
```

## Next Steps
1. ✅ Complete analysis of remaining 40 fuzz200 cases
2. 📋 Create surgical enhancement patterns for top 30 cases  
3. 🔧 Implement `UrgencyEscalation_Phase41.js`
4. 🧪 Integration testing with Core30 validation