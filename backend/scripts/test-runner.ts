#!/usr/bin/env tsx
/**
 * Intensive Revenue Pipeline Test Runner
 * 
 * Usage:
 *   npm run test:intensive                    # Run with default (development) config
 *   npm run test:intensive -- staging        # Run with staging config (real AssemblyAI)
 *   npm run test:intensive -- production     # Run with production config (CAUTION!)
 *   npm run test:intensive -- integration    # Run integration tests
 *   npm run test:intensive -- load           # Run load tests
 * 
 * Environment Variables:
 *   ASSEMBLYAI_API_KEY                       # Required for real AssemblyAI testing
 *   STRIPE_SECRET_KEY                        # Required for real Stripe testing
 *   TEST_ENVIRONMENT                         # Override environment selection
 */

import { IntensiveRevenuePipelineTest } from './intensive-revenue-pipeline-test';
import { getConfig, validateConfig, TestConfiguration } from './test-config';

interface RunnerOptions {
  environment?: string;
  scenarios?: number[];
  dryRun?: boolean;
  skipCleanup?: boolean;
  verbose?: boolean;
}

class TestRunner {
  private config: TestConfiguration;
  private options: RunnerOptions;

  constructor(options: RunnerOptions = {}) {
    this.options = options;
    this.config = getConfig(options.environment);
    
    // Override config with command line options
    this.applyCommandLineOverrides();
  }

  private applyCommandLineOverrides() {
    // Allow environment variables to override config
    if (process.env.ASSEMBLYAI_API_KEY && !this.config.assemblyAI.apiKey) {
      this.config.assemblyAI.apiKey = process.env.ASSEMBLYAI_API_KEY;
    }

    // Apply verbose logging if requested
    if (this.options.verbose) {
      console.log(`🔧 Configuration loaded for environment: ${this.options.environment || 'development'}`);
      console.log(`📋 Config details:`, JSON.stringify(this.config, null, 2));
    }
  }

  private validateEnvironment(): string[] {
    const errors: string[] = [];

    // Validate configuration
    const configErrors = validateConfig(this.config);
    errors.push(...configErrors);

    // Environment-specific validations
    if (this.config.assemblyAI.useRealAPI) {
      if (!this.config.assemblyAI.apiKey && !process.env.ASSEMBLYAI_API_KEY) {
        errors.push('❌ AssemblyAI API key is required for real API testing');
      } else {
        console.log('✅ AssemblyAI API key detected');
      }
    }

    if (this.config.pipeline.enableRealStripe) {
      if (!process.env.STRIPE_SECRET_KEY) {
        errors.push('❌ Stripe secret key is required for real Stripe testing');
      } else {
        console.log('✅ Stripe secret key detected');
      }
    }

    return errors;
  }

  private setEnvironmentVariables() {
    // Set environment variables based on configuration
    if (this.config.assemblyAI.useRealAPI) {
      process.env.TRANSCRIPTION_PROVIDER = 'assemblyai';
      process.env.ASSEMBLYAI_API_KEY = this.config.assemblyAI.apiKey || process.env.ASSEMBLYAI_API_KEY;
    } else {
      process.env.TRANSCRIPTION_PROVIDER = 'stub';
      process.env.ENABLE_STRESS_TEST_MODE = 'true';
    }

    if (this.config.pipeline.enableRealStripe) {
      process.env.STRIPE_MODE = 'live';
    } else {
      process.env.STRIPE_MODE = 'mock';
    }

    // Set other pipeline configurations
    process.env.ZERO_OPENAI_MODE = 'true';
    process.env.NODE_ENV = 'test';
  }

