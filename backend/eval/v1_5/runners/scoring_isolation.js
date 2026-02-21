/**
 * LAYER 3 — Scoring Isolation Layer
 * 
 * Prevents urgency threshold changes from hiding extraction defects.
 * Implements three scoring modes:
 *   Mode A — STRUCTURAL ONLY (name + amount + category, ignores urgency)
 *   Mode B — FULL STRICT (name + amount + category + urgency)
 *   Mode C — URGENCY ONLY (urgency accuracy on already-correct structural fields)
 */

const SCORING_MODES = {
  STRUCTURAL: 'structural',  // Mode A
  FULL_STRICT: 'full_strict', // Mode B
  URGENCY_ONLY: 'urgency_only' // Mode C
};

class ScoringIsolationLayer {
  constructor(config = {}) {
    this.amountTolerance = config.amountTolerance || 0.10;
    this.strictThreshold = config.strictThreshold || 0.95;
    this.acceptableThreshold = config.acceptableThreshold || 0.85;
  }

  /**
   * Score a single case in all three modes simultaneously.
   * Returns scores for each mode plus field-level match data.
   */
  scoreCase(actual, expected, strictness = {}) {
    const tolerance = strictness.amountTolerance ?? this.amountTolerance;
    const allowFuzzyName = strictness.allowFuzzyName || false;

    // Individual field matches
    const nameMatch = this._matchName(actual.name, expected.name, allowFuzzyName);
    const categoryMatch = (actual.category || '') === (expected.category || '');
    const urgencyMatch = (actual.urgencyLevel || '') === (expected.urgencyLevel || '');
    const amountMatch = this._matchAmount(actual.goalAmount, expected.goalAmount, tolerance);

    // Mode A — STRUCTURAL ONLY (3 fields, equal weight)
    const structuralCorrect = [nameMatch, categoryMatch, amountMatch].filter(Boolean).length;
    const structuralScore = +(structuralCorrect / 3).toFixed(4);

    // Mode B — FULL STRICT (4 fields, equal weight)
    const fullCorrect = [nameMatch, categoryMatch, urgencyMatch, amountMatch].filter(Boolean).length;
    const fullStrictScore = +(fullCorrect / 4).toFixed(4);

    // Mode C — URGENCY ONLY (binary: urgency correct or not)
    const urgencyScore = urgencyMatch ? 1.0 : 0.0;

    // Pass/fail determinations
    const structuralPass = structuralScore >= this.strictThreshold;
    const fullStrictPass = fullStrictScore >= this.strictThreshold;
    const acceptablePass = fullStrictScore >= this.acceptableThreshold;

    return {
      fieldMatches: {
        name: nameMatch,
        category: categoryMatch,
        urgency: urgencyMatch,
        amount: amountMatch
      },
      scores: {
        structural: structuralScore,
        full_strict: fullStrictScore,
        urgency_only: urgencyScore,
        acceptable: fullStrictScore  // same score, different threshold
      },
      passes: {
        structural_strict: structuralPass,
        full_strict: fullStrictPass,
        acceptable: acceptablePass
      }
    };
  }

  /**
   * Aggregate case-level scores into dataset-level summary.
   */
  aggregateScores(caseResults) {
    const totals = {
      structural: { passes: 0, total: 0, scoreSum: 0 },
      full_strict: { passes: 0, total: 0, scoreSum: 0 },
      urgency_only: { correct: 0, total: 0 },
      acceptable: { passes: 0, total: 0 }
    };

    for (const result of caseResults) {
      totals.structural.total++;
      totals.full_strict.total++;
      totals.urgency_only.total++;
      totals.acceptable.total++;

      totals.structural.scoreSum += result.scores.structural;
      totals.full_strict.scoreSum += result.scores.full_strict;

      if (result.passes.structural_strict) totals.structural.passes++;
      if (result.passes.full_strict) totals.full_strict.passes++;
      if (result.scores.urgency_only === 1.0) totals.urgency_only.correct++;
      if (result.passes.acceptable) totals.acceptable.passes++;
    }

    const n = totals.structural.total || 1;

    return {
      structural_score: {
        pass_rate: +(totals.structural.passes / n).toFixed(4),
        passes: totals.structural.passes,
        total: n,
        mean_score: +(totals.structural.scoreSum / n).toFixed(4)
      },
      urgency_score: {
        accuracy: +(totals.urgency_only.correct / n).toFixed(4),
        correct: totals.urgency_only.correct,
        total: n
      },
      strict_score: {
        pass_rate: +(totals.full_strict.passes / n).toFixed(4),
        passes: totals.full_strict.passes,
        total: n,
        mean_score: +(totals.full_strict.scoreSum / n).toFixed(4)
      },
      acceptable_score: {
        pass_rate: +(totals.acceptable.passes / n).toFixed(4),
        passes: totals.acceptable.passes,
        total: n
      }
    };
  }

  _matchName(actual, expected, fuzzy = false) {
    if (!expected || expected === 'Unknown') {
      return !actual || actual === 'Unknown';
    }
    if (!actual) return false;

    if (fuzzy) {
      const clean = s => (s || '').toLowerCase().replace(/[^a-z ]/g, '').trim();
      return clean(actual) === clean(expected);
    }

    return actual.trim() === expected.trim();
  }

  _matchAmount(actual, expected, tolerance) {
    // Both null/none → match
    if ((expected === null || expected === 'none') && (actual === null || actual === 'none')) {
      return true;
    }
    // One null, other not → no match
    if (expected === null || expected === 'none' || actual === null || actual === 'none') {
      return false;
    }

    const numActual = typeof actual === 'number' ? actual : parseFloat(actual);
    const numExpected = typeof expected === 'number' ? expected : parseFloat(expected);

    if (isNaN(numActual) || isNaN(numExpected)) return false;

    // Exact match
    if (numActual === numExpected) return true;

    // Tolerance check
    if (numExpected === 0) return numActual === 0;
    return Math.abs(numActual - numExpected) <= Math.abs(numExpected) * tolerance;
  }
}

module.exports = { ScoringIsolationLayer, SCORING_MODES };
