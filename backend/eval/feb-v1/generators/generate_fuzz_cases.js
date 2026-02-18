/**
 * Jan v4.0+ Fuzz Case Generator
 * 
 * Generates deterministic fuzz test cases using seeded randomness.
 * Produces 200 mutated transcript cases from base templates.
 * 
 * Usage: node generate_fuzz_cases.js --seed 1234 --output ../datasets/fuzz200.jsonl
 */

const fs = require('fs');
const path = require('path');

const GENERATOR_VERSION = '1.0.0';

// Seedable random number generator (mulberry32)
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
    this.state = seed;
  }

  next() {
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choose(array) {
    return array[Math.floor(this.next() * array.length)];
  }

  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Base transcript templates with expected outputs
const BASE_TEMPLATES = [
  {
    id: 'TEMPLATE_001',
    category: 'HOUSING',
    urgency: 'HIGH',
    name: 'John Smith',
    amount: 1200,
    template: 'My name is {NAME} and I need ${AMOUNT} for rent.',
    clauses: [
      { type: 'intro', text: 'My name is {NAME}' },
      { type: 'request', text: 'I need ${AMOUNT} for rent' }
    ]
  },
  {
    id: 'TEMPLATE_002',
    category: 'HEALTHCARE',
    urgency: 'CRITICAL',
    name: 'Maria Garcia',
    amount: 3500,
    template: 'This is {NAME}. I need ${AMOUNT} for surgery tomorrow.',
    clauses: [
      { type: 'intro', text: 'This is {NAME}' },
      { type: 'request', text: 'I need ${AMOUNT} for surgery tomorrow' }
    ]
  },
  {
    id: 'TEMPLATE_003',
    category: 'EMPLOYMENT',
    urgency: 'HIGH',
    name: 'David Johnson',
    amount: 800,
    template: 'Hello, I am {NAME}. Lost my job and need ${AMOUNT}.',
    clauses: [
      { type: 'intro', text: 'Hello, I am {NAME}' },
      { type: 'context', text: 'Lost my job' },
      { type: 'request', text: 'need ${AMOUNT}' }
    ]
  },
  {
    id: 'TEMPLATE_004',
    category: 'UTILITIES',
    urgency: 'CRITICAL',
    name: 'Sarah Williams',
    amount: 450,
    template: '{NAME} calling. Electric bill is ${AMOUNT}, shutoff notice came.',
    clauses: [
      { type: 'intro', text: '{NAME} calling' },
      { type: 'request', text: 'Electric bill is ${AMOUNT}' },
      { type: 'urgency', text: 'shutoff notice came' }
    ]
  },
  {
    id: 'TEMPLATE_005',
    category: 'FOOD',
    urgency: 'MEDIUM',
    name: 'Robert Brown',
    amount: 350,
    template: 'My name is {NAME}. I need help with ${AMOUNT} for groceries.',
    clauses: [
      { type: 'intro', text: 'My name is {NAME}' },
      { type: 'request', text: 'I need help with ${AMOUNT} for groceries' }
    ]
  },
  {
    id: 'TEMPLATE_006',
    category: 'TRANSPORTATION',
    urgency: 'HIGH',
    name: 'Jennifer Davis',
    amount: 950,
    template: 'Hi, this is {NAME}. Car broke down, need ${AMOUNT} for repairs.',
    clauses: [
      { type: 'intro', text: 'Hi, this is {NAME}' },
      { type: 'context', text: 'Car broke down' },
      { type: 'request', text: 'need ${AMOUNT} for repairs' }
    ]
  },
  {
    id: 'TEMPLATE_007',
    category: 'EDUCATION',
    urgency: 'MEDIUM',
    name: 'Michael Martinez',
    amount: 600,
    template: '{NAME} here. Need ${AMOUNT} for my kids school supplies.',
    clauses: [
      { type: 'intro', text: '{NAME} here' },
      { type: 'request', text: 'Need ${AMOUNT} for my kids school supplies' }
    ]
  },
  {
    id: 'TEMPLATE_008',
    category: 'HOUSING',
    urgency: 'CRITICAL',
    name: 'Lisa Anderson',
    amount: 2200,
    template: 'This is {NAME}. Eviction notice, need ${AMOUNT} by Friday.',
    clauses: [
      { type: 'intro', text: 'This is {NAME}' },
      { type: 'urgency', text: 'Eviction notice' },
      { type: 'request', text: 'need ${AMOUNT} by Friday' }
    ]
  },
  {
    id: 'TEMPLATE_009',
    category: 'HEALTHCARE',
    urgency: 'HIGH',
    name: 'Christopher Wilson',
    amount: 1800,
    template: 'My name is {NAME}. Need ${AMOUNT} for medication urgently.',
    clauses: [
      { type: 'intro', text: 'My name is {NAME}' },
      { type: 'request', text: 'Need ${AMOUNT} for medication urgently' }
    ]
  },
  {
    id: 'TEMPLATE_010',
    category: 'LEGAL',
    urgency: 'HIGH',
    name: 'Patricia Moore',
    amount: 2500,
    template: 'Hello, {NAME} speaking. Court costs ${AMOUNT}, need help.',
    clauses: [
      { type: 'intro', text: 'Hello, {NAME} speaking' },
      { type: 'request', text: 'Court costs ${AMOUNT}, need help' }
    ]
  },
  {
    id: 'TEMPLATE_011',
    category: 'FAMILY',
    urgency: 'HIGH',
    name: 'Daniel Taylor',
    amount: 1100,
    template: 'I am {NAME}. My children need ${AMOUNT} for childcare.',
    clauses: [
      { type: 'intro', text: 'I am {NAME}' },
      { type: 'request', text: 'My children need ${AMOUNT} for childcare' }
    ]
  },
  {
    id: 'TEMPLATE_012',
    category: 'HOUSING',
    urgency: 'MEDIUM',
    name: 'Amanda Thomas',
    amount: 1500,
    template: '{NAME} calling about ${AMOUNT} for security deposit.',
    clauses: [
      { type: 'intro', text: '{NAME} calling' },
      { type: 'request', text: 'about ${AMOUNT} for security deposit' }
    ]
  }
];

// Mutation operations
const FILLER_WORDS = ['um', 'uh', 'well', 'so', 'like', 'you know', 'I mean', 'basically', 'actually'];
const IRRELEVANT_NUMBERS = [
  { type: 'age', values: [25, 32, 41, 28, 35], text: "I'm {NUM} years old" },
  { type: 'wage', values: [15, 18, 22, 25], text: "I make ${NUM} an hour" },
  { type: 'monthly_income', values: [2100, 2800, 3200, 1900], text: "I earn ${NUM} monthly" },
  { type: 'child_age', values: [3, 5, 7, 10, 12], text: "my {NUM} year old" },
  { type: 'weeks', values: [2, 3, 4, 6], text: "{NUM} weeks ago" }
];
const IRRELEVANT_KEYWORDS = {
  HOUSING: ['job', 'medical', 'car', 'school'],
  HEALTHCARE: ['rent', 'eviction', 'work', 'transportation'],
  EMPLOYMENT: ['hospital', 'utilities', 'legal', 'education'],
  UTILITIES: ['surgery', 'housing', 'childcare', 'court'],
  FOOD: ['lawyer', 'medication', 'car repair', 'tuition'],
  TRANSPORTATION: ['rent', 'medical bills', 'groceries', 'school'],
  EDUCATION: ['eviction', 'surgery', 'utilities', 'legal fees'],
  LEGAL: ['hospital', 'housing', 'car', 'groceries'],
  FAMILY: ['eviction', 'medical', 'court', 'utilities']
};
const ADVERSARIAL_TOKENS = [
  '<script>alert("test")</script>',
  '{ "injection": true }',
  'DROP TABLE users;',
  '<iframe src="evil.com">',
  '${process.env.SECRET}',
  '../../../etc/passwd'
];
const PUNCTUATION_CHAOS = ['...', '—', '–', ',,', '!!', '??', ';'];

class MutationEngine {
  constructor(rng) {
    this.rng = rng;
  }

  insertFillerWords(clauses) {
    return clauses.map(clause => {
      if (this.rng.next() > 0.6) {
        const filler = this.rng.choose(FILLER_WORDS);
        const position = this.rng.next();
        if (position < 0.33) {
          return { ...clause, text: `${filler}, ${clause.text}` };
        } else if (position < 0.66) {
          const words = clause.text.split(' ');
          const insertPos = this.rng.nextInt(1, words.length - 1);
          words.splice(insertPos, 0, filler);
          return { ...clause, text: words.join(' ') };
        } else {
          return { ...clause, text: `${clause.text}, ${filler}` };
        }
      }
      return clause;
    });
  }

  reorderClauses(clauses) {
    if (this.rng.next() > 0.7) {
      return this.rng.shuffle(clauses);
    }
    return clauses;
  }

  insertIrrelevantNumbers(clauses, excludeGoalAmount) {
    if (this.rng.next() > 0.5) {
      const numToInsert = this.rng.nextInt(1, 3);
      const newClauses = [...clauses];
      
      for (let i = 0; i < numToInsert; i++) {
        const numType = this.rng.choose(IRRELEVANT_NUMBERS);
        const value = this.rng.choose(numType.values);
        const text = numType.text.replace('{NUM}', value);
        
        newClauses.splice(
          this.rng.nextInt(0, newClauses.length),
          0,
          { type: 'noise', text }
        );
      }
      
      return newClauses;
    }
    return clauses;
  }

  insertIrrelevantKeywords(clauses, category) {
    if (this.rng.next() > 0.6 && IRRELEVANT_KEYWORDS[category]) {
      const keywords = IRRELEVANT_KEYWORDS[category];
      const keyword = this.rng.choose(keywords);
      const templates = [
        `Also dealing with ${keyword}`,
        `Had issues with ${keyword} too`,
        `Previously had ${keyword} problems`
      ];
      const text = this.rng.choose(templates);
      
      clauses.splice(
        this.rng.nextInt(0, clauses.length),
        0,
        { type: 'noise', text }
      );
    }
    return clauses;
  }

  insertPunctuationChaos(clauses) {
    return clauses.map(clause => {
      if (this.rng.next() > 0.7) {
        const punct = this.rng.choose(PUNCTUATION_CHAOS);
        const position = this.rng.next();
        if (position < 0.5) {
          return { ...clause, text: `${clause.text}${punct}` };
        } else {
          const words = clause.text.split(' ');
          const insertPos = this.rng.nextInt(1, words.length - 1);
          words[insertPos] = `${words[insertPos]}${punct}`;
          return { ...clause, text: words.join(' ') };
        }
      }
      return clause;
    });
  }

  insertAdversarialToken(clauses) {
    if (this.rng.next() > 0.95) { // Only 5% of cases
      const token = this.rng.choose(ADVERSARIAL_TOKENS);
      clauses.splice(
        this.rng.nextInt(0, clauses.length),
        0,
        { type: 'adversarial', text: token }
      );
    }
    return clauses;
  }

  varyCapitalization(text) {
    if (this.rng.next() > 0.8) {
      // Randomly capitalize words
      return text.split(' ').map(word => {
        if (this.rng.next() > 0.7 && word.length > 3) {
          return word.toUpperCase();
        }
        return word;
      }).join(' ');
    }
    return text;
  }
}

class FuzzCaseGenerator {
  constructor(seed = 1234) {
    this.rng = new SeededRandom(seed);
    this.mutator = new MutationEngine(this.rng);
    this.seed = seed;
  }

  generateCase(template, index) {
    const fuzzId = `FUZZ_${String(index + 1).padStart(3, '0')}`;
    
    // Clone clauses for mutation
    let clauses = JSON.parse(JSON.stringify(template.clauses));
    
    // Track mutations applied
    const mutationOps = [];
    
    // Apply mutations
    if (this.rng.next() > 0.3) {
      clauses = this.mutator.insertFillerWords(clauses);
      mutationOps.push('insertFillerWords');
    }
    
    if (this.rng.next() > 0.5) {
      clauses = this.mutator.reorderClauses(clauses);
      mutationOps.push('reorderClauses');
    }
    
    if (this.rng.next() > 0.4) {
      clauses = this.mutator.insertIrrelevantNumbers(clauses, template.amount);
      mutationOps.push('insertIrrelevantNumbers');
    }
    
    if (this.rng.next() > 0.5) {
      clauses = this.mutator.insertIrrelevantKeywords(clauses, template.category);
      mutationOps.push('insertIrrelevantKeywords');
    }
    
    if (this.rng.next() > 0.6) {
      clauses = this.mutator.insertPunctuationChaos(clauses);
      mutationOps.push('insertPunctuationChaos');
    }
    
    // Adversarial tokens (rare)
    clauses = this.mutator.insertAdversarialToken(clauses);
    if (clauses.some(c => c.type === 'adversarial')) {
      mutationOps.push('insertAdversarialToken');
    }
    
    // Build final transcript
    let transcript = clauses.map(c => c.text).join('. ');
    
    // Replace template variables
    transcript = transcript.replace(/{NAME}/g, template.name);
    transcript = transcript.replace(/\${AMOUNT}/g, template.amount);
    
    // Capitalize first letter if needed
    transcript = transcript.charAt(0).toUpperCase() + transcript.slice(1);
    
    // Ensure ends with period
    if (!transcript.endsWith('.') && !transcript.endsWith('!') && !transcript.endsWith('?')) {
      transcript += '.';
    }
    
    // Calculate label confidence based on mutation complexity
    // More mutations = lower confidence in expected outputs
    const labelConfidence = this.calculateLabelConfidence(mutationOps);
    
    // Generate test case
    const testCase = {
      id: fuzzId,
      difficulty: 'fuzz',
      sourceTemplateId: template.id,
      mutationOps,
      seed: this.seed,
      labelConfidence,
      transcriptText: transcript,
      expected: {
        name: template.name,
        category: template.category,
        urgencyLevel: template.urgency,
        goalAmount: template.amount
      },
      strictness: {
        amountTolerance: 0.05,
        allowFuzzyName: false
      },
      notes: `Fuzz-generated from ${template.id} with mutations: ${mutationOps.join(', ')} (confidence: ${(labelConfidence * 100).toFixed(1)}%)`
    };
    
    return testCase;
  }

  /**
   * Calculate label confidence based on mutation operations applied
   * More destructive mutations = lower confidence in expected outputs
   */
  calculateLabelConfidence(mutationOps) {
    let confidence = 1.0;
    
    // Degrade confidence for each mutation type
    const mutationImpact = {
      'insertFillerWords': 0.05,
      'reorderClauses': 0.15,
      'insertIrrelevantNumbers': 0.20,
      'insertIrrelevantKeywords': 0.10,
      'insertPunctuationChaos': 0.08,
      'insertAdversarialToken': 0.25
    };
    
    mutationOps.forEach(op => {
      confidence -= (mutationImpact[op] || 0.05);
    });
    
    // Floor at 0.60 (60% confidence minimum)
    return Math.max(0.60, Math.min(1.0, confidence));
  }

  generate(count = 200) {
    const cases = [];
    
    for (let i = 0; i < count; i++) {
      // Cycle through templates
      const template = BASE_TEMPLATES[i % BASE_TEMPLATES.length];
      const testCase = this.generateCase(template, i);
      cases.push(testCase);
    }
    
    return cases;
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  let seed = 1234;
  let output = path.join(__dirname, '../datasets/fuzz200.jsonl');
  let count = 200;
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--seed' && args[i + 1]) {
      seed = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      output = args[i + 1];
      i++;
    } else if (args[i] === '--count' && args[i + 1]) {
      count = parseInt(args[i + 1]);
      i++;
    }
  }
  
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         Jan v4.0+ Fuzz Case Generator                          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  console.log(`Seed: ${seed}`);
  console.log(`Count: ${count}`);
  console.log(`Output: ${output}\n`);
  
  const generator = new FuzzCaseGenerator(seed);
  const cases = generator.generate(count);
  
  // Calculate confidence statistics
  const confidenceStats = {
    avg: cases.reduce((sum, c) => sum + c.labelConfidence, 0) / cases.length,
    min: Math.min(...cases.map(c => c.labelConfidence)),
    max: Math.max(...cases.map(c => c.labelConfidence)),
    lowConfidenceCount: cases.filter(c => c.labelConfidence < 0.75).length
  };
  
  // Add metadata as first line
  const datasetMeta = {
    _meta: true,
    generatorVersion: GENERATOR_VERSION,
    seed,
    count: cases.length,
    createdAt: new Date().toISOString(),
    confidenceStats
  };
  
  // Write to JSONL with metadata as first line
  const jsonlContent = JSON.stringify(datasetMeta) + '\n' + cases.map(c => JSON.stringify(c)).join('\n');
  fs.writeFileSync(output, jsonlContent, 'utf8');
  
  console.log(`✅ Generated ${cases.length} fuzz test cases`);
  console.log(`📁 Written to: ${output}`);
  console.log(`\nMutation Statistics:`);
  
  const mutationCounts = {};
  cases.forEach(c => {
    c.mutationOps.forEach(op => {
      mutationCounts[op] = (mutationCounts[op] || 0) + 1;
    });
  });
  
  Object.entries(mutationCounts).forEach(([op, count]) => {
    console.log(`  ${op}: ${count} cases`);
  });
  
  console.log(`\nLabel Confidence Statistics:`);
  console.log(`  Average: ${(confidenceStats.avg * 100).toFixed(1)}%`);
  console.log(`  Min: ${(confidenceStats.min * 100).toFixed(1)}%`);
  console.log(`  Max: ${(confidenceStats.max * 100).toFixed(1)}%`);
  console.log(`  Low confidence (<75%): ${confidenceStats.lowConfidenceCount} cases`);
  
  console.log(`\n✅ Generation complete. Use same seed (${seed}) for reproducibility.\n`);
}

if (require.main === module) {
  main();
}

module.exports = { FuzzCaseGenerator, SeededRandom, MutationEngine };
