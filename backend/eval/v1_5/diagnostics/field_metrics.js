/**
 * LAYER 2 — Field-Level Extraction Metrics
 * 
 * Separates signal failures from scoring failures.
 * Produces per-field accuracy, confusion matrices, and partial match tracking.
 * STRICT score must NOT be the only output metric.
 */

class FieldMetricsCollector {
  constructor() {
    this.fields = {
      name: { correct: 0, total: 0, failures: [], partial_matches: [] },
      amount: { correct: 0, total: 0, null_extractions: 0, mismatches: [], tolerance_failures: [] },
      category: { correct: 0, total: 0, confusion_matrix: {}, failures: [] },
      urgency_level: { correct: 0, total: 0, under_count: 0, over_count: 0, failures: [] }
    };
    this.urgency_raw_scores = [];
  }

  /**
   * Record a single case evaluation result.
   */
  recordCase(caseId, actual, expected, matchResults, rawUrgencyScore = null) {
    this._recordName(caseId, actual.name, expected.name, matchResults.nameMatch);
    this._recordAmount(caseId, actual.goalAmount, expected.goalAmount, matchResults.amountMatch);
    this._recordCategory(caseId, actual.category, expected.category, matchResults.categoryMatch);
    this._recordUrgency(caseId, actual.urgencyLevel, expected.urgencyLevel, matchResults.urgencyMatch);

    if (rawUrgencyScore !== null && rawUrgencyScore !== undefined) {
      this.urgency_raw_scores.push({ caseId, score: rawUrgencyScore });
    }
  }

  _recordName(caseId, actual, expected, matched) {
    this.fields.name.total++;
    if (matched) {
      this.fields.name.correct++;
    } else {
      const failure = { caseId, actual, expected };

      // Detect partial matches
      if (actual && expected) {
        const actualLower = (actual || '').toLowerCase().trim();
        const expectedLower = (expected || '').toLowerCase().trim();
        if (expectedLower.includes(actualLower) || actualLower.includes(expectedLower)) {
          failure.type = 'partial';
          this.fields.name.partial_matches.push(failure);
        }
      }

      this.fields.name.failures.push(failure);
    }
  }

  _recordAmount(caseId, actual, expected, matched) {
    this.fields.amount.total++;
    if (matched) {
      this.fields.amount.correct++;
    } else {
      if (actual === null && expected !== null) {
        this.fields.amount.null_extractions++;
      }
      this.fields.amount.mismatches.push({ caseId, actual, expected });
    }
  }

  _recordCategory(caseId, actual, expected, matched) {
    this.fields.category.total++;

    // Build confusion matrix
    const key = `${actual || 'NULL'} -> ${expected || 'NULL'}`;
    if (!this.fields.category.confusion_matrix[key]) {
      this.fields.category.confusion_matrix[key] = { count: 0, cases: [] };
    }
    this.fields.category.confusion_matrix[key].count++;
    this.fields.category.confusion_matrix[key].cases.push(caseId);

    if (matched) {
      this.fields.category.correct++;
    } else {
      this.fields.category.failures.push({ caseId, actual, expected });
    }
  }

  _recordUrgency(caseId, actual, expected, matched) {
    this.fields.urgency_level.total++;
    if (matched) {
      this.fields.urgency_level.correct++;
    } else {
      const levels = { 'LOW': 0, 'MEDIUM': 1, 'HIGH': 2, 'CRITICAL': 3 };
      const actualLevel = levels[actual] ?? -1;
      const expectedLevel = levels[expected] ?? -1;

      if (actualLevel < expectedLevel) {
        this.fields.urgency_level.under_count++;
      } else if (actualLevel > expectedLevel) {
        this.fields.urgency_level.over_count++;
      }

      this.fields.urgency_level.failures.push({ caseId, actual, expected });
    }
  }

  /**
   * Compute final field metrics for report output.
   */
  computeMetrics() {
    const nameMetrics = {
      accuracy: this.fields.name.total > 0
        ? +(this.fields.name.correct / this.fields.name.total).toFixed(4)
        : 0,
      correct: this.fields.name.correct,
      total: this.fields.name.total,
      failures: this.fields.name.failures,
      partial_matches: this.fields.name.partial_matches
    };

    const amountMetrics = {
      accuracy: this.fields.amount.total > 0
        ? +(this.fields.amount.correct / this.fields.amount.total).toFixed(4)
        : 0,
      correct: this.fields.amount.correct,
      total: this.fields.amount.total,
      null_count: this.fields.amount.null_extractions,
      mismatch_count: this.fields.amount.mismatches.length,
      mismatches: this.fields.amount.mismatches
    };

    const categoryMetrics = {
      accuracy: this.fields.category.total > 0
        ? +(this.fields.category.correct / this.fields.category.total).toFixed(4)
        : 0,
      correct: this.fields.category.correct,
      total: this.fields.category.total,
      confusion_matrix: this.fields.category.confusion_matrix,
      failures: this.fields.category.failures
    };

    // Urgency raw score stats
    let urgencyRawScore = { mean: 0, std_dev: 0, count: 0 };
    if (this.urgency_raw_scores.length > 0) {
      const scores = this.urgency_raw_scores.map(s => s.score);
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;
      urgencyRawScore = {
        mean: +mean.toFixed(4),
        std_dev: +Math.sqrt(variance).toFixed(4),
        count: scores.length
      };
    }

    const urgencyLevelMetrics = {
      accuracy: this.fields.urgency_level.total > 0
        ? +(this.fields.urgency_level.correct / this.fields.urgency_level.total).toFixed(4)
        : 0,
      correct: this.fields.urgency_level.correct,
      total: this.fields.urgency_level.total,
      under_count: this.fields.urgency_level.under_count,
      over_count: this.fields.urgency_level.over_count,
      failures: this.fields.urgency_level.failures
    };

    return {
      name: nameMetrics,
      amount: amountMetrics,
      category: categoryMetrics,
      urgency_raw_score: urgencyRawScore,
      urgency_level: urgencyLevelMetrics
    };
  }

  /**
   * Reset for a new run.
   */
  reset() {
    this.fields = {
      name: { correct: 0, total: 0, failures: [], partial_matches: [] },
      amount: { correct: 0, total: 0, null_extractions: 0, mismatches: [], tolerance_failures: [] },
      category: { correct: 0, total: 0, confusion_matrix: {}, failures: [] },
      urgency_level: { correct: 0, total: 0, under_count: 0, over_count: 0, failures: [] }
    };
    this.urgency_raw_scores = [];
  }
}

module.exports = { FieldMetricsCollector };