  private displayPreRunSummary() {
    console.log(`\n🚀 INTENSIVE REVENUE PIPELINE TEST RUNNER`);
    console.log(`==========================================`);
    console.log(`Environment: ${this.options.environment || 'development'}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`\n📋 Test Configuration:`);
    console.log(`🎤 Transcription: ${this.config.pipeline.transcriptionProvider} ${this.config.assemblyAI.useRealAPI ? '(Real API)' : '(Mock)'}`);
    console.log(`💳 Payments: ${this.config.pipeline.enableRealStripe ? 'Real Stripe' : 'Mock Stripe'}`);
    console.log(`📄 Documents: ${this.config.pipeline.enableDocumentGeneration ? 'Enabled' : 'Disabled'}`);
    console.log(`🎯 QR Codes: ${this.config.pipeline.enableQRCodeGeneration ? 'Enabled' : 'Disabled'}`);
    console.log(`⚡ Concurrency: ${this.config.pipeline.concurrency} scenario(s) at a time`);
    console.log(`⏱️  Timeout: ${this.config.pipeline.timeout}ms per scenario`);
    
    if (this.options.scenarios && this.options.scenarios.length > 0) {
      console.log(`🎯 Running specific scenarios: ${this.options.scenarios.join(', ')}`);
    } else {
      console.log(`🎯 Running all scenarios (10 total)`);
    }

    console.log(`\n📊 Output Configuration:`);
    console.log(`HTML Report: ${this.config.output.generateHTML ? '✅' : '❌'}`);
    console.log(`JSON Report: ${this.config.output.generateJSON ? '✅' : '❌'}`);
    console.log(`QR Images: ${this.config.output.saveQRCodeImages ? '✅' : '❌'}`);
    console.log(`Documents: ${this.config.output.saveDraftDocuments ? '✅' : '❌'}`);

    if (this.options.dryRun) {
      console.log(`\n🔍 DRY RUN MODE - No actual tests will be executed`);
      return;
    }

    console.log(`\n⚠️  IMPORTANT NOTICES:`);
    if (this.config.assemblyAI.useRealAPI) {
      console.log(`🔔 This test will make REAL API calls to AssemblyAI`);
      console.log(`💰 API usage charges will apply to your AssemblyAI account`);
    }
    if (this.config.pipeline.enableRealStripe) {
      console.log(`🔔 This test will create REAL Stripe checkout sessions`);
      console.log(`💳 Test sessions will appear in your Stripe dashboard`);
    }

    console.log(`\n⏳ Starting test in 5 seconds... (Press Ctrl+C to cancel)`);
    console.log(`==========================================\n`);
  }

  async run(): Promise<void> {
    try {
      // Validate environment and configuration
      console.log(`🔍 Validating test environment...`);
      const errors = this.validateEnvironment();
      
      if (errors.length > 0) {
        console.error(`❌ Environment validation failed:`);
        errors.forEach(error => console.error(`   ${error}`));
        process.exit(1);
      }

      // Display pre-run summary
      this.displayPreRunSummary();

      // Exit if dry run
      if (this.options.dryRun) {
        console.log(`✅ Dry run completed successfully`);
        return;
      }

      // Wait 5 seconds before starting (allows user to cancel)
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Set environment variables
      this.setEnvironmentVariables();

      // Create and configure test instance
      const tester = new IntensiveRevenuePipelineTest();

      // Run the intensive test
      await tester.run();

      console.log(`\n🎉 Test completed successfully!`);

    } catch (error: any) {
      console.error(`❌ Test execution failed:`, error.message);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }
}

// Parse command line arguments
function parseCommandLine(): RunnerOptions {
  const args = process.argv.slice(2);
  const options: RunnerOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--help':
      case '-h':
        displayHelp();
        process.exit(0);
        break;

      case '--dry-run':
        options.dryRun = true;
        break;

      case '--verbose':
      case '-v':
        options.verbose = true;
        break;

      case '--skip-cleanup':
        options.skipCleanup = true;
        break;

      case '--scenarios':
        if (i + 1 < args.length) {
          options.scenarios = args[++i].split(',').map(s => parseInt(s.trim()));
        }
        break;

      default:
        // Assume it's an environment name if it doesn't start with --
        if (!arg.startsWith('--')) {
          options.environment = arg;
        }
        break;
    }
  }

  return options;
}

function displayHelp() {
  console.log(`
🚀 Intensive Revenue Pipeline Test Runner

Usage:
  tsx scripts/test-runner.ts [environment] [options]

Environments:
  development   Use mock APIs and services (default)
  staging       Use real AssemblyAI, mock Stripe
  production    Use real AssemblyAI and Stripe (CAUTION!)
  integration   Use real AssemblyAI with real audio files
  load          Run load tests with concurrency

Options:
  --dry-run             Validate configuration without running tests
  --verbose, -v         Enable verbose logging
  --skip-cleanup        Don't clean up test data after completion
  --scenarios 1,2,3     Run only specific scenarios (comma-separated)
  --help, -h            Show this help message

Environment Variables:
  ASSEMBLYAI_API_KEY    Required for real AssemblyAI testing
  STRIPE_SECRET_KEY     Required for real Stripe testing
  TEST_ENVIRONMENT      Override environment selection

Examples:
  tsx scripts/test-runner.ts                    # Development mode
  tsx scripts/test-runner.ts staging            # Staging with real APIs
  tsx scripts/test-runner.ts --dry-run          # Validate config only
  tsx scripts/test-runner.ts integration -v     # Integration tests (verbose)
  tsx scripts/test-runner.ts --scenarios 1,2,3  # Run specific scenarios
`);
}

// Main execution
async function main() {
  const options = parseCommandLine();
  const runner = new TestRunner(options);
  
  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log(`\n⚠️  Test interrupted by user`);
    process.exit(130);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  await runner.run();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { TestRunner, parseCommandLine };
