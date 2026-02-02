const JanV3AnalyticsEvaluator = require('./eval/jan-v3-analytics-runner.js');
const parser = new JanV3AnalyticsEvaluator();

const tests = [
  {
    text: "My vehicle broke down and I need it to get to work. The fix will cost $1,200.",
    expected: "TRANSPORTATION"
  },
  {
    text: "I need help fixing my truck. It needs work costing about $1,500 and I can't work without it.",
    expected: "TRANSPORTATION"
  },
  {
    text: "My truck needs major fixing - about $1,200. I rely on it to get to do my job and I'm concerned about losing my job.",
    expected: "TRANSPORTATION"
  }
];

tests.forEach((test, i) => {
  const result = parser.extractAll(test.text);
  const status = result.category === test.expected ? '✓' : '✗';
  console.log(`${status} Test ${i+1}: Expected ${test.expected}, Got ${result.category}`);
});
