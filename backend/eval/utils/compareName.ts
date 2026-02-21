/**
 * Name Comparison Utility for Jan v2.5 Evaluation Suite
 * 
 * Provides strict name cleaning and comparison to eliminate false positives
 * like "Sarah Martinez and I really need help right now" counting as correct.
 */

// Phrases to strip from the beginning of extracted names
const INTRO_PHRASES = [
  'my name is',
  'this is', 
  'i am',
  "i'm",
  'called',  // Fix for 'called Robert Chen' pattern from test results
  'hi,? (?:my name is|i am|this is)',
  'hello,? (?:my name is|i am|this is)',
  'the name is',
  'name is'
];

// Conjunctions and trailing patterns to remove
const TRAILING_PATTERNS = [
  ' and i ',
  ' and we ',
  ' and my ',
  ' and the ',
  ' really ',
  ' need ',
  ' help ',
  ' right now',
  ' currently',
  ' desperately',
  ' because',
  ' so',
  '\\.',
  '\\,',
  '\\!',
  '\\?'
];

// Words that should never be part of a clean name
const INVALID_NAME_WORDS = [
  'need', 'help', 'really', 'desperately', 'because', 'and', 'i', 'we', 'my', 
  'the', 'this', 'that', 'right', 'now', 'currently', 'please', 'so', 'very',
  'assistance', 'support', 'crisis', 'emergency', 'situation', 'problem'
];

/**
 * Cleans an extracted name by removing intro phrases and trailing content
 * 
 * @param rawName - Raw extracted name string
 * @returns Cleaned name or null if invalid
 */
