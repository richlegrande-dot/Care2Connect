/**
 * L3 Integration Tests - Document Generation Pipeline
 * 
 * Service integration tests for document generation from transcripts
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { configureTestEnvironment, resetTestEnvironment } from '../../helpers/testEnv';
import { loadFixture } from '../../helpers/makeTranscript';
import { StoryExtractionService } from '../../../src/services/storyExtractionService';

describe('L3 Integration Tests - Document Generation', () => {
  let service: StoryExtractionService;
  
  beforeAll(() => {
    configureTestEnvironment();
    service = new StoryExtractionService();
  });
  
  afterAll(() => {
    resetTestEnvironment();
  });

  describe('End-to-End Document Generation', () => {
    
    test('should extract data from housing fixture', async () => {
      const fixture = loadFixture('01_housing_eviction');
      
      const extraction = await service.extractGoFundMeData(fixture.transcriptText);
      
      expect(extraction).toBeDefined();
      expect(extraction.draft).toBeDefined();
      expect(extraction.draft.storyBody).toBeDefined();
    });
    
    test('should extract data from medical fixture', async () => {
      const fixture = loadFixture('02_medical_emergency');
      
      const extraction = await service.extractGoFundMeData(fixture.transcriptText);
      
      expect(extraction).toBeDefined();
      expect(extraction.draft).toBeDefined();
    });
    
    test('should handle empty fixture gracefully', async () => {
      const fixture = loadFixture('10_dry_empty');
      
      const extraction = await service.extractGoFundMeData(fixture.transcriptText);
      
      // Even with empty input, should get a result (may have warnings)
      expect(extraction).toBeDefined();
      expect(extraction.draft).toBeDefined();
    });
    
  });

  describe('Pipeline Validation', () => {
    
    test('should maintain data consistency through pipeline', async () => {
      const transcript = 'My name is Jane Doe. I need $2000 for medical bills. This is urgent.';
      
      const extraction = await service.extractGoFundMeData(transcript);
      
      // Draft should contain extracted data
      expect(extraction.draft).toBeDefined();
      expect(extraction.draft.storyBody).toBeDefined();
      if (extraction.draft.storyBody && typeof extraction.draft.storyBody === 'object') {
        expect(extraction.draft.storyBody.value).toBeTruthy();
      } else {
        expect(extraction.draft.storyBody).toBeTruthy();
      }
    });
    
  });

});
