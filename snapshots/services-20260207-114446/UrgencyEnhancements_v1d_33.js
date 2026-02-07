/**
 * V1d_3.3 Flexible Pattern Enhancement
 * 
 * DESIGN EVOLUTION FROM V1D_3.2:
 * V1d_3.2 failed with 0% improvement due to overly restrictive pattern combinations.
 * Root cause: Requiring multiple keywords together (surgery + accident + hospital) 
 * created patterns that rarely exist in natural language narratives.
 * 
 * V1D_3.3 IMPROVEMENTS:
 * 1. Single strong indicators instead of keyword combinations
 * 2. Contextual phrase patterns (e.g., "need surgery", "eviction notice")
 * 3. Temporal urgency markers ("tomorrow", "this week", "immediately")
 * 4. Consequence indicators ("will lose", "can't afford", "no other option")
 * 5. Maintains validated correction magnitudes from V1d_3.2
 * 
 * CORRECTION MAGNITUDES (evidence-based from V1d_3.2 validation):
 * - CRITICAL boundary: +0.15 (93% → 98% → CRITICAL)
 * - HIGH boundary: +0.08 (82% → 90% → HIGH)
 * - MEDIUM precision: ±0.03-0.05 (fine-tuning within band)
 */

class UrgencyEnhancements_v1d_33 {
  constructor() {
    this.version = 'v1d_3.3';
  }

  /**
   * Static method for service integration
   */
  static tuneUrgencyPrecision(story, currentUrgency, category = 'UNKNOWN') {
    const instance = new UrgencyEnhancements_v1d_33();
    return instance.tuneUrgencyPrecisionInstance(story, currentUrgency, category);
  }

  /**
   * Main tuning method - applies flexible pattern-based corrections
   */
  tuneUrgencyPrecisionInstance(story, currentScore, categoryInfo) {
    const corrections = {
      originalScore: currentScore,
      adjustments: [],
      finalScore: currentScore
    };

    // Extract category if passed as object
    const category = typeof categoryInfo === 'string' ? categoryInfo : 
                    (categoryInfo?.category || categoryInfo?.predictedCategory || 'UNKNOWN');

    const debug = process.env.NODE_ENV === 'development';
    if (debug) {
      console.log(`[V1d_3.3 Diagnostic] Testing story at score ${currentScore.toFixed(3)} (${category})`);
    }

    // Apply corrections in priority order
    const criticalCorrection = this.applyCriticalBoundaryCorrection(story, corrections.finalScore, category);
    if (criticalCorrection.applied) {
      corrections.adjustments.push(criticalCorrection);
      corrections.finalScore = criticalCorrection.newScore;
    }

    const highCorrection = this.applyHighBoundaryCorrection(story, corrections.finalScore, category);
    if (highCorrection.applied) {
      corrections.adjustments.push(highCorrection);
      corrections.finalScore = highCorrection.newScore;
    }

    const mediumCorrection = this.applyMediumPrecisionCorrection(story, corrections.finalScore, category);
    if (mediumCorrection.applied) {
      corrections.adjustments.push(mediumCorrection);
      corrections.finalScore = mediumCorrection.newScore;
    }

    // Clamp final score
    corrections.finalScore = Math.max(0, Math.min(1, corrections.finalScore));

    if (process.env.NODE_ENV === 'development' && corrections.adjustments.length > 0) {
      console.log(`[V1d_3.3] Applied ${corrections.adjustments.length} correction(s):`, 
                  corrections.adjustments.map(a => a.reason));
    }

    return {
      originalUrgency: currentScore,
      adjustedUrgency: corrections.finalScore,
      totalAdjustment: corrections.finalScore - currentScore,
      adjustments: corrections.adjustments.map(a => a.reason),
      version: this.version
    };
  }

