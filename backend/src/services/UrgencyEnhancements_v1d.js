/**
 * UrgencyEnhancements_v1d.js - Precision Tuning for Over-Assessment Reduction
 * 
 * Phase 3B: Targeting urgency_over_assessed bucket (76 cases)
 * Focus: Reduce false positives where urgency is boosted too high
 * Target: +25 cases improvement (51.53% → 68.64%)
 * 
 * Enhancement Strategy:
 * - Threshold optimization for different categories
 * - Context-aware boost limiting based on story patterns
 * - False positive pattern identification and suppression
 * - Confidence-based urgency capping
 * - Smart downgrading of over-assessed scenarios
 */

class UrgencyEnhancements_v1d {
    constructor() {
        this.debugMode = process.env.DEBUG_URGENCY_V1D === 'true';
    }

    /**
     * Apply V1d precision tuning to reduce over-assessment
     * @param {Object} story - The story object
     * @param {number} currentUrgency - Current urgency score (0-1)
     * @param {string} category - The detected category
     * @returns {Object} - Precision-tuned urgency result
     */
    tuneUrgencyPrecision(story, currentUrgency, category = 'UNKNOWN') {
        try {
            const text = (story.story || '').toLowerCase();
            const title = (story.title || '').toLowerCase();
            const fullText = `${title} ${text}`;
            
            let adjustedUrgency = currentUrgency;
            let adjustments = [];
            let totalAdjustment = 0;

            // Only apply precision tuning if urgency is above MEDIUM threshold (0.5)
            // Focus on cases that might be over-assessed
            if (currentUrgency > 0.5) {
                
                // 1. FALSE URGENCY PATTERN DETECTION
                const falseUrgencyReduction = this.detectFalseUrgencyPatterns(fullText, category);
                if (falseUrgencyReduction > 0) {
                    adjustedUrgency = Math.max(0.3, adjustedUrgency - falseUrgencyReduction); // Lower bound
                    totalAdjustment -= falseUrgencyReduction;
                    adjustments.push(`false_urgency_reduction(-${falseUrgencyReduction})`);
                }

                // 2. CATEGORY-SPECIFIC THRESHOLD OPTIMIZATION
                const categoryThresholdAdjustment = this.applyCategoryThresholds(fullText, category, currentUrgency);
                if (categoryThresholdAdjustment !== 0) {
                    adjustedUrgency = Math.max(0.3, Math.min(0.9, adjustedUrgency + categoryThresholdAdjustment));
                    totalAdjustment += categoryThresholdAdjustment;
                    const sign = categoryThresholdAdjustment > 0 ? '+' : '';
                    adjustments.push(`category_threshold_adj(${sign}${categoryThresholdAdjustment})`);
                }

                // 3. CONTEXT-AWARE BOOST LIMITING
                const boostLimitReduction = this.applyContextAwareBoostLimiting(fullText, currentUrgency);
                if (boostLimitReduction > 0) {
                    adjustedUrgency = Math.max(0.3, adjustedUrgency - boostLimitReduction); // Lower bound
                    totalAdjustment -= boostLimitReduction;
                    adjustments.push(`boost_limit_reduction(-${boostLimitReduction})`);
                }

                // 4. CONFIDENCE-BASED URGENCY CAPPING
                const confidenceCapAdjustment = this.applyConfidenceBasedCapping(fullText, adjustedUrgency);
                if (confidenceCapAdjustment < 0) {
                    adjustedUrgency = Math.max(0.3, adjustedUrgency + confidenceCapAdjustment); // confidenceCapAdjustment is negative
                    totalAdjustment += confidenceCapAdjustment;
                    adjustments.push(`confidence_cap(${confidenceCapAdjustment})`);
                }
            }

            if (this.debugMode && Math.abs(totalAdjustment) > 0.01) {
                console.log(`[V1d Precision] Story: ${story.id || 'unknown'} | Original: ${currentUrgency} | Tuned: ${adjustedUrgency} | Adjustment: ${totalAdjustment > 0 ? '+' : ''}${totalAdjustment} | Applied: ${adjustments.join(', ')}`);
            }

            return {
                originalUrgency: currentUrgency,
                adjustedUrgency: adjustedUrgency,
                totalAdjustment: totalAdjustment,
                adjustments: adjustments,
                version: 'v1d'
            };

        } catch (error) {
            console.error('[UrgencyEnhancements_v1d] Error in tuneUrgencyPrecision:', error);
            return {
                originalUrgency: currentUrgency,
                adjustedUrgency: currentUrgency,
                totalAdjustment: 0,
                adjustments: [],
                error: error.message
            };
        }
    }

