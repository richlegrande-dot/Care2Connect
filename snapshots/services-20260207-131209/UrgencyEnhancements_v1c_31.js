/**
 * UrgencyEnhancements_v1c_3.1.js - Conservative Urgency Intelligence (Refined)
 * 
 * Based on root cause analysis of V1c failure:
 * - Over-aggressive patterns (0.4-0.5 boosts) → Conservative boosts (0.05-0.15 max)
 * - Broad activation threshold (0.75) → Precise sweet spot targeting (0.35-0.6)
 * - Pattern stacking conflicts → Coordination with V1b system
 * - Generic pattern matching → High-confidence pattern filtering only
 * 
 * Target: +5-8 cases from highest-confidence urgency_under_assessed scenarios
 * Philosophy: Minimal viable enhancement, no regression tolerance
 */

class UrgencyEnhancements_v1c_31 {
    constructor() {
        this.debugMode = process.env.DEBUG_URGENCY_V1C_31 === 'true';
        this.maxTotalBoost = 0.15; // Conservative maximum boost
    }

    /**
     * Apply V1c 3.1 conservative urgency intelligence
     * @param {Object} story - The story object
     * @param {number} currentUrgency - Current urgency score (0-1)
     * @returns {Object} - Enhanced urgency result
     */
    enhanceUrgency(story, currentUrgency) {
        try {
            const text = (story.story || '').toLowerCase();
            const title = (story.title || '').toLowerCase();
            const fullText = `${title} ${text}`;
            
            let adjustedUrgency = currentUrgency;
            let enhancements = [];
            let totalBoost = 0;

            // PRECISE SWEET SPOT: Only target cases that are clearly under-assessed
            // Range 0.35-0.6: Cases that should be HIGH but are assessed as MEDIUM
            if (currentUrgency >= 0.35 && currentUrgency <= 0.6) {
                
                // HIGH-CONFIDENCE ONLY: Explicit deadline + consequence patterns
                const explicitDeadlineBoost = this.detectExplicitDeadlineUrgency(fullText);
                if (explicitDeadlineBoost > 0) {
                    adjustedUrgency = Math.min(0.8, adjustedUrgency + explicitDeadlineBoost);
                    totalBoost += explicitDeadlineBoost;
                    enhancements.push(`explicit_deadline(+${explicitDeadlineBoost})`);
                }

                // HIGH-CONFIDENCE ONLY: Children at immediate risk patterns  
                const childrenRiskBoost = this.detectChildrenAtRisk(fullText);
                if (childrenRiskBoost > 0 && totalBoost < this.maxTotalBoost) {
                    const remainingBudget = this.maxTotalBoost - totalBoost;
                    const appliedBoost = Math.min(childrenRiskBoost, remainingBudget);
                    adjustedUrgency = Math.min(0.8, adjustedUrgency + appliedBoost);
                    totalBoost += appliedBoost;
                    enhancements.push(`children_risk(+${appliedBoost})`);
                }

                // HIGH-CONFIDENCE ONLY: Medical emergency with explicit timeframe
                const medicalEmergencyBoost = this.detectMedicalEmergencyExplicit(fullText);
                if (medicalEmergencyBoost > 0 && totalBoost < this.maxTotalBoost) {
                    const remainingBudget = this.maxTotalBoost - totalBoost;
                    const appliedBoost = Math.min(medicalEmergencyBoost, remainingBudget);
                    adjustedUrgency = Math.min(0.8, adjustedUrgency + appliedBoost);
                    totalBoost += appliedBoost;
                    enhancements.push(`medical_emergency_explicit(+${appliedBoost})`);
                }

                // HIGH-CONFIDENCE ONLY: Utility shutoff with children present
                const utilityCrisisBoost = this.detectUtilityCrisisWithChildren(fullText);
                if (utilityCrisisBoost > 0 && totalBoost < this.maxTotalBoost) {
                    const remainingBudget = this.maxTotalBoost - totalBoost;
                    const appliedBoost = Math.min(utilityCrisisBoost, remainingBudget);
                    adjustedUrgency = Math.min(0.8, adjustedUrgency + appliedBoost);
                    totalBoost += appliedBoost;
                    enhancements.push(`utility_crisis_children(+${appliedBoost})`);
                }
            }

            if (this.debugMode && totalBoost > 0) {
                console.log(`[V1c_3.1 Enhancement] Story: ${story.id || 'unknown'} | Original: ${currentUrgency} | Enhanced: ${adjustedUrgency} | Total Boost: +${totalBoost} | Applied: ${enhancements.join(', ')}`);
            }

            return {
                originalUrgency: currentUrgency,
                adjustedUrgency: adjustedUrgency,
                totalBoost: totalBoost,
                enhancements: enhancements,
                version: 'v1c_3.1_conservative'
            };

        } catch (error) {
            console.error('[UrgencyEnhancements_v1c_31] Error in enhanceUrgency:', error);
            return {
                originalUrgency: currentUrgency,
                adjustedUrgency: currentUrgency,
                totalBoost: 0,
                enhancements: [],
                error: error.message
            };
        }
    }

