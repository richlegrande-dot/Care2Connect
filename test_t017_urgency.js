// Debug T017 to see what urgency is being extracted vs expected
const JanV3AnalyticsEvaluator = require('./backend/eval/jan-v3-analytics-runner.js');

const testCase = {
  "id": "T017", 
  "description": "Multiple amounts - wage vs goal confusion", 
  "difficulty": "adversarial", 
  "transcriptText": "Hello, my name is Marcus Johnson. I used to make six hundred dollars a week before I got injured at work. Now I can't work and I need help with my medical bills. The doctor says I need about four thousand five hundred dollars for the surgery.", 
  "expected": {
    "name": "Marcus Johnson", 
    "category": "HEALTHCARE", 
    "urgencyLevel": "HIGH", 
    "goalAmount": 4500, 
    "missingFields": [], 
    "beneficiaryRelationship": "myself"
  }
};

async function testT017() {
  const evaluator = new JanV3AnalyticsEvaluator();
  
  try {
    const result = await evaluator.simulateEnhancedParsing(testCase);
    
    console.log('T017 Test Results:');
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
    console.error('Error testing T017:', error.message);
  }
}

testT017();