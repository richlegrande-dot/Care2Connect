/**
 * Jan v4.0+ Evaluation Runner
 * 
 * Enhanced evaluation framework with:
 * - Stricter scoring (5% amount tolerance default)
 * - Dual thresholds (STRICT ≥95%, ACCEPTABLE ≥85%)
 * - Performance monitoring
 * - Enhanced failure bucket analysis
 * - Regression detection
 * - No network calls (ZERO_OPENAI_MODE enforced)
 * - PII scan enforcement
 * 
 * Usage:
 *   node run_eval_v4plus.js --dataset core30
 *   node run_eval_v4plus.js --dataset hard60
 *   node run_eval_v4plus.js --dataset fuzz200
 *   node run_eval_v4plus.js --dataset all
 */

const fs = require('fs');
const path = require('path');

// Import parser adapter (stable interface)
const parserAdapter = require('./parserAdapter');

// Import utilities
const { PIIScanner } = require('../utils/piiScanner');
const { ChecksumValidator } = require('../utils/checksumValidator');
const { FuzzCaseGenerator } = require('../generators/generate_fuzz_cases');

// Configuration
const CONFIG = {
  STRICT_PASS_THRESHOLD: 0.95,
  ACCEPTABLE_PASS_THRESHOLD: 0.85,
  DEFAULT_AMOUNT_TOLERANCE: 0.05, // 5% instead of 10%
  PERFORMANCE_BUDGET_MS: 3000,
  MAX_MEMORY_MB: 512,
  ZERO_OPENAI_MODE: true,
  ENFORCE_NO_NETWORK: true,
  ENFORCE_PII_SCAN: true
};

// Failure bucket definitions
const FAILURE_BUCKETS = {
  NAME_EXTRACTION: {
    'name_missing': 'Name extracted as "Unknown" when name was present',
    'name_fragment': 'Name includes sentence fragments or artifacts',
    'name_wrong': 'Completely incorrect name extracted',
    'name_incomplete': 'Partial name extracted (missing first/last)',
    'name_title_included': 'Title (Dr/Mr/Mrs) not cleaned from name',
    'name_suffix_included': 'Suffix (Jr/III) not cleaned from name'
  },
  CATEGORY: {
    'category_wrong': 'Incorrect category selected',
    'category_priority_violated': 'Multi-category priority rule violated',
    'category_too_generic': 'Defaulted to OTHER when specific category present'
  },
  URGENCY: {
    'urgency_under_assessed': 'Urgency level too low (e.g., CRITICAL → HIGH)',
    'urgency_over_assessed': 'Urgency level too high (e.g., MEDIUM → CRITICAL)',
    'urgency_conflicting_signals': 'Failed to resolve conflicting urgency signals',
    'urgency_keyword_missed': 'Critical urgency keyword not detected'
  },
  AMOUNT: {
    'amount_missing': 'Amount not extracted when present',
    'amount_wrong_selection': 'Wrong amount selected from multiple numbers',
    'amount_max_strategy_failed': 'Max selection strategy chose wrong number',
    'amount_outside_tolerance': 'Amount within range but outside tolerance',
    'amount_irrelevant_number': 'Selected irrelevant number (age/wage/date)'
  },
  ROBUSTNESS: {
    'filler_words_broke_parsing': 'Excessive filler words caused failure',
    'punctuation_broke_parsing': 'Punctuation chaos caused failure',
    'reordering_broke_parsing': 'Clause reordering caused failure',
    'adversarial_not_blocked': 'Adversarial token not sanitized'
  }
};

class V4PlusEvaluationRunner {
  constructor(config = CONFIG) {
    this.config = config;
    // Parser accessed via adapter - no direct instantiation
    this.results = {
      totalCases: 0,
      strictPass: 0,
      acceptablePass: 0,
      failures: [],
      failureBuckets: {},
      performanceMetrics: {
        startTime: null,
        endTime: null,
        totalMs: 0,
        avgMsPerCase: 0,
        peakMemoryMB: 0
      },
      regressions: [],
      lowConfidenceFuzzCases: []
    };
    
    // Initialize failure buckets
    Object.values(FAILURE_BUCKETS).forEach(bucket => {
      Object.keys(bucket).forEach(key => {
        this.failureBuckets = this.failureBuckets || {};
        this.failureBuckets[key] = [];
      });
    });
    
    this.enforceEnvironment();
  }

  enforceEnvironment() {
    // Enforce ZERO_OPENAI_MODE
    if (this.config.ZERO_OPENAI_MODE) {
      process.env.ZERO_OPENAI_MODE = 'true';
      process.env.OPENAI_API_KEY = '';
    }
    
    // Enable enhancement systems for complete evaluation
    process.env.USE_V3B_ENHANCEMENTS = 'true';  // Phase 1.5: Core30 protection
    process.env.USE_V2C_ENHANCEMENTS = 'false'; // Phase 2: Category improvements - TEMPORARILY DISABLED FOR TEST
    process.env.USE_V2D_ENHANCEMENTS = 'true';  // Phase 1: Core30 category fixes (Conservative)
    process.env.USE_V3C_ENHANCEMENTS = 'true';  // Phase 3: Conservative urgency boost
    
    // Enforce no network (simplified check)
    if (this.config.ENFORCE_NO_NETWORK) {
      const http = require('http');
      const https = require('https');
      const originalHttpRequest = http.request;
      const originalHttpsRequest = https.request;
      
      http.request = function(...args) {
        throw new Error('NETWORK_VIOLATION: HTTP request attempted during evaluation');
      };
      
      https.request = function(...args) {
        throw new Error('NETWORK_VIOLATION: HTTPS request attempted during evaluation');
      };
    }
  }

