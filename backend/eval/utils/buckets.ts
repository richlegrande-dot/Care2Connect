/**
 * Failure bucketing system for categorizing parsing errors
 * Provides deterministic classification of failure patterns
 */

import { FieldComparison } from './diff';

export type FailureBucket = 
  | 'AMOUNT_FALSE_POSITIVE_WAGE'
  | 'AMOUNT_FALSE_POSITIVE_AGE'
  | 'AMOUNT_FALSE_POSITIVE_DATE'
  | 'AMOUNT_MISSING'
  | 'AMOUNT_INCORRECT'
  | 'NAME_FALSE_POSITIVE_LOCATION'
  | 'NAME_MISSING'
  | 'NAME_INCORRECT'
  | 'CATEGORY_MISCLASSIFICATION'
  | 'URGENCY_UNDERSCORED'
  | 'URGENCY_OVERSCORED'
  | 'MISSINGFIELDS_INCORRECT'
  | 'FALLBACK_USED_UNEXPECTEDLY'
  | 'CONFIDENCE_TOO_LOW'
  | 'CONFIDENCE_TOO_HIGH'
  | 'MULTIPLE_FIELD_FAILURES'
  | 'UNKNOWN_FAILURE';

export interface BucketingContext {
  fieldFailures: FieldComparison[];
  confidence?: Record<string, number>;
  fallbackTier?: Record<string, string>;
  traceData?: any;
  transcriptPreview?: string;
}

export interface BucketAnalysis {
  bucket: FailureBucket;
  confidence: number;
  reasons: string[];
  primaryField?: string;
}

/**
 * Determines the most appropriate failure bucket for a set of field failures
 */
export function categorizeFailure(context: BucketingContext): BucketAnalysis {
  const { fieldFailures, confidence, fallbackTier, traceData, transcriptPreview } = context;
  
  // Handle multiple field failures first
  if (fieldFailures.length > 2) {
    return {
      bucket: 'MULTIPLE_FIELD_FAILURES',
      confidence: 0.9,
      reasons: [`${fieldFailures.length} fields failed: ${fieldFailures.map(f => f.field).join(', ')}`]
    };
  }

  // Analyze each field failure
  for (const failure of fieldFailures) {
    const analysis = analyzeFieldFailure(failure, context);
    if (analysis.confidence >= 0.7) {
      return analysis;
    }
  }

  // Check for confidence issues
  const confidenceAnalysis = analyzeConfidenceIssues(confidence, fieldFailures);
  if (confidenceAnalysis) {
    return confidenceAnalysis;
  }

  // Check for unexpected fallback usage
  const fallbackAnalysis = analyzeFallbackIssues(fallbackTier, fieldFailures);
  if (fallbackAnalysis) {
    return fallbackAnalysis;
  }

  // Default to unknown failure
  return {
    bucket: 'UNKNOWN_FAILURE',
    confidence: 0.5,
    reasons: ['Could not categorize failure pattern']
  };
}

/**
 * Analyzes individual field failures
 */
function analyzeFieldFailure(
  failure: FieldComparison,
  context: BucketingContext
): BucketAnalysis {
  const { field, expected, actual, reason } = failure;
  
  switch (field.toLowerCase()) {
    case 'goalamount':
    case 'amount':
      return analyzeAmountFailure(expected, actual, reason, context);
    
    case 'name':
      return analyzeNameFailure(expected, actual, reason, context);
    
    case 'category':
      return analyzeCategoryFailure(expected, actual, reason, context);
    
    case 'urgencylevel':
      return analyzeUrgencyFailure(expected, actual, reason, context);
    
    case 'missingfields':
      return {
        bucket: 'MISSINGFIELDS_INCORRECT',
        confidence: 0.8,
        reasons: [`Missing fields mismatch: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`],
        primaryField: 'missingFields'
      };
    
    default:
      return {
        bucket: 'UNKNOWN_FAILURE',
        confidence: 0.3,
        reasons: [`Unhandled field failure: ${field}`],
        primaryField: field
      };
  }
}

