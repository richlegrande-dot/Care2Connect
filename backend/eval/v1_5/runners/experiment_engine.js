/**
 * LAYER 4 — Controlled Experiment Engine
 * 
 * Enables safe iteration via scoped overrides.
 * Experiments do NOT permanently alter the core engine.
 * Active experiment flags are logged in every report header.
 * 
 * Usage:
 *   --experiment amount_v2
 *   --experiment name_v2
 *   --experiment urgency_threshold_032
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const EXPERIMENTS_DIR = path.resolve(__dirname, '../experiments');

/**
 * Registry of known experiments.
 * Each experiment defines:
 *   - description: what it does
 *   - envOverrides: environment variables to set
 *   - configOverrides: config values to override
 */
const EXPERIMENT_REGISTRY = {
  amount_v2: {
    description: 'Extended SPOKEN_NUMBERS map with compound numbers',
    envOverrides: { USE_AMOUNT_V2: 'true' },
    configOverrides: {}
  },
  name_v2: {
    description: 'Extended name regex patterns for introduction forms',
    envOverrides: { USE_NAME_V2: 'true' },
    configOverrides: {}
  },
  urgency_threshold_032: {
    description: 'Lower HIGH urgency threshold from 0.38 to 0.32',
    envOverrides: { URGENCY_HIGH_THRESHOLD_OVERRIDE: '0.32' },
    configOverrides: {}
  },
  urgency_threshold_028: {
    description: 'Lower HIGH urgency threshold from 0.38 to 0.28',
    envOverrides: { URGENCY_HIGH_THRESHOLD_OVERRIDE: '0.28' },
    configOverrides: {}
  },
  category_emergency: {
    description: 'Add EMERGENCY keyword list to extractNeeds',
    envOverrides: { USE_EMERGENCY_CATEGORY: 'true' },
    configOverrides: {}
  },
  strict_name_reject: {
    description: 'Enhanced NAME_REJECT_PATTERNS filtering',
    envOverrides: { USE_STRICT_NAME_REJECT: 'true' },
    configOverrides: {}
  },
  amount_tolerance_005: {
    description: 'Tighten amount tolerance to 5%',
    envOverrides: {},
    configOverrides: { DEFAULT_AMOUNT_TOLERANCE: 0.05 }
  },
  amount_tolerance_015: {
    description: 'Loosen amount tolerance to 15%',
    envOverrides: {},
    configOverrides: { DEFAULT_AMOUNT_TOLERANCE: 0.15 }
  },
  no_enhancements: {
    description: 'Disable ALL enhancement phase flags (raw engine)',
    envOverrides: {
      USE_V3B_ENHANCEMENTS: 'false',
      USE_V2C_ENHANCEMENTS: 'false',
      USE_V2D_ENHANCEMENTS: 'false',
      USE_V3C_ENHANCEMENTS: 'false',
      USE_V3D_DEESCALATION: 'false',
      USE_CORE30_URGENCY_OVERRIDES: 'false',
      USE_PHASE2_URGENCY_BOOSTS: 'false',
      USE_PHASE3_CATEGORY_FIXES: 'false',
      USE_PHASE36_URGENCY_DEESCALATION: 'false',
      USE_PHASE37_URGENCY_DEESCALATION: 'false',
      USE_PHASE41_URGENCY_ESCALATION: 'false'
    },
    configOverrides: {}
  }
};

class ExperimentEngine {
  constructor() {
    this.activeExperiments = [];
    this.envBackup = {};
    this.configOverrides = {};
  }

  /**
   * List all registered experiments.
   */
  static listExperiments() {
    return Object.entries(EXPERIMENT_REGISTRY).map(([name, exp]) => ({
      name,
      description: exp.description
    }));
  }

  /**
   * Activate one or more experiments.
   * @param {string[]} experimentNames 
   * @param {object} baseConfig - the runner config to patch
   * @returns {object} patched config
   */
  activate(experimentNames, baseConfig = {}) {
    const patchedConfig = { ...baseConfig };

    for (const name of experimentNames) {
      // Check registry first
      let experiment = EXPERIMENT_REGISTRY[name];

      // Then check custom experiment files
      if (!experiment) {
        const customPath = path.join(EXPERIMENTS_DIR, `${name}.json`);
        if (fs.existsSync(customPath)) {
          experiment = JSON.parse(fs.readFileSync(customPath, 'utf8'));
        }
      }

      if (!experiment) {
        throw new Error(
          `Unknown experiment: '${name}'\n` +
          `Available: ${Object.keys(EXPERIMENT_REGISTRY).join(', ')}\n` +
          `Or create: eval/v1_5/experiments/${name}.json`
        );
      }

      // Backup and apply env overrides
      if (experiment.envOverrides) {
        for (const [key, value] of Object.entries(experiment.envOverrides)) {
          if (!(key in this.envBackup)) {
            this.envBackup[key] = process.env[key];
          }
          process.env[key] = value;
        }
      }

      // Apply config overrides
      if (experiment.configOverrides) {
        Object.assign(patchedConfig, experiment.configOverrides);
        Object.assign(this.configOverrides, experiment.configOverrides);
      }

      this.activeExperiments.push({
        name,
        description: experiment.description
      });
    }

    return patchedConfig;
  }

  /**
   * Deactivate all experiments, restoring original env.
   */
  deactivate() {
    for (const [key, originalValue] of Object.entries(this.envBackup)) {
      if (originalValue === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalValue;
      }
    }
    this.envBackup = {};
    this.activeExperiments = [];
    this.configOverrides = {};
  }

  /**
   * Get active experiment metadata for report embedding.
   */
  getReportMetadata() {
    return {
      experiment_flags: this.activeExperiments.map(e => e.name),
      experiment_details: this.activeExperiments,
      config_overrides: this.configOverrides
    };
  }

  /**
   * List all available experiments.
   */
  static listExperiments() {
    const experiments = [];
    for (const [name, exp] of Object.entries(EXPERIMENT_REGISTRY)) {
      experiments.push({ name, description: exp.description });
    }

    // Also scan custom experiment files
    if (fs.existsSync(EXPERIMENTS_DIR)) {
      const files = fs.readdirSync(EXPERIMENTS_DIR).filter(f => f.endsWith('.json'));
      for (const file of files) {
        try {
          const exp = JSON.parse(fs.readFileSync(path.join(EXPERIMENTS_DIR, file), 'utf8'));
          experiments.push({ name: path.basename(file, '.json'), description: exp.description || 'Custom experiment' });
        } catch (e) { /* skip malformed */ }
      }
    }

    return experiments;
  }

  /**
   * Compute a hash of the engine source files for reproducibility tracking.
   */
  static computeEngineHash() {
    const engineFiles = [
      path.resolve(__dirname, '../../../src/utils/extraction/rulesEngine.ts'),
      path.resolve(__dirname, '../../../src/utils/extraction/urgencyEngine.ts'),
      path.resolve(__dirname, '../../../src/utils/extraction/amountEngine.ts')
    ];

    const hash = crypto.createHash('sha256');

    for (const file of engineFiles) {
      if (fs.existsSync(file)) {
        hash.update(fs.readFileSync(file));
      } else {
        hash.update(`MISSING:${file}`);
      }
    }

    return hash.digest('hex');
  }
}

module.exports = { ExperimentEngine, EXPERIMENT_REGISTRY };
