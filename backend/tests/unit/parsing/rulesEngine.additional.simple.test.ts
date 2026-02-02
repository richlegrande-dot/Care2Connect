/**
 * L1 Unit Tests - Additional Rules Engine Functions
 * Tests for previously untested rulesEngine exports
 */

import {
  extractNameWithConfidence,
  extractGoalAmountWithConfidence,
  extractBeneficiaryRelationship,
  validateGoFundMeData,
  extractAge,
  extractPhone,
  extractEmail,
  extractLocation,
  scoreKeywords
} from '../../../src/utils/extraction/rulesEngine';

describe('L1 Unit Tests - Additional Rules Engine Functions', () => {
  
  describe('extractNameWithConfidence', () => {
    it('should extract name with confidence score', () => {
      const result = extractNameWithConfidence("My name is John Smith");
      expect(result.value).toBe("John Smith");
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should return null with low confidence when no name found', () => {
      const result = extractNameWithConfidence("I need help with housing");
      expect(result.value).toBeNull();
      expect(result.confidence).toBe(0);
    });
  });

  describe('extractGoalAmountWithConfidence', () => {
    it('should extract amount with confidence score', () => {
      const result = extractGoalAmountWithConfidence("I need to raise $5000 for rent");
      expect(result.value).toBe(5000);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should return null with zero confidence when no amount found', () => {
      const result = extractGoalAmountWithConfidence("I need help");
      expect(result.value).toBeNull();
      expect(result.confidence).toBe(0);
    });
  });

  describe('extractBeneficiaryRelationship', () => {
    it('should detect self relationship', () => {
      const result = extractBeneficiaryRelationship("I need help for myself");
      expect(result).toBe('myself');
    });

    it('should detect family member relationship', () => {
      const result = extractBeneficiaryRelationship("My son needs medical treatment");
      expect(result).toBe('family_member');
    });

    it('should detect daughter as family member', () => {
      const result = extractBeneficiaryRelationship("Helping my daughter with rent");
      expect(result).toBe('family_member');
    });

    it('should default to myself when unclear', () => {
      const result = extractBeneficiaryRelationship("Need help with housing");
      expect(result).toBe('myself');
    });
  });

  describe('validateGoFundMeData', () => {
    it('should validate complete data', () => {
      const result = validateGoFundMeData(
        'Help John with Medical Bills',
        'John needs help paying for medical treatment. He has been struggling with medical debt.',
        5000,
        'HEALTHCARE',
        'John Smith'
      );
      
      expect(result.isComplete).toBe(true);
      expect(result.missingFields).toHaveLength(0);
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should detect missing beneficiary name', () => {
      const result = validateGoFundMeData(
        'Help with Medical Bills',
        'Need help paying for medical treatment. Been struggling with medical debt.',
        5000,
        'HEALTHCARE',
        undefined
      );
      
      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain('beneficiary');
      expect(result.suggestions.beneficiary).toBeDefined();
    });

    it('should detect missing goal amount', () => {
      const result = validateGoFundMeData(
        'Help John with Medical Bills',
        'John needs help with medical expenses and has been struggling with debt.',
        undefined,
        'HEALTHCARE',
        'John Smith'
      );
      
      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain('goalAmount');
      expect(result.suggestions.goalAmount).toBeDefined();
    });

    it('should detect short story', () => {
      const result = validateGoFundMeData(
        'Help John',
        'Help',
        5000,
        'HEALTHCARE',
        'John Smith'
      );
      
      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain('story');
      expect(result.suggestions.story).toBeDefined();
    });
  });

  describe('extractAge', () => {
    it('should extract age from text', () => {
      const result = extractAge("I am 35 years old");
      expect(result).toBe(35);
    });

    it('should return undefined when no age found', () => {
      const result = extractAge("I need help with housing");
      expect(result).toBeUndefined();
    });
  });

  describe('extractPhone', () => {
    it('should extract phone number', () => {
      const result = extractPhone("Call me at 555-123-4567");
      expect(result).toContain('555');
      expect(result).toContain('123');
      expect(result).toContain('4567');
    });

    it('should return undefined when no phone found', () => {
      const result = extractPhone("I need help with housing");
      expect(result).toBeUndefined();
    });
  });

  describe('extractEmail', () => {
    it('should extract email address', () => {
      const result = extractEmail("Contact me at john@example.com");
      expect(result).toBe('john@example.com');
    });

    it('should return undefined when no email found', () => {
      const result = extractEmail("I need help with housing");
      expect(result).toBeUndefined();
    });
  });

  describe('extractLocation', () => {
    it('should extract location from text', () => {
      const result = extractLocation("I live in Austin, TX");
      expect(result).toContain('Austin');
    });

    it('should return undefined when no location found', () => {
      const result = extractLocation("I need help");
      expect(result).toBeUndefined();
    });
  });

  describe('scoreKeywords', () => {
    it('should score matching keywords', () => {
      const keywords = ['housing', 'rent', 'eviction'];
      const score = scoreKeywords("I'm facing eviction and need help with rent", keywords);
      expect(score).toBeGreaterThan(0);
    });

    it('should return zero for no matches', () => {
      const keywords = ['medical', 'healthcare', 'doctor'];
      const score = scoreKeywords("I need help with housing", keywords);
      expect(score).toBe(0);
    });

    it('should handle empty keyword list', () => {
      const score = scoreKeywords("I need help", []);
      expect(score).toBe(0);
    });
  });
});
