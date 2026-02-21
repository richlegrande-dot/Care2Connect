import { extractGoalAmountWithConfidence } from "../../../src/utils/extraction/rulesEngine";

// Temporary debugging by monkey-patching the function
const originalExtract = extractGoalAmountWithConfidence;

function debugExtract(transcript: string) {
  console.log(`\n=== DEBUGGING: "${transcript}" ===`);

  // Call original and return result
  const result = originalExtract(transcript);
  console.log(`Final result: ${JSON.stringify(result)}`);
  return result;
}

describe("Debug processing logic", () => {
  test("Debug scientific notation processing", () => {
    const result = debugExtract("I need 5e3 dollars");
    expect(result.value).toBe(5000);
  });

  test("Debug Roman numeral processing", () => {
    const result = debugExtract("I need V thousand dollars");
    expect(result.value).toBe(5000);
  });
});
