// Debug T024 to see what urgency is being extracted vs expected MEDIUM
const JanV3AnalyticsEvaluator = require('./backend/eval/jan-v3-analytics-runner.js');

const testCase = {
  "id": "T024", 
  "description": "Vague couple/few thousand", 
  "difficulty": "hard", 
  "transcriptText": "Hello, this is Brian Anderson. I lost my job and my wife is sick. We need help with basic living expenses. I think we need a couple thousand dollars to get through the next few months.", 
  "expected": {
    "name": "Brian Anderson", 
    "category": "EMPLOYMENT", 
    "urgencyLevel": "MEDIUM", 
    "goalAmount": 2000, 
    "missingFields": [], 
    "beneficiaryRelationship": "family"
  }
};

async function testT024() {
  const evaluator = new JanV3AnalyticsEvaluator();
  
  try {
    const result = await evaluator.simulateEnhancedParsing(testCase);
    
    console.log('T024 Test Results:');
    console.log('=================');
    console.log(`Name: Expected "${testCase.expected.name}", Got "${result.results.name}"`);
    console.log(`Category: Expected "${testCase.expected.category}", Got "${result.results.category}"`);
    console.log(`Urgency: Expected "${testCase.expected.urgencyLevel}", Got "${result.results.urgencyLevel}"`);
    console.log(`Amount: Expected ${testCase.expected.goalAmount}, Got ${result.results.goalAmount}`);
    
    const nameMatch = result.results.name === testCase.expected.name;
    const categoryMatch = result.results.category === testCase.expected.category;
    const urgencyMatch = result.results.urgencyLevel === testCase.expected.urgencyLevel;
    const amountMatch = Math.abs(result.results.goalAmount - testCase.expected.goalAmount) <= 500; // Allow tolerance
    
    console.log('\nField Results:');
    console.log(`Name: ${nameMatch ? '✅' : '❌'}`);
    console.log(`Category: ${categoryMatch ? '✅' : '❌'}`);
    console.log(`Urgency: ${urgencyMatch ? '✅' : '❌'}`);
    console.log(`Amount: ${amountMatch ? '✅' : '❌'} (tolerance: 500)`);
    
    const overallPass = nameMatch && categoryMatch && urgencyMatch && amountMatch;
    console.log(`\nOverall: ${overallPass ? '✅ PASS' : '❌ FAIL'}`);
    
    if (result.debug) {
      console.log('\nDebug Info:');
      console.log('Name:', result.debug.name);
      console.log('Category:', result.debug.category);  
      console.log('Urgency:', result.debug.urgency);
    }
    
  } catch (error) {
    console.error('Error testing T024:', error.message);
  }
}

testT024();