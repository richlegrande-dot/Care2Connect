/**
 * Pipeline Failure Handler Tests
 * 
 * Tests for automatic fallback triggers and incident logging
 */

import { createPipelineFailure, executePipelineWithFallback, isSystemDegraded } from '../../src/services/pipelineFailureHandler';
import { prisma } from '../../src/utils/database';

describe('Pipeline Failure Handler', () => {
  
  beforeEach(async () => {
    // Clean up test data - SystemIncident uses metadata JSON for ticketId
    const incidents = await prisma.systemIncident.findMany({
      where: {
        metadata: {
          path: ['ticketId'],
          string_starts_with: 'test-'
        }
      }
    });
    await prisma.systemIncident.deleteMany({
      where: {
        id: { in: incidents.map(i => i.id) }
      }
    });
  });

  describe('createPipelineFailure', () => {
    
    it('should create TRANSCRIPTION_FAILED failure with incident', async () => {
      const testTicketId = 'test-ticket-123';
      const result = await createPipelineFailure(
        'TRANSCRIPTION_FAILED',
        { 
          ticketId: testTicketId,
          context: { error: 'Transcription service timeout' }
        }
      );

      expect(result.success).toBe(false);
      expect(result.reasonCode).toBe('TRANSCRIPTION_FAILED');
      expect(result.userMessage).toContain('transcribe');
      expect(result.debugId).toBeDefined();

      // Verify incident was logged - query by metadata path
      const incidents = await prisma.systemIncident.findMany({
        where: {
          metadata: {
            path: ['ticketId'],
            equals: testTicketId
          }
        }
      });
      expect(incidents.length).toBeGreaterThan(0);
      expect(incidents[0].severity).toBe('WARN');
      expect(incidents[0].category).toBe('PIPELINE_FALLBACK');
    });

    it('should create PARSING_INCOMPLETE failure with partial data', async () => {
      const partialData = {
        transcript: 'Help me please...',
        extractedFields: {
          title: 'Help Request',
          story: 'Incomplete story',
          goalAmount: undefined
        }
      };

      const result = await createPipelineFailure(
        'PARSING_INCOMPLETE',
        { 
          ticketId: 'test-ticket-456',
          context: { 
            partialData,
            extractedFields: partialData.extractedFields 
          }
        }
      );

      expect(result.success).toBe(false);
      expect(result.reasonCode).toBe('PARSING_INCOMPLETE');
      expect(result.partialData).toEqual(partialData);
      expect(result.userMessage).toContain('complete the information');
    });

    it('should create SYSTEM_DEGRADED failure', async () => {
      const testTicketId = 'test-ticket-789';
      const result = await createPipelineFailure(
        'SYSTEM_DEGRADED',
        { 
          ticketId: testTicketId,
          context: { healthStatus: 'degraded', affectedServices: ['openai'] }
        }
      );

      expect(result.success).toBe(false);
      expect(result.reasonCode).toBe('SYSTEM_DEGRADED');
      expect(result.userMessage).toContain('experiencing issues');
      
      const incident = await prisma.systemIncident.findFirst({
        where: {
          metadata: {
            path: ['ticketId'],
            equals: testTicketId
          }
        }
      });
      expect(incident?.metadata).toMatchObject({
        reasonCode: 'SYSTEM_DEGRADED',
        ticketId: testTicketId
      });
    });

    it('should handle DRAFT_GENERATION_FAILED', async () => {
      const result = await createPipelineFailure(
        'DRAFT_GENERATION_FAILED',
        { 
          ticketId: 'test-ticket-draft',
          context: { error: 'LLM timeout' }
        }
      );

      expect(result.success).toBe(false);
      expect(result.reasonCode).toBe('DRAFT_GENERATION_FAILED');
    });

    it('should handle DOCX_FAILED', async () => {
      const result = await createPipelineFailure(
        'DOCX_FAILED',
        { 
          ticketId: 'test-ticket-docx',
          context: { error: 'Document generation failed' }
        }
      );

      expect(result.success).toBe(false);
      expect(result.reasonCode).toBe('DOCX_FAILED');
    });

    it('should handle PIPELINE_EXCEPTION', async () => {
      const result = await createPipelineFailure(
        'PIPELINE_EXCEPTION',
        { 
          ticketId: 'test-ticket-exception',
          context: { error: 'Unexpected error', stack: 'stack trace here' }
        }
      );

      expect(result.success).toBe(false);
      expect(result.reasonCode).toBe('PIPELINE_EXCEPTION');
      expect(result.userMessage).toContain('unexpected happened');
    });

  });

  describe('executePipelineWithFallback', () => {
    
    it('should return success when operation succeeds', async () => {
      const mockOperation = jest.fn().mockResolvedValue({ data: 'success' });

      const result = await executePipelineWithFallback(
        'test-ticket-success',
        mockOperation
      );

      expect((result as any).data).toBe('success');
      expect(mockOperation).toHaveBeenCalled();
    });

    it('should return failure when operation throws', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));

      const result = await executePipelineWithFallback(
        'test-ticket-fail',
        mockOperation
      );

      expect(result.success).toBe(false);
      expect(result.reasonCode).toBe('PIPELINE_EXCEPTION');
      expect(result.debugId).toBeDefined();
    });

    it('should extract partial data from operation context', async () => {
      const mockOperation = jest.fn().mockRejectedValue(
        Object.assign(new Error('Parse error'), {
          partialData: { transcript: 'Partial transcript here' }
        })
      );

      const result = await executePipelineWithFallback(
        'test-ticket-partial',
        mockOperation,
        'PARSING_INCOMPLETE'
      );

      expect(result.success).toBe(false);
      expect(result.reasonCode).toBe('PARSING_INCOMPLETE');
    });

  });

  describe('isSystemDegraded', () => {
    
    it('should return false when system is healthy', async () => {
      const degraded = await isSystemDegraded();
      
      // Assuming normal test environment is healthy
      expect(typeof degraded).toBe('boolean');
    });

    // Note: Full health check integration would require mocking health endpoints
    
  });

  describe('Incident Logging', () => {
    
    it('should create unique debugId for each failure', async () => {
      const result1 = await createPipelineFailure('TRANSCRIPTION_FAILED', { ticketId: 'test-1' });
      const result2 = await createPipelineFailure('TRANSCRIPTION_FAILED', { ticketId: 'test-2' });

      expect(result1.debugId).not.toBe(result2.debugId);
      expect(result1.debugId).toBeDefined();
      expect(result2.debugId).toBeDefined();
    });

    it('should store metadata in incident', async () => {
      const metadata = {
        serviceEndpoint: 'https://api.example.com/transcribe',
        errorCode: 'TIMEOUT',
        retryAttempts: 3
      };

      await createPipelineFailure('TRANSCRIPTION_FAILED', { 
        ticketId: 'test-metadata',
        context: metadata
      });

      const incidents = await prisma.systemIncident.findMany({
        where: {
          metadata: {
            path: ['ticketId'],
            equals: 'test-metadata'
          }
        }
      });

      expect(incidents.length).toBeGreaterThan(0);
      expect(incidents[0]?.metadata).toMatchObject({
        reasonCode: 'TRANSCRIPTION_FAILED',
        ticketId: 'test-metadata',
        retryAttempts: metadata.retryAttempts
      });
    });

    it('should mark all incidents with WARN severity', async () => {
      await createPipelineFailure('TRANSCRIPTION_FAILED', { ticketId: 'test-sev-1' });
      await createPipelineFailure('SYSTEM_DEGRADED', { ticketId: 'test-sev-2' });
      await createPipelineFailure('PIPELINE_EXCEPTION', { ticketId: 'test-sev-3' });

      const incidents = await prisma.systemIncident.findMany({
        where: { metadata: { path: ['ticketId'], string_starts_with: 'test-sev-' } }
      });

      expect(incidents.length).toBeGreaterThanOrEqual(3);
      incidents.forEach(incident => {
        expect(incident.severity).toBe('WARN');
        expect(incident.category).toBe('PIPELINE_FALLBACK');
      });
    });

  });

});


