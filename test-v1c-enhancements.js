/**
 * Test V1c Advanced Urgency Intelligence on Core30 Cases
 * 
 * Focus on urgency_under_assessed failures to validate Phase 3A improvements
 */

const UrgencyEnhancements = require('./backend/src/services/UrgencyEnhancements_v1c.js');

// Test cases that were identified as urgency_under_assessed in recent reports
const testCases = [
  {
    id: 'T022', 
    expected: 'CRITICAL',
    title: 'Emergency Rent Help',
    story: 'I am a single mother of two young children and we received an eviction notice yesterday. We have until tomorrow to pay $1,200 or we will be forced out. My children are 3 and 5 years old and I am terrified about where we will go. I lost my job two weeks ago and have no family support. Without this help, we will be homeless by tomorrow night with nowhere to go.'
  },
  {
    id: 'T028',
    expected: 'HIGH', 
    title: 'Medical Emergency Fund',
    story: 'My husband had a heart attack last week and is scheduled for emergency bypass surgery tomorrow morning. The hospital requires a $3,000 deposit before they will proceed with the operation. We have exhausted our savings and insurance only covers part of it. The surgeon said the surgery cannot be delayed - his life depends on this operation happening tomorrow.'
  },
  {
    id: 'T030',
    expected: 'CRITICAL',
    title: 'Utility Shutoff Crisis', 
    story: 'Our electricity was disconnected this morning due to unpaid bills totaling $450. We have a newborn baby in the house and no heat or power. The baby needs to stay warm and I need electricity to sterilize bottles and pump breast milk. The utility company said if we pay today, they can reconnect tomorrow, but we have no money left after paying for formula and diapers.'
  },
  {
    id: 'FAMILY_CRISIS_1',
    expected: 'CRITICAL',
    title: 'Child Protective Services',
    story: 'CPS is coming tomorrow for a home inspection and said if we don\'t have running water and electricity, they will remove our children from the home. Our utilities were shut off last week and we owe $680 to get them restored. We are desperate single parents with nowhere else to turn. Our kids are scared and we cannot lose them.'
  },
  {
    id: 'EMPLOYMENT_CRISIS_1', 
    expected: 'HIGH',
    title: 'Job Loss Transportation',
    story: 'I was fired yesterday from my job and my car broke down the same day. I have three job interviews this week but no way to get there. I am the sole breadwinner for my family with two young children. Without transportation, I cannot work and we will lose our apartment. I desperately need help fixing my car to get back to work immediately.'
  },
  {
    id: 'MEDICAL_CRISIS_1',
    expected: 'CRITICAL', 
    title: 'Surgery Complications',
    story: 'My daughter is having emergency surgery this afternoon to remove a malignant tumor. The oncologist said it is aggressive cancer and the surgery cannot wait. I need help with transportation costs to get to the hospital 200 miles away and lodging while she recovers. This is life-threatening and time is running out.'
  }
];

function mapScoreToUrgency(score) {
  if (score >= 0.8) return 'CRITICAL';
  if (score >= 0.6) return 'HIGH';
  if (score >= 0.3) return 'MEDIUM';
  return 'LOW';
}

async function testV1cEnhancements() {
  console.log('🧪 Testing V1c Advanced Urgency Intelligence');
  console.log('=' .repeat(80));
  
  const enhancement = new UrgencyEnhancements();
  let totalTests = 0;
  let correctlyEnhanced = 0;
  let significantImprovements = 0;
  
  for (const testCase of testCases) {
    totalTests++;
    
    // Simulate baseline urgency score (conservatively low - what the under-assessed cases would have)
    const baselineScore = testCase.expected === 'CRITICAL' ? 0.45 : 
                         testCase.expected === 'HIGH' ? 0.35 : 0.25;
    
    console.log(`\n🔍 Testing: ${testCase.id} - "${testCase.title}"`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   Baseline Score: ${baselineScore}`);
    
    // Apply V1c enhancements
    const result = enhancement.enhanceUrgency(testCase, baselineScore);
    const enhancedUrgency = mapScoreToUrgency(result.adjustedUrgency);
    const improvement = result.adjustedUrgency - baselineScore;
    
    console.log(`   Enhanced Score: ${result.adjustedUrgency.toFixed(3)}`);
    console.log(`   Enhanced Level: ${enhancedUrgency}`);
    console.log(`   Improvement: +${improvement.toFixed(3)}`);
    
    if (result.enhancements.length > 0) {
      console.log(`   Enhancements: ${result.enhancements.join(', ')}`);
    }
    
    // Check if enhancement improved the assessment
    const isCorrect = enhancedUrgency === testCase.expected;
    const isSignificantImprovement = improvement >= 0.15; // 15%+ boost
    
    if (isCorrect) correctlyEnhanced++;
    if (isSignificantImprovement) significantImprovements++;
    
    console.log(`   ✅ Status: ${isCorrect ? 'CORRECT' : 'NEEDS TUNING'} | ${isSignificantImprovement ? 'SIGNIFICANT BOOST' : 'Minor boost'}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 V1C ENHANCEMENT RESULTS');
  console.log(`   Correct Classifications: ${correctlyEnhanced}/${totalTests} (${(correctlyEnhanced/totalTests*100).toFixed(1)}%)`);
  console.log(`   Significant Improvements: ${significantImprovements}/${totalTests} (${(significantImprovements/totalTests*100).toFixed(1)}%)`);
  console.log(`   Target for Phase 3A: ${correctlyEnhanced >= 4 ? '✅ LIKELY SUCCESS' : '⚠️ NEEDS REFINEMENT'}`);
  console.log('='.repeat(80));
}

// Run the test
testV1cEnhancements().catch(console.error);