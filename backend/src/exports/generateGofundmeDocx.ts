import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Packer,
} from "docx";
import { GoFundMeDraft } from "../schemas/gofundmeDraft.schema";
import { TelemetryCollector } from "../services/telemetry";

export interface DocumentExportOptions {
  includeInstructions?: boolean;
  includePasteMap?: boolean;
  format?: "docx";
}

export class GofundmeDocxExporter {
  /**
   * Generate GoFundMe draft document with Phase 4 hardening
   * Includes comprehensive validation, integrity checks, and failsafe error handling
   */
  static async generateDocument(
    draft: GoFundMeDraft,
    options: DocumentExportOptions = {},
  ): Promise<Buffer> {
    // Phase 4: Input validation and sanitization
    if (!draft) {
      throw new Error("Draft data is required for document generation");
    }

    // Validate critical fields with safe defaults
    const safeTitle = draft.title?.value || "Untitled Campaign";
    const safeStory = draft.storyBody?.value || "Story content not provided";
    const safeSummary = draft.shortSummary?.value || "Summary not provided";

    console.log("[DOCX_GEN] Starting document generation", {
      title: safeTitle.substring(0, 50),
      hasStory: !!draft.storyBody?.value,
      timestamp: new Date().toISOString(),
    });

    const telemetrySessionId = `docgen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const telemetryStartTime = Date.now();

    try {
      const {
        includeInstructions = true,
        includePasteMap = true,
        format = "docx",
      } = options;

      // Create document with robust error handling
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Document header
              new Paragraph({
                children: [
                  new TextRun({
                    text: "GoFundMe Campaign Draft",
                    bold: true,
                    size: 32,
                  }),
                ],
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: `Generated on ${new Date().toLocaleDateString()}`,
                    italics: true,
                    size: 20,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 600 },
              }),

              // Campaign Details Section
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Campaign Details",
                    bold: true,
                    size: 28,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 },
              }),

              // Campaign Title
              this.createDetailRow("Campaign Title", safeTitle),

              // Category
              this.createDetailRow(
                "Category",
                draft.category?.value || "General",
              ),

              // Goal Amount
              this.createDetailRow(
                "Goal Amount",
                draft.goalAmount?.value
                  ? `$${draft.goalAmount.value.toLocaleString()}`
                  : "Not specified",
              ),

              // Location
              this.createDetailRow(
                "Location",
                this.formatLocation(draft.location?.value),
              ),

              // Beneficiary
              this.createDetailRow(
                "Beneficiary",
                this.formatBeneficiary(draft.beneficiary?.value ?? null),
              ),

              // Story Section
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Campaign Story",
                    bold: true,
                    size: 28,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 600, after: 200 },
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: safeStory,
                    size: 22,
                  }),
                ],
                spacing: { after: 300 },
              }),

              // Short Summary Section
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Short Summary",
                    bold: true,
                    size: 28,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 },
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: safeSummary,
                    size: 22,
                  }),
                ],
                spacing: { after: 400 },
              }),

              // GoFundMe Paste Instructions
              ...(includePasteMap ? this.generatePasteInstructions(draft) : []),

              // Setup Instructions
              ...(includeInstructions ? this.generateSetupInstructions() : []),
            ],
          },
        ],
      });

      // Generate buffer with error handling
      const buffer = await Packer.toBuffer(doc);

      // Phase 4: Document integrity validation
      if (!buffer || buffer.length === 0) {
        throw new Error("Generated document buffer is empty");
      }

      // Validate minimum DOCX file size (should be at least 10KB for a valid document)
      if (buffer.length < 10240) {
        console.warn("[DOCX_GEN] Generated document is unusually small", {
          size: buffer.length,
          timestamp: new Date().toISOString(),
        });
      }

      console.log("[DOCX_GEN] Document generation successful", {
        size: buffer.length,
        timestamp: new Date().toISOString(),
      });

      // Phase 5: Record successful document generation metrics
      TelemetryCollector.getInstance().recordDocumentMetrics(
        telemetrySessionId,
        {
          generationDuration: Date.now() - telemetryStartTime,
          documentSize: buffer.length,
          fallbackUsed: false,
          errorOccurred: false,
          includeInstructions,
          includePasteMap,
        },
      );

      return buffer;
    } catch (error) {
      // Phase 4: Never fail the revenue pipeline - provide fallback document
      console.error("[DOCX_GEN_ERROR] Document generation failed:", {
        error: error.message,
        stackTrace: error.stack?.slice(0, 300),
        timestamp: new Date().toISOString(),
      });

      try {
        // Generate minimal fallback document
        const fallbackDoc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "GoFundMe Campaign Draft",
                      bold: true,
                      size: 28,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 400 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Title: " + safeTitle,
                      size: 20,
                    }),
                  ],
                  spacing: { after: 200 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Story: " + safeStory,
                      size: 18,
                    }),
                  ],
                  spacing: { after: 200 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Summary: " + safeSummary,
                      size: 18,
                    }),
                  ],
                  spacing: { after: 400 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Note: This document was generated using fallback mode due to a system error.",
                      italics: true,
                      color: "red",
                    }),
                  ],
                }),
              ],
            },
          ],
        });

        const fallbackBuffer = await Packer.toBuffer(fallbackDoc);

        console.log("[DOCX_GEN] Fallback document generated successfully", {
          size: fallbackBuffer.length,
          timestamp: new Date().toISOString(),
        });

        // Phase 5: Record fallback document generation metrics
        TelemetryCollector.getInstance().recordDocumentMetrics(
          telemetrySessionId,
          {
            generationDuration: Date.now() - telemetryStartTime,
            documentSize: fallbackBuffer.length,
            fallbackUsed: true,
            errorOccurred: true,
            includeInstructions,
            includePasteMap,
          },
        );

        return fallbackBuffer;
      } catch (fallbackError) {
        console.error(
          "[DOCX_GEN_CRITICAL] Even fallback document generation failed:",
          {
            error: fallbackError.message,
            timestamp: new Date().toISOString(),
          },
        );

        throw new Error(
          "Document generation completely failed - unable to create even basic document",
        );
      }
    }
  }

  /**
   * Create a detail row paragraph
   */
  private static createDetailRow(label: string, value: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: `${label}: `,
          bold: true,
          size: 22,
        }),
        new TextRun({
          text: value,
          size: 22,
        }),
      ],
      spacing: { after: 100 },
    });
  }

  /**
   * Format location object to string
   */
  private static formatLocation(location: any): string {
    if (!location) return "Not specified";

    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.zip) parts.push(location.zip);
    if (location.country && location.country !== "United States")
      parts.push(location.country);

    return parts.length > 0 ? parts.join(", ") : "Not specified";
  }

  /**
   * Format beneficiary type
   */
  private static formatBeneficiary(beneficiary: string | null): string {
    switch (beneficiary) {
      case "myself":
        return "Myself";
      case "someone-else":
        return "Someone else";
      case "charity":
        return "Charity/Organization";
      default:
        return "Not specified";
    }
  }

  /**
   * Generate step-by-step paste instructions
   */
  private static generatePasteInstructions(draft: GoFundMeDraft): Paragraph[] {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: "GoFundMe Copy & Paste Guide",
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 600, after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Follow these steps to create your GoFundMe campaign:",
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: 'Step 1: Go to gofundme.com and click "Start a GoFundMe"',
            bold: true,
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Step 2: Choose category",
            bold: true,
            size: 20,
          }),
        ],
        spacing: { after: 50 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: `Select: ${draft.category?.value || "Choose appropriate category"}`,
            size: 18,
          }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Step 3: Set location",
            bold: true,
            size: 20,
          }),
        ],
        spacing: { after: 50 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: `Enter: ${this.formatLocation(draft.location?.value)}`,
            size: 18,
          }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Step 4: Title",
            bold: true,
            size: 20,
          }),
        ],
        spacing: { after: 50 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Copy and paste:",
            size: 18,
          }),
        ],
        spacing: { after: 50 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: draft.title?.value || "Enter your campaign title",
            italics: true,
            size: 18,
            color: "0066CC",
          }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Step 5: Story",
            bold: true,
            size: 20,
          }),
        ],
        spacing: { after: 50 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Copy and paste the entire story section above into the GoFundMe story field.",
            size: 18,
          }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Step 6: Goal Amount",
            bold: true,
            size: 20,
          }),
        ],
        spacing: { after: 50 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: `Enter: $${draft.goalAmount?.value?.toLocaleString() || "Enter your goal amount"}`,
            size: 18,
          }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Step 7: Add photos and finalize",
            bold: true,
            size: 20,
          }),
        ],
        spacing: { after: 50 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Add appropriate photos, review all details, and publish your campaign.",
            size: 18,
          }),
        ],
        spacing: { after: 400 },
      }),
    ];
  }

  /**
   * Generate general setup instructions
   */
  private static generateSetupInstructions(): Paragraph[] {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: "Important Notes",
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Keep this document for your records",
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• You can edit any content before pasting into GoFundMe",
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Add photos to make your campaign more engaging",
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Share your campaign on social media once published",
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Update your campaign regularly with progress",
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Thank your donors and keep them informed",
            size: 20,
          }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Generated by CareConnect - Supporting Our Community",
            italics: true,
            size: 16,
            color: "666666",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
      }),
    ];
  }
}

export default GofundmeDocxExporter;
