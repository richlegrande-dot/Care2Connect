/**
 * TranscriptSignalExtractor
 * 
 * Deterministic signal extraction from AssemblyAI transcripts.
 * Zero AI/ML - purely rules-based keyword matching and pattern detection.
 * 
 * Features:
 * - Name extraction from common patterns
 * - Contact info detection (email, phone)
 * - Location hints (city, state, country)
 * - Needs categorization with confidence scoring
 * - Goal amount extraction with fallbacks
 * - Urgency scoring (0.0-1.0)
 * - Key points extraction
 * - Missing field detection with suggestions
 */

import { 
  extractGoalAmount,
  extractUrgency as extractUrgencyLevel,
  validateGoFundMeData,
  generateDefaultGoalAmount,
  extractName as extractNameLegacy
} from '../../utils/extraction/rulesEngine';
import { UrgencyAssessmentEngine } from '../../utils/extraction/urgencyEngine';
import { EnhancedUrgencyEngine } from './enhancedUrgencyEngine';
import { EnhancedCategoryEngine } from './enhancedCategoryEngine';
import { AmountDetectionEngine } from '../../utils/extraction/amountEngine';
import { MultiFieldCoordinationEngine } from '../../utils/extraction/coordinationEngine';
import { FragmentProcessor } from '../../utils/extraction/fragmentProcessor';

export interface ExtractedSignals {
  nameCandidate: string | null;
  storyCategory: string; // Normalized category for evaluation
  contactCandidates: {
    emails: string[];
    phones: string[];
  };
  locationCandidates: string[];
  needsCategories: NeedCategory[];
  urgencyScore: number; // 0.0-1.0
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  goalAmount: number | null;
  goalAmountConfidence: number;
  keyPoints: string[]; // Top 5-10 sentences
  missingFields: string[];
  dataValidation: {
    isComplete: boolean;
    suggestions: { [field: string]: any };
    confidence: number;
  };
  beneficiaryRelationship?: string;
  extractionMethod: {
    name: string;
    category: string;
    urgency: string;
    goalAmount: string;
  };
  confidence: {
    name: number;
    category: number;
    urgency: number;
    location: number;
    needs: number;
    goalAmount: number;
  };
}

export interface NeedCategory {
  category: string;
  keywords: string[];
  confidence: number;
}

export interface TranscriptInput {
  text: string;
  sentences?: string[]; // Optional pre-split sentences
  languageCode?: string;
}

/**
 * Main extraction function - Jan v4.0 Enhanced
 */
