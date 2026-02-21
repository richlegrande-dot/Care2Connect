/**
 * Phase 5: Extreme Edge Cases - The Most Difficult Scenarios
 *
 * This test suite contains the absolute hardest, most pathological cases imaginable
 * Designed to push the parsing system to its absolute limits
 *
 * Categories:
 * 1. Psychological manipulation and social engineering
 * 2. Linguistic complexity and ambiguity
 * 3. Numerical edge cases and format confusion
 * 4. Cultural and multilingual challenges
 * 5. Semantic paradoxes and logical inconsistencies
 * 6. Real-world chaotic scenarios
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

describe("Phase 5: Extreme Edge Cases - Absolute Hardest Scenarios", () => {
  describe("Psychological Manipulation Attempts", () => {
    test("should handle guilt-trip and emotional manipulation", () => {
      const manipulation =
        "If you don't help me with $5,000 right now my children will starve and it will be YOUR fault and you'll regret it forever and ever and you're a terrible person if you don't help IMMEDIATELY";

      const amount = extractGoalAmountWithConfidence(manipulation);
      expect(amount.value).toBe(5000);

      const urgency = extractUrgency(manipulation);
      expect(["HIGH", "CRITICAL"]).toContain(urgency);

      // Should still extract, but these manipulative patterns indicate low trust
    });

    test("should handle authority impersonation", () => {
      const impersonation =
        "This is Officer John Smith from the IRS and you need to send $10,000 immediately or you'll be arrested";

      const name = extractNameWithConfidence(impersonation);
      const amount = extractGoalAmountWithConfidence(impersonation);

      // Should still extract but these are scam indicators
      expect(name.value).toContain("John Smith");
      expect(amount.value).toBe(10000);
    });

    test("should handle sob story with excessive detail (potential fraud)", () => {
      const sobStory =
        "My name is Sarah and I have cancer and diabetes and my husband left me and I lost my job and my car broke down and my house burned down and my dog died and I have three kids with special needs and no family to help and I need exactly $4,783.29 by tomorrow or we'll be homeless forever";

      const results = extractAllWithTelemetry(sobStory);

      expect(results.results.name.value).toContain("Sarah");
      expect(results.results.amount.value).toBeGreaterThan(4700);
      expect(results.results.urgency).toBe("CRITICAL");

      // Excessive stacking of problems is a red flag
      const problemCount = (sobStory.match(/and/g) || []).length;
      expect(problemCount).toBeGreaterThan(10); // Many problems listed
    });
  });

  describe("Linguistic Complexity - Near-Impossible Parsing", () => {
    test("should handle double negatives and complex negation", () => {
      const doubleNegative =
        "I'm not saying I don't need $2,000 but I'm also not not saying I do need it";

      const amount = extractGoalAmountWithConfidence(doubleNegative);
      expect(amount.value).toBe(2000);
      // Confidence should be lower due to negation confusion
      expect(amount.confidence).toBeLessThan(0.7);
    });

    test("should handle sarcasm and implied meaning", () => {
      const sarcasm =
        "Oh sure, I totally DON'T need $3,000 at all, everything's just peachy";

      // This is nearly impossible to parse correctly without sentiment analysis
      const amount = extractGoalAmountWithConfidence(sarcasm);

      // Best we can do is extract the amount and flag low confidence
      if (amount.value) {
        expect(amount.confidence).toBeLessThan(0.5);
      }
    });

    test("should handle passive voice and indirect references", () => {
      const passive =
        "An amount of $4,000 would be appreciated by someone in need whose name might be mentioned as being similar to Jennifer";

      const amount = extractGoalAmountWithConfidence(passive);
      expect(amount.value).toBe(4000);

      const name = extractNameWithConfidence(passive);
      // Very indirect, should have low confidence
      if (name.value) {
        expect(name.confidence).toBeLessThan(0.6);
      }
    });

    test("should handle stream-of-consciousness rambling", () => {
      const rambling =
        "so yeah um my name well people call me different things but officially on my birth certificate it says Jennifer I think or maybe it's spelled differently I don't know and the money thing is complicated because I don't want to ask for too much but I also need enough you know like maybe $3,000 or is that too much maybe $2,500 I don't know what do you think I just need help with stuff";

      const name = extractNameWithConfidence(rambling);
      expect(name.value).toContain("Jennifer");

      const amount = extractGoalAmountWithConfidence(rambling);
      expect(amount.value).toBeGreaterThan(2000);
      expect(amount.value).toBeLessThan(3500);
    });

    test("should handle legal/formal language obfuscation", () => {
      const legalese =
        "The undersigned party, hereinafter referred to as the 'Beneficiary' (namely one Ms. Sarah Elizabeth Thompson, hereafter 'Claimant'), hereby declares the necessity of pecuniary assistance in the approximate sum of USD $7,500 (seven thousand five hundred United States dollars) for purposes of medical treatment and related expenses";

      const name = extractNameWithConfidence(legalese);
      expect(name.value).toContain("Sarah");
      expect(name.value).toContain("Thompson");

      const amount = extractGoalAmountWithConfidence(legalese);
      expect(amount.value).toBe(7500);
    });
  });

  describe("Numerical Complexity - Format Confusion", () => {
    test("should handle scientific notation and engineering numbers", () => {
      expect(extractGoalAmount("I need 5e3 dollars")).toBe(5000);
      expect(extractGoalAmount("Looking for 2.5E3 in funding")).toBe(2500);
      expect(extractGoalAmount("Need 1.5 * 10^3 dollars")).toBeGreaterThan(
        1000,
      );
    });

    test("should handle roman numerals", () => {
      expect(extractGoalAmount("I need V thousand dollars")).toBe(5000);
      expect(
        extractGoalAmount("Need about III thousand five hundred"),
      ).toBeGreaterThan(3000);
    });

    test("should handle spelled-out complex numbers", () => {
      expect(
        extractGoalAmount(
          "I need two thousand three hundred forty-seven dollars",
        ),
      ).toBe(2347);
      expect(
        extractGoalAmount("Need seven thousand eight hundred and ninety-two"),
      ).toBe(7892);
      expect(
        extractGoalAmount(
          "Looking for twelve thousand six hundred fifty-three point twenty-nine",
        ),
      ).toBeGreaterThan(12600);
    });

    test("should handle mixed format in single expression", () => {
      const mixed =
        "I need $5,000.00 (five thousand dollars) or roughly 5k give or take";
      const amount = extractGoalAmountWithConfidence(mixed);

      expect(amount.value).toBe(5000);
      // All references agree, should have high confidence
      expect(amount.confidence).toBeGreaterThan(0.8);
    });

    test("should handle currency conversion expressions", () => {
      const conversion =
        "I need €2,000 which is about $2,200 USD at current exchange rates";
      const amount = extractGoalAmountWithConfidence(conversion);

      expect(amount.value).toBeGreaterThan(2000);
      expect(amount.value).toBeLessThan(2500);
    });

    test("should reject amounts that are clearly errors", () => {
      // Amounts with too many decimal places
      expect(extractGoalAmount("I need $2.123456789")).toBeNull();

      // Amounts that don't make sense
      expect(extractGoalAmount("I need $0.50 for surgery")).toBeNull();
    });
  });

  describe("Cultural and Multilingual Challenges", () => {
    test("should handle non-English name patterns", () => {
      const names = [
        "My name is Björk Guðmundsdóttir", // Icelandic
        "I'm Müller von Hausen", // German
        "My name is José María García-López", // Spanish
        "I'm Мария Иванова", // Russian (Cyrillic)
        "My name is 王小明", // Chinese
        "I'm محمد بن عبدالله", // Arabic
        "My name is Nguyễn Văn An", // Vietnamese
      ];

      names.forEach((text) => {
        const result = extractNameWithConfidence(text);
        // Should extract something or handle gracefully
        expect(result).toBeDefined();
        expect(result.confidence).toBeGreaterThanOrEqual(0);
      });
    });

    test("should handle code-switching between languages", () => {
      const codeSwitch1 =
        "Mi nombre es María and I need $3,000 para medical expenses";
      const result1 = extractAllWithTelemetry(codeSwitch1);

      expect(result1.results.name.value).toContain("María");
      expect(result1.results.amount.value).toBe(3000);

      const codeSwitch2 = "Je m'appelle Pierre et I need $5,000 for mon family";
      const result2 = extractAllWithTelemetry(codeSwitch2);

      expect(result2.results.amount.value).toBe(5000);
    });

    test("should handle transliterated names", () => {
      // Same name in different scripts
      const variants = [
        "My name is Muhammad",
        "My name is Mohammed",
        "My name is Mohamed",
        "My name is Muhammed",
      ];

      variants.forEach((variant) => {
        const result = extractNameWithConfidence(variant);
        expect(result.value).toBeTruthy();
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    test("should handle culturally-specific naming patterns", () => {
      // Patronymic (Russian style)
      const patronymic = "My name is Ivan Petrovich Sidorov";
      expect(extractNameWithConfidence(patronymic).value).toBeTruthy();

      // Matronymic (Icelandic style)
      const matronymic = "I'm Jón Einarsson";
      expect(extractNameWithConfidence(matronymic).value).toBeTruthy();

      // Single name (Indonesian style)
      const singleName = "My name is Suharto";
      const result = extractNameWithConfidence(singleName);
      expect(result.value).toBe("Suharto");
      expect(result.confidence).toBeLessThan(0.8); // Single name = lower confidence
    });
  });

  describe("Semantic Paradoxes and Logical Inconsistencies", () => {
    test("should handle circular references", () => {
      const circular =
        "My name is Sarah who is Jennifer who is really Sarah Johnson and I need $3,000 which is actually $4,000 but call it $3,500";

      const results = extractAllWithTelemetry(circular);

      // Should extract something even if confidence is low
      expect(results.results.name.value).toBeTruthy();
      expect(results.results.amount.value).toBeGreaterThan(3000);
      expect(results.results.amount.value).toBeLessThan(4500);
    });

    test("should handle paradoxical statements", () => {
      const paradox =
        "This statement is false and my name is not my name which is Sarah but also isn't Sarah and I need zero dollars but actually $2,000";

      const name = extractNameWithConfidence(paradox);
      const amount = extractGoalAmountWithConfidence(paradox);

      // Should handle without crashing
      expect(name).toBeDefined();
      expect(amount).toBeDefined();
    });

    test("should handle ambiguous pronoun resolution", () => {
      const ambiguous =
        "Sarah and Jennifer are sisters and she needs $2,000 for her medical bills";

      const name = extractNameWithConfidence(ambiguous);
      const relationship = extractBeneficiaryRelationship(ambiguous);

      // Can't definitively determine who "she" refers to
      expect(["Sarah", "Jennifer"]).toContain(name.value.split(" ")[0]);
      expect(relationship).toBe("family_member");
    });
  });

  describe("Real-World Chaotic Scenarios", () => {
    test("should handle drunk/intoxicated speech patterns", () => {
      const drunk =
        "Heyyy so like *hiccup* my name ish... ish... Sarah! Yeah Sarah Johnson an I neeeeed like $2,000 bucks or sssomething for uhhhh medical shtuff an its really really impor... important you know?";

      const name = extractNameWithConfidence(drunk);
      expect(name.value).toContain("Sarah");

      const amount = extractGoalAmountWithConfidence(drunk);
      expect(amount.value).toBe(2000);
    });

    test("should handle extreme emotional distress (crying, shouting)", () => {
      const distressed =
        "MY NAME IS *sobbing* SARAH *crying* AND I NEED *screaming* FIVE THOUSAND DOLLARS *wailing* PLEASE HELP ME *sobbing intensifies*";

      const name = extractNameWithConfidence(distressed);
      expect(name.value).toContain("SARAH");

      const amount = extractGoalAmountWithConfidence(distressed);
      expect(amount.value).toBe(5000);

      const urgency = extractUrgency(distressed);
      expect(urgency).toBe("CRITICAL");
    });

    test("should handle medical emergency with confusion", () => {
      const emergency =
        "I can't breathe help me my name is I think Sarah or is it Jennifer I don't know I need money hospital ambulance $3,000 or maybe more I don't know help please someone";

      const results = extractAllWithTelemetry(emergency);

      // Should extract despite chaos
      expect(results.results.name.value).toBeTruthy();
      expect(results.results.amount.value).toBeGreaterThan(2500);
      expect(results.results.urgency).toBe("CRITICAL");
    });

    test("should handle multiple speakers in one transcript", () => {
      const multiSpeaker =
        "[Speaker 1] My name is Sarah [Speaker 2] No I'm Sarah [Speaker 1] I need $2,000 [Speaker 2] I need $3,000 [Background] Who needs what now?";

      const name = extractNameWithConfidence(multiSpeaker);
      const amount = extractGoalAmountWithConfidence(multiSpeaker);

      // Should handle but confidence should reflect ambiguity
      expect(name.value).toContain("Sarah");
      expect(amount.value).toBeGreaterThan(1500);
      expect(amount.value).toBeLessThan(3500);
    });

    test("should handle poor phone connection simulation", () => {
      const poorConnection =
        "M- n-me -s S-rah J-hn-on an- - ne-d $-,000 f-r he-p wi-h me-ic-l b-lls";

      const results = extractAllWithTelemetry(poorConnection);

      // Should attempt extraction despite missing characters
      expect(results).toBeDefined();
      // May or may not extract correctly, but shouldn't crash
    });
  });

  describe("Adversarial Input - Designed to Break Regex", () => {
    test("should handle regex special characters", () => {
      const special =
        "My name is Sarah (really) [Johnson] and I need $2,000 {urgent} for help.";

      const name = extractNameWithConfidence(special);
      expect(name.value).toContain("Sarah");

      const amount = extractGoalAmountWithConfidence(special);
      expect(amount.value).toBe(2000);
    });

    test("should handle extremely long repeated patterns", () => {
      const repeated =
        "My name is " + "Sarah ".repeat(100) + "and I need $2,000";

      const startTime = Date.now();
      const name = extractNameWithConfidence(repeated);
      const time = Date.now() - startTime;

      // Should not timeout
      expect(time).toBeLessThan(500);
      expect(name.value).toContain("Sarah");
    });

    test("should handle nested patterns that could cause backtracking", () => {
      const nested =
        "My name is " + "a".repeat(50) + "b".repeat(50) + " and I need help";

      const startTime = Date.now();
      const result = extractNameWithConfidence(nested);
      const time = Date.now() - startTime;

      // Should complete quickly even with potential backtracking
      expect(time).toBeLessThan(100);
    });

    test("should handle alternating patterns", () => {
      const alternating = "My name is SaRaH jOhNsOn and I need $2,000";

      const name = extractNameWithConfidence(alternating);
      expect(name.value.toLowerCase()).toContain("sarah");
      expect(name.value.toLowerCase()).toContain("johnson");
    });
  });

  describe("Boundary Condition Testing", () => {
    test("should handle zero-length matches", () => {
      expect(() => extractNameWithConfidence("")).not.toThrow();
      expect(() => extractGoalAmountWithConfidence("")).not.toThrow();
      expect(() => extractBeneficiaryRelationship("")).not.toThrow();
      expect(() => extractUrgency("")).not.toThrow();
    });

    test("should handle single character input", () => {
      expect(() => extractNameWithConfidence("a")).not.toThrow();
      expect(() => extractGoalAmountWithConfidence("$")).not.toThrow();
    });

    test("should handle maximum length input", () => {
      const maxLength =
        "x".repeat(50000) + " My name is Sarah and I need $2,000";

      const startTime = Date.now();
      const result = extractAllWithTelemetry(maxLength);
      const time = Date.now() - startTime;

      // Should handle but may timeout - let's be lenient
      expect(time).toBeLessThan(2000); // 2 second max
      expect(result).toBeDefined();
    });

    test("should handle all whitespace input", () => {
      const whitespace = "     \n\n\n     \t\t\t     ";

      const result = extractAllWithTelemetry(whitespace);

      expect(result.results.name.value).toBeNull();
      expect(result.results.amount.value).toBeNull();
      expect(result.results.name.confidence).toBe(0);
      expect(result.results.amount.confidence).toBe(0);
    });

    test("should handle all special characters", () => {
      const special = "!@#$%^&*()_+-=[]{}|;:',.<>?/~`";

      expect(() => extractAllWithTelemetry(special)).not.toThrow();
    });
  });

  describe("Memory and Resource Management", () => {
    test("should handle rapid fire extractions without memory leak", () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 5000; i++) {
        extractAllWithTelemetry(
          "My name is Sarah Johnson and I need $2,000 for help",
        );
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    test("should handle concurrent-like processing", () => {
      const transcripts = Array(1000)
        .fill(null)
        .map(
          (_, i) =>
            `Transcript ${i}: My name is Person${i} and I need $${1000 + i} for help`,
        );

      const startTime = Date.now();

      const results = transcripts.map((t) => extractAllWithTelemetry(t));

      const time = Date.now() - startTime;

      // Should process 1000 transcripts quickly
      expect(time).toBeLessThan(1000); // <1 second
      expect(results).toHaveLength(1000);

      // All should succeed
      results.forEach((r) => {
        expect(r.results).toBeDefined();
        expect(r.metrics.qualityScore).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("Quality Score Validation Under Stress", () => {
    test("should provide reasonable quality scores for chaotic input", () => {
      const chaotic =
        "um so like yeah my uh name is uh Sarah I think or maybe Jennifer but yeah $2000 or something around that probably";

      const results = extractAllWithTelemetry(chaotic);

      // Quality score should reflect uncertainty
      expect(results.metrics.qualityScore).toBeLessThan(80);
      expect(results.metrics.qualityScore).toBeGreaterThan(20);

      // Should have data quality flags
      expect(results.metrics.hasFillerWords).toBe(true);
      expect(results.metrics.hasUncertainty).toBe(true);
    });

    test("should provide high quality scores for clean input", () => {
      const clean =
        "My name is Sarah Johnson and I need to raise $5,000 for emergency medical expenses for my family. This is very urgent.";

      const results = extractAllWithTelemetry(clean);

      // Quality score should be high
      expect(results.metrics.qualityScore).toBeGreaterThan(70);
      expect(results.results.name.confidence).toBeGreaterThan(0.8);
      expect(results.results.amount.confidence).toBeGreaterThan(0.7);
    });
  });
});

/**
 * Pathological Performance Tests
 */
