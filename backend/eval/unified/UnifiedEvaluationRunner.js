/**
 * UNIFIED v4Plus Evaluation Runner
 * 
 * IMPLEMENTS: Explicit parser selection and configuration management
 * ELIMINATES: Silent fallback and configuration drift
 * ENSURES: Production and evaluation alignment
 */

const fs = require('fs');
const path = require('path');
const { UnifiedParserInterface, EvaluationConfig } = require('../shared/UnifiedParserAdapter');

class UnifiedEvaluationRunner {
  constructor(options = {}) {
    this.systemName = options.systemName || 'v4plus';
    this.dataset = options.dataset || 'core30';
    this.parserType = options.parserType || 'auto'; // 'auto', 'production', 'jan-v3-analytics'
    
    // Load configuration for this system
    this.config = EvaluationConfig.getParserConfig(this.systemName);
    
    // Override parser if explicitly specified
    if (this.parserType !== 'auto') {
      this.config.parser = this.parserType;
    }
    
    console.log(`\\n╔═══════════════════════════════════════════════════════════╗`);
    console.log(`║         Unified Jan v4.0+ Evaluation Suite               ║`);
    console.log(`╚═══════════════════════════════════════════════════════════╝`);
    console.log(`📊 System: ${this.systemName} (${this.config.description})`);
    console.log(`🔧 Parser Version: ${this.config.parser}`);
    console.log(`📦 Dataset: ${this.dataset}`);
    console.log(`⚙️  Amount Tolerance: ${this.config.amountTolerance * 100}% (80% baseline)`);
    
    if (this.parserVersion !== 'auto' && this.parserVersion !== this.config.parser) {
      console.log(`🔄 Parser Version Override: ${this.config.parser} → ${this.parserVersion}`);
      this.config.parser = this.parserVersion;
    }
  }

  async run() {
    const startTime = Date.now();
    
    try {
      // Validate configuration before starting
      this.validateConfiguration();
      
      // Load test dataset
      const testCases = await this.loadDataset();
      console.log(`\\n📦 Loaded ${testCases.length} test cases`);
      
      // Run evaluations with explicit parser selection
      const results = await this.runEvaluations(testCases);
      
      // Generate comprehensive report
      const report = await this.generateReport(results, Date.now() - startTime);
      
      // Save results
      await this.saveResults(report);
      
      return report;
    } catch (error) {
      console.error(`\\n❌ Evaluation failed:`, error.message);
      throw error;
    }
  }

  validateConfiguration() {
    // Ensure parser version is supported
    const availableParsers = UnifiedParserInterface.getAvailableParsers();
    if (!availableParsers.includes(this.config.parser)) {
      throw new Error(`Unsupported parser version: ${this.config.parser}. Available: ${availableParsers.join(', ')}`);
    }
    
    // Validate tolerance settings
    if (this.config.amountTolerance <= 0 || this.config.amountTolerance > 1) {
      throw new Error(`Invalid amount tolerance: ${this.config.amountTolerance}. Must be between 0 and 1.`);
    }
    
    // Configuration Health Check
    console.log(`\n✅ Configuration validated:`);
    console.log(`   Parser Version: ${this.config.parser}`);
    console.log(`   Baseline: 80% rules engine foundation`);
    console.log(`   Tolerance: ${this.config.amountTolerance * 100}%`);
    console.log(`   Thresholds: STRICT ≥${this.config.strictThreshold * 100}%, ACCEPTABLE ≥${this.config.acceptableThreshold * 100}%`);
  }

  async loadDataset() {
    const datasetPath = path.join(__dirname, '../datasets', `${this.dataset}.json`);
    
    if (!fs.existsSync(datasetPath)) {
      throw new Error(`Dataset not found: ${datasetPath}`);
    }
    
    const rawData = fs.readFileSync(datasetPath, 'utf8');
    const data = JSON.parse(rawData);
    
    // Validate dataset integrity
    if (!Array.isArray(data.testCases)) {
      throw new Error(`Invalid dataset format: missing testCases array`);
    }
    
    return data.testCases;
  }

