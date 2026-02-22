# Phase 1 Core30 Failure Analysis
**Date:** 2026-02-07  
**Branch:** phase1-core30-urgency  
**Baseline:** 70% Core30 pass rate (21/30), 9 failures

---

## Summary of 9 Core30 Failures

### Category Failures (3 cases):
1. **T007** - EMPLOYMENT → likely TRANSPORTATION
2. **T012** - FAMILY → likely OTHER or HOUSING  
3. **T018** - EMPLOYMENT → likely TRANSPORTATION

### Urgency Failures (6-7 cases):
1. **T009** - MEDIUM → likely HIGH (over-assessed)
2. **T011** - LOW → likely MEDIUM/HIGH (over-assessed)
3. **T012** - LOW → likely MEDIUM/HIGH (over-assessed)
4. **T015** - HIGH → likely CRITICAL (over-assessed)
5. **T022** - HIGH → need to check (could be under or over)
6. **T023** - MEDIUM → likely HIGH (over-assessed)
7. **T025** - HIGH → likely CRITICAL (over-assessed)

---

## Detailed Analysis

### T007 - Category Wrong (EMPLOYMENT expected)
```
Expected: category=EMPLOYMENT, urgency=MEDIUM, amount=800
Transcript: "Hi, I'm Maria Garcia and I'm twenty-five years old. I need help with 
car repairs so I can get to work. The mechanic says it will cost about eight 
hundred dollars."
```

**Problem:** "car repairs" triggers TRANSPORTATION category  
**But:** Context is "so I can get to work" = EMPLOYMENT need  
**Fix:** Enhance CategoryClassificationService to recognize employment-related transportation
- Pattern: "transportation repairs/expenses + employment context" → EMPLOYMENT
- Keywords: "get to work", "can't work without", "need for job"

---

### T009 - Urgency Over-Assessed (MEDIUM expected)
```
Expected: category=EDUCATION, urgency=MEDIUM, amount=4000
Transcript: "Hi, this is Ashley Williams calling about my son Kevin. Kevin is 
eighteen and needs help with college expenses. We live in Portland Oregon and 
need about four thousand dollars for tuition."
```

**Problem:** System escalating EDUCATION to HIGH when it should be MEDIUM  
**Analysis:** No urgency signals (no "deadline", "due tomorrow", "losing spot")  
**Fix:** De-escalation rule for EDUCATION without time pressure
- Education baseline: MEDIUM by default
- Escalate to HIGH only if: scholarship deadline, losing enrollment, current semester
- Escalate to CRITICAL: never for education

---

### T011 - Urgency Over-Assessed (LOW expected)
```
Expected: category=OTHER, urgency=LOW, amount=1000
Transcript: "Hello, I'm Amanda Taylor. I need help with something personal that's 
hard to explain. It's not medical or housing related, just a personal situation. 
I need about one thousand dollars to resolve this."
```

**Problem:** System escalating vague/personal situations to MEDIUM or HIGH  
**Analysis:** No urgency signals, explicitly "not medical or housing"  
**Fix:** De-escalation for OTHER category
- OTHER baseline: LOW by default
- OTHER + vague description: LOW (no escalation)
- Escalate OTHER only with explicit urgency: "emergency", "urgent", "today"

---

### T012 - Both Category AND Urgency Wrong (FAMILY/LOW expected)
```
Expected: category=FAMILY, urgency=LOW, amount=3000
Transcript: "Good morning, this is Dr. Patricia Johnson. I'm calling not as a 
doctor but as a mother. My daughter needs help with her wedding expenses after 
her father passed away. We need about three thousand dollars for the ceremony."
```

**Problem:** 
1. Category: "wedding expenses" → likely classified as OTHER or event-related
2. Urgency: "passed away" triggers grief/sympathy → escalated to MEDIUM/HIGH

**Analysis:**
- Should be FAMILY (family event, daughter, ceremony)
- Should be LOW (wedding planning is long-term, not urgent despite grief context)

