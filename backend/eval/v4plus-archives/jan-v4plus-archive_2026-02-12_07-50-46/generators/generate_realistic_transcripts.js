/**
 * generate_realistic_transcripts.js
 * Generates realistic conversational transcripts for urgency pattern testing
 * 
 * Creates natural-sounding transcripts with:
 * - Real speech patterns (fillers, pauses, repetition)
 * - Varied urgency expressions
 * - Diverse scenarios and demographics
 * - Edge cases for pattern validation
 */

const fs = require('fs');
const path = require('path');

// Natural filler words and speech patterns
const FILLERS = ['um', 'uh', 'like', 'you know', 'I mean', 'well', 'so', 'actually'];
const PAUSES = ['...', '..', ''];
const REPETITIONS = {
  nervous: (phrase) => `${phrase}, ${phrase}`,
  stutter: (word) => `${word}... ${word}`,
  emphasis: (phrase) => `${phrase}, really ${phrase}`
};

// Name patterns with demographics
const FIRST_NAMES = {
  common: ['John', 'Mary', 'Michael', 'Sarah', 'David', 'Jennifer', 'Robert', 'Lisa', 'William', 'Karen'],
  hispanic: ['Carlos', 'Maria', 'Jose', 'Ana', 'Luis', 'Carmen', 'Miguel', 'Rosa'],
  asian: ['Wei', 'Priya', 'Kenji', 'Lin', 'Raj', 'Mei', 'Hiroshi', 'Yuki'],
  diverse: ['Jamal', 'Fatima', 'Ahmed', 'Lakisha', 'Dmitri', 'Amara']
};

const LAST_NAMES = {
  common: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'],
  hyphenated: ['Smith-Johnson', 'Garcia-Lopez', 'Chen-Wang', 'Miller-Brown'],
  apostrophe: ["O'Brien", "O'Connor", "D'Angelo", "McD'onald"]
};

