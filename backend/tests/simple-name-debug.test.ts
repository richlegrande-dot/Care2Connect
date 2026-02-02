import { extractNameWithConfidence } from '../src/utils/extraction/rulesEngine';

describe('Simple name extraction regression check', () => {
  test('Simple name extraction cases', () => {
    const tests = [
      "Hi, my name is John Smith and I need help",
      "I'm Sarah Johnson",
      "Call me Robert Davis",
      "This is Jennifer Wilson speaking"
    ];
    
    tests.forEach(test => {
      console.log('Testing:', test);
      const result = extractNameWithConfidence(test);
      console.log('Result:', result);
      console.log('---');
    });
  });
});