/**
 * Phase 4: Adversarial and Stress Testing
 *
 * EXTREMELY DIFFICULT test cases designed to break the parsing helper
 * Tests edge cases, adversarial inputs, ambiguous scenarios, and realistic noise
 *
 * This suite challenges the system with:
 * - Intentionally deceptive patterns
 * - Multiple competing signals
 * - Realistic speech disfluencies
 * - Complex cultural names
 * - Ambiguous contexts
 * - Edge case monetary formats
 * - Psychological manipulation attempts
 * - Real-world messy transcripts
 */

import {
  extractName,
  extractNameWithConfidence,
  extractGoalAmount,
  extractGoalAmountWithConfidence,
  extractBeneficiaryRelationship,
  extractUrgency,
  extractAllWithTelemetry,
} from "../../../utils/extraction/rulesEngine";

describe("Phase 4: Adversarial Stress Testing - Breaking the Parser", () => {
  describe("Adversarial Name Extraction - Intentionally Deceptive", () => {
    test("should handle names that look like common words", () => {
      // Names that are also common words
      const result1 = extractNameWithConfidence(
        "My name is Hope and I need help",
      );
      expect(result1.value).toBe("Hope");
      expect(result1.confidence).toBeGreaterThan(0.5);

      const result2 = extractNameWithConfidence(
        "I'm Faith Johnson seeking assistance",
      );
      expect(result2.value).toBe("Faith Johnson");
      expect(result2.confidence).toBeGreaterThan(0.7);

      const result3 = extractNameWithConfidence("My name is Charity Williams");
      expect(result3.value).toBe("Charity Williams");
    });

    test("should reject names that are actually urgency descriptors", () => {
      // These should be rejected even though they follow name patterns
      expect(
        extractName("My name is Critical and this is urgent"),
      ).toBeUndefined();
      expect(extractName("I'm Emergency response team")).toBeUndefined();
      expect(extractName("They call me Desperate Dave")).toBeUndefined();
    });

    test("should handle complex hyphenated and multicultural names", () => {
      const result1 = extractNameWithConfidence(
        "My name is María José García-López",
      );
      expect(result1.value).toBeTruthy();
      expect(result1.confidence).toBeGreaterThan(0.6);

      const result2 = extractNameWithConfidence(
        "I'm Jean-Pierre François from Montreal",
      );
      expect(result2.value).toBeTruthy();

      const result3 = extractNameWithConfidence("My name is Nguyen Van Thanh");
      expect(result3.value).toBeTruthy();

      const result4 = extractNameWithConfidence(
        "I'm Mohammed Abdul-Rahman ibn Said",
      );
      expect(result4.value).toBeTruthy();
    });

    test("should handle names with titles and honorifics correctly", () => {
      const result1 = extractNameWithConfidence(
        "My name is Dr. Sarah Thompson MD",
      );
      expect(result1.value).toContain("Sarah Thompson");

      const result2 = extractNameWithConfidence("I'm Rev. Michael Johnson Jr.");
      expect(result2.value).toContain("Michael Johnson");

      const result3 = extractNameWithConfidence(
        "They call me Captain James Smith",
      );
      expect(result3.value).toContain("James Smith");
    });

    test("should handle multiple name mentions with contradictions", () => {
      // First clear mention should win
      const transcript =
        "My name is Sarah Johnson but everyone calls me Jennifer and my nickname is Jen but legally I'm Sarah Elizabeth Johnson Smith-Williams";
      const result = extractNameWithConfidence(transcript);
      expect(result.value).toBe("Sarah Johnson");
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test("should reject names that are actually addresses or locations", () => {
      expect(extractName("I'm Portland Oregon resident")).toBeUndefined();
      expect(
        extractName("My name is Dallas Texas technically"),
      ).toBeUndefined();
      expect(extractName("They call me Houston Avenue")).toBeUndefined();
    });

    test("should handle names with unusual capitalization patterns", () => {
      const result1 = extractNameWithConfidence("My name is deShaun McDonald");
      expect(result1.value).toBeTruthy();

      const result2 = extractNameWithConfidence("I'm O'Brien McKenzie");
      expect(result2.value).toBeTruthy();

      const result3 = extractNameWithConfidence("My name is van der Berg");
      expect(result3.value).toBeTruthy();
    });
  });

  describe("Adversarial Amount Extraction - Deceptive Monetary Contexts", () => {
    test("should reject amounts buried in unrelated contexts", () => {
      // Phone numbers that look like dollar amounts
      expect(extractGoalAmount("Call me at 555-1234 for help")).toBeNull();
      expect(
        extractGoalAmount("My number is $500-5000 extension 123"),
      ).toBeNull();

      // Dates and times that look like amounts
      expect(extractGoalAmount("I need help by 2025 or $12-31")).toBeNull();
      expect(extractGoalAmount("Around $1200 noon would work")).toBeNull();
    });

    test("should handle multiple conflicting amounts correctly", () => {
      // Should extract the most relevant amount with context
      const transcript =
        "I used to make $50,000 a year but now I make $15 an hour and I'm $8,000 in debt. I need to raise $2,500 for rent.";
      const result = extractGoalAmountWithConfidence(transcript);

      expect(result.value).toBe(2500); // "need to raise" has strongest context
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test("should handle ambiguous range expressions", () => {
      const result1 = extractGoalAmountWithConfidence(
        "I need anywhere from $1,000 to $5,000 depending on the situation",
      );
      expect(result1.value).toBe(1000); // Should take first amount in range

      const result2 = extractGoalAmountWithConfidence(
        "Between fifteen hundred and three thousand dollars would help",
      );
      expect([1500, 3000]).toContain(result2.value);
    });

    test("should reject amounts in comparison or contrast contexts", () => {
      // "Unlike" and "not" contexts should be rejected or given very low confidence
      expect(
        extractGoalAmount(
          "Unlike other people asking for $5000, I only need a small amount",
        ),
      ).toBeNull();
      expect(
        extractGoalAmount("I'm not asking for $10,000 or anything crazy"),
      ).toBeNull();

      const result = extractGoalAmountWithConfidence(
        "Some people need $50,000 but I just need $800",
      );
      expect(result.value).toBe(800); // Should get the second amount with "I just need"
    });

    test("should handle written numbers in complex expressions", () => {
      expect(
        extractGoalAmount(
          "I need seven thousand five hundred thirty-two dollars",
        ),
      ).toBe(7532);
      expect(
        extractGoalAmount("My goal is twenty-one thousand and change"),
      ).toBeGreaterThan(20000);
      expect(
        extractGoalAmount("Looking for three and a half thousand"),
      ).toBeGreaterThan(3000);
      expect(
        extractGoalAmount("About a thousand and fifty bucks"),
      ).toBeGreaterThan(1000);
    });

    test("should handle percentage and fractional expressions", () => {
      // "50% of $10,000" should extract ~$5,000
      const result1 = extractGoalAmountWithConfidence(
        "I need 50% of $10,000 for the down payment",
      );
      expect(result1.value).toBeGreaterThan(4000);
      expect(result1.value).toBeLessThan(10000);

      // "Half of five thousand"
      const result2 = extractGoalAmountWithConfidence(
        "I need half of five thousand dollars",
      );
      expect([2500, 5000]).toContain(result2.value);
    });

    test("should handle amounts with modifiers and uncertainty", () => {
      const result1 = extractGoalAmountWithConfidence(
        "I need at least $3,000 but preferably $5,000",
      );
      expect([3000, 5000]).toContain(result1.value);

      const result2 = extractGoalAmountWithConfidence(
        "Somewhere around $2,500 give or take",
      );
      expect(result2.value).toBeGreaterThan(2000);
      expect(result2.value).toBeLessThan(3000);

      const result3 = extractGoalAmountWithConfidence(
        "No more than $10,000 but I need something",
      );
      expect(result3.value).toBeLessThanOrEqual(10000);
    });

    test("should reject debt amounts vs. fundraising goals", () => {
      // "I owe" is different from "I need to raise"
      const transcript =
        "I owe $25,000 in medical bills but I'm trying to raise $3,000 to make a payment";
      const result = extractGoalAmountWithConfidence(transcript);

      expect(result.value).toBe(3000); // Should get "trying to raise" context
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("should handle international currency formats", () => {
      // European format: 1.500,00 instead of 1,500.00
      const result1 = extractGoalAmountWithConfidence(
        "I need 5.000,50 euros converted to dollars",
      );
      // Should extract some amount even if format is unusual
      expect(result1.value).toBeGreaterThan(0);

      // British pounds
      const result2 = extractGoalAmountWithConfidence("I need £2,500 for help");
      expect(result2.value).toBe(2500);
    });
  });

  describe("Adversarial Relationship Extraction - Complex Beneficiary Scenarios", () => {
    test("should handle ambiguous pronouns correctly", () => {
      // "We" could mean family or organization
      const result1 = extractBeneficiaryRelationship(
        "We need help with medical bills",
      );
      expect(["myself", "family_member"]).toContain(result1);

      // Clear family context
      const result2 = extractBeneficiaryRelationship("My wife and I need help");
      expect(result2).toBe("family_member");
    });

    test("should handle third-party fundraising correctly", () => {
      // Fundraising for someone else
      expect(
        extractBeneficiaryRelationship("I'm raising money for my friend John"),
      ).toBe("other");
      expect(
        extractBeneficiaryRelationship(
          "This campaign is for my neighbor's family",
        ),
      ).toBe("other");
      expect(
        extractBeneficiaryRelationship("Helping out my community member"),
      ).toBe("other");
    });

    test("should handle mixed beneficiary contexts", () => {
      const transcript =
        "I need help for my son but also for myself since I'm the caregiver";
      const result = extractBeneficiaryRelationship(transcript);
      expect(["family_member", "myself"]).toContain(result);
    });

    test("should handle pet/animal fundraising", () => {
      const result = extractBeneficiaryRelationship(
        "My dog needs surgery and I can't afford it",
      );
      expect(result).toBe("other"); // Pet is not family_member in this context
    });
  });

  describe("Adversarial Urgency Detection - Manipulation vs. Real Emergency", () => {
    test("should detect SPAM/manipulation attempts", () => {
      // Over-the-top urgency spam
      const transcript1 =
        "URGENT URGENT CRITICAL EMERGENCY HELP NEEDED NOW IMMEDIATELY ASAP!!!";
      const result1 = extractUrgency(transcript1);
      // Should detect high urgency but confidence should reflect spam-like pattern
      expect(["HIGH", "CRITICAL"]).toContain(result1);

      // Manipulative language
      const transcript2 =
        "You MUST help me right now or terrible things will happen I need money IMMEDIATELY";
      const result2 = extractUrgency(transcript2);
      expect(["HIGH", "CRITICAL"]).toContain(result2);
    });

    test("should detect genuine vs manufactured urgency", () => {
      // Genuine urgency with details
      const genuine =
        "I have until Friday to pay rent or we'll be evicted and have nowhere to go";
      expect(["HIGH", "CRITICAL"]).toContain(extractUrgency(genuine));

      // Manufactured urgency without context
      const manufactured = "This is super urgent and critical please help now";
      const result = extractUrgency(manufactured);
      // Should be high but maybe not as confident
      expect(["MEDIUM", "HIGH", "CRITICAL"]).toContain(result);
    });

    test("should handle temporal urgency correctly", () => {
      expect(extractUrgency("I need help by tomorrow morning")).toBe(
        "CRITICAL",
      );
      expect(extractUrgency("I have until next month")).toBe("MEDIUM");
      expect(extractUrgency("Someday soon would be nice")).toBe("LOW");
      expect(extractUrgency("No rush but eventually I'll need help")).toBe(
        "LOW",
      );
    });
  });

  describe("Real-World Messy Transcripts - Speech Disfluencies", () => {
    test("should handle heavy filler words and false starts", () => {
      const messy =
        "Um, so like, my name is, uh, Sarah, or actually Sarah Johnson, and like, I mean, I need help with, you know, medical stuff and, uh, the bills are like, um, around $3,000 or maybe $3,500, I'm not totally sure but, yeah";

      const name = extractNameWithConfidence(messy);
      expect(name.value).toContain("Sarah");
      expect(name.value).toContain("Johnson");

      const amount = extractGoalAmountWithConfidence(messy);
      expect(amount.value).toBeGreaterThan(2500);
      expect(amount.value).toBeLessThan(4000);
    });

    test("should handle speech corrections and self-contradictions", () => {
      const corrections =
        "My name is John, I mean James, wait no it's John James Smith and I need $2,000, no actually $2,500, well somewhere around $2,200 would work";

      const name = extractNameWithConfidence(corrections);
      expect(name.value).toBeTruthy();
      expect(name.confidence).toBeGreaterThan(0);

      const amount = extractGoalAmountWithConfidence(corrections);
      expect(amount.value).toBeGreaterThan(2000);
      expect(amount.value).toBeLessThan(3000);
    });

    test("should handle run-on sentences without punctuation", () => {
      const runon =
        "hi my name is maria garcia and i live in austin texas and i really need help because i lost my job and i have three kids and we need about five thousand dollars for rent and food and bills and stuff and this is really urgent because we might get evicted soon and i dont know what to do";

      const results = extractAllWithTelemetry(runon);
      expect(results.results.name.value).toContain("maria");
      expect(results.results.amount.value).toBeGreaterThan(4000);
      expect(results.results.amount.value).toBeLessThan(6000);
    });

    test("should handle background noise descriptors and interruptions", () => {
      const noisy =
        "My name is *static* Sarah *cough* Johnson and I need *baby crying* help with *dog barking* medical bills of about *phone ringing* three thousand dollars";

      const name = extractNameWithConfidence(noisy);
      expect(name.value).toContain("Sarah");

      const amount = extractGoalAmountWithConfidence(noisy);
      expect(amount.value).toBe(3000);
    });
  });

  describe("Edge Case Scenarios - Boundary Testing", () => {
    test("should handle extremely long names correctly", () => {
      const longName =
        "My name is Wolfgang Amadeus Theophilus Mozart von der Himmelreich";
      const result = extractNameWithConfidence(longName);

      expect(result.value).toBeTruthy();
      expect(result.value.length).toBeLessThan(100); // Should truncate if needed
    });

    test("should handle extremely large amounts", () => {
      const huge = "I need $999,999,999 for my business";
      const result = extractGoalAmountWithConfidence(huge);

      expect(result.value).toBeLessThanOrEqual(100000); // Should cap at reasonable max
    });

    test("should handle extremely small amounts", () => {
      const tiny = "I need $1 to help with food";
      const result = extractGoalAmountWithConfidence(tiny);

      // Should either reject (null) or enforce minimum $50
      if (result.value !== null) {
        expect(result.value).toBeGreaterThanOrEqual(50);
      }
    });

    test("should handle transcripts with only numbers", () => {
      const numbers =
        "1234567890 5000 $3000 15 per hour 25 years old $12.50 an hour";
      const result = extractGoalAmountWithConfidence(numbers);

      // Should extract something or return null, but shouldn't crash
      expect(result).toBeDefined();
    });

    test("should handle transcripts with mixed languages", () => {
      const mixed =
        "My nombre is Maria García y necesito $2000 para medical bills";

      const name = extractNameWithConfidence(mixed);
      // Code-switching is challenging - may not extract perfectly
      if (name.value) {
        expect(name.value.toLowerCase()).toMatch(/maria/);
      }

      const amount = extractGoalAmountWithConfidence(mixed);
      expect(amount.value).toBe(2000); // Amount should still extract
    });

    test("should handle emoji and special unicode characters", () => {
      const emoji =
        "Hi! 😊 My name is Sarah 🌟 and I need $2,500 💰 for help! 🙏";

      const name = extractNameWithConfidence(emoji);
      expect(name.value).toContain("Sarah");

      const amount = extractGoalAmountWithConfidence(emoji);
      expect(amount.value).toBe(2500);
    });
  });

  describe("Contextual Ambiguity - Multiple Valid Interpretations", () => {
    test("should handle names that are also job titles", () => {
      // "I'm a baker" vs "I'm Baker"
      expect(extractName("I'm a baker and need help")).toBeUndefined();

      const result = extractNameWithConfidence("My name is Baker Johnson");
      expect(result.value).toBe("Baker Johnson");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    test("should handle amounts in hypothetical vs actual contexts", () => {
      const hypothetical =
        "If I had $10,000 I could solve this but I only need $1,500 right now";
      const result = extractGoalAmountWithConfidence(hypothetical);

      expect(result.value).toBe(1500); // Should get "need" context, not "if had"
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test("should handle past vs future vs present tense contexts", () => {
      const tenses =
        "I needed $5,000 last year, I need $2,000 now, and I will need $3,000 next year";
      const result = extractGoalAmountWithConfidence(tenses);

      expect(result.value).toBe(2000); // Present tense "need now" should win
    });
  });

  describe("Performance Under Stress - Complex Scenarios", () => {
    test("should handle deeply nested information", () => {
      const nested =
        "So my friend told me that her neighbor said that the doctor mentioned that I should tell you that my name is actually Sarah Johnson (not Sarah Williams like I said before) and that the amount I really need (after talking to the billing department and getting quotes from three different sources and calculating everything including fees) is somewhere between $4,500 and $5,500 but probably closer to $5,000 if I'm being honest";

      const name = extractNameWithConfidence(nested);
      expect(name.value).toContain("Sarah Johnson");

      const amount = extractGoalAmountWithConfidence(nested);
      expect(amount.value).toBeGreaterThan(4000);
      expect(amount.value).toBeLessThan(6000);
    });

    test("should handle contradictory information with confidence adjustment", () => {
      const contradictory =
        "My name is definitely not John Smith, it's actually Mike Johnson, well technically Michael Jonathan Johnson Jr. but everyone calls me Mike";

      const result = extractNameWithConfidence(contradictory);
      expect(result.value).toBeTruthy();
      // Confidence should be lower due to contradictions
      expect(result.confidence).toBeLessThan(0.9);
    });

    test("should maintain performance with very long, complex transcripts", () => {
      const longTranscript = `
        Hi there, this is a really long and detailed story about my situation. 
        My name is Jennifer Marie Thompson-Williams and I'm calling from Portland, Oregon. 
        I've been going through a really difficult time and I wanted to reach out for help. 
        To give you some background, I used to work at a tech company making $85,000 a year, 
        but three months ago the company went through layoffs and I was part of the reduction. 
        Since then, I've been applying to jobs every single day - I've sent out probably 200 applications - 
        but the market is really tough right now. I have two kids, ages 8 and 12, and they both need 
        new school supplies and my rent is $2,400 per month which I can barely afford anymore. 
        My car broke down last week and the repair estimate was $1,800 which I don't have. 
        I've been borrowing money from friends and family but I can't keep doing that. 
        I need to raise approximately $5,500 to cover my immediate expenses - that's three months 
        of rent at $2,400 per month which is $7,200 but I have some savings so I only need $5,500 
        to bridge the gap until I find a new job. This is really urgent because my landlord 
        said if I don't pay by the end of this week, they'll start the eviction process. 
        I'm desperate and I don't know what else to do. My email is jennifer.thompson@email.com 
        and my phone is 503-555-1234 if you need to reach me. Thank you so much for listening 
        to my story and I really appreciate any help you can provide.
      `.trim();

      const startTime = Date.now();
      const results = extractAllWithTelemetry(longTranscript);
      const endTime = Date.now();

      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(100); // <100ms

      // Should still extract correctly
      expect(results.results.name.value).toContain("Jennifer");
      expect(results.results.amount.value).toBeGreaterThan(5000);
      expect(results.results.amount.value).toBeLessThan(8000);
      expect(results.metrics.qualityScore).toBeGreaterThan(50);
    });
  });

  describe("Security and Injection Testing", () => {
    test("should handle potential ReDoS (Regular Expression Denial of Service) patterns", () => {
      // Patterns that could cause catastrophic backtracking
      const redos1 = "My name is " + "a".repeat(10000) + " and I need help";
      const redos2 = "$" + "1".repeat(10000) + " dollars";

      // Should not hang or crash
      const startTime1 = Date.now();
      const result1 = extractNameWithConfidence(redos1);
      const time1 = Date.now() - startTime1;
      expect(time1).toBeLessThan(1000); // Should complete in <1 second

      const startTime2 = Date.now();
      const result2 = extractGoalAmountWithConfidence(redos2);
      const time2 = Date.now() - startTime2;
      expect(time2).toBeLessThan(1000); // Should complete in <1 second
    });

    test("should handle SQL injection-like patterns", () => {
      const sqlInjection = "My name is'; DROP TABLE users; -- and I need $2000";

      const name = extractNameWithConfidence(sqlInjection);
      // Should handle gracefully - returning null is correct for malformed input
      if (name.value !== null) {
        expect(name.value).not.toContain("DROP");
        expect(name.value).not.toContain("TABLE");
      }
      expect(name.confidence).toBeLessThan(0.5); // Low confidence expected
    });

    test("should handle script injection attempts", () => {
      const xss =
        "My name is <script>alert('xss')</script> Sarah and I need $2000";

      const name = extractNameWithConfidence(xss);
      // Should not extract script tags - may return Sarah or null
      if (name.value !== null) {
        expect(name.value).not.toContain("<script>");
        expect(name.value).not.toContain("alert");
      }
      expect(name.confidence).toBeGreaterThanOrEqual(0); // Valid confidence
    });
  });

  describe("Statistical Confidence Validation", () => {
    test("should provide appropriate confidence scores for ambiguous cases", () => {
      // Clear case - should have high confidence
      const clear =
        "My name is John Smith and I need $5,000 for medical expenses";
      const clearResults = extractAllWithTelemetry(clear);
      expect(clearResults.results.name.confidence).toBeGreaterThan(0.8);
      expect(clearResults.results.amount.confidence).toBeGreaterThan(0.7);

      // Ambiguous case - should have lower confidence
      const ambiguous = "John maybe $5000 help medical";
      const ambiguousResults = extractAllWithTelemetry(ambiguous);
      if (ambiguousResults.results.name.value) {
        expect(ambiguousResults.results.name.confidence).toBeLessThan(0.7);
      }
      if (ambiguousResults.results.amount.value) {
        expect(ambiguousResults.results.amount.confidence).toBeLessThan(0.6);
      }
    });

    test("should never provide confidence scores outside valid range", () => {
      const testCases = [
        "My name is Sarah",
        "I need $1000",
        "",
        "asdfghjkl",
        "🎭🎪🎨",
        "My name is" + "X".repeat(1000),
      ];

      testCases.forEach((testCase) => {
        const name = extractNameWithConfidence(testCase);
        const amount = extractGoalAmountWithConfidence(testCase);

        expect(name.confidence).toBeGreaterThanOrEqual(0);
        expect(name.confidence).toBeLessThanOrEqual(1);
        expect(amount.confidence).toBeGreaterThanOrEqual(0);
        expect(amount.confidence).toBeLessThanOrEqual(1);
      });
    });
  });
});

/**
 * Extreme Performance Benchmarks - Stress Testing
 */
describe("Phase 4: Extreme Performance Stress Test", () => {
  test("should handle 10,000 rapid extractions without degradation", () => {
    const samples = [
      "My name is John Smith and I need $2,000",
      "Hi, I'm Sarah Johnson seeking $5,000 for medical",
      "I'm Mike Williams and need help with $3,500",
      "Jennifer Martinez here, need $1,800 urgently",
      "This is David Chen, looking for $4,200 assistance",
    ];

    const startTime = Date.now();

    for (let i = 0; i < 10000; i++) {
      const sample = samples[i % samples.length];
      extractNameWithConfidence(sample);
      extractGoalAmountWithConfidence(sample);
      extractBeneficiaryRelationship(sample);
      extractUrgency(sample);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const throughput = (10000 * 1000) / totalTime; // ops per second

    // Should complete 10k operations in under 3 seconds
    expect(totalTime).toBeLessThan(3000);
    expect(throughput).toBeGreaterThan(3000); // >3000 ops/sec

    console.log(
      `Extreme stress test: 10,000 extractions in ${totalTime}ms (${Math.round(throughput)} ops/sec)`,
    );
  });

  test("should handle concurrent processing simulation", () => {
    const longTranscripts = Array(100)
      .fill(null)
      .map(
        (_, i) =>
          `My name is Person${i} and I need $${1000 + i * 100} for help with various things that are important to me and my family`,
      );

    const startTime = Date.now();

    const results = longTranscripts.map((transcript) => {
      return extractAllWithTelemetry(transcript);
    });

    const endTime = Date.now();

    // Should process 100 transcripts in under 500ms
    expect(endTime - startTime).toBeLessThan(500);

    // All should have valid results
    results.forEach((result) => {
      expect(result.results).toBeDefined();
      expect(result.metrics.qualityScore).toBeGreaterThanOrEqual(0);
      expect(result.metrics.qualityScore).toBeLessThanOrEqual(100);
    });
  });
});
