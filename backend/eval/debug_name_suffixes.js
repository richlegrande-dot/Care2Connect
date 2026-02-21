#!/usr/bin/env node

/**
 * DEBUG: Test name_suffix_included fixes
 * Target: 2 specific failing cases with name suffixes
 */

const fs = require('fs');
const path = require('path');

// Import the actual evaluator
const JanV3AnalyticsEvaluator = require('./jan-v3-analytics-runner.js');

async function testNameSuffixCleaning() {
  console.log('\n=== NAME SUFFIX CLEANING DEBUG TEST ===\n');
  
  const evaluator = new JanV3AnalyticsEvaluator();
  
  // Test cases from HARD dataset with name_suffix_included
  const testCases = [
    {
      id: 'HARD_051',
      transcript: "This is...uh...Mr. Robert James Patterson III speaking. Need $2,100 for housing.",
      expected: 'Robert James Patterson',
      reasoning: 'Should remove both "Mr." prefix and "III" suffix'
    },
    {
      id: 'HARD_053', 
      transcript: "Um, hi...so, my name is...well...it's complicated but...Thomas Allen Jr. I need $950.",
      expected: 'Thomas Allen',
      reasoning: 'Should remove "Jr." suffix from name'
    },
    {
      id: 'TEST_ADDITIONAL_SUFFIXES',
      transcript: "My name is John Smith Sr. and I need help with $500.",
      expected: 'John Smith',
      reasoning: 'Should handle Sr. suffix as well'
    },
    {
      id: 'TEST_ROMAN_NUMERALS',
      transcript: "This is William Johnson II calling about $750.",
      expected: 'William Johnson',
      reasoning: 'Should handle Roman numeral suffixes (II, IV, etc.)'
    }
  ];

  let passCount = 0;
  let totalCount = testCases.length;

  console.log('Testing name suffix cleaning logic...\n');

  for (const testCase of testCases) {
    console.log(`--- ${testCase.id} ---`);
    console.log(`Text: "${testCase.transcript}"`);
    console.log(`Expected: "${testCase.expected}"`);
    console.log(`Logic: ${testCase.reasoning}`);
    
    // Process the transcript and extract the name
    const result = await evaluator.processTranscript(testCase.transcript, { id: testCase.id });
    const actualName = result?.name;
    
    const passed = actualName === testCase.expected;
    console.log(`Actual: "${actualName}" ${passed ? '✅' : '❌'}`);
    
    if (passed) {
      passCount++;
    } else {
      console.log(`❌ NAME SUFFIX CLEANING FAILED: Expected "${testCase.expected}", got "${actualName}"`);
    }
    console.log('');
  }

  console.log(`\n=== NAME SUFFIX CLEANING RESULTS ===`);
  console.log(`✅ Passed: ${passCount}/${totalCount} (${((passCount/totalCount)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${totalCount - passCount}/${totalCount}`);

  if (passCount === totalCount) {
    console.log(`\n🎯 SUCCESS: All name_suffix_included cases should now pass!`);
    console.log(`This should improve the full evaluation by ${totalCount - 2} additional cases.`);
  } else {
    console.log(`\n⚠️  Need additional tuning for ${totalCount - passCount} remaining suffix cases.`);
  }
  
  return passCount === totalCount;
}

// Run the test
testNameSuffixCleaning().catch(console.error);