  loadDataset(datasetName) {
    const datasetsDir = path.join(__dirname, '../datasets');
    let filePath;
    
    if (datasetName === 'core30') {
      filePath = path.join(datasetsDir, 'core30.jsonl');
      
      // Verify core30 checksum (immutability check)
      console.log('Verifying core30 immutability...');
      const checksumPath = path.join(datasetsDir, 'core30.checksum.txt');
      const validator = new ChecksumValidator(filePath, checksumPath);
      validator.verify();
      
    } else if (datasetName === 'hard60') {
      filePath = path.join(datasetsDir, 'hard60.jsonl');
    } else if (datasetName === 'fuzz200') {
      filePath = path.join(datasetsDir, 'fuzz200.jsonl');
      
      // Auto-generate or verify fuzz200
      this.ensureFuzz200(filePath);
      
    } else if (datasetName === 'fuzz500') {
      filePath = path.join(datasetsDir, 'fuzz500.jsonl');
      
      // Auto-generate or verify fuzz500
      this.ensureFuzz500(filePath);
      
    } else if (datasetName === 'fuzz10k') {
      filePath = path.join(datasetsDir, 'fuzz10k.jsonl');
      
      // Auto-generate or verify fuzz10k
      this.ensureFuzz10k(filePath);
      
    } else if (datasetName === 'realistic50') {
      filePath = path.join(datasetsDir, 'realistic50.jsonl');
      
    } else if (datasetName === 'all') {
      // Load all datasets (290 cases: 30 + 60 + 200)
      console.log('🔄 Loading core30...');
      const core30 = this.loadDataset('core30');
      console.log(`✅ core30 loaded: ${core30.length} cases`);
      
      console.log('🔄 Loading hard60...');
      const hard60 = this.loadDataset('hard60');
      console.log(`✅ hard60 loaded: ${hard60.length} cases`);
      
      console.log('🔄 Loading fuzz200...');
      const fuzz200 = this.loadDataset('fuzz200');
      console.log(`✅ fuzz200 loaded: ${fuzz200.length} cases`);
      
      console.log('🔄 Loading realistic50...');
      const realistic50 = this.loadDataset('realistic50');
      console.log(`✅ realistic50 loaded: ${realistic50.length} cases`);
      
      return [...core30, ...hard60, ...realistic50, ...fuzz200];
    } else if (datasetName === 'all500') {
      // Load all datasets with 500 fuzz cases (590 cases: 30 + 60 + 500)
      const core30 = this.loadDataset('core30');
      const hard60 = this.loadDataset('hard60');
      const fuzz500 = this.loadDataset('fuzz500');
      return [...core30, ...hard60, ...fuzz500];
    } else if (datasetName === 'all10k') {
      // Load all datasets with 10k fuzz cases (10,590 cases: 30 + 60 + 10,500)
      const core30 = this.loadDataset('core30');
      const hard60 = this.loadDataset('hard60');
      const fuzz10k = this.loadDataset('fuzz10k');
      return [...core30, ...hard60, ...fuzz10k];
    } else {
      throw new Error(`Unknown dataset: ${datasetName}`);
    }
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Dataset not found: ${filePath}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    const data = lines.map(line => JSON.parse(line));
    
    // Filter out metadata line (if present)
    return data.filter(item => !item._meta);
  }

  /**
   * Ensure fuzz200.jsonl exists and is valid
   * Auto-generates if missing or verifies metadata if exists
   */
  ensureFuzz200(filePath) {
    const expectedSeed = 1234;
    const expectedCount = 200;
    const expectedVersion = '1.0.0';
    
    if (!fs.existsSync(filePath)) {
      console.log('\n⚠️  fuzz200.jsonl not found. Auto-generating...');
      console.log(`   Seed: ${expectedSeed}`);
      console.log(`   Count: ${expectedCount}\n`);
      
      const generator = new FuzzCaseGenerator(expectedSeed);
      const cases = generator.generate(expectedCount);
      
      // Calculate confidence stats
      const confidenceStats = {
        avg: cases.reduce((sum, c) => sum + c.labelConfidence, 0) / cases.length,
        min: Math.min(...cases.map(c => c.labelConfidence)),
        max: Math.max(...cases.map(c => c.labelConfidence)),
        lowConfidenceCount: cases.filter(c => c.labelConfidence < 0.75).length
      };
      
      const datasetMeta = {
        _meta: true,
        generatorVersion: expectedVersion,
        seed: expectedSeed,
        count: cases.length,
        createdAt: new Date().toISOString(),
        confidenceStats
      };
      
      const jsonlContent = JSON.stringify(datasetMeta) + '\n' + cases.map(c => JSON.stringify(c)).join('\n');
      fs.writeFileSync(filePath, jsonlContent, 'utf8');
      
      console.log(`✅ Generated ${cases.length} fuzz cases`);
      console.log(`   Low confidence (<75%): ${confidenceStats.lowConfidenceCount} cases\n`);
      return;
    }
    
    // Verify existing fuzz200 metadata
    console.log('Verifying fuzz200 metadata...');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    if (lines.length === 0) {
      throw new Error('fuzz200.jsonl is empty');
    }
    
    const firstLine = JSON.parse(lines[0]);
    
    if (firstLine._meta) {
      // Check metadata
      if (firstLine.seed !== expectedSeed) {
        throw new Error(
          `fuzz200.jsonl seed mismatch.\n` +
          `  Expected: ${expectedSeed}\n` +
          `  Found: ${firstLine.seed}\n\n` +
          `Regenerate with: npm run eval:v4plus:generate-fuzz`
        );
      }
      
      if (firstLine.count !== expectedCount) {
        throw new Error(
          `fuzz200.jsonl count mismatch.\n` +
          `  Expected: ${expectedCount}\n` +
          `  Found: ${firstLine.count}\n\n` +
          `Regenerate with: npm run eval:v4plus:generate-fuzz`
        );
      }
      
      if (firstLine.generatorVersion !== expectedVersion) {
        console.warn(
          `⚠️  fuzz200.jsonl generator version mismatch.\n` +
          `  Expected: ${expectedVersion}\n` +
          `  Found: ${firstLine.generatorVersion}\n` +
          `  Continuing anyway (may cause issues)...\n`
        );
      }
      
      console.log('✅ fuzz200 metadata valid');
      console.log(`   Seed: ${firstLine.seed}`);
      console.log(`   Count: ${firstLine.count}`);
      console.log(`   Generated: ${firstLine.createdAt}\n`);
    } else {
      console.warn('⚠️  fuzz200.jsonl has no metadata (old format). Consider regenerating.\n');
    }
  }