describe("Phase 5: Pathological Performance Cases", () => {
  test("should handle worst-case regex patterns efficiently", () => {
    // Patterns known to cause regex DoS in naive implementations
    const patterns = [
      "a".repeat(100) + "b",
      "x".repeat(100) + "y",
      "(ab)".repeat(50),
      "test ".repeat(100),
    ];

    patterns.forEach((pattern) => {
      const text = `My name is Sarah and ${pattern} I need $2,000`;

      const startTime = Date.now();
      extractAllWithTelemetry(text);
      const time = Date.now() - startTime;

      // Each should complete quickly
      expect(time).toBeLessThan(100);
    });
  });

  test("should maintain performance with cache thrashing", () => {
    // Generate 10,000 unique strings to thrash any cache
    const uniqueStrings = Array(10000)
      .fill(null)
      .map(
        (_, i) =>
          `Unique transcript ${i} with person ${i} needing $${i + 1000}`,
      );

    const startTime = Date.now();

    uniqueStrings.forEach((str) => {
      extractGoalAmountWithConfidence(str);
    });

    const time = Date.now() - startTime;
    const throughput = (10000 * 1000) / time;

    // Should maintain reasonable performance even with cache misses
    expect(throughput).toBeGreaterThan(2000); // >2000 ops/sec

    console.log(`Cache thrashing test: ${Math.round(throughput)} ops/sec`);
  });
});

