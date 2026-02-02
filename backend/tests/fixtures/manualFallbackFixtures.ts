/**
 * Test Fixtures for Manual Fallback Integration Tests
 * 
 * Provides reusable test data and helper functions
 */

export const testTranscripts = {
  complete: {
    text: 'Hi my name is Sarah Johnson and I\'m 28 years old. I lost my job last month and now I\'m facing eviction. I need help with rent money about fifteen hundred dollars. I have two kids and we might be homeless soon. You can reach me at sarah.johnson@email.com or call me at 555-123-4567. I live in Portland Oregon.',
    expectedFields: {
      beneficiaryName: 'Sarah Johnson',
      location: 'Portland, Oregon',
      email: 'sarah.johnson@email.com',
      phone: '555-123-4567',
      goalAmount: 1500,
      urgency: 'high'
    }
  },
  
  minimal: {
    text: 'Hi, I need help.',
    expectedFields: {
      beneficiaryName: null,
      location: null,
      email: null,
      phone: null,
      goalAmount: null
    }
  },
  
  partial: {
    text: 'Um, hi, my name is Mike. I\'m in Chicago and I need a place to stay because winter is coming. You can call me at 555-999-8888.',
    expectedFields: {
      beneficiaryName: 'Mike',
      location: 'Chicago',
      phone: '555-999-8888',
      email: null,
      goalAmount: null
    }
  },
  
  dry: {
    text: 'Hi',
    expectedFields: {
      beneficiaryName: null,
      location: null,
      email: null,
      phone: null,
      goalAmount: null
    }
  },
  
  withUnicode: {
    text: 'Hola, mi nombre es José García. Necesito ayuda con $2000 para pagar el alquiler. Mi correo es jose.garcia@email.com.',
    expectedFields: {
      beneficiaryName: 'José García',
      email: 'jose.garcia@email.com',
      goalAmount: 2000
    }
  }
};

export const testManualDrafts = {
  complete: {
    title: 'Help Sarah Get Back on Her Feet',
    story: 'Sarah is a single mother of two who recently lost her job due to company downsizing. She is now facing eviction and needs help paying rent to keep a roof over her children\'s heads. The funds will be used for rent, utilities, and basic necessities while she searches for new employment.',
    goalAmount: 1500,
    currency: 'USD',
    urgencyScore: 9,
    beneficiaryName: 'Sarah Johnson',
    location: 'Portland, OR',
    contactInfo: 'sarah.johnson@email.com'
  },
  
  minimal: {
    title: 'Emergency Housing Help',
    story: 'I need urgent help with housing.',
    goalAmount: 1000,
    currency: 'USD'
  },
  
  medical: {
    title: 'Medical Bill Assistance',
    story: 'Unexpected medical emergency resulted in $5,000 in bills. I have no insurance and need help covering these costs to avoid collections.',
    goalAmount: 5000,
    currency: 'USD',
    urgencyScore: 8,
    beneficiaryName: 'John Smith'
  },
  
  education: {
    title: 'Help Student Pay Tuition',
    story: 'College student needs help with remaining tuition balance to avoid dropping out. Working part-time but unable to cover full costs.',
    goalAmount: 3500,
    currency: 'USD',
    urgencyScore: 6
  },
  
  withUnicode: {
    title: 'Ayuda para José después del huracán 🌪️',
    story: 'José perdió su casa en el huracán y necesita ayuda para reconstruir. Los fondos se usarán para reparaciones urgentes y necesidades básicas.',
    goalAmount: 4000,
    currency: 'USD',
    urgencyScore: 10,
    beneficiaryName: 'José García'
  }
};

export const testHealthStatuses = {
  healthy: {
    status: 'healthy',
    services: {
      openai: true,
      assemblyai: true,
      stripe: true,
      database: true
    }
  },
  
  degraded: {
    status: 'degraded',
    services: {
      openai: false,
      assemblyai: true,
      stripe: true,
      database: true
    }
  },
  
  critical: {
    status: 'critical',
    services: {
      openai: false,
      assemblyai: false,
      stripe: true,
      database: true
    }
  }
};

export const testStripeMetadata = {
  automated: {
    generationMode: 'AUTOMATED',
    source: 'donation_pipeline'
  },
  
  manual: {
    generationMode: 'MANUAL_FALLBACK',
    source: 'manual_fallback'
  }
};

/**
 * Helper function to create test recording ticket
 */
export function createTestRecordingTicket(ticketId: string, transcript: string) {
  return {
    ticketId,
    contactType: 'EMAIL' as const,
    contactValue: `test-${ticketId}@example.com`,
    status: 'PROCESSING' as const,
    audioUrl: `https://example.com/audio/${ticketId}.mp3`,
    transcriptText: transcript
  };
}

