const svc = require('./backend/src/services/UrgencyAssessmentService.js');

const testCases = [
  {
    id: 'T005',
    transcript: "This is Lisa Thompson. My mother is sick and needs special medication that insurance won't cover. We need help but I'm not sure exactly how much. Maybe a few thousand dollars?",
    category: 'HEALTHCARE',
    expected: 'MEDIUM'
  },
  {
    id: 'T007',
    transcript: "Hi, my name is David Chen. I lost my job last month and I'm behind on rent. My landlord gave me an eviction notice and I need help paying rent which is about eight hundred dollars.",
    category: 'HOUSING',
    expected: 'HIGH'
  },
  {
    id: 'T002',
    transcript: "Hello, this is Maria Rodriguez calling. My house caught fire last night and we lost everything. My family and I are staying at a shelter but we need help with temporary housing and clothes. We probably need around five thousand dollars right away.",
    category: 'EMERGENCY',
    expected: 'CRITICAL'
  },
  {
    id: 'T005_NO_CATEGORY',
    transcript: "This is Lisa Thompson. My mother is sick and needs special medication that insurance won't cover. We need help but I'm not sure exactly how much. Maybe a few thousand dollars?",
    category: null,
    expected: 'MEDIUM'
  },
  {
    id: 'T007_NO_CATEGORY',
    transcript: "Hi, my name is David Chen. I lost my job last month and I'm behind on rent. My landlord gave me an eviction notice and I need help paying rent which is about eight hundred dollars.",
    category: null,
    expected: 'HIGH'
  }
];

console.log('Testing urgency assessments:\n');

testCases.forEach(test => {
  const result = svc.assessWithDebug(test.transcript, { category: test.category });
  const match = result.urgencyLevel === test.expected ? '✓' : '✗';
  console.log(`${match} ${test.id} (${test.category}):`);
  console.log(`  Expected: ${test.expected}`);
  console.log(`  Actual: ${result.urgencyLevel} (score: ${result.score.toFixed(2)})`);
  console.log(`  Reasons: ${result.reasons.join(', ')}`);
  console.log();
});