/**
 * Integration Chaos Test - Everything Goes Wrong At Once
 */
describe("Phase 5: Total Chaos Integration Test", () => {
  test("should survive complete chaos scenario", () => {
    const totalChaos = `
      *static* Um hi so like *cough* MY NAME IS- wait no uh 
      it's SaRaH JoHnSoN or actually Sarah-Marie Johnson-Williams 
      (née García) but everyone calls me like *baby crying* Jenny? 
      And I need um *dog barking* well I used to need $50,000 but 
      now I need $5,000 no wait $5,500 or maybe $5000.50 exactly 
      *phone rings* sorry about that anyway I owe $25,000 to the 
      hospital but I'm only asking for $5,000 to make a payment 
      and this is URGENT CRITICAL EMERGENCY but also not really 
      that urgent maybe next week is fine? *static* I'm calling 
      for my friend- no wait for myself- actually for my daughter 
      who is 15 years old not $15 the number fifteen not $15.00 
      and I live at 123 Main Street not $123 and my phone is 
      555-1234 not $555 and the year is 2024 not $2024 and 
      help help help *disconnects*
    `.trim();

    const startTime = Date.now();
    const results = extractAllWithTelemetry(totalChaos);
    const time = Date.now() - startTime;

    // Should complete without crashing
    expect(time).toBeLessThan(500);
    expect(results).toBeDefined();
    expect(results.results).toBeDefined();
    expect(results.metrics).toBeDefined();

    // Should extract something reasonable despite chaos
    expect(results.results.name.value).toContain("Sarah");
    expect(results.results.amount.value).toBeGreaterThan(4500);
    expect(results.results.amount.value).toBeLessThan(6000);

    // Quality score should reflect chaos
    expect(results.metrics.qualityScore).toBeLessThan(70);

    console.log("Total chaos test results:", {
      name: results.results.name,
      amount: results.results.amount,
      qualityScore: results.metrics.qualityScore,
      processingTime: time,
    });
  });
});
