#!/usr/bin/env node

/**
 * DEBUG: Test amount_outside_tolerance fixes
 * Target: 9 specific failing cases with tolerance issues
 */

const fs = require('fs');
const path = require('path');

// Import the actual evaluator
const JanV3AnalyticsEvaluator = require('./jan-v3-analytics-runner.js');

async function testAmountToleranceIssues() {
  console.log('\n=== AMOUNT TOLERANCE DEBUG TEST ===\n');
  
  const evaluator = new JanV3AnalyticsEvaluator();
  
  // Test cases from the failing examples
  const testCases = [
    {
      id: 'HARD_024',
      transcript: "This is Laura Bennett speaking. It's not a crisis or anything, just my power gets shut off in 2 days if I don't pay $450.",
      expected: 450,
      tolerance: 0.02, // 2%
      reasoning: 'HARD case with 2% tolerance - should extract exactly $450'
    },
    {
      id: 'HARD_032',
      transcript: "This is Rebecca Turner. My mother is very sick and needs medication costing $800. I also got laid off 2 weeks ago and need $1,200 for rent.",
      expected: 2000, // Combined amount
      tolerance: 0.05, // 5%
      reasoning: 'Multi-amount case: $800 + $1200 = $2000 combined, 5% tolerance'
    },
    {
      id: '000REALISTIC_34',
      transcript: "Um, hi, I'm Hiroshi Garcia-Lopez. My car needs major repairs - about twelve hundred dollars. I rely on it to get to do my job and I'm concerned about losing my job.",
      expected: null, // No amount expected!
      tolerance: 0.05,
      reasoning: 'Expected NULL but system likely extracts 1200 - should extract no amount'
    },
    {
      id: 'TEST_PRECISION_1',
      transcript: "Hi, I need $999 for rent.",
      expected: 1000,
      tolerance: 0.02, // 2% = ±20, so 999 should be within range (980-1020)
      reasoning: 'Testing precision: 999 vs 1000 with 2% tolerance should pass'
    },
    {
      id: 'TEST_PRECISION_2', 
      transcript: "Hi, I need $975 for rent.",
      expected: 1000,
      tolerance: 0.02, // 2% = ±20, so 975 is outside range (980-1020)
      reasoning: 'Testing precision: 975 vs 1000 with 2% tolerance should fail (outside ±20)'
    }
  ];

  let totalCount = testCases.length;

  console.log('Testing amount tolerance logic...\n');

  for (const testCase of testCases) {
    console.log(`--- ${testCase.id} ---`);
    console.log(`Text: "${testCase.transcript}"`);
    console.log(`Expected: ${testCase.expected}`);
    console.log(`Tolerance: ${(testCase.tolerance*100).toFixed(1)}%`);
    console.log(`Logic: ${testCase.reasoning}`);
    
    // Process the transcript and extract the amount
    const result = await evaluator.processTranscript(testCase.transcript, { id: testCase.id });
    const actualAmount = result?.goalAmount;
    
    console.log(`Actual: ${actualAmount}`);
    
    // Calculate if it would be within tolerance
    if (testCase.expected === null) {
      const shouldPass = actualAmount === null;
      console.log(`Tolerance Check: ${shouldPass ? '✅ PASS' : '❌ FAIL'} (null expected)`);
    } else if (actualAmount === null) {
      console.log(`Tolerance Check: ❌ FAIL (expected ${testCase.expected}, got null)`);
    } else {
      const tolerance = testCase.expected * testCase.tolerance;
      const minAmount = testCase.expected - tolerance;
      const maxAmount = testCase.expected + tolerance;
      const withinTolerance = actualAmount >= minAmount && actualAmount <= maxAmount;
      
      console.log(`Tolerance Range: ${minAmount.toFixed(2)} - ${maxAmount.toFixed(2)}`);
      console.log(`Tolerance Check: ${withinTolerance ? '✅ PASS' : '❌ FAIL'}`);
      
      if (!withinTolerance) {
        const difference = Math.abs(actualAmount - testCase.expected);
        const percentOff = (difference / testCase.expected * 100).toFixed(2);
        console.log(`❌ TOLERANCE ISSUE: ${difference} difference (${percentOff}% off)`);
      }
    }
    console.log('');
  }

  console.log(`\n=== AMOUNT TOLERANCE ANALYSIS ===`);
  console.log(`This test helps identify the specific tolerance calculation issues.`);
  console.log(`Common problems:`);
  console.log(`1. Strict tolerance settings (2% = very tight)`);
  console.log(`2. Multi-amount cases needing combined totals`);
  console.log(`3. Cases expecting null but system extracts amounts`);
  console.log(`4. Precision/rounding errors in calculations`);
  
  return true;
}

// Run the test
testAmountToleranceIssues().catch(console.error);