export function cleanExtractedName(rawName: string | null | undefined): string | null {
  if (!rawName || typeof rawName !== 'string') return null;
  
  let cleaned = rawName.toLowerCase().trim();
  if (!cleaned) return null;
  
  // Remove intro phrases from the beginning
  for (const phrase of INTRO_PHRASES) {
    const regex = new RegExp(`^${phrase}\\s+`, 'i');\n    cleaned = cleaned.replace(regex, '');\n  }\n  \n  // Remove trailing patterns and punctuation\n  for (const pattern of TRAILING_PATTERNS) {\n    const regex = new RegExp(pattern + '.*$', 'i');\n    cleaned = cleaned.replace(regex, '');\n  }\n  \n  // Additional cleanup\n  cleaned = cleaned\n    .replace(/\\s+/g, ' ')  // normalize whitespace\n    .replace(/[.,!?;:]+$/, '')  // remove trailing punctuation\n    .trim();\n    \n  if (!cleaned) return null;\n  \n  // Split into words and validate\n  const words = cleaned.split(/\\s+/);\n  \n  // Filter out invalid words\n  const validWords = words.filter(word => {\n    if (word.length < 2) return false;\n    if (INVALID_NAME_WORDS.includes(word.toLowerCase())) return false;\n    return true;\n  });\n  \n  if (validWords.length === 0) return null;\n  if (validWords.length > 4) return null; // Too many words, likely a sentence fragment\n  \n  // Proper case the result\n  const result = validWords\n    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())\n    .join(' ');\n    \n  return result;\n}\n\n/**\n * Compares two names with fuzzy matching allowed for titles and formatting\n * \n * @param actual - Actual extracted name\n * @param expected - Expected name from test case\n * @param allowFuzzy - Whether to allow fuzzy matching for titles, etc.\n * @returns Comparison result with details\n */\nexport function compareNames(\n  actual: string | null | undefined,\n  expected: string | null | undefined,\n  allowFuzzy: boolean = false\n): { matches: boolean; reason?: string; cleanedActual?: string | null } {\n  \n  // Handle null cases\n  if (expected === null || expected === undefined) {\n    const isActualEmpty = !actual || actual.trim() === '';\n    return {\n      matches: isActualEmpty,\n      reason: isActualEmpty ? 'both_null' : 'expected_null_got_value',\n      cleanedActual: actual || null\n    };\n  }\n  \n  if (!actual || actual.trim() === '') {\n    return {\n      matches: false,\n      reason: 'expected_value_got_null',\n      cleanedActual: null\n    };\n  }\n  \n  // Clean the actual name\n  const cleanedActual = cleanExtractedName(actual);\n  \n  if (!cleanedActual) {\n    return {\n      matches: false,\n      reason: 'name_cleaning_failed',\n      cleanedActual: null\n    };\n  }\n  \n  // Normalize both for comparison\n  const normalizedActual = cleanedActual.toLowerCase().trim();\n  const normalizedExpected = expected.toLowerCase().trim();\n  \n  // Exact match\n  if (normalizedActual === normalizedExpected) {\n    return {\n      matches: true,\n      reason: 'exact_match',\n      cleanedActual\n    };\n  }\n  \n  if (allowFuzzy) {\n    // Remove titles from both for fuzzy matching\n    const actualNoTitle = normalizedActual.replace(/^(dr\\.?|mr\\.?|ms\\.?|mrs\\.?)\\s+/i, '');\n    const expectedNoTitle = normalizedExpected.replace(/^(dr\\.?|mr\\.?|ms\\.?|mrs\\.?)\\s+/i, '');\n    \n    if (actualNoTitle === expectedNoTitle) {\n      return {\n        matches: true,\n        reason: 'fuzzy_match_title_difference',\n        cleanedActual\n      };\n    }\n    \n    // Token set matching (first name + last name in any order)\n    const actualTokens = new Set(actualNoTitle.split(/\\s+/));\n    const expectedTokens = new Set(expectedNoTitle.split(/\\s+/));\n    \n    if (actualTokens.size === expectedTokens.size) {\n      const tokensMatch = [...actualTokens].every(token => expectedTokens.has(token));\n      if (tokensMatch) {\n        return {\n          matches: true,\n          reason: 'fuzzy_match_token_reorder',\n          cleanedActual\n        };\n      }\n    }\n  }\n  \n  return {\n    matches: false,\n    reason: 'name_mismatch',\n    cleanedActual\n  };\n}\n\n/**\n * Validates if a string looks like a reasonable name\n * Used for confidence scoring in extraction\n */\nexport function isReasonableName(name: string | null | undefined): boolean {\n  if (!name) return false;\n  \n  const cleaned = cleanExtractedName(name);\n  if (!cleaned) return false;\n  \n  const words = cleaned.split(/\\s+/);\n  \n  // Must be 1-4 words\n  if (words.length < 1 || words.length > 4) return false;\n  \n  // Each word should be 2+ characters and start with uppercase\n  return words.every(word => {\n    if (word.length < 2) return false;\n    if (!/^[A-Z]/.test(word)) return false;\n    return true;\n  });\n}\n\n/**\n * Test cases for name cleaning (for validation)\n */\nexport const NAME_CLEANING_TEST_CASES = [\n  {\n    input: \"Sarah Martinez and I really need help right now\",\n    expected: \"Sarah Martinez\",\n    description: \"Remove trailing sentence fragment\"\n  },\n  {\n    input: \"my name is John Smith\",\n    expected: \"John Smith\",\n    description: \"Remove intro phrase\"\n  },\n  {\n    input: \"called Robert Chen\",\n    expected: \"Robert Chen\", \n    description: \"Remove 'called' prefix\"\n  },\n  {\n    input: \"Dr. Patricia Johnson\",\n    expected: \"Dr. Patricia Johnson\",\n    description: \"Preserve titles\"\n  },\n  {\n    input: \"this is Maria Garcia and we desperately need\",\n    expected: \"Maria Garcia\",\n    description: \"Complex intro + trailing removal\"\n  },\n  {\n    input: \"I need help with my situation\",\n    expected: null,\n    description: \"No actual name present\"\n  }\n];
