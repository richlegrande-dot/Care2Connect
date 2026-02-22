// Quick debug script for name extraction testing
// Testing specific patterns with JavaScript 

const testCases = [
  {
    id: "name-001",
    transcript: "Hi, my name is John Smith and I'm looking for help.",
    expectedName: "John Smith"
  },
  {
    id: "name-002",  
    transcript: "Hello, I'm Maria Garcia from San Francisco.",
    expectedName: "Maria Garcia"
  },
  {
    id: "name-003",
    transcript: "This is Dr. James Wilson speaking.",
    expectedName: "James Wilson"
  },
  {
    id: "name-004",
    transcript: "My name's Sarah Mitchell, I need assistance.",
    expectedName: "Sarah Mitchell"
  },
  {
    id: "name-005",
    transcript: "Call me Robert Johnson. I'm 45 years old.",
    expectedName: "Robert Johnson"
  },
  {
    id: "name-006",
    transcript: "I'm Jennifer Lee and I'm seeking housing support.",
    expectedName: "Jennifer Lee"
  },
  {
    id: "name-007",
    transcript: "This is Michael Davis here, calling about assistance.",
    expectedName: "Michael Davis"
  },
  {
    id: "name-008",
    transcript: "My full name is Elizabeth Martinez Rodriguez.",
    expectedName: "Elizabeth Martinez Rodriguez"
  },
  {
    id: "name-009",
    transcript: "Hi, Thomas Anderson speaking, I need help.",
    expectedName: "Thomas Anderson"
  },
  {
    id: "name-010",
    transcript: "Name is David Kim. I'm homeless and need shelter.",
    expectedName: "David Kim"
  }
];

// Copy the patterns from TypeScript (UPDATED)
const patterns = [
  // "My name is" pattern (highest priority)
  /(?:my (?:full )?name(?:'s| is))\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+(?!and\b|but\b|or\b|from\b|years?\b|dollars?\b|per\b|avenue\b|street\b|road\b|drive\b|way\b|lane\b|court\b|place\b|texas\b|california\b|florida\b|oregon\b|york\b|I\b|need\b|want\b|help\b)[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,2})(?=\s+(?:and|but|or|from|I|need|want|help)|,|\.|$|'s|;)/i,
  
  // "Name is David Kim" - simple name statement (early priority)
  /(?:^|\s)(?:name is|my name)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,2})(?=\.|,|$|\s+and)/i,
  
  // "This is" pattern - FIXED: exclude "speaking"/"here" from capture 
  /(?:this is|here is)\s+(?:(?:Dr\.|Mr\.|Mrs\.|Ms\.|Rev\.|Captain)\s+)?([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+(?!speaking|calling|here|MD|Jr|Sr|PhD|and|but|or)[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,2})(?=\s+(?:speaking|calling|MD|Jr|Sr|PhD|and|but|or|here)|,|\.|$|'s|;)/i,
  
  // "Thomas Anderson speaking" - name before speaking/here
  /\b([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){1,2})\s+(?:speaking|here)(?=\s|,|\.|$)/i,
  
  // "Call me" pattern  
  /(?:call me|you can call me)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+(?!speaking|here|and|but)[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,3})(?=\.|,|$|\s+and)/i,
  
  // "I'm" pattern - LAST priority to avoid wrong matches
  /(?:i'm|i am)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+(?!speaking|here|and|but|or|from|years?|good|bad|great|terrible|awful|amazing|excellent|skilled|experienced|looking|trying|working|feeling|getting|going|homeless|seeking|a)[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,3})(?=\s+(?:and|but|or|from)|,|\.|$|'s|;|\s+\d)/i
];

const rejectPatterns = [
  // Numbers and age references  
  /^\d+$/,
  /^(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)$/i,
  
  // Common false positives
  /^(critical|urgent|emergency|important|needed|struggling|difficult|desperate)$/i,
  /^(help|need|want|trying|looking|asking|hoping)$/i,
  /^(good|bad|okay|fine|great|terrible|awful)$/i,
  
  // NEW: Skill/descriptive phrases
  /^(good at|bad at|skilled at|experienced in|expert in|familiar with)$/i,
  /^(customer service|retail|sales|management|administration|food service)$/i,
];

function extractNameDebug(transcript) {
  console.log(`\n=== TESTING: "${transcript}" ===`);
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    console.log(`Pattern ${i + 1}:`, pattern.source);
    
    const match = transcript.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      console.log(`  MATCHED: "${candidate}"`);
      
      // Test rejection patterns
      let rejected = false;
      for (const rejectPattern of rejectPatterns) {
        if (rejectPattern.test(candidate)) {
          console.log(`  REJECTED by pattern:`, rejectPattern.source);
          rejected = true;
          break;
        }
      }
      
      if (!rejected) {
        console.log(`  ACCEPTED: "${candidate}"`);
        return candidate;
      }
    } else {
      console.log(`  NO MATCH`);
    }
  }
  
  console.log(`  FINAL RESULT: undefined`);
  return undefined;
}

console.log("=== NAME EXTRACTION DEBUG TEST ===");

let correct = 0;
for (const testCase of testCases) {
  const result = extractNameDebug(testCase.transcript);
  const isCorrect = result?.toLowerCase() === testCase.expectedName.toLowerCase();
  
  console.log(`\n${testCase.id}: ${isCorrect ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  Expected: "${testCase.expectedName}"`);
  console.log(`  Got: "${result}"`);
  
  if (isCorrect) correct++;
}

console.log(`\n=== FINAL RESULTS ===`);
console.log(`Accuracy: ${(correct / testCases.length * 100).toFixed(1)}% (${correct}/${testCases.length})`);