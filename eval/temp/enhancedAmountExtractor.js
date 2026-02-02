"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedAmountExtractor = void 0;
const enhancedExtractorBase_1 = require("./enhancedExtractorBase");
class EnhancedAmountExtractor extends enhancedExtractorBase_1.EnhancedExtractor {
    constructor() {
        super(...arguments);
        this.vagueAmountMap = {
            'couple hundred': 250,
            'few hundred': 400,
            'several hundred': 600,
            'couple thousand': 2500,
            'few thousand': 4000,
            'several thousand': 6000,
            'couple of thousand': 2500,
            'a few thousand': 4000,
            'couple of hundred': 250,
            'a couple hundred': 250,
            'a couple thousand': 2500
        };
    }
    extract(transcript) {
        const candidates = [];
        // Strategy 1: Pattern-based extraction (highest confidence)
        candidates.push(...this.extractByPatterns(transcript));
        // Strategy 2: Context-aware extraction
        candidates.push(...this.extractByContext(transcript));
        // Strategy 3: Vague amount resolution
        candidates.push(...this.extractVagueAmounts(transcript));
        // Strategy 4: Range resolution
        candidates.push(...this.extractFromRanges(transcript));
        // Rank and select best candidate
        const ranked = this.rankCandidates(candidates, transcript);
        if (ranked.length === 0) {
            return {
                primary: null,
                confidence: 0,
                candidates: [],
                reasoning: 'No amounts found'
            };
        }
        const primary = ranked[0];
        return {
            primary: primary.value,
            confidence: primary.confidence,
            candidates: ranked.slice(0, 5), // Top 5 candidates
            reasoning: `Selected ${primary.value} via ${primary.strategy} (confidence: ${primary.confidence.toFixed(2)})`
        };
    }
    extractByPatterns(transcript) {
        const candidates = [];
        const lower = transcript.toLowerCase();
        // Enhanced pattern matching with context awareness
        const patterns = [
            // Direct goal statements (highest confidence)
            {
                regex: /(?:need|require|asking for|goal is|trying to raise|fundraising for)\s+\$?([0-9,]+(?:\.\d{2})?)/gi,
                confidence: 0.95,
                strategy: 'direct_goal'
            },
            // Help/assistance context
            {
                regex: /(?:help|assistance|goal|raise|about)(?:\s+(?:about|around|approximately))?\s+(?:help\s+with\s+)?\$?([0-9,]+)(?:\s+(?:for|to|with|dollars?|bucks|deposit|supplies|repairs|costs?|bills?|fees?|rent|utilities?|groceries|food|medication|treatment|childcare|school|supplies))/gi,
                confidence: 0.90,
                strategy: 'help_assistance'
            },
            // Category-specific costs
            {
                regex: /(?:court|legal|medical|rent|utility|electric|gas|water|phone|internet|insurance|tax|fee|fine|penalty)\s+(?:cost|fee|bill)s?\s+(?:about\s+|around\s+|approximately\s+)?\$?([0-9,]+(?:\.\d{2})?)/gi,
                confidence: 0.85,
                strategy: 'category_specific'
            },
            // Currency context
            {
                regex: /\$([0-9,]+(?:\.\d{2})?).*?(?:needed|required|help|assistance|goal|to raise)/gi,
                confidence: 0.80,
                strategy: 'currency_context'
            },
            // Bare currency amounts
            {
                regex: /\$([0-9,]+(?:\.\d{2})?)\s+(?:dollars?|bucks)\s+(?:to|for|that|needed|required|goal)/gi,
                confidence: 0.75,
                strategy: 'currency_only'
            },
            // Bare numbers in goal contexts
            {
                regex: /(?:need|want|help|assistance|goal|raise|about)(?:\s+(?:about|around|approximately))?\s+(?:help\s+with\s+)?([0-9,]+)(?:\s+(?:for|to|with|dollars?|bucks|deposit|supplies|repairs|costs?|bills?|fees?|rent|utilities?|groceries|food|medication|treatment|childcare|school|supplies|security))?/gi,
                confidence: 0.70,
                strategy: 'bare_number'
            }
        ];
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.regex.exec(transcript)) !== null) {
                const rawAmount = match[1];
                const numericValue = this.parseAmount(rawAmount);
                if (numericValue && this.isValidAmount(numericValue)) {
                    const position = match.index;
                    candidates.push({
                        value: numericValue,
                        rawText: rawAmount,
                        confidence: pattern.confidence,
                        strategy: pattern.strategy,
                        context: {
                            before: transcript.substring(Math.max(0, position - 50), position),
                            after: transcript.substring(position + match[0].length, position + match[0].length + 50),
                            position
                        }
                    });
                }
            }
        }
        return candidates;
    }
    extractByContext(transcript) {
        const candidates = [];
        const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i].trim();
            const lower = sentence.toLowerCase();
            // Look for amount mentions in context of need/help
            if (lower.includes('need') || lower.includes('help') || lower.includes('cost') || lower.includes('pay')) {
                const amountMatches = sentence.match(/\$?([0-9,]+(?:\.\d{2})?)/g);
                if (amountMatches) {
                    for (const match of amountMatches) {
                        const numericValue = this.parseAmount(match.replace('$', ''));
                        if (numericValue && this.isValidAmount(numericValue)) {
                            const position = transcript.indexOf(sentence);
                            candidates.push({
                                value: numericValue,
                                rawText: match,
                                confidence: 0.65,
                                strategy: 'contextual',
                                context: {
                                    before: sentence.substring(0, 30),
                                    after: sentence.substring(sentence.length - 30),
                                    position
                                }
                            });
                        }
                    }
                }
            }
        }
        return candidates;
    }
    extractVagueAmounts(transcript) {
        const candidates = [];
        for (const [phrase, value] of Object.entries(this.vagueAmountMap)) {
            const regex = new RegExp(`\\b${phrase.replace(/\s+/g, '\\s+')}\\b`, 'gi');
            let match;
            while ((match = regex.exec(transcript)) !== null) {
                const position = match.index;
                candidates.push({
                    value,
                    rawText: phrase,
                    confidence: 0.60,
                    strategy: 'vague_mapping',
                    context: {
                        before: transcript.substring(Math.max(0, position - 30), position),
                        after: transcript.substring(position + match[0].length, position + match[0].length + 30),
                        position
                    }
                });
            }
        }
        return candidates;
    }
    extractFromRanges(transcript) {
        const candidates = [];
        // Handle ranges like "between 1500 and 2000"
        const rangeRegex = /(?:between|from)\s+\$?([0-9,]+(?:\.\d{2})?)\s+(?:and|to)\s+\$?([0-9,]+(?:\.\d{2})?)/gi;
        let match;
        while ((match = rangeRegex.exec(transcript)) !== null) {
            const low = this.parseAmount(match[1]);
            const high = this.parseAmount(match[2]);
            if (low && high && this.isValidAmount(low) && this.isValidAmount(high)) {
                // Take midpoint of range
                const midpoint = Math.round((low + high) / 2);
                const position = match.index;
                candidates.push({
                    value: midpoint,
                    rawText: `${match[1]}-${match[2]}`,
                    confidence: 0.55,
                    strategy: 'range_midpoint',
                    context: {
                        before: transcript.substring(Math.max(0, position - 30), position),
                        after: transcript.substring(position + match[0].length, position + match[0].length + 30),
                        position
                    }
                });
            }
        }
        return candidates;
    }
    rankCandidates(candidates, transcript) {
        return candidates
            .filter(candidate => this.isValidAmount(candidate.value))
            .map(candidate => (Object.assign(Object.assign({}, candidate), { confidence: this.adjustConfidence(candidate, transcript) })))
            .sort((a, b) => {
            // Sort by confidence, then by position (earlier is better), then by strategy priority
            if (Math.abs(a.confidence - b.confidence) > 0.01) {
                return b.confidence - a.confidence;
            }
            if (a.context.position !== b.context.position) {
                return a.context.position - b.context.position;
            }
            return this.getStrategyPriority(b.strategy) - this.getStrategyPriority(a.strategy);
        });
    }
    adjustConfidence(candidate, transcript) {
        let confidence = candidate.confidence;
        // Boost for emergency keywords
        const emergencyKeywords = ['urgent', 'emergency', 'crisis', 'eviction', 'homeless', 'surgery'];
        const hasEmergency = emergencyKeywords.some(keyword => transcript.toLowerCase().includes(keyword));
        if (hasEmergency) {
            confidence += 0.05;
        }
        // Boost for specific amounts (not vague)
        if (candidate.strategy !== 'vague_mapping' && candidate.value >= 100) {
            confidence += 0.03;
        }
        // Penalty for very high amounts (likely false positives)
        if (candidate.value > 50000) {
            confidence -= 0.10;
        }
        // Penalty for very low amounts (likely false positives)
        if (candidate.value < 50) {
            confidence -= 0.05;
        }
        return Math.max(0, Math.min(1, confidence));
    }
    getStrategyPriority(strategy) {
        const priorities = {
            'direct_goal': 10,
            'help_assistance': 9,
            'category_specific': 8,
            'currency_context': 7,
            'currency_only': 6,
            'bare_number': 5,
            'contextual': 4,
            'vague_mapping': 3,
            'range_midpoint': 2
        };
        return priorities[strategy] || 0;
    }
    parseAmount(amountStr) {
        try {
            // Remove commas and dollar signs
            const clean = amountStr.replace(/[,$]/g, '');
            const parsed = parseFloat(clean);
            return isNaN(parsed) ? null : Math.round(parsed);
        }
        catch (_a) {
            return null;
        }
    }
    isValidAmount(amount) {
        return amount >= 10 && amount <= 100000; // Reasonable bounds for donation requests
    }
}
exports.EnhancedAmountExtractor = EnhancedAmountExtractor;
