// Diagnostic: Check what parserAdapter returns vs what dataset expects
const fs = require('fs');
const path = require('path');
const parserAdapter = require('./eval/v4plus/runners/parserAdapter');

const casesRaw = fs.readFileSync('./eval/v4plus/datasets/core30.jsonl', 'utf8').trim().split('\n');
const cases = casesRaw.map(l => JSON.parse(l));
let globalResults = {};

async function diagnose() {
  const mismatches = { category: [], urgency: [], amount: [], name: [] };
  
  for (const tc of cases) {
    const result = await parserAdapter.extractAll(tc.transcriptText, tc);
    const exp = tc.expected;
    
    if (result.category !== exp.category) {
      mismatches.category.push({ id: tc.id, got: result.category, expected: exp.category });
    }
    if (result.urgencyLevel !== exp.urgencyLevel) {
      mismatches.urgency.push({ id: tc.id, got: result.urgencyLevel, expected: exp.urgencyLevel });
    }
    if (result.name !== exp.name) {
      mismatches.name.push({ id: tc.id, got: result.name, expected: exp.name });
    }
    // Amount comparison
    const amtMatch = (result.goalAmount === exp.goalAmount) || 
      (result.goalAmount !== null && exp.goalAmount !== null && 
       Math.abs(result.goalAmount - exp.goalAmount) / exp.goalAmount <= 0.10);
    if (!amtMatch && !(result.goalAmount === null && exp.goalAmount === null)) {
      mismatches.amount.push({ id: tc.id, got: result.goalAmount, expected: exp.goalAmount });
    }
  }
  
  globalResults = mismatches;
  
  console.log('\n=== CATEGORY MISMATCHES ===');
  mismatches.category.forEach(m => console.log(`  ${m.id}: got "${m.got}" expected "${m.expected}"`));
  console.log(`  Total: ${mismatches.category.length}/30`);
  
  console.log('\n=== URGENCY MISMATCHES ===');
  mismatches.urgency.forEach(m => console.log(`  ${m.id}: got "${m.got}" expected "${m.expected}"`));
  console.log(`  Total: ${mismatches.urgency.length}/30`);
  
  console.log('\n=== AMOUNT MISMATCHES ===');
  mismatches.amount.forEach(m => console.log(`  ${m.id}: got ${m.got} expected ${m.expected}`));
  console.log(`  Total: ${mismatches.amount.length}/30`);
  
  console.log('\n=== NAME MISMATCHES ===');
  mismatches.name.forEach(m => console.log(`  ${m.id}: got "${m.got}" expected "${m.expected}"`));
  console.log(`  Total: ${mismatches.name.length}/30`);
}

diagnose().then(() => {
  fs.writeFileSync('./diagnose_results.json', JSON.stringify(globalResults, null, 2));
  console.log('Written to diagnose_results.json');
}).catch(e => console.error(e));
