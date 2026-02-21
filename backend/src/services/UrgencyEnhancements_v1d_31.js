/**
 * UrgencyEnhancements_v1d_31.js - Precision Tuning (Refined)
 *
 * Based on root cause analysis of V1d failure:
 * - Limited impact (only >0.5) → Extended range (0.4-0.9)
 * - Conservative reductions → Targeted threshold-crossing adjustments
 * - Late-stage application → Early integration coordination
 * - Generic patterns → Category-specific precision tuning
 *
 * Target: +3-5 cases from threshold boundary corrections
 * Philosophy: Surgical precision to cross urgency level boundaries
 */

class UrgencyEnhancements_v1d_31 {
  constructor() {
    this.debugMode = process.env.DEBUG_URGENCY_V1D_31 === "true";
  }

  /**
   * Apply V1d 3.1 precision tuning for threshold boundary corrections
   * @param {Object} story - The story object
   * @param {number} currentUrgency - Current urgency score (0-1)
   * @param {string} category - The detected category
   * @returns {Object} - Precision-tuned urgency result
   */
  tuneUrgencyPrecision(story, currentUrgency, category = "UNKNOWN") {
    try {
      const text = (story.story || "").toLowerCase();
      const title = (story.title || "").toLowerCase();
      const fullText = `${title} ${text}`;

      let adjustedUrgency = currentUrgency;
      let adjustments = [];
      let totalAdjustment = 0;

      // EXTENDED RANGE: Target boundary cases that need threshold crossing
      // Focus on cases near boundaries: 0.47 (HIGH threshold) and 0.77 (CRITICAL threshold)
      if (currentUrgency >= 0.4 && currentUrgency <= 0.9) {
        // BOUNDARY CORRECTION: Cases just above HIGH threshold that should be MEDIUM
        if (currentUrgency >= 0.47 && currentUrgency <= 0.55) {
          const mediumCorrectionAdjustment = this.correctToMedium(
            fullText,
            category,
            currentUrgency,
          );
          if (mediumCorrectionAdjustment < 0) {
            adjustedUrgency = Math.max(
              0.3,
              adjustedUrgency + mediumCorrectionAdjustment,
            );
            totalAdjustment += mediumCorrectionAdjustment;
            adjustments.push(
              `medium_boundary_correction(${mediumCorrectionAdjustment})`,
            );
          }
        }

        // BOUNDARY CORRECTION: Cases just below HIGH threshold that should be HIGH
        if (currentUrgency >= 0.4 && currentUrgency <= 0.46) {
          const highCorrectionAdjustment = this.correctToHigh(
            fullText,
            category,
            currentUrgency,
          );
          if (highCorrectionAdjustment > 0) {
            adjustedUrgency = Math.min(
              0.75,
              adjustedUrgency + highCorrectionAdjustment,
            );
            totalAdjustment += highCorrectionAdjustment;
            adjustments.push(
              `high_boundary_correction(+${highCorrectionAdjustment})`,
            );
          }
        }

        // BOUNDARY CORRECTION: Cases just above CRITICAL threshold that should be HIGH
        if (currentUrgency >= 0.77 && currentUrgency <= 0.85) {
          const criticalCorrectionAdjustment = this.correctFromCritical(
            fullText,
            category,
            currentUrgency,
          );
          if (criticalCorrectionAdjustment < 0) {
            adjustedUrgency = Math.max(
              0.6,
              adjustedUrgency + criticalCorrectionAdjustment,
            );
            totalAdjustment += criticalCorrectionAdjustment;
            adjustments.push(
              `critical_boundary_correction(${criticalCorrectionAdjustment})`,
            );
          }
        }

        // BOUNDARY CORRECTION: Cases just below CRITICAL threshold that should be CRITICAL
        if (currentUrgency >= 0.7 && currentUrgency <= 0.76) {
          const criticalPromotionAdjustment = this.correctToCritical(
            fullText,
            category,
            currentUrgency,
          );
          if (criticalPromotionAdjustment > 0) {
            adjustedUrgency = Math.min(
              0.9,
              adjustedUrgency + criticalPromotionAdjustment,
            );
            totalAdjustment += criticalPromotionAdjustment;
            adjustments.push(
              `critical_promotion(+${criticalPromotionAdjustment})`,
            );
          }
        }
      }

      if (this.debugMode && Math.abs(totalAdjustment) > 0.01) {
        console.log(
          `[V1d_3.1 Precision] Story: ${story.id || "unknown"} | Original: ${currentUrgency} | Tuned: ${adjustedUrgency} | Adjustment: ${totalAdjustment > 0 ? "+" : ""}${totalAdjustment} | Applied: ${adjustments.join(", ")}`,
        );
      }

      return {
        originalUrgency: currentUrgency,
        adjustedUrgency: adjustedUrgency,
        totalAdjustment: totalAdjustment,
        adjustments: adjustments,
        version: "v1d_3.1_boundary_precision",
      };
    } catch (error) {
      console.error(
        "[UrgencyEnhancements_v1d_31] Error in tuneUrgencyPrecision:",
        error,
      );
      return {
        originalUrgency: currentUrgency,
        adjustedUrgency: currentUrgency,
        totalAdjustment: 0,
        adjustments: [],
        error: error.message,
      };
    }
  }

