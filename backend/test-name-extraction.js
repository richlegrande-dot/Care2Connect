const COMMON_WORDS = new Set([
  'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have',
  'been', 'were', 'will', 'would', 'could', 'should', 'must',
  'about', 'there', 'their', 'where', 'when', 'what', 'which',
  'emergency', 'urgent', 'help', 'need', 'please', 'thank', 'you',
  'calling', 'going', 'looking', 'trying', 'working', 'reaching', 
  'seeking', 'hoping', 'living', 'staying', 'currently', 'because'
]);

function isCommonWord(word) {
  return COMMON_WORDS.has(word.toLowerCase());
}

const testCases = [
  "This is David Kim calling.",
  "My name is Sarah Johnson.",
  "Hello, I'm Lisa Anderson.",
  "This is Dr. Jennifer Park.",
  "Yeah, hi, everyone calls me Danny but my real name is Daniel Martinez.",
  "Hi, my name is Sarah Johnson. I received an eviction notice.",
];

const patterns = [
  /(?:my name is|i'?m|i am|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})(?=\s+[a-z]|[,\.!?;\)]|$)/i,
  /(?:i go by|they call me|known as)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})(?=\s+[a-z]|[,\.!?;\)]|$)/i,
  /(?:real name is|actual name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})(?=\s+[a-z]|[,\.!?;\)]|$)/i,
  /(?:my name is|i'?m|i am|this is)\s+(?:dr\.?|mr\.?|mrs\.?|ms\.?|miss)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})(?=\s+[a-z]|[,\.!?;\)]|$)/i,
];

for (const testCase of testCases) {
  console.log('\n=== Testing:', testCase);
  let found = false;
  for (const pattern of patterns) {
    const match = testCase.match(pattern);
    if (match && match[1]) {
      let name = match[1].trim();
      
      // Cleanup: Remove trailing common verbs
      name = name.replace(/\s+(calling|going|trying|working|looking|seeking|hoping)$/i, '');
      
      const words = name.split(/\s+/);
      const hasCommonWord = words.some(word => isCommonWord(word));
      
      if (!hasCommonWord && words.length >= 1 && words.length <= 4) {
        console.log('✓ Matched! Extracted name:', name);
        found = true;
        break;
      } else {
        console.log('✗ Matched but filtered out. Name:', name, '| Has common word:', hasCommonWord);
      }
    }
  }
  if (!found) {
    console.log('✗ No match found');
  }
}
