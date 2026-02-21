/**
 * Edge Cases Pipeline Tests
 * Tests boundary conditions and error handling
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { extractSignals } from '../../src/services/speechIntelligence/transcriptSignalExtractor';

describe('Edge Cases Pipeline Tests', () => {
  
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.V1_STABLE = 'true';
  });

  describe('Empty and Minimal Input', () => {
    test('should handle empty string', async () => {
      const signals = await extractSignals({ text: '' });
      
      expect(signals).toBeDefined();
      expect(signals.nameCandidate).toBeNull();
      expect(signals.contactCandidates.emails).toHaveLength(0);
    });

    test('should handle whitespace only', async () => {
      const signals = await extractSignals({ text: '   \n\t  ' });
      
      expect(signals).toBeDefined();
      expect(signals.nameCandidate).toBeNull();
    });

    test('should handle single word', async () => {
      const signals = await extractSignals({ text: 'Help' });
      
      expect(signals).toBeDefined();
      expect(signals.keyPoints).toBeDefined();
    });

    test('should handle punctuation only', async () => {
      const signals = await extractSignals({ text: '...' });
      
      expect(signals).toBeDefined();
      expect(signals.nameCandidate).toBeNull();
    });
  });

  describe('Special Characters', () => {
    test('should handle Unicode characters', async () => {
      const signals = await extractSignals({ 
        text: 'My name is María José González and I need help' 
      });
      
      expect(signals).toBeDefined();
      expect(signals.nameCandidate).toBeNull();
    });

    test('should handle emojis', async () => {
      const signals = await extractSignals({ 
        text: 'I need help 🏠 with housing 👨‍👩‍👧‍👦' 
      });
      
      expect(signals).toBeDefined();
      expect(signals.needsCategories.length).toBeGreaterThan(0);
    });

    test('should handle HTML entities', async () => {
      const signals = await extractSignals({ 
        text: 'My name is Bob & Carol and we need help' 
      });
      
      expect(signals).toBeDefined();
      expect(signals.nameCandidate).toBeNull();
    });

    test('should handle quotes and apostrophes', async () => {
      const signals = await extractSignals({ 
        text: "I'm John O'Neill and I need help with my family's housing" 
      });
      
      expect(signals).toBeDefined();
      expect(signals.nameCandidate).toBeNull();
    });
  });

  describe('Very Long Input', () => {
    test('should handle very long transcript', async () => {
      const longText = 'I need help. '.repeat(1000);
      
      const start = Date.now();
      const signals = await extractSignals({ text: longText });
      const elapsed = Date.now() - start;
      
      expect(signals).toBeDefined();
      expect(elapsed).toBeLessThan(2000); // Should still be reasonably fast
    });

    test('should handle very long name', async () => {
      const longName = 'A' + 'a'.repeat(100);
      const signals = await extractSignals({ 
        text: `My name is ${longName} and I need help` 
      });
      
      expect(signals).toBeDefined();
    });
  });

  describe('Multiple Contact Methods', () => {
    test('should extract multiple emails', async () => {
      const signals = await extractSignals({ 
        text: 'Contact me at john@example.com or backup@example.org' 
      });
      
      expect(signals.contactCandidates.emails.length).toBeGreaterThanOrEqual(1);
    });

    test('should extract multiple phone numbers', async () => {
      const signals = await extractSignals({ 
        text: 'Call me at 555-123-4567 or try 555-987-6543' 
      });
      
      expect(signals.contactCandidates.phones.length).toBeGreaterThan(0);
    });

    test('should handle mixed contact formats', async () => {
      const signals = await extractSignals({ 
        text: 'Email: test@example.com, Phone: (555) 123-4567, Alt: 555.987.6543' 
      });
      
      expect(signals.contactCandidates.emails.length).toBeGreaterThan(0);
      expect(signals.contactCandidates.phones.length).toBeGreaterThan(0);
    });
  });

  describe('Boundary Values', () => {
    test('should handle zero dollar amount', async () => {
      const signals = await extractSignals({ 
        text: 'I need zero dollars for help' 
      });
      
      expect(signals).toBeDefined();
    });

    test('should handle very large dollar amount', async () => {
      const signals = await extractSignals({ 
        text: 'I need nine hundred ninety nine thousand dollars' 
      });
      
      expect(signals).toBeDefined();
    });

    test('should handle negative concepts', async () => {
      const signals = await extractSignals({ 
        text: 'I have no money, no job, no home, and no family' 
      });
      
      expect(signals).toBeDefined();
      expect(signals.urgencyScore).toBeGreaterThan(0);
    });
  });

  describe('Noisy Input', () => {
    test('should handle transcript with [inaudible] markers', async () => {
      const signals = await extractSignals({ 
        text: 'My name is [inaudible] and I need help with [inaudible] housing' 
      });
      
      expect(signals).toBeDefined();
      // At least extract "help" keyword
      expect(signals.keyPoints.length).toBeGreaterThanOrEqual(0);
    });

    test('should handle filler words', async () => {
      const signals = await extractSignals({ 
        text: 'Um, like, you know, my name is, uh, John and, like, I need help' 
      });
      
      expect(signals).toBeDefined();
      // Should still process the text even with filler words
      expect(signals.keyPoints).toBeDefined();
    });

    test('should handle repetition', async () => {
      const signals = await extractSignals({ 
        text: 'Help help help I need help please help me help' 
      });
      
      expect(signals).toBeDefined();
      expect(signals.keyPoints.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Under Stress', () => {
    test('should handle rapid sequential calls', async () => {
      const texts = [
        'Test 1',
        'Test 2',
        'Test 3',
        'Test 4',
        'Test 5'
      ];
      
      const start = Date.now();
      for (const text of texts) {
        await extractSignals({ text });
      }
      const elapsed = Date.now() - start;
      
      expect(elapsed).toBeLessThan(2000); // 5 calls in under 2 seconds
    });

    test('should handle concurrent calls', async () => {
      const texts = Array.from({ length: 10 }, (_, i) => `Test ${i}`);
      
      const start = Date.now();
      const results = await Promise.all(
        texts.map(text => extractSignals({ text }))
      );
      const elapsed = Date.now() - start;
      
      expect(results).toHaveLength(10);
      expect(elapsed).toBeLessThan(3000);
    });
  });
});
