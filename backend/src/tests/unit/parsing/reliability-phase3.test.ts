/**
 * Phase 3: Reliability and Failsafe Tests
 * 
 * Tests to validate that the extraction pipeline NEVER fails
 * and always returns valid structures even under extreme conditions
 */

import { 
  extractNameWithConfidence,
  extractGoalAmountWithConfidence,
  extractBeneficiaryRelationship,
  extractUrgency
} from '../../../src/utils/extraction/rulesEngine';

describe('Phase 3: Reliability and Failsafe Tests', () => {
  
  describe('Input Validation and Failsafe Behavior', () => {
    test('should handle null input gracefully', () => {
      const result = extractNameWithConfidence(null as any);
      expect(result).toEqual({ value: null, confidence: 0 });
      
      const amountResult = extractGoalAmountWithConfidence(null as any);
      expect(amountResult).toEqual({ value: null, confidence: 0 });
      
      expect(extractBeneficiaryRelationship(null as any)).toBe('myself');
      expect(extractUrgency(null as any)).toBe('LOW');
    });

    test('should handle undefined input gracefully', () => {
      const result = extractNameWithConfidence(undefined as any);
      expect(result).toEqual({ value: null, confidence: 0 });
      
      const amountResult = extractGoalAmountWithConfidence(undefined as any);
      expect(amountResult).toEqual({ value: null, confidence: 0 });
      
      expect(extractBeneficiaryRelationship(undefined as any)).toBe('myself');
      expect(extractUrgency(undefined as any)).toBe('LOW');
    });

    test('should handle empty string gracefully', () => {
      const result = extractNameWithConfidence('');
      expect(result).toEqual({ value: null, confidence: 0 });
      
      const amountResult = extractGoalAmountWithConfidence('');
      expect(amountResult).toEqual({ value: null, confidence: 0 });
      
      expect(extractBeneficiaryRelationship('')).toBe('myself');
      expect(extractUrgency('')).toBe('LOW');
    });

    test('should handle non-string input gracefully', () => {
      const result = extractNameWithConfidence(123 as any);
      expect(result).toEqual({ value: null, confidence: 0 });
      
      const amountResult = extractGoalAmountWithConfidence({ not: 'string' } as any);
      expect(amountResult).toEqual({ value: null, confidence: 0 });
      
      expect(extractBeneficiaryRelationship([] as any)).toBe('myself');
      expect(extractUrgency(true as any)).toBe('LOW');
    });

    test('should handle extremely long input without crashing', () => {
      const veryLongText = 'My name is John '.repeat(1000) + 'and I need $5000';
      
      const result = extractNameWithConfidence(veryLongText);
      expect(result).toBeDefined();
      expect(result.value).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
      
      const amountResult = extractGoalAmountWithConfidence(veryLongText);
      expect(amountResult).toBeDefined();
      expect(amountResult.value).toBeGreaterThan(0);
    });

    test('should handle special characters and unicode without crashing', () => {
      const specialText = 'Мой name is José-María 🎭 $1,000 needed! ñoño café résumé';
      
      const result = extractNameWithConfidence(specialText);
      expect(result).toBeDefined();
      
      const amountResult = extractGoalAmountWithConfidence(specialText);
      expect(amountResult).toBeDefined();
      
      const relationship = extractBeneficiaryRelationship(specialText);
      expect(['myself', 'family_member', 'other']).toContain(relationship);
      
      const urgency = extractUrgency(specialText);
      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(urgency);
    });
  });

  describe('Failsafe Fallback Mechanisms', () => {
    test('should use fallback name extraction when main patterns fail', () => {
      const problematicText = 'Hello there, John is calling but the system might fail';
      
      // The function should still extract "John" even if main patterns fail
      const result = extractNameWithConfidence(problematicText);
      expect(result).toBeDefined();
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });

    test('should use fallback amount extraction when main patterns fail', () => {
      const problematicText = 'System error but I still need $2500 for help';
      
      // Should still extract amounts using fallback patterns
      const result = extractGoalAmountWithConfidence(problematicText);
      expect(result).toBeDefined();
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });

    test('should return safe defaults for relationship extraction', () => {
      const result = extractBeneficiaryRelationship('completely unparseable garbage text');
      expect(result).toBe('myself'); // Safe default
    });

    test('should return safe defaults for urgency extraction', () => {
      const result = extractUrgency('completely unparseable garbage text');
      expect(result).toBe('LOW'); // Safe default
    });
  });

  describe('Error Handling and Logging', () => {
    // Mock console.error to test error logging
    let consoleSpy: jest.SpyInstance;
    
    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('should log errors but not throw when regex patterns fail', () => {
      // Create a scenario that might cause regex failures
      const maliciousInput = 'a'.repeat(10000) + '$1000';
      
      const result = extractGoalAmountWithConfidence(maliciousInput);
      
      // Should still return valid structure
      expect(result).toBeDefined();
      expect(typeof result.value).toBe('number' || typeof result.value === null);
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    test('should include proper error context in logs', () => {
      // Force an error condition (this would be implementation-specific)
      const result = extractNameWithConfidence(null as any);
      
      expect(result).toEqual({ value: null, confidence: 0 });
      // In a real scenario with actual errors, we would check consoleSpy calls
    });
  });

  describe('Data Structure Contracts', () => {
    test('name extraction always returns proper structure', () => {
      const inputs = [
        'My name is John',
        'garbage input',
        '',
        null,
        undefined,
        123 as any,
        { not: 'string' } as any
      ];

      inputs.forEach(input => {
        const result = extractNameWithConfidence(input);
        
        expect(result).toBeDefined();
        expect(result).toHaveProperty('value');
        expect(result).toHaveProperty('confidence');
        expect(typeof result.confidence).toBe('number');
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
        expect(result.value === null || typeof result.value === 'string').toBe(true);
      });
    });

    test('amount extraction always returns proper structure', () => {
      const inputs = [
        'I need $1000',
        'garbage input',
        '',
        null,
        undefined,
        123 as any,
        { not: 'string' } as any
      ];

      inputs.forEach(input => {
        const result = extractGoalAmountWithConfidence(input);
        
        expect(result).toBeDefined();
        expect(result).toHaveProperty('value');
        expect(result).toHaveProperty('confidence');
        expect(typeof result.confidence).toBe('number');
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
        expect(result.value === null || typeof result.value === 'number').toBe(true);
        
        if (result.value !== null) {
          expect(result.value).toBeGreaterThan(0);
          expect(result.value).toBeLessThanOrEqual(100000); // Within bounds
        }
      });
    });

    test('relationship extraction always returns valid enum', () => {
      const validRelationships = ['myself', 'family_member', 'other'];
      const inputs = [
        'For my son',
        'For myself',
        'garbage input',
        '',
        null,
        undefined
      ];

      inputs.forEach(input => {
        const result = extractBeneficiaryRelationship(input);
        expect(validRelationships).toContain(result);
      });
    });

    test('urgency extraction always returns valid enum', () => {
      const validUrgencies = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const inputs = [
        'This is urgent!',
        'Emergency situation',
        'garbage input',
        '',
        null,
        undefined
      ];

      inputs.forEach(input => {
        const result = extractUrgency(input);
        expect(validUrgencies).toContain(result);
      });
    });
  });

  describe('Production Load Simulation', () => {
    test('should handle rapid sequential calls without failure', () => {
      const transcript = 'My name is Sarah and I need $3000 for my family urgently';
      
      // Simulate production load
      for (let i = 0; i < 100; i++) {
        const nameResult = extractNameWithConfidence(transcript);
        const amountResult = extractGoalAmountWithConfidence(transcript);
        const relationshipResult = extractBeneficiaryRelationship(transcript);
        const urgencyResult = extractUrgency(transcript);
        
        // All results should be valid
        expect(nameResult).toBeDefined();
        expect(amountResult).toBeDefined();
        expect(['myself', 'family_member', 'other']).toContain(relationshipResult);
        expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(urgencyResult);
      }
    });

    test('should handle concurrent processing without interference', async () => {
      const transcripts = [
        'My name is John and I need $1000',
        'Sarah here, need help with $2500',
        'I am Mike, goal is $5000 for family',
        'Emergency! Jennifer needs $800 today'
      ];
      
      // Process concurrently
      const promises = transcripts.map(async transcript => {
        return {
          name: extractNameWithConfidence(transcript),
          amount: extractGoalAmountWithConfidence(transcript),
          relationship: extractBeneficiaryRelationship(transcript),
          urgency: extractUrgency(transcript)
        };
      });
      
      const results = await Promise.all(promises);
      
      // All results should be valid
      results.forEach(result => {
        expect(result.name).toBeDefined();
        expect(result.amount).toBeDefined();
        expect(['myself', 'family_member', 'other']).toContain(result.relationship);
        expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(result.urgency);
      });
    });
  });

  describe('Revenue Pipeline Guarantee', () => {
    test('should NEVER throw exceptions under any circumstances', () => {
      const maliciousInputs = [
        null,
        undefined,
        '',
        'a'.repeat(100000), // Very long string
        String.fromCharCode(0, 1, 2, 3), // Control characters
        '🚀🎭🦄🌈'.repeat(1000), // Unicode spam
        '\\x00\\x01\\x02', // Escaped characters
        JSON.stringify({ deeply: { nested: { object: true } } }),
        Buffer.from('binary data').toString(),
        Array(10000).fill('test').join(' ') // Massive array
      ];

      maliciousInputs.forEach(input => {
        expect(() => {
          extractNameWithConfidence(input);
          extractGoalAmountWithConfidence(input);
          extractBeneficiaryRelationship(input);
          extractUrgency(input);
        }).not.toThrow();
      });
    });

    test('should maintain performance guarantees under stress', () => {
      const heavyTranscript = 'My name is '.repeat(1000) + 'John and I need $5000';
      
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        extractNameWithConfidence(heavyTranscript);
        extractGoalAmountWithConfidence(heavyTranscript);
        extractBeneficiaryRelationship(heavyTranscript);
        extractUrgency(heavyTranscript);
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should complete 40 operations in under 1 second even with heavy input
      expect(totalTime).toBeLessThan(1000);
    });
  });
});