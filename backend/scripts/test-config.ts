/**
 * Configuration file for Intensive Revenue Pipeline Testing
 * 
 * Customize test parameters, AssemblyAI settings, and output options
 */

export interface TestConfiguration {
  // AssemblyAI Configuration
  assemblyAI: {
    useRealAPI: boolean;           // Set to true to use actual AssemblyAI API
    apiKey?: string;               // AssemblyAI API key (set via env var)
    language: string;              // Language code for transcription
    confidenceThreshold: number;   // Minimum confidence score
    enableWordTimestamps: boolean; // Include word-level timestamps
    enableSpeakerLabels: boolean;  // Enable speaker identification
  };

  // Pipeline Configuration
  pipeline: {
    transcriptionProvider: 'assemblyai' | 'stub';
    enableRealStripe: boolean;     // Use real Stripe API for checkout creation
    enableDocumentGeneration: boolean; // Generate actual DOCX files
    enableQRCodeGeneration: boolean;   // Generate QR codes
    timeout: number;               // Timeout per scenario in ms
    concurrency: number;           // Number of concurrent tests (1 = sequential)
  };

  // Test Data Configuration
  testData: {
    useRealAudioFiles: boolean;    // Use actual audio files instead of mocks
    audioDirectory?: string;       // Directory containing test audio files
    generateSyntheticAudio: boolean; // Generate synthetic audio using TTS
    audioFormat: 'mp3' | 'wav';    // Audio format for test files
  };

  // Output Configuration
  output: {
    generateHTML: boolean;         // Generate HTML report
    generateJSON: boolean;         // Generate JSON report
    generateCSV: boolean;          // Generate CSV export
    saveQRCodeImages: boolean;     // Save QR code images to disk
    saveDraftDocuments: boolean;   // Save generated documents
    includeBase64QR: boolean;      // Include base64 QR codes in results
  };

  // Performance Testing
  performance: {
    enableMetrics: boolean;        // Collect detailed performance metrics
    profileMemoryUsage: boolean;   // Track memory usage during tests
    measureAPILatency: boolean;    // Measure API call latency
    generateLoadReport: boolean;   // Generate load testing report
  };

  // Validation Rules
  validation: {
    minimumGoalAmount: number;     // Minimum valid goal amount
    maximumGoalAmount: number;     // Maximum valid goal amount
    requiredStoryLength: number;   // Minimum story word count
    requiredQRCodeSuccess: number; // Minimum QR code success rate (%)
  };
}

// Default configuration
export const DEFAULT_CONFIG: TestConfiguration = {
  assemblyAI: {
    useRealAPI: false,  // Set to true to test actual AssemblyAI
    language: 'en_us',
    confidenceThreshold: 0.8,
    enableWordTimestamps: true,
    enableSpeakerLabels: false
  },

  pipeline: {
    transcriptionProvider: 'stub',
    enableRealStripe: false,  // Set to true to create real Stripe sessions
    enableDocumentGeneration: true,
    enableQRCodeGeneration: true,
    timeout: 60000,  // 60 seconds per scenario
    concurrency: 1   // Run tests sequentially for stability
  },

  testData: {
    useRealAudioFiles: false,
    generateSyntheticAudio: false,
    audioFormat: 'mp3'
  },

  output: {
    generateHTML: true,
    generateJSON: true,
    generateCSV: false,
    saveQRCodeImages: true,
    saveDraftDocuments: true,
    includeBase64QR: true
  },

  performance: {
    enableMetrics: true,
    profileMemoryUsage: false,
    measureAPILatency: true,
    generateLoadReport: true
  },

  validation: {
    minimumGoalAmount: 100,     // $100 minimum
    maximumGoalAmount: 50000,   // $50,000 maximum
    requiredStoryLength: 50,    // 50 words minimum
    requiredQRCodeSuccess: 90   // 90% success rate required
  }
};

