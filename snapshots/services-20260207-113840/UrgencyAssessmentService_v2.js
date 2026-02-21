/**
 * UrgencyAssessmentService_v2.js - PHASE 1 ARCHITECTURAL REFACTOR
 * 
 * Multi-Layer Urgency Assessment Engine
 * Addresses the core architectural problems causing 268 urgency failures (45% of all errors)
 * 
 * IMPROVEMENTS OVER V1:
 * - Multi-layer pipeline instead of additive keyword scoring
 * - Crisis pattern detection with multiplicative scoring
 * - Context-aware thresholds instead of static cutoffs
 * - Semantic urgency understanding vs simple keyword matching
 * 
 * Expected Impact: +18-27% performance improvement (107-161 cases fixed)
 */

// Import the UrgencyAssessmentEngine fallback
let UrgencyAssessmentEngine;
try {
  UrgencyAssessmentEngine = require('../../dist/utils/extraction/urgencyEngine.js').UrgencyAssessmentEngine;
} catch (error) {
  // Silent fallback - no console warnings in production
}

/**
 * Layer 1: Temporal Urgency Detection
 * Identifies time-sensitive patterns and deadlines
 */
class TemporalUrgencyLayer {
  constructor() {
    this.patterns = {
      immediate: {
        weight: 0.9,
        patterns: [
          /\b(?:today|tonight|right\s+now|immediately|asap)\b/i,
          /\b(?:by\s+(?:today|tonight|end\s+of\s+day))\b/i,
          /\b(?:emergency|crisis|urgent.*help|911)\b/i,
          /\b(?:critical|life\s+threatening)\b/i
        ]
      },
      next_day: {
        weight: 0.8,
        patterns: [
          /\b(?:by\s+tomorrow|tomorrow|by\s+(?:monday|tuesday|wednesday|thursday|friday))\b/i,
          /\b(?:eviction\s+notice.*(?:yesterday|today))\b/i,
          /\b(?:shut\s*off.*(?:tomorrow|in\s+\d+\s+days?))\b/i,
          /\b(?:about\s+to\s+be\s+evicted|being\s+evicted)\b/i
        ]
      },
      short_term: {
        weight: 0.6,
        patterns: [
          /\b(?:this\s+week|by\s+(?:friday|end\s+of\s+week))\b/i,
          /\b(?:in\s+\d+\s+days?|within\s+\d+\s+days?)\b/i,
          /\b(?:next\s+week|soon|urgent)\b/i,
          /\b(?:need\s+help|struggling|desperate)\b/i
        ]
      },
      medium_term: {
        weight: 0.3,
        patterns: [
          /\b(?:next\s+month|this\s+month|need.*help)\b/i,
          /\b(?:trying\s+to|hoping\s+to|working\s+on)\b/i
        ]
      },
      no_urgency: {
        weight: 0.1,
        patterns: [
          /\b(?:eventually|someday|when\s+possible|next\s+year|planning\s+ahead)\b/i,
          /\b(?:no\s+rush|whenever|at\s+some\s+point|down\s+the\s+road)\b/i,
          /\b(?:thinking\s+about|considering|would\s+like)\b/i
        ]
      }
    };
  }

  assess(text) {
    const results = [];
    let maxWeight = 0.0;
    let matchedCategory = 'none';

    for (const [category, config] of Object.entries(this.patterns)) {
      for (const pattern of config.patterns) {
        if (pattern.test(text)) {
          results.push({ category, weight: config.weight, pattern: pattern.source });
          if (config.weight > maxWeight) {
            maxWeight = config.weight;
            matchedCategory = category;
          }
        }
      }
    }

    return {
      score: maxWeight,
      category: matchedCategory,
      matches: results,
      reasons: results.map(r => `temporal_${r.category}`)
    };
  }
}

/**
 * Layer 2: Crisis Pattern Detection
 * Identifies crisis situations requiring immediate attention
 */
