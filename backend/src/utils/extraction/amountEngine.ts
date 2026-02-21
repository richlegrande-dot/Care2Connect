/**
 * Jan v4.0 Amount Detection Context Engine
 *
 * Multi-pass amount detection system addressing the SECONDARY performance blocker.
 * Uses contextual patterns, vague expression handling, and ambiguity rejection.
 *
 * Target: Fix amount detection from ~50% to 80%+ accuracy
 */

export interface AmountDetection {
  goalAmount: number | null;
  confidence: number; // 0.0-1.0 confidence in the detection
  source: "explicit" | "contextual" | "vague" | "inferred" | "none";
  reasons: string[]; // Non-PII reasoning for the detection
  candidates: AmountCandidate[];
}

export interface AmountCandidate {
  value: number;
  type: "goal" | "wage" | "age" | "date" | "bill" | "rent" | "other";
  confidence: number;
  context: string; // Surrounding text context (non-PII)
}

export interface AmountContext {
  category?: string;
  urgency?: string;
}

/**
 * Pass 1: Explicit Amount Detection
 * Clear, direct goal amount statements
 */
class ExplicitAmountPass {
  private readonly EXPLICIT_PATTERNS = [
    // **CRITICAL**: "that's $X" or "$X total" patterns (common in natural speech)
    /(?:that's?|it's?|total is|the total|comes? to)\s*(?:\$)?([\d,]+)\s*(?:total|dollars?)?/gi,
    /(?:\$)([\d,]+)\s*(?:total|in total|altogether)/gi,

    // Direct goal statements with strong context
    /(?:goal (?:is|of)|target (?:is|of)|aim (?:is|for)|trying to raise)\s*(?:\$)?([\d,]+)/gi,
    /(?:need|require|asking for|looking for)\s*(?:\$)?([\d,]+)(?:\s*dollars?)?/gi,
    /(?:fundraising|raising)\s*(?:\$)?([\d,]+)/gi,
    /(?:campaign (?:goal|target))\s*(?:is|of)?\s*(?:\$)?([\d,]+)/gi,

    // "Only" or "just" qualifiers (high confidence)
    /(?:only|just)\s+(?:need|asking for|want)\s*(?:\$)?([\d,]+)/gi,
    /(?:at least|minimum of|no less than)\s*(?:\$)?([\d,]+)/gi,
    /(?:up to|maximum of|no more than)\s*(?:\$)?([\d,]+)/gi,

    // Help/assistance with amount
    /(?:help|assistance|support)\s+with\s*(?:\$)?([\d,]+)/gi,

    // **v4.0 CRITICAL**: Missing patterns for natural speech
    // "I owe $X" or "behind on $X"
    /(?:owe|behind on|past due)\s*(?:\$)?([\d,]+)/gi,
    // "need X hundred" or "need X thousand" (spoken numbers)
    /(?:need|require)\s+([\d,]+)\s+(?:hundred|thousand)/gi,
    // "short X this month" or "missing X"
    /(?:short|missing|lacking)\s*(?:\$)?([\d,]+)(?:\s*(?:this month|dollars?|for))?/gi,
    // "about X" or "around X" (with dollar amounts)
    /(?:about|around|roughly|approximately)\s*(?:\$)([\d,]+)/gi,
    // Simple need statements: "need X for Y"
    /(?:need|require)\s*(?:\$)?([\d,]+)\s+(?:for|to|towards)/gi,
  ];

  // Production baseline SPOKEN_NUMBERS (v1.5 default)
  private readonly BASELINE_SPOKEN_NUMBERS: Record<string, number> = {
    "five hundred": 500,
    "eight hundred": 800,
    "one thousand": 1000,
    "fifteen hundred": 1500,
    "two hundred": 200,
    "three hundred": 300,
    "four hundred": 400,
    "seven hundred": 700,
    "nine hundred": 900,
    "one hundred": 100,
  };

