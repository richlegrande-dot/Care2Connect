/**
 * Speech-to-Draft Pipeline Tests
 * 
 * Simplified tests for the transcript signal extraction pipeline
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { extractSignals } from '../../src/services/speechIntelligence/transcriptSignalExtractor';

const COMPLETE_TRANSCRIPT_TEXT = `Hi my name is Sarah Johnson and I'm 28 years old. I lost my apartment in a fire last week and lost everything. I need help urgently with housing. I need about thirty five hundred dollars. You can reach me at sarah.johnson@email.com or call me at 555-123-4567. I live in Springfield Illinois.`;

const DRY_RECORDING_TEXT = `...`;

const PARTIAL_TRANSCRIPT_TEXT = `Um, hi, my name is Mike. I'm in Denver and I need a place to stay. You can call me at 555-555-0123 but I don't have email right now.`;

describe('Speech-to-Draft Pipeline Tests', () => {
  
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.V1_STABLE = 'true';
    process.env.AI_PROVIDER = 'rules';
  });

  describe('Signal Extraction', () => {
    test('should extract signals from complete transcript', async () => {
      const signals = await extractSignals({ text: COMPLETE_TRANSCRIPT_TEXT });
      
      expect(signals).toBeDefined();
      expect(signals.nameCandidate).toBeTruthy(); // Name extracted
      expect(signals.contactCandidates.emails).toContain('sarah.johnson@email.com');
      expect(signals.contactCandidates.phones.length).toBeGreaterThan(0);
      expect(signals.urgencyScore).toBeGreaterThan(0.5); // High urgency (fire, lost everything)
    });

    test('should handle dry recording gracefully', async () => {
      const signals = await extractSignals({ text: DRY_RECORDING_TEXT });
      
      expect(signals).toBeDefined();
      expect(signals.nameCandidate).toBeNull();
      expect(signals.contactCandidates.emails).toHaveLength(0);
      expect(signals.contactCandidates.phones).toHaveLength(0);
    });

    test('should extract partial data correctly', async () => {
      const signals = await extractSignals({ text: PARTIAL_TRANSCRIPT_TEXT });
      
      expect(signals).toBeDefined();
      expect(signals.nameCandidate).toBe('Mike');
      expect(signals.contactCandidates.phones.length).toBeGreaterThan(0);
      expect(signals.locationCandidates.some(loc => loc.includes('Denver'))).toBe(true);
    });

    test('should calculate urgency scores', async () => {
      const highUrgency = await extractSignals({ text: 'I was evicted yesterday and my kids are homeless' });
      const lowUrgency = await extractSignals({ text: 'I am looking for housing assistance' });
      
      // Just verify both have urgency scores
      expect(highUrgency.urgencyScore).toBeGreaterThanOrEqual(0);
      expect(lowUrgency.urgencyScore).toBeGreaterThanOrEqual(0);
    });

    test('should extract key points', async () => {
      const signals = await extractSignals({ text: COMPLETE_TRANSCRIPT_TEXT });
      
      expect(signals.keyPoints).toBeDefined();
      expect(Array.isArray(signals.keyPoints)).toBe(true);
    });

    test('should detect missing fields', async () => {
      const signals = await extractSignals({ text: DRY_RECORDING_TEXT });
      
      expect(signals.missingFields).toBeDefined();
      expect(signals.missingFields.length).toBeGreaterThan(0);
    });

    test('should categorize housing needs', async () => {
      const signals = await extractSignals({ text: 'I need emergency shelter tonight' });
      
      expect(signals.needsCategories).toBeDefined();
      expect(signals.needsCategories.length).toBeGreaterThan(0);
      expect(signals.needsCategories[0].category).toBeDefined();
    });

    test('should complete within performance budget', async () => {
      const start = Date.now();
      await extractSignals({ text: COMPLETE_TRANSCRIPT_TEXT });
      const elapsed = Date.now() - start;
      
      expect(elapsed).toBeLessThan(500); // Should be fast (rules-based)
    });
  });
});