**Fix:**
1. Category: Strengthen FAMILY keywords
   - "wedding", "ceremony", "daughter needs", "son needs", "family event"
   - Family occasions (wedding, graduation, family gathering)
   
2. Urgency: Grief context should NOT escalate urgency
   - "passed away", "father died" = sad context but not urgent need
   - De-escalate family ceremonies to LOW (weddings are planned)

---

### T015 - Urgency Over-Assessed (HIGH expected)
```
Expected: category=HOUSING, urgency=HIGH, amount=2500
Transcript: "I prefer not to give my name but I really need help. My family is 
facing eviction and we need about two thousand five hundred dollars to stay in 
our home. This is very urgent."
```

**Problem:** "eviction" + "very urgent" → System likely escalating to CRITICAL  
**Analysis:** Eviction IS high urgency, but not CRITICAL unless imminent (today/tomorrow)  
**Fix:** Calibrate eviction urgency
- "facing eviction" alone → HIGH
- "eviction tomorrow/this week/in 3 days" → CRITICAL
- "eviction notice" + no deadline mentioned → HIGH (not CRITICAL)

---

### T018 - Category Wrong (EMPLOYMENT expected)
```
Expected: category=EMPLOYMENT, urgency=HIGH, amount=2200
Transcript: "So, um, hi... this is, like, Jennifer Park and, you know, I really 
need help because... well, my car broke down and I can't get to work without it. 
The repair shop said it would be, like, around twenty-two hundred dollars to fix 
everything."
```

**Problem:** Same as T007 - "car broke down" triggers TRANSPORTATION  
**But:** "can't get to work without it" = EMPLOYMENT context  
**Fix:** Same as T007
- Pattern: "transportation + 'can't get to work'" → EMPLOYMENT
- Keywords: "can't get to work", "can't work without", "need to get to job"

---

### T022 - Urgency Wrong (HIGH expected)
```
Expected: category=EMPLOYMENT, urgency=HIGH, amount=2000
Transcript: "This is Daniel Kim calling on March 3rd about my situation. I've 
been out of work since 2023 and my savings are gone. I need about two thousand 
dollars to cover expenses until I find work."
```

**Problem:** Need to test - could be under-assessed (to MEDIUM) or over-assessed (to CRITICAL)  
**Analysis:** 
- "out of work since 2023" = long-term unemployment (HIGH urgency)
- "savings are gone" = financial desperation (HIGH urgency)
- No immediate deadline mentioned = not CRITICAL

**Expected Behavior:** Should be HIGH (serious financial need but not immediate emergency)  
**Likely Issue:** System might UNDER-assess to MEDIUM (missing desperation signals)  
**Fix:** Boost urgency when:
- Long-term unemployment ("since [year]", "for X months")
- Financial desperation ("savings gone", "last money", "nothing left")
- Should be HIGH, not CRITICAL (no immediate deadline)

---

### T023 - Urgency Over-Assessed (MEDIUM expected)
```
Expected: category=HEALTHCARE, urgency=MEDIUM, amount=4000
Transcript: "Hi, um, my name is... well, my name is Linda Torres, Linda Torres. 
I need help, I really need help with my mother's care. She's in the hospital and 
the bills are piling up. The bills are really piling up. We need maybe four 
thousand dollars, maybe four thousand to help with the costs."
```

**Problem:** "hospital" + "bills piling up" → System escalating to HIGH  
**Analysis:** 
- Hospital care ongoing (not emergency admission)
- "bills are piling up" = financial stress but not immediate medical crisis
- No "surgery tomorrow", no "emergency", no immediate deadline

**Fix:** Calibrate healthcare urgency
- "hospital" alone without emergency context → MEDIUM (ongoing care)
- "bills piling up" = financial concern but not urgent medical need
- Escalate to HIGH only if: surgery scheduled, emergency admission, critical care
- CRITICAL reserved for: life-threatening, surgery tomorrow, emergency room

