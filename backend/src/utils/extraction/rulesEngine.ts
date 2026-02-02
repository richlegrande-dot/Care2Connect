/**
 * Rules-Based Extraction Engine
 * 
 * Extracts structured data from transcripts using regex patterns
 * and keyword scoring - NO external AI APIs
 */

import { TelemetryCollector, calculateQualityScore } from '../../services/telemetry';
import { UrgencyAssessmentEngine } from './urgencyEngine';
import { AmountDetectionEngine } from './amountEngine';

/**
 * Enhanced Name Candidate Filtering for Production Quality
 */
const NAME_REJECT_PATTERNS: ReadonlyArray<RegExp> = Object.freeze([
  // Numbers and age references
  /^\d+$/,
  /^(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)$/i,
  /^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)$/i,
  
  // Common false positives
  /^(critical|urgent|emergency|important|needed|struggling|difficult|desperate)$/i,
  /^(help|need|want|trying|looking|asking|hoping)$/i,
  /^(here|there|where|when|what|how|why|who)$/i,
  /^(good|bad|okay|fine|great|terrible|awful)$/i,
  /^(today|tomorrow|yesterday|now|then|soon)$/i,
]);

const NAME_CONTEXT_REJECT: ReadonlyArray<RegExp> = Object.freeze([
  // Followed by units/measurements
  /years?\s+old/i,
  /months?\s+old/i,
  /dollars?/i,
  /per\s+hour/i,
  /an?\s+hour/i,
  /a\s+day/i,
  /a\s+week/i,
  /a\s+month/i,
  // Location indicators (state names, cities followed by state)
  /(?:Oregon|Texas|California|Florida|New York|Avenue|Street|Road|Boulevard)\s+(?:resident|technically|area)/i,
  // Urgency words that shouldn't be names - enhanced patterns
  /\b(?:Critical|Emergency|Urgent|Desperate|Crisis)\b.*\b(?:and|this|is|response|team)\b/i,
  /(?:they call me|everyone calls me|people call me)\s+(?:Critical|Emergency|Urgent|Desperate|Crisis|Alert|Help)/i,
]);

/**
 * Comprehensive confidence scoring model
 */
interface ExtractionConfidences {
  nameConfidence: number;
  locationConfidence: number;
  amountConfidence: number;
  categoryConfidence: number;
  urgencyConfidence: number;
  overallConfidence: number;
}

/**
 * Amount parsing context requirements
 */
const AMOUNT_NEED_VERBS: ReadonlyArray<string> = Object.freeze([
  'need', 'raise', 'goal', 'asking', 'looking', 'require', 'seeking',
  'trying to raise', 'help with', 'assistance with'
]);

const AMOUNT_REJECT_CONTEXTS: ReadonlyArray<RegExp> = Object.freeze([
  /\$\d+\s*(per|an?|a)\s+(hour|day|week|month|year)/i,
  /\d+\s*years?\s+old/i,
  /\d+\s*months?/i,
  /(salary|wage|income)\s*\$?\d+/i,
]);

/**
 * Pre-compiled extraction patterns for performance
 * Using Object.freeze() to prevent modification and improve V8 optimization
 */
const COMPILED_EXTRACTION_PATTERNS: Readonly<{
  name: ReadonlyArray<RegExp>;
  age: ReadonlyArray<RegExp>;
  phone: ReadonlyArray<RegExp>;
  email: ReadonlyArray<RegExp>;
  location: ReadonlyArray<RegExp>;
  goalAmount: ReadonlyArray<RegExp>;
  urgency: ReadonlyArray<RegExp>;
  relationship: ReadonlyArray<RegExp>;
}> = Object.freeze({
  name: Object.freeze([
    // Basic patterns first (most common)
    /(?:my (?:full )?name(?:'s| is))\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+(?!and\b|but\b|or\b|from\b|years?\b|dollars?\b|per\b|avenue\b|street\b|road\b|drive\b|way\b|lane\b|court\b|place\b|texas\b|california\b|florida\b|oregon\b|york\b|I\b|need\b|want\b|help\b)[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,2})(?=\s+(?:and|but|or|from|I|need|want|help)|,|\.|$|'s|;)/i,
    // "I'm Maria Garcia" - capture full name (up to 4 parts)
    /(?:i'm|i am)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+(?!speaking|here|and|but|or|from|years?)[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,3})(?=\s+(?:and|but|or|from)|,|\.|$|'s|;|\s+\d)/i,
    // "This is Dr. James Wilson" or "This is Jennifer Wilson" - handle with or without titles
    /(?:this is|here is)\s+(?:(?:Dr\.|Mr\.|Mrs\.|Ms\.|Rev\.|Captain)\s+)?([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,2})(?=\s+(?:speaking|MD|Jr|Sr|PhD|and|but|or|here)|,|\.|$|'s|;)/i,
    // "Call me Robert Johnson"
    /(?:call me|you can call me)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+(?!speaking|here|and|but)[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,3})(?=\.|,|$|\s+and)/i,
    // Title extraction: "My name is Dr. Sarah Thompson" - extract name after title
    /(?:my (?:full )?name(?:'s| is))\s+(?:Dr\.|Mr\.|Mrs\.|Ms\.|Rev\.|Prof\.|Captain|Major|Colonel)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,2})(?=\s+(?:MD|Jr|Sr|PhD|and|but|or|here)|,|\.|$|'s|;)/i,
    // "I'm Rev. Michael Johnson Jr." - title in I'm context
    /(?:i'm|i am)\s+(?:Dr\.|Mr\.|Mrs\.|Ms\.|Rev\.|Prof\.|Captain|Major|Colonel)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,2})(?=\s+(?:MD|Jr|Sr|PhD|and|but|or|here)|,|\.|$|'s|;)/i,
    // Legal/formal language with titles: "namely one Ms. Sarah Thompson", "to wit, Mr. John Doe"
    /(?:namely(?: one)?|to wit),?\s+(?:Ms\.|Mrs\.|Mr\.|Dr\.|Miss)?\s*([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){1,3})/i,
    // Legal/formal language: "Whereas the undersigned, Sarah Thompson" or "Party of the first part, John Doe"
    /(?:whereas the undersigned|party of the (?:first|second) part|hereinafter referred to as),?\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,3})/i,
    // Multilingual code-switching: "Me llamo María", "Je m'appelle Pierre"
    /(?:me llamo|je m'appelle|meu nome é|mi nombre es)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,3})/i,
  ]),
  age: Object.freeze([
    /(?:i am|i'm)\s+(\d+)\s+years?\s+old/i,
    /(\d+)\s+year\s+old/i,
  ]),
  phone: Object.freeze([
    /(?:phone|call|reach me|contact me).*?(\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4})/i,
    /(\d{3}[-\s]\d{3}[-\s]\d{4})/,
  ]),
  email: Object.freeze([
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
  ]),
  location: Object.freeze([
    /(?:live in|living in|from|in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s*[A-Z]{2})?)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})\b/,
  ]),
  goalAmount: Object.freeze([
    // Specialized formats first (highest priority)
    // Scientific notation: "5e3", "2.5E3"
    /\b([\d.]+)[eE]([\d]+)\b/i,
    // Engineering notation: "1.5 * 10^3"
    /([\d.]+)\s*[*×]\s*10\s*\^\s*([\d]+)/i,
    // Roman numerals: "V thousand", "III thousand"
    /\b([IVXLCDM]+)\s+thousand/i,
    // "only asking for" or "just asking for" (very specific context)
    /(?:only|just)\s+asking for\s+(?:\$)?([\d,]+)/i,
    // "I need fifteen hundred dollars" or "need $1500" - with modifiers like "at least"
    /(?:need|raise|goal of|asking for|looking for|require|at least|preferably|only asking for|just asking for)\s+(?:\$|dollars?\s+)?([\d,]+)\s*(?:dollars?)?/i,
    // "$5,000" or "5000 dollars" standalone
    /\$([\d,]+)(?!\s*per|\s*an?\s+(?:hour|day|week|month|year))/i,
    /([\d,]+)\s+dollars?(?!\s*per|\s*an?\s+(?:hour|day|week|month|year))/i,
    // "fifteen hundred" or "five thousand" (written numbers)
    /(?:need|raise|goal of|at least)\s+((?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|and)(?:[-\s]+(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|and))*)/i,
    // "goal is $2500" or "target is 3000"
    /(?:goal|target|amount)\s+(?:is|of)\s+(?:\$)?([\d,]+)/i,
    // "between $1000 and $5000"
    /between\s+\$([\d,]+)\s+and\s+\$([\d,]+)/i,
    // "around $3000" or "about 2500" or "somewhere around"
    /(?:around|about|approximately|somewhere around)\s+(?:\$)?([\d,]+)/i,
    // "no more than" or "up to" or "maximum of"  
    /(?:no more than|up to|maximum of)\s+(?:\$)?([\d,]+)/i,
  ]),
  urgency: Object.freeze([
    // High urgency indicators
    /(?:urgent|emergency|crisis|critical|immediate|asap|desperate|help)/i,
    // Medium urgency indicators 
    /(?:soon|needed|important|pressing|struggling)/i,
    // Temporal urgency
    /(?:today|tomorrow|this week|by [A-Z][a-z]+)/i,
  ]),
  relationship: Object.freeze([
    // Family relationships (non-PII)
    /(?:for my|helping my)\s+(son|daughter|child|children|kids?|mom|mother|dad|father|parent|family)/i,
    /(?:my|our)\s+(son|daughter|child|children|kids?)\s+(?:needs?|requires?)/i,
    // Self-identification
    /(?:for myself|helping myself|my own)/i,
  ]),
});

