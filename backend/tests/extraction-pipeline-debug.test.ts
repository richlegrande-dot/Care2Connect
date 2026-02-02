import { extractGoalAmountWithConfidence } from '../src/utils/extraction/rulesEngine';

// Test the intermediate extraction steps
describe('Amount extraction pipeline debugging', () => {
  test('Step-by-step extraction debugging', () => {
    const test = "I need two thousand three hundred forty-seven dollars";
    
    console.log('Full transcript:', test);
    const result = extractGoalAmountWithConfidence(test);
    console.log('Final result:', result);
    
    // Test if the issue is in text matching or processing
    const patterns = [
      /(?:need|raise|goal of|at least)\s+((?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)(?:\s+(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand))*)/i
    ];
    
    patterns.forEach((pattern, index) => {
      const matches = test.match(pattern);
      console.log(`Pattern ${index}:`, pattern.toString());
      if (matches) {
        console.log(`  Match: [${matches[0]}] -> captured: [${matches[1]}]`);
      } else {
        console.log('  No match');
      }
    });
  });
});