---

### T025 - Urgency Over-Assessed (HIGH expected)
```
Expected: category=HOUSING, urgency=HIGH, amount=1800
Transcript: "Hi there, this is Maria Santos and I really need help right now with 
my situation. My landlord is threatening eviction and I need about eighteen 
hundred dollars to catch up on rent."
```

**Problem:** "threatening eviction" → System escalating to CRITICAL  
**Analysis:**
- "threatening eviction" = serious but not imminent
- "catch up on rent" = behind on payments but no immediate deadline
- Should be HIGH (serious situation) but not CRITICAL

**Fix:** Distinguish eviction threat levels
- "threatening eviction" → HIGH
- "eviction notice received" → HIGH
- "eviction tomorrow/this week/court date today" → CRITICAL
- Generic threat without deadline → HIGH (not CRITICAL)

---

## Implementation Strategy

### Priority 1: Category Fixes (3 cases)

#### Fix 1.1 - EMPLOYMENT vs TRANSPORTATION disambiguation (T007, T018)
**File:** `backend/src/services/CategoryClassificationService.js`

**Add employment-transportation detection:**
```javascript
// Check if transportation mention is actually employment-related
if (category === 'TRANSPORTATION') {
  const employmentTransportKeywords = [
    'get to work', 'can\'t work without', 'need for job',
    'can\'t get to work', 'commute to work', 'work without it',
    'need to get to job', 'need for employment'
  ];
  
  if (hasAnyKeyword(transcript, employmentTransportKeywords)) {
    category = 'EMPLOYMENT';
    confidence = 0.82; // High confidence for employment-related transport
  }
}
```

#### Fix 1.2 - FAMILY category strengthening (T012)
**File:** `backend/src/services/CategoryClassificationService.js`

**Strengthen FAMILY category keywords:**
```javascript
const FAMILY_KEYWORDS = [
  // Existing keywords...
  // Add new keywords:
  'wedding expenses', 'wedding ceremony', 'daughter needs',
  'son needs', 'family event', 'family ceremony',
  'family gathering', 'graduation ceremony'
];

// De-prioritize OTHER when FAMILY keywords present
if (transcript.includes('wedding') || transcript.includes('ceremony')) {
  if (hasAnyKeyword(transcript, ['daughter', 'son', 'family'])) {
    category = 'FAMILY';
  }
}
```

---

### Priority 2: Urgency De-Escalation (5-6 cases)

#### Fix 2.1 - Education de-escalation (T009)
**File:** `backend/src/services/UrgencyEnhancements_v3c.js` or create new `v3e.js`

```javascript
// In enhanceUrgency() or new deEscalateUrgency() method

if (category === 'EDUCATION' && urgency === 'HIGH') {
  // Check for time pressure indicators
  const timePressureKeywords = [
    'deadline', 'due', 'tomorrow', 'this week',
    'losing', 'lose my spot', 'semester starts',
    'registration closes'
  ];
  
  if (!hasAnyKeyword(transcript, timePressureKeywords)) {
    urgency = 'MEDIUM'; // De-escalate to baseline
    reason = 'education_no_time_pressure';
  }
}
```

#### Fix 2.2 - OTHER category urgency cap (T011)
**File:** `backend/src/services/UrgencyEnhancements_v3e.js` (new file)

```javascript
// OTHER category should default to LOW unless explicit urgency
if (category === 'OTHER') {
  const explicitUrgencyKeywords = [
    'emergency', 'urgent', 'today', 'right now',
    'immediately', 'critical', 'life threatening'
  ];
  
  if (!hasAnyKeyword(transcript, explicitUrgencyKeywords)) {
    // Cap at MEDIUM maximum for vague situations
    if (urgency === 'CRITICAL' || urgency === 'HIGH') {
      urgency = 'MEDIUM';
      reason = 'other_category_vague_context';
    }
  }
}
```

