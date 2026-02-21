/**
 * Pattern Frequency Analysis Tool
 * Analyzes how often V1d_3.3 pattern keywords appear in the dataset
 */

const fs = require('fs');
const path = require('path');

// Load all test suites (JSONL format)
const datasetsDir = path.join(__dirname, '../backend/eval/v4plus/datasets');

function loadJSONL(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.trim().split('\n').map(line => JSON.parse(line));
}

const core30 = loadJSONL(path.join(datasetsDir, 'core30.jsonl'));
const hard60 = loadJSONL(path.join(datasetsDir, 'hard60.jsonl'));
const fuzz500 = loadJSONL(path.join(datasetsDir, 'fuzz500.jsonl'));

const allCases = [...core30, ...hard60, ...fuzz500];

console.log(`Analyzing ${allCases.length} test cases...\n`);

// Pattern keyword groups
const patternGroups = {
  'CRITICAL - Medical Procedure': {
    procedureTerms: ['surgery', 'operation', 'procedure'],
    temporalTerms: ['need', 'scheduled', 'upcoming', 'soon', 'tomorrow', 'next week', 'this month'],
    directPhrases: ['need surgery', 'needs surgery', 'require surgery', 'scheduled for surgery', 
                    'scheduled operation', 'upcoming surgery', 'upcoming operation']
  },
  'CRITICAL - Housing Loss': {
    immediateEvictionPhrases: ['eviction notice', 'notice to vacate', 'being evicted', 
                                'losing home', 'lose home', 'lost home', 'facing eviction', 
                                'homeless', 'evicted'],
    temporalUrgency: ['tomorrow', 'this week', 'next week', 'days', 'soon', 'immediately'],
    housingTerms: ['rent', 'apartment', 'home', 'housing'],
    lossTerms: ['lose', 'lost', 'losing', 'evict']
  },
  'CRITICAL - Life Threatening': {
    lifeThreatPhrases: ['life-threatening', 'life threatening', 'dying', 'critical condition', 
                        'terminal', 'fatal', 'urgent medical', 'emergency surgery', 
                        'heart attack', 'stroke', 'cancer treatment']
  },
  'HIGH - Job Loss + Dependents': {
    jobLossTerms: ['lost job', 'lost my job', 'laid off', 'unemployed', 'fired', 'job loss'],
    dependentTerms: ['child', 'children', 'kids', 'family', 'son', 'daughter', 'dependents']
  },
  'HIGH - Impending Eviction': {
    evictionTerms: ['evict', 'behind on rent', 'late rent', 'rent overdue', 'facing eviction'],
    urgencyTerms: ['soon', 'next month', 'weeks', 'urgent']
  },
  'HIGH - Medical Expense': {
    cantAffordPhrases: ["can't afford", 'cannot afford', 'unable to pay', "can't pay"],
    medicalTerms: ['medical', 'treatment', 'medicine', 'prescription', 'doctor', 'hospital']
  },
  'MEDIUM - Essential Vehicle': {
    vehicleTerms: ['car', 'vehicle', 'truck', 'transportation'],
    problemTerms: ['broke', 'broken', 'repair', 'fix', 'broke down'],
    workTerms: ['work', 'job', 'commute', 'get to work']
  },
  'MEDIUM - General Improvement': {
    improvementPhrases: ['would like to', 'want to', 'hope to', 'trying to', 
                         'working towards', 'goal is to', 'improve my', 'better myself', 'get ahead'],
    urgentTerms: ['urgent', 'immediately', 'asap', 'emergency', 'crisis', 'desperate']
  },
  'MEDIUM - Debt Consolidation': {
    consolidationTerms: ['consolidate', 'consolidation', 'refinance', 'pay off debt'],
    crisisTerms: ["can't pay", 'collections', 'default', 'bankruptcy', 'foreclosure']
  }
};

// Analyze each pattern group
const results = {};

