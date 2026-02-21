/**
 * Diagnostic: Dump urgency scores for all core30 cases
 * Shows weighted score, layer scores, context-modified score, and final level
 */
import * as fs from 'fs';
import * as path from 'path';

// Import the urgency engine
import { UrgencyAssessmentEngine } from '../../src/utils/extraction/urgencyEngine';
import { extractNeeds } from '../../src/utils/extraction/rulesEngine';

const datasetPath = path.join(__dirname, '../feb-v1/datasets/core30.jsonl');
const lines = fs.readFileSync(datasetPath, 'utf-8').split('\n').filter(l => l.trim());

const engine = new UrgencyAssessmentEngine();

interface CaseData {
  id: string;
  transcriptText: string;
  expected: {
    urgencyLevel: string;
    category: string;
  };
}

console.log('='.repeat(120));
console.log('URGENCY SCORE DIAGNOSTIC — ALL CORE30 CASES');
console.log('='.repeat(120));
console.log('');

const results: any[] = [];

for (const line of lines) {
  const testCase: CaseData = JSON.parse(line);
  
  // Get category from extractNeeds (same as production path)
  const needs = extractNeeds(testCase.transcriptText, 1);
  const detectedCategory = needs[0] || 'UNKNOWN';
  
  // Assess urgency with category context
  const assessment = engine.assessUrgency(testCase.transcriptText, {
    category: detectedCategory
  });
  
  const match = assessment.urgencyLevel === testCase.expected.urgencyLevel;
  const marker = match ? '✓' : '✗';
  
  results.push({
    id: testCase.id,
    expected: testCase.expected.urgencyLevel,
    actual: assessment.urgencyLevel,
    score: assessment.score,
    match,
    layers: assessment.layerScores,
    category: detectedCategory,
    expectedCategory: testCase.expected.category,
    reasons: assessment.reasons
  });
  
  console.log(`${marker} ${testCase.id}: Expected=${testCase.expected.urgencyLevel.padEnd(8)} Got=${assessment.urgencyLevel.padEnd(8)} Score=${assessment.score.toFixed(4)} Cat=${detectedCategory.padEnd(12)} ExpCat=${testCase.expected.category.padEnd(12)}`);
  console.log(`  Layers: explicit=${assessment.layerScores.explicit.toFixed(3)} ctx=${assessment.layerScores.contextual.toFixed(3)} temporal=${assessment.layerScores.temporal.toFixed(3)} safety=${assessment.layerScores.safety.toFixed(3)} conseq=${assessment.layerScores.consequence.toFixed(3)} emo=${assessment.layerScores.emotional.toFixed(3)}`);
  
  if (!match) {
    console.log(`  Reasons: ${assessment.reasons.slice(0, 3).join(', ')}`);
  }
  console.log('');
}

// Summary
const passes = results.filter(r => r.match).length;
console.log('='.repeat(120));
console.log(`SUMMARY: ${passes}/${results.length} correct (${(passes/results.length*100).toFixed(1)}%)`);
console.log('');

// Score distribution for failures
const failures = results.filter(r => !r.match);
console.log('FAILURE SCORE DISTRIBUTION:');
console.log('-'.repeat(80));

const overAssessed = failures.filter(f => {
  const levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  return levels.indexOf(f.actual) > levels.indexOf(f.expected);
});
const underAssessed = failures.filter(f => {
  const levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  return levels.indexOf(f.actual) < levels.indexOf(f.expected);
});

console.log(`\nOVER-ASSESSED (${overAssessed.length} cases):`);
for (const f of overAssessed.sort((a, b) => b.score - a.score)) {
  console.log(`  ${f.id}: score=${f.score.toFixed(4)} ${f.expected}→${f.actual}  cat=${f.category}  explicit=${f.layers.explicit.toFixed(3)} ctx=${f.layers.contextual.toFixed(3)} temporal=${f.layers.temporal.toFixed(3)} safety=${f.layers.safety.toFixed(3)}`);
}

console.log(`\nUNDER-ASSESSED (${underAssessed.length} cases):`);
for (const f of underAssessed.sort((a, b) => a.score - b.score)) {
  console.log(`  ${f.id}: score=${f.score.toFixed(4)} ${f.expected}→${f.actual}  cat=${f.category}  explicit=${f.layers.explicit.toFixed(3)} ctx=${f.layers.contextual.toFixed(3)} temporal=${f.layers.temporal.toFixed(3)} safety=${f.layers.safety.toFixed(3)}`);
}

// Threshold analysis
console.log('\n\nTHRESHOLD ANALYSIS:');
console.log('-'.repeat(80));
const allScores = results.map(r => ({ id: r.id, score: r.score, expected: r.expected, actual: r.actual }));
allScores.sort((a, b) => a.score - b.score);

for (const s of allScores) {
  const mark = s.expected === s.actual ? '  ✓' : '  ✗';
  console.log(`${mark} ${s.id}: score=${s.score.toFixed(4)} exp=${s.expected.padEnd(8)} got=${s.actual.padEnd(8)}`);
}
