import request from 'supertest';
import app from '../../src/server';
import GofundmeDocxExporter from '../../src/exports/generateGofundmeDocx';

// Mock the docx library to avoid actual document generation in tests
jest.mock('docx');
jest.mock('../../src/exports/generateGofundmeDocx');

const mockGofundmeExporter = GofundmeDocxExporter as jest.Mocked<typeof GofundmeDocxExporter>;

describe('Document Export Tests', () => {

  const sampleDraft = {
    name: { value: 'John Smith', confidence: 0.9 },
    dateOfBirth: { value: '01/15/1985', confidence: 0.8 },
    location: {
      value: {
        country: 'United States',
        state: 'California',
        zip: '90210',
        city: 'Beverly Hills'
      },
      confidence: 0.7
    },
    beneficiary: { value: 'myself', confidence: 0.9 },
    category: { value: 'Housing', confidence: 0.8 },
    goalAmount: { value: 5000, confidence: 0.7 },
    title: { value: 'Help John Get Back on His Feet', confidence: 0.8 },
    storyBody: { value: 'I am currently experiencing homelessness and need support to get back on my feet.', confidence: 0.9 },
    shortSummary: { value: 'Help John find housing and stability.', confidence: 0.8 },
    contact: { value: { email: 'john@example.com' }, confidence: 0.6 },
    consentToPublish: true,
    transcript: 'Full story transcript',
    missingFields: [],
    followUpQuestions: [],
    extractedAt: new Date(),
    lastUpdated: new Date()
  };

  describe('GET /api/exports/gofundme-docx', () => {
    beforeEach(() => {
      const mockBuffer = Buffer.from('mock docx content');
      mockGofundmeExporter.generateDocument.mockResolvedValue(mockBuffer);
    });

    it('should generate document with valid draft data', async () => {
      const response = await request(app)
        .get('/api/exports/gofundme-docx')
        .query({
          draft: JSON.stringify(sampleDraft),
          filename: 'Test_Campaign.docx'
        })
        .expect(200);

      expect(response.headers['content-type']).toContain('officedocument.wordprocessingml.document');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('Test_Campaign.docx');
    });

    it('should use default filename when none provided', async () => {
      const response = await request(app)
        .get('/api/exports/gofundme-docx')
        .query({
          draft: JSON.stringify(sampleDraft)
        })
        .expect(200);

      expect(response.headers['content-disposition']).toMatch(/GoFundMe_Draft_\d+\.docx/);
    });

    it('should reject request without draft data', async () => {
      const response = await request(app)
        .get('/api/exports/gofundme-docx')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Draft data is required');
    });

    it('should reject invalid JSON draft data', async () => {
      const response = await request(app)
        .get('/api/exports/gofundme-docx')
        .query({
          draft: 'invalid json'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid draft data');
    });

    it('should handle document generation errors', async () => {
      mockGofundmeExporter.generateDocument.mockRejectedValue(new Error('Document generation failed'));

      const response = await request(app)
        .get('/api/exports/gofundme-docx')
        .query({
          draft: JSON.stringify(sampleDraft)
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to generate');
    });
  });

  describe('POST /api/exports/gofundme-docx', () => {
    beforeEach(() => {
      const mockBuffer = Buffer.from('mock docx content');
      mockGofundmeExporter.generateDocument.mockResolvedValue(mockBuffer);
    });

    it('should generate document with POST data', async () => {
      const response = await request(app)
        .post('/api/exports/gofundme-docx')
        .send({
          draft: sampleDraft,
          filename: 'Custom_Campaign.docx',
          options: {
            includeInstructions: true,
            includePasteMap: true
          }
        })
        .expect(200);

      expect(response.headers['content-type']).toContain('officedocument.wordprocessingml.document');
      expect(response.headers['content-disposition']).toContain('Custom_Campaign.docx');
      
      // Verify exporter was called with correct options
      expect(mockGofundmeExporter.generateDocument).toHaveBeenCalledWith(
        sampleDraft,
        expect.objectContaining({
          includeInstructions: true,
          includePasteMap: true
        })
      );
    });

    it('should handle missing draft in POST body', async () => {
      const response = await request(app)
        .post('/api/exports/gofundme-docx')
        .send({
          filename: 'test.docx'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Draft data is required');
    });

    it('should use default options when not provided', async () => {
      await request(app)
        .post('/api/exports/gofundme-docx')
        .send({
          draft: sampleDraft
        })
        .expect(200);

      expect(mockGofundmeExporter.generateDocument).toHaveBeenCalledWith(
        sampleDraft,
        expect.objectContaining({
          includeInstructions: true,
          includePasteMap: true
        })
      );
    });
  });

  describe('Document Content Validation', () => {
    beforeEach(() => {
      // Reset mocks and use real implementation for content tests
      jest.restoreAllMocks();
    });

    it('should call document generator with correct parameters', async () => {
      const mockBuffer = Buffer.from('test content');
      const generateDocumentSpy = jest.spyOn(GofundmeDocxExporter, 'generateDocument')
        .mockResolvedValue(mockBuffer);

      await request(app)
        .post('/api/exports/gofundme-docx')
        .send({
          draft: sampleDraft,
          options: {
            includeInstructions: false,
            includePasteMap: true
          }
        });

      expect(generateDocumentSpy).toHaveBeenCalledWith(
        sampleDraft,
        expect.objectContaining({
          includeInstructions: false,
          includePasteMap: true
        })
      );

      generateDocumentSpy.mockRestore();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed draft data gracefully', async () => {
      const malformedDraft = {
        name: 'not an object', // Should be { value, confidence }
        invalidField: 'should not exist'
      };

      // The exporter should handle malformed data gracefully
      const mockBuffer = Buffer.from('fallback content');
      mockGofundmeExporter.generateDocument.mockResolvedValue(mockBuffer);

      const response = await request(app)
        .post('/api/exports/gofundme-docx')
        .send({
          draft: malformedDraft
        })
        .expect(200);

      expect(mockGofundmeExporter.generateDocument).toHaveBeenCalled();
    });

    it('should handle very long content appropriately', async () => {
      const draftWithLongContent = {
        ...sampleDraft,
        storyBody: {
          value: 'A'.repeat(10000), // Very long story
          confidence: 0.9
        }
      };

      const mockBuffer = Buffer.from('long content document');
      mockGofundmeExporter.generateDocument.mockResolvedValue(mockBuffer);

      const response = await request(app)
        .post('/api/exports/gofundme-docx')
        .send({
          draft: draftWithLongContent
        })
        .expect(200);

      expect(response.status).toBe(200);
    });

    it('should handle empty or null values in draft', async () => {
      const draftWithNulls = {
        ...sampleDraft,
        name: { value: null, confidence: 0.0 },
        goalAmount: { value: null, confidence: 0.0 },
        title: { value: '', confidence: 0.0 }
      };

      const mockBuffer = Buffer.from('sparse content document');
      mockGofundmeExporter.generateDocument.mockResolvedValue(mockBuffer);

      const response = await request(app)
        .post('/api/exports/gofundme-docx')
        .send({
          draft: draftWithNulls
        })
        .expect(200);

      expect(response.status).toBe(200);
    });
  });
});
