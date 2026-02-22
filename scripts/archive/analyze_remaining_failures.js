/**
 * Phase 8+ Remaining Failure Analysis
 * Analyzes all 69 remaining failures after Phase 8.0
 */
const fs = require('fs');
const path = require('path');

// Set environment BEFORE requiring the runner
process.env.ZERO_OPENAI_MODE = '1';
process.env.ENABLE_AI = '0';
process.env.OPENAI_API_KEY = '';
process.env.USE_V2D_ENHANCEMENTS = 'true';
process.env.USE_V3B_ENHANCEMENTS = 'true';
process.env.USE_V3C_ENHANCEMENTS = 'true';
process.env.USE_CORE30_URGENCY_OVERRIDES = 'true';
process.env.USE_PHASE2_URGENCY_BOOSTS = 'true';
process.env.USE_PHASE36_URGENCY_DEESCALATION = 'true';
process.env.USE_PHASE37_URGENCY_DEESCALATION = 'true';
process.env.USE_PHASE41_URGENCY_ESCALATION = 'true';
process.env.USE_PHASE50_URGENCY_ESCALATION = 'true';
process.env.USE_PHASE60_URGENCY_DEESCALATION = 'true';
process.env.USE_PHASE70_URGENCY_ESCALATION = 'true';
process.env.USE_PHASE80_CATEGORY_FIELD_FIXES = 'true';

const RunnerClass = require('./backend/eval/jan-v3-analytics-runner.js');
const runner = new RunnerClass();

const datasetsDir = './backend/eval/feb-v1/datasets';
function loadJsonl(file) {
  return fs.readFileSync(path.join(datasetsDir, file), 'utf8')
    .split('\n').filter(l => l.trim()).map(l => JSON.parse(l))
    .filter(c => c.id && c.transcriptText);
}
const core30 = loadJsonl('core30.jsonl');
const hard60 = loadJsonl('hard60.jsonl');
const fuzz500 = loadJsonl('fuzz500.jsonl');
const all500 = [...core30, ...hard60, ...fuzz500];

async function analyze() {
  let pass = 0;
  const fails = [];
  
  // Suppress console.log noise
  const origLog = console.log;
  console.log = () => {};
  
  for (const tc of all500) {
    const exp = tc.expectedOutput || tc.expected || {};
    const result = await runner.simulateEnhancedParsing(tc);
    const act = result.results;

    let ok = true;
    const failedOn = [];
    
    // Category
    if (exp.category && act.category !== exp.category) {
      ok = false; failedOn.push(`cat:${act.category}!=${exp.category}`);
    }
    // Urgency
    if (exp.urgencyLevel && act.urgencyLevel !== exp.urgencyLevel) {
      ok = false; failedOn.push(`urg:${act.urgencyLevel}!=${exp.urgencyLevel}`);
    }
    // Name
    if (exp.name) {
      const en = (exp.name || '').toLowerCase().trim();
      const an = (act.name || '').toLowerCase().trim();
      if (en !== an) { ok = false; failedOn.push(`name:${act.name||'null'}!=${exp.name}`); }
    }
    // Amount
    if (exp.goalAmount !== undefined && exp.goalAmount !== null) {
      const ea = parseFloat(exp.goalAmount);
      const aa = act.goalAmount ? parseFloat(act.goalAmount) : null;
      if (aa === null) { ok = false; failedOn.push(`amt:null!=${ea}`); }
      else {
        const tol = (tc.strictness && tc.strictness.amountTolerance) || 0.05;
        if (Math.abs(aa - ea) / ea > tol) { ok = false; failedOn.push(`amt:${aa}!=${ea}`); }
      }
    }

    if (ok) pass++;
    else fails.push({ id: tc.id, failures: failedOn, transcript: tc.transcriptText.substring(0, 140) });
  }
  
  console.log = origLog;
  console.log(`Pass: ${pass}/${all500.length} (${(pass/all500.length*100).toFixed(2)}%)`);
  console.log(`Fail: ${fails.length}`);
  console.log('');
  
  // Group by failure type
  const byType = {};
  for (const f of fails) {
    for (const failure of f.failures) {
      const type = failure.split(':')[0];
      if (!byType[type]) byType[type] = [];
      byType[type].push(f);
    }
  }
  
  for (const [type, cases] of Object.entries(byType).sort((a,b) => b[1].length - a[1].length)) {
    console.log(`\n=== ${type.toUpperCase()} (${cases.length} cases) ===`);
    for (const c of cases) {
      console.log(`  ${c.id} | ${c.failures.join(' ; ')} | ${c.transcript}`);
    }
  }
}

analyze().catch(e => { console.error(e); process.exit(1); });