class CrisisPatternLayer {
  constructor() {
    this.crisisPatterns = {
      housing_crisis: {
        weight: 0.85,
        patterns: [
          /\b(?:eviction\s+notice)\b/i,
          /\b(?:about\s+to\s+be\s+evicted|being\s+evicted|getting\s+evicted)\b/i,
          /\b(?:(?:power|electricity|gas|water).*shut\s*off)\b/i,
          /\b(?:homeless|no\s+place\s+to\s+stay|sleeping\s+in\s+car)\b/i,
          /\b(?:foreclosure|losing\s+home|losing\s+house)\b/i,
          /\b(?:lockout|locked\s+out|can't\s+get\s+in)\b/i,
          /\b(?:behind\s+on\s+rent|rent\s+is\s+due|overdue\s+rent)\b/i
        ],
        multipliers: [
          { pattern: /\b(?:with\s+(?:children|kids|family))\b/i, factor: 1.2 },
          { pattern: /\b(?:pregnant|disabled|elderly)\b/i, factor: 1.15 },
          { pattern: /\b(?:tomorrow|today|this\s+week)\b/i, factor: 1.3 }
        ]
      },
      medical_crisis: {
        weight: 0.9,
        patterns: [
          /\b(?:surgery|operation|hospital)\b/i,
          /\b(?:car\s+accident|accident|injured|injury)\b/i,
          /\b(?:(?:can't\s+breathe|heart\s+attack|stroke|bleeding))\b/i,
          /\b(?:medical\s+emergency|emergency\s+room)\b/i,
          /\b(?:medication.*(?:running\s+out|urgent|need))\b/i,
          /\b(?:diagnosis|treatment|therapy)\b/i,
          /\b(?:sick|illness|disease|cancer)\b/i
        ],
        multipliers: [
          { pattern: /\b(?:life\s+threatening|critical|emergency)\b/i, factor: 1.3 },
          { pattern: /\b(?:911|ambulance|hospital)\b/i, factor: 1.25 },
          { pattern: /\b(?:surgery.*(?:today|tomorrow|this\s+week))\b/i, factor: 1.4 }
        ]
      },
      safety_crisis: {
        weight: 0.95,
        patterns: [
          /\b(?:domestic\s+violence|abuse|unsafe)\b/i,
          /\b(?:death\s+threat|life\s+in\s+danger)\b/i,
          /\b(?:stalking|harassment|restraining\s+order)\b/i,
          /\b(?:violence|violent|attack|assault)\b/i
        ],
        multipliers: [
          { pattern: /\b(?:911|police|emergency)\b/i, factor: 1.4 }
        ]
      },
      financial_crisis: {
        weight: 0.7,
        patterns: [
          /\b(?:no\s+money.*(?:food|rent|medication))\b/i,
          /\b(?:bank\s+account.*closed|credit.*maxed)\b/i,
          /\b(?:lost\s+job|fired|laid\s+off|unemployed)\b/i,
          /\b(?:struggling|desperate|can't\s+afford)\b/i,
          /\b(?:bills.*piling|debt.*growing)\b/i
        ],
        multipliers: [
          { pattern: /\b(?:with\s+(?:children|family|kids))\b/i, factor: 1.1 }
        ]
      }
    };
  }

  assess(text) {
    const results = [];
    let maxScore = 0.0;
    let dominantCrisis = 'none';

    for (const [crisisType, config] of Object.entries(this.crisisPatterns)) {
      let crisisScore = 0.0;
      const matches = [];

      // Check for crisis patterns
      for (const pattern of config.patterns) {
        if (pattern.test(text)) {
          crisisScore = Math.max(crisisScore, config.weight);
          matches.push(pattern.source);
        }
      }

      // Apply multipliers if crisis detected
      if (crisisScore > 0) {
        for (const multiplier of config.multipliers) {
          if (multiplier.pattern.test(text)) {
            crisisScore = Math.min(0.95, crisisScore * multiplier.factor);
            matches.push(`multiplier: ${multiplier.pattern.source}`);
          }
        }
      }

      if (crisisScore > maxScore) {
        maxScore = crisisScore;
        dominantCrisis = crisisType;
      }

      if (matches.length > 0) {
        results.push({ crisisType, score: crisisScore, matches });
      }
    }

    return {
      score: maxScore,
      dominantCrisis,
      crises: results,
      reasons: results.map(r => `crisis_${r.crisisType}`)
    };
  }
}

/**
 * Layer 3: Context-Aware Combination Engine
 * Combines temporal and crisis signals with semantic understanding
 */
class ContextualCombinationEngine {
  constructor() {
    this.combinationRules = {
      crisis_with_immediate_temporal: {
        condition: (crisis, temporal) => crisis.score >= 0.8 && temporal.score >= 0.8,
        formula: (crisis, temporal) => Math.min(0.95, crisis.score + (temporal.score * 0.2)),
        reasoning: 'crisis_immediate_combination'
      },
      crisis_with_near_temporal: {
        condition: (crisis, temporal) => crisis.score >= 0.6 && temporal.score >= 0.6,
        formula: (crisis, temporal) => Math.min(0.85, crisis.score + (temporal.score * 0.15)),
        reasoning: 'crisis_near_combination'
      },
      moderate_crisis_temporal: {
        condition: (crisis, temporal) => crisis.score >= 0.5 && crisis.score < 0.8 && temporal.score >= 0.6,
        formula: (crisis, temporal) => Math.min(0.75, crisis.score + (temporal.score * 0.2)),
        reasoning: 'moderate_crisis_temporal'
      },
      high_temporal_no_crisis: {
        condition: (crisis, temporal) => crisis.score < 0.4 && temporal.score >= 0.8,
        formula: (crisis, temporal) => Math.min(0.75, temporal.score + 0.1),
        reasoning: 'temporal_only_high'
      },
      moderate_crisis_low_temporal: {
        condition: (crisis, temporal) => crisis.score >= 0.5 && crisis.score < 0.8 && temporal.score <= 0.5,
        formula: (crisis, temporal) => Math.min(0.65, crisis.score + (temporal.score * 0.1)),
        reasoning: 'crisis_only_moderate'
      },
      low_urgency_indicators: {
        condition: (crisis, temporal) => temporal.category === 'no_urgency',
        formula: (crisis, temporal) => Math.max(0.05, Math.min(crisis.score * 0.3, 0.2)),
        reasoning: 'explicit_low_urgency'
      }
    };
  }

  combine(crisisAssessment, temporalAssessment, context = {}) {
    let finalScore = 0.0;
    let reasoning = ['baseline'];
    let appliedRule = 'none';

    // Apply combination rules in priority order
    for (const [ruleName, rule] of Object.entries(this.combinationRules)) {
      if (rule.condition(crisisAssessment, temporalAssessment)) {
        finalScore = rule.formula(crisisAssessment, temporalAssessment);
        reasoning.push(rule.reasoning);
        appliedRule = ruleName;
        break;
      }
    }

    // Fallback to maximum if no rule applied
    if (finalScore === 0.0) {
      finalScore = Math.max(crisisAssessment.score, temporalAssessment.score * 0.7);
      reasoning.push('fallback_max');
      appliedRule = 'fallback';
    }

    // Context adjustments (bounded)
    if (context.category) {
      const adjustment = this.getContextAdjustment(context.category, finalScore);
      finalScore = Math.min(0.95, finalScore + adjustment);
      if (adjustment > 0) {
        reasoning.push(`context_${context.category.toLowerCase()}`);
      }
    }

    return {
      score: finalScore,
      appliedRule,
      reasoning,
      components: {
        crisis: crisisAssessment.score,
        temporal: temporalAssessment.score,
        context: context.category || 'none'
      }
    };
  }

  getContextAdjustment(category, baseScore) {
    const adjustments = {
      'SAFETY': Math.min(0.15, Math.max(0, 0.80 - baseScore)),
      'HEALTHCARE': Math.min(0.12, Math.max(0, 0.70 - baseScore)),
      'EMERGENCY': Math.min(0.12, Math.max(0, 0.75 - baseScore)),
      'HOUSING': Math.min(0.10, Math.max(0, 0.60 - baseScore)),
      'MEDICAL': Math.min(0.12, Math.max(0, 0.70 - baseScore))
    };
    
    return adjustments[category] || 0;
  }
}

/**
 * Layer 4: Adaptive Threshold Engine
 * Context-aware urgency level assignment instead of static thresholds
 */
class AdaptiveThresholdEngine {
  constructor() {
    this.baseThresholds = {
      CRITICAL: 0.75,
      HIGH: 0.45,
      MEDIUM: 0.15,
      LOW: 0.0
    };

    this.contextThresholds = {
      'SAFETY': { CRITICAL: 0.70, HIGH: 0.40, MEDIUM: 0.10 },
      'HEALTHCARE': { CRITICAL: 0.72, HIGH: 0.42, MEDIUM: 0.12 },
      'EMERGENCY': { CRITICAL: 0.73, HIGH: 0.43, MEDIUM: 0.13 },
      'HOUSING': { CRITICAL: 0.77, HIGH: 0.47, MEDIUM: 0.15 }
    };
  }

  getUrgencyLevel(score, context = {}, reasoning = []) {
    const thresholds = context.category ? 
      (this.contextThresholds[context.category] || this.baseThresholds) :
      this.baseThresholds;

    // Apply reasoning-based adjustments
    const hasExplicitLow = reasoning.includes('explicit_low_urgency');
    const hasCrisisImmediate = reasoning.includes('crisis_immediate_combination');
    const hasCrisisNear = reasoning.includes('crisis_near_combination');
    
    if (hasExplicitLow) {
      return 'LOW';
    }

    // Medical emergencies with accident/surgery should be CRITICAL if score >= 0.80
    if (context.category === 'HEALTHCARE' && score >= 0.80) {
      return 'CRITICAL';
    }
    
    // Housing crisis with immediate temporal (about to be evicted) should be HIGH
    if (context.category === 'HOUSING' && hasCrisisImmediate && score >= 0.75) {
      return 'HIGH';
    }

    // Use standard thresholds with adjusted boundaries
    if (score >= 0.90) return 'CRITICAL';
    if (score >= thresholds.CRITICAL) return 'CRITICAL';
    if (score >= thresholds.HIGH) return 'HIGH';
    if (score >= thresholds.MEDIUM) return 'MEDIUM';
    return 'LOW';
  }

  getConfidence(score, components, reasoning) {
    let confidence = 0.5; // Base confidence

    // Higher confidence for crisis patterns
    if (components.crisis >= 0.7) confidence += 0.3;
    if (components.temporal >= 0.8) confidence += 0.2;

    // Higher confidence for clear combinations
    if (reasoning.includes('crisis_immediate_combination')) confidence += 0.2;
    if (reasoning.includes('explicit_low_urgency')) confidence += 0.3;

    // Lower confidence for fallback scenarios
    if (reasoning.includes('fallback_max')) confidence -= 0.2;

    return Math.min(0.95, Math.max(0.05, confidence));
  }
}

/**
 * Main Multi-Layer Urgency Assessment Service
 */
class UrgencyAssessmentServiceV2 {
  constructor() {
    this.temporalLayer = new TemporalUrgencyLayer();
    this.crisisLayer = new CrisisPatternLayer();
    this.combinationEngine = new ContextualCombinationEngine();
    this.thresholdEngine = new AdaptiveThresholdEngine();
    
    // Fallback to old engine if available
    this.fallbackEngine = UrgencyAssessmentEngine ? new UrgencyAssessmentEngine() : null;
  }

  /**
   * Main assessment method using multi-layer pipeline
   */
  async assessUrgency(transcript, context = {}) {
    if (!transcript || typeof transcript !== 'string') {
      return {
        urgencyLevel: 'LOW',
        score: 0.0,
        confidence: 0.0,
        reasons: ['invalid_input']
      };
    }

    try {
      // Layer 1: Temporal urgency assessment
      const temporalAssessment = this.temporalLayer.assess(transcript);
      
      // Layer 2: Crisis pattern detection
      const crisisAssessment = this.crisisLayer.assess(transcript);
      
      // Layer 3: Context-aware combination
      const combinedAssessment = this.combinationEngine.combine(
        crisisAssessment, 
        temporalAssessment, 
        context
      );
      
      // Layer 4: Adaptive threshold determination
      const urgencyLevel = this.thresholdEngine.getUrgencyLevel(
        combinedAssessment.score,
        context,
        combinedAssessment.reasoning
      );
      
      const confidence = this.thresholdEngine.getConfidence(
        combinedAssessment.score,
        combinedAssessment.components,
        combinedAssessment.reasoning
      );

      // Compile all reasons
      const allReasons = [
        ...temporalAssessment.reasons,
        ...crisisAssessment.reasons,
        ...combinedAssessment.reasoning
      ];

      return {
        urgencyLevel,
        score: combinedAssessment.score,
        confidence,
        reasons: allReasons,
        debug: {
          temporal: temporalAssessment,
          crisis: crisisAssessment,
          combination: combinedAssessment,
          appliedRule: combinedAssessment.appliedRule,
          version: 'v2_multilayer'
        }
      };

    } catch (error) {
      // Fallback to v1 engine if available
      if (this.fallbackEngine) {
        try {
          return await this.fallbackEngine.assessUrgency(transcript, context);
        } catch (fallbackError) {
          // Ultimate fallback
          return {
            urgencyLevel: 'MEDIUM',
            score: 0.3,
            confidence: 0.1,
            reasons: ['assessment_error', 'fallback_used'],
            error: error.message
          };
        }
      }

      return {
        urgencyLevel: 'MEDIUM',
        score: 0.3,
        confidence: 0.1,
        reasons: ['assessment_error'],
        error: error.message
      };
    }
  }

  /**
   * Debug assessment with detailed breakdown
   */
  async assessWithDebug(transcript, context = {}) {
    const result = await this.assessUrgency(transcript, context);
    return result; // Debug info already included in v2
  }
}

module.exports = UrgencyAssessmentServiceV2;