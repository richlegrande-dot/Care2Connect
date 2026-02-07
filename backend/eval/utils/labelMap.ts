/**
 * Canonical Label Mapping for Jan v2.5 Evaluation Suite
 * 
 * This module provides category and label normalization to eliminate
 * false positives/negatives caused by semantic label mismatches.
 * 
 * CRITICAL: All evaluation comparisons must use normalized labels.
 */

// Canonical category labels (production standard)
export const CANONICAL_CATEGORIES = {
  HEALTHCARE: 'HEALTHCARE',
  HOUSING: 'HOUSING', 
  EDUCATION: 'EDUCATION',
  EMPLOYMENT: 'EMPLOYMENT',
  EMERGENCY: 'EMERGENCY',
  LEGAL: 'LEGAL',
  FAMILY: 'FAMILY',
  SAFETY: 'SAFETY',
  OTHER: 'OTHER'
} as const;

// Category synonym mapping (maps variants to canonical)
const CATEGORY_SYNONYMS: Record<string, keyof typeof CANONICAL_CATEGORIES> = {
  // Healthcare variants
  'MEDICAL': 'HEALTHCARE',
  'HEALTH': 'HEALTHCARE', 
  'HEALTHCARE': 'HEALTHCARE',
  'SURGERY': 'HEALTHCARE',
  'HOSPITAL': 'HEALTHCARE',
  
  // Housing variants
  'HOUSING': 'HOUSING',
  'RENT': 'HOUSING',
  'EVICTION': 'HOUSING',
  'HOMELESS': 'HOUSING',
  
  // Education variants
  'EDUCATION': 'EDUCATION',
  'SCHOOL': 'EDUCATION',
  'TUITION': 'EDUCATION',
  'COLLEGE': 'EDUCATION',
  
  // Employment variants
  'EMPLOYMENT': 'EMPLOYMENT',
  'JOB': 'EMPLOYMENT',
  'WORK': 'EMPLOYMENT',
  'UNEMPLOYMENT': 'EMPLOYMENT',
  
  // Emergency variants
  'EMERGENCY': 'EMERGENCY',
  'CRISIS': 'EMERGENCY',
  'URGENT': 'EMERGENCY',
  
  // Legal variants
  'LEGAL': 'LEGAL',
  'COURT': 'LEGAL',
  'LAWYER': 'LEGAL',
  
  // Family variants
  'FAMILY': 'FAMILY',
  'CHILD': 'FAMILY',
  'CHILDREN': 'FAMILY',
  'WEDDING': 'FAMILY',
  
  // Safety variants (HIGHEST PRIORITY)
  'SAFETY': 'SAFETY',
  'DOMESTIC_VIOLENCE': 'SAFETY',
  'DV': 'SAFETY',
  'ABUSE': 'SAFETY',
  'VIOLENCE': 'SAFETY',
  
  // Other variants
  'OTHER': 'OTHER',
  'PERSONAL': 'OTHER',
  'GENERAL': 'OTHER'
};

// Canonical urgency levels
export const CANONICAL_URGENCY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH', 
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
} as const;

// Urgency synonym mapping
const URGENCY_SYNONYMS: Record<string, keyof typeof CANONICAL_URGENCY> = {
  'CRITICAL': 'CRITICAL',
  'EMERGENCY': 'CRITICAL',
  'IMMEDIATE': 'CRITICAL',
  'ASAP': 'CRITICAL',
  
  'HIGH': 'HIGH',
  'URGENT': 'HIGH',
  'SOON': 'HIGH',
  'PRIORITY': 'HIGH',
  
  'MEDIUM': 'MEDIUM',
  'NORMAL': 'MEDIUM',
  'MODERATE': 'MEDIUM',
  'STANDARD': 'MEDIUM',
  
  'LOW': 'LOW',
  'EVENTUALLY': 'LOW',
  'WHENEVER': 'LOW',
  'NON_URGENT': 'LOW'
};

/**
 * Normalizes a category to its canonical form
 * 
 * @param category - Raw category string (case-insensitive)
 * @returns Canonical category or 'OTHER' if not recognized
 */
export function normalizeCategory(category: string | null | undefined): string {
  if (!category) return CANONICAL_CATEGORIES.OTHER;
  
  const upper = category.toUpperCase().trim();
  return CATEGORY_SYNONYMS[upper] || CANONICAL_CATEGORIES.OTHER;
}

/**
 * Normalizes an urgency level to its canonical form
 * 
 * @param urgency - Raw urgency string (case-insensitive)  
 * @returns Canonical urgency or 'MEDIUM' if not recognized
 */
export function normalizeUrgency(urgency: string | null | undefined): string {
  if (!urgency) return CANONICAL_URGENCY.MEDIUM;
  
  const upper = urgency.toUpperCase().trim();
  return URGENCY_SYNONYMS[upper] || CANONICAL_URGENCY.MEDIUM;
}

/**
 * Category priority hierarchy for multi-category resolution
 * Higher index = higher priority
 */
const CATEGORY_PRIORITY = [
  'OTHER',
  'FAMILY', 
  'EDUCATION',
  'EMPLOYMENT',
  'LEGAL',
  'HEALTHCARE',
  'HOUSING',
  'EMERGENCY',
  'SAFETY'  // HIGHEST PRIORITY - always wins
];

/**
 * Resolves category conflicts by priority
 * Safety always overrides housing, emergency overrides general needs, etc.
 */
export function resolveCategoryConflict(categories: string[]): string {
  const normalized = categories.map(normalizeCategory);
  
  // Find highest priority category
  let highestPriority = -1;
  let result = CANONICAL_CATEGORIES.OTHER;
  
  for (const category of normalized) {
    const priority = CATEGORY_PRIORITY.indexOf(category);
    if (priority > highestPriority) {
      highestPriority = priority;
      result = category;
    }
  }
  
  return result;
}

/**
 * Checks if two categories are semantically equivalent after normalization
 */
export function categoriesMatch(actual: string, expected: string): boolean {
  return normalizeCategory(actual) === normalizeCategory(expected);
}

/**
 * Checks if two urgency levels are semantically equivalent after normalization
 */
export function urgencyMatches(actual: string, expected: string): boolean {
  return normalizeUrgency(actual) === normalizeUrgency(expected);
}