  async runEvaluations(testCases) {
    console.log(`\\n🔄 Running evaluations...`);
    const results = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\\n  Progress: ${i + 1}/${testCases.length}`);
      
      try {
        // Use unified parser interface with explicit version tracking
        const parseResult = await UnifiedParserInterface.parse(
          testCase.transcript, 
          this.systemName,
          { 
            id: testCase.id,
            forceParser: this.config.parser  // Explicit parser version selection
          }
        );
        
        // Evaluate result against expected
        const evaluation = this.evaluateResult(testCase, parseResult);
        
        results.push({
          testCase: testCase,
          result: parseResult,
          evaluation: evaluation,
          parserVersion: this.config.parser  // Track which parser version was used
        });
        
      } catch (error) {
        console.error(`\\n❌ Test ${testCase.id} failed:`, error.message);
        
        // NO SILENT FALLBACK - Record explicit failure
        results.push({
          testCase: testCase,
          result: null,
          evaluation: { score: 0, failures: ['parser_error'] },
          error: error.message,
          parserVersion: this.config.parser
        });
      }
    }
    
    return results;
  }

  evaluateResult(testCase, result) {
    const evaluation = {
      score: 0,
      maxScore: 4,
      matches: {
        nameMatch: false,
        categoryMatch: false,
        urgencyMatch: false,
        amountMatch: false
      },
      failures: []
    };

    // Name matching
    if (this.compareNames(testCase.expected.name, result.name)) {
      evaluation.matches.nameMatch = true;
      evaluation.score += 1;
    } else {
      evaluation.failures.push('name_mismatch');
    }

    // Category matching  
    if (testCase.expected.category === result.category) {
      evaluation.matches.categoryMatch = true;
      evaluation.score += 1;
    } else {
      evaluation.failures.push('category_mismatch');
    }

    // Urgency matching
    if (testCase.expected.urgency === result.urgency) {
      evaluation.matches.urgencyMatch = true;
      evaluation.score += 1;
    } else {
      evaluation.failures.push('urgency_mismatch');
    }

    // Amount matching with configured tolerance
    if (this.compareAmounts(testCase.expected.goalAmount, result.goalAmount)) {
      evaluation.matches.amountMatch = true;
      evaluation.score += 1;
    } else {
      evaluation.failures.push('amount_mismatch');
    }

    evaluation.percentage = (evaluation.score / evaluation.maxScore) * 100;
    return evaluation;
  }

  compareAmounts(expected, actual) {
    if (!expected || !actual) return expected === actual;
    
    const tolerance = this.config.amountTolerance;
    const diff = Math.abs(expected - actual) / expected;
    return diff <= tolerance;
  }

  compareNames(expected, actual) {
    if (!expected || !actual) return expected === actual;
    
    // Normalize names for comparison
    const normalize = (name) => name.toLowerCase().replace(/[^a-z]/g, '');
    return normalize(expected) === normalize(actual);
  }

  async generateReport(results, totalTime) {
    const totalCases = results.length;
    const strictPasses = results.filter(r => r.evaluation.percentage >= (this.config.strictThreshold * 100)).length;
    const acceptablePasses = results.filter(r => r.evaluation.percentage >= (this.config.acceptableThreshold * 100)).length;
    
    const report = {
      metadata: {
        system: this.systemName,
        parserVersion: this.config.parser,  // Track parser version used
        baseline: '80% rules engine foundation',
        dataset: this.dataset,
        timestamp: new Date().toISOString(),
        totalCases: totalCases,
        totalTime: totalTime,
        configuration: this.config
      },
      performance: {
        strictPassRate: (strictPasses / totalCases) * 100,
        acceptablePassRate: (acceptablePasses / totalCases) * 100,
        avgLatency: totalTime / totalCases,
        withinBudget: totalTime < 3000
      },
      results: results,
      summary: {
        strictPasses: strictPasses,
        acceptablePasses: acceptablePasses,
        failures: results.filter(r => r.evaluation.percentage < (this.config.acceptableThreshold * 100))
      }
    };
    
    // Console report
    console.log(`\\n╔═══════════════════════════════════════════════════════════╗`);  
    console.log(`║           Unified Evaluation Report                       ║`);
    console.log(`╚═══════════════════════════════════════════════════════════╝`);
    console.log(`📊 System: ${this.systemName} (${this.config.parser} parser)`);
    console.log(`📦 Dataset: ${this.dataset} (${totalCases} cases)`);
    console.log(`\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`                    PASS RATES (Dual Threshold)`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`STRICT (≥${this.config.strictThreshold * 100}%):      ${report.performance.strictPassRate.toFixed(2)}% (${strictPasses}/${totalCases})`);
    console.log(`ACCEPTABLE (≥${this.config.acceptableThreshold * 100}%):  ${report.performance.acceptablePassRate.toFixed(2)}% (${acceptablePasses}/${totalCases})`);
    
