import { extractGoalAmountWithConfidence } from '../../../backend/src/utils/extraction/rulesEngine';

// Test individual cases with detailed function tracing
describe('Deep function debugging', () => {
  test('Step-by-step scientific notation processing', () => {
    console.log('=== TESTING: "I need 5e3 dollars" ===');
    
    // Monkey-patch the function to add logging
    const originalFunction = extractGoalAmountWithConfidence;
    
    const result = originalFunction('I need 5e3 dollars');
    console.log('Final result:', result);
    
    // Manual pattern testing
    const transcript = 'I need 5e3 dollars';
    const pattern = /\b([\d.]+)[eE]([\d]+)\b/i;
    const matches = transcript.match(pattern);
    
    console.log('Pattern:', pattern.toString());
    console.log('Manual matches:', matches);
    
    if (matches) {
      const base = parseFloat(matches[1]);
      const exponent = parseInt(matches[2]);
      console.log('Base:', base, 'Exponent:', exponent);
      console.log('Scientific value:', base * Math.pow(10, exponent));
    }
    
    expect(result.value).not.toBeNull();
  });
  
  test('Step-by-step Roman numeral processing', () => {
    console.log('=== TESTING: "I need V thousand dollars" ===');
    
    const result = extractGoalAmountWithConfidence('I need V thousand dollars');
    console.log('Final result:', result);
    
    // Manual pattern testing
    const transcript = 'I need V thousand dollars';
    const pattern = /\b([IVXLCDM]+)\s+thousand/i;
    const matches = transcript.match(pattern);
    
    console.log('Pattern:', pattern.toString());
    console.log('Manual matches:', matches);
    
    expect(result.value).not.toBeNull();
  });
});