# 🚀 Intensive Revenue Pipeline Testing System

## Overview

This intensive testing system provides comprehensive end-to-end validation of the Care2system revenue generation pipeline. It tests the complete flow from audio transcription through GoFundMe draft generation and QR code creation, simulating real-world scenarios with 10 different story types.

## 🎯 What It Tests

### Core Pipeline Components
- **AssemblyAI Transcription**: Real or mocked speech-to-text conversion
- **Signal Extraction**: Name, goal amount, urgency, category detection
- **Draft Generation**: Automated GoFundMe campaign creation
- **QR Code Generation**: Stripe checkout session and QR code creation
- **Document Generation**: DOCX file creation for revenue packages
- **Database Operations**: Ticket, draft, and metadata persistence

### Test Scenarios (10 Complete Stories)
1. **Single Mother Housing Crisis** - Eviction notice, children, medical needs
2. **Medical Emergency Fundraiser** - Cancer treatment, insurance gaps
3. **Veteran Small Business Recovery** - Fire damage, equipment replacement
4. **Education Fund** - First-generation college student tuition
5. **Family Emergency** - House fire recovery, children's needs
6. **Senior Citizen Medical Transportation** - Dialysis transport challenges
7. **Youth Sports Team Equipment** - Underprivileged kids, safety equipment
8. **Pet Emergency Surgery** - Beloved family dog, unexpected costs
9. **Immigrant Family Legal Support** - Immigration lawyer fees, family unity
10. **Community Garden Project** - Food desert solution, educational program

## 🛠️ Usage

### Quick Start (Development Mode - All Mocked)
```bash
npm run test:intensive
```

### Production-Ready Testing (Real APIs)
```bash
# Test with real AssemblyAI but mock Stripe
npm run test:intensive:staging

# Test with real AssemblyAI and real audio files
npm run test:intensive:integration

# Load testing (5 concurrent scenarios)
npm run test:intensive:load

# Validate configuration without running tests
npm run test:intensive:dry-run
```

### Advanced Usage
```bash
# Run specific scenarios only
tsx scripts/test-runner.ts --scenarios 1,3,5

# Verbose output with debugging info
tsx scripts/test-runner.ts staging --verbose

# Skip cleanup (preserve test data)
tsx scripts/test-runner.ts --skip-cleanup
```

## ⚙️ Configuration

### Environment Variables
```bash
# Required for real AssemblyAI testing
export ASSEMBLYAI_API_KEY="your-assemblyai-key"

# Required for real Stripe testing (production mode only)
export STRIPE_SECRET_KEY="sk_test_or_live_key"

# Override environment selection
export TEST_ENVIRONMENT="staging"
```

### Configuration Environments

#### Development (Default)
- **Transcription**: Stub provider (no API calls)
- **Payments**: Mock Stripe (no charges)
- **Performance**: Sequential execution
- **Use Case**: Local development, CI/CD

#### Staging
- **Transcription**: Real AssemblyAI API
- **Payments**: Mock Stripe (no charges)
- **Performance**: Real API latency testing
- **Use Case**: Pre-production validation

#### Integration
- **Transcription**: Real AssemblyAI API
- **Audio Files**: Real audio file processing
- **Documents**: Full DOCX generation
- **Use Case**: End-to-end integration testing

#### Load Testing
- **Concurrency**: 5 scenarios simultaneously
- **Timeouts**: Reduced for stress testing
- **Metrics**: Memory and performance profiling
- **Use Case**: Performance validation

#### Production (⚠️ Use with caution)
- **Transcription**: Real AssemblyAI API
- **Payments**: Real Stripe checkout sessions
- **Validation**: Stricter success requirements
- **Use Case**: Final production verification

## 📊 Output and Results

### Generated Files Structure
```
test-output/intensive-test-{timestamp}/
├── test-report.html                    # Visual dashboard
├── test-report.json                    # Detailed JSON results
├── qr-codes/
│   ├── qr-1.png                       # QR code images
│   ├── qr-1.json                      # QR metadata
│   └── ...
├── drafts/
│   ├── draft-1.json                   # Generated campaigns
│   └── ...
├── documents/
│   ├── gofundme-1.docx                # Revenue documents
│   └── ...
└── audio-mocks/
    ├── test-audio-housing-crisis.mp3  # Mock audio files
    └── ...
```

### HTML Dashboard Features
- **📈 Success Rate Metrics**: Visual success/failure breakdown
- **🎯 Generated QR Codes**: Scannable codes for each scenario
- **📝 GoFundMe Drafts**: Preview of generated campaigns
- **⚡ Performance Metrics**: Execution times and throughput
- **🔍 Error Analysis**: Detailed failure investigation

### JSON Report Structure
```json
{
  "testSummary": {
    "totalScenarios": 10,
    "successful": 10,
    "successRate": 100,
    "totalDuration": 45000
  },
  "performanceMetrics": {
    "averageExecutionTime": 4500,
    "minExecutionTime": 3200,
    "maxExecutionTime": 6800
  },
  "transcriptionMetrics": {
    "successfulTranscriptions": 10,
    "totalWords": 1250,
    "averageWordsPerScenario": 125
  },
  "detailedResults": [...]
}
```

