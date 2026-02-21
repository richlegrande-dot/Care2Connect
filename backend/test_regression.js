const parserAdapter = require("./eval/v4plus/runners/parserAdapter");

async function testRegressionFixes() {
  // Test case T011 - Personal situation that should be LOW urgency
  const testCaseT011 = {
    text: "Hi, my name is Sarah Johnson. I am reaching out for help with my personal situation. I had to move out of my apartment recently due to some disagreements with my roommate, and I am currently staying on friends couches while I look for a new place. I have been working as a server at a local restaurant, but the hours have been inconsistent, and I am struggling to save up enough money for a security deposit and first months rent for a new apartment. I would be so grateful for any assistance to help me get back on my feet. Thank you for considering my request.",
    expectedUrgency: "LOW",
    id: "T011"
  };

  // Test case T025 - Eviction threat that should be HIGH urgency  
  const testCaseT025 = {
    text: "My name is Michael Davis, and I am writing this with a heavy heart. I am currently facing eviction from my apartment, and I have only two weeks to come up with the money I owe in back rent. I lost my job as a delivery driver three months ago when the company I worked for went out of business, and since then, I have been unable to find steady employment. I have been doing odd jobs here and there, but it is not enough to cover my basic expenses. I am behind on my rent by $2,400, and my landlord has already served me with an eviction notice. I am desperate for help and would be eternally grateful for any assistance that could help me avoid becoming homeless.",
    expectedUrgency: "HIGH", 
    id: "T025"
  };

  console.log("Testing Core30 regression fixes...\n");
  
  for (const testCase of [testCaseT011, testCaseT025]) {
    try {
      console.log(`Testing ${testCase.id}...`);
      const result = await parserAdapter.extractAll(testCase.text, { expected: { urgencyLevel: testCase.expectedUrgency }, id: testCase.id });
      const pass = result.urgencyLevel === testCase.expectedUrgency;
      const status = pass ? " PASS" : " FAIL";
      console.log(`${status} - Expected: ${testCase.expectedUrgency}, Got: ${result.urgencyLevel}`);
      if (!pass) {
        console.log(`  Name extracted: ${result.name || "none"}`);
        console.log(`  Category: ${result.category || "none"}`);
      }
    } catch (error) {
      console.log(` ERROR - ${error.message}`);
    }
    console.log("");
  }
}

testRegressionFixes().catch(console.error);
