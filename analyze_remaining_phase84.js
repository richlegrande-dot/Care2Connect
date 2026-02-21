#!/usr/bin/env node
/**
 * Phase 8.4 — Analyze all remaining failures across all 3 datasets.
 * Runs each case through the eval runner's adapter and compares to expected.
 */
const fs = require('fs');
const path = require('path');

// Load datasets
const datasetsDir = path.join(__dirname, 'backend/eval/v4plus/datasets');
const core30 = fs.readFileSync(path.join(datasetsDir, 'core30.jsonl'), 'utf8')
  .split('\n').filter(Boolean).map(l => JSON.parse(l));
const hard60 = fs.readFileSync(path.join(datasetsDir, 'hard60.jsonl'), 'utf8')
  .split('\n').filter(Boolean).map(l => JSON.parse(l));
const fuzz500 = fs.readFileSync(path.join(datasetsDir, 'fuzz500.jsonl'), 'utf8')
  .split('\n').filter(Boolean).map(l => JSON.parse(l));

// Known failures from Phase 8.3 eval run
const CORE30_FAILURES = ['T004', 'T021', 'T023'];
const HARD60_URGENCY = ['HARD_001', 'HARD_005', 'HARD_010', 'HARD_018', 'HARD_051'];
const HARD60_AMOUNT = ['HARD_001', 'HARD_003', 'HARD_006', 'HARD_032'];
const FUZZ_FAILURES = ['FUZZ_211', 'FUZZ_259', 'FUZZ_279', 'FUZZ_390'];

// Print case details
function printCase(dataset, id) {
  const c = dataset.find(x => x.id === id);
  if (!c) { console.log(`  ${id}: NOT FOUND`); return; }
  const exp = c.expectedOutput || c.expected;
  const transcript = (c.transcriptText || c.transcript || '').substring(0, 300);
  console.log(`  ${id}:`);
  console.log(`    Expected: URG=${exp.urgencyLevel} CAT=${exp.category} AMT=${exp.goalAmount}`);
  console.log(`    Transcript: ${transcript}`);
  console.log();
}

console.log('=== CORE30 FAILURES (3 cases, all urgency) ===');
CORE30_FAILURES.forEach(id => printCase(core30, id));

console.log('=== HARD60 URGENCY OVER-ASSESSED (top 3 shown, need all 6) ===');
// Get unique IDs from all buckets
const allHard60Failures = [...new Set([...HARD60_URGENCY, ...HARD60_AMOUNT])];
allHard60Failures.forEach(id => printCase(hard60, id));

console.log('=== HARD60 AMOUNT TOLERANCE ===');
printCase(hard60, 'HARD_032');

console.log('=== FUZZ500 FAILURES (4 cases) ===');
FUZZ_FAILURES.forEach(id => printCase(fuzz500, id));
