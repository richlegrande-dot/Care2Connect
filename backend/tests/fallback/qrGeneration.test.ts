/**
 * QR Code Generation with Manual Mode Tests
 *
 * Tests for QR generation from manual drafts
 */

import {
  createPaymentQRWithMode,
  generateQRFromManualDraft,
} from "../../src/services/qrCodeGeneratorEnhanced";
import { prisma } from "../../src/utils/database";
import Stripe from "stripe";

// Mock Stripe
jest.mock("stripe");

const RUN = process.env.RUN_LEGACY_INTEGRATION === "true";
(RUN ? describe : describe.skip)("QR Code Generator Enhanced", () => {
  let mockStripe: jest.Mocked<Stripe>;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Setup Stripe mock
    mockStripe = {
      checkout: {
        sessions: {
          create: jest.fn().mockResolvedValue({
            id: "cs_test_123",
            url: "https://checkout.stripe.com/pay/cs_test_123",
          }),
        },
      },
    } as any;

    // Clean up test data
    await prisma.donationDraft.deleteMany({
      where: { ticketId: { startsWith: "test-qr-" } },
    });
    await prisma.recordingTicket.deleteMany({
      where: { id: { startsWith: "test-qr-" } },
    });

    // Create test tickets for all tests
    await prisma.recordingTicket.createMany({
      data: [
        {
          id: "test-qr-auto-001",
          contactType: "EMAIL",
          contactValue: "auto@test.com",
          status: "DRAFT",
        },
        {
          id: "test-qr-manual-001",
          contactType: "EMAIL",
          contactValue: "manual@test.com",
          status: "DRAFT",
        },
        {
          id: "test-qr-manual-draft-123",
          contactType: "EMAIL",
          contactValue: "draft@test.com",
          status: "DRAFT",
        },
      ],
    });
  });

  describe("createPaymentQRWithMode", () => {
    it("should create QR with AUTOMATED generation mode", async () => {
      const result = await createPaymentQRWithMode(
        {
          ticketId: "test-qr-auto-001",
          title: "Automated Campaign",
          story: "Generated automatically",
          goalAmount: 2500,
          currency: "USD",
          generationMode: "AUTOMATED",
          draftId: "draft-123",
          recordingId: "rec-456",
        },
        mockStripe,
      );

      expect(result.qrCodeUrl).toBeDefined();
      expect(result.checkoutUrl).toContain("checkout.stripe.com");

      // Verify Stripe metadata
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            ticketId: "test-qr-auto-001",
            generationMode: "AUTOMATED",
            source: "donation_pipeline",
            draftId: "draft-123",
            recordingId: "rec-456",
          }),
        }),
      );
    });

    it("should create QR with MANUAL_FALLBACK generation mode", async () => {
      const result = await createPaymentQRWithMode(
        {
          ticketId: "test-qr-manual-001",
          title: "Manual Campaign",
          story: "Created manually after pipeline failure",
          goalAmount: 1500,
          currency: "USD",
          generationMode: "MANUAL_FALLBACK",
          draftId: "draft-789",
          recordingId: "rec-999",
        },
        mockStripe,
      );

      expect(result.qrCodeUrl).toBeDefined();

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            generationMode: "MANUAL_FALLBACK",
            source: "manual_fallback",
          }),
        }),
      );
    });

    it("should default to AUTOMATED if no mode specified", async () => {
      const result = await createPaymentQRWithMode(
        {
          ticketId: "test-qr-default",
          title: "Default Mode",
          story: "Testing defaults",
          goalAmount: 1000,
          currency: "USD",
        },
        mockStripe,
      );

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            generationMode: "AUTOMATED",
          }),
        }),
      );
    });

    it("should handle different currencies", async () => {
      const result = await createPaymentQRWithMode(
        {
          ticketId: "test-qr-eur",
          title: "Euro Campaign",
          story: "Testing EUR currency",
          goalAmount: 3000,
          currency: "EUR",
          generationMode: "MANUAL_FALLBACK",
        },
        mockStripe,
      );

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: expect.arrayContaining([
            expect.objectContaining({
              price_data: expect.objectContaining({
                currency: "eur",
              }),
            }),
          ]),
        }),
      );
    });
  });

  describe("generateQRFromManualDraft", () => {
    beforeEach(async () => {
      // Create test manual draft
      await prisma.donationDraft.create({
        data: {
          ticketId: "test-manual-draft-001",
          title: "Manual Draft for QR",
          story: "This was created manually",
          goalAmount: 5000,
          currency: "USD",
          generationMode: "MANUAL_FALLBACK",
          manuallyEditedAt: new Date(),
        },
      });
    });

    it("should generate QR from existing manual draft", async () => {
      const result = await generateQRFromManualDraft(
        "test-manual-draft-001",
        mockStripe,
      );

      expect(result.success).toBe(true);
      expect(result.qrCodeUrl).toBeDefined();
      expect(result.checkoutUrl).toBeDefined();

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            ticketId: "test-manual-draft-001",
            generationMode: "MANUAL_FALLBACK",
            source: "manual_fallback",
          }),
        }),
      );
    });

    it("should return error if draft not found", async () => {
      const result = await generateQRFromManualDraft(
        "non-existent-draft",
        mockStripe,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should work with automated drafts too", async () => {
      // Create automated draft
      await prisma.donationDraft.create({
        data: {
          ticketId: "test-auto-draft-001",
          title: "Automated Draft",
          story: "Generated by pipeline",
          goalAmount: 2000,
          currency: "USD",
          generationMode: "AUTOMATED",
          extractedAt: new Date(),
        },
      });

      const result = await generateQRFromManualDraft(
        "test-auto-draft-001",
        mockStripe,
      );

      expect(result.success).toBe(true);
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            generationMode: "AUTOMATED",
          }),
        }),
      );
    });

    it("should handle drafts with all optional fields", async () => {
      await prisma.donationDraft.create({
        data: {
          ticketId: "test-full-draft",
          title: "Complete Draft",
          story: "Full story here",
          goalAmount: 7500,
          currency: "USD",
          generationMode: "MANUAL_FALLBACK",
          urgencyScore: 9,
          beneficiaryName: "John Doe",
          contactInfo: "john@example.com",
          location: "New York",
          manuallyEditedAt: new Date(),
        },
      });

      const result = await generateQRFromManualDraft(
        "test-full-draft",
        mockStripe,
      );

      expect(result.success).toBe(true);
    });
  });

  describe("Metadata Tracking", () => {
    it("should include all required metadata fields", async () => {
      await createPaymentQRWithMode(
        {
          ticketId: "test-metadata-001",
          title: "Metadata Test",
          story: "Testing metadata",
          goalAmount: 1000,
          currency: "USD",
          generationMode: "MANUAL_FALLBACK",
          draftId: "draft-meta-123",
          recordingId: "rec-meta-456",
        },
        mockStripe,
      );

      const call = mockStripe.checkout.sessions.create.mock.calls[0][0];
      const metadata = call.metadata;

      expect(metadata).toHaveProperty("ticketId", "test-metadata-001");
      expect(metadata).toHaveProperty("generationMode", "MANUAL_FALLBACK");
      expect(metadata).toHaveProperty("source", "manual_fallback");
      expect(metadata).toHaveProperty("draftId", "draft-meta-123");
      expect(metadata).toHaveProperty("recordingId", "rec-meta-456");
    });

    it("should distinguish automated vs manual in metadata", async () => {
      // Automated
      await createPaymentQRWithMode(
        {
          ticketId: "test-auto",
          title: "Auto",
          story: "Story",
          goalAmount: 1000,
          currency: "USD",
          generationMode: "AUTOMATED",
        },
        mockStripe,
      );

      const autoCall = mockStripe.checkout.sessions.create.mock.calls[0][0];
      expect(autoCall.metadata.source).toBe("donation_pipeline");

      // Manual
      await createPaymentQRWithMode(
        {
          ticketId: "test-manual",
          title: "Manual",
          story: "Story",
          goalAmount: 1000,
          currency: "USD",
          generationMode: "MANUAL_FALLBACK",
        },
        mockStripe,
      );

      const manualCall = mockStripe.checkout.sessions.create.mock.calls[1][0];
      expect(manualCall.metadata.source).toBe("manual_fallback");
    });
  });

  describe("Error Handling", () => {
    it("should handle Stripe API errors", async () => {
      mockStripe.checkout.sessions.create = jest
        .fn()
        .mockRejectedValue(new Error("Stripe API error"));

      await expect(
        createPaymentQRWithMode(
          {
            ticketId: "test-stripe-error",
            title: "Error Test",
            story: "Testing error",
            goalAmount: 1000,
            currency: "USD",
            generationMode: "MANUAL_FALLBACK",
          },
          mockStripe,
        ),
      ).rejects.toThrow();
    });

    it("should validate required fields", async () => {
      await expect(
        createPaymentQRWithMode(
          {
            ticketId: "test-invalid",
            title: "", // Empty title
            story: "Story",
            goalAmount: 1000,
            currency: "USD",
          },
          mockStripe,
        ),
      ).rejects.toThrow();
    });

    it("should validate goal amount", async () => {
      await expect(
        createPaymentQRWithMode(
          {
            ticketId: "test-invalid-amount",
            title: "Invalid Amount",
            story: "Story",
            goalAmount: -100, // Negative
            currency: "USD",
          },
          mockStripe,
        ),
      ).rejects.toThrow();
    });
  });
});
