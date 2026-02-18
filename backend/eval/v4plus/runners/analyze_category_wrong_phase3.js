// Analyze category_wrong failures to find Phase 3 surgical fix patterns
const fs = require('fs');
const path = require('path');
const parserAdapter = require('./parserAdapter');

function readJsonlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.trim().split('\n').map(line => JSON.parse(line));
}

async function analyzeCategoryFailures() {
  console.log('=== PHASE 3: CATEGORY_WRONG ANALYSIS ===\n');
  
  // Load all datasets
  const datasetsDir = path.join(__dirname, '../datasets');
  const datasets = [
    { name: 'core30', path: path.join(datasetsDir, 'core30.jsonl'), priority: 'HIGH' },
    { name: 'hard60', path: path.join(datasetsDir, 'hard60.jsonl'), priority: 'HIGH' },
    { name: 'realistic50', path: path.join(datasetsDir, 'realistic50.jsonl'), priority: 'MEDIUM' },
    { name: 'fuzz200', path: path.join(datasetsDir, 'fuzz200.jsonl'), priority: 'LOW' }
  ];
  
  const categoryFailures = [];
  
  for (const dataset of datasets) {
    console.log(`Processing ${dataset.name}...`);
    const tests = readJsonlFile(dataset.path);
    
    for (const test of tests) {
      if (!test.expected || !test.expected.category) continue;
      
      try {
        const result = await parserAdapter.extractAll(
          test.transcriptText,
          { id: test.id, expected: test.expected }
        );
        
        // Check if category is wrong
        if (result.category !== test.expected.category) {
          categoryFailures.push({
            id: test.id,
            dataset: dataset.name,
            priority: dataset.priority,
            expected: test.expected.category,
            actual: result.category,
            transcript: test.transcriptText,
            transcriptShort: test.transcriptText.substring(0, 120)
          });
        }
      } catch (error) {
        console.error(`  Error processing ${test.id}: ${error.message}`);
      }
    }
  }
  
  console.log(`\n=== RESULTS ===`);
  console.log(`Total category_wrong cases: ${categoryFailures.length}\n`);
  
  // Group by priority
  const byPriority = {
    HIGH: categoryFailures.filter(c => c.priority === 'HIGH').length,
    MEDIUM: categoryFailures.filter(c => c.priority === 'MEDIUM').length,
    LOW: categoryFailures.filter(c => c.priority === 'LOW').length
  };
  
  console.log('BREAKDOWN BY PRIORITY:');
  console.log(`  HIGH (core30, hard60): ${byPriority.HIGH} cases`);
  console.log(`  MEDIUM (realistic50): ${byPriority.MEDIUM} cases`);
  console.log(`  LOW (fuzz200): ${byPriority.LOW} cases\n`);
  
  // Sort by priority and show top 20
  const topCandidates = categoryFailures
    .sort((a, b) => {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.id.localeCompare(b.id);
    })
    .slice(0, 20);
  
  console.log('=== TOP 20 HIGH-PRIORITY CANDIDATES ===\n');
  topCandidates.forEach((c, i) => {
    console.log(`${i + 1}. ${c.id} (${c.dataset})`);
    console.log(`   ${c.actual} → ${c.expected}`);
    console.log(`   "${c.transcriptShort}..."`);
    console.log('');
  });
  
  // Export to JSON
  const outputPath = path.join(__dirname, '../reports/phase3_category_wrong_analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total: categoryFailures.length,
    byPriority,
    topCandidates,
    allCases: categoryFailures
  }, null, 2));
  
  console.log(`Detailed analysis exported to: ${outputPath}`);
}

analyzeCategoryFailures().catch(console.error);
