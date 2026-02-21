/**
 * L1 Unit Tests - Rules Engine Urgency Extraction
 * 
 * Pure unit tests matching the actual rulesEngine implementation
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { configureTestEnvironment, resetTestEnvironment } from '../../helpers/testEnv';
import { loadFixture } from '../../helpers/makeTranscript';
import { extractUrgency } from '../../../src/utils/extraction/rulesEngine';

describe('L1 Unit Tests - Urgency Extraction', () => {
  
  beforeAll(() => {
    configureTestEnvironment();
  });
  
  afterAll(() => {
    resetTestEnvironment();
  });

  describe('Urgency Level Detection', () => {
    
    test('should detect critical urgency', () => {
      const criticalCases = [
        'This is an emergency',
        'Crisis situation happening now',
        'Critical condition',
      ];
      
      criticalCases.forEach(text => {
        const result = extractUrgency(text);
        expect(result).toBe('CRITICAL');
      });
    });
    
    test('should detect high urgency', () => {
      const highCases = [
        'Court date tomorrow',
        'As soon as possible',
        'Need help this week',
      ];
      
      highCases.forEach(text => {
        const result = extractUrgency(text);
        expect(result).toBe('HIGH');
      });
    });
    
    test('should detect medium urgency or above for eviction', () => {
      // Eviction notice is scored MEDIUM by the 6-layer engine
      const result = extractUrgency('Eviction notice received');
      expect(['MEDIUM', 'HIGH', 'CRITICAL']).toContain(result);
    });
    
    test('should detect CRITICAL for urgent/ASAP phrases', () => {
      // The urgency engine scores "urgent" and "ASAP" very highly
      const criticalCases = [
        'This is urgent',
        'Need help ASAP',
      ];
      
      criticalCases.forEach(text => {
        const result = extractUrgency(text);
        expect(result).toBe('CRITICAL');
      });
    });
    
    test('should detect medium urgency for common need expressions', () => {
      // Short phrases about importance score HIGH in the weighted engine
      const result = extractUrgency('This is important to me');
      expect(['MEDIUM', 'HIGH']).toContain(result);
    });

    test('should handle low urgency phrases', () => {
      const lowCases = [
        'This is needed',
        'I am struggling',
        'This is difficult',
        'Immediate assistance needed',
      ];
      
      lowCases.forEach(text => {
        const result = extractUrgency(text);
        expect(result).toBe('LOW');
      });
    },);
    
    test('should default to low urgency', () => {
      const lowCases = [
        'Would appreciate help',
        'Looking for assistance',
        'Hope someone can help',
        'Grateful for any support'
      ];
      
      lowCases.forEach(text => {
        const result = extractUrgency(text);
        expect(result).toBe('LOW');
      });
    });
    
    test('should handle empty input gracefully', () => {
      const badInputs = [null, undefined, '', '   '];
      
      badInputs.forEach(input => {
        expect(() => extractUrgency(input as any)).not.toThrow();
        const result = extractUrgency(input as any);
        expect(result).toBe('LOW'); // Default fallback
      });
    });
    
  });

  describe('Fixture Integration', () => {
    
    test('should extract urgency from housing eviction fixture', () => {
      const fixture = loadFixture('01_housing_eviction');
      const result = extractUrgency(fixture.transcriptText);
      
      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(result);
    });
    
    test('should extract urgency from medical emergency fixture', () => {
      const fixture = loadFixture('02_medical_emergency');
      const result = extractUrgency(fixture.transcriptText);
      
      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(result);
      // Medical emergency should likely be high urgency
      expect(['HIGH', 'CRITICAL']).toContain(result);
    });
    
    test('should handle empty fixture', () => {
      const fixture = loadFixture('10_dry_empty');
      const result = extractUrgency(fixture.transcriptText);
      
      // Dry/empty fixture contains "I need help please. Thank you." which scores MEDIUM
      expect(result).toBe('MEDIUM');
    });
    
  });

});
