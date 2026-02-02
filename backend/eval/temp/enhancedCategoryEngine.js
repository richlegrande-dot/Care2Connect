"use strict";
/**
 * Enhanced Category Engine (Phase 2)
 * Multi-intent detection with cause-effect disambiguation
 * Replaces single-winner priority selection with contextual primary selection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedCategoryEngine = void 0;
/**
 * Multi-Intent Detector
 * Detects ALL relevant categories, not just highest-priority
 */
class IntentDetector {
    detectAll(text) {
        const textLower = text.toLowerCase();
        const intents = [];
        // SAFETY: Violence, abuse, danger
        if (this.hasSafetySignals(textLower)) {
            intents.push({
                category: 'SAFETY',
                confidence: 0.9,
                signals: this.extractSafetySignals(textLower)
            });
        }
        // HOUSING: Rent, eviction, homelessness
        if (this.hasHousingSignals(textLower)) {
            intents.push({
                category: 'HOUSING',
                confidence: 0.85,
                signals: this.extractHousingSignals(textLower)
            });
        }
        // EMPLOYMENT: Job loss, work, unemployment
        if (this.hasEmploymentSignals(textLower)) {
            intents.push({
                category: 'EMPLOYMENT',
                confidence: 0.8,
                signals: this.extractEmploymentSignals(textLower)
            });
        }
        // TRANSPORTATION: Vehicle, car, transportation
        if (this.hasTransportationSignals(textLower)) {
            intents.push({
                category: 'TRANSPORTATION',
                confidence: 0.75,
                signals: this.extractTransportationSignals(textLower)
            });
        }
        // HEALTHCARE: Medical, health, treatment
        if (this.hasHealthcareSignals(textLower)) {
            intents.push({
                category: 'HEALTHCARE',
                confidence: 0.85,
                signals: this.extractHealthcareSignals(textLower)
            });
        }
        // LEGAL: Court, legal, lawyer
        if (this.hasLegalSignals(textLower)) {
            intents.push({
                category: 'LEGAL',
                confidence: 0.8,
                signals: this.extractLegalSignals(textLower)
            });
        }
        // FOOD: Hunger, food insecurity
        if (this.hasFoodSignals(textLower)) {
            intents.push({
                category: 'FOOD',
                confidence: 0.85,
                signals: this.extractFoodSignals(textLower)
            });
        }
        // EDUCATION: School, tuition, training
        if (this.hasEducationSignals(textLower)) {
            intents.push({
                category: 'EDUCATION',
                confidence: 0.75,
                signals: this.extractEducationSignals(textLower)
            });
        }
        return intents.sort((a, b) => b.confidence - a.confidence);
    }
    hasSafetySignals(text) {
        return /\b(dangerous|unsafe|threat|threaten|violence|violent|abuse|abuser|domestic|assault|fleeing|hiding|escape|emergency|urgent)\b/.test(text);
    }
    extractSafetySignals(text) {
        const signals = [];
        if (/\b(dangerous|unsafe)\b/.test(text))
            signals.push('danger');
        if (/\b(violence|violent|assault)\b/.test(text))
            signals.push('violence');
        if (/\b(abuse|abuser|domestic)\b/.test(text))
            signals.push('abuse');
        if (/\b(fleeing|hiding|escape)\b/.test(text))
            signals.push('fleeing');
        if (/\b(threat|threaten)\b/.test(text))
            signals.push('threatening');
        if (/\b(emergency|urgent)\b/.test(text))
            signals.push('emergency');
        return signals;
    }
    hasHousingSignals(text) {
        return /\b(rent|evict|eviction|housing|apartment|homeless|landlord|lease|deposit|utilities)\b/.test(text);
    }
    extractHousingSignals(text) {
        const signals = [];
        if (/\b(evict|eviction)\b/.test(text))
            signals.push('eviction');
        if (/\bretnt?\b/.test(text))
            signals.push('rent');
        if (/\bhomeless\b/.test(text))
            signals.push('homelessness');
        if (/\b(apartment|housing)\b/.test(text))
            signals.push('housing_general');
        if (/\blandlord\b/.test(text))
            signals.push('landlord');
        return signals;
    }
    hasEmploymentSignals(text) {
        return /\b(work|job|employment|unemployed|laid off|fired|terminated|paycheck|income|shift)\b/.test(text);
    }
    extractEmploymentSignals(text) {
        const signals = [];
        if (/\b(laid off|fired|terminated)\b/.test(text))
            signals.push('job_loss');
        if (/\b(work|job|employment)\b/.test(text))
            signals.push('work_general');
        if (/\bunemployed\b/.test(text))
            signals.push('unemployment');
        if (/\b(paycheck|income)\b/.test(text))
            signals.push('income');
        return signals;
    }
    hasTransportationSignals(text) {
        return /\b(car|vehicle|truck|transportation|bus|transit|commute|ride|driver)\b/.test(text);
    }
    extractTransportationSignals(text) {
        const signals = [];
        if (/\b(car|vehicle|truck)\b/.test(text))
            signals.push('vehicle');
        if (/\b(broke|broken|repair|fix)\b/.test(text))
            signals.push('repair');
        if (/\b(commute|ride)\b/.test(text))
            signals.push('commute');
        if (/\b(bus|transit)\b/.test(text))
            signals.push('public_transit');
        return signals;
    }
    hasHealthcareSignals(text) {
        return /\b(medical|health|healthcare|doctor|hospital|surgery|treatment|medication|medicine|sick|illness)\b/.test(text);
    }
    extractHealthcareSignals(text) {
        const signals = [];
        if (/\b(surgery|operation)\b/.test(text))
            signals.push('surgery');
        if (/\b(doctor|hospital|clinic)\b/.test(text))
            signals.push('medical_facility');
        if (/\b(medication|medicine|treatment)\b/.test(text))
            signals.push('treatment');
        if (/\b(emergency)\b/.test(text))
            signals.push('medical_emergency');
        return signals;
    }
    hasLegalSignals(text) {
        return /\b(court|legal|lawyer|attorney|trial|hearing|lawsuit|judge|case)\b/.test(text);
    }
    extractLegalSignals(text) {
        const signals = [];
        if (/\b(court|trial|hearing)\b/.test(text))
            signals.push('court');
        if (/\b(lawyer|attorney)\b/.test(text))
            signals.push('legal_representation');
        if (/\b(lawsuit|case)\b/.test(text))
            signals.push('legal_case');
        return signals;
    }
    hasFoodSignals(text) {
        return /\b(food|hungry|hunger|starving|starve|meal|eat|groceries|food bank)\b/.test(text);
    }
    extractFoodSignals(text) {
        const signals = [];
        if (/\b(hungry|hunger|starving)\b/.test(text))
            signals.push('hunger');
        if (/\b(food|meal|groceries)\b/.test(text))
            signals.push('food_general');
        if (/\bfood bank\b/.test(text))
            signals.push('food_bank');
        return signals;
    }
    hasEducationSignals(text) {
        return /\b(school|education|tuition|college|university|training|certification|degree|class|student)\b/.test(text);
    }
    extractEducationSignals(text) {
        const signals = [];
        if (/\b(tuition|fees)\b/.test(text))
            signals.push('tuition');
        if (/\b(certification|training|degree)\b/.test(text))
            signals.push('training');
        if (/\b(school|college|university)\b/.test(text))
            signals.push('school');
        return signals;
    }
}
/**
 * Cause-Effect Analyzer
 * Determines relationships between multiple intents
 */
