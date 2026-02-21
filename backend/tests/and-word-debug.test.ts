/**
 * JAN TEST v.1 - "AND" WORD INTERACTION DEBUG
 * Investigating why "and ninety-two" is lost after hyphen fix
 */

import { extractGoalAmountWithConfidence } from '../src/utils/extraction/rulesEngine';

// Mock parseWrittenNumber to see what text gets passed to it
function parseWrittenNumber(text: string): number | null {
  console.log(`    parseWrittenNumber input: "${text}"`);
  
  const numberWords: { [key: string]: number } = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
    'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
    'eighty': 80, 'ninety': 90, 'hundred': 100, 'thousand': 1000
  };
  
  const words = text.toLowerCase().replace(/-/g, ' ').replace(/\\band\\b/g, '').split(/\\s+/);
  console.log(`    Words after processing: [${words.map(w => `"${w}"`).join(', ')}]`);
  
  let total = 0;
  let current = 0;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (numberWords[word]) {
      const value = numberWords[word];
      console.log(`    Processing "${word}" = ${value}`);
      
      if (word === 'hundred') {
        current = current === 0 ? 100 : current * 100;
      } else if (word === 'thousand') {
        if (current === 0) current = 1;
        total += current * 1000;
        current = 0;
      } else if (value >= 20 && value < 100) {
        // Compound number handling
        const nextWord = words[i + 1];
        if (nextWord && numberWords[nextWord] && numberWords[nextWord] < 10 && numberWords[nextWord] > 0) {
          console.log(`    Compound: ${word} + ${nextWord} = ${value + numberWords[nextWord]}`);
          current += value + numberWords[nextWord];
          i++; // Skip next word
        } else {
          current += value;
        }
      } else {
        current += value;
      }
    } else {
      console.log(`    Skipping non-number word: "${word}"`);
    }
  }
  
  total += current;
  console.log(`    Final result: ${total}`);
  return total > 0 ? total : null;
}

describe('"and" Word Interaction Debug', () => {
  test('Debug "and" word handling in compound numbers', () => {
    console.log('\\n=== "AND" WORD INTERACTION ANALYSIS ===');
    
    const testCases = [
      {
        description: 'WITHOUT "and" - working',
        text: 'Need seven thousand eight hundred ninety-two',
        expected: 7892
      },
      {
        description: 'WITH "and" - failing', 
        text: 'Need seven thousand eight hundred and ninety-two',
        expected: 7892
      },
      {
        description: 'Direct test of number extraction',
        text: 'seven thousand eight hundred and ninety-two',
        expected: 7892
      }
    ];

    testCases.forEach((testCase, index) => {
      console.log(`\\n--- Case ${index + 1}: ${testCase.description} ---`);
      console.log(`Full text: "${testCase.text}"`);
      
      // Test the full extraction
      const result = extractGoalAmountWithConfidence(testCase.text);
      console.log(`Extraction result: ${result.value} (confidence: ${result.confidence})`);
      
      // Test manual parsing of just the number part
      if (testCase.text.includes('seven thousand')) {
        console.log(`\\n  Manual parsing test:`);
        const numberPart = testCase.text.match(/seven thousand eight hundred(?: and)? ninety-two/i);
        if (numberPart) {
          console.log(`  Extracted pattern: "${numberPart[0]}"`);
          const parsed = parseWrittenNumber(numberPart[0]);
          console.log(`  Manual parse result: ${parsed}`);
        }
      }
      
      console.log(`Expected: ${testCase.expected}, Got: ${result.value}`);
      console.log(`Status: ${result.value === testCase.expected ? '✅ PASS' : '❌ FAIL'}`);
    });
    
    console.log('\\n=== HYPOTHESIS ===');
    console.log('1. "and" word may be stripped by regex pattern');
    console.log('2. Pattern may not capture text after "and"'); 
    console.log('3. Need to examine the written number regex pattern');
  });
});
