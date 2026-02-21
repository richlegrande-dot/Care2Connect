// Test T027 specifically with the jan-v3 runner
const JanV3AnalyticsEvaluator = require('./backend/eval/jan-v3-analytics-runner.js');

const testCase = {
  "id": "T027", 
  "description": "Educational vs employment category conflict", 
  "difficulty": "hard", 
  "transcriptText": "My name is Robert Chen and I need help finishing my certification program. I lost my job and need this training to find work again. The program costs twenty-eight hundred dollars and I start next month.", 
  "expected": {
    "name": "Robert Chen", 
    "category": "EDUCATION", 
    "urgencyLevel": "MEDIUM", 
    "goalAmount": 2800, 
    "missingFields": [], 
    "beneficiaryRelationship": "myself"
  }
};

async function testT027() {
  const evaluator = new JanV3AnalyticsEvaluator();
  
  try {
    const result = await evaluator.simulateEnhancedParsing(testCase);
    
    console.log('T027 Test Results:');
    console.log('=================');
    console.log(`Name: Expected "${testCase.expected.name}", Got "${result.results.name}"`);
    console.log(`Category: Expected "${testCase.expected.category}", Got "${result.results.category}"`);
    console.log(`Urgency: Expected "${testCase.expected.urgencyLevel}", Got "${result.results.urgencyLevel}"`);
    console.log(`Amount: Expected ${testCase.expected.goalAmount}, Got ${result.results.goalAmount}`);
    
    const nameMatch = result.results.name === testCase.expected.name;
    const categoryMatch = result.results.category === testCase.expected.category;
    const urgencyMatch = result.results.urgencyLevel === testCase.expected.urgencyLevel;
    const amountMatch = result.results.goalAmount === testCase.expected.goalAmount;
    
    console.log('\nField Results:');
    console.log(`Name: ${nameMatch ? '✅' : '❌'}`);
    console.log(`Category: ${categoryMatch ? '✅' : '❌'}`);
    console.log(`Urgency: ${urgencyMatch ? '✅' : '❌'}`);
    console.log(`Amount: ${amountMatch ? '✅' : '❌'}`);
    
    const overallPass = nameMatch && categoryMatch && urgencyMatch && amountMatch;
    console.log(`\nOverall: ${overallPass ? '✅ PASS' : '❌ FAIL'}`);
    
    if (result.debug) {
      console.log('\nDebug Info:');
      console.log('Name:', result.debug.name);
      console.log('Category:', result.debug.category);  
      console.log('Urgency:', result.debug.urgency);
    }
    
  } catch (error) {
    console.error('Error testing T027:', error.message);
  }
}

testT027();