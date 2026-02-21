/**
 * Debug script to test v1b enhancements on specific core30 cases
 */

const UrgencyEnhancements = require('./backend/src/services/UrgencyEnhancements_v1b.js');

// Test cases from core30 that are under-assessed
const testCases = [
  {
    id: 'T002',
    transcript: `Hi, I need help with my rent. I'm about to be evicted and need fifteen hundred dollars to stay in my apartment.`,
    expected: 'CRITICAL',
    baseUrgency: 'HIGH' // Likely current assessment
  },
  {
    id: 'T008', 
    transcript: `My daughter needs surgery. The hospital says we need about eight thousand dollars for the operation.`,
    expected: 'CRITICAL',
    baseUrgency: 'HIGH' // Likely current assessment
  },
  {
    id: 'T022',
    transcript: `I need help with my rent which is nine hundred fifty dollars. I'm behind two months and facing eviction.`,
    expected: 'CRITICAL',
    baseUrgency: 'HIGH' // Likely current assessment
  }
];

console.log('=== Testing v1b Enhancements ===\n');

for (const testCase of testCases) {
  console.log(`${testCase.id}: Testing enhancement for under-assessed case`);
  console.log(`Transcript: ${testCase.transcript}`);
  
  const baseAssessment = {
    score: 0.60, // HIGH level score
    urgency: testCase.baseUrgency,
    reasons: ['high_pattern_match']
  };
  
  const enhanced = UrgencyEnhancements.enhanceAssessment(
    testCase.transcript, 
    baseAssessment,
    { category: 'HOUSING' }
  );
  
  console.log(`Base: ${baseAssessment.urgency} (${baseAssessment.score})`);
  console.log(`Enhanced: ${enhanced.urgency} (${enhanced.score})`);
  console.log(`Enhancements: ${enhanced.enhancements ? enhanced.enhancements.join(', ') : 'none'}`);
  console.log(`Expected: ${testCase.expected}`);
  console.log('---\n');
}