for (const [groupName, keywords] of Object.entries(patternGroups)) {
  results[groupName] = {};
  
  for (const [keywordType, terms] of Object.entries(keywords)) {
    const termCounts = {};
    
    terms.forEach(term => {
      let count = 0;
      const casesWithTerm = [];
      
      allCases.forEach(testCase => {
        const story = (testCase.story || testCase.transcriptText || '').toLowerCase();
        if (story.includes(term)) {
          count++;
          if (casesWithTerm.length < 3) { // Keep examples
            casesWithTerm.push(testCase.id || testCase.name || 'Unknown');
          }
        }
      });
      
      if (count > 0) {
        termCounts[term] = { count, examples: casesWithTerm };
      }
    });
    
    results[groupName][keywordType] = termCounts;
  }
}

// Print results
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║           V1d_3.3 Pattern Frequency Analysis                   ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

for (const [groupName, keywordGroups] of Object.entries(results)) {
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`${groupName}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  for (const [keywordType, terms] of Object.entries(keywordGroups)) {
    const sortedTerms = Object.entries(terms).sort((a, b) => b[1].count - a[1].count);
    
    if (sortedTerms.length > 0) {
      console.log(`\n  ${keywordType}:`);
      sortedTerms.forEach(([term, data]) => {
        const percentage = ((data.count / allCases.length) * 100).toFixed(1);
        console.log(`    "${term}": ${data.count} (${percentage}%) - ${data.examples.join(', ')}`);
      });
    } else {
      console.log(`\n  ${keywordType}: NO MATCHES`);
    }
  }
  console.log('');
}

// Pattern combination analysis
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Pattern Combination Analysis`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

// Medical procedure combination
let medicalProcedureMatches = 0;
const medicalCases = [];
allCases.forEach(testCase => {
  const story = (testCase.story || testCase.transcriptText || '').toLowerCase();
  const hasProcedure = ['surgery', 'operation', 'procedure'].some(term => story.includes(term));
  const hasTemporal = ['need', 'scheduled', 'upcoming', 'soon', 'tomorrow', 'next week', 'this month'].some(term => story.includes(term));
  
  if (hasProcedure && hasTemporal) {
    medicalProcedureMatches++;
    if (medicalCases.length < 5) {
      medicalCases.push(testCase.id || testCase.name || 'Unknown');
    }
  }
});

console.log(`\nMedical Procedure + Temporal: ${medicalProcedureMatches} matches`);
if (medicalCases.length > 0) {
  console.log(`  Examples: ${medicalCases.join(', ')}`);
}

// Job loss + dependents
let jobLossDependentsMatches = 0;
const jobCases = [];
allCases.forEach(testCase => {
  const story = (testCase.story || testCase.transcriptText || '').toLowerCase();
  const hasJobLoss = ['lost job', 'lost my job', 'laid off', 'unemployed', 'fired', 'job loss'].some(term => story.includes(term));
  const hasDependents = ['child', 'children', 'kids', 'family', 'son', 'daughter', 'dependents'].some(term => story.includes(term));
  
  if (hasJobLoss && hasDependents) {
    jobLossDependentsMatches++;
    if (jobCases.length < 5) {
      jobCases.push(testCase.id || testCase.name || 'Unknown');
    }
  }
});

console.log(`\nJob Loss + Dependents: ${jobLossDependentsMatches} matches`);
if (jobCases.length > 0) {
  console.log(`  Examples: ${jobCases.join(', ')}`);
}

// Vehicle + work
let vehicleWorkMatches = 0;
const vehicleCases = [];
allCases.forEach(testCase => {
  const story = (testCase.story || testCase.transcriptText || '').toLowerCase();
  const hasVehicle = ['car', 'vehicle', 'truck', 'transportation'].some(term => story.includes(term));
  const hasProblem = ['broke', 'broken', 'repair', 'fix', 'broke down'].some(term => story.includes(term));
  const hasWork = ['work', 'job', 'commute', 'get to work'].some(term => story.includes(term));
  
  if (hasVehicle && hasProblem && hasWork) {
    vehicleWorkMatches++;
    if (vehicleCases.length < 5) {
      vehicleCases.push(testCase.id || testCase.name || 'Unknown');
    }
  }
});

console.log(`\nVehicle + Problem + Work: ${vehicleWorkMatches} matches`);
if (vehicleCases.length > 0) {
  console.log(`  Examples: ${vehicleCases.join(', ')}`);
}

console.log('\n');