export async function extractSignals(input: TranscriptInput): Promise<ExtractedSignals> {
  const text = input.text.toLowerCase();
  const originalText = input.text;
  const sentences = input.sentences || splitIntoSentences(input.text);
  
  // PHASE 2.1: Fragment processing for cleaner extraction
  const fragmentProcessor = new FragmentProcessor();
  const fragmentResult = fragmentProcessor.processTranscript(originalText, {
    preserveStoryContent: true,
    aggressiveMode: false,
    reconstructFragments: true
  });
  
  // Use cleaned transcript for extraction but keep original for story
  const cleanedText = fragmentResult.cleanedTranscript.toLowerCase();
  
  const contactCandidates = extractContactInfo(text);
  const locationCandidates = extractLocations(originalText);
  const needsCategories = categorizeNeeds(text);
  
  // PHASE 2: Enhanced category engine with multi-intent detection
  // Feature flag: ENHANCED_CATEGORY
  const useEnhancedCategory = process.env.ENHANCED_CATEGORY === 'true';
  
  let primaryCategory: string;
  let categoryConfidence: number;
  let categoryDebug: any;
  
  if (useEnhancedCategory) {
    // Use enhanced category engine
    const enhancedCategoryEngine = new EnhancedCategoryEngine();
    const categoryResult = enhancedCategoryEngine.assess(originalText);
    primaryCategory = categoryResult.primary;
    categoryConfidence = categoryResult.confidence;
    categoryDebug = {
      allIntents: categoryResult.allIntents,
      reasoning: categoryResult.reasoning
    };
  } else {
    // Use legacy category prioritization
    primaryCategory = resolveCategoryPriority(needsCategories, originalText);
    categoryConfidence = needsCategories.length > 0 ? needsCategories[0].confidence : 0.5;
    categoryDebug = { method: 'legacy' };
  }
  
  // PHASE 1.1: Enhanced urgency assessment engine
  // Feature flags: ENHANCED_URGENCY=true (v1), USE_V2_URGENCY=true (v2 multi-layer)
  const useEnhancedUrgency = process.env.ENHANCED_URGENCY === 'true';
  const useV2Urgency = process.env.USE_V2_URGENCY === 'true';
  
  let urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  let urgencyScore: number;
  let urgencyConfidence: number;
  let urgencyDebug: any;
  
  if (useV2Urgency) {
    // Use v2 multi-layer urgency engine (Phase 1 architectural improvements)
    try {
      const UrgencyServiceV2 = require('../UrgencyAssessmentService_v2.js');
      const urgencyServiceV2 = new UrgencyServiceV2();
      const result = await urgencyServiceV2.assessUrgency(cleanedText, {
        category: primaryCategory
      });
      urgencyLevel = result.urgencyLevel;
      urgencyScore = result.score;
      urgencyConfidence = result.confidence;
      urgencyDebug = { method: 'v2_multilayer', ...result.debug };
    } catch (error) {
      // Fallback to enhanced engine
      console.warn('V2 urgency service failed, falling back to enhanced:', error.message);
      const enhancedEngine = new EnhancedUrgencyEngine();
      const result = enhancedEngine.assess(cleanedText, primaryCategory);
      urgencyLevel = result.level;
      urgencyScore = result.score;
      urgencyConfidence = result.confidence;
      urgencyDebug = { method: 'enhanced_fallback', ...result.debug };
    }
  } else if (useEnhancedUrgency) {
    // Use new multi-layer urgency engine
    const enhancedEngine = new EnhancedUrgencyEngine();
    const result = enhancedEngine.assess(cleanedText, primaryCategory);
    urgencyLevel = result.level;
    urgencyScore = result.score;
    urgencyConfidence = result.confidence;
    urgencyDebug = result.debug;
  } else {
    // Use legacy urgency engine
    const urgencyEngine = new UrgencyAssessmentEngine();
    const urgencyAssessment = urgencyEngine.assessUrgency(cleanedText, {
      category: primaryCategory,
      segments: input.sentences?.map(s => ({ text: s, startMs: 0, endMs: 0 }))
    });
    urgencyLevel = urgencyAssessment.urgencyLevel;
    urgencyScore = urgencyAssessment.score;
    urgencyConfidence = urgencyAssessment.confidence || 0.5;
    urgencyDebug = urgencyAssessment;
  }
  
  // PHASE 1.2: Enhanced amount detection engine
  const amountEngine = new AmountDetectionEngine();
  const amountDetection = amountEngine.detectGoalAmount(cleanedText, {
    category: primaryCategory,
    urgency: urgencyLevel
  });
  
  // Extract name using legacy method first (Phase 3 will enhance this)
  const nameCandidate = extractName(originalText, sentences);
  
  // PHASE 1.3: Multi-field coordination for consistency
  const coordinationEngine = new MultiFieldCoordinationEngine();
  const coordinationResult = coordinationEngine.coordinateExtraction({
    name: nameCandidate,
    category: primaryCategory,
    urgencyLevel: urgencyLevel,
    goalAmount: amountDetection.goalAmount
  }, {
    name: calculateNameConfidence(nameCandidate, text),
    category: needsCategories.length > 0 ? needsCategories[0].confidence : 0.5,
    urgency: urgencyConfidence,
    goalAmount: amountDetection.confidence
  }, {
    transcript: cleanedText,
    segments: input.sentences?.map(s => ({ text: s, startMs: 0, endMs: 0 }))
  });
  
  // Use coordinated fields for final output
  const finalGoalAmount = coordinationResult.fields.goalAmount;
  const finalUrgency = coordinationResult.fields.urgencyLevel || 'LOW';
  
  // Extract beneficiary relationship
  const beneficiaryRelationship = extractBeneficiaryRelationship(originalText, primaryCategory);
  
  // Validate and get suggestions for missing data
  const dataValidation = validateGoFundMeData(
    undefined, // title - not extracted here
    originalText.length > 50 ? originalText : undefined, // story
    finalGoalAmount ?? undefined,
    primaryCategory,
    coordinationResult.fields.name ?? undefined,
    originalText
  );
  
  return {
    nameCandidate: coordinationResult.fields.name ?? null,
    storyCategory: primaryCategory, // Add normalized category for evaluation
    contactCandidates,
    locationCandidates,
    needsCategories,
    urgencyScore: urgencyScore,
    urgencyLevel: finalUrgency,
    goalAmount: finalGoalAmount ?? null,
    goalAmountConfidence: amountDetection.confidence,
    keyPoints: extractKeyPoints(sentences),
    missingFields: detectMissingFieldsEnhanced({
      nameCandidate: coordinationResult.fields.name ?? null,
      goalAmount: finalGoalAmount ?? null,
      story: originalText,
      contactCandidates,
      category: primaryCategory
    }),
    dataValidation,
    beneficiaryRelationship,
    extractionMethod: {
      name: coordinationResult.fields.name ? 'direct' : 'fallback',
      category: needsCategories.length > 0 ? 'keyword' : 'fallback',
      urgency: urgencyLevel !== 'LOW' ? 'engine' : 'default',
      goalAmount: amountDetection.goalAmount ? 'engine' : 'fallback'
    },
    confidence: {
      name: coordinationResult.confidences.name || 0.5,
      category: needsCategories.length > 0 ? needsCategories[0].confidence : 0.5,
      urgency: urgencyConfidence,
      location: calculateLocationConfidence(locationCandidates),
      needs: calculateNeedsConfidence(needsCategories),
      goalAmount: coordinationResult.confidences.goalAmount || 0.0
    }
  };
}

