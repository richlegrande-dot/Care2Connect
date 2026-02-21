/**
 * Debug Metrics (Post-Eval)
 *
 * Purpose: Produce richer diagnostics after an eval run.
 * - Uses parserAdapter to re-parse datasets with current enhancements.
 * - Outputs JSON + Markdown with per-bucket counts, dataset splits, and top cases.
 *
 * Usage:
 *   node backend/eval/v4plus/runners/debug_metrics_post_eval.js --dataset all
 *   node backend/eval/v4plus/runners/debug_metrics_post_eval.js --dataset hard60 --limit 30
 */

const fs = require('fs');
const path = require('path');
const parserAdapter = require('./parserAdapter');

const DEFAULT_TOLERANCE = 0.05;

const DATASETS = {
  core30: { name: 'core30', file: 'core30.jsonl', priority: 'CRITICAL' },
  hard60: { name: 'hard60', file: 'hard60.jsonl', priority: 'HIGH' },
  realistic50: { name: 'realistic50', file: 'realistic50.jsonl', priority: 'MEDIUM' },
  fuzz200: { name: 'fuzz200', file: 'fuzz200.jsonl', priority: 'LOW' }
};

function readJsonl(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.trim().split('\n').map(line => JSON.parse(line));
}

function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z]/g, '');
}

function normalizeCategory(category) {
  return (category || '').trim().toUpperCase();
}

function extractAmounts(text) {
  if (!text) return [];
  const matches = text.match(/\$?\d{1,3}(?:,\d{3})*(?:\.\d+)?/g) || [];
  const numbers = matches
    .map(raw => parseFloat(raw.replace(/[$,]/g, '')))
    .filter(num => !Number.isNaN(num) && num > 0);
  return Array.from(new Set(numbers));
}

function getUrgencyIndex(level) {
  const order = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  return order.indexOf((level || '').toUpperCase());
}

function getDatasetSelection(args) {
  const idx = args.indexOf('--dataset');
  if (idx === -1) return ['core30', 'hard60', 'realistic50', 'fuzz200'];
  const val = args[idx + 1];
  if (!val || val === 'all') return ['core30', 'hard60', 'realistic50', 'fuzz200'];
  if (!DATASETS[val]) {
    throw new Error(`Unknown dataset: ${val}`);
  }
  return [val];
}

function getLimit(args) {
  const idx = args.indexOf('--limit');
  if (idx === -1) return null;
  const val = parseInt(args[idx + 1], 10);
  return Number.isNaN(val) ? null : val;
}

function getRawDebugFlag(args) {
  return args.includes('--raw-debug');
}

function summarizeDebug(parseResult) {
  const debug = parseResult?.debug || {};
  const confidence = parseResult?.confidence || {};
  const nameDebug = debug.name || {};

  const summary = {
    confidence: {
      name: confidence.name,
      category: confidence.category,
      urgencyLevel: confidence.urgencyLevel,
      goalAmount: confidence.goalAmount,
      overall: confidence.overall
    },
    name: {
      tier: nameDebug.tier || null,
      enhancedSelected: nameDebug.enhanced?.selected ?? null,
      enhancedConfidence: nameDebug.enhanced?.confidence ?? null,
      attemptCount: Array.isArray(nameDebug.attempts) ? nameDebug.attempts.length : null
    },
    category: Array.isArray(debug.category) ? debug.category.slice(-3) : debug.category || null,
    urgency: Array.isArray(debug.urgency) ? debug.urgency.slice(-3) : debug.urgency || null
  };

  return summary;
}

