/**
 * Parser Adapter for Feb v1.5 Evaluation Suite
 * 
 * @name    ParserAdapter
 * @version 2.0.0
 * @date    2026-02-14
 * @engine  JAN_V3_CANONICAL
 * 
 * CANONICAL ENGINE: jan-v3-analytics-runner.js + enhancement phases
 *   (v2d, v3b, v3c, Phase 1.1, Phase 2, Phase 3.6, 3.7, Phase 4.1)
 * 
 * This adapter routes ALL extraction through the jan-v3 stack, which is
 * the validated production parser. The TS rulesEngine is a next-gen engine
 * under development and is NOT used by this adapter.
 * 
 * VERSIONING: This file is version-tracked. The version constant below
 * is logged once per run and included in all reports. If you modify this
 * file, bump the version and date.
 * 
 * Changelog:
 *   v1.0.0 (2026-02-08) - Initial adapter, tried TS rulesEngine → fell back to jan-v3
 *   v1.1.0 (2026-02-13) - Engine selection sprint (REVERTED - caused Core30 regression)
 *   v2.0.0 (2026-02-14) - jan-v3 designated as canonical engine, version tracking added
 */

const path = require('path');

// ── Component Identity (logged once per run, included in reports) ──
const COMPONENT_VERSION = {
  name: 'ParserAdapter',
  version: '2.0.0',
  date: '2026-02-14',
  engine: 'JAN_V3_CANONICAL'
};

let _aiProvider = null;
let _versionLogged = false;

/**
 * Log component version once per run
 */
function logVersion() {
  if (_versionLogged) return;
  console.log(`[${COMPONENT_VERSION.name} v${COMPONENT_VERSION.version}] Engine: ${COMPONENT_VERSION.engine} | Date: ${COMPONENT_VERSION.date}`);
  _versionLogged = true;
}

/**
 * Get component version info (for reporting/manifest verification)
 */
function getComponentVersion() {
  return { ...COMPONENT_VERSION };
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
    this.baseline = `ParserAdapter v${COMPONENT_VERSION.version} (${COMPONENT_VERSION.engine})`;
    logVersion();
  }

  /**
   * Initialize the jan-v3-analytics-runner as the CANONICAL parser.
   * This is the production parser with all enhancement phases.
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
   * Extract all fields using the CANONICAL jan-v3 parser with enhancement phases.
   *
   * @param {string} transcriptText - Raw transcript text
   * @param {object} opts - Optional test case metadata
   * @returns {object} Parse results with name, category, urgencyLevel, goalAmount
   */
  async extractAll(transcriptText, opts = {}) {
    try {
      this.initialize();
      const testCase = {
        transcriptText,
        expected: opts.expected || {},
        id: opts.id || 'unknown'
      };
      const parseResult = await this.parser.simulateEnhancedParsing(testCase);
      return parseResult.results;
    } catch (error) {
      throw new Error(
        `[ParserAdapter v${COMPONENT_VERSION.version}] Canonical parser failed.\n` +
        `Error: ${error.message}\n` +
        `Transcript length: ${transcriptText?.length || 0} chars`
      );
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
    this.initialize();
    const testCase = {
      transcriptText,
      expected: opts.expected || {},
      id: opts.id || 'unknown'
    };
    return await this.parser.simulateEnhancedParsing(testCase);
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
  getMetadata: () => adapter.getMetadata(),
  getComponentVersion,
  COMPONENT_VERSION
};
