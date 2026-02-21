/**
 * Mock Stripe Helper for Testing
 * 
 * Provides deterministic Stripe responses for QR generation tests
 */

export interface MockStripeSession {
  id: string;
  url: string;
  payment_status: 'unpaid' | 'paid';
  metadata: Record<string, string>;
}

export interface MockStripeConfig {
  sessionIdPrefix?: string;
  baseUrl?: string;
  metadata?: Record<string, string>;
  shouldFail?: boolean;
  delay?: number;
}

/**
 * Create a mock Stripe checkout session response
 */
export function createMockStripeSession(
  amount: number,
  description: string,
  config: MockStripeConfig = {}
): MockStripeSession {
  const {
    sessionIdPrefix = 'cs_test',
    baseUrl = 'https://checkout.stripe.com/test',
    metadata = {},
    shouldFail = false
  } = config;
  
  if (shouldFail) {
    throw new Error('Mock Stripe failure');
  }
  
  const sessionId = `${sessionIdPrefix}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  
  return {
    id: sessionId,
    url: `${baseUrl}/${sessionId}`,
    payment_status: 'unpaid',
    metadata: {
      amount: amount.toString(),
      description,
      generatedAt: new Date().toISOString(),
      testMode: 'true',
      ...metadata
    }
  };
}

/**
 * Mock QR code generation result
 */
export interface MockQRResult {
  qrCodeDataUrl: string;
  stripeSession: MockStripeSession;
  metadata: {
    amount: number;
    description: string;
    generatedAt: string;
    paymentProvider: string;
    attribution: string;
    sessionId: string;
  };
}

/**
 * Generate mock QR code result with Stripe session
 */
export function generateMockQR(
  amount: number,
  description: string,
  config: MockStripeConfig & { ticketId?: string; recordingId?: string } = {}
): MockQRResult {
  // Create Stripe session
  const stripeSession = createMockStripeSession(amount, description, {
    ...config,
    metadata: {
      ticketId: config.ticketId || 'test_ticket_123',
      recordingId: config.recordingId || 'test_recording_456',
      generationMode: 'test_mode',
      ...config.metadata
    }
  });
  
  // Generate mock QR code (minimal valid PNG base64)
  const mockQRImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  return {
    qrCodeDataUrl: `data:image/png;base64,${mockQRImage}`,
    stripeSession,
    metadata: {
      amount,
      description,
      generatedAt: new Date().toISOString(),
      paymentProvider: 'stripe',
      attribution: 'Care2System Revenue Pipeline',
      sessionId: stripeSession.id
    }
  };
}

/**
 * Mock Stripe API client for dependency injection
 */
export class MockStripeClient {
  private config: MockStripeConfig;
  
  constructor(config: MockStripeConfig = {}) {
    this.config = config;
  }
  
  async checkout_sessions_create(params: {
    line_items: Array<{
      price_data: {
        currency: string;
        product_data: { name: string };
        unit_amount: number;
      };
      quantity: number;
    }>;
    mode: string;
    success_url: string;
    cancel_url: string;
    metadata?: Record<string, string>;
  }): Promise<MockStripeSession> {
    
    if (this.config.delay) {
      await new Promise(resolve => setTimeout(resolve, this.config.delay));
    }
    
    const amount = params.line_items[0]?.price_data?.unit_amount || 0;
    const description = params.line_items[0]?.price_data?.product_data?.name || 'Test Payment';
    
    return createMockStripeSession(amount / 100, description, {
      ...this.config,
      metadata: {
        ...params.metadata,
        ...this.config.metadata
      }
    });
  }
  
  async checkout_sessions_retrieve(sessionId: string): Promise<MockStripeSession> {
    // Mock session retrieval
    return {
      id: sessionId,
      url: `https://checkout.stripe.com/test/${sessionId}`,
      payment_status: 'paid',
      metadata: {
        retrieved: 'true',
        retrievedAt: new Date().toISOString()
      }
    };
  }
}

/**
 * Assertion helpers for Stripe mock testing
 */
export function assertValidStripeSession(session: MockStripeSession): void {
  if (!session.id.startsWith('cs_')) {
    throw new Error('Invalid Stripe session ID format');
  }
  
  if (!session.url.includes(session.id)) {
    throw new Error('Session URL does not contain session ID');
  }
  
  if (!session.metadata || typeof session.metadata !== 'object') {
    throw new Error('Session metadata is missing or invalid');
  }
}

/**
 * Assert QR result has proper structure
 */
export function assertValidQRResult(qrResult: MockQRResult): void {
  // Check QR code data URL format
  if (!qrResult.qrCodeDataUrl.startsWith('data:image/png;base64,')) {
    throw new Error('Invalid QR code data URL format');
  }
  
  // Validate Stripe session
  assertValidStripeSession(qrResult.stripeSession);
  
  // Check metadata completeness
  const requiredMetadata = ['amount', 'description', 'generatedAt', 'paymentProvider', 'attribution'];
  for (const field of requiredMetadata) {
    if (!qrResult.metadata[field]) {
      throw new Error(`Missing required metadata field: ${field}`);
    }
  }
  
  // Verify attribution is present
  if (!qrResult.metadata.attribution.includes('Care2System')) {
    throw new Error('Missing or invalid attribution in metadata');
  }
}

/**
 * Create consistent test metadata for QR generation
 */
export function createTestMetadata(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    ticketId: 'test_ticket_123',
    recordingId: 'test_recording_456', 
    generationMode: 'test_mode',
    testRun: 'true',
    generatedBy: 'parsing_test_architecture',
    ...overrides
  };
}
