#!/usr/bin/env node
/**
 * Failure Pattern Analyzer for Jan v4.0+
 * 
 * Analyzes failure patterns across test runs to identify:
 * - Common failure types
 * - Specific parser weaknesses
 * - Suggested improvements
 * - Code locations to fix
 * 
 * Features:
 * - Pattern clustering (group similar failures)
 * - Root cause analysis
 * - Fix priority ranking
 * - Code change suggestions
 * 
 * Usage:
 *   node failure_analyzer.js --report ./reports/latest.json
 *   node failure_analyzer.js --reports ./reports/*.json  # Analyze multiple runs
 *   npm run eval:v4plus:analyze-failures
 */

const fs = require('fs');
const path = require('path');

// Failure pattern definitions with fix suggestions
const FAILURE_PATTERNS = {
  name_extraction: {
    keywords: ['name_missing', 'name_fragment', 'name_malformed'],
    rootCause: 'Name extraction logic incomplete or fragile',
    suggestedFixes: [
      'Strengthen name pattern matching in extractName()',
      'Add blacklist for common non-name phrases',
      'Improve handling of titles (Mr., Dr., etc.)',
      'Add support for hyphenated/apostrophe names'
    ],
    targetFile: 'jan-v3-analytics-runner.js',
    targetFunctions: ['extractName', 'cleanName'],
    priority: 'HIGH'
  },
  
  category_conflicts: {
    keywords: ['category_wrong', 'category_conflict', 'multi_category'],
    rootCause: 'Category priority rules insufficient',
    suggestedFixes: [
      'Enforce SAFETY > HEALTHCARE > HOUSING > UTILITIES priority',
      'Add keyword strength scoring (not just presence)',
      'Handle multi-category scenarios explicitly',
      'Add context-aware category selection'
    ],
    targetFile: 'jan-v3-analytics-runner.js',
    targetFunctions: ['categorizeRequest', 'detectCategory'],
    priority: 'HIGH'
  },
  
  urgency_signals: {
    keywords: ['urgency_wrong', 'urgency_conflict', 'urgency_missing'],
    rootCause: 'Urgency evaluation order or keyword detection weak',
    suggestedFixes: [
      'Refine evaluation order: LOW → CRITICAL → HIGH → MEDIUM',
      'Add negative urgency signals (e.g., "not urgent")',
      'Strengthen emergency detection (threatens, violence, etc.)',
      'Add time-based urgency inference'
    ],
    targetFile: 'jan-v3-analytics-runner.js',
    targetFunctions: ['evaluateUrgency', 'detectUrgencyLevel'],
    priority: 'MEDIUM'
  },
  
  amount_selection: {
    keywords: ['amount_wrong', 'amount_max_strategy', 'amount_irrelevant'],
    rootCause: 'Amount selection strategy too simplistic',
    suggestedFixes: [
      'Add context-aware amount selection (not always max)',
      'Filter out ages, wages, non-monetary numbers',
      'Improve currency detection and normalization',
      'Add amount validation against category norms'
    ],
    targetFile: 'jan-v3-analytics-runner.js',
    targetFunctions: ['extractAmount', 'selectRelevantAmount'],
    priority: 'MEDIUM'
  },
  
  noise_handling: {
    keywords: ['fragmented_speech', 'filler_words', 'punctuation'],
    rootCause: 'Insufficient text preprocessing/normalization',
    suggestedFixes: [
      'Add aggressive filler word removal',
      'Normalize punctuation before parsing',
      'Handle ellipses and dashes gracefully',
      'Add sentence reconstruction logic'
    ],
    targetFile: 'jan-v3-analytics-runner.js',
    targetFunctions: ['preprocessText', 'normalizeInput'],
    priority: 'LOW'
  },
  
  adversarial_resilience: {
    keywords: ['adversarial', 'injection', 'malformed'],
    rootCause: 'Lacks adversarial input defenses',
    suggestedFixes: [
      'Add input sanitization (strip <script>, SQL, etc.)',
      'Validate input format before parsing',
      'Add length limits and character filtering',
      'Implement safe fallback for malformed input'
    ],
    targetFile: 'jan-v3-analytics-runner.js',
    targetFunctions: ['sanitizeInput', 'validateInput'],
    priority: 'HIGH'
  }
};

