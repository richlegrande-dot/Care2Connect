/**
 * Parser Adapter for v4plus Testing - V1 Production Parser (90% baseline)
 * Version: v1.0-production-90.0
 * 
 * USES: Same Rules-Based Provider as V1 production (90% validated baseline)
 * ELIMINATES: Configuration drift between production and testing
 * 
 * Since the eval runner uses tsx, we can import TypeScript directly.
 */

const path = require('path');

// Lazy-loaded references to production rules engine
let _rulesEngine = null;
let _aiProvider = null;

/**
 * Load the production rules engine (TypeScript, via tsx runtime)
 */
function getRulesEngine() {
  if (!_rulesEngine) {
    try {
      _rulesEngine = require('../../../src/utils/extraction/rulesEngine');
      console.log('[ParserAdapter] Loaded production rulesEngine via tsx');
    } catch (err) {
      console.error('[ParserAdapter] Failed to load rulesEngine:', err.message);
      throw err;
    }
  }
  return _rulesEngine;
}

/**
 * Load the production AI provider (TypeScript, via tsx runtime)
 */
function getProvider() {
  if (!_aiProvider) {
    try {
      const { getAIProvider } = require('../../../src/providers/ai/index');
      _aiProvider = getAIProvider();
      console.log(`[ParserAdapter] Loaded AI provider: ${_aiProvider.name} (${_aiProvider.type})`);
    } catch (err) {
      console.error('[ParserAdapter] Failed to load AI provider:', err.message);
      throw err;
    }
  }
  return _aiProvider;
}

class ParserAdapter {
  constructor() {
    this.parser = null;
    this.initialized = false;
    this.baseline = 'V1 Production Parser (Rules-Based) v1.0-production-90.0';
  }

  /**
   * Initialize the jan-v3-analytics-runner as fallback parser
   */
  initialize() {
    if (this.initialized) return;

    try {
      const parserPath = path.join(__dirname, '../../jan-v3-analytics-runner.js');
      delete require.cache[parserPath];
      const ParserModule = require(parserPath);
      if (typeof ParserModule === 'function') {
        this.parser = new ParserModule();
      } else if (ParserModule.JanV3AnalyticsEvaluator) {
        this.parser = new ParserModule.JanV3AnalyticsEvaluator();
      } else {
        this.parser = ParserModule;
      }

      if (!this.parser || typeof this.parser.simulateEnhancedParsing !== 'function') {
        const foundMethods = this.parser ? Object.keys(this.parser).filter(k => typeof this.parser[k] === 'function') : [];
        throw new Error(
          `Parser adapter failed to load. Expected simulateEnhancedParsing() method.\n` +
          `Found methods: ${foundMethods.length > 0 ? foundMethods.join(', ') : 'none'}\n` +
          `Parser path: ${parserPath}\n` +
          `Parser type: ${typeof this.parser}`
        );
      }

      this.initialized = true;
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw new Error(
          `Parser adapter failed to load jan-v3-analytics-runner.js\n` +
          `Expected location: backend/eval/jan-v3-analytics-runner.js\n` +
          `Error: ${error.message}\n\n` +
          `Make sure Jan v3.0 parser exists at the expected location.`
        );
      }
      throw error;
    }
  }

  /**
   * Extract all fields using the PRODUCTION rules engine directly.
   *
   * Since the v4plus runner is invoked via tsx, TypeScript imports work natively.
   * No temp files, no child processes, no module resolution hacks needed.
   *
   * @param {string} transcriptText - Raw transcript text
   * @param {object} opts - Optional test case metadata
   * @returns {object} Parse results with name, category, urgencyLevel, goalAmount
   */
  async extractAll(transcriptText, opts = {}) {
    try {
      const engine = getRulesEngine();

      // Use the comprehensive extraction function from the production engine
      const telemetryResult = engine.extractAllWithTelemetry(transcriptText);

      const name = telemetryResult.results.name.value;
      const urgency = telemetryResult.results.urgency;
      const amount = telemetryResult.results.amount.value;

      // Extract category from needs
      const needs = engine.extractNeeds(transcriptText, 1);
      const category = this.mapCategoryToEvaluationFormat(needs[0] || 'GENERAL');

      return {
        name: name || null,
        category,
        urgencyLevel: urgency,
        goalAmount: amount
      };

    } catch (engineError) {
      // Fallback: try the jan-v3-analytics-runner
      console.warn('[ParserAdapter] Production engine failed, falling back to jan-v3:', engineError.message);

      try {
        this.initialize();
        const testCase = {
          transcriptText,
          expected: opts.expected || {},
          id: opts.id || 'unknown'
        };
        const parseResult = await this.parser.simulateEnhancedParsing(testCase);
        return parseResult.results;
      } catch (fallbackError) {
        throw new Error(
          `Both production and fallback parsers failed.\n` +
          `Production error: ${engineError.message}\n` +
          `Fallback error: ${fallbackError.message}\n` +
          `Transcript length: ${transcriptText?.length || 0} chars`
        );
      }
    }
  }

  /**
   * Extract full parse details (results + debug + confidence)
   *
   * @param {string} transcriptText - Raw transcript text
   * @param {object} opts - Optional test case metadata
   * @returns {object} Full parse result with telemetry
   */
  async extractAllDetailed(transcriptText, opts = {}) {
    try {
      const engine = getRulesEngine();
      return engine.extractAllWithTelemetry(transcriptText);
    } catch (err) {
      // Fallback to jan-v3
      console.warn('[ParserAdapter] Detailed extraction fallback to jan-v3:', err.message);
      this.initialize();

      const testCase = {
        transcriptText,
        expected: opts.expected || {},
        id: opts.id || 'unknown'
      };

      return await this.parser.simulateEnhancedParsing(testCase);
    }
  }

  /**
   * Get parser metadata for debugging
   */
  getMetadata() {
    try {
      const provider = getProvider();
      return {
        parserType: provider.name || 'Rules-Based Provider',
        providerType: provider.type || 'rules',
        baseline: this.baseline,
        initialized: true
      };
    } catch (e) {
      this.initialize();
      return {
        parserType: this.parser?.constructor?.name || 'Unknown',
        availableMethods: this.parser ? Object.keys(this.parser).filter(k => typeof this.parser[k] === 'function') : [],
        initialized: this.initialized
      };
    }
  }

  /**
   * Map production category (from extractNeeds) to evaluation format.
   * Most categories match directly between engine and dataset.
   * Only edge cases need explicit mapping.
   */
  mapCategoryToEvaluationFormat(urgentNeed) {
    // Engine outputs that need remapping to dataset format
    const remapTable = {
      'JOBS': 'EMPLOYMENT',        // Engine has both JOBS and EMPLOYMENT
      'CHILDCARE': 'FAMILY',       // Dataset uses FAMILY for childcare-related
      'MENTAL_HEALTH': 'HEALTHCARE' // Dataset groups mental health under HEALTHCARE
    };

    if (remapTable[urgentNeed]) {
      return remapTable[urgentNeed];
    }

    // Direct pass-through for matching categories:
    // HOUSING, FOOD, EMPLOYMENT, HEALTHCARE, SAFETY, EDUCATION,
    // TRANSPORTATION, LEGAL, EMERGENCY, OTHER
    return urgentNeed || 'OTHER';
  }
}

// Export singleton instance
const adapter = new ParserAdapter();

module.exports = {
  extractAll: (transcriptText, opts) => adapter.extractAll(transcriptText, opts),
  extractAllDetailed: (transcriptText, opts) => adapter.extractAllDetailed(transcriptText, opts),
  getMetadata: () => adapter.getMetadata()
};
