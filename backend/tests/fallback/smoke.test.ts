/**
 * Quick Smoke Test for Manual Fallback Feature
 * 
 * Simplified test to verify core functionality without complex mocking
 */

import { createTestApp, cleanupTestApp } from '../createTestApp';

describe('Manual Fallback - Smoke Test', () => {

  let appData: { prisma: any };

  beforeAll(async () => {
    appData = await createTestApp();
  });

  afterAll(async () => {
    await cleanupTestApp(appData);
  });

  beforeEach(async () => {
    // Cleanup existing test data before starting
    await appData.prisma.donationDraft.deleteMany({
      where: { ticketId: { startsWith: 'smoke-test-' } }
    });
    await appData.prisma.recordingTicket.deleteMany({
      where: { id: { startsWith: 'smoke-test-' } }
    });
  });

  afterEach(async () => {
    // Cleanup
    await appData.prisma.donationDraft.deleteMany({
      where: { ticketId: { startsWith: 'smoke-test-' } }
    });
    await appData.prisma.recordingTicket.deleteMany({
      where: { id: { startsWith: 'smoke-test-' } }
    });
  });

  it('should create database connection', async () => {
    const result = await appData.prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toBeDefined();
  });

  it('should have SystemIncident table', async () => {
    const count = await appData.prisma.systemIncident.count();
    expect(typeof count).toBe('number');
  });

  it('should have generationMode field in DonationDraft', async () => {
    // Create a recording ticket first (required for foreign key)
    const ticket = await appData.prisma.recordingTicket.create({
      data: {
        id: 'smoke-test-ticket-1',
        contactType: 'EMAIL',
        contactValue: 'smoke@test.com',
        status: 'DRAFT'
      }
    });

    const draft = await appData.prisma.donationDraft.create({
      data: {
        ticketId: 'smoke-test-ticket-1',
        title: 'Smoke Test',
        story: 'Testing generationMode field',
        goalAmount: 1000,
        currency: 'USD',
        generationMode: 'MANUAL_FALLBACK',
        manuallyEditedAt: new Date()
      }
    });

    expect(draft.generationMode).toBe('MANUAL_FALLBACK');
    expect(draft.manuallyEditedAt).toBeDefined();
  });

  it('should create SystemIncident with metadata', async () => {
    const incident = await appData.prisma.systemIncident.create({
      data: {
        severity: 'WARN',
        category: 'PIPELINE_FALLBACK',
        title: 'Test Incident',
        description: 'Smoke test incident',
        metadata: {
          ticketId: 'smoke-test-001',
          reasonCode: 'TEST',
          debugId: 'DBG-smoke-test'
        }
      }
    });

    expect(incident.id).toBeDefined();
    expect(incident.severity).toBe('WARN');
    expect(incident.category).toBe('PIPELINE_FALLBACK');
    expect((incident.metadata as any).ticketId).toBe('smoke-test-001');

    // Cleanup
    await appData.prisma.systemIncident.delete({ where: { id: incident.id } });
  });

  it('should query SystemIncident by metadata', async () => {
    // Create test incident
    await appData.prisma.systemIncident.create({
      data: {
        severity: 'WARN',
        category: 'PIPELINE_FALLBACK',
        title: 'Query Test',
        metadata: {
          ticketId: 'smoke-query-test',
          reasonCode: 'TRANSCRIPTION_FAILED'
        }
      }
    });

    // Query by category
    const incidents = await appData.prisma.systemIncident.findMany({
      where: {
        category: 'PIPELINE_FALLBACK',
        metadata: {
          path: ['ticketId'],
          equals: 'smoke-query-test'
        }
      }
    });

    expect(incidents.length).toBeGreaterThan(0);
    
    // Cleanup
    await appData.prisma.systemIncident.deleteMany({
      where: {
        metadata: {
          path: ['ticketId'],
          equals: 'smoke-query-test'
        }
      }
    });
  });

});
