/**
 * Phase 3: Urgency Under-Assessment Fix (v3c Enhancement)
 *
 * PURPOSE: Fix urgency_under_assessed cases (147 cases, 24.9%) to achieve 50%+ target
 * TARGET: Convert 30-40 under-assessed cases to correct urgency → 282-292/590 (47.8-49.5%)
 *
 * PROBLEM ANALYSIS:
 * - urgency_under_assessed: 147 cases where urgency level is too low
 * - Common patterns: CRITICAL→HIGH, HIGH→MEDIUM, MEDIUM→LOW misclassifications
 * - Key indicators: Emergency situations, time pressure, life-critical needs
 *
 * APPROACH: Contextual urgency boosting with situation-aware detection
 * - Emergency keywords and phrases detection
 * - Time pressure indicators (deadlines, immediate needs)
 * - Life-critical situations (medical emergencies, homelessness, safety)
 * - Financial crisis indicators (eviction, shutoff notices)
 *
 * INTEGRATION: Works alongside v3b (Core30 protection) + v2c (category fixes)
 * SAFETY: Conservative boosts with confidence thresholds
 */

// Emergency/Critical Situation Detection Patterns - COMPREHENSIVE Phase 3 patterns
const URGENCY_BOOST_PATTERNS = {
  // CRITICAL level indicators - life-threatening, immediate danger
  CRITICAL_INDICATORS: [
    // Medical emergencies
    /\b(emergency|urgent|critical|life.?threatening|dying|death)\b/i,
    /\b(surgery|operation|hospital|ambulance|doctor|medical.emergency)\b/i,
    /\b(heart.attack|stroke|accident|injury|bleeding|pain)\b/i,

    // Housing/Safety emergencies
    /\b(evict(ed|ion)|homeless|kicked.out|nowhere.to.go)\b/i,
    /\b(fire|flood|disaster|emergency.shelter|domestic.violence)\b/i,
    /\b(utilities?.?(shut.?off|disconnect|cut.?off)|no.(power|heat|water))\b/i,

    // Time pressure - immediate deadlines
    /\b(today|tomorrow|this.week|by.friday|deadline|immediate)\b/i,
    /\b(right.away|asap|as.soon.as.possible|urgent|can.t.wait)\b/i,

    // General crisis indicators - EXPANDED for Phase 3
    /\b(crisis|desperate|can.t.afford|running.out|emergency)\b/i,
    /\b(shutoff.notice|final.notice|last.chance|no.choice)\b/i,
  ],

  // HIGH level indicators - serious situations requiring prompt attention
  HIGH_INDICATORS: [
    // Job/income loss with dependents
    /\b(lost.(job|work)|unemployed|laid.off).*(kids?|children|family)\b/i,
    /\b(single.(mom|mother|dad|father|parent)).*(work|job|money)\b/i,

    // Medical needs with urgency
    /\b(medication|prescription|therapy|treatment).*(need|urgent|help)\b/i,
    /\b(medical.bills|hospital.bills|doctor.bills)\b/i,

    // Housing with time pressure
    /\b(rent|mortgage|eviction).*(behind|late|overdue|notice)\b/i,
    /\b(thirty.days?|60.days?|notice).*(evict|move|out)\b/i,

    // Transportation for work/medical
    /\b(car.*(broke|repair|work)|transport.*(work|job|medical))\b/i,

    // General high urgency - EXPANDED for Phase 3
    /\b(help|need|assistance).*(urgent|asap|soon|quick)\b/i,
    /\b(behind.*(rent|bills|mortgage)|overdue|late.payment)\b/i,
    /\b(weeks?|days?).*(evict|shutoff|due|deadline)\b/i,
  ],

  // MEDIUM level indicators - important but less time-sensitive
  MEDIUM_INDICATORS: [
    // Education/training with deadlines
    /\b(school|college|education|training).*(semester|deadline|start)\b/i,
    /\b(tuition|fees).*(due|semester|year)\b/i,

    // Ongoing financial strain
    /\b(bills?.?(pile|piling|stack)|debt|financial.strain)\b/i,
    /\b(struggle|struggling).*(month|pay|afford)\b/i,

    // General stress indicators - EXPANDED for Phase 3
    /\b(stress|worry|anxious|scared|don.t.know.what.to.do)\b/i,
    /\b(help|need|assistance).*(please|really|desperately)\b/i,
    /\b(month|week).*(bills?|expenses?|payments?)\b/i,
  ],
};

// Contextual boost scoring based on situation severity
const URGENCY_CONTEXT_SCORES = {
  // Emergency keywords add significant boost
  EMERGENCY_BOOST: 0.25, // "emergency", "critical", "urgent"
  DEADLINE_BOOST: 0.2, // "today", "tomorrow", "deadline"
  LIFE_CRITICAL_BOOST: 0.3, // "surgery", "eviction", "homeless"
  FAMILY_BOOST: 0.15, // "children", "kids", "family" with crisis
  MEDICAL_BOOST: 0.2, // Medical situations
  FINANCIAL_CRISIS_BOOST: 0.15, // Shutoff notices, evictions
};

