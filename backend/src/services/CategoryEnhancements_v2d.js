/**
 * Category Enhancements v2d - Phase 1 Core30 Fixes
 * 
 * Conservative category disambiguation for Core30 protection.
 * Focus: Fix T007, T012, T018 category errors.
 * 
 * Key Fixes:
 * 1. EMPLOYMENT vs TRANSPORTATION: Detect when transportation mentions are employment-related
 * 2. FAMILY strengthening: Wedding/ceremony/family event detection
 * 3. Conservative approach: Only fix known ambiguities, don't introduce new risks
 */

class CategoryEnhancements_v2d {
  constructor() {
    this.name = 'CategoryEnhancements_v2d';
    this.version = '2.0d';
  }

  /**
   * Enhance/disambiguate category classification
   * 
   * @param {string} transcript - Full transcript text
   * @param {object} baseResult - Base category result { category, confidence, reasons }
   * @returns {object} Enhanced result { category, confidence, enhanced, reasons }
   */
  enhanceCategory(transcript, baseResult) {
    const text = transcript.toLowerCase();
    const reasons = [...(baseResult.reasons || [])];
    let category = baseResult.category;
    let confidence = baseResult.confidence || 0.7;
    let enhanced = false;

    // Fix 1: EMPLOYMENT vs TRANSPORTATION Disambiguation
    // T007: "car repairs so I can get to work" → EMPLOYMENT
    // T018: "car broke down and I can't get to work" → EMPLOYMENT
    if (category === 'TRANSPORTATION') {
      const employmentTransportPatterns = [
        /get to work/i,
        /can't work without/i,
        /need for (my )?job/i,
        /can't get to (my )?work/i,
        /commute to work/i,
        /work without it/i,
        /need (it )?to (get to )?work/i,
        /so i can (get to )?work/i,
        /need for employment/i
      ];

      const hasEmploymentContext = employmentTransportPatterns.some(pattern => pattern.test(transcript));
      
      if (hasEmploymentContext) {
        category = 'EMPLOYMENT';
        confidence = 0.85;
        enhanced = true;
        reasons.push('v2d: TRANSPORTATION→EMPLOYMENT (employment-related transport)');
      }
    }

    // Fix 2: FAMILY Category Strengthening
    // T012: "daughter needs help with wedding expenses" → FAMILY
    if (category !== 'FAMILY') {
      const familyEventKeywords = [
        {
          pattern: /wedding/i,
          relatedWords: /daughter|son|family|child|mother|father/i,
          category: 'FAMILY',
          reason: 'family wedding event'
        },
        {
          pattern: /ceremony/i,
          relatedWords: /daughter|son|family|child|wedding|graduation/i,
          category: 'FAMILY',
          reason: 'family ceremony'
        },
        {
          pattern: /graduation/i,
          relatedWords: /daughter|son|child|family/i,
          category: 'FAMILY',
          reason: 'family graduation'
        }
      ];

      for (const eventType of familyEventKeywords) {
        if (eventType.pattern.test(transcript) && eventType.relatedWords.test(transcript)) {
          category = eventType.category;
          confidence = 0.82;
          enhanced = true;
          reasons.push(`v2d: ${baseResult.category}→FAMILY (${eventType.reason})`);
          break;
        }
      }
    }

    // Fix 3: Prevent misclassification of employment-related descriptions
    // Additional safety check: If current category is OTHER but employment signals strong
    if (category === 'OTHER' && text.includes('employment') || text.includes('job')) {
      // Check if it's actually employment
      const employmentSignals = [
        /laid off/i,
        /fired/i,
        /lost (my )?job/i,
        /out of work/i,
        /unemployed/i,
        /find work/i,
        /need (for|a) job/i,
        /lost employment/i
      ];

      const hasStrongEmploymentSignal = employmentSignals.some(pattern => pattern.test(transcript));
      
      if (hasStrongEmploymentSignal) {
        category = 'EMPLOYMENT';
        confidence = 0.80;
        enhanced = true;
        reasons.push('v2d: OTHER→EMPLOYMENT (employment loss detected)');
      }
    }

    return {
      category,
      confidence,
      enhanced,
      reasons,
      original: baseResult.category
    };
  }

  /**
   * Check if transportation mention is employment-related
   */
  isEmploymentTransportation(transcript) {
    const employmentContextKeywords = [
      'get to work', 'get to my work', 'get to the job',
      'can\'t work', 'can\'t get to work',
'commute', 'need for work', 'need for job',
      'so i can work', 'work without it'
    ];

    const text = transcript.toLowerCase();
    return employmentContextKeywords.some(kw => text.includes(kw));
  }

  /**
   * Check if event is a family occasion
   */
  isFamilyEvent(transcript) {
    const familyEventPatterns = [
      { event: 'wedding', members: ['daughter', 'son', 'child', 'family'] },
      { event: 'ceremony', members: ['daughter', 'son', 'wedding', 'graduation'] },
      { event: 'graduation', members: ['daughter', 'son', 'child'] }
    ];

    const text = transcript.toLowerCase();
    
    return familyEventPatterns.some(pattern => {
      const hasEvent = text.includes(pattern.event);
      const hasFamilyMember = pattern.members.some(member => text.includes(member));
      return hasEvent && hasFamilyMember;
    });
  }
}

// Export for CommonJS (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CategoryEnhancements_v2d };
}

// Export for ES modules (if needed)
if (typeof exports !== 'undefined') {
  exports.CategoryEnhancements_v2d = CategoryEnhancements_v2d;
}