/**
 * Analyzes goal amount parsing failures
 */
function analyzeAmountFailure(
  expected: number,
  actual: number,
  reason?: string,
  context?: BucketingContext
): BucketAnalysis {
  
  // Missing amount
  if (actual === null || actual === undefined) {
    return {
      bucket: 'AMOUNT_MISSING',
      confidence: 0.9,
      reasons: ['Goal amount not detected'],
      primaryField: 'goalAmount'
    };
  }

  // Check for common false positives
  if (actual > 0 && expected !== actual) {
    // Wage false positive (typically $15-50/hour)
    if (actual >= 7 && actual <= 100 && expected > actual * 10) {
      return {
        bucket: 'AMOUNT_FALSE_POSITIVE_WAGE',
        confidence: 0.85,
        reasons: [`Detected $${actual} (likely hourly wage) instead of goal amount $${expected}`],
        primaryField: 'goalAmount'
      };
    }

    // Age false positive (typically 18-99)
    if (actual >= 16 && actual <= 99 && expected > 1000) {
      return {
        bucket: 'AMOUNT_FALSE_POSITIVE_AGE',
        confidence: 0.8,
        reasons: [`Detected ${actual} (likely age) instead of goal amount $${expected}`],
        primaryField: 'goalAmount'
      };
    }

    // Date component false positive (day/month/year components)
    if ((actual >= 1 && actual <= 31) || (actual >= 2020 && actual <= 2030) || (actual >= 1 && actual <= 12)) {
      return {
        bucket: 'AMOUNT_FALSE_POSITIVE_DATE',
        confidence: 0.7,
        reasons: [`Detected ${actual} (likely date component) instead of goal amount $${expected}`],
        primaryField: 'goalAmount'
      };
    }
  }

  return {
    bucket: 'AMOUNT_INCORRECT',
    confidence: 0.6,
    reasons: [`Amount mismatch: expected $${expected}, got $${actual}`],
    primaryField: 'goalAmount'
  };
}

/**
 * Analyzes name parsing failures
 */
function analyzeNameFailure(
  expected: string,
  actual: string,
  reason?: string,
  context?: BucketingContext
): BucketAnalysis {
  
  if (!actual) {
    return {
      bucket: 'NAME_MISSING',
      confidence: 0.9,
      reasons: ['Name not detected'],
      primaryField: 'name'
    };
  }

  // Check for location words being detected as names
  const locationWords = ['city', 'town', 'county', 'state', 'street', 'avenue', 'road', 'drive'];
  const actualLower = actual.toLowerCase();
  
  if (locationWords.some(loc => actualLower.includes(loc))) {
    return {
      bucket: 'NAME_FALSE_POSITIVE_LOCATION',
      confidence: 0.8,
      reasons: [`Detected location-related text "${actual}" as name instead of "${expected}"`],
      primaryField: 'name'
    };
  }

  return {
    bucket: 'NAME_INCORRECT',
    confidence: 0.6,
    reasons: [`Name mismatch: expected "${expected}", got "${actual}"`],
    primaryField: 'name'
  };
}

/**
 * Analyzes category classification failures
 */
function analyzeCategoryFailure(
  expected: string,
  actual: string,
  reason?: string,
  context?: BucketingContext
): BucketAnalysis {
  
  return {
    bucket: 'CATEGORY_MISCLASSIFICATION',
    confidence: 0.8,
    reasons: [`Category mismatch: expected "${expected}", got "${actual}"`],
    primaryField: 'category'
  };
}

/**
 * Analyzes urgency level failures
 */
function analyzeUrgencyFailure(
  expected: string,
  actual: string,
  reason?: string,
  context?: BucketingContext
): BucketAnalysis {
  
  const urgencyOrder = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const expectedIndex = urgencyOrder.indexOf(expected);
  const actualIndex = urgencyOrder.indexOf(actual);
  
  if (expectedIndex > actualIndex) {
    return {
      bucket: 'URGENCY_UNDERSCORED',
      confidence: 0.8,
      reasons: [`Urgency underestimated: expected "${expected}", got "${actual}"`],
      primaryField: 'urgencyLevel'
    };
  } else {
    return {
      bucket: 'URGENCY_OVERSCORED',
      confidence: 0.8,
      reasons: [`Urgency overestimated: expected "${expected}", got "${actual}"`],
      primaryField: 'urgencyLevel'
    };
  }
}

