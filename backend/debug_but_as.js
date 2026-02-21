// Debug why "but as" is matching the title_honorific pattern
const text = "Good morning, this is Dr. Patricia Johnson. I'm calling not as a doctor but as a mother.";

console.log('=== DEBUGGING "BUT AS" MATCH ===');
console.log('Text:', text);
console.log('');

// Test the current title pattern
const titlePattern = /\b(?:dr|doctor|mrs?|ms|mr|miss)\.?\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)+)\b/gi;
console.log('Current title pattern:');

let match;
titlePattern.lastIndex = 0;
while ((match = titlePattern.exec(text)) !== null) {
  console.log(`   Full match: "${match[0]}" -> Captured: "${match[1]}" at position ${match.index}`);
  
  // Show context around the match
  const start = Math.max(0, match.index - 10);
  const end = Math.min(text.length, match.index + match[0].length + 10);
  console.log(`   Context: "${text.substring(start, end)}"`);
}

// Let's see if "as a doctor but as" contains something that looks like a title
console.log('');
console.log('Checking for "as" matches:');
const asPattern = /\bas\b/gi;
asPattern.lastIndex = 0;
while ((match = asPattern.exec(text)) !== null) {
  const start = Math.max(0, match.index - 15);
  const end = Math.min(text.length, match.index + 15);
  console.log(`   "as" at position ${match.index}: "${text.substring(start, end)}"`);
}

// Maybe "as" is being matched as "ms"? Let's test
console.log('');
console.log('Testing title patterns individually:');
const titleWords = ['dr', 'doctor', 'mrs', 'ms', 'mr', 'miss'];
titleWords.forEach(title => {
  const singleTitlePattern = new RegExp(`\\b${title}\\.?\\s+([A-Z][A-Za-z'-]+(?:\\s+[A-Z][A-Za-z'-]+)+)\\b`, 'gi');
  singleTitlePattern.lastIndex = 0;
  const singleMatch = singleTitlePattern.exec(text);
  if (singleMatch) {
    console.log(`   ${title} matches: "${singleMatch[0]}" -> "${singleMatch[1]}"`);
  }
});