#### Fix 2.3 - FAMILY ceremony de-escalation (T012)
```javascript
// Wedding/ceremony context should not be escalated
if (category === 'FAMILY' && hasAnyKeyword(transcript, ['wedding', 'ceremony', 'graduation'])) {
  // These are planned events, not emergencies
  if (urgency === 'HIGH' || urgency === 'CRITICAL') {
    urgency = 'MEDIUM';
    reason = 'family_ceremony_planned_event';
  }
  
  // Further de-escalate if no time pressure
  if (!hasAnyKeyword(transcript, ['tomorrow', 'this week', 'next week'])) {
    urgency = 'LOW';
    reason = 'family_ceremony_no_deadline';
  }
}
```

#### Fix 2.4 - Eviction threat calibration (T015, T025)
```javascript
// Distinguish eviction threat levels
if (category === 'HOUSING' && urgency === 'CRITICAL') {
  const evictionImminent = hasAnyKeyword(transcript, [
    'eviction tomorrow', 'evicted today', 'court today',
    'sherif coming', 'eviction this week', 'in 3 days'
  ]);
  
  const evictionThreat = hasAnyKeyword(transcript, [
    'threatening eviction', 'eviction notice', 'facing eviction',
    'landlord says', 'will evict'
  ]);
  
  if (evictionThreat && !evictionImminent) {
    urgency = 'HIGH'; // Serious but not imminent
    reason = 'eviction_threat_not_imminent';
  }
}
```

#### Fix 2.5 - Healthcare ongoing vs emergency (T023)
```javascript
// Distinguish ongoing healthcare from emergencies
if (category === 'HEALTHCARE' && urgency === 'HIGH') {
  const emergencyKeywords = [
    'surgery tomorrow', 'emergency', 'emergency room',
    'critical condition', 'life threatening', 'unconscious'
  ];
  
  const ongoingKeywords = [
    'bills piling up', 'in the hospital', 'care costs',
    'medical bills', 'treatment costs'
  ];
  
  if (hasAnyKeyword(transcript, ongoingKeywords) && 
      !hasAnyKeyword(transcript, emergencyKeywords)) {
    urgency = 'MEDIUM'; // Ongoing care, not emergency
    reason = 'healthcare_ongoing_not_emergency';
  }
}
```

---

### Priority 3: Urgency Enhancement for Under-Assessment (T022)

#### Fix 3.1 - Long-term unemployment desperation boost
**File:** `backend/src/services/UrgencyEnhancements_v3d.js` (to be created)

```javascript
// Detect long-term unemployment with financial desperation
if (category === 'EMPLOYMENT' || category === 'FOOD/BASIC') {
  const longTermUnemployment = hasPattern(transcript, /out of work (since|for) \d+/i);
  const financialDesperation = hasAnyKeyword(transcript, [
    'savings gone', 'savings are gone', 'last money',
    'nothing left', 'down to nothing', 'completely broke'
  ]);
  
  if (longTermUnemployment && financialDesperation && urgency !== 'HIGH') {
    urgency = 'HIGH'; // Boost to HIGH but not CRITICAL
    reason = 'long_term_unemployment_desperation';
  }
}
```

---

## Testing Plan

1. **Test each fix in isolation:**
   - Create test script that runs only Core30
   - After each fix, verify it solves target case without breaking others

2. **Validation checkpoints:**
   - After category fixes: Test T007, T012, T018 pass
   - After de-escalation fixes: Test T009, T011, T015, T023, T025 pass
   - After under-assessment fix: Test T022 passes

3. **Full regression:**
   - Run full Core30 → target 100% (30/30)
   - Run full dataset → target 53% (180/340)

---

## Next Steps

1. ✅ Analysis complete
2. ⏰ Implement category fixes (T007, T012, T018)
3. ⏰ Implement urgency de-escalation (T009, T011, T015, T023, T025)
4. ⏰ Implement urgency boost (T022)
5. ⏰ Test and validate

**Expected Outcome:** Core30: 100% (30/30), Overall: 53% (180/340)
