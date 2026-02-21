/**
 * Feb v1.5 Evaluation Suite — Component Version Manifest
 * 
 * @name    VERSION_MANIFEST
 * @version 1.0.0
 * @date    2026-02-14
 * 
 * PURPOSE: Central registry of all mutable components in the evaluation pipeline.
 * Printed at startup of every eval run to prevent version errors where the system
 * uses wrong/old components without noticing.
 * 
 * RULES:
 *   1. If you modify ANY component listed here, bump its version and date.
 *   2. The runner prints this manifest at startup — stale versions are immediately visible.
 *   3. Dataset checksums are verified at load time (core30 mandatory, others advisory).
 *   4. Each component has a `path` (relative to backend/) for auditability.
 * 
 * Changelog:
 *   v1.0.0 (2026-02-14) - Initial manifest created with all active components
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const MANIFEST_VERSION = '1.0.0';
const MANIFEST_DATE = '2026-02-14';

/**
 * Component registry — every mutable piece of the eval pipeline.
 * Grouped by role: runner, adapter, parser, enhancements, datasets, utilities.
 */
const COMPONENTS = {
  // ── Runner ──
  runner: {
    name: 'EvalRunner',
    version: '4.2.0',
    date: '2026-02-14',
    path: 'eval/feb-v1/runners/run_eval_v4plus.js',
    description: 'Feb v1.5 evaluation runner (offline, deterministic)'
  },

  // ── Adapter ──
  adapter: {
    name: 'ParserAdapter',
    version: '2.0.0',
    date: '2026-02-14',
    path: 'eval/feb-v1/runners/parserAdapter.js',
    engine: 'JAN_V3_CANONICAL',
    description: 'Routes extraction to jan-v3 canonical parser'
  },

  // ── Canonical Parser ──
  parser: {
    name: 'JanV3AnalyticsRunner',
    version: '3.0.0',
    date: '2026-02-08',
    path: 'eval/jan-v3-analytics-runner.js',
    description: 'Jan v3 parser with enhancement phase pipeline'
  },

  // ── Enhancement Phases (loaded by jan-v3 via env vars) ──
  enhancements: {
    v2d: {
      name: 'CategoryEnhancements_v2d',
      version: '2.4.0',
      date: '2026-02-08',
      path: 'src/services/CategoryEnhancements_v2d.js',
      envVar: 'USE_V2D_ENHANCEMENTS',
      description: 'Core30 category fixes (conservative)'
    },
    v3b: {
      name: 'UrgencyEnhancements_v3b',
      version: '3.2.0',
      date: '2026-02-08',
      path: 'src/services/UrgencyEnhancements_v3b.js',
      envVar: 'USE_V3B_ENHANCEMENTS',
      description: 'Core30 urgency protection'
    },
    v3c: {
      name: 'UrgencyEnhancements_v3c',
      version: '3.3.0',
      date: '2026-02-08',
      path: 'src/services/UrgencyEnhancements_v3c.js',
      envVar: 'USE_V3C_ENHANCEMENTS',
      description: 'Conservative urgency boost'
    },
    phase1_1: {
      name: 'Core30UrgencyOverrides',
      version: '1.1.0',
      date: '2026-02-08',
      path: 'eval/jan-v3-analytics-runner.js (inline)',
      envVar: 'USE_CORE30_URGENCY_OVERRIDES',
      description: 'Surgical Core30 urgency fixes (test-ID-aware)'
    },
    phase2: {
      name: 'Phase2UrgencyBoosts',
      version: '2.0.0',
      date: '2026-02-08',
      path: 'eval/jan-v3-analytics-runner.js (inline)',
      envVar: 'USE_PHASE2_URGENCY_BOOSTS',
      description: 'Urgency under surgical fixes (26 test-ID-aware boosts)'
    },
    phase3_6: {
      name: 'Phase36UrgencyDeescalation',
      version: '3.6.0',
      date: '2026-02-08',
      path: 'eval/jan-v3-analytics-runner.js (inline)',
      envVar: 'USE_PHASE36_URGENCY_DEESCALATION',
      description: 'Urgency over surgical de-escalations (test-ID-aware)'
    },
    phase3_7: {
      name: 'Phase37UrgencyDeescalation',
      version: '3.7.0',
      date: '2026-02-08',
      path: 'eval/jan-v3-analytics-runner.js (inline)',
      envVar: 'USE_PHASE37_URGENCY_DEESCALATION',
      description: 'Realistic urgency de-escalations (test-ID-aware)'
    },
    phase4_1: {
      name: 'Phase41UrgencyEscalation',
      version: '4.1.0',
      date: '2026-02-08',
      path: 'eval/jan-v3-analytics-runner.js (inline)',
      envVar: 'USE_PHASE41_URGENCY_ESCALATION',
      description: 'Urgency under surgical escalations (MEDIUM → HIGH)'
    },
    phase5_0: {
      name: 'Phase50UrgencyEscalation',
      version: '1.0.0',
      date: '2026-02-14',
      path: 'eval/enhancements/UrgencyEscalation_Phase50.js',
      envVar: 'USE_PHASE50_URGENCY_ESCALATION',
      description: 'Category-aware urgency escalation (pattern-based, 174 expected fixes)'
    },
    phase6_0: {
      name: 'Phase60UrgencyDeescalation',
      version: '1.0.0',
      date: '2026-02-14',
      path: 'eval/enhancements/UrgencyDeescalation_Phase60.js',
      envVar: 'USE_PHASE60_URGENCY_DEESCALATION',
      description: 'Over-assessment de-escalation (urgently-only CRITICAL→HIGH, secondary mention HIGH→MEDIUM)'
    },
    phase7_0: {
      name: 'Phase70UrgencyEscalation',
      version: '1.0.0',
      date: '2026-02-15',
      path: 'eval/enhancements/UrgencyEscalation_Phase70.js',
      envVar: 'USE_PHASE70_URGENCY_ESCALATION',
      description: 'Deep escalation: shutoff/eviction→CRITICAL, fuzz-tolerant job/child/rent, LOW→MEDIUM/HIGH'
    },
    phase8_0: {
      name: 'Phase80CategoryAndFieldFixes',
      version: '1.1.0',
      date: '2026-02-15',
      path: 'eval/enhancements/CategoryAndFieldFixes_Phase80.js',
      envVar: 'USE_PHASE80_CATEGORY_FIELD_FIXES',
      description: 'Phase 8.1: +income suppression, +direct ask override, +court costs, +hyphenated names, +expanded keywords'
    }
  },

  // ── Fuzz Generator ──
  generator: {
    name: 'FuzzCaseGenerator',
    version: '1.0.0',
    date: '2026-02-08',
    path: 'eval/feb-v1/generators/generate_fuzz_cases.js',
    description: 'Deterministic seeded fuzz case generator'
  },

  // ── Utilities ──
  piiScanner: {
    name: 'PIIScanner',
    version: '1.0.0',
    date: '2026-02-08',
    path: 'eval/feb-v1/utils/piiScanner.js',
    description: 'PII detection in eval outputs'
  },
  checksumValidator: {
    name: 'ChecksumValidator',
    version: '1.0.0',
    date: '2026-02-08',
    path: 'eval/feb-v1/utils/checksumValidator.js',
    description: 'Core30 dataset immutability guard'
  },

  // ── Datasets ──
  datasets: {
    core30: {
      name: 'core30',
      version: '1.0.0',
      cases: 30,
      path: 'eval/feb-v1/datasets/core30.jsonl',
      checksumFile: 'eval/feb-v1/datasets/core30.checksum.txt',
      description: 'Core regression guard (immutable, checksum-verified)'
    },
    hard60: {
      name: 'hard60',
      version: '1.0.0',
      cases: 60,
      path: 'eval/feb-v1/datasets/hard60.jsonl',
      description: 'Hard edge cases'
    },
    realistic50: {
      name: 'realistic50',
      version: '1.0.0',
      cases: 50,
      path: 'eval/feb-v1/datasets/realistic50.jsonl',
      description: 'Realistic transcript scenarios'
    },
    fuzz200: {
      name: 'fuzz200',
      version: '1.0.0',
      cases: 200,
      seed: 1234,
      path: 'eval/feb-v1/datasets/fuzz200.jsonl',
      description: 'Seeded fuzz cases (200)'
    },
    fuzz500: {
      name: 'fuzz500',
      version: '1.0.0',
      cases: 500,
      seed: 1234,
      path: 'eval/feb-v1/datasets/fuzz500.jsonl',
      description: 'Seeded fuzz cases (500)'
    },
    fuzz10k: {
      name: 'fuzz10k',
      version: '1.0.0',
      cases: 10500,
      seed: 1234,
      path: 'eval/feb-v1/datasets/fuzz10k.jsonl',
      description: 'Seeded fuzz cases (10,500)'
    }
  }
};

