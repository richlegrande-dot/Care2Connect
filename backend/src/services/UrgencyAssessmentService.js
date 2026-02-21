/**
 * UrgencyAssessmentService.js - SAFE VERSION
 * Restored: January 30, 2026
 *
 * STABLE THRESHOLDS: CRITICAL≥0.80, HIGH≥0.50, MEDIUM≥0.15, LOW<0.15
 * BOUNDED BOOSTS: Category/temporal boosts capped at +0.08 total
 * NO PII LOGGING: Transcript content never logged
 *
 * Addresses urgency assessment with conservative, stable approach
 */

// Import the UrgencyAssessmentEngine
let UrgencyAssessmentEngine;
try {
  UrgencyAssessmentEngine =
    require("../../dist/utils/extraction/urgencyEngine.js").UrgencyAssessmentEngine;
} catch (error) {
  // Silent fallback - no console warnings in production
}

// Phase 1.5: Load v3b enhancement for Core30 regression fix
let UrgencyEnhancements_v3b;
try {
  if (process.env.USE_V3B_ENHANCEMENTS === "true") {
    UrgencyEnhancements_v3b = require("./UrgencyEnhancements_v3b.js");
    console.log(
      "✅ UrgencyEnhancements_v3b loaded - Phase 1.5 Core30 fix active",
    );
  }
} catch (error) {
  console.warn("⚠️ UrgencyEnhancements_v3b not found, using baseline");
}

// Phase 3: Load v3c enhancement for urgency under-assessment fix
let UrgencyEnhancements_v3c;
try {
  if (process.env.USE_V3C_ENHANCEMENTS === "true") {
    UrgencyEnhancements_v3c = require("./UrgencyEnhancements_v3c.js");
    console.log(
      "✅ UrgencyEnhancements_v3c loaded - Phase 3 urgency boost active",
    );
  }
} catch (error) {
  console.warn("⚠️ UrgencyEnhancements_v3c not found, using baseline");
}

// Legacy v3a support (fallback)
let UrgencyEnhancements_v3a;
try {
  if (process.env.USE_V3A_ENHANCEMENTS === "true") {
    UrgencyEnhancements_v3a = require("./UrgencyEnhancements_v3a.js");
    console.log("✅ UrgencyEnhancements_v3a loaded - Phase 1 active");
  }
} catch (error) {
  console.warn("⚠️ UrgencyEnhancements_v3a not found, using baseline");
}

class UrgencyAssessmentService {
  constructor() {
    this.engine = UrgencyAssessmentEngine
      ? new UrgencyAssessmentEngine()
      : null;
    this.fallbackPatterns = this.initializeFallbackPatterns();

    // Phase 1.5: Initialize v3b (Core30 regression fix) enhancement
    this.useV3bEnhancements = process.env.USE_V3B_ENHANCEMENTS === "true";
    this.v3bEnhancement = null;

    if (this.useV3bEnhancements && UrgencyEnhancements_v3b) {
      this.v3bEnhancement = UrgencyEnhancements_v3b;
      console.log(
        `🎯 Phase 1.5 Active - Hybrid thresholds: Core30 protection + v3a gains`,
      );
    }

    // Phase 3: Initialize v3c (urgency under-assessment fix) enhancement
    this.useV3cEnhancements = process.env.USE_V3C_ENHANCEMENTS === "true";
    this.v3cEnhancement = null;

    if (this.useV3cEnhancements && UrgencyEnhancements_v3c) {
      this.v3cEnhancement = UrgencyEnhancements_v3c;
      console.log(
        `🚀 Phase 3 Active - Urgency boosting: targeting under-assessment fixes`,
      );
    }

    // Legacy Phase 1: v3a enhancement (fallback when v3b not active)
    this.useV3aEnhancements =
      process.env.USE_V3A_ENHANCEMENTS === "true" && !this.useV3bEnhancements;
    this.v3aThresholds = null;

    if (this.useV3aEnhancements && UrgencyEnhancements_v3a) {
      this.v3aThresholds = UrgencyEnhancements_v3a.ENHANCED_THRESHOLDS;
      console.log(
        `🎯 Phase 1 Active - Enhanced thresholds: CRITICAL≥${this.v3aThresholds.CRITICAL}, HIGH≥${this.v3aThresholds.HIGH}`,
      );
    }
  }