  // Feb v1.5 Experiment: Extended SPOKEN_NUMBERS with compound numbers
  private readonly EXTENDED_SPOKEN_NUMBERS: Record<string, number> = {
    // Existing entries
    "fifteen hundred": 1500,
    "eighteen hundred": 1800,
    "twenty-two hundred": 2200,
    "thirty-two hundred": 3200,
    "five hundred": 500,
    "six hundred": 600,
    "eight hundred": 800,
    "twelve hundred": 1200,
    "four thousand": 4000,
    "five thousand": 5000,
    "eight thousand": 8000,

    // Feb v1.5: Missing core30 cases - compound forms FIRST (longer matches)
    "three thousand five hundred": 3500,
    "twenty-five hundred": 2500,
    "twenty-eight hundred": 2800,
    "two thousand two hundred fifty": 2250,
    "nine hundred fifty": 950,

    // Feb v1.5: Missing basic thousands
    "one thousand": 1000,
    "two thousand": 2000,
    "three thousand": 3000,
    "six thousand": 6000,
    "seven thousand": 7000,
    "nine thousand": 9000,
    "ten thousand": 10000,

    // Feb v1.5: Additional common forms
    "eleven hundred": 1100,
    "thirteen hundred": 1300,
    "fourteen hundred": 1400,
    "sixteen hundred": 1600,
    "seventeen hundred": 1700,
    "nineteen hundred": 1900,
    "twenty-one hundred": 2100,
    "twenty-three hundred": 2300,
    "twenty-four hundred": 2400,
    "twenty-six hundred": 2600,
    "twenty-seven hundred": 2700,
    "twenty-nine hundred": 2900,
    "thirty-one hundred": 3100,
    "thirty-three hundred": 3300,
    "thirty-four hundred": 3400,
    "thirty-five hundred": 3500,
    "thirty-six hundred": 3600,
    "thirty-seven hundred": 3700,
    "thirty-eight hundred": 3800,
    "thirty-nine hundred": 3900,

    // Feb v1.5: Basic hundreds
    "one hundred": 100,
    "two hundred": 200,
    "three hundred": 300,
    "four hundred": 400,
    "seven hundred": 700,
    "nine hundred": 900,
  };

  // Phase 1A: EXTENDED_SPOKEN_NUMBERS promoted to production default
  // Baseline preserved above for rollback reference only
  private get SPOKEN_NUMBERS(): Record<string, number> {
    return this.EXTENDED_SPOKEN_NUMBERS;
  }

  detect(transcript: string): AmountCandidate[] {
    const candidates: AmountCandidate[] = [];
    const lowerText = transcript.toLowerCase();

    // Check spoken number patterns FIRST (highest priority)
    // Feb v1.5: Fix partial match logic - sort by length desc to prefer longer matches
    const spokenEntries = Object.entries(this.SPOKEN_NUMBERS).sort(
      ([a], [b]) => b.length - a.length,
    ); // Longest first

    for (const [spoken, numericValue] of spokenEntries) {
      if (lowerText.includes(spoken)) {
        candidates.push({
          value: numericValue,
          type: "goal",
          confidence: 0.9, // High confidence for spoken numbers
          context: `spoken_number: ${spoken}`,
        });
        // CRITICAL: Break after first match to prevent "five hundred" matching
        // when "three thousand five hundred" already matched
        break;
      }
    }

    for (const pattern of this.EXPLICIT_PATTERNS) {
      const matches = [...transcript.matchAll(pattern)];

      for (const match of matches) {
        const amountStr = match[1];
        let amount = this.parseAmount(amountStr);

        // Handle "need 800 for" -> if small number, could be spoken hundred
        if (amount && amount < 1000 && amount >= 100) {
          const matchText = match[0].toLowerCase();
          if (/(?:hundred|thousand)/.test(matchText)) {
            // "need 15 hundred" -> 1500
            if (/hundred/.test(matchText) && amount < 100) {
              amount = amount * 100;
            } else if (/thousand/.test(matchText) && amount < 10) {
              amount = amount * 1000;
            }
          }
        }

        if (amount && amount >= 50 && amount <= 100000) {
          // High confidence for explicit patterns
          const confidence = this.calculateExplicitConfidence(
            match[0],
            lowerText,
          );

          candidates.push({
            value: amount,
            type: "goal",
            confidence,
            context: match[0].substring(0, 50), // Truncate for privacy
          });
        }
      }
    }

    return candidates;
  }

  private parseAmount(amountStr: string): number | null {
    const cleanStr = amountStr.replace(/[,$]/g, "");
    const parsed = parseInt(cleanStr, 10);
    return isNaN(parsed) ? null : parsed;
  }

