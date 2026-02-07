#!/usr/bin/env node
const { JanV3AnalyticsEvaluator } = require('./eval/jan-v3-analytics-runner.js');

async function debugSpecificCases() {
  console.log("🔍 Debugging specific urgency_under_assessed cases from our analysis...\n");
  
  // Cases that should be CRITICAL but are likely under-assessed
  const testCases = [
    // Life-critical medication (diabetic insulin)
    {
      id: "DIABETIC_TEST",
      text: "Hi, I'm Sarah. My husband is diabetic and we're out of insulin. Need $200 for medication urgently before he goes into shock.",
      expectedUrgency: "CRITICAL"
    },
    
    // Child welfare - baby health emergency
    {
      id: "BABY_SICK_TEST", 
      text: "This is Maria. My baby is getting sick and we have no heat. The heat got shut off and it's freezing. Need $300 to turn it back on.",
      expectedUrgency: "CRITICAL"
    },
    
    // CPS threat
    {
      id: "CPS_THREAT_TEST",
      text: "Help! CPS is threatening to take my kids because of unpaid rent. They said if I don't pay by tomorrow they'll remove the children. Need $1500.",
      expectedUrgency: "CRITICAL"  
    },
    
    // Job loss with immediate consequence
    {
      id: "JOB_LOSS_DEADLINE_TEST",
      text: "I lost my job and rent is due tomorrow. If I don't pay they'll evict me immediately. Need $1200.",
      expectedUrgency: "CRITICAL"
    },
    
    // Restraining order violation risk
    {
      id: "RESTRAINING_ORDER_TEST",
      text: "My ex keeps violating the restraining order. I need money to move to a safe place immediately. Need $800 for security deposit.",
      expectedUrgency: "CRITICAL"
    },
    
    // Pregnancy care scenarios (should be HIGH)
    {
      id: "PREGNANCY_CARE_TEST",
      text: "I'm pregnant and can't afford prenatal care. My doctor says the baby is at risk. Need $400 for medical visits.",
      expectedUrgency: "HIGH"
    },
    
    // Water disconnection with children (should be HIGH)
    {
      id: "WATER_CHILDREN_TEST", 
      text: "Water got disconnected 3 days ago. I have young children and they need clean water. Need $250 to reconnect.",
      expectedUrgency: "HIGH"
    },
    
    // Employment security (should be HIGH)
    {
      id: "EMPLOYMENT_SECURITY_TEST",
      text: "If I miss work tomorrow I'll get fired. My car broke down and I need $500 for repairs to keep my job.",
      expectedUrgency: "HIGH"
    }
  ];
  
  const evaluator = new JanV3AnalyticsEvaluator();
  
  let correctCount = 0;
  let totalCount = testCases.length;
  
  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.id} ---`);
    console.log(`Text: ${testCase.text}`);
    console.log(`Expected Urgency: ${testCase.expectedUrgency}`);
    
    const result = await evaluator.processTranscription(testCase.text);
    const actualUrgency = result.analysis.urgency;
    
    console.log(`Actual Urgency: ${actualUrgency}`);
    
    if (actualUrgency === testCase.expectedUrgency) {
      console.log("✅ CORRECT");
      correctCount++;
    } else {
      console.log("❌ INCORRECT - Pattern not matching!");
      
      // Debug the urgency assessment logic
      const lowerText = testCase.text.toLowerCase();
      console.log(`Debug checks:`);
      console.log(`  - Contains 'diabetic': ${/diabetic/i.test(lowerText)}`);
      console.log(`  - Contains 'insulin': ${/insulin/i.test(lowerText)}`);  
      console.log(`  - Contains 'baby.*sick': ${/baby.*sick/i.test(lowerText)}`);
      console.log(`  - Contains 'cps.*threatening': ${/cps.*threatening/i.test(lowerText)}`);
      console.log(`  - Contains 'lost.*job.*tomorrow': ${/lost.*job.*tomorrow/i.test(lowerText)}`);
      console.log(`  - Contains 'restraining.*order': ${/restraining.*order/i.test(lowerText)}`);
      console.log(`  - Contains 'pregnant.*prenatal': ${/pregnant.*prenatal/i.test(lowerText)}`);
      console.log(`  - Contains 'water.*disconnected.*children': ${/water.*disconnected.*children/i.test(lowerText)}`);
      console.log(`  - Contains 'miss.*work.*fired': ${/miss.*work.*fired/i.test(lowerText)}`);
    }
  }
  
  console.log(`\n📊 Results: ${correctCount}/${totalCount} correct (${(correctCount/totalCount*100).toFixed(1)}%)`);
  
  if (correctCount < totalCount) {
    console.log("\n⚠️  Pattern implementation issues detected!");
    console.log("Need to review and fix urgency assessment patterns.");
  } else {
    console.log("\n✅ All patterns working correctly!");
  }
}

debugSpecificCases().catch(console.error);