async function analyze() {
  // Match run_eval_v4plus defaults for consistent behavior
  process.env.USE_V2C_ENHANCEMENTS = 'false';
  process.env.USE_V2D_ENHANCEMENTS = 'true';
  process.env.USE_V3C_ENHANCEMENTS = 'true';
  process.env.USE_V3D_DEESCALATION = 'false';
  process.env.USE_CORE30_URGENCY_OVERRIDES = 'true';
  process.env.USE_PHASE2_URGENCY_BOOSTS = 'true';
  process.env.USE_PHASE3_CATEGORY_FIXES = 'false';
  process.env.USE_PHASE36_URGENCY_DEESCALATION = 'true';
  process.env.USE_PHASE37_URGENCY_DEESCALATION = 'true';

  const args = process.argv.slice(2);
  const selected = getDatasetSelection(args);
  const limit = getLimit(args);
  const includeRawDebug = getRawDebugFlag(args);

  const datasetsDir = path.join(__dirname, '..', 'datasets');
  const totals = {
    cases: 0,
    categoryWrong: 0,
    urgencyOver: 0,
    urgencyUnder: 0,
    amountMissing: 0,
    amountOutsideTolerance: 0,
    amountWrongSelection: 0,
    amountUnexpected: 0,
    nameWrong: 0
  };

  const byDataset = {};
  const cases = {
    categoryWrong: [],
    urgencyOver: [],
    urgencyUnder: [],
    amountMissing: [],
    amountOutsideTolerance: [],
    amountWrongSelection: [],
    amountUnexpected: [],
    nameWrong: []
  };

  for (const datasetKey of selected) {
    const dataset = DATASETS[datasetKey];
    const datasetPath = path.join(datasetsDir, dataset.file);
    const tests = readJsonl(datasetPath);

    byDataset[dataset.name] = {
      total: tests.length,
      categoryWrong: 0,
      urgencyOver: 0,
      urgencyUnder: 0,
      amountMissing: 0,
      amountOutsideTolerance: 0,
      amountWrongSelection: 0,
      amountUnexpected: 0,
      nameWrong: 0
    };

    for (const test of tests) {
      if (!test || !test.expected) continue;

      const transcriptText = test.transcriptText || '';
      const transcriptShort = transcriptText.substring(0, 140);
      const transcriptLength = transcriptText.length;
      const amounts = extractAmounts(transcriptText);

      const parseResult = await parserAdapter.extractAllDetailed(test.transcriptText, {
        id: test.id,
        expected: test.expected
      });
      const result = parseResult?.results || {};
      const debugSummary = summarizeDebug(parseResult);
      const rawDebug = includeRawDebug ? parseResult?.debug || null : null;

      totals.cases += 1;

      // Category mismatch
      const expectedCategory = normalizeCategory(test.expected.category);
      const actualCategory = normalizeCategory(result.category);
      if (expectedCategory && actualCategory && expectedCategory !== actualCategory) {
        totals.categoryWrong += 1;
        byDataset[dataset.name].categoryWrong += 1;
        cases.categoryWrong.push({
          id: test.id,
          dataset: dataset.name,
          priority: dataset.priority,
          expected: expectedCategory,
          actual: actualCategory,
          transcriptShort,
          transcriptLength,
          amountsFound: amounts.slice(0, 8),
          debugSummary,
          rawDebug
        });
      }

      // Urgency gap
      const expectedUrgency = (test.expected.urgencyLevel || '').toUpperCase();
      const actualUrgency = (result.urgencyLevel || result.urgency || '').toUpperCase();
      const expectedIdx = getUrgencyIndex(expectedUrgency);
      const actualIdx = getUrgencyIndex(actualUrgency);
      if (expectedIdx >= 0 && actualIdx >= 0) {
        if (actualIdx > expectedIdx) {
          totals.urgencyOver += 1;
          byDataset[dataset.name].urgencyOver += 1;
          cases.urgencyOver.push({
            id: test.id,
            dataset: dataset.name,
            priority: dataset.priority,
            expected: expectedUrgency,
            actual: actualUrgency,
            gap: actualIdx - expectedIdx,
            expectedIdx,
            actualIdx,
            transcriptShort,
            transcriptLength,
            debugSummary,
            rawDebug
          });
        } else if (actualIdx < expectedIdx) {
          totals.urgencyUnder += 1;
          byDataset[dataset.name].urgencyUnder += 1;
          cases.urgencyUnder.push({
            id: test.id,
            dataset: dataset.name,
            priority: dataset.priority,
            expected: expectedUrgency,
            actual: actualUrgency,
            gap: expectedIdx - actualIdx,
            expectedIdx,
            actualIdx,
            transcriptShort,
            transcriptLength,
            debugSummary,
            rawDebug
          });
        }
      }

      // Name mismatch (simple normalization)
      const expectedName = normalizeName(test.expected.name);
      const actualName = normalizeName(result.name);
      if (expectedName && actualName && expectedName !== actualName) {
        totals.nameWrong += 1;
        byDataset[dataset.name].nameWrong += 1;
        cases.nameWrong.push({
          id: test.id,
          dataset: dataset.name,
          priority: dataset.priority,
          expected: test.expected.name,
          actual: result.name,
          expectedNormalized: expectedName,
          actualNormalized: actualName,
          transcriptShort,
          transcriptLength,
          debugSummary,
          rawDebug
        });
      }

      // Amount diagnostics
      const expectedAmount = test.expected.goalAmount;
      const actualAmount = result.goalAmount;

      if (expectedAmount == null && actualAmount != null) {
        totals.amountUnexpected += 1;
        byDataset[dataset.name].amountUnexpected += 1;
        cases.amountUnexpected.push({
          id: test.id,
          dataset: dataset.name,
          priority: dataset.priority,
          expected: null,
          actual: actualAmount,
          amountsFound: amounts.slice(0, 8),
          transcriptShort,
          transcriptLength,
          debugSummary,
          rawDebug
        });
      } else if (expectedAmount != null && actualAmount == null) {
        totals.amountMissing += 1;
        byDataset[dataset.name].amountMissing += 1;
        cases.amountMissing.push({
          id: test.id,
          dataset: dataset.name,
          priority: dataset.priority,
          expected: expectedAmount,
          actual: null,
          amountsFound: amounts.slice(0, 8),
          expectedInText: amounts.includes(expectedAmount),
          transcriptShort,
          transcriptLength,
          debugSummary,
          rawDebug
        });
      } else if (expectedAmount != null && actualAmount != null) {
        const diff = Math.abs(actualAmount - expectedAmount);
        const allowed = Math.max(1, expectedAmount * DEFAULT_TOLERANCE);
        if (diff > allowed) {
          const expectedInText = amounts.includes(expectedAmount);
          const actualInText = amounts.includes(actualAmount);

          if (expectedInText && actualInText && expectedAmount !== actualAmount) {
            totals.amountWrongSelection += 1;
            byDataset[dataset.name].amountWrongSelection += 1;
            cases.amountWrongSelection.push({
              id: test.id,
              dataset: dataset.name,
              priority: dataset.priority,
              expected: expectedAmount,
              actual: actualAmount,
              diff,
              allowed,
              expectedInText,
              actualInText,
              amountsFound: amounts.slice(0, 8),
              transcriptShort,
              transcriptLength,
              debugSummary,
              rawDebug
            });
          } else {
            totals.amountOutsideTolerance += 1;
            byDataset[dataset.name].amountOutsideTolerance += 1;
            cases.amountOutsideTolerance.push({
              id: test.id,
              dataset: dataset.name,
              priority: dataset.priority,
              expected: expectedAmount,
              actual: actualAmount,
              diff,
              allowed,
              expectedInText,
              actualInText,
              amountsFound: amounts.slice(0, 8),
              transcriptShort,
              transcriptLength,
              debugSummary,
              rawDebug
            });
          }
        }
      }

      if (limit && totals.cases >= limit) break;
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const report = {
    timestamp,
    datasets: selected,
    config: {
      tolerance: DEFAULT_TOLERANCE,
      includeRawDebug,
      enhancements: {
        USE_V2C_ENHANCEMENTS: process.env.USE_V2C_ENHANCEMENTS,
        USE_V2D_ENHANCEMENTS: process.env.USE_V2D_ENHANCEMENTS,
        USE_V3C_ENHANCEMENTS: process.env.USE_V3C_ENHANCEMENTS,
        USE_V3D_DEESCALATION: process.env.USE_V3D_DEESCALATION,
        USE_CORE30_URGENCY_OVERRIDES: process.env.USE_CORE30_URGENCY_OVERRIDES,
        USE_PHASE2_URGENCY_BOOSTS: process.env.USE_PHASE2_URGENCY_BOOSTS,
        USE_PHASE3_CATEGORY_FIXES: process.env.USE_PHASE3_CATEGORY_FIXES,
        USE_PHASE36_URGENCY_DEESCALATION: process.env.USE_PHASE36_URGENCY_DEESCALATION,
        USE_PHASE37_URGENCY_DEESCALATION: process.env.USE_PHASE37_URGENCY_DEESCALATION
      }
    },
    totals,
    byDataset,
    topCases: {
      categoryWrong: cases.categoryWrong.slice(0, 20),
      urgencyOver: cases.urgencyOver.slice(0, 20),
      urgencyUnder: cases.urgencyUnder.slice(0, 20),
      nameWrong: cases.nameWrong.slice(0, 20),
      amountMissing: cases.amountMissing.slice(0, 20),
      amountWrongSelection: cases.amountWrongSelection.slice(0, 20),
      amountOutsideTolerance: cases.amountOutsideTolerance.slice(0, 20),
      amountUnexpected: cases.amountUnexpected.slice(0, 20)
    }
  };

  const reportsDir = path.join(__dirname, '..', 'reports');
  const jsonPath = path.join(reportsDir, `debug_metrics_${selected.join('-')}_${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  const mdPath = path.join(reportsDir, `debug_metrics_${selected.join('-')}_${timestamp}.md`);
  const md = [];
  md.push(`# Debug Metrics Report (${selected.join(', ')})`);
  md.push('');
  md.push(`Timestamp: ${new Date().toISOString()}`);
  md.push('');
  md.push('## Totals');
  md.push(`- Cases: ${totals.cases}`);
  md.push(`- Category wrong: ${totals.categoryWrong}`);
  md.push(`- Urgency over: ${totals.urgencyOver}`);
  md.push(`- Urgency under: ${totals.urgencyUnder}`);
  md.push(`- Name wrong: ${totals.nameWrong}`);
  md.push(`- Amount missing: ${totals.amountMissing}`);
  md.push(`- Amount wrong selection: ${totals.amountWrongSelection}`);
  md.push(`- Amount outside tolerance: ${totals.amountOutsideTolerance}`);
  md.push(`- Amount unexpected: ${totals.amountUnexpected}`);
  md.push('');
  md.push('## By Dataset');
  Object.keys(byDataset).forEach(ds => {
    const d = byDataset[ds];
    md.push(`- ${ds}: category ${d.categoryWrong}, urgencyOver ${d.urgencyOver}, urgencyUnder ${d.urgencyUnder}, name ${d.nameWrong}, amountMissing ${d.amountMissing}, amountWrongSel ${d.amountWrongSelection}, amountOutsideTol ${d.amountOutsideTolerance}`);
  });
  md.push('');
  md.push('## Top Cases (Sample)');
  md.push('');
  md.push('### Category Wrong');
  cases.categoryWrong.slice(0, 10).forEach(c => {
    md.push(`- ${c.id} (${c.dataset}): ${c.actual} → ${c.expected}`);
  });
  md.push('');
  md.push('### Urgency Over');
  cases.urgencyOver.slice(0, 10).forEach(c => {
    md.push(`- ${c.id} (${c.dataset}): ${c.actual} → ${c.expected} (gap ${c.gap})`);
  });
  md.push('');
  md.push('### Urgency Under');
  cases.urgencyUnder.slice(0, 10).forEach(c => {
    md.push(`- ${c.id} (${c.dataset}): ${c.actual} → ${c.expected} (gap ${c.gap})`);
  });
  md.push('');
  md.push('### Amount Wrong Selection');
  cases.amountWrongSelection.slice(0, 10).forEach(c => {
    md.push(`- ${c.id} (${c.dataset}): ${c.actual} → ${c.expected}`);
  });

  fs.writeFileSync(mdPath, md.join('\n'));

  console.log('Debug metrics report saved:');
  console.log(`- ${jsonPath}`);
  console.log(`- ${mdPath}`);
}

analyze().catch(error => {
  console.error('Debug metrics failed:', error.message);
  process.exit(1);
});