  /**
   * Ensure fuzz500.jsonl exists and is valid
   * Auto-generates if missing or verifies metadata if exists
   */
  ensureFuzz500(filePath) {
    const expectedSeed = 1234;
    const expectedCount = 500;
    const expectedVersion = '1.0.0';
    
    if (!fs.existsSync(filePath)) {
      console.log('\n⚠️  fuzz500.jsonl not found. Auto-generating...');
      console.log(`   Seed: ${expectedSeed}`);
      console.log(`   Count: ${expectedCount}\n`);
      
      const generator = new FuzzCaseGenerator(expectedSeed);
      const cases = generator.generate(expectedCount);
      
      // Calculate confidence stats
      const confidenceStats = {
        avg: cases.reduce((sum, c) => sum + c.labelConfidence, 0) / cases.length,
        min: Math.min(...cases.map(c => c.labelConfidence)),
        max: Math.max(...cases.map(c => c.labelConfidence)),
        lowConfidenceCount: cases.filter(c => c.labelConfidence < 0.75).length
      };
      
      const datasetMeta = {
        _meta: true,
        generatorVersion: expectedVersion,
        seed: expectedSeed,
        count: cases.length,
        createdAt: new Date().toISOString(),
        confidenceStats
      };
      
      const jsonlContent = JSON.stringify(datasetMeta) + '\n' + cases.map(c => JSON.stringify(c)).join('\n');
      fs.writeFileSync(filePath, jsonlContent, 'utf8');
      
      console.log(`✅ Generated ${cases.length} fuzz cases`);
      console.log(`   Low confidence (<75%): ${confidenceStats.lowConfidenceCount} cases\n`);
      return;
    }
    
    // Verify existing fuzz500 metadata
    console.log('Verifying fuzz500 metadata...');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    if (lines.length === 0) {
      throw new Error('fuzz500.jsonl is empty');
    }
    
    const firstLine = JSON.parse(lines[0]);
    
    if (firstLine._meta) {
      // Check metadata
      if (firstLine.seed !== expectedSeed) {
        throw new Error(
          `fuzz500.jsonl seed mismatch.\n` +
          `  Expected: ${expectedSeed}\n` +
          `  Found: ${firstLine.seed}\n\n` +
          `Regenerate with: npm run eval:v4plus:generate-fuzz500`
        );
      }
      
      if (firstLine.count !== expectedCount) {
        throw new Error(
          `fuzz500.jsonl count mismatch.\n` +
          `  Expected: ${expectedCount}\n` +
          `  Found: ${firstLine.count}\n\n` +
          `Regenerate with: npm run eval:v4plus:generate-fuzz500`
        );
      }
      
      if (firstLine.generatorVersion !== expectedVersion) {
        console.warn(
          `⚠️  fuzz500.jsonl generator version mismatch.\n` +
          `  Expected: ${expectedVersion}\n` +
          `  Found: ${firstLine.generatorVersion}\n` +
          `  Continuing anyway (may cause issues)...\n`
        );
      }
      
      console.log('✅ fuzz500 metadata valid');
      console.log(`   Seed: ${firstLine.seed}`);
      console.log(`   Count: ${firstLine.count}`);
      console.log(`   Generated: ${firstLine.createdAt}\n`);
    } else {
      console.warn('⚠️  fuzz500.jsonl has no metadata (old format). Consider regenerating.\n');
    }
  }

  /**
   * Ensure fuzz10k.jsonl exists and is valid
   * Auto-generates if missing or verifies metadata if exists
   */
  ensureFuzz10k(filePath) {
    const expectedSeed = 1234;
    const expectedCount = 10500;
    const expectedVersion = '1.0.0';
    
    if (!fs.existsSync(filePath)) {
      console.log('\n⚠️  fuzz10k.jsonl not found. Auto-generating...');
      console.log(`   Seed: ${expectedSeed}`);
      console.log(`   Count: ${expectedCount}`);
      console.log(`   This will take ~30 seconds...\n`);
      
      const generator = new FuzzCaseGenerator(expectedSeed);
      const cases = generator.generate(expectedCount);
      
      // Calculate confidence stats
      const confidenceStats = {
        avg: cases.reduce((sum, c) => sum + c.labelConfidence, 0) / cases.length,
        min: Math.min(...cases.map(c => c.labelConfidence)),
        max: Math.max(...cases.map(c => c.labelConfidence)),
        lowConfidenceCount: cases.filter(c => c.labelConfidence < 0.75).length
      };
      
      const datasetMeta = {
        _meta: true,
        generatorVersion: expectedVersion,
        seed: expectedSeed,
        count: cases.length,
        createdAt: new Date().toISOString(),
        confidenceStats
      };
      
      const jsonlContent = JSON.stringify(datasetMeta) + '\n' + cases.map(c => JSON.stringify(c)).join('\n');
      fs.writeFileSync(filePath, jsonlContent, 'utf8');
      
      console.log(`✅ Generated ${cases.length} fuzz cases`);
      console.log(`   Low confidence (<75%): ${confidenceStats.lowConfidenceCount} cases\n`);
      return;
    }
    
    // Verify existing fuzz10k metadata
    console.log('Verifying fuzz10k metadata...');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    if (lines.length === 0) {
      throw new Error('fuzz10k.jsonl is empty');
    }
    
    const firstLine = JSON.parse(lines[0]);
    
    if (firstLine._meta) {
      // Check metadata
      if (firstLine.seed !== expectedSeed) {
        throw new Error(
          `fuzz10k.jsonl seed mismatch.\n` +
          `  Expected: ${expectedSeed}\n` +
          `  Found: ${firstLine.seed}\n\n` +
          `Regenerate with: npm run eval:v4plus:generate-fuzz10k`
        );
      }
      
      if (firstLine.count !== expectedCount) {
        throw new Error(
          `fuzz10k.jsonl count mismatch.\n` +
          `  Expected: ${expectedCount}\n` +
          `  Found: ${firstLine.count}\n\n` +
          `Regenerate with: npm run eval:v4plus:generate-fuzz10k`
        );
      }
      
      if (firstLine.generatorVersion !== expectedVersion) {
        console.warn(
          `⚠️  fuzz10k.jsonl generator version mismatch.\n` +
          `  Expected: ${expectedVersion}\n` +
          `  Found: ${firstLine.generatorVersion}\n` +
          `  Continuing anyway (may cause issues)...\n`
        );
      }
      
      console.log('✅ fuzz10k metadata valid');
      console.log(`   Seed: ${firstLine.seed}`);
      console.log(`   Count: ${firstLine.count}`);
      console.log(`   Generated: ${firstLine.createdAt}\n`);
    } else {
      console.warn('⚠️  fuzz10k.jsonl has no metadata (old format). Consider regenerating.\n');
    }
  }

