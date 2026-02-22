#!/usr/bin/env node
// Phase 8 Analysis: All remaining failures across all500 (121 cases)
// Targets: category_wrong (48), amount_missing (24), amount_outside_tolerance (17),
//          name_wrong (16), urgency_over_assessed (14), amount_wrong_selection (9),
//          category_priority_violated (6), category_too_generic (1)

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
process.env.USE_PHASE70_URGENCY_ESCALATION = 'true';

const URGENCY_ORDER = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
function urgencyIndex(level) { return URGENCY_ORDER.indexOf(level); }

function classifyFailures(actual, expected) {
  const failures = [];
  
  // Category
  const expCat = (expected.category || '').toUpperCase();
  const actCat = (actual.category || actual.primaryCategory || '').toUpperCase();
  if (expCat && actCat && actCat !== expCat) {
    // Check if it's priority violation vs wrong
    const PRIORITY = ['HOUSING','UTILITIES','FOOD','HEALTHCARE','TRANSPORTATION','CHILDCARE','FAMILY','EMPLOYMENT','LEGAL','EDUCATION','OTHER'];
    const actIdx = PRIORITY.indexOf(actCat);
    const expIdx = PRIORITY.indexOf(expCat);
    if (actIdx >= 0 && expIdx >= 0 && actIdx > expIdx) {
      failures.push({ type: 'category_priority_violated', detail: `expected=${expCat} got=${actCat}` });
    } else if (actCat === 'OTHER') {
      failures.push({ type: 'category_too_generic', detail: `expected=${expCat} got=OTHER` });
    } else {
      failures.push({ type: 'category_wrong', detail: `expected=${expCat} got=${actCat}` });
    }
  }
  
  // Urgency
  const expUrg = (expected.urgencyLevel || '').toUpperCase();
  const actUrg = (actual.urgencyLevel || actual.urgency || '').toUpperCase();
  if (expUrg && actUrg) {
    const ai = urgencyIndex(actUrg);
    const ei = urgencyIndex(expUrg);
    if (ai < ei) failures.push({ type: 'urgency_under_assessed', detail: `expected=${expUrg} got=${actUrg}` });
    if (ai > ei) failures.push({ type: 'urgency_over_assessed', detail: `expected=${expUrg} got=${actUrg}` });
  }
  
  // Amount
  const expAmt = expected.goalAmount;
  const actAmt = actual.goalAmount;
  const tol = 0.05; // 5% tolerance for this analysis
  if (expAmt != null) {
    if (actAmt == null || actAmt === 0) {
      failures.push({ type: 'amount_missing', detail: `expected=${expAmt} got=${actAmt}` });
    } else if (Math.abs(actAmt - expAmt) / expAmt > tol) {
      failures.push({ type: 'amount_wrong', detail: `expected=${expAmt} got=${actAmt} diff=${((actAmt-expAmt)/expAmt*100).toFixed(1)}%` });
    }
  }
  
  // Name
  const expName = expected.name;
  const actName = actual.callerName || actual.name;
  if (expName && actName) {
    const normExp = expName.toLowerCase().trim();
    const normAct = actName.toLowerCase().trim();
    if (normExp !== normAct && !normAct.includes(normExp) && !normExp.includes(normAct)) {
      failures.push({ type: 'name_wrong', detail: `expected="${expName}" got="${actName}"` });
    }
  } else if (expName && !actName) {
    failures.push({ type: 'name_missing', detail: `expected="${expName}" got=null` });
  }
  
  return failures;
}