// Analyze single report
function analyzeReport(reportPath) {
  const content = fs.readFileSync(reportPath, 'utf8');
  const report = JSON.parse(content);

  const analysis = {
    reportPath,
    timestamp: report.timestamp,
    totalCases: report.summary.totalCases,
    failureCount: report.summary.totalCases - report.summary.strictPassed,
    failureBuckets: report.failureBuckets || [],
    patterns: {}
  };

  // Match failure buckets to patterns
  report.failureBuckets?.forEach(bucket => {
    for (const [patternName, pattern] of Object.entries(FAILURE_PATTERNS)) {
      const matches = pattern.keywords.some(keyword => 
        bucket.type.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (matches) {
        if (!analysis.patterns[patternName]) {
          analysis.patterns[patternName] = {
            ...pattern,
            matchedBuckets: [],
            totalFailures: 0
          };
        }
        
        analysis.patterns[patternName].matchedBuckets.push({
          type: bucket.type,
          count: bucket.count,
          percentage: bucket.percentage
        });
        analysis.patterns[patternName].totalFailures += bucket.count;
      }
    }
  });

  return analysis;
}

// Analyze multiple reports
function analyzeMultipleReports(reportPaths) {
  console.log(`\n📊 Analyzing ${reportPaths.length} report(s)...\n`);

  const analyses = reportPaths.map(path => analyzeReport(path));
  
  // Aggregate patterns across reports
  const aggregated = {};
  
  analyses.forEach(analysis => {
    Object.entries(analysis.patterns).forEach(([patternName, patternData]) => {
      if (!aggregated[patternName]) {
        aggregated[patternName] = {
          ...FAILURE_PATTERNS[patternName],
          occurrences: 0,
          totalFailures: 0,
          reports: []
        };
      }
      
      aggregated[patternName].occurrences++;
      aggregated[patternName].totalFailures += patternData.totalFailures;
      aggregated[patternName].reports.push({
        path: analysis.reportPath,
        failures: patternData.totalFailures,
        buckets: patternData.matchedBuckets
      });
    });
  });

  return { analyses, aggregated };
}

// Display analysis results
function displayAnalysis(results) {
  const { analyses, aggregated } = results;

  console.log(`${'='.repeat(70)}`);
  console.log(`🔍 FAILURE PATTERN ANALYSIS`);
  console.log(`${'='.repeat(70)}\n`);

  // Sort patterns by priority and failure count
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const sortedPatterns = Object.entries(aggregated).sort((a, b) => {
    const priorityDiff = priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b[1].totalFailures - a[1].totalFailures;
  });

  if (sortedPatterns.length === 0) {
    console.log(`✅ No failure patterns detected - all tests passing!\n`);
    return;
  }

  sortedPatterns.forEach(([patternName, pattern], index) => {
    const priorityIcon = pattern.priority === 'HIGH' ? '🔴' : 
                        pattern.priority === 'MEDIUM' ? '🟡' : '🟢';
    
    console.log(`${index + 1}. ${priorityIcon} ${patternName.toUpperCase()}`);
    console.log(`   Priority: ${pattern.priority}`);
    console.log(`   Total failures: ${pattern.totalFailures}`);
    console.log(`   Occurrences: ${pattern.occurrences}/${analyses.length} reports`);
    console.log(`\n   Root Cause:`);
    console.log(`   ${pattern.rootCause}`);
    console.log(`\n   Suggested Fixes:`);
    pattern.suggestedFixes.forEach((fix, i) => {
      console.log(`   ${i + 1}) ${fix}`);
    });
    console.log(`\n   Target:`);
    console.log(`   File: ${pattern.targetFile}`);
    console.log(`   Functions: ${pattern.targetFunctions.join(', ')}`);
    console.log(`\n   ${'─'.repeat(68)}\n`);
  });

  // Summary
  console.log(`${'='.repeat(70)}`);
  console.log(`📋 RECOMMENDED ACTION PLAN`);
  console.log(`${'='.repeat(70)}\n`);

  const highPriority = sortedPatterns.filter(([, p]) => p.priority === 'HIGH');
  const mediumPriority = sortedPatterns.filter(([, p]) => p.priority === 'MEDIUM');
  const lowPriority = sortedPatterns.filter(([, p]) => p.priority === 'LOW');

  if (highPriority.length > 0) {
    console.log(`🔴 HIGH PRIORITY (Fix First):`);
    highPriority.forEach(([name, pattern]) => {
      console.log(`   - ${name}: ${pattern.totalFailures} failures`);
    });
    console.log();
  }

  if (mediumPriority.length > 0) {
    console.log(`🟡 MEDIUM PRIORITY (Fix Next):`);
    mediumPriority.forEach(([name, pattern]) => {
      console.log(`   - ${name}: ${pattern.totalFailures} failures`);
    });
    console.log();
  }

  if (lowPriority.length > 0) {
    console.log(`🟢 LOW PRIORITY (Optional):`);
    lowPriority.forEach(([name, pattern]) => {
      console.log(`   - ${name}: ${pattern.totalFailures} failures`);
    });
    console.log();
  }

  console.log(`${'='.repeat(70)}\n`);
}

// Parse arguments
const args = process.argv.slice(2);
const reportArg = args.find(a => a.startsWith('--report='))?.split('=')[1] || 
                  args[args.indexOf('--report') + 1];
const reportsArg = args.find(a => a.startsWith('--reports='))?.split('=')[1] || 
                   args[args.indexOf('--reports') + 1];

if (!reportArg && !reportsArg) {
  console.error(`
❌ Missing required argument

Usage:
  node failure_analyzer.js --report <json-file>
  node failure_analyzer.js --reports <pattern>

Examples:
  node failure_analyzer.js --report ./reports/latest.json
  node failure_analyzer.js --reports "./reports/run_*.json"

Options:
  --report <path>     Analyze single report
  --reports <glob>    Analyze multiple reports (use quotes for patterns)
`);
  process.exit(1);
}

try {
  let reportPaths = [];

  if (reportArg) {
    const reportPath = path.resolve(reportArg);
    if (!fs.existsSync(reportPath)) {
      console.error(`❌ Report file not found: ${reportPath}`);
      process.exit(1);
    }
    reportPaths = [reportPath];
  } else {
    // Simple glob expansion (basic implementation)
    const baseDir = path.dirname(reportsArg);
    const pattern = path.basename(reportsArg);
    const allFiles = fs.readdirSync(baseDir);
    
    reportPaths = allFiles
      .filter(f => f.endsWith('.json') && f.match(pattern.replace('*', '.*')))
      .map(f => path.join(baseDir, f));

    if (reportPaths.length === 0) {
      console.error(`❌ No reports found matching pattern: ${reportsArg}`);
      process.exit(1);
    }
  }

  const results = analyzeMultipleReports(reportPaths);
  displayAnalysis(results);

} catch (err) {
  console.error(`\n❌ Error: ${err.message}\n`);
  if (err.stack) {
    console.error(err.stack);
  }
  process.exit(1);
}
