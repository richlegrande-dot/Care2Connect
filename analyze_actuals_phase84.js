#!/usr/bin/env node
/**
 * Phase 8.4 — Get actual parser output for all failing cases.
 * Uses the eval runner's full pipeline (adapter + enhancements).
 */
const fs = require('fs');
const path = require('path');

// Known failing IDs
const FAILING_IDS = {
  core30: ['T004', 'T021', 'T023'],
  hard60: ['HARD_001', 'HARD_003', 'HARD_005', 'HARD_006', 'HARD_010', 'HARD_018', 'HARD_032', 'HARD_051'],
  fuzz500: ['FUZZ_211', 'FUZZ_259', 'FUZZ_279', 'FUZZ_390']
};

// Load output files
function extractActuals(filename, ids) {
  if (!fs.existsSync(filename)) {
    console.log(`File ${filename} not found`);
    return;
  }
  const content = fs.readFileSync(filename, 'utf8');
  const lines = content.split('\n');
  
  for (const id of ids) {
    // Find the result block for this case
    // Pattern: the scoring section shows expected vs actual
    const idPattern = new RegExp(`${id}[\\s\\S]{0,500}`, 'g');
    
    // Look for urgency actual value — search for Phase escalation/de-escalation logs
    const urgActual = [];
    const catActual = [];
    const amtActual = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(id)) {
        // Collect all lines mentioning this ID
        if (line.includes('Escalation') || line.includes('De-escalation') || line.includes('Override') || line.includes('Boost')) {
          urgActual.push(line.trim().substring(0, 120));
        }
        if (line.includes('CategoryFix')) {
          catActual.push(line.trim().substring(0, 120));
        }
        if (line.includes('AmountFix')) {
          amtActual.push(line.trim().substring(0, 120));
        }
      }
    }
    
    console.log(`${id}:`);
    if (urgActual.length) urgActual.forEach(l => console.log(`  URG: ${l}`));
    if (catActual.length) catActual.forEach(l => console.log(`  CAT: ${l}`));
    if (amtActual.length) amtActual.forEach(l => console.log(`  AMT: ${l}`));
    if (!urgActual.length && !catActual.length && !amtActual.length) console.log('  (no override logs)');
    console.log();
  }
}

console.log('=== CORE30 ACTUALS ===');
extractActuals('eval_core30_full.txt', FAILING_IDS.core30);

console.log('=== HARD60 ACTUALS ===');
extractActuals('eval_hard60_full.txt', FAILING_IDS.hard60);

console.log('=== FUZZ500 ACTUALS ===');
extractActuals('eval_fuzz500_full.txt', FAILING_IDS.fuzz500);
