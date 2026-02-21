import {
  extractGoalAmountWithConfidence,
  EXTRACTION_PATTERNS,
} from "../../../src/utils/extraction/rulesEngine";

describe("Debug amount extraction", () => {
  test("Debug scientific notation", () => {
    const transcript = "I need 5e3 dollars";
    console.log("Transcript:", transcript);

    // Test each pattern individually
    EXTRACTION_PATTERNS.goalAmount.forEach((pattern, index) => {
      const match = transcript.match(pattern);
      console.log(`Pattern ${index}: ${pattern.source}`);
      if (match) {
        console.log(
          `  Match: [${match[0]}] -> captured: [${match[1] || "undefined"}], [${match[2] || "undefined"}]`,
        );
      } else {
        console.log(`  No match`);
      }
    });

    const result = extractGoalAmountWithConfidence(transcript);
    console.log("Final result:", result);
  });

  test("Debug Roman numerals", () => {
    const transcript = "I need V thousand dollars";
    console.log("Transcript:", transcript);

    // Test each pattern individually
    EXTRACTION_PATTERNS.goalAmount.forEach((pattern, index) => {
      const match = transcript.match(pattern);
      console.log(`Pattern ${index}: ${pattern.source}`);
      if (match) {
        console.log(
          `  Match: [${match[0]}] -> captured: [${match[1] || "undefined"}], [${match[2] || "undefined"}]`,
        );
      } else {
        console.log(`  No match`);
      }
    });

    const result = extractGoalAmountWithConfidence(transcript);
    console.log("Final result:", result);
  });
});