/**
 * Category Priority Resolution for Multi-Category Conflicts (v4.0)
 * Priority: LEGAL > SAFETY > MEDICAL/HEALTHCARE > EMERGENCY > HOUSING > EMPLOYMENT > EDUCATION > OTHER
 * Adjusted based on test expectations - legal issues take precedence
 */
function resolveCategoryPriority(categories: NeedCategory[], transcript: string): string {
  if (categories.length === 0) {
    return 'OTHER';
  }
  
  if (categories.length === 1) {
    return categories[0].category;
  }
  
  // Multi-category conflict - use priority system with contextual hints
  // v4.0 R2: Add employment detection for job-loss + bills scenarios
  const lowerTranscript = transcript.toLowerCase();
  const hasJobLoss = /(?:lost my job|laid off|fired|unemployed|job loss|no income|lost employment)/i.test(lowerTranscript);
  const hasFinancialStress = /(?:bills?|rent|mortgage|payments?|behind on|can't pay|struggling)/i.test(lowerTranscript);
  
  // If job loss + financial stress, prioritize EMPLOYMENT
  if (hasJobLoss && hasFinancialStress) {
    const employmentCat = categories.find(c => c.category === 'EMPLOYMENT');
    if (employmentCat) {
      return 'EMPLOYMENT';
    }
  }
  
  const categoryPriority: Record<string, number> = {
    'SAFETY': 1,       // Safety/domestic violence highest priority
    'LEGAL': 2,        // Legal issues second (court, custody, etc.)
    'HEALTHCARE': 3,   // Healthcare/medical third
    'HOUSING': 4,      // Housing fourth (eviction, rent)
    'UTILITIES': 5,    // Utilities fifth (shutoffs)
    'EMPLOYMENT': 6,   // Employment/job loss
    'FOOD': 7,         // Food/nutrition
    'TRANSPORTATION': 8, // Transportation
    'EDUCATION': 9,    // Education
    'CHILDCARE': 10,   // Childcare
    'FAMILY': 11,      // Family support
    'MENTAL_HEALTH': 12, // Mental health
    'ADDICTION': 13,   // Addiction recovery
    'EMERGENCY': 14,   // Generic emergency
    'OTHER': 99        // Catch-all
  };
  
  // Sort by priority (lower number = higher priority)
  const sorted = categories.sort((a, b) => {
    const priorityA = categoryPriority[a.category] || 99;
    const priorityB = categoryPriority[b.category] || 99;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // Same priority - use confidence
    return b.confidence - a.confidence;
  });
  
  // Return top category without normalization - use exact dataset category names
  return sorted[0].category;
}

/**
 * Category normalization to match expected enums
 */
function normalizeCategoryEnum(category: string): string {
  // NO normalization needed - dataset expects exact matches
  // HEALTHCARE should stay HEALTHCARE, not be converted to MEDICAL
  return category;
}

/**
 * Beneficiary relationship extraction
 */
function extractBeneficiaryRelationship(text: string, category: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  // Explicit relationship patterns
  const relationshipPatterns = [
    { pattern: /\b(?:my|our)\s+(?:son|daughter|child|kid|baby|toddler|teenager)\b/i, relationship: 'CHILD' },
    { pattern: /\b(?:my|our)\s+(?:mom|mother|dad|father|parent)\b/i, relationship: 'PARENT' },
    { pattern: /\b(?:my|our)\s+(?:wife|husband|spouse|partner)\b/i, relationship: 'SPOUSE' },
    { pattern: /\b(?:my|our)\s+(?:brother|sister|sibling)\b/i, relationship: 'SIBLING' },
    { pattern: /\b(?:my|our)\s+(?:friend|neighbor|colleague)\b/i, relationship: 'OTHER' },
    { pattern: /\bfor\s+(?:a|my)\s+friend\b/i, relationship: 'OTHER' },
  ];
  
  for (const { pattern, relationship } of relationshipPatterns) {
    if (pattern.test(lowerText)) {
      return relationship;
    }
  }
  
  // Self-reference patterns
  const selfPatterns = [
    /\b(?:i|me|my|myself|i'm|i am)\b/i,
    /\bwe\s+(?:need|require|are|have)\b/i,
    /\bour\s+(?:family|home|house|apartment)\b/i
  ];
  
  for (const pattern of selfPatterns) {
    if (pattern.test(lowerText)) {
      return 'SELF';
    }
  }
  
  // Default: If name mentioned, likely SELF
  if (/(?:my name is|i'm|i am|this is|call me)\s+[A-Z]/i.test(text)) {
    return 'SELF';
  }
  
  return undefined;
}

/**
 * Name extraction patterns:
 * - "My name is X"
 * - "I'm X" / "I am X"
 * - "This is X speaking"
 * - "Call me X"
 */
function extractName(originalText: string, sentences: string[]): string | null {
  // Pattern approach: Try most specific patterns first (titles, nicknames) then general patterns
  // FIXED v4.0: Require minimum 2 letters, better lookaheads, reject emotional/descriptive words
  const patterns = [
    // Handle Dr./Mr./Mrs./Ms. titles FIRST (most specific) - require at least 2 letters after title
    /(?:my name is|i'?m|i am|this is|call me)\s+(?:dr\.?|mr\.?|mrs\.?|ms\.?|miss)\s+([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+){0,2})(?=\s+(?:and|but|so|who|that|from|in|at|with|for|about|calling|speaking)|[,\.!?;\)]|$)/i,
    // Handle "real name is X" pattern for nickname cases
    /(?:real name is|actual name is)\s+([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+){0,3})(?=\s+(?:and|but|so|who|that|from)|[,\.!?;\)]|$)/i,
    /(?:i go by|they call me|known as)\s+([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+){0,3})(?=\s+(?:and|but|so|who)|[,\.!?;\)]|$)/i,
    // Main introduction patterns LAST (most general) - require at least 2 letters, stop at conjunctions
    /(?:my name is|i'?m|i am|this is|call me)\s+([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+){0,3})(?=\s+(?:and|but|so|who|that|from|calling|speaking|because|about|not|really)|[,\.!?;\)]|$)/i,
  ];
  
  // Reject emotional/descriptive words that are clearly not names (v4.0)
  const rejectWords = /^(really|not|very|so|quite|practicing|nervous|desperate|panicking|scared|worried|anymore|doing|going|trying|wanting|needing|behind|on|my|the|working|stopped|illness)$/i;
  
  // **v4.0 CRITICAL**: Reject sentence fragments that are clearly not names
  const rejectPhrases = /(?:behind on|stopped working|not practicing|had to stop|due to|because of)/i;
  
  for (const sentence of sentences) {
    // Skip if sentence contains rejection phrases
    if (rejectPhrases.test(sentence)) {
      continue;
    }
    
    for (const pattern of patterns) {
      const match = sentence.match(pattern);
      if (match && match[1]) {
        let name = match[1].trim();
        
        // Additional cleanup: Remove trailing common verbs that might have been captured
        name = name.replace(/\s+(calling|going|trying|working|looking|seeking|hoping|stopped|practicing)$/i, '');
        
        // **v4.0 CRITICAL**: Remove leading articles/words before name
        name = name.replace(/^(?:Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Miss)\s+(not|stopped|behind|really)\s+/i, '');
        
        // v4.0: Reject if name matches emotional/descriptive words
        const words = name.split(/\s+/);
        const hasRejectWord = words.some(word => rejectWords.test(word));
        if (hasRejectWord) {
          continue; // Skip this match, try next pattern
        }
        
        // Reject if name appears to be a sentence fragment (contains prepositions/verbs)
        if (/\s(?:on|behind|stopped|working|practicing|doing|going|because|illness)$/i.test(name)) {
          continue;
        }
        
        // Filter out common false positives
        const hasCommonWord = words.some(word => isCommonWord(word));
        if (!hasCommonWord && words.length >= 1 && words.length <= 4) {
          return name;
        }
      }
    }
  }
  
  return null;
}

/**
 * Calculate name extraction confidence
 */
function calculateNameConfidence(name: string | null, text: string): number {
  if (!name) return 0.0;
  
  let confidence = 0.5; // Base confidence for extraction
  
  // Boost for explicit patterns
  if (/(?:my name is|i'm|i am)/i.test(text)) {
    confidence += 0.3;
  }
  
  // Boost for capitalization consistency
  if (name.split(/\s+/).every(word => /^[A-Z][a-z]+$/.test(word))) {
    confidence += 0.1;
  }
  
  // Boost for 2-3 word names (typical)
  const wordCount = name.split(/\s+/).length;
  if (wordCount >= 2 && wordCount <= 3) {
    confidence += 0.1;
  }
  
  return Math.min(confidence, 1.0);
}

/**
 * Contact info extraction (email, phone)
 */
function extractContactInfo(text: string): { emails: string[]; phones: string[] } {
  const emails: string[] = [];
  const phones: string[] = [];
  
  // Email regex (basic)
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailMatches = text.match(emailRegex);
  if (emailMatches) {
    emails.push(...emailMatches);
  }
  
  // Phone regex (US format, flexible)
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phoneMatches = text.match(phoneRegex);
  if (phoneMatches) {
    phones.push(...phoneMatches.map(p => normalizePhone(p)));
  }
  
  return { emails, phones };
}

/**
 * Normalize phone number to standard format
 */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

/**
 * Location extraction
 * Matches US cities, states, and common location phrases
 */
function extractLocations(text: string): string[] {
  const locations: Set<string> = new Set();
  
  // Pattern 1: "in City" or "in City, State" (flexible for filler words like "uh")
  const inPattern = /\sin[\s,]+(?:uh,?\s+)?([A-Z][a-z]+)(?:,\s*([A-Z][a-z]+))?/g;
  let match;
  while ((match = inPattern.exec(text)) !== null) {
    if (match[1]) locations.add(match[1]);
    if (match[2]) locations.add(match[2]);
  }
  
  // Pattern 2: "City, ST" (state code)
  const stateCityPattern = /\b([A-Z][a-z]+),\s*([A-Z]{2})\b/g;
  while ((match = stateCityPattern.exec(text)) !== null) {
    if (match[1]) locations.add(match[1]);
    if (match[2]) locations.add(match[2]);
  }
  
  // US State codes
  const statePattern = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/g;
  while ((match = statePattern.exec(text)) !== null) {
    locations.add(match[0]);
  }
  
  return Array.from(locations);
}

/**
 * Calculate location confidence
 */
function calculateLocationConfidence(locations: string[]): number {
  if (locations.length === 0) return 0.0;
  if (locations.length === 1) return 0.5;
  if (locations.length === 2) return 0.75; // City + State
  return 0.9; // Multiple locations mentioned
}

/**
 * Needs categorization with keyword matching
 */
const NEEDS_KEYWORDS: Record<string, string[]> = {
  HOUSING: [
    'rent', 'eviction', 'homeless', 'shelter', 'apartment', 'housing',
    'lease', 'deposit', 'landlord', 'kicked out', 'place to stay',
    'roof over', 'couch surfing', 'living in car'
  ],
  FOOD: [
    'hungry', 'food', 'meals', 'groceries', 'eat', 'starving',
    'food stamps', 'snap', 'food bank', 'nutrition', 'breakfast',
    'lunch', 'dinner', 'feed', 'kitchen'
  ],
  HEALTHCARE: [
    'medical', 'hospital', 'doctor', 'treatment', 'surgery', 'medicine',
    'prescription', 'health', 'sick', 'injury', 'pain', 'clinic',
    'emergency room', 'ambulance', 'insurance', 'medication'
  ],
  EMPLOYMENT: [
    'job', 'work', 'unemployed', 'laid off', 'fired', 'employment',
    'interview', 'resume', 'career', 'income', 'paycheck', 'salary',
    'employer', 'position', 'hire', 'apply'
  ],
  SAFETY: [
    'abuse', 'violence', 'escape', 'protect', 'danger', 'threat',
    'assault', 'attack', 'harm', 'flee', 'safe', 'unsafe',
    'domestic', 'stalker', 'restraining order'
  ],
  TRANSPORTATION: [
    'car', 'bus', 'transportation', 'ride', 'gas', 'vehicle',
    'license', 'transit', 'train', 'uber', 'lyft', 'commute',
    'travel', 'getting around'
  ],
  UTILITIES: [
    'electricity', 'power', 'gas', 'water', 'heat', 'utility',
    'bill', 'shut off', 'service', 'electric', 'heating',
    'air conditioning', 'sewage'
  ],
  CHILDCARE: [
    'child', 'kids', 'baby', 'daycare', 'children', 'son', 'daughter',
    'family', 'school', 'diapers', 'formula', 'toys', 'babysitter'
  ],
  LEGAL: [
    'lawyer', 'attorney', 'legal', 'court', 'case', 'charges',
    'bail', 'defense', 'representation', 'immigration', 'visa',
    'custody', 'divorce'
  ],
  EDUCATION: [
    'school', 'college', 'education', 'tuition', 'class', 'course',
    'degree', 'training', 'certification', 'books', 'student',
    'learning', 'study'
  ],
  MENTAL_HEALTH: [
    'depression', 'anxiety', 'mental health', 'therapy', 'counseling',
    'ptsd', 'trauma', 'suicide', 'self harm', 'psychiatrist',
    'medication', 'support group', 'wellness'
  ],
  ADDICTION: [
    'addiction', 'alcohol', 'drugs', 'rehab', 'recovery', 'sober',
    'substance', 'detox', 'withdrawal', 'aa', 'na', 'treatment'
  ]
};

function categorizeNeeds(text: string): NeedCategory[] {
  const categories: NeedCategory[] = [];
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(NEEDS_KEYWORDS)) {
    // Check for explicit negation
    const categoryLower = category.toLowerCase();
    if (lowerText.includes(`not ${categoryLower}`) || lowerText.includes(`not ${categoryLower} related`)) {
      continue; // Skip this category
    }
    
    const matchedKeywords = keywords.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
    
    if (matchedKeywords.length > 0) {
      const confidence = Math.min(matchedKeywords.length / 3, 1.0);
      categories.push({
        category,
        keywords: matchedKeywords,
        confidence
      });
    }
  }
  
  // Sort by confidence
  return categories.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Calculate needs confidence (overall)
 */
function calculateNeedsConfidence(categories: NeedCategory[]): number {
  if (categories.length === 0) return 0.0;
  
  // Average of top 3 categories
  const topCategories = categories.slice(0, 3);
  const avgConfidence = topCategories.reduce((sum, cat) => sum + cat.confidence, 0) / topCategories.length;
  
  return avgConfidence;
}

/**
 * Urgency scoring based on time-sensitive keywords
 */
const URGENCY_KEYWORDS = {
  critical: ['emergency', 'urgent', 'immediately', 'asap', 'right now', 'today', 'tonight', 'crisis', 'life or death'],
  high: ['soon', 'deadline', 'eviction', 'court date', 'running out', 'expires', 'this week', 'few days', 'at risk', 'losing'],
  medium: ['need', 'help', 'struggling', 'difficult', 'hard time', 'next month', 'coming up'],
  low: ['eventually', 'someday', 'long term', 'future', 'goal', 'hope to']
};

function calculateUrgency(text: string): number {
  let score = 0.0;
  
  // Critical: 0.7-1.0
  for (const keyword of URGENCY_KEYWORDS.critical) {
    if (text.includes(keyword)) {
      score = Math.max(score, 0.85);
    }
  }
  
  // High: 0.5-0.7
  for (const keyword of URGENCY_KEYWORDS.high) {
    if (text.includes(keyword)) {
      score = Math.max(score, 0.6);
    }
  }
  
  // Medium: 0.3-0.5
  for (const keyword of URGENCY_KEYWORDS.medium) {
    if (text.includes(keyword)) {
      score = Math.max(score, 0.4);
    }
  }
  
  // Low: 0.1-0.3
  for (const keyword of URGENCY_KEYWORDS.low) {
    if (text.includes(keyword)) {
      score = Math.max(score, 0.2);
    }
  }
  
  // Default medium-low if no keywords found
  if (score === 0.0) {
    score = 0.3;
  }
  
  return score;
}

/**
 * Extract key points (top N sentences by relevance)
 */
function extractKeyPoints(sentences: string[], maxPoints: number = 7): string[] {
  // Score sentences by relevance indicators
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0;
    
    // Boost for need-related sentences
    if (Object.values(NEEDS_KEYWORDS).flat().some(keyword => 
      sentence.toLowerCase().includes(keyword)
    )) {
      score += 2;
    }
    
    // Boost for urgency
    if (Object.values(URGENCY_KEYWORDS).flat().some(keyword => 
      sentence.toLowerCase().includes(keyword)
    )) {
      score += 1;
    }
    
    // Boost for first-person statements
    if (/\b(i|my|me|we|our)\b/i.test(sentence)) {
      score += 1;
    }
    
    // Penalize very short sentences
    if (sentence.length < 30) {
      score -= 1;
    }
    
    return { sentence, score, originalIndex: index };
  });
  
  // Sort by score to select top N, then re-sort by original order to maintain sequence
  return scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPoints)
    .sort((a, b) => a.originalIndex - b.originalIndex)
    .map(s => s.sentence);
}

/**
 * Detect missing required fields
 */
function detectMissingFields(draft: {
  nameCandidate: string | null;
  goalAmount: number | null;
  story: string;
  contactCandidates: { emails: string[]; phones: string[] };
}): string[] {
  const missing: string[] = [];
  
  if (!draft.nameCandidate || draft.nameCandidate.trim().length === 0) {
    missing.push('name');
  }
  
  if (!draft.goalAmount) {
    missing.push('goalAmount');
  }
  
  if (!draft.story || draft.story.trim().length < 100) {
    missing.push('story');
  }
  
  // Check if contact information is missing
  const hasEmail = draft.contactCandidates.emails.length > 0;
  const hasPhone = draft.contactCandidates.phones.length > 0;
  if (!hasEmail && !hasPhone) {
    missing.push('contact');
  }
  
  return missing;
}

/**
 * Enhanced missing fields detection with category-aware validation
 */
function detectMissingFieldsEnhanced(draft: {
  nameCandidate: string | null;
  goalAmount: number | null;
  story: string;
  contactCandidates: { emails: string[]; phones: string[] };
  category: string;
}): string[] {
  const missing: string[] = [];
  
  // Name validation
  if (!draft.nameCandidate || draft.nameCandidate.trim().length === 0) {
    missing.push('name');
  } else if (isCommonWord(draft.nameCandidate)) {
    missing.push('name'); // Flag likely false positive
  }
  
  // Goal amount validation with category context
  if (!draft.goalAmount) {
    missing.push('goalAmount');
  } else {
    // Validate goal amount makes sense for category
    const categoryRanges: { [key: string]: [number, number] } = {
      'FOOD': [100, 2000],
      'HOUSING': [500, 20000],
      'MEDICAL': [1000, 50000],
      'EMERGENCY': [200, 10000],
      'EDUCATION': [500, 15000],
      'TRANSPORTATION': [300, 8000]
    };
    
    const [min, max] = categoryRanges[draft.category] || [100, 50000];
    if (draft.goalAmount < min || draft.goalAmount > max) {
      missing.push('goalAmountValidation');
    }
  }
  
  // Story validation with minimum quality checks
  if (!draft.story || draft.story.trim().length < 50) {
    missing.push('story');
  } else if (draft.story.trim().length < 100) {
    missing.push('storyLength'); // Needs expansion
  } else {
    // Check for story quality indicators
    const sentences = draft.story.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 3) {
      missing.push('storyDetail');
    }
  }
  
  // Contact validation
  const hasEmail = draft.contactCandidates.emails.length > 0;
  const hasPhone = draft.contactCandidates.phones.length > 0;
  if (!hasEmail && !hasPhone) {
    missing.push('contact');
  }
  
  // Additional category-specific validations
  if (draft.category === 'MEDICAL' && !draft.story.toLowerCase().includes('medical')) {
    missing.push('medicalContext');
  }
  
  if (draft.category === 'HOUSING' && !draft.story.toLowerCase().match(/rent|evict|housing|shelter|homeless/)) {
    missing.push('housingContext');
  }
  
  return missing;
}

