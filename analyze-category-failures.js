// Analyze category classification failures from recent test results
// Focus on HARD_004 (TRANSPORTATION) and HARD_009 (UTILITIES)

const testCases = [
  {
    id: "HARD_004",
    text: "My name is Jennifer Wu. I'm 32 years old, make $45,000 a year, have 2 kids aged 5 and 8, and need $1,200 for emergency car repairs so I can get to work.",
    expected: "TRANSPORTATION",
    note: "Car repairs for work - should be TRANSPORTATION"
  },
  {
    id: "HARD_009", 
    text: "My name is Carlos Rivera. I'm 28, have $12,000 in student loans, $3,500 in credit card debt, and need $600 to pay my electric bill before they shut off my power tomorrow.",
    expected: "UTILITIES",
    note: "Electric bill - should be UTILITIES, time-critical"
  }
];

console.log('Category Classification Failure Analysis:\n');

testCases.forEach(testCase => {
  console.log(`${testCase.id}: Expected ${testCase.expected}`);
  console.log(`Text: "${testCase.text}"`);
  console.log(`Note: ${testCase.note}`);
  
  // Analyze what current system might be detecting
  const lowerText = testCase.text.toLowerCase();
  
  if (testCase.expected === 'TRANSPORTATION') {
    const transportKeywords = ['car', 'repair', 'vehicle', 'transportation', 'get to work'];
    const foundKeywords = transportKeywords.filter(kw => lowerText.includes(kw));
    console.log(`Transportation keywords found: ${foundKeywords.join(', ')}`);
    
    // Check what it might be misclassified as
    if (lowerText.includes('emergency')) console.log('- Might be misclassified as EMERGENCY');
    if (lowerText.includes('work')) console.log('- Might be misclassified as EMPLOYMENT');
  }
  
  if (testCase.expected === 'UTILITIES') {
    const utilityKeywords = ['electric', 'bill', 'power', 'utility', 'shut off', 'utilities'];
    const foundKeywords = utilityKeywords.filter(kw => lowerText.includes(kw));
    console.log(`Utility keywords found: ${foundKeywords.join(', ')}`);
    
    // Check what it might be misclassified as
    if (lowerText.includes('emergency')) console.log('- Might be misclassified as EMERGENCY');
    if (lowerText.includes('debt')) console.log('- Might be misclassified as DEBT or FINANCIAL');
  }
  
  console.log('');
});