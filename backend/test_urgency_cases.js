const parserAdapter = require('./eval/v4plus/runners/parserAdapter');

const cases = [
  {
    id: '0000REALISTIC_2',
    expected: 'CRITICAL',
    text: 'My husband is in the hospital with a serious condition. They need surgery urgently and we need fifteen thousand dollars to cover what insurance doesn\'t pay. My name is Lisa Williams.'
  },
  {
    id: '0000REALISTIC_7',
    expected: 'CRITICAL',
    text: 'This is Michael Garcia calling. {Violent} situation at home. My ex is violent and I nto escape with the children. Need $2,500 for safe place to stay.'
  },
  {
    id: '000REALISTIC_13',
    expected: 'HIGH',
    text: 'Hi, my name is Sarah Johnson and The landlord is going to do eviction. I have tomorrow to pay eighteen hundred dollars or we\'re out. I have three kids and nowhere else to go.'
  },
  {
    id: '000REALISTIC_15',
    expected: 'HIGH',
    text: 'Hi, my name is Lisa Chen-Wang and The landlord is talking about eviction. I have this Friday to pay $1,500 or we\'re out. I have two daughters and nowhere else to go.'
  },
  {
    id: '000REALISTIC_20',
    expected: 'HIGH',
    text: 'I got let go and my emergency fund are gone. I need help with $2,000 to cover bills while I\'m job hunting. My name is Yuki O\'Connor.'
  },
  {
    id: '000REALISTIC_23',
    expected: 'HIGH',
    text: 'This is Raj Smith calling. I\'m facing eviction and the deadline is tomorrow. My landlord gave me a 3-day notice and I need eighteen hundred dollars to stay in my apartment.'
  }
];

console.log('=== URGENCY FAILURE ANALYSIS ===\n');
(async () => {
  for (const testCase of cases) {
    const result = await parserAdapter.extractAll(testCase.text);
    const match = result.urgencyLevel === testCase.expected ? '✓' : '✗';
    console.log(`${match} ${testCase.id} (Expected: ${testCase.expected}, Got: ${result.urgencyLevel})`);
    console.log(`   Text: ${testCase.text.substring(0, 80)}...`);
    console.log('');
  }
})();
