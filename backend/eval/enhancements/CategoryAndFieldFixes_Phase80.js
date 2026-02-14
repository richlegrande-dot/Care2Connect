/**
 * Phase 8.0: Category & Field Corrections (FINAL PHASE)
 * 
 * @name    CategoryAndFieldFixes_Phase80
 * @version 1.0.0
 * @date    2026-02-15
 * 
 * PURPOSE: Final sweep addressing 3 failure types simultaneously:
 * 
 * GROUP A: CATEGORY — Secondary Mention Suppression (~30 cases)
 *   Fuzz mutations inject secondary category mentions ("Also dealing with X",
 *   "Previously had X problems", "Had issues with X too") that hijack the
 *   primary category assignment. This group detects secondary mention patterns,
 *   identifies the TRUE primary need, and overrides the category.
 * 
 * GROUP B: NAME — Filler Word Re-extraction (~9 cases)
 *   Fuzz mutations insert filler words (um, like, actually, basically) into
 *   name introductions, breaking extraction or contaminating the captured name.
 *   This group strips fillers from the transcript and re-extracts the name.
 * 
 * GROUP C: AMOUNT — Filler Word Recovery (~10 cases)
 *   Fuzz mutations insert fillers between "need" and dollar amounts
 *   ("need uh 2200"), preventing extraction. This group strips fillers
 *   and re-extracts the amount from cleaned text.
 * 
 * GUARDRAILS:
 *   - Category fix only fires when BOTH secondary mention AND primary need are detected
 *   - Name fix only fires when extracted name starts with a filler word or is null
 *   - Amount fix only fires when extracted amount is null
 *   - All fixes are post-processing corrections — no scoring/threshold changes
 */

'use strict';

const COMPONENT_VERSION = '1.1.0'; // Phase 8.1: +income suppression, +direct ask, +court costs, +hyphenated names

// ── FILLER WORDS for transcript cleaning ──
const FILLER_WORDS = /\b(uh|um|like|well|so|actually|basically|you know|I mean|sort of|kind of)\b/gi;
const FILLER_PUNCTUATION = /[!]{2,}|[.]{3,}|[,]{2,}|[;]{2,}|[–—]+|\?\?+/g;

/**
 * Strip filler words and chaotic punctuation from transcript text.
 * Used by GROUP B and GROUP C for clean re-extraction.
 */
function fuzzClean(text) {
  let cleaned = text;
  // Remove filler punctuation
  cleaned = cleaned.replace(FILLER_PUNCTUATION, ' ');
  // Remove filler words (preserve sentence structure)
  cleaned = cleaned.replace(FILLER_WORDS, ' ');
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  // Remove stray commas/periods from filler removal
  cleaned = cleaned.replace(/\s+,/g, ',').replace(/,\s*,/g, ',');
  cleaned = cleaned.replace(/\s+\./g, '.').replace(/\.\s*\./g, '.');
  return cleaned;
}


// ══════════════════════════════════════════════════════════════
// GROUP A: CATEGORY — Secondary Mention Suppression
// ══════════════════════════════════════════════════════════════

/**
 * Regex to detect secondary (non-primary) category mentions injected by fuzz mutations.
 * These patterns are NOT the caller's primary need — they're background noise.
 * 
 * Matches:
 *   "Had issues with medical too"
 *   "Also dealing with surgery"
 *   "Previously had?? job problems"
 *   "Had issues with car repair too"
 * 
 * [^A-Za-z]{0,5} handles punctuation chaos between intro and keyword.
 */
const SECONDARY_MENTION_REGEX = /(?:had\s+issues?\s+with|also\s+dealing\s+with|previously\s+had)[^A-Za-z]{0,5}(\w+(?:\s+\w+)?)/gi;

/**
 * Map secondary mention keywords → the category they would trigger.
 * When the current category matches one of these, AND a primary need
 * points elsewhere, the category should be overridden.
 */
