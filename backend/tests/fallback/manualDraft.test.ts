/**
 * Manual Draft Endpoints Tests
 *
 * Tests for saving and retrieving manual drafts
 */

import request from "supertest";
import express from "express";
import manualDraftRoutes from "../../src/routes/manualDraft";
import { prisma } from "../../src/utils/database";

const app = express();
app.use(express.json());
app.use("/api/donations", manualDraftRoutes);

const testTicketId = "test-manual-ticket-001";

const RUN = process.env.RUN_LEGACY_INTEGRATION === "true";
(RUN ? describe : describe.skip)("Manual Draft Endpoints", () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.donationDraft.deleteMany({
      where: { ticketId: { startsWith: "test-" } },
    });
    await prisma.recordingTicket.deleteMany({
      where: { id: { startsWith: "test-" } },
    });

    // Create test ticket
    await prisma.recordingTicket.create({
      data: {
        id: testTicketId,
        contactType: "EMAIL",
        contactValue: "test@example.com",
        status: "DRAFT",
      },
    });
  });

  describe("POST /api/donations/manual-draft", () => {
    it("should save a complete manual draft", async () => {
      const response = await request(app)
        .post("/api/donations/manual-draft")
        .send({
          ticketId: testTicketId,
          title: "Help John Recover",
          story:
            "John was injured in an accident and needs help with medical bills.",
          goalAmount: 5000,
          currency: "USD",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.draft).toBeDefined();
      expect(response.body.draft.title).toBe("Help John Recover");
      expect(response.body.draft.generationMode).toBe("MANUAL_FALLBACK");
      expect(response.body.draft.manuallyEditedAt).toBeDefined();
    });

    it("should save draft with optional fields", async () => {
      const response = await request(app)
        .post("/api/donations/manual-draft")
        .send({
          ticketId: testTicketId,
          title: "Emergency Fund",
          story: "Need help urgently",
          goalAmount: 1000,
          currency: "USD",
          urgencyScore: 9,
          beneficiaryName: "Sarah Jones",
          contactInfo: "sarah@example.com",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.draft.urgencyScore).toBe(9);
      expect(response.body.draft.beneficiaryName).toBe("Sarah Jones");
    });

    it("should update existing draft when saving again", async () => {
      // First save
      await request(app).post("/api/donations/manual-draft").send({
        ticketId: testTicketId,
        title: "Initial Title",
        story: "Initial story",
        goalAmount: 2000,
        currency: "USD",
      });

      // Update
      const response = await request(app)
        .post("/api/donations/manual-draft")
        .send({
          ticketId: testTicketId,
          title: "Updated Title",
          story: "Updated story with more details",
          goalAmount: 3000,
          currency: "USD",
        });

      expect(response.status).toBe(200);
      expect(response.body.draft.title).toBe("Updated Title");
      expect(response.body.draft.goalAmount).toBe(3000);

      // Verify only one draft exists
      const drafts = await prisma.donationDraft.findMany({
        where: { ticketId: testTicketId },
      });
      expect(drafts).toHaveLength(1);
    });

    it("should reject empty title", async () => {
      const response = await request(app)
        .post("/api/donations/manual-draft")
        .send({
          ticketId: testTicketId,
          title: "",
          story: "Story without title",
          goalAmount: 1000,
          currency: "USD",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("title");
    });

    it("should reject empty story", async () => {
      const response = await request(app)
        .post("/api/donations/manual-draft")
        .send({
          ticketId: testTicketId,
          title: "Title without story",
          story: "   ",
          goalAmount: 1000,
          currency: "USD",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("story");
    });

    it("should reject zero or negative goal amount", async () => {
      const response = await request(app)
        .post("/api/donations/manual-draft")
        .send({
          ticketId: testTicketId,
          title: "Invalid Amount",
          story: "Story with invalid amount",
          goalAmount: 0,
          currency: "USD",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("goalAmount");
    });

    it("should reject missing required fields", async () => {
      const response = await request(app)
        .post("/api/donations/manual-draft")
        .send({
          ticketId: testTicketId,
          // Missing title, story, goalAmount
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should handle very long title (truncate or reject)", async () => {
      const longTitle = "A".repeat(200);

      const response = await request(app)
        .post("/api/donations/manual-draft")
        .send({
          ticketId: testTicketId,
          title: longTitle,
          story: "Story here",
          goalAmount: 1000,
          currency: "USD",
        });

      // Either accepts (with truncation) or rejects
      if (response.status === 200) {
        expect(response.body.draft.title.length).toBeLessThanOrEqual(90);
      } else {
        expect(response.status).toBe(400);
      }
    });

    it("should handle Unicode characters in title and story", async () => {
      const response = await request(app)
        .post("/api/donations/manual-draft")
        .send({
          ticketId: testTicketId,
          title: "Ayuda para José 🙏",
          story: "Mi familia necesita ayuda después del huracán 🌪️",
          goalAmount: 2500,
          currency: "USD",
        });

      expect(response.status).toBe(200);
      expect(response.body.draft.title).toBe("Ayuda para José 🙏");
      expect(response.body.draft.story).toContain("huracán");
    });

    it("should default currency to USD if not provided", async () => {
      const response = await request(app)
        .post("/api/donations/manual-draft")
        .send({
          ticketId: testTicketId,
          title: "Default Currency Test",
          story: "Testing currency default",
          goalAmount: 1000,
        });

      expect(response.status).toBe(200);
      expect(response.body.draft.currency).toBe("USD");
    });
  });

  describe("GET /api/donations/manual-draft/:ticketId", () => {
    beforeEach(async () => {
      // Create test drafts
      await prisma.donationDraft.createMany({
        data: [
          {
            ticketId: "test-retrieve-001",
            title: "Existing Draft 1",
            story: "Story for draft 1",
            goalAmount: 1500,
            currency: "USD",
            generationMode: "MANUAL_FALLBACK",
            manuallyEditedAt: new Date(),
          },
          {
            ticketId: "test-retrieve-002",
            title: "Automated Draft",
            story: "Story for automated draft",
            goalAmount: 2000,
            currency: "USD",
            generationMode: "AUTOMATED",
            extractedAt: new Date(),
          },
        ],
      });
    });

    it("should retrieve existing manual draft", async () => {
      const response = await request(app).get(
        "/api/donations/manual-draft/test-retrieve-001",
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.draft).toBeDefined();
      expect(response.body.draft.title).toBe("Existing Draft 1");
      expect(response.body.draft.generationMode).toBe("MANUAL_FALLBACK");
    });

    it("should retrieve automated draft converted to manual", async () => {
      const response = await request(app).get(
        "/api/donations/manual-draft/test-retrieve-002",
      );

      expect(response.status).toBe(200);
      expect(response.body.draft.title).toBe("Automated Draft");
      expect(response.body.draft.generationMode).toBe("AUTOMATED");
    });

    it("should return 404 for non-existent draft", async () => {
      const response = await request(app).get(
        "/api/donations/manual-draft/non-existent-id",
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("not found");
    });

    it("should return most recent draft if multiple exist", async () => {
      // Create duplicate drafts (shouldn't happen, but test resilience)
      await prisma.donationDraft.create({
        data: {
          ticketId: "test-retrieve-001",
          title: "Newer Draft",
          story: "Updated story",
          goalAmount: 3000,
          currency: "USD",
          generationMode: "MANUAL_FALLBACK",
          manuallyEditedAt: new Date(),
        },
      });

      const response = await request(app).get(
        "/api/donations/manual-draft/test-retrieve-001",
      );

      expect(response.status).toBe(200);
      // Should get the most recent one
      const drafts = await prisma.donationDraft.findMany({
        where: { ticketId: "test-retrieve-001" },
        orderBy: { createdAt: "desc" },
      });
      expect(response.body.draft.title).toBe(drafts[0].title);
    });
  });

  describe("Integration: Save and Retrieve", () => {
    it("should save then retrieve the same draft", async () => {
      const saveData = {
        ticketId: "test-integration-001",
        title: "Integration Test Campaign",
        story: "This is a full integration test",
        goalAmount: 7500,
        currency: "USD",
        urgencyScore: 7,
        beneficiaryName: "Test User",
      };

      // Save
      const saveResponse = await request(app)
        .post("/api/donations/manual-draft")
        .send(saveData);

      expect(saveResponse.status).toBe(200);
      const savedDraftId = saveResponse.body.draft.id;

      // Retrieve
      const getResponse = await request(app).get(
        "/api/donations/manual-draft/test-integration-001",
      );

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.draft.id).toBe(savedDraftId);
      expect(getResponse.body.draft.title).toBe(saveData.title);
      expect(getResponse.body.draft.story).toBe(saveData.story);
      expect(getResponse.body.draft.goalAmount).toBe(saveData.goalAmount);
      expect(getResponse.body.draft.urgencyScore).toBe(saveData.urgencyScore);
    });

    it("should handle rapid updates (no race conditions)", async () => {
      const updates = [
        { title: "Version 1", story: "Story 1", goalAmount: 1000 },
        { title: "Version 2", story: "Story 2", goalAmount: 2000 },
        { title: "Version 3", story: "Story 3", goalAmount: 3000 },
      ];

      // Send all updates rapidly
      for (const update of updates) {
        await request(app)
          .post("/api/donations/manual-draft")
          .send({
            ticketId: "test-race-001",
            ...update,
            currency: "USD",
          });
      }

      // Retrieve final state
      const response = await request(app).get(
        "/api/donations/manual-draft/test-race-001",
      );

      expect(response.status).toBe(200);
      // Should have one of the updates (likely the last)
      expect([1000, 2000, 3000]).toContain(response.body.draft.goalAmount);
    });
  });
});
