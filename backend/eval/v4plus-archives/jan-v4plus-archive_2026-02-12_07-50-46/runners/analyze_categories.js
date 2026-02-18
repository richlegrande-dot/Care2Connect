const parserAdapter = require('./parserAdapter');

// Enable v4c enhancements for testing
process.env.USE_V4C_ENHANCEMENTS = 'true';
process.env.USE_V2C_ENHANCEMENTS = 'true';
process.env.USE_V3C_ENHANCEMENTS = 'true';

// Test category classification patterns
const cases = [
  {
    id: 'T012', 
    text: "Good morning, this is Dr. Patricia Johnson. I'm calling not as a doctor but as a mother. My daughter needs help with her wedding expenses after her father passed away. We need about three thousand dollars for the ceremony.",
    expected: 'FAMILY'
  },
  {
    id: 'HARD_004',
    text: "My name is Jennifer Wu. I'm 32 years old, make $45,000 a year, have 2 kids aged 5 and 8, and need $1,200 for emergency car repairs so I can get to work.",
    expected: 'TRANSPORTATION'
  },
  {
    id: 'HARD_007', 
    text: "I'm calling...my name is Michael Brown. I make $15 an hour, work 40 hours a week, that's $600 weekly or $2,400 monthly. But I need $800 for my daughter's medication this month.",
    expected: 'HEALTHCARE'
  }
];

console.log('=== V4C CATEGORY ENHANCEMENT TEST ===\n');

async function analyzeCategories() {
  for (const testCase of cases) {
    try {
      const result = await parserAdapter.extractAll(testCase.text, { id: testCase.id });
      const status = result.category === testCase.expected ? '✅ PASS' : '❌ FAIL';
      console.log(`${testCase.id}: Expected ${testCase.expected} → Got ${result.category} ${status}`);
      console.log(`Text: "...${testCase.text.slice(40, 120)}..."`);
      console.log(`Full: name="${result.name || 'NULL'}", category="${result.category}", urgency="${result.urgencyLevel}", amount=${result.goalAmount || 'NULL'}`);
      console.log('---\n');
    } catch (error) {
      console.log(`${testCase.id}: ERROR - ${error.message}\n---\n`);
    }
  }
}

analyzeCategories().catch(console.error);