## 🎯 Quality Validation

### Success Criteria
- **✅ Transcription Success**: 100% completion rate
- **✅ Draft Generation**: All scenarios produce valid campaigns
- **✅ Goal Amount Extraction**: $100 - $50,000 range validation
- **✅ QR Code Generation**: 90%+ success rate required
- **✅ Performance**: <60s per scenario average
- **✅ Story Quality**: Minimum 50 words per generated story

### Automated Validations
- **Name Extraction**: Validates extracted names match expectations
- **Category Classification**: Ensures proper need categorization
- **Urgency Scoring**: Validates crisis vs. routine classification
- **Financial Goals**: Validates realistic goal amounts
- **Content Quality**: Ensures generated stories meet length/quality thresholds

## 🔧 Customization

### Adding New Test Scenarios
Edit `scripts/intensive-revenue-pipeline-test.ts`:

```typescript
const NEW_SCENARIO = {
  id: 11,
  title: "Your New Scenario",
  description: "Brief description",
  expectedGoal: 5000,
  urgencyLevel: "HIGH",
  category: "YOUR_CATEGORY",
  transcriptText: `Your realistic story transcript...`,
  mockAudioPath: "test-audio-new-scenario.mp3"
};

// Add to TEST_SCENARIOS array
```

### Modifying Configuration
Edit `scripts/test-config.ts` to adjust:
- API timeouts and retry logic
- Output format preferences
- Validation thresholds
- Performance requirements

## 📋 Common Use Cases

### 1. Pre-deployment Validation
```bash
# Validate all systems before production deploy
npm run test:intensive:staging
```

### 2. Performance Regression Testing
```bash
# Test system performance under load
npm run test:intensive:load
```

### 3. API Integration Testing
```bash
# Test real APIs without financial transactions
npm run test:intensive:integration
```

### 4. CI/CD Pipeline Integration
```bash
# Fast validation in CI environment
npm run test:intensive:dry-run
```

### 5. Production Readiness Check
```bash
# Full validation with real services (careful!)
npm run test:intensive -- production
```

## 🚨 Important Warnings

### AssemblyAI API Usage
- **Real API calls will incur charges** (~$0.0075 per minute)
- 10 scenarios ≈ 15 minutes of audio ≈ ~$0.11 per test run
- Monitor your AssemblyAI dashboard for usage

### Stripe Integration
- **Production mode creates real checkout sessions**
- Sessions appear in your Stripe dashboard
- No actual charges occur (test mode) but sessions are created
- **NEVER run production mode against live Stripe keys in development**

### Database Impact
- Test creates real database records
- Automatic cleanup runs after completion
- Use `--skip-cleanup` only for debugging
- Monitor database size in high-frequency testing

## 🐛 Troubleshooting

### Common Issues

#### "AssemblyAI API key required"
```bash
export ASSEMBLYAI_API_KEY="your-key-here"
npm run test:intensive:staging
```

#### "Database connection failed"
- Ensure PostgreSQL is running
- Check `DATABASE_URL` environment variable
- Verify database permissions

#### "Timeout exceeded"
- Increase timeout in configuration
- Check network connectivity for API calls
- Consider using stub provider for faster tests

#### "QR Code generation failed"
- Verify QRCode library is installed
- Check file system permissions for output directory
- Ensure adequate disk space

### Debug Mode
```bash
tsx scripts/test-runner.ts staging --verbose
```

## 🚀 Performance Expectations

### Development Mode (All Mocked)
- **Duration**: 15-30 seconds for 10 scenarios
- **Resource Usage**: Minimal CPU/memory
- **API Calls**: None (all mocked)

### Staging Mode (Real AssemblyAI)
- **Duration**: 2-4 minutes for 10 scenarios
- **API Latency**: 15-45 seconds per transcription
- **Success Rate**: 95%+ expected

### Load Testing Mode
- **Concurrency**: 5 scenarios simultaneously
- **Duration**: 45-90 seconds total
- **Memory Usage**: Monitor for leaks
- **API Rate Limits**: May hit AssemblyAI limits

## 📞 Support

For issues with the intensive testing system:

1. **Check Configuration**: Run `npm run test:intensive:dry-run` first
2. **Review Logs**: Use `--verbose` flag for detailed output
3. **Validate Environment**: Ensure all required environment variables are set
4. **Test Isolation**: Run single scenarios with `--scenarios` flag
5. **Database State**: Verify clean database state before testing

---

## 💡 Next Steps

After running intensive tests:

1. **Review HTML Dashboard** - Visual analysis of results
2. **Analyze Performance Metrics** - Identify bottlenecks
3. **Validate Generated Content** - Review QR codes and drafts
4. **Monitor Resource Usage** - Check API quotas and costs
5. **Archive Results** - Save reports for historical comparison

The intensive testing system provides comprehensive validation of your revenue generation pipeline. Use it regularly to ensure system reliability and performance as you deploy updates.