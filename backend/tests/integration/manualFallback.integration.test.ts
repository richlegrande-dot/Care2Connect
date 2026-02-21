/**
 * Manual Fallback Flow - Comprehensive Integration Test
 *
 * Tests the complete end-to-end flow:
 * 1. Recording → Transcription → Pipeline Failure
 * 2. Automatic Fallback Trigger
 * 3. Manual Draft Creation
 * 4. QR Code Generation from Manual Draft
 * 5. Stripe Payment Processing
 * 6. Incident Logging & Analytics
 */

import request from "supertest";
import express from "express";
import {
  orchestrateDonationPipeline,
  processDonationFromRecording,
} from "../../src/services/donationPipelineOrchestrator";
import { createPipelineFailure } from "../../src/services/pipelineFailureHandler";
import { generateQRFromManualDraft } from "../../src/services/qrCodeGeneratorEnhanced";
import { prisma } from "../../src/utils/database";
import Stripe from "stripe";

// Import routes for API testing
import manualDraftRoutes from "../../src/routes/manualDraft";
import * as extractSignals from "../../src/services/speechIntelligence/transcriptSignalExtractor";
import { getHealthStatus } from "../../src/utils/healthCheck";

// Mock external dependencies
jest.mock("../../src/services/speechIntelligence/transcriptSignalExtractor");
jest.mock("../../src/utils/healthCheck");
jest.mock("stripe");

const mockedExtractSignals = extractSignals as jest.Mocked<
  typeof extractSignals
>;
const mockedGetHealthStatus = getHealthStatus as jest.MockedFunction<
  typeof getHealthStatus
>;

// Setup Express app for API testing
const app = express();
app.use(express.json());
app.use("/api/donations", manualDraftRoutes);