  /**
   * Correct cases that should be MEDIUM (reduce from HIGH range)
   */
  correctToMedium(text, category, currentUrgency) {
    let adjustment = 0;

    // Cases that are clearly not HIGH urgency
    const nonHighIndicators = [
      /hoping.*might/i,
      /if.*possible/i,
      /would.*appreciate/i,
      /when.*convenient/i,
      /eventually.*need/i,
      /planning.*ahead/i,
      /routine.*check/i,
      /regular.*maintenance/i,
    ];

    const nonHighMatches = nonHighIndicators.filter((pattern) =>
      pattern.test(text),
    ).length;

    // Category-specific corrections
    if (
      category === "OTHER" &&
      /personal.*situation|hard.*to.*explain/i.test(text)
    ) {
      adjustment = 0.15 - currentUrgency; // Force to LOW-MEDIUM boundary
    } else if (
      category === "EDUCATION" &&
      /next.*semester|interested.*in/i.test(text)
    ) {
      adjustment = -0.1; // Reduce education future planning
    } else if (nonHighMatches >= 2) {
      adjustment = -0.08; // General non-urgent language reduction
    } else if (nonHighMatches >= 1) {
      adjustment = -0.05; // Minor reduction for single indicator
    }

    return Math.round(adjustment * 100) / 100;
  }

  /**
   * Correct cases that should be HIGH (boost from MEDIUM range)
   */
  correctToHigh(text, category, currentUrgency) {
    let adjustment = 0;

    // Cases that are clearly HIGH urgency
    const highIndicators = [
      /need.*immediately/i,
      /urgent.*help/i,
      /crisis.*situation/i,
      /desperate.*need/i,
      /running.*out.*time/i,
      /can't.*wait/i,
      /must.*have.*soon/i,
    ];

    const highMatches = highIndicators.filter((pattern) =>
      pattern.test(text),
    ).length;

    // Category-specific promotions
    if (
      category === "HOUSING" &&
      /eviction.*notice|pay.*or.*quit/i.test(text)
    ) {
      adjustment = 0.5 - currentUrgency; // Promote to solid HIGH
    } else if (
      category === "UTILITIES" &&
      /shutoff.*notice|disconnect.*tomorrow/i.test(text)
    ) {
      adjustment = 0.52 - currentUrgency; // Promote to HIGH
    } else if (
      category === "HEALTHCARE" &&
      /surgery.*scheduled|emergency.*procedure/i.test(text)
    ) {
      adjustment = 0.55 - currentUrgency; // Promote medical urgency
    } else if (highMatches >= 2) {
      adjustment = 0.48 - currentUrgency; // Promote with multiple high indicators
    } else if (highMatches >= 1) {
      adjustment = Math.min(0.05, 0.47 - currentUrgency); // Minor promotion
    }

    return Math.max(0, Math.round(adjustment * 100) / 100);
  }

  /**
   * Correct cases that should NOT be CRITICAL (reduce from CRITICAL range)
   */
  correctFromCritical(text, category, currentUrgency) {
    let adjustment = 0;

    // Cases that don't warrant CRITICAL urgency
    const nonCriticalIndicators = [
      /would.*like/i,
      /hoping.*for/i,
      /might.*need/i,
      /possibly.*help/i,
      /considering/i,
      /planning.*to/i,
      /in.*future/i,
      /someday/i,
    ];

    const nonCriticalMatches = nonCriticalIndicators.filter((pattern) =>
      pattern.test(text),
    ).length;

    // Category-specific demotions
    if (category === "OTHER") {
      adjustment = 0.65 - currentUrgency; // Force OTHER down from CRITICAL
    } else if (
      category === "EDUCATION" &&
      !/emergency|crisis|urgent/i.test(text)
    ) {
      adjustment = 0.7 - currentUrgency; // Education rarely CRITICAL
    } else if (nonCriticalMatches >= 2) {
      adjustment = 0.72 - currentUrgency; // Multiple non-critical indicators
    } else if (nonCriticalMatches >= 1) {
      adjustment = -0.05; // Minor reduction
    }

    return Math.round(adjustment * 100) / 100;
  }

  /**
   * Correct cases that should be CRITICAL (boost from HIGH range)
   */
  correctToCritical(text, category, currentUrgency) {
    let adjustment = 0;

    // Cases that truly warrant CRITICAL urgency
    const criticalIndicators = [
      /life.*threatening/i,
      /emergency.*surgery/i,
      /children.*danger/i,
      /homeless.*today/i,
      /evicted.*tomorrow/i,
      /shutoff.*today/i,
      /court.*tomorrow/i,
      /911|ambulance/i,
    ];

    const criticalMatches = criticalIndicators.filter((pattern) =>
      pattern.test(text),
    ).length;

    // Category-specific promotions to CRITICAL
    if (category === "SAFETY" && /violence|abuse|danger|threat/i.test(text)) {
      adjustment = 0.8 - currentUrgency; // Safety threats are CRITICAL
    } else if (category === "HEALTHCARE" && criticalMatches >= 1) {
      adjustment = 0.78 - currentUrgency; // Medical emergencies
    } else if (criticalMatches >= 2) {
      adjustment = 0.8 - currentUrgency; // Multiple critical indicators
    } else if (criticalMatches >= 1) {
      adjustment = Math.min(0.05, 0.77 - currentUrgency); // Minor promotion
    }

    return Math.max(0, Math.round(adjustment * 100) / 100);
  }
}

module.exports = UrgencyEnhancements_v1d_31;
