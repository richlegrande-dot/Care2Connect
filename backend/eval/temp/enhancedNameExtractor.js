"use strict";
/**
 * EnhancedNameExtractor.ts - Phase 3 Enhanced Name Extraction
 * Multi-strategy extraction with candidate ranking
 *
 * Strategies:
 * 1. Pattern-based extraction (existing logic)
 * 2. Proper noun detection (NLP-based)
 * 3. Context-based ranking (speaker identification)
 * 4. Candidate ranking and validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhancedNameExtractor = exports.EnhancedNameExtractor = void 0;
class EnhancedNameExtractor {
    constructor() {
        this.nicknameMap = {
            'liz': 'Elizabeth', 'beth': 'Elizabeth', 'mike': 'Michael', 'mickey': 'Michael',
            'dave': 'David', 'sue': 'Susan', 'pat': 'Patricia', 'patty': 'Patricia',
            'bob': 'Robert', 'bobby': 'Robert', 'dick': 'Richard', 'rick': 'Richard',
            'bill': 'William', 'billy': 'William', 'jim': 'James', 'jimmy': 'James',
            'tom': 'Thomas', 'tommy': 'Thomas', 'chris': 'Christopher', 'matt': 'Matthew',
            'jane': 'Jane', 'mary': 'Mary', 'john': 'John', 'paul': 'Paul',
            'george': 'George', 'ringo': 'Ringo', 'pete': 'Peter', 'steve': 'Steven'
        };
        this.nameBlacklist = new Set([
            'help', 'need', 'want', 'have', 'call', 'this', 'that', 'here', 'there',
            'assistance', 'support', 'problem', 'situation', 'calling', 'speaking',
            'dr', 'doctor', 'mr', 'mrs', 'ms', 'miss', 'professor', 'officer',
            'urgent', 'emergency', 'crisis', 'an emergency', 'very urgent',
            'really hard', 'very hard', 'so hard', 'difficult', 'tough',
            'personal', 'private', 'important', 'serious', 'the situation', 'the problem',
            'my case', 'this case', 'facing eviction', 'facing', 'this is an', 'prefer not',
            'um', 'uh', 'er', 'ah', 'well', 'so', 'very', 'really', 'so', 'quite',
            'like', 'you know', 'sort of', 'kind of', 'i mean', 'you see',
            'i\'m', 'i\'m', 'i\'ve', 'i\'ll', 'i\'d', 'you\'re', 'we\'re', 'they\'re', 'it\'s', 'that\'s', 'there\'s'
        ]);
    }
    /**
     * Main extraction method combining multiple strategies
     */
    extract(transcript) {
        const candidates = [];
        // Strategy 1: Pattern-based extraction (highest priority)
        candidates.push(...this.extractByPatterns(transcript));
        // Strategy 2: Proper noun detection
        candidates.push(...this.extractProperNouns(transcript));
        // Strategy 3: Context-based extraction
        candidates.push(...this.extractByContext(transcript));
        // Rank and filter candidates
        const rankedCandidates = this.rankCandidates(candidates, transcript);
        // Select primary candidate
        const primary = rankedCandidates.length > 0 ? rankedCandidates[0].name : null;
        const confidence = rankedCandidates.length > 0 ? rankedCandidates[0].confidence : 0;
        return {
            primary,
            candidates: rankedCandidates.slice(0, 5), // Top 5 candidates
            confidence,
            reasoning: this.generateReasoning(rankedCandidates)
        };
    }
    /**
     * Strategy 1: Pattern-based extraction using comprehensive regex patterns
     */
    extractByPatterns(transcript) {
        const candidates = [];
        const patterns = [
            // Direct introductions (highest confidence)
            {
                regex: /(?:my full name is|full name is)\s+([A-Z][A-Za-z'-]+\s+[A-Z][A-Za-z'-]+)\b/g,
                confidence: 0.95,
                strategy: 'direct_full_name'
            },
            {
                regex: /\b(?:my name is)\s+(?:like,?\s+)?([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/g,
                confidence: 0.92,
                strategy: 'direct_name'
            },
            {
                regex: /(?:i am|this is|i'm)\s+(?:like,?\s+)?([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/g,
                confidence: 0.88,
                strategy: 'self_identification'
            },
            // Titles and honorifics
            {
                regex: /\b(?:dr|doctor|mrs?|ms|mr|miss)\.?\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)+)\b/g,
                confidence: 0.90,
                strategy: 'title_honorific'
            },
            // Third person references
            {
                regex: /(?:called|named|known as)\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)(?:\s+(?:and|but|who|because|calling|speaking|here)|[,.!]|\b)/g,
                confidence: 0.85,
                strategy: 'third_person'
            },
            // Speaker identification
            {
                regex: /([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\s+(?:speaking|calling|here)/g,
                confidence: 0.80,
                strategy: 'speaker_id'
            },
            // Possessive forms
            {
                regex: /([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)'s\s+(?:story|situation|problem|case|need)/g,
                confidence: 0.75,
                strategy: 'possessive'
            },
            // Fragment reconstruction
            {
                regex: /(?:my name is|i'm)\s*\.{2,}\s*(?:it's|its)\s+([A-Z][A-Za-z'-]+\s+[A-Z][A-Za-z'-]+)\b/g,
                confidence: 0.70,
                strategy: 'fragment_reconstruction'
            }
        ];
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.regex.exec(transcript)) !== null) {
                const rawName = match[1].trim();
                const cleanedName = this.cleanName(rawName);
                if (this.validateName(cleanedName)) {
                    candidates.push({
                        name: cleanedName,
                        confidence: pattern.confidence,
                        strategy: pattern.strategy,
                        context: match[0],
                        position: match.index
                    });
                }
            }
        }
        return candidates;
    }
    /**
     * Strategy 2: Proper noun detection using linguistic patterns
     */
    extractProperNouns(transcript) {
        const candidates = [];
        // Find sequences of capitalized words that look like names
        const properNounRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
        let match;
        while ((match = properNounRegex.exec(transcript)) !== null) {
            const candidate = match[1];
            // Additional validation for proper nouns
            if (this.isLikelyName(candidate)) {
                candidates.push({
                    name: candidate,
                    confidence: 0.65, // Lower confidence than pattern-based
                    strategy: 'proper_noun_detection',
                    context: this.getContextSnippet(transcript, match.index, 50),
                    position: match.index
                });
            }
        }
        return candidates;
    }
    /**
     * Strategy 3: Context-based extraction using speaker identification cues
     */
    extractByContext(transcript) {
        const candidates = [];
        // Look for names in specific contexts
        const contextPatterns = [
            {
                regex: /(?:hello|hi),?\s*(?:this is|i am|i'm)\s*,?\s*([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/g,
                confidence: 0.78,
                strategy: 'greeting_context'
            },
            {
                regex: /([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\s*,?\s*(?:and|um|uh)\s+(?:i|we)\s+(?:need|require)/g,
                confidence: 0.72,
                strategy: 'hesitant_context'
            },
            {
                regex: /(?:um|uh|well|so),?\s*([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\s+(?:here|calling|speaking)/g,
                confidence: 0.70,
                strategy: 'filler_context'
            }
        ];
        for (const pattern of contextPatterns) {
            let match;
            while ((match = pattern.regex.exec(transcript)) !== null) {
                const rawName = match[1].trim();
                const cleanedName = this.cleanName(rawName);
                if (this.validateName(cleanedName)) {
                    candidates.push({
                        name: cleanedName,
                        confidence: pattern.confidence,
                        strategy: pattern.strategy,
                        context: match[0],
                        position: match.index
                    });
                }
            }
        }
        return candidates;
    }
    /**
     * Rank candidates by confidence, position, and validation
     */
    rankCandidates(candidates, transcript) {
        return candidates
            .filter(candidate => this.validateName(candidate.name))
            .sort((a, b) => {
            // Primary sort: confidence (higher better)
            if (Math.abs(a.confidence - b.confidence) > 0.01) {
                return b.confidence - a.confidence;
            }
            // Secondary sort: position (earlier better)
            if (a.position !== b.position) {
                return a.position - b.position;
            }
            // Tertiary sort: strategy priority
            const strategyPriority = {
                'direct_full_name': 10,
                'direct_name': 9,
                'title_honorific': 8,
                'self_identification': 7,
                'third_person': 6,
                'speaker_id': 5,
                'greeting_context': 4,
                'possessive': 3,
                'fragment_reconstruction': 2,
                'proper_noun_detection': 1,
                'hesitant_context': 1,
                'filler_context': 1
            };
            return (strategyPriority[b.strategy] || 0) -
                (strategyPriority[a.strategy] || 0);
        })
            .slice(0, 10); // Keep top 10
    }
    /**
     * Clean and normalize name
     */
    cleanName(name) {
        return name
            .replace(/^(called|named|known as|this is|i am|i'm|doctor|dr\.?|mrs?\.?|ms\.?|mr\.?|miss\.?)\s+/i, '')
            .replace(/\s+(and|but|who|because|calling|speaking|here|there|from|on)$/i, '')
            .replace(/[,.!?;:]$/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
    /**
     * Validate name candidate
     */
    validateName(name) {
        if (!name || name.length < 2 || name.length > 50)
            return false;
        if (!/^[A-Za-z\s'-]+$/.test(name))
            return false;
        if (this.nameBlacklist.has(name.toLowerCase()))
            return false;
        if (/^(um|uh|er|ah|well|so|very|really|so|quite|like|you know)$/i.test(name))
            return false;
        // Check for too many consecutive consonants (unlikely in names)
        if (/[^aeiou]{4,}/i.test(name.replace(/\s/g, '')))
            return false;
        return true;
    }
    /**
     * Check if a capitalized sequence is likely a name
     */
    isLikelyName(candidate) {
        const words = candidate.split(/\s+/);
        if (words.length < 1 || words.length > 4)
            return false;
        // All words should start with capital letters
        if (!words.every(word => /^[A-Z]/.test(word)))
            return false;
        // Should not contain common non-name words
        const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        if (words.some(word => commonWords.includes(word.toLowerCase())))
            return false;
        // Should not be all the same word repeated
        if (new Set(words.map(w => w.toLowerCase())).size === 1)
            return false;
        return true;
    }
    /**
     * Get context snippet around a position
     */
    getContextSnippet(text, position, radius) {
        const start = Math.max(0, position - radius);
        const end = Math.min(text.length, position + radius);
        return text.substring(start, end);
    }
    /**
     * Generate reasoning for the extraction result
     */
    generateReasoning(candidates) {
        if (candidates.length === 0) {
            return 'No valid name candidates found';
        }
        const primary = candidates[0];
        return `Selected "${primary.name}" using ${primary.strategy} strategy with ${primary.confidence} confidence. ${candidates.length} total candidates.`;
    }
}
exports.EnhancedNameExtractor = EnhancedNameExtractor;
// Export singleton instance
exports.enhancedNameExtractor = new EnhancedNameExtractor();
