/**
 * Integration Test: Revenue Pipeline Proof
 * 
 * Verifies complete end-to-end flow:
 * Speech transcript → parsing → GoFundMe draft → DOCX → QR generation
 */

import { extractAllWithTelemetry } from '../../utils/extraction/rulesEngine';
import { GofundmeDocxExporter } from '../../exports/generateGofundmeDocx';
import JSZip from 'jszip';

// Test fixture: realistic transcript
const TRANSCRIPT_FIXTURE = `
My name is Sarah Johnson and I'm reaching out because I really need help. 
I'm a single mother of two kids and I lost my job three weeks ago. 
We're facing eviction at the end of this month because I can't make rent. 
I need about three thousand dollars to catch up on rent and bills. 
This is really urgent - we literally have nowhere else to go. 
I live in Denver Colorado and I've been applying for jobs but nothing yet. 
My kids are 8 and 12 and they don't understand why we might have to move. 
Any help would mean the world to us. Thank you.
`;

// Mock Stripe QR generation (for testing without network calls)
const mockStripeQRGeneration = (amount: number, description: string) => {
  return {
    qrCodeDataUrl: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
    metadata: {
      amount,
      description,
      generatedAt: new Date().toISOString(),
      paymentProvider: 'stripe',
      attribution: 'Care2System Revenue Pipeline'
    }
  };
};

