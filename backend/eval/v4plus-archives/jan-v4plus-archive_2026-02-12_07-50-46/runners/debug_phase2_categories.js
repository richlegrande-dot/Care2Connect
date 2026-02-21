// Debug script to check why Phase 2 boosts aren't firing
const parserAdapter = require('./parserAdapter');

const testCases = [
  { id: 'HARD_006', expected: 'HOUSING', transcript: "Hi, Sarah Johnson here. My mortgage is $1,650 monthly, I'm 4 months behind so that's $6,600, plus $800 in late fees. Need help with the full $7,400 to avoid foreclosure." },
  { id: 'HARD_009', expected: 'UTILITIES', transcript: "My name is Carlos Rivera. I'm 28, have $12,000 in student loans, $3,500 in credit card debt, and need $600 to pay my electric bill before they shut off my power tomorrow." },
  { id: 'HARD_012', expected: 'HOUSING', transcript: "My name is Patricia Moore. I'm behind $1,200 on rent, $350 on utilities, $180 on internet, but the eviction notice says I need $1,550 by Friday to stay." },
  { id: 'T009', expected: 'EDUCATION', transcript: "Hi, this is Ashley Williams calling about my son Kevin. Kevin is eighteen and needs help with college expenses. We live in Portland Oregon and need about four thousand dollars for tuition." },
];

async function checkCategories() {
  console.log('=== PHASE 2 BOOST DEBUG ===\n');
  
  for (const test of testCases) {
    try {
      const result = await parserAdapter.extractAll(
        test.transcript,
        { id: test.id }
      );
      
      console.log(`Test: ${test.id}`);
      console.log(`  Expected Category: ${test.expected}`);
      console.log(`  Actual Category: ${result.category} ${result.category === test.expected ? '✅' : '❌'}`);
      console.log(`  Urgency: ${result.urgencyLevel}`);
      console.log('');
    } catch (error) {
      console.error(`Error on ${test.id}: ${error.message}`);
    }
  }
}

checkCategories().catch(console.error);
