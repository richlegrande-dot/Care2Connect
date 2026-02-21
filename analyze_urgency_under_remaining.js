#!/usr/bin/env node
// Analyze remaining urgency_under_assessed cases from all500 dataset (post Phase 5.0+6.0)
// Produces detailed analysis for Phase 7 design

const fs = require('fs');
const path = require('path');

const datasets = {
  core30: 'backend/eval/feb-v1/datasets/core30.jsonl',
  hard60: 'backend/eval/feb-v1/datasets/hard60.jsonl',
  fuzz500: 'backend/eval/feb-v1/datasets/fuzz500.jsonl'
};

function loadDataset(filePath) {
  return fs.readFileSync(filePath, 'utf8')
    .split('\n').filter(l => l.trim())
    .map(l => JSON.parse(l)).filter(c => c.id && c.transcriptText);
}

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
process.env.USE_PHASE60_URGENCY_DEESCALATION = 'true';

const URGENCY_ORDER = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
function urgencyIndex(level) { return URGENCY_ORDER.indexOf(level); }

async function main() {
  const adapter = require('./backend/eval/feb-v1/runners/parserAdapter.js');

  let allCases = [];
  for (const [dsName, dsPath] of Object.entries(datasets)) {
    const cases = loadDataset(dsPath);
    cases.forEach(c => c._dataset = dsName);
    allCases = allCases.concat(cases);
  }
  console.log(`Loaded ${allCases.length} cases from all500`);

  const underAssessed = [];
  for (const testCase of allCases) {
    try {
      const result = await adapter.extractAll(testCase.transcriptText, { id: testCase.id, expected: testCase.expectedOutput || testCase.expected || {} });
      const actualUrgency = (result.urgencyLevel || result.urgency || 'UNKNOWN').toUpperCase();
      const expected = testCase.expectedOutput || testCase.expected || {};
      const expectedUrgency = (expected.urgencyLevel || 'UNKNOWN').toUpperCase();
      const actualCategory = (result.category || result.primaryCategory || 'UNKNOWN').toUpperCase();
      const expectedCategory = (expected.category || 'UNKNOWN').toUpperCase();

      if (urgencyIndex(actualUrgency) < urgencyIndex(expectedUrgency)) {
        underAssessed.push({
          id: testCase.id, dataset: testCase._dataset,
          transcriptText: testCase.transcriptText,
          expectedUrgency, actualUrgency,
          transition: `${expectedUrgency}->${actualUrgency}`,
          expectedCategory, actualCategory,
          categoryMatch: actualCategory === expectedCategory,
          templateId: testCase.sourceTemplateId || null,
          notes: testCase.notes || null
        });
      }
    } catch (err) { /* skip */ }
  }

  console.log(`\nFound ${underAssessed.length} urgency_under_assessed cases\n`);

  // Group by transition
  const transitions = {};
  underAssessed.forEach(c => {
    if (!transitions[c.transition]) transitions[c.transition] = [];
    transitions[c.transition].push(c);
  });
  console.log('=== TRANSITIONS ===');
  Object.entries(transitions).sort((a,b)=>b[1].length-a[1].length).forEach(([t, cases]) => {
    const dsBreak = {};
    cases.forEach(c => { dsBreak[c.dataset] = (dsBreak[c.dataset]||0)+1; });
    console.log(`${t}: ${cases.length} cases  ${JSON.stringify(dsBreak)}`);
  });

  // By template
  console.log('\n=== BY TEMPLATE ===');
  const byTemplate = {};
  underAssessed.forEach(c => {
    const t = c.templateId || 'NO_TEMPLATE';
    if (!byTemplate[t]) byTemplate[t] = [];
    byTemplate[t].push(c);
  });
  Object.entries(byTemplate).sort((a,b)=>b[1].length-a[1].length).forEach(([k, v]) => {
    console.log(`${k}: ${v.length} cases (${v[0].transition}) expCat=${v[0].expectedCategory}`);
    console.log(`  Sample: ${v[0].transcriptText.substring(0,120)}`);
  });

  // By expected category
  console.log('\n=== BY EXPECTED CATEGORY ===');
  const byCat = {};
  underAssessed.forEach(c => { byCat[c.expectedCategory] = (byCat[c.expectedCategory]||0)+1; });
  Object.entries(byCat).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log(`${k}: ${v}`));

  // All cases
  console.log('\n=== ALL CASES ===');
  underAssessed.forEach(c => {
    const snip = c.transcriptText.substring(0,140).replace(/\n/g,' ');
    console.log(`${c.id} | ${c.transition} | expCat=${c.expectedCategory} actCat=${c.actualCategory} catMatch=${c.categoryMatch} | ${snip}`);
  });

  // Pattern analysis
  console.log('\n=== PATTERN ANALYSIS ===');
  const patterns = {
    'has_eviction': /evict|eviction/i,
    'has_shutoff': /shutoff|shut\s*off|disconnect/i,
    'has_behind_on': /behind\s+on|past\s+due|overdue|late\s+on/i,
    'has_surgery': /surgery|surgical/i,
    'has_medication': /medication|medicine|prescription/i,
    'has_hospital': /hospital|ER\b|emergency\s*room/i,
    'has_deadline': /by\s+(?:friday|monday|end\s+of|next\s+week)/i,
    'has_desperate': /desperate|crisis|urgent/i,
    'has_rent': /\brent\b/i,
    'has_utility': /electric|gas\s+bill|water\s+bill|utilit/i,
    'has_food': /food|groceries|hungry|eat/i,
    'has_job_loss': /lost\s+(?:my\s+)?job|laid\s+off|fired|unemploy/i,
    'has_car': /car\s+broke|vehicle|repair/i,
    'has_children': /child|kids|daughter|son|baby/i,
    'has_medical': /medical|doctor|health|sick|ill/i,
    'has_legal': /legal|court|lawyer|attorney/i,
    'has_security_deposit': /security\s+deposit|deposit/i,
    'has_tomorrow': /tomorrow|tonight|today/i,
    'has_notice': /\bnotice\b/i,
    'has_threat': /threaten|threat/i,
    'has_behind_rent': /behind\s+on\s+rent|months?\s+behind/i,
    'has_months_behind': /\d+\s+months?\s+behind|\d+\s+months?\s+(?:late|overdue|past)/i,
  };

  Object.entries(patterns).forEach(([name, regex]) => {
    const matching = underAssessed.filter(c => regex.test(c.transcriptText));
    if (matching.length > 0) {
      console.log(`\n${name}: ${matching.length}/${underAssessed.length} cases`);
      const byTrans = {};
      matching.forEach(c => { byTrans[c.transition]=(byTrans[c.transition]||0)+1; });
      console.log(`  Transitions: ${JSON.stringify(byTrans)}`);
      matching.slice(0,5).forEach(c => {
        const m = c.transcriptText.match(regex);
        console.log(`  ${c.id} (${c.transition}): "${m[0]}" in "${c.transcriptText.substring(0,100)}..."`);
      });
    }
  });

  // Save
  const outPath = 'backend/eval/feb-v1/reports/urgency_under_remaining_analysis.json';
  fs.writeFileSync(outPath, JSON.stringify({ timestamp: new Date().toISOString(), totalCases: underAssessed.length, transitions, byTemplate, cases: underAssessed }, null, 2));
  console.log(`\nFull report saved to ${outPath}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