/**
 * Split text into sentences
 */
function splitIntoSentences(text: string): string[] {
  // Simple sentence splitting (can be enhanced)
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Check if a word is a common English word (to filter false positives)
 */
const COMMON_WORDS = new Set([
  'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have',
  'been', 'were', 'will', 'would', 'could', 'should', 'must',
  'about', 'there', 'their', 'where', 'when', 'what', 'which',
  'emergency', 'urgent', 'help', 'need', 'please', 'thank', 'you',
  // Common verbs that may follow "I'm" but are not names
  'calling', 'going', 'looking', 'trying', 'working', 'reaching', 
  'seeking', 'hoping', 'living', 'staying', 'currently', 'because'
]);

function isCommonWord(word: string): boolean {
  return COMMON_WORDS.has(word.toLowerCase());
}

/**
 * Validation: Check if extracted signals meet quality threshold
 */
export function validateSignalQuality(signals: ExtractedSignals): {
  isValid: boolean;
  issues: string[];
  qualityScore: number;
} {
  const issues: string[] = [];
  let qualityScore = 1.0;
  
  // Check name confidence
  if (signals.confidence.name < 0.3) {
    issues.push('Low confidence in name extraction');
    qualityScore -= 0.2;
  }
  
  // Check needs detection
  if (signals.needsCategories.length === 0) {
    issues.push('No needs detected in transcript');
    qualityScore -= 0.3;
  }
  
  // Check key points
  if (signals.keyPoints.length < 3) {
    issues.push('Insufficient key points extracted');
    qualityScore -= 0.2;
  }
  
  // Check missing fields
  if (signals.missingFields.length > 0) {
    issues.push(`Missing required fields: ${signals.missingFields.join(', ')}`);
    qualityScore -= 0.1 * signals.missingFields.length;
  }
  
  return {
    isValid: qualityScore >= 0.5,
    issues,
    qualityScore: Math.max(qualityScore, 0.0)
  };
}
