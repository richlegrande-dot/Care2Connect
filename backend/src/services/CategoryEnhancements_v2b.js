/**
 * CategoryEnhancements_v2b.js - Extended Category Intelligence for 75% Goal
 * 
 * Phase 4A: Targeting remaining category_wrong bucket (50 cases)
 * Focus: Advanced disambiguation rules, context-driven detection, priority matrix, semantic analysis
 * Target: +35 cases improvement (51.53% → 74.58%)
 * 
 * Enhancement Strategy:
 * - Advanced disambiguation rules for complex scenarios (EMPLOYMENT vs TRANSPORTATION)
 * - Context-driven category detection (root cause vs immediate need analysis)
 * - Priority matrix for multi-category scenarios with conflicting signals
 * - Semantic context analysis for edge cases
 * - Enhanced pattern recognition for category-specific language
 */

class CategoryEnhancements_v2b {
    constructor() {
        this.debugMode = process.env.DEBUG_CATEGORY_V2B === 'true';
    }

    /**
     * Apply V2b extended category intelligence
     * @param {string} transcript - The story transcript
     * @param {Object} baseResult - Current category analysis result
     * @returns {Object} - Enhanced category result
     */
    enhanceCategory(transcript, baseResult) {
        try {
            const text = transcript.toLowerCase();
            const originalCategory = baseResult.category || baseResult.extractedCategory || 'UNKNOWN';
            
            let enhancedCategory = originalCategory;
            let reasons = [];
            let confidence = baseResult.confidence || 0.7;

            // Apply sequential enhancement rules
            
            // 1. ADVANCED EMPLOYMENT VS TRANSPORTATION DISAMBIGUATION
            const employmentTransportResult = this.disambiguateEmploymentTransportation(text, originalCategory);
            if (employmentTransportResult.category !== originalCategory) {
                enhancedCategory = employmentTransportResult.category;
                reasons.push(employmentTransportResult.reason);
                confidence = employmentTransportResult.confidence;
            }

            // 2. HEALTHCARE VS SAFETY CONTEXT ANALYSIS  
            const healthcareSafetyResult = this.analyzeHealthcareSafetyContext(text, enhancedCategory);
            if (healthcareSafetyResult.category !== enhancedCategory) {
                enhancedCategory = healthcareSafetyResult.category;
                reasons.push(healthcareSafetyResult.reason);
                confidence = healthcareSafetyResult.confidence;
            }

            // 3. HOUSING VS SAFETY PRIORITY RESOLUTION
            const housingSafetyResult = this.resolveHousingSafetyPriority(text, enhancedCategory);
            if (housingSafetyResult.category !== enhancedCategory) {
                enhancedCategory = housingSafetyResult.category;
                reasons.push(housingSafetyResult.reason);
                confidence = housingSafetyResult.confidence;
            }

            // 4. EDUCATION VS OTHER PATTERN RECOGNITION
            const educationResult = this.recognizeEducationPatterns(text, enhancedCategory);
            if (educationResult.category !== enhancedCategory) {
                enhancedCategory = educationResult.category;
                reasons.push(educationResult.reason);
                confidence = educationResult.confidence;
            }

            // 5. UTILITIES BILL ENHANCED DETECTION
            const utilitiesResult = this.detectUtilitiesEnhanced(text, enhancedCategory);
            if (utilitiesResult.category !== enhancedCategory) {
                enhancedCategory = utilitiesResult.category;
                reasons.push(utilitiesResult.reason);
                confidence = utilitiesResult.confidence;
            }

            // 6. MULTI-CATEGORY SCENARIO PRIORITY MATRIX
            const priorityMatrixResult = this.applyPriorityMatrix(text, enhancedCategory);
            if (priorityMatrixResult.category !== enhancedCategory) {
                enhancedCategory = priorityMatrixResult.category;
                reasons.push(priorityMatrixResult.reason);
                confidence = priorityMatrixResult.confidence;
            }

            if (this.debugMode && enhancedCategory !== originalCategory) {
                console.log(`[V2b Category Enhancement] ${originalCategory} → ${enhancedCategory} | Reasons: ${reasons.join(', ')}`);
            }

            return {
                category: enhancedCategory,
                originalCategory: originalCategory,
                reasons: reasons,
                confidence: confidence,
                version: 'v2b-extended'
            };

        } catch (error) {
            console.error('[CategoryEnhancements_v2b] Error in enhanceCategory:', error);
            return {
                category: baseResult.category || 'OTHER',
                originalCategory: baseResult.category || 'OTHER',
                reasons: [`v2b_error: ${error.message}`],
                confidence: 0.5,
                error: error.message
            };
        }
    }