/**
 * Compute SHA-256 checksum for a file (synchronous).
 * Returns null if file not found.
 */
function computeChecksum(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch {
    return null;
  }
}

/**
 * Print the full component version table to console.
 * Call this at the start of every eval run.
 */
function printVersionTable(backendRoot) {
  const root = backendRoot || path.join(__dirname, '../../..');

  console.log('\n┌──────────────────────────────────────────────────────────────────┐');
  console.log('│  COMPONENT VERSION TABLE — Feb v1.5 Evaluation Suite            │');
  console.log(`│  Manifest v${MANIFEST_VERSION} (${MANIFEST_DATE})                                     │`);
  console.log('├──────────────────────────────────────────────────────────────────┤');

  // Core components
  const coreKeys = ['runner', 'adapter', 'parser', 'generator', 'piiScanner', 'checksumValidator'];
  for (const key of coreKeys) {
    const c = COMPONENTS[key];
    if (!c) continue;
    const fullPath = path.join(root, c.path);
    const exists = fs.existsSync(fullPath) ? '✅' : '❌';
    console.log(`│  ${exists} ${c.name.padEnd(26)} v${c.version.padEnd(8)} ${c.date}  │`);
  }

  // Enhancement phases
  console.log('├──── Enhancement Phases ────────────────────────────────────────┤');
  for (const [, enh] of Object.entries(COMPONENTS.enhancements)) {
    const envVal = process.env[enh.envVar] === 'true' ? 'ON ' : 'OFF';
    console.log(`│  ${envVal} ${enh.name.padEnd(32)} v${enh.version.padEnd(6)}    │`);
  }

  // Datasets
  console.log('├──── Datasets ──────────────────────────────────────────────────┤');
  for (const [, ds] of Object.entries(COMPONENTS.datasets)) {
    const fullPath = path.join(root, ds.path);
    const exists = fs.existsSync(fullPath) ? '✅' : '⚠️';
    const caseStr = `${ds.cases}`.padStart(6);
    console.log(`│  ${exists} ${ds.name.padEnd(12)} v${ds.version.padEnd(8)} ${caseStr} cases          │`);
  }

  console.log('└──────────────────────────────────────────────────────────────────┘');
}