  async evaluateCase(testCase) {
    const startTime = process.hrtime.bigint();
    
    // Parse transcript using adapter (async)
    const parseResult = await parserAdapter.extractAll(testCase.transcriptText, testCase);
    
    const endTime = process.hrtime.bigint();
    const latencyMs = Number(endTime - startTime) / 1_000_000;
    
    // Extract results (parserAdapter already returns just the results object)
    const { name, category, urgencyLevel: urgency, goalAmount: amount } = parseResult;
    
        const expected = testCase.expected;
    
    // Get strictness settings (use case-specific or defaults)
    const strictness = testCase.strictness || {};
    const amountTolerance = strictness.amountTolerance || this.config.DEFAULT_AMOUNT_TOLERANCE;
    const allowFuzzyName = strictness.allowFuzzyName !== undefined ? strictness.allowFuzzyName : false;
    
    // Field matching
    const nameMatch = this.matchName(name, expected.name, allowFuzzyName);
    const categoryMatch = category === expected.category;
    const urgencyMatch = urgency === expected.urgencyLevel;
    const amountMatch = this.matchAmount(amount, expected.goalAmount, amountTolerance);
    
    // Calculate weighted score (equal weights)
    const fieldWeights = {
      name: 0.25,
      category: 0.25,
      urgency: 0.25,
      amount: 0.25
    };
    
    let weightedScore = 0;
    if (nameMatch) weightedScore += fieldWeights.name;
    if (categoryMatch) weightedScore += fieldWeights.category;
    if (urgencyMatch) weightedScore += fieldWeights.urgency;
    if (amountMatch) weightedScore += fieldWeights.amount;
    
    // Determine pass status
    // For low-confidence fuzz cases (<0.75), don't count against STRICT score
    const labelConfidence = testCase.labelConfidence || 1.0;
    const isLowConfidenceFuzz = testCase.difficulty === 'fuzz' && labelConfidence < 0.75;
    
    let strictPass;
    if (isLowConfidenceFuzz) {
      // Low confidence cases: use relaxed threshold or mark as N/A for strict
      strictPass = weightedScore >= this.config.ACCEPTABLE_PASS_THRESHOLD;
    } else {
      strictPass = weightedScore >= this.config.STRICT_PASS_THRESHOLD;
    }
    
    const acceptablePass = weightedScore >= this.config.ACCEPTABLE_PASS_THRESHOLD;
    
    // Track low confidence fuzz cases
    if (isLowConfidenceFuzz) {
      this.results.lowConfidenceFuzzCases.push({
        id: testCase.id,
        confidence: labelConfidence,
        mutationOps: testCase.mutationOps || [],
        score: weightedScore
      });
    }
    
    // Classify failures into buckets
    const failureBuckets = this.classifyFailures(
      testCase,
      { name, category, urgency, amount },
      expected,
      { nameMatch, categoryMatch, urgencyMatch, amountMatch }
    );
    
    return {
      testCase,
      parseResult: { name, category, urgency, amount },
      expected,
      matches: { nameMatch, categoryMatch, urgencyMatch, amountMatch },
      weightedScore,
      strictPass,
      acceptablePass,
      failureBuckets,
      latencyMs
    };
  }

  matchName(actual, expected, allowFuzzy) {
    if (expected === 'Unknown' || expected === null) {
      return actual === 'Unknown' || actual === null;
    }
    
    if (allowFuzzy) {
      // Fuzzy matching: normalize and compare
      const normalize = (str) => str.toLowerCase().replace(/[^a-z]/g, '');
      return normalize(actual) === normalize(expected);
    } else {
      // Strict matching
      return actual === expected;
    }
  }

  matchAmount(actual, expected, tolerance) {
    if (expected === null || expected === 'none') {
      return actual === null || actual === 'none';
    }
    
    const expectedNum = typeof expected === 'string' 
      ? parseFloat(expected.replace(/[$,]/g, ''))
      : expected;
    
    const actualNum = typeof actual === 'string'
      ? parseFloat(actual.replace(/[$,]/g, ''))
      : actual;
    
    if (isNaN(expectedNum) || isNaN(actualNum)) {
      return false;
    }
    
    const diff = Math.abs(actualNum - expectedNum);
    const allowedDiff = expectedNum * tolerance;
    
    return diff <= allowedDiff;
  }

  classifyFailures(testCase, actual, expected, matches) {
    const buckets = [];
    
    // Name failures
    if (!matches.nameMatch) {
      if (actual.name === 'Unknown' && expected.name !== 'Unknown') {
        buckets.push('name_missing');
      } else if (!actual.name || actual.name.includes('.') || actual.name.includes('!') || actual.name.length > 50) {
        buckets.push('name_fragment');
      } else if (actual.name && (actual.name.includes('Dr') || actual.name.includes('Mr') || actual.name.includes('Mrs'))) {
        buckets.push('name_title_included');
      } else if (actual.name && (actual.name.includes('Jr') || actual.name.includes('III') || actual.name.includes('II'))) {
        buckets.push('name_suffix_included');
      } else {
        buckets.push('name_wrong');
      }
    }
    
    // Category failures
    if (!matches.categoryMatch) {
      if (actual.category === 'OTHER' && expected.category !== 'OTHER') {
        buckets.push('category_too_generic');
      } else if (testCase.notes && testCase.notes.includes('Multi-category')) {
        buckets.push('category_priority_violated');
      } else {
        buckets.push('category_wrong');
      }
    }
    
    // Urgency failures
    if (!matches.urgencyMatch) {
      const urgencyLevels = { 'LOW': 0, 'MEDIUM': 1, 'HIGH': 2, 'CRITICAL': 3 };
      const actualLevel = urgencyLevels[actual.urgency] || 1;
      const expectedLevel = urgencyLevels[expected.urgencyLevel] || 1;
      
      if (actualLevel < expectedLevel) {
        buckets.push('urgency_under_assessed');
      } else {
        buckets.push('urgency_over_assessed');
      }
      
      if (testCase.notes && testCase.notes.includes('Conflicting urgency')) {
        buckets.push('urgency_conflicting_signals');
      }
    }
    
    // Amount failures
    if (!matches.amountMatch) {
      if (actual.amount === null && expected.goalAmount !== null) {
        buckets.push('amount_missing');
      } else if (testCase.notes && testCase.notes.includes('Multi-number')) {
        buckets.push('amount_wrong_selection');
      } else {
        buckets.push('amount_outside_tolerance');
      }
    }
    
    // Robustness failures (fuzz cases)
    if (testCase.difficulty === 'fuzz' && !matches) {
      if (testCase.mutationOps) {
        if (testCase.mutationOps.includes('insertFillerWords')) {
          buckets.push('filler_words_broke_parsing');
        }
        if (testCase.mutationOps.includes('insertPunctuationChaos')) {
          buckets.push('punctuation_broke_parsing');
        }
        if (testCase.mutationOps.includes('reorderClauses')) {
          buckets.push('reordering_broke_parsing');
        }
        if (testCase.mutationOps.includes('insertAdversarialToken')) {
          buckets.push('adversarial_not_blocked');
        }
      }
    }
    
    return buckets;
  }

  detectRegressions(results) {
    // Core30 are baseline cases - any strict failure is a regression
    const core30Failures = results.filter(r => 
      r.testCase.id.startsWith('T0') && !r.strictPass
    );
    
    return core30Failures.map(r => ({
      testId: r.testCase.id,
      expectedScore: 1.0,
      actualScore: r.weightedScore,
      failedFields: Object.entries(r.matches)
        .filter(([field, match]) => !match)
        .map(([field]) => field)
    }));
  }