  private calculateExplicitConfidence(
    matchText: string,
    fullText: string,
  ): number {
    let confidence = 0.8; // Base confidence for explicit patterns

    // Boost for strong goal language
    if (/(?:goal|target|raise|fundraising|campaign)/i.test(matchText)) {
      confidence += 0.15;
    }

    // Boost for quantifiers
    if (/(?:only|just|at least|minimum)/i.test(matchText)) {
      confidence += 0.1;
    }

    return Math.min(0.95, confidence);
  }
}

/**
 * Pass 2: Contextual Amount Detection
 * Amount from context clues and calculations
 */
class ContextualAmountPass {
  private readonly CONTEXTUAL_PATTERNS = [
    // "rent is $800, need 3 months" = $2400
    /rent (?:is|costs?)\s*\$?([\d,]+).*?need\s*(\d+)\s*months?/gi,
    /monthly rent\s*\$?([\d,]+).*?need\s*(\d+)\s*months?/gi,

    // "surgery costs $5000" or "procedure quoted $2400"
    /(?:surgery|operation|procedure)\s*(?:costs?|is|quoted|requires?)\s*\$?([\d,]+)/gi,
    /medical (?:bills?|expenses?)\s*(?:totaling?|of)?\s*\$?([\d,]+)/gi,
    /(?:dentist|doctor|hospital)\s+quoted\s*(?:me)?\s*\$?([\d,]+)/gi,

    // "car payment $300, need help with 6 months"
    /(?:car payment|mortgage payment|loan payment)\s*\$?([\d,]+).*?(?:need|behind)\s*(\d+)\s*(?:months?|payments?)/gi,

    // "hospital bills totaling $8000" or "owe $2200 total"
    /(?:bills?|expenses?)\s*(?:totaling?|of|come to)\s*\$?([\d,]+)/gi,
    /owe\s*\$?([\d,]+)\s*(?:total|for|in)?/gi,

    // "deposit $1000 plus first month $800" = $1800
    /(?:deposit|down payment)\s*\$?([\d,]+).*?(?:plus|and|first month)\s*\$?([\d,]+)/gi,

    // **v4.0 CRITICAL**: "between $X and $Y" patterns (take midpoint)
    /between\s*\$?([\d,]+)\s*(?:and|to)\s*\$?([\d,]+)/gi,

    // "need X for Y" simple patterns
    /need\s*\$?([\d,]+)\s+for\s+(?:rent|bills?|expenses?|food|gas|utilities)/gi,
  ];

  // VAGUE AMOUNT PATTERNS (v4.0 critical improvement)
  private readonly VAGUE_PATTERNS = [
    {
      pattern: /(?:a )?couple (?:of )?thousand\s*dollars?/gi,
      value: 2500,
      confidence: 0.65,
    },
    {
      pattern: /(?:a )?few thousand\s*dollars?/gi,
      value: 4000,
      confidence: 0.6,
    },
    { pattern: /several thousand\s*dollars?/gi, value: 5000, confidence: 0.55 },
    {
      pattern: /(?:a )?couple (?:of )?hundred\s*dollars?/gi,
      value: 250,
      confidence: 0.65,
    },
    { pattern: /(?:a )?few hundred\s*dollars?/gi, value: 400, confidence: 0.6 },
    { pattern: /several hundred\s*dollars?/gi, value: 600, confidence: 0.55 },
    {
      pattern: /around (?:a )?thousand\s*dollars?/gi,
      value: 1000,
      confidence: 0.7,
    },
    {
      pattern: /about (?:a )?thousand\s*dollars?/gi,
      value: 1000,
      confidence: 0.7,
    },
  ];

  detect(transcript: string): AmountCandidate[] {
    const candidates: AmountCandidate[] = [];

    // Check contextual patterns first
    for (const pattern of this.CONTEXTUAL_PATTERNS) {
      const matches = [...transcript.matchAll(pattern)];

      for (const match of matches) {
        const candidate = this.processContextualMatch(match);
        if (candidate) {
          candidates.push(candidate);
        }
      }
    }

    // Check vague amount expressions (v4.0 addition)
    for (const { pattern, value, confidence } of this.VAGUE_PATTERNS) {
      if (pattern.test(transcript)) {
        candidates.push({
          value,
          type: "other",
          confidence,
          context: "vague amount",
        });
      }
    }

    return candidates;
  }

