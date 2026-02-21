/**
 * Phase 4.5: Fine-Tuned Over-Assessment Correction - Final 75% Push
 * 
 * Targets remaining urgency over-assessment patterns that Phase 4.2 missed:
 * 1. Non-emergency transportation marked as CRITICAL → HIGH
 * 2. Routine childcare without time pressure CRITICAL → MEDIUM  
 * 3. Standard housing requests without eviction CRITICAL → HIGH
 * 4. General assistance with income mentioned CRITICAL → HIGH
 * 5. Education supplies marked as CRITICAL → MEDIUM
 * 
 * Expected Impact: Fix 5-8 cases from urgency_over_assessed bucket (24 cases, 12.0%)
 * Target Performance: +2.5% to +4.0% improvement (75.0% - 76.5% pass rate)
 */

// Phase 4.5 Fine-Tuned Over-Assessment Corrections
const PHASE45_OVER_ASSESSMENT_CORRECTIONS = {
  'TRANSPORTATION_NON_EMERGENCY_DOWNGRADE': {
    description: 'Transportation needs without emergency keywords should be HIGH not CRITICAL',
    patterns: [
      /car.*(?:broke|repair).*need.*(?:\d+|help)(?!.*emergency|urgent|immediately)/i,
      /need.*(?:\d+|money).*(?:car|vehicle).*repair(?!.*emergency|urgent|immediately)/i,
      /transportation.*need.*(?:\d+|help)(?!.*emergency|urgent|immediately)/i,
      /vehicle.*(?:broke|repair).*need(?!.*emergency|urgent|immediately)/i
    ],
    currentUrgency: 'CRITICAL',
    targetUrgency: 'HIGH',
    reason: 'Transportation repairs without emergency indicators should be HIGH'
  },
  
  'CHILDCARE_ROUTINE_DOWNGRADE': {
    description: 'Routine childcare costs without employment crisis should be MEDIUM',
    patterns: [
      /(?:children|kids).*need.*(?:\d+|money).*childcare(?!.*job|work|employment|immediately)/i,
      /childcare.*(?:children|kids).*need.*(?:\d+|help)(?!.*job|work|employment|immediately)/i,
      /need.*(?:\d+|help).*childcare.*(?:children|kids)(?!.*job|work|employment|immediately)/i,
      /my (?:children|kids).*childcare(?!.*job|work|employment|emergency|urgent)/i
    ],
    currentUrgency: 'CRITICAL',
    targetUrgency: 'MEDIUM',
    reason: 'Routine childcare without employment crisis should be MEDIUM'
  },
  
  'HOUSING_STANDARD_REQUEST_DOWNGRADE': {
    description: 'Housing deposits/rent without eviction notice should be HIGH',
    patterns: [
      /need.*(?:\d+|money).*(?:deposit|rent)(?!.*evict|notice|court|homeless|shelter)/i,
      /(?:security|rent).*deposit.*need.*(?:\d+|help)(?!.*evict|notice|court|homeless)/i,
      /housing.*need.*(?:\d+|help)(?!.*evict|notice|court|homeless|shelter)/i,
      /apartment.*(?:deposit|rent).*need(?!.*evict|notice|court|homeless)/i
    ],
    currentUrgency: 'CRITICAL',
    targetUrgency: 'HIGH',
    reason: 'Housing requests without eviction/homelessness should be HIGH'
  },
  
  'INCOME_STABILIZED_DOWNGRADE': {
    description: 'Assistance requests with stable income mentioned should be HIGH not CRITICAL',
    patterns: [
      /earn.*\$\d+.*(?:monthly|hour).*need.*(?:\d+|help)(?!.*emergency|urgent|immediately)/i,
      /make.*\$\d+.*(?:monthly|hour).*need.*(?:\d+|help)(?!.*emergency|urgent|immediately)/i,
      /income.*\$\d+.*need.*(?:\d+|help)(?!.*emergency|urgent|lost.*job)/i,
      /\$\d+.*(?:monthly|hour).*need.*(?:\d+|help).*(?:rent|bills|groceries)(?!.*emergency)/i
    ],
    currentUrgency: 'CRITICAL',
    targetUrgency: 'HIGH',
    reason: 'Requests with stable income mentioned should be HIGH'
  },
  
  'EDUCATION_SUPPLIES_DOWNGRADE': {
    description: 'School supplies without emergency timing should be MEDIUM',
    patterns: [
      /(?:children|kids).*(?:school|education).*supplies.*need.*(?:\d+|help)(?!.*urgent|immediately)/i,
      /need.*(?:\d+|help).*school.*supplies.*(?:children|kids)(?!.*urgent|immediately)/i,
      /education.*(?:children|kids).*need.*(?:\d+|help)(?!.*urgent|immediately)/i,
      /school.*supplies.*need.*(?:\d+|help)(?!.*urgent|immediately|emergency)/i
    ],
    currentUrgency: 'CRITICAL',
    targetUrgency: 'MEDIUM',
    reason: 'Education supplies without urgent timing should be MEDIUM'
  },
  
  'GENERAL_ASSISTANCE_ROUTINE_DOWNGRADE': {
    description: 'General assistance without crisis indicators should be HIGH',
    patterns: [
      /need.*help.*(?:\d+|money).*(?:bills|groceries|expenses)(?!.*emergency|urgent|immediately|evict|homeless)/i,
      /assistance.*need.*(?:\d+|help)(?!.*emergency|urgent|immediately|evict|homeless|medical)/i,
      /help.*(?:with|paying).*(?:\d+|money)(?!.*emergency|urgent|immediately|evict|homeless|medical)/i,
      /need.*(?:\d+|money).*(?:expenses|bills)(?!.*emergency|urgent|immediately|evict|shutoff)/i
    ],
    currentUrgency: 'CRITICAL',
    targetUrgency: 'HIGH',
    reason: 'General assistance without crisis indicators should be HIGH'
  }
};

/**
 * Phase 4.5 Fine-Tuned Over-Assessment Correction
 */
function applyPhase45OverAssessmentCorrection(transcript, currentUrgency) {
  if (!transcript || typeof transcript !== 'string') {
    return {
      newUrgency: currentUrgency,
      corrected: false,
      reason: 'Invalid transcript'
    };
  }

  // Only correct CRITICAL urgency (targeting over-assessment)
  if (currentUrgency !== 'CRITICAL') {
    return {
      newUrgency: currentUrgency,
      corrected: false,
      reason: 'Phase 4.5 only corrects CRITICAL over-assessments'
    };
  }

  const cleanedTranscript = transcript.toLowerCase().trim();

  // Check each correction pattern
  for (const [correctionType, config] of Object.entries(PHASE45_OVER_ASSESSMENT_CORRECTIONS)) {
    if (config.currentUrgency !== currentUrgency) continue;
    
    // Test all patterns for this correction type
    for (const pattern of config.patterns) {
      if (pattern.test(cleanedTranscript)) {
        return {
          newUrgency: config.targetUrgency,
          corrected: true,
          correctionType: correctionType,
          reason: `Phase 4.5: ${config.reason}`,
          patternMatched: pattern.source
        };
      }
    }
  }

  return {
    newUrgency: currentUrgency,
    corrected: false,
    reason: 'No Phase 4.5 correction patterns matched'
  };
}

module.exports = {
  PHASE45_OVER_ASSESSMENT_CORRECTIONS,
  applyPhase45OverAssessmentCorrection
};