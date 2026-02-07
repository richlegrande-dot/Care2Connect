/**
 * Transcript Fixture Loader
 * 
 * Standardized way to load transcript fixtures and convert them to
 * the format expected by transcriptSignalExtractor
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export interface TranscriptFixture {
  id: string;
  description: string;
  transcriptText: string;
  segments?: Array<{
    startMs: number;
    endMs: number;
    text: string;
  }>;
  expected: {
    needsCategories: string[];
    urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    goalAmount?: number;
    missingFields: string[];
    confidenceMin: number;
    shouldNotContain?: {
      piiInTelemetry: boolean;
    };
  };
}

export interface TranscriptInput {
  transcript: string;
  segments?: Array<{
    start: number;
    end: number; 
    text: string;
  }>;
}

/**
 * Load a specific transcript fixture by ID
 */
export function loadFixture(fixtureId: string): TranscriptFixture {
  const fixturePath = join(__dirname, '..', 'fixtures', 'transcripts', `${fixtureId}.json`);
  
  try {
    const content = readFileSync(fixturePath, 'utf-8');
    const fixture = JSON.parse(content) as TranscriptFixture;
    
    // Validate fixture structure
    if (!fixture.id || !fixture.transcriptText || !fixture.expected) {
      throw new Error(`Invalid fixture structure in ${fixtureId}.json`);
    }
    
    return fixture;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Fixture file not found: ${fixtureId}.json`);
    }
    throw error;
  }
}

/**
 * Convert fixture to TranscriptInput format for transcriptSignalExtractor
 */
export function makeTranscript(fixtureId: string): TranscriptInput {
  const fixture = loadFixture(fixtureId);
  
  return {
    transcript: fixture.transcriptText,
    segments: fixture.segments?.map(seg => ({
      start: seg.startMs,
      end: seg.endMs,
      text: seg.text
    }))
  };
}

/**
 * Create transcript input from raw text (for ad-hoc tests)
 */
export function makeTranscriptFromText(text: string): TranscriptInput {
  return {
    transcript: text
  };
}

/**
 * Get all available fixture IDs
 */
export function listFixtures(): string[] {
  const fixturesDir = join(__dirname, '..', 'fixtures', 'transcripts');
  const fs = require('fs');
  
  try {
    return fs.readdirSync(fixturesDir)
      .filter((file: string) => file.endsWith('.json'))
      .map((file: string) => file.replace('.json', ''))
      .sort();
  } catch (error) {
    return [];
  }
}

/**
 * Load multiple fixtures by ID array
 */
export function loadFixtures(fixtureIds: string[]): TranscriptFixture[] {
  return fixtureIds.map(id => loadFixture(id));
}

/**
 * Get expected results for a fixture
 */
export function getExpected(fixtureId: string) {
  const fixture = loadFixture(fixtureId);
  return fixture.expected;
}
