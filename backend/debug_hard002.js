// Test HARD_002 specifically - urgency under-assessment
const JanV3AnalyticsEvaluator = require('./eval/jan-v3-analytics-runner.js');

// HARD_002 case - expected HIGH urgency but likely getting MEDIUM or LOW  
const testCase = {
  transcriptText: "This is Maria Torres speaking. My medical bills total $47,000 but I'm asking for $5,000 to cover the most urgent treatments. I earn $2,100 monthly and my daughter is 7."
};

const expected = {
  name: "Maria Torres",
  category: "HEALTHCARE", 
  urgencyLevel: "HIGH",
  goalAmount: 5000
};

console.log('=== HARD_002 URGENCY ANALYSIS ===');
console.log('Input:', testCase.transcriptText);
console.log('Expected urgency:', expected.urgencyLevel);
console.log('Expected category:', expected.category);
console.log('Expected amount:', expected.goalAmount);
console.log('');

async function debugHard002() {
  const evaluator = new JanV3AnalyticsEvaluator();
  
  try {
    const result = await evaluator.simulateEnhancedParsing(testCase);
    
    console.log('=== ACTUAL RESULTS ===');
    console.log('Name:', result.results.name);
    console.log('Category:', result.results.category);
    console.log('Urgency:', result.results.urgencyLevel);
    console.log('Amount:', result.results.goalAmount);
    console.log('');
    
    // Check what urgency level was assigned and why
    if (result.debug && result.debug.urgency) {
      console.log('=== URGENCY DEBUG ===');
      console.log('Urgency assessment:', result.debug.urgency.assessment);
      console.log('Service used:', result.debug.urgency.serviceUsed);
      console.log('Enhanced:', result.debug.urgency.enhanced);
    }
    
    // Analyze why this might be under-assessed
    console.log('=== URGENCY ANALYSIS ===');
    const text = testCase.transcriptText.toLowerCase();
    console.log('Contains "urgent":', text.includes('urgent'));
    console.log('Contains "emergency":', text.includes('emergency')); 
    console.log('Contains "medical":', text.includes('medical'));
    console.log('Contains "treatments":', text.includes('treatments'));
    console.log('Contains high amounts:', text.includes('47,000') || text.includes('5,000'));
    
    // Expected vs actual comparison
    if (result.results.urgencyLevel !== expected.urgencyLevel) {
      console.log(`❌ URGENCY MISMATCH: Got ${result.results.urgencyLevel}, expected ${expected.urgencyLevel}`);
      console.log('This is likely an urgency_under_assessed case');
    } else {
      console.log('✅ Urgency matches expected');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugHard002();