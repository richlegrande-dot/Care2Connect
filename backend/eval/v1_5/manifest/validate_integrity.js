/**
 * LAYER 1 — Pre-Run Dataset Integrity Validation
 * 
 * Verifies all dataset hashes against the manifest before any evaluation run.
 * Fails hard on mismatch. No silent runs allowed.
 * 
 * Usage:
 *   const { validateDatasets } = require('./validate_integrity');
 *   validateDatasets(['core30', 'hard60']); // throws on mismatch
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MANIFEST_PATH = path.resolve(__dirname, 'dataset_manifest.json');
const DATASETS_DIR = path.resolve(__dirname, '../../v4plus/datasets');
const LOG_DIR = path.resolve(__dirname, '../eval_logs');
const INTEGRITY_LOG = path.join(LOG_DIR, 'integrity_errors.log');

function sha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function logIntegrityError(message) {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(INTEGRITY_LOG, entry);
}

/**
 * Load and return the dataset manifest.
 * Throws if manifest doesn't exist or is invalid.
 */
function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    const msg = 'Dataset manifest not found. Run: npx tsx eval/v1_5/manifest/generate_manifest.js';
    logIntegrityError(msg);
    throw new Error(`❌ INTEGRITY FAILURE: ${msg}`);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  if (!manifest.datasets || Object.keys(manifest.datasets).length === 0) {
    const msg = 'Dataset manifest is empty — no datasets registered.';
    logIntegrityError(msg);
    throw new Error(`❌ INTEGRITY FAILURE: ${msg}`);
  }

  return manifest;
}

/**
 * Validate specified datasets against manifest.
 * @param {string[]} datasetNames - e.g. ['core30', 'hard60']
 * @returns {{ manifest: object, validatedDatasets: string[] }}
 */
function validateDatasets(datasetNames) {
  const manifest = loadManifest();
  const errors = [];
  const validated = [];

  for (const name of datasetNames) {
    const entry = manifest.datasets[name];

    if (!entry) {
      errors.push(`Dataset '${name}' not found in manifest.`);
      continue;
    }

    const fullPath = path.join(DATASETS_DIR, entry.filename);

    if (!fs.existsSync(fullPath)) {
      errors.push(`Dataset file '${entry.filename}' missing from disk.`);
      continue;
    }

    const currentHash = sha256(fullPath);

    if (currentHash !== entry.sha256) {
      errors.push(
        `SHA-256 mismatch for '${name}':\n` +
        `  Manifest: ${entry.sha256}\n` +
        `  Current:  ${currentHash}\n` +
        `  File: ${fullPath}`
      );
      continue;
    }

    // Verify line count
    const content = fs.readFileSync(fullPath, 'utf8').trim();
    const lineCount = content.split('\n').length;
    if (lineCount !== entry.line_count) {
      errors.push(
        `Line count mismatch for '${name}': manifest=${entry.line_count}, actual=${lineCount}`
      );
      continue;
    }

    validated.push(name);
  }

  if (errors.length > 0) {
    const fullMessage = `Dataset integrity validation failed:\n\n${errors.join('\n\n')}`;
    logIntegrityError(fullMessage);
    throw new Error(`❌ INTEGRITY FAILURE\n\n${fullMessage}\n\nRe-generate manifest: npx tsx eval/v1_5/manifest/generate_manifest.js`);
  }

  return { manifest, validatedDatasets: validated };
}

/**
 * Get the manifest hash for report embedding.
 */
function getManifestHash() {
  const manifest = loadManifest();
  return manifest.manifest_hash;
}

module.exports = { validateDatasets, loadManifest, getManifestHash, logIntegrityError };
