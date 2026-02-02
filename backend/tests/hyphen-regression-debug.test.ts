/**
 * JAN TEST v.1 - HYPHEN FIX REGRESSION DEBUG
 * Success Rate Status: 50/88 (56.8%) - DOWN from 52/88 (59.1%)
 * Issue: Hyphen fix working but causing new regressions
 */

import { extractGoalAmountWithConfidence } from '../src/utils/extraction/rulesEngine';

describe('Hyphen Fix Regression Debug', () => {
  test('Debug specific hyphen fix regression cases', () => {
    console.log('\n=== HYPHEN FIX REGRESSION ANALYSIS ===');
    
    const testCases = [
      {
        description: 'FIXED: "forty-seven" compound',
        text: 'I need two thousand three hundred forty-seven dollars',
        expected: 2347
      },
      {
        description: 'REGRESSION: "ninety-two" compound',
        text: 'Need seven thousand eight hundred and ninety-two',
        expected: 7892
      },
      {
        description: 'REGRESSION: Roman numeral complex',
        text: 'Need about III thousand five hundred',
        expected: 3500
      },
      {
        description: 'BASELINE: Simple case',
        text: 'I need three thousand five hundred dollars',
        expected: 3500
      }
    ];

    testCases.forEach((testCase) => {
      console.log(`\n--- ${testCase.description} ---`);
      console.log(`Text: "${testCase.text}"`);
      console.log(`Expected: ${testCase.expected}`);
      
      const result = extractGoalAmountWithConfidence(testCase.text);
      console.log(`Actual: ${result.value}`);
      console.log(`Confidence: ${result.confidence}`);
      
      if (result.value === testCase.expected) {
        console.log('✅ PASS');
      } else {
        console.log('❌ FAIL');
        if (result.value) {
          const diff = Math.abs(result.value - testCase.expected);
          console.log(`   Difference: ${diff}`);
          
          // Analyze pattern
          if (diff < 100) {
            console.log('   PATTERN: Missing compound number (tens+ones)');
          } else if (diff > 100) {
            console.log('   PATTERN: Missing major component (hundreds/thousands)');
          }
        } else {
          console.log('   PATTERN: Complete extraction failure');
        }
      }
      console.log('---');
    });
    
    console.log('\n=== ANALYSIS SUMMARY ===');
    console.log('1. Hyphen fix working for "forty-seven" ✅');
    console.log('2. New regression in "ninety-two" ❌');
    console.log('3. Roman numeral + complex still broken ❌'); 
    console.log('4. Need to investigate pattern interaction');
  });
});