// Urgency scenario templates
const URGENCY_SCENARIOS = {
  CRITICAL: [
    {
      category: 'SAFETY',
      templates: [
        "My {relation} has been {threatening} me and I need to {leave} with my {kids}. I'm {hiding} at {location} but I can't stay here. I need help getting {amount} for a {security_deposit} and first month's rent somewhere safe.",
        "There's an {emergency}. Someone is {threatening} my {family} and we need to {flee} immediately. We need about {amount} to get to a {safe_place}.",
        "{Violent} situation at home. My {partner} is {dangerous} and I need to {escape} with the {children}. Need {amount} for {emergency_housing}."
      ],
      vars: {
        relation: ['husband', 'boyfriend', 'ex-husband', 'partner'],
        threatening: ['threatening', 'abusing', 'hurting', 'violent with'],
        leave: ['leave', 'get out', 'escape'],
        kids: ['kids', 'children', 'two daughters', 'son'],
        hiding: ['hiding', 'staying', 'taking refuge'],
        location: ["my sister's", "a friend's house", "a shelter"],
        amount: ['$3,000', '$2,500', '$4,000', 'three thousand dollars'],
        security_deposit: ['security deposit', 'deposit'],
        emergency: ['emergency', 'crisis', 'serious situation'],
        family: ['family', 'kids', 'children'],
        flee: ['flee', 'leave', 'get away'],
        safe_place: ['safe place', 'shelter', 'somewhere safe'],
        violent: ['Violent', 'Dangerous', 'Abusive'],
        partner: ['husband', 'boyfriend', 'ex'],
        dangerous: ['dangerous', 'violent', 'out of control'],
        escape: ['escape', 'leave', 'get out'],
        children: ['children', 'kids', 'my daughter'],
        emergency_housing: ['emergency housing', 'temporary shelter', 'safe place to stay']
      }
    },
    {
      category: 'HEALTHCARE',
      templates: [
        "My {relation} was in a {accident} {timeframe} and needs {surgery} {urgency}. The hospital says we need {amount} that insurance won't cover. This is {critical}.",
        "{Emergency}! My {child} had an {accident} and the doctor says he needs {surgery} right away. We need about {amount} for the medical bills.",
        "My {family_member} is in the {hospital} with a {condition}. They need {surgery} {immediately} and we need {amount} to cover what insurance doesn't pay."
      ],
      vars: {
        relation: ['son', 'daughter', 'wife', 'mother', 'father'],
        accident: ['car accident', 'accident', 'serious accident'],
        timeframe: ['yesterday', 'last night', 'this morning', 'two days ago'],
        surgery: ['surgery', 'an operation', 'emergency surgery'],
        urgency: ['immediately', 'right away', 'as soon as possible'],
        amount: ['$15,000', '$8,000', '$12,000', 'fifteen thousand dollars'],
        critical: ['critical', 'an emergency', 'life-threatening'],
        emergency: ['Emergency', 'This is an emergency', 'Crisis'],
        child: ['son', 'daughter', 'child', 'kid'],
        family_member: ['mother', 'father', 'husband', 'wife'],
        hospital: ['hospital', 'emergency room', 'ICU'],
        condition: ['serious condition', 'critical condition', 'life-threatening injury'],
        immediately: ['immediately', 'right now', 'urgently']
      }
    }
  ],
  
  HIGH: [
    {
      category: 'HOUSING',
      templates: [
        "I'm {facing} eviction and the {deadline} is {timeframe}. My landlord gave me a {notice} and I need {amount} to {stay} in my apartment.",
        "My {family} is about to {lose} our {home}. We're behind on rent and need {amount} by {deadline} or we'll be {homeless}.",
        "The landlord is {threatening} eviction. I have {timeframe} to pay {amount} or we're out. I have {kids} and nowhere else to go."
      ],
      vars: {
        facing: ['facing', 'dealing with', 'about to get'],
        deadline: ['deadline', 'due date', 'final date'],
        timeframe: ['tomorrow', 'this Friday', 'by the end of the week', 'in three days'],
        notice: ['eviction notice', 'final notice', '3-day notice'],
        amount: ['$1,800', '$2,200', '$1,500', 'eighteen hundred dollars'],
        stay: ['stay', 'remain', 'keep living'],
        family: ['family', 'kids and I', 'we'],
        lose: ['lose', 'get kicked out of', 'be evicted from'],
        home: ['home', 'apartment', 'house', 'place'],
        homeless: ['homeless', 'on the street', 'without a place to stay'],
        threatening: ['threatening', 'talking about', 'going to do'],
        kids: ['three kids', 'children', 'two daughters', 'kids']
      }
    },
    {
      category: 'EMPLOYMENT',
      templates: [
        "I {lost} my job {timeframe} and I'm {struggling} to {provide}. I need {amount} for {expenses} until I can find work.",
        "I got {laid_off} and my {savings} are gone. I need help with {amount} to cover {bills} while I'm {job_searching}.",
        "I was {fired} and can't afford {rent}. My family needs {amount} to get through this {crisis} while I find another job."
      ],
      vars: {
        lost: ['lost', 'was laid off from'],
        timeframe: ['last month', 'two weeks ago', 'recently'],
        struggling: ['struggling', 'having trouble', 'unable'],
        provide: ['provide for my family', 'make ends meet', 'pay the bills'],
        amount: ['$2,000', '$3,500', '$2,800', 'two thousand dollars'],
        expenses: ['basic expenses', 'rent and food', 'bills'],
        laid_off: ['laid off', 'let go', 'terminated'],
        savings: ['savings', 'emergency fund', 'money'],
        bills: ['bills', 'rent', 'expenses'],
        job_searching: ['looking for work', 'job hunting', 'trying to find employment'],
        fired: ['fired', 'let go', 'terminated'],
        rent: ['rent', 'housing', 'my apartment payment'],
        crisis: ['difficult time', 'crisis', 'situation']
      }
    }
  ],
  
  MEDIUM: [
    {
      category: 'HEALTHCARE',
      templates: [
        "My {relation} needs {medical_care} for a {condition}. It costs about {amount} and we're {struggling} to afford it.",
        "I need help with {medical} costs. My {family_member} requires {treatment} that runs about {amount} per {period}.",
        "We're having trouble paying for my {relation}'s {medication}. It's {amount} {period} and we just can't keep up."
      ],
      vars: {
        relation: ['mother', 'father', 'son', 'daughter'],
        medical_care: ['medication', 'treatment', 'physical therapy', 'medical care'],
        condition: ['chronic condition', 'health issue', 'medical condition'],
        amount: ['$4,000', '$1,500', '$800', 'four thousand dollars'],
        struggling: ['struggling', 'having difficulty', 'finding it hard'],
        medical: ['medical', 'healthcare', 'treatment'],
        family_member: ['mother', 'father', 'spouse', 'child'],
        treatment: ['treatment', 'therapy', 'medication', 'care'],
        period: ['month', 'year', 'quarterly'],
        medication: ['medication', 'prescriptions', 'medicine']
      }
    },
    {
      category: 'TRANSPORTATION',
      templates: [
        "My {vehicle} broke down and I need it to {commute}. The {repair} will cost {amount} and I don't have it.",
        "I need help fixing my {vehicle}. It needs {repairs} costing about {amount} and I can't {work} without it.",
        "My {vehicle} needs major {repairs} - about {amount}. I rely on it to get to {work} and I'm {worried} about losing my job."
      ],
      vars: {
        vehicle: ['car', 'vehicle', 'truck'],
        commute: ['get to work', 'commute', 'get to my job'],
        repair: ['repair', 'fix'],
        amount: ['$1,200', '$800', '$1,500', 'twelve hundred dollars'],
        repairs: ['repairs', 'work', 'fixing'],
        work: ['work', 'get to work', 'do my job'],
        worried: ['worried', 'concerned', 'afraid']
      }
    }
  ],
  
  LOW: [
    {
      category: 'FAMILY',
      templates: [
        "I'm {planning} my {event} and could use some help. It's {timing} and I'm {hoping} to raise about {amount} for {purpose}.",
        "My {family_member} has a {celebration} coming up and I'd like to {help}. Looking for maybe {amount} to make it {special}.",
        "This is {personal} but I'm trying to {raise} funds for a {event}. Not urgent, but hoping to get about {amount} when possible."
      ],
      vars: {
        planning: ['planning', 'organizing', 'working on'],
        event: ["daughter's wedding", 'wedding', 'anniversary celebration', 'family reunion'],
        timing: ['in a few months', 'eventually', 'later this year'],
        hoping: ['hoping', 'trying', 'looking'],
        amount: ['$3,000', '$2,000', '$5,000', 'three thousand dollars'],
        purpose: ['the ceremony', 'the celebration', 'making it special'],
        family_member: ['daughter', 'son', 'sister'],
        celebration: ['wedding', 'graduation', 'celebration'],
        help: ['help out', 'contribute', 'make it nice'],
        special: ['special', 'memorable', 'wonderful'],
        personal: ['personal', 'a personal matter', "hard to explain"],
        raise: ['raise', 'gather', 'collect']
      }
    }
  ]
};

