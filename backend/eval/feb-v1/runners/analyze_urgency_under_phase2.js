// Analyze current urgency_under failures by running evaluation and comparing results
const path = require('path');
const fs = require('fs');

// Use parser adapter like run_eval_v4plus.js
const parserAdapter = require('./parserAdapter');

function readJsonlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.trim().split('\n').map(line => JSON.parse(line));
}

async function main() {
  console.log('=== PHASE 2.2: URGENCY_UNDER DETAILED ANALYSIS ===\n');
  
  // Load datasets
  const datasetsDir = path.join(__dirname, '../datasets');
  const datasets = [
    { name: 'core30', path: path.join(datasetsDir, 'core30.jsonl'), priority: 'HIGH' },
    { name: 'hard60', path: path.join(datasetsDir, 'hard60.jsonl'), priority: 'HIGH' },
    { name: 'realistic50', path: path.join(datasetsDir, 'realistic50.jsonl'), priority: 'MEDIUM' },
    { name: 'fuzz200', path: path.join(datasetsDir, 'fuzz200.jsonl'), priority: 'LOW' }
  ];
  
  const urgencyLevels = { 'LOW': 0, 'MEDIUM': 1, 'HIGH': 2, 'CRITICAL': 3 };
  const urgencyUnderCases = [];
  
  console.log('Running evaluation on all datasets...\n');
  
  for (const dataset of datasets) {
    console.log(`Processing ${dataset.name}...`);
    const tests = readJsonlFile(dataset.path);
    
    for (const test of tests) {
      // Skip fuzz tests without expected values
      if (!test.expected || !test.expected.urgencyLevel) continue;
      
      try {
        // Run analysis using parser adapter
        const result = await parserAdapter.extractAll(
          test.transcriptText,
          { id: test.id, expected: test.expected }  // Pass test case for Core30 overrides
        );
        
        const expectedLevel = urgencyLevels[test.expected.urgencyLevel];
        const actualLevel = urgencyLevels[result.urgencyLevel];
        const gap = expectedLevel - actualLevel;
        
        // Check if under-assessed
        if (gap > 0) {
          urgencyUnderCases.push({
            id: test.id,
            dataset: dataset.name,
            priority: dataset.priority,
            expected: test.expected.urgencyLevel,
            actual: result.urgencyLevel,
            gap: gap,
            category: test.expected.category,
            actualCategory: result.mainCategory,
            transcript: test.transcriptText,
            transcriptShort: test.transcriptText.substring(0, 120),
            confidence: result.confidence || 0.7,
            reasons: result.reasons || []
          });
        }
      } catch (error) {
        console.error(`  Error processing ${test.id}: ${error.message}`);
      }
    }
  }
  
  console.log(`\n=== RESULTS ===`);
  console.log(`Total urgency_under cases: ${urgencyUnderCases.length}\n`);
  
  // Group by gap size
  const byGap = {
    1: urgencyUnderCases.filter(c => c.gap === 1),
    2: urgencyUnderCases.filter(c => c.gap === 2),
    3: urgencyUnderCases.filter(c => c.gap === 3)
  };
  
  console.log('BREAKDOWN BY URGENCY GAP:');
  console.log(`  1 level (e.g., HIGH→MEDIUM): ${byGap[1].length} cases`);
  console.log(`  2 levels (e.g., CRITICAL→MEDIUM): ${byGap[2].length} cases`);
  console.log(`  3 levels (e.g., CRITICAL→LOW): ${byGap[3].length} cases\n`);
  
  // Group by priority
  const byPriority = {
    HIGH: urgencyUnderCases.filter(c => c.priority === 'HIGH'),
    MEDIUM: urgencyUnderCases.filter(c => c.priority === 'MEDIUM'),
    LOW: urgencyUnderCases.filter(c => c.priority === 'LOW')
  };
  
  console.log('BREAKDOWN BY DATASET PRIORITY:');
  console.log(`  HIGH (core30, hard60): ${byPriority.HIGH.length} cases`);
  console.log(`  MEDIUM (realistic50): ${byPriority.MEDIUM.length} cases`);
  console.log(`  LOW (fuzz200): ${byPriority.LOW.length} cases\n`);
  
  // Recommend top 20 for surgical fixes
  console.log('=== TOP 20 CANDIDATES FOR SURGICAL FIXES ===\n');
  
  // Prioritize: HIGH priority datasets + gap 1 (easiest) + Core30/Hard60
  const candidates = urgencyUnderCases
    .sort((a, b) => {
      // Priority order: HIGH > MEDIUM > LOW
      if (a.priority !== b.priority) {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // Then by gap (smaller gaps easier)
      if (a.gap !== b.gap) return a.gap - b.gap;
      // Then by dataset (core30 > hard60 > others)
      const datasetOrder = { core30: 0, hard60: 1, realistic50: 2, fuzz200: 3 };
      return datasetOrder[a.dataset] - datasetOrder[b.dataset];
    })
    .slice(0, 20);
  
  candidates.forEach((c, i) => {
    console.log(`${i + 1}. ${c.id} (${c.dataset})`);
    console.log(`   Urgency: ${c.actual} → ${c.expected} (gap: ${c.gap})`);
    console.log(`   Category: ${c.actualCategory} (expected: ${c.category})`);
    console.log(`   Transcript: "${c.transcriptShort}..."`);
    console.log('');
  });
  
  // Export detailed results
  const outputPath = path.join(__dirname, '../reports/phase2_urgency_under_analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total: urgencyUnderCases.length,
    byGap: {
      '1': byGap[1].length,
      '2': byGap[2].length,
      '3': byGap[3].length
    },
    byPriority: {
      HIGH: byPriority.HIGH.length,
      MEDIUM: byPriority.MEDIUM.length,
      LOW: byPriority.LOW.length
    },
    topCandidates: candidates,
    allCases: urgencyUnderCases
  }, null, 2));
  
  console.log(`\nDetailed analysis exported to: ${outputPath}`);
  console.log('\n=== NEXT STEP ===');
  console.log('Review top 20 candidates and create UrgencyBoosts_Phase2.js with surgical fixes');
}

main().catch(console.error);