// Exclusion patterns - prevent over-boosting in these scenarios
const BOOST_EXCLUSION_PATTERNS = {
  INFORMATIONAL: [
    /\b(information|info|how.*(do|can)|what.*(is|are)|where.*(can|do))\b/i,
    /\b(wondering|curious|looking.into|researching|just.checking)\b/i,
  ],
  FUTURE_PLANNING: [
    /\b(planning|future|next.*(month|year)|upcoming|eventually)\b/i,
    /\b(will.need|going.to.need|might.need|may.need|if.i.need)\b/i,
  ],
  NON_URGENT_ROUTINE: [
    /\b(regular|routine|usual|normal|typical|just.wanted.to.ask)\b/i,
    /\b(monthly|weekly|recurring|ongoing|quick.question)\b/i,
  ],
};

// Confidence thresholds for apply boosts - CONSERVATIVE Phase 3 settings to prevent overcorrection
const BOOST_CONFIDENCE_THRESHOLDS = {
  CRITICAL_BOOST: 0.4, // Much more conservative for true emergencies only
  HIGH_BOOST: 0.35, // Raised significantly to reduce false positives
  MEDIUM_BOOST: 0.3, // Higher threshold for selective application
};

/**
 * Calculate urgency boost based on contextual analysis
 * @param {string} transcript - Call transcript text
 * @param {string} baseCategory - Base category classification
 * @param {number} baseScore - Original urgency score
 * @returns {object} - { boost, confidence, reasons }
 */
function calculateUrgencyBoost(transcript, baseCategory, baseScore) {
  const text = transcript.toLowerCase();
  let totalBoost = 0;
  let confidence = 0;
  const reasons = [];

  // Check exclusion patterns first - prevent over-boosting
  for (const patternGroup of Object.values(BOOST_EXCLUSION_PATTERNS)) {
    for (const pattern of patternGroup) {
      if (pattern.test(text)) {
        return {
          boost: 0,
          confidence: 0,
          reasons: ["Excluded: Informational/routine request detected"],
          criticalMatches: 0,
          highMatches: 0,
          mediumMatches: 0,
        };
      }
    }
  }

  // Check for CRITICAL level indicators
  let criticalMatches = 0;
  for (const pattern of URGENCY_BOOST_PATTERNS.CRITICAL_INDICATORS) {
    if (pattern.test(text)) {
      criticalMatches++;
      totalBoost += URGENCY_CONTEXT_SCORES.LIFE_CRITICAL_BOOST;
      confidence += 0.15;

      const match = text.match(pattern);
      if (match) {
        reasons.push(`Critical indicator: ${match[0]}`);
      }
    }
  }

  // Check for HIGH level indicators
  let highMatches = 0;
  for (const pattern of URGENCY_BOOST_PATTERNS.HIGH_INDICATORS) {
    if (pattern.test(text)) {
      highMatches++;
      totalBoost += URGENCY_CONTEXT_SCORES.MEDICAL_BOOST;
      confidence += 0.1;

      const match = text.match(pattern);
      if (match) {
        reasons.push(`High urgency indicator: ${match[0]}`);
      }
    }
  }

  // Check for MEDIUM level indicators
  let mediumMatches = 0;
  for (const pattern of URGENCY_BOOST_PATTERNS.MEDIUM_INDICATORS) {
    if (pattern.test(text)) {
      mediumMatches++;
      totalBoost += URGENCY_CONTEXT_SCORES.FINANCIAL_CRISIS_BOOST;
      confidence += 0.08;

      const match = text.match(pattern);
      if (match) {
        reasons.push(`Medium urgency indicator: ${match[0]}`);
      }
    }
  }

  // Emergency keywords get extra boost - BUT ONLY if no other boosts applied (prevent stacking)
  if (
    totalBoost === 0 &&
    /\b(emergency|urgent|critical|asap|immediate)\b/i.test(text)
  ) {
    totalBoost += URGENCY_CONTEXT_SCORES.EMERGENCY_BOOST;
    confidence += 0.2;
    reasons.push("Emergency language detected");
  }

  // CONSERVATIVE Phase 3: Only apply ONE additional boost to prevent overcorrection
  if (totalBoost === 0) {
    // Basic urgency words (specific crisis indicators)
    if (
      /\b(desperate|crisis|emergency|can.t.afford.*(rent|medicine|food)|evict|shutoff)\b/i.test(
        text,
      )
    ) {
      totalBoost += URGENCY_CONTEXT_SCORES.FINANCIAL_CRISIS_BOOST;
      confidence += 0.15;
      reasons.push("Crisis situation detected");
    }
    // Time pressure indicators (urgent deadlines) - only if no crisis detected
    else if (
      /\b(today|tomorrow|this.week|by.*(friday|monday|end.of|deadline)|asap|right.away|immediately)\b/i.test(
        text,
      )
    ) {
      totalBoost += URGENCY_CONTEXT_SCORES.DEADLINE_BOOST;
      confidence += 0.18;
      reasons.push("Urgent deadline detected");
    }
    // Financial crisis (specific threat indicators) - only if no other boosts
    else if (
      /\b(eviction.notice|shutoff.notice|disconnect.notice|final.notice|behind.*months|overdue.*payment|foreclosure)\b/i.test(
        text,
      )
    ) {
      totalBoost += URGENCY_CONTEXT_SCORES.FINANCIAL_CRISIS_BOOST;
      confidence += 0.15;
      reasons.push("Financial crisis situation");
    }
  }

  // Family/children in crisis - only apply if no other boosts to prevent stacking
  if (
    totalBoost === 0 &&
    /\b(kids?|children|family|son|daughter)\b/i.test(text) &&
    /\b(help|need|crisis|problem|trouble)\b/i.test(text)
  ) {
    totalBoost += URGENCY_CONTEXT_SCORES.FAMILY_BOOST;
    confidence += 0.12;
    reasons.push("Family/children in crisis");
  }

  // Medical category - only if no other boosts to prevent overcorrection
  if (
    totalBoost === 0 &&
    baseCategory === "HEALTHCARE" &&
    /\b(surgery|hospital|doctor|medication)\b/i.test(text)
  ) {
    totalBoost += URGENCY_CONTEXT_SCORES.MEDICAL_BOOST;
    confidence += 0.15;
    reasons.push("Medical situation urgency");
  }

  // Normalize confidence (cap at 0.95)
  confidence = Math.min(confidence, 0.95);

  // CONSERVATIVE: Cap total boost to prevent over-correction (reduced from 0.40)
  totalBoost = Math.min(totalBoost, 0.25);

  return {
    boost: totalBoost,
    confidence,
    reasons,
    criticalMatches,
    highMatches,
    mediumMatches,
  };
}