  /**
   * CRITICAL boundary correction (85% → 98% → CRITICAL)
   * Target: Cases near CRITICAL threshold that have life-threatening urgency
   */
  applyCriticalBoundaryCorrection(story, currentScore, category) {
    // Only apply to HIGH/near-CRITICAL cases (85-99%)
    if (currentScore < 0.85 || currentScore > 0.99) {
      return { applied: false, adjustment: 0, newScore: currentScore };
    }

    const storyText = (story.story || story.transcriptText || '').toLowerCase();

    // Pattern 1: Imminent medical procedures
    if (this.hasImminentMedicalProcedure(storyText)) {
      return {
        applied: true,
        adjustment: 0.15,
        newScore: currentScore + 0.15,
        reason: 'Imminent medical procedure (surgery/operation) with temporal urgency'
      };
    }

    // Pattern 2: Immediate housing loss
    if (this.hasImmediateHousingLoss(storyText)) {
      return {
        applied: true,
        adjustment: 0.15,
        newScore: currentScore + 0.15,
        reason: 'Immediate housing loss (eviction notice/deadline)'
      };
    }

    // Pattern 3: Life-threatening health crisis
    if (this.hasLifeThreateningCrisis(storyText)) {
      return {
        applied: true,
        adjustment: 0.15,
        newScore: currentScore + 0.15,
        reason: 'Life-threatening health crisis with urgent treatment need'
      };
    }

    return { applied: false, adjustment: 0, newScore: currentScore };
  }

  /**
   * HIGH boundary correction (75% → 90% → HIGH)
   * Target: Cases near HIGH threshold with significant time pressure
   */
  applyHighBoundaryCorrection(story, currentScore, category) {
    // Only apply to MEDIUM/near-HIGH cases (75-92%)
    if (currentScore < 0.75 || currentScore > 0.92) {
      return { applied: false, adjustment: 0, newScore: currentScore };
    }

    const storyText = (story.story || story.transcriptText || '').toLowerCase();

    // Pattern 1: Job loss with dependents
    if (this.hasJobLossWithDependents(storyText)) {
      return {
        applied: true,
        adjustment: 0.08,
        newScore: currentScore + 0.08,
        reason: 'Job loss with family dependents and time-sensitive needs'
      };
    }

    // Pattern 2a: Immediate housing loss (also checked at HIGH for overlap cases)
    if (this.hasImmediateHousingLoss(storyText)) {
      return {
        applied: true,
        adjustment: 0.08,
        newScore: currentScore + 0.08,
        reason: 'Eviction notice or immediate housing loss'
      };
    }

    // Pattern 2b: Impending eviction (not immediate)
    if (this.hasImpendingEviction(storyText)) {
      return {
        applied: true,
        adjustment: 0.08,
        newScore: currentScore + 0.08,
        reason: 'Impending eviction with near-term deadline'
      };
    }

    // Pattern 3: Medical expense urgency
    if (this.hasMedicalExpenseUrgency(storyText)) {
      return {
        applied: true,
        adjustment: 0.08,
        newScore: currentScore + 0.08,
        reason: 'Urgent medical expenses preventing treatment access'
      };
    }

    // Pattern 4: Utility shutoff
    if (this.hasUtilityShutoff(storyText)) {
      return {
        applied: true,
        adjustment: 0.08,
        newScore: currentScore + 0.08,
        reason: 'Utility shutoff notice with immediate service disruption risk'
      };
    }

    return { applied: false, adjustment: 0, newScore: currentScore };
  }

  /**
   * MEDIUM precision correction (±0.03-0.05)
   * Target: Fine-tuning within MEDIUM band
   */
  applyMediumPrecisionCorrection(story, currentScore, category) {
    // Apply to broader MEDIUM/LOW range (40-85%)
    if (currentScore < 0.40 || currentScore > 0.85) {
      return { applied: false, adjustment: 0, newScore: currentScore };
    }

    const storyText = (story.story || story.transcriptText || '').toLowerCase();

    // Pattern 1: Vehicle essential for work (boost)
    if (this.hasEssentialVehicleNeed(storyText)) {
      return {
        applied: true,
        adjustment: 0.05,
        newScore: currentScore + 0.05,
        reason: 'Vehicle essential for work/income with repair urgency'
      };
    }

    // Pattern 2: General life improvement (dampen)
    if (this.hasGeneralImprovementLanguage(storyText)) {
      return {
        applied: true,
        adjustment: -0.03,
        newScore: currentScore - 0.03,
        reason: 'General improvement narrative without acute urgency markers'
      };
    }

    // Pattern 3: Debt consolidation without crisis (dampen)
    if (this.hasDebtConsolidationWithoutCrisis(storyText)) {
      return {
        applied: true,
        adjustment: -0.03,
        newScore: currentScore - 0.03,
        reason: 'Debt management without immediate crisis indicators'
      };
    }

    return { applied: false, adjustment: 0, newScore: currentScore };
  }

