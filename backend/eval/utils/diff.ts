/**
 * Field comparison and difference detection utilities
 * Handles fuzzy matching and tolerance-based comparisons
 */

/**
 * Normalizes beneficiary relationship values to handle format differences
 * between v1 (lowercase descriptive) and v4 (uppercase codes)
 */
function normalizeBeneficiaryRelationship(value: any): string | null {
  if (!value || typeof value !== 'string') return null;
  
  const normalized = value.toLowerCase().trim();
  
  // Map v4 uppercase codes to v1 lowercase descriptive terms
  const mappings: Record<string, string[]> = {
    'self': ['myself', 'self'],
    'child': ['child', 'son', 'daughter', 'kid'],
    'parent': ['parent', 'mother', 'father', 'mom', 'dad'],
    'spouse': ['spouse', 'wife', 'husband', 'partner'],
    'sibling': ['sibling', 'brother', 'sister'],
    'other': ['other', 'friend', 'neighbor'],
    'family': ['family']
  };
  
  // If it's an uppercase code, return lowercase version
  if (mappings[normalized]) {
    return normalized === 'self' ? 'myself' : normalized;
  }
  
  // If it matches any variant in the mappings, normalize to the base form
  for (const [base, variants] of Object.entries(mappings)) {
    if (variants.includes(normalized)) {
      // Check if it's a specific term that should match itself
      if (['son', 'daughter', 'mother', 'father', 'wife', 'husband', 'brother', 'sister'].includes(normalized)) {
        return normalized; // Keep specific terms as-is
      }
      return base === 'self' ? 'myself' : base;
    }
  }
  
  // Already in correct format
  return normalized;
}

/**
 * Normalizes category values to handle MEDICAL/HEALTHCARE synonyms
 */
function normalizeCategory(value: any): string | null {
  if (!value || typeof value !== 'string') return null;
  
  const normalized = value.toUpperCase().trim();
  
  // MEDICAL and HEALTHCARE are synonyms - normalize to MEDICAL
  if (normalized === 'HEALTHCARE') {
    return 'MEDICAL';
  }
  
  return normalized;
}

export interface ComparisonOptions {
  allowFuzzyName?: boolean;
  amountTolerance?: number;
  keyPointsMin?: number;
}

export interface FieldComparison {
  field: string;
  passed: boolean;
  expected: any;
  actual: any;
  reason?: string;
  similarity?: number;
}

export interface ComparisonResult {
  overallPassed: boolean;
  fieldResults: FieldComparison[];
  passedFields: number;
  totalFields: number;
}

/**
 * Compares two values with field-specific logic
 */
export function compareField(
  fieldName: string,
  expected: any,
  actual: any,
  options: ComparisonOptions = {}
): FieldComparison {
  
  switch (fieldName.toLowerCase()) {
    case 'goalamount':
    case 'amount':
      return compareAmount(fieldName, expected, actual, options.amountTolerance || 0);
    
    case 'name':
      return compareName(fieldName, expected, actual, options.allowFuzzyName || false);
    
    case 'missingfields':
      return compareArray(fieldName, expected, actual);
    
    case 'category':
      return compareCategory(fieldName, expected, actual);
    
    case 'beneficiaryrelationship':
      return compareBeneficiaryRelationship(fieldName, expected, actual);
    
    case 'urgencylevel':
      return compareExact(fieldName, expected, actual);
    
    default:
      return compareExact(fieldName, expected, actual);
  }
}

/**
 * Compares amounts with tolerance
 */
function compareAmount(
  fieldName: string,
  expected: number,
  actual: number,
  tolerance: number
): FieldComparison {
  if (expected === null || expected === undefined) {
    return {
      field: fieldName,
      passed: actual === null || actual === undefined,
      expected,
      actual,
      reason: expected === null ? 'Both null as expected' : 'Expected null but got value'
    };
  }

  if (actual === null || actual === undefined) {
    return {
      field: fieldName,
      passed: false,
      expected,
      actual,
      reason: 'Expected value but got null'
    };
  }

  const difference = Math.abs(expected - actual);
  const passed = difference <= tolerance;
  
  return {
    field: fieldName,
    passed,
    expected,
    actual,
    reason: passed ? `Within tolerance (±${tolerance})` : `Outside tolerance: diff=${difference}`,
    similarity: tolerance > 0 ? Math.max(0, 1 - difference / Math.max(expected, actual)) : (expected === actual ? 1 : 0)
  };
}

/**
 * Compares names with optional fuzzy matching
 */
function compareName(
  fieldName: string,
  expected: string,
  actual: string,
  allowFuzzy: boolean
): FieldComparison {
  if (!expected || !actual) {
    return {
      field: fieldName,
      passed: expected === actual,
      expected,
      actual,
      reason: 'One or both values are null/empty'
    };
  }

  // Exact match first
  if (expected.toLowerCase() === actual.toLowerCase()) {
    return {
      field: fieldName,
      passed: true,
      expected,
      actual,
      reason: 'Exact match (case insensitive)',
      similarity: 1.0
    };
  }

  if (!allowFuzzy) {
    return {
      field: fieldName,
      passed: false,
      expected,
      actual,
      reason: 'Exact match required but not found',
      similarity: 0
    };
  }

  // Fuzzy matching using Levenshtein distance
  const similarity = calculateStringSimilarity(expected.toLowerCase(), actual.toLowerCase());
  const passed = similarity >= 0.8; // 80% similarity threshold

  return {
    field: fieldName,
    passed,
    expected,
    actual,
    reason: passed ? `Fuzzy match (${(similarity * 100).toFixed(1)}% similar)` : `Too dissimilar (${(similarity * 100).toFixed(1)}%)`,
    similarity
  };
}