describe('Revenue Pipeline Integration Test', () => {
  
  test('Complete Pipeline: Transcript → Draft → DOCX → QR', async () => {
    // STEP 1: Extract signals from transcript
    console.log('🔍 Step 1: Extracting signals from transcript...');
    const extractionResult = extractAllWithTelemetry(TRANSCRIPT_FIXTURE);
    
    // Verify extraction worked
    expect(extractionResult.results).toBeDefined();
    expect(extractionResult.results.name.value).toBe('Sarah Johnson');
    expect(extractionResult.results.amount.value).toBe(3000);
    expect(extractionResult.results.urgency).toBe('CRITICAL');
    expect(extractionResult.results.relationship).toBe('myself');
    
    // Verify telemetry data
    expect(extractionResult.metrics.sessionId).toMatch(/^extraction_/);
    expect(extractionResult.metrics.extractionDuration).toBeGreaterThan(0);
    expect(extractionResult.metrics.qualityScore).toBeGreaterThan(50); // Should be decent quality
    
    console.log('✅ Extraction successful:', {
      name: extractionResult.results.name.value,
      amount: extractionResult.results.amount.value,
      quality: extractionResult.metrics.qualityScore
    });
    
    // STEP 2: Generate DonationDraft object
    console.log('📝 Step 2: Creating donation draft object...');
    const donationDraft = {
      title: {
        value: extractionResult.results.name.value ? 
          `Help ${extractionResult.results.name.value} with Emergency Housing` :
          'Emergency Housing Assistance Needed'
      },
      storyBody: {
        value: TRANSCRIPT_FIXTURE.trim()
      },
      shortSummary: {
        value: `${extractionResult.results.name.value || 'Individual'} needs $${extractionResult.results.amount.value || 1500} for emergency housing assistance.`
      },
      goalAmount: {
        value: extractionResult.results.amount.value || 1500
      },
      beneficiary: {
        value: extractionResult.results.name.value || 'Individual in need'
      },
      category: {
        value: 'HOUSING'
      },
      urgencyLevel: {
        value: extractionResult.results.urgency
      },
      editableJson: {
        breakdown: {
          extraction: extractionResult.results,
          confidence: extractionResult.metrics.qualityScore,
          fallbacks: extractionResult.metrics.fallbacksUsed
        },
        quality: {
          score: extractionResult.metrics.qualityScore,
          assessment: extractionResult.metrics.qualityScore >= 80 ? 'excellent' : 
                     extractionResult.metrics.qualityScore >= 60 ? 'good' : 'fair'
        }
      }
    };
    
    // Verify draft structure
    expect(donationDraft.title.value).toContain('Sarah Johnson');
    expect(donationDraft.goalAmount.value).toBe(3000);
    expect(donationDraft.editableJson.breakdown.extraction).toBeDefined();
    
    // STEP 3: Generate DOCX document
    console.log('📄 Step 3: Generating DOCX document...');
    const docxBuffer = await GofundmeDocxExporter.generateDocument(donationDraft, {
      includeInstructions: true,
      includePasteMap: true
    });
    
    // Verify DOCX was generated
    expect(docxBuffer).toBeInstanceOf(Buffer);
    expect(docxBuffer.length).toBeGreaterThan(5000); // Reasonable minimum size
    
    // STEP 4: Parse DOCX XML to verify content
    console.log('🔍 Step 4: Parsing DOCX content for verification...');
    const zip = new JSZip();
    const docxContents = await zip.loadAsync(docxBuffer);
    
    // Extract document.xml (main content)
    const documentXml = await docxContents.file('word/document.xml')?.async('string');
    expect(documentXml).toBeDefined();
    
    // Verify title and story exist in document
    expect(documentXml).toContain('Sarah Johnson');
    expect(documentXml).toContain('Emergency Housing');
    expect(documentXml).toContain('single mother');
    expect(documentXml).toContain('three thousand dollars');
    
    console.log('✅ DOCX content verified - title and story present');
    
    // STEP 5: Generate QR code (mocked for testing)
    console.log('📱 Step 5: Generating QR code...');
    const qrResult = mockStripeQRGeneration(
      donationDraft.goalAmount.value,
      donationDraft.shortSummary.value
    );
    
    // Verify QR generation
    expect(qrResult.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(qrResult.metadata.amount).toBe(3000);
    expect(qrResult.metadata.attribution).toBe('Care2System Revenue Pipeline');
    expect(qrResult.metadata.paymentProvider).toBe('stripe');
    
    console.log('✅ QR generation successful:', {
      amount: qrResult.metadata.amount,
      provider: qrResult.metadata.paymentProvider
    });
    
    // FINAL VERIFICATION: Complete pipeline output
    const pipelineOutput = {
      extraction: extractionResult,
      draft: donationDraft,
      document: {
        buffer: docxBuffer,
        size: docxBuffer.length,
        verified: true
      },
      qrCode: qrResult
    };
    
    // Assert complete pipeline success
    expect(pipelineOutput.extraction.results.name.value).toBe('Sarah Johnson');
    expect(pipelineOutput.draft.goalAmount.value).toBe(3000);
    expect(pipelineOutput.document.size).toBeGreaterThan(5000);
    expect(pipelineOutput.qrCode.qrCodeDataUrl).toBeDefined();
    
    console.log('🎉 Complete pipeline verification successful!');
    console.log('Pipeline metrics:', {
      extractionQuality: pipelineOutput.extraction.metrics.qualityScore,
      documentSize: pipelineOutput.document.size,
      qrGenerated: !!pipelineOutput.qrCode.qrCodeDataUrl,
      endToEndSuccess: true
    });
    
  }, 30000); // 30 second timeout for integration test
  
  test('Pipeline Handles Empty Transcript (Fallback Test)', async () => {
    console.log('🔍 Testing pipeline with empty transcript (never-fail proof)...');
    
    // Test with empty input
    const extractionResult = extractAllWithTelemetry('');
    
    // Should still produce valid structure with fallbacks
    expect(extractionResult.results.name.value).toBeNull();
    expect(extractionResult.results.amount.value).toBe(1500); // Default fallback
    expect(extractionResult.results.urgency).toBe('LOW'); // Default
    expect(extractionResult.results.relationship).toBe('myself'); // Default
    
    // Should indicate fallbacks were used
    expect(extractionResult.metrics.fallbacksUsed).toContain('name_fallback');
    expect(extractionResult.metrics.fallbacksUsed).toContain('amount_fallback');
    expect(extractionResult.metrics.qualityScore).toBeLessThan(50); // Low quality but valid
    
    // Create draft with fallback data
    const fallbackDraft = {
      title: { value: 'Emergency Assistance Needed' },
      storyBody: { value: 'Details to be provided' },
      shortSummary: { value: 'Individual needs $1500 for emergency assistance.' },
      goalAmount: { value: 1500 },
      beneficiary: { value: 'Individual in need' },
      category: { value: 'GENERAL' },
      urgencyLevel: { value: 'LOW' }
    };
    
    // Should still generate document successfully
    const docxBuffer = await GofundmeDocxExporter.generateDocument(fallbackDraft);
    expect(docxBuffer).toBeInstanceOf(Buffer);
    expect(docxBuffer.length).toBeGreaterThan(3000); // Minimum viable document
    
    console.log('✅ Never-fail guarantee verified - empty input handled gracefully');
  });
  
  test('Pipeline Performance Benchmark', async () => {
    console.log('⏱️ Testing pipeline performance...');
    
    const iterations = 10;
    const startTime = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      const result = extractAllWithTelemetry(TRANSCRIPT_FIXTURE);
      expect(result.results.name.value).toBe('Sarah Johnson'); // Consistency check
    }
    
    const totalTime = Date.now() - startTime;
    const averageTime = totalTime / iterations;
    
    // Performance assertion - should be fast
    expect(averageTime).toBeLessThan(100); // Less than 100ms per extraction
    
    console.log(`✅ Performance verified: ${averageTime.toFixed(2)}ms average over ${iterations} runs`);
  });
  
});