class CauseEffectAnalyzer {
    analyze(intents, text) {
        const graph = new Map();
        // Initialize graph with all intents
        intents.forEach(intent => {
            if (!graph.has(intent.category)) {
                graph.set(intent.category, []);
            }
        });
        // Detect cause-effect relationships
        // TRANSPORTATION → EMPLOYMENT (car broke, can't work)
        if (this.hasIntent(intents, 'TRANSPORTATION') && this.hasIntent(intents, 'EMPLOYMENT')) {
            if (/\b(can't get to work|can't work|unable to work|cannot work)\b/i.test(text)) {
                this.addEdge(graph, 'TRANSPORTATION', 'EMPLOYMENT');
            }
        }
        // EMPLOYMENT → HOUSING (lost job, can't pay rent)
        if (this.hasIntent(intents, 'EMPLOYMENT') && this.hasIntent(intents, 'HOUSING')) {
            if (/\b(can't pay rent|behind on rent|lost.*job.*rent|laid off.*rent)\b/i.test(text)) {
                this.addEdge(graph, 'EMPLOYMENT', 'HOUSING');
            }
        }
        // HEALTHCARE → EMPLOYMENT (medical issue, can't work)
        if (this.hasIntent(intents, 'HEALTHCARE') && this.hasIntent(intents, 'EMPLOYMENT')) {
            if (/\b(sick.*can't work|medical.*unable to work|injury.*can't work)\b/i.test(text)) {
                this.addEdge(graph, 'HEALTHCARE', 'EMPLOYMENT');
            }
        }
        // SAFETY → HOUSING (fleeing abuse, need housing)
        if (this.hasIntent(intents, 'SAFETY') && this.hasIntent(intents, 'HOUSING')) {
            if (/\b(fleeing|escape.*need.*place|domestic.*housing)\b/i.test(text)) {
                this.addEdge(graph, 'SAFETY', 'HOUSING');
            }
        }
        return graph;
    }
    hasIntent(intents, category) {
        return intents.some(i => i.category === category);
    }
    addEdge(graph, from, to) {
        const edges = graph.get(from) || [];
        edges.push(to);
        graph.set(from, edges);
    }
}
/**
 * Context-Aware Primary Selector
 * Selects primary category using context, not just priority
 */
class PrimarySelector {
    select(intents, causeEffectGraph, text) {
        if (intents.length === 0) {
            return {
                primary: 'OTHER',
                allIntents: [],
                confidence: 0.3,
                reasoning: 'No intents detected, defaulting to OTHER'
            };
        }
        if (intents.length === 1) {
            return {
                primary: intents[0].category,
                allIntents: intents,
                confidence: intents[0].confidence,
                reasoning: 'Single intent detected'
            };
        }
        // Multi-intent disambiguation
        const primary = this.disambiguate(intents, causeEffectGraph, text);
        return {
            primary: primary.category,
            allIntents: intents,
            confidence: primary.confidence,
            reasoning: primary.reasoning
        };
    }
    disambiguate(intents, graph, text) {
        const textLower = text.toLowerCase();
        // SAFETY always takes priority when violence/threat present (but not eviction threats alone)
        const safetyIntent = intents.find(i => i.category === 'SAFETY');
        if (safetyIntent) {
            // Distinguish eviction threats (HOUSING) from actual safety emergencies (SAFETY)
            const isEvictionThreat = /\b(evict|eviction)\b/.test(textLower) &&
                /\b(threaten|threat)\b/.test(textLower) &&
                !/\b(violence|violent|abuse|dangerous|unsafe|assault|fleeing|hiding)\b/.test(textLower);
            if (isEvictionThreat) {
                // Eviction threat without violence signals → HOUSING
                // Fall through to other disambiguation logic
            }
            else if (/\b(violence|violent|abuse|dangerous|unsafe|assault|emergency|urgent)\b/.test(textLower)) {
                return {
                    category: 'SAFETY',
                    confidence: 0.95,
                    reasoning: 'SAFETY prioritized due to violence/danger/emergency signals'
                };
            }
        }
        // TRANSPORTATION vs EMPLOYMENT disambiguation
        if (this.hasIntent(intents, 'TRANSPORTATION') && this.hasIntent(intents, 'EMPLOYMENT')) {
            const workKeywords = ['work', 'job', 'employment', 'employed', 'shift', 'paycheck', 'income', 'commute'];
            const workScore = workKeywords.filter(kw => new RegExp(`\\b${kw}\\b`, 'i').test(text)).length;
            const repairKeywords = ['broke', 'repair', 'fix', 'broken', 'mechanic', 'maintenance', 'needs work'];
            const repairScore = repairKeywords.filter(kw => new RegExp(`\\b${kw}\\b`, 'i').test(text)).length;
            // Work context dominates? Prioritize EMPLOYMENT
            if (workScore > repairScore * 1.5 && workScore >= 2) {
                return {
                    category: 'EMPLOYMENT',
                    confidence: 0.85,
                    reasoning: `EMPLOYMENT prioritized (work context: ${workScore} vs repair: ${repairScore})`
                };
            }
        }
        // EMPLOYMENT vs HOUSING disambiguation
        if (this.hasIntent(intents, 'EMPLOYMENT') && this.hasIntent(intents, 'HOUSING')) {
            // Eviction risk? Prioritize HOUSING
            if (/\b(evict|eviction|kicked out|losing apartment|losing home)\b/i.test(text)) {
                return {
                    category: 'HOUSING',
                    confidence: 0.9,
                    reasoning: 'HOUSING prioritized due to eviction risk'
                };
            }
            // Job loss mentioned? Check if it's cause (EMPLOYMENT) or effect (rent consequence)
            if (/\b(laid off|fired|terminated|lost.*job)\b/i.test(text)) {
                // If rent is consequence ("laid off, can't pay rent"), EMPLOYMENT is primary
                if (/\b(laid off|fired).{0,50}(rent|housing|eviction)\b/i.test(text)) {
                    return {
                        category: 'EMPLOYMENT',
                        confidence: 0.85,
                        reasoning: 'EMPLOYMENT prioritized as root cause (job loss → rent crisis)'
                    };
                }
            }
        }
        // HEALTHCARE vs SAFETY disambiguation
        if (this.hasIntent(intents, 'HEALTHCARE') && this.hasIntent(intents, 'SAFETY')) {
            // Medical emergency? HEALTHCARE wins
            if (/\b(surgery|hospital|medical emergency|life-threatening|critical|doctor)\b/i.test(text)) {
                return {
                    category: 'HEALTHCARE',
                    confidence: 0.9,
                    reasoning: 'HEALTHCARE prioritized due to medical emergency'
                };
            }
        }
        // Default: Highest confidence intent
        return {
            category: intents[0].category,
            confidence: intents[0].confidence,
            reasoning: 'Highest confidence intent selected'
        };
    }
    hasIntent(intents, category) {
        return intents.some(i => i.category === category);
    }
}
/**
 * Main Enhanced Category Engine
 */
class EnhancedCategoryEngine {
    constructor() {
        this.intentDetector = new IntentDetector();
        this.causeEffectAnalyzer = new CauseEffectAnalyzer();
        this.primarySelector = new PrimarySelector();
    }
    assess(text) {
        // Detect all intents
        const intents = this.intentDetector.detectAll(text);
        // Build cause-effect graph
        const causeEffectGraph = this.causeEffectAnalyzer.analyze(intents, text);
        // Select primary category
        const result = this.primarySelector.select(intents, causeEffectGraph, text);
        return result;
    }
}
exports.EnhancedCategoryEngine = EnhancedCategoryEngine;
