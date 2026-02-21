#!/usr/bin/env node
/**
 * Phase 8.4 — Run parser to get actual output for all failing cases.
 */
const fs = require('fs');
const path = require('path');

// Set environment
process.env.ZERO_OPENAI_MODE = '1';
process.env.ENABLE_AI = '0';
process.env.OPENAI_API_KEY = '';
process.env.USE_PHASE80_CATEGORY_FIELD_FIXES = 'true';
process.env.USE_V3C_ENHANCEMENTS = 'true';
process.env.USE_V3B_ENHANCEMENTS = 'true';
process.env.USE_V2D_ENHANCEMENTS = 'true';
process.env.USE_CORE30_URGENCY_OVERRIDES = 'true';
process.env.USE_PHASE50_ESCALATION = 'true';
process.env.USE_PHASE36_DEESCALATION = 'true';
process.env.USE_PHASE2_DIRECT_BOOST = 'true';
process.env.USE_PHASE70_DEEP_ESCALATION = 'true';

const Parser = require('./backend/eval/jan-v3-analytics-runner.js');
const parser = new Parser();

// Load datasets
const datasetsDir = path.join(__dirname, 'backend/eval/v4plus/datasets');
function loadJsonl(file) {
  return fs.readFileSync(path.join(datasetsDir, file), 'utf8')
    .split('\n').filter(Boolean).map(l => JSON.parse(l));
}

const datasets = {
  core30: loadJsonl('core30.jsonl'),
  hard60: loadJsonl('hard60.jsonl'),
  fuzz500: loadJsonl('fuzz500.jsonl')
};

const FAILING = [
  { ds: 'core30', ids: ['T004', 'T021', 'T023'] },
  { ds: 'hard60', ids: ['HARD_001', 'HARD_003', 'HARD_005', 'HARD_006', 'HARD_010', 'HARD_018', 'HARD_032', 'HARD_051'] },
  { ds: 'fuzz500', ids: ['FUZZ_211', 'FUZZ_259', 'FUZZ_279', 'FUZZ_390'] }
];

async function run() {
  for (const { ds, ids } of FAILING) {
    console.log(`\n=== ${ds.toUpperCase()} ===`);
    for (const id of ids) {
      const c = datasets[ds].find(x => x.id === id);
      if (!c) { console.log(`${id}: NOT FOUND`); continue; }
      
      const exp = c.expectedOutput || c.expected;
      const transcript = c.transcriptText || c.transcript || '';
      
      // Build test case for parser
      const testCase = {
        id: c.id,
        transcript: transcript,
        transcriptText: transcript,
        segments: c.segments || [{ startMs: 0, endMs: 60000, text: transcript }]
      };
      
      try {
        const result = await parser.simulateEnhancedParsing(testCase);
        console.log(`${id}: expected URG=${exp.urgencyLevel} AMT=${exp.goalAmount} CAT=${exp.category}`);
        console.log(`       actual  URG=${result.urgencyLevel} AMT=${result.goalAmount} CAT=${result.category}`);
        
        const mismatches = [];
        if (result.urgencyLevel !== exp.urgencyLevel) mismatches.push(`URG: ${result.urgencyLevel}→${exp.urgencyLevel}`);
        if (result.category !== exp.category) mismatches.push(`CAT: ${result.category}→${exp.category}`);
        // Amount check with tolerance
        const expAmt = parseFloat(exp.goalAmount) || 0;
        const actAmt = parseFloat(result.goalAmount) || 0;
        const amtMatch = expAmt === 0 ? actAmt === 0 : Math.abs(actAmt - expAmt) / expAmt <= 0.15;
        if (!amtMatch) mismatches.push(`AMT: ${result.goalAmount}→${exp.goalAmount}`);
        
        console.log(`       ${mismatches.length ? 'FAIL: ' + mismatches.join(', ') : 'PASS'}`);
      } catch (e) {
        console.log(`${id}: ERROR - ${e.message}`);
      }
    }
  }
}

run().catch(e => console.error(e));
