import {
  extractNameWithConfidence,
  EXTRACTION_PATTERNS,
} from "../../../src/utils/extraction/rulesEngine";

describe("Debug name extraction", () => {
  test('Debug "My name is Hope and I need help"', () => {
    const transcript = "My name is Hope and I need help";
    console.log("Transcript:", transcript);

    // Test each pattern individually
    EXTRACTION_PATTERNS.name.forEach((pattern, index) => {
      const match = transcript.match(pattern);
      console.log(`Pattern ${index}: ${pattern.source}`);
      if (match) {
        console.log(
          `  Match: [${match[0]}] -> captured: [${match[1] || "undefined"}]`,
        );
      } else {
        console.log(`  No match`);
      }
    });

    const result = extractNameWithConfidence(transcript);
    console.log("Final result:", result);
  });

  test('Debug "My name is Dr. Sarah Thompson MD"', () => {
    const transcript = "My name is Dr. Sarah Thompson MD";
    console.log("Transcript:", transcript);

    // Test each pattern individually
    EXTRACTION_PATTERNS.name.forEach((pattern, index) => {
      const match = transcript.match(pattern);
      console.log(`Pattern ${index}: ${pattern.source}`);
      if (match) {
        console.log(
          `  Match: [${match[0]}] -> captured: [${match[1] || "undefined"}]`,
        );
      } else {
        console.log(`  No match`);
      }
    });

    const result = extractNameWithConfidence(transcript);
    console.log("Final result:", result);
  });
});