    /**
     * Advanced disambiguation between EMPLOYMENT and TRANSPORTATION
     */
    disambiguateEmploymentTransportation(text, currentCategory) {
        // EMPLOYMENT wins when: direct job loss, income disruption, work necessity
        const employmentIndicators = [
            /laid.*off|fired|terminated|lost.*job|unemployed|out.*of.*work/i,
            /need.*job|looking.*for.*work|job.*hunting|employment/i,
            /income|paycheck|work.*to.*survive|work.*or.*starve/i,
            /interview.*clothes|resume|work.*attire|job.*interview/i,
            /unemployment.*benefits|workers.*compensation/i
        ];

        // TRANSPORTATION wins when: vehicle problems, mobility needs, repair specifics
        const transportationIndicators = [
            /car.*broke|vehicle.*repair|auto.*repair|mechanic/i,
            /transmission|engine|brakes|tires|battery|alternator/i,
            /get.*to.*work|commute|transportation.*to|ride.*to/i,
            /bus.*pass|train.*ticket|uber|lyft|taxi/i,
            /license|registration|insurance.*car|dmv/i
        ];

        const employmentMatches = employmentIndicators.filter(pattern => pattern.test(text)).length;
        const transportationMatches = transportationIndicators.filter(pattern => pattern.test(text)).length;

        // Context analysis: root cause vs immediate need
        const rootCauseEmployment = /lost.*job.*now.*need|fired.*need.*car|unemployed.*car.*broke/i.test(text);
        const rootCauseTransportation = /car.*broke.*can't.*work|no.*car.*no.*job|need.*car.*to.*work/i.test(text);

        if (rootCauseEmployment && employmentMatches >= transportationMatches) {
            return {
                category: 'EMPLOYMENT',
                reason: 'v2b_employment_root_cause',
                confidence: 0.85
            };
        } else if (rootCauseTransportation && transportationMatches > employmentMatches) {
            return {
                category: 'TRANSPORTATION',
                reason: 'v2b_transportation_root_cause',
                confidence: 0.85
            };
        } else if (employmentMatches > transportationMatches * 1.5) {
            return {
                category: 'EMPLOYMENT',
                reason: 'v2b_employment_indicators_dominant',
                confidence: 0.8
            };
        } else if (transportationMatches > employmentMatches * 1.5) {
            return {
                category: 'TRANSPORTATION',
                reason: 'v2b_transportation_indicators_dominant',
                confidence: 0.8
            };
        }

        return { category: currentCategory, reason: 'no_change', confidence: 0.7 };
    }

    /**
     * Analyze HEALTHCARE vs SAFETY context for medical emergencies
     */
    analyzeHealthcareSafetyContext(text, currentCategory) {
        // HEALTHCARE wins when: medical procedures, treatments, health conditions
        const healthcareContext = [
            /surgery|operation|medical.*procedure|treatment/i,
            /doctor|physician|hospital|clinic|medical.*center/i,
            /prescription|medication|therapy|rehabilitation/i,
            /diagnosis|condition|illness|disease|symptoms/i,
            /health.*insurance|medical.*bills|healthcare.*costs/i
        ];

        // SAFETY wins when: violence, abuse, immediate danger
        const safetyContext = [
            /violence|violent|abuse|abusive|domestic.*violence/i,
            /threat|threatening|danger|dangerous|unsafe/i,
            /assault|attack|beaten|hit|hurt/i,
            /escape|flee|hiding.*from|running.*from/i,
            /restraining.*order|protective.*order|police/i
        ];

        const healthcareMatches = healthcareContext.filter(pattern => pattern.test(text)).length;
        const safetyMatches = safetyContext.filter(pattern => pattern.test(text)).length;

        // Medical emergency can be both, prioritize based on immediate vs ongoing
        const immediateEmergency = /emergency.*room|911|ambulance|life.*threatening/i.test(text);
        const ongoingTreatment = /ongoing|continuing|routine|follow.*up|regular/i.test(text);

        if (immediateEmergency && healthcareMatches >= safetyMatches) {
            return {
                category: 'HEALTHCARE',
                reason: 'v2b_medical_emergency_priority',
                confidence: 0.9
            };
        } else if (safetyMatches > healthcareMatches && /immediate|right.*now|urgent/i.test(text)) {
            return {
                category: 'SAFETY',
                reason: 'v2b_safety_immediate_danger',
                confidence: 0.9
            };
        } else if (ongoingTreatment && healthcareMatches > 0) {
            return {
                category: 'HEALTHCARE',
                reason: 'v2b_ongoing_medical_treatment',
                confidence: 0.8
            };
        }

        return { category: currentCategory, reason: 'no_change', confidence: 0.7 };
    }

