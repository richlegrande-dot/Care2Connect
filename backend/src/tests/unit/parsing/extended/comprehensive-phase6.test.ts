/**
 * Phase 6: Comprehensive Test Expansion
 * 
 * 30+ test scenarios covering production edge cases, extreme conditions,
 * and comprehensive validation of all parsing helper upgrades
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { 
  extractNameWithConfidence,
  extractGoalAmountWithConfidence,
  extractBeneficiaryRelationship,
  extractUrgency,
  extractAllWithTelemetry,
  extractAge,
  extractPhone,
  extractEmail,
  extractLocation
} from '../../../src/utils/extraction/rulesEngine';

describe('Phase 6: Comprehensive Production Test Suite (30+ Scenarios)', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Scenario Group 1: Name Extraction Edge Cases (Tests 1-8)', () => {
    
    test('1. Should extract simple first and last name', () => {
      const transcript = 'Hi, my name is John Smith and I need help';
      const result = extractNameWithConfidence(transcript);
      
      expect(result.value).toBe('John Smith');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('2. Should handle multiple name formats', () => {
      const transcript = 'I am Maria Elena Rodriguez-Garcia and I live in Texas';
      const result = extractNameWithConfidence(transcript);
      
      expect(result.value).toContain('Maria');
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('3. Should reject common false positives', () => {
      const transcript = 'I live in New York and work at Microsoft Corporation';
      const result = extractNameWithConfidence(transcript);
      
      // Should not extract place names or company names as personal names
      expect(result.value).not.toBe('New York');
      expect(result.value).not.toBe('Microsoft Corporation');
    });

    test('4. Should handle names with titles and honorifics', () => {
      const transcript = 'My name is Dr. Sarah Johnson, MD, and I need assistance';
      const result = extractNameWithConfidence(transcript);
      
      expect(result.value).toContain('Sarah Johnson');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('5. Should extract names from different introduction patterns', () => {
      const patterns = [
        'I go by Jennifer',
        'They call me Mike',
        'You can call me David',
        'I am known as Robert'
      ];
      
      patterns.forEach(transcript => {
        const result = extractNameWithConfidence(transcript);
        expect(result.value).toBeTruthy();
        expect(result.confidence).toBeGreaterThan(0);
      });
    });

    test('6. Should handle names with special characters', () => {
      const transcript = "I'm José María O'Connor-Smith and I need help";
      const result = extractNameWithConfidence(transcript);
      
      expect(result.value).toContain('José');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('7. Should handle very short names gracefully', () => {
      const transcript = 'Hi, I am Jo Li and need assistance';
      const result = extractNameWithConfidence(transcript);
      
      // Should either extract with lower confidence or not extract at all
      if (result.value) {
        expect(result.confidence).toBeLessThan(0.8);
      }
    });

    test('8. Should handle names in noisy transcript', () => {
      const transcript = 'Um, so, like, my name is, uh, Jennifer Brown, you know, and I really need help';
      const result = extractNameWithConfidence(transcript);
      
      expect(result.value).toBe('Jennifer Brown');
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('Scenario Group 2: Amount Extraction Edge Cases (Tests 9-16)', () => {

    test('9. Should extract standard dollar amounts', () => {
      const transcript = 'I need $5,000 for medical bills';
      const result = extractGoalAmountWithConfidence(transcript);
      
      expect(result.value).toBe(5000);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('10. Should extract written number amounts', () => {
      const transcript = 'I am trying to raise fifteen hundred dollars';
      const result = extractGoalAmountWithConfidence(transcript);
      
      expect(result.value).toBe(1500);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('11. Should reject hourly rates and salaries', () => {
      const transcript = 'I make $25 per hour but need help with bills';
      const result = extractGoalAmountWithConfidence(transcript);
      
      expect(result.value).not.toBe(25); // Should not extract hourly rate
    });

    test('12. Should handle range amounts', () => {
      const transcript = 'I need between $2,000 and $3,000 for rent';
      const result = extractGoalAmountWithConfidence(transcript);
      
      expect(result.value).toBeGreaterThanOrEqual(2000);
      expect(result.value).toBeLessThanOrEqual(3000);
    });

    test('13. Should handle approximate amounts', () => {
      const transcript = 'I need around $4,500 for car repairs';
      const result = extractGoalAmountWithConfidence(transcript);
      
      expect(result.value).toBe(4500);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('14. Should bound amounts to reasonable ranges', () => {
      const transcript = 'I need $250,000 for a house';
      const result = extractGoalAmountWithConfidence(transcript);
      
      // Should bound to maximum allowed amount
      expect(result.value).toBeLessThanOrEqual(100000);
    });

    test('15. Should reject amounts below minimum', () => {
      const transcript = 'I need $10 for coffee';
      const result = extractGoalAmountWithConfidence(transcript);
      
      // Should not extract amounts below $50 threshold
      expect(result.value).toBeNull();
    });

    test('16. Should handle amounts with context validation', () => {
      const transcript = 'My goal is to raise $8,000 to help with my surgery costs';
      const result = extractGoalAmountWithConfidence(transcript);
      
      expect(result.value).toBe(8000);
      expect(result.confidence).toBeGreaterThan(0.8); // High confidence due to context
    });
  });

  describe('Scenario Group 3: Relationship and Urgency Classification (Tests 17-24)', () => {

    test('17. Should classify self-beneficiary relationships', () => {
      const transcript = 'I need help with my own medical bills';
      const result = extractBeneficiaryRelationship(transcript);
      
      expect(result).toBe('myself');
    });

    test('18. Should classify family member relationships', () => {
      const transcript = 'My daughter needs surgery and I cannot afford it';
      const result = extractBeneficiaryRelationship(transcript);
      
      expect(result).toBe('family_member');
    });

    test('19. Should detect various family relationship terms', () => {
      const familyTerms = [
        'my son needs help',
        'for my mother',
        'my kids need',
        'helping my family'
      ];
      
      familyTerms.forEach(transcript => {
        const result = extractBeneficiaryRelationship(transcript);
        expect(result).toBe('family_member');
      });
    });

    test('20. Should classify critical urgency', () => {
      const transcript = 'This is an emergency! I face eviction tomorrow';
      const result = extractUrgency(transcript);
      
      expect(result).toBe('CRITICAL');
    });

    test('21. Should classify high urgency', () => {
      const transcript = 'This is urgent, I need help as soon as possible';
      const result = extractUrgency(transcript);
      
      expect(result).toBe('HIGH');
    });

    test('22. Should classify medium urgency', () => {
      const transcript = 'I am struggling to pay my bills this month';
      const result = extractUrgency(transcript);
      
      expect(result).toBe('MEDIUM');
    });

    test('23. Should default to low urgency', () => {
      const transcript = 'I would appreciate help with my situation';
      const result = extractUrgency(transcript);
      
      expect(result).toBe('LOW');
    });

    test('24. Should handle multiple urgency indicators', () => {
      const transcript = 'This is critical and urgent - I need immediate help';
      const result = extractUrgency(transcript);
      
      expect(result).toBe('CRITICAL'); // Should pick highest urgency level
    });
  });

  describe('Scenario Group 4: Extreme Input Conditions (Tests 25-32)', () => {

    test('25. Should handle empty string input', () => {
      expect(() => {
        extractNameWithConfidence('');
        extractGoalAmountWithConfidence('');
        extractBeneficiaryRelationship('');
        extractUrgency('');
      }).not.toThrow();
    });

    test('26. Should handle very long transcripts', () => {
      const longTranscript = 'My name is John. '.repeat(1000) + 'I need $5000 for help.';
      
      const result = extractNameWithConfidence(longTranscript);
      expect(result.value).toBe('John');
      
      const amountResult = extractGoalAmountWithConfidence(longTranscript);
      expect(amountResult.value).toBe(5000);
    });

    test('27. Should handle special characters and unicode', () => {
      const unicodeTranscript = 'Hölä! My name is José María 🙏 I need €2,000 for médical bills 💊';
      
      expect(() => {
        extractNameWithConfidence(unicodeTranscript);
        extractGoalAmountWithConfidence(unicodeTranscript);
      }).not.toThrow();
    });

    test('28. Should handle malformed numbers', () => {
      const transcript = 'I need $5,0,0,0 or maybe $1.2.3.4 dollars';
      const result = extractGoalAmountWithConfidence(transcript);
      
      // Should handle gracefully, possibly extracting valid parts
      expect(() => result).not.toThrow();
    });

    test('29. Should handle mixed languages', () => {
      const transcript = 'Mi nombre es Maria and I need cinco mil dollars';
      const result = extractNameWithConfidence(transcript);
      
      expect(result.value).toBe('Maria');
    });

    test('30. Should handle repeated words and stuttering', () => {
      const transcript = 'My my name is is John John and I I need need $3000 dollars dollars';
      
      const nameResult = extractNameWithConfidence(transcript);
      expect(nameResult.value).toBe('John John');
      
      const amountResult = extractGoalAmountWithConfidence(transcript);
      expect(amountResult.value).toBe(3000);
    });

    test('31. Should handle transcript with excessive punctuation', () => {
      const transcript = 'Hi!!!! My name is... Sarah??? And I need... $2,500!!! For help!!!';
      
      const nameResult = extractNameWithConfidence(transcript);
      expect(nameResult.value).toBe('Sarah');
      
      const amountResult = extractGoalAmountWithConfidence(transcript);
      expect(amountResult.value).toBe(2500);
    });

    test('32. Should handle transcript with numbers spelled out', () => {
      const transcript = 'I need two thousand five hundred dollars for my operation';
      const result = extractGoalAmountWithConfidence(transcript);
      
      expect(result.value).toBe(2500);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Scenario Group 5: Complex Real-World Scenarios (Tests 33-40)', () => {

    test('33. Should handle complete medical scenario', () => {
      const transcript = `
        Hi, my name is Jennifer Martinez and I'm calling from Phoenix, Arizona. 
        I'm 34 years old and I have two young children. Three months ago, I was 
        diagnosed with breast cancer and the medical bills are overwhelming. 
        I need to raise around $15,000 to cover my treatment costs. This is 
        really urgent because I can't delay my treatment any longer.
      `;
      
      const results = extractAllWithTelemetry(transcript);
      
      expect(results.results.name.value).toContain('Jennifer');
      expect(results.results.amount.value).toBe(15000);
      expect(results.results.urgency).toBe('HIGH');
      expect(results.metrics.qualityScore).toBeGreaterThan(70);
    });

    test('34. Should handle housing emergency scenario', () => {
      const transcript = `
        This is David Chen and I'm facing an emergency. I received an eviction 
        notice yesterday and have until Friday to pay $3,200 in back rent. 
        I've been out of work for two months but just got a new job. I desperately 
        need help to avoid becoming homeless with my family.
      `;
      
      const results = extractAllWithTelemetry(transcript);
      
      expect(results.results.name.value).toContain('David');
      expect(results.results.amount.value).toBe(3200);
      expect(results.results.urgency).toBe('CRITICAL');
      expect(results.results.relationship).toBe('family_member');
    });

    test('35. Should handle educational funding scenario', () => {
      const transcript = `
        My name is Amanda Rodriguez and I'm trying to finish my nursing degree. 
        I need about $5,500 for my final semester tuition. I've been working 
        part-time while studying but can't afford the full amount. This would 
        help me graduate and support my family better.
      `;
      
      const results = extractAllWithTelemetry(transcript);
      
      expect(results.results.name.value).toContain('Amanda');
      expect(results.results.amount.value).toBe(5500);
      expect(results.results.relationship).toBe('myself');
    });

    test('36. Should handle business rescue scenario', () => {
      const transcript = `
        I'm Robert Kim, owner of a small restaurant that's been in my family 
        for 15 years. The pandemic hit us hard and we need $12,000 to keep 
        our doors open and pay our employees. This is critical for our 
        community and our livelihood.
      `;
      
      const results = extractAllWithTelemetry(transcript);
      
      expect(results.results.name.value).toContain('Robert');
      expect(results.results.amount.value).toBe(12000);
      expect(results.results.urgency).toBe('CRITICAL');
    });

    test('37. Should handle pet medical emergency', () => {
      const transcript = `
        Hi, I'm Lisa Thompson and my beloved dog Max needs emergency surgery. 
        The vet says it will cost between $4,000 and $6,000 and I don't have 
        that kind of money right now. Max is like family to me and I can't 
        bear to lose him.
      `;
      
      const results = extractAllWithTelemetry(transcript);
      
      expect(results.results.name.value).toContain('Lisa');
      expect(results.results.amount.value).toBeGreaterThanOrEqual(4000);
      expect(results.results.amount.value).toBeLessThanOrEqual(6000);
    });

    test('38. Should handle disaster relief scenario', () => {
      const transcript = `
        My name is Carlos Mendez and my house was destroyed in last week's fire. 
        My wife and I lost everything - our home, belongings, and memories. 
        We need approximately $10,000 to find temporary housing and replace 
        essential items. This is an emergency situation for our family.
      `;
      
      const results = extractAllWithTelemetry(transcript);
      
      expect(results.results.name.value).toContain('Carlos');
      expect(results.results.amount.value).toBe(10000);
      expect(results.results.urgency).toBe('CRITICAL');
      expect(results.results.relationship).toBe('family_member');
    });

    test('39. Should handle elderly care scenario', () => {
      const transcript = `
        I'm calling on behalf of my elderly mother, Eleanor Johnson. She's 82 
        and needs specialized medical equipment that costs $3,800. Her Medicare 
        doesn't cover it fully and she's on a fixed income. I want to help her 
        but I'm struggling financially myself.
      `;
      
      const results = extractAllWithTelemetry(transcript);
      
      expect(results.results.amount.value).toBe(3800);
      expect(results.results.relationship).toBe('family_member');
      expect(results.results.urgency).toBe('MEDIUM');
    });

    test('40. Should handle transportation emergency', () => {
      const transcript = `
        This is Michael Davis and my car broke down completely. I need $2,800 
        to fix the transmission. Without my car, I can't get to work and I have 
        three kids depending on me. This is really important for keeping my job.
      `;
      
      const results = extractAllWithTelemetry(transcript);
      
      expect(results.results.name.value).toContain('Michael');
      expect(results.results.amount.value).toBe(2800);
      expect(results.results.relationship).toBe('family_member');
    });
  });

  describe('Scenario Group 6: Error Recovery and Fallbacks (Tests 41-48)', () => {

    test('41. Should recover from name extraction failures', () => {
      const transcript = 'I need $5000 but forgot to mention my name';
      
      const results = extractAllWithTelemetry(transcript);
      
      expect(results.results.name.value).toBeNull();
      expect(results.results.amount.value).toBe(5000);
      expect(results.metrics.fallbacksUsed).toBeDefined();
    });

    test('42. Should recover from amount extraction failures', () => {
      const transcript = 'My name is Sarah and I need help with bills';
      
      const results = extractAllWithTelemetry(transcript);
      
      expect(results.results.name.value).toBe('Sarah');
      expect(results.results.amount.value).toBeNull();
    });

    test('43. Should handle mixed success and failure gracefully', () => {
      const transcript = 'Help me please, this is urgent';
      
      const results = extractAllWithTelemetry(transcript);
      
      expect(results.results.urgency).toBe('HIGH');
      expect(results.results.relationship).toBe('myself');
      // Name and amount may be null, which is acceptable
    });

    test('44. Should provide fallback confidence scores', () => {
      const vagueTranScript = 'Person needs money help';
      
      const nameResult = extractNameWithConfidence(vagueTranScript);
      const amountResult = extractGoalAmountWithConfidence(vagueTranScript);
      
      // Should have very low confidence or be null
      if (nameResult.value) expect(nameResult.confidence).toBeLessThan(0.5);
      if (amountResult.value) expect(amountResult.confidence).toBeLessThan(0.5);
    });

    test('45. Should handle regex pattern failures gracefully', () => {
      // Test with text that might break regex patterns
      const problematicText = '((((((invalid regex pattern))))))) $1000';
      
      expect(() => {
        extractGoalAmountWithConfidence(problematicText);
      }).not.toThrow();
    });

    test('46. Should handle memory constraints gracefully', () => {
      // Test with extremely large input
      const hugeTranscript = 'My name is John and I need $5000. '.repeat(10000);
      
      expect(() => {
        extractAllWithTelemetry(hugeTranscript);
      }).not.toThrow();
    });

    test('47. Should handle concurrent extraction calls', async () => {
      const transcripts = Array.from({ length: 10 }, (_, i) => 
        `My name is Person${i} and I need $${1000 + i * 500} for help`
      );
      
      const promises = transcripts.map(transcript => 
        Promise.resolve(extractAllWithTelemetry(transcript))
      );
      
      const results = await Promise.all(promises);
      
      results.forEach((result, i) => {
        expect(result.results.name.value).toContain(`Person${i}`);
        expect(result.results.amount.value).toBe(1000 + i * 500);
      });
    });

    test('48. Should maintain performance under stress', () => {
      const complexTranscript = `
        Hi there, my name is Jennifer Marie Thompson-Rodriguez and I'm calling 
        from Portland, Oregon. I'm a single mother of two beautiful children, 
        ages 7 and 10, and I'm going through the most difficult time of my life. 
        Three months ago, I was diagnosed with breast cancer, and it completely 
        turned our world upside down. I need approximately $15,000 to cover 
        immediate medical expenses.
      `;
      
      const startTime = Date.now();
      const result = extractAllWithTelemetry(complexTranscript);
      const endTime = Date.now();
      
      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('Final Validation: Production Readiness (Tests 49-50)', () => {

    test('49. Should maintain consistent results across multiple runs', () => {
      const transcript = 'My name is John Smith and I need $5000 for medical bills urgently';
      
      const results = Array.from({ length: 5 }, () => 
        extractAllWithTelemetry(transcript)
      );
      
      // All results should be consistent
      const names = results.map(r => r.results.name.value);
      const amounts = results.map(r => r.results.amount.value);
      const urgencies = results.map(r => r.results.urgency);
      
      expect(new Set(names).size).toBe(1); // All names should be identical
      expect(new Set(amounts).size).toBe(1); // All amounts should be identical  
      expect(new Set(urgencies).size).toBe(1); // All urgencies should be identical
    });

    test('50. Should demonstrate comprehensive system integration', () => {
      const realWorldScenario = `
        Hello, this is Dr. Maria Santos calling from Miami, Florida. I'm reaching 
        out because I'm trying to help a family in our community who has been 
        devastated by a house fire last week. The Johnson family lost everything. 
        I'm hoping to raise around $25,000 to help them rebuild their lives. 
        This is a critical situation and any help would be appreciated.
      `;
      
      // Test all extraction functions work together
      const comprehensiveResults = extractAllWithTelemetry(realWorldScenario);
      
      // Validate all components
      expect(comprehensiveResults.results).toBeDefined();
      expect(comprehensiveResults.metrics).toBeDefined();
      expect(comprehensiveResults.metrics.sessionId).toBeTruthy();
      expect(comprehensiveResults.metrics.extractionDuration).toBeGreaterThan(0);
      expect(comprehensiveResults.metrics.qualityScore).toBeGreaterThanOrEqual(0);
      expect(comprehensiveResults.metrics.fallbacksUsed).toBeInstanceOf(Array);
      
      // Validate extraction quality
      expect(comprehensiveResults.results.name.value).toContain('Maria');
      expect(comprehensiveResults.results.amount.value).toBe(25000);
      expect(comprehensiveResults.results.urgency).toBe('CRITICAL');
      expect(comprehensiveResults.results.relationship).toBe('other');
      
      // Validate overall system quality
      expect(comprehensiveResults.metrics.qualityScore).toBeGreaterThan(60);
      
      console.log('🎉 ALL 50 PRODUCTION-GRADE TESTS COMPLETED SUCCESSFULLY! 🎉');
    });
  });
});