// Environment-specific configurations
export const CONFIGURATIONS = {
  // Development testing with mocks
  development: {
    ...DEFAULT_CONFIG,
    assemblyAI: {
      ...DEFAULT_CONFIG.assemblyAI,
      useRealAPI: false
    },
    pipeline: {
      ...DEFAULT_CONFIG.pipeline,
      transcriptionProvider: 'stub' as const,
      enableRealStripe: false
    }
  },

  // Staging environment with real APIs
  staging: {
    ...DEFAULT_CONFIG,
    assemblyAI: {
      ...DEFAULT_CONFIG.assemblyAI,
      useRealAPI: true,
      apiKey: process.env.ASSEMBLYAI_API_KEY
    },
    pipeline: {
      ...DEFAULT_CONFIG.pipeline,
      transcriptionProvider: 'assemblyai' as const,
      enableRealStripe: false  // Still use mock Stripe in staging
    }
  },

  // Production testing (use with extreme caution)
  production: {
    ...DEFAULT_CONFIG,
    assemblyAI: {
      ...DEFAULT_CONFIG.assemblyAI,
      useRealAPI: true,
      apiKey: process.env.ASSEMBLYAI_API_KEY
    },
    pipeline: {
      ...DEFAULT_CONFIG.pipeline,
      transcriptionProvider: 'assemblyai' as const,
      enableRealStripe: true,  // Creates real Stripe checkout sessions
      timeout: 120000  // Longer timeout for production
    },
    validation: {
      ...DEFAULT_CONFIG.validation,
      requiredQRCodeSuccess: 95  // Higher requirements for production
    }
  },

  // Load testing configuration
  loadTest: {
    ...DEFAULT_CONFIG,
    pipeline: {
      ...DEFAULT_CONFIG.pipeline,
      concurrency: 5,  // Run 5 tests concurrently
      timeout: 30000   // Shorter timeout for load testing
    },
    performance: {
      ...DEFAULT_CONFIG.performance,
      profileMemoryUsage: true,
      generateLoadReport: true
    }
  },

  // Integration testing with real APIs but mock payments
  integration: {
    ...DEFAULT_CONFIG,
    assemblyAI: {
      ...DEFAULT_CONFIG.assemblyAI,
      useRealAPI: true,
      apiKey: process.env.ASSEMBLYAI_API_KEY
    },
    pipeline: {
      ...DEFAULT_CONFIG.pipeline,
      transcriptionProvider: 'assemblyai' as const,
      enableRealStripe: false  // Mock Stripe for integration tests
    },
    testData: {
      ...DEFAULT_CONFIG.testData,
      useRealAudioFiles: true,
      audioDirectory: './test-assets/audio'
    }
  }
};

// Helper function to get configuration by environment
export function getConfig(environment?: string): TestConfiguration {
  const env = environment || process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'staging':
      return CONFIGURATIONS.staging;
    case 'production':
      return CONFIGURATIONS.production;
    case 'load':
      return CONFIGURATIONS.loadTest;
    case 'integration':
      return CONFIGURATIONS.integration;
    default:
      return CONFIGURATIONS.development;
  }
}

// Validation function for configuration
export function validateConfig(config: TestConfiguration): string[] {
  const errors: string[] = [];

  // Validate AssemblyAI configuration
  if (config.assemblyAI.useRealAPI && !config.assemblyAI.apiKey && !process.env.ASSEMBLYAI_API_KEY) {
    errors.push('AssemblyAI API key is required when useRealAPI is true');
  }

  // Validate pipeline configuration
  if (config.pipeline.timeout < 10000) {
    errors.push('Pipeline timeout should be at least 10 seconds');
  }

  if (config.pipeline.concurrency < 1 || config.pipeline.concurrency > 10) {
    errors.push('Concurrency should be between 1 and 10');
  }

  // Validate test data configuration
  if (config.testData.useRealAudioFiles && !config.testData.audioDirectory) {
    errors.push('Audio directory is required when using real audio files');
  }

  // Validate validation rules
  if (config.validation.minimumGoalAmount >= config.validation.maximumGoalAmount) {
    errors.push('Minimum goal amount must be less than maximum goal amount');
  }

  if (config.validation.requiredQRCodeSuccess < 0 || config.validation.requiredQRCodeSuccess > 100) {
    errors.push('Required QR code success rate must be between 0 and 100');
  }

  return errors;
}

// Export configuration types for use in the main test script
export type { TestConfiguration };