/**
 * Compares arrays (like missingFields) using set equality
 */
function compareArray(
  fieldName: string,
  expected: any[],
  actual: any[]
): FieldComparison {
  if (!Array.isArray(expected) || !Array.isArray(actual)) {
    return {
      field: fieldName,
      passed: false,
      expected,
      actual,
      reason: 'One or both values are not arrays'
    };
  }

  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  
  const passed = expectedSet.size === actualSet.size &&
    Array.from(expectedSet).every(item => actualSet.has(item));

  return {
    field: fieldName,
    passed,
    expected,
    actual,
    reason: passed ? 'Set equality match' : 'Sets do not match'
  };
}

/**
 * Exact comparison for categories, urgency levels, etc.
 */
function compareExact(
  fieldName: string,
  expected: any,
  actual: any
): FieldComparison {
  const passed = expected === actual;
  
  return {
    field: fieldName,
    passed,
    expected,
    actual,
    reason: passed ? 'Exact match' : 'Values do not match exactly'
  };
}

/**
 * Compares category with normalization for MEDICAL/HEALTHCARE
 */
function compareCategory(
  fieldName: string,
  expected: any,
  actual: any
): FieldComparison {
  const normalizedExpected = normalizeCategory(expected);
  const normalizedActual = normalizeCategory(actual);
  
  const passed = normalizedExpected === normalizedActual;
  
  return {
    field: fieldName,
    passed,
    expected,
    actual,
    reason: passed 
      ? (expected === actual ? 'Exact match' : 'Normalized match (MEDICAL/HEALTHCARE)')
      : 'Values do not match exactly'
  };
}

/**
 * Compares beneficiary relationship with normalization for format differences
 */
function compareBeneficiaryRelationship(
  fieldName: string,
  expected: any,
  actual: any
): FieldComparison {
  // Handle exact match first
  if (expected === actual) {
    return {
      field: fieldName,
      passed: true,
      expected,
      actual,
      reason: 'Exact match'
    };
  }
  
  const normalizedExpected = normalizeBeneficiaryRelationship(expected);
  const normalizedActual = normalizeBeneficiaryRelationship(actual);
  
  // Check normalized match
  if (normalizedExpected === normalizedActual) {
    return {
      field: fieldName,
      passed: true,
      expected,
      actual,
      reason: 'Normalized match (SELF→myself)'
    };
  }
  
  // Check semantic equivalents (CHILD matches daughter/son, PARENT matches mother/father, etc.)
  const semanticGroups: Record<string, string[]> = {
    'child-group': ['child', 'son', 'daughter', 'kid'],
    'parent-group': ['parent', 'mother', 'father', 'mom', 'dad'],
    'spouse-group': ['spouse', 'wife', 'husband', 'partner'],
    'sibling-group': ['sibling', 'brother', 'sister'],
    'self-group': ['self', 'myself'],
    'family-group': ['family'],
    'other-group': ['other', 'friend', 'neighbor']
  };
  
  for (const [group, members] of Object.entries(semanticGroups)) {
    if (members.includes(normalizedExpected || '') && members.includes(normalizedActual || '')) {
      return {
        field: fieldName,
        passed: true,
        expected,
        actual,
        reason: `Semantic match (${group}: ${expected}≈${actual})`
      };
    }
  }
  
  return {
    field: fieldName,
    passed: false,
    expected,
    actual,
    reason: 'Values do not match'
  };
}

/**
 * Calculates string similarity using Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;

  const matrix: number[][] = [];
  
  // Initialize matrix
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  // Calculate Levenshtein distance
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  const maxLen = Math.max(str1.length, str2.length);
  return 1 - matrix[str2.length][str1.length] / maxLen;
}

/**
 * Performs comprehensive comparison of expected vs actual results
 */
export function compareResults(
  expected: any,
  actual: any,
  options: ComparisonOptions = {}
): ComparisonResult {
  const fieldResults: FieldComparison[] = [];
  
  // Get all fields from both expected and actual
  const allFields = new Set([
    ...Object.keys(expected || {}),
    ...Object.keys(actual || {})
  ]);

  for (const field of allFields) {
    const comparison = compareField(field, expected[field], actual[field], options);
    fieldResults.push(comparison);
  }

  const passedFields = fieldResults.filter(r => r.passed).length;
  const overallPassed = passedFields === fieldResults.length;

  return {
    overallPassed,
    fieldResults,
    passedFields,
    totalFields: fieldResults.length
  };
}

/**
 * Generates a human-readable diff summary
 */
export function generateDiffSummary(fieldResults: FieldComparison[]): string {
  const failedFields = fieldResults.filter(r => !r.passed);
  
  if (failedFields.length === 0) {
    return 'All fields passed';
  }

  const summaries = failedFields.map(field => {
    return `${field.field}: expected ${JSON.stringify(field.expected)} but got ${JSON.stringify(field.actual)} (${field.reason})`;
  });

  return summaries.join('; ');
}