    /**
     * Resolve HOUSING vs SAFETY priority in domestic situations
     */
    resolveHousingSafetyPriority(text, currentCategory) {
        // HOUSING priority: eviction, rent, utilities, housing needs
        const housingNeeds = [
            /eviction|evicted|rent|landlord|lease/i,
            /utilities|electric|gas|water|heat/i,
            /mortgage|foreclosure|housing.*payment/i,
            /deposit|first.*month|security.*deposit/i,
            /apartment|house|home|shelter/i
        ];

        // SAFETY priority: immediate physical danger, violence
        const immediateSafety = [
            /life.*danger|physical.*danger|fear.*for.*life/i,
            /violence|violent|abusive|threatening/i,
            /need.*to.*escape|need.*to.*leave|get.*away/i,
            /safe.*house|women.*shelter|protection/i
        ];

        const housingMatches = housingNeeds.filter(pattern => pattern.test(text)).length;
        const safetyMatches = immediateSafety.filter(pattern => pattern.test(text)).length;

        // Distinguish between "eviction threat" and "violence threat"
        const evictionThreat = /threatening.*eviction|landlord.*threatening/i.test(text);
        const violenceThreat = /threatening.*violence|threatening.*to.*hurt/i.test(text);

        if (violenceThreat || (safetyMatches > housingMatches && /immediate|urgent|right.*now/i.test(text))) {
            return {
                category: 'SAFETY',
                reason: 'v2b_violence_threat_priority',
                confidence: 0.9
            };
        } else if (evictionThreat || (housingMatches > safetyMatches)) {
            return {
                category: 'HOUSING',
                reason: 'v2b_housing_need_priority',
                confidence: 0.8
            };
        }

        return { category: currentCategory, reason: 'no_change', confidence: 0.7 };
    }

    /**
     * Enhanced education pattern recognition vs OTHER
     */
    recognizeEducationPatterns(text, currentCategory) {
        const educationIndicators = [
            /school|college|university|education/i,
            /tuition|student.*loan|scholarship|financial.*aid/i,
            /degree|diploma|certification|training.*program/i,
            /semester|quarter|academic|course/i,
            /textbook|supplies|lab.*fee|registration.*fee/i
        ];

        const educationMatches = educationIndicators.filter(pattern => pattern.test(text)).length;

        // Strong education context
        if (educationMatches >= 2 && currentCategory === 'OTHER') {
            return {
                category: 'EDUCATION',
                reason: 'v2b_education_pattern_recognition',
                confidence: 0.8
            };
        }

        return { category: currentCategory, reason: 'no_change', confidence: 0.7 };
    }

    /**
     * Enhanced utilities bill detection
     */
    detectUtilitiesEnhanced(text, currentCategory) {
        const utilitiesBillPatterns = [
            /electric.*bill|electricity.*bill|power.*bill/i,
            /gas.*bill|heating.*bill|water.*bill/i,
            /utility.*bill|utilities.*bill|utility.*payment/i,
            /shut.*off.*notice|disconnect.*notice/i,
            /late.*payment.*utilities|overdue.*utilities/i
        ];

        const utilitiesMatches = utilitiesBillPatterns.filter(pattern => pattern.test(text)).length;

        if (utilitiesMatches >= 1 && (currentCategory === 'OTHER' || currentCategory === 'HOUSING')) {
            return {
                category: 'UTILITIES',
                reason: 'v2b_utilities_enhanced_detection',
                confidence: 0.8
            };
        }

        return { category: currentCategory, reason: 'no_change', confidence: 0.7 };
    }

    /**
     * Apply priority matrix for multi-category scenarios
     */
    applyPriorityMatrix(text, currentCategory) {
        // Priority matrix (highest to lowest priority)
        const priorityOrder = [
            'SAFETY',
            'HEALTHCARE', 
            'HOUSING',
            'UTILITIES',
            'EMPLOYMENT',
            'TRANSPORTATION',
            'EDUCATION',
            'OTHER'
        ];

        // Detect multiple categories present
        const categoryIndicators = {
            'SAFETY': /safety|violence|abuse|danger|threat/i,
            'HEALTHCARE': /medical|health|doctor|hospital|surgery/i,
            'HOUSING': /housing|rent|eviction|apartment|home/i,
            'UTILITIES': /utilities|electric|gas|water|power/i,
            'EMPLOYMENT': /employment|job|work|income|unemployed/i,
            'TRANSPORTATION': /transportation|car|vehicle|bus|travel/i,
            'EDUCATION': /education|school|tuition|college/i
        };

        const detectedCategories = [];
        for (const [category, pattern] of Object.entries(categoryIndicators)) {
            if (pattern.test(text)) {
                detectedCategories.push(category);
            }
        }

        // If multiple categories detected, choose highest priority
        if (detectedCategories.length > 1) {
            for (const priority of priorityOrder) {
                if (detectedCategories.includes(priority) && priority !== currentCategory) {
                    return {
                        category: priority,
                        reason: `v2b_priority_matrix_${priority.toLowerCase()}_over_${detectedCategories.join('_').toLowerCase()}`,
                        confidence: 0.8
                    };
                }
            }
        }

        return { category: currentCategory, reason: 'no_change', confidence: 0.7 };
    }
}

module.exports = { CategoryEnhancements_v2b };