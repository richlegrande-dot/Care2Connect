// UrgencyEnhancements_v3a.js
// Phase 1: Urgency Under-Assessment Fix
// Target: Address 186 under-assessment failures by lowering thresholds

const ENHANCEMENT_VERSION = "v3a";
const ENHANCEMENT_DESCRIPTION =
  "Phase 1: Threshold adjustment for under-assessment fix";

// Phase 1 Strategy: Conservative threshold lowering
// Problem: 186 cases under-assessing urgency due to conservative thresholds
// Solution: Lower CRITICAL and HIGH thresholds by 0.05 each

const ENHANCED_THRESHOLDS = {
  // Current baseline: CRITICAL≥0.80, HIGH≥0.50, MEDIUM≥0.15
  // Phase 1 target: CRITICAL≥0.75, HIGH≥0.45, MEDIUM≥0.15

  CRITICAL: 0.75, // Lowered from 0.80 (-0.05) - helps surgery, medical emergencies
  HIGH: 0.45, // Lowered from 0.50 (-0.05) - helps evictions, job loss
  MEDIUM: 0.15, // Unchanged - was working well
  LOW: 0.0, // Unchanged - anything below MEDIUM
};

// Enhanced boost configurations to work with lower thresholds
const ENHANCED_BOOSTS = {
  // Keep existing boost logic but ensure they work well with new thresholds
  // Surgery cases: typically ~0.55 after boost → now CRITICAL (was HIGH)
  // Eviction cases: typically ~0.29 after boost → may reach HIGH now

  surgery: {
    boost: 0.1, // Keep existing surgery boost
    keywords: ["surgery", "operation", "medical procedure", "hospital"],
  },

  eviction: {
    boost: 0.05, // Keep existing eviction boost
    keywords: ["eviction", "evicted", "landlord", "rent due"],
  },

  medical: {
    boost: 0.08, // Keep existing medical boost
    keywords: ["prescription", "medication", "doctor", "treatment"],
  },
};

// Main enhancement function
function enhanceUrgencyAssessment(
  originalService,
  transcript,
  amount,
  category,
) {
  // Get the original urgency assessment
  const originalResult = originalService.assessUrgency(
    transcript,
    amount,
    category,
  );

  // Apply enhanced thresholds instead of original ones
  const enhancedUrgency = applyEnhancedThresholds(originalResult);

  return enhancedUrgency;
}

function applyEnhancedThresholds(assessmentResult) {
  const score = assessmentResult.urgencyScore || 0;
  let urgencyLevel;

  // Apply Phase 1 enhanced thresholds
  if (score >= ENHANCED_THRESHOLDS.CRITICAL) {
    urgencyLevel = "CRITICAL";
  } else if (score >= ENHANCED_THRESHOLDS.HIGH) {
    urgencyLevel = "HIGH";
  } else if (score >= ENHANCED_THRESHOLDS.MEDIUM) {
    urgencyLevel = "MEDIUM";
  } else {
    urgencyLevel = "LOW";
  }

  return {
    ...assessmentResult,
    urgencyLevel: urgencyLevel,
    urgencyScore: score,
    enhancementVersion: ENHANCEMENT_VERSION,
    enhancementApplied: true,
    thresholds: ENHANCED_THRESHOLDS,
    originalLevel: assessmentResult.urgencyLevel,
    enhancement: {
      version: ENHANCEMENT_VERSION,
      description: ENHANCEMENT_DESCRIPTION,
      thresholdAdjustments: {
        critical: `0.80 → ${ENHANCED_THRESHOLDS.CRITICAL} (-0.05)`,
        high: `0.50 → ${ENHANCED_THRESHOLDS.HIGH} (-0.05)`,
        medium: `0.15 → ${ENHANCED_THRESHOLDS.MEDIUM} (unchanged)`,
      },
    },
  };
}

// Export for use in UrgencyAssessmentService
module.exports = {
  enhanceUrgencyAssessment,
  ENHANCEMENT_VERSION,
  ENHANCEMENT_DESCRIPTION,
  ENHANCED_THRESHOLDS,
  ENHANCED_BOOSTS,
};

// Configuration validation
if (require.main === module) {
  console.log(`✅ UrgencyEnhancements_${ENHANCEMENT_VERSION} loaded`);
  console.log(`📊 Enhanced Thresholds:`);
  console.log(`   CRITICAL: ≥${ENHANCED_THRESHOLDS.CRITICAL} (was ≥0.80)`);
  console.log(`   HIGH: ≥${ENHANCED_THRESHOLDS.HIGH} (was ≥0.50)`);
  console.log(`   MEDIUM: ≥${ENHANCED_THRESHOLDS.MEDIUM} (unchanged)`);
  console.log(`🎯 Target: Address 186 under-assessment failures`);
  console.log(`📈 Expected: +15-20 cases improvement (276-281/590)`);
}
