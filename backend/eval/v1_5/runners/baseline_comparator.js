/**
 * Baseline Comparator — Compare two report runs
 * 
 * Implements: --compare <previous_report_path>
 * 
 * Must:
 *   - Compare field-level deltas
 *   - Show which field changed
 *   - Show which bucket improved or regressed
 *   - Refuse comparison if dataset_manifest_hash differs
 */

const fs = require('fs');
const path = require('path');

class BaselineComparator {
  /**
   * Compare current report with a previous report.
   * @param {object} currentReport - the report from the current run
   * @param {string} previousReportPath - path to previous report JSON
   */
  compare(currentReport, previousReportPath) {
    // Load previous report
    const resolvedPath = path.resolve(previousReportPath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`❌ Previous report not found: ${resolvedPath}`);
      return null;
    }

    const previousReport = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));

    // ── Refuse comparison if dataset manifests differ ──
    if (currentReport.metadata.dataset_manifest_hash !== previousReport.metadata.dataset_manifest_hash) {
      console.error('❌ COMPARISON REFUSED: Dataset manifest hashes differ.');
      console.error(`   Current:  ${currentReport.metadata.dataset_manifest_hash.slice(0, 16)}...`);
      console.error(`   Previous: ${previousReport.metadata.dataset_manifest_hash.slice(0, 16)}...`);
      console.error('   Datasets may have changed. Regenerate manifest and re-run both.');
      return null;
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  BASELINE COMPARISON');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Current run:  ${currentReport.metadata.timestamp}`);
    console.log(`  Previous run: ${previousReport.metadata.timestamp}`);
    console.log(`  Engine hash match: ${currentReport.metadata.engine_hash === previousReport.metadata.engine_hash ? '✅ SAME' : '⚠️ DIFFERENT'}`);
    console.log('');

    // ── Score Deltas ──
    console.log('  SCORE DELTAS:');
    const scorePairs = [
      ['Structural', 'structural_score', 'pass_rate'],
      ['Urgency', 'urgency_score', 'accuracy'],
      ['Full Strict', 'strict_score', 'pass_rate'],
      ['Acceptable', 'acceptable_score', 'pass_rate']
    ];

    for (const [label, key, metric] of scorePairs) {
      const curr = currentReport.summary[key]?.[metric] ?? 0;
      const prev = previousReport.summary[key]?.[metric] ?? 0;
      const delta = curr - prev;
      const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
      const color = delta > 0 ? '🟢' : delta < 0 ? '🔴' : '⚪';
      console.log(`  ${color} ${label}: ${(prev * 100).toFixed(2)}% → ${(curr * 100).toFixed(2)}% (${arrow} ${(delta * 100).toFixed(2)}%)`);
    }
    console.log('');

    // ── Field-Level Deltas ──
    console.log('  FIELD-LEVEL DELTAS:');
    const fieldLabels = ['name', 'category', 'urgency_level', 'amount'];
    for (const field of fieldLabels) {
      const currAcc = currentReport.field_metrics?.[field]?.accuracy ?? 0;
      const prevAcc = previousReport.field_metrics?.[field]?.accuracy ?? 0;
      const delta = currAcc - prevAcc;
      const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
      const color = delta > 0 ? '🟢' : delta < 0 ? '🔴' : '⚪';
      console.log(`  ${color} ${field}: ${(prevAcc * 100).toFixed(1)}% → ${(currAcc * 100).toFixed(1)}% (${arrow} ${(delta * 100).toFixed(1)}%)`);
    }
    console.log('');

    // ── Failure Bucket Deltas ──
    console.log('  FAILURE BUCKET CHANGES:');
    const currBuckets = currentReport.failure_buckets?.buckets || {};
    const prevBuckets = previousReport.failure_buckets?.buckets || {};
    const allBucketKeys = new Set([...Object.keys(currBuckets), ...Object.keys(prevBuckets)]);

    const bucketDeltas = [];
    for (const key of allBucketKeys) {
      const currCount = currBuckets[key]?.count || 0;
      const prevCount = prevBuckets[key]?.count || 0;
      const delta = currCount - prevCount;
      if (delta !== 0) {
        bucketDeltas.push({ key, prevCount, currCount, delta });
      }
    }

    bucketDeltas.sort((a, b) => a.delta - b.delta); // improvements first (negative delta)

    if (bucketDeltas.length === 0) {
      console.log('  ⚪ No bucket changes detected.');
    } else {
      for (const bd of bucketDeltas) {
        const color = bd.delta < 0 ? '🟢' : '🔴';
        const arrow = bd.delta < 0 ? '↓' : '↑';
        console.log(`  ${color} ${bd.key}: ${bd.prevCount} → ${bd.currCount} (${arrow} ${Math.abs(bd.delta)})`);
      }
    }
    console.log('');

    // ── Per-Dataset Deltas ──
    if (currentReport.dataset_breakdown && previousReport.dataset_breakdown) {
      console.log('  PER-DATASET STRICT DELTAS:');
      const allDs = new Set([
        ...Object.keys(currentReport.dataset_breakdown),
        ...Object.keys(previousReport.dataset_breakdown)
      ]);

      for (const ds of allDs) {
        const currRate = currentReport.dataset_breakdown[ds]?.strict_score?.pass_rate ?? null;
        const prevRate = previousReport.dataset_breakdown[ds]?.strict_score?.pass_rate ?? null;

        if (currRate !== null && prevRate !== null) {
          const delta = currRate - prevRate;
          const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
          console.log(`    ${ds}: ${(prevRate * 100).toFixed(1)}% → ${(currRate * 100).toFixed(1)}% (${arrow})`);
        } else if (currRate !== null) {
          console.log(`    ${ds}: NEW (${(currRate * 100).toFixed(1)}%)`);
        }
      }
      console.log('');
    }

    return {
      manifest_match: true,
      engine_match: currentReport.metadata.engine_hash === previousReport.metadata.engine_hash,
      scorePairs: scorePairs.map(([label, key, metric]) => ({
        label,
        previous: previousReport.summary[key]?.[metric] ?? 0,
        current: currentReport.summary[key]?.[metric] ?? 0
      })),
      bucketDeltas
    };
  }
}

module.exports = { BaselineComparator };
