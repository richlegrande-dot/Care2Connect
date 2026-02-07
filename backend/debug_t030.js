// Debug T030 name extraction
const JanV3AnalyticsEvaluator = require('./eval/jan-v3-analytics-runner.js');

// T030 test case
const testCase = {
  transcriptText: "Hi, this is Dr. Angela Foster but I'm not calling as a doctor. I'm calling as a mom. My twenty-two year old son was in an accident on Highway 95 last Tuesday, that was January 14th, and he needs surgery. The hospital bill is going to be around fifteen thousand dollars but insurance will only cover twelve thousand. We need help with the remaining three thousand."
};
const expectedName = "Angela Foster";

console.log('=== T030 NAME EXTRACTION DEBUG ===');
console.log('Input text:', testCase.transcriptText);
console.log('Expected name:', expectedName);
console.log('');

async function debugT030() {
  const evaluator = new JanV3AnalyticsEvaluator();

  try {
    const result = await evaluator.simulateEnhancedParsing(testCase);
    console.log('=== ACTUAL EXTRACTION ===');
    console.log('Name extracted:', result.results.name);
    console.log('Name confidence:', result.confidence.name);
    console.log('');
    console.log('Debug info:');
    console.log('Enhanced result:', result.debug.name.enhanced);
    console.log('Final choice:', result.debug.name.finalChoice);
  } catch (error) {
    console.error('Error during parsing:', error);
  }
}

debugT030();