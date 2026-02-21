/**
 * Unit tests for TranscriptSignalExtractor
 * 
 * Tests deterministic signal extraction from various transcript scenarios.
 */

import {
  extractSignals,
  validateSignalQuality,
  ExtractedSignals,
  TranscriptInput
} from '../services/speechIntelligence/transcriptSignalExtractor';

describe('TranscriptSignalExtractor', () => {
  describe('extractSignals', () => {
    it('should extract name from clear introduction', async () => {
      const input: TranscriptInput = {
        text: 'Hi, my name is Sarah Johnson. I need help with rent money.'
      };
      
      const signals = await extractSignals(input);
      
      expect(signals.nameCandidate).toBe('Sarah Johnson');
      expect(signals.confidence.name).toBeGreaterThan(0.7);
    });
    
    it('should handle missing name gracefully', async () => {
      const input: TranscriptInput = {
        text: 'I need help paying my rent. I was recently evicted and need money for a deposit.'
      };
      
      const signals = await extractSignals(input);
      
      expect(signals.nameCandidate).toBeNull();
      expect(signals.confidence.name).toBe(0.0);
      expect(signals.missingFields).toContain('name');
    });
    
    it('should extract email and phone from transcript', async () => {
      const input: TranscriptInput = {
        text: 'My name is John Doe. You can reach me at john.doe@email.com or call me at (555) 123-4567.'
      };
      
      const signals = await extractSignals(input);
      
      expect(signals.contactCandidates.emails).toContain('john.doe@email.com');
      expect(signals.contactCandidates.phones).toHaveLength(1);
      expect(signals.contactCandidates.phones[0]).toMatch(/\(555\) 123-4567/);
    });
    
    it('should extract location from various formats', async () => {
      const input: TranscriptInput = {
        text: "I'm from Seattle, WA and I need help. I live in Capitol Hill."
      };
      
      const signals = await extractSignals(input);
      
      expect(signals.locationCandidates).toContain('WA');
      expect(signals.confidence.location).toBeGreaterThan(0.5);
    });
    
    it('should categorize housing needs correctly', async () => {
      const input: TranscriptInput = {
        text: 'I was evicted from my apartment and now I am homeless. I need money for rent and a security deposit to get a new place.'
      };
      
      const signals = await extractSignals(input);
      
      const housingCategory = signals.needsCategories.find(c => c.category === 'HOUSING');
      expect(housingCategory).toBeDefined();
      expect(housingCategory!.confidence).toBeGreaterThan(0.5);
      // The implementation matches 'homeless', 'rent', 'apartment', 'deposit' from the keyword list
      expect(housingCategory!.keywords).toContain('homeless');
      expect(housingCategory!.keywords).toContain('rent');
      expect(housingCategory!.keywords).toContain('apartment');
    });
    
    it('should categorize multiple needs', async () => {
      const input: TranscriptInput = {
        text: 'I lost my job and cannot afford food or rent. I also need to see a doctor for my health issues.'
      };
      
      const signals = await extractSignals(input);
      
      expect(signals.needsCategories.length).toBeGreaterThanOrEqual(3);
      
      const categories = signals.needsCategories.map(c => c.category);
      expect(categories).toContain('EMPLOYMENT');
      expect(categories).toContain('FOOD');
      expect(categories).toContain('HOUSING');
      expect(categories).toContain('HEALTHCARE');
    });
    
    it('should calculate high urgency for emergency keywords', async () => {
      const input: TranscriptInput = {
        text: 'This is an emergency! I need help immediately. I have an eviction court date tomorrow.'
      };
      
      const signals = await extractSignals(input);
      
      expect(signals.urgencyScore).toBeGreaterThan(0.7);
    });
    
    it('should calculate low urgency for future-oriented text', async () => {
      const input: TranscriptInput = {
        text: 'I hope to eventually get back on my feet and find stable housing in the future.'
      };
      
      const signals = await extractSignals(input);
      
      expect(signals.urgencyScore).toBeLessThan(0.4);
    });
    
    it('should extract key points from transcript', async () => {
      const input: TranscriptInput = {
        text: `My name is Maria. I lost my job three months ago. 
               I have been struggling to pay rent and buy groceries. 
               I have two young children who depend on me.
               I recently interviewed for a new position but need help until I start working.
               Any assistance would be greatly appreciated.`
      };
      
      const signals = await extractSignals(input);
      
      expect(signals.keyPoints.length).toBeGreaterThan(3);
      expect(signals.keyPoints.length).toBeLessThanOrEqual(7);
    });
    
    it('should detect missing goal amount', async () => {
      const input: TranscriptInput = {
        text: 'My name is Tom Smith. I need help with medical bills.'
      };
      
      const signals = await extractSignals(input);
      
      expect(signals.missingFields).toContain('goalAmount');
    });
    
    it('should handle very short transcripts', async () => {
      const input: TranscriptInput = {
        text: 'Help me please.'
      };
      
      const signals = await extractSignals(input);
      
      expect(signals.nameCandidate).toBeNull();
      // Very short transcripts may still match some categories depending on keywords
      expect(signals.needsCategories.length).toBeLessThanOrEqual(2);
      expect(signals.missingFields.length).toBeGreaterThan(0);
    });
    
    it('should handle safety/escape needs', async () => {
      const input: TranscriptInput = {
        text: 'I need to escape an abusive situation. I need money to relocate to a safe place and protect myself and my children.'
      };
      
      const signals = await extractSignals(input);
      
      const safetyCategory = signals.needsCategories.find(c => c.category === 'SAFETY');
      expect(safetyCategory).toBeDefined();
      expect(safetyCategory!.confidence).toBeGreaterThan(0.5);
    });
    
    it('should handle medical/healthcare needs', async () => {
      const input: TranscriptInput = {
        text: 'I need surgery and cannot afford the medical bills. I need prescription medication and physical therapy.'
      };
      
      const signals = await extractSignals(input);
      
      const healthcareCategory = signals.needsCategories.find(c => c.category === 'HEALTHCARE');
      expect(healthcareCategory).toBeDefined();
      expect(healthcareCategory!.keywords).toContain('surgery');
      expect(healthcareCategory!.keywords).toContain('medical');
      expect(healthcareCategory!.keywords).toContain('prescription');
    });
    
    it('should handle addiction recovery needs', async () => {
      const input: TranscriptInput = {
        text: 'I am in recovery from alcohol addiction. I need help paying for rehab and staying sober.'
      };
      
      const signals = await extractSignals(input);
      
      const addictionCategory = signals.needsCategories.find(c => c.category === 'ADDICTION');
      expect(addictionCategory).toBeDefined();
    });
    
    it('should normalize phone numbers correctly', async () => {
      const input: TranscriptInput = {
        text: 'Call me at 5551234567 or (555) 123-4567 or 555-123-4567'
      };
      
      const signals = await extractSignals(input);
      
      expect(signals.contactCandidates.phones.length).toBeGreaterThan(0);
      // All should be normalized to same format
      const uniquePhones = new Set(signals.contactCandidates.phones);
      expect(uniquePhones.size).toBe(1); // All should normalize to same number
    });
    
    it('should handle multiple name mentions consistently', async () => {
      const input: TranscriptInput = {
        text: "My name is Jennifer Lee. I'm Jennifer and I need help. Call me Jennifer."
      };
      
      const signals = await extractSignals(input);
      
      expect(signals.nameCandidate).toContain('Jennifer');
    });
    
    it('should calculate higher confidence for well-formed transcripts', async () => {
      const input: TranscriptInput = {
        text: `My name is David Martinez. I live in Austin, TX. 
               I lost my job two months ago and am now homeless.
               I need $5,000 to pay first month rent and security deposit.
               I have a job interview next week and just need help getting back on my feet.
               You can reach me at david.martinez@email.com or (512) 555-1234.`
      };
      
      const signals = await extractSignals(input);
      
      expect(signals.confidence.name).toBeGreaterThan(0.7);
      expect(signals.confidence.location).toBeGreaterThan(0.7);
      expect(signals.confidence.needs).toBeGreaterThan(0.5);
    });
    
    it('should extract childcare needs', async () => {
      const input: TranscriptInput = {
        text: 'I have two children and cannot afford daycare. I need help paying for childcare so I can work.'
      };
      
      const signals = await extractSignals(input);
      
      const childcareCategory = signals.needsCategories.find(c => c.category === 'CHILDCARE');
      expect(childcareCategory).toBeDefined();
    });
    
    it('should extract transportation needs', async () => {
      const input: TranscriptInput = {
        text: 'My car broke down and I need it to get to work. I need money for repairs and gas.'
      };
      
      const signals = await extractSignals(input);
      
      const transportationCategory = signals.needsCategories.find(c => c.category === 'TRANSPORTATION');
      expect(transportationCategory).toBeDefined();
    });
  });
  
  describe('validateSignalQuality', () => {
    it('should pass validation for good signals', () => {
      const signals: ExtractedSignals = {
        nameCandidate: 'John Doe',
        contactCandidates: { emails: ['john@email.com'], phones: ['(555) 123-4567'] },
        locationCandidates: ['Seattle', 'WA'],
        needsCategories: [
          { category: 'HOUSING', keywords: ['rent', 'eviction'], confidence: 0.8 },
          { category: 'FOOD', keywords: ['hungry', 'groceries'], confidence: 0.6 }
        ],
        urgencyScore: 0.7,
        keyPoints: [
          'I lost my job.',
          'I need help with rent.',
          'I have two children.',
          'I have a job interview next week.'
        ],
        missingFields: [],
        confidence: {
          name: 0.8,
          category: 0.75,
          urgency: 0.8,
          location: 0.75,
          needs: 0.7,
          goalAmount: 0.5
        }
      };
      
      const validation = validateSignalQuality(signals);
      
      expect(validation.isValid).toBe(true);
      expect(validation.qualityScore).toBeGreaterThan(0.5);
      expect(validation.issues.length).toBe(0);
    });
    
    it('should fail validation for poor signals', () => {
      const signals: ExtractedSignals = {
        nameCandidate: null,
        contactCandidates: { emails: [], phones: [] },
        locationCandidates: [],
        needsCategories: [],
        urgencyScore: 0.3,
        keyPoints: ['Help'],
        missingFields: ['beneficiaryName', 'goalAmount', 'story'],
        confidence: {
          name: 0.0,
          category: 0.0,
          urgency: 0.3,
          location: 0.0,
          needs: 0.0,
          goalAmount: 0.0
        }
      };
      
      const validation = validateSignalQuality(signals);
      
      expect(validation.isValid).toBe(false);
      expect(validation.qualityScore).toBeLessThan(0.5);
      expect(validation.issues.length).toBeGreaterThan(0);
    });
  });
});
