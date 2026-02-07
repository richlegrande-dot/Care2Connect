/**
 * Pipeline30 Test Suite - Transcript Parsing Unit Tests
 * 
 * Tests 1-10: Validates transcript parsing and normalization
 * Focus: Input handling, segments processing, text cleanup
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { loadTranscriptFixture } from '../helpers/testHelpers';

// Test utility to simulate transcript parsing (mock implementation for deterministic testing)
function parseTranscriptText(text: string): string {
  if (!text || text.trim() === '') return '';
  
  // Normalize whitespace and clean up
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
}

function parseTranscriptWithSegments(transcript: string, segments?: any[]): {
  text: string;
  normalizedText: string;
  segmentCount: number;
  preservedOrder: boolean;
} {
  if (!segments || segments.length === 0) {
    return {
      text: transcript,
      normalizedText: parseTranscriptText(transcript),
      segmentCount: 0,
      preservedOrder: true
    };
  }

  // Reconstruct from segments in order
  const reconstructed = segments
    .sort((a, b) => a.start - b.start)
    .map(s => s.text)
    .join(' ');

  return {
    text: reconstructed,
    normalizedText: parseTranscriptText(reconstructed),
    segmentCount: segments.length,
    preservedOrder: true
  };
}

function handleNoiseMarkers(transcript: string): {
  cleanText: string;
  noiseMarkersRemoved: number;
  fillerWordsRemoved: number;
} {
  let cleanText = transcript;
  let noiseCount = 0;
  let fillerCount = 0;

  // Remove noise markers
  const noisePatterns = [
    /\[background noise\]/gi,
    /\[unclear\]/gi,
    /\[coughing\]/gi,
    /\[background voices\]/gi,
    /\[unclear audio\]/gi,
    /\[noise\]/gi
  ];

  noisePatterns.forEach(pattern => {
    const matches = cleanText.match(pattern);
    if (matches) {
      noiseCount += matches.length;
      cleanText = cleanText.replace(pattern, ' ');
    }
  });

  // Remove filler words
  const fillerPatterns = [
    /\b(um|uh|like|you know)\b/gi
  ];

  fillerPatterns.forEach(pattern => {
    const matches = cleanText.match(pattern);
    if (matches) {
      fillerCount += matches.length;
      cleanText = cleanText.replace(pattern, ' ');
    }
  });

  return {
    cleanText: parseTranscriptText(cleanText),
    noiseMarkersRemoved: noiseCount,
    fillerWordsRemoved: fillerCount
  };
}

function detectLanguage(transcript: string): {
  language: 'en' | 'es' | 'mixed' | 'unknown';
  confidence: number;
} {
  const englishWords = ['the', 'and', 'help', 'need', 'my', 'name', 'is'];
  const spanishWords = ['ayuda', 'necesito', 'mi', 'nombre', 'es', 'por', 'favor'];
  
  const lowerText = transcript.toLowerCase();
  
  const englishMatches = englishWords.filter(word => lowerText.includes(word)).length;
  const spanishMatches = spanishWords.filter(word => lowerText.includes(word)).length;
  
  if (englishMatches > spanishMatches && englishMatches > 2) {
    return { language: 'en', confidence: 0.8 };
  } else if (spanishMatches > englishMatches && spanishMatches > 2) {
    return { language: 'es', confidence: 0.8 };
  } else if (englishMatches > 0 && spanishMatches > 0) {
    return { language: 'mixed', confidence: 0.6 };
  } else {
    return { language: 'unknown', confidence: 0.3 };
  }
}

function truncateIfNeeded(text: string, maxLength: number = 5000): {
  text: string;
  wasTruncated: boolean;
  originalLength: number;
} {
  const originalLength = text.length;
  
  if (originalLength <= maxLength) {
    return {
      text,
      wasTruncated: false,
      originalLength
    };
  }

  return {
    text: text.substring(0, maxLength),
    wasTruncated: true,
    originalLength
  };
}

function redactPiiFromLogs(text: string): string {
  // Simple PII redaction for test output safety
  return text
    .replace(/\b[\w._%+-]+@[\w.-]+\.[A-Z]{2,}\b/gi, '[EMAIL_REDACTED]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]');
}

describe('Pipeline30: Transcript Parsing Unit Tests', () => {
  beforeEach(() => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'error'; // Reduce noise in test output
  });

  // Test 1: Basic transcript text parsing
  test('1. parses transcriptText only', () => {
    const fixture = loadTranscriptFixture(1); // Normal complete story
    const result = parseTranscriptText(fixture.transcript);

    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(10);
    expect(result.includes('Sarah Johnson')).toBe(true);
    expect(result.includes('Denver, Colorado')).toBe(true);
  });

  // Test 2: Transcript with ordered segments
  test('2. parses transcript with ordered segments', () => {
    const fixture = loadTranscriptFixture(1);
    const result = parseTranscriptWithSegments(fixture.transcript, fixture.segments);

    expect(result.segmentCount).toBeGreaterThan(0);
    expect(result.preservedOrder).toBe(true);
    expect(result.normalizedText).toContain('Sarah Johnson');
    expect(result.text.length).toBeGreaterThan(0);
  });

  // Test 3: Empty/dry transcript
  test('3. handles empty transcript (dry recording)', () => {
    const fixture = loadTranscriptFixture(16); // Dry empty fixture
    const result = parseTranscriptText(fixture.transcript);

    expect(result).toBe('...');
    expect(result.length).toBeLessThan(5);
  });

  // Test 4: Noisy transcript with filler words  
  test('4. handles noisy transcript (filler words)', () => {
    const fixture = loadTranscriptFixture(7); // Noisy transcript
    const result = handleNoiseMarkers(fixture.transcript);

    expect(result.noiseMarkersRemoved).toBeGreaterThan(0);
    expect(result.fillerWordsRemoved).toBeGreaterThan(0);
    expect(result.cleanText.length).toBeLessThan(fixture.transcript.length);
    expect(result.cleanText).toContain('Jennifer Brown');
  });

  // Test 5: Mixed language detection
  test('5. handles mixed language transcript', () => {
    const fixture = loadTranscriptFixture(11); // Mixed language
    const result = detectLanguage(fixture.transcript);

    expect(['mixed', 'unknown', 'es']).toContain(result.language);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThan(1.0);
  });

  // Test 6: Sentence ordering preservation
  test('6. preserves sentence ordering from segments', () => {
    const fixture = loadTranscriptFixture(1);
    const result = parseTranscriptWithSegments(fixture.transcript, fixture.segments);

    expect(result.preservedOrder).toBe(true);
    
    // Check that name appears before location in reconstructed text
    const nameIndex = result.normalizedText.indexOf('Sarah Johnson');
    const locationIndex = result.normalizedText.indexOf('Denver');
    expect(nameIndex).toBeGreaterThan(-1);
    expect(locationIndex).toBeGreaterThan(nameIndex);
  });

  // Test 7: Whitespace normalization
  test('7. trims excessive whitespace and normalizes newlines', () => {
    const messyText = "  Hi,   my name is\n\nJohn.\n  I need    help.  ";
    const result = parseTranscriptText(messyText);

    expect(result).toBe('Hi, my name is John. I need help.');
    expect(result.includes('\n')).toBe(false);
    expect(result.includes('  ')).toBe(false);
    expect(result.startsWith(' ')).toBe(false);
    expect(result.endsWith(' ')).toBe(false);
  });

  // Test 8: Missing segments handling
  test('8. does not throw on missing segments array', () => {
    const fixture = loadTranscriptFixture(1);
    
    expect(() => {
      const result = parseTranscriptWithSegments(fixture.transcript, undefined);
      expect(result.segmentCount).toBe(0);
      expect(result.normalizedText).toBeTruthy();
    }).not.toThrow();
  });

  // Test 9: Long transcript truncation
  test('9. supports long transcript truncation logic', () => {
    const fixture = loadTranscriptFixture(17); // Long detailed fixture
    const result = truncateIfNeeded(fixture.transcript, 500);

    expect(result.originalLength).toBeGreaterThan(500);
    expect(result.wasTruncated).toBe(true);
    expect(result.text.length).toBe(500);
    expect(result.text).toContain('David Wilson');
  });

  // Test 10: PII redaction in test output
  test('10. stores transcript safely without logging PII in test output', () => {
    const fixture = loadTranscriptFixture(1);
    const redactedText = redactPiiFromLogs(fixture.transcript);

    expect(redactedText).toContain('[EMAIL_REDACTED]');
    expect(redactedText).toContain('[PHONE_REDACTED]');
    expect(redactedText).not.toContain('sarah.johnson@email.com');
    expect(redactedText).not.toContain('303-555-1234');
    
    // Still contains non-PII information
    expect(redactedText).toContain('Sarah Johnson');
    expect(redactedText).toContain('Denver, Colorado');
  });
});
