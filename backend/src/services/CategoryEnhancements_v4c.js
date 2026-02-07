/**
 * CategoryEnhancements_v4c.js
 * 
 * Phase 4: Category Enhancement System
 * Target: 65 category_wrong cases (19.1%) - largest failure bucket
 * 
 * Conservative approach learned from v3c success:
 * - High confidence thresholds (0.35+)
 * - Selective pattern matching
 * - Prevent overcorrection with exclusion patterns
 */

// Category context patterns for enhancement
const CATEGORY_CONTEXT_PATTERNS = {
  
  FAMILY: [
    // Family relationships with needs - MUST be PRIMARY need, not just context
    /\b(daughter|son|child|children|kids?)\b.*\b(wedding|college|tuition|school.*supplies|daycare|childcare)\b/i,
    /\b(my\s+)(daughter|son|child|children|kids?)\b.*\b(need|help).*\b(wedding|college|school|care)\b/i,
    /\b(calling.*as.*mother|as.*parent|for.*my.*family)\b.*\b(wedding|family.*event)\b/i,
    // Wedding/family events
    /\b(wedding|marriage.*ceremony|family.*celebration)\b.*\b(need|help|expenses)\b/i,
    // Childcare as primary need
    /\b(childcare|child.*care|babysitting|daycare)\b.*\b(need|help|pay|afford)\b/i
  ],

  HEALTHCARE: [
    // Medical needs (but not titles)
    /\b(medication|medicine|medical.*bills?|hospital.*bills?|surgery|treatment|therapy)\b/i,
    /\b(doctor.*bills?|medical.*expenses|prescription|health.*costs)\b/i,
    /\b(need.*for.*(medication|medicine|treatment|surgery))\b/i,
    // Health conditions
    /\b(diagnosed|illness|sick|health.*condition|medical.*condition)\b/i
  ],

  TRANSPORTATION: [
    // Vehicle needs
    /\b(car.*repair|vehicle.*repair|auto.*repair|truck.*repair)\b/i,
    /\b(car.*(broke|broken|fix|need|repairs?)|emergency.*car)\b/i,
    /\b(transportation|bus.*pass|gas.*money|fuel.*costs)\b/i,
    /\b(get.*to.*work|commute|travel.*expense)\b/i,
    // Specific: emergency car repairs
    /\b(emergency.*car.*repair|car.*repair.*emergency)\b/i
  ],

  EMPLOYMENT: [
    // Job-related needs (not just income mention)
    /\b(lost.*job|unemployed|job.*training|work.*clothes|tools.*for.*work)\b/i,
    /\b(interview.*clothes|work.*equipment|license.*for.*work)\b/i,
    /\b(need.*job|looking.*work|employment.*help)\b/i
  ]
};

// Exclusion patterns to prevent false matches
const CATEGORY_EXCLUSION_PATTERNS = {
  
  MEDICAL_TITLE_FALSE_POSITIVES: [
    // People with medical titles talking about non-medical needs
    /\b(dr\.|doctor|nurse|medic)\b.*\b(not.*as.*(doctor|nurse)|calling.*as.*(mother|father|parent))\b/i,
    /\b(dr\.|doctor)\b.*\b(but.*as|calling.*as|speaking.*as)\b.*\b(mother|father|parent|myself)\b/i
  ],

  INCOME_CONTEXT_DISTRACTORS: [
    // Income mentioned but real need is something else  - ONLY block if very generic
    // NOTE: These patterns should be very conservative to avoid blocking legitimate corrections
  ]
  
  // NOTE: Removed EMERGENCY_KEYWORD_CAUTION - we want v4c to actively correct these cases
};

// Enhancement scoring weights
const CATEGORY_BOOST_SCORES = {
  STRONG_CONTEXT: 0.30,      // Clear category context
  MODERATE_CONTEXT: 0.20,    // Some category context
  EXCLUSION_PENALTY: -0.40   // Strong exclusion match
};

// Conservative confidence thresholds (learned from v3c success)
const CATEGORY_CONFIDENCE_THRESHOLDS = {
  HIGH_CONFIDENCE: 0.40,     // Apply enhancement
  MODERATE_CONFIDENCE: 0.35, // Consider enhancement
  LOW_CONFIDENCE: 0.30       // Skip enhancement
};

/**
 * Calculate category enhancement based on contextual analysis
 * @param {string} transcript - Call transcript text
 * @param {string} baseCategory - Base category classification
 * @param {number} baseConfidence - Original category confidence
 * @returns {object} - { suggestedCategory, confidence, reasons }
 */
