import { extractNameWithConfidence } from '../src/utils/extraction/rulesEngine';

describe('Name extraction debugging', () => {
  test('Debug legal language name extraction', () => {
    const legalese = "The undersigned party, hereinafter referred to as the 'Beneficiary' (namely one Ms. Sarah Elizabeth Thompson, hereafter 'Claimant')";
    
    console.log('Testing text:', legalese);
    
    const result = extractNameWithConfidence(legalese);
    console.log('Name extraction result:', result);
    
    // Manual pattern testing
    const patterns = [
      /(?:my name is|i'm|i am|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /(?:Ms\.|Mr\.|Dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /namely one\s+(?:Ms\.|Mr\.|Dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
    ];
    
    patterns.forEach((pattern, index) => {
      const matches = legalese.match(pattern);
      console.log(`Pattern ${index}:`, pattern.toString());
      if (matches) {
        console.log(`  Match: [${matches[0]}] -> captured: [${matches[1]}]`);
      } else {
        console.log('  No match');
      }
    });
    
    expect(result.value).not.toBeNull();
  });
});
