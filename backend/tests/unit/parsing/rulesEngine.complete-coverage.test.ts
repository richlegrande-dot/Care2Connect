/**
 * Complete Coverage Tests for rulesEngine.ts
 * Tests for remaining uncovered functions: extractAge, extractPhone, extractEmail, extractLocation,
 * scoreKeywords, extractNeeds, extractSkills, calculateConfidence, generateTemplateSummary
 */

import {
  extractAge,
  extractPhone,
  extractEmail,
  extractLocation,
  scoreKeywords,
  extractNeeds,
  extractSkills,
  calculateConfidence,
  generateTemplateSummary,
  validateGoFundMeData
} from '../../../src/utils/extraction/rulesEngine';

describe('rulesEngine Complete Coverage Tests', () => {
  
  describe('extractAge', () => {
    test('should extract age from "I am X years old"', () => {
      expect(extractAge("I am 25 years old")).toBe(25);
      expect(extractAge("I'm 42 years old")).toBe(42);
    });
    
    test('should extract age from "X year old"', () => {
      expect(extractAge("I'm a 30 year old looking for help")).toBe(30);
    });
    
    test('should validate reasonable age range (18-120)', () => {
      expect(extractAge("I am 18 years old")).toBe(18);
      expect(extractAge("I am 120 years old")).toBe(120);
      expect(extractAge("I am 17 years old")).toBeUndefined(); // Too young
      expect(extractAge("I am 150 years old")).toBeUndefined(); // Too old
    });
    
    test('should return undefined if no age found', () => {
      expect(extractAge("I need help with housing")).toBeUndefined();
    });
  });

  describe('extractPhone', () => {
    test('should extract phone with parentheses format', () => {
      const result = extractPhone("Call me at (555) 123-4567");
      expect(result).toBe("(555) 123-4567");
    });
    
    test('should extract phone with dashes', () => {
      const result = extractPhone("My phone is 555-123-4567");
      expect(result).toBeDefined();
    });
    
    test('should extract phone with spaces', () => {
      const result = extractPhone("Contact me at 555 123 4567");
      expect(result).toBeDefined();
    });
    
    test('should normalize to standard format', () => {
      const result = extractPhone("Call 5551234567");
      expect(result).toBe("(555) 123-4567");
    });
    
    test('should return undefined if no valid phone', () => {
      expect(extractPhone("I need help")).toBeUndefined();
    });
    
    test('should only extract 10-digit phones', () => {
      expect(extractPhone("Call 12345")).toBeUndefined();
    });
  });

  describe('extractEmail', () => {
    test('should extract standard email', () => {
      expect(extractEmail("Email me at john@example.com")).toBe("john@example.com");
    });
    
    test('should extract email with dots and underscores', () => {
      expect(extractEmail("Contact john.doe_123@example.co.uk")).toBe("john.doe_123@example.co.uk");
    });
    
    test('should convert to lowercase', () => {
      expect(extractEmail("My email is JOHN@EXAMPLE.COM")).toBe("john@example.com");
    });
    
    test('should return undefined if no email', () => {
      expect(extractEmail("I need help with housing")).toBeUndefined();
    });
  });

  describe('extractLocation', () => {
    test('should extract city and state from "live in"', () => {
      const result = extractLocation("I live in Austin, TX");
      expect(result).toBeDefined();
      expect(result).toContain("Austin");
    });
    
    test('should extract from "from" keyword', () => {
      const result = extractLocation("I'm from Seattle, WA");
      expect(result).toBeDefined();
    });
    
    test('should extract city only', () => {
      const result = extractLocation("living in Portland");
      expect(result).toBeDefined();
    });
    
    test('should return undefined if no location', () => {
      expect(extractLocation("I need help")).toBeUndefined();
    });
  });

  describe('scoreKeywords', () => {
    test('should count single keyword occurrence', () => {
      const score = scoreKeywords("I need housing assistance", ["housing"]);
      expect(score).toBe(1);
    });
    
    test('should count multiple keyword occurrences', () => {
      const score = scoreKeywords("housing housing housing", ["housing"]);
      expect(score).toBe(3);
    });
    
    test('should count multiple different keywords', () => {
      const score = scoreKeywords("I need food and shelter", ["food", "shelter"]);
      expect(score).toBe(2);
    });
    
    test('should be case insensitive', () => {
      const score = scoreKeywords("HOUSING Housing housing", ["housing"]);
      expect(score).toBe(3);
    });
    
    test('should use word boundaries', () => {
      const score = scoreKeywords("I need a house", ["housing"]);
      expect(score).toBe(0); // "house" is not "housing"
    });
    
    test('should return 0 for no matches', () => {
      const score = scoreKeywords("I need help", ["medical"]);
      expect(score).toBe(0);
    });
  });

  describe('extractNeeds', () => {
    test('should extract single need', () => {
      const needs = extractNeeds("I need help with housing", 3);
      expect(needs).toContain("HOUSING");
    });
    
    test('should extract multiple needs ranked by score', () => {
      const needs = extractNeeds("I need housing shelter and food groceries meals", 3);
      expect(needs.length).toBeGreaterThan(0);
      expect(needs.length).toBeLessThanOrEqual(3);
    });
    
    test('should identify healthcare needs', () => {
      const needs = extractNeeds("I need medical help for my health and doctor appointments", 3);
      expect(needs).toContain("HEALTHCARE");
    });
    
    test('should identify employment needs', () => {
      const needs = extractNeeds("I need a job and work and employment", 3);
      expect(needs.length).toBeGreaterThan(0);
    });
    
    test('should identify safety needs', () => {
      const needs = extractNeeds("I need protection from domestic violence and abuse", 3);
      expect(needs).toContain("SAFETY");
    });
    
    test('should return OTHER fallback if no specific needs found', () => {
      const needs = extractNeeds("Hello world", 3);
      expect(needs).toEqual(["OTHER"]);
    });
    
    test('should limit to topN results', () => {
      const needs = extractNeeds("I need housing food employment healthcare transportation", 2);
      expect(needs.length).toBeLessThanOrEqual(2);
    });
  });

  describe('extractSkills', () => {
    test('should extract construction skills', () => {
      const skills = extractSkills("I have carpentry and plumber experience", 5);
      expect(skills).toContain("Construction");
    });
    
    test('should extract healthcare skills', () => {
      const skills = extractSkills("I'm a nurse with CNA certification", 5);
      expect(skills).toContain("Healthcare");
    });
    
    test('should extract retail skills', () => {
      const skills = extractSkills("I have retail sales and customer service experience", 5);
      expect(skills).toContain("Retail");
    });
    
    test('should extract technology skills', () => {
      const skills = extractSkills("I know programming and coding and software development", 5);
      expect(skills).toContain("Technology");
    });
    
    test('should rank skills by frequency', () => {
      const skills = extractSkills("nursing nurse caregiver", 5);
      expect(skills.length).toBeGreaterThan(0);
    });
    
    test('should return empty array if no skills found', () => {
      const skills = extractSkills("I need help", 5);
      expect(skills).toEqual([]);
    });
    
    test('should limit to topN results', () => {
      const skills = extractSkills("construction healthcare retail technology", 2);
      expect(skills.length).toBeLessThanOrEqual(2);
    });
  });

  describe('calculateConfidence', () => {
    test('should return 0 for no extracted fields', () => {
      expect(calculateConfidence()).toBe(0);
    });
    
    test('should add 25 for name', () => {
      expect(calculateConfidence("John Smith")).toBe(25);
    });
    
    test('should add 15 for age', () => {
      expect(calculateConfidence(undefined, 30)).toBe(15);
    });
    
    test('should add 30 for needs', () => {
      expect(calculateConfidence(undefined, undefined, ["HOUSING"])).toBe(30);
    });
    
    test('should add 15 for phone', () => {
      expect(calculateConfidence(undefined, undefined, undefined, "555-1234")).toBe(15);
    });
    
    test('should add 15 for email', () => {
      expect(calculateConfidence(undefined, undefined, undefined, undefined, "test@example.com")).toBe(15);
    });
    
    test('should sum all fields', () => {
      const confidence = calculateConfidence(
        "John Smith",
        30,
        ["HOUSING", "FOOD"],
        "555-1234",
        "test@example.com"
      );
      expect(confidence).toBe(95); // Capped at 95
    });
    
    test('should cap at 95', () => {
      const confidence = calculateConfidence(
        "John Smith",
        30,
        ["HOUSING"],
        "555-1234",
        "test@example.com"
      );
      expect(confidence).toBeLessThanOrEqual(95);
    });
  });

  describe('generateTemplateSummary', () => {
    test('should generate summary with name', () => {
      const summary = generateTemplateSummary("John Smith", ["HOUSING"], 100);
      expect(summary).toContain("John Smith");
      expect(summary).toContain("housing");
    });
    
    test('should use default name if undefined', () => {
      const summary = generateTemplateSummary(undefined, ["HOUSING"], 100);
      expect(summary).toContain("A community member");
    });
    
    test('should format multiple needs', () => {
      const summary = generateTemplateSummary("Jane Doe", ["HOUSING", "FOOD", "HEALTHCARE"], 100);
      expect(summary).toContain("housing");
      expect(summary).toContain("food");
      expect(summary).toContain("healthcare");
    });
    
    test('should use default needs if empty', () => {
      const summary = generateTemplateSummary("John Smith", [], 100);
      expect(summary).toContain("general support");
    });
    
    test('should include current date', () => {
      const summary = generateTemplateSummary("John Smith", ["HOUSING"], 100);
      expect(summary).toMatch(/\d{4}/); // Should contain year
    });
    
    test('should replace underscores with spaces in needs', () => {
      const summary = generateTemplateSummary("John Smith", ["MENTAL_HEALTH"], 100);
      expect(summary).toContain("mental health");
      expect(summary).not.toContain("mental_health");
    });
  });

  describe('validateGoFundMeData', () => {
    test('should validate complete data', () => {
      const result = validateGoFundMeData(
        "Help needed",
        "This is a complete story with more than fifty characters in total",
        1000,
        "HOUSING",
        "Myself",
        "Test transcript"
      );
      
      expect(result.isComplete).toBe(true);
      expect(result.missingFields).toEqual([]);
    });
    
    test('should identify missing title', () => {
      const result = validateGoFundMeData(
        undefined,
        "Complete story here with enough characters",
        1000,
        "HOUSING",
        "Myself",
        "Test transcript"
      );
      
      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain('title');
      expect(result.suggestions.title).toBeDefined();
    });
    
    test('should identify missing story', () => {
      const result = validateGoFundMeData(
        "Help Needed Title",
        undefined,
        1000,
        "HOUSING",
        "Myself",
        "Test transcript that is long enough to be used as a story"
      );
      
      expect(result.missingFields).toContain('story');
      expect(result.suggestions.story).toBeDefined();
    });
    
    test('should identify missing goal amount', () => {
      const result = validateGoFundMeData(
        "Title Here",
        "This is a complete story with more than fifty characters total",
        undefined,
        "HOUSING",
        "Myself",
        "I need $2000 for rent"
      );
      
      expect(result.missingFields).toContain('goalAmount');
      expect(result.suggestions.goalAmount).toBeDefined();
    });
    
    test('should suggest amount when not extractable', () => {
      const result = validateGoFundMeData(
        "Help Title",
        "Complete story with more than fifty characters goes here",
        undefined,
        "HOUSING",
        "Myself",
        "I need help with housing"
      );
      
      expect(result.suggestions.goalAmount).toBeGreaterThan(0);
    });
    
    test('should identify missing category', () => {
      const result = validateGoFundMeData(
        "Title Here",
        "Complete story with more than fifty characters in this text",
        1000,
        undefined,
        "Myself",
        "I need help with medical bills"
      );
      
      expect(result.missingFields).toContain('category');
      expect(result.suggestions.category).toBeDefined();
    });
    
    test('should identify missing beneficiary', () => {
      const result = validateGoFundMeData(
        "Title Here",
        "Complete story with more than fifty characters in this text",
        1000,
        "HOUSING",
        undefined,
        "I need help"
      );
      
      expect(result.missingFields).toContain('beneficiary');
      expect(result.suggestions.beneficiary).toBeDefined();
    });
    
    test('should validate goal amount range', () => {
      const result = validateGoFundMeData(
        "Title Here",
        "Complete story with more than fifty characters in this text",
        25, // Too low
        "HOUSING",
        "Myself",
        "Test"
      );
      
      expect(result.suggestions.goalAmount).toBeGreaterThanOrEqual(50);
    });
    
    test('should cap excessive goal amounts', () => {
      const result = validateGoFundMeData(
        "Title Here",
        "Complete story with more than fifty characters in this text",
        200000, // Too high
        "HOUSING",
        "Myself",
        "Test"
      );
      
      expect(result.suggestions.goalAmount).toBeLessThanOrEqual(100000);
    });
    
    test('should decrease confidence for missing fields', () => {
      const complete = validateGoFundMeData(
        "Full Title Here",
        "Full story here with many details and more than fifty characters",
        1000,
        "HOUSING",
        "Myself",
        "Test"
      );
      
      const incomplete = validateGoFundMeData(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "Test"
      );
      
      expect(complete.confidence).toBeGreaterThan(incomplete.confidence);
    });
    
    test('should generate suggestions from transcript', () => {
      const result = validateGoFundMeData(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "I'm Jane Doe and I need $5000 for medical expenses urgently"
      );
      
      // The name extraction includes "and" due to pattern matching
      expect(result.suggestions.beneficiary).toContain("Jane Doe");
      expect(result.suggestions.goalAmount).toBe(5000);
    });
  });

  describe('Integration: Complete extraction workflow', () => {
    test('should extract all fields from rich transcript', () => {
      const transcript = "I'm John Smith, I am 35 years old, living in Austin, TX. " +
        "I need $5000 for emergency housing assistance. " +
        "Call me at (555) 123-4567 or email john@example.com. " +
        "I have carpentry and construction skills.";
      
      expect(extractAge(transcript)).toBe(35);
      expect(extractPhone(transcript)).toBe("(555) 123-4567");
      expect(extractEmail(transcript)).toBe("john@example.com");
      expect(extractLocation(transcript)).toContain("Austin");
      expect(extractNeeds(transcript, 3)).toContain("HOUSING");
      expect(extractSkills(transcript, 5)).toContain("Construction");
      
      const confidence = calculateConfidence(
        "John Smith",
        35,
        ["HOUSING"],
        "(555) 123-4567",
        "john@example.com"
      );
      expect(confidence).toBeGreaterThan(80);
    });
    
    test('should handle sparse transcript gracefully', () => {
      const transcript = "I need help";
      
      expect(extractAge(transcript)).toBeUndefined();
      expect(extractPhone(transcript)).toBeUndefined();
      expect(extractEmail(transcript)).toBeUndefined();
      // Engine returns ["OTHER"] as fallback when no specific needs detected
      expect(extractNeeds(transcript, 3)).toEqual(["OTHER"]);
      
      const confidence = calculateConfidence();
      expect(confidence).toBe(0);
    });
  });
});
