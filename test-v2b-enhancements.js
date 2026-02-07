/**
 * Test V2b Extended Category Intelligence on Category Wrong Cases
 * 
 * Focus on remaining category_wrong failures to validate Phase 4A improvements
 */

const { CategoryEnhancements_v2b } = require('./backend/src/services/CategoryEnhancements_v2b.js');

// Test cases that were identified as category_wrong in recent reports
const testCases = [
  {
    id: 'T007', 
    expected: 'TRANSPORTATION',
    current: 'EMPLOYMENT',
    title: 'Car Repair Help',
    transcript: 'Hi, I need help with car repairs. My car broke down and I need to get it fixed so I can get to work. The mechanic says it will cost about $800. I am hoping you might be able to help me with some assistance for this repair.'
  },
  {
    id: 'T012',
    expected: 'OTHER', 
    current: 'SAFETY',
    title: 'Funeral Expenses',
    transcript: 'My grandmother passed away last week and we need help with funeral expenses after her father passed away. We need about $3000 for the ceremony. Any assistance would be greatly appreciated.'
  },
  {
    id: 'T018',
    expected: 'TRANSPORTATION',
    current: 'EMPLOYMENT', 
    title: 'Transportation for Work',
    transcript: 'I lost my job recently and my car broke down the same week. I have job interviews lined up but I need transportation to get there. Can you help me get my car repaired so I can get back to work?'
  },
  {
    id: 'EMPLOYMENT_TRANSPORT_1',
    expected: 'EMPLOYMENT',
    current: 'TRANSPORTATION',
    title: 'Job Loss Transportation',
    transcript: 'I was laid off from my job last month and now I cannot afford my car payments. The bank is going to repossess my vehicle and without it I cannot find new employment. I desperately need help keeping my car.'
  },
  {
    id: 'HEALTHCARE_SAFETY_1', 
    expected: 'HEALTHCARE',
    current: 'SAFETY',
    title: 'Medical Emergency',
    transcript: 'I need emergency medical care for a serious condition. The doctor says I need surgery immediately and it cannot wait. The hospital requires payment upfront and I do not have insurance coverage.'
  },
  {
    id: 'HOUSING_SAFETY_1',
    expected: 'HOUSING',
    current: 'SAFETY', 
    title: 'Eviction Notice',
    transcript: 'My landlord is threatening to evict me if I do not pay the rent by tomorrow. I received an eviction notice and I am scared about where my children and I will go if we lose our home.'
  },
  {
    id: 'EDUCATION_OTHER_1',
    expected: 'EDUCATION',
    current: 'OTHER',
    title: 'College Tuition',
    transcript: 'I am trying to finish my degree at the community college but I cannot afford the tuition for my final semester. I need help paying for my classes so I can graduate and get a better job.'
  },
  {
    id: 'UTILITIES_HOUSING_1',
    expected: 'UTILITIES', 
    current: 'HOUSING',
    title: 'Utility Shutoff',
    transcript: 'My electricity bill is overdue and the power company sent a shutoff notice. They will disconnect my power next week if I do not pay the full amount. I need help with my electric bill.'
  }
];

async function testV2bEnhancements() {
  console.log('🧠 Testing V2b Extended Category Intelligence');
  console.log('=' .repeat(80));
  
  const v2bEngine = new CategoryEnhancements_v2b();
  let totalTests = 0;
  let correctlyEnhanced = 0;
  
  for (const testCase of testCases) {
    totalTests++;
    
    console.log(`\n🔍 Testing: ${testCase.id} - "${testCase.title}"`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   Current: ${testCase.current}`);
    
    // Apply V2b enhancements
    const baseResult = {
      category: testCase.current,
      extractedCategory: testCase.current,
      confidence: 0.7
    };
    
    const result = v2bEngine.enhanceCategory(testCase.transcript, baseResult);
    
    console.log(`   Enhanced: ${result.category}`);
    console.log(`   Confidence: ${result.confidence}`);
    
    if (result.reasons.length > 0) {
      console.log(`   Reasons: ${result.reasons.join(', ')}`);
    }
    
    // Check if enhancement corrected the category
    const isCorrect = result.category === testCase.expected;
    const wasChanged = result.category !== testCase.current;
    
    if (isCorrect) correctlyEnhanced++;
    
    console.log(`   ✅ Status: ${isCorrect ? 'CORRECT' : 'NEEDS REFINEMENT'} | ${wasChanged ? 'CHANGED' : 'UNCHANGED'}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 V2B EXTENDED INTELLIGENCE RESULTS');
  console.log(`   Correct Classifications: ${correctlyEnhanced}/${totalTests} (${(correctlyEnhanced/totalTests*100).toFixed(1)}%)`);
  console.log(`   Target for Phase 4A: ${correctlyEnhanced >= 6 ? '✅ LIKELY SUCCESS' : '⚠️ NEEDS REFINEMENT'}`);
  
  if (correctlyEnhanced >= 6) {
    console.log('\n🎯 V2b shows strong potential for addressing category_wrong cases!');
    console.log('   Ready for integration testing with V1b+V2a+V2b configuration.');
  } else {
    console.log('\n⚠️ V2b patterns need refinement for better category disambiguation.');
    console.log('   Consider adjusting confidence thresholds and detection patterns.');
  }
  console.log('='.repeat(80));
}

// Run the test
testV2bEnhancements().catch(console.error);