/**
 * Helper function to create test system incident query
 */
export function createIncidentQuery(ticketId: string) {
  return {
    where: {
      metadata: {
        path: ['ticketId'],
        equals: ticketId
      }
    }
  };
}

/**
 * Helper function to generate unique test ticket ID
 */
export function generateTestTicketId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Helper function to wait for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper function to create mock Stripe instance
 */
export function createMockStripe() {
  return {
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'cs_test_mock_123',
          url: 'https://checkout.stripe.com/pay/cs_test_mock_123'
        })
      }
    }
  };
}

/**
 * Helper function to verify incident logged
 */
export async function verifyIncidentLogged(
  prisma: any,
  ticketId: string,
  expectedReasonCode: string
): Promise<boolean> {
  const incidents = await prisma.systemIncident.findMany({
    where: {
      metadata: {
        path: ['ticketId'],
        equals: ticketId
      }
    }
  });

  return incidents.some((incident: any) => {
    const metadata = incident.metadata as any;
    return metadata?.reasonCode === expectedReasonCode;
  });
}

/**
 * Helper function to verify draft exists with correct mode
 */
export async function verifyDraftGeneration(
  prisma: any,
  ticketId: string,
  expectedMode: 'AUTOMATED' | 'MANUAL_FALLBACK'
): Promise<boolean> {
  const draft = await prisma.donationDraft.findUnique({
    where: { ticketId }
  });

  return draft?.generationMode === expectedMode;
}

/**
 * Helper function to clean up test data
 */
export async function cleanupTestData(prisma: any, ticketIds: string[]): Promise<void> {
  await prisma.donationDraft.deleteMany({
    where: { ticketId: { in: ticketIds } }
  });
  
  await prisma.recordingTicket.deleteMany({
    where: { ticketId: { in: ticketIds } }
  });
  
  await prisma.systemIncident.deleteMany({
    where: {
      metadata: {
        path: ['ticketId'],
        in: ticketIds
      }
    }
  });
}

/**
 * Performance monitoring helper
 */
export class PerformanceMonitor {
  private startTime: number;
  private checkpoints: Map<string, number> = new Map();

  start() {
    this.startTime = Date.now();
  }

  checkpoint(name: string) {
    this.checkpoints.set(name, Date.now() - this.startTime);
  }

  getDuration(checkpointName?: string): number {
    if (checkpointName) {
      return this.checkpoints.get(checkpointName) || 0;
    }
    return Date.now() - this.startTime;
  }

  getReport(): Record<string, number> {
    return Object.fromEntries(this.checkpoints);
  }
}

/**
 * Mock data generators
 */
export const mockGenerators = {
  
  extractionSuccess: (overrides?: any) => ({
    title: 'Help Request',
    story: 'This is a generated story',
    goalAmount: 2000,
    urgencyScore: 7,
    beneficiaryName: 'Test User',
    location: 'Test City',
    ...overrides
  }),
  
  extractionPartial: (overrides?: any) => ({
    title: 'Incomplete Request',
    story: undefined,
    goalAmount: undefined,
    urgencyScore: 5,
    beneficiaryName: 'Partial User',
    ...overrides
  }),
  
  extractionFailure: () => {
    throw new Error('LLM extraction failed');
  },
  
  healthCheckHealthy: () => ({
    status: 'healthy',
    services: { openai: true, assemblyai: true }
  }),
  
  healthCheckDegraded: () => ({
    status: 'degraded',
    services: { openai: false, assemblyai: true }
  })
};

/**
 * Assertion helpers
 */
export const assertions = {
  
  isPipelineFailureResponse: (response: any): boolean => {
    return (
      response.success === false &&
      typeof response.reasonCode === 'string' &&
      typeof response.userMessage === 'string' &&
      typeof response.debugId === 'string' &&
      typeof response.ticketId === 'string'
    );
  },
  
  isValidManualDraft: (draft: any): boolean => {
    return (
      typeof draft.id === 'string' &&
      typeof draft.ticketId === 'string' &&
      typeof draft.title === 'string' &&
      typeof draft.story === 'string' &&
      draft.goalAmount !== null &&
      draft.generationMode === 'MANUAL_FALLBACK'
    );
  },
  
  hasValidStripeMetadata: (metadata: any): boolean => {
    return (
      typeof metadata.ticketId === 'string' &&
      typeof metadata.generationMode === 'string' &&
      typeof metadata.source === 'string'
    );
  }
};