class RealisticTranscriptGenerator {
  constructor(seed = 1234) {
    this.seed = seed;
    this.rng = this.seededRandom(seed);
  }

  // Mulberry32 seeded random number generator
  seededRandom(seed) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  randomChoice(array) {
    return array[Math.floor(this.rng() * array.length)];
  }

  addNaturalSpeech(text) {
    const patterns = [
      // Add filler at beginning
      { pattern: /^/, replacement: () => this.rng() < 0.3 ? `${this.randomChoice(FILLERS)}, ` : '', weight: 0.3 },
      // Add pause in middle
      { pattern: /\. /, replacement: () => this.rng() < 0.2 ? `${this.randomChoice(PAUSES)} ` : '. ', weight: 0.2 },
      // Add "you know" or "I mean"
      { pattern: /(need|want|trying) /, replacement: (match) => this.rng() < 0.15 ? `${match[1]}, ${this.randomChoice(['you know', 'I mean'])}, ` : match[0], weight: 0.15 },
    ];

    let result = text;
    patterns.forEach(p => {
      if (this.rng() < p.weight) {
        result = result.replace(p.pattern, p.replacement);
      }
    });

    return result;
  }

  fillTemplate(template, vars) {
    let result = template;
    const placeholders = template.match(/\{(\w+)\}/g) || [];
    
    placeholders.forEach(placeholder => {
      const key = placeholder.slice(1, -1);
      if (vars[key]) {
        const value = this.randomChoice(vars[key]);
        result = result.replace(placeholder, value);
      }
    });

    return result;
  }

  generateName() {
    const nameType = this.randomChoice(['common', 'hispanic', 'asian', 'diverse', 'common']);
    const firstName = this.randomChoice(FIRST_NAMES[nameType] || FIRST_NAMES.common);
    
    const lastNameType = this.randomChoice(['common', 'common', 'common', 'hyphenated', 'apostrophe']);
    const lastName = this.randomChoice(LAST_NAMES[lastNameType]);
    
    return `${firstName} ${lastName}`;
  }

  generateTranscript(urgencyLevel, scenarioIndex = null) {
    const scenarios = URGENCY_SCENARIOS[urgencyLevel];
    if (!scenarios) {
      throw new Error(`Unknown urgency level: ${urgencyLevel}`);
    }

    const scenario = scenarioIndex !== null ? 
      scenarios[scenarioIndex % scenarios.length] : 
      this.randomChoice(scenarios);

    const template = this.randomChoice(scenario.templates);
    let transcript = this.fillTemplate(template, scenario.vars);

    // Add name introduction (varied styles)
    const name = this.generateName();
    const introPatterns = [
      `Hi, my name is ${name} and ${transcript}`,
      `Hello, this is ${name}. ${transcript}`,
      `${transcript} My name is ${name}.`,
      `Um, hi, I'm ${name}. ${transcript}`,
      `This is ${name} calling. ${transcript}`
    ];

    let fullTranscript = this.randomChoice(introPatterns);
    
    // Add natural speech patterns
    fullTranscript = this.addNaturalSpeech(fullTranscript);

    // Extract expected values (simplified - would need refinement)
    const expectedAmount = this.extractAmount(fullTranscript);
    const expectedCategory = scenario.category;
    const expectedUrgency = urgencyLevel;

    return {
      transcript: fullTranscript,
      expected: {
        name,
        category: expectedCategory,
        urgencyLevel: expectedUrgency,
        goalAmount: expectedAmount
      },
      metadata: {
        urgencyLevel,
        scenarioType: scenario.category,
        generatedAt: new Date().toISOString()
      }
    };
  }

