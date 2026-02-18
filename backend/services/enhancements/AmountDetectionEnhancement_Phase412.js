/**
 * Phase 4.12: Amount Detection Enhancement
 * Target: 12 of 20 amount_missing cases (60% of bucket) 
 * 
 * Strategy: Enhanced pattern matching for amounts that existing system misses
 * Focus: Spelled out numbers, complex formats, contextual amounts
 * 
 * Expected improvement: ~2.4% (12/500 cases)
 * Confidence level: HIGH (amount detection is algorithmic)
 */

class AmountDetectionEnhancement_Phase412 {
    constructor() {
        this.name = "Phase 4.12: Amount Detection Enhancement";
        this.targetCases = 12;
        this.confidenceLevel = "HIGH";
        console.log("✅ Phase 4.12 Amount Detection loaded - targeting 12 cases for missing amount extraction");
        
        // Spelled out number mappings
        this.wordToNumber = {
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
            'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
            'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
            'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
            'eighty': 80, 'ninety': 90, 'hundred': 100, 'thousand': 1000
        };
    }

    shouldApply(callData, currentResult) {
        // Apply if no amount was detected but there should be one
        if (currentResult.amount && currentResult.amount > 0) {
            return false; // Amount already detected
        }

        const text = (callData.transcript || '').toLowerCase();
        return this.hasMissedAmountPatterns(text);
    }

    hasMissedAmountPatterns(text) {
        // Check for spelled out amounts
        if (this.hasSpelledOutNumbers(text)) return true;
        
        // Check for contextual amounts
        if (this.hasContextualAmounts(text)) return true;
        
        // Check for currency symbols without clear numbers
        if (this.hasCurrencyPatterns(text)) return true;
        
        return false;
    }

    hasSpelledOutNumbers(text) {
        // Look for spelled out numbers in financial contexts
        const patterns = [
            /need (one|two|three|four|five|six|seven|eight|nine|ten) (hundred|thousand)/,
            /(one|two|three|four|five) hundred (dollar|buck)/,
            /about (twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety) (dollar|buck)/,
            /(fifteen|twenty|twenty-five|thirty|fifty) (dollar|buck)/
        ];
        
        return patterns.some(pattern => pattern.test(text));
    }

    hasContextualAmounts(text) {
        // Look for amount context without clear numbers
        const contexts = [
            'rent is due', 'bill amount', 'total cost', 'what i owe',
            'balance due', 'payment amount', 'cost of', 'price of'
        ];
        
        return contexts.some(context => text.includes(context));
    }

    hasCurrencyPatterns(text) {
        // Look for currency symbols with potential missed numbers
        return /\$\s*[a-z]/.test(text) || // "$twenty" etc
               /dollar[s]?\s*[a-z]/.test(text); // "dollars twenty"
    }

    apply(callData, currentResult) {
        const text = (callData.transcript || '').toLowerCase();
        
        // Try to extract missed amounts
        const extractedAmount = this.extractAmount(text);
        
        if (extractedAmount && extractedAmount > 0) {
            return {
                ...currentResult,
                amount: extractedAmount,
                confidence: Math.min(0.95, currentResult.confidence + 0.05),
                processingNotes: [
                    ...(currentResult.processingNotes || []),
                    `💰 Phase 4.12 Amount Detection: Extracted missing amount $${extractedAmount}`
                ]
            };
        }

        return currentResult;
    }

    extractAmount(text) {
        // Try different extraction methods
        
        // Method 1: Spelled out numbers
        const spelledAmount = this.extractSpelledOutAmount(text);
        if (spelledAmount) return spelledAmount;
        
        // Method 2: Context-based extraction  
        const contextAmount = this.extractContextualAmount(text);
        if (contextAmount) return contextAmount;
        
        // Method 3: Currency symbol patterns
        const currencyAmount = this.extractCurrencyPatterns(text);
        if (currencyAmount) return currencyAmount;
        
        return null;
    }

    extractSpelledOutAmount(text) {
        // Extract "five hundred dollars", "twenty bucks", etc.
        const patterns = [
            { 
                regex: /(one|two|three|four|five|six|seven|eight|nine) hundred/,
                multiplier: 100 
            },
            { 
                regex: /(one|two|three|four|five) thousand/,
                multiplier: 1000 
            },
            { 
                regex: /(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)/,
                multiplier: 1 
            }
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern.regex);
            if (match) {
                const wordNum = this.wordToNumber[match[1]];
                if (wordNum) {
                    return wordNum * pattern.multiplier;
                }
            }
        }

        return null;
    }

    extractContextualAmount(text) {
        // Look for amounts near context words
        const contextPatterns = [
            /rent is (\d+)/,
            /bill (?:is|of) (\d+)/,
            /owe (\d+)/,
            /cost (?:is|of) (\d+)/,
            /need (\d+) (?:dollar|buck)/
        ];

        for (const pattern of contextPatterns) {
            const match = text.match(pattern);
            if (match) {
                const amount = parseInt(match[1]);
                if (amount && amount > 0 && amount < 100000) {
                    return amount;
                }
            }
        }

        return null;
    }

    extractCurrencyPatterns(text) {
        // Handle "$twenty", "dollars fifty", etc.
        const currencyMatches = [
            { regex: /\$ ?(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)/, type: 'tens' },
            { regex: /\$ ?(one|two|three|four|five) hundred/, type: 'hundreds' }
        ];

        for (const pattern of currencyMatches) {
            const match = text.match(pattern.regex);
            if (match) {
                const wordNum = this.wordToNumber[match[1]];
                if (wordNum) {
                    return pattern.type === 'hundreds' ? wordNum * 100 : wordNum;
                }
            }
        }

        return null;
    }

    getStats() {
        return {
            phase: "4.12",
            name: "Amount Detection Enhancement",
            targetCases: 12,
            targetBucket: "amount_missing",
            bucketSize: 20,
            expectedImprovement: "2.4%",
            confidenceLevel: "HIGH"
        };
    }
}

module.exports = AmountDetectionEnhancement_Phase412;