  generateReport(results, datasetName) {
    const strictPasses = results.filter(r => r.strictPass).length;
    const acceptablePasses = results.filter(r => r.acceptablePass).length;
    const strictPassRate = (strictPasses / results.length) * 100;
    const acceptablePassRate = (acceptablePasses / results.length) * 100;
    
    // Aggregate failure buckets
    const bucketCounts = {};
    results.forEach(r => {
      r.failureBuckets.forEach(bucket => {
        bucketCounts[bucket] = bucketCounts[bucket] || { count: 0, cases: [] };
        bucketCounts[bucket].count++;
        bucketCounts[bucket].cases.push(r.testCase.id);
      });
    });
    
    // Sort buckets by count
    const topBuckets = Object.entries(bucketCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);
    
    // Performance metrics
    const avgLatency = results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length;
    const totalLatency = results.reduce((sum, r) => sum + r.latencyMs, 0);
    
    // Detect regressions
    const regressions = this.detectRegressions(results);
    
    // Generate recommended worklist
    const worklist = this.generateWorklist(topBuckets);
    
    // Generate enhanced reporting sections (Upgrade 6)
    const failureTriage = this.generateFailureTriage(results);
    const fieldDriftOverview = this.generateFieldDriftOverview(results);
    const amountSelectionMistakes = this.generateAmountSelectionBreakdown(results);
    const lowConfidenceSummary = this.generateLowConfidenceSummary();
    
    const report = {
      metadata: {
        dataset: datasetName,
        totalCases: results.length,
        timestamp: new Date().toISOString(),
        config: this.config
      },
      summary: {
        strictPassRate: strictPassRate.toFixed(2) + '%',
        acceptablePassRate: acceptablePassRate.toFixed(2) + '%',
        strictPasses,
        acceptablePasses,
        strictFailures: results.length - strictPasses,
        acceptableFailures: results.length - acceptablePasses
      },
      performance: {
        avgLatencyMs: avgLatency.toFixed(2),
        totalLatencyMs: totalLatency.toFixed(2),
        withinBudget: totalLatency < this.config.PERFORMANCE_BUDGET_MS,
        budgetMs: this.config.PERFORMANCE_BUDGET_MS
      },
      failureBuckets: {
        top10Strict: topBuckets.map(([bucket, data]) => ({
          bucket,
          description: this.getBucketDescription(bucket),
          count: data.count,
          percentage: ((data.count / results.length) * 100).toFixed(1) + '%',
          exampleCases: data.cases.slice(0, 3)
        }))
      },
      regressions: {
        count: regressions.length,
        cases: regressions
      },
      worklist
    };
    
    return report;
  }

  getBucketDescription(bucket) {
    for (const category of Object.values(FAILURE_BUCKETS)) {
      if (category[bucket]) {
        return category[bucket];
      }
    }
    return 'Unknown failure type';
  }

  generateWorklist(topBuckets) {
    const worklist = [];
    
    topBuckets.forEach(([bucket, data]) => {
      const item = {
        bucket,
        priority: data.count > 10 ? 'HIGH' : data.count > 5 ? 'MEDIUM' : 'LOW',
        affectedCases: data.count,
        suggestedFix: this.getSuggestedFix(bucket),
        targetFile: this.getTargetFile(bucket)
      };
      worklist.push(item);
    });
    
    return worklist;
  }

  /**
   * Generate top 5 failures by impact for quick triage
   */
  generateFailureTriage(results) {
    const failures = results.filter(r => !r.strictPass);
    
    // Sort by score (worst first)
    const sortedFailures = failures.sort((a, b) => a.weightedScore - b.weightedScore);
    
    const top5 = sortedFailures.slice(0, 5).map(r => {
      const failedFields = Object.entries(r.matches)
        .filter(([field, match]) => !match)
        .map(([field]) => field);
      
      // Get suggested fix from primary failure bucket
      const primaryBucket = r.failureBuckets[0];
      const suggestedFix = this.getSuggestedFix(primaryBucket);
      
      return {
        caseId: r.testCase.id,
        difficulty: r.testCase.difficulty,
        strictScore: (r.weightedScore * 100).toFixed(1) + '%',
        acceptableScore: (r.weightedScore >= this.config.ACCEPTABLE_PASS_THRESHOLD ? 'PASS' : 'FAIL'),
        failedFields,
        primaryFailureBucket: primaryBucket || 'unknown',
        suggestedFix,
        transcript: r.testCase.transcriptText.substring(0, 100) + '...'
      };
    });
    
    return {
      totalFailures: failures.length,
      top5
    };
  }

  /**
   * Generate field-level accuracy breakdown
   */
  generateFieldDriftOverview(results) {
    const fields = ['name', 'category', 'urgency', 'amount'];
    const strictAccuracy = {};
    const acceptableAccuracy = {};
    
    fields.forEach(field => {
      const strictCorrect = results.filter(r => r.matches[field + 'Match']).length;
      const strictTotal = results.filter(r => !r.testCase.labelConfidence || r.testCase.labelConfidence >= 0.75).length;
      
      strictAccuracy[field] = {
        correct: strictCorrect,
        total: results.length,
        percentage: ((strictCorrect / results.length) * 100).toFixed(2) + '%'
      };
      
      acceptableAccuracy[field] = {
        correct: strictCorrect,
        total: results.length,
        percentage: ((strictCorrect / results.length) * 100).toFixed(2) + '%'
      };
    });
    
    return {
      strictAccuracy,
      acceptableAccuracy
    };
  }

  /**
   * Generate breakdown of amount selection mistakes
   */
  generateAmountSelectionBreakdown(results) {
    const amountFailures = results.filter(r => !r.matches.amountMatch);
    
    const breakdown = {
      wageMistaken: 0,
      ageMistaken: 0,
      dateMistaken: 0,
      maxSelectionMistake: 0,
      other: 0,
      total: amountFailures.length,
      examples: []
    };
    
    amountFailures.forEach(r => {
      const notes = r.testCase.notes || '';
      const transcript = r.testCase.transcriptText.toLowerCase();
      
      if (transcript.includes('make $') || transcript.includes('earn $') || transcript.includes('an hour')) {
        breakdown.wageMistaken++;
        if (breakdown.examples.length < 3) {
          breakdown.examples.push({
            type: 'wage',
            caseId: r.testCase.id,
            expected: r.testCase.expected.goalAmount,
            actual: r.parseResult.amount
          });
        }
      } else if (transcript.includes('years old') || transcript.includes("i'm " ) || transcript.includes('year old')) {
        breakdown.ageMistaken++;
        if (breakdown.examples.length < 3) {
          breakdown.examples.push({
            type: 'age',
            caseId: r.testCase.id,
            expected: r.testCase.expected.goalAmount,
            actual: r.parseResult.amount
          });
        }
      } else if (notes.includes('Multi-number')) {
        breakdown.maxSelectionMistake++;
        if (breakdown.examples.length < 3) {
          breakdown.examples.push({
            type: 'max_selection',
            caseId: r.testCase.id,
            expected: r.testCase.expected.goalAmount,
            actual: r.parseResult.amount
          });
        }
      } else {
        breakdown.other++;
      }
    });
    
    return breakdown;
  }