function calculateCategoryEnhancement(transcript, baseCategory, baseConfidence = 0.5) {
  const text = transcript.toLowerCase();
  let enhancementResults = [];

  // Check exclusion patterns first (prevent false enhancements)
  for (const [exclusionType, patterns] of Object.entries(CATEGORY_EXCLUSION_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        // Strong match on exclusion - don't enhance
        return {
          suggestedCategory: baseCategory,
          confidence: baseConfidence,
          reasons: [`Exclusion matched: ${exclusionType}`],
          enhancementApplied: false
        };
      }
    }
  }

  // Analyze each category for context matches
  for (const [category, patterns] of Object.entries(CATEGORY_CONTEXT_PATTERNS)) {
    let categoryScore = 0;
    let matchCount = 0;
    let matchReasons = [];

    for (const pattern of patterns) {
      if (pattern.test(text)) {
        matchCount++;
        categoryScore += CATEGORY_BOOST_SCORES.STRONG_CONTEXT;
        
        const match = text.match(pattern);
        if (match) {
          matchReasons.push(`${category} context: ${match[0]}`);
        }
      }
    }

    if (matchCount > 0) {
      enhancementResults.push({
        category,
        score: categoryScore,
        matchCount,
        reasons: matchReasons,
        confidence: Math.min(baseConfidence + categoryScore, 0.95)
      });
    }
  }

  // No enhancements found
  if (enhancementResults.length === 0) {
    return {
      suggestedCategory: baseCategory,
      confidence: baseConfidence,
      reasons: ['No category enhancement patterns matched'],
      enhancementApplied: false
    };
  }

  // Find highest scoring enhancement
  const bestEnhancement = enhancementResults.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );

  // Apply conservative threshold check
  if (bestEnhancement.confidence < CATEGORY_CONFIDENCE_THRESHOLDS.MODERATE_CONFIDENCE) {
    return {
      suggestedCategory: baseCategory,
      confidence: baseConfidence,
      reasons: ['Enhancement confidence below threshold'],
      enhancementApplied: false
    };
  }

  // Only suggest change if significantly better than base OR if correcting a known v2c mistake
  const improvementThreshold = 0.10; // Lowered from 0.15 for better correction
  const isLikelyV2cMistake = 
    (baseCategory === 'EMERGENCY' && bestEnhancement.category === 'TRANSPORTATION') ||
    (baseCategory === 'EMPLOYMENT' && bestEnhancement.category === 'HEALTHCARE') ||
    (baseCategory === 'EMERGENCY' && bestEnhancement.category === 'HEALTHCARE');
    
  if (!isLikelyV2cMistake && bestEnhancement.confidence < baseConfidence + improvementThreshold) {
    return {
      suggestedCategory: baseCategory,
      confidence: baseConfidence,
      reasons: ['Enhancement not significantly better than base'],
      enhancementApplied: false
    };
  }

  return {
    suggestedCategory: bestEnhancement.category,
    confidence: bestEnhancement.confidence,
    reasons: bestEnhancement.reasons,
    enhancementApplied: true,
    originalCategory: baseCategory,
    improvementScore: bestEnhancement.confidence - baseConfidence
  };
}

/**
 * Apply v4c category enhancement to parsing result
 * @param {object} parseResult - Original parsing result
 * @param {string} transcript - Original transcript
 * @returns {object} - Enhanced parsing result
 */
function applyV4cCategoryEnhancement(parseResult, transcript) {
  if (!parseResult || !parseResult.category) {
    return parseResult;
  }

  const enhancement = calculateCategoryEnhancement(
    transcript, 
    parseResult.category,
    parseResult.categoryConfidence || 0.5
  );

  if (enhancement.enhancementApplied) {
    console.log(`🚀 V4c Category Enhancement: ${enhancement.originalCategory} → ${enhancement.suggestedCategory}`);
    console.log(`   Confidence: ${(enhancement.confidence * 100).toFixed(1)}% (+${(enhancement.improvementScore * 100).toFixed(1)}%)`);
    console.log(`   Reasons: ${enhancement.reasons.join(', ')}`);

    return {
      ...parseResult,
      category: enhancement.suggestedCategory,
      categoryConfidence: enhancement.confidence,
      v4cEnhanced: true,
      v4cOriginalCategory: enhancement.originalCategory
    };
  } else {
    console.log(`📋 V4c Category: No enhancement for ${parseResult.category}`);
    return {
      ...parseResult,
      v4cEnhanced: false
    };
  }
}

module.exports = {
  calculateCategoryEnhancement,
  applyV4cCategoryEnhancement,
  CATEGORY_CONTEXT_PATTERNS,
  CATEGORY_EXCLUSION_PATTERNS,
  CATEGORY_CONFIDENCE_THRESHOLDS
};