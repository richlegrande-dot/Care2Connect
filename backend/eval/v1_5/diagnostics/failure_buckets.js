/**
 * LAYER 5 — Failure Bucket Intelligence
 * 
 * Structured, granular failure classification.
 * Each failure maps to EXACTLY ONE bucket.
 * Replaces coarse categories with root-cause-aware buckets.
 */

/**
 * Structured failure bucket definitions.
 * Each bucket has a unique key, category, and description.
 */
const FAILURE_BUCKETS = {
  // Amount buckets
  amount_spoken_number_failure: {
    category: 'amount',
    description: 'Spoken number form not in SPOKEN_NUMBERS map',
    severity: 'high'
  },
  amount_partial_match_override: {
    category: 'amount',
    description: 'Partial spoken number matched instead of full compound form',
    severity: 'high'
  },
  amount_null_extraction: {
    category: 'amount',
    description: 'Amount extracted as null when transcript contains a stated amount',
    severity: 'high'
  },
  amount_tolerance_exceeded: {
    category: 'amount',
    description: 'Amount detected but outside tolerance threshold',
    severity: 'medium'
  },
  amount_false_positive: {
    category: 'amount',
    description: 'Amount extracted when none was expected (wage/age/date confusion)',
    severity: 'medium'
  },

  // Name buckets
  name_intro_pattern_missing: {
    category: 'name',
    description: 'Common introduction pattern not matched by any regex',
    severity: 'high'
  },
  name_reject_filter_failure: {
    category: 'name',
    description: 'Non-name phrase passed NAME_REJECT_PATTERNS (false positive)',
    severity: 'high'
  },
  name_partial_capture: {
    category: 'name',
    description: 'First name captured but last name dropped, or vice versa',
    severity: 'medium'
  },
  name_lowercase_capture: {
    category: 'name',
    description: 'Name captured with wrong casing',
    severity: 'low'
  },
  name_null_extraction: {
    category: 'name',
    description: 'Name not extracted at all when present in transcript',
    severity: 'high'
  },

  // Category buckets
  category_vocabulary_gap: {
    category: 'category',
    description: 'Expected category not in engine NEEDS_KEYWORDS list',
    severity: 'high'
  },
  category_priority_conflict: {
    category: 'category',
    description: 'Multiple categories present, wrong one ranked higher by keyword count',
    severity: 'medium'
  },
  category_multi_signal_conflict: {
    category: 'category',
    description: 'Contextual signals for multiple categories are nearly equal',
    severity: 'medium'
  },

  // Urgency buckets
  urgency_threshold_miss: {
    category: 'urgency',
    description: 'Aggregate score fell on wrong side of level threshold boundary',
    severity: 'high'
  },
  urgency_signal_absent: {
    category: 'urgency',
    description: 'Urgency keywords present in transcript but no layer detected them',
    severity: 'high'
  },
  urgency_multiplier_override: {
    category: 'urgency',
    description: 'Category bonus multiplier pushed score to wrong level',
    severity: 'medium'
  },
  urgency_engine_conflict: {
    category: 'urgency',
    description: 'Critical override (single layer ≥0.85) fired incorrectly',
    severity: 'medium'
  }
};

// Categories that are NOT in the engine's NEEDS_KEYWORDS
const MISSING_VOCABULARY = new Set(['EMERGENCY', 'UTILITIES', 'OTHER', 'FAMILY', 'GENERAL']);

class FailureBucketClassifier {
  constructor() {
    this.buckets = {};
    // Initialize all buckets as empty arrays
    for (const key of Object.keys(FAILURE_BUCKETS)) {
      this.buckets[key] = [];
    }
  }

  /**
   * Classify a single field failure into exactly one bucket.
   * @param {string} field - 'name' | 'amount' | 'category' | 'urgency'
   * @param {object} context - { caseId, actual, expected, transcript?, notes? }
   * @returns {string} bucket key
   */
  classify(field, context) {
    let bucketKey;

    switch (field) {
      case 'name':
        bucketKey = this._classifyName(context);
        break;
      case 'amount':
        bucketKey = this._classifyAmount(context);
        break;
      case 'category':
        bucketKey = this._classifyCategory(context);
        break;
      case 'urgency':
        bucketKey = this._classifyUrgency(context);
        break;
      default:
        throw new Error(`Unknown field: ${field}`);
    }

    this.buckets[bucketKey].push({
      caseId: context.caseId,
      actual: context.actual,
      expected: context.expected,
      timestamp: new Date().toISOString()
    });

    return bucketKey;
  }

