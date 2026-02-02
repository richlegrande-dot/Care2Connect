import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Phase 6: Document Generation Service
 * 
 * Creates Word documents for donation campaigns
 * - GoFundMe-style drafts
 * - Receipts
 * - Other documents
 */

export interface GenerateDocumentOptions {
  ticketId: string;
  docType: 'GOFUNDME_DRAFT' | 'RECEIPT' | 'OTHER';
  outputPath?: string; // If not provided, uses default storage location
}

export interface GenerateDocumentResult {
  success: boolean;
  documentId?: string;
  filePath?: string;
  error?: string;
}

/**
 * Generate a Word document for a RecordingTicket
 */
export async function generateDocument(options: GenerateDocumentOptions): Promise<GenerateDocumentResult> {
  try {
    console.log(`[DocGen] Generating ${options.docType} for ticket ${options.ticketId}`);

    // Retrieve ticket with draft
    const ticket = await prisma.recordingTicket.findUnique({
      where: { id: options.ticketId },
      include: {
        donationDraft: true,
        transcriptionSessions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      throw new Error(`Ticket ${options.ticketId} not found`);
    }

    if (!ticket.donationDraft && options.docType === 'GOFUNDME_DRAFT') {
      throw new Error(`No donation draft found for ticket ${options.ticketId}`);
    }

    // Generate document based on type
    let doc: Document;
    let filename: string;

    switch (options.docType) {
      case 'GOFUNDME_DRAFT':
        doc = await generateGoFundMeDraft(ticket, ticket.donationDraft!);
        filename = `gofundme-draft-${ticket.id}.docx`;
        break;
      
      case 'RECEIPT':
        doc = await generateReceipt(ticket);
        filename = `receipt-${ticket.id}.docx`;
        break;
      
      default:
        throw new Error(`Unsupported document type: ${options.docType}`);
    }

    // Determine output path
    const outputDir = options.outputPath 
      ? path.dirname(options.outputPath)
      : path.join(process.cwd(), 'storage', 'documents');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = options.outputPath || path.join(outputDir, filename);

    // Generate and save document
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);

    console.log(`[DocGen] Document saved to: ${filePath}`);

    // Store reference in database
    const generatedDoc = await prisma.generatedDocument.create({
      data: {
        ticketId: options.ticketId,
        docType: options.docType,
        filePath,
      },
    });

    return {
      success: true,
      documentId: generatedDoc.id,
      filePath,
    };

  } catch (error: any) {
    console.error('[DocGen] Error generating document:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate a GoFundMe-style draft document
 */
async function generateGoFundMeDraft(ticket: any, draft: any): Promise<Document> {
  const sections = [];

  // Title
  sections.push(
    new Paragraph({
      text: draft.title || 'Campaign Title',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Goal Amount
  if (draft.goalAmount) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Goal: ${draft.currency || 'USD'} $${draft.goalAmount.toLocaleString()}`,
            bold: true,
            size: 28,
          }),
        ],
        spacing: { before: 200, after: 400 },
      })
    );
  }

  // Beneficiary
  if (draft.beneficiaryName) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Beneficiary: ',
            bold: true,
          }),
          new TextRun({
            text: draft.beneficiaryName,
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Location
  if (draft.beneficiaryLocation) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Location: ',
            bold: true,
          }),
          new TextRun({
            text: draft.beneficiaryLocation,
          }),
        ],
        spacing: { after: 400 },
      })
    );
  }

  // Story Header
  sections.push(
    new Paragraph({
      text: 'Campaign Story',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  // Story Text (split into paragraphs)
  const storyParagraphs = draft.story.split('\n').filter((p: string) => p.trim().length > 0);
  for (const paragraph of storyParagraphs) {
    sections.push(
      new Paragraph({
        text: paragraph.trim(),
        spacing: { after: 200 },
      })
    );
  }

  // Breakdown (if available)
  if (draft.editableJson && draft.editableJson.breakdown && draft.editableJson.breakdown.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Key Points',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    for (const point of draft.editableJson.breakdown) {
      sections.push(
        new Paragraph({
          text: `• ${point}`,
          spacing: { after: 100 },
        })
      );
    }
  }

  // Footer
  sections.push(
    new Paragraph({
      text: `Generated by Care2Connect`,
      italics: true,
      alignment: AlignmentType.CENTER,
      spacing: { before: 600 },
    })
  );

  sections.push(
    new Paragraph({
      text: `Date: ${new Date().toLocaleDateString()}`,
      italics: true,
      alignment: AlignmentType.CENTER,
      spacing: { before: 100 },
    })
  );

  return new Document({
    sections: [{
      properties: {},
      children: sections,
    }],
  });
}

/**
 * Generate a receipt document (placeholder for now)
 */
async function generateReceipt(ticket: any): Promise<Document> {
  return new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: 'Receipt',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `Ticket ID: ${ticket.id}`,
          spacing: { before: 400 },
        }),
        new Paragraph({
          text: `Date: ${new Date().toLocaleDateString()}`,
        }),
      ],
    }],
  });
}

/**
 * Get all generated documents for a ticket
 */
export async function getTicketDocuments(ticketId: string) {
  return await prisma.generatedDocument.findMany({
    where: { ticketId },
    orderBy: { createdAt: 'desc' },
  });
}

export default {
  generateDocument,
  getTicketDocuments,
};
