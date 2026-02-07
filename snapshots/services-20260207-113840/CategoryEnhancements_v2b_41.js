/**
 * CategoryEnhancements_v2b_41.js - Extended Category Intelligence (Refined)
 * 
 * Based on root cause analysis of V2b failure:
 * - Conflicted with V2a corrections → Coordinate instead of override
 * - Complex priority matrix → Focused disambiguation
 * - Excessive processing → Targeted edge case handling
 * - Non-selective application → Precision targeting
 * 
 * Target: +3-5 cases from focused category boundary corrections
 * Philosophy: Complementary coordination with V2a, not replacement
 */

class CategoryEnhancements_v2b_41 {
    constructor() {
        this.debugMode = process.env.DEBUG_CATEGORY_V2B_41 === 'true';
    }

    /**
     * Apply V2b 4.1 coordinated category intelligence
     * @param {Object} story - The story object
     * @param {string} baseCategory - Initial category detection
     * @param {string} v2aCategory - V2a enhanced category (if available)
     * @param {number} confidence - V2a confidence score (0-1)
     * @returns {Object} - Coordinated category result
     */
    enhanceCategoryIntelligence(story, baseCategory, v2aCategory = null, confidence = 0) {
        try {
            const text = (story.story || '').toLowerCase();
            const title = (story.title || '').toLowerCase();
            const fullText = `${title} ${text}`;
            
            let finalCategory = v2aCategory || baseCategory;
            let finalConfidence = confidence;
            let enhancements = [];

            // COORDINATION PRINCIPLE: Only enhance if V2a confidence < 0.7 or missing
            if (confidence < 0.7) {
                
                // TARGETED DISAMBIGUATION: Focus on specific confusion patterns
                const disambiguationResult = this.performTargetedDisambiguation(fullText, baseCategory, v2aCategory);
                
                if (disambiguationResult.category && disambiguationResult.confidence > finalConfidence) {
                    finalCategory = disambiguationResult.category;
                    finalConfidence = disambiguationResult.confidence;
                    enhancements.push(`targeted_disambiguation(${disambiguationResult.reason})`);
                }

                // EDGE CASE HANDLING: Address specific problematic category boundaries
                const edgeCaseResult = this.handleCategoryEdgeCases(fullText, finalCategory, finalConfidence);
                
                if (edgeCaseResult.category && edgeCaseResult.confidence > finalConfidence) {
                    finalCategory = edgeCaseResult.category;
                    finalConfidence = edgeCaseResult.confidence;
                    enhancements.push(`edge_case_correction(${edgeCaseResult.reason})`);
                }

                // CONTEXT CLARIFICATION: Resolve ambiguous context indicators
                const clarificationResult = this.clarifyContextualCategory(fullText, finalCategory, finalConfidence);
                
                if (clarificationResult.category && clarificationResult.confidence > finalConfidence) {
                    finalCategory = clarificationResult.category;
                    finalConfidence = clarificationResult.confidence;
                    enhancements.push(`context_clarification(${clarificationResult.reason})`);
                }
            }

            if (this.debugMode && enhancements.length > 0) {
                console.log(`[V2b_4.1 Category] Story: ${story.id || 'unknown'} | Base: ${baseCategory} | V2a: ${v2aCategory}(${confidence}) | Final: ${finalCategory}(${finalConfidence}) | Applied: ${enhancements.join(', ')}`);
            }

            return {
                originalCategory: baseCategory,
                v2aCategory: v2aCategory,
                finalCategory: finalCategory,
                originalConfidence: confidence,
                finalConfidence: finalConfidence,
                enhancements: enhancements,
                version: 'v2b_4.1_coordinated'
            };

        } catch (error) {
            console.error('[CategoryEnhancements_v2b_41] Error in enhanceCategoryIntelligence:', error);
            return {
                originalCategory: baseCategory,
                v2aCategory: v2aCategory,
                finalCategory: v2aCategory || baseCategory,
                originalConfidence: confidence,
                finalConfidence: confidence,
                enhancements: [],
                error: error.message
            };
        }
    }