/**
 * Analyzes confidence score issues
 */
function analyzeConfidenceIssues(
  confidence?: Record<string, number>,
  fieldFailures?: FieldComparison[]
): BucketAnalysis | null {
  
  if (!confidence || !fieldFailures) return null;

  // Check for high confidence on failed fields
  for (const failure of fieldFailures) {
    const fieldConfidence = confidence[failure.field];
    if (fieldConfidence && fieldConfidence > 0.8) {
      return {
        bucket: 'CONFIDENCE_TOO_HIGH',
        confidence: 0.7,
        reasons: [`High confidence (${fieldConfidence.toFixed(2)}) on failed field: ${failure.field}`],
        primaryField: failure.field
      };
    }
  }

  // Check for very low confidence on all fields
  const avgConfidence = Object.values(confidence).reduce((a, b) => a + b, 0) / Object.values(confidence).length;
  if (avgConfidence < 0.3) {
    return {
      bucket: 'CONFIDENCE_TOO_LOW',
      confidence: 0.6,
      reasons: [`Very low average confidence: ${avgConfidence.toFixed(2)}`]
    };
  }

  return null;
}

/**
 * Analyzes unexpected fallback usage
 */
function analyzeFallbackIssues(
  fallbackTier?: Record<string, string>,
  fieldFailures?: FieldComparison[]
): BucketAnalysis | null {
  
  if (!fallbackTier || !fieldFailures) return null;

  // Check if fallback was used for fields that should have been detected directly
  const unexpectedFallbacks = fieldFailures.filter(failure => {
    const tier = fallbackTier[failure.field];
    return tier && tier !== 'direct' && failure.expected !== null;
  });

  if (unexpectedFallbacks.length > 0) {
    return {
      bucket: 'FALLBACK_USED_UNEXPECTEDLY',
      confidence: 0.7,
      reasons: [
        `Unexpected fallback usage for fields: ${unexpectedFallbacks.map(f => `${f.field}(${fallbackTier[f.field]})`).join(', ')}`
      ]
    };
  }

  return null;
}

/**
 * Gets all available failure buckets with descriptions
 */
export function getFailureBuckets(): Record<FailureBucket, string> {
  return {
    'AMOUNT_FALSE_POSITIVE_WAGE': 'Goal amount confused with hourly wage',
    'AMOUNT_FALSE_POSITIVE_AGE': 'Goal amount confused with age',
    'AMOUNT_FALSE_POSITIVE_DATE': 'Goal amount confused with date component',
    'AMOUNT_MISSING': 'Goal amount not detected at all',
    'AMOUNT_INCORRECT': 'Goal amount detected but wrong value',
    'NAME_FALSE_POSITIVE_LOCATION': 'Name confused with location reference',
    'NAME_MISSING': 'Name not detected at all',
    'NAME_INCORRECT': 'Name detected but wrong value',
    'CATEGORY_MISCLASSIFICATION': 'Story category incorrectly classified',
    'URGENCY_UNDERSCORED': 'Urgency level set too low',
    'URGENCY_OVERSCORED': 'Urgency level set too high',
    'MISSINGFIELDS_INCORRECT': 'Missing fields assessment incorrect',
    'FALLBACK_USED_UNEXPECTEDLY': 'Fallback logic used when direct extraction should work',
    'CONFIDENCE_TOO_LOW': 'Confidence scores unreasonably low',
    'CONFIDENCE_TOO_HIGH': 'High confidence on incorrect results',
    'MULTIPLE_FIELD_FAILURES': 'Multiple fields failed simultaneously',
    'UNKNOWN_FAILURE': 'Failure pattern not recognized'
  };
}