/**
 * Pre-compiled and frozen keyword sets for performance
 * Using Map for O(1) lookup instead of object property access
 */
const COMPILED_NEEDS_KEYWORDS = new Map(Object.entries(Object.freeze({
  HOUSING: Object.freeze(['housing', 'shelter', 'homeless', 'eviction', 'evicted', 'rent', 'apartment', 'room', 'place to stay', 'living situation', 'housing insecurity', 'couch surfing', 'transitional', 'nowhere to live', 'facing eviction']),
  FOOD: Object.freeze(['food', 'hungry', 'meal', 'eat', 'nutrition', 'pantry', 'food bank', 'groceries', 'food stamps', 'snap', 'feeding']),
  EMPLOYMENT: Object.freeze(['job', 'work', 'employment', 'unemployed', 'income', 'paycheck', 'career', 'hire', 'hiring', 'looking for work', 'need a job', 'laid off', 'fired', 'lost my job', 'get back to work']),
  JOBS: Object.freeze(['job', 'work', 'employment', 'unemployed', 'income', 'paycheck', 'career', 'hire', 'hiring', 'looking for work', 'need a job']),
  HEALTHCARE: Object.freeze(['medical', 'health', 'healthcare', 'doctor', 'hospital', 'medicine', 'medication', 'sick', 'illness', 'injury', 'treatment', 'clinic', 'dental', 'medications', 'prescription', 'prescriptions', 'ptsd', 'veteran', 'declining']),
  SAFETY: Object.freeze(['safe', 'safety', 'abuse', 'violence', 'domestic violence', 'assault', 'threatened', 'danger', 'protection']),
  EDUCATION: Object.freeze(['education', 'school', 'training', 'ged', 'diploma', 'college', 'university', 'learn', 'classes']),
  TRANSPORTATION: Object.freeze(['transportation', 'bus', 'car', 'vehicle', 'ride', 'transit', 'get around', 'commute']),
  CHILDCARE: Object.freeze(['childcare', 'daycare', 'children', 'kids', 'child', 'babysitter', 'care for children', 'need childcare', 'my kids']),
  LEGAL: Object.freeze(['legal', 'lawyer', 'attorney', 'court', 'case', 'charges', 'record', 'expungement']),
  MENTAL_HEALTH: Object.freeze(['mental health', 'depression', 'anxiety', 'ptsd', 'trauma', 'counseling', 'therapy', 'therapist']),
})));

/**
 * Optimized text normalization cache with size limit to prevent memory leaks
 */
const MAX_CACHE_SIZE = 1000;
const textNormalizationCache = new Map<string, { lower: string; original: string }>();

/**
 * Clear cache if it exceeds max size
 */
function maintainCacheSize() {
  if (textNormalizationCache.size > MAX_CACHE_SIZE) {
    // Remove oldest 20% of entries
    const keysToDelete = Array.from(textNormalizationCache.keys()).slice(0, Math.floor(MAX_CACHE_SIZE * 0.2));
    keysToDelete.forEach(key => textNormalizationCache.delete(key));
  }
}

/**
 * Get normalized text versions (cached for performance)
 */
function getNormalizedText(text: string): { lower: string; original: string } {
  maintainCacheSize();
  
  if (textNormalizationCache.has(text)) {
    return textNormalizationCache.get(text)!;
  }
  
  const normalized = {
    lower: text.toLowerCase().trim(),
    original: text.trim()
  };
  
  textNormalizationCache.set(text, normalized);
  return normalized;
}

export interface ExtractionPatterns {
  name: RegExp[];
  age: RegExp[];
  phone: RegExp[];
  email: RegExp[];
  location: RegExp[];
  goalAmount: RegExp[];
  urgency: RegExp[];
  relationship: RegExp[];
}

