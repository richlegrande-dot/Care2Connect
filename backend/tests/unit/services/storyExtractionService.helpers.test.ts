/**
 * Comprehensive Tests for StoryExtractionService Helper Methods
 * Testing private helper methods to achieve 100% coverage
 */

import { StoryExtractionService } from '../../../src/services/storyExtractionService';

describe('StoryExtractionService Helper Methods', () => {
  let service: StoryExtractionService;

  beforeEach(() => {
    service = new StoryExtractionService();
  });

  describe('normalizeUrgencyLevel', () => {
    test('should normalize CRITICAL to high', () => {
      // Access private method via any cast for testing
      const result = (service as any).normalizeUrgencyLevel('CRITICAL');
      expect(result).toBe('high');
    });

    test('should normalize HIGH to high', () => {
      const result = (service as any).normalizeUrgencyLevel('HIGH');
      expect(result).toBe('high');
    });

    test('should normalize MEDIUM to medium', () => {
      const result = (service as any).normalizeUrgencyLevel('MEDIUM');
      expect(result).toBe('medium');
    });

    test('should normalize LOW to low', () => {
      const result = (service as any).normalizeUrgencyLevel('LOW');
      expect(result).toBe('low');
    });

    test('should default to medium for unknown urgency', () => {
      const result = (service as any).normalizeUrgencyLevel('UNKNOWN');
      expect(result).toBe('medium');
    });
  });

  describe('estimateTimelineFromUrgency', () => {
    test('should estimate 24-48 hours for CRITICAL urgency', () => {
      const result = (service as any).estimateTimelineFromUrgency('CRITICAL');
      expect(result).toBe('24-48 hours');
    });

    test('should estimate 1-2 weeks for HIGH urgency', () => {
      const result = (service as any).estimateTimelineFromUrgency('HIGH');
      expect(result).toBe('1-2 weeks');
    });

    test('should estimate 2-4 weeks for MEDIUM urgency', () => {
      const result = (service as any).estimateTimelineFromUrgency('MEDIUM');
      expect(result).toBe('2-4 weeks');
    });

    test('should estimate 1-2 months for LOW urgency', () => {
      const result = (service as any).estimateTimelineFromUrgency('LOW');
      expect(result).toBe('1-2 months');
    });

    test('should return null for unknown urgency', () => {
      const result = (service as any).estimateTimelineFromUrgency('UNKNOWN');
      expect(result).toBeNull();
    });
  });

  describe('generateFallbackTitle', () => {
    test('should generate title from name candidate', () => {
      const signals = {
        nameCandidate: 'John Doe',
        needsCategories: [{ category: 'HOUSING', confidence: 0.9 }]
      };
      const result = (service as any).generateFallbackTitle(signals);
      expect(result).toContain('John Doe');
      expect(result).toContain('housing');
    });

    test('should generate title without name', () => {
      const signals = {
        nameCandidate: null,
        needsCategories: [{ category: 'MEDICAL', confidence: 0.8 }]
      };
      const result = (service as any).generateFallbackTitle(signals);
      expect(result).toContain('medical');
    });

    test('should use general support when no category', () => {
      const signals = {
        nameCandidate: null,
        needsCategories: []
      };
      const result = (service as any).generateFallbackTitle(signals);
      expect(result).toContain('support');
    });
  });

  describe('generateFallbackSummary', () => {
    test('should generate summary from transcript', () => {
      const transcript = 'I need help with housing because I lost my job and cannot afford rent';
      const signals = {
        needsCategories: [{ category: 'HOUSING', confidence: 0.9 }]
      };
      const result = (service as any).generateFallbackSummary(transcript, signals);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThan(200);
    });

    test('should truncate long transcripts', () => {
      const transcript = 'A'.repeat(500);
      const signals = { needsCategories: [] };
      const result = (service as any).generateFallbackSummary(transcript, signals);
      expect(result.length).toBeLessThan(200);
    });

    test('should handle short transcripts', () => {
      const transcript = 'Need help';
      const signals = { needsCategories: [] };
      const result = (service as any).generateFallbackSummary(transcript, signals);
      expect(result).toContain(transcript);
      expect(result).toContain('support');
    });
  });

  describe('generateFallbackTags', () => {
    test('should generate tags from needs categories', () => {
      const signals = {
        needsCategories: [
          { category: 'HOUSING', confidence: 0.9 },
          { category: 'FOOD', confidence: 0.8 }
        ],
        urgencyLevel: 'MEDIUM',
        locationCandidates: []
      };
      const result = (service as any).generateFallbackTags(signals);
      expect(result).toContain('housing');
      expect(result).toContain('food');
    });

    test('should lowercase tags', () => {
      const signals = {
        needsCategories: [{ category: 'MEDICAL', confidence: 0.9 }],
        urgencyLevel: 'MEDIUM',
        locationCandidates: []
      };
      const result = (service as any).generateFallbackTags(signals);
      expect(result).toContain('medical');
      expect(result.every((tag: string) => tag === tag.toLowerCase())).toBe(true);
    });

    test('should return empty array when no categories', () => {
      const signals = { 
        needsCategories: [],
        urgencyLevel: 'MEDIUM',
        locationCandidates: []
      };
      const result = (service as any).generateFallbackTags(signals);
      expect(result).toEqual([]);
    });
  });

  describe('buildSystemPrompt', () => {
    test('should return valid system prompt string', () => {
      const result = (service as any).buildSystemPrompt();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(100);
      expect(result).toContain('GoFundMe');
      expect(result).toContain('JSON');
    });

    test('should include field structure', () => {
      const result = (service as any).buildSystemPrompt();
      expect(result).toContain('name');
      expect(result).toContain('goalAmount');
      expect(result).toContain('category');
    });
  });

  describe('buildUserPrompt', () => {
    test('should include transcript in prompt', () => {
      const transcript = 'I need help with medical bills';
      const result = (service as any).buildUserPrompt(transcript);
      expect(result).toContain(transcript);
      expect(result).toContain('extract');
    });

    test('should return properly formatted prompt', () => {
      const transcript = 'Test transcript';
      const result = (service as any).buildUserPrompt(transcript);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(transcript.length);
    });
  });

  describe('generateFollowUpQuestions', () => {
    test('should generate question for name field', () => {
      const result = (service as any).generateFollowUpQuestions(['name']);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('question');
      expect(result[0]).toHaveProperty('type');
      expect(result[0].question).toContain('name');
    });

    test('should generate question for goalAmount field', () => {
      const result = (service as any).generateFollowUpQuestions(['goalAmount']);
      expect(result[0].question).toContain('goal');
      expect(result[0].type).toBe('number');
    });

    test('should generate question for category field', () => {
      const result = (service as any).generateFollowUpQuestions(['category']);
      expect(result[0].question).toContain('category');
      expect(result[0].type).toBe('select');
      expect(result[0].options).toBeDefined();
      expect(result[0].options.length).toBeGreaterThan(0);
    });

    test('should generate multiple questions for multiple fields', () => {
      const result = (service as any).generateFollowUpQuestions(['name', 'goalAmount', 'category']);
      expect(result.length).toBe(3);
    });

    test('should handle unknown fields gracefully', () => {
      const result = (service as any).generateFollowUpQuestions(['unknownField']);
      expect(result.length).toBe(0);
    });
  });

  describe('generateEnhancedFollowUpQuestions', () => {
    test('should generate enhanced question for goalAmount with suggestion', () => {
      const signals = { goalAmount: null, nameCandidate: null, needsCategories: [] };
      const validation = { suggestions: { goalAmount: 2500 } };
      const result = (service as any).generateEnhancedFollowUpQuestions(['goalAmount'], signals, validation);
      
      expect(result[0]).toContain('$2500');
    });

    test('should generate enhanced question for name', () => {
      const signals = { nameCandidate: null, needsCategories: [] };
      const validation = { suggestions: {} };
      const result = (service as any).generateEnhancedFollowUpQuestions(['name'], signals, validation);
      
      expect(result[0]).toContain('name');
    });

    test('should generate enhanced question for title with suggestion', () => {
      const signals = { needsCategories: [] };
      const validation = { suggestions: { title: 'Help Needed for Medical Bills' } };
      const result = (service as any).generateEnhancedFollowUpQuestions(['title'], signals, validation);
      
      expect(result[0]).toContain('Help Needed for Medical Bills');
    });

    test('should handle multiple missing fields', () => {
      const signals = { nameCandidate: null, goalAmount: null, needsCategories: [] };
      const validation = { suggestions: { goalAmount: 3000 } };
      const result = (service as any).generateEnhancedFollowUpQuestions(['name', 'goalAmount'], signals, validation);
      
      expect(result.length).toBe(2);
    });
  });

  describe('calculateEnhancedConfidence', () => {
    test('should boost confidence for goal amount signal', () => {
      const draft = { missingFields: [] };
      const signals = { 
        goalAmount: 5000,
        nameCandidate: null,
        needsCategories: [],
        confidence: { name: 0, needs: 0 }
      };
      const validation = { confidence: 0.5 };
      
      const result = (service as any).calculateEnhancedConfidence(draft, signals, validation);
      expect(result).toBeGreaterThan(0.5);
    });

    test('should boost confidence for high-quality name extraction', () => {
      const draft = { missingFields: [] };
      const signals = {
        goalAmount: null,
        nameCandidate: 'John Doe',
        needsCategories: [],
        confidence: { name: 0.8, needs: 0 }
      };
      const validation = { confidence: 0.5 };
      
      const result = (service as any).calculateEnhancedConfidence(draft, signals, validation);
      expect(result).toBeGreaterThan(0.5);
    });

    test('should boost confidence for high-quality needs extraction', () => {
      const draft = { missingFields: [] };
      const signals = {
        goalAmount: null,
        nameCandidate: null,
        needsCategories: [{ category: 'HOUSING', confidence: 0.9 }],
        confidence: { name: 0, needs: 0.9 }
      };
      const validation = { confidence: 0.5 };
      
      const result = (service as any).calculateEnhancedConfidence(draft, signals, validation);
      expect(result).toBeGreaterThan(0.5);
    });

    test('should penalize for many missing fields', () => {
      const draft = { missingFields: ['name', 'goalAmount', 'category', 'title', 'story'] };
      const signals = {
        goalAmount: null,
        nameCandidate: null,
        needsCategories: [],
        confidence: { name: 0, needs: 0 }
      };
      const validation = { confidence: 0.8 };
      
      const result = (service as any).calculateEnhancedConfidence(draft, signals, validation);
      expect(result).toBeLessThan(0.8);
    });

    test('should cap confidence at 1.0', () => {
      const draft = { missingFields: [] };
      const signals = {
        goalAmount: 5000,
        nameCandidate: 'John Doe',
        needsCategories: [{ category: 'HOUSING', confidence: 0.9 }],
        confidence: { name: 0.9, needs: 0.9 }
      };
      const validation = { confidence: 0.9 };
      
      const result = (service as any).calculateEnhancedConfidence(draft, signals, validation);
      expect(result).toBeLessThanOrEqual(1.0);
    });

    test('should maintain minimum confidence of 0.1', () => {
      const draft = { missingFields: ['name', 'goalAmount', 'category', 'title', 'story', 'location'] };
      const signals = {
        goalAmount: null,
        nameCandidate: null,
        needsCategories: [],
        confidence: { name: 0, needs: 0 }
      };
      const validation = { confidence: 0.1 };
      
      const result = (service as any).calculateEnhancedConfidence(draft, signals, validation);
      expect(result).toBeGreaterThanOrEqual(0.1);
    });
  });

  describe('calculateOverallConfidence', () => {
    test('should calculate average confidence from all fields', () => {
      const draft = {
        name: { value: 'John', confidence: 0.9 },
        location: { value: 'NY', confidence: 0.8 },
        category: { value: 'Medical', confidence: 0.7 },
        goalAmount: { value: 5000, confidence: 0.6 },
        title: { value: 'Help Needed', confidence: 0.8 },
        storyBody: { value: 'Story', confidence: 0.9 },
        shortSummary: { value: 'Summary', confidence: 0.7 }
      };
      
      const result = (service as any).calculateOverallConfidence(draft);
      expect(result).toBeGreaterThan(0.6);
      expect(result).toBeLessThan(0.9);
    });

    test('should return 0 for no confidence scores', () => {
      const draft = {
        name: { value: 'John' },
        location: { value: 'NY' }
      };
      
      const result = (service as any).calculateOverallConfidence(draft);
      expect(result).toBe(0);
    });

    test('should ignore fields without confidence', () => {
      const draft = {
        name: { value: 'John', confidence: 0.8 },
        location: { value: 'NY' },
        category: { value: 'Medical', confidence: 0.6 }
      };
      
      const result = (service as any).calculateOverallConfidence(draft);
      expect(result).toBe(0.7); // (0.8 + 0.6) / 2
    });
  });

  describe('createFallbackResult', () => {
    test('should create fallback result with transcript', () => {
      const transcript = 'I need help with medical bills';
      const result = (service as any).createFallbackResult(transcript);
      
      expect(result.success).toBe(false);
      expect(result.confidence).toBe(0.1);
      expect(result.draft.transcript).toBe(transcript);
      expect(result.draft.storyBody.value).toBe(transcript);
    });

    test('should include missing fields list', () => {
      const result = (service as any).createFallbackResult('Test');
      
      expect(result.draft.missingFields.length).toBeGreaterThan(0);
      expect(result.draft.missingFields).toContain('name');
      expect(result.draft.missingFields).toContain('goalAmount');
    });

    test('should include follow-up questions', () => {
      const result = (service as any).createFallbackResult('Test');
      
      expect(result.draft.followUpQuestions.length).toBeGreaterThan(0);
    });

    test('should set default beneficiary to myself', () => {
      const result = (service as any).createFallbackResult('Test');
      
      expect(result.draft.beneficiary.value).toBe('myself');
      expect(result.draft.beneficiary.confidence).toBe(0.5);
    });

    test('should include errors in result', () => {
      const errors = ['Error 1', 'Error 2'];
      const result = (service as any).createFallbackResult('Test', errors);
      
      expect(result.errors).toEqual(errors);
    });

    test('should include warning message', () => {
      const result = (service as any).createFallbackResult('Test');
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('manual entry');
    });

    test('should set extractedAt and lastUpdated dates', () => {
      const result = (service as any).createFallbackResult('Test');
      
      expect(result.draft.extractedAt).toBeInstanceOf(Date);
      expect(result.draft.lastUpdated).toBeInstanceOf(Date);
    });

    test('should handle empty transcript', () => {
      const result = (service as any).createFallbackResult('');
      
      expect(result.draft.storyBody.value).toBeUndefined();
      expect(result.draft.storyBody.confidence).toBe(0);
    });
  });
});
