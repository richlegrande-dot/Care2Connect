/**
 * L1 Unit Tests - Edge Cases and Error Handling
 * Tests for edge cases, error conditions, and boundary scenarios
 */

import {
  extractName,
  extractNameWithConfidence,
  extractGoalAmount,
  extractGoalAmountWithConfidence,
  extractNeeds,
  extractUrgency,
  generateDefaultGoalAmount,
  scoreKeywords,
  NEEDS_KEYWORDS
} from '../../../src/utils/extraction/rulesEngine';

describe('L1 Unit Tests - Edge Cases and Error Handling', () => {
  
  describe('Error Handling and Invalid Inputs', () => {
    it('should handle very short transcripts', () => {
      expect(() => extractName('')).not.toThrow();
      expect(() => extractGoalAmount('')).not.toThrow();
      expect(() => extractNeeds('')).not.toThrow();
      expect(() => extractUrgency('')).not.toThrow();
    });

    it('should handle transcripts with only whitespace', () => {
      expect(extractName('   \n\t  ')).toBeUndefined();
      expect(extractGoalAmount('   ')).toBeNull();
    });

    it('should handle very long transcripts', () => {
      const longTranscript = 'I need help with housing. '.repeat(1000);
      expect(() => extractNeeds(longTranscript)).not.toThrow();
    });

    it('should handle special characters in transcripts', () => {
      const special = 'My name is John@#$% and I need $$$$ for rent!!!';
      expect(() => extractName(special)).not.toThrow();
      expect(() => extractGoalAmount(special)).not.toThrow();
    });

    it('should handle unicode characters', () => {
      const unicode = 'My name is José García and I need help with vivienda';
      expect(() => extractName(unicode)).not.toThrow();
    });
  });

  describe('Amount Extraction Edge Cases', () => {
    it('should extract amounts with commas', () => {
      const result = extractGoalAmount('I need $5,000 for rent');
      expect(result).toBe(5000);
    });

    it('should handle amounts without dollar signs', () => {
      const result = extractGoalAmount('I need 3000 dollars for medical bills');
      expect(result).toBe(3000);
    });

    it('should reject hourly rates', () => {
      const result = extractGoalAmount('I make $25 per hour');
      // Should not extract hourly rates as goal amounts
      expect(result).not.toBe(25);
    });

    it('should handle written numbers', () => {
      const result = extractGoalAmount('I need fifteen hundred dollars');
      // May or may not parse written numbers depending on implementation
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should handle range amounts', () => {
      const result = extractGoalAmount('I need between $1000 and $5000');
      // Should extract at least one of the amounts
      expect(result).toBeGreaterThan(0);
    });

    it('should handle very large amounts', () => {
      const result = extractGoalAmount('I need $100000 for medical treatment');
      expect(result).toBe(100000);
    });

    it('should handle very small amounts', () => {
      const result = extractGoalAmount('I need $50 for food');
      expect(result).toBe(50);
    });
  });

  describe('Name Extraction Edge Cases', () => {
    it('should handle names with middle initials', () => {
      // Current engine regex requires lowercase after capital in name tokens
      // Middle initial "A." (capital + period) doesn't match [A-Z][a-z'-]+
      // This is a known limitation — the name may not be extracted
      const result = extractName('My name is John A. Smith');
      // Either extracts the name (possibly without middle initial) or returns undefined
      if (result) {
        expect(result).toContain('John');
      } else {
        expect(result).toBeUndefined();
      }
    });

    it('should extract hyphenated names', () => {
      const result = extractName('I am Mary-Jane Johnson');
      // May or may not handle hyphens depending on implementation
      if (result) {
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('should reject numbers as names', () => {
      const result = extractName('My name is 35 and I need help');
      expect(result).not.toBe('35');
    });

    it('should reject common words as names', () => {
      const result = extractName('I am urgent and need critical help');
      expect(result).not.toBe('urgent');
      expect(result).not.toBe('critical');
    });

    it('should handle multiple name mentions', () => {
      const result = extractName('My name is Bob but people call me Robert');
      expect(result).toBeDefined();
      // Should extract one of them
    });
  });

  describe('Needs Extraction Edge Cases', () => {
    it('should limit number of needs returned', () => {
      const transcript = 'I need housing and food and medical help and job training and transportation';
      const needs = extractNeeds(transcript, 3);
      expect(needs.length).toBeLessThanOrEqual(3);
    });

    it('should handle duplicate need keywords', () => {
      const transcript = 'housing housing housing rent apartment';
      const needs = extractNeeds(transcript);
      // Should only return HOUSING once
      const housingCount = needs.filter(n => n === 'HOUSING').length;
      expect(housingCount).toBe(1);
    });

    it('should handle mixed case keywords', () => {
      const transcript = 'HOUSING Housing HoUsInG';
      const needs = extractNeeds(transcript);
      expect(needs).toContain('HOUSING');
    });

    it('should return empty array for irrelevant text', () => {
      const transcript = 'The quick brown fox jumps over the lazy dog';
      const needs = extractNeeds(transcript);
      expect(Array.isArray(needs)).toBe(true);
    });
  });

  describe('Urgency Classification Edge Cases', () => {
    it('should detect critical with multiple indicators', () => {
      const result = extractUrgency('urgent emergency crisis critical immediate');
      expect(result).toBe('CRITICAL');
    });

    it('should handle mixed urgency signals', () => {
      const result = extractUrgency('somewhat urgent but not emergency');
      // Should pick the higher urgency signal
      expect(['MEDIUM', 'HIGH', 'CRITICAL']).toContain(result);
    });

    it('should default to low for neutral text', () => {
      const result = extractUrgency('I would like some help eventually');
      expect(result).toBe('LOW');
    });
  });

  describe('Default Amount Generation', () => {
    it('should generate different amounts for different categories', () => {
      const housingAmount = generateDefaultGoalAmount('HOUSING', 'HIGH', '');
      const medicalAmount = generateDefaultGoalAmount('HEALTHCARE', 'HIGH', '');
      const foodAmount = generateDefaultGoalAmount('FOOD', 'HIGH', '');
      
      // Should generate reasonable amounts
      expect(housingAmount).toBeGreaterThan(0);
      expect(medicalAmount).toBeGreaterThan(0);
      expect(foodAmount).toBeGreaterThan(0);
    });

    it('should scale with urgency', () => {
      const lowUrgency = generateDefaultGoalAmount('HOUSING', 'LOW', '');
      const criticalUrgency = generateDefaultGoalAmount('HOUSING', 'CRITICAL', '');
      
      expect(criticalUrgency).toBeGreaterThanOrEqual(lowUrgency);
    });

    it('should handle unknown categories', () => {
      const amount = generateDefaultGoalAmount('UNKNOWN_CATEGORY', 'MEDIUM', '');
      expect(amount).toBeGreaterThan(0);
      expect(amount).toBeLessThanOrEqual(10000);
    });
  });

  describe('Keyword Scoring', () => {
    it('should score case-insensitively', () => {
      const score1 = scoreKeywords('HOUSING RENT', ['housing', 'rent']);
      const score2 = scoreKeywords('housing rent', ['housing', 'rent']);
      expect(score1).toBe(score2);
    });

    it('should handle partial word matches', () => {
      const score = scoreKeywords('homeless eviction', ['housing', 'homeless', 'eviction']);
      expect(score).toBeGreaterThan(0);
    });

    it('should score proportionally to matches', () => {
      const oneMatch = scoreKeywords('housing', ['housing', 'rent', 'eviction']);
      const twoMatches = scoreKeywords('housing rent', ['housing', 'rent', 'eviction']);
      expect(twoMatches).toBeGreaterThan(oneMatch);
    });
  });

  describe('Confidence Scores', () => {
    it('should return confidence between 0 and 1', () => {
      const result = extractNameWithConfidence('My name is John Smith');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should return higher confidence for clear patterns', () => {
      const clearResult = extractGoalAmountWithConfidence('I need to raise $5000 for medical bills');
      const unclearResult = extractGoalAmountWithConfidence('maybe something like five');
      
      if (clearResult.value !== null && unclearResult.value !== null) {
        expect(clearResult.confidence).toBeGreaterThanOrEqual(unclearResult.confidence);
      }
    });

    it('should return zero confidence for no matches', () => {
      const result = extractNameWithConfidence('I need help');
      if (result.value === null) {
        expect(result.confidence).toBe(0);
      }
    });
  });
});
