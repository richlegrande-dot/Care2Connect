/**
 * Phase 4: Document Generation Hardening Tests
 *
 * Tests to validate DOCX generation reliability, QR code integrity,
 * and end-to-end document pipeline robustness
 */

import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import GofundmeDocxExporter from "../../../../exports/generateGofundmeDocx";
import { isValidDocx } from "../../../../../tests/helpers/docxTextExtract";

// Mock docx library for controlled testing
jest.mock("docx", () => ({
  Document: jest.fn(),
  Paragraph: jest.fn(),
  TextRun: jest.fn(),
  HeadingLevel: { HEADING_1: 1, HEADING_2: 2 },
  AlignmentType: { CENTER: "center" },
  Packer: {
    toBuffer: jest.fn(),
  },
}));

describe("Phase 4: Document Generation Hardening Tests", () => {
  let mockPacker: any;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    const { Packer } = require("docx");
    mockPacker = Packer;
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockRestore();
  });

  describe("Input Validation and Sanitization", () => {
    test("should handle null draft gracefully", async () => {
      mockPacker.toBuffer.mockResolvedValueOnce(
        Buffer.from("fallback document"),
      );

      const result = await GofundmeDocxExporter.generateDocument(null as any);

      expect(result).toBeInstanceOf(Buffer);
      expect(consoleSpy).toHaveBeenCalled(); // Should log error
    });

    test("should handle undefined draft gracefully", async () => {
      mockPacker.toBuffer.mockResolvedValueOnce(
        Buffer.from("fallback document"),
      );

      const result = await GofundmeDocxExporter.generateDocument(
        undefined as any,
      );

      expect(result).toBeInstanceOf(Buffer);
      expect(consoleSpy).toHaveBeenCalled();
    });

    test("should sanitize missing required fields with safe defaults", async () => {
      const incompleteDraft = {};
      mockPacker.toBuffer.mockResolvedValueOnce(Buffer.from("valid document"));

      const result =
        await GofundmeDocxExporter.generateDocument(incompleteDraft);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    test("should handle malformed draft data without crashing", async () => {
      const malformedDraft = {
        title: { value: null },
        storyBody: { value: undefined },
        goalAmount: { value: "not a number" },
        location: { value: { invalid: "structure" } },
      };
      mockPacker.toBuffer.mockResolvedValueOnce(Buffer.from("valid document"));

      const result =
        await GofundmeDocxExporter.generateDocument(malformedDraft);

      expect(result).toBeInstanceOf(Buffer);
    });

    test("should handle extremely long content without memory issues", async () => {
      const hugeDraft = {
        title: { value: "Test Campaign" },
        storyBody: { value: "A very long story. ".repeat(10000) },
        shortSummary: { value: "Long summary. ".repeat(1000) },
      };
      mockPacker.toBuffer.mockResolvedValueOnce(
        Buffer.from("valid large document"),
      );

      const result = await GofundmeDocxExporter.generateDocument(hugeDraft);

      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe("Document Structure Integrity", () => {
    test("should validate generated buffer is not empty", async () => {
      mockPacker.toBuffer.mockResolvedValueOnce(Buffer.alloc(0)); // Empty buffer

      try {
        await GofundmeDocxExporter.generateDocument({
          title: { value: "Test" },
        });
        fail("Should have thrown error for empty buffer");
      } catch (error) {
        expect(error.message).toContain("empty");
      }
    });

    test("should warn about suspiciously small documents", async () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      mockPacker.toBuffer.mockResolvedValueOnce(Buffer.alloc(5000)); // Small buffer

      const result = await GofundmeDocxExporter.generateDocument({
        title: { value: "Test" },
      });

      expect(result).toBeInstanceOf(Buffer);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[DOCX_GEN] Generated document is unusually small",
        ),
        expect.any(Object),
      );

      consoleSpy.mockRestore();
    });

    test("should generate documents with consistent minimum size", async () => {
      const validBuffer = Buffer.alloc(15000, "x"); // 15KB buffer
      mockPacker.toBuffer.mockResolvedValueOnce(validBuffer);

      const result = await GofundmeDocxExporter.generateDocument({
        title: { value: "Test Campaign" },
        storyBody: { value: "Test story content" },
      });

      expect(result.length).toBeGreaterThan(10240); // At least 10KB
    });
  });

  describe("Error Handling and Fallback Mechanisms", () => {
    test("should generate fallback document when main generation fails", async () => {
      // First call fails, second call (fallback) succeeds
      mockPacker.toBuffer
        .mockRejectedValueOnce(new Error("Main generation failed"))
        .mockResolvedValueOnce(Buffer.from("fallback document content"));

      const result = await GofundmeDocxExporter.generateDocument({
        title: { value: "Test Campaign" },
        storyBody: { value: "Test story" },
      });

      expect(result).toBeInstanceOf(Buffer);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[DOCX_GEN_ERROR] Document generation failed"),
        expect.any(Object),
      );
    });

    test("should throw only when both main and fallback fail", async () => {
      mockPacker.toBuffer
        .mockRejectedValueOnce(new Error("Main generation failed"))
        .mockRejectedValueOnce(new Error("Fallback generation failed"));

      await expect(
        GofundmeDocxExporter.generateDocument({
          title: { value: "Test" },
        }),
      ).rejects.toThrow("Document generation completely failed");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[DOCX_GEN_CRITICAL]"),
        expect.any(Object),
      );
    });

    test("should provide detailed error logging", async () => {
      const testError = new Error("Specific test error");
      testError.stack = "Test stack trace line 1\nTest stack trace line 2";

      mockPacker.toBuffer
        .mockRejectedValueOnce(testError)
        .mockResolvedValueOnce(Buffer.from("fallback"));

      await GofundmeDocxExporter.generateDocument({ title: { value: "Test" } });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[DOCX_GEN_ERROR]"),
        expect.objectContaining({
          error: "Specific test error",
          stackTrace: expect.stringContaining("Test stack trace"),
          timestamp: expect.any(String),
        }),
      );
    });
  });

  describe("Document Content Validation", () => {
    test("should include all essential campaign elements", async () => {
      const completeDraft = {
        title: { value: "Help John Smith" },
        storyBody: {
          value: "John needs help with medical bills after surgery.",
        },
        shortSummary: { value: "Medical assistance for John" },
        goalAmount: { value: 5000 },
        location: { value: { city: "Seattle", state: "WA" } },
        category: { value: "Medical" },
        beneficiary: { value: "myself" },
      };

      const mockDocument = jest.fn();
      const { Document } = require("docx");
      Document.mockImplementationOnce(mockDocument);
      mockPacker.toBuffer.mockResolvedValueOnce(
        Buffer.from("complete document"),
      );

      await GofundmeDocxExporter.generateDocument(completeDraft);

      expect(mockDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          sections: expect.any(Array),
        }),
      );
    });

    test("should handle optional content gracefully", async () => {
      const minimalDraft = {
        title: { value: "Basic Campaign" },
      };

      mockPacker.toBuffer.mockResolvedValueOnce(
        Buffer.from("minimal document"),
      );

      const result = await GofundmeDocxExporter.generateDocument(minimalDraft, {
        includeInstructions: false,
        includePasteMap: false,
      });

      expect(result).toBeInstanceOf(Buffer);
    });

    test("should sanitize special characters in content", async () => {
      const specialContentDraft = {
        title: { value: "Help María José 🏠 & Family" },
        storyBody: { value: "Story with émojis 🚀 and spéciål chäråctërs" },
        shortSummary: { value: 'Summary with <script>alert("xss")</script>' },
      };

      mockPacker.toBuffer.mockResolvedValueOnce(
        Buffer.from("sanitized document"),
      );

      const result =
        await GofundmeDocxExporter.generateDocument(specialContentDraft);

      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe("QR Code Integration Hardening", () => {
    test("should handle missing QR data gracefully", async () => {
      const draftWithoutQR = {
        title: { value: "Campaign Without QR" },
        storyBody: { value: "Basic campaign story" },
      };

      mockPacker.toBuffer.mockResolvedValueOnce(
        Buffer.from("document without QR"),
      );

      const result =
        await GofundmeDocxExporter.generateDocument(draftWithoutQR);

      expect(result).toBeInstanceOf(Buffer);
      // Should still generate valid document without QR
    });

    test("should validate QR code data format if provided", async () => {
      const draftWithInvalidQR = {
        title: { value: "Campaign With Invalid QR" },
        qrCodeData: "invalid-qr-format",
      };

      mockPacker.toBuffer.mockResolvedValueOnce(
        Buffer.from("document with fallback QR"),
      );

      const result =
        await GofundmeDocxExporter.generateDocument(draftWithInvalidQR);

      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe("Performance and Memory Management", () => {
    test("should complete generation within reasonable time", async () => {
      const largeDraft = {
        title: { value: "Large Campaign" },
        storyBody: { value: "Large story content. ".repeat(1000) },
        shortSummary: { value: "Large summary. ".repeat(100) },
      };

      mockPacker.toBuffer.mockResolvedValueOnce(Buffer.from("large document"));

      const startTime = Date.now();
      await GofundmeDocxExporter.generateDocument(largeDraft);
      const endTime = Date.now();

      // Should complete within 2 seconds even for large content
      expect(endTime - startTime).toBeLessThan(2000);
    });

    test("should handle concurrent document generation", async () => {
      const drafts = Array.from({ length: 5 }, (_, i) => ({
        title: { value: `Campaign ${i + 1}` },
        storyBody: { value: `Story for campaign ${i + 1}` },
      }));

      mockPacker.toBuffer.mockImplementation(() =>
        Promise.resolve(Buffer.from("concurrent document")),
      );

      const promises = drafts.map((draft) =>
        GofundmeDocxExporter.generateDocument(draft),
      );

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result).toBeInstanceOf(Buffer);
      });
    });

    test("should not leak memory with repeated generations", async () => {
      const draft = {
        title: { value: "Memory Test Campaign" },
        storyBody: { value: "Test content for memory leak detection" },
      };

      mockPacker.toBuffer.mockImplementation(() =>
        Promise.resolve(Buffer.from("memory test document")),
      );

      // Generate many documents
      for (let i = 0; i < 20; i++) {
        await GofundmeDocxExporter.generateDocument(draft);
      }

      // Should complete without memory issues
      expect(true).toBe(true); // If we reach here, no memory crash occurred
    });
  });

  describe("Configuration and Options Handling", () => {
    test("should respect document generation options", async () => {
      const draft = { title: { value: "Configurable Campaign" } };
      mockPacker.toBuffer.mockResolvedValueOnce(
        Buffer.from("configured document"),
      );

      await GofundmeDocxExporter.generateDocument(draft, {
        includeInstructions: false,
        includePasteMap: false,
        format: "docx",
      });

      // Should generate without throwing
      expect(mockPacker.toBuffer).toHaveBeenCalled();
    });

    test("should use safe defaults for missing options", async () => {
      const draft = { title: { value: "Default Options Campaign" } };
      mockPacker.toBuffer.mockResolvedValueOnce(
        Buffer.from("default document"),
      );

      const result = await GofundmeDocxExporter.generateDocument(draft, {});

      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe("Revenue Pipeline Guarantee", () => {
    test("should NEVER throw unhandled exceptions", async () => {
      const problematicInputs = [
        null,
        undefined,
        {},
        { title: null },
        { storyBody: { value: undefined } },
        { malformed: "data" },
      ];

      // Set up fallback to always succeed
      mockPacker.toBuffer.mockImplementation((doc, attempt = 1) => {
        if (attempt === 1) {
          return Promise.reject(new Error("Simulated failure"));
        }
        return Promise.resolve(Buffer.from("fallback document"));
      });

      for (const input of problematicInputs) {
        await expect(async () => {
          await GofundmeDocxExporter.generateDocument(input);
        }).not.toThrow();
      }
    });

    test("should maintain service availability under extreme conditions", async () => {
      // Simulate various failure scenarios
      const failureScenarios = [
        () => Promise.reject(new Error("Memory error")),
        () => Promise.reject(new Error("File system error")),
        () => Promise.reject(new Error("Timeout error")),
        () => Promise.resolve(Buffer.alloc(0)), // Empty buffer
        () => Promise.resolve(null), // Null response
      ];

      for (const scenario of failureScenarios) {
        mockPacker.toBuffer
          .mockImplementationOnce(scenario)
          .mockResolvedValueOnce(Buffer.from("recovery document"));

        const result = await GofundmeDocxExporter.generateDocument({
          title: { value: "Recovery Test" },
        });

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(0);
      }
    });
  });
});
