// V1 Zero-OpenAI Mode - Automated QA Test Suite
// Run with: npm run test:qa:v1

import dotenv from "dotenv";
import path from "path";
import * as fs from "fs";

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });

import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { getAIProvider } from "../providers/ai";
import { getTranscriptionProvider } from "../providers/transcription";

const RUN = process.env.RUN_LEGACY_INTEGRATION === "true";
(RUN ? describe : describe.skip)("V1 Zero-OpenAI QA Suite", () => {
  let fixturesPath: string;
  let testTranscripts: any[];

  beforeAll(() => {
    // Load test fixtures - use process.cwd() for reliable path resolution
    fixturesPath = path.join(process.cwd(), "fixtures");

    // Verify environment configured for V1 mode
    expect(process.env.AI_PROVIDER).toMatch(/rules|none|template/);
    expect(process.env.TRANSCRIPTION_PROVIDER).toMatch(/assemblyai|stub/);
  });

  describe("TC-101: Name Extraction Accuracy", () => {
    it("should achieve ≥92% accuracy on name extraction", async () => {
      // Use require for reliable fixture loading in Jest
      const testSet = require("../../fixtures/name-extraction-test-set.json");

      const aiProvider = getAIProvider();
      let correct = 0;
      let total = 0;

      for (const testCase of testSet) {
        const result = await aiProvider.extractProfileData(testCase.transcript);
        total++;

        if (
          result.name?.toLowerCase() === testCase.expectedName.toLowerCase()
        ) {
          correct++;
        }
      }

      const accuracy = (correct / total) * 100;
      console.log(
        `Name Extraction Accuracy: ${accuracy.toFixed(2)}% (${correct}/${total})`,
      );

      expect(accuracy).toBeGreaterThanOrEqual(92);
    });
  });

  describe("TC-102: Age Extraction Accuracy", () => {
    it("should achieve ≥88% accuracy on age extraction", async () => {
      // Use require for reliable fixture loading in Jest
      const testSet = require("../../fixtures/age-extraction-test-set.json");

      const aiProvider = getAIProvider();
      let correct = 0;
      let total = 0;

      for (const testCase of testSet) {
        const result = await aiProvider.extractProfileData(testCase.transcript);
        total++;

        if (result.age === testCase.expectedAge) {
          correct++;
        }
      }

      const accuracy = (correct / total) * 100;
      console.log(
        `Age Extraction Accuracy: ${accuracy.toFixed(2)}% (${correct}/${total})`,
      );

      expect(accuracy).toBeGreaterThanOrEqual(88);
    });
  });

  describe("TC-104: Needs Classification Accuracy", () => {
    it("should achieve ≥85% accuracy on needs classification", async () => {
      // Use require for reliable fixture loading in Jest
      const testSet = require("../../fixtures/needs-classification-test-set.json");

      const aiProvider = getAIProvider();
      let correct = 0;
      let total = 0;

      for (const testCase of testSet) {
        const result = await aiProvider.extractProfileData(testCase.transcript);
        total++;

        // Match if ANY extracted need matches ground truth
        const hasMatch = result.urgentNeeds?.some((need: string) =>
          testCase.expectedNeeds.includes(need),
        );

        if (hasMatch) {
          correct++;
        }
      }

      const accuracy = (correct / total) * 100;
      console.log(
        `Needs Classification Accuracy: ${accuracy.toFixed(2)}% (${correct}/${total})`,
      );

      expect(accuracy).toBeGreaterThanOrEqual(85);
    });
  });

  describe("TC-201: Profile Extraction Latency", () => {
    it("should complete profile extraction in <100ms average", async () => {
      const testTranscript = `Hi, my name is John Smith and I'm 42 years old. 
        I live in San Francisco, California. I'm a skilled carpenter with 15 years 
        of experience, but I lost my job 6 months ago when my company downsized. 
        I need help with housing and job placement. My phone is 415-555-1234.`;

      const aiProvider = getAIProvider();
      const latencies: number[] = [];

      // Run 10 extractions
      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        await aiProvider.extractProfileData(testTranscript);
        const latency = Date.now() - start;
        latencies.push(latency);
      }

      const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const p50 = latencies.sort((a, b) => a - b)[
        Math.floor(latencies.length / 2)
      ];
      const p95 = latencies[Math.floor(latencies.length * 0.95)];

      console.log(
        `Profile Extraction Latency: avg=${avg.toFixed(0)}ms, p50=${p50}ms, p95=${p95}ms`,
      );

      expect(avg).toBeLessThan(100);
      expect(p95).toBeLessThan(200);
    });
  });

  describe("TC-202: Story Generation Latency", () => {
    it("should complete story generation in <50ms average", async () => {
      const profileData = {
        name: "John Smith",
        age: 42,
        primaryNeed: "HOUSING",
        skills: ["carpentry", "construction"],
        goalAmount: 5000,
      };

      const aiProvider = getAIProvider();
      const latencies: number[] = [];

      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        await aiProvider.generateGoFundMeDraft({ formData: profileData });
        const latency = Date.now() - start;
        latencies.push(latency);
      }

      const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const p50 = latencies.sort((a, b) => a - b)[
        Math.floor(latencies.length / 2)
      ];

      console.log(
        `Story Generation Latency: avg=${avg.toFixed(0)}ms, p50=${p50}ms`,
      );

      expect(avg).toBeLessThan(50);
      expect(p50).toBeLessThan(100);
    });
  });

  describe("TC-401: Zero OpenAI API Calls", () => {
    it("should use rules provider, not OpenAI", () => {
      const aiProvider = getAIProvider();

      // Verify provider name is NOT 'openai'
      expect(aiProvider.name).not.toBe("openai");
      expect(aiProvider.name.toLowerCase()).toMatch(/rules|none|template/);
    });

    it("should use AssemblyAI or stub for transcription, not OpenAI", () => {
      // Skip if AssemblyAI key not configured
      if (!process.env.ASSEMBLYAI_API_KEY) {
        console.log(
          "Skipping transcription provider test - no API key configured",
        );
        return;
      }
      const transcriptionProvider = getTranscriptionProvider();

      expect(transcriptionProvider.name).not.toBe("openai");
      expect(transcriptionProvider.name).toMatch(/assemblyai|stub/i);
    });
  });

  describe("TC-402: Graceful Degradation", () => {
    it("should return minimal data instead of throwing when extraction fails", async () => {
      const emptyTranscript = "..."; // Nearly empty transcript

      const aiProvider = getAIProvider();
      const result = await aiProvider.extractProfileData(emptyTranscript);

      // Should not throw, should return object with null/empty fields
      expect(result).toBeDefined();
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("age");
      // Values may be null, but structure exists
    });
  });

  describe("TC-001: Profile Creation Integration", () => {
    it("should complete full profile creation flow", async () => {
      const testTranscript = `My name is Sarah Mitchell and I'm 34 years old. 
        I live in Austin, Texas. I'm a single mother of two kids, ages 7 and 9. 
        I lost my job as a retail manager three months ago. I need help with rent, 
        we're about to be evicted. I'm good at customer service. My phone is 512-555-1234.`;

      const aiProvider = getAIProvider();
      const start = Date.now();

      // Extract profile data
      const profileData = await aiProvider.extractProfileData(testTranscript);

      // Generate donation pitch
      const donationPitch = await aiProvider.generateDonationPitch(profileData);

      const totalTime = Date.now() - start;

      // Assertions
      expect(profileData.name).toBe("Sarah Mitchell");
      expect(profileData.age).toBe(34);
      expect(profileData.location).toContain("Austin");
      expect(profileData.urgentNeeds).toContain("HOUSING");
      // Phone can be in various formats - check for digits only
      expect(profileData.phone?.replace(/\D/g, "")).toBe("5125551234");
      expect(donationPitch).toBeTruthy();
      expect(donationPitch.length).toBeGreaterThan(50);
      expect(totalTime).toBeLessThan(2000); // <2 seconds total
    });
  });

  describe("TC-003: GoFundMe Draft Generation", () => {
    it("should generate complete GoFundMe draft from form data", async () => {
      const formData = {
        name: "Sarah Mitchell",
        primaryNeed: "HOUSING",
        description: "Single mother facing eviction, needs rent assistance",
        goalAmount: 3500,
      };

      const aiProvider = getAIProvider();
      const draft = await aiProvider.generateGoFundMeDraft({ formData });

      // Assertions
      expect(draft.title).toBeTruthy();
      expect(draft.title).toContain("Sarah Mitchell");
      expect(draft.story).toBeTruthy();
      expect(draft.story.length).toBeGreaterThan(200); // Minimum story length
      expect(draft.goalAmount).toBe(3500);
      expect(draft.category).toMatch(/housing/i);

      // Verify no placeholder text if form complete
      expect(draft.story).not.toContain("[Please add details]");
      expect(draft.story).not.toContain("[Add information]");
    });
  });
});

// Export test utilities for manual testing
export function runManualTests() {
  console.log("Running V1 Zero-OpenAI Manual QA Tests...\n");

  console.log("✅ Environment Check:");
  console.log(`   AI_PROVIDER: ${process.env.AI_PROVIDER}`);
  console.log(
    `   TRANSCRIPTION_PROVIDER: ${process.env.TRANSCRIPTION_PROVIDER}`,
  );
  console.log(
    `   ENABLE_STRESS_TEST_MODE: ${process.env.ENABLE_STRESS_TEST_MODE}\n`,
  );

  const aiProvider = getAIProvider();
  console.log(`✅ AI Provider Loaded: ${aiProvider.name}\n`);

  const transcriptionProvider = getTranscriptionProvider();
  console.log(
    `✅ Transcription Provider Loaded: ${transcriptionProvider.name}\n`,
  );

  console.log("Run automated tests with: npm test");
  console.log("Run stress tests with: .\\scripts\\stress-test-v1.ps1\n");
}
