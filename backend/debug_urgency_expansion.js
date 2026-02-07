// Broader urgency under-assessment pattern analysis for 70% performance goal
const JanV3AnalyticsEvaluator = require('./eval/jan-v3-analytics-runner.js');

// Expanded test cases likely to have urgency under-assessment from various scenarios
const urgencyTestCases = [
  // Employment Crisis Scenarios
  {
    id: "EMPLOYMENT_1",
    text: "I lost my job two weeks ago and my rent is due tomorrow. I need $1,200 or I'll be homeless.",
    expected: "CRITICAL", // Tomorrow deadline
    category: "HOUSING"
  },
  {
    id: "EMPLOYMENT_2", 
    text: "Been unemployed for 3 months, car repossessed, need $800 for transportation to job interviews.",
    expected: "HIGH", // No transport = no job = ongoing crisis
    category: "TRANSPORTATION"
  },
  
  // Family Emergency Scenarios
  {
    id: "FAMILY_1",
    text: "My child hasn't eaten in two days. I need $200 for groceries immediately.",
    expected: "CRITICAL", // Child hunger = critical
    category: "FOOD"
  },
  {
    id: "FAMILY_2",
    text: "CPS is threatening to take my kids because of housing conditions. Need $1,500 for repairs by Friday.",
    expected: "CRITICAL", // Child custody threat
    category: "HOUSING"
  },
  
  // Medical Crisis Beyond Our Current Patterns
  {
    id: "MEDICAL_1",
    text: "I'm diabetic and out of insulin. The pharmacy wants $300 and I have nothing.",
    expected: "CRITICAL", // Life-threatening medication
    category: "HEALTHCARE"
  },
  {
    id: "MEDICAL_2",
    text: "My wife is pregnant and we can't afford prenatal care. Need $600 for doctor visits.",
    expected: "HIGH", // Pregnancy care = high priority
    category: "HEALTHCARE"
  },
  
  // Utility/Basic Needs
  {
    id: "UTILITY_2",
    text: "Heat got shut off and it's freezing. My baby is getting sick. Need $450 to restore service.",
    expected: "CRITICAL", // Baby health at risk
    category: "UTILITIES"
  },
  {
    id: "UTILITY_3",
    text: "Water will be disconnected in 3 days. Have young children. Need $280.",
    expected: "HIGH", // Children need water
    category: "UTILITIES"
  },
  
  // Transportation Emergencies
  {
    id: "TRANSPORT_1",
    text: "Car broke down and I work night shift at hospital. Miss work = fired. Need $900 for repairs.",
    expected: "HIGH", // Job security threat
    category: "TRANSPORTATION"
  },
  
  // Legal/Safety Scenarios
  {
    id: "LEGAL_1",
    text: "My ex is violating restraining order. Need $1,000 for lawyer to keep my kids safe.",
    expected: "CRITICAL", // Child safety
    category: "LEGAL"
  },
  
  // Graduation/Time-sensitive Educational
  {
    id: "EDUCATION_1",
    text: "Need $500 for final exam fees or I can't graduate next week after 4 years of study.",
    expected: "HIGH", // Imminent deadline, major consequence
    category: "EDUCATION"
  }
];

