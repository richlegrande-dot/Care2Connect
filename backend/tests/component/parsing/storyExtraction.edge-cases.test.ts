/**
 * L2 Component Tests - Story Extraction Service Edge Cases
 * Tests for uncovered paths in storyExtractionService
 */

import { StoryExtractionService } from '../../../src/services/storyExtractionService';

describe('L2 Component Tests - Story Extraction Edge Cases', () => {
  let service: StoryExtractionService;

  beforeEach(() => {
    service = new StoryExtractionService();
  });

  describe('Validation and Suggestion Application', () => {
    it('should apply validation suggestions for incomplete data', async () => {
      // Test a transcript with very minimal information that would trigger suggestion application
      const minimalTranscript = 'I need help.';
      
      const result = await service.extractGoFundMeData(minimalTranscript);
      
      expect(result).toBeDefined();
      expect(result.draft).toBeDefined();
      // Should return a valid draft even with minimal info
      expect(result.draft.goalAmount).toBeDefined();
    });

    it('should handle transcripts with missing beneficiary name', async () => {
      const transcript = 'I need $1000 for rent due to eviction.';
      
      const result = await service.extractGoFundMeData(transcript);
      
      expect(result.draft).toBeDefined();
      expect(result.draft.goalAmount).toBeDefined();
      // Verify goal amount was extracted
      const goalAmount = typeof result.draft.goalAmount === 'object' 
        ? result.draft.goalAmount?.value 
        : result.draft.goalAmount;
      if (goalAmount !== undefined && goalAmount !== null) {
        expect(goalAmount).toBeGreaterThan(0);
      }
    });

    it('should handle transcripts with missing goal amount', async () => {
      const transcript = 'My name is Sarah and I need help with medical bills.';
      
      const result = await service.extractGoFundMeData(transcript);
      
      expect(result.draft).toBeDefined();
      // Should have valid structure even if amount not extracted
      expect(result.draft.goalAmount).toBeDefined();
    });

    it('should handle transcripts with missing category', async () => {
      const transcript = 'I need $500 urgently.';
      
      const result = await service.extractGoFundMeData(transcript);
      
      expect(result.draft).toBeDefined();
      expect(result.draft.goalAmount).toBeDefined();
      // Verify goal amount was extracted
      const goalAmount = typeof result.draft.goalAmount === 'object' 
        ? result.draft.goalAmount?.value 
        : result.draft.goalAmount;
      if (goalAmount !== undefined && goalAmount !== null) {
        expect(goalAmount).toBeGreaterThan(0);
      }
    });
  });

  describe('Date Field Normalization', () => {
    it('should handle date fields correctly', async () => {
      const transcript = 'I need $1000 for housing assistance.';
      
      const result = await service.extractGoFundMeData(transcript);
      
      // Dates should be present and valid
      expect(result.draft.extractedAt).toBeDefined();
      expect(result.draft.lastUpdated).toBeDefined();
    });

    it('should process transcript with all fields present', async () => {
      const complexTranscript = 'My name is David Chen and I urgently need to raise $5000 for emergency medical treatment.';
      
      const result = await service.extractGoFundMeData(complexTranscript);
      
      // Handle goalAmount as either plain number or confidence object
      const goalAmount = typeof result.draft.goalAmount === 'object' 
        ? result.draft.goalAmount?.value 
        : result.draft.goalAmount;
      if (goalAmount !== undefined && goalAmount !== null) {
        expect(goalAmount).toBeGreaterThan(0);
      }
      expect(result.draft.extractedAt).toBeInstanceOf(Date);
      expect(result.draft.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('Missing Fields Detection', () => {
    it('should identify missing fields', async () => {
      const incompleteTranscript = 'Help needed.';
      
      const result = await service.extractGoFundMeData(incompleteTranscript);
      
      expect(result.draft.missingFields).toBeDefined();
      expect(Array.isArray(result.draft.missingFields)).toBe(true);
    });

    it('should generate follow-up questions for missing information', async () => {
      const incompleteTranscript = 'I need money.';
      
      const result = await service.extractGoFundMeData(incompleteTranscript);
      
      expect(result.draft.followUpQuestions).toBeDefined();
      expect(Array.isArray(result.draft.followUpQuestions)).toBe(true);
    });
  });

  describe('Confidence Calculation', () => {
    it('should return confidence score', async () => {
      const transcript = 'I need $2000 for rent.';
      
      const result = await service.extractGoFundMeData(transcript);
      
      expect(result.confidence).toBeDefined();
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should have higher confidence for complete transcripts', async () => {
      const completeTranscript = 'My name is Alice Johnson and I need to raise $3000 urgently for medical treatment due to an emergency.';
      const incompleteTranscript = 'Help.';
      
      const completeResult = await service.extractGoFundMeData(completeTranscript);
      const incompleteResult = await service.extractGoFundMeData(incompleteTranscript);
      
      // Complete transcript should have higher or equal confidence
      expect(completeResult.confidence).toBeGreaterThanOrEqual(incompleteResult.confidence);
    });
  });

  describe('Error Handling', () => {
    it('should not throw on extremely short input', async () => {
      await expect(service.extractGoFundMeData('')).resolves.toBeDefined();
    });

    it('should not throw on whitespace-only input', async () => {
      await expect(service.extractGoFundMeData('   \n\t   ')).resolves.toBeDefined();
    });

    it('should not throw on very long input', async () => {
      const longTranscript = 'I need help with housing. '.repeat(500);
      await expect(service.extractGoFundMeData(longTranscript)).resolves.toBeDefined();
    });

    it('should not throw on special characters', async () => {
      const specialTranscript = 'I need $$$$$$ for @@@@ ####';
      await expect(service.extractGoFundMeData(specialTranscript)).resolves.toBeDefined();
    });
  });
});
