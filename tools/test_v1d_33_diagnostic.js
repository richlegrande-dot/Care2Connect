/**
 * V1d_3.3 Diagnostic Tool
 * Tests the 5 target cases from V1d_3.2 design to see what patterns match
 */

const UrgencyEnhancements_v1d_33 = require('../backend/src/services/UrgencyEnhancements_v1d_33.js');

// Set debug mode
process.env.NODE_ENV = 'development';

const testCases = [
  {
    id: 'T002',
    category: 'MEDICAL',
    baseScore: 0.93,
    expectedAdjustment: 0.15,
    expectedLevel: 'CRITICAL',
    story: 'This is Maria Garcia. I need $3500 for surgery tomorrow.'
  },
  {
    id: 'T015',
    category: 'HOUSING',
    baseScore: 0.82,
    expectedAdjustment: 0.08,
    expectedLevel: 'HIGH',
    story: 'This is Lisa Anderson. Eviction notice. I need $2200 by Friday.'
  },
  {
    id: 'T025',
    category: 'UTILITIES',
    baseScore: 0.82,
    expectedAdjustment: 0.08,
    expectedLevel: 'HIGH',
    story: 'Sarah Williams calling. Electric bill is $450. Shutoff notice came.'
  },
  {
    id: 'T023',
    category: 'EDUCATION',
    baseScore: 0.65,
    expectedAdjustment: -0.03,
    expectedLevel: 'MEDIUM',
    story: 'Michael Martinez here. Need $600 for my kids school supplies.'
  },
  {
    id: 'T024',
    category: 'TRANSPORTATION',
    baseScore: 0.65,
    expectedAdjustment: 0.05,
    expectedLevel: 'MEDIUM',
    story: 'Hi, this is Jennifer Davis. Car broke down. Need $950 for repairs.'
  }
];

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║           V1d_3.3 Diagnostic Test Results                      ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

let passCount = 0;
let failCount = 0;

testCases.forEach(testCase => {
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Test Case: ${testCase.id} (${testCase.category})`);
  console.log(`Story: "${testCase.story}"`);
  console.log(`Base Score: ${testCase.baseScore.toFixed(3)}`);
  console.log(`Expected: ${testCase.expectedAdjustment >= 0 ? '+' : ''}${testCase.expectedAdjustment.toFixed(3)} → ${testCase.expectedLevel}`);
  console.log('');

  const story = { story: testCase.story };
  const result = UrgencyEnhancements_v1d_33.tuneUrgencyPrecision(
    story,
    testCase.baseScore,
    testCase.category
  );

  console.log('');
  console.log(`Result:`);
  console.log(`  Original:  ${result.originalUrgency.toFixed(3)}`);
  console.log(`  Adjusted:  ${result.adjustedUrgency.toFixed(3)}`);
  console.log(`  Change:    ${result.totalAdjustment >= 0 ? '+' : ''}${result.totalAdjustment.toFixed(3)}`);
  console.log(`  Reasons:   ${result.adjustments.length > 0 ? result.adjustments.join(', ') : 'NONE'}`);

  const pass = Math.abs(result.totalAdjustment - testCase.expectedAdjustment) < 0.01;
  if (pass) {
    console.log(`  Status:    ✅ PASS`);
    passCount++;
  } else {
    console.log(`  Status:    ❌ FAIL`);
    console.log(`  Expected:  ${testCase.expectedAdjustment >= 0 ? '+' : ''}${testCase.expectedAdjustment.toFixed(3)}`);
    console.log(`  Got:       ${result.totalAdjustment >= 0 ? '+' : ''}${result.totalAdjustment.toFixed(3)}`);
    failCount++;
  }
  console.log('');
});

console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Summary: ${passCount}/${testCases.length} tests passed`);
if (failCount === 0) {
  console.log(`✅ All tests passed!`);
} else {
  console.log(`❌ ${failCount} test(s) failed`);
}
console.log('');