export const EXTRACTION_PATTERNS: ExtractionPatterns = {
  name: [
    // Title extraction: "My name is Dr. Sarah Thompson" - extract name after title
    /(?:my (?:full )?name(?:'s| is))\s+(?:Dr\.|Mr\.|Mrs\.|Ms\.|Rev\.|Prof\.|Captain|Major|Colonel)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,2})(?=\s+(?:MD|Jr|Sr|PhD|and|but|or|here)|,|\.|$|'s|;)/i,
    // "I'm Rev. Michael Johnson Jr." - title in I'm context
    /(?:i'm|i am)\s+(?:Dr\.|Mr\.|Mrs\.|Ms\.|Rev\.|Prof\.|Captain|Major|Colonel)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,2})(?=\s+(?:MD|Jr|Sr|PhD|and|but|or|here)|,|\.|$|'s|;)/i,
    // Legal/formal language with titles: "namely one Ms. Sarah Thompson", "to wit, Mr. John Doe"
    /(?:namely(?: one)?|to wit),?\s+(?:Ms\.|Mrs\.|Mr\.|Dr\.|Miss)?\s*([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){1,3})/i,
    // Legal/formal language: "Whereas the undersigned, Sarah Thompson" or "Party of the first part, John Doe"
    /(?:whereas the undersigned|party of the (?:first|second) part|hereinafter referred to as),?\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,3})/i,
    // "my name is John Smith" or "my full name is..." - stop at conjunctions and common words
    /(?:my (?:full )?name(?:'s| is))\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+(?!and\b|but\b|or\b|from\b|years?\b|dollars?\b|per\b|avenue\b|street\b|road\b|drive\b|way\b|lane\b|court\b|place\b|texas\b|california\b|florida\b|oregon\b|york\b|I\b|need\b|want\b|help\b)[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,2})(?=\s+(?:and|but|or|from|I|need|want|help)|,|\.|$|'s|;)/i,
    // Multilingual code-switching: "Me llamo María", "Je m'appelle Pierre"
    /(?:me llamo|je m'appelle|meu nome é|mi nombre es)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,3})/i,
    // "name is David Kim" (without "my")
    /^(?:name is)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+(?!speaking|here|and|but)[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,3})(?=\.|,|$|\s+and)/im,
    // "I'm Maria Garcia" - capture full name (up to 4 parts)
    /(?:i'm|i am)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+(?!speaking|here|and|but|or|from|years?)[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,3})(?=\s+(?:and|but|or|from)|,|\.|$|'s|;|\s+\d)/i,
    // "This is Dr. James Wilson" - include titles but extract name after title
    /(?:this is|here is)\s+(?:Dr\.|Mr\.|Mrs\.|Ms\.|Rev\.|Captain)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,2})(?=\s+(?:MD|Jr|Sr|PhD|and|but|or|here)|,|\.|$|'s|;)/i,
    // "Call me Robert Johnson"
    /(?:call me|you can call me)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+(?!speaking|here|and|but)[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,3})(?=\.|,|$|\s+and)/i,
    // "FirstName LastName speaking" (prefer multi-part names, must come before single-name pattern)
    /\b([A-ZÀ-ÿ][a-zÀ-ÿ'-]+\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,2})\s+(?:speaking|here)(?=\s*,|\s*\.|$)/i,
    // "Anderson speaking" or "Davis here" (single name, fallback)
    /(?<!\w)([A-ZÀ-ÿ][a-zÀ-ÿ'-]+)\s+(?:speaking|here)(?=\s*,|\s*\.|$)/i,
    // "It's Sarah Mitchell" - handle contractions
    /(?:it's|its)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+(?!speaking|here|and|but)[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,3})(?=\s+(?:and|but|or)|,|\.|$|'s|;)/i,
    // "My full name is Elizabeth Martinez Rodriguez" - multi-part names
    /(?:full name is)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+(?!speaking|here|and|but)[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){1,4})(?=\.|,|$)/i,
    // Single-word names (Indonesian, Icelandic matronymic, etc.): "I'm Suharto", "I'm Jón"
    /\b(?:I'm|I am|My name is|Call me)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]{2,})(?=\s*(?:\.|,|$|and|from|who|need))/i,
  ],
  age: [
    // "I'm 34 years old" or "I am 34 years old"
    /(?:i'm|i am)\s+(\d{1,3})\s+years?\s+old/i,
    // "age is 42"
    /age\s+is\s+(\d{1,3})/i,
    // "28-year-old veteran"
    /(\d{1,3})-year-old/i,
    // "years of age: 45"
    /(\d{1,3})\s+years?\s+of\s+age/i,
    // "Age 31" or "Age: 31"
    /age:?\s+(\d{1,3})/i,
    // "25 yrs old"
    /(\d{1,3})\s+yrs\.?\s+old/i,
    // "I am 29" (just number after "I am")
    /i\s+am\s+(\d{1,3})(?:\s|,|\.)/i,
    // "34 years old" (standalone)
    /(\d{1,3})\s+years?\s+old/i,
    // Comma-separated: ", 35,"
    /,\s*(\d{1,3})\s*,/,
    // Embedded in text: "homeless 27 years"
    /homeless\s+(?:for\s+)?(\d{1,3})\s+(?:years|yr)/i,
  ],
  phone: [
    /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    /\d{3}-\d{3}-\d{4}/,
    /\d{10}/,
  ],
  email: [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  ],
  location: [
    /(?:live in|living in|from|in) ([A-Z][a-z]+(?: [A-Z][a-z]+)*(?:, [A-Z]{2})?)/i,
    /([A-Z][a-z]+(?: [A-Z][a-z]+)*), ([A-Z]{2})\b/,
  ],
  goalAmount: [
    // Specialized formats first (highest priority)
    // Scientific notation: "5e3", "2.5E3"
    /\b([\d.]+)[eE]([\d]+)\b/i,
    // Engineering notation: "1.5 * 10^3"
    /([\d.]+)\s*[*×]\s*10\s*\^\s*([\d]+)/i,
    // Roman numerals: "V thousand", "III thousand"
    /\b([IVXLCDM]+)\s+thousand/i,
    // "only asking for" or "just asking for" (very specific context)
    /(?:only|just)\s+asking for\s+(?:\$)?([\d,]+)/i,
    // "I need fifteen hundred dollars" or "need $1500" - with modifiers like "at least"
    /(?:need|raise|goal of|asking for|looking for|require|at least|preferably|only asking for|just asking for)\s+(?:\$|dollars?\s+)?([\d,]+)\s*(?:dollars?)?/i,
    // "$5,000" or "5000 dollars" standalone
    /\$([\d,]+)(?!\s*per|\s*an?\s+(?:hour|day|week|month|year))/i,
    /([\d,]+)\s+dollars?(?!\s*per|\s*an?\s+(?:hour|day|week|month|year))/i,
    // "fifteen hundred" or "five thousand" (written numbers)
    /(?:need|raise|goal of|at least)\s+((?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|and)(?:[-\s]+(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|and))*)/i,
    // "goal is $2500" or "target is 3000"
    /(?:goal|target|amount)\s+(?:is|of)\s+(?:\$)?([\d,]+)/i,
    // "between $1000 and $5000"
    /between\s+\$([\d,]+)\s+and\s+\$([\d,]+)/i,
    // "around $3000" or "about 2500" or "somewhere around"
    /(?:around|about|approximately|somewhere around)\s+(?:\$)?([\d,]+)/i,
    // "no more than $10000"
    /(?:no more than|up to|maximum of)\s+(?:\$)?([\d,]+)/i,
  ],
  urgency: [
    // High urgency indicators
    /(?:urgent|emergency|crisis|critical|immediate|asap|desperate|help)/i,
    // Medium urgency indicators 
    /(?:soon|needed|important|pressing|struggling)/i,
    // Temporal urgency
    /(?:today|tomorrow|this week|by [A-Z][a-z]+)/i,
  ],
  relationship: [
    // Family relationships (non-PII)
    /(?:for my|helping my)\s+(son|daughter|child|children|kids?|mom|mother|dad|father|parent|family)/i,
    /(?:my|our)\s+(son|daughter|child|children|kids?)\s+(?:needs?|requires?)/i,
    // Self-identification
    /(?:for myself|helping myself|my own)/i,
  ],
};

export interface NeedsKeywords {
  [key: string]: string[];
}

export const NEEDS_KEYWORDS: NeedsKeywords = {
  HOUSING: ['housing', 'shelter', 'homeless', 'eviction', 'evicted', 'rent', 'apartment', 'room', 'place to stay', 'living situation', 'housing insecurity', 'couch surfing', 'transitional', 'nowhere to live', 'facing eviction'],
  FOOD: ['food', 'hungry', 'meal', 'eat', 'nutrition', 'pantry', 'food bank', 'groceries', 'food stamps', 'snap', 'feeding'],
  EMPLOYMENT: ['job', 'work', 'employment', 'unemployed', 'income', 'paycheck', 'career', 'hire', 'hiring', 'looking for work', 'need a job', 'laid off', 'fired', 'lost my job', 'get back to work'],
  JOBS: ['job', 'work', 'employment', 'unemployed', 'income', 'paycheck', 'career', 'hire', 'hiring', 'looking for work', 'need a job'],
  HEALTHCARE: ['medical', 'health', 'healthcare', 'doctor', 'hospital', 'medicine', 'medication', 'sick', 'illness', 'injury', 'treatment', 'clinic', 'dental', 'medications', 'prescription', 'prescriptions', 'ptsd', 'veteran', 'declining'],
  SAFETY: ['safe', 'safety', 'abuse', 'violence', 'domestic violence', 'assault', 'threatened', 'danger', 'protection'],
  EDUCATION: ['education', 'school', 'training', 'ged', 'diploma', 'college', 'university', 'learn', 'classes'],
  TRANSPORTATION: ['transportation', 'bus', 'car', 'vehicle', 'ride', 'transit', 'get around', 'commute'],
  CHILDCARE: ['childcare', 'daycare', 'children', 'kids', 'child', 'babysitter', 'care for children', 'need childcare', 'my kids'],
  LEGAL: ['legal', 'lawyer', 'attorney', 'court', 'case', 'charges', 'record', 'expungement'],
  MENTAL_HEALTH: ['mental health', 'depression', 'anxiety', 'ptsd', 'trauma', 'counseling', 'therapy', 'therapist'],
};

export interface SkillsKeywords {
  [key: string]: string[];
}

export const SKILLS_KEYWORDS: SkillsKeywords = {
  Construction: ['construction', 'carpenter', 'carpentry', 'plumber', 'electrician', 'hvac', 'contractor', 'builder'],
  Healthcare: ['nurse', 'nursing', 'cna', 'caregiver', 'medical assistant', 'phlebotomy'],
  Retail: ['retail', 'sales', 'cashier', 'customer service', 'merchandising'],
  Food_Service: ['restaurant', 'cook', 'chef', 'server', 'waiter', 'waitress', 'barista', 'food service'],
  Technology: ['computer', 'it', 'programming', 'coding', 'software', 'tech support', 'web design'],
  Transportation: ['driver', 'cdl', 'truck driver', 'delivery', 'uber', 'lyft', 'forklift'],
  Cleaning: ['cleaning', 'janitor', 'custodian', 'housekeeping', 'maintenance'],
  Administrative: ['administrative', 'office', 'clerical', 'data entry', 'receptionist', 'secretary'],
};

/**
 * Enhanced name extraction with false positive filtering
 */
export function extractName(transcript: string): string | undefined {
  const normalized = getNormalizedText(transcript);
  
  for (const pattern of COMPILED_EXTRACTION_PATTERNS.name) {
    const match = normalized.original.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      const validation = validateNameCandidate(candidate, transcript, match.index || 0);
      
      if (validation.isValid) {
        // Strip common titles
        const strippedName = stripTitles(candidate);
        return strippedName;
      }
    }
  }
  
  return undefined;
}

/**
 * Strip common titles from names
 */
function stripTitles(name: string): string {
  const titlePatterns = [
    /^\s*(?:Dr\.?|Doctor|Mr\.?|Mrs\.?|Ms\.?|Miss|Prof\.?|Professor|Rev\.?|Reverend|Sir|Madam|Mx\.?)\s+/i,
    /\s+(?:Dr\.?|Doctor|Mr\.?|Mrs\.?|Ms\.?|Miss|Prof\.?|Professor|Rev\.?|Reverend|Sir|Madam|Mx\.?)\s*$/i
  ];
  
  let stripped = name;
  for (const pattern of titlePatterns) {
    stripped = stripped.replace(pattern, '');
  }
  
  return stripped.trim();
}

/**
 * Enhanced name extraction with confidence scoring and failsafe error handling
 * Phase 3: Never fail the revenue pipeline - always return valid structure
 */
export function extractNameWithConfidence(transcript: string): { value: string | null; confidence: number } {
  try {
    // Input validation
    if (!transcript || typeof transcript !== 'string') {
      return { value: null, confidence: 0 };
    }
    
    // Performance optimization: limit processing for extremely long transcripts
    if (transcript.length > 10000) {
      // Only search first 5K characters for names (most names appear early)
      transcript = transcript.substring(0, 5000);
    }

    // Pre-process chaotic speech - remove excessive filler words and artifacts
    let preprocessed = transcript;
    
    // Detect highly chaotic speech (excessive fillers, artifacts, or ALL CAPS)
    const hasExcessiveFillers = /(?:uh|um|like|you know){5,}/i.test(transcript);
    const hasArtifacts = /[\*\[]{2,}|crying|sobbing|shouting|screaming|wailing|hiccup/i.test(transcript);
    const isAllCaps = /[A-Z]{10,}/.test(transcript) && !/[a-z]{5,}/.test(transcript);
    const isDrunkSpeech = /\b(?:I'mmmm|wasss|sooo|likeee|ummmm|neeeeed|ish|sssomething|shtuff)\b/i.test(transcript);
    
    if (hasExcessiveFillers || hasArtifacts || isAllCaps || isDrunkSpeech) {
      // Highly chaotic - aggressive cleanup
      preprocessed = transcript
        // Remove emotional artifacts (be more aggressive)
        .replace(/\*+[^*]*?\*+/g, ' ')  // *crying* *sobbing* *screaming*
        .replace(/\[[^\]]*?\]/g, ' ')   // [shouting] [distressed] [Speaker 1]
        .replace(/\{[^}]*?\}/g, ' ')    // {emergency}
        .replace(/\([^)]{0,15}\)/g, ' ')  // Remove short parentheticals like (hiccup)
        // Remove excessive filler words
        .replace(/\b(?:uh+|um+|er+|ah+|hmm+|heyyy+)\s*/gi, '')
        .replace(/\b(?:like|you know|I mean|basically|literally)\s+/gi, ' ')
        // Handle drunk speech patterns (repeated letters) - more aggressive
        .replace(/([a-z])\1{2,}/gi, '$1')  // "wasssss" -> "was", "sooo" -> "so", "neeeeed" -> "need"
        .replace(/\bish\b/gi, 'is')  // "ish" -> "is"
        .replace(/\.{2,}/g, ' ')  // Remove ellipsis "..." 
        // Remove repeated words (stutter): "ish... ish... Sarah" -> "ish Sarah"
        .replace(/\b(\w+)(?:\s*\.{2,}\s*\1)+/gi, '$1')
        // Normalize ALL CAPS to title case for better name extraction
        .replace(/\b([A-Z]{2,})\b/g, (match) => {
          if (match.length <= 3) return match; // Keep acronyms like "USA"
          return match.charAt(0) + match.slice(1).toLowerCase();
        })
        // Collapse multiple spaces
        .replace(/\s{2,}/g, ' ')
        .trim();
    }
    
    maintainCacheSize();

    const normalized = getNormalizedText(preprocessed);
    
    // Collect all potential matches with their confidence scores
    const candidates: Array<{value: string; confidence: number}> = [];
    
    for (let i = 0; i < COMPILED_EXTRACTION_PATTERNS.name.length; i++) {
      const pattern = COMPILED_EXTRACTION_PATTERNS.name[i];
      const match = preprocessed.match(pattern);
      if (match && match[1]) {
        const candidate = match[1].trim();
        const validation = validateNameCandidate(candidate, preprocessed, match.index || 0);
        
        if (validation.isValid) {
          let patternBonus = 0;
          
          // Pattern-specific confidence bonuses (higher index = more specific = higher bonus)
          if (i <= 1) {
            // Title extraction patterns (patterns 0-1) get highest bonus
            patternBonus = 0.3;
          } else if (i <= 3) {
            // Legal/formal patterns (patterns 2-3) get high bonus
            patternBonus = 0.25;
          } else if (i <= 6) {
            // Specific phrases (patterns 4-6) get medium bonus
            patternBonus = 0.1;
          }
          // Generic patterns (later ones) get no bonus
          
          candidates.push({
            value: candidate,
            confidence: Math.min(1.0, validation.confidence + patternBonus)
          });
        }
      }
    }
    
    // Return the candidate with highest confidence
    if (candidates.length > 0) {
      const bestMatch = candidates.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      return bestMatch;
    }
    
    return { value: null, confidence: 0 };
  } catch (error) {
    // Phase 3: Never fail the revenue pipeline - always return valid structure
    console.error('[EXTRACTION_ERROR] Name extraction failed:', {
      error: error.message,
      stackTrace: error.stack?.slice(0, 200),
      transcriptLength: transcript?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    // Failsafe fallback: Extract any capitalized word as potential name
    try {
      const fallbackMatch = transcript.match(/\b[A-Z][a-z]+\b/);
      if (fallbackMatch) {
        return {
          value: fallbackMatch[0],
          confidence: 0.1 // Very low confidence for failsafe extraction
        };
      }
    } catch (fallbackError) {
      console.error('[CRITICAL_FAILSAFE] Even fallback name extraction failed:', fallbackError.message);
    }
    
    return { value: null, confidence: 0 };
  }
}

/**
 * Validate name candidate against false positive patterns
 */
function validateNameCandidate(candidate: string, fullTranscript: string, matchIndex: number): {
  isValid: boolean;
  confidence: number;
} {
  // Check against reject patterns
  for (const pattern of NAME_REJECT_PATTERNS) {
    if (pattern.test(candidate)) {
      return { isValid: false, confidence: 0 };
    }
  }
  
  // Check context around the match
  const contextStart = Math.max(0, matchIndex - 50);
  const contextEnd = Math.min(fullTranscript.length, matchIndex + candidate.length + 50);
  const context = fullTranscript.slice(contextStart, contextEnd);
  
  for (const pattern of NAME_CONTEXT_REJECT) {
    if (pattern.test(context)) {
      return { isValid: false, confidence: 0 };
    }
  }
  
  // Check for contradictions/corrections that should lower confidence
  const hasContradiction = /\b(?:but|actually|I mean|wait no|not really|well technically)\b/i.test(context);
  
  // Calculate confidence based on name quality
  let confidence = 0.7; // Base confidence for pattern match
  
  // Boost for multi-token names (first + last)
  const tokens = candidate.split(/\s+/);
  if (tokens.length >= 2 && tokens.length <= 4) {
    confidence += 0.25; // Increased from 0.2
  }
  
  // Boost for proper capitalization
  const properCase = tokens.every(token => 
    token.length > 0 && 
    token[0].toUpperCase() === token[0] &&
    token.slice(1).toLowerCase() === token.slice(1)
  );
  if (properCase) {
    confidence += 0.15; // Increased from 0.1
  }
  
  // Penalize contradictions
  if (hasContradiction) {
    confidence -= 0.3;
  }
  
  // Penalize very short or very long names
  if (candidate.length < 3 || candidate.length > 50) {
    confidence -= 0.3;
  }

  // Reject urgency-sounding words as names
  const urgencyWords = /^(Critical|Emergency|Urgent|Desperate|Crisis|Help|Alarm|Alert|Houston|Dallas|Portland)$/i;
  if (urgencyWords.test(candidate.trim())) {
    return {
      isValid: false,
      confidence: 0
    };
  }

  // Reject common location/city names that might be mistaken as names
  const locationWords = /^(Avenue|Street|Texas|Oregon|California|Florida|York|Angeles)$/i;
  if (locationWords.test(candidate.trim())) {
    return {
      isValid: false,
      confidence: 0
    };
  }

  return {
    isValid: true,
    confidence: Math.max(0, Math.min(1, confidence))
  };
}

/**
 * Jan v4.0: Enhanced goal amount extraction using multi-pass amount engine
 * Addresses the SECONDARY performance blocker (50% → 80%+ target accuracy)
 */
export function extractGoalAmount(transcript: string): number | null {
  const result = extractGoalAmountWithConfidence(transcript);
  return result.value;
}

/**
 * Jan v4.0: Enhanced goal amount extraction with full detection details
 * Provides comprehensive amount detection with context validation and ambiguity rejection
 */
export function extractGoalAmountWithConfidence(transcript: string, context?: {
  category?: string;
  urgency?: string;
}): { value: number | null; confidence: number } {
  try {
    // Input validation
    if (!transcript || typeof transcript !== 'string') {
      return { value: null, confidence: 0 };
    }
    
    // Use the new Jan v4.0 amount detection engine
    const amountEngine = new AmountDetectionEngine();
    const detection = amountEngine.detectGoalAmount(transcript, context);
    
    return {
      value: detection.goalAmount,
      confidence: detection.confidence
    };
    
  } catch (error) {
    console.error('[EXTRACTION_ERROR] Amount extraction failed:', {
      error: error.message,
      transcriptLength: transcript?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    return { value: null, confidence: 0 };
  }
}

/**
 * Jan v4.0: Full amount detection with detailed results
 * Provides complete detection information for evaluation/debugging
 */
export function extractGoalAmountWithDetection(transcript: string, context?: {
  category?: string;
  urgency?: string;
}): {
  goalAmount: number | null;
  confidence: number;
  source: 'explicit' | 'contextual' | 'vague' | 'inferred' | 'none';
  reasons: string[];
  candidates: any[];
} {
  try {
    if (!transcript || typeof transcript !== 'string') {
      return {
        goalAmount: null,
        confidence: 0.0,
        source: 'none',
        reasons: ['invalid_input'],
        candidates: []
      };
    }

    const amountEngine = new AmountDetectionEngine();
    const detection = amountEngine.detectGoalAmount(transcript, context);
    
    return detection;
    
  } catch (error) {
    console.error('[EXTRACTION_ERROR] Detailed amount extraction failed:', {
      error: error.message,
      transcriptLength: transcript?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    return {
      goalAmount: null,
      confidence: 0.0,
      source: 'none',
      reasons: ['extraction_failed'],
      candidates: []
    };
  }
}

/**
 * Validate amount context to prevent false positives
 */
function validateAmountContext(transcript: string, matchIndex: number, amountStr: string): {
  isValid: boolean;
  confidence: number;
} {
  // Get context around the match
  const contextStart = Math.max(0, matchIndex - 100);
  const contextEnd = Math.min(transcript.length, matchIndex + amountStr.length + 100);
  const context = transcript.slice(contextStart, contextEnd).toLowerCase();
  
  // Check for negation/sarcasm markers that should lower confidence
  const hasNegation = /\b(?:don't|dont|not|never|unlike|oh sure|totally don't)\b/i.test(context);
  
  // Look for need verbs in context
  const hasNeedVerb = AMOUNT_NEED_VERBS.some(verb => context.includes(verb));
  
  // Look for currency indicators
  const hasCurrencyContext = /\$|dollars?|money|cost|amount|fund/.test(context);
  
  // Strong confidence: has need verb + currency context, no negation
  if (hasNeedVerb && hasCurrencyContext && !hasNegation) {
    return { isValid: true, confidence: 0.95 };
  }
  
  // Penalize for negation/sarcasm
  if (hasNegation) {
    return { isValid: true, confidence: 0.4 };
  }
  
  // Medium confidence: has need verb OR strong currency context
  if (hasNeedVerb || context.includes('goal') || context.includes('raise')) {
    return { isValid: true, confidence: 0.7 };
  }
  
  // Weak confidence: currency context only
  if (hasCurrencyContext) {
    return { isValid: true, confidence: 0.5 };
  }
  
  // No valid context found
  return { isValid: false, confidence: 0 };
}

/**
 * Bound amount to reasonable range
 */
function boundAmount(amount: number): number {
  return Math.max(50, Math.min(100000, amount));
}

/**
 * Extract beneficiary relationship (non-PII) with failsafe error handling
 * Phase 3: Never fail the revenue pipeline - always return valid structure
 */
export function extractBeneficiaryRelationship(transcript: string): 'myself' | 'family_member' | 'other' {
  try {
    // Input validation
    if (!transcript || typeof transcript !== 'string') {
      return 'myself'; // Safe default
    }

    const text = transcript.toLowerCase();
    
    // Check for third-party fundraising
    if (/\b(?:raising (?:money |funds )?for|campaign (?:is )?for|helping (?:out )?(?:my |a )?(?:friend|neighbor|community|coworker)|for (?:my |a )?(?:friend|neighbor))\b/i.test(transcript)) {
      return 'other';
    }
    
    // Check for pets/animals
    if (/\b(?:my |our )?(?:dog|cat|pet|animal)\b/i.test(transcript)) {
      return 'other';
    }
    
    // Check for family member patterns including wife/husband
    if (/\b(?:my |our )?(?:wife|husband|spouse|partner|son|daughter|child|children|kids?|mom|mother|dad|father|parent|family|brother|sister|sibling)\b/i.test(transcript)) {
      return 'family_member';
    }
    
    const patterns = EXTRACTION_PATTERNS.relationship;
    
    for (const pattern of patterns) {
      const match = transcript.match(pattern);
      if (match) {
        const relationshipType = match[1]?.toLowerCase();
        
        if (relationshipType && ['son', 'daughter', 'child', 'children', 'kids', 'kid', 'mom', 'mother', 'dad', 'father', 'parent', 'family'].includes(relationshipType)) {
          return 'family_member';
        }
        
        if (match[0].toLowerCase().includes('myself') || match[0].toLowerCase().includes('my own')) {
          return 'myself';
        }
      }
    }
    
    return 'myself'; // Default assumption
  } catch (error) {
    console.error('[EXTRACTION_ERROR] Relationship extraction failed:', {
      error: error.message,
      transcriptLength: transcript?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    return 'myself'; // Safest default when extraction fails
  }
}

/**
 * Parse roman numerals to numbers
 */
function parseRomanNumeral(roman: string): number | null {
  const romanMap: { [key: string]: number } = {
    'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000
  };
  
  let result = 0;
  const normalized = roman.toUpperCase();
  
  for (let i = 0; i < normalized.length; i++) {
    const current = romanMap[normalized[i]];
    const next = romanMap[normalized[i + 1]];
    
    if (!current) return null; // Invalid roman numeral
    
    if (next && current < next) {
      result -= current;
    } else {
      result += current;
    }
  }
  
  return result;
}

/**
 * Parse written numbers to numeric amounts
 */
function parseWrittenNumber(text: string): number | null {
  const numberWords: { [key: string]: number } = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
    'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
    'eighty': 80, 'ninety': 90, 'hundred': 100, 'thousand': 1000
  };
  
  const words = text.toLowerCase().replace(/-/g, ' ').replace(/\band\b/g, '').split(/\s+/);
  let total = 0;
  let current = 0;
  let lastMultiplier = 1;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (numberWords[word]) {
      const value = numberWords[word];
      if (word === 'hundred') {
        current = current === 0 ? 100 : current * 100;
        lastMultiplier = 100;
      } else if (word === 'thousand') {
        if (current === 0) current = 1;
        total += current * 1000;
        current = 0;
        lastMultiplier = 1000;
      } else if (value >= 20 && value < 100) {
        // This is a tens number (twenty, thirty, forty, etc.)
        // Check if next word is a single digit to make compound numbers
        const nextWord = words[i + 1];
        if (nextWord && numberWords[nextWord] && numberWords[nextWord] < 10 && numberWords[nextWord] > 0) {
          current += value + numberWords[nextWord];
          i++; // Skip next word as we've already processed it
        } else {
          current += value;
        }
      } else {
        current += value;
      }
    }
  }
  
  total += current;
  return total > 0 ? total : null;
}

/**
 * Parse numeric amount strings with comma handling
 */
function parseNumericAmount(text: string): number | null {
  const cleanText = text.replace(/[,$]/g, '');
  const parsed = parseInt(cleanText, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Jan v4.0: Enhanced urgency extraction using multi-layer urgency engine
 * Addresses the PRIMARY performance blocker (50% → 80%+ target accuracy)
 */
export function extractUrgency(transcript: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  try {
    // Input validation
    if (!transcript || typeof transcript !== 'string') {
      return 'LOW'; // Safe default
    }

    // Use the new Jan v4.0 urgency assessment engine
    const urgencyEngine = new UrgencyAssessmentEngine();
    const assessment = urgencyEngine.assessUrgency(transcript);
    
    return assessment.urgencyLevel;
    
  } catch (error) {
    console.error('[EXTRACTION_ERROR] Urgency extraction failed:', {
      error: error.message,
      transcriptLength: transcript?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    return 'LOW'; // Safest default when extraction fails
  }
}

/**
 * Jan v4.0: Enhanced urgency extraction with full assessment details
 * Provides detailed reasoning and confidence scoring for evaluation/debugging
 */
export function extractUrgencyWithAssessment(transcript: string, context?: {
  category?: string;
  amount?: number;
}): {
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  confidence: number;
  reasons: string[];
  layerScores: any;
} {
  try {
    if (!transcript || typeof transcript !== 'string') {
      return {
        urgencyLevel: 'LOW',
        score: 0.0,
        confidence: 0.0,
        reasons: ['invalid_input'],
        layerScores: {}
      };
    }

    const urgencyEngine = new UrgencyAssessmentEngine();
    const assessment = urgencyEngine.assessUrgency(transcript, context);
    
    return {
      urgencyLevel: assessment.urgencyLevel,
      score: assessment.score,
      confidence: assessment.confidence,
      reasons: assessment.reasons,
      layerScores: assessment.layerScores
    };
    
  } catch (error) {
    console.error('[EXTRACTION_ERROR] Detailed urgency extraction failed:', {
      error: error.message,
      transcriptLength: transcript?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    return {
      urgencyLevel: 'LOW',
      score: 0.0,
      confidence: 0.0,
      reasons: ['extraction_failed'],
      layerScores: {}
    };
  }
}

/**
 * Generate sensible default goal amount based on category and urgency
 */
export function generateDefaultGoalAmount(category: string, urgency: string, transcript: string): number {
  const baseAmounts: { [key: string]: number } = {
    'HOUSING': 3000,
    'MEDICAL': 5000, 
    'EMERGENCY': 2500,
    'FOOD': 500,
    'EMPLOYMENT': 1000,
    'EDUCATION': 2000,
    'TRANSPORTATION': 1500,
    'CHILDCARE': 1200,
    'LEGAL': 3500,
    'BUSINESS': 5000
  };
  
  let baseAmount = baseAmounts[category] || 1500;
  
  // Adjust based on urgency
  const urgencyMultipliers: { [key: string]: number } = {
    'CRITICAL': 1.5,
    'HIGH': 1.2,
    'MEDIUM': 1.0,
    'LOW': 0.8
  };
  
  const multiplier = urgencyMultipliers[urgency] || 1.0;
  
  // Look for contextual clues in transcript
  const contextualAdjustments: Array<[RegExp, number]> = [
    [/children|kids|family of \d+/i, 1.3],
    [/medical bills?|hospital|surgery/i, 1.5],
    [/rent|mortgage|eviction/i, 1.4],
    [/student|college|education/i, 0.9],
    [/vehicle|car|transportation/i, 0.8],
    [/business|equipment|inventory/i, 2.0]
  ];
  
  let contextMultiplier = 1.0;
  for (const [pattern, adjustment] of contextualAdjustments) {
    if (pattern.test(transcript)) {
      contextMultiplier *= adjustment;
      break; // Apply first match only
    }
  }
  
  const finalAmount = Math.round(baseAmount * multiplier * contextMultiplier);
  
  // Round to nearest $50 and cap at reasonable limits
  const rounded = Math.round(finalAmount / 50) * 50;
  return Math.max(300, Math.min(50000, rounded));
}

/**
 * Validate and provide fallbacks for missing GoFundMe data
 */
export interface GoFundMeDataValidation {
  isComplete: boolean;
  missingFields: string[];
  suggestions: { [field: string]: any };
  confidence: number;
}

export function validateGoFundMeData(
  title?: string,
  story?: string, 
  goalAmount?: number,
  category?: string,
  beneficiary?: string,
  transcript?: string
): GoFundMeDataValidation {
  const missing: string[] = [];
  const suggestions: { [field: string]: any } = {};
  let confidence = 1.0;
  
  // Validate title
  if (!title || title.length < 10) {
    missing.push('title');
    if (beneficiary && category) {
      suggestions.title = `Help ${beneficiary} with ${category.toLowerCase()} crisis`;
    } else if (category) {
      suggestions.title = `Emergency ${category.toLowerCase()} support needed`;
    } else {
      suggestions.title = 'Emergency assistance needed';
    }
    confidence -= 0.15;
  }
  
  // Validate story
  if (!story || story.length < 50) {
    missing.push('story');
    if (transcript && transcript.length > 20) {
      suggestions.story = transcript.substring(0, 300) + (transcript.length > 300 ? '...' : '');
    } else {
      suggestions.story = 'Individual facing financial hardship and in need of community support.';
    }
    confidence -= 0.2;
  }
  
  // Validate goal amount
  if (!goalAmount || goalAmount <= 0) {
    missing.push('goalAmount');
    if (transcript) {
      const extractedAmount = extractGoalAmount(transcript);
      if (extractedAmount) {
        suggestions.goalAmount = extractedAmount;
      } else {
        const inferredCategory = category || 'GENERAL';
        const inferredUrgency = transcript ? extractUrgency(transcript) : 'MEDIUM';
        suggestions.goalAmount = generateDefaultGoalAmount(inferredCategory, inferredUrgency, transcript || '');
      }
    } else {
      suggestions.goalAmount = 2500; // Safe default
    }
    confidence -= 0.25;
  } else if (goalAmount < 50 || goalAmount > 100000) {
    suggestions.goalAmount = Math.max(50, Math.min(100000, goalAmount));
    confidence -= 0.1;
  }
  
  // Validate category
  if (!category) {
    missing.push('category');
    if (transcript) {
      const needs = extractNeeds(transcript, 1);
      suggestions.category = needs.length > 0 ? needs[0].toUpperCase() : 'GENERAL';
    } else {
      suggestions.category = 'GENERAL';
    }
    confidence -= 0.1;
  }
  
  // Validate beneficiary
  if (!beneficiary) {
    missing.push('beneficiary');
    if (transcript) {
      const extractedName = extractName(transcript);
      suggestions.beneficiary = extractedName || 'Individual in need';
    } else {
      suggestions.beneficiary = 'Individual in need';
    }
    confidence -= 0.1;
  }
  
  return {
    isComplete: missing.length === 0,
    missingFields: missing,
    suggestions,
    confidence: Math.max(0, confidence)
  };
}

/**
 * Extract age from transcript
 */
export function extractAge(transcript: string): number | undefined {
  for (const pattern of EXTRACTION_PATTERNS.age) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      const age = parseInt(match[1], 10);
      // Validate reasonable age range (18-120)
      if (age >= 18 && age <= 120) {
        return age;
      }
    }
  }
  
  return undefined;
}

/**
 * Extract phone number from transcript
 */
export function extractPhone(transcript: string): string | undefined {
  for (const pattern of EXTRACTION_PATTERNS.phone) {
    const match = transcript.match(pattern);
    if (match && match[0]) {
      // Normalize format
      const digits = match[0].replace(/\D/g, '');
      if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
    }
  }
  
  return undefined;
}

/**
 * Extract email from transcript
 */
export function extractEmail(transcript: string): string | undefined {
  for (const pattern of EXTRACTION_PATTERNS.email) {
    const match = transcript.match(pattern);
    if (match && match[0]) {
      return match[0].toLowerCase();
    }
  }
  
  return undefined;
}

/**
 * Extract location from transcript
 */
export function extractLocation(transcript: string): string | undefined {
  for (const pattern of EXTRACTION_PATTERNS.location) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

/**
 * Score transcript against keyword list
 */
export function scoreKeywords(transcript: string, keywords: string[]): number {
  const text = transcript.toLowerCase();
  let score = 0;
  
  for (const keyword of keywords) {
    // Count occurrences of keyword
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      score += matches.length;
    }
  }
  
  return score;
}

/**
 * Extract urgent needs from transcript using keyword scoring
 */
export function extractNeeds(transcript: string, topN: number = 3): string[] {
  const scores: Array<{ need: string; score: number }> = [];
  
  for (const [need, keywords] of Object.entries(NEEDS_KEYWORDS)) {
    const score = scoreKeywords(transcript, keywords);
    if (score > 0) {
      scores.push({ need, score });
    }
  }
  
  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  
  // Return top N needs
  return scores.slice(0, topN).map(s => s.need);
}

/**
 * Extract skills from transcript using keyword matching
 */
export function extractSkills(transcript: string, topN: number = 5): string[] {
  const scores: Array<{ skill: string; score: number }> = [];
  
  for (const [skill, keywords] of Object.entries(SKILLS_KEYWORDS)) {
    const score = scoreKeywords(transcript, keywords);
    if (score > 0) {
      scores.push({ skill, score });
    }
  }
  
  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  
  // Return top N skills
  return scores.slice(0, topN).map(s => s.skill);
}

/**
 * Calculate confidence score based on extracted fields
 */
export function calculateConfidence(
  name?: string,
  age?: number,
  needs?: string[],
  phone?: string,
  email?: string
): number {
  let confidence = 0;
  
  if (name) confidence += 25;
  if (age) confidence += 15;
  if (needs && needs.length > 0) confidence += 30;
  if (phone) confidence += 15;
  if (email) confidence += 15;
  
  return Math.min(confidence, 95); // Cap at 95% (never 100% for rules-based)
}

/**
 * Generate template-based summary
 */
export function generateTemplateSummary(
  name: string | undefined,
  needs: string[],
  transcriptLength: number
): string {
  const nameStr = name || 'A community member';
  const needsStr = needs.length > 0 
    ? needs.map(n => n.replace('_', ' ').toLowerCase()).join(', ')
    : 'general support';
  
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return `${nameStr} is seeking support related to: ${needsStr}. They shared their story on ${date}. Further details can be added below.`;
}

/**
 * Phase 5: Comprehensive extraction with telemetry collection
 * Extracts all fields and records metrics for monitoring
 */
export function extractAllWithTelemetry(transcript: string): {
  results: {
    name: { value: string | null; confidence: number };
    amount: { value: number | null; confidence: number };
    relationship: 'myself' | 'family_member' | 'other';
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    age?: number;
    phone?: string;
    email?: string;
    location?: string;
  };
  metrics: {
    sessionId: string;
    extractionDuration: number;
    qualityScore: number;
    fallbacksUsed: string[];
    hasFillerWords?: boolean;
    hasUncertainty?: boolean;
  };
} {
  const startTime = Date.now();
  const sessionId = `extraction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const fallbacksUsed: string[] = [];
  let errorCount = 0;

  try {
    // Extract all fields
    const nameResult = extractNameWithConfidence(transcript);
    const amountResult = extractGoalAmountWithConfidence(transcript);
    const relationship = extractBeneficiaryRelationship(transcript);
    const urgency = extractUrgency(transcript);
    
    // Optional fields
    const age = extractAge(transcript);
    const phone = extractPhone(transcript);
    const email = extractEmail(transcript);
    const location = extractLocation(transcript);

    // Track fallback usage
    if (nameResult.confidence <= 0.1) fallbacksUsed.push('name_fallback');
    if (amountResult.confidence <= 0.1) fallbacksUsed.push('amount_fallback');
    
    // Calculate quality score
    const extractedFields = {
      name: { extracted: nameResult.value !== null, confidence: nameResult.confidence },
      amount: { extracted: amountResult.value !== null, confidence: amountResult.confidence },
      relationship: { extracted: true, value: relationship },
      urgency: { extracted: true, value: urgency }
    };

    const qualityScore = calculateQualityScore(extractedFields);
    const extractionDuration = Date.now() - startTime;

    // Record telemetry
    TelemetryCollector.getInstance().recordParsingMetrics(sessionId, {
      extractionDuration,
      transcriptLength: transcript.length,
      extractedFields,
      fallbacksUsed,
      errorCount,
      qualityScore
    });

    // Calculate data quality indicators
    const hasFillerWords = /\b(?:uh|um|like|you know|basically|literally|actually|kinda|sorta|i mean)\b/i.test(transcript);
    const hasUncertainty = /\b(?:maybe|perhaps|possibly|probably|i think|i guess|not sure|unsure)\b/i.test(transcript);
    
    return {
      results: {
        name: nameResult,
        amount: amountResult,
        relationship,
        urgency,
        age,
        phone,
        email,
        location
      },
      metrics: {
        sessionId,
        extractionDuration,
        qualityScore,
        fallbacksUsed,
        hasFillerWords,
        hasUncertainty
      }
    };

  } catch (error) {
    errorCount++;
    const extractionDuration = Date.now() - startTime;
    
    // Record failed extraction metrics
    TelemetryCollector.getInstance().recordParsingMetrics(sessionId, {
      extractionDuration,
      transcriptLength: transcript?.length || 0,
      extractedFields: {
        name: { extracted: false, confidence: 0 },
        amount: { extracted: false, confidence: 0 },
        relationship: { extracted: false, value: 'myself' },
        urgency: { extracted: false, value: 'LOW' }
      },
      fallbacksUsed: ['complete_failure'],
      errorCount,
      qualityScore: 0
    });

    throw error;
  }
}

