const testSet = [
  {
    transcript: "Hi, my name is John Smith and I need help with housing.",
    expectedName: "John Smith"
  },
  {
    transcript: "Good morning, I'm Sarah Mitchell and I'm in desperate need of groceries.",
    expectedName: "Sarah Mitchell"
  },
  {
    transcript: "This is Robert Johnson speaking, I need medical assistance urgently.",
    expectedName: "Robert Johnson"
  },
  {
    transcript: "Name is David Kim, living in the streets for months now.",
    expectedName: "David Kim"
  },
  {
    transcript: "Call me Jennifer and I'm struggling with transportation.",
    expectedName: "Jennifer"
  },
  {
    transcript: "Hello, Michael Davis here, really need food and shelter.",
    expectedName: "Michael Davis"
  },
  {
    transcript: "I'm Lisa, a single mom of two kids needing childcare support.",
    expectedName: "Lisa"
  },
  {
    transcript: "James Wilson speaking, I lost my job last month.",
    expectedName: "James Wilson"
  },
  {
    transcript: "This is Thomas Anderson - I'm good at customer service but need immediate housing.",
    expectedName: "Thomas Anderson"
  },
  {
    transcript: "My name is Amanda Rodriguez, I have healthcare needs.",
    expectedName: "Amanda Rodriguez"
  }
];

console.log('Simulating name extraction on test data:\n');

// Simple regex patterns to test
const patterns = [
  /(?:(?:my name is|i[''`]?m|this is|call me)\s+)([a-z]+(?:\s+[a-z]+){0,2})(?:\s+(?:and|speaking|here|—|\.|\,)|\s*$)/im,
  /(?:name is\s+)([a-z]+(?:\s+[a-z]+){0,2})(?:\s*[,.]|\s*$)/im,
  /(?:(?:hi|hello|good morning|good afternoon),?\s+)([a-z]+(?:\s+[a-z]+){0,2})(?:\s+(?:and|speaking|here|—|\.|\,)|\s*$)/im
];

let totalCorrect = 0;
let total = 0;

for (const testCase of testSet) {
  total++;
  
  let extracted = null;
  
  // Try each pattern
  for (const pattern of patterns) {
    const match = testCase.transcript.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      
      // Basic validation - avoid skills/descriptions
      if (!/(good at|skilled|experienced|need|months|years|kids|customer service|assistance|support)/i.test(candidate)) {
        extracted = candidate;
        break;
      }
    }
  }
  
  const isCorrect = extracted?.toLowerCase() === testCase.expectedName.toLowerCase();
  if (isCorrect) totalCorrect++;
  
  console.log(`Test ${total}: "${testCase.transcript}"`);
  console.log(`  Expected: "${testCase.expectedName}"`);
  console.log(`  Extracted: "${extracted}" ${isCorrect ? '✅' : '❌'}`);
  console.log('');
}

console.log('=== RESULTS ===');
console.log(`Simple patterns: ${totalCorrect}/${total} correct (${(totalCorrect/total*100).toFixed(1)}%)`);