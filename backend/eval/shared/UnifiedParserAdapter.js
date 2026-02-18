/**
 * FIXED Parser Adapter for Evaluation Systems
 * 
 * ELIMINATES: Dual parser anti-pattern and silent fallback
 * IMPLEMENTS: Explicit parser selection with clear configuration
 * PREVENTS: Configuration drift between production and evaluation
 */

const path = require('path');

/**
 * Evaluation Configuration Management
 * Single source of truth for versioned parser configuration
 */
class EvaluationConfig {
  static getParserConfig(systemName) {
    const configs = {
      'production': {
        parser: 'Pro_rules_engine_80%_v.1.0_',
        amountTolerance: 0.10,  // 80% baseline configuration
        strictThreshold: 0.95,
        acceptableThreshold: 0.85,
        description: 'Production Rules Engine v1.0 - Stable 80% baseline'
      },
      'testing': {
        parser: 'Test_Rules_engine_v.1.0_',
        amountTolerance: 0.10,  // Same baseline as production
        strictThreshold: 0.95,
        acceptableThreshold: 0.85,
        description: 'Testing Rules Engine v1.0 - Based on 80% baseline with enhancements'
      }
    };
    
    if (!configs[systemName]) {
      throw new Error(`Unknown evaluation system: ${systemName}. Available: ${Object.keys(configs).join(', ')}`);
    }
    
    return configs[systemName];
  }
  
  static validateConfig(config) {
    const required = ['parser', 'amountTolerance'];
    for (const field of required) {
      if (!(field in config)) {
        throw new Error(`Configuration missing required field: ${field}`);
      }
    }
    return true;
  }
}

/**
 * FIXED Parser Adapter - Eliminates dual parser anti-pattern
 */
class ParserAdapter {
  constructor(systemName = 'v4plus') {
    this.systemName = systemName;
    this.config = EvaluationConfig.getParserConfig(systemName);
    EvaluationConfig.validateConfig(this.config);
    
    console.log(`[ParserAdapter] Initialized for ${systemName}: ${this.config.description}`);
    console.log(`[ParserAdapter] Parser: ${this.config.parser}, Tolerance: ${this.config.amountTolerance * 100}%`);
  }

  /**
   * FIXED: Extract all - VERSIONED PARSER SELECTION
   * Uses versioned rules engine with explicit version tracking
   */
  async extractAll(transcriptText, opts = {}) {
    // Allow override for testing specific parser versions
    const parserVersion = opts.forceParser || this.config.parser;
    
    console.log(`[ParserAdapter] Using ${parserVersion} (system: ${this.systemName})`);
    
    if (parserVersion.startsWith('Pro_rules_engine_')) {
      return await this.useVersionedRulesEngine(transcriptText, opts, 'production');
    } else if (parserVersion.startsWith('Test_Rules_engine_')) {
      return await this.useVersionedRulesEngine(transcriptText, opts, 'testing');
    } else {
      throw new Error(`Unknown parser version: ${parserVersion}. Use Pro_rules_engine_* or Test_Rules_engine_*`);
    }
  }

  /**
   * Versioned Rules Engine - Uses 80% baseline with version tracking
   * Both production and testing use same underlying rules engine
   */
  async useVersionedRulesEngine(transcriptText, opts = {}, environment) {
    try {
      const { getAIProvider } = require('../../../src/providers/ai/index');
      const aiProvider = getAIProvider();
      
      const parserVersion = this.config.parser;
      console.log(`[ParserAdapter] ${environment} rules engine loaded: ${parserVersion}`);
      
      // Extract using versioned rules engine (80% baseline)
      const result = await aiProvider.extractProfileData(transcriptText);
      
      // Apply version-specific enhancements if testing environment
      const processedResult = environment === 'testing' 
        ? await this.applyTestingEnhancements(result, transcriptText)
        : result;
      
      // Map result format to evaluation expected format
      const mappedResult = this.mapVersionedResult(processedResult, transcriptText, parserVersion);
      console.log(`[ParserAdapter] ${environment} parsing successful (${parserVersion})`);
      
      return mappedResult;
    } catch (error) {
      console.error(`[ParserAdapter] ${environment} rules engine failed (${this.config.parser}):`, error.message);
      throw new Error(`${environment} rules engine ${this.config.parser} failed: ${error.message}`);
    }
  }

  /**
   * Apply testing-specific enhancements to base 80% rules engine
   */
  async applyTestingEnhancements(baseResult, transcript) {
    // Testing environment can have experimental features
    // while maintaining the same 80% baseline foundation
    console.log(`[ParserAdapter] Applying testing enhancements to base result`);
    
    // Future: Add experimental features here
    // - Enhanced urgency detection
    // - Improved category classification
    // - Advanced amount extraction
    
    return baseResult; // For now, return base result
  }

  /**
   * Map versioned result format to evaluation expected format
   */
  mapVersionedResult(versionedResult, transcript, parserVersion) {
    const mappedResult = {
      name: versionedResult.personalInfo?.name || '',
      urgency: this.mapUrgencyToEvaluationFormat(versionedResult.urgentNeeds, transcript),
      donationPitch: versionedResult.donationPitch || '',
      category: versionedResult.category || 'unknown',
      goalAmount: this.extractGoalAmountFromVersioned(versionedResult, transcript),
      parserVersion: parserVersion // Track which version was used
    };
    
    console.log(`[ParserAdapter] Result mapped for ${parserVersion}`);
    return mappedResult;
  }

  /**
   * Map production urgency to evaluation format using production logic
   */
  mapUrgencyToEvaluationFormat(urgentNeeds, transcript) {
    // Use production urgency extraction directly
    const { extractUrgency } = require('../../../src/utils/extraction/rulesEngine');
    return extractUrgency(transcript);
  }

  /**
   * Extract goal amount using versioned rules engine logic
   */
  extractGoalAmountFromVersioned(result, transcript) {
    // Try to get amount from versioned result
    if (result.donationPitch) {
      const amountMatch = result.donationPitch.match(/\$([\\d,]+)/); 
      if (amountMatch) {
        return parseInt(amountMatch[1].replace(/,/g, ''));
      }
    }
    
    // Use versioned rules engine extraction
    const { extractGoalAmount } = require('../../../src/utils/extraction/rulesEngine');
    return extractGoalAmount(transcript);
  }

  /**
   * Create Jan-v3 parser instance
   */
  createJanV3ParserInstance() {
    const janV3Path = path.resolve(__dirname, '../../jan-v3-analytics-runner.js');
    
    // Load and instantiate jan-v3 parser
    const { JanV3AnalyticsRunner } = require(janV3Path);
    return new JanV3AnalyticsRunner(this.config);
  }
}

/**
 * Unified Parser Interface - Prevents configuration drift
 */
class UnifiedParserInterface {
  static async parse(transcriptText, systemName = 'v4plus', opts = {}) {
    const adapter = new ParserAdapter(systemName);
    return await adapter.extractAll(transcriptText, opts);
  }
  
  static getAvailableParsers() {
    return ['Pro_rules_engine_80%_v.1.0_', 'Test_Rules_engine_v.1.0_'];
  }
  
  static getAvailableSystems() {
    return ['production', 'testing'];
  }
}

// Export both individual components and unified interface
module.exports = {
  ParserAdapter,
  EvaluationConfig,
  UnifiedParserInterface,
  
  // Backward compatibility - but with explicit configuration
  createAdapter: (systemName) => new ParserAdapter(systemName),
  
  // Legacy export - deprecated but functional
  default: ParserAdapter
};