    /**
     * Targeted disambiguation for specific confusion patterns
     */
    performTargetedDisambiguation(text, baseCategory, v2aCategory) {
        // TRANSPORTATION vs EMPLOYMENT confusion
        if ((baseCategory === 'TRANSPORTATION' || v2aCategory === 'TRANSPORTATION' || 
             baseCategory === 'EMPLOYMENT' || v2aCategory === 'EMPLOYMENT')) {
            
            // Clear employment indicators
            if (/job.*interview|work.*start|employment.*offer|position.*available/i.test(text)) {
                return { category: 'EMPLOYMENT', confidence: 0.85, reason: 'job_opportunity_context' };
            }
            
            // Clear transportation indicators
            if (/car.*broke|bus.*pass|transportation.*to.*work|ride.*needed/i.test(text)) {
                return { category: 'TRANSPORTATION', confidence: 0.85, reason: 'transport_need_context' };
            }
        }

        // HEALTHCARE vs SAFETY confusion
        if ((baseCategory === 'HEALTHCARE' || v2aCategory === 'HEALTHCARE' || 
             baseCategory === 'SAFETY' || v2aCategory === 'SAFETY')) {
            
            // Clear safety indicators
            if (/domestic.*violence|abuse|threat|danger|unsafe.*home/i.test(text)) {
                return { category: 'SAFETY', confidence: 0.85, reason: 'safety_threat_context' };
            }
            
            // Clear healthcare indicators
            if (/medication|doctor.*appointment|surgery|hospital|medical.*bill/i.test(text)) {
                return { category: 'HEALTHCARE', confidence: 0.85, reason: 'medical_need_context' };
            }
        }

        // FINANCIAL vs UTILITIES confusion
        if ((baseCategory === 'FINANCIAL' || v2aCategory === 'FINANCIAL' || 
             baseCategory === 'UTILITIES' || v2aCategory === 'UTILITIES')) {
            
            // Clear utilities indicators
            if (/electric.*bill|gas.*shutoff|water.*disconnect|utility.*payment/i.test(text)) {
                return { category: 'UTILITIES', confidence: 0.85, reason: 'utility_specific_context' };
            }
            
            // Clear financial indicators (when not utilities)
            if (/debt|loan|credit|bankruptcy|financial.*crisis/i.test(text) && !/utility|electric|gas|water/i.test(text)) {
                return { category: 'FINANCIAL', confidence: 0.8, reason: 'general_financial_context' };
            }
        }

        return { category: null, confidence: 0, reason: null };
    }

    /**
     * Handle specific category edge cases
     */
    handleCategoryEdgeCases(text, currentCategory, currentConfidence) {
        // FOOD edge case: Pet food should remain FOOD, not OTHER
        if (currentCategory === 'OTHER' && /pet.*food|dog.*food|cat.*food|animal.*feed/i.test(text)) {
            return { category: 'FOOD', confidence: 0.75, reason: 'pet_food_edge_case' };
        }

        // HOUSING edge case: Hotel/temporary housing should be HOUSING
        if (currentCategory === 'OTHER' && /hotel.*stay|motel.*room|temporary.*housing|shelter.*need/i.test(text)) {
            return { category: 'HOUSING', confidence: 0.8, reason: 'temporary_housing_edge_case' };
        }

        // EDUCATION edge case: Educational materials/supplies should be EDUCATION
        if (currentCategory === 'OTHER' && /school.*supplies|textbook|educational.*material|study.*guide/i.test(text)) {
            return { category: 'EDUCATION', confidence: 0.75, reason: 'educational_materials_edge_case' };
        }

        // TRANSPORTATION edge case: Fuel costs should be TRANSPORTATION
        if (currentCategory === 'FINANCIAL' && /gas.*money|fuel.*cost|gasoline.*expense/i.test(text)) {
            return { category: 'TRANSPORTATION', confidence: 0.75, reason: 'fuel_transportation_edge_case' };
        }

        // HEALTHCARE edge case: Mental health should be HEALTHCARE
        if (currentCategory === 'OTHER' && /therapy|counseling|mental.*health|depression|anxiety.*treatment/i.test(text)) {
            return { category: 'HEALTHCARE', confidence: 0.8, reason: 'mental_health_edge_case' };
        }

        return { category: null, confidence: 0, reason: null };
    }

    /**
     * Clarify contextual category indicators
     */
    clarifyContextualCategory(text, currentCategory, currentConfidence) {
        // Work-related contexts
        if (/for.*work|job.*related|work.*expense|employment.*need/i.test(text)) {
            
            // Transportation for work
            if (/car|transport|ride|bus|gas/i.test(text) && currentCategory !== 'TRANSPORTATION') {
                return { category: 'TRANSPORTATION', confidence: 0.8, reason: 'work_transport_context' };
            }
            
            // Clothing for work
            if (/clothes|uniform|professional.*attire/i.test(text) && currentCategory === 'OTHER') {
                return { category: 'EMPLOYMENT', confidence: 0.75, reason: 'work_clothing_context' };
            }
        }

        // Family contexts
        if (/children|kids|family|child/i.test(text)) {
            
            // Children's medical needs
            if (/sick|doctor|medicine|hospital/i.test(text) && currentCategory !== 'HEALTHCARE') {
                return { category: 'HEALTHCARE', confidence: 0.8, reason: 'child_medical_context' };
            }
            
            // Children's educational needs
            if (/school|education|supplies/i.test(text) && currentCategory !== 'EDUCATION') {
                return { category: 'EDUCATION', confidence: 0.8, reason: 'child_education_context' };
            }
        }

        // Emergency contexts
        if (/emergency|urgent|crisis|immediate/i.test(text)) {
            
            // Emergency housing
            if (/homeless|evict|shelter/i.test(text) && currentCategory !== 'HOUSING') {
                return { category: 'HOUSING', confidence: 0.85, reason: 'emergency_housing_context' };
            }
            
            // Emergency utilities
            if (/shutoff|disconnect|power|heat/i.test(text) && currentCategory !== 'UTILITIES') {
                return { category: 'UTILITIES', confidence: 0.85, reason: 'emergency_utility_context' };
            }
        }

        return { category: null, confidence: 0, reason: null };
    }
}

module.exports = CategoryEnhancements_v2b_41;