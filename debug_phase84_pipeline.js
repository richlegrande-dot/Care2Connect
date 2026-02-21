#!/usr/bin/env node
/**
 * Phase 8.4 — Run full eval pipeline per-case for all failures.
 * Uses parserAdapter + all enhancement phases (matching runner).
 */
const fs = require('fs');
const path = require('path');

// Set environment exactly like the runner's enforceEnvironment()
process.env.ZERO_OPENAI_MODE = '1';
process.env.ENABLE_AI = '0';
process.env.OPENAI_API_KEY = '';
process.env.NODE_ENV = 'test';
process.env.USE_PHASE80_CATEGORY_FIELD_FIXES = 'true';
process.env.USE_V3C_ENHANCEMENTS = 'true';
process.env.USE_V3B_ENHANCEMENTS = 'true';
process.env.USE_V2D_ENHANCEMENTS = 'true';
process.env.USE_CORE30_URGENCY_OVERRIDES = 'true';
process.env.USE_PHASE50_ESCALATION = 'true';
process.env.USE_PHASE36_DEESCALATION = 'true';
process.env.USE_PHASE2_DIRECT_BOOST = 'true';
process.env.USE_PHASE70_DEEP_ESCALATION = 'true';

// Load adapter + enhancement phases
const parserAdapter = require('./backend/eval/feb-v1/runners/parserAdapter');

// Load Phase enhancements
const { applyPhase50UrgencyEscalation } = require('./backend/eval/enhancements/UrgencyEscalation_Phase50');
const { applyPhase36Deescalation } = require('./backend/eval/enhancements/UrgencyDeescalation_Phase36');
const { applyPhase70DeepEscalation } = require('./backend/eval/enhancements/UrgencyEscalation_Phase70');
// Phase 2 boost
let applyPhase2DirectBoost;
try {
  const phase2 = require('./backend/eval/enhancements/Phase2_DirectBoost');
  applyPhase2DirectBoost = phase2.applyPhase2DirectBoost || phase2.applyBoost;
} catch(e) {
  console.log('Phase2 not found, skipping:', e.message);
}

// Core30 overrides
let applyCore30UrgencyOverrides;
try {
  const c30 = require('./backend/eval/enhancements/Core30UrgencyOverrides');
  applyCore30UrgencyOverrides = c30.applyCore30UrgencyOverrides || c30.applyOverrides;
} catch(e) {
  console.log('Core30 overrides not found:', e.message);
}

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
      
      try {
        // Step 1: Base parser via adapter
        const result = await parserAdapter.extractAll(transcript, { id: c.id });
        let { name, category, urgencyLevel: urgency, goalAmount: amount } = result;
        
        const stages = [`BASE: URG=${urgency} CAT=${category} AMT=${amount}`];
        
        // Step 2: Phase 3.6 de-escalation
        if (applyPhase36Deescalation) {
          const deesc = applyPhase36Deescalation(transcript, urgency, category, id);
          if (deesc && deesc.deescalated) {
            stages.push(`P36: ${urgency}→${deesc.newUrgency} (${deesc.reason})`);
            urgency = deesc.newUrgency;
          }
        }
        
        // Step 3: Phase 5.0 escalation
        const p5 = applyPhase50UrgencyEscalation(transcript, urgency, id);
        if (p5.escalated) {
          stages.push(`P50: ${urgency}→${p5.newUrgency} (${p5.reason})`);
          urgency = p5.newUrgency;
        }
        
        // Step 4: Phase 7.0 deep escalation
        if (applyPhase70DeepEscalation) {
          const p7 = applyPhase70DeepEscalation(transcript, urgency, category, id);
          if (p7 && p7.escalated) {
            stages.push(`P70: ${urgency}→${p7.newUrgency}`);
            urgency = p7.newUrgency;
          }
        }
        
        // Step 5: Phase 2 direct boost
        if (applyPhase2DirectBoost) {
          const p2 = applyPhase2DirectBoost(transcript, urgency, category, id);
          if (p2 && p2.boosted) {
            stages.push(`P2: ${urgency}→${p2.newUrgency}`);
            urgency = p2.newUrgency;
          }
        }
        
        // Step 6: Core30 overrides (only for core30 dataset)
        if (ds === 'core30' && applyCore30UrgencyOverrides) {
          const c30 = applyCore30UrgencyOverrides(id, urgency, transcript);
          if (c30 && c30.overridden) {
            stages.push(`C30: ${urgency}→${c30.newUrgency}`);
            urgency = c30.newUrgency;
          }
        }
        
        stages.push(`FINAL: URG=${urgency} CAT=${category} AMT=${amount}`);
        
        // Compare
        const mismatches = [];
        if (urgency !== exp.urgencyLevel) mismatches.push(`URG: ${urgency}≠${exp.urgencyLevel}`);
        if (category !== exp.category) mismatches.push(`CAT: ${category}≠${exp.category}`);
        const expAmt = parseFloat(exp.goalAmount) || 0;
        const actAmt = parseFloat(amount) || 0;
        const amtMatch = expAmt === 0 ? actAmt === 0 : Math.abs(actAmt - expAmt) / expAmt <= 0.15;
        if (!amtMatch) mismatches.push(`AMT: ${amount}≠${exp.goalAmount}`);
        
        console.log(`${id}: ${mismatches.length ? 'FAIL' : 'PASS'} ${mismatches.join(' | ')}`);
        stages.forEach(s => console.log(`  ${s}`));
        console.log();
      } catch(e) {
        console.log(`${id}: ERROR - ${e.message}`);
      }
    }
  }
}

run().catch(e => console.error(e));
