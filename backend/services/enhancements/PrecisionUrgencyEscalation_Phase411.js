/**
 * Phase 4.11: Precision Urgency Under-Assessment Fix
 * Target: 10 of 28 urgency_under_assessed cases (36% of bucket)
 * 
 * Strategy: Identify cases that should be escalated (LOW→MEDIUM, MEDIUM→HIGH)
 * Focus: Clear urgency indicators that were missed
 * 
 * Expected improvement: ~2% (10/500 cases)
 * Confidence level: MEDIUM-HIGH
 */

class PrecisionUrgencyEscalation_Phase411 {
    constructor() {
        this.name = "Phase 4.11: Precision Urgency Under-Assessment Fix";
        this.targetCases = 10;
        this.confidenceLevel = "MEDIUM-HIGH";
        console.log("✅ Phase 4.11 Urgency Escalation loaded - targeting 10 cases for under-assessment correction");
    }

    shouldApply(callData, currentResult) {
        // Only apply if under-assessed (too low urgency)
        const hasUrgencyIndicators = this.hasStrongUrgencyIndicators(callData);
        const isUnderAssessed = this.isUrgencyUnderAssessed(callData, currentResult);
        
        return hasUrgencyIndicators && isUnderAssessed;
    }

    hasStrongUrgencyIndicators(callData) {
        const text = (callData.transcript || '').toLowerCase();
        
        // Time pressure indicators
        const timePressure = [
            'tomorrow', 'today', 'by friday', 'this week', 'asap', 
            'immediately', 'urgent', 'deadline', 'due date'
        ];
        
        // Crisis indicators
        const crisisWords = [
            'shutoff', 'disconnect', 'notice', 'final notice',
            'eviction', 'homeless', 'stranded', 'emergency',
            'broke down', 'no money', 'can\'t afford'
        ];

        // Service termination threats
        const serviceTermination = [
            'shut off', 'turn off', 'disconnect', 'cancel service',
            'cut off', 'service termination'
        ];

        return timePressure.some(word => text.includes(word)) ||
               crisisWords.some(word => text.includes(word)) ||
               serviceTermination.some(phrase => text.includes(phrase));
    }

    isUrgencyUnderAssessed(callData, currentResult) {
        const text = (callData.transcript || '').toLowerCase();
        const urgency = currentResult.urgency;

        // LOW → MEDIUM candidates
        if (urgency === 'LOW') {
            // Any bill with shutoff notice should be MEDIUM+
            if (text.includes('bill') && (text.includes('shutoff') || text.includes('notice'))) {
                return true;
            }
            
            // Time-sensitive requests
            if (text.includes('tomorrow') || text.includes('by friday') || text.includes('deadline')) {
                return true;
            }
        }

        // MEDIUM → HIGH candidates
        if (urgency === 'MEDIUM') {
            // Utilities with immediate shutoff
            if ((text.includes('electric') || text.includes('gas') || text.includes('water')) &&
                (text.includes('shutoff') || text.includes('tomorrow'))) {
                return true;
            }
            
            // Housing with eviction threat
            if (text.includes('rent') && (text.includes('eviction') || text.includes('notice'))) {
                return true;
            }
            
            // Transportation breakdown (stranded situation)
            if ((text.includes('car') || text.includes('vehicle')) && 
                (text.includes('broke down') || text.includes('stranded'))) {
                return true;
            }
        }

        return false;
    }

    apply(callData, currentResult) {
        const text = (callData.transcript || '').toLowerCase();
        const currentUrgency = currentResult.urgency;

        // LOW → MEDIUM escalations
        if (currentUrgency === 'LOW') {
            let reason = "";
            if (text.includes('bill') && (text.includes('shutoff') || text.includes('notice'))) {
                reason = "Bill with shutoff notice";
            } else if (text.includes('tomorrow') || text.includes('by friday')) {
                reason = "Time-sensitive deadline";
            } else if (text.includes('deadline')) {
                reason = "Deadline pressure";
            }

            if (reason) {
                return {
                    ...currentResult,
                    urgency: 'MEDIUM',
                    confidence: Math.min(0.95, currentResult.confidence + 0.1),
                    processingNotes: [
                        ...(currentResult.processingNotes || []),
                        `⬆️ Phase 4.11 Urgency Escalation: LOW → MEDIUM (${reason})`
                    ]
                };
            }
        }

        // MEDIUM → HIGH escalations  
        if (currentUrgency === 'MEDIUM') {
            let reason = "";
            if ((text.includes('electric') || text.includes('gas') || text.includes('water')) &&
                (text.includes('shutoff') || text.includes('tomorrow'))) {
                reason = "Utility shutoff imminent";
            } else if (text.includes('rent') && (text.includes('eviction') || text.includes('notice'))) {
                reason = "Housing eviction threat";
            } else if ((text.includes('car') || text.includes('vehicle')) && 
                       (text.includes('broke down') || text.includes('stranded'))) {
                reason = "Transportation crisis";
            }

            if (reason) {
                return {
                    ...currentResult,
                    urgency: 'HIGH',
                    confidence: Math.min(0.95, currentResult.confidence + 0.1),
                    processingNotes: [
                        ...(currentResult.processingNotes || []),
                        `⬆️ Phase 4.11 Urgency Escalation: MEDIUM → HIGH (${reason})`
                    ]
                };
            }
        }

        return currentResult;
    }

    getStats() {
        return {
            phase: "4.11",
            name: "Precision Urgency Under-Assessment Fix",
            targetCases: 10,
            targetBucket: "urgency_under_assessed",
            bucketSize: 28,
            expectedImprovement: "2.0%",
            confidenceLevel: "MEDIUM-HIGH"
        };
    }
}

module.exports = PrecisionUrgencyEscalation_Phase411;