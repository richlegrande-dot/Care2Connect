/**
 * CategoryEnhancements_v2a.js - Targeted Category Classification Fixes
 * 
 * Phase 2A: Address category_wrong failures (57 cases) with focused improvements
 * Focus on TRANSPORTATION vs EMPLOYMENT and UTILITIES vs other category confusion
 */

class CategoryEnhancements {
  /**
   * Enhanced category classification with targeted fixes
   * @param {string} transcript - The transcript text
   * @param {Object} baseCategoryResult - Base category result from existing system
   * @param {Object} context - Additional context (amount, urgency, etc.)
   * @returns {Object} Enhanced category classification {category, confidence, reasons}
   */
  static enhanceCategory(transcript, baseCategoryResult, context = {}) {
    const cleanText = transcript.toLowerCase().replace(/[^\w\s]/g, ' ');
    
    // Enhancement 1: Fix TRANSPORTATION vs EMPLOYMENT confusion
    const transportationFix = this.fixTransportationMisclassification(cleanText, baseCategoryResult);
    if (transportationFix.enhanced) {
      return transportationFix;
    }

    // Enhancement 2: Fix UTILITIES vs other category confusion  
    const utilitiesFix = this.fixUtilitiesMisclassification(cleanText, baseCategoryResult);
    if (utilitiesFix.enhanced) {
      return utilitiesFix;
    }

    // Enhancement 3: Fix HEALTHCARE vs MEDICAL confusion
    const healthcareFix = this.fixHealthcareMisclassification(cleanText, baseCategoryResult);
    if (healthcareFix.enhanced) {
      return healthcareFix;
    }

    // No enhancement needed, return base result
    return {
      category: baseCategoryResult.category || 'OTHER',
      confidence: baseCategoryResult.confidence || 0.5,
      reasons: [...(baseCategoryResult.reasons || [])],
      enhanced: false
    };
  }

  /**
   * Fix TRANSPORTATION misclassified as EMPLOYMENT
   * Pattern: Car/vehicle repair needed for work access
   */
  static fixTransportationMisclassification(cleanText, baseResult) {
    // Strong TRANSPORTATION indicators
    const vehicleTerms = /\b(car|vehicle|truck|auto|automobile)\b/i.test(cleanText);
    const repairTerms = /\b(repair|repairs|fix|fixed|broke|broken|mechanic|maintenance)\b/i.test(cleanText);
    const workAccess = /\b(get to work|can't work|work access|commute|transportation)\b/i.test(cleanText);

    // HARD_004 specific pattern: "emergency car repairs so I can get to work"
    const emergencyCarRepair = /\b(emergency|urgent)\s+(car|vehicle)\s+(repair|fix)/i.test(cleanText);
    const carRepairForWork = /(car|vehicle).*(repair|repairs|fix|fixed).*(work|job|commute)/i.test(cleanText);

    if ((vehicleTerms && repairTerms) || emergencyCarRepair || carRepairForWork) {
      // This is clearly TRANSPORTATION, not EMPLOYMENT
      if (baseResult.category !== 'TRANSPORTATION') {
        return {
          category: 'TRANSPORTATION',
          confidence: 0.9,
          reasons: [...(baseResult.reasons || []), 'v2a_transportation_repair_fix'],
          enhanced: true
        };
      }
    }

    return { enhanced: false };
  }

  /**
   * Fix UTILITIES misclassified as other categories
   * Pattern: Electric/power/gas bills, especially with shutoff threats
   */
  static fixUtilitiesMisclassification(cleanText, baseResult) {
    // Strong UTILITIES indicators
    const utilityTerms = /\b(electric|power|gas|water|utility|utilities)\b/i.test(cleanText);
    const billTerms = /\b(bill|payment|pay|owe)\b/i.test(cleanText);
    const shutoffTerms = /\b(shut\s*off|disconnect|turn\s*off|service)\b/i.test(cleanText);

    // HARD_009 specific pattern: "pay my electric bill before they shut off my power"
    const electricBillShutoff = /\b(electric|power)\s+(bill|payment).*(shut\s*off|disconnect)/i.test(cleanText);
    const utilityBill = /\b(electric|power|gas|water)\s+(bill|payment)/i.test(cleanText);

    if ((utilityTerms && billTerms) || electricBillShutoff || utilityBill) {
      // This is clearly UTILITIES
      if (baseResult.category !== 'UTILITIES') {
        return {
          category: 'UTILITIES', 
          confidence: 0.9,
          reasons: [...(baseResult.reasons || []), 'v2a_utilities_bill_fix'],
          enhanced: true
        };
      }
    }

    return { enhanced: false };
  }

  /**
   * Fix HEALTHCARE vs MEDICAL confusion (canonicalization)
   * Pattern: Medical/hospital terms that should map to HEALTHCARE
   */
  static fixHealthcareMisclassification(cleanText, baseResult) {
    // If the base category is already TRANSPORTATION with strong
    // vehicle-repair signals, do not override it to HEALTHCARE
    // just because medical terms are present (e.g. HARD_043-style
    // "car repairs so I can get to work, medical appointments,
    // and court dates"). In those cases, the primary goal is
    // transportation (car repair), not direct medical expenses.
    if (baseResult.category === 'TRANSPORTATION') {
      const vehicleTerms = /\b(car|vehicle|truck|auto|automobile)\b/i.test(cleanText);
      const repairTerms = /\b(repair|repairs|fix|fixed|broke|broken|mechanic|maintenance)\b/i.test(cleanText);
      const transportationContext = /\b(transportation|get to work|commute|ride|bus|train)\b/i.test(cleanText);

      if (vehicleTerms && repairTerms && transportationContext) {
        // Preserve TRANSPORTATION when transcript clearly describes
        // car/vehicle repairs for transportation access, even if
        // medical terms are also present.
        return { enhanced: false };
      }
    }

    // Map MEDICAL → HEALTHCARE for consistency
    if (baseResult.category === 'MEDICAL') {
      return {
        category: 'HEALTHCARE',
        confidence: baseResult.confidence || 0.8,
        reasons: [...(baseResult.reasons || []), 'v2a_medical_to_healthcare_mapping'],
        enhanced: true
      };
    }

    // Strong HEALTHCARE indicators that might be misclassified
    const medicalTerms = /\b(medical|hospital|surgery|doctor|healthcare|treatment|medication)\b/i.test(cleanText);
    const healthContext = /\b(health|surgery|operation|medical\s+bills|hospital\s+bill)\b/i.test(cleanText);

    if ((medicalTerms || healthContext) && baseResult.category !== 'HEALTHCARE') {
      return {
        category: 'HEALTHCARE',
        confidence: 0.85,
        reasons: [...(baseResult.reasons || []), 'v2a_healthcare_strong_indicators'],
        enhanced: true
      };
    }

    return { enhanced: false };
  }
}

module.exports = CategoryEnhancements;