async function main() {
  const adapter = require('./backend/eval/feb-v1/runners/parserAdapter.js');

  let allCases = [];
  for (const [dsName, dsPath] of Object.entries(datasets)) {
    const cases = loadDataset(dsPath);
    cases.forEach(c => c._dataset = dsName);
    allCases = allCases.concat(cases);
  }
  console.log(`Loaded ${allCases.length} cases`);

  const failures = {};
  const allFailedCases = [];

  for (const testCase of allCases) {
    try {
      const expected = testCase.expectedOutput || testCase.expected || {};
      const result = await adapter.extractAll(testCase.transcriptText, { id: testCase.id, expected });
      
      const issues = classifyFailures(result, expected);
      if (issues.length > 0) {
        const entry = {
          id: testCase.id, dataset: testCase._dataset,
          transcriptText: testCase.transcriptText,
          expected, actual: {
            category: (result.category || result.primaryCategory || '').toUpperCase(),
            urgency: (result.urgencyLevel || result.urgency || '').toUpperCase(),
            goalAmount: result.goalAmount,
            name: result.callerName || result.name
          },
          issues,
          templateId: testCase.sourceTemplateId || null,
        };
        allFailedCases.push(entry);
        issues.forEach(iss => {
          if (!failures[iss.type]) failures[iss.type] = [];
          failures[iss.type].push(entry);
        });
      }
    } catch (err) { /* skip */ }
  }

  console.log(`\nTotal failing cases: ${allFailedCases.length}`);
  console.log('\n=== FAILURE BUCKETS ===');
  Object.entries(failures).sort((a,b) => b[1].length - a[1].length).forEach(([type, cases]) => {
    const dsBreak = {};
    cases.forEach(c => { dsBreak[c.dataset] = (dsBreak[c.dataset]||0)+1; });
    console.log(`${type}: ${cases.length} cases  ${JSON.stringify(dsBreak)}`);
  });

  // CATEGORY_WRONG deep analysis
  if (failures.category_wrong) {
    console.log('\n=== CATEGORY_WRONG DETAIL ===');
    const catTransitions = {};
    failures.category_wrong.forEach(c => {
      const key = `${c.expected.category}→${c.actual.category}`;
      if (!catTransitions[key]) catTransitions[key] = [];
      catTransitions[key].push(c);
    });
    Object.entries(catTransitions).sort((a,b) => b[1].length - a[1].length).forEach(([t, cases]) => {
      console.log(`\n  ${t}: ${cases.length} cases`);
      cases.forEach(c => {
        const snip = c.transcriptText.substring(0, 130).replace(/\n/g, ' ');
        console.log(`    ${c.id} (${c.dataset}) tmpl=${c.templateId || 'none'} | ${snip}`);
      });
    });
  }

  // CATEGORY_PRIORITY_VIOLATED deep analysis
  if (failures.category_priority_violated) {
    console.log('\n=== CATEGORY_PRIORITY_VIOLATED DETAIL ===');
    failures.category_priority_violated.forEach(c => {
      const snip = c.transcriptText.substring(0, 150).replace(/\n/g, ' ');
      console.log(`  ${c.id}: exp=${c.expected.category} got=${c.actual.category} | ${snip}`);
    });
  }

  // CATEGORY_TOO_GENERIC
  if (failures.category_too_generic) {
    console.log('\n=== CATEGORY_TOO_GENERIC DETAIL ===');
    failures.category_too_generic.forEach(c => {
      const snip = c.transcriptText.substring(0, 150).replace(/\n/g, ' ');
      console.log(`  ${c.id}: exp=${c.expected.category} got=${c.actual.category} | ${snip}`);
    });
  }

  // URGENCY_OVER_ASSESSED
  if (failures.urgency_over_assessed) {
    console.log('\n=== URGENCY_OVER_ASSESSED DETAIL ===');
    failures.urgency_over_assessed.forEach(c => {
      const snip = c.transcriptText.substring(0, 130).replace(/\n/g, ' ');
      const urg = c.issues.find(i => i.type === 'urgency_over_assessed');
      console.log(`  ${c.id} (${c.dataset}): ${urg.detail} | ${snip}`);
    });
  }

  // AMOUNT_MISSING
  if (failures.amount_missing) {
    console.log('\n=== AMOUNT_MISSING DETAIL ===');
    failures.amount_missing.forEach(c => {
      const snip = c.transcriptText.substring(0, 130).replace(/\n/g, ' ');
      console.log(`  ${c.id} (${c.dataset}): expAmt=${c.expected.goalAmount} gotAmt=${c.actual.goalAmount} | ${snip}`);
    });
  }

  // NAME_WRONG
  if (failures.name_wrong) {
    console.log('\n=== NAME_WRONG DETAIL ===');
    failures.name_wrong.forEach(c => {
      const snip = c.transcriptText.substring(0, 130).replace(/\n/g, ' ');
      const nm = c.issues.find(i => i.type === 'name_wrong');
      console.log(`  ${c.id} (${c.dataset}): ${nm.detail} | ${snip}`);
    });
  }

  // AMOUNT_WRONG
  if (failures.amount_wrong) {
    console.log('\n=== AMOUNT_WRONG DETAIL ===');
    failures.amount_wrong.forEach(c => {
      const snip = c.transcriptText.substring(0, 130).replace(/\n/g, ' ');
      const amt = c.issues.find(i => i.type === 'amount_wrong');
      console.log(`  ${c.id} (${c.dataset}): ${amt.detail} | ${snip}`);
    });
  }

  // Save
  const outPath = 'backend/eval/feb-v1/reports/phase8_all_failures_analysis.json';
  fs.writeFileSync(outPath, JSON.stringify({ timestamp: new Date().toISOString(), totalFailed: allFailedCases.length, buckets: Object.fromEntries(Object.entries(failures).map(([k,v]) => [k, v.length])), cases: allFailedCases }, null, 2));
  console.log(`\nFull report saved to ${outPath}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