  /**
   * Initialize fallback patterns for when engine is unavailable
   * Conservative patterns - avoid over-escalation
   */
  initializeFallbackPatterns() {
    return {
      critical: [
        // Direct emergency indicators (life/safety threats)
        /\b(emergency|critical|crisis|catastrophic|dire)\b/i,
        /\b(life.*threatening|911|ambulance|dying|death|fatal)\b/i,
        // Immediate temporal danger with consequence
        /\b(eviction|shut.*off|disconnect|foreclosure).*(today|tonight)\b/i,
        /\b(today|tonight).*(eviction|shut.*off|disconnect|foreclosure)\b/i,
        // Violence and safety (SAFETY category only)
        /\b(violence|violent|abuse|abusive|fleeing|escape|hiding|stalker|attacker)\b/i,
        /\b(dangerous|unsafe).*(immediate|now|right.*now)\b/i,
        // Severe medical conditions with immediacy
        /\b(hospital).*(emergency|now|immediately)\b/i,
        /\b(surgery).*(today|tomorrow|emergency|urgent)\b/i,
        /\b(life.*threat|heart.*attack|stroke|can't.*breathe|bleeding.*heavily)\b/i,
      ],
      high: [
        // Strong temporal pressure (specific near-term timeframes)
        /\b(urgent|urgently|asap|immediately|right.*away)\b/i,
        /\b(by.*(tomorrow|friday|monday|end.*week))\b/i,
        /\b(deadline|time.*sensitive|time.*critical)\b/i,
        // Imminent loss situations
        /\b(about.*to.*(lose|be.*evicted|shut.*off))\b/i,
        /\b(eviction.*notice|eviction.*threat|shutoff.*notice|disconnect.*notice)\b/i,
        /\b(foreclosure|repossession)\b/i,
        // Employment crisis
        /\b(lost.*job|laid.*off|fired|terminated)\b/i,
        /\b(can't.*work|unable.*work).*(car|vehicle|transportation)\b/i,
        // Financial distress with near-term consequence
        /\b(behind.*rent|past.*due.*rent|overdue.*rent)\b/i,
        /\b(can't.*pay.*rent|unable.*pay.*rent)\b/i,
        /\b(final.*notice|last.*warning)\b/i,
        // Legal urgency
        /\b(court.*date|court.*(tomorrow|next.*week)|legal.*deadline|hearing)\b/i,
        // Family crisis
        /\b(kids|children).*(hungry|starving|no.*food)\b/i,
        /\b(homeless|living.*in.*car|no.*place.*stay|sleeping.*in.*car)\b/i,
      ],
      medium: [
        // General need indicators
        /\b(help|assistance|support|need|require)\b/i,
        /\b(need.*help|help.*with)\b/i,
        // Financial challenges (not crisis)
        /\b(struggling|difficult|hard.*time|challenging)\b/i,
        /\b(bills.*piling|debt.*growing|making.*ends.*meet)\b/i,
        // Medical (ongoing, not emergency)
        /\b(medical|health|healthcare|doctor|hospital|treatment|medication)\b/i,
        /\b(surgery|operation)(?!.*(today|tomorrow|emergency))/i,
        // Housing (stable situation needing help)
        /\b(rent|mortgage|housing|apartment|utilities)\b/i,
        // Transportation
        /\b(car|vehicle|transportation|repairs)\b/i,
        // Education and career
        /\b(education|school|tuition|training|certification)\b/i,
        // Basic needs
        /\b(food|groceries|clothes|clothing)\b/i,
      ],
      low: [
        // Explicit low urgency markers
        /\b(eventually|someday|sometime|when.*possible|if.*possible)\b/i,
        /\b(no.*rush|not.*urgent|not.*immediate|flexible)\b/i,
        /\b(would.*like|would.*appreciate|hoping)\b/i,
        // Non-urgent life events
        /\b(wedding|ceremony|celebration|vacation|trip)\b/i,
      ],
    };
  }

  /**
   * Assess urgency using the enhanced engine or fallback logic
   * @param {string} transcript - The transcript text
   * @param {object} context - Optional context (category, amount)
   * @returns {object} Assessment result
   */
  assessUrgency(transcript, context = {}) {
    // NO TRANSCRIPT LOGGING - PII RISK

    if (!transcript || typeof transcript !== "string") {
      return {
        urgencyLevel: "LOW",
        score: 0.0,
        confidence: 0.0,
        reasons: ["invalid_input"],
      };
    }

    // Use the enhanced engine if available
    if (this.engine) {
      try {
        const assessment = this.engine.assessUrgency(transcript, context);

        // Apply BOUNDED category boosts
        let boostedScore = assessment.score;
        const boostedReasons = [...assessment.reasons];
        let totalBoost = 0.0; // Track total boost to enforce cap

        if (context.category) {
          switch (context.category) {
            case "SAFETY":
              // SAFETY is inherently high urgency
              const safetyBoost = Math.max(0, 0.8 - boostedScore);
              boostedScore = Math.max(boostedScore, 0.8);
              totalBoost += safetyBoost;
              if (safetyBoost > 0) boostedReasons.push("safety_category_floor");
              break;

            case "HEALTHCARE":
            case "MEDICAL":
              // Small incremental boost for healthcare
              if (boostedScore >= 0.5 && totalBoost < 0.08) {
                const boost = Math.min(0.05, 0.08 - totalBoost);
                boostedScore += boost;
                totalBoost += boost;
                boostedReasons.push("healthcare_incremental_boost");
              }
              break;

            case "EMERGENCY":
              // EMERGENCY gets modest boost if already elevated
              if (boostedScore >= 0.6 && totalBoost < 0.08) {
                const boost = Math.min(0.08, 0.08 - totalBoost);
                boostedScore += boost;
                totalBoost += boost;
                boostedReasons.push("emergency_incremental_boost");
              }
              break;

            case "HOUSING":
              // Housing evictions get small boost if already moderate
              if (
                boostedScore >= 0.4 &&
                boostedScore < 0.65 &&
                totalBoost < 0.08
              ) {
                const boost = Math.min(0.05, 0.08 - totalBoost);
                boostedScore += boost;
                totalBoost += boost;
                boostedReasons.push("housing_incremental_boost");
              }
              break;

            case "FAMILY":
              // Family needs get small floor boost only if children mentioned with hardship
              if (
                transcript &&
                /\b(kids|children|child)\b/i.test(transcript) &&
                /\b(struggling|can't|unable|need.*help|desperate)\b/i.test(
                  transcript,
                ) &&
                totalBoost < 0.08
              ) {
                const boost = Math.min(0.05, 0.08 - totalBoost);
                boostedScore = Math.max(boostedScore, 0.3 + boost);
                totalBoost += boost;
                boostedReasons.push("family_hardship_boost");
              }
              break;
          }
        }

        // FALLBACK BOOSTS: Apply category-like boosts based on content regardless of assigned category
        if (transcript && totalBoost < 0.08) {
          // Eviction/housing crisis detection
          if (
            /\b(eviction|evicted|evicting|shut.*off|disconnect|foreclosure)\b/i.test(
              transcript,
            ) &&
            boostedScore >= 0.4 &&
            boostedScore < 0.65
          ) {
            const boost = Math.min(0.05, 0.08 - totalBoost);
            boostedScore += boost;
            totalBoost += boost;
            boostedReasons.push("content_housing_boost");
          }

          // Emergency detection
          if (
            /\b(emergency|crisis|catastrophic|dire|life.*threatening)\b/i.test(
              transcript,
            ) &&
            boostedScore >= 0.6
          ) {
            const boost = Math.min(0.08, 0.08 - totalBoost);
            boostedScore += boost;
            totalBoost += boost;
            boostedReasons.push("content_emergency_boost");
          }

          // Safety/violence detection
          if (
            /\b(violence|violent|abuse|abusive|fleeing|escape|hiding|stalker|attacker|dangerous|unsafe)\b/i.test(
              transcript,
            )
          ) {
            const safetyBoost = Math.max(0, 0.8 - boostedScore);
            boostedScore = Math.max(boostedScore, 0.8);
            totalBoost += safetyBoost;
            boostedReasons.push("content_safety_floor");
          }
        }

        // Apply HYBRID THRESHOLDS (Phase 1.5: v3b Core30 fix or v3a/baseline)
        let boostedUrgencyLevel;

        if (this.useV3bEnhancements && this.v3bEnhancement) {
          // Phase 1.5: Hybrid threshold system (Core30 protection + v3a gains)
          const thresholds = this.v3bEnhancement.getThresholds(transcript);
          if (boostedScore >= thresholds.CRITICAL)
            boostedUrgencyLevel = "CRITICAL";
          else if (boostedScore >= thresholds.HIGH)
            boostedUrgencyLevel = "HIGH";
          else if (boostedScore >= thresholds.MEDIUM)
            boostedUrgencyLevel = "MEDIUM";
          else boostedUrgencyLevel = "LOW";
        } else if (this.useV3aEnhancements && this.v3aThresholds) {
          // Phase 1: Enhanced thresholds for under-assessment fix
          if (boostedScore >= this.v3aThresholds.CRITICAL)
            boostedUrgencyLevel = "CRITICAL"; // 0.75 (was 0.80)
          else if (boostedScore >= this.v3aThresholds.HIGH)
            boostedUrgencyLevel = "HIGH"; // 0.45 (was 0.50)
          else if (boostedScore >= this.v3aThresholds.MEDIUM)
            boostedUrgencyLevel = "MEDIUM"; // 0.15 (unchanged)
          else boostedUrgencyLevel = "LOW";
        } else {
          // Baseline thresholds (stable configuration)
          if (boostedScore >= 0.8)
            boostedUrgencyLevel = "CRITICAL"; // Baseline
          else if (boostedScore >= 0.5)
            boostedUrgencyLevel = "HIGH"; // Baseline
          else if (boostedScore >= 0.15)
            boostedUrgencyLevel = "MEDIUM"; // Baseline
          else boostedUrgencyLevel = "LOW";
        }

        // Phase 3: Apply v3c urgency boost enhancement (targeting under-assessment)
        let finalUrgencyLevel = boostedUrgencyLevel;
        let finalScore = boostedScore;
        let finalReasons = boostedReasons;

        if (this.useV3cEnhancements && this.v3cEnhancement) {
          const baseResult = {
            level: boostedUrgencyLevel,
            score: boostedScore,
            category: context.category || "OTHER",
          };

          const v3cResult = this.v3cEnhancement.enhanceUrgency(
            transcript,
            baseResult,
          );

          if (v3cResult.enhanced) {
            finalUrgencyLevel = v3cResult.level;
            finalScore = v3cResult.score;
            finalReasons = [
              ...boostedReasons,
              ...v3cResult.reasons.slice(0, 2),
            ];
          }
        }

        return {
          urgencyLevel: finalUrgencyLevel,
          score: finalScore,
          confidence: assessment.confidence,
          reasons: finalReasons,
        };
      } catch (error) {
        // Silent fallback to pattern matching
      }
    }

    // Fallback to pattern matching
    return this.fallbackAssessment(transcript, context);
  }

  /**
   * Fallback assessment when engine is unavailable
   * Uses conservative cumulative scoring
   */
  fallbackAssessment(transcript, context = {}) {
    const lower = transcript.toLowerCase();
    let score = 0.0;
    const reasons = [];

    // Check patterns and accumulate evidence
    const patternChecks = [
      {
        level: "CRITICAL",
        patterns: this.fallbackPatterns.critical,
        weight: 0.8,
      },
      { level: "HIGH", patterns: this.fallbackPatterns.high, weight: 0.6 },
      { level: "MEDIUM", patterns: this.fallbackPatterns.medium, weight: 0.3 },
      { level: "LOW", patterns: this.fallbackPatterns.low, weight: 0.1 },
    ];

    // Find highest matching level
    for (const check of patternChecks) {
      for (const pattern of check.patterns) {
        if (pattern.test(lower)) {
          score = Math.max(score, check.weight);
          reasons.push(`${check.level.toLowerCase()}_pattern_match`);
          break; // Only count first match per level
        }
      }
    }

    // BOUNDED temporal boost (only if already has some urgency)
    let temporalBoost = 0.0;
    if (score >= 0.3 && /\b(today|tonight|tomorrow)\b/i.test(lower)) {
      // Only boost if paired with crisis pattern
      if (/\b(eviction|shutoff|disconnect|surgery|court)\b/i.test(lower)) {
        temporalBoost = 0.1;
        score = Math.min(score + temporalBoost, 1.0);
        reasons.push("temporal_urgency_boost");
      }
    }

    // BOUNDED explicit urgency boost
    let explicitBoost = 0.0;
    if (/\b(urgent|asap|immediately|right.*away|right.*now)\b/i.test(lower)) {
      explicitBoost = 0.1;
      score = Math.min(score + explicitBoost, 1.0);
      reasons.push("explicit_urgency_keywords");
    }

    // Cap total boosts at 0.08
    const totalBoost = temporalBoost + explicitBoost;
    if (totalBoost > 0.08) {
      const excess = totalBoost - 0.08;
      score -= excess;
      reasons.push("boost_cap_applied");
    }

    // LOW patterns should prevent escalation
    if (
      /\b(eventually|someday|when.*possible|no.*rush|not.*urgent)\b/i.test(
        lower,
      )
    ) {
      score = Math.min(score, 0.5); // Cap at MEDIUM
      reasons.push("low_urgency_cap");
    }

    // BOUNDED context-based adjustments (same rules as engine path)
    let contextBoost = 0.0;
    if (context.category) {
      switch (context.category) {
        case "SAFETY":
          const safetyBoost = Math.max(0, 0.8 - score);
          score = Math.max(score, 0.8);
          contextBoost += safetyBoost;
          if (safetyBoost > 0) reasons.push("safety_category_floor");
          break;

        case "HEALTHCARE":
        case "MEDICAL":
          if (score >= 0.5 && contextBoost < 0.08) {
            const boost = Math.min(0.05, 0.08 - contextBoost);
            score += boost;
            contextBoost += boost;
            reasons.push("healthcare_boost");
          }
          break;

        case "EMERGENCY":
          if (score >= 0.6 && contextBoost < 0.08) {
            const boost = Math.min(0.08, 0.08 - contextBoost);
            score += boost;
            contextBoost += boost;
            reasons.push("emergency_boost");
          }
          break;

        case "HOUSING":
          if (score >= 0.4 && score < 0.65 && contextBoost < 0.08) {
            const boost = Math.min(0.05, 0.08 - contextBoost);
            score += boost;
            contextBoost += boost;
            reasons.push("housing_boost");
          }
          break;
      }
    }

    // FALLBACK BOOSTS: Apply category-like boosts based on content regardless of assigned category
    if (transcript && contextBoost < 0.08) {
      // Eviction/housing crisis detection
      if (
        /\b(eviction|evicted|evicting|shut.*off|disconnect|foreclosure)\b/i.test(
          transcript,
        ) &&
        score >= 0.4 &&
        score < 0.65
      ) {
        const boost = Math.min(0.05, 0.08 - contextBoost);
        score += boost;
        contextBoost += boost;
        reasons.push("content_housing_boost");
      }

      // Emergency detection
      if (
        /\b(emergency|crisis|catastrophic|dire|life.*threatening)\b/i.test(
          transcript,
        ) &&
        score >= 0.6
      ) {
        const boost = Math.min(0.08, 0.08 - contextBoost);
        score += boost;
        contextBoost += boost;
        reasons.push("content_emergency_boost");
      }

      // Safety/violence detection
      if (
        /\b(violence|violent|abuse|abusive|fleeing|escape|hiding|stalker|attacker|dangerous|unsafe)\b/i.test(
          transcript,
        )
      ) {
        const safetyBoost = Math.max(0, 0.8 - score);
        score = Math.max(score, 0.8);
        contextBoost += safetyBoost;
        reasons.push("content_safety_floor");
      }
    }

    // Convert score to level using ADJUSTED THRESHOLDS (PHASE 2: Reduced over-assessment)
    let urgencyLevel;
    if (score >= 0.8)
      urgencyLevel = "CRITICAL"; // Raised from 0.75
    else if (score >= 0.5)
      urgencyLevel = "HIGH"; // Raised from 0.45
    else if (score >= 0.15)
      urgencyLevel = "MEDIUM"; // Raised from 0.20
    else urgencyLevel = "LOW";

    return {
      urgencyLevel,
      score,
      confidence: 0.7,
      reasons,
    };
  }

  /**
   * Get detailed assessment with debugging info
   * NO PII - only metadata logged
   */
  assessWithDebug(transcript, context = {}) {
    const assessment = this.assessUrgency(transcript, context);

    return {
      ...assessment,
      debug: {
        engineUsed: this.engine
          ? "UrgencyAssessmentEngine"
          : "FallbackPatterns",
        contextProvided: Object.keys(context).length > 0,
        transcriptLength: transcript?.length || 0,
        // NO transcript content logged
      },
    };
  }
}

// Export singleton instance
const urgencyService = new UrgencyAssessmentService();

module.exports = {
  UrgencyAssessmentService,
  assessUrgency: (transcript, context) =>
    urgencyService.assessUrgency(transcript, context),
  assessWithDebug: (transcript, context) =>
    urgencyService.assessWithDebug(transcript, context),
};