  private processContextualMatch(
    match: RegExpMatchArray,
  ): AmountCandidate | null {
    const matchText = match[0];
    const amount1Str = match[1];
    const amount2Str = match[2];

    // Handle mathematical combinations (deposit + first month, rent * months)
    if (amount1Str && amount2Str) {
      const amount1 = this.parseAmount(amount1Str);
      const amount2 = this.parseAmount(amount2Str);

      if (amount1 && amount2) {
        // Determine operation based on context
        if (
          /(?:deposit|down payment).*?(?:plus|and|first month)/i.test(matchText)
        ) {
          // Addition: deposit + first month
          const total = amount1 + amount2;
          return this.createCandidate(total, matchText, 0.85);
        } else if (/rent.*?need.*?months?/i.test(matchText)) {
          // Multiplication: rent * months
          const total = amount1 * amount2;
          return this.createCandidate(total, matchText, 0.8);
        }
      }
    }

    // Single amount with context
    if (amount1Str) {
      const amount = this.parseAmount(amount1Str);
      if (amount) {
        return this.createCandidate(amount, matchText, 0.75);
      }
    }

    return null;
  }

  private parseAmount(amountStr: string): number | null {
    const cleanStr = amountStr.replace(/[,$]/g, "");
    const parsed = parseInt(cleanStr, 10);
    return isNaN(parsed) ? null : parsed;
  }

  private createCandidate(
    amount: number,
    context: string,
    baseConfidence: number,
  ): AmountCandidate | null {
    if (amount < 50 || amount > 100000) {
      return null; // Outside reasonable range
    }

    return {
      value: amount,
      type: "goal",
      confidence: baseConfidence,
      context: context.substring(0, 50),
    };
  }
}

/**
 * Pass 3: Vague Amount Detection
 * Handle imprecise expressions like "couple thousand", "few hundred"
 */
class VagueAmountPass {
  private readonly VAGUE_EXPRESSIONS: Record<
    string,
    { min: number; max: number; confidence: number }
  > = {
    // Thousands
    "couple thousand": { min: 2000, max: 3000, confidence: 0.7 },
    "couple of thousand": { min: 2000, max: 3000, confidence: 0.7 },
    "few thousand": { min: 3000, max: 5000, confidence: 0.6 },
    "several thousand": { min: 4000, max: 7000, confidence: 0.6 },
    "handful of thousand": { min: 3000, max: 5000, confidence: 0.5 },

    // Hundreds
    "couple hundred": { min: 200, max: 300, confidence: 0.7 },
    "couple of hundred": { min: 200, max: 300, confidence: 0.7 },
    "few hundred": { min: 300, max: 600, confidence: 0.6 },
    "several hundred": { min: 400, max: 800, confidence: 0.6 },
    "hundreds of dollars": { min: 200, max: 900, confidence: 0.5 },

    // Specific ranges
    "thousand or two": { min: 1000, max: 2000, confidence: 0.6 },
    "couple grand": { min: 2000, max: 3000, confidence: 0.7 },
    "few grand": { min: 3000, max: 5000, confidence: 0.6 },
  };

  detect(transcript: string): AmountCandidate[] {
    const candidates: AmountCandidate[] = [];
    const lowerText = transcript.toLowerCase();

    for (const [expression, range] of Object.entries(this.VAGUE_EXPRESSIONS)) {
      if (lowerText.includes(expression)) {
        // Apply category-based modifiers
        const modifiedRange = this.applyCategoryModifiers(range, lowerText);
        const midPoint = Math.round(
          (modifiedRange.min + modifiedRange.max) / 2,
        );

        candidates.push({
          value: midPoint,
          type: "goal",
          confidence: modifiedRange.confidence,
          context: `vague_expression: ${expression}`,
        });
      }
    }

    return candidates;
  }