const SECONDARY_KEYWORD_TO_CATEGORY = {
  'medical': 'HEALTHCARE',
  'medication': 'HEALTHCARE',
  'surgery': 'HEALTHCARE',
  'doctor': 'HEALTHCARE',
  'hospital': 'HEALTHCARE',
  'health': 'HEALTHCARE',
  'legal': 'LEGAL',
  'lawyer': 'LEGAL',
  'court': 'LEGAL',
  'attorney': 'LEGAL',
  'legal fees': 'LEGAL',
  'tuition': 'EDUCATION',
  'school': 'EDUCATION',
  'education': 'EDUCATION',
  'college': 'EDUCATION',
  'car repair': 'TRANSPORTATION',
  'car': 'TRANSPORTATION',
  'vehicle': 'TRANSPORTATION',
  'transportation': 'TRANSPORTATION',
  'job': 'EMPLOYMENT',
  'employment': 'EMPLOYMENT',
  'work': 'EMPLOYMENT',
  'utilities': 'UTILITIES',
  'electric': 'UTILITIES',
  'power': 'UTILITIES',
  // Phase 8.1: Added HOUSING keywords for secondary mention detection
  'eviction': 'HOUSING',
  'rent': 'HOUSING',
  'housing': 'HOUSING',
  'landlord': 'HOUSING',
  'mortgage': 'HOUSING',
  'childcare': 'FAMILY',
  'child care': 'FAMILY',
  'family': 'FAMILY',
  'food': 'FOOD',
  'groceries': 'FOOD',
};

/**
 * Primary need patterns → correct category.
 * These represent the caller's ACTUAL need (the direct ask, not background).
 * Ordered by specificity — more specific patterns first.
 */
