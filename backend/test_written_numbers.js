const parserAdapter = require('./eval/v4plus/runners/parserAdapter.js');

const tests = [
  {
    id: "REALISTIC_2",
    text: "My husband is in the hospital with a serious condition. They need surgery urgently and we need fifteen thousand dollars to cover what insurance doesn't pay. My name is Lisa Williams.",
    expectedAmount: 15000
  },
  {
    id: "REALISTIC_4",
    text: "My wife was in a car accident two days ago and needs an operation as soon as possible. The hospital says we need fifteen thousand dollars that insurance won't cover. This is an emergency. My name is Raj Miller-Brown.",
    expectedAmount: 15000
  },
  {
    id: "REALISTIC_6",
    text: "This is Lisa Davis calling. Emergency! My child had an car accident and the doctor says he needs emergency surgery right away. We need about fifteen thousand dollars for the medical bills.",
    expectedAmount: 15000
  }
];

async function runTests() {
  for (const test of tests) {
    const result = await parserAdapter.extractAll(test.text);
    const status = result.goalAmount === test.expectedAmount ? '✓' : '✗';
    console.log(`${status} ${test.id}: Expected ${test.expectedAmount}, Got ${result.goalAmount}`);
  }
}

runTests();
