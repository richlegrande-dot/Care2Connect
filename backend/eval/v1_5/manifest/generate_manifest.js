/**
 * LAYER 1 — Dataset Manifest Generator
 * 
 * Generates a SHA-256 manifest for all evaluation datasets.
 * Used by the pre-run validation step to guarantee dataset integrity.
 * 
 * Usage:
 *   npx tsx eval/v1_5/manifest/generate_manifest.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATASETS_DIR = path.resolve(__dirname, '../../v4plus/datasets');
const MANIFEST_PATH = path.resolve(__dirname, 'dataset_manifest.json');

const KNOWN_DATASETS = [
  { file: 'core30.jsonl', tag: 'core30' },
  { file: 'hard60.jsonl', tag: 'hard60' },
  { file: 'fuzz200.jsonl', tag: 'fuzz200' },
  { file: 'fuzz500.jsonl', tag: 'fuzz500' },
  { file: 'fuzz10k.jsonl', tag: 'fuzz10k' },
  { file: 'realistic50.jsonl', tag: 'realistic50' }
];

function sha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function countCases(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').trim();
  const lines = content.split('\n');
  let caseCount = 0;
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (!obj._meta) caseCount++;
    } catch { /* skip malformed lines */ }
  }
  return { lineCount: lines.length, caseCount };
}

function generateManifest() {
  console.log('📋 Generating dataset manifest...\n');

  const manifest = {
    version: 'feb_v1_5',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    generator: 'eval/v1_5/manifest/generate_manifest.js',
    datasets: {}
  };

  for (const ds of KNOWN_DATASETS) {
    const fullPath = path.join(DATASETS_DIR, ds.file);

    if (!fs.existsSync(fullPath)) {
      console.warn(`  ⚠️  ${ds.file} not found — skipping`);
      continue;
    }

    const stat = fs.statSync(fullPath);
    const hash = sha256(fullPath);
    const { lineCount, caseCount } = countCases(fullPath);

    manifest.datasets[ds.tag] = {
      filename: ds.file,
      sha256: hash,
      line_count: lineCount,
      case_count: caseCount,
      file_size_bytes: stat.size,
      last_modified: stat.mtime.toISOString(),
      version_tag: 'feb_v1_5'
    };

    console.log(`  ✅ ${ds.tag}: ${caseCount} cases, SHA ${hash.slice(0, 12)}...`);
  }

  // Compute manifest hash (hash of all dataset hashes concatenated)
  const combinedHashes = Object.values(manifest.datasets)
    .map(d => d.sha256)
    .sort()
    .join('');
  manifest.manifest_hash = crypto.createHash('sha256').update(combinedHashes).digest('hex');

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\n📦 Manifest written to ${MANIFEST_PATH}`);
  console.log(`   Manifest hash: ${manifest.manifest_hash.slice(0, 16)}...`);

  return manifest;
}

if (require.main === module) {
  generateManifest();
}

module.exports = { generateManifest, sha256 };