  private applyCategoryModifiers(
    range: { min: number; max: number; confidence: number },
    transcript: string,
  ): { min: number; max: number; confidence: number } {
    let modifier = 1.0;
    let confidenceBoost = 0.0;

    // Medical/healthcare typically higher amounts
    if (/(?:medical|health|surgery|hospital|treatment)/i.test(transcript)) {
      modifier = 1.5;
      confidenceBoost = 0.1;
    }

    // Housing/rent typically moderate amounts
    else if (/(?:rent|housing|eviction|apartment)/i.test(transcript)) {
      modifier = 1.2;
      confidenceBoost = 0.05;
    }

    // Emergency might be lower amounts
    else if (/(?:emergency|crisis|urgent)/i.test(transcript)) {
      modifier = 0.8;
    }

    return {
      min: Math.round(range.min * modifier),
      max: Math.round(range.max * modifier),
      confidence: Math.min(0.9, range.confidence + confidenceBoost),
    };
  }
}

/**
 * Pass 4: Ambiguity Rejection
 * Identify and reject wage/age/date false positives
 */
class AmbiguityRejectionPass {
  private readonly WAGE_PATTERNS = [
    /\$?([\d,]+)\s*(?:per|an?|\/)\s*(?:hour|hr|day|week|month|year)/gi,
    /\$?([\d,]+)\s*(?:hourly|daily|weekly|monthly|yearly|annually)/gi,
    /(?:earn|make|earning|making)\s*\$?([\d,]+)\s*(?:per|an?|\/)?/gi,
    /(?:salary|wage|pay)\s*(?:is|of)?\s*\$?([\d,]+)/gi,
  ];

  private readonly AGE_PATTERNS = [
    /(?:i'm|i am|age|years? old)\s*(\d{1,3})(?:\s*years?)?/gi,
    /(\d{1,3})\s*(?:years? old|yr|yrs)/gi,
    /(?:turning|gonna be|will be)\s*(\d{1,3})/gi,
  ];

  private readonly DATE_PATTERNS = [
    /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{1,4})/gi,
    /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/gi,
    /(\d{4})\s*(?:year|since)/gi,
    /(?:in|since|from)\s*(\d{4})/gi,
  ];

  private readonly PHONE_PATTERNS = [
    /\(?(\d{3})\)?\s*[-.]?\s*(\d{3})\s*[-.]?\s*(\d{4})/gi,
    /(\d{10})/gi,
  ];

  filterCandidates(
    candidates: AmountCandidate[],
    transcript: string,
  ): AmountCandidate[] {
    const rejectedValues = new Set<number>();

    // Identify wage amounts to reject
    for (const pattern of this.WAGE_PATTERNS) {
      const matches = [...transcript.matchAll(pattern)];
      for (const match of matches) {
        const amount = this.parseAmount(match[1]);
        if (amount) {
          rejectedValues.add(amount);
        }
      }
    }

    // Identify age values to reject (converted to amounts)
    for (const pattern of this.AGE_PATTERNS) {
      const matches = [...transcript.matchAll(pattern)];
      for (const match of matches) {
        const age = parseInt(match[1]);
        if (age && age >= 18 && age <= 99) {
          // Age might be mistaken for amount
          rejectedValues.add(age);
          rejectedValues.add(age * 100); // $28 -> $2800 confusion
          rejectedValues.add(age * 1000); // $28 -> $28000 confusion
        }
      }
    }

    // Identify date values to reject
    for (const pattern of this.DATE_PATTERNS) {
      const matches = [...transcript.matchAll(pattern)];
      for (const match of matches) {
        const year = parseInt(match[1] || match[3]);
        if (year && year >= 1900 && year <= 2030) {
          rejectedValues.add(year);
        }
      }
    }

    // Identify phone number components to reject
    for (const pattern of this.PHONE_PATTERNS) {
      const matches = [...transcript.matchAll(pattern)];
      for (const match of matches) {
        if (match[1] && match[2] && match[3]) {
          // Phone number parts: 555-1234
          rejectedValues.add(parseInt(match[2] + match[3])); // 1234
          rejectedValues.add(parseInt(match[1] + match[2])); // 5551
        } else if (match[1] && match[1].length === 10) {
          // Full phone number as single string
          const full = match[1];
          rejectedValues.add(parseInt(full.substring(6))); // Last 4 digits
          rejectedValues.add(parseInt(full.substring(3, 7))); // Middle 4 digits
        }
      }
    }

    // Filter out rejected candidates
    return candidates.filter((candidate) => {
      if (rejectedValues.has(candidate.value)) {
        return false;
      }

      // Additional context-based rejection
      return this.isValidGoalAmount(candidate, transcript);
    });
  }

