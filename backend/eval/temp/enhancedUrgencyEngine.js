"use strict";
/**
 * Enhanced Urgency Engine (Phase 1)
 * Replaces additive keyword scoring with multi-layer contextual assessment
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedUrgencyEngine = void 0;
/**
 * Layer 1: Temporal Assessment (establishes base urgency from time phrases)
 */
class TemporalLayer {
    assess(text) {
        const textLower = text.toLowerCase();
        // CRITICAL temporal (0.75 - ITERATION 1: was 0.7)
        if (/\b(today|right now|immediately|asap|this moment)\b/.test(textLower)) {
            return { score: 0.75, reason: 'temporal_critical' };
        }
        // HIGH temporal (0.6 - ITERATION 1: was 0.5)
        if (/\b(tomorrow|this week|urgent|soon|quickly)\b/.test(textLower)) {
            return { score: 0.6, reason: 'temporal_high' };
        }
        // MEDIUM temporal (0.4 - ITERATION 1: was 0.3)
        if (/\b(next week|next month|coming up|approaching)\b/.test(textLower)) {
            return { score: 0.4, reason: 'temporal_medium' };
        }
        // LOW temporal (0.15 - ITERATION 3: restored from Iteration 1, was 0.13 in Iteration 2, original 0.1)
        if (/\b(eventually|someday|when possible|whenever|maybe)\b/.test(textLower)) {
            return { score: 0.15, reason: 'temporal_low' };
        }
        // Default: no strong temporal signal (0.25 - ITERATION 3: restored from Iteration 1, was 0.23 in Iteration 2, original 0.2)
        return { score: 0.25, reason: 'temporal_default' };
    }
}
/**
 * Layer 2: Crisis Pattern Detection (multiplicative modifiers)
 */
class CrisisPatternLayer {
    assess(text) {
        const textLower = text.toLowerCase();
        let multiplier = 0.0;
        const reasons = [];
        // Existential threats (×1.6 - ITERATION 1: was ×1.5)
        if (/\b(eviction|evicted|homeless|starving|dying|life-threatening)\b/.test(textLower)) {
            multiplier += 0.6;
            reasons.push('crisis_existential');
        }
        // Safety concerns (×1.4 - ITERATION 1: was ×1.3)
        if (/\b(dangerous|unsafe|threat|violence|violent|domestic|abuse)\b/.test(textLower)) {
            multiplier += 0.4;
            reasons.push('crisis_safety');
        }
        // Time pressure (×1.3 - ITERATION 1: was ×1.2)
        if (/\b(deadline|due date|expire|cutoff|final notice)\b/.test(textLower)) {
            multiplier += 0.3;
            reasons.push('crisis_time_pressure');
        }
        // Medical emergency (×1.5 - ITERATION 1: was ×1.4)
        if (/\b(emergency|critical|hospital|surgery|urgent care)\b/.test(textLower)) {
            multiplier += 0.5;
            reasons.push('crisis_medical_emergency');
        }
        return { multiplier, reasons };
    }
}
/**
 * Layer 3: Category Context (bounded additive boosts)
 */
