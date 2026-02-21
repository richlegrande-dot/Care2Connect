const parserAdapter = require('./eval/v4plus/runners/parserAdapter.js');

const test36 = "This is Kenji Williams calling. I need help fixing my truck. It needs work costing about $1,500 and I can't work without it.";
const test38 = "This is Michael Williams calling. My truck needs major fixing - about $1,200. I rely on it to get to do my job and I'm concerned about losing my job.";

console.log('\n=== REALISTIC_36 ===');
console.log('Text:', test36);
parserAdapter.extractAll(test36).then(result => {
  console.log('Category:', result.category, '(expected TRANSPORTATION)');
  console.log('Vehicle issue match:', /(car|vehicle|truck)\s*(broke down|needs?\s*(major\s*)?(repair|work|fix)|broken)/i.test(test36));
  console.log('Work context match:', /(rely on it|need.*to get to (work|do my job)|can't work without|commute|get to work|transportation|to do my job|losing my job)/i.test(test36));
  
  console.log('\n=== REALISTIC_38 ===');
  console.log('Text:', test38);
  return parserAdapter.extractAll(test38);
}).then(result => {
  console.log('Category:', result.category, '(expected TRANSPORTATION)');
  console.log('Vehicle issue match:', /(car|vehicle|truck)\s*(broke down|needs?\s*(major\s*)?(repair|work|fix)|broken)/i.test(test38));
  console.log('Work context match:', /(rely on it|need.*to get to (work|do my job)|can't work without|commute|get to work|transportation|to do my job|losing my job)/i.test(test38));
});
