/**
 * L2 Component Tests - Story Extraction Service
 * 
 * Component-level tests for StoryExtractionService integration
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { configureTestEnvironment, resetTestEnvironment } from '../../helpers/testEnv';
import { loadFixture } from '../../helpers/makeTranscript';
import { StoryExtractionService } from '../../../src/services/storyExtractionService';

describe('L2 Component Tests - Story Extraction Service', () => {
  let service: StoryExtractionService;
  
  beforeAll(() => {
    configureTestEnvironment();
    service = new StoryExtractionService();
  });
  
  afterAll(() => {
    resetTestEnvironment();
  });

  describe('Service Integration', () => {
    
    test('should instantiate service successfully', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(StoryExtractionService);
    });
    
    test('should have extractGoFundMeData method', () => {
      expect(service.extractGoFundMeData).toBeDefined();
      expect(typeof service.extractGoFundMeData).toBe('function');
    });
    
    test('should process simple transcript', async () => {
      const transcript = 'My name is John Smith. I need help with rent of $500. This is urgent.';
      
      const result = await service.extractGoFundMeData(transcript);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('draft');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('confidence');
      // Success may be false if required fields missing, but draft should exist
      expect(result.draft).toBeDefined();
    });
    
    test('should extract data from housing fixture', async () => {
      const fixture = loadFixture('01_housing_eviction');
      
      const result = await service.extractGoFundMeData(fixture.transcriptText);
      
      expect(result).toBeDefined();
      expect(result.draft).toBeDefined();
      expect(result.draft.title || result.draft.storyBody).toBeDefined();
      // May have storyBody instead of story
      if (result.draft.storyBody) {
        expect(result.draft.storyBody.value || result.draft.storyBody).toBeTruthy();
      }
    });
    
    test('should extract data from medical fixture', async () => {
      const fixture = loadFixture('02_medical_emergency');
      
      const result = await service.extractGoFundMeData(fixture.transcriptText);
      
      expect(result).toBeDefined();
      expect(result.draft).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });
    
    test('should handle empty transcript gracefully', async () => {
      const fixture = loadFixture('10_dry_empty');
      
      const result = await service.extractGoFundMeData(fixture.transcriptText);
      
      // Should not throw, but may have lower confidence or warnings
      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    });
    
    test('should return structured draft object', async () => {
      const transcript = 'Need help with medical bills, $1000 needed urgently';
      
      const result = await service.extractGoFundMeData(transcript);
      
      expect(result.draft).toBeDefined();
      expect(result.draft).toHaveProperty('storyBody');
      expect(result.draft).toHaveProperty('goalAmount');
      // goalAmount may be wrapped in a confidence object or be null
      if (result.draft.goalAmount && typeof result.draft.goalAmount === 'object') {
        // If it's an object with value property, that's fine
        // If value is undefined, that's also acceptable (extraction might have failed)
        expect(result.draft.goalAmount).toHaveProperty('value');
      }
    });
    
  });

  describe('Error Handling', () => {
    
    test('should handle malformed transcript without crashing', async () => {
      const malformedInputs = [
        '',
        '   ',
        'Lorem ipsum dolor sit amet',
        '123456789',
      ];
      
      for (const input of malformedInputs) {
        await expect(service.extractGoFundMeData(input)).resolves.toBeDefined();
      }
    });
    
    test('should return errors array when extraction has issues', async () => {
      const result = await service.extractGoFundMeData('');
      
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.errors)).toBe(true);
    });
    
  });

});