/**
 * Donation Pipeline Orchestrator Tests
 *
 * Tests for automatic fallback triggers in full pipeline
 */

import {
  orchestrateDonationPipeline,
  processDonationFromRecording,
} from "../../src/services/donationPipelineOrchestrator";
import { prisma } from "../../src/utils/database";
import * as extractSignals from "../../src/services/speechIntelligence/transcriptSignalExtractor";
import { getHealthStatus } from "../../src/utils/healthCheck";

// Mock dependencies
jest.mock("../../src/services/speechIntelligence/transcriptSignalExtractor");
jest.mock("../../src/utils/healthCheck");

const mockedExtractSignals = extractSignals as jest.Mocked<
  typeof extractSignals
>;
const mockedGetHealthStatus = getHealthStatus as jest.MockedFunction<
  typeof getHealthStatus
>;

const RUN = process.env.RUN_LEGACY_INTEGRATION === "true";
(RUN ? describe : describe.skip)("Donation Pipeline Orchestrator", () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    // Clean up test data - RecordingTicket uses 'id' not 'ticketId'
    await prisma.donationDraft.deleteMany({
      where: { ticketId: { startsWith: "test-" } },
    });
    await prisma.recordingTicket.deleteMany({
      where: { id: { startsWith: "test-" } },
    });
    await prisma.systemIncident.deleteMany({
      where: { ticketId: { startsWith: "test-" } },
    });
  });

  describe("orchestrateDonationPipeline - Successful Flow", () => {
    it("should complete full pipeline when all steps succeed", async () => {
      // Mock healthy system
      mockedGetHealthStatus = jest.fn().mockResolvedValue({
        status: "healthy",
        services: { openai: true, assemblyai: true },
      });

      // Mock successful extraction
      mockedExtractSignals.extractSignals = jest.fn().mockResolvedValue({
        title: "Help John",
        story: "John needs medical assistance",
        goalAmount: 5000,
        urgencyScore: 8,
        beneficiaryName: "John Doe",
      });

      const result = await orchestrateDonationPipeline(
        "test-ticket-success",
        "I need help paying for medical bills. My name is John and I need $5000.",
      );

      expect(result.success).toBe(true);
      expect((result as any).draft).toBeDefined();
      expect((result as any).draft.title).toBe("Help John");
      expect((result as any).draft.generationMode).toBe("AUTOMATED");
    });
  });

  describe("orchestrateDonationPipeline - Fallback Triggers", () => {
    it("should trigger fallback when system is degraded", async () => {
      mockedGetHealthStatus = jest.fn().mockResolvedValue({
        status: "degraded",
        services: { openai: false, assemblyai: true },
      });

      const result = await orchestrateDonationPipeline(
        "test-ticket-degraded",
        "Some transcript here",
      );

      expect(result.success).toBe(false);
      expect(result.reasonCode).toBe("SYSTEM_DEGRADED");
      expect(result.userMessage).toContain("technical issues");

      // Verify incident logged
      const incident = await prisma.systemIncident.findFirst({
        where: { ticketId: "test-ticket-degraded" },
      });
      expect(incident).toBeDefined();
    });

    it("should trigger fallback when transcript is missing", async () => {
      mockedGetHealthStatus = jest.fn().mockResolvedValue({
        status: "healthy",
        services: { openai: true, assemblyai: true },
      });

      const result = await orchestrateDonationPipeline(
        "test-ticket-no-transcript",
        "",
      );

      expect(result.success).toBe(false);
      expect(result.reasonCode).toBe("TRANSCRIPTION_FAILED");
    });

    it("should trigger fallback when transcript is too short (dry recording)", async () => {
      mockedGetHealthStatus = jest.fn().mockResolvedValue({
        status: "healthy",
        services: { openai: true, assemblyai: true },
      });

      const result = await orchestrateDonationPipeline(
        "test-ticket-dry",
        "Hi", // Only 2 characters
      );

      expect(result.success).toBe(false);
      expect(result.reasonCode).toBe("TRANSCRIPTION_FAILED");
      expect(result.partialData?.transcript).toBe("Hi");
    });

    it("should trigger fallback when signal extraction fails", async () => {
      mockedGetHealthStatus = jest.fn().mockResolvedValue({
        status: "healthy",
        services: { openai: true, assemblyai: true },
      });

      mockedExtractSignals.extractSignals = jest
        .fn()
        .mockRejectedValue(new Error("LLM timeout"));

      const result = await orchestrateDonationPipeline(
        "test-ticket-extract-fail",
        "This is a long enough transcript for processing",
      );

      expect(result.success).toBe(false);
      expect(result.reasonCode).toBe("DRAFT_GENERATION_FAILED");
      expect(result.partialData?.transcript).toBeDefined();
    });

    it("should trigger fallback when critical fields are missing", async () => {
      mockedGetHealthStatus = jest.fn().mockResolvedValue({
        status: "healthy",
        services: { openai: true, assemblyai: true },
      });

      // Extraction succeeds but missing critical fields
      mockedExtractSignals.extractSignals = jest.fn().mockResolvedValue({
        title: "Incomplete",
        story: undefined, // Missing story
        goalAmount: undefined, // Missing amount
        urgencyScore: 5,
      });

      const result = await orchestrateDonationPipeline(
        "test-ticket-incomplete",
        "Vague request without details",
      );

      expect(result.success).toBe(false);
      expect(result.reasonCode).toBe("PARSING_INCOMPLETE");
      expect(result.partialData?.extractedFields?.title).toBe("Incomplete");
    });

    it("should trigger fallback on unexpected exception", async () => {
      mockedGetHealthStatus = jest
        .fn()
        .mockRejectedValue(new Error("Database connection lost"));

      const result = await orchestrateDonationPipeline(
        "test-ticket-exception",
        "Some transcript",
      );

      expect(result.success).toBe(false);
      expect(result.reasonCode).toBe("PIPELINE_EXCEPTION");
    });
  });

  describe("orchestrateDonationPipeline - Partial Data Preservation", () => {
    it("should preserve transcript when extraction fails", async () => {
      mockedGetHealthStatus = jest.fn().mockResolvedValue({
        status: "healthy",
        services: { openai: true, assemblyai: true },
      });

      mockedExtractSignals.extractSignals = jest
        .fn()
        .mockRejectedValue(new Error("Extraction failed"));

      const transcript = "My name is Sarah and I need help with rent";

      const result = await orchestrateDonationPipeline(
        "test-ticket-preserve-transcript",
        transcript,
      );

      expect(result.success).toBe(false);
      expect(result.partialData?.transcript).toBe(transcript);
    });

    it("should preserve partial extracted fields", async () => {
      mockedGetHealthStatus = jest.fn().mockResolvedValue({
        status: "healthy",
        services: { openai: true, assemblyai: true },
      });

      mockedExtractSignals.extractSignals = jest.fn().mockResolvedValue({
        title: "Help Sarah",
        story: "Partial story",
        goalAmount: undefined, // Missing
        urgencyScore: 7,
        beneficiaryName: "Sarah",
      });

      const result = await orchestrateDonationPipeline(
        "test-ticket-partial-fields",
        "Sarah needs help",
      );

      expect(result.success).toBe(false);
      expect(result.partialData?.extractedFields).toMatchObject({
        title: "Help Sarah",
        story: "Partial story",
        urgencyScore: 7,
        beneficiaryName: "Sarah",
      });
    });
  });

  describe("processDonationFromRecording", () => {
    beforeEach(async () => {
      // Create test recording ticket
      await prisma.recordingTicket.create({
        data: {
          ticketId: "test-recording-001",
          status: "recording_complete",
          audioUrl: "https://example.com/audio.mp3",
          transcriptText: "My name is Bob and I need $3000 for car repairs",
        },
      });
    });

    it("should process recording and create draft", async () => {
      mockedGetHealthStatus = jest.fn().mockResolvedValue({
        status: "healthy",
        services: { openai: true, assemblyai: true },
      });

      mockedExtractSignals.extractSignals = jest.fn().mockResolvedValue({
        title: "Car Repair Help",
        story: "Bob needs car repairs",
        goalAmount: 3000,
        urgencyScore: 6,
        beneficiaryName: "Bob",
      });

      const result = await processDonationFromRecording("test-recording-001");

      expect(result.success).toBe(true);

      const ticket = await prisma.recordingTicket.findUnique({
        where: { ticketId: "test-recording-001" },
      });

      expect(ticket?.status).toBe("draft_ready");
      expect(ticket?.draftId).toBeDefined();
    });

    it("should handle fallback for recording without transcript", async () => {
      await prisma.recordingTicket.create({
        data: {
          ticketId: "test-recording-no-transcript",
          status: "recording_complete",
          audioUrl: "https://example.com/audio2.mp3",
          transcriptText: null,
        },
      });

      const result = await processDonationFromRecording(
        "test-recording-no-transcript",
      );

      expect(result.success).toBe(false);
      expect(result.reasonCode).toBe("TRANSCRIPTION_FAILED");
    });

    it("should return error if recording not found", async () => {
      const result = await processDonationFromRecording(
        "non-existent-recording",
      );

      expect(result.success).toBe(false);
      // Should handle gracefully
    });
  });

  describe("Incident Logging", () => {
    it("should log incident for every fallback", async () => {
      mockedGetHealthStatus = jest.fn().mockResolvedValue({
        status: "degraded",
        services: { openai: false },
      });

      await orchestrateDonationPipeline("test-incident-log-1", "Transcript");

      const incidents = await prisma.systemIncident.findMany({
        where: { ticketId: "test-incident-log-1" },
      });

      expect(incidents).toHaveLength(1);
      expect(incidents[0].severity).toBe("WARN");
      expect(incidents[0].category).toBe("PIPELINE_FALLBACK");
      expect(incidents[0].metadata).toHaveProperty("reasonCode");
    });

    it("should include debugId in all fallback responses", async () => {
      mockedGetHealthStatus = jest.fn().mockResolvedValue({
        status: "healthy",
      });

      mockedExtractSignals.extractSignals = jest
        .fn()
        .mockRejectedValue(new Error("Failed"));

      const result = await orchestrateDonationPipeline(
        "test-debug-id",
        "Transcript",
      );

      expect(result.success).toBe(false);
      expect(result.debugId).toMatch(/^DBG-/);

      const incident = await prisma.systemIncident.findFirst({
        where: {
          ticketId: "test-debug-id",
          description: { contains: result.debugId },
        },
      });

      expect(incident).toBeDefined();
    });
  });
});
