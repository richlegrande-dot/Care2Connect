/**
 * Test Helpers and Utilities
 * Centralized test helper functions for Care2Connects automated testing
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

/**
 * Load transcript fixture by name or number
 */
export function loadTranscriptFixture(fixtureId: string | number): any {
  // Try multiple path resolutions (handles both compiled and source contexts)
  const possibleDirs = [
    // From tests/helpers (most common in ts-jest)
    path.join(__dirname, '../fixtures/transcripts'),
    // From project root
    path.join(process.cwd(), 'tests/fixtures/transcripts'),
    // Absolute path (guaranteed to work)
    path.join(process.cwd(), 'backend/tests/fixtures/transcripts'),
    'C:\\Users\\richl\\Care2system\\backend\\tests\\fixtures\\transcripts',
  ];
  
  let fixturesDir = possibleDirs.find(dir => {
    const exists = fs.existsSync(dir);
    return exists;
  });
  
  if (!fixturesDir) {
    // Debug output
    console.error('__dirname:', __dirname);
    console.error('process.cwd():', process.cwd());
    throw new Error(`Fixtures directory not found. Tried: ${possibleDirs.join(', ')}`);
  }
  
  let filename: string;
  if (typeof fixtureId === 'number') {
    // Load by number: 01, 02, etc.
    filename = `${String(fixtureId).padStart(2, '0')}-*.json`;
    const files = fs.readdirSync(fixturesDir).filter(f => f.startsWith(String(fixtureId).padStart(2, '0')));
    if (files.length === 0) {
      throw new Error(`No fixture found for ID: ${fixtureId}`);
    }
    filename = files[0];
  } else {
    filename = fixtureId.endsWith('.json') ? fixtureId : `${fixtureId}.json`;
  }
  
  const fixturePath = path.join(fixturesDir, filename);
  
  if (!fs.existsSync(fixturePath)) {
    throw new Error(`Fixture not found: ${fixturePath}`);
  }
  
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
}

/**
 * Load all transcript fixtures
 */
export function loadAllTranscriptFixtures(): any[] {
  const possibleDirs = [
    // From tests/helpers  
    path.join(__dirname, '../fixtures/transcripts'),
    // From project root
    path.join(process.cwd(), 'tests/fixtures/transcripts'),
    path.join(process.cwd(), 'backend/tests/fixtures/transcripts'),
    'C:\\Users\\richl\\Care2system\\backend\\tests\\fixtures\\transcripts',
  ];
  
  const fixturesDir = possibleDirs.find(dir => fs.existsSync(dir));
  
  if (!fixturesDir) {
    console.error('__dirname:', __dirname);
    console.error('process.cwd():', process.cwd());
    throw new Error(`Fixtures directory not found. Tried: ${possibleDirs.join(', ')}`);
  }
  
  const files = fs.readdirSync(fixturesDir).filter(f => f.endsWith('.json'));
  
  return files.map(filename => {
    const fixturePath = path.join(fixturesDir, filename);
    return JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
  });
}

/**
 * Create mock audio file path for testing
 */
export function createMockAudioPath(testName: string): string {
  const uploadsDir = path.join(__dirname, '../../uploads/test');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const audioPath = path.join(uploadsDir, `${testName}-${Date.now()}.mp3`);
  
  // Create dummy audio file (empty is fine for tests)
  fs.writeFileSync(audioPath, Buffer.alloc(1024)); // 1KB dummy file
  
  return audioPath;
}

/**
 * Clean up test audio files
 */
export function cleanupMockAudioFiles(): void {
  const uploadsDir = path.join(__dirname, '../../uploads/test');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(uploadsDir, file));
    });
  }
}

/**
 * Create test database record factories
 */
