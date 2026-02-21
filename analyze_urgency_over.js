#!/usr/bin/env node
// Analyze urgency_over_assessed cases from all500 dataset
// Produces JSON report for Phase 6 design

const fs = require('fs');
const path = require('path');

// Load datasets
const datasets = {
  core30: 'backend/eval/feb-v1/datasets/core30.jsonl',
  hard60: 'backend/eval/feb-v1/datasets/hard60.jsonl',
  fuzz500: 'backend/eval/feb-v1/datasets/fuzz500.jsonl'
};

function loadDataset(filePath) {
  return fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .filter(l => l.trim())
    .map(l => JSON.parse(l))
    .filter(c => c.id && c.transcriptText);
}

// Set env vars to match evaluator
process.env.ZERO_OPENAI_MODE = '1';
process.env.ENABLE_AI = '0';
process.env.OPENAI_API_KEY = '';
process.env.USE_V2D_CATEGORY_ENHANCEMENTS = 'true';
process.env.USE_V3B_URGENCY_THRESHOLDS = 'true';
process.env.USE_V3C_URGENCY_BOOST = 'true';
process.env.USE_CORE30_URGENCY_OVERRIDES = 'true';
process.env.USE_PHASE2_URGENCY_BOOSTS = 'true';
process.env.USE_PHASE36_URGENCY_DEESCALATION = 'true';
process.env.USE_PHASE37_URGENCY_DEESCALATION = 'true';
process.env.USE_PHASE41_URGENCY_ESCALATION = 'true';
process.env.USE_PHASE50_URGENCY_ESCALATION = 'true';

const URGENCY_ORDER = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function urgencyIndex(level) {
  return URGENCY_ORDER.indexOf(level);
}

async function main() {
  // Use ParserAdapter (same as eval runner)
  const adapter = require('./backend/eval/feb-v1/runners/parserAdapter.js');

  let allCases = [];
  for (const [dsName, dsPath] of Object.entries(datasets)) {
    const cases = loadDataset(dsPath);
    cases.forEach(c => c._dataset = dsName);
    allCases = allCases.concat(cases);
  }

  console.log(`Loaded ${allCases.length} cases from all500`);

  const overAssessed = [];

  for (const testCase of allCases) {
    try {
      const result = await adapter.extractAll(testCase.transcriptText, { id: testCase.id, expected: testCase.expectedOutput || {} });
      
      const actualUrgency = (result.urgencyLevel || result.urgency || 'UNKNOWN').toUpperCase();
      const expected = testCase.expectedOutput || testCase.expected || {};
      const expectedUrgency = (expected.urgencyLevel || 'UNKNOWN').toUpperCase();
      const actualCategory = (result.category || result.primaryCategory || 'UNKNOWN').toUpperCase();
      const expectedCategory = (expected.category || 'UNKNOWN').toUpperCase();
      
      // Check if over-assessed: actual urgency is HIGHER than expected
      if (urgencyIndex(actualUrgency) > urgencyIndex(expectedUrgency)) {
        overAssessed.push({
          id: testCase.id,
          dataset: testCase._dataset,
          transcriptText: testCase.transcriptText,
          transcriptSnippet: testCase.transcriptText.substring(0, 200),
          expectedUrgency,
          actualUrgency,
          transition: `${expectedUrgency}->${actualUrgency}`,
          expectedCategory,
          actualCategory,
          categoryMatch: actualCategory === expectedCategory,
          templateId: testCase.templateId || testCase._meta?.templateId || null,
          expectedAmount: expected.goalAmount || null,
          actualAmount: result.amount || result.financialAmount || null
        });
      }
    } catch (err) {
      console.error(`Error processing ${testCase.id}:`, err.message);
    }
  }

  console.log(`\nFound ${overAssessed.length} urgency_over_assessed cases\n`);

  // Group by transition
  const transitions = {};
  overAssessed.forEach(c => {
    if (!transitions[c.transition]) transitions[c.transition] = [];
    transitions[c.transition].push(c);
  });

  console.log('=== TRANSITIONS ===');
  Object.entries(transitions)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([t, cases]) => {
      const dsBreak = {};
      cases.forEach(c => { dsBreak[c.dataset] = (dsBreak[c.dataset] || 0) + 1; });
      console.log(`${t}: ${cases.length} cases  ${JSON.stringify(dsBreak)}`);
    });

  // Group by expected urgency
  console.log('\n=== BY EXPECTED URGENCY ===');
  const byExpected = {};
  overAssessed.forEach(c => {
    if (!byExpected[c.expectedUrgency]) byExpected[c.expectedUrgency] = [];
    byExpected[c.expectedUrgency].push(c);
  });
  Object.entries(byExpected).forEach(([k, v]) => console.log(`Expected ${k}: ${v.length} cases`));

  // Show all cases
  console.log('\n=== ALL CASES ===');
  overAssessed.forEach(c => {
    const snip = c.transcriptText.substring(0, 100).replace(/\n/g, ' ');
    console.log(`${c.id} | ${c.transition} | expCat=${c.expectedCategory} actCat=${c.actualCategory} | ${snip}`);
  });

  // Look for common patterns in transcripts
  console.log('\n=== PATTERN ANALYSIS ===');
  const patterns = {
    'has_planning': /planning|plan to|next (?:few )?months?|eventually|in the future|long.?term/i,
    'has_per_month': /per month|monthly|a month|each month/i,
    'has_training': /training|certification|program|school|education|class|course/i,
    'has_budget': /budget|save|saving|afford/i,
    'has_manage': /manage|managing|get by|getting by|cope|coping|stable|ok for now/i,
    'has_not_urgent': /not (?:an? )?(?:emergency|urgent|rush)|no rush|when.*(?:can|ready)/i,
    'has_exploring': /looking into|explore|consider|thinking about/i,
    'has_ongoing': /ongoing|regular|recurring|every month|each month/i,
    'has_future_tense': /will need|going to need|might need|may need|could use/i,
    'has_moderate': /would help|could help|appreciate|if possible|when you can/i
  };

  Object.entries(patterns).forEach(([name, regex]) => {
    const matching = overAssessed.filter(c => regex.test(c.transcriptText));
    if (matching.length > 0) {
      console.log(`${name}: ${matching.length}/${overAssessed.length} cases`);
      matching.forEach(c => {
        const match = c.transcriptText.match(regex);
        console.log(`  ${c.id} (${c.transition}): "${match[0]}" in "${c.transcriptText.substring(0, 80)}..."`);
      });
    }
  });

  // Save full analysis
  const report = {
    timestamp: new Date().toISOString(),
    totalCases: overAssessed.length,
    transitions,
    byExpected,
    cases: overAssessed
  };

  const outPath = 'backend/eval/feb-v1/reports/urgency_over_analysis.json';
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\nFull report saved to ${outPath}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