  extractAmount(text) {
    // Extract dollar amounts
    const dollarMatch = text.match(/\$([0-9,]+)/);
    if (dollarMatch) {
      return parseInt(dollarMatch[1].replace(/,/g, ''));
    }

    // Extract written amounts
    const writtenAmounts = {
      'fifteen thousand': 15000,
      'twelve thousand': 12000,
      'eight thousand': 8000,
      'four thousand': 4000,
      'three thousand': 3000,
      'two thousand': 2000,
      'eighteen hundred': 1800
    };

    for (const [written, value] of Object.entries(writtenAmounts)) {
      if (text.toLowerCase().includes(written)) {
        return value;
      }
    }

    return null;
  }

  generateDataset(count = 50, distribution = null) {
    // Default distribution if not provided
    const defaultDistribution = {
      CRITICAL: 0.15,  // 15%
      HIGH: 0.35,      // 35%
      MEDIUM: 0.40,    // 40%
      LOW: 0.10        // 10%
    };

    const dist = distribution || defaultDistribution;
    const transcripts = [];

    let remaining = count;
    for (const [level, percent] of Object.entries(dist)) {
      const levelCount = Math.round(count * percent);
      for (let i = 0; i < levelCount && remaining > 0; i++) {
        const item = this.generateTranscript(level, i);
        transcripts.push({
          id: `REALISTIC_${transcripts.length + 1}`.padStart(15, '0'),
          description: `Realistic ${level} urgency scenario`,
          difficulty: level === 'CRITICAL' ? 'hard' : level === 'LOW' ? 'easy' : 'medium',
          transcriptText: item.transcript,
          segments: this.generateSegments(item.transcript),
          expected: {
            name: item.expected.name,
            category: item.expected.category,
            urgencyLevel: item.expected.urgencyLevel,
            goalAmount: item.expected.goalAmount,
            missingFields: [],
            beneficiaryRelationship: 'varied'
          },
          strictness: {
            allowFuzzyName: false,
            amountTolerance: 0.05,
            categorySynonyms: true
          },
          metadata: item.metadata
        });
        remaining--;
      }
    }

    return transcripts;
  }

  generateSegments(text) {
    // Simple segmentation - split by sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentMs = 0;
    
    return sentences.map(sentence => {
      const duration = sentence.split(' ').length * 400; // ~400ms per word
      const segment = {
        startMs: currentMs,
        endMs: currentMs + duration,
        text: sentence.trim()
      };
      currentMs += duration;
      return segment;
    });
  }

  saveDataset(transcripts, outputPath) {
    const lines = transcripts.map(t => JSON.stringify(t)).join('\n');
    fs.writeFileSync(outputPath, lines);
    console.log(`✅ Generated ${transcripts.length} realistic transcripts`);
    console.log(`📁 Saved to: ${outputPath}`);
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const countArg = args.find(a => a.startsWith('--count='));
  const seedArg = args.find(a => a.startsWith('--seed='));
  const outputArg = args.find(a => a.startsWith('--output='));

  const count = countArg ? parseInt(countArg.split('=')[1]) : 50;
  const seed = seedArg ? parseInt(seedArg.split('=')[1]) : 1234;
  const outputPath = outputArg ? 
    outputArg.split('=')[1] : 
    path.join(__dirname, '../datasets/realistic50.jsonl');

  console.log('🔧 Realistic Transcript Generator');
  console.log(`   Count: ${count}`);
  console.log(`   Seed: ${seed}`);
  console.log(`   Output: ${outputPath}\n`);

  const generator = new RealisticTranscriptGenerator(seed);
  const transcripts = generator.generateDataset(count);
  
  // Show distribution
  const dist = transcripts.reduce((acc, t) => {
    acc[t.expected.urgencyLevel] = (acc[t.expected.urgencyLevel] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📊 Urgency Distribution:');
  for (const [level, count] of Object.entries(dist)) {
    console.log(`   ${level}: ${count} (${(count/transcripts.length*100).toFixed(1)}%)`);
  }

  generator.saveDataset(transcripts, outputPath);
  
  // Show sample
  console.log('\n📝 Sample transcript:');
  console.log(`   ${transcripts[0].transcriptText.substring(0, 150)}...`);
}

module.exports = { RealisticTranscriptGenerator };
