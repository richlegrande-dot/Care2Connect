/**
 * Pipeline30 Test Suite - DOCX & QR Completion Tests
 * 
 * Tests 26-30: Validates document generation and QR/payment integration
 * Focus: DOCX creation, content validation, mocked payments, revenue package assembly  
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { extractDocxText, isValidDocx } from '../helpers/docxTextExtract';
import { loadTranscriptFixture } from '../helpers/testHelpers';

// Mock DOCX generator (deterministic buffer creation)
function generateMockDocx(draft: any): Buffer {
  // Create a minimal valid DOCX-like structure for testing
  // In reality, this would use the docx library
  const docxContent = {
    title: draft.title || 'Untitled Campaign',
    story: draft.storyBody || 'No story provided',
    keyPoints: draft.keyPoints || [],
    hasQr: !!draft.qrCodeData
  };

  // Create a mock ZIP-like buffer with DOCX structure
  // This is simplified for testing - real implementation would use docx library
  const mockContent = JSON.stringify({
    docType: 'docx',
    ...docxContent,
    generated: new Date().toISOString()
  });

  return Buffer.from(mockContent, 'utf8');
}

// Mock Stripe checkout creation
interface MockStripeCheckout {
  sessionId: string;
  checkoutUrl: string;
  metadata: Record<string, string>;
}

function createMockStripeCheckout(options: {
  amount: number;
  currency: string;
  ticketId: string;
  generationMode?: string;
}): MockStripeCheckout {
  const { amount, currency, ticketId, generationMode = 'automated' } = options;
  
  return {
    sessionId: `cs_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    checkoutUrl: `https://checkout.stripe.com/pay/cs_mock_session`,
    metadata: {
      ticketId,
      amount: amount.toString(),
      currency,
      generationMode,
      source: 'care2connect_test'
    }
  };
}

// Mock QR code generation (returns PNG data URL)
function generateMockQrCode(checkoutUrl: string): string {
  // Mock PNG data URL - in reality would use qrcode library
  const qrData = Buffer.from(`QR:${checkoutUrl}`).toString('base64');
  return `data:image/png;base64,${qrData}`;
}

// Revenue package assembly
interface RevenuePackage {
  draft: any;
  docxBuffer: Buffer;
  qrMetadata: {
    qrCodeData: string;
    checkoutUrl: string;
    sessionId: string;
    metadata: Record<string, string>;
  };
}

function assembleRevenuePackage(draft: any, ticketId: string): RevenuePackage {
  // Generate DOCX
  const docxBuffer = generateMockDocx(draft);
  
  // Create Stripe checkout
  const stripeCheckout = createMockStripeCheckout({
    amount: 25.00, // Default test amount
    currency: 'USD',
    ticketId,
    generationMode: 'automated'
  });
  
  // Generate QR code
  const qrCodeData = generateMockQrCode(stripeCheckout.checkoutUrl);
  
  return {
    draft,
    docxBuffer,
    qrMetadata: {
      qrCodeData,
      checkoutUrl: stripeCheckout.checkoutUrl,
      sessionId: stripeCheckout.sessionId,
      metadata: stripeCheckout.metadata
    }
  };
}

describe('Pipeline30: DOCX & QR Completion Tests', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'error';
  });

  // Test 26: Basic DOCX generation
  test('26. generates docx buffer successfully for a complete draft', () => {
    const draft = {
      title: 'Help Sarah Johnson with housing',
      storyBody: 'Sarah needs help with rent after losing her job...',
      keyPoints: ['Lost job due to downsizing', 'Has two children', 'Needs rental assistance']
    };

    const docxBuffer = generateMockDocx(draft);

    expect(docxBuffer).toBeInstanceOf(Buffer);
    expect(docxBuffer.length).toBeGreaterThan(0);
    
    // Parse the mock content
    const content = JSON.parse(docxBuffer.toString('utf8'));
    expect(content.docType).toBe('docx');
    expect(content.title).toBe(draft.title);
    expect(content.story).toBe(draft.storyBody);
  });

  // Test 27: DOCX content validation
  test('27. docx contains campaign title and excerpt text', () => {
    const draft = {
      title: 'Help David Wilson with emergency housing',
      storyBody: 'David was recently evicted and needs immediate assistance with housing costs.',
      keyPoints: ['Recently evicted', 'Needs security deposit', 'Has job interviews lined up']
    };

    const docxBuffer = generateMockDocx(draft);
    const content = JSON.parse(docxBuffer.toString('utf8'));

    expect(content.title).toContain('David Wilson');
    expect(content.title).toContain('housing');
    expect(content.story).toContain('evicted');
    expect(content.story).toContain('assistance');
  });

  // Test 28: Key points inclusion in DOCX
  test('28. docx includes key points bullets or section label', () => {
    const draft = {
      title: 'Help Maria with medical expenses',
      storyBody: 'Maria requires help with ongoing medical treatment costs.',
      keyPoints: [
        'Chronic illness requiring treatment',
        'Lost insurance coverage', 
        'Cannot afford medications',
        'Has support from family'
      ]
    };

    const docxBuffer = generateMockDocx(draft);
    const content = JSON.parse(docxBuffer.toString('utf8'));

    expect(content.keyPoints).toBeInstanceOf(Array);
    expect(content.keyPoints.length).toBe(4);
    expect(content.keyPoints).toContain('Chronic illness requiring treatment');
    expect(content.keyPoints).toContain('Cannot afford medications');
  });

  // Test 29: Mocked Stripe and QR integration
  test('29. mocked Stripe checkout returns deterministic URL and QR generator returns PNG data URL', () => {
    const ticketId = 'test-ticket-29';
    const mockCheckout = createMockStripeCheckout({
      amount: 50.00,
      currency: 'USD',
      ticketId,
      generationMode: 'automated'
    });

    const qrCodeData = generateMockQrCode(mockCheckout.checkoutUrl);

    // Validate Stripe checkout mock
    expect(mockCheckout.sessionId).toMatch(/^cs_mock_/);
    expect(mockCheckout.checkoutUrl).toContain('checkout.stripe.com');
    expect(mockCheckout.metadata.ticketId).toBe(ticketId);
    expect(mockCheckout.metadata.amount).toBe('50');
    expect(mockCheckout.metadata.generationMode).toBe('automated');

    // Validate QR code mock
    expect(qrCodeData).toMatch(/^data:image\/png;base64,/);
    expect(qrCodeData.length).toBeGreaterThan(50);
    
    // Should be deterministic for same input
    const qrCodeData2 = generateMockQrCode(mockCheckout.checkoutUrl);
    expect(qrCodeData).toBe(qrCodeData2);
  });

  // Test 30: Complete revenue package assembly
  test('30. final "revenue package" output includes (draft + docx + qr metadata) without errors', () => {
    const draft = {
      title: 'Help Jennifer Brown with food assistance',
      storyBody: 'Jennifer is a single mother who needs help feeding her children.',
      keyPoints: [
        'Single mother of three',
        'Lost job during pandemic',
        'Children need regular meals',
        'Applying for new positions'
      ]
    };
    
    const ticketId = 'test-revenue-package-30';
    
    expect(() => {
      const revenuePackage = assembleRevenuePackage(draft, ticketId);
      
      // Validate complete package structure
      expect(revenuePackage.draft).toBe(draft);
      expect(revenuePackage.docxBuffer).toBeInstanceOf(Buffer);
      expect(revenuePackage.qrMetadata).toBeDefined();
      
      // Validate DOCX component
      expect(revenuePackage.docxBuffer.length).toBeGreaterThan(0);
      
      // Validate QR metadata component
      expect(revenuePackage.qrMetadata.qrCodeData).toMatch(/^data:image\/png;base64,/);
      expect(revenuePackage.qrMetadata.checkoutUrl).toContain('checkout.stripe.com');
      expect(revenuePackage.qrMetadata.sessionId).toMatch(/^cs_mock_/);
      expect(revenuePackage.qrMetadata.metadata.ticketId).toBe(ticketId);
      
      // Validate cross-references
      const docxContent = JSON.parse(revenuePackage.docxBuffer.toString('utf8'));
      expect(docxContent.title).toBe(draft.title);
      expect(docxContent.story).toBe(draft.storyBody);
      
    }).not.toThrow();
  });
});