    /**
     * Detect patterns that falsely inflate urgency scores
     */
    detectFalseUrgencyPatterns(text, category) {
        let reduction = 0;

        // Non-urgent temporal references that get misinterpreted
        const falseTimePatterns = [
            /soon.*but.*not/i,
            /eventually.*need/i,
            /in.*the.*future/i,
            /someday/i,
            /when.*possible/i,
            /if.*available/i,
            /hoping.*soon/i,
            /would.*be.*nice/i,
            /planning.*ahead/i
        ];

        const falseTimeMatches = falseTimePatterns.filter(pattern => pattern.test(text)).length;
        if (falseTimeMatches > 0) {
            reduction += Math.min(0.2, falseTimeMatches * 0.08); // Up to 0.2 reduction
        }

        // Conditional or hypothetical language
        const conditionalPatterns = [
            /if.*possible/i,
            /maybe.*could/i,
            /might.*need/i,
            /would.*like/i,
            /hoping.*for/i,
            /wondering.*if/i,
            /could.*help.*with/i,
            /if.*you.*have/i,
            /possibly.*assist/i
        ];

        const conditionalMatches = conditionalPatterns.filter(pattern => pattern.test(text)).length;
        if (conditionalMatches > 0) {
            reduction += Math.min(0.15, conditionalMatches * 0.05); // Up to 0.15 reduction
        }

        // Educational/training requests (often misclassified as urgent)
        if (category === 'EDUCATION') {
            const educationNonUrgent = [
                /course.*next.*semester/i,
                /program.*in.*fall/i,
                /certification.*class/i,
                /training.*program/i,
                /degree.*completion/i,
                /continuing.*education/i
            ];

            const eduMatches = educationNonUrgent.filter(pattern => pattern.test(text)).length;
            if (eduMatches > 0) {
                reduction += Math.min(0.25, eduMatches * 0.1); // Up to 0.25 reduction for education
            }
        }

        return Math.round(reduction * 100) / 100;
    }

    /**
     * Apply category-specific threshold adjustments
     */
    applyCategoryThresholds(text, category, currentUrgency) {
        let adjustment = 0;

        switch (category) {
            case 'HEALTHCARE':
                // Medical appointments vs medical emergencies
                if (/appointment|check.*up|routine|physical|annual/i.test(text)) {
                    adjustment = -0.25; // More aggressive reduction for routine medical
                } else if (/prescription|medication/i.test(text) && !/emergency|urgent|critical/i.test(text)) {
                    adjustment = -0.15; // Reduce for routine prescriptions
                }
                break;

            case 'TRANSPORTATION':
                // Car maintenance vs transportation emergency
                if (/oil.*change|tune.*up|maintenance|inspection/i.test(text)) {
                    adjustment = -0.2; // More aggressive for maintenance
                } else if (/broke.*down|repair/i.test(text) && /hoping|might|could/i.test(text)) {
                    adjustment = -0.15; // Reduce for hopeful/conditional repair requests
                }
                break;

            case 'EMPLOYMENT':
                // Job search vs immediate employment crisis
                if (/looking.*for.*work|job.*hunting|resume|interview.*prep|interview.*clothes/i.test(text)) {
                    adjustment = -0.2; // More aggressive reduction for job search activities
                } else if (/few.*months|looking.*for/i.test(text)) {
                    adjustment = -0.15; // Reduce for ongoing job search
                }
                break;

            case 'EDUCATION':
                // Educational goals vs immediate educational needs
                if (/want.*to.*learn|interested.*in|considering|exploring|program.*costs|certification.*program/i.test(text)) {
                    adjustment = -0.3; // Significant reduction for educational interests
                } else if (/next.*month|start.*next/i.test(text)) {
                    adjustment = -0.25; // Reduce for future-planned education
                }
                break;

            case 'OTHER':
                // Catch-all category often has inflated urgency
                if (currentUrgency > 0.7) {
                    adjustment = -0.2; // More aggressive reduction for high OTHER urgency
                } else if (/personal.*situation|hard.*to.*explain/i.test(text)) {
                    adjustment = -0.4; // Very aggressive for vague personal situations
                } else if (currentUrgency > 0.5) {
                    adjustment = -0.15; // Moderate reduction for medium OTHER urgency
                }
                break;
        }

        return Math.round(adjustment * 100) / 100;
    }

