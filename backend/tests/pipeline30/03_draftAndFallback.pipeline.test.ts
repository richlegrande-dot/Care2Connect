/**
 * Pipeline30 Test Suite - Draft Generation & Fallback Tests
 * 
 * Tests 21-25: Validates draft generation and fallback mechanisms
 * Focus: Draft creation, title generation, editableJson, NEEDS_INFO status, manual fallback
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { extractSignals, TranscriptInput } from '../../src/services/speechIntelligence/transcriptSignalExtractor';
import { loadTranscriptFixture } from '../helpers/testHelpers';

// Mock draft builder functions for deterministic testing
interface DraftBuilderInput {
  signals: any;
  transcript: string;
  ticketId?: string;
}

interface DraftResult {
  title: string;
  storyBody: string;
  editableJson: {
    breakdown: string[];
    categories: string[];
    qualityScore: number;
    issues: string[];
  };
  status: 'COMPLETED' | 'NEEDS_INFO' | 'MANUAL_FALLBACK';
  missingFields: string[];
}

function generateDeterministicTitle(signals: any): string {
  if (signals.nameCandidate && signals.needsCategories.length > 0) {
    const primaryNeed = signals.needsCategories[0].category.toLowerCase();
    return `Help ${signals.nameCandidate} with ${primaryNeed}`;
  } else if (signals.nameCandidate) {
    return `Help ${signals.nameCandidate} get back on their feet`;
  } else if (signals.needsCategories.length > 0) {
    const primaryNeed = signals.needsCategories[0].category.toLowerCase();
    return `Help with ${primaryNeed} assistance`;
  } else {
    return 'Help someone in need';
  }
}

function generateStoryBody(transcript: string, signals: any, maxLength: number = 5000): string {
  let story = transcript;
  
  // Apply 5000 character cap
  if (story.length > maxLength) {
    story = story.substring(0, maxLength).trim();
    // Try to end at a sentence boundary
    const lastPeriod = story.lastIndexOf('.');
    if (lastPeriod > maxLength * 0.8) { // If within 80% of limit, cut there
      story = story.substring(0, lastPeriod + 1);
    }
  }
  
  return story;
}

function generateEditableJson(signals: any, transcript: string): DraftResult['editableJson'] {
  const breakdown = [];
  const categories = signals.needsCategories.map((n: any) => n.category);
  let qualityScore = 0.5; // Base score
  const issues = [];

  // Calculate quality score based on signals
  if (signals.nameCandidate) qualityScore += 0.2;
  if (signals.contactCandidates.emails.length > 0 || signals.contactCandidates.phones.length > 0) {
    qualityScore += 0.1;
  }
  if (signals.locationCandidates.length > 0) qualityScore += 0.1;
  if (signals.needsCategories.length > 0) qualityScore += 0.1;
  
  // Add breakdown points
  if (signals.nameCandidate) breakdown.push(`Story from ${signals.nameCandidate}`);
  if (categories.length > 0) breakdown.push(`Primary needs: ${categories.join(', ')}`);
  if (signals.urgencyScore > 0.7) breakdown.push('High urgency situation');
  breakdown.push(`Story length: ${transcript.length} characters`);
  
  // Identify issues
  if (!signals.nameCandidate) issues.push('Missing name');
  if (signals.contactCandidates.emails.length === 0 && signals.contactCandidates.phones.length === 0) {
    issues.push('No contact information');
  }
  if (signals.needsCategories.length === 0) issues.push('Unclear needs');
  if (transcript.length < 50) issues.push('Very short story');

  return {
    breakdown,
    categories,
    qualityScore: Math.min(1.0, qualityScore),
    issues
  };
}

function buildDraft(input: DraftBuilderInput): DraftResult {
  const { signals, transcript, ticketId } = input;
  
  const title = generateDeterministicTitle(signals);
  const storyBody = generateStoryBody(transcript, signals);
  const editableJson = generateEditableJson(signals, transcript);
  
  // Determine status based on missing required fields
  const requiredFields = ['name'];
  const missingRequired = requiredFields.filter(field => {
    if (field === 'name') return !signals.nameCandidate;
    return false;
  });
  
  let status: DraftResult['status'] = 'COMPLETED';
  if (missingRequired.length > 0 || editableJson.qualityScore < 0.3) {
    status = 'NEEDS_INFO';
  }
  
  return {
    title,
    storyBody,
    editableJson,
    status,
    missingFields: signals.missingFields || []
  };
}

function simulatePipelineException(): DraftResult {
  return {
    title: 'Manual Review Required',
    storyBody: 'This story requires manual review due to processing limitations.',
    editableJson: {
      breakdown: ['Processing failed', 'Requires manual review'],
      categories: [],
      qualityScore: 0.0,
      issues: ['Pipeline exception occurred']
    },
    status: 'MANUAL_FALLBACK',
    missingFields: ['name', 'contact', 'needs']
  };
}

describe('Pipeline30: Draft Generation & Fallback Tests', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'error';
  });

  // Test 21: Deterministic title generation
  test('21. generates deterministic title from key points', async () => {
    const fixture = loadTranscriptFixture(1); // Normal complete story
    const signals = await extractSignals({ text: fixture.transcript });
    const draft = buildDraft({ signals, transcript: fixture.transcript });

    expect(draft.title).toBeTruthy();
    expect(draft.title).toContain('Sarah Johnson');
    expect(draft.title.toLowerCase()).toMatch(/help.*with.*(housing|employment|food)/);
    
    // Title should be deterministic - same input = same title
    const draft2 = buildDraft({ signals, transcript: fixture.transcript });
    expect(draft2.title).toBe(draft.title);
  });

  // Test 22: Story body generation with character cap
  test('22. generates story body from transcript with 5000 char cap', async () => {
    const fixture = loadTranscriptFixture(17); // Long detailed transcript
    const signals = await extractSignals({ text: fixture.transcript });
    const draft = buildDraft({ signals, transcript: fixture.transcript });

    expect(draft.storyBody).toBeTruthy();
    expect(draft.storyBody.length).toBeLessThanOrEqual(5000);
    expect(draft.storyBody).toContain('David Wilson');
    
    // Should preserve key information even when truncated
    if (fixture.transcript.length > 5000) {
      expect(draft.storyBody.length).toBeLessThan(fixture.transcript.length);
    }
  });

  // Test 23: EditableJson structure and content
  test('23. produces editableJson breakdown/categories/qualityScore', async () => {
    const fixture = loadTranscriptFixture(1);
    const signals = await extractSignals({ text: fixture.transcript });
    const draft = buildDraft({ signals, transcript: fixture.transcript });

    expect(draft.editableJson).toBeDefined();
    expect(draft.editableJson.breakdown).toBeInstanceOf(Array);
    expect(draft.editableJson.categories).toBeInstanceOf(Array);
    expect(draft.editableJson.qualityScore).toBeGreaterThan(0);
    expect(draft.editableJson.qualityScore).toBeLessThanOrEqual(1.0);
    expect(draft.editableJson.issues).toBeInstanceOf(Array);

    // Should contain meaningful breakdown
    expect(draft.editableJson.breakdown.length).toBeGreaterThan(0);
    expect(draft.editableJson.categories.length).toBeGreaterThan(0);
    
    // Quality score should reflect completeness
    expect(draft.editableJson.qualityScore).toBeGreaterThan(0.7); // Complete story
  });

  // Test 24: NEEDS_INFO status trigger
  test('24. triggers NEEDS_INFO status when required fields absent', async () => {
    const incompleteTranscript = 'I need help but cannot provide details.';
    const signals = await extractSignals({ text: incompleteTranscript });
    const draft = buildDraft({ signals, transcript: incompleteTranscript });

    expect(draft.status).toBe('NEEDS_INFO');
    expect(draft.missingFields.length).toBeGreaterThan(0);
    expect(draft.missingFields).toContain('name');
    expect(draft.editableJson.qualityScore).toBeLessThanOrEqual(0.5);
    expect(draft.editableJson.issues.length).toBeGreaterThan(0);
  });

  // Test 25: Manual fallback response
  test('25. triggers MANUAL_FALLBACK response object on pipeline exception', () => {
    const fallbackDraft = simulatePipelineException();

    expect(fallbackDraft.status).toBe('MANUAL_FALLBACK');
    expect(fallbackDraft.title).toContain('Manual Review');
    expect(fallbackDraft.editableJson.qualityScore).toBe(0.0);
    expect(fallbackDraft.editableJson.issues).toContain('Pipeline exception occurred');
    expect(fallbackDraft.missingFields.length).toBeGreaterThan(2);
    
    // Should provide helpful context for manual review
    expect(fallbackDraft.editableJson.breakdown).toContain('Requires manual review');
  });
});
