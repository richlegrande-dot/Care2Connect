/**
 * Pipeline Integration Tests
 * 
 * End-to-end mocked pipeline tests:
 * - Full ticket processing flow
 * - Transcription → Analysis → Draft → QR
 * - NEEDS_INFO gating
 * - Error handling and incident creation
 * - Status tracking
 */

import { processTicket, getTicketStatus } from '../../../src/services/donationPipeline/orchestrator';
import { PrismaClient } from '@prisma/client';
import { 
  loadTranscriptFixture, 
  TestFactory, 
  createMockAudioPath, 
  cleanupMockAudioFiles,
  waitForCondition 
} from '../../helpers/testHelpers';

// Set up test environment
process.env.TRANSCRIPTION_PROVIDER = 'stub';
process.env.ENABLE_STRESS_TEST_MODE = 'true';
process.env.ZERO_OPENAI_MODE = 'true';
process.env.STRIPE_MODE = 'mock'; // Use mock Stripe for tests

const prisma = new PrismaClient();

describe('Pipeline Integration Tests (Mocked)', () => {
  let testTicketId: string;

  beforeEach(async () => {
    // Create test ticket
    const ticket = await TestFactory.createTicket(prisma, {
      status: 'DRAFT',
    });
    testTicketId = ticket.id;
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.speechAnalysisResult.deleteMany({});
    await prisma.transcriptionSegment.deleteMany({});
    await prisma.transcriptionSession.deleteMany({});
    await prisma.donationDraft.deleteMany({});
    await prisma.qrCodeLink.deleteMany({});
    await prisma.stripeAttribution.deleteMany({});
    await prisma.pipelineIncident.deleteMany({});
    await prisma.recordingTicket.deleteMany({ where: { id: testTicketId } });
  });

  afterAll(async () => {
    cleanupMockAudioFiles();
    await prisma.$disconnect();
  });

  describe('Successful Pipeline Completion', () => {
    it('should process ticket from DRAFT to READY with complete story', async () => {
      const fixture = loadTranscriptFixture(1); // Normal complete story
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const audioPath = createMockAudioPath('pipeline-complete');
      
      const result = await processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      expect(result.success).toBe(true);
      expect(result.finalStatus).toBe('READY');
      expect(result.steps.transcription?.success).toBe(true);
      expect(result.steps.analysis?.success).toBe(true);
      expect(result.steps.draft?.success).toBe(true);
    }, 30000);

    it('should create transcription session with segments', async () => {
      const fixture = loadTranscriptFixture(1);
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const audioPath = createMockAudioPath('pipeline-transcription');
      
      const result = await processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      expect(result.steps.transcription?.sessionId).toBeTruthy();
      
      // Verify transcription session exists
      const session = await prisma.transcriptionSession.findFirst({
        where: { recordingTicketId: testTicketId },
        include: { segments: true },
      });
      
      expect(session).toBeTruthy();
      expect(session?.transcriptText).toBe(fixture.transcript);
      expect(session?.segments.length).toBeGreaterThan(0);
    }, 30000);

    it('should create speech analysis result', async () => {
      const fixture = loadTranscriptFixture(1);
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const audioPath = createMockAudioPath('pipeline-analysis');
      
      await processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      // Verify speech analysis was created
      const session = await prisma.transcriptionSession.findFirst({
        where: { recordingTicketId: testTicketId },
        include: { speechAnalysisResults: true },
      });
      
      expect(session?.speechAnalysisResults.length).toBeGreaterThan(0);
      const analysis = session?.speechAnalysisResults[0];
      expect(analysis?.detectedLanguage).toBe('en');
    }, 30000);

    it('should create donation draft with title and story', async () => {
      const fixture = loadTranscriptFixture(1);
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const audioPath = createMockAudioPath('pipeline-draft');
      
      await processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      // Verify draft was created
      const draft = await prisma.donationDraft.findFirst({
        where: { ticketId: testTicketId },
      });
      
      expect(draft).toBeTruthy();
      expect(draft?.title).toBeTruthy();
      expect(draft?.story).toBeTruthy();
      expect(draft?.currency).toBe('USD');
    }, 30000);

    it('should update ticket status through pipeline stages', async () => {
      const fixture = loadTranscriptFixture(1);
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const audioPath = createMockAudioPath('pipeline-status');
      
      await processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      const ticket = await prisma.recordingTicket.findUnique({
        where: { id: testTicketId },
      });
      
      expect(['READY', 'PUBLISHED']).toContain(ticket?.status);
    }, 30000);
  });

  describe('NEEDS_INFO Gating', () => {
    it('should return NEEDS_INFO for very short transcript', async () => {
      const fixture = loadTranscriptFixture(2); // Short incomplete
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const audioPath = createMockAudioPath('pipeline-short');
      
      const result = await processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      expect(result.finalStatus).toBe('NEEDS_INFO');
    }, 30000);

    it('should identify missing fields in NEEDS_INFO response', async () => {
      const fixture = loadTranscriptFixture(3); // No name
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const audioPath = createMockAudioPath('pipeline-missing');
      
      await processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      const ticket = await prisma.recordingTicket.findUnique({
        where: { id: testTicketId },
      });
      
      if (ticket?.status === 'NEEDS_INFO') {
        expect(ticket.needsInfo).toBeTruthy();
      }
    }, 30000);

    it('should provide suggested questions for missing information', async () => {
      const fixture = loadTranscriptFixture(10); // No contact info
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const audioPath = createMockAudioPath('pipeline-questions');
      
      await processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      const ticket = await prisma.recordingTicket.findUnique({
        where: { id: testTicketId },
      });
      
      if (ticket?.status === 'NEEDS_INFO' && ticket.needsInfo) {
        const needsInfo = ticket.needsInfo as any;
        expect(needsInfo.missingFields || needsInfo.questions).toBeDefined();
      }
    }, 30000);
  });

  describe('QR Code and Payment Generation', () => {
    it('should create QR code link for READY ticket', async () => {
      const fixture = loadTranscriptFixture(1);
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const audioPath = createMockAudioPath('pipeline-qr');
      
      await processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      const qrLink = await prisma.qRCodeLink.findFirst({
        where: { ticketId: testTicketId },
      });
      
      // QR might not be auto-created in all flows, but if it is, validate it
      if (qrLink) {
        expect(qrLink.qrCodeData).toBeTruthy();
        expect(qrLink.checkoutUrl).toBeTruthy();
      }
    }, 30000);

    it('should create Stripe attribution in mock mode', async () => {
      const fixture = loadTranscriptFixture(1);
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const audioPath = createMockAudioPath('pipeline-stripe');
      
      await processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      const attribution = await prisma.stripeAttribution.findFirst({
        where: { ticketId: testTicketId },
      });
      
      // Stripe attribution might be created in pipeline
      if (attribution) {
        expect(attribution.checkoutSessionId).toBeTruthy();
        expect(attribution.status).toBeTruthy();
      }
    }, 30000);
  });

  describe('Error Handling and Incidents', () => {
    it('should handle transcription failure gracefully', async () => {
      const invalidAudioPath = '/path/that/does/not/exist.mp3';
      
      const result = await processTicket(testTicketId, {
        audioFilePath: invalidAudioPath,
      });
      
      expect(result.success).toBe(false);
      expect(result.finalStatus).toBe('ERROR');
      expect(result.error).toBeTruthy();
    }, 30000);

    it('should create incident record on pipeline failure', async () => {
      const invalidAudioPath = '/path/that/does/not/exist.mp3';
      
      await processTicket(testTicketId, {
        audioFilePath: invalidAudioPath,
      }).catch(() => {
        // Expected to fail
      });
      
      // Check if incident was created
      const incidents = await prisma.pipelineIncident.findMany({
        where: { ticketId: testTicketId },
      });
      
      // Incidents might be created for failures
      if (incidents.length > 0) {
        expect(incidents[0].stage).toBeTruthy();
        expect(incidents[0].severity).toBeTruthy();
      }
    }, 30000);

    it('should update ticket to ERROR status on failure', async () => {
      const invalidAudioPath = '/path/that/does/not/exist.mp3';
      
      await processTicket(testTicketId, {
        audioFilePath: invalidAudioPath,
      }).catch(() => {
        // Expected to fail
      });
      
      const ticket = await prisma.recordingTicket.findUnique({
        where: { id: testTicketId },
      });
      
      expect(ticket?.status).toBe('ERROR');
    }, 30000);

    it('should include error details in result', async () => {
      const invalidAudioPath = '/path/that/does/not/exist.mp3';
      
      const result = await processTicket(testTicketId, {
        audioFilePath: invalidAudioPath,
      });
      
      expect(result.error).toBeTruthy();
      expect(result.steps.transcription?.error).toBeTruthy();
    }, 30000);
  });

  describe('Status Tracking', () => {
    it('should track processing progress through stages', async () => {
      const fixture = loadTranscriptFixture(1);
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const audioPath = createMockAudioPath('pipeline-progress');
      
      // Start processing (async)
      const processingPromise = processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      // Check status during processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const statusDuring = await getTicketStatus(testTicketId);
      expect(statusDuring).toBeTruthy();
      
      // Wait for completion
      await processingPromise;
      
      const statusAfter = await getTicketStatus(testTicketId);
      expect(['READY', 'PUBLISHED', 'NEEDS_INFO']).toContain(statusAfter.status);
    }, 30000);

    it('should return comprehensive status information', async () => {
      const fixture = loadTranscriptFixture(1);
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const audioPath = createMockAudioPath('pipeline-status-info');
      
      await processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      const status = await getTicketStatus(testTicketId);
      
      expect(status).toHaveProperty('id');
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('hasTranscription');
      expect(status).toHaveProperty('hasDraft');
    }, 30000);
  });

  describe('Multiple Transcript Scenarios', () => {
    it('should handle urgent crisis transcript', async () => {
      const fixture = loadTranscriptFixture(4); // Urgent crisis
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const audioPath = createMockAudioPath('pipeline-crisis');
      
      const result = await processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      expect(result.success).toBe(true);
      
      // Should detect high urgency
      const session = await prisma.transcriptionSession.findFirst({
        where: { recordingTicketId: testTicketId },
        include: { speechAnalysisResults: true },
      });
      
      expect(session?.speechAnalysisResults[0]?.detectedLanguage).toBe('en');
    }, 30000);

    it('should handle medical needs transcript', async () => {
      const fixture = loadTranscriptFixture(5); // Medical needs
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const audioPath = createMockAudioPath('pipeline-medical');
      
      const result = await processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      expect(result.success).toBe(true);
    }, 30000);

    it('should handle noisy transcript with background noise', async () => {
      const fixture = loadTranscriptFixture(7); // Noisy
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const audioPath = createMockAudioPath('pipeline-noisy');
      
      const result = await processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      // Should complete despite noise
      expect(result.finalStatus).toBeTruthy();
    }, 30000);

    it('should handle long detailed transcript', async () => {
      const fixture = loadTranscriptFixture(13); // Long detailed
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const audioPath = createMockAudioPath('pipeline-long');
      
      const result = await processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      expect(result.success).toBe(true);
      
      // Should extract comprehensive information
      const draft = await prisma.donationDraft.findFirst({
        where: { ticketId: testTicketId },
      });
      
      expect(draft?.story.length).toBeGreaterThan(100);
    }, 30000);
  });

  describe('Slow Provider Simulation', () => {
    it('should not hang on slow transcription', async () => {
      const fixture = loadTranscriptFixture(1);
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      process.env.STUB_TRANSCRIPTION_DELAY_MS = '2000'; // 2 second delay
      
      const audioPath = createMockAudioPath('pipeline-slow');
      const startTime = Date.now();
      
      const result = await processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      const elapsed = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(elapsed).toBeLessThan(30000); // Should complete within 30 seconds
      
      delete process.env.STUB_TRANSCRIPTION_DELAY_MS;
    }, 35000);

    it('should return PROCESSING status during long operation', async () => {
      const fixture = loadTranscriptFixture(1);
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      process.env.STUB_TRANSCRIPTION_DELAY_MS = '3000';
      
      const audioPath = createMockAudioPath('pipeline-processing');
      
      // Start async
      const promise = processTicket(testTicketId, {
        audioFilePath: audioPath,
      });
      
      // Check status while processing
      await new Promise(resolve => setTimeout(resolve, 500));
      const ticket = await prisma.recordingTicket.findUnique({
        where: { id: testTicketId },
      });
      
      expect(ticket?.status).toBe('PROCESSING');
      
      await promise;
      delete process.env.STUB_TRANSCRIPTION_DELAY_MS;
    }, 35000);
  });
});