async function analyzeUrgencyPatterns() {
  const evaluator = new JanV3AnalyticsEvaluator();
  
  console.log('=== URGENCY UNDER-ASSESSMENT PATTERN ANALYSIS ===');
  console.log(`Goal: Identify patterns to help reach 70% performance (need 87 more cases)`);
  console.log(`Current primary target: urgency_under_assessed (106 cases)\n`);
  
  let underAssessedCount = 0;
  const patternAnalysis = {
    keywords: {
      'tomorrow': 0,
      'today': 0,
      'immediately': 0,
      'critical': 0,
      'emergency': 0,
      'urgent': 0,
      'days': 0,
      'weeks': 0,
      'diabetic': 0,
      'insulin': 0,
      'pregnant': 0,
      'baby': 0,
      'children': 0,
      'kids': 0,
      'fired': 0,
      'job': 0,
      'homeless': 0,
      'evicted': 0,
      'hungry': 0,
      'food': 0,
      'freezing': 0,
      'heat': 0,
      'water': 0,
      'safety': 0,
      'violence': 0,
      'custody': 0,
      'cps': 0,
      'restraining': 0
    },
    timeframes: {
      'immediate': 0, // today, now, immediately 
      'critical_days': 0, // tomorrow, 1-2 days
      'urgent_week': 0, // within week
      'high_weeks': 0 // 2-4 weeks
    }
  };
  
  for (const testCase of urgencyTestCases) {
    console.log(`--- ${testCase.id} ---`);
    console.log(`Input: ${testCase.text}`);
    console.log(`Expected urgency: ${testCase.expected}`);
    console.log(`Expected category: ${testCase.category}\n`);
    
    try {
      const result = await evaluator.simulateEnhancedParsing({
        transcriptText: testCase.text,
        id: testCase.id
      });
      
      console.log('=== ACTUAL RESULTS ===');
      console.log(`Name: ${result.results.name}`);
      console.log(`Category: ${result.results.category}`);
      console.log(`Urgency: ${result.results.urgencyLevel}`);
      console.log(`Amount: ${result.results.goalAmount}\n`);
      
      // Check for urgency mismatch
      const urgencyLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const actualLevel = urgencyLevels.indexOf(result.results.urgencyLevel);
      const expectedLevel = urgencyLevels.indexOf(testCase.expected);
      
      if (actualLevel < expectedLevel) {
        underAssessedCount++;
        console.log(`❌ URGENCY UNDER-ASSESSED: Got ${result.results.urgencyLevel}, expected ${testCase.expected}`);
        
        // Analyze patterns in under-assessed cases
        const lower = testCase.text.toLowerCase();
        
        // Count keywords
        Object.keys(patternAnalysis.keywords).forEach(keyword => {
          if (lower.includes(keyword)) {
            patternAnalysis.keywords[keyword]++;
          }
        });
        
        // Count timeframes
        if (/\b(now|today|immediately|right away)\b/i.test(lower)) {
          patternAnalysis.timeframes.immediate++;
        } else if (/\b(tomorrow|by tomorrow|\d+\s*day|\d+\s*days?)\b/i.test(lower)) {
          patternAnalysis.timeframes.critical_days++;
        } else if (/\b(this week|by friday|within.*week)\b/i.test(lower)) {
          patternAnalysis.timeframes.urgent_week++;
        } else if (/\b(\d+.*weeks?|next month)\b/i.test(lower)) {
          patternAnalysis.timeframes.high_weeks++;
        }
        
      } else if (actualLevel === expectedLevel) {
        console.log(`✅ Urgency matches expected`);
      } else {
        console.log(`⚠️ URGENCY OVER-ASSESSED: Got ${result.results.urgencyLevel}, expected ${testCase.expected}`);
      }
      
    } catch (error) {
      console.log(`❌ Error processing ${testCase.id}: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
  
  // Summary analysis
  console.log('=== PATTERN ANALYSIS SUMMARY ===');
  console.log(`Under-assessed cases: ${underAssessedCount}/${urgencyTestCases.length}`);
  console.log('\n--- KEYWORD FREQUENCY IN UNDER-ASSESSED CASES ---');
  Object.entries(patternAnalysis.keywords)
    .filter(([keyword, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .forEach(([keyword, count]) => {
      console.log(`${keyword}: ${count} cases`);
    });
    
  console.log('\n--- TIMEFRAME PATTERNS ---');
  Object.entries(patternAnalysis.timeframes).forEach(([timeframe, count]) => {
    console.log(`${timeframe}: ${count} cases`);
  });
  
  console.log('\n=== RECOMMENDED HIGH-IMPACT PATTERNS ===');
  console.log('Based on analysis, consider adding these urgency patterns:');
  console.log('1. Child welfare: baby, children, kids + health/safety/hunger contexts');
  console.log('2. Life-critical medication: diabetic, insulin, medication + out of/need');  
  console.log('3. Employment security: job + fired/lose + immediate consequence');
  console.log('4. Basic survival: heat/water + shut off + freezing/sick + children');
  console.log('5. Legal protection: custody, CPS, restraining order, violence + deadline');
}

analyzeUrgencyPatterns().catch(console.error);