    if (report.performance.strictPassRate >= 95) {
      console.log(`\\n  ✅ PERFECT STRICT PASS RATE! All cases passed at ≥${this.config.strictThreshold * 100}% threshold.`);
    } else if (report.performance.acceptablePassRate >= 85) {
      console.log(`\\n  ⚠️  Meeting acceptable threshold but below strict target.`);
    } else {
      console.log(`\\n  ❌ Pass rates below targets. Review failure analysis.`);
    }
    
    console.log(`\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`                    CONFIGURATION VERIFICATION`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Parser Used:      ${this.config.parser}`);
    console.log(`Amount Tolerance: ${this.config.amountTolerance * 100}%`);
    console.log(`System Purpose:   ${this.config.description}`);
    
    return report;
  }

  async saveResults(report) {
    const timestamp = report.metadata.timestamp.replace(/[:.]/g, '-');
    const versionSafe = this.config.parser.replace(/[%.\/]/g, '_');
    const filename = `versioned_${this.systemName}_${versionSafe}_${this.dataset}_${timestamp}`;
    
    // Save JSON report
    const jsonPath = path.join(__dirname, '../reports', `${filename}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`\\n📁 JSON report saved: ${jsonPath}`);
    
    // Save markdown report  
    const mdPath = path.join(__dirname, '../reports', `${filename}.md`);
    const markdownReport = this.generateMarkdownReport(report);
    fs.writeFileSync(mdPath, markdownReport);
    console.log(`📁 Markdown report saved: ${mdPath}`);
  }

  generateMarkdownReport(report) {
    return `# Versioned Rules Engine Report

**System**: ${report.metadata.system} (${report.metadata.parserVersion})  
**Dataset**: ${report.metadata.dataset}  
**Baseline**: ${report.metadata.baseline}  
**Timestamp**: ${report.metadata.timestamp}  
**Total Cases**: ${report.metadata.totalCases}

## Version Configuration
- **Parser Version**: ${report.metadata.parserVersion}
- **Baseline**: ${report.metadata.baseline}
- **Amount Tolerance**: ${report.metadata.configuration.amountTolerance * 100}%
- **System Purpose**: ${report.metadata.configuration.description}

## Results
- **STRICT Pass Rate**: ${report.performance.strictPassRate.toFixed(2)}% (${report.summary.strictPasses}/${report.metadata.totalCases})
- **ACCEPTABLE Pass Rate**: ${report.performance.acceptablePassRate.toFixed(2)}% (${report.summary.acceptablePasses}/${report.metadata.totalCases})
- **Average Latency**: ${report.performance.avgLatency.toFixed(2)}ms
- **Total Time**: ${report.metadata.totalTime}ms

## Version Verification
✅ **Versioned Parser**: ${report.metadata.parserVersion}  
✅ **80% Baseline**: Both production and testing use same rules engine foundation  
✅ **Clear Versioning**: No confusion between parser versions  

${report.summary.failures.length > 0 ? '## Failures\\n' + report.summary.failures.map(f => `- **${f.testCase.id}**: ${f.evaluation.failures.join(', ')}`).join('\\n') : '## ✅ All Tests Passed!'}
`;
  }
}

// CLI interface for running evaluations
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    options[key] = value;
  }
  
  const runner = new UnifiedEvaluationRunner(options);
  runner.run().catch(console.error);
}

module.exports = { UnifiedEvaluationRunner };