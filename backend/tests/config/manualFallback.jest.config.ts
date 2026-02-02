/**
 * Manual Fallback Test Suite Configuration
 * 
 * Jest configuration and setup for comprehensive testing
 */

import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  displayName: 'Manual Fallback Flow',
  testMatch: [
    '**/tests/fallback/**/*.test.ts',
    '**/tests/integration/manualFallback.*.test.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/fallback.setup.ts'],
  testTimeout: 30000, // 30 seconds for integration tests
  verbose: true,
  collectCoverageFrom: [
    'src/services/pipelineFailureHandler.ts',
    'src/services/donationPipelineOrchestrator.ts',
    'src/services/qrCodeGeneratorEnhanced.ts',
    'src/routes/manualDraft.ts',
    'src/types/fallback.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

export default config;