    /**
     * Detect explicit deadline urgency - very high confidence patterns only
     */
    detectExplicitDeadlineUrgency(text) {
        let boost = 0;

        // EXPLICIT: Deadline today/tomorrow with consequence
        const explicitTodayTomorrow = [
            /eviction.*tomorrow/i,
            /shutoff.*tomorrow/i,
            /court.*tomorrow/i,
            /surgery.*tomorrow/i,
            /deadline.*today/i,
            /due.*today/i,
            /must.*pay.*today/i,
            /need.*today/i
        ];

        const matches = explicitTodayTomorrow.filter(pattern => pattern.test(text)).length;
        if (matches > 0) {
            boost = Math.min(0.1, matches * 0.05); // Very conservative: max 0.1
        }

        return Math.round(boost * 100) / 100;
    }

    /**
     * Detect children at immediate risk - very high confidence only
     */
    detectChildrenAtRisk(text) {
        let boost = 0;

        // EXPLICIT: Children + immediate danger/need
        const childrenExplicitRisk = [
            /children.*homeless/i,
            /kids.*no.*food/i,
            /baby.*needs/i,
            /children.*cold/i,
            /kids.*danger/i,
            /child.*protective.*services/i,
            /lose.*custody/i,
            /children.*evicted/i
        ];

        // Must have both "children" reference AND explicit risk
        const hasChildren = /children|child|kids|baby|infant/i.test(text);
        const hasExplicitRisk = childrenExplicitRisk.filter(pattern => pattern.test(text)).length > 0;

        if (hasChildren && hasExplicitRisk) {
            boost = 0.08; // Conservative boost
        }

        return Math.round(boost * 100) / 100;
    }

    /**
     * Detect medical emergency with explicit timeframe - very high confidence only
     */
    detectMedicalEmergencyExplicit(text) {
        let boost = 0;

        // EXPLICIT: Medical + immediate timeframe
        const medicalExplicitUrgent = [
            /surgery.*tomorrow/i,
            /operation.*scheduled/i,
            /hospital.*today/i,
            /emergency.*room.*now/i,
            /doctor.*said.*immediately/i,
            /life.*threatening.*surgery/i,
            /heart.*attack.*surgery/i,
            /cancer.*surgery.*tomorrow/i
        ];

        const matches = medicalExplicitUrgent.filter(pattern => pattern.test(text)).length;
        if (matches > 0) {
            boost = 0.1; // Conservative medical boost
        }

        return Math.round(boost * 100) / 100;
    }

    /**
     * Detect utility crisis with children present - high confidence compound scenario
     */
    detectUtilityCrisisWithChildren(text) {
        let boost = 0;

        // COMPOUND: Utility shutoff + children present
        const hasUtilityShutoff = /power.*shut.*off|electricity.*disconnected|gas.*turned.*off|water.*shut.*off|heat.*off|no.*heat|no.*power/i.test(text);
        const hasChildren = /children|child|kids|baby|infant/i.test(text);
        const hasImmediate = /today|tomorrow|this.*week|need.*now|immediately/i.test(text);

        if (hasUtilityShutoff && hasChildren && hasImmediate) {
            boost = 0.09; // Conservative compound boost
        }

        return Math.round(boost * 100) / 100;
    }
}

module.exports = UrgencyEnhancements_v1c_31;