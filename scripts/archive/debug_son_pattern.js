// Check why T017 is matching son/daughter surgery pattern
const transcript = "Hello, my name is Marcus Johnson. I used to make six hundred dollars a week before I got injured at work. Now I can't work and I need help with my medical bills. The doctor says I need about four thousand five hundred dollars for the surgery.";

console.log('Testing child surgery patterns:');
console.log('/son.*surgery/i.test():', /son.*surgery/i.test(transcript));
console.log('/daughter.*surgery/i.test():', /daughter.*surgery/i.test(transcript));

// Check what might be matching "son" in the text
const lower = transcript.toLowerCase();
console.log('Searching for "son" in:', lower);
const sonMatches = lower.match(/son/g);
console.log('Son matches:', sonMatches);

// Check the full pattern match
const fullPattern = /son.*surgery|daughter.*surgery/i;
console.log('Full pattern matches:', lower.match(fullPattern));

// Find the exact match
const match = fullPattern.exec(lower);
if (match) {
  console.log('Matched text:', match[0]);
  console.log('Match index:', match.index);
  console.log('Context:', lower.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20));
}