  private parseAmount(amountStr: string): number | null {
    const cleanStr = amountStr.replace(/[,$]/g, "");
    const parsed = parseInt(cleanStr, 10);
    return isNaN(parsed) ? null : parsed;
  }

  private isValidGoalAmount(
    candidate: AmountCandidate,
    transcript: string,
  ): boolean {
    const value = candidate.value;

    // Extremely low amounts are suspicious unless with strong context
    if (value < 100) {
      const hasStrongContext =
        /(?:goal|need|raise|asking for|campaign).*?\$?${value}/.test(
          transcript,
        );
      return hasStrongContext;
    }

    // Very high amounts need verification
    if (value > 50000) {
      const hasHighAmountContext =
        /(?:medical|surgery|hospital|house|mortgage|business)/.test(
          transcript.toLowerCase(),
        );
      return hasHighAmountContext;
    }

    return true; // Amount in reasonable range
  }
}

/**
 * Pass 5: Validation and Selection
 * Final validation and best candidate selection
 */
class ValidationPass {
  private readonly NEED_VERBS = [
    "need",
    "require",
    "asking for",
    "looking for",
    "hoping for",
    "trying to raise",
    "goal",
    "target",
    "aim",
    "want",
    "seeking",
  ];

  validateAndSelect(
    candidates: AmountCandidate[],
    transcript: string,
  ): AmountDetection {
    if (candidates.length === 0) {
      return {
        goalAmount: null,
        confidence: 0.0,
        source: "none",
        reasons: ["no_valid_candidates"],
        candidates: [],
      };
    }

    // Score each candidate based on context validation
    const scoredCandidates = candidates.map((candidate) => ({
      ...candidate,
      confidence: this.validateCandidate(candidate, transcript),
    }));

    // Sort by confidence descending
    scoredCandidates.sort((a, b) => b.confidence - a.confidence);

    const bestCandidate = scoredCandidates[0];

    // Determine source type
    const source = this.determineSource(bestCandidate, transcript);

    // Generate reasons
    const reasons = this.generateReasons(bestCandidate, transcript);

    return {
      goalAmount: bestCandidate.value,
      confidence: bestCandidate.confidence,
      source,
      reasons,
      candidates: scoredCandidates.slice(0, 3), // Top 3 candidates
    };
  }

  private validateCandidate(
    candidate: AmountCandidate,
    transcript: string,
  ): number {
    const lowerText = transcript.toLowerCase();
    let confidence = candidate.confidence;

    // Look for need verbs near the amount
    const hasNeedContext = this.NEED_VERBS.some((verb) => {
      const pattern = new RegExp(
        `${verb}.*?\\$?${candidate.value}|\\$?${candidate.value}.*?${verb}`,
        "i",
      );
      return pattern.test(transcript);
    });

    if (hasNeedContext) {
      confidence += 0.2;
    }

    // Look for negation that should reduce confidence
    const hasNegation =
      /(?:don't need|not asking for|not looking for|don't want).*?\$?${candidate.value}/.test(
        lowerText,
      );
    if (hasNegation) {
      confidence -= 0.4;
    }

    // Category alignment boost
    const categoryAlignment = this.getCategoryAlignment(
      candidate.value,
      lowerText,
    );
    confidence += categoryAlignment;

    return Math.max(0.1, Math.min(0.95, confidence));
  }

  private getCategoryAlignment(amount: number, transcript: string): number {
    // Medical: typically higher amounts
    if (/(?:medical|health|surgery|hospital|treatment)/i.test(transcript)) {
      if (amount >= 1000) return 0.1;
      if (amount >= 5000) return 0.15;
    }

    // Housing: moderate amounts
    if (/(?:rent|housing|eviction|mortgage)/i.test(transcript)) {
      if (amount >= 500 && amount <= 5000) return 0.1;
    }

    // Emergency: wide range but typically lower
    if (/(?:emergency|crisis|urgent)/i.test(transcript)) {
      if (amount >= 200 && amount <= 3000) return 0.05;
    }

    return 0.0; // No category alignment
  }

  private determineSource(
    candidate: AmountCandidate,
    transcript: string,
  ): "explicit" | "contextual" | "vague" | "inferred" {
    if (candidate.context.includes("vague_expression")) {
      return "vague";
    }

    if (/(?:goal|target|asking for|need)/i.test(candidate.context)) {
      return "explicit";
    }

    if (
      /(?:rent.*months|surgery costs|bills totaling)/i.test(candidate.context)
    ) {
      return "contextual";
    }

    return "inferred";
  }

