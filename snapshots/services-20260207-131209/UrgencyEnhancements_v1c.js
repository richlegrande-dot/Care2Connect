/**
 * UrgencyEnhancements_v1c.js - Advanced Urgency Intelligence for 75% Goal
 * 
 * Phase 3A: Targeting urgency_under_assessed bucket (155 cases)
 * Focus: Time-critical scenarios, family crises, medical emergencies, housing crises, employment disruption
 * Target: +70 cases improvement (51.53% → 64.36%)
 * 
 * Enhancement Strategy:
 * - Time-critical scenario detection (deadlines, shutoffs, court dates)  
 * - Family crisis escalation (children at risk, single parents)
 * - Medical emergency refinement (surgery, life-threatening conditions)
 * - Housing crisis intensifiers (eviction notices, homelessness risk)
 * - Employment crisis patterns (income disruption, work necessity)
 */

class UrgencyEnhancements_v1c {
    constructor() {
        this.debugMode = process.env.DEBUG_URGENCY_V1C === 'true';
    }

    /**
     * Apply V1c advanced urgency intelligence  
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

            // CONSERVATIVE APPROACH: Only enhance if current urgency is below MEDIUM threshold (0.5)
            // Focus ONLY on clearly under-assessed cases that should be HIGH/CRITICAL
            if (currentUrgency < 0.5) {
                
                // 1. TIME-CRITICAL SCENARIO DETECTION (More Conservative)
                const timeCriticalBoost = this.detectTimeCriticalScenarios(fullText);
                if (timeCriticalBoost > 0) {
                    adjustedUrgency = Math.min(0.85, adjustedUrgency + timeCriticalBoost); // Lower cap
                    totalBoost += timeCriticalBoost;
                    enhancements.push(`time_critical_boost(${timeCriticalBoost})`);
                }

                // 2. FAMILY CRISIS ESCALATION (More Conservative)
                const familyCrisisBoost = this.detectFamilyCrisis(fullText);
                if (familyCrisisBoost > 0) {
                    adjustedUrgency = Math.min(0.85, adjustedUrgency + familyCrisisBoost); // Lower cap
                    totalBoost += familyCrisisBoost;
                    enhancements.push(`family_crisis_boost(${familyCrisisBoost})`);
                }

                // 3. MEDICAL EMERGENCY REFINEMENT (More Conservative)
                const medicalEmergencyBoost = this.detectMedicalEmergency(fullText);
                if (medicalEmergencyBoost > 0) {
                    adjustedUrgency = Math.min(0.85, adjustedUrgency + medicalEmergencyBoost); // Lower cap
                    totalBoost += medicalEmergencyBoost;
                    enhancements.push(`medical_emergency_boost(${medicalEmergencyBoost})`);
                }

                // 4. HOUSING CRISIS INTENSIFIERS (More Conservative)
                const housingCrisisBoost = this.detectHousingCrisis(fullText);
                if (housingCrisisBoost > 0) {
                    adjustedUrgency = Math.min(0.85, adjustedUrgency + housingCrisisBoost); // Lower cap
                    totalBoost += housingCrisisBoost;
                    enhancements.push(`housing_crisis_boost(${housingCrisisBoost})`);
                }

                // 5. EMPLOYMENT CRISIS PATTERNS (More Conservative) 
                const employmentCrisisBoost = this.detectEmploymentCrisis(fullText);
                if (employmentCrisisBoost > 0) {
                    adjustedUrgency = Math.min(0.85, adjustedUrgency + employmentCrisisBoost); // Lower cap
                    totalBoost += employmentCrisisBoost;
                    enhancements.push(`employment_crisis_boost(${employmentCrisisBoost})`);
                }
                
                // SAFETY CHECK: If total boost is excessive (>0.4), scale it back
                if (totalBoost > 0.4) {
                    const scaleFactor = 0.4 / totalBoost;
                    adjustedUrgency = currentUrgency + (totalBoost * scaleFactor);
                    adjustedUrgency = Math.min(0.85, adjustedUrgency);
                    enhancements.push(`scaled_boost(${scaleFactor.toFixed(2)})`);
                }
            }

            if (this.debugMode && totalBoost > 0) {
                console.log(`[V1c Enhancement] Story: ${story.id || 'unknown'} | Original: ${currentUrgency} | Enhanced: ${adjustedUrgency} | Boost: +${totalBoost} | Applied: ${enhancements.join(', ')}`);
            }

            return {
                originalUrgency: currentUrgency,
                adjustedUrgency: adjustedUrgency,
                totalBoost: totalBoost,
                enhancements: enhancements,
                version: 'v1c-refined'
            };

        } catch (error) {
            console.error('[UrgencyEnhancements_v1c] Error in enhanceUrgency:', error);
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
     * Detect time-critical scenarios requiring immediate action
     */
    detectTimeCriticalScenarios(text) {
        let boost = 0;

        // Imminent deadlines and shutoffs
        const immediateDeadlines = [
            /tomorrow/,
            /today/,
            /this morning/,
            /this afternoon/,
            /by \d+pm/,
            /by \d+am/,
            /deadline is/,
            /due today/,
            /due tomorrow/,
            /shutoff.*tomorrow/,
            /disconnect.*tomorrow/,
            /eviction.*tomorrow/,
            /court.*tomorrow/,
            /hearing.*tomorrow/,
            /within.*hours?/,
            /next.*hours?/,
            /urgent.*deadline/,
            /immediate.*action/
        ];

        const deadlineMatches = immediateDeadlines.filter(pattern => pattern.test(text)).length;
        if (deadlineMatches > 0) {
            boost += Math.min(0.25, deadlineMatches * 0.08); // Up to 0.25 boost (more conservative)
        }

        // Court dates and legal deadlines
        const legalDeadlines = [
            /court date/,
            /hearing date/,
            /legal deadline/,
            /summons/,
            /subpoena/,
            /appearance required/,
            /must appear/,
            /legal proceeding/,
            /custody hearing/,
            /divorce proceeding/
        ];

        const legalMatches = legalDeadlines.filter(pattern => pattern.test(text)).length;
        if (legalMatches > 0) {
            boost += Math.min(0.2, legalMatches * 0.07); // Up to 0.2 boost (more conservative)
        }

        return Math.round(boost * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Detect family crisis situations requiring urgent intervention
     */
    detectFamilyCrisis(text) {
        let boost = 0;

        // Children at risk indicators
        const childrenAtRisk = [
            /children.*danger/,
            /kids.*unsafe/,
            /child.*risk/,
            /baby.*need/,
            /infant.*medical/,
            /newborn.*sick/,
            /children.*homeless/,
            /kids.*no food/,
            /child protective/,
            /cps.*involved/,
            /foster care/,
            /lose.*custody/,
            /children.*cold/,
            /kids.*heat/,
            /school.*children/
        ];

        const childRiskMatches = childrenAtRisk.filter(pattern => pattern.test(text)).length;
        if (childRiskMatches > 0) {
            boost += Math.min(0.3, childRiskMatches * 0.1); // Up to 0.3 boost (more conservative)
        }

        // Single parent crisis
        const singleParentCrisis = [
            /single mother/,
            /single mom/,
            /single father/,
            /single dad/,
            /single parent/,
            /no support/,
            /alone with.*child/,
            /no help.*child/,
            /divorced.*child/,
            /widowed.*child/,
            /abandoned.*child/
        ];

        const singleParentMatches = singleParentCrisis.filter(pattern => pattern.test(text)).length;
        if (singleParentMatches > 0) {
            boost += Math.min(0.2, singleParentMatches * 0.07); // Up to 0.2 boost (more conservative)
        }

        // Family separation/domestic crisis
        const familySeparation = [
            /domestic violence/,
            /abusive.*relationship/,
            /fled.*home/,
            /escape.*abuse/,
            /protective order/,
            /restraining order/,
            /family.*separated/,
            /left.*abuser/,
            /safe house/,
            /shelter.*women/
        ];

        const separationMatches = familySeparation.filter(pattern => pattern.test(text)).length;
        if (separationMatches > 0) {
            boost += Math.min(0.4, separationMatches * 0.13); // Up to 0.4 boost
        }

        return Math.round(boost * 100) / 100;
    }

    /**
     * Detect medical emergency situations requiring immediate attention
     */
    detectMedicalEmergency(text) {
        let boost = 0;

        // Life-threatening conditions
        const lifeThreatening = [
            /heart attack/,
            /stroke/,
            /seizure/,
            /cancer.*aggressive/,
            /tumor.*malignant/,
            /blood clot/,
            /cardiac.*emergency/,
            /respiratory.*failure/,
            /kidney.*failure/,
            /liver.*failure/,
            /overdose/,
            /suicide.*attempt/,
            /life.*threatening/,
            /critical.*condition/,
            /icu.*admission/,
            /emergency.*surgery/
        ];

        const lifeThreateningMatches = lifeThreatening.filter(pattern => pattern.test(text)).length;
        if (lifeThreateningMatches > 0) {
            boost += Math.min(0.35, lifeThreateningMatches * 0.12); // Up to 0.35 boost (more conservative)
        }

        // Urgent surgical needs
        const surgicalUrgency = [
            /surgery.*scheduled/,
            /operation.*tomorrow/,
            /surgeon.*waiting/,
            /pre.*surgery/,
            /surgical.*emergency/,
            /appendectomy/,
            /gallbladder.*surgery/,
            /emergency.*operation/,
            /surgery.*today/,
            /operating.*room/,
            /anesthesia.*scheduled/
        ];

        const surgicalMatches = surgicalUrgency.filter(pattern => pattern.test(text)).length;
        if (surgicalMatches > 0) {
            boost += Math.min(0.25, surgicalMatches * 0.08); // Up to 0.25 boost (more conservative)
        }

        // Pregnancy/childbirth emergencies
        const pregnancyEmergency = [
            /pregnancy.*complication/,
            /labor.*started/,
            /contractions/,
            /miscarriage/,
            /premature.*labor/,
            /high.*risk.*pregnancy/,
            /cesarean.*section/,
            /delivery.*complications/,
            /prenatal.*emergency/,
            /bleeding.*pregnant/
        ];

        const pregnancyMatches = pregnancyEmergency.filter(pattern => pattern.test(text)).length;
        if (pregnancyMatches > 0) {
            boost += Math.min(0.35, pregnancyMatches * 0.12); // Up to 0.35 boost
        }

        // Mental health crisis
        const mentalHealthCrisis = [
            /suicidal.*thoughts/,
            /want.*to.*die/,
            /end.*my.*life/,
            /kill.*myself/,
            /mental.*breakdown/,
            /psychiatric.*emergency/,
            /psychotic.*episode/,
            /severe.*depression/,
            /panic.*disorder/,
            /bipolar.*crisis/
        ];

        const mentalHealthMatches = mentalHealthCrisis.filter(pattern => pattern.test(text)).length;
        if (mentalHealthMatches > 0) {
            boost += Math.min(0.3, mentalHealthMatches * 0.1); // Up to 0.3 boost (more conservative)
        }

        return Math.round(boost * 100) / 100;
    }

    /**
     * Detect housing crisis situations requiring immediate intervention
     */
    detectHousingCrisis(text) {
        let boost = 0;

        // Imminent eviction/foreclosure
        const imminentEviction = [
            /eviction.*notice/,
            /foreclosure.*notice/,
            /sheriff.*eviction/,
            /evicted.*tomorrow/,
            /court.*eviction/,
            /landlord.*evicting/,
            /notice.*to.*quit/,
            /pay.*or.*quit/,
            /eviction.*proceeding/,
            /unlawful.*detainer/,
            /foreclosure.*sale/,
            /bank.*foreclosing/
        ];

        const evictionMatches = imminentEviction.filter(pattern => pattern.test(text)).length;
        if (evictionMatches > 0) {
            boost += Math.min(0.25, evictionMatches * 0.08); // Up to 0.25 boost (more conservative)
        }

        // Currently homeless or about to be
        const homelessness = [
            /currently.*homeless/,
            /living.*car/,
            /sleeping.*outside/,
            /no.*place.*stay/,
            /nowhere.*go/,
            /shelter.*full/,
            /kicked.*out/,
            /lost.*apartment/,
            /living.*streets/,
            /couch.*surfing/,
            /temporary.*housing/,
            /bridge.*housing/
        ];

        const homelessMatches = homelessness.filter(pattern => pattern.test(text)).length;
        if (homelessMatches > 0) {
            boost += Math.min(0.3, homelessMatches * 0.1); // Up to 0.3 boost (more conservative)
        }

        // Utility shutoffs affecting habitability
        const utilityShutoffs = [
            /power.*shut.*off/,
            /electricity.*disconnected/,
            /gas.*turned.*off/,
            /water.*shut.*off/,
            /heat.*disconnected/,
            /no.*power/,
            /no.*electricity/,
            /no.*heat/,
            /no.*hot.*water/,
            /freezing.*cold/,
            /utility.*shutoff/
        ];

        const utilityMatches = utilityShutoffs.filter(pattern => pattern.test(text)).length;
        if (utilityMatches > 0) {
            boost += Math.min(0.35, utilityMatches * 0.12); // Up to 0.35 boost
        }

        // Unsafe housing conditions
        const unsafeHousing = [
            /mold.*problem/,
            /lead.*paint/,
            /no.*heat.*winter/,
            /roof.*leaking/,
            /structural.*damage/,
            /condemned.*building/,
            /unsafe.*conditions/,
            /health.*hazard/,
            /uninhabitable/,
            /dangerous.*conditions/
        ];

        const unsafeMatches = unsafeHousing.filter(pattern => pattern.test(text)).length;
        if (unsafeMatches > 0) {
            boost += Math.min(0.3, unsafeMatches * 0.1); // Up to 0.3 boost
        }

        return Math.round(boost * 100) / 100;
    }

    /**
     * Detect employment crisis situations affecting basic needs
     */
    detectEmploymentCrisis(text) {
        let boost = 0;

        // Sudden job loss with immediate impact
        const suddenJobLoss = [
            /fired.*today/,
            /laid.*off.*yesterday/,
            /lost.*job.*suddenly/,
            /terminated.*without.*notice/,
            /job.*eliminated/,
            /company.*closed/,
            /business.*shut.*down/,
            /paycheck.*stopped/,
            /unemployment.*denied/,
            /benefits.*expired/,
            /final.*paycheck/
        ];

        const jobLossMatches = suddenJobLoss.filter(pattern => pattern.test(text)).length;
        if (jobLossMatches > 0) {
            boost += Math.min(0.2, jobLossMatches * 0.07); // Up to 0.2 boost (more conservative)
        }

        // Work necessity for basic survival
        const workNecessity = [
            /work.*to.*eat/,
            /job.*to.*survive/,
            /income.*for.*rent/,
            /paycheck.*for.*food/,
            /work.*or.*homeless/,
            /need.*job.*desperately/,
            /must.*work.*immediately/,
            /no.*income.*source/,
            /sole.*breadwinner/,
            /family.*depends.*income/
        ];

        const necessityMatches = workNecessity.filter(pattern => pattern.test(text)).length;
        if (necessityMatches > 0) {
            boost += Math.min(0.3, necessityMatches * 0.1); // Up to 0.3 boost
        }

        // Transportation critical for work
        const workTransportation = [
            /car.*broke.*work/,
            /no.*transportation.*job/,
            /bus.*pass.*work/,
            /ride.*to.*work/,
            /commute.*to.*job/,
            /transportation.*employment/,
            /work.*depends.*car/,
            /job.*requires.*vehicle/,
            /work.*without.*transportation/
        ];

        const transportMatches = workTransportation.filter(pattern => pattern.test(text)).length;
        if (transportMatches > 0) {
            boost += Math.min(0.25, transportMatches * 0.08); // Up to 0.25 boost
        }

        // Work-related medical/childcare needs
        const workSupport = [
            /childcare.*for.*work/,
            /babysitter.*to.*work/,
            /work.*clothes.*interview/,
            /uniform.*for.*job/,
            /work.*boots.*required/,
            /tools.*for.*work/,
            /work.*physical.*exam/,
            /drug.*test.*employment/
        ];

        const supportMatches = workSupport.filter(pattern => pattern.test(text)).length;
        if (supportMatches > 0) {
            boost += Math.min(0.2, supportMatches * 0.07); // Up to 0.2 boost
        }

        return Math.round(boost * 100) / 100;
    }
}

module.exports = UrgencyEnhancements_v1c;