  // ==================== PATTERN MATCHERS ====================

  /**
   * CRITICAL Pattern 1: Imminent medical procedure
   * Looks for: "need surgery", "scheduled surgery", "operation tomorrow"
   */
  hasImminentMedicalProcedure(text) {
    const procedureTerms = ['surgery', 'operation', 'procedure'];
    const temporalTerms = ['need', 'scheduled', 'upcoming', 'soon', 'tomorrow', 
                           'next week', 'this week', 'this month', 'next month',
                           'today', 'tonight', 'monday', 'tuesday', 'wednesday', 
                           'thursday', 'friday', 'saturday', 'sunday', 'days', 'weeks'];
    
    const debug = process.env.NODE_ENV === 'development';
    const foundProcedure = procedureTerms.find(term => text.includes(term));
    const foundTemporal = temporalTerms.find(term => text.includes(term));
    
    if (debug && (foundProcedure || foundTemporal)) {
      console.log(`  [Medical Procedure] Found: procedure="${foundProcedure || 'NONE'}" temporal="${foundTemporal || 'NONE'}"`);
    }
    
    // Look for procedure term near temporal urgency
    for (const procedure of procedureTerms) {
      if (text.includes(procedure)) {
        for (const temporal of temporalTerms) {
          if (text.includes(temporal)) {
            if (debug) console.log(`  [Medical Procedure] ✓ MATCH: "${procedure}" + "${temporal}"`);
            return true;
          }
        }
      }
    }
    
    // Also match direct phrases
    const directPhrases = [
      'need surgery',
      'needs surgery',
      'require surgery',
      'scheduled for surgery',
      'scheduled operation',
      'upcoming surgery',
      'upcoming operation'
    ];
    
    const matchedPhrase = directPhrases.find(phrase => text.includes(phrase));
    if (matchedPhrase && debug) {
      console.log(`  [Medical Procedure] ✓ MATCH: phrase="${matchedPhrase}"`);
    }
    
    return !!matchedPhrase;
  }