const PRIMARY_NEED_RULES = [
  // LEGAL — court costs, lawyer fees (Phase 8.1 — high priority, fixes Patricia Moore LEGAL cases)
  { pattern: /\bcourt\s+(?:costs?|fees?)\b/i, category: 'LEGAL' },
  { pattern: /\blawyer\s+fees?\b/i, category: 'LEGAL' },
  { pattern: /\blegal\s+fees?\b/i, category: 'LEGAL' },
  { pattern: /\battorney\s+fees?\b/i, category: 'LEGAL' },
  { pattern: /\bfor\s+(?:lawyer|attorney|legal)\b/i, category: 'LEGAL' },

  // HOUSING — rental, deposit, eviction
  { pattern: /\b(?:for\s+)?(?:rent|rental)\b/i, category: 'HOUSING' },
  { pattern: /\bsecurity\s+deposit\b/i, category: 'HOUSING' },
  { pattern: /\beviction\s+notice\b/i, category: 'HOUSING' },
  { pattern: /\bfacing\s+eviction\b/i, category: 'HOUSING' },
  { pattern: /\bfor\s+housing\b/i, category: 'HOUSING' },
  { pattern: /\bapartment\b/i, category: 'HOUSING' },
  { pattern: /\bmortgage\b/i, category: 'HOUSING' },
  { pattern: /\bhomeless\b/i, category: 'HOUSING' },
  { pattern: /\bforeclosure\b/i, category: 'HOUSING' },

  // FOOD — groceries, meals, food assistance
  { pattern: /\bgroceries\b/i, category: 'FOOD' },
  { pattern: /\bfor\s+food\b/i, category: 'FOOD' },
  { pattern: /\bfood\s+assistance\b/i, category: 'FOOD' },
  { pattern: /\basking\s+for\s+food\b/i, category: 'FOOD' },

  // UTILITIES — bills, shutoff (Phase 8.1 — "for utilities" direct ask)
  { pattern: /\bfor\s+utilities\b/i, category: 'UTILITIES' },
  { pattern: /\b(?:electric|utility)\s+bill\b/i, category: 'UTILITIES' },
  { pattern: /\bshutoff\s*(?:notice)?\b/i, category: 'UTILITIES' },
  { pattern: /\bshut\s+off\b/i, category: 'UTILITIES' },
  { pattern: /\b\$?\d[\d,]*\s+for\s+utilities\b/i, category: 'UTILITIES' },

  // EMPLOYMENT — job loss indicators
  { pattern: /\blost\s+(?:my\s+)?job\b/i, category: 'EMPLOYMENT' },
  { pattern: /\blaid\s+off\b/i, category: 'EMPLOYMENT' },
  { pattern: /\bfired\b/i, category: 'EMPLOYMENT' },
  { pattern: /\bterminated\b/i, category: 'EMPLOYMENT' },

  // TRANSPORTATION — vehicle repair
  { pattern: /\bcar\s+(?:broke|repair)/i, category: 'TRANSPORTATION' },
  { pattern: /\bfor\s+(?:car\s+)?repairs\b/i, category: 'TRANSPORTATION' },
  { pattern: /\bvehicle\s+repair\b/i, category: 'TRANSPORTATION' },
  { pattern: /\bemergency\s+car\s+repairs\b/i, category: 'TRANSPORTATION' },

  // HEALTHCARE — medical needs (as primary)
  { pattern: /\bfor\s+surgery\b/i, category: 'HEALTHCARE' },
  { pattern: /\bmedical\s+(?:bills?|emergency|expense)\b/i, category: 'HEALTHCARE' },
  { pattern: /\bfor\s+medication\b/i, category: 'HEALTHCARE' },

  // EDUCATION — tuition, school costs
  { pattern: /\bfor\s+tuition\b/i, category: 'EDUCATION' },
  { pattern: /\bschool\s+supplies\b/i, category: 'EDUCATION' },
  { pattern: /\bschool\s+fees\b/i, category: 'EDUCATION' },
  { pattern: /\bfor\s+(?:my\s+)?(?:kids?|children)\s*(?:'s?)?\s*school\b/i, category: 'EDUCATION' },

  // FAMILY — childcare
  { pattern: /\bfor\s+childcare\b/i, category: 'FAMILY' },
  { pattern: /\bchild\s+care\b/i, category: 'FAMILY' },
];

/**
 * Detect secondary mention categories in transcript.
 * @param {string} transcript - Original transcript text
 * @returns {string[]} Array of category strings that are secondary mentions
 */
function detectSecondaryMentionCategories(transcript) {
  const secondaryCategories = new Set();
  // Reset regex lastIndex for reuse
  const regex = new RegExp(SECONDARY_MENTION_REGEX.source, 'gi');
  let match;
  
  while ((match = regex.exec(transcript)) !== null) {
    const keyword = match[1].toLowerCase().trim();
    // Check each keyword mapping — match if keyword CONTAINS the map key
    for (const [key, cat] of Object.entries(SECONDARY_KEYWORD_TO_CATEGORY)) {
      if (keyword.includes(key)) {
        secondaryCategories.add(cat);
        break;
      }
    }
  }
  
  return Array.from(secondaryCategories);
}

/**
 * Identify the primary need category from transcript.
 * @param {string} transcript - Original transcript text
 * @param {string|null} excludeCategory - Category to skip (used to avoid matching secondary mention as primary)
 * @returns {string|null} Category string or null if no primary need detected
 */
function identifyPrimaryNeedCategory(transcript, excludeCategory) {
  // Fuzz-clean for more reliable matching
  const cleaned = fuzzClean(transcript);
  for (const rule of PRIMARY_NEED_RULES) {
    if (excludeCategory && rule.category === excludeCategory) continue;
    if (rule.pattern.test(cleaned)) {
      return rule.category;
    }
  }
  // Also try on original (handles dollar-sign patterns)
  for (const rule of PRIMARY_NEED_RULES) {
    if (excludeCategory && rule.category === excludeCategory) continue;
    if (rule.pattern.test(transcript)) {
      return rule.category;
    }
  }
  return null;
}

/**
 * DIRECT ASK PATTERNS — "I need $X for Y" and "$X for Y" patterns.
 * These are the strongest signals for category — the caller explicitly says what they need.
 * Only fires as a fallback when secondary mention suppression doesn't apply.
 */
const DIRECT_ASK_PATTERNS = [
  { pattern: /\bneed\s+\$?\d[\d,]*\s+for\s+(?:food|groceries|food assistance)\b/i, category: 'FOOD' },
  { pattern: /\b\$?\d[\d,]*\s+for\s+(?:food|groceries|food assistance)\b/i, category: 'FOOD' },
  { pattern: /\bneed\s+\$?\d[\d,]*\s+for\s+utilities\b/i, category: 'UTILITIES' },
  { pattern: /\b\$?\d[\d,]*\s+for\s+utilities\b/i, category: 'UTILITIES' },
  { pattern: /\bassistance\s+with\s+\$?\d[\d,]*\s+for\s+utilities\b/i, category: 'UTILITIES' },
  { pattern: /\bneed\s+\$?\d[\d,]*\s+for\s+(?:lawyer|attorney|legal)\s+fees?\b/i, category: 'LEGAL' },
  { pattern: /\b\$?\d[\d,]*\s+for\s+(?:lawyer|attorney|legal)\s+fees?\b/i, category: 'LEGAL' },
  { pattern: /\bneed\s+\$?\d[\d,]*\s+for\s+(?:car\s+)?repairs\b/i, category: 'TRANSPORTATION' },
  { pattern: /\bneed\s+\$?\d[\d,]*\s+for\s+(?:emergency\s+car\s+repairs)\b/i, category: 'TRANSPORTATION' },
  { pattern: /\bneed\s+\$?\d[\d,]*\s+for\s+(?:medication|medical|surgery)\b/i, category: 'HEALTHCARE' },
  { pattern: /\b\$?\d[\d,]*\s+(?:medical|for\s+medication)\b/i, category: 'HEALTHCARE' },
  // Phase 8.1: Education direct-ask patterns
  { pattern: /\bneed\s+\$?\d[\d,]*\s+for\s+(?:my\s+)?(?:kids?|children)\s*'?s?\s*school\b/i, category: 'EDUCATION' },
  { pattern: /\b\$?\d[\d,]*\s+for\s+(?:my\s+)?(?:kids?|children)\s*'?s?\s*school\s+supplies\b/i, category: 'EDUCATION' },
  { pattern: /\bneed\s+\d[\d,]*\s+for\s+(?:my\s+)?(?:kids?|children)\s*'?s?\s*school\b/i, category: 'EDUCATION' },
  { pattern: /\bneed\s+\$?\d[\d,]*\s+for\s+tuition\b/i, category: 'EDUCATION' },
];

/**
 * Identify category from direct-ask patterns ("I need $X for Y").
 * @param {string} transcript - Original transcript text
 * @returns {string|null} Category or null
 */
function identifyDirectAskCategory(transcript) {
  const cleaned = fuzzClean(transcript);
  for (const rule of DIRECT_ASK_PATTERNS) {
    if (rule.pattern.test(cleaned) || rule.pattern.test(transcript)) {
      return rule.category;
    }
  }
  return null;
}

/**
 * Apply category secondary mention suppression.
 * Only fires when:
 *   1. A secondary mention pattern is detected in the transcript
 *   2. The current category matches the secondary mention's category
 *   3. A primary need keyword points to a DIFFERENT category
 */
function applyCategoryFix(transcript, currentCategory, testId) {
  const secondaryCategories = detectSecondaryMentionCategories(transcript);
  
  // CASE 1: Secondary mention detected — try to override with primary need
  if (secondaryCategories.length > 0) {
    // Use excludeCategory=currentCategory to find a DIFFERENT primary need
    const primaryNeedCategory = identifyPrimaryNeedCategory(transcript, currentCategory);
    
    if (primaryNeedCategory && secondaryCategories.includes(currentCategory) && primaryNeedCategory !== currentCategory) {
      return {
        fixed: true,
        originalCategory: currentCategory,
        newCategory: primaryNeedCategory,
        reason: `Secondary "${currentCategory}" overridden by primary need "${primaryNeedCategory}"`
      };
    }
  }
  
  // CASE 2: Current category is OTHER (too generic), and we can determine the real category
  const primaryForOther = identifyPrimaryNeedCategory(transcript);
  if (currentCategory === 'OTHER' && primaryForOther) {
    return {
      fixed: true,
      originalCategory: currentCategory,
      newCategory: primaryForOther,
      reason: `OTHER resolved to "${primaryForOther}" via primary need detection`
    };
  }
  
  // CASE 3 (Phase 8.1): Direct ask override — "I need $X for Y" or "$X for Y"
  // Fires even without secondary mentions (handles multi-keyword scoring errors)
  const directAskCategory = identifyDirectAskCategory(transcript);
  if (directAskCategory && directAskCategory !== currentCategory) {
    return {
      fixed: true,
      originalCategory: currentCategory,
      newCategory: directAskCategory,
      reason: `Direct ask override: "${currentCategory}" → "${directAskCategory}"`
    };
  }
  
  return { fixed: false, originalCategory: currentCategory };
}


// ══════════════════════════════════════════════════════════════
// GROUP B: NAME — Filler Word Re-extraction
// ══════════════════════════════════════════════════════════════

/**
 * Name introduction patterns — applied to fuzz-cleaned transcript.
 * Case-sensitive for the captured name (must start with uppercase).
 */
const NAME_INTRO_PATTERNS = [
  // "My full name is [Name]" / "My name is [Name]" — supports hyphenated last names
  /(?:[Mm]y\s+(?:full\s+)?name\s+is)\s+([A-Z][a-z]+(?:[- ][A-Z][a-z]+){1,3})/,
  // "This is [Name]" / "I am [Name]" (with optional "Hi," / "Hello," prefix) — supports hyphens
  /(?:(?:[Hh]i|[Hh]ello),?\s+)?(?:[Tt]his\s+is|I\s+am)\s+([A-Z][a-z]+(?:[- ][A-Z][a-z]+){1,3})/,
  // "[Name] calling" — supports hyphens
  /([A-Z][a-z]+(?:[- ][A-Z][a-z]+){1,3})\s+calling/,
  // "[Name] speaking" — supports hyphens
  /([A-Z][a-z]+(?:[- ][A-Z][a-z]+){1,3})\s+speaking/,
];

/**
 * Regex to detect filler words at the start of an extracted name.
 */
const FILLER_AT_NAME_START = /^(like|um|uh|actually|basically|well|so)\s+/i;

/**
 * Apply name filler word correction.
 * Only fires when:
 *   1. Extracted name starts with a known filler word, OR
 *   2. Extracted name is null (missing)
 * 
 * In both cases, re-extracts from fuzz-cleaned transcript using high-confidence patterns.
 */
function applyNameFix(transcript, currentName, testId) {
  const hasFillerInName = currentName && FILLER_AT_NAME_START.test(currentName);
  
  // Only fix if name has filler or is missing
  if (!hasFillerInName && currentName) {
    return { fixed: false };
  }
  
  // Fuzz-clean the transcript for re-extraction
  const cleaned = fuzzClean(transcript);
  
  // Try to extract name from cleaned transcript using intro patterns
  for (const pattern of NAME_INTRO_PATTERNS) {
    const m = cleaned.match(pattern);
    if (m && m[1]) {
      const candidate = m[1].trim();
      const words = candidate.split(' ');
      
      // Validate: 2-4 proper name words, supports hyphenated parts
      const nameWords = candidate.split(/[\s]+/);
      if (nameWords.length >= 2 && nameWords.length <= 4 && nameWords.every(w => /^[A-Z][a-z]+(?:-[A-Z][a-z]+)?$/.test(w))) {
        return {
          fixed: true,
          originalName: currentName,
          newName: candidate,
          reason: `Filler-cleaned re-extraction: "${currentName || 'null'}" → "${candidate}"`
        };
      }
    }
  }
  
  // Fallback: strip leading filler from existing name (partial fix)
  if (hasFillerInName) {
    const stripped = currentName.replace(FILLER_AT_NAME_START, '').trim();
    if (stripped.length >= 3 && /^[A-Z]/.test(stripped)) {
      return {
        fixed: true,
        originalName: currentName,
        newName: stripped,
        reason: `Filler stripped: "${currentName}" → "${stripped}"`
      };
    }
  }
  
  return { fixed: false };
}


// ══════════════════════════════════════════════════════════════
// GROUP C: AMOUNT — Filler Word Recovery
// ══════════════════════════════════════════════════════════════

/**
 * Amount extraction patterns for fuzz-cleaned transcript.
 * Applied ONLY when current extracted amount is null.
 */
const AMOUNT_PATTERNS_CLEANED = [
  // "need [number]" — most direct
  /\bneed\s+(\d[\d,]*(?:\.\d{2})?)\b/i,
  // "[number] for [purpose]" — contextual
  /\b(\d[\d,]*(?:\.\d{2})?)\s+for\s+(?:rent|groceries|repairs?|security|childcare|surgery|tuition|food|car|housing|deposit|utilities|lawyer|attorney|legal|school|textbooks|medication)/i,
  // "about [number] for [purpose]"
  /\babout\s+(\d[\d,]*(?:\.\d{2})?)\s+for\s+/i,
  // "bill is [number]"
  /\bbill\s+(?:is|of)\s+(\d[\d,]*(?:\.\d{2})?)\b/i,
  // "help with [number]"
  /\bhelp\s+with\s+(\d[\d,]*(?:\.\d{2})?)\b/i,
  // Phase 8.1: "costs [number]" — handles "Court costs 2500"
  /\bcosts?\s+(\d[\d,]*(?:\.\d{2})?)\b/i,
  // Phase 8.1: "asking for [number]"
  /\basking\s+for\s+\$?(\d[\d,]*(?:\.\d{2})?)\b/i,
  // Phase 8.1: "pay [number]" — handles "pay $450"
  /\bpay\s+\$?(\d[\d,]*(?:\.\d{2})?)\b/i,
];

/**
 * Filler-tolerant amount pattern — applied to ORIGINAL transcript.
 * Matches "need uh 2200", "need basically 950", etc.
 */
const AMOUNT_WITH_FILLER = /\b(?:need|about|help\s+with|costs?)\s+(?:uh|um|so|like|basically|you know|actually)\s+(\d[\d,]*(?:\.\d{2})?)\b/i;

/**
 * Apply amount filler word recovery.
 * Only fires when extracted amount is null (missing).
 * Tries fuzz-cleaned re-extraction, then filler-tolerant pattern on original.
 */
function applyAmountFix(transcript, currentAmount, testId) {
  // Only fix when amount is missing
  if (currentAmount !== null && currentAmount !== undefined) {
    return { fixed: false };
  }
  
  // Strategy 1: Fuzz-clean transcript, then re-extract with standard patterns
  const cleaned = fuzzClean(transcript);
  
  for (const pattern of AMOUNT_PATTERNS_CLEANED) {
    const m = cleaned.match(pattern);
    if (m && m[1]) {
      const amount = parseFloat(m[1].replace(/,/g, ''));
      if (amount > 0 && amount < 100000) {
        return {
          fixed: true,
          originalAmount: currentAmount,
          newAmount: amount,
          reason: `Filler-cleaned recovery: null → ${amount}`
        };
      }
    }
  }
  
  // Strategy 2: Filler-tolerant pattern on original transcript
  const fillerMatch = transcript.match(AMOUNT_WITH_FILLER);
  if (fillerMatch && fillerMatch[1]) {
    const amount = parseFloat(fillerMatch[1].replace(/,/g, ''));
    if (amount > 0 && amount < 100000) {
      return {
        fixed: true,
        originalAmount: currentAmount,
        newAmount: amount,
        reason: `Filler-tolerant extraction: null → ${amount}`
      };
    }
  }
  
  return { fixed: false };
}


// ══════════════════════════════════════════════════════════════
// GROUP D: Income vs Goal Amount Disambiguation (Phase 8.1)
// ══════════════════════════════════════════════════════════════

/**
 * Income patterns — detect salary/wage/income declarations.
 * These numbers should NOT be selected as the goal amount.
 */
const INCOME_PATTERNS = [
  /I\s+(?:earn|make)\s+\$?(\d[\d,]*(?:\.\d{2})?)\s+(?:monthly|a\s+month|per\s+month)/i,
  /I\s+(?:earn|make)\s+\$?(\d[\d,]*(?:\.\d{2})?)\s+(?:an?\s+hour|per\s+hour|hourly)/i,
  /I\s+(?:earn|make)\s+\$?(\d[\d,]*(?:\.\d{2})?)\s+(?:yearly|a\s+year|per\s+year|annually)/i,
  /(?:salary|income|wages?)\s+(?:is|of)\s+\$?(\d[\d,]*(?:\.\d{2})?)/i,
  /\$(\d[\d,]*(?:\.\d{2})?)\s+(?:an?\s+hour|per\s+hour|hourly)/i,
  /\$(\d[\d,]*(?:\.\d{2})?)\s+(?:monthly|a\s+month|per\s+month)/i,
];

/**
 * Goal-context patterns for re-extraction after income suppression.
 * Ordered by specificity (most specific first).
 */
const GOAL_AMOUNT_PATTERNS = [
  // "need X for [purpose]" — strongest signal
  /\bneed\s+\$?(\d[\d,]*(?:\.\d{2})?)\s+for\s+/i,
  // "X for [specific purpose]"
  /\b(\d[\d,]*(?:\.\d{2})?)\s+for\s+(?:groceries|rent|repairs?|security|deposit|surgery|tuition|food|car|utilities|medication|school|textbooks|lawyer|attorney|legal)/i,
  // "about X for [purpose]"
  /\babout\s+(?:(?:uh|um|so|like|basically|you know|I mean)\s+)?(\d[\d,]*(?:\.\d{2})?)\s+for\s+/i,
  // "costs X"
  /\bcosts?\s+(\d[\d,]*(?:\.\d{2})?)\b/i,
  // "bill is/of X"
  /\bbill\s+(?:is|of|so\s+is)\s+(\d[\d,]*(?:\.\d{2})?)\b/i,
  // "need X" (without "for")
  /\bneed\s+(?:(?:uh|um|so|like|basically|you know|actually)\s+)?(\d[\d,]*(?:\.\d{2})?)\b/i,
  // "help with X"
  /\bhelp\s+with\s+(\d[\d,]*(?:\.\d{2})?)\b/i,
  // "asking for X"
  /\basking\s+(?:for\s+)?\$?(\d[\d,]*(?:\.\d{2})?)\b/i,
  // "pay $X"
  /\bpay\s+\$?(\d[\d,]*(?:\.\d{2})?)\b/i,
];

/**
 * Apply income vs goal amount disambiguation.
 * Fires when the current amount matches an income/salary number AND
 * a different goal-context amount is available in the transcript.
 * @param {string} transcript - Original transcript text
 * @param {number|null} currentAmount - Currently extracted amount
 * @param {string} testId - Test case ID (for logging)
 * @returns {Object} Fix result
 */
function applyIncomeSuppressionFix(transcript, currentAmount, testId) {
  // Only fix when we HAVE an amount (complement to GROUP C which handles null)
  if (currentAmount === null || currentAmount === undefined) {
    return { fixed: false };
  }
  
  // Step 1: Detect income numbers in transcript
  const incomeNumbers = new Set();
  const cleaned = fuzzClean(transcript);
  
  for (const pattern of INCOME_PATTERNS) {
    // Try on both original and cleaned
    for (const text of [transcript, cleaned]) {
      const m = text.match(pattern);
      if (m && m[1]) {
        incomeNumbers.add(parseFloat(m[1].replace(/,/g, '')));
      }
    }
  }
  
  // No income numbers detected — nothing to suppress
  if (incomeNumbers.size === 0) {
    return { fixed: false };
  }
  
  // Step 2: Check if current amount matches an income number
  const currentAmountNum = parseFloat(currentAmount);
  if (!incomeNumbers.has(currentAmountNum)) {
    return { fixed: false };
  }
  
  // Step 3: Re-extract using goal-context patterns (skip income numbers)
  for (const pattern of GOAL_AMOUNT_PATTERNS) {
    // Try on both fuzz-cleaned and original
    for (const text of [cleaned, transcript]) {
      const m = text.match(pattern);
      if (m && m[1]) {
        const goalAmount = parseFloat(m[1].replace(/,/g, ''));
        // Must be different from ALL income numbers and be reasonable
        if (goalAmount > 0 && goalAmount < 100000 && !incomeNumbers.has(goalAmount)) {
          return {
            fixed: true,
            originalAmount: currentAmountNum,
            newAmount: goalAmount,
            reason: `Income suppression: ${currentAmountNum} (income) → ${goalAmount} (goal)`
          };
        }
      }
    }
  }
  
  return { fixed: false };
}


// ══════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ══════════════════════════════════════════════════════════════

/**
 * Apply all Phase 8.0 corrections to extraction results.
 * @param {string} transcript - Original transcript text
 * @param {string} currentCategory - Currently extracted category
 * @param {string|null} currentName - Currently extracted name
 * @param {number|null} currentAmount - Currently extracted amount
 * @param {string} testId - Test case ID (for logging)
 * @returns {Object} Result with fixed fields and metadata
 */
function applyPhase80Fixes(transcript, currentCategory, currentName, currentAmount, testId) {
  const result = {
    category: currentCategory,
    name: currentName,
    amount: currentAmount,
    categoryFixed: false,
    nameFixed: false,
    amountFixed: false,
    fixes: [],
  };
  
  // GROUP A: Category — Secondary mention suppression
  const catResult = applyCategoryFix(transcript, currentCategory, testId);
  if (catResult.fixed) {
    result.category = catResult.newCategory;
    result.categoryFixed = true;
    result.fixes.push(`CAT: ${catResult.reason}`);
  }
  
  // GROUP B: Name — Filler word re-extraction
  const nameResult = applyNameFix(transcript, currentName, testId);
  if (nameResult.fixed) {
    result.name = nameResult.newName;
    result.nameFixed = true;
    result.fixes.push(`NAME: ${nameResult.reason}`);
  }
  
  // GROUP C: Amount — Filler word recovery (when amount is null)
  const amtResult = applyAmountFix(transcript, currentAmount, testId);
  if (amtResult.fixed) {
    result.amount = amtResult.newAmount;
    result.amountFixed = true;
    result.fixes.push(`AMT: ${amtResult.reason}`);
  }
  
  // GROUP D: Amount — Income vs Goal disambiguation (when amount matches income)
  // Only runs if GROUP C didn't already fix the amount
  if (!result.amountFixed) {
    const incomeResult = applyIncomeSuppressionFix(transcript, result.amount, testId);
    if (incomeResult.fixed) {
      result.amount = incomeResult.newAmount;
      result.amountFixed = true;
      result.fixes.push(`AMT: ${incomeResult.reason}`);
    }
  }
  
  return result;
}

module.exports = {
  applyPhase80Fixes,
  COMPONENT_VERSION,
  // Expose internals for unit testing
  _internals: {
    fuzzClean,
    detectSecondaryMentionCategories,
    identifyPrimaryNeedCategory,
    identifyDirectAskCategory,
    applyCategoryFix,
    applyNameFix,
    applyAmountFix,
    applyIncomeSuppressionFix,
  }
};
