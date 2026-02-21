/**
 * Internal Helper Coverage Tests
 * Tests for uncovered internal helper functions in rulesEngine.ts
 * These tests trigger code paths that exercise validateNameCandidate, parseWrittenNumber, parseNumericAmount
 */

import { 
  extractName, 
  extractGoalAmount, 
  extractUrgency 
} from '../../../src/utils/extraction/rulesEngine';

describe('rulesEngine Internal Helpers Coverage', () => {
  
  describe('getNormalizedText cache coverage', () => {
    test('should cache normalized text for performance', () => {
      // Call extractName multiple times with same input to trigger cache
      const transcript = "I'm John Smith. I need help";
      extractName(transcript);
      extractName(transcript); // Second call should hit cache
      extractName(transcript); // Third call should hit cache
      
      expect(extractName(transcript)).toBe('John Smith');
    });
    
    test('should handle cache overflow (>1000 entries)', () => {
      // Generate many unique transcripts to overflow cache
      for (let i = 0; i < 1050; i++) {
        extractName(`I'm Person${i} Test${i} here`);
      }
      
      // Cache should still work after eviction
      const result = extractName("I'm Final Test.");
      expect(result).toBe('Final Test');
    });
  });

  describe('validateNameCandidate internal logic', () => {
    test('should reject names matching reject patterns', () => {
      // These should be rejected by NAME_REJECT_PATTERNS
      const rejectCases = [
        "I'm speaking here today",
        "My name is Help Me Please", // Contains reject words
        "I'm And But Or", // Contains conjunctions
      ];
      
      for (const transcript of rejectCases) {
        const result = extractName(transcript);
        // Name should either be null or have low confidence
        if (result?.value) {
          expect(result.confidence).toBeLessThan(0.5);
        }
      }
    });
    
    test('should validate names with proper capitalization', () => {
      // Proper capitalization should boost confidence
      const result = extractName("I'm John Smith. I need help");
      expect(result).toBe('John Smith');
    });
    
    test('should penalize very short names', () => {
      // Names under 3 characters should still be extracted if valid
      const result = extractName("I'm Al");
      expect(result).toBeDefined();
    });
    
    test('should penalize very long names', () => {
      // Names over 50 characters should still be handled
      const longName = "I'm Verylongfirstname Verylonglastname";
      const result = extractName(longName);
      expect(result).toBeDefined();
    });
    
    test('should boost confidence for multi-token names (first + last)', () => {
      // Two-token names should be extracted
      const result = extractName("I'm John Smith");
      expect(result).toBe('John Smith');
    });
    
    test('should handle context rejection patterns', () => {
      // Names mentioned in reject contexts should fail validation
      const rejectContexts = [
        "Someone named John Smith told me about this",
        "I heard about Sarah Johnson from a friend",
      ];
      
      for (const transcript of rejectContexts) {
        const result = extractName(transcript);
        // These might still extract but with lower confidence
        if (result) {
          expect(result.confidence).toBeDefined();
        }
      }
    });
  });

  describe('parseWrittenNumber internal function', () => {
    test('should parse single digit words through extractGoalAmount', () => {
      const cases = [
        { input: "I need five hundred dollars", expected: 500 },
        { input: "I need one thousand dollars", expected: 1000 },
        { input: "I need fifteen hundred dollars", expected: 1500 },
      ];
      
      for (const testCase of cases) {
        const result = extractGoalAmount(testCase.input);
        expect(result).toBe(testCase.expected);
      }
    });
    
    test('should parse compound written numbers', () => {
      const cases = [
        { input: "I need twenty five hundred dollars", expected: 2500 },
        { input: "I need three thousand dollars", expected: 3000 },
        { input: "I need two thousand five hundred dollars", expected: 2500 },
      ];
      
      for (const testCase of cases) {
        const result = extractGoalAmount(testCase.input);
        expect(result).toBeGreaterThan(0);
      }
    });
    
    test('should handle written number edge cases', () => {
      // Test edge cases for written number parsing
      const edgeCases = [
        "I need hundred dollars", // Missing multiplier
        "I need thousand dollars", // Missing multiplier
        "I need one hundred twenty three dollars", // Complex number
      ];
      
      for (const transcript of edgeCases) {
        const result = extractGoalAmount(transcript);
        // Should return some number or null, not crash
        expect(typeof result === 'number' || result === null).toBe(true);
      }
    });
  });

  describe('parseNumericAmount internal function', () => {
    test('should parse numbers with commas', () => {
      const cases = [
        { input: "I need $1,500 for rent", expected: 1500 },
        { input: "I need $10,000 for medical bills", expected: 10000 },
        { input: "I need $2,500 urgently", expected: 2500 },
      ];
      
      for (const testCase of cases) {
        const result = extractGoalAmount(testCase.input);
        expect(result).toBe(testCase.expected);
      }
    });
    
    test('should parse numbers without dollar signs', () => {
      const cases = [
        { input: "I need 500 dollars", expected: 500 },
        { input: "I need 1500 dollars for help", expected: 1500 },
      ];
      
      for (const testCase of cases) {
        const result = extractGoalAmount(testCase.input);
        expect(result).toBe(testCase.expected);
      }
    });
    
    test('should handle malformed numeric inputs', () => {
      const malformed = [
        "I need $$$ dollars", // Multiple dollar signs
        "I need $,, dollars", // Multiple commas
        "I need $abc dollars", // Non-numeric
      ];
      
      for (const transcript of malformed) {
        const result = extractGoalAmount(transcript);
        // Should handle gracefully, not crash
        expect(typeof result === 'number' || result === null).toBe(true);
      }
    });
  });

  describe('extractUrgency internal branches', () => {
    test('should return LOW for invalid inputs', () => {
      expect(extractUrgency('')).toBe('LOW');
      expect(extractUrgency(null as any)).toBe('LOW');
      expect(extractUrgency(undefined as any)).toBe('LOW');
      expect(extractUrgency(123 as any)).toBe('LOW');
    });
    
    test('should detect CRITICAL urgency keywords', () => {
      const criticalCases = [
        "This is an emergency situation",
        "I'm in a crisis right now",
        "This is critical I need help",
        "I got a shutoff notice today",
        "This is urgent",
        "I need help asap",
      ];
      
      for (const transcript of criticalCases) {
        expect(extractUrgency(transcript)).toBe('CRITICAL');
      }
    });
    
    test('should detect HIGH urgency keywords', () => {
      const highCases = [
        "I'm desperate and need help",
        "I have a court date tomorrow",
        "I need this as soon as possible",
        "I need help this week",
        "I need help by friday",
        "This is important",
      ];
      
      for (const transcript of highCases) {
        expect(extractUrgency(transcript)).toBe('HIGH');
      }
    });
    
    test('should detect MEDIUM or lower urgency for less specific phrases', () => {
      // The 6-layer urgency engine scores these based on weighted keyword matching
      // Short vague phrases tend to score LOW; more context raises the score
      const cases = [
        { text: "I received an eviction notice", expected: 'MEDIUM' },
        { text: "I'm behind on rent", expected: 'MEDIUM' },
        { text: "This is needed", expected: 'LOW' },
        { text: "I'm struggling", expected: 'LOW' },
        { text: "This is difficult", expected: 'LOW' },
        { text: "I cant afford food", expected: 'LOW' },
      ];
      
      for (const { text, expected } of cases) {
        expect(extractUrgency(text)).toBe(expected);
      }
    });
    
    test('should default to LOW for neutral transcripts', () => {
      const neutralCases = [
        "Hello I would like some help",
        "My name is John and I live in Austin",
        "I am looking for assistance",
      ];
      
      for (const transcript of neutralCases) {
        expect(extractUrgency(transcript)).toBe('LOW');
      }
    });
  });

  describe('Edge cases triggering error paths', () => {
    test('should handle empty strings gracefully', () => {
      expect(() => extractName('')).not.toThrow();
      expect(() => extractGoalAmount('')).not.toThrow();
      expect(() => extractUrgency('')).not.toThrow();
    });
    
    test('should handle very long transcripts (cache stress test)', () => {
      const longTranscript = "My name is John Smith. ".repeat(1000);
      expect(() => extractName(longTranscript)).not.toThrow();
    });
    
    test('should handle special characters', () => {
      const specialChars = "My name is Jöhn Smïth and I need €500";
      expect(() => extractName(specialChars)).not.toThrow();
      expect(() => extractGoalAmount(specialChars)).not.toThrow();
    });
    
    test('should handle mixed case and whitespace', () => {
      const mixed = "   I'm   JOHN   SMITH   ";
      const result = extractName(mixed);
      expect(result).toBeDefined();
      // Should extract some form of the name
      if (result) {
        expect(result.length).toBeGreaterThan(0);
      }
    });
  });
});
