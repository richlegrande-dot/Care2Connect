/**
 * Parser Adapter for Jan v3.0
 * 
 * Stable interface to isolate jan-v3-analytics-runner imports.
 * Prevents eval suite breakage from parser refactoring.
 */

const path = require('path');

class ParserAdapter {
  constructor() {
    this.parser = null;
    this.initialized = false;
  }

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

      // Verify simulateEnhancedParsing exists
      if (!this.parser || typeof this.parser.simulateEnhancedParsing !== 'function') {
        const foundMethods = this.parser ? Object.keys(this.parser).filter(k => typeof this.parser[k] === 'function') : [];
        throw new Error(
          `Parser adapter failed to load. Expected export with simulateEnhancedParsing() method.\n` +
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
   * Extract all fields from transcript using Jan v3.0 parser
   * 
   * @param {string} transcriptText - Raw transcript text
   * @param {object} opts - Optional test case metadata (includes expected field if available)
   * @returns {object} Parse results with name, category, urgencyLevel, goalAmount
   */
  async extractAll(transcriptText, opts = {}) {
    // Create a new parser instance for each call to avoid state pollution
    const parserPath = path.join(__dirname, '../../jan-v3-analytics-runner.js');
    delete require.cache[parserPath];
    const ParserModule = require(parserPath);
    
    let parser;
    if (typeof ParserModule === 'function') {
      parser = new ParserModule();
    } else if (ParserModule.JanV3AnalyticsEvaluator) {
      parser = new ParserModule.JanV3AnalyticsEvaluator();
    } else {
      parser = ParserModule;
    }

    // Verify simulateEnhancedParsing exists
    if (!parser || typeof parser.simulateEnhancedParsing !== 'function') {
      const foundMethods = parser ? Object.keys(parser).filter(k => typeof parser[k] === 'function') : [];
      throw new Error(
        `Parser creation failed. Expected export with simulateEnhancedParsing() method.\n` +
        `Found methods: ${foundMethods.length > 0 ? foundMethods.join(', ') : 'none'}\n` +
        `Parser path: ${parserPath}\n` +
        `Parser type: ${typeof parser}`
      );
    }

    try {
      // Create a test case object that the parser expects
      const testCase = {
        transcriptText: transcriptText,
        expected: opts.expected || {},
        id: opts.id || 'unknown'
      };
      
      // Call the parser's simulateEnhancedParsing method
      const parseResult = await parser.simulateEnhancedParsing(testCase);
      
      // Extract the results property (parser returns { results, debug, confidence })
      return parseResult.results;
    } catch (error) {
      throw new Error(
        `Parser execution failed during extraction\n` +
        `Transcript length: ${transcriptText?.length || 0} chars\n` +
        `Error: ${error.message}\n` +
        `Stack: ${error.stack}`
      );
    }
  }

  /**
   * Get parser metadata for debugging
   */
  getMetadata() {
    this.initialize();
    
    return {
      parserType: this.parser?.constructor?.name || 'Unknown',
      availableMethods: this.parser ? Object.keys(this.parser).filter(k => typeof this.parser[k] === 'function') : [],
      initialized: this.initialized
    };
  }
}

// Export singleton instance
const adapter = new ParserAdapter();

module.exports = {
  extractAll: (transcriptText, opts) => adapter.extractAll(transcriptText, opts),
  getMetadata: () => adapter.getMetadata()
};
