import { extractNameWithConfidence } from '../src/utils/extraction/rulesEngine';

describe('Multilingual name extraction', () => {
  test('Debug multilingual name extraction', () => {
    const codeSwitch1 = "Mi nombre es María and I need $3,000 for medical expenses";
    
    console.log('Testing text:', codeSwitch1);
    
    const result = extractNameWithConfidence(codeSwitch1);
    console.log('Name extraction result:', result);
    
    expect(result.value).toContain("María");
  });
});