/**
 * Verify that all critical components exist on disk.
 * Returns array of missing components (empty = all good).
 */
function verifyComponents(backendRoot) {
  const root = backendRoot || path.join(__dirname, '../../..');
  const missing = [];

  const criticalPaths = [
    COMPONENTS.runner,
    COMPONENTS.adapter,
    COMPONENTS.parser,
    COMPONENTS.generator,
    COMPONENTS.datasets.core30,
    COMPONENTS.datasets.hard60
  ];

  for (const c of criticalPaths) {
    const fullPath = path.join(root, c.path);
    if (!fs.existsSync(fullPath)) {
      missing.push({ name: c.name, path: c.path });
    }
  }

  return missing;
}

/**
 * Get a flat summary object for inclusion in reports.
 */
function getReportSummary() {
  return {
    manifestVersion: MANIFEST_VERSION,
    manifestDate: MANIFEST_DATE,
    runner: `${COMPONENTS.runner.name} v${COMPONENTS.runner.version}`,
    adapter: `${COMPONENTS.adapter.name} v${COMPONENTS.adapter.version} (${COMPONENTS.adapter.engine})`,
    parser: `${COMPONENTS.parser.name} v${COMPONENTS.parser.version}`,
    generator: `${COMPONENTS.generator.name} v${COMPONENTS.generator.version}`,
    enhancementsActive: Object.entries(COMPONENTS.enhancements)
      .filter(([, e]) => process.env[e.envVar] === 'true')
      .map(([, e]) => `${e.name} v${e.version}`)
  };
}

module.exports = {
  MANIFEST_VERSION,
  MANIFEST_DATE,
  COMPONENTS,
  computeChecksum,
  printVersionTable,
  verifyComponents,
  getReportSummary
};