  /**
   * CRITICAL Pattern 2: Immediate housing loss
   * Looks for: "eviction notice", "losing home", "homeless tomorrow"
   */
  hasImmediateHousingLoss(text) {
    const immediateEvictionPhrases = [
      'eviction notice',
      'notice to vacate',
      'being evicted',
      'losing home',
      'lose home',
      'lost home',
      'facing eviction',
      'homeless',
      'evicted'
    ];
    
    const temporalUrgency = ['tomorrow', 'this week', 'next week', 'today', 'tonight',
                             'days', 'soon', 'immediately', 'monday', 'tuesday', 
                             'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    const debug = process.env.NODE_ENV === 'development';
    const foundEvictionPhrase = immediateEvictionPhrases.find(phrase => text.includes(phrase));
    
    // Direct phrase match
    if (foundEvictionPhrase) {
      if (debug) console.log(`  [Housing Loss] ✓ MATCH: phrase="${foundEvictionPhrase}"`);
      return true;
    }
    
    // Or housing + urgency
    const housingTerms = ['rent', 'apartment', 'home', 'housing'];
    const lossTerms = ['lose', 'lost', 'losing', 'evict'];
    
    const foundHousing = housingTerms.find(term => text.includes(term));
    const foundLoss = lossTerms.find(term => text.includes(term));
    const foundTemporal = temporalUrgency.find(term => text.includes(term));
    
    if (debug && (foundHousing || foundLoss || foundTemporal)) {
      console.log(`  [Housing Loss] Found: housing="${foundHousing || 'NONE'}" loss="${foundLoss || 'NONE'}" temporal="${foundTemporal || 'NONE'}"`);
    }
    
    const hasHousing = !!foundHousing;
    const hasLoss = !!foundLoss;
    const hasTemporal = !!foundTemporal;
    
    if (hasHousing && hasLoss && hasTemporal && debug) {
      console.log(`  [Housing Loss] ✓ MATCH: "${foundHousing}" + "${foundLoss}" + "${foundTemporal}"`);
    }
    
    return hasHousing && hasLoss && hasTemporal;
  }

  /**
   * CRITICAL Pattern 3: Life-threatening health crisis
   * Looks for: "life-threatening", "dying", "critical condition"
   */
  hasLifeThreateningCrisis(text) {
    const lifeThreatPhrases = [
      'life-threatening',
      'life threatening',
      'dying',
      'critical condition',
      'terminal',
      'fatal',
      'urgent medical',
      'emergency surgery',
      'heart attack',
      'stroke',
      'cancer treatment'
    ];
    
    return lifeThreatPhrases.some(phrase => text.includes(phrase));
  }

  /**
   * HIGH Pattern 1: Job loss with dependents
   * Looks for: "lost job" + "children"/"family"
   */
  hasJobLossWithDependents(text) {
    const jobLossTerms = ['lost job', 'lost my job', 'laid off', 'unemployed', 'fired', 'job loss'];
    const dependentTerms = ['child', 'children', 'kids', 'family', 'son', 'daughter', 'dependents'];
    
    const debug = process.env.NODE_ENV === 'development';
    const foundJobLoss = jobLossTerms.find(term => text.includes(term));
    const foundDependent = dependentTerms.find(term => text.includes(term));
    
    if (debug && (foundJobLoss || foundDependent)) {
      console.log(`  [Job Loss + Dependents] Found: jobLoss="${foundJobLoss || 'NONE'}" dependents="${foundDependent || 'NONE'}"`);
    }
    
    const hasJobLoss = !!foundJobLoss;
    const hasDependents = !!foundDependent;
    
    if (hasJobLoss && hasDependents && debug) {
      console.log(`  [Job Loss + Dependents] ✓ MATCH: "${foundJobLoss}" + "${foundDependent}"`);
    }
    
    return hasJobLoss && hasDependents;
  }

  /**
   * HIGH Pattern 2: Impending eviction
   * Looks for: eviction mentioned but not immediate (no "tomorrow"/"this week")
   */
  hasImpendingEviction(text) {
    const evictionTerms = ['evict', 'behind on rent', 'late rent', 'rent overdue', 'facing eviction'];
    const urgencyTerms = ['soon', 'next month', 'weeks', 'urgent'];
    
    const hasEviction = evictionTerms.some(term => text.includes(term));
    const hasUrgency = urgencyTerms.some(term => text.includes(term));
    
    // Not immediate (checked in CRITICAL)
    const isImmediate = text.includes('tomorrow') || text.includes('this week') || text.includes('days');
    
    return hasEviction && hasUrgency && !isImmediate;
  }

  /**
   * HIGH Pattern 3: Medical expense urgency
   * Looks for: "can't afford treatment", "need medical help", "medical bills"
   */
  hasMedicalExpenseUrgency(text) {
    const cantAffordPhrases = [
      "can't afford",
      'cannot afford',
      'unable to pay',
      "can't pay"
    ];
    
    const medicalTerms = ['medical', 'treatment', 'medicine', 'prescription', 'doctor', 'hospital'];
    
    const hasCantAfford = cantAffordPhrases.some(phrase => text.includes(phrase));
    const hasMedical = medicalTerms.some(term => text.includes(term));
    
    return hasCantAfford && hasMedical;
  }

  /**
   * HIGH Pattern 4: Utility shutoff
   * Looks for: "shutoff notice", "disconnect", electric/water/gas bill
   */
  hasUtilityShutoff(text) {
    const shutoffPhrases = [
      'shutoff notice',
      'shut off',
      'disconnect',
      'disconnection',
      'service cutoff',
      'cutoff notice'
    ];
    
    const utilityTerms = ['electric', 'electricity', 'water', 'gas', 'utility', 'utilities', 'bill'];
    
    const debug = process.env.NODE_ENV === 'development';
    const foundShutoff = shutoffPhrases.find(phrase => text.includes(phrase));
    const foundUtility = utilityTerms.find(term => text.includes(term));
    
    if (debug && (foundShutoff || foundUtility)) {
      console.log(`  [Utility Shutoff] Found: shutoff="${foundShutoff || 'NONE'}" utility="${foundUtility || 'NONE'}"`);
    }
    
    const hasShutoff = !!foundShutoff;
    const hasUtility = !!foundUtility;
    
    if (hasShutoff && hasUtility && debug) {
      console.log(`  [Utility Shutoff] ✓ MATCH: "${foundShutoff}" + "${foundUtility}"`);
    }
    
    return hasShutoff && hasUtility;
  }

  /**
   * MEDIUM Pattern 1: Vehicle essential for work (boost)
   * Looks for: "car broke down" + "need for work"
   */
  hasEssentialVehicleNeed(text) {
    const vehicleTerms = ['car', 'vehicle', 'truck', 'transportation'];
    const problemTerms = ['broke', 'broken', 'repair', 'fix', 'broke down'];
    const workTerms = ['work', 'job', 'commute', 'get to work', 'employment'];
    
    const debug = process.env.NODE_ENV === 'development';
    const foundVehicle = vehicleTerms.find(term => text.includes(term));
    const foundProblem = problemTerms.find(term => text.includes(term));
    const foundWork = workTerms.find(term => text.includes(term));
    
    if (debug && (foundVehicle || foundProblem || foundWork)) {
      console.log(`  [Essential Vehicle] Found: vehicle="${foundVehicle || 'NONE'}" problem="${foundProblem || 'NONE'}" work="${foundWork || 'NONE'}"`);
    }
    
    const hasVehicle = !!foundVehicle;
    const hasProblem = !!foundProblem;
    const hasWork = !!foundWork;
    
    // Accept if vehicle + problem (work mention helpful but not required)
    if (hasVehicle && hasProblem) {
      if (debug) {
        console.log(`  [Essential Vehicle] ✓ MATCH: "${foundVehicle}" + "${foundProblem}"${hasWork ? ' + "' + foundWork + '"' : ''}`);
      }
      return true;
    }
    
    return false;
  }

  /**
   * MEDIUM Pattern 2: General improvement language (dampen)
   * Looks for: "would like to", "want to improve", "hope to"
   */
  hasGeneralImprovementLanguage(text) {
    const improvementPhrases = [
      'would like to',
      'want to',
      'hope to',
      'trying to',
      'working towards',
      'goal is to',
      'improve my',
      'better myself',
      'get ahead'
    ];
    
    // Must have improvement language but NOT urgent language
    const hasImprovement = improvementPhrases.some(phrase => text.includes(phrase));
    const urgentTerms = ['urgent', 'immediately', 'asap', 'emergency', 'crisis', 'desperate'];
    const hasUrgent = urgentTerms.some(term => text.includes(term));
    
    return hasImprovement && !hasUrgent;
  }

  /**
   * MEDIUM Pattern 3: Debt consolidation without crisis (dampen)
   * Looks for: "consolidate debt" without "can't pay"/"collections"
   */
  hasDebtConsolidationWithoutCrisis(text) {
    const consolidationTerms = ['consolidate', 'consolidation', 'refinance', 'pay off debt'];
    const crisisTerms = ["can't pay", 'collections', 'default', 'bankruptcy', 'foreclosure'];
    
    const hasConsolidation = consolidationTerms.some(term => text.includes(term));
    const hasCrisis = crisisTerms.some(term => text.includes(term));
    
    return hasConsolidation && !hasCrisis;
  }
}

module.exports = UrgencyEnhancements_v1d_33;
