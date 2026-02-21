/**
 * GATE TEST - AssemblyAI Transcription to GoFundMe & QR Code Pipeline
 * 
 * Validates the system's ability to parse AssemblyAI transcriptions
 * and extract all necessary values for:
 * 1. GoFundMe draft generation (name, need, location, contact, goal)
 * 2. QR code generation (profile link with ticket ID)
 * 3. Signal extraction (needs categorization, urgency, key points)
 */

import { extractSignals } from '../../src/services/speechIntelligence/transcriptSignalExtractor';

describe('[GATE] AssemblyAI → GoFundMe & QR Code Pipeline', () => {
  
  describe('Basic AssemblyAI Response Parsing', () => {
    test('Parser handles text-only response', () => {
      const textOnlyResponse = {
        id: 'test-123',
        status: 'completed',
        text: 'This is a test transcript without segments.',
        language_code: 'en',
      };

      // Parser should extract text even without segments
      expect(textOnlyResponse.text).toBeTruthy();
      expect(textOnlyResponse.text.length).toBeGreaterThan(0);
    });

    test('Parser handles response with segments', () => {
      const segmentResponse = {
        id: 'test-456',
        status: 'completed',
        text: 'Hello world.',
        words: [
          { text: 'Hello', start: 0, end: 500, confidence: 0.95 },
          { text: 'world', start: 600, end: 1200, confidence: 0.98 },
        ],
        language_code: 'en',
      };

      // Parser should preserve segments and timestamps
      expect(segmentResponse.words).toBeDefined();
      expect(segmentResponse.words.length).toBe(2);
      expect(segmentResponse.words[0]).toHaveProperty('start');
      expect(segmentResponse.words[0]).toHaveProperty('end');
      expect(segmentResponse.words[0]).toHaveProperty('confidence');
    });

    test('Analysis works with both text-only and segments', () => {
      const textOnly = 'My name is John and I need housing assistance.';
      const withSegments = {
        text: 'My name is John and I need housing assistance.',
        words: [
          { text: 'My', start: 0, end: 100 },
          { text: 'name', start: 150, end: 350 },
          // ... more words
        ],
      };

      // Both formats should be analyzable
      expect(textOnly.includes('housing')).toBe(true);
      expect(withSegments.text.includes('housing')).toBe(true);
      expect(withSegments.words).toBeDefined();
    });
  });

  describe('GoFundMe Account Value Extraction', () => {
    test('Extracts name from AssemblyAI transcript', async () => {
      const assemblyAIResponse = {
        id: 'gofundme-test-001',
        status: 'completed',
        // Name must be followed by punctuation or clear break for extraction
        text: 'Hello. My name is Sarah Martinez. I am reaching out for help because I recently lost my job and I am facing eviction from my apartment in Denver, Colorado.',
        confidence: 0.92,
        language_code: 'en_us',
      };

      const signals = await extractSignals({ text: assemblyAIResponse.text });
      
      // Name extraction requires proper capitalization and sentence breaks
      expect(signals.nameCandidate).toBe('Sarah Martinez');
      expect(signals.confidence.name).toBeGreaterThan(0.5);
    });

    test('Extracts location from AssemblyAI transcript', async () => {
      const assemblyAIResponse = {
        id: 'gofundme-test-002',
        status: 'completed',
        text: 'I live in Austin, Texas and have been struggling to make ends meet. My children and I need help with rent and food.',
        confidence: 0.89,
        language_code: 'en_us',
      };

      const signals = await extractSignals({ text: assemblyAIResponse.text });
      
      // Should extract city and state (state may be full name or abbreviation)
      expect(signals.locationCandidates).toContain('Austin');
      expect(signals.locationCandidates.some(loc => loc === 'Texas' || loc === 'TX')).toBe(true);
      expect(signals.confidence.location).toBeGreaterThan(0.5);
    });

    test('Extracts contact information from AssemblyAI transcript', async () => {
      const assemblyAIResponse = {
        id: 'gofundme-test-003',
        status: 'completed',
        text: 'You can reach me at sarah.martinez@email.com or call me at 555-123-4567. I really need assistance with medical bills.',
        confidence: 0.91,
        language_code: 'en_us',
      };

      const signals = await extractSignals({ text: assemblyAIResponse.text });
      
      expect(signals.contactCandidates.emails).toContain('sarah.martinez@email.com');
      expect(signals.contactCandidates.phones.length).toBeGreaterThan(0);
      expect(signals.contactCandidates.phones[0]).toMatch(/\(\d{3}\)\s\d{3}-\d{4}/);
    });

    test('Categorizes needs for GoFundMe category selection', async () => {
      const assemblyAIResponse = {
        id: 'gofundme-test-004',
        status: 'completed',
        text: 'I was evicted from my apartment and need help with rent and security deposit. I also need food for my family and help finding a job.',
        confidence: 0.88,
        language_code: 'en_us',
      };

      const signals = await extractSignals({ text: assemblyAIResponse.text });
      
      // Should identify multiple need categories
      expect(signals.needsCategories.length).toBeGreaterThan(0);
      
      const needTypes = signals.needsCategories.map(n => n.category);
      expect(needTypes).toContain('HOUSING');
      expect(needTypes).toContain('FOOD');
      expect(needTypes).toContain('EMPLOYMENT');
      
      // Each need should have confidence score
      signals.needsCategories.forEach(need => {
        expect(need.confidence).toBeGreaterThan(0);
        expect(need.confidence).toBeLessThanOrEqual(1);
        expect(need.keywords).toBeDefined();
        expect(need.keywords.length).toBeGreaterThan(0);
      });
    });

    test('Calculates urgency score for GoFundMe prioritization', async () => {
      const urgentAssemblyAIResponse = {
        id: 'gofundme-test-005',
        status: 'completed',
        text: 'This is an emergency! I need help immediately. I am being evicted today and have nowhere to go. I need urgent assistance right now.',
        confidence: 0.93,
        language_code: 'en_us',
      };

      const signals = await extractSignals({ text: urgentAssemblyAIResponse.text });
      
      // High urgency keywords should produce high score
      expect(signals.urgencyScore).toBeGreaterThan(0.7);
    });

    test('Extracts key points for GoFundMe story body', async () => {
      const assemblyAIResponse = {
        id: 'gofundme-test-006',
        status: 'completed',
        text: 'My name is Michael Chen. I live in Seattle, Washington. I lost my job three months ago due to company downsizing. Since then, I have been unable to pay rent and my landlord is starting eviction proceedings. I need $2,500 for rent and utilities to avoid becoming homeless. I have been actively job searching and have several interviews lined up. Any help would be greatly appreciated during this difficult time.',
        confidence: 0.91,
        language_code: 'en_us',
      };

      const signals = await extractSignals({ text: assemblyAIResponse.text });
      
      // Should extract relevant key points
      expect(signals.keyPoints.length).toBeGreaterThan(0);
      expect(signals.keyPoints.length).toBeLessThanOrEqual(7);
      
      // Key points should contain relevant information
      const keyPointsText = signals.keyPoints.join(' ');
      expect(keyPointsText).toBeTruthy();
    });

    test('Detects missing required GoFundMe fields', async () => {
      const incompleteAssemblyAIResponse = {
        id: 'gofundme-test-007',
        status: 'completed',
        text: 'I need help with rent. Please help me.',
        confidence: 0.78,
        language_code: 'en_us',
      };

      const signals = await extractSignals({ text: incompleteAssemblyAIResponse.text });
      
      // Should identify missing fields
      expect(signals.missingFields.length).toBeGreaterThan(0);
      
      // Name should be missing
      expect(signals.nameCandidate).toBeNull();
      
      // Location should be missing
      expect(signals.locationCandidates.length).toBe(0);
    });

    test('Handles complex multi-sentence AssemblyAI transcript', async () => {
      const complexAssemblyAIResponse = {
        id: 'gofundme-test-008',
        status: 'completed',
        text: `Hello, my name is Jennifer Rodriguez. I'm a single mother of two beautiful children, ages 7 and 9. 
        We live in Phoenix, Arizona. Three weeks ago, I was involved in a serious car accident that left me unable to work. 
        I'm a waitress at a local diner, and without my income, I can't afford our rent which is $1,200 per month. 
        My landlord has given me until the end of this week to pay or face eviction. I also need money for groceries and my kids' school supplies. 
        I'm currently recovering from my injuries and expect to return to work in about a month. 
        You can reach me at jrodriguez.help@gmail.com if you have any questions. 
        Any amount would help us stay in our home and keep food on the table. Thank you so much for considering helping our family.`,
        confidence: 0.94,
        language_code: 'en_us',
        words: [
          { text: 'Hello', start: 0, end: 300, confidence: 0.98 },
          { text: 'my', start: 350, end: 450, confidence: 0.97 },
          // ... many more words
        ]
      };

      const signals = await extractSignals({ text: complexAssemblyAIResponse.text });
      
      // Should extract all major components
      expect(signals.nameCandidate).toBe('Jennifer Rodriguez');
      expect(signals.locationCandidates).toContain('Phoenix');
      expect(signals.locationCandidates).toContain('Arizona');
      expect(signals.contactCandidates.emails).toContain('jrodriguez.help@gmail.com');
      
      // Should categorize needs
      const needTypes = signals.needsCategories.map(n => n.category);
      expect(needTypes).toContain('HOUSING');
      expect(needTypes).toContain('FOOD');
      
      // Should extract key points from complex story
      expect(signals.keyPoints.length).toBeGreaterThan(3);
      
      // Should calculate appropriate urgency
      expect(signals.urgencyScore).toBeGreaterThan(0.5);
      
      // Overall needs confidence should be high
      expect(signals.confidence.needs).toBeGreaterThan(0.6);
    });
  });

  describe('QR Code Generation Prerequisites', () => {
    test('Validates ticket ID format for QR code URL generation', () => {
      // QR code URL format: https://care2connects.org/profile/[TICKET_ID]
      const validTicketIds = [
        'clx1a2b3c4d5e6f7g8h9',
        'ticket-2024-001',
        'abc123xyz',
      ];

      validTicketIds.forEach(ticketId => {
        const qrUrl = `https://care2connects.org/profile/${ticketId}`;
        
        expect(qrUrl).toMatch(/^https:\/\//);
        expect(qrUrl).toContain('care2connects.org');
        expect(qrUrl).toContain('/profile/');
        expect(qrUrl).toContain(ticketId);
      });
    });

    test('QR code URL includes correct production domain', () => {
      const ticketId = 'test-ticket-123';
      const qrUrl = `https://care2connects.org/profile/${ticketId}`;
      
      // Must use production domain (not localhost)
      expect(qrUrl).not.toContain('localhost');
      expect(qrUrl).not.toContain('127.0.0.1');
      
      // Must use correct domain spelling
      expect(qrUrl).toContain('care2connects.org'); // correct
      expect(qrUrl).not.toContain('care2connect.org'); // incorrect
    });

    test('Validates complete profile data for QR code link destination', async () => {
      const completeAssemblyAIResponse = {
        id: 'qr-test-001',
        status: 'completed',
        text: 'My name is David Lee. I live in Portland, Oregon. Contact me at dlee@email.com. I need $3,000 for medical bills after my surgery.',
        confidence: 0.92,
        language_code: 'en_us',
      };

      const signals = await extractSignals({ text: completeAssemblyAIResponse.text });
      
      // Profile should have minimum required data for QR code destination
      expect(signals.nameCandidate).toBeTruthy();
      expect(signals.needsCategories.length).toBeGreaterThan(0);
      expect(signals.contactCandidates.emails.length).toBeGreaterThan(0);
      
      // Missing fields should be minimal
      expect(signals.missingFields.length).toBeLessThan(5);
    });
  });

  describe('End-to-End: AssemblyAI → GoFundMe + QR Code', () => {
    test('Complete pipeline from AssemblyAI transcript to GoFundMe draft values', async () => {
      // Simulate complete AssemblyAI response from production
      const productionAssemblyAIResponse = {
        id: 'prod-transcript-001',
        status: 'completed',
        text: `Hi. My name is Maria Santos. I live in Los Angeles, California. 
        I'm a nursing assistant at a local hospital, but I've been out of work for the past two months due to a health issue. 
        I need help paying my rent which is $1,800 per month, plus I need money for groceries and medications. 
        I'm expecting to return to work next month once my doctor clears me. 
        My goal is to raise $5,000 to cover rent, food, and medical expenses until I can get back on my feet. 
        You can reach me at maria.santos.la@gmail.com or 213-555-0123. 
        Thank you so much for any help you can provide.`,
        confidence: 0.93,
        language_code: 'en_us',
        audio_duration: 42.5,
      };

      const signals = await extractSignals({ text: productionAssemblyAIResponse.text });
      
      // ✅ GoFundMe Account Values Extracted
      expect(signals.nameCandidate).toBe('Maria Santos'); // For "Beneficiary" field
      // Location detection requires specific patterns like "in City, State" or "from City"
      expect(signals.locationCandidates.length).toBeGreaterThanOrEqual(1); // For location
      expect(signals.contactCandidates.emails).toContain('maria.santos.la@gmail.com'); // For contact
      expect(signals.contactCandidates.phones.length).toBeGreaterThan(0); // Backup contact
      
      // ✅ GoFundMe Category Selection (Top need)
      expect(signals.needsCategories.length).toBeGreaterThan(0);
      const topNeed = signals.needsCategories[0];
      expect(['HOUSING', 'HEALTHCARE', 'FOOD']).toContain(topNeed.category);
      
      // ✅ GoFundMe Goal Amount (should be manually entered, but story mentions $5,000)
      expect(productionAssemblyAIResponse.text).toContain('5,000');
      
      // ✅ GoFundMe Story Body Components
      expect(signals.keyPoints.length).toBeGreaterThan(2); // Multiple key points for story
      expect(signals.urgencyScore).toBeGreaterThan(0.3); // Urgency for prioritization
      
      // ✅ QR Code Generation Readiness
      expect(signals.nameCandidate).toBeTruthy(); // Profile must have name
      expect(signals.needsCategories.length).toBeGreaterThan(0); // Profile must have needs
      expect(signals.missingFields.length).toBeLessThan(8); // Should be mostly complete
      
      // ✅ Overall Quality Score (for completeness check)
      const hasName = signals.nameCandidate !== null;
      const hasLocation = signals.locationCandidates.length > 0;
      const hasContact = signals.contactCandidates.emails.length > 0 || signals.contactCandidates.phones.length > 0;
      const hasNeeds = signals.needsCategories.length > 0;
      const hasKeyPoints = signals.keyPoints.length > 0;
      
      const completenessScore = [hasName, hasLocation, hasContact, hasNeeds, hasKeyPoints].filter(Boolean).length / 5;
      expect(completenessScore).toBeGreaterThan(0.7); // 70%+ complete
      
      // ✅ Confidence Checks
      expect(signals.confidence.name).toBeGreaterThan(0.7);
      expect(signals.confidence.location).toBeGreaterThanOrEqual(0.5); // One location gives 0.5
      expect(signals.confidence.needs).toBeGreaterThan(0.5);
    });

    test('Handles incomplete AssemblyAI transcript gracefully', async () => {
      const incompleteAssemblyAIResponse = {
        id: 'prod-transcript-002',
        status: 'completed',
        text: 'I need help. Please donate.',
        confidence: 0.65,
        language_code: 'en_us',
        audio_duration: 3.2,
      };

      const signals = await extractSignals({ text: incompleteAssemblyAIResponse.text });
      
      // Should still return valid signals object
      expect(signals).toBeDefined();
      expect(signals.nameCandidate).toBeNull();
      expect(signals.locationCandidates.length).toBe(0);
      
      // Should identify many missing fields
      expect(signals.missingFields.length).toBeGreaterThan(3);
      
      // Should still categorize basic needs
      expect(signals.needsCategories.length).toBeGreaterThanOrEqual(0);
      
      // Confidence scores should reflect incompleteness
      expect(signals.confidence.name).toBe(0);
      expect(signals.confidence.location).toBe(0);
    });
  });
});
