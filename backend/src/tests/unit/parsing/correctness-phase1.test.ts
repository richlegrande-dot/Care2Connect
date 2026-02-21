/**
 * Phase 1 Correctness Tests - False Positive Prevention
 *
 * Tests for enhanced parsing helper to prevent false positives
 * and validate confidence scoring improvements
 */

import {
  extractName,
  extractNameWithConfidence,
  extractGoalAmount,
  extractGoalAmountWithConfidence,
  extractBeneficiaryRelationship,
} from "../../../src/utils/extraction/rulesEngine";

describe("Phase 1: Correctness Upgrades - False Positive Prevention", () => {
  describe("Name Extraction False Positive Prevention", () => {
    test("should reject common false positives", () => {
      // Age references should be rejected
      expect(extractName("I'm twenty years old and need help")).toBeUndefined();
      expect(
        extractName("My name is thirty and I'm struggling"),
      ).toBeUndefined();

      // Emotion words should be rejected
      expect(
        extractName("I'm critical condition and need help"),
      ).toBeUndefined();
      expect(
        extractName("My name is desperate and I need money"),
      ).toBeUndefined();

      // Action verbs should be rejected
      expect(extractName("I'm trying to get help")).toBeUndefined();
      expect(extractName("My name is looking for assistance")).toBeUndefined();
    });

    test("should reject names followed by measurement units", () => {
      expect(extractName("I'm John years old")).toBeUndefined();
      expect(extractName("My name is Mary dollars")).toBeUndefined();
      expect(extractName("I'm called Sarah per hour")).toBeUndefined();
    });

    test("should accept valid names with high confidence", () => {
      const result = extractNameWithConfidence(
        "My name is John Smith and I need help",
      );
      expect(result.value).toBe("John Smith");
      expect(result.confidence).toBeGreaterThan(0.8); // Multi-token + proper case

      const result2 = extractNameWithConfidence(
        "I'm Sarah Johnson from Seattle",
      );
      expect(result2.value).toBe("Sarah Johnson");
      expect(result2.confidence).toBeGreaterThan(0.8);
    });

    test("should give lower confidence to single names", () => {
      const result = extractNameWithConfidence("My name is John");
      expect(result.value).toBe("John");
      expect(result.confidence).toBeLessThan(0.8);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test("should reject very short or very long names", () => {
      expect(extractName("My name is Jo")).toBeUndefined(); // Too short
      expect(extractName("My name is " + "A".repeat(51))).toBeUndefined(); // Too long
    });
  });

  describe("Goal Amount False Positive Prevention", () => {
    test("should reject hourly wages and time references", () => {
      expect(extractGoalAmount("I make $15 an hour")).toBeNull();
      expect(extractGoalAmount("My wage is $20 per hour")).toBeNull();
      expect(extractGoalAmount("I earn $25/hour")).toBeNull();
      expect(extractGoalAmount("It takes 3 months")).toBeNull();
      expect(extractGoalAmount("I'm 28 years old")).toBeNull();
    });

    test("should require context for amount extraction", () => {
      // No context - should be rejected
      expect(extractGoalAmount("The number is 1500")).toBeNull();
      expect(extractGoalAmount("It costs $2000")).toBeNull();

      // Good context - should be accepted
      expect(extractGoalAmount("I need $1500 for rent")).toBe(1500);
      expect(extractGoalAmount("My goal is to raise $2000")).toBe(2000);
      expect(
        extractGoalAmount("Looking for $3000 to help with medical bills"),
      ).toBe(3000);
    });

    test("should extract amounts with high confidence when context is strong", () => {
      const result = extractGoalAmountWithConfidence(
        "I need to raise $5000 for my surgery",
      );
      expect(result.value).toBe(5000);
      expect(result.confidence).toBeGreaterThan(0.8);

      const result2 = extractGoalAmountWithConfidence(
        "My goal is $3000 for housing",
      );
      expect(result2.value).toBe(3000);
      expect(result2.confidence).toBeGreaterThan(0.6);
    });

    test("should give lower confidence when context is weak", () => {
      const result = extractGoalAmountWithConfidence("The amount is $1000");
      expect(result.value).toBe(1000);
      expect(result.confidence).toBeLessThan(0.6);
      expect(result.confidence).toBeGreaterThan(0);
    });

    test("should bound amounts to reasonable ranges", () => {
      expect(extractGoalAmount("I need $10 for help")).toBe(50); // Minimum bound
      expect(extractGoalAmount("I need $500000 for help")).toBe(100000); // Maximum bound
    });

    test("should handle written numbers correctly", () => {
      expect(extractGoalAmount("I need fifteen hundred dollars")).toBe(1500);
      expect(extractGoalAmount("My goal is five thousand")).toBe(5000);
      expect(extractGoalAmount("I need two thousand five hundred")).toBe(2500);
    });

    test("should handle range expressions", () => {
      const result = extractGoalAmountWithConfidence(
        "I need between $2000 and $3000",
      );
      expect(result.value).toBe(2000); // Should take the first amount
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe("Beneficiary Relationship Extraction", () => {
    test("should detect family member relationships", () => {
      expect(extractBeneficiaryRelationship("I need help for my son")).toBe(
        "family_member",
      );
      expect(
        extractBeneficiaryRelationship("This is for my daughter's surgery"),
      ).toBe("family_member");
      expect(extractBeneficiaryRelationship("My kids need help")).toBe(
        "family_member",
      );
      expect(extractBeneficiaryRelationship("I'm helping my mom")).toBe(
        "family_member",
      );
      expect(extractBeneficiaryRelationship("For my father's treatment")).toBe(
        "family_member",
      );
      expect(
        extractBeneficiaryRelationship("Our family needs assistance"),
      ).toBe("family_member");
    });

    test("should detect self-identification", () => {
      expect(extractBeneficiaryRelationship("I need help for myself")).toBe(
        "myself",
      );
      expect(
        extractBeneficiaryRelationship("This is for my own medical bills"),
      ).toBe("myself");
    });

    test("should default to myself when no relationship detected", () => {
      expect(
        extractBeneficiaryRelationship("I need help with medical bills"),
      ).toBe("myself");
      expect(extractBeneficiaryRelationship("Please help me")).toBe("myself");
      expect(extractBeneficiaryRelationship("Need assistance urgently")).toBe(
        "myself",
      );
    });
  });

  describe("Edge Cases and Robustness", () => {
    test("should handle empty or very short transcripts gracefully", () => {
      expect(extractName("")).toBeUndefined();
      expect(extractGoalAmount("")).toBeNull();
      expect(extractBeneficiaryRelationship("")).toBe("myself");

      expect(extractName("Hi")).toBeUndefined();
      expect(extractGoalAmount("Help")).toBeNull();
      expect(extractBeneficiaryRelationship("Help")).toBe("myself");
    });

    test("should handle malformed input gracefully", () => {
      expect(extractName("My name is $$$ invalid")).toBeUndefined();
      expect(extractGoalAmount("I need $$$ help")).toBeNull();
    });

    test("should handle multiple potential matches correctly", () => {
      // Should pick the first valid match
      const transcript =
        "My name is John Smith, but people call me Johnny. I need $1500 for rent but $500 would help too.";
      expect(extractName(transcript)).toBe("John Smith");
      expect(extractGoalAmount(transcript)).toBe(1500);
    });

    test("should maintain confidence scoring consistency", () => {
      const nameResult = extractNameWithConfidence(
        "My name is Dr. Sarah Elizabeth Johnson",
      );
      const amountResult = extractGoalAmountWithConfidence(
        "I desperately need $5000 for emergency surgery",
      );

      // Both should have high confidence due to strong context
      expect(nameResult.confidence).toBeGreaterThan(0.7);
      expect(amountResult.confidence).toBeGreaterThan(0.7);

      // Confidence should be between 0 and 1
      expect(nameResult.confidence).toBeGreaterThanOrEqual(0);
      expect(nameResult.confidence).toBeLessThanOrEqual(1);
      expect(amountResult.confidence).toBeGreaterThanOrEqual(0);
      expect(amountResult.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe("Real-world Scenario Validation", () => {
    test("should correctly parse complex medical scenario", () => {
      const transcript =
        "Hi, my name is Maria Rodriguez and I'm calling from Phoenix. I just got out of the hospital after surgery and the bills are overwhelming. I need to raise about $7500 to cover the medical expenses. This is urgent because I have until next week to make a payment plan.";

      const name = extractNameWithConfidence(transcript);
      const amount = extractGoalAmountWithConfidence(transcript);
      const relationship = extractBeneficiaryRelationship(transcript);

      expect(name.value).toBe("Maria Rodriguez");
      expect(name.confidence).toBeGreaterThan(0.8); // Full name + proper context

      expect(amount.value).toBe(7500);
      expect(amount.confidence).toBeGreaterThan(0.6); // Good context with "raise" and "medical"

      expect(relationship).toBe("myself");
    });

    test("should correctly parse family assistance scenario", () => {
      const transcript =
        "I'm calling to get help for my daughter. She needs surgery and we don't have insurance. We're looking to raise fifteen thousand dollars for her medical treatment. Please help our family.";

      const name = extractName(transcript);
      const amount = extractGoalAmount(transcript);
      const relationship = extractBeneficiaryRelationship(transcript);

      expect(name).toBeUndefined(); // No "my name is" pattern
      expect(amount).toBe(15000); // "fifteen thousand"
      expect(relationship).toBe("family_member"); // "for my daughter"
    });

    test("should reject false positive scenario", () => {
      const transcript =
        "I'm twenty years old and make $15 an hour at my job. I've been working for 3 months and I'm struggling to pay rent which is $1200 per month.";

      const name = extractName(transcript);
      const amount = extractGoalAmount(transcript);

      expect(name).toBeUndefined(); // "twenty" should be rejected
      expect(amount).toBeNull(); // "$15 an hour" and "$1200 per month" should be rejected
    });
  });
});

/**
 * Performance validation test (non-flaky microbenchmark)
 */
describe("Performance Validation", () => {
  test("should process 100 transcripts within reasonable time", () => {
    const sampleTranscripts = [
      "My name is John Smith and I need $2000 for rent",
      "Hi, I'm Sarah and I need help with medical bills of about $5000",
      "I'm Mike from Boston and I need to raise fifteen hundred dollars",
      "My daughter needs surgery and we need $10000",
      "I'm struggling to pay bills and need assistance",
    ];

    const startTime = Date.now();

    // Process 100 transcripts (20 of each sample)
    for (let i = 0; i < 100; i++) {
      const transcript = sampleTranscripts[i % sampleTranscripts.length];
      extractNameWithConfidence(transcript);
      extractGoalAmountWithConfidence(transcript);
      extractBeneficiaryRelationship(transcript);
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // Should complete within 1 second for 100 transcripts
    expect(processingTime).toBeLessThan(1000);
    console.log(`Processed 100 transcripts in ${processingTime}ms`);
  });
});
