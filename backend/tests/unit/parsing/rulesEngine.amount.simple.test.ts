/**
 * L1 Unit Tests - Rules Engine Amount Extraction
 * 
 * Pure unit tests matching the actual rulesEngine implementation
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { configureTestEnvironment, resetTestEnvironment } from '../../helpers/testEnv';
import { loadFixture } from '../../helpers/makeTranscript';
import { 
  extractGoalAmount,
  extractGoalAmountWithConfidence,
  generateDefaultGoalAmount
} from '../../../src/utils/extraction/rulesEngine';

describe('L1 Unit Tests - Amount Extraction', () => {
  
  beforeAll(() => {
    configureTestEnvironment();
  });
  
  afterAll(() => {
    resetTestEnvironment();
  });

  describe('Basic Amount Extraction', () => {
    
    test('should extract simple dollar amounts', () => {
      const cases = [
        { text: 'I need $1,500 for rent', expected: 1500 },
        { text: 'Need $500 for groceries', expected: 500 },
        { text: 'Looking for $2000 help', expected: 2000 }
      ];
      
      cases.forEach(({ text, expected }) => {
        const result = extractGoalAmount(text);
        expect(result).toBe(expected);
      });
    });
    
    test('should extract amounts with confidence scores', () => {
      const transcript = 'I urgently need $1,200 for medical bills';
      const result = extractGoalAmountWithConfidence(transcript);
      
      expect(result.value).toBe(1200);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
    
    test('should handle no amount found', () => {
      const transcript = 'I need help with my situation';
      const result = extractGoalAmount(transcript);
      
      expect(result).toBeNull();
    });
    
    test('should handle malformed input gracefully', () => {
      const badInputs = [null, undefined, '', '   '];
      
      badInputs.forEach(input => {
        expect(() => extractGoalAmount(input as any)).not.toThrow();
        const result = extractGoalAmount(input as any);
        expect(result).toBeNull();
      });
    });
    
  });

  describe('Default Amount Generation', () => {
    
    test('should generate appropriate defaults based on category and urgency', () => {
      const categories = [
        { category: 'housing', urgency: 'CRITICAL', minExpected: 1000 },
        { category: 'medical', urgency: 'HIGH', minExpected: 500 },
        { category: 'food', urgency: 'MEDIUM', minExpected: 100 }
      ];
      
      categories.forEach(({ category, urgency, minExpected }) => {
        const result = generateDefaultGoalAmount(category, urgency, 'test transcript');
        expect(result).toBeGreaterThanOrEqual(minExpected);
      });
    });
    
  });

  describe('Fixture Integration', () => {
    
    test('should process housing eviction fixture', () => {
      const fixture = loadFixture('01_housing_eviction');
      const result = extractGoalAmount(fixture.transcriptText);
      
      // Should either extract an amount or return null
      expect(typeof result === 'number' || result === null).toBe(true);
    });
    
    test('should process medical emergency fixture', () => {
      const fixture = loadFixture('02_medical_emergency');
      const result = extractGoalAmountWithConfidence(fixture.transcriptText);
      
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('confidence');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
    
    test('should handle empty fixture', () => {
      const fixture = loadFixture('10_dry_empty');
      const result = extractGoalAmount(fixture.transcriptText);
      
      expect(result).toBeNull();
    });
    
  });

});