/**
 * Apply urgency boost enhancement to base urgency assessment
 * @param {string} transcript - Call transcript
 * @param {object} baseResult - Original urgency result {level, score, category}
 * @returns {object} - Enhanced urgency result
 */
function enhancedUrgencyAssessment(transcript, baseResult) {
  try {
    // Get urgency boost analysis
    const boostAnalysis = calculateUrgencyBoost(
      transcript,
      baseResult.category,
      baseResult.score,
    );

    // Only apply boost if confidence meets threshold
    let enhancedScore = baseResult.score;
    let enhancedLevel = baseResult.level;
    let applied = false;

    if (boostAnalysis.confidence >= BOOST_CONFIDENCE_THRESHOLDS.MEDIUM_BOOST) {
      enhancedScore = Math.min(baseResult.score + boostAnalysis.boost, 0.95);

      // Recalculate urgency level based on enhanced score
      if (enhancedScore >= 0.8) {
        enhancedLevel = "CRITICAL";
      } else if (enhancedScore >= 0.5) {
        enhancedLevel = "HIGH";
      } else if (enhancedScore >= 0.2) {
        enhancedLevel = "MEDIUM";
      } else {
        enhancedLevel = "LOW";
      }

      applied = enhancedLevel !== baseResult.level;
    }

    return {
      level: enhancedLevel,
      score: enhancedScore,
      category: baseResult.category,
      confidence: boostAnalysis.confidence,
      reasons: boostAnalysis.reasons,
      enhanced: applied,
      originalLevel: baseResult.level,
      originalScore: baseResult.score,
      boost: boostAnalysis.boost,
    };
  } catch (error) {
    console.error("Phase 3 urgency enhancement error:", error);
    return baseResult; // Return original if error
  }
}

/**
 * API compatibility function for integration with evaluation pipeline
 * @param {string} transcript - Call transcript
 * @param {object} baseResult - Base urgency assessment result
 * @returns {object} - Enhanced result with urgency boost applied
 */
function enhanceUrgency(transcript, baseResult) {
  try {
    const enhanced = enhancedUrgencyAssessment(transcript, baseResult);

    if (enhanced.enhanced && enhanced.level !== baseResult.level) {
      console.log(
        `🚀 V3c Urgency Enhancement: ${baseResult.level} → ${enhanced.level} (score: ${baseResult.score.toFixed(2)} → ${enhanced.score.toFixed(2)})`,
      );
      console.log(`   Reasons: ${enhanced.reasons.slice(0, 2).join(", ")}`);
    } else {
      console.log(
        `📋 V3c Enhancement: No urgency change from ${baseResult.level}`,
      );
    }

    return {
      level: enhanced.level,
      score: enhanced.score,
      confidence: enhanced.confidence,
      reasons: enhanced.reasons,
      enhanced: enhanced.enhanced,
    };
  } catch (error) {
    console.error("V3c enhancement API error:", error);
    return {
      level: baseResult.level,
      score: baseResult.score,
      confidence: 0.5,
      reasons: ["Enhancement error - using base result"],
      enhanced: false,
    };
  }
}

module.exports = {
  enhancedUrgencyAssessment,
  calculateUrgencyBoost,
  enhanceUrgency, // API compatibility function
  URGENCY_BOOST_PATTERNS,
  URGENCY_CONTEXT_SCORES,
  BOOST_CONFIDENCE_THRESHOLDS,
};
