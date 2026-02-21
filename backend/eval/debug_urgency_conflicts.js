#!/usr/bin/env node

/**
 * DEBUG: Test urgency_conflicting_signals fixes
 * Target: 6 specific failing cases with conflicting urgency language
 */

const fs = require('fs');
const path = require('path');

// Import the actual evaluator
const JanV3AnalyticsEvaluator = require('./jan-v3-analytics-runner.js');

async function testUrgencyConflictingSignals() {
  console.log('\n=== URGENCY CONFLICTING SIGNALS DEBUG TEST ===\n');
  
  const evaluator = new JanV3AnalyticsEvaluator();
  
  // Test cases from HARD dataset with urgency_conflicting_signals
  const testCases = [
    {
      id: 'HARD_021',
      transcript: "This is urgent but not an emergency. I'm Brian Mitchell and I need $1,500 for rent by next week.",
      expected: 'HIGH',
      reasoning: '"urgent but not emergency" + "by next week" → HIGH (downplaying override)'
    },
    {
      id: 'HARD_026', 
      transcript: "My name is Jessica Hill. I'm desperate and at my wit's end, but I know others have it worse. Need $600 for groceries.",
      expected: 'HIGH',
      reasoning: '"desperate and wit\'s end" overrides "others have it worse" → HIGH (emotional distress + real need)'
    },
    {
      id: 'HARD_027',
      transcript: "This is Ryan Cooper. Not urgent, I can probably manage, but the foreclosure notice says I have 10 days to pay $5,000.",
      expected: 'CRITICAL', 
      reasoning: '"not urgent, can manage" overridden by "foreclosure + 10 days" → CRITICAL (objective circumstances)'
    },
    {
      id: 'HARD_022',
      transcript: "Hi, my name is Nicole Adams. This isn't urgent at all...but I got an eviction notice yesterday and have to pay $2,000 by tomorrow.",
      expected: 'CRITICAL',
      reasoning: '"not urgent at all" overridden by "eviction notice + tomorrow" → CRITICAL (objective circumstances)'
    },
    {
      id: 'HARD_024',
      transcript: "This is Laura Bennett speaking. It's not a crisis or anything, just my power gets shut off in 2 days if I don't pay $450.",
      expected: 'CRITICAL',
      reasoning: '"not a crisis" overridden by "power shutoff in 2 days" → CRITICAL (objective circumstances)'
    },
    {
      id: 'HARD_028',
      transcript: "Hi, I'm Samantha White. This is kind of urgent but I don't want to overstate it. My surgery is scheduled for next week and I need $3,500.",
      expected: 'CRITICAL',
      reasoning: '"don\'t want to overstate" overridden by "surgery scheduled next week" → CRITICAL (medical urgency)'
    }
  ];

  let passCount = 0;
  let totalCount = testCases.length;

  console.log('Testing urgency conflict resolution logic...\n');

  for (const testCase of testCases) {
    console.log(`--- ${testCase.id} ---`);
    console.log(`Text: "${testCase.transcript}"`);
    console.log(`Expected: ${testCase.expected}`);
    console.log(`Logic: ${testCase.reasoning}`);
    
    // Test the urgency assessment directly
    const actualUrgency = evaluator.assessUrgencyFallback(testCase.transcript);
    
    const passed = actualUrgency === testCase.expected;
    console.log(`Actual: ${actualUrgency} ${passed ? '✅' : '❌'}`);
    
    if (passed) {
      passCount++;
    } else {
      console.log(`❌ CONFLICT RESOLUTION FAILED: Expected ${testCase.expected}, got ${actualUrgency}`);
    }
    console.log('');
  }

  console.log(`\n=== URGENCY CONFLICTING SIGNALS RESULTS ===`);
  console.log(`✅ Passed: ${passCount}/${totalCount} (${((passCount/totalCount)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${totalCount - passCount}/${totalCount}`);

  if (passCount === totalCount) {
    console.log(`\n🎯 SUCCESS: All urgency_conflicting_signals cases now pass!`);
    console.log(`This should improve the full evaluation by ${totalCount} cases.`);
  } else {
    console.log(`\n⚠️  Need additional tuning for ${totalCount - passCount} remaining conflict cases.`);
  }
  
  return passCount === totalCount;
}

// Run the test
testUrgencyConflictingSignals().catch(console.error);