  _classifyName(ctx) {
    const { actual, expected, transcript } = ctx;

    // Null extraction — name present but not captured
    if (!actual && expected) {
      // Check if this looks like a known intro pattern miss
      if (transcript) {
        const introPatterns = [
          /hello,?\s+my\s+name\s+is/i,
          /hi,?\s+i'?m\s+/i,
          /my\s+name\s+is/i,
          /this\s+is\s+/i
        ];
        for (const p of introPatterns) {
          if (p.test(transcript)) {
            return 'name_intro_pattern_missing';
          }
        }
      }
      return 'name_null_extraction';
    }

    // False positive — non-name phrase captured
    if (actual && expected) {
      const actualLower = actual.toLowerCase();
      const expectedLower = expected.toLowerCase();

      // Check if actual is clearly not a name (contains common non-name words)
      const nonNameIndicators = ['facing', 'calling', 'looking', 'needing', 'trying', 'getting'];
      for (const indicator of nonNameIndicators) {
        if (actualLower.includes(indicator)) {
          return 'name_reject_filter_failure';
        }
      }

      // Partial capture — one part of the name matches
      const actualParts = actual.trim().split(/\s+/);
      const expectedParts = expected.trim().split(/\s+/);
      if (actualParts.length < expectedParts.length &&
          expectedParts.some(ep => actualParts.some(ap => ap.toLowerCase() === ep.toLowerCase()))) {
        return 'name_partial_capture';
      }

      // Casing issue
      if (actualLower === expectedLower && actual !== expected) {
        return 'name_lowercase_capture';
      }
    }

    // Default
    return 'name_null_extraction';
  }

  _classifyAmount(ctx) {
    const { actual, expected, transcript } = ctx;

    // False positive
    if (actual !== null && (expected === null || expected === 'none')) {
      return 'amount_false_positive';
    }

    // Null extraction when amount present
    if (actual === null && expected !== null) {
      return 'amount_null_extraction';
    }

    // Both present but different
    if (actual !== null && expected !== null) {
      const numActual = typeof actual === 'number' ? actual : parseFloat(actual);
      const numExpected = typeof expected === 'number' ? expected : parseFloat(expected);

      // Check if this is a partial match (smaller number wins over compound)
      if (numActual < numExpected && numExpected > 0) {
        // Common pattern: "five hundred" matched instead of "three thousand five hundred"
        const ratio = numActual / numExpected;
        if (ratio < 0.5) {
          return 'amount_partial_match_override';
        }
      }

      // Close but outside tolerance
      if (!isNaN(numActual) && !isNaN(numExpected)) {
        const relativeError = Math.abs(numActual - numExpected) / Math.abs(numExpected);
        if (relativeError <= 0.25) {
          return 'amount_tolerance_exceeded';
        }
      }
    }

    // Default for spoken number issues
    return 'amount_spoken_number_failure';
  }

  _classifyCategory(ctx) {
    const { actual, expected, notes } = ctx;

    // Vocabulary gap — expected category not in engine
    if (MISSING_VOCABULARY.has(expected)) {
      return 'category_vocabulary_gap';
    }

    // Multi-signal conflict (check notes)
    if (notes && /multi-?category|multiple.*categor|conflicting/i.test(notes)) {
      return 'category_multi_signal_conflict';
    }

    // Priority conflict — both are valid categories but wrong one ranked higher
    return 'category_priority_conflict';
  }

  _classifyUrgency(ctx) {
    const { actual, expected, notes } = ctx;

    const levels = { 'LOW': 0, 'MEDIUM': 1, 'HIGH': 2, 'CRITICAL': 3 };
    const actualLevel = levels[actual] ?? -1;
    const expectedLevel = levels[expected] ?? -1;

    // Over-assessed to CRITICAL — likely the ≥0.85 override fired
    if (actual === 'CRITICAL' && expected !== 'CRITICAL') {
      return 'urgency_engine_conflict';
    }

    // Check for conflicting signals note
    if (notes && /conflict/i.test(notes)) {
      return 'urgency_signal_absent';
    }

    // Under-assessed — threshold miss (most common)
    if (actualLevel < expectedLevel) {
      return 'urgency_threshold_miss';
    }

    // Over-assessed (non-CRITICAL) — likely multiplier
    if (actualLevel > expectedLevel) {
      return 'urgency_multiplier_override';
    }

    // Fallback
    return 'urgency_threshold_miss';
  }

  /**
   * Get summarized bucket report.
   */
  getSummary() {
    const summary = {};
    let totalFailures = 0;

    for (const [key, cases] of Object.entries(this.buckets)) {
      if (cases.length > 0) {
        const def = FAILURE_BUCKETS[key];
        summary[key] = {
          category: def.category,
          description: def.description,
          severity: def.severity,
          count: cases.length,
          cases: cases.map(c => c.caseId)
        };
        totalFailures += cases.length;
      }
    }

    // Sort by count descending
    const sorted = Object.entries(summary)
      .sort(([, a], [, b]) => b.count - a.count)
      .reduce((obj, [key, val]) => { obj[key] = val; return obj; }, {});

    return {
      total_failures: totalFailures,
      bucket_count: Object.keys(sorted).length,
      buckets: sorted
    };
  }

  /**
   * Get the raw bucket data (all entries).
   */
  getRawBuckets() {
    return this.buckets;
  }

  /**
   * Reset for a new run.
   */
  reset() {
    for (const key of Object.keys(this.buckets)) {
      this.buckets[key] = [];
    }
  }
}

module.exports = { FailureBucketClassifier, FAILURE_BUCKETS, MISSING_VOCABULARY };
