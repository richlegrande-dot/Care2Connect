// Debug script to analyze urgency under-assessment patterns
const JanV3AnalyticsEvaluator = require('./eval/jan-v3-analytics-runner.js');

// Sample cases that are likely urgency under-assessed from Hard60
const testCases = [
  // Medical emergency cases
  { 
    id: "HARD_006", 
    text: "Help! My husband is in the hospital and I lost my housing. I need $3,200 for medical bills and a new apartment.",
    expected: "HIGH",
    expectedCategory: "HEALTHCARE"
  },
  {
    id: "HARD_007",
    text: "This is an emergency. My daughter needs surgery next week and I need $3,500",
    expected: "CRITICAL", 
    expectedCategory: "HEALTHCARE"
  },
  {
    id: "HARD_011", 
    text: "I need $950 for medication by Friday. This is...an emergency...well, maybe more of an urgent situation.",
    expected: "HIGH",
    expectedCategory: "HEALTHCARE" 
  },
  // Eviction/Housing emergencies
  {
    id: "HARD_EVICTION_1",
    text: "I got an eviction notice yesterday and have to pay $2,000 by tomorrow.",
    expected: "CRITICAL",
    expectedCategory: "HOUSING"
  },
  {
    id: "HARD_EVICTION_2", 
    text: "The foreclosure notice says I have 10 days to pay $5,000",
    expected: "HIGH",
    expectedCategory: "HOUSING"
  },
  // Utility shutoffs
  {
    id: "HARD_UTILITY_1",
    text: "My power gets shut off in 2 days if I don't pay $450.",
    expected: "HIGH", 
    expectedCategory: "UTILITIES"
  }
];

async function analyzeUrgencyPatterns() {
  const evaluator = new JanV3AnalyticsEvaluator();
  
  console.log('=== URGENCY PATTERN ANALYSIS ===\n');
  
  for (const testCase of testCases) {
    console.log(`--- ${testCase.id} ---`);
    console.log(`Input: ${testCase.text}`);
    console.log(`Expected urgency: ${testCase.expected}`);
    console.log(`Expected category: ${testCase.expectedCategory}\n`);
    
    const result = await evaluator.simulateEnhancedParsing({
      transcriptText: testCase.text,
      id: testCase.id
    });
    
    console.log('=== ACTUAL RESULTS ===');
    console.log(`Name: ${result.results.name}`);
    console.log(`Category: ${result.results.category}`);
    console.log(`Urgency: ${result.results.urgencyLevel}`);
    console.log(`Amount: ${result.results.goalAmount}\n`);
    
    // Check for urgency mismatch
    const urgencyLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const actualLevel = urgencyLevels.indexOf(result.results.urgencyLevel);
    const expectedLevel = urgencyLevels.indexOf(testCase.expected);
    
    if (actualLevel < expectedLevel) {
      console.log(`❌ URGENCY UNDER-ASSESSED: Got ${result.results.urgencyLevel}, expected ${testCase.expected}`);
      
      // Analyze patterns in the text
      const lower = testCase.text.toLowerCase();
      console.log('=== PATTERN ANALYSIS ===');
      console.log(`Contains "emergency": ${/emergency/i.test(lower)}`);
      console.log(`Contains "urgent": ${/urgent/i.test(lower)}`);
      console.log(`Contains "tomorrow": ${/tomorrow/i.test(lower)}`);
      console.log(`Contains "days": ${/\d+\s*days/i.test(lower)}`);
      console.log(`Contains "eviction": ${/eviction/i.test(lower)}`);
      console.log(`Contains "foreclosure": ${/foreclosure/i.test(lower)}`);
      console.log(`Contains "shut off": ${/shut\s*off/i.test(lower)}`);
      console.log(`Contains "hospital": ${/hospital/i.test(lower)}`);
      console.log(`Contains "surgery": ${/surgery/i.test(lower)}`);
      console.log(`Contains "medication": ${/medication/i.test(lower)}`);
      
    } else if (actualLevel === expectedLevel) {
      console.log(`✅ Urgency matches expected`);
    } else {
      console.log(`⚠️ URGENCY OVER-ASSESSED: Got ${result.results.urgencyLevel}, expected ${testCase.expected}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

analyzeUrgencyPatterns().catch(console.error);