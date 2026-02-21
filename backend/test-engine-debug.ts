/**
 * Debug test for Jan v4.0 engines
 */

import { UrgencyAssessmentEngine } from './src/utils/extraction/urgencyEngine';
import { AmountDetectionEngine } from './src/utils/extraction/amountEngine';

const testTranscript = "Hi, my name is Sarah Johnson. I received an eviction notice yesterday and I have until tomorrow to pay three months rent or we'll be on the street. That's $3,600 total. I have three kids and nowhere else to go.";

console.log('\n=== JAN v4.0 ENGINE DEBUG TEST ===\n');
console.log('Test transcript:', testTranscript);
console.log('\n--- Testing Urgency Engine ---');

const urgencyEngine = new UrgencyAssessmentEngine();
const urgencyResult = urgencyEngine.assessUrgency(testTranscript, {
  category: 'HOUSING'
});

console.log('Urgency Result:', JSON.stringify(urgencyResult, null, 2));

console.log('\n--- Testing Amount Engine ---');

const amountEngine = new AmountDetectionEngine();
const amountResult = amountEngine.detectGoalAmount(testTranscript, {
  category: 'HOUSING',
  urgency: urgencyResult.urgencyLevel
});

console.log('Amount Result:', JSON.stringify(amountResult, null, 2));

console.log('\n=== END DEBUG TEST ===\n');