const RUN = process.env.RUN_LEGACY_INTEGRATION === "true";
(RUN ? describe : describe.skip)(
  "Manual Fallback Flow - End-to-End Integration",
  () => {
    let mockStripe: jest.Mocked<Stripe>;

    beforeAll(async () => {
      // Setup Stripe mock
      mockStripe = {
        checkout: {
          sessions: {
            create: jest.fn().mockResolvedValue({
              id: "cs_test_integration_123",
              url: "https://checkout.stripe.com/pay/cs_test_integration_123",
            }),
          },
        },
      } as any;
    });

    beforeEach(async () => {
      jest.clearAllMocks();

      // Clean up test data - RecordingTicket uses 'id', SystemIncident uses metadata
      await prisma.donationDraft.deleteMany({
        where: { ticketId: { startsWith: "integration-test-" } },
      });
      await prisma.recordingTicket.deleteMany({
        where: { id: { startsWith: "integration-test-" } },
      });
      const incidents = await prisma.systemIncident.findMany({
        where: {
          metadata: {
            path: ["ticketId"],
            string_starts_with: "integration-test-",
          },
        },
      });
      if (incidents.length > 0) {
        await prisma.systemIncident.deleteMany({
          where: {
            id: { in: incidents.map((i) => i.id) },
          },
        });
      }

      // Default: healthy system
      mockedGetHealthStatus = jest.fn().mockResolvedValue({
        status: "healthy",
        services: { openai: true, assemblyai: true },
      });
    });

    afterAll(async () => {
      await prisma.$disconnect();
    });

    /**
     * SCENARIO 1: Complete Happy Path with Manual Fallback
     * Simulates real-world flow where transcription succeeds but extraction fails
     */
    describe("Scenario 1: Transcription Success → Extraction Failure → Manual Save → QR Generation", () => {
      const ticketId = "integration-test-scenario-1";
      const transcript =
        "Hi, my name is Jane Doe. I lost my job and need help with rent. I need about $2000.";

      it("should trigger fallback when signal extraction fails", async () => {
        // Mock extraction failure
        mockedExtractSignals.extractSignals = jest
          .fn()
          .mockRejectedValue(new Error("LLM timeout"));

        const result = await orchestrateDonationPipeline(ticketId, transcript);

        // Verify fallback triggered
        expect(result.success).toBe(false);
        expect(result.reasonCode).toBe("DRAFT_GENERATION_FAILED");
        expect(result.ticketId).toBe(ticketId);
        expect(result.debugId).toMatch(/^DBG-/);

        // Verify partial data preserved
        expect(result.partialData?.transcript).toBe(transcript);
      });

      it("should log incident when fallback triggers", async () => {
        mockedExtractSignals.extractSignals = jest
          .fn()
          .mockRejectedValue(new Error("LLM timeout"));

        await orchestrateDonationPipeline(ticketId, transcript);

        // Verify incident logged
        const incidents = await prisma.systemIncident.findMany({
          where: {
            metadata: {
              path: ["ticketId"],
              equals: ticketId,
            },
          },
        });

        expect(incidents.length).toBeGreaterThan(0);
        expect(incidents[0].severity).toBe("WARN");
        expect(incidents[0].category).toBe("PIPELINE_FALLBACK");
      });

      it("should allow user to save manual draft via API", async () => {
        // User receives fallback response and saves manually
        const response = await request(app)
          .post("/api/donations/manual-draft")
          .send({
            ticketId,
            title: "Help Jane with Rent",
            story: "Jane lost her job and needs help paying rent this month.",
            goalAmount: 2000,
            currency: "USD",
            urgencyScore: 8,
            beneficiaryName: "Jane Doe",
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.draft).toBeDefined();
        expect(response.body.draft.generationMode).toBe("MANUAL_FALLBACK");
        expect(response.body.draft.manuallyEditedAt).toBeDefined();
      });

      it("should generate QR code from manual draft", async () => {
        // First save the draft
        await request(app).post("/api/donations/manual-draft").send({
          ticketId,
          title: "Help Jane with Rent",
          story: "Jane lost her job and needs help paying rent this month.",
          goalAmount: 2000,
          currency: "USD",
        });

        // Then generate QR
        const qrResult = await generateQRFromManualDraft(ticketId, mockStripe);

        expect(qrResult.success).toBe(true);
        expect(qrResult.qrCodeUrl).toBeDefined();
        expect(qrResult.checkoutUrl).toContain("checkout.stripe.com");

        // Verify Stripe metadata
        expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              ticketId,
              generationMode: "MANUAL_FALLBACK",
              source: "manual_fallback",
            }),
          }),
        );
      });

      it("should track complete flow in database", async () => {
        // Complete the full flow
        mockedExtractSignals.extractSignals = jest
          .fn()
          .mockRejectedValue(new Error("LLM timeout"));

        // 1. Pipeline fails
        await orchestrateDonationPipeline(ticketId, transcript);

        // 2. User saves manually
        await request(app).post("/api/donations/manual-draft").send({
          ticketId,
          title: "Help Jane",
          story: "Story here",
          goalAmount: 2000,
          currency: "USD",
        });

        // 3. QR generated
        await generateQRFromManualDraft(ticketId, mockStripe);

        // Verify database state
        const draft = await prisma.donationDraft.findUnique({
          where: { ticketId },
        });

        expect(draft).toBeDefined();
        expect(draft?.generationMode).toBe("MANUAL_FALLBACK");
        expect(draft?.manuallyEditedAt).toBeDefined();
        expect(draft?.title).toBe("Help Jane");

        const incidents = await prisma.systemIncident.findMany({
          where: {
            metadata: {
              path: ["ticketId"],
              equals: ticketId,
            },
          },
        });

        expect(incidents.length).toBeGreaterThan(0);
      });
    });

    /**
     * SCENARIO 2: Dry Recording → Immediate Fallback
     */
    describe("Scenario 2: Dry Recording → Immediate Manual Entry", () => {
      const ticketId = "integration-test-scenario-2";
      const dryTranscript = "Hi"; // Only 2 characters

      it("should immediately fallback for dry recordings", async () => {
        const result = await orchestrateDonationPipeline(
          ticketId,
          dryTranscript,
        );

        expect(result.success).toBe(false);
        expect(result.reasonCode).toBe("TRANSCRIPTION_FAILED");
        expect(result.userMessage).toContain("automatic processing");
      });

      it("should allow manual entry with no partial data", async () => {
        const response = await request(app)
          .post("/api/donations/manual-draft")
          .send({
            ticketId,
            title: "Emergency Housing Help",
            story: "I need urgent help with housing.",
            goalAmount: 1500,
            currency: "USD",
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    /**
     * SCENARIO 3: System Degradation → Fallback for All Requests
     */
    describe("Scenario 3: System Degraded → Automatic Fallback", () => {
      const ticketId = "integration-test-scenario-3";
      const transcript =
        "My name is Bob and I need help with medical bills totaling $5000.";

      beforeEach(() => {
        // Mock degraded system
        mockedGetHealthStatus = jest.fn().mockResolvedValue({
          status: "degraded",
          services: { openai: false, assemblyai: true },
        });
      });

      it("should trigger fallback when system is degraded", async () => {
        const result = await orchestrateDonationPipeline(ticketId, transcript);

        expect(result.success).toBe(false);
        expect(result.reasonCode).toBe("SYSTEM_DEGRADED");
        expect(result.userMessage).toContain("technical issues");
      });

      it("should preserve transcript for manual editing", async () => {
        const result = await orchestrateDonationPipeline(ticketId, transcript);

        expect(result.partialData?.transcript).toBe(transcript);
      });

      it("should create incident with health status", async () => {
        await orchestrateDonationPipeline(ticketId, transcript);

        const incidents = await prisma.systemIncident.findMany({
          where: {
            category: "PIPELINE_FALLBACK",
            metadata: {
              path: ["reasonCode"],
              equals: "SYSTEM_DEGRADED",
            },
          },
        });

        expect(incidents.length).toBeGreaterThan(0);
      });
    });

    /**
     * SCENARIO 4: Partial Extraction → Manual Completion
     */
    describe("Scenario 4: Partial Data Extraction → User Completes", () => {
      const ticketId = "integration-test-scenario-4";
      const transcript = "Hi, I need help. My name is Sarah.";

      it("should fallback when critical fields missing", async () => {
        // Mock partial extraction (missing story and amount)
        mockedExtractSignals.extractSignals = jest.fn().mockResolvedValue({
          title: "Help Request",
          story: undefined,
          goalAmount: undefined,
          urgencyScore: 5,
          beneficiaryName: "Sarah",
        });

        const result = await orchestrateDonationPipeline(ticketId, transcript);

        expect(result.success).toBe(false);
        expect(result.reasonCode).toBe("PARSING_INCOMPLETE");
        expect(result.partialData?.extractedFields).toBeDefined();
        expect(result.partialData?.extractedFields?.beneficiaryName).toBe(
          "Sarah",
        );
      });

      it("should allow user to complete partial data", async () => {
        const response = await request(app)
          .post("/api/donations/manual-draft")
          .send({
            ticketId,
            title: "Help Sarah with Medical Bills",
            story: "Sarah needs help paying for unexpected medical expenses.",
            goalAmount: 3000,
            currency: "USD",
            beneficiaryName: "Sarah", // From partial extraction
          });

        expect(response.status).toBe(200);
        expect(response.body.draft.beneficiaryName).toBe("Sarah");
      });
    });

    /**
     * SCENARIO 5: Multiple Updates → Last Version Wins
     */
    describe("Scenario 5: Draft Editing → Multiple Saves", () => {
      const ticketId = "integration-test-scenario-5";

      it("should handle multiple manual updates", async () => {
        // First save
        const save1 = await request(app)
          .post("/api/donations/manual-draft")
          .send({
            ticketId,
            title: "Version 1",
            story: "Initial story",
            goalAmount: 1000,
            currency: "USD",
          });

        expect(save1.status).toBe(200);
        const draft1Id = save1.body.draft.id;

        // Second save (update)
        const save2 = await request(app)
          .post("/api/donations/manual-draft")
          .send({
            ticketId,
            title: "Version 2 Updated",
            story: "Updated story with more details",
            goalAmount: 1500,
            currency: "USD",
          });

        expect(save2.status).toBe(200);
        expect(save2.body.draft.title).toBe("Version 2 Updated");
        expect(save2.body.draft.goalAmount).toBe(1500);

        // Verify only one draft exists
        const drafts = await prisma.donationDraft.findMany({
          where: { ticketId },
        });

        expect(drafts).toHaveLength(1);
        expect(drafts[0].title).toBe("Version 2 Updated");
      });

      it("should update manuallyEditedAt timestamp", async () => {
        await request(app).post("/api/donations/manual-draft").send({
          ticketId,
          title: "First Save",
          story: "Story",
          goalAmount: 1000,
          currency: "USD",
        });

        const firstDraft = await prisma.donationDraft.findUnique({
          where: { ticketId },
        });
        const firstTimestamp = firstDraft?.manuallyEditedAt;

        // Wait a bit
        await new Promise((resolve) => setTimeout(resolve, 100));

        await request(app).post("/api/donations/manual-draft").send({
          ticketId,
          title: "Second Save",
          story: "Updated story",
          goalAmount: 2000,
          currency: "USD",
        });

        const secondDraft = await prisma.donationDraft.findUnique({
          where: { ticketId },
        });
        const secondTimestamp = secondDraft?.manuallyEditedAt;

        expect(secondTimestamp).not.toEqual(firstTimestamp);
      });
    });

    /**
     * SCENARIO 6: Retrieve Existing Draft for Editing
     */
    describe("Scenario 6: Load Existing Draft → Continue Editing", () => {
      const ticketId = "integration-test-scenario-6";

      it("should retrieve existing manual draft", async () => {
        // Create draft
        await request(app).post("/api/donations/manual-draft").send({
          ticketId,
          title: "Existing Draft",
          story: "This was saved before",
          goalAmount: 2500,
          currency: "USD",
          urgencyScore: 7,
        });

        // Retrieve it
        const response = await request(app).get(
          `/api/donations/manual-draft/${ticketId}`,
        );

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.draft.title).toBe("Existing Draft");
        expect(response.body.draft.goalAmount).toBe("2500"); // Decimal as string
        expect(response.body.draft.urgencyScore).toBe(7);
      });

      it("should return 404 for non-existent draft", async () => {
        const response = await request(app).get(
          "/api/donations/manual-draft/non-existent-ticket",
        );

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
      });
    });

    /**
     * SCENARIO 7: Analytics & Observability
     */
    describe("Scenario 7: Incident Logging & Analytics", () => {
      it("should track all fallback types", async () => {
        const testCases = [
          {
            ticketId: "analytics-test-1",
            transcript: "", // Empty
            expectedReason: "TRANSCRIPTION_FAILED",
          },
          {
            ticketId: "analytics-test-2",
            transcript: "Valid transcript",
            mockError: new Error("LLM timeout"),
            expectedReason: "DRAFT_GENERATION_FAILED",
          },
        ];

        for (const testCase of testCases) {
          if (testCase.mockError) {
            mockedExtractSignals.extractSignals = jest
              .fn()
              .mockRejectedValue(testCase.mockError);
          }

          await orchestrateDonationPipeline(
            testCase.ticketId,
            testCase.transcript,
          );

          const incident = await prisma.systemIncident.findFirst({
            where: {
              metadata: {
                path: ["ticketId"],
                equals: testCase.ticketId,
              },
            },
          });

          expect(incident).toBeDefined();
          expect(incident?.severity).toBe("WARN");
          expect(incident?.category).toBe("PIPELINE_FALLBACK");
        }
      });

      it("should include debugId in all incidents", async () => {
        const ticketId = "analytics-debug-test";

        const result = await orchestrateDonationPipeline(ticketId, "");

        expect(result.debugId).toMatch(/^DBG-/);

        const incident = await prisma.systemIncident.findFirst({
          where: {
            description: {
              contains: result.debugId,
            },
          },
        });

        expect(incident).toBeDefined();
      });

      it("should track generationMode in Stripe metadata", async () => {
        const ticketId = "analytics-stripe-test";

        await request(app).post("/api/donations/manual-draft").send({
          ticketId,
          title: "Test Campaign",
          story: "Test story",
          goalAmount: 1000,
          currency: "USD",
        });

        await generateQRFromManualDraft(ticketId, mockStripe);

        const call = mockStripe.checkout.sessions.create.mock.calls[0][0];

        expect(call.metadata.generationMode).toBe("MANUAL_FALLBACK");
        expect(call.metadata.source).toBe("manual_fallback");
        expect(call.metadata.ticketId).toBe(ticketId);
      });
    });

    /**
     * SCENARIO 8: Edge Cases & Error Handling
     */
    describe("Scenario 8: Edge Cases", () => {
      it("should handle very long story text", async () => {
        const longStory = "A".repeat(10000);

        const response = await request(app)
          .post("/api/donations/manual-draft")
          .send({
            ticketId: "edge-long-story",
            title: "Long Story Test",
            story: longStory,
            goalAmount: 1000,
            currency: "USD",
          });

        expect(response.status).toBe(200);
        expect(response.body.draft.story).toHaveLength(10000);
      });

      it("should handle Unicode and emojis", async () => {
        const response = await request(app)
          .post("/api/donations/manual-draft")
          .send({
            ticketId: "edge-unicode",
            title: "Ayuda para José 🙏",
            story: "Mi familia necesita ayuda después del huracán 🌪️",
            goalAmount: 2500,
            currency: "USD",
          });

        expect(response.status).toBe(200);
        expect(response.body.draft.title).toContain("José");
        expect(response.body.draft.story).toContain("🌪️");
      });

      it("should reject invalid goal amounts", async () => {
        const response = await request(app)
          .post("/api/donations/manual-draft")
          .send({
            ticketId: "edge-invalid-amount",
            title: "Invalid Amount",
            story: "Story",
            goalAmount: -500, // Negative
            currency: "USD",
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it("should require all critical fields", async () => {
        const response = await request(app)
          .post("/api/donations/manual-draft")
          .send({
            ticketId: "edge-missing-fields",
            title: "Missing Story",
            // story is missing
            goalAmount: 1000,
            currency: "USD",
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    /**
     * SCENARIO 9: Performance & Concurrency
     */
    describe("Scenario 9: Performance Tests", () => {
      it("should handle rapid successive saves", async () => {
        const ticketId = "perf-rapid-saves";
        const savePromises = [];

        for (let i = 0; i < 5; i++) {
          savePromises.push(
            request(app)
              .post("/api/donations/manual-draft")
              .send({
                ticketId,
                title: `Version ${i}`,
                story: `Story version ${i}`,
                goalAmount: 1000 + i * 100,
                currency: "USD",
              }),
          );
        }

        const results = await Promise.all(savePromises);

        // All should succeed
        results.forEach((response) => {
          expect(response.status).toBe(200);
        });

        // Should only have one draft
        const drafts = await prisma.donationDraft.findMany({
          where: { ticketId },
        });

        expect(drafts).toHaveLength(1);
      });

      it("should complete full flow in reasonable time", async () => {
        const ticketId = "perf-timing-test";
        const startTime = Date.now();

        mockedExtractSignals.extractSignals = jest
          .fn()
          .mockRejectedValue(new Error("Simulated failure"));

        // 1. Pipeline fails
        await orchestrateDonationPipeline(ticketId, "Some transcript here");

        // 2. Manual save
        await request(app).post("/api/donations/manual-draft").send({
          ticketId,
          title: "Performance Test",
          story: "Testing performance",
          goalAmount: 1000,
          currency: "USD",
        });

        // 3. QR generation
        await generateQRFromManualDraft(ticketId, mockStripe);

        const duration = Date.now() - startTime;

        // Should complete in under 2 seconds
        expect(duration).toBeLessThan(2000);
      });
    });

    /**
     * SCENARIO 10: RecordingTicket Integration
     */
    describe("Scenario 10: RecordingTicket → Pipeline → Manual Fallback", () => {
      it("should process recording ticket with fallback", async () => {
        const ticketId = "recording-integration-test";

        // Create recording ticket
        await prisma.recordingTicket.create({
          data: {
            ticketId,
            contactType: "EMAIL",
            contactValue: "test@example.com",
            status: "PROCESSING",
            audioUrl: "https://example.com/audio.mp3",
            transcriptText: "My name is Tom and I need help.",
          },
        });

        // Mock extraction failure
        mockedExtractSignals.extractSignals = jest
          .fn()
          .mockRejectedValue(new Error("Extraction failed"));

        const result = await processDonationFromRecording(ticketId);

        expect(result.success).toBe(false);
        expect(result.reasonCode).toBe("DRAFT_GENERATION_FAILED");

        // User creates manual draft
        await request(app).post("/api/donations/manual-draft").send({
          ticketId,
          title: "Help Tom",
          story: "Tom needs assistance",
          goalAmount: 1800,
          currency: "USD",
        });

        const draft = await prisma.donationDraft.findUnique({
          where: { ticketId },
        });

        expect(draft).toBeDefined();
        expect(draft?.generationMode).toBe("MANUAL_FALLBACK");
      });
    });
  },
);