class CategoryContextLayer {
    assess(text, category) {
        const textLower = text.toLowerCase();
        switch (category) {
            case 'SAFETY':
                // Safety always gets maximum boost (0.30 - ITERATION 1: was 0.25)
                return { boost: 0.30, reason: 'category_safety_max' };
            case 'LEGAL':
                // Check for court dates, deadlines (0.24 - ITERATION 1: was 0.20)
                if (/\b(court|hearing|trial|deadline|legal deadline)\b/.test(textLower)) {
                    return { boost: 0.24, reason: 'category_legal_time_sensitive' };
                }
                return { boost: 0.12, reason: 'category_legal_base' };
            case 'HEALTHCARE':
            case 'MEDICAL':
                // Check for pain, emergency, critical (0.18 - ITERATION 1: was 0.15)
                if (/\b(pain|emergency|critical|surgery|life-threatening)\b/.test(textLower)) {
                    return { boost: 0.18, reason: 'category_healthcare_severe' };
                }
                return { boost: 0.06, reason: 'category_healthcare_base' };
            case 'HOUSING':
                // Check for eviction risk (0.30 - ITERATION 1: was 0.25)
                if (/\b(evict|eviction|kicked out|losing apartment|losing home)\b/.test(textLower)) {
                    return { boost: 0.30, reason: 'category_housing_eviction_risk' };
                }
                if (/\b(behind on rent|can't pay rent|late rent)\b/.test(textLower)) {
                    return { boost: 0.18, reason: 'category_housing_rent_crisis' };
                }
                return { boost: 0.06, reason: 'category_housing_base' };
            case 'TRANSPORTATION':
            case 'EMPLOYMENT':
                // Check for work necessity (0.18 - ITERATION 1: was 0.15)
                if (/\b(work|job|employment|can't get to work|need for work)\b/.test(textLower)) {
                    return { boost: 0.18, reason: 'category_work_necessity' };
                }
                return { boost: 0.06, reason: 'category_work_base' };
            case 'EMERGENCY':
                // Emergency category gets automatic high boost (0.36 - ITERATION 1: was 0.30)
                return { boost: 0.36, reason: 'category_emergency' };
            default:
                return { boost: 0.0, reason: 'category_no_boost' };
        }
    }
}
/**
 * Layer 4: Signal Combination (weak signals together = strong)
 */
class SignalCombinationLayer {
    assess(text) {
        const textLower = text.toLowerCase();
        const matchedSignals = [];
        const signals = [
            { pattern: /\b(help|need|please|desperate)\b/, name: 'help_request' },
            { pattern: /\b(don't know|can't|unable|impossible)\b/, name: 'inability' },
            { pattern: /\b(worried|scared|afraid|anxious|terrified)\b/, name: 'fear' },
            { pattern: /\b(last resort|out of options|nowhere to turn|no choice)\b/, name: 'desperation' },
            { pattern: /\b(urgent|emergency|critical|serious)\b/, name: 'severity' },
            { pattern: /\b(children|kids|family|elderly|disabled)\b/, name: 'vulnerable_dependents' }
        ];
        signals.forEach(signal => {
            if (signal.pattern.test(textLower)) {
                matchedSignals.push(signal.name);
            }
        });
        // Calculate multiplier based on signal count
        // 0-1 signals = ×1.0 (no boost)
        // 2 signals = ×1.1 (10% boost)
        // 3 signals = ×1.2 (20% boost)
        // 4+ signals = ×1.3 (30% boost)
        const signalCount = matchedSignals.length;
        const multiplier = signalCount <= 1 ? 1.0 : 1.0 + Math.min(signalCount - 1, 3) * 0.1;
        return { multiplier, matchedSignals };
    }
}
/**
 * Layer 5: Emotional Distress (small additive with caps)
 */
class EmotionalDistressLayer {
    assess(text) {
        const textLower = text.toLowerCase();
        let boost = 0.0;
        const reasons = [];
        // Desperation markers (+0.12 max - ITERATION 1: was +0.10 max, per-match 0.06 was 0.05)
        const desperationPatterns = [
            'desperate',
            'have no choice',
            'don\'t know what to do',
            'last option',
            'please help',
            'really need',
            'badly need'
        ];
        let desperationCount = 0;
        desperationPatterns.forEach(pattern => {
            if (textLower.includes(pattern)) {
                desperationCount++;
            }
        });
        if (desperationCount > 0) {
            boost += Math.min(desperationCount * 0.06, 0.12);
            reasons.push(`emotional_desperation_x${desperationCount}`);
        }
        // Fear markers (+0.06 - ITERATION 1: was +0.05)
        if (/\b(scared|afraid|terrified|frightened)\b/.test(textLower)) {
            boost += 0.06;
            reasons.push('emotional_fear');
        }
        // Urgency emotion (+0.06 - ITERATION 1: was +0.05)
        if (/\b(panic|panicking|crisis mode)\b/.test(textLower)) {
            boost += 0.06;
            reasons.push('emotional_panic');
        }
        // Cap at +0.18 total (ITERATION 1: was +0.15)
        boost = Math.min(boost, 0.18);
        return { boost, reasons };
    }
}
/**
 * Main Enhanced Urgency Engine
 */
class EnhancedUrgencyEngine {
    constructor() {
        this.temporalLayer = new TemporalLayer();
        this.crisisPatternLayer = new CrisisPatternLayer();
        this.categoryContextLayer = new CategoryContextLayer();
        this.signalCombinationLayer = new SignalCombinationLayer();
        this.emotionalDistressLayer = new EmotionalDistressLayer();
    }
    assess(text, category) {
        const debug = {
            baseScore: 0,
            layerScores: {},
            multipliers: {},
            finalScore: 0,
            confidence: 0,
            chosenLevel: '',
            reasons: []
        };
        // Layer 1: Temporal base score
        const temporal = this.temporalLayer.assess(text);
        debug.baseScore = temporal.score;
        debug.layerScores['temporal'] = temporal.score;
        if (temporal.reason)
            debug.reasons.push(temporal.reason);
        // Layer 2: Crisis multipliers (multiplicative, not additive)
        const crisis = this.crisisPatternLayer.assess(text);
        debug.multipliers['crisis'] = crisis.multiplier;
        debug.reasons.push(...crisis.reasons);
        // Apply crisis multiplier to base score
        let score = debug.baseScore * (1 + crisis.multiplier);
        debug.layerScores['crisis_applied'] = score;
        // Layer 3: Category context boost (additive, bounded)
        const categoryBoost = this.categoryContextLayer.assess(text, category);
        score += categoryBoost.boost;
        debug.layerScores['category'] = categoryBoost.boost;
        if (categoryBoost.reason)
            debug.reasons.push(categoryBoost.reason);
        // Layer 4: Signal combination multiplier
        const signals = this.signalCombinationLayer.assess(text);
        debug.multipliers['signals'] = signals.multiplier;
        debug.reasons.push(`signal_combination_x${signals.matchedSignals.length}`);
        score *= signals.multiplier;
        debug.layerScores['signals_applied'] = score;
        // Layer 5: Emotional distress boost (additive, capped)
        const emotional = this.emotionalDistressLayer.assess(text);
        score += emotional.boost;
        debug.layerScores['emotional'] = emotional.boost;
        debug.reasons.push(...emotional.reasons);
        // Calculate confidence based on how many layers contributed
        const contributingLayers = [
            temporal.score > 0.2,
            crisis.multiplier > 0,
            categoryBoost.boost > 0,
            signals.matchedSignals.length > 1,
            emotional.boost > 0
        ].filter(Boolean).length;
        const confidence = contributingLayers / 5; // 0-1 scale
        debug.confidence = confidence;
        // Apply confidence-based thresholding
        const finalScore = Math.min(score, 1.0); // Cap at 1.0
        debug.finalScore = finalScore;
        const level = this.applyConfidenceThresholds(finalScore, confidence);
        debug.chosenLevel = level;
        return {
            level,
            score: finalScore,
            confidence,
            debug
        };
    }
    applyConfidenceThresholds(score, confidence) {
        // High confidence = wider bands (more stable, less sensitive to threshold edges)
        // Low confidence = narrower bands (more conservative, stick to thresholds)
        const thresholdAdjustment = confidence * 0.05; // 0-5% band width based on confidence (reverted to original)
        // CRITICAL threshold: 0.70 (ITERATION 3: lowered from 0.75 to make easier to reach)
        if (score >= 0.70 - thresholdAdjustment) {
            return 'CRITICAL';
        }
        // HIGH threshold: 0.45 (ITERATION 3: lowered from 0.5)
        if (score >= 0.45 - thresholdAdjustment) {
            return 'HIGH';
        }
        // MEDIUM threshold: 0.23 (ITERATION 3: lowered from 0.25)
        if (score >= 0.23 - thresholdAdjustment) {
            return 'MEDIUM';
        }
        return 'LOW';
    }
}
exports.EnhancedUrgencyEngine = EnhancedUrgencyEngine;
