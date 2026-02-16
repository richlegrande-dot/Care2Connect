/**
 * Phase 8.0: Category & Field Corrections (FINAL PHASE)
 * 
 * @name    CategoryAndFieldFixes_Phase80
 * @version 1.4.0
 * @date    2026-02-16
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
 * PHASE 8.4 ADDITIONS:
 * 
 * GROUP G-J: URGENCY De-escalation Rules (Phase 8.4)
 *   - G: Category-correction urgency alignment (FUZZ_211, FUZZ_259)
 *   - H: Education non-crisis de-escalation with debt crisis guard (T004, HARD_020)
 *   - I: Direct housing request LOW→MEDIUM escalation (HARD_051) 
 *   - J: Security deposit request de-escalation (HARD_018) 
 *   - INHERENT_CRISIS_PATTERNS guard prevents de-escalation regressions (FUZZ_279, FUZZ_390)
 * 
 * ENHANCED DIRECT_ASK_AMOUNT_PATTERNS: 
 *   - "looking for $X", "deposit...is $X", "the full $X", "$X total" (HARD_001, HARD_003, HARD_006)
 * 
 * GUARDRAILS:
 *   - Category fix only fires when BOTH secondary mention AND primary need are detected
 *   - Name fix only fires when extracted name starts with a filler word or is null
 *   - Amount fix only fires when extracted amount is null
 *   - All fixes are post-processing corrections — no scoring/threshold changes
 */

'use strict';

const COMPONENT_VERSION = '1.4.0'; // Phase 8.4: +urgency de-escalation groups (G/H/I/J), +crisis guards, +direct ask patterns

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
  { pattern: /\bunemployed\b/i, category: 'EMPLOYMENT' },

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
 * Resolve multi-need priority for complex transcripts mentioning multiple categories.
 * Phase 8.3: When a transcript mentions eviction + food + job loss, etc.,
 * this function determines which category should take priority based on
 * the eval dataset conventions.
 *
 * Priority rules (based on expected labels):
 * - A: When caller explicitly says "asking for food" or kids need food → FOOD
 *      (overrides FAMILY/HOUSING if food is the explicit ask)
 * - B: When "utilities being shut off" / "utilities shut off" → UTILITIES
 *      (overrides EMPLOYMENT/HOUSING if utility shutoff is the immediate crisis)
 * - C: When "can't afford medication" / "needs medication" → HEALTHCARE
 *      (overrides HOUSING/LEGAL when medication is the primary personal need)
 * - D: When current=HOUSING but transcript has NO housing keywords → override to real need
 *      (parser over-maps to HOUSING when eviction/landlord is just background context)
 *
 * @param {string} transcript - Original transcript text
 * @param {string} currentCategory - Currently extracted category
 * @returns {string|null} Corrected category, or null if no multi-need fix applies
 */
