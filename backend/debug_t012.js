// Debug T012 name extraction - simplified
const JanV3AnalyticsEvaluator = require('./eval/jan-v3-analytics-runner.js');

// T012 test case
const testCase = {
  transcriptText: "Good morning, this is Dr. Patricia Johnson. I'm calling not as a doctor but as a mother. My daughter needs help with her wedding expenses after her father passed away. We need about three thousand dollars for the ceremony."
};
const expectedName = "Patricia Johnson";

console.log('=== T012 NAME EXTRACTION DEBUG ===');
console.log('Input text:', testCase.transcriptText);
console.log('Expected name:', expectedName);
console.log('');

async function debugT012() {
  // Create evaluator instance and run specific parsing
  const evaluator = new JanV3AnalyticsEvaluator();

  try {
    // Use the simulateEnhancedParsing method
    const result = await evaluator.simulateEnhancedParsing(testCase);
    console.log('=== ACTUAL EXTRACTION ===');
    console.log('Name extracted:', result.name);
    console.log('Full result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error during parsing:', error);
  }
}

debugT012();