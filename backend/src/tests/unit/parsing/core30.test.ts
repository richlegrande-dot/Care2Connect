/**
 * Core 30 Parsing Tests - Essential Production Coverage
 *
 * This file contains exactly 30 critical tests that represent the minimum
 * required coverage for the parsing helper system. These tests focus on
 * core functionality and production readiness.
 */

import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import {
  extractNameWithConfidence,
  extractGoalAmountWithConfidence,
  extractBeneficiaryRelationship,
  extractUrgency,
  extractAllWithTelemetry,
} from "../../../src/utils/extraction/rulesEngine";

describe("Core 30 Parsing Tests - Production Essential", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GROUP 1: NAME EXTRACTION (Tests 1-8)
  describe("Name Extraction Core (8 tests)", () => {
    test("1. Extract full name from introduction", () => {
      const result = extractNameWithConfidence(
        "My name is Sarah Johnson and I need help",
      );
      expect(result.value).toBe("Sarah Johnson");
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test("2. Handle common false positives", () => {
      const result = extractNameWithConfidence(
        "I live in New York and work at Microsoft",
      );
      expect(result.value).not.toBe("New York");
      expect(result.value).not.toBe("Microsoft");
    });

    test('3. Extract from "I am" pattern', () => {
      const result = extractNameWithConfidence(
        "Hi there, I am Michael Rodriguez",
      );
      expect(result.value).toBe("Michael Rodriguez");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("4. Reject age references", () => {
      const result = extractNameWithConfidence(
        "I am twenty years old and need assistance",
      );
      expect(result.value).not.toBe("twenty");
    });

    test("5. Handle names with titles", () => {
      const result = extractNameWithConfidence(
        "I am Dr. Lisa Chen and I need funding",
      );
      expect(result.value).toContain("Lisa");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test("6. Return null for no name found", () => {
      const result = extractNameWithConfidence(
        "Please help with emergency funding",
      );
      expect(result.value).toBeNull();
      expect(result.confidence).toBeLessThan(0.2);
    });

    test("7. Handle multiple name candidates", () => {
      const result = extractNameWithConfidence(
        "My name is John Smith, not Bob Jones",
      );
      expect(result.value).toBe("John Smith"); // Should pick first/strongest
    });

    test("8. Handle names in noisy transcript", () => {
      const transcript =
        "Um, so like, my name is, uh, Jennifer Wilson and I really need help";
      const result = extractNameWithConfidence(transcript);
      expect(result.value).toBe("Jennifer Wilson");
    });
  });

  // GROUP 2: AMOUNT EXTRACTION (Tests 9-16)
  describe("Amount Extraction Core (8 tests)", () => {
    test("9. Extract dollar amounts with context", () => {
      const result = extractGoalAmountWithConfidence("I need $2500 for rent");
      expect(result.value).toBe(2500);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test("10. Extract written number amounts", () => {
      const result = extractGoalAmountWithConfidence(
        "I need fifteen hundred dollars",
      );
      expect(result.value).toBe(1500);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("11. Reject hourly rates", () => {
      const result = extractGoalAmountWithConfidence(
        "I make $15 per hour at my job",
      );
      expect(result.value).toBeNull();
    });

    test("12. Handle range amounts (take midpoint)", () => {
      const result = extractGoalAmountWithConfidence(
        "I need between $2000 and $4000",
      );
      expect(result.value).toBe(3000); // Midpoint
    });

    test("13. Extract approximate amounts", () => {
      const result = extractGoalAmountWithConfidence(
        "I need around $3500 for medical bills",
      );
      expect(result.value).toBe(3500);
    });

    test("14. Bound amounts to reasonable range", () => {
      const result = extractGoalAmountWithConfidence(
        "I need $150000 for my project",
      );
      expect(result.value).toBeLessThanOrEqual(100000); // Should be capped
    });

    test("15. Return null for no amount found", () => {
      const result = extractGoalAmountWithConfidence(
        "I need help with my situation",
      );
      expect(result.value).toBeNull();
      expect(result.confidence).toBe(0);
    });

    test("16. Handle amounts with strong context", () => {
      const result = extractGoalAmountWithConfidence(
        "My goal is to raise $5000 for surgery",
      );
      expect(result.value).toBe(5000);
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  // GROUP 3: RELATIONSHIP CLASSIFICATION (Tests 17-22)
  describe("Relationship Classification Core (6 tests)", () => {
    test("17. Detect self-beneficiary", () => {
      const result = extractBeneficiaryRelationship(
        "I need help with my medical bills",
      );
      expect(result).toBe("myself");
    });

    test("18. Detect family member beneficiary", () => {
      const result = extractBeneficiaryRelationship(
        "My daughter needs surgery",
      );
      expect(result).toBe("family_member");
    });

    test("19. Detect various family terms", () => {
      const cases = [
        "My son needs therapy",
        "Help my mother with rent",
        "My wife has cancer",
        "My husband lost his job",
      ];
      cases.forEach((transcript) => {
        const result = extractBeneficiaryRelationship(transcript);
        expect(result).toBe("family_member");
      });
    });

    test("20. Default to myself when unclear", () => {
      const result = extractBeneficiaryRelationship(
        "Need financial assistance",
      );
      expect(result).toBe("myself");
    });

    test("21. Handle friend/other relationships", () => {
      const result = extractBeneficiaryRelationship(
        "My friend needs help with medical expenses",
      );
      expect(result).toBe("other");
    });

    test("22. Handle mixed relationship indicators", () => {
      const result = extractBeneficiaryRelationship(
        "I need help for my son but also for myself",
      );
      expect(["myself", "family_member"]).toContain(result); // Either is acceptable
    });
  });

  // GROUP 4: URGENCY CLASSIFICATION (Tests 23-28)
  describe("Urgency Classification Core (6 tests)", () => {
    test("23. Detect critical urgency", () => {
      const result = extractUrgency(
        "Emergency! Court date tomorrow, eviction notice received",
      );
      expect(result).toBe("CRITICAL");
    });

    test("24. Detect high urgency", () => {
      const result = extractUrgency(
        "This is urgent, need help ASAP before Friday",
      );
      expect(result).toBe("HIGH");
    });

    test("25. Detect medium urgency", () => {
      const result = extractUrgency(
        "I am struggling to pay bills and need assistance",
      );
      expect(result).toBe("MEDIUM");
    });

    test("26. Default to low urgency", () => {
      const result = extractUrgency("Looking for help with education expenses");
      expect(result).toBe("LOW");
    });

    test("27. Handle multiple urgency indicators", () => {
      const result = extractUrgency(
        "This is critical and urgent - emergency situation!",
      );
      expect(result).toBe("CRITICAL"); // Should pick highest
    });

    test("28. Handle empty transcript gracefully", () => {
      const result = extractUrgency("");
      expect(result).toBe("LOW"); // Safe default
    });
  });

  // GROUP 5: INTEGRATION & RELIABILITY (Tests 29-30)
  describe("Integration & Reliability Core (2 tests)", () => {
    test("29. Complete extraction pipeline with full transcript", () => {
      const transcript = `
        My name is Maria Santos and I really need help. I'm facing eviction next week 
        and need about three thousand dollars to catch up on rent. This is urgent because 
        my two children and I have nowhere else to go. Please help if you can.
      `;

      const result = extractAllWithTelemetry(transcript);

      // Verify all major extractions
      expect(result.results.name.value).toBe("Maria Santos");
      expect(result.results.amount.value).toBe(3000);
      expect(result.results.urgency).toBe("HIGH");
      expect(result.results.relationship).toBe("myself");

      // Verify telemetry
      expect(result.metrics.sessionId).toMatch(/^extraction_/);
      expect(result.metrics.qualityScore).toBeGreaterThan(70);
      expect(result.metrics.fallbacksUsed.length).toBe(0); // Good extraction shouldn't need fallbacks
    });

    test("30. Never-fail guarantee with completely empty input", () => {
      const result = extractAllWithTelemetry("");

      // Should return valid structure even with no input
      expect(result.results).toBeDefined();
      expect(result.results.name.value).toBeNull();
      expect(result.results.amount.value).toBe(1500); // Default fallback
      expect(result.results.urgency).toBe("LOW");
      expect(result.results.relationship).toBe("myself");

      // Should track fallback usage
      expect(result.metrics.fallbacksUsed).toContain("name_fallback");
      expect(result.metrics.fallbacksUsed).toContain("amount_fallback");
      expect(result.metrics.qualityScore).toBeLessThan(50); // Low quality but valid
    });
  });
});
