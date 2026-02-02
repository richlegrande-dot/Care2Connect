const JanV3AnalyticsEvaluator = require('./backend/eval/jan-v3-analytics-runner.js');

const evaluator = new JanV3AnalyticsEvaluator();

const testCases = [
  {
    id: 'T005',
    transcript: "This is Lisa Thompson. My mother is sick and needs special medication that insurance won't cover. We need help but I'm not sure exactly how much. Maybe a few thousand dollars?",
    expectedCategory: 'HEALTHCARE',
    expectedUrgency: 'MEDIUM'
  },
  {
    id: 'T007',
    transcript: "Hi, my name is David Chen. I lost my job last month and I'm behind on rent. My landlord gave me an eviction notice and I need help paying rent which is about eight hundred dollars.",
    expectedCategory: 'HOUSING',
    expectedUrgency: 'HIGH'
  }
];

console.log('Testing full parsing pipeline:\n');

testCases.forEach(async (test) => {
  const result = await evaluator.parseTranscript(test.transcript);
  const catMatch = result.results.category === test.expectedCategory ? '✓' : '✗';
  const urgMatch = result.results.urgencyLevel === test.expectedUrgency ? '✓' : '✗';
  
  console.log(`${test.id}:`);
  console.log(`  Category: ${catMatch} Expected: ${test.expectedCategory}, Actual: ${result.results.category}`);
  console.log(`  Urgency: ${urgMatch} Expected: ${test.expectedUrgency}, Actual: ${result.results.urgencyLevel}`);
  console.log();
});
