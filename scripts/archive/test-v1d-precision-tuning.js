/**
 * Test V1d Precision Tuning on Over-Assessed Cases
 * 
 * Focus on urgency_over_assessed failures to validate Phase 3B improvements
 */

const UrgencyPrecisionTuning = require('./backend/src/services/UrgencyEnhancements_v1d.js');

// Test cases that were identified as urgency_over_assessed in recent reports
const testCases = [
  {
    id: 'T007', 
    expected: 'MEDIUM',
    currentScore: 0.75, // Over-assessed as HIGH 
    category: 'TRANSPORTATION',
    title: 'Car Repair Help',
    story: 'Hi, I need help with car repairs. My car broke down and I need to get it fixed so I can get to work. The mechanic says it will cost about $800. I am hoping you might be able to help me with some assistance for this repair.'
  },
  {
    id: 'T011',
    expected: 'LOW', 
    currentScore: 0.65, // Over-assessed as HIGH
    category: 'OTHER',
    title: 'Personal Situation',
    story: 'Hello, I have a personal situation that is hard to explain. It is not medical or housing related, just a personal situation. I need about $1000 to resolve this. I would appreciate any help you could provide.'
  },
  {
    id: 'T012',
    expected: 'MEDIUM',
    currentScore: 0.80, // Over-assessed as CRITICAL
    category: 'OTHER', 
    title: 'Funeral Expenses',
    story: 'My grandmother passed away last week and we need help with funeral expenses after her father passed away. We need about $3000 for the ceremony. Any assistance would be greatly appreciated.'
  },
  {
    id: 'EDUCATION_OVER_1',
    expected: 'MEDIUM',
    currentScore: 0.70, // Over-assessed as HIGH
    category: 'EDUCATION',
    title: 'Training Program',
    story: 'I am interested in a certification program that would help me get a better job. The program costs about $2800 and I start next month. I would like to get some help with the tuition if possible.'
  },
  {
    id: 'HEALTHCARE_ROUTINE_1', 
    expected: 'MEDIUM',
    currentScore: 0.75, // Over-assessed as HIGH
    category: 'HEALTHCARE',
    title: 'Medical Appointment',
    story: 'I need help paying for a routine medical check-up and some prescription medications. The total cost will be around $400. I have an appointment scheduled for next week.'
  },
  {
    id: 'EMPLOYMENT_SEARCH_1',
    expected: 'MEDIUM',
    currentScore: 0.68, // Over-assessed as HIGH
    category: 'EMPLOYMENT', 
    title: 'Job Search Help',
    story: 'I have been looking for work for a few months now. I need help with interview clothes and transportation costs for job interviews. I think I need around $300 total to help me find employment.'
  }
];

function mapScoreToUrgency(score) {
  if (score >= 0.77) return 'CRITICAL';
  if (score >= 0.47) return 'HIGH';
  if (score >= 0.15) return 'MEDIUM';
  return 'LOW';
}

async function testV1dPrecisionTuning() {
  console.log('🔧 Testing V1d Precision Tuning for Over-Assessment Reduction');
  console.log('=' .repeat(80));
  
  const precisionTuner = new UrgencyPrecisionTuning();
  let totalTests = 0;
  let correctlyTuned = 0;
  let significantReductions = 0;
  
  for (const testCase of testCases) {
    totalTests++;
    
    console.log(`\n🔍 Testing: ${testCase.id} - "${testCase.title}"`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   Current Score: ${testCase.currentScore} (${mapScoreToUrgency(testCase.currentScore)})`);
    console.log(`   Category: ${testCase.category}`);
    
    // Apply V1d precision tuning
    const result = precisionTuner.tuneUrgencyPrecision(testCase, testCase.currentScore, testCase.category);
    const tunedUrgency = mapScoreToUrgency(result.adjustedUrgency);
    const adjustment = result.adjustedUrgency - testCase.currentScore;
    
    console.log(`   Tuned Score: ${result.adjustedUrgency.toFixed(3)}`);
    console.log(`   Tuned Level: ${tunedUrgency}`);
    console.log(`   Adjustment: ${adjustment >= 0 ? '+' : ''}${adjustment.toFixed(3)}`);
    
    if (result.adjustments.length > 0) {
      console.log(`   Adjustments: ${result.adjustments.join(', ')}`);
    }
    
    // Check if tuning improved the assessment
    const isCorrect = tunedUrgency === testCase.expected;
    const isSignificantReduction = adjustment <= -0.1; // 10%+ reduction
    
    if (isCorrect) correctlyTuned++;
    if (isSignificantReduction) significantReductions++;
    
    console.log(`   ✅ Status: ${isCorrect ? 'CORRECT' : 'NEEDS REFINEMENT'} | ${isSignificantReduction ? 'SIGNIFICANT REDUCTION' : 'Minor adjustment'}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 V1D PRECISION TUNING RESULTS');
  console.log(`   Correct Classifications: ${correctlyTuned}/${totalTests} (${(correctlyTuned/totalTests*100).toFixed(1)}%)`);
  console.log(`   Significant Reductions: ${significantReductions}/${totalTests} (${(significantReductions/totalTests*100).toFixed(1)}%)`);
  console.log(`   Target for Phase 3B: ${correctlyTuned >= 4 ? '✅ LIKELY SUCCESS' : '⚠️ NEEDS REFINEMENT'}`);
  console.log('='.repeat(80));
}

// Run the test
testV1dPrecisionTuning().catch(console.error);