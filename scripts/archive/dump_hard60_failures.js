/**
 * Quick script to dump all hard60 failing case IDs with failure buckets.
 * Re-runs the eval and filters for !strictPass results.
 */
const V4PlusEvaluationRunner = require('./backend/eval/feb-v1/runners/run_eval_v4plus');

async function main() {
  const runner = new V4PlusEvaluationRunner();
  const testCases = runner.loadDataset('hard60');
  
  console.log(`Loaded ${testCases.length} hard60 cases. Evaluating...`);
  
  const results = [];
  for (const tc of testCases) {
    const result = await runner.evaluateCase(tc);
    results.push(result);
  }
  
  const failures = results.filter(r => !r.strictPass);
  console.log(`\n=== ALL ${failures.length} FAILING CASES ===\n`);
  
  // Build bucket -> cases map
  const bucketMap = {};
  
  for (const f of failures) {
    const id = f.testCase.id;
    const buckets = f.failureBuckets;
    const score = (f.weightedScore * 100).toFixed(1);
    const failedFields = Object.entries(f.matches)
      .filter(([, v]) => !v)
      .map(([k]) => k.replace('Match', ''));
    
    console.log(`${id}  score=${score}%  buckets=[${buckets.join(', ')}]  failedFields=[${failedFields.join(', ')}]`);
    console.log(`   expected: name="${f.expected.name}" cat=${f.expected.category} urg=${f.expected.urgencyLevel} amt=${f.expected.goalAmount}`);
    console.log(`   actual:   name="${f.parseResult.name}" cat=${f.parseResult.category} urg=${f.parseResult.urgency} amt=${f.parseResult.amount}`);
    console.log();
    
    for (const b of buckets) {
      bucketMap[b] = bucketMap[b] || [];
      bucketMap[b].push(id);
    }
  }
  
  console.log(`\n=== BUCKET -> ALL CASE IDS ===\n`);
  for (const [bucket, cases] of Object.entries(bucketMap).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`${bucket} (${cases.length}): ${cases.join(', ')}`);
  }
}

main().catch(console.error);