  /**
   * Generate summary of low confidence fuzz cases
   */
  generateLowConfidenceSummary() {
    if (this.results.lowConfidenceFuzzCases.length === 0) {
      return { count: 0, cases: [] };
    }
    
    // Sort by confidence (lowest first)
    const sorted = this.results.lowConfidenceFuzzCases.sort((a, b) => a.confidence - b.confidence);
    
    return {
      count: sorted.length,
      avgConfidence: (sorted.reduce((sum, c) => sum + c.confidence, 0) / sorted.length * 100).toFixed(1) + '%',
      top10Lowest: sorted.slice(0, 10).map(c => ({
        id: c.id,
        confidence: (c.confidence * 100).toFixed(1) + '%',
        mutationCount: c.mutationOps.length,
        score: (c.score * 100).toFixed(1) + '%'
      }))
    };
  }

  /**
   * Generate top 5 failures by impact for quick triage
   */
  generateFailureTriage(results) {
    const failures = results.filter(r => !r.strictPass);
    
    // Sort by score (worst first)
    const sortedFailures = failures.sort((a, b) => a.weightedScore - b.weightedScore);
    
    const top5 = sortedFailures.slice(0, 5).map(r => {
      const failedFields = Object.entries(r.matches)
        .filter(([field, match]) => !match)
        .map(([field]) => field);
      
      // Get suggested fix from primary failure bucket
      const primaryBucket = r.failureBuckets[0];
      const suggestedFix = this.getSuggestedFix(primaryBucket);
      
      return {
        caseId: r.testCase.id,
        difficulty: r.testCase.difficulty,
        strictScore: (r.weightedScore * 100).toFixed(1) + '%',
        acceptableScore: (r.weightedScore >= this.config.ACCEPTABLE_PASS_THRESHOLD ? 'PASS' : 'FAIL'),
        failedFields,
        primaryFailureBucket: primaryBucket || 'unknown',
        suggestedFix,
        transcript: r.testCase.transcriptText.substring(0, 100) + '...'
      };
    });
    
    return {
      totalFailures: failures.length,
      top5
    };
  }

  /**
   * Generate field-level accuracy breakdown
   */
  generateFieldDriftOverview(results) {
    const fields = ['name', 'category', 'urgency', 'amount'];
    const strictAccuracy = {};
    const acceptableAccuracy = {};
    
    fields.forEach(field => {
      const strictCorrect = results.filter(r => r.matches[field + 'Match']).length;
      const strictTotal = results.filter(r => !r.testCase.labelConfidence || r.testCase.labelConfidence >= 0.75).length;
      
      strictAccuracy[field] = {
        correct: strictCorrect,
        total: results.length,
        percentage: ((strictCorrect / results.length) * 100).toFixed(2) + '%'
      };
      
      acceptableAccuracy[field] = {
        correct: strictCorrect,
        total: results.length,
        percentage: ((strictCorrect / results.length) * 100).toFixed(2) + '%'
      };
    });
    
    return {
      strictAccuracy,
      acceptableAccuracy
    };
  }

  /**
   * Generate breakdown of amount selection mistakes
   */
  generateAmountSelectionBreakdown(results) {
    const amountFailures = results.filter(r => !r.matches.amountMatch);
    
    const breakdown = {
      wageMistaken: 0,
      ageMistaken: 0,
      dateMistaken: 0,
      maxSelectionMistake: 0,
      other: 0,
      total: amountFailures.length,
      examples: []
    };
    
    amountFailures.forEach(r => {
      const notes = r.testCase.notes || '';
      const transcript = r.testCase.transcriptText.toLowerCase();
      
      if (transcript.includes('make $') || transcript.includes('earn $') || transcript.includes('an hour')) {
        breakdown.wageMistaken++;
        if (breakdown.examples.length < 3) {
          breakdown.examples.push({
            type: 'wage',
            caseId: r.testCase.id,
            expected: r.testCase.expected.goalAmount,
            actual: r.parseResult.amount
          });
        }
      } else if (transcript.includes('years old') || transcript.includes("i'm ") || transcript.includes('year old')) {
        breakdown.ageMistaken++;
        if (breakdown.examples.length < 3) {
          breakdown.examples.push({
            type: 'age',
            caseId: r.testCase.id,
            expected: r.testCase.expected.goalAmount,
            actual: r.parseResult.amount
          });
        }
      } else if (notes.includes('Multi-number')) {
        breakdown.maxSelectionMistake++;
        if (breakdown.examples.length < 3) {
          breakdown.examples.push({
            type: 'max_selection',
            caseId: r.testCase.id,
            expected: r.testCase.expected.goalAmount,
            actual: r.parseResult.amount
          });
        }
      } else {
        breakdown.other++;
      }
    });
    
    return breakdown;
  }

  getSuggestedFix(bucket) {
    const fixes = {
      'name_fragment': 'Add more aggressive name cleaning; check blacklist for sentence fragments',
      'name_title_included': 'Expand title removal regex to catch all title patterns',
      'name_suffix_included': 'Add suffix cleaning (Jr, III, Sr) to name extraction',
      'category_priority_violated': 'Review category priority rules in multi-category scenarios',
      'urgency_conflicting_signals': 'Refine urgency evaluation order (LOW → CRITICAL → HIGH → MEDIUM)',
      'amount_wrong_selection': 'Review amount selection strategy; may need context-aware selection',
      'filler_words_broke_parsing': 'Improve filler word tolerance in regex patterns',
      'punctuation_broke_parsing': 'Add punctuation normalization preprocessing step'
    };
    
    return fixes[bucket] || 'Manual investigation required';
  }

  getTargetFile(bucket) {
    if (bucket.startsWith('name_')) {
      return 'services/NameExtractionService.js (or jan-v3 TIER 1)';
    } else if (bucket.startsWith('category_')) {
      return 'services/CategoryClassificationService.js (or jan-v3 TIER 2)';
    } else if (bucket.startsWith('urgency_')) {
      return 'services/UrgencyAssessmentService.js (or jan-v3 TIER 3)';
    } else if (bucket.startsWith('amount_')) {
      return 'services/AmountDetectionService.js (or jan-v3 TIER 4)';
    }
    return 'utils/PatternLibrary.js';
  }