export const TestFactory = {
  /**
   * Create a test RecordingTicket
   */
  async createTicket(prisma: PrismaClient, overrides: any = {}) {
    return prisma.recordingTicket.create({
      data: {
        contactType: 'EMAIL',
        contactValue: 'test@example.com',
        displayName: `Test-Ticket-${Date.now()}`,
        status: 'DRAFT',
        ...overrides,
      },
    });
  },

  /**
   * Create a test TranscriptionSession
   */
  async createTranscriptionSession(prisma: PrismaClient, ticketId: string, overrides: any = {}) {
    return prisma.transcriptionSession.create({
      data: {
        recordingTicketId: ticketId,
        transcriptText: 'Test transcript text',
        durationMs: 30000,
        engine: 'ASSEMBLYAI',
        status: 'SUCCESS',
        source: 'UPLOAD',
        ...overrides,
      },
    });
  },

  /**
   * Create a test DonationDraft
   */
  async createDonationDraft(prisma: PrismaClient, ticketId: string, overrides: any = {}) {
    return prisma.donationDraft.create({
      data: {
        ticketId,
        title: 'Test Campaign Title',
        story: 'Test story content',
        currency: 'USD',
        ...overrides,
      },
    });
  },

  /**
   * Create a test SpeechAnalysisResult
   */
  async createSpeechAnalysis(prisma: PrismaClient, sessionId: string, overrides: any = {}) {
    const defaultData = {
      sessionId,
      analyzerVersion: 'test-v1',
      resultJson: {
        language: 'en',
        confidence: 0.9,
        processingTime: 100,
      },
      qualityScore: 0.9,
    };
    
    return prisma.speechAnalysisResult.create({
      data: {
        ...defaultData,
        ...overrides,
      },
    });
  },
};

/**
 * Mock Stripe for testing
 */
export const mockStripeService = {
  createCheckoutSession: jest.fn().mockResolvedValue({
    checkoutSessionId: 'cs_test_123',
    checkoutUrl: 'https://checkout.stripe.com/test/123',
    attributionId: 'attr_test_123',
    amount: 100,
    currency: 'USD',
  }),
  
  isStripeConfigured: jest.fn().mockReturnValue(true),
};

/**
 * Mock QR code generator for testing
 */
export const mockQRCodeGenerator = {
  createPaymentQR: jest.fn().mockResolvedValue({
    qrCodeId: 'qr_test_123',
    qrCodeData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    checkoutUrl: 'https://checkout.stripe.com/test/123',
    checkoutSessionId: 'cs_test_123',
    attributionId: 'attr_test_123',
  }),
};

/**
 * Wait for condition with timeout
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeoutMs: number = 5000,
  pollIntervalMs: number = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const result = await Promise.resolve(condition());
    if (result) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }
  
  throw new Error(`Condition not met within ${timeoutMs}ms`);
}

/**
 * Mask secrets in test output
 */
export function maskSecrets(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const masked = Array.isArray(obj) ? [] : {};
  const secretKeys = ['apiKey', 'password', 'secret', 'token', 'key'];
  
  for (const [key, value] of Object.entries(obj)) {
    const isSecret = secretKeys.some(sk => key.toLowerCase().includes(sk));
    
    if (isSecret && typeof value === 'string') {
      (masked as any)[key] = '***MASKED***';
    } else if (typeof value === 'object' && value !== null) {
      (masked as any)[key] = maskSecrets(value);
    } else {
      (masked as any)[key] = value;
    }
  }
  
  return masked;
}

/**
 * Create test environment override
 */
export function withTestEnv(overrides: Record<string, string>, callback: () => void | Promise<void>) {
  const originalEnv = { ...process.env };
  
  return async () => {
    try {
      Object.assign(process.env, overrides);
      await Promise.resolve(callback());
    } finally {
      process.env = originalEnv;
    }
  };
}

/**
 * Generate random test data
 */
export const TestData = {
  email: () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
  phone: () => `555-${Math.floor(1000 + Math.random() * 9000)}`,
  name: () => {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  },
  city: () => {
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
    return cities[Math.floor(Math.random() * cities.length)];
  },
};
