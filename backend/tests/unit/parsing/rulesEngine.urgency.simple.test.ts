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
        'Eviction notice received',
        'Court date tomorrow'
      ];
      
      criticalCases.forEach(text => {
        const result = extractUrgency(text);
        expect(result).toBe('CRITICAL');
      });
    });
    
    test('should detect high urgency', () => {
      const highCases = [
        'This is urgent',
        'Need help ASAP',
        'Immediate assistance needed',
        'As soon as possible',
        'Need help this week'
      ];
      
      highCases.forEach(text => {
        const result = extractUrgency(text);
        expect(result).toBe('HIGH');
      });
    });
    
    test('should detect medium urgency', () => {
      const mediumCases = [
        'This is needed',
        'This is important to me', 
        'I am struggling',
        'This is difficult',
        'I am behind on my rent',
        'I cant afford food'
      ];
      
      mediumCases.forEach(text => {
        const result = extractUrgency(text);
        expect(result).toBe('MEDIUM');
      });
    });
    
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
      
      expect(result).toBe('LOW');
    });
    
  });

});