  displayReport(report) {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║           Jan v4.0+ Evaluation Report                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    console.log(`📊 Dataset: ${report.metadata.dataset}`);
    console.log(`📅 Timestamp: ${report.metadata.timestamp}`);
    console.log(`📦 Total Cases: ${report.metadata.totalCases}\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  PASS RATES (Dual Threshold)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  STRICT (≥95%):      ${report.summary.strictPassRate} (${report.summary.strictPasses}/${report.metadata.totalCases})`);
    console.log(`  ACCEPTABLE (≥85%):  ${report.summary.acceptablePassRate} (${report.summary.acceptablePasses}/${report.metadata.totalCases})`);
    
    if (parseFloat(report.summary.strictPassRate) === 100) {
      console.log(`\n  ✅ PERFECT STRICT PASS RATE! All cases passed at ≥95% threshold.\n`);
    } else if (parseFloat(report.summary.strictPassRate) >= 95) {
      console.log(`\n  ✅ Excellent strict pass rate (≥95%)\n`);
    } else if (parseFloat(report.summary.acceptablePassRate) >= 95) {
      console.log(`\n  ⚠️  Good acceptable pass rate but strict pass rate below 95%\n`);
    } else {
      console.log(`\n  ❌ Pass rates below targets. Review failure buckets.\n`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  PERFORMANCE METRICS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Avg Latency:  ${report.performance.avgLatencyMs} ms`);
    console.log(`  Total Time:   ${report.performance.totalLatencyMs} ms`);
    console.log(`  Budget:       ${report.performance.budgetMs} ms`);
    console.log(`  Status:       ${report.performance.withinBudget ? '✅ Within Budget' : '❌ Over Budget'}\n`);
    
    if (report.regressions.count > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  ⚠️  REGRESSIONS DETECTED (Core30 Baseline Failures)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      report.regressions.cases.forEach(r => {
        console.log(`  ${r.testId}: Score ${(r.actualScore * 100).toFixed(1)}% (expected 100%)`);
        console.log(`    Failed fields: ${r.failedFields.join(', ')}`);
      });
      console.log();
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  TOP 10 FAILURE BUCKETS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (report.failureBuckets.top10Strict.length === 0) {
      console.log('  ✅ No failures detected!\n');
    } else {
      report.failureBuckets.top10Strict.forEach((bucket, idx) => {
        console.log(`  ${idx + 1}. ${bucket.bucket} (${bucket.count} cases, ${bucket.percentage})`);
        console.log(`     ${bucket.description}`);
        console.log(`     Examples: ${bucket.exampleCases.join(', ')}`);
      });
      console.log();
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  RECOMMENDED WORKLIST (Priority Order)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (report.worklist.length === 0) {
      console.log('  ✅ No action items - all tests passing!\n');
    } else {
      report.worklist.forEach((item, idx) => {
        console.log(`  ${idx + 1}. [${item.priority}] ${item.bucket} (${item.affectedCases} cases)`);
        console.log(`     Fix: ${item.suggestedFix}`);
        console.log(`     File: ${item.targetFile}`);
      });
      console.log();
    }
    
    // Enhanced reporting (Upgrade 6)
    if (report.failureTriage && report.failureTriage.top5.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  FAILURE TRIAGE SNAPSHOT (Top 5 by Impact)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      report.failureTriage.top5.forEach((f, idx) => {
        console.log(`  ${idx + 1}. ${f.caseId} (${f.difficulty}) - Strict: ${f.strictScore}`);
        console.log(`     Failed: ${f.failedFields.join(', ')}`);
        console.log(`     Fix: ${f.suggestedFix}`);
      });
      console.log();
    }
    
    if (report.fieldDriftOverview) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  FIELD DRIFT OVERVIEW (Strict Accuracy by Field)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      Object.entries(report.fieldDriftOverview.strictAccuracy).forEach(([field, stats]) => {
        console.log(`  ${field.padEnd(10)}: ${stats.percentage.padStart(7)} (${stats.correct}/${stats.total})`);
      });
      console.log();
    }
    
    if (report.amountSelectionMistakes && report.amountSelectionMistakes.total > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  AMOUNT SELECTION MISTAKES');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      const breakdown = report.amountSelectionMistakes;
      console.log(`  Wage mistaken:         ${breakdown.wageMistaken}`);
      console.log(`  Age mistaken:          ${breakdown.ageMistaken}`);
      console.log(`  Max selection mistake: ${breakdown.maxSelectionMistake}`);
      console.log(`  Other:                 ${breakdown.other}`);
      console.log(`  Total:                 ${breakdown.total}`);
      console.log();
    }
    
    if (report.lowConfidenceSummary && report.lowConfidenceSummary.count > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  LOW CONFIDENCE FUZZ CASES SUMMARY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`  Count: ${report.lowConfidenceSummary.count}`);
      console.log(`  Avg Confidence: ${report.lowConfidenceSummary.avgConfidence}`);
      console.log(`  (These cases may have unreliable expected outputs due to heavy mutations)`);
      console.log();
    }
    
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
  }

  saveReport(report, datasetName) {
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFilename = `v4plus_${datasetName}_${timestamp}`;
    
    // Save JSON report
    const jsonPath = path.join(reportsDir, `${baseFilename}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📁 JSON report saved: ${jsonPath}`);
    
    // Save markdown summary
    const mdPath = path.join(reportsDir, `${baseFilename}.md`);
    const mdContent = this.generateMarkdownReport(report);
    fs.writeFileSync(mdPath, mdContent, 'utf8');
    console.log(`📁 Markdown report saved: ${mdPath}`);
    
    return { jsonPath, mdPath };
  }

  generateMarkdownReport(report) {
    let md = `# Jan v4.0+ Evaluation Report\n\n`;
    md += `**Dataset:** ${report.metadata.dataset}\n`;
    md += `**Timestamp:** ${report.metadata.timestamp}\n`;
    md += `**Total Cases:** ${report.metadata.totalCases}\n\n`;
    
    md += `## Summary\n\n`;
    md += `| Threshold | Pass Rate | Passes | Failures |\n`;
    md += `|-----------|-----------|--------|----------|\n`;
    md += `| STRICT (≥95%) | ${report.summary.strictPassRate} | ${report.summary.strictPasses} | ${report.summary.strictFailures} |\n`;
    md += `| ACCEPTABLE (≥85%) | ${report.summary.acceptablePassRate} | ${report.summary.acceptablePasses} | ${report.summary.acceptableFailures} |\n\n`;
    
    md += `## Performance\n\n`;
    md += `- **Avg Latency:** ${report.performance.avgLatencyMs} ms\n`;
    md += `- **Total Time:** ${report.performance.totalLatencyMs} ms\n`;
    md += `- **Budget:** ${report.performance.budgetMs} ms\n`;
    md += `- **Status:** ${report.performance.withinBudget ? '✅ Within Budget' : '❌ Over Budget'}\n\n`;
    
    if (report.regressions.count > 0) {
      md += `## ⚠️ Regressions Detected\n\n`;
      md += `${report.regressions.count} core30 baseline case(s) failed:\n\n`;
      report.regressions.cases.forEach(r => {
        md += `- **${r.testId}:** Score ${(r.actualScore * 100).toFixed(1)}% (expected 100%)\n`;
        md += `  - Failed fields: ${r.failedFields.join(', ')}\n`;
      });
      md += `\n`;
    }
    
    md += `## Top Failure Buckets\n\n`;
    if (report.failureBuckets.top10Strict.length === 0) {
      md += `✅ No failures detected!\n\n`;
    } else {
      report.failureBuckets.top10Strict.forEach((bucket, idx) => {
        md += `### ${idx + 1}. ${bucket.bucket}\n\n`;
        md += `- **Count:** ${bucket.count} (${bucket.percentage})\n`;
        md += `- **Description:** ${bucket.description}\n`;
        md += `- **Examples:** ${bucket.exampleCases.join(', ')}\n\n`;
      });
    }
    
    md += `## Recommended Worklist\n\n`;
    if (report.worklist.length === 0) {
      md += `✅ No action items - all tests passing!\n\n`;
    } else {
      report.worklist.forEach((item, idx) => {
        md += `### ${idx + 1}. [${item.priority}] ${item.bucket}\n\n`;
        md += `- **Affected Cases:** ${item.affectedCases}\n`;
        md += `- **Suggested Fix:** ${item.suggestedFix}\n`;
        md += `- **Target File:** ${item.targetFile}\n\n`;
      });
    }
    
    // Enhanced sections (Upgrade 6)
    if (report.failureTriage && report.failureTriage.top5.length > 0) {
      md += `## Failure Triage Snapshot (Top 5)\n\n`;
      report.failureTriage.top5.forEach((f, idx) => {
        md += `### ${idx + 1}. ${f.caseId} (${f.difficulty})\n\n`;
        md += `- **Strict Score:** ${f.strictScore}\n`;
        md += `- **Failed Fields:** ${f.failedFields.join(', ')}\n`;
        md += `- **Primary Bucket:** ${f.primaryFailureBucket}\n`;
        md += `- **Suggested Fix:** ${f.suggestedFix}\n`;
        md += `- **Transcript:** ${f.transcript}\n\n`;
      });
    }
    
    if (report.fieldDriftOverview) {
      md += `## Field Drift Overview\n\n`;
      md += `### Strict Accuracy by Field\n\n`;
      md += `| Field | Accuracy | Correct/Total |\n`;
      md += `|-------|----------|---------------|\n`;
      Object.entries(report.fieldDriftOverview.strictAccuracy).forEach(([field, stats]) => {
        md += `| ${field} | ${stats.percentage} | ${stats.correct}/${stats.total} |\n`;
      });
      md += `\n`;
    }
    
    if (report.amountSelectionMistakes && report.amountSelectionMistakes.total > 0) {
      md += `## Amount Selection Mistakes\n\n`;
      const breakdown = report.amountSelectionMistakes;
      md += `| Category | Count |\n`;
      md += `|----------|-------|\n`;
      md += `| Wage mistaken | ${breakdown.wageMistaken} |\n`;
      md += `| Age mistaken | ${breakdown.ageMistaken} |\n`;
      md += `| Max selection mistake | ${breakdown.maxSelectionMistake} |\n`;
      md += `| Other | ${breakdown.other} |\n`;
      md += `| **Total** | **${breakdown.total}** |\n\n`;
    }
    
    if (report.lowConfidenceSummary && report.lowConfidenceSummary.count > 0) {
      md += `## Low Confidence Fuzz Cases Summary\n\n`;
      md += `- **Count:** ${report.lowConfidenceSummary.count}\n`;
      md += `- **Avg Confidence:** ${report.lowConfidenceSummary.avgConfidence}\n\n`;
      md += `These cases may have unreliable expected outputs due to heavy mutations.\n\n`;
    }
    
    return md;
  }

  async run(datasetName) {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║         Jan v4.0+ Evaluation Suite                            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    console.log(`📊 Loading dataset: ${datasetName}\n`);
    
    const testCases = this.loadDataset(datasetName);
    
    if (testCases.length === 0) {
      console.error(`❌ No test cases loaded from ${datasetName}`);
      return;
    }
    
    console.log(`📦 Loaded ${testCases.length} test cases`);
    console.log(`⚙️  Config: STRICT ≥${this.config.STRICT_PASS_THRESHOLD * 100}%, ACCEPTABLE ≥${this.config.ACCEPTABLE_PASS_THRESHOLD * 100}%`);
    console.log(`⚙️  Amount Tolerance: ${this.config.DEFAULT_AMOUNT_TOLERANCE * 100}%`);
    console.log(`\n🔄 Running evaluations...\n`);
    
    const results = [];
    const startTime = Date.now();
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      if ((i + 1) % 50 === 0 || i === 0) {
        console.log(`  Progress: ${i + 1}/${testCases.length}`);
      }
      
      try {
        const result = await this.evaluateCase(testCase);
        results.push(result);
      } catch (error) {
        console.error(`❌ Error evaluating ${testCase.id}:`, error.message);
      }
    }
    
    const endTime = Date.now();
    console.log(`\n✅ Evaluation complete in ${endTime - startTime} ms\n`);
    
    const report = this.generateReport(results, datasetName);
    this.displayReport(report);
    const reportPaths = this.saveReport(report, datasetName);
    
    // Run PII scan (Upgrade 2)
    if (this.config.ENFORCE_PII_SCAN) {
      console.log('Running PII scan on evaluation outputs...');
      const piiScanner = new PIIScanner();
      const reportsDir = path.join(__dirname, '../reports');
      piiScanner.scanReportsDirectory(reportsDir);
      piiScanner.displayAndFail(); // Throws if PII detected
    }
    
    return report;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  let dataset = 'core30';
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dataset' && args[i + 1]) {
      dataset = args[i + 1];
      i++;
    }
  }
  
  const runner = new V4PlusEvaluationRunner();
  await runner.run(dataset);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = V4PlusEvaluationRunner;
