/**
 * Fresh Analysis of All Failure Patterns (Post Phase 1+2)
 * Analyzes current state with all active enhancements
 */

const path = require('path');
const fs = require('fs');

// Set environment to match production
process.env.USE_V3B_ENHANCEMENTS = 'true';
process.env.USE_V2D_ENHANCEMENTS = 'true';
process.env.USE_V3C_ENHANCEMENTS = 'true';
process.env.USE_CORE30_URGENCY_OVERRIDES = 'true';
process.env.USE_PHASE2_URGENCY_BOOSTS = 'true';
process.env.USE_PHASE3_CATEGORY_FIXES = 'true';

const runEvalPath = path.join(__dirname, '..', '..', 'jan-v3-analytics-runner.js');
const parserAdapter = require(runEvalPath);

// Load all datasets
const datasetsDir = path.join(__dirname, '..', 'datasets');
const datasets = [
  { name: 'core30', path: path.join(datasetsDir, 'core30.jsonl'), priority: 'CRITICAL' },
  { name: 'hard60', path: path.join(datasetsDir, 'hard60.jsonl'), priority: 'HIGH' },
  { name: 'realistic50', path: path.join(datasetsDir, 'realistic50.jsonl'), priority: 'MEDIUM' },
  { name: 'fuzz200', path: path.join(datasetsDir, 'fuzz200.jsonl'), priority: 'LOW' }
];

function loadJSONL(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.trim().split('\n').map(line => JSON.parse(line));
}

async function analyzeFailures() {
  const categoryWrong = [];
  const urgencyOver = [];
  const urgencyUnder = [];
  
  console.log('Analyzing current failure state with Phase 1+2 active...\n');
  
  for (const dataset of datasets) {
    const tests = loadJSONL(dataset.path);
    console.log(`Processing ${dataset.name}: ${tests.length} tests...`);
    
    for (const test of tests) {
      try {
        const result = await parserAdapter.extractAll(test.transcriptText, { id: test.id });
        
        // Check category
        if (result.category !== test.expected.category) {
          categoryWrong.push({
            id: test.id,
            dataset: dataset.name,
            priority: dataset.priority,
            expected: test.expected.category,
            actual: result.category,
            urgencyExpected: test.expected.urgency,
            urgencyActual: result.urgency,
            transcript: test.transcriptText,
            transcriptShort: test.transcriptText.substring(0, 200)
          });
        }
        
        // Check urgency over
        const urgencyOrder = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        const expectedIdx = urgencyOrder.indexOf(test.expected.urgency);
        const actualIdx = urgencyOrder.indexOf(result.urgency);
        
        if (actualIdx > expectedIdx) {
          urgencyOver.push({
            id: test.id,
            dataset: dataset.name,
            priority: dataset.priority,
            expected: test.expected.urgency,
            actual: result.urgency,
            gap: actualIdx - expectedIdx,
            category: result.category,
            categoryExpected: test.expected.category,
            categoryMatch: result.category === test.expected.category,
            transcript: test.transcriptText,
            transcriptShort: test.transcriptText.substring(0, 200)
          });
        }
        
        // Check urgency under
        if (actualIdx < expectedIdx) {
          urgencyUnder.push({
            id: test.id,
            dataset: dataset.name,
            priority: dataset.priority,
            expected: test.expected.urgency,
            actual: result.urgency,
            gap: expectedIdx - actualIdx,
            category: result.category,
            transcript: test.transcriptText,
            transcriptShort: test.transcriptText.substring(0, 150)
          });
        }
      } catch (error) {
        console.error(`Error processing ${test.id}:`, error.message);
      }
    }
  }
  
  // Sort by priority
  const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
  categoryWrong.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  urgencyOver.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.gap - a.gap; // Larger gaps first
  });
  
  // Export results
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalCategoryWrong: categoryWrong.length,
      totalUrgencyOver: urgencyOver.length,
      totalUrgencyUnder: urgencyUnder.length
    },
    categoryWrong: {
      total: categoryWrong.length,
      byPriority: {
        CRITICAL: categoryWrong.filter(x => x.priority === 'CRITICAL').length,
        HIGH: categoryWrong.filter(x => x.priority === 'HIGH').length,
        MEDIUM: categoryWrong.filter(x => x.priority === 'MEDIUM').length,
        LOW: categoryWrong.filter(x => x.priority === 'LOW').length
      },
      topCases: categoryWrong.slice(0, 30)
    },
    urgencyOver: {
      total: urgencyOver.length,
      byPriority: {
        CRITICAL: urgencyOver.filter(x => x.priority === 'CRITICAL').length,
        HIGH: urgencyOver.filter(x => x.priority === 'HIGH').length,
        MEDIUM: urgencyOver.filter(x => x.priority === 'MEDIUM').length,
        LOW: urgencyOver.filter(x => x.priority === 'LOW').length
      },
      byGap: {
        gap1: urgencyOver.filter(x => x.gap === 1).length,
        gap2: urgencyOver.filter(x => x.gap === 2).length,
        gap3: urgencyOver.filter(x => x.gap === 3).length
      },
      categoryMismatchCount: urgencyOver.filter(x => !x.categoryMatch).length,
      topCases: urgencyOver.slice(0, 30)
    },
    urgencyUnder: {
      total: urgencyUnder.length,
      byPriority: {
        CRITICAL: urgencyUnder.filter(x => x.priority === 'CRITICAL').length,
        HIGH: urgencyUnder.filter(x => x.priority === 'HIGH').length,
        MEDIUM: urgencyUnder.filter(x => x.priority === 'MEDIUM').length,
        LOW: urgencyUnder.filter(x => x.priority === 'LOW').length
      },
      topCases: urgencyUnder.slice(0, 20)
    }
  };
  
  const outputPath = path.join(__dirname, '..', 'reports', 'fresh_failure_analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  
  console.log('\n=== FRESH FAILURE ANALYSIS ===');
  console.log(`\nCategory Wrong: ${categoryWrong.length} total`);
  console.log(`  HIGH: ${report.categoryWrong.byPriority.HIGH}`);
  console.log(`  MEDIUM: ${report.categoryWrong.byPriority.MEDIUM}`);
  console.log(`  LOW: ${report.categoryWrong.byPriority.LOW}`);
  
  console.log(`\nUrgency Over: ${urgencyOver.length} total`);
  console.log(`  HIGH: ${report.urgencyOver.byPriority.HIGH}`);
  console.log(`  MEDIUM: ${report.urgencyOver.byPriority.MEDIUM}`);
  console.log(`  LOW: ${report.urgencyOver.byPriority.LOW}`);
  console.log(`  1-level gaps: ${report.urgencyOver.byGap.gap1}`);
  console.log(`  2-level gaps: ${report.urgencyOver.byGap.gap2}`);
  console.log(`  With category mismatch: ${report.urgencyOver.categoryMismatchCount}`);
  
  console.log(`\nUrgency Under: ${urgencyUnder.length} total`);
  console.log(`  HIGH: ${report.urgencyUnder.byPriority.HIGH}`);
  console.log(`  MEDIUM: ${report.urgencyUnder.byPriority.MEDIUM}`);
  console.log(`  LOW: ${report.urgencyUnder.byPriority.LOW}`);
  
  console.log(`\nReport saved: ${outputPath}`);
  
  return report;
}

analyzeFailures()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Analysis failed:', error);
    process.exit(1);
  });