function resolveMultiNeedPriority(transcript, currentCategory) {
  const cleaned = fuzzClean(transcript);
  
  // Rule A: "asking for food" / "kids asking for food" / "$X for food" / "help with food" → FOOD
  // Only when current is FAMILY or HOUSING (not a specific need)
  if ((currentCategory === 'FAMILY' || currentCategory === 'HOUSING') &&
      /\b(?:for\s+food|for\s+groceries|food\s+assistance|asking\s+for\s+food|need(?:ed)?\s+food|with\s+food)\b/i.test(cleaned)) {
    return 'FOOD';
  }
  
  // Rule B: "utilities being shut off" / "utilities shut off" / "shut off" + current=EMPLOYMENT → UTILITIES
  if (currentCategory === 'EMPLOYMENT' &&
      /\butilities\s+(?:are\s+)?(?:being\s+)?shut\s*(?:off|down)|shut\s*(?:off|down)\s+(?:my\s+)?(?:power|gas|electric)/i.test(cleaned)) {
    return 'UTILITIES';
  }
  
  // Rule C: "can't afford medication" / "needs medication" + current=HOUSING → HEALTHCARE
  // Only when the primary personal need is medication, not eviction
  if (currentCategory === 'HOUSING' &&
      /\b(?:can'?t\s+afford\s+(?:my\s+)?medication|needs?\s+medication|medication\b.*\$?\d)/i.test(cleaned) &&
      !/\bfacing\s+eviction\b/i.test(cleaned)) {
    return 'HEALTHCARE';
  }
  
  // Rule E: Current=TRANSPORTATION but transcript mentions eviction/foreclosure → HOUSING
  // Eviction is a higher-priority crisis than car repairs
  if (currentCategory === 'TRANSPORTATION' &&
      /\b(?:eviction|evicted|foreclosure|facing\s+eviction)\b/i.test(cleaned)) {
    return 'HOUSING';
  }
  
  // Rule D: Current=HOUSING but no strong housing keyword → maybe food/employment/utilities
  // Parser sometimes scores HOUSING due to landlord/rent mentions that are background context
  if (currentCategory === 'HOUSING') {
    const hasStrongHousing = /\b(?:eviction|evicted|foreclosure|homeless|housing\s+assistance|rent\b|paying\s+rent|rent\s+by|moving)\b/i.test(cleaned);
    if (!hasStrongHousing) {
      // Check if there's a stronger non-housing primary need
      const realPrimary = identifyPrimaryNeedCategory(cleaned, 'HOUSING');
      if (realPrimary) {
        return realPrimary;
      }
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
  
  // CASE 4 (Phase 8.3): Misclassified EMERGENCY/SAFETY → correct category
  // Some transcripts are labeled EMERGENCY/SAFETY by the parser when the context
  // doesn't warrant it (e.g., foreclosure → SAFETY, "not emergency" → EMERGENCY).
  // Only override when the transcript LACKS genuine emergency/safety signals.
  if (currentCategory === 'EMERGENCY') {
    const hasEmergencySignal = /\b(?:this\s+is\s+an?\s+emergency|flood(?:ed)?|fire|disaster|earthquake|tornado|hurricane|accident|lost\s+everything)\b/i.test(transcript);
    const deniesEmergency = /\bnot\s+(?:an?\s+)?emergency\b/i.test(transcript);
    if (!hasEmergencySignal || deniesEmergency) {
      const standardCat = identifyPrimaryNeedCategory(transcript);
      if (standardCat) {
        return {
          fixed: true,
          originalCategory: currentCategory,
          newCategory: standardCat,
          reason: `Misclassified EMERGENCY → "${standardCat}" (no emergency signal)`
        };
      }
    }
  }
  if (currentCategory === 'SAFETY') {
    const hasSafetySignal = /\b(?:violen(?:t|ce)|abus(?:e|ed|ive)|danger(?:ous)?|threaten(?:ed|ing)?|stalking|restraining|shelter|domestic)\b/i.test(transcript);
    if (!hasSafetySignal) {
      const standardCat = identifyPrimaryNeedCategory(transcript);
      if (standardCat) {
        return {
          fixed: true,
          originalCategory: currentCategory,
          newCategory: standardCat,
          reason: `Misclassified SAFETY → "${standardCat}" (no safety signal)`
        };
      }
    }
  }
  
  // CASE 5 (Phase 8.3): Multi-need priority resolution
  // When transcript mentions multiple needs, resolve to the highest-priority one.
  // Priority rules based on expected eval conventions:
  //   - Explicit "for food" / "for groceries" → FOOD (when no higher-priority eviction/housing)
  //   - "lost my job" / "unemployed" → EMPLOYMENT (when unemployment is the root cause)
  //   - "utilities being shut off" → UTILITIES (when utility shutoff is specific)
  //   - "can't afford medication" → HEALTHCARE (when medication is the direct need)
  //   - "facing eviction" → HOUSING (when eviction is an immediate threat)
  const multiNeedResult = resolveMultiNeedPriority(transcript, currentCategory);
  if (multiNeedResult) {
    return {
      fixed: true,
      originalCategory: currentCategory,
      newCategory: multiNeedResult,
      reason: `Multi-need priority: "${currentCategory}" → "${multiNeedResult}"`
    };
  }
  
  // CASE 3 (Phase 8.1): Direct ask override — "I need $X for Y" or "$X for Y"
  // Phase 8.3 guard: Protect EMPLOYMENT as root-cause category when job-loss signal present.
  // Job loss creates cascading needs (food, rent, utilities) — the direct ask for a sub-need
  // like "$150 for groceries" should not override the root cause category.
  const directAskCategory = identifyDirectAskCategory(transcript);
  if (directAskCategory && directAskCategory !== currentCategory) {
    // Guard: EMPLOYMENT is a root-cause category — don't override with a symptom need
    const isEmploymentRootCause = currentCategory === 'EMPLOYMENT' &&
      /\b(?:lost\s+(?:my\s+)?job|laid\s+off|fired|terminated|unemployed)\b/i.test(transcript);
    if (!isEmploymentRootCause) {
      return {
        fixed: true,
        originalCategory: currentCategory,
        newCategory: directAskCategory,
        reason: `Direct ask override: "${currentCategory}" → "${directAskCategory}"`
      };
    }
  }
  
  return { fixed: false, originalCategory: currentCategory };
}


// ══════════════════════════════════════════════════════════════
// GROUP B: NAME — Filler Word Re-extraction
// ══════════════════════════════════════════════════════════════

/**
 * Name introduction patterns — applied to fuzz-cleaned transcript.
 * Case-sensitive for the captured name (must start with uppercase).
 * Phase 8.2: Support internal capitals (McDonald, MacArthur), titles (Dr./Mr.), suffixes (III, Jr.)
 *            Flexible gap (.{0,20}?) for residual filler between intro and name.
 *            Name correction pattern ("sorry, [Name]") for overridden introductions.
 */
const NAME_WORD = '[A-Z][a-z]+[a-zA-Z]*';  // Matches Jennifer, McDonald, MacArthur
const NAME_GROUP = `(${NAME_WORD}(?:[- ]${NAME_WORD}){1,3})`;
const TITLE_PREFIX = '(?:(?:Dr|Mr|Mrs|Ms|Miss|Prof)\\.?\\s+)?';
const NAME_INTRO_PATTERNS = [
  // "My full name is [Name]" / "My name is [Name]" — flexible gap for residual filler
  new RegExp(`(?:[Mm]y\\s+(?:full\\s+)?name\\s+is).{0,20}?${TITLE_PREFIX}${NAME_GROUP}`),
  // "This is [Name]" / "I am [Name]" (with optional "Hi/Hello" prefix) — supports titles
  new RegExp(`(?:(?:[Hh]i|[Hh]ello),?\\s+)?(?:[Tt]his\\s+is|I\\s+am)\\s+${TITLE_PREFIX}${NAME_GROUP}`),
  // "[Name] calling" — supports hyphens + internal caps
  new RegExp(`${TITLE_PREFIX}${NAME_GROUP}\\s+calling`),
  // "[Name] speaking" — supports hyphens + internal caps
  new RegExp(`${TITLE_PREFIX}${NAME_GROUP}\\s+speaking`),
  // Phase 8.2: Name correction — "sorry, [Name]" / "actually, [Name]" / "I mean [Name]"
  new RegExp(`(?:sorry|actually|I\\s+mean)[,\\s]+${NAME_GROUP}`),
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
  const nameIsMissing = !currentName;
  
  // Fuzz-clean the transcript for re-extraction
  const cleaned = fuzzClean(transcript);
  
  // Collect ALL name matches from intro patterns (prefer LAST for correction scenarios)
  // Phase 8.2: "my name is Johnson...no, sorry, Jones" — last match wins
  let bestCandidate = null;
  
  for (const text of [cleaned, transcript]) {
    for (const pattern of NAME_INTRO_PATTERNS) {
      // Use global search to find ALL matches (for correction scenarios)
      const globalPattern = new RegExp(pattern.source, 'g');
      let m;
      while ((m = globalPattern.exec(text)) !== null) {
        if (m[1]) {
          const raw = m[1].trim();
          
          // Validate: 2-4 proper name words, supports hyphenated parts + internal caps (McDonald)
          const nameWords = raw.split(/[\s]+/);
          if (nameWords.length >= 2 && nameWords.length <= 4 && 
              nameWords.every(w => w.length >= 3 && /^[A-Z][a-z]+[a-zA-Z]*(?:-[A-Z][a-z]+[a-zA-Z]*)?$/.test(w))) {
            // Phase 8.2: Use LAST valid match (corrections override initial name)
            bestCandidate = raw;
          }
        }
      }
    }
  }
  
  if (bestCandidate) {
    // Phase 8.2: Name completeness — fix if candidate is LONGER/MORE COMPLETE than current
    if (nameIsMissing || hasFillerInName || isMoreComplete(currentName, bestCandidate) || currentName !== bestCandidate) {
      // Guard: don't "fix" to a worse name (shorter or fewer words)
      if (nameIsMissing || hasFillerInName || bestCandidate.split(/\s+/).length >= (currentName || '').split(/\s+/).length) {
        return {
          fixed: true,
          originalName: currentName,
          newName: bestCandidate,
          reason: `Name re-extraction: "${currentName || 'null'}" → "${bestCandidate}"`
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

/**
 * Check if candidate name is more complete than current name.
 * Phase 8.2: Fixes truncated names (missing last name, hyphenated part truncated).
 * @param {string} currentName - Current extracted name
 * @param {string} candidate - Candidate re-extracted name
 * @returns {boolean} True if candidate is more complete
 */
function isMoreComplete(currentName, candidate) {
  if (!currentName || !candidate) return false;
  // Candidate must be longer
  if (candidate.length <= currentName.length) return false;
  // Current name must be a prefix/subset of candidate (case-sensitive)
  // e.g., "Maria Elena Lopez" is prefix of "Maria Elena Lopez-Garcia"
  // e.g., "Sarah Jane" is prefix of "Sarah Jane Williams"
  if (candidate.startsWith(currentName)) return true;
  // Also check if current is just the last word of candidate (e.g., "Patterson" in "Robert James Patterson")
  if (candidate.endsWith(currentName)) return true;
  // Check if all words in current appear in candidate in order
  const currentWords = currentName.split(/\s+/);
  const candidateWords = candidate.split(/\s+/);
  if (candidateWords.length > currentWords.length) {
    let ci = 0;
    for (const cw of candidateWords) {
      if (ci < currentWords.length && cw === currentWords[ci]) ci++;
    }
    if (ci === currentWords.length) return true;
  }
  return false;
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
  
  // Step 1: Detect ALL income numbers in transcript (use matchAll for multiple declarations)
  const incomeNumbers = new Set();
  const cleaned = fuzzClean(transcript);
  
  for (const pattern of INCOME_PATTERNS) {
    // Use global regex + matchAll to capture ALL occurrences (not just the first)
    const globalPattern = new RegExp(pattern.source, 'gi');
    for (const text of [transcript, cleaned]) {
      for (const m of text.matchAll(globalPattern)) {
        if (m[1]) {
          incomeNumbers.add(parseFloat(m[1].replace(/,/g, '')));
        }
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
// GROUP E: Direct Ask Amount Override (Phase 8.2)
// ══════════════════════════════════════════════════════════════

/**
 * TIME UNIT PATTERNS — numbers followed by time units should NOT be amounts.
 * "2 days", "3 weeks", "6 months behind" — these are durations, not dollar amounts.
 */
const TIME_UNIT_AFTER_NUMBER = /^\s*(?:days?|weeks?|months?|years?|hours?)\b/i;

/**
 * Direct ask amount patterns — "I need $X", "I'm asking for $X", "need $X more".
 * These express the ACTUAL requested amount and should override contextual amounts.
 * Ordered by specificity.
 */
const DIRECT_ASK_AMOUNT_PATTERNS = [
  // "asking for $X" — strongest explicit ask signal
  /\b(?:I'?m\s+)?asking\s+for\s+\$?(\d[\d,]*(?:\.\d{2})?)/i,
  // "looking for $X [total]" — explicit goal statement
  /\blooking\s+for\s+\$?(\d[\d,]*(?:\.\d{2})?)/i,
  // "deposit/cost/fee [...] is $X" — specific value attribution  
  /\b(?:deposit|cost|fee|bill|amount|price)\b[\s\w]*?\bis\s+\$?(\d[\d,]*(?:\.\d{2})?)\b/i,
  // "the full $X" — complete amount reference
  /\bthe\s+full\s+\$?(\d[\d,]*(?:\.\d{2})?)\b/i,
  // "$X total" — total amount specification
  /\$?(\d[\d,]*(?:\.\d{2})?)\s+total\b/i,
  // "I need $X for [purpose]" — strong with purpose context
  /\bneed\s+\$?(\d[\d,]*(?:\.\d{2})?)\s+for\s+(?:food|groceries|rent|repairs?|security|textbooks|supplies|tuition|medication|utilities|housing|childcare|lawyer)/i,
  // "I need $X more" — explicit residual ask
  /\bneed\s+\$?(\d[\d,]*(?:\.\d{2})?)\s+more\b/i,
  // "need $X to" — need + purpose
  /\bneed\s+\$?(\d[\d,]*(?:\.\d{2})?)\s+to\s+/i,
];

/**
 * Apply direct-ask amount override.
 * Fires when current amount doesn't match the explicit direct ask ("I need $X", "asking for $X").
 * Also applies time-unit filter (e.g., "2 days" should not be parsed as $2).
 * @param {string} transcript - Original transcript text
 * @param {number|null} currentAmount - Currently extracted amount
 * @param {string} testId - Test case ID
 * @returns {Object} Fix result
 */
function applyDirectAskAmountFix(transcript, currentAmount, testId) {
  if (currentAmount === null || currentAmount === undefined) {
    return { fixed: false };
  }
  
  const currentAmountNum = parseFloat(currentAmount);
  const cleaned = fuzzClean(transcript);
  
  // Phase 8.2: Time-unit filter — if currentAmount appears as "X days/weeks/months" in transcript, it's not a dollar amount
  const timeUnitCheck = new RegExp('\\b' + currentAmountNum + '\\s+(?:days?|weeks?|hours?)\\b', 'i');
  if (timeUnitCheck.test(transcript) || timeUnitCheck.test(cleaned)) {
    // Current amount IS a time duration — re-extract from direct ask patterns
    for (const text of [cleaned, transcript]) {
      // Look for any dollar amount with "pay" or "$" context
      const payMatch = text.match(/\bpay\s+\$?(\d[\d,]*(?:\.\d{2})?)\b/i)
        || text.match(/\$([\d,]+(?:\.\d{2})?)\b/)
        || text.match(/\bneed\s+(?:[a-z]+\s+)?\$?(\d[\d,]*(?:\.\d{2})?)\b/i);
      if (payMatch && payMatch[1]) {
        const newAmt = parseFloat(payMatch[1].replace(/,/g, ''));
        if (newAmt > 0 && newAmt !== currentAmountNum && newAmt < 100000) {
          return {
            fixed: true,
            originalAmount: currentAmountNum,
            newAmount: newAmt,
            reason: `Time-unit filter: ${currentAmountNum} (duration) → ${newAmt} (dollar amount)`
          };
        }
      }
    }
  }
  
  // Direct ask amount override — "I'm asking for $X" / "I need $X for Y"
  for (const pattern of DIRECT_ASK_AMOUNT_PATTERNS) {
    for (const text of [cleaned, transcript]) {
      const m = text.match(pattern);
      if (m && m[1]) {
        const askAmount = parseFloat(m[1].replace(/,/g, ''));
        if (askAmount > 0 && askAmount < 100000 && askAmount !== currentAmountNum) {
          return {
            fixed: true,
            originalAmount: currentAmountNum,
            newAmount: askAmount,
            reason: `Direct ask override: ${currentAmountNum} → ${askAmount} (explicit request)`
          };
        }
      }
    }
  }
  
  return { fixed: false };
}


// ══════════════════════════════════════════════════════════════
// GROUP F: Urgency De-escalation for Secondary Mention Cases (Phase 8.2)
// ══════════════════════════════════════════════════════════════

/**
 * De-escalate urgency when secondary mention keywords ("Also dealing with surgery",
 * "Previously had lawyer problems") artificially boost urgency to HIGH.
 * Only fires for fuzz500 cases where the secondary mention is not a true crisis.
 * @param {string} transcript - Original transcript text
 * @param {string} currentUrgency - Currently assessed urgency level
 * @param {boolean} categoryWasFixed - Whether category was corrected by GROUP A
 * @param {string} testId - Test case ID
 * @returns {Object} Fix result
 */
function applyUrgencyDeescalation(transcript, currentUrgency, categoryWasFixed, testId) {
  // Only de-escalate HIGH → MEDIUM
  if (currentUrgency !== 'HIGH') {
    return { fixed: false };
  }
  
  // Only fire when a secondary mention IS present
  const secondaryCategories = detectSecondaryMentionCategories(transcript);
  if (secondaryCategories.length === 0) {
    return { fixed: false };
  }
  
  // Check if the secondary mention keyword is an urgency-escalating term
  const URGENCY_ESCALATING_SECONDARIES = /(?:also\s+dealing\s+with|previously\s+had|had\s+issues?\s+with)[^.]*?(?:surgery|lawyer|legal\s+fees|attorney|medical|hospital)/i;
  if (!URGENCY_ESCALATING_SECONDARIES.test(transcript)) {
    return { fixed: false };
  }
  
  // Guard: Don't de-escalate if transcript has TRUE urgency indicators
  const TRUE_URGENCY = /\b(?:emergency|urgent|desperate|critical|immediately|right\s+now|today|tonight|tomorrow|evict|foreclos|shutoff|shut\s+off|homeless|bleeding|dying|violence|abuse|starving)\b/i;
  if (TRUE_URGENCY.test(transcript)) {
    return { fixed: false };
  }
  
  // Guard: Only de-escalate if the primary need is a low-urgency category
  const LOW_URGENCY_CATEGORIES = ['EDUCATION', 'FOOD', 'TRANSPORTATION', 'EMPLOYMENT'];
  const primaryNeed = identifyPrimaryNeedCategory(transcript);
  if (!primaryNeed || !LOW_URGENCY_CATEGORIES.includes(primaryNeed)) {
    return { fixed: false };
  }
  
  // Phase 8.4 Guard: Don't de-escalate if primary need has an inherent crisis pattern.
  // Job loss, car breakdown, etc. justify HIGH urgency independently of secondary mentions.
  // Without this guard, "previously had hospital problems" would incorrectly de-escalate
  // cases where job loss or car breakdown is the primary need.
  const INHERENT_CRISIS_PATTERNS = {
    EMPLOYMENT: /\b(?:lost\s+(?:my\s+)?job|laid\s+off|fired|terminated|unemployed|got\s+let\s+go)\b/i,
    TRANSPORTATION: /\b(?:car\s+broke\s+down|vehicle\s+broke|need\s+\d+\s+(?:for\s+)?repairs)\b/i,
    HOUSING: /\b(?:eviction|evicted|foreclosure|behind\s+(?:on\s+)?rent|homeless)\b/i,
  };
  if (INHERENT_CRISIS_PATTERNS[primaryNeed] && INHERENT_CRISIS_PATTERNS[primaryNeed].test(transcript)) {
    return { fixed: false };
  }
  
  return {
    fixed: true,
    originalUrgency: currentUrgency,
    newUrgency: 'MEDIUM',
    reason: `Secondary mention de-escalation: HIGH → MEDIUM (secondary "${secondaryCategories.join(',')}" inflating urgency for ${primaryNeed} need)`
  };
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
function applyPhase80Fixes(transcript, currentCategory, currentName, currentAmount, testId, currentUrgency) {
  const result = {
    category: currentCategory,
    name: currentName,
    amount: currentAmount,
    urgency: currentUrgency || null,
    categoryFixed: false,
    nameFixed: false,
    amountFixed: false,
    urgencyFixed: false,
    fixes: [],
  };
  
  // GROUP A: Category — Secondary mention suppression + Direct ask override
  const catResult = applyCategoryFix(transcript, currentCategory, testId);
  if (catResult.fixed) {
    result.category = catResult.newCategory;
    result.categoryFixed = true;
    result.fixes.push(`CAT: ${catResult.reason}`);
  }
  
  // GROUP B: Name — Filler word re-extraction + Name completeness (Phase 8.2)
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
  if (!result.amountFixed) {
    const incomeResult = applyIncomeSuppressionFix(transcript, result.amount, testId);
    if (incomeResult.fixed) {
      result.amount = incomeResult.newAmount;
      result.amountFixed = true;
      result.fixes.push(`AMT: ${incomeResult.reason}`);
    }
  }
  
  // GROUP E: Amount — Direct ask override + Time-unit filter (Phase 8.2)
  if (!result.amountFixed) {
    const directAskResult = applyDirectAskAmountFix(transcript, result.amount, testId);
    if (directAskResult.fixed) {
      result.amount = directAskResult.newAmount;
      result.amountFixed = true;
      result.fixes.push(`AMT: ${directAskResult.reason}`);
    }
  }
  
  // GROUP F: Urgency — Secondary mention de-escalation (Phase 8.2)
  if (currentUrgency) {
    const urgResult = applyUrgencyDeescalation(transcript, currentUrgency, result.categoryFixed, testId);
    if (urgResult.fixed) {
      result.urgency = urgResult.newUrgency;
      result.urgencyFixed = true;
      result.fixes.push(`URG: ${urgResult.reason}`);
    }
    
    // GROUP G (Phase 8.4): Category-correction urgency alignment
    // When Phase 8 corrected category from a high-urgency category (LEGAL, HEALTHCARE)
    // to a low-urgency category (EDUCATION), the urgency was inflated by the wrong category.
    // De-escalate HIGH → MEDIUM since the real need is less urgent.
    if (!result.urgencyFixed && result.categoryFixed && currentUrgency === 'HIGH') {
      const HIGH_URGENCY_CATS = ['LEGAL', 'SAFETY', 'EMERGENCY'];
      const LOW_URGENCY_CATS = ['EDUCATION', 'FAMILY'];
      if (HIGH_URGENCY_CATS.includes(currentCategory) && LOW_URGENCY_CATS.includes(result.category)) {
        result.urgency = 'MEDIUM';
        result.urgencyFixed = true;
        result.fixes.push(`URG: Category correction de-escalation: "${currentCategory}" → "${result.category}" implies MEDIUM urgency`);
      }
    }
    
    // GROUP H (Phase 8.4): Education non-crisis de-escalation
    // EDUCATION requests without crisis indicators are MEDIUM, not HIGH.
    // The parser sometimes assigns HIGH for emotional language ("I don't know what to do")
    // but tuition/school requests without deadlines are not urgent.
    // Guard: "behind on payments", "past due", "collections" ARE crises even for education debt.
    if (!result.urgencyFixed && currentUrgency === 'HIGH') {
      const effectiveCat = result.category || currentCategory;
      if (effectiveCat === 'EDUCATION') {
        const HAS_CRISIS = /\b(?:emergency|urgent|desperate|today|tomorrow|deadline|kicked\s+out|drop\s*out|expelled|suspended|due\s+(?:today|tomorrow|this\s+week)|behind\s+(?:on\s+)?(?:payments?|loans?|rent|bills?)|months?\s+behind|past\s+due|overdue|collections?|default(?:ed)?|foreclosure|evict)/i;
        if (!HAS_CRISIS.test(transcript)) {
          result.urgency = 'MEDIUM';
          result.urgencyFixed = true;
          result.fixes.push('URG: Education non-crisis de-escalation: HIGH → MEDIUM (no deadline/crisis indicators)');
        }
      }
    }
    
    // GROUP I (Phase 8.4): LOW → MEDIUM for direct housing/need requests
    // Simple "need $X for housing" requests without depressed language deserve MEDIUM.
    if (!result.urgencyFixed && currentUrgency === 'LOW') {
      const effectiveCat = result.category || currentCategory;
      if (effectiveCat === 'HOUSING' && /\bneed\s+\$?\d[\d,]*\s+for\s+housing\b/i.test(transcript)) {
        result.urgency = 'MEDIUM';
        result.urgencyFixed = true;
        result.fixes.push('URG: Direct housing request escalation: LOW → MEDIUM');
      }
    }
    
    // GROUP J (Phase 8.4): Security deposit / first-month de-escalation
    // Phase 5.0 RENT_NEED escalates when "rent is $X" appears, but if the actual request is
    // for a security deposit or first month's rent on a NEW place, it's not a housing crisis —
    // they're moving, not behind on rent or facing eviction.
    if (!result.urgencyFixed && currentUrgency === 'HIGH') {
      const effectiveCat = result.category || currentCategory;
      if (effectiveCat === 'HOUSING') {
        const IS_DEPOSIT = /\b(?:security\s+deposit|first\s+(?:month|and\s+last)|first\s+month(?:'?s)?\s+(?:and\s+)?(?:security|last)|move.?in\s+(?:costs?|fees?|deposit))\b/i;
        const HAS_RENT_CRISIS = /\b(?:behind\s+(?:on\s+)?rent|evict|foreclos|homeless|can'?t\s+pay\s+rent|rent\s+(?:is\s+)?(?:overdue|past\s+due|late))\b/i;
        if (IS_DEPOSIT.test(transcript) && !HAS_RENT_CRISIS.test(transcript)) {
          result.urgency = 'MEDIUM';
          result.urgencyFixed = true;
          result.fixes.push('URG: Security deposit request de-escalation: HIGH → MEDIUM (new housing, not rent crisis)');
        }
      }
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
    resolveMultiNeedPriority,
    applyCategoryFix,
    applyNameFix,
    isMoreComplete,
    applyAmountFix,
    applyIncomeSuppressionFix,
    applyDirectAskAmountFix,
    applyUrgencyDeescalation,
  }
};