  private generateReasons(
    candidate: AmountCandidate,
    transcript: string,
  ): string[] {
    const reasons: string[] = [];

    // Source-based reason
    reasons.push(`source_${this.determineSource(candidate, transcript)}`);

    // Confidence level
    if (candidate.confidence >= 0.8) {
      reasons.push("high_confidence");
    } else if (candidate.confidence >= 0.6) {
      reasons.push("medium_confidence");
    } else {
      reasons.push("low_confidence");
    }

    // Context validation
    const hasNeedContext = this.NEED_VERBS.some((verb) =>
      transcript.toLowerCase().includes(verb),
    );
    if (hasNeedContext) {
      reasons.push("need_context_present");
    }

    return reasons.slice(0, 5); // Limit reasons
  }
}

/**
 * Main Amount Detection Engine
 * Orchestrates all passes for comprehensive amount detection
 */
export class AmountDetectionEngine {
  private explicitPass = new ExplicitAmountPass();
  private contextualPass = new ContextualAmountPass();
  private vaguePass = new VagueAmountPass();
  private rejectionPass = new AmbiguityRejectionPass();
  private validationPass = new ValidationPass();

  /**
   * Detect goal amount using multi-pass approach
   */
  detectGoalAmount(
    transcript: string,
    context?: AmountContext,
  ): AmountDetection {
    try {
      if (!transcript || typeof transcript !== "string") {
        return {
          goalAmount: null,
          confidence: 0.0,
          source: "none",
          reasons: ["invalid_input"],
          candidates: [],
        };
      }

      // Pass 1: Explicit amount detection
      const explicitCandidates = this.explicitPass.detect(transcript);

      // Pass 2: Contextual amount detection
      const contextualCandidates = this.contextualPass.detect(transcript);

      // Pass 3: Vague amount detection
      const vagueCandidates = this.vaguePass.detect(transcript);

      // Combine all candidates
      const allCandidates = [
        ...explicitCandidates,
        ...contextualCandidates,
        ...vagueCandidates,
      ];

      // Pass 4: Ambiguity rejection
      const validCandidates = this.rejectionPass.filterCandidates(
        allCandidates,
        transcript,
      );

      // Pass 5: Validation and selection
      const result = this.validationPass.validateAndSelect(
        validCandidates,
        transcript,
      );

      // Apply context modifiers
      return this.applyContextModifiers(result, context);
    } catch (error) {
      console.error("[AMOUNT_ENGINE_ERROR] Amount detection failed:", {
        error: (error as Error).message,
        transcriptLength: transcript?.length || 0,
        timestamp: new Date().toISOString(),
      });

      return {
        goalAmount: null,
        confidence: 0.0,
        source: "none",
        reasons: ["detection_failed"],
        candidates: [],
      };
    }
  }

  /**
   * Apply context-based modifiers to the result
   */
  private applyContextModifiers(
    result: AmountDetection,
    context?: AmountContext,
  ): AmountDetection {
    if (!result.goalAmount || !context) {
      return result;
    }

    let modifiedConfidence = result.confidence;

    // Category-based confidence adjustments
    if (context.category) {
      switch (context.category) {
        case "HEALTHCARE":
          // Medical amounts tend to be higher and more variable
          if (result.goalAmount >= 1000) {
            modifiedConfidence += 0.05;
          }
          break;
        case "HOUSING":
          // Housing amounts are typically in predictable ranges
          if (result.goalAmount >= 500 && result.goalAmount <= 5000) {
            modifiedConfidence += 0.05;
          }
          break;
        case "EMERGENCY":
          // Emergency amounts might be lower than usual
          if (result.goalAmount >= 100 && result.goalAmount <= 2000) {
            modifiedConfidence += 0.03;
          }
          break;
      }
    }

    // Urgency-based confidence adjustments
    if (context.urgency) {
      switch (context.urgency) {
        case "CRITICAL":
        case "HIGH":
          // High urgency might correlate with more concrete amounts
          modifiedConfidence += 0.03;
          break;
      }
    }

    return {
      ...result,
      confidence: Math.min(0.95, modifiedConfidence),
    };
  }
}
