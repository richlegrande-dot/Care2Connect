const fs = require('fs');
const path = require('path');

// Use the eval runner to get per-case results
async function analyzeFailures() {
  // Set up environment
  process.env.USE_PHASE80_CATEGORY_FIELD_FIXES = 'true';
  process.env.ZERO_OPENAI_MODE = '1';
  process.env.ENABLE_AI = '0';
  process.env.OPENAI_API_KEY = '';
  
  const runnerPath = path.join(__dirname, 'backend/eval/jan-v3-analytics-runner.js');
  const JanV3AnalyticsEvaluator = require(runnerPath);
  const evaluator = new JanV3AnalyticsEvaluator();

  // Load all datasets
  const datasets = {
    core30: 'backend/eval/feb-v1/datasets/core30.jsonl',
    hard60: 'backend/eval/feb-v1/datasets/hard60.jsonl',
    fuzz500: 'backend/eval/feb-v1/datasets/fuzz500.jsonl',
  };

  // Use eval runner scoring: 0.25 weight per field, ≥0.95 to pass
  function matchName(actual, expected) {
    if (!expected) return true;
    if (!actual) return false;
    if (actual === expected) return true;
    // Fuzzy: check if names are similar enough
    const normalA = actual.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    const normalE = expected.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    if (normalA === normalE) return true;
    // Check contained
    if (normalA.includes(normalE) || normalE.includes(normalA)) return true;
    return false;
  }
  
  function matchAmount(actual, expected, tolerance = 0.15) {
    if (expected === null || expected === undefined) return true;
    if (actual === null || actual === undefined) return false;
    const a = parseFloat(actual), e = parseFloat(expected);
    if (isNaN(a)) return false;
    if (e === 0) return a === 0;
    return Math.abs(a - e) / e <= tolerance;
  }

  for (const [name, dsPath] of Object.entries(datasets)) {
    const lines = fs.readFileSync(path.join(__dirname, dsPath), 'utf8').split('\n').filter(l => l.trim());
    const cases = lines.map(l => JSON.parse(l));
    
    const failures = [];
    for (const tc of cases) {
      const transcript = tc.transcriptText || tc.transcript || tc.input || '';
      const expected = tc.expectedOutput || tc.expected || {};
      const strictness = tc.strictness || {};
      const amtTol = strictness.amountTolerance || 0.15;
      
      try {
        const result = await evaluator.simulateEnhancedParsing({ ...tc, transcript });
        const actual = result.results;
        
        const nameOK = matchName(actual.name, expected.name);
        const catOK = !expected.category || actual.category === expected.category;
        const urgOK = !expected.urgencyLevel || actual.urgencyLevel === expected.urgencyLevel;
        const amtOK = matchAmount(actual.goalAmount, expected.goalAmount, amtTol);
        
        const score = (nameOK ? 0.25 : 0) + (catOK ? 0.25 : 0) + (urgOK ? 0.25 : 0) + (amtOK ? 0.25 : 0);
        
        if (score < 0.95) {
          const parts = [];
          if (!catOK) parts.push(`CAT: ${actual.category}→${expected.category}`);
          if (!urgOK) parts.push(`URG: ${actual.urgencyLevel}→${expected.urgencyLevel}`);
          if (!amtOK) parts.push(`AMT: ${actual.goalAmount}→${expected.goalAmount}`);
          if (!nameOK) parts.push(`NAME: "${actual.name}"→"${expected.name}"`);
          failures.push({ id: tc.id, score: Math.round(score*100), details: parts.join(' | ') });
        }
      } catch (e) {
        failures.push({ id: tc.id, score: 0, details: 'ERROR: ' + e.message.substring(0, 80) });
      }
    }
    
    console.log(`\n=== ${name}: ${cases.length - failures.length}/${cases.length} passed, ${failures.length} failures ===`);
    failures.forEach(f => console.log(`  ${f.id} (${f.score}%) ${f.details}`));
  }
}

analyzeFailures().catch(e => console.error(e));