    /**
     * Apply context-aware boost limiting
     */
    applyContextAwareBoostLimiting(text, currentUrgency) {
        let reduction = 0;

        // Stories with multiple competing priorities (often over-boosted)
        const multiPriorityIndicators = [
            /also.*need/i,
            /in.*addition/i,
            /furthermore/i,
            /besides.*that/i,
            /on.*top.*of/i,
            /along.*with/i
        ];

        const multiPriorityCount = multiPriorityIndicators.filter(pattern => pattern.test(text)).length;
        if (multiPriorityCount > 1 && currentUrgency > 0.7) {
            reduction += 0.1; // Reduce urgency when multiple priorities are mentioned
        }

        // Stories with detailed explanations (often less urgent than they appear)
        const detailedExplanationIndicators = [
            /let.*me.*explain/i,
            /here.*is.*what.*happened/i,
            /the.*situation.*is/i,
            /to.*give.*you.*context/i,
            /background.*information/i
        ];

        const explanationCount = detailedExplanationIndicators.filter(pattern => pattern.test(text)).length;
        if (explanationCount > 0 && currentUrgency > 0.75) {
            reduction += 0.08; // Modest reduction for over-explained situations
        }

        // Polite/formal language (often indicates less urgency)
        const politeLanguage = [
            /please.*consider/i,
            /would.*appreciate/i,
            /if.*it.*would.*be.*possible/i,
            /thank.*you.*for.*considering/i,
            /grateful.*for.*any.*help/i,
            /understand.*if.*not.*possible/i
        ];

        const politenessCount = politeLanguage.filter(pattern => pattern.test(text)).length;
        if (politenessCount > 1 && currentUrgency > 0.6) {
            reduction += 0.06; // Small reduction for overly polite requests
        }

        return Math.round(reduction * 100) / 100;
    }

    /**
     * Apply confidence-based urgency capping
     */
    applyConfidenceBasedCapping(text, currentUrgency) {
        let adjustment = 0;

        // High urgency (>0.7) requires strong evidence  
        if (currentUrgency > 0.7) {
            const strongUrgencyEvidence = [
                /emergency|crisis|critical|urgent/i,
                /today|tomorrow|immediately/i,
                /life.*threatening|dying|fatal/i,
                /eviction.*notice|shutoff.*notice/i,
                /homeless|no.*place.*to.*go/i
            ];

            const evidenceCount = strongUrgencyEvidence.filter(pattern => pattern.test(text)).length;
            
            // If high urgency lacks strong evidence, cap it more aggressively
            if (evidenceCount < 2) {
                adjustment = 0.6 - currentUrgency; // Cap at 0.6 (MEDIUM-HIGH)
            } else if (evidenceCount < 1) {
                adjustment = 0.45 - currentUrgency; // Cap at 0.45 (MEDIUM) if no evidence
            }
        }

        // Very high urgency (>0.8) requires multiple strong indicators
        if (currentUrgency > 0.8) {
            const criticalUrgencyEvidence = [
                /911|ambulance|hospital/i,
                /court.*tomorrow|deadline.*today/i,
                /children.*danger|kids.*unsafe/i,
                /suicide|kill.*myself/i,
                /violence|abuse|danger/i
            ];

            const criticalEvidenceCount = criticalUrgencyEvidence.filter(pattern => pattern.test(text)).length;
            
            // If very high urgency lacks critical evidence, cap more aggressively
            if (criticalEvidenceCount === 0) {
                adjustment = 0.65 - currentUrgency; // Cap at 0.65 (HIGH) 
            }
        }

        // Special handling for vague/personal situations
        if (/personal.*situation|hard.*to.*explain|something.*personal/i.test(text) && currentUrgency > 0.3) {
            adjustment = 0.3 - currentUrgency; // Cap personal situations at LOW-MEDIUM
        }

        return Math.round(adjustment * 100) / 100;
    }
}

module.exports = UrgencyEnhancements_v1d;