/**
 * UrgencyEnhancements_v1b.js - Targeted Urgency Improvements
 * 
 * Phase 1B: Simple, focused enhancements to reduce urgency under-assessment
 * without disrupting the stable v1 architecture.
 * 
 * Targets: 196 urgency_under_assessed cases from baseline analysis
 * Approach: Add specific high-confidence patterns with conservative scoring
 */

class UrgencyEnhancements {
  /**
   * Enhanced urgency assessment with targeted improvements
   * @param {string} transcript - The transcript text
   * @param {Object} baseAssessment - Base assessment from v1 service 
   * @param {Object} context - Additional context (category, amount, etc.)
   * @returns {Object} Enhanced assessment {score, urgency, reasons}
   */
  static enhanceAssessment(transcript, baseAssessment, context = {}) {
    const cleanText = transcript.toLowerCase().replace(/[^\w\s]/g, ' ');
    let enhancedScore = baseAssessment.score || 0;
    let reasons = [...(baseAssessment.reasons || [])];
    let appliedEnhancements = [];

    // Enhancement 1: CRITICAL eviction patterns (only boost to CRITICAL if below 0.77)
    const criticalEvictionPatterns = [
      // Time-critical eviction patterns - only boost if not already HIGH+
      /\beviction\s+notice.*(?:yesterday|got.*yesterday).*(?:have\s+to\s+pay|must\s+pay|pay\s+by).*(?:tomorrow|by\s+tomorrow)\b/i,
      /\b(?:have\s+to\s+pay|must\s+pay).*(?:by\s+tomorrow|tomorrow).*(?:or|otherwise).*(?:evict|evicted|homeless|vacate)\b/i,
      /\b(?:power|electric|utilities).*(?:shut\s+off|disconnect).*(?:in\s+\d+\s+days|tomorrow|by\s+tomorrow).*\$\d+/i,
      // Multi-month behind + eviction = truly critical
      /\b(?:behind.*(?:two|three|2|3).*months).*(?:facing\s+eviction)/i,
    ];

    // Only boost to CRITICAL if current score is below CRITICAL threshold (0.77)
    if (enhancedScore < 0.77) {
      for (const pattern of criticalEvictionPatterns) {
        if (pattern.test(cleanText)) {
          const boost = Math.min(0.15, 0.80 - enhancedScore); // Conservative CRITICAL boost
          if (boost > 0) {
            enhancedScore += boost;
            appliedEnhancements.push('critical_eviction_temporal');
            reasons.push('v1b_critical_eviction_enhancement');
            break;
          }
        }
      }
    }

    // Enhancement 1B: HIGH eviction patterns (boost to HIGH if currently MEDIUM/LOW)
    const highEvictionPatterns = [
      /\b(?:about\s+to\s+be\s+evicted|facing\s+eviction)/i,
      /\b(?:behind.*month).*(?:facing\s+eviction|rent|evict)/i,
    ];

    // Only boost to HIGH if current score is below HIGH threshold (0.47)
    if (enhancedScore < 0.47 && appliedEnhancements.length === 0) {
      for (const pattern of highEvictionPatterns) {
        if (pattern.test(cleanText)) {
          const boost = Math.min(0.12, 0.55 - enhancedScore); // Moderate HIGH boost
          if (boost > 0) {
            enhancedScore += boost;
            appliedEnhancements.push('high_eviction');
            reasons.push('v1b_high_eviction_enhancement');
            break;
          }
        }
      }
    }

    // Enhancement 2: CRITICAL medical patterns - surgery emergencies
    const criticalMedicalPatterns = [
      /\b(?:surgery|operation).*(?:tomorrow|next\s+week|scheduled\s+for|emergency|urgent|can't\s+wait)/i,
      /\b(?:daughter|child|son).*(?:car\s+accident).*(?:surgery|operation)/i, // T002 pattern
      /\b(?:emergency\s+surgery|urgent\s+surgery|immediate\s+surgery)/i,
    ];

    // Only boost to CRITICAL if current score is below CRITICAL threshold (0.77) 
    if (enhancedScore < 0.77 && appliedEnhancements.length === 0) {
      for (const pattern of criticalMedicalPatterns) {
        if (pattern.test(cleanText)) {
          const boost = Math.min(0.35, 0.85 - enhancedScore); // Stronger boost for critical medical
          if (boost > 0) {
            enhancedScore += boost;
            appliedEnhancements.push('critical_medical_emergency');
            reasons.push('v1b_critical_medical_enhancement');
            break;
          }
        }
      }
    }

    // Enhancement 2B: HIGH medical patterns (surgery but less urgent)
    const highMedicalPatterns = [
      /\b(?:daughter|child|son|family\s+member).*(?:needs\s+surgery|surgery)/i,
      /\b(?:needs?\s+surgery).*(?:hospital|doctor|operation)/i,
      /\b(?:surgery|operation).*(?:need|dollars|cost)/i,
      /\b(?:medication|medicine|prescription).*(?:urgent|running\s+out)/i,
    ];

    // Only boost to HIGH if current score is below HIGH threshold (0.47)
    if (enhancedScore < 0.47 && appliedEnhancements.length === 0) {
      for (const pattern of highMedicalPatterns) {
        if (pattern.test(cleanText)) {
          const boost = Math.min(0.12, 0.55 - enhancedScore); // Moderate HIGH boost
          if (boost > 0) {
            enhancedScore += boost;
            appliedEnhancements.push('high_medical_urgency');
            reasons.push('v1b_high_medical_enhancement');
            break;
          }
        }
      }
    }

    // Enhancement 3: Time-critical scenarios (boost to HIGH if currently MEDIUM/LOW)
    const timeCriticalPatterns = [
      /\b(?:by\s+friday|by\s+tomorrow|due\s+tomorrow|need.*by.*friday)/i,
      /\b(?:eviction\s+notice|shutoff\s+notice|disconnect.*notice).*(?:by|until|due)/i,
      /\b(?:court\s+date|hearing).*(?:tomorrow|next\s+week|monday|friday)/i,
      /\b(?:surgery|operation).*(?:scheduled|tomorrow|next\s+week)/i,
    ];

    // Only boost to HIGH if current score is below HIGH threshold (0.47)
    if (enhancedScore < 0.47 && appliedEnhancements.length === 0) {
      for (const pattern of timeCriticalPatterns) {
        if (pattern.test(cleanText)) {
          const boost = Math.min(0.10, 0.50 - enhancedScore); // Moderate HIGH boost
          if (boost > 0) {
            enhancedScore += boost;
            appliedEnhancements.push('time_critical');
            reasons.push('v1b_time_critical_enhancement');
            break;
          }
        }
      }
    }

    // Enhancement 4: Family crisis with children (boost to HIGH if currently MEDIUM/LOW)
    const familyCrisisPatterns = [
      /\b(?:children|kids|child).*(?:no\s+food|hungry|starving|haven't\s+eaten)/i,
      /\b(?:my\s+(?:child|children|kids|son|daughter)).*(?:need|urgent|emergency)/i,
      /\b(?:single\s+mom|single\s+parent).*(?:can't\s+afford|struggling|desperate)/i,
      /\b(?:custody|cps|child\s+services).*(?:hearing|court|emergency)/i,
    ];

    // Only boost to HIGH if current score is below HIGH threshold (0.47)
    if (enhancedScore < 0.47 && appliedEnhancements.length === 0) {
      for (const pattern of familyCrisisPatterns) {
        if (pattern.test(cleanText)) {
          const boost = Math.min(0.10, 0.50 - enhancedScore); // Moderate HIGH boost
          if (boost > 0) {
            enhancedScore += boost;
            appliedEnhancements.push('family_crisis');
            reasons.push('v1b_family_crisis_enhancement');
            break;
          }
        }
      }
    }

    // Map enhanced score to urgency levels using v1 thresholds
    const urgency = this.mapScoreToUrgency(enhancedScore);

    return {
      score: Math.min(enhancedScore, 1.0), // Cap at 1.0
      urgency,
      reasons,
      enhancements: appliedEnhancements
    };
  }

  /**
   * Map numeric score to urgency level (matching v1 thresholds)
   */
  static mapScoreToUrgency(score) {
    if (score >= 0.77) return 'CRITICAL';
    if (score >= 0.47) return 'HIGH';  
    if (score >= 0.15) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Check if enhancement is applicable (avoid over-enhancement)
   */
  static shouldEnhance(baseUrgency, targetUrgency) {
    const levels = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
    return levels[targetUrgency] > levels[baseUrgency];
  }
}

module.exports = UrgencyEnhancements;