const parserAdapter = require('./eval/v4plus/runners/parserAdapter');

const cases = [
  {
    id: '0000REALISTIC_5',
    expected: 'SAFETY',
    text: 'This is Rosa O\'Brien calling. My husband has been threatening me and I need to escape with my son. I\'m hiding at my sister\'s but I can\'t stay here. I need help getting $2,500 for a deposit and first month\'s rent somewhere safe.'
  },
  {
    id: '0000REALISTIC_8',
    expected: 'HEALTHCARE',
    text: 'This is Carlos Williams calling. My mother was in a accident yesterday and needs surgery immediately. The hospital says we need $15,000 that insurance won\'t cover. This is life-threatening.'
  },
  {
    id: '000REALISTIC_10',
    expected: 'EMPLOYMENT',
    text: 'Um, hi, I\'m Amara Brown. I was laid off from my job two weeks ago and I\'m unable to make ends meet. I need $2,800 for rent and food until I can find work.'
  },
  {
    id: '000REALISTIC_11',
    expected: 'HOUSING',
    text: 'Um, hi, I\'m Michael Garcia. My family is about to lose our apartment. We\'re behind on rent and need $1,800 by due date or we\'ll be on the street.'
  },
  {
    id: '000REALISTIC_12',
    expected: 'EMPLOYMENT',
    text: 'This is Rosa Williams calling. I was terminated and can\'t afford my apartment payment. My family needs $2,000 to get through this difficult time while I find another job.'
  },
  {
    id: '000REALISTIC_13',
    expected: 'HOUSING',
    text: 'Hi, my name is Sarah Johnson and The landlord is going to do eviction. I have tomorrow to pay eighteen hundred dollars or we\'re out. I have three kids and nowhere else to go.'
  }
];

console.log('=== CATEGORY FAILURE ANALYSIS ===\n');
(async () => {
  for (const testCase of cases) {
    const result = await parserAdapter.extractAll(testCase.text);
    const match = result.category === testCase.expected ? '✓' : '✗';
    console.log(`${match} ${testCase.id} (Expected: ${testCase.expected}, Got: ${result.category})`);
    console.log(`   Text: ${testCase.text.substring(0, 80)}...`);
    console.log('');
  }
})();
