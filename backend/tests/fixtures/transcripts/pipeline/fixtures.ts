/**
 * Pipeline Test Fixtures - Complete Transcripts
 * 
 * Realistic AssemblyAI transcript responses covering various scenarios:
 * - Complete data (all fields extractable)
 * - Partial data (some fields missing)
 * - Dry recordings (minimal speech)
 * - Noisy data (unclear speech)
 * - Edge cases (unusual formatting)
 */

export const COMPLETE_TRANSCRIPT = {
  id: 'aai_complete_001',
  status: 'completed',
  text: "Hi, my name is Sarah Johnson and I'm 28 years old. I lost my job last month at the restaurant where I worked, and now I'm facing eviction from my apartment. I need help with rent money, about fifteen hundred dollars to catch up on what I owe. I have two young kids, ages 5 and 7, and we might be homeless soon if I can't pay. You can reach me at sarah.johnson@email.com or call me at 555-123-4567. I live in Portland Oregon. I'm really desperate and need help as soon as possible.",
  words: [
    { text: 'Hi', start: 0, end: 200, confidence: 0.99 },
    { text: 'my', start: 250, end: 350, confidence: 0.98 },
    // ... (abbreviated for brevity)
  ],
  utterances: [
    {
      confidence: 0.95,
      start: 0,
      end: 45000,
      text: "Hi, my name is Sarah Johnson and I'm 28 years old. I lost my job last month at the restaurant where I worked, and now I'm facing eviction from my apartment. I need help with rent money, about fifteen hundred dollars to catch up on what I owe. I have two young kids, ages 5 and 7, and we might be homeless soon if I can't pay. You can reach me at sarah.johnson@email.com or call me at 555-123-4567. I live in Portland Oregon. I'm really desperate and need help as soon as possible.",
      speaker: 'A'
    }
  ],
  confidence: 0.95,
  audio_duration: 45.2
};

export const PARTIAL_TRANSCRIPT = {
  id: 'aai_partial_001',
  status: 'completed',
  text: "Um, hi, my name is Mike. I'm in Chicago and I need a place to stay because winter is coming and it's getting really cold. You can call me at 555-999-8888 but I don't have email right now. I lost my phone charger so I might not answer right away.",
  words: [],
  utterances: [
    {
      confidence: 0.88,
      start: 0,
      end: 25000,
      text: "Um, hi, my name is Mike. I'm in Chicago and I need a place to stay because winter is coming and it's getting really cold. You can call me at 555-999-8888 but I don't have email right now. I lost my phone charger so I might not answer right away.",
      speaker: 'A'
    }
  ],
  confidence: 0.88,
  audio_duration: 25.6
};

export const DRY_RECORDING = {
  id: 'aai_dry_001',
  status: 'completed',
  text: "...",
  words: [],
  utterances: [],
  confidence: 0.1,
  audio_duration: 4.2
};

export const SHORT_TRANSCRIPT = {
  id: 'aai_short_001',
  status: 'completed',
  text: "Help me please.",
  words: [
    { text: 'Help', start: 0, end: 500, confidence: 0.92 },
    { text: 'me', start: 550, end: 700, confidence: 0.91 },
    { text: 'please', start: 750, end: 1200, confidence: 0.93 }
  ],
  utterances: [
    {
      confidence: 0.92,
      start: 0,
      end: 1200,
      text: "Help me please.",
      speaker: 'A'
    }
  ],
  confidence: 0.92,
  audio_duration: 1.2
};

export const NOISY_TRANSCRIPT = {
  id: 'aai_noisy_001',
  status: 'completed',
  text: "My name is [inaudible] and I need help with housing. I'm staying at [inaudible] shelter right now. Call me at five five five [inaudible] eight nine.",
  words: [],
  utterances: [
    {
      confidence: 0.65,
      start: 0,
      end: 18000,
      text: "My name is [inaudible] and I need help with housing. I'm staying at [inaudible] shelter right now. Call me at five five five [inaudible] eight nine.",
      speaker: 'A'
    }
  ],
  confidence: 0.65,
  audio_duration: 18.4
};

export const EMERGENCY_HOUSING_TRANSCRIPT = {
  id: 'aai_emergency_001',
  status: 'completed',
  text: "This is Jennifer Martinez, I'm 35. I just got out of the hospital and I have nowhere to go tonight. I was living with my ex but he kicked me out. I need emergency shelter immediately. I'm outside right now and it's freezing. My phone number is 555-234-5678. Please help, I have a medical condition and can't be on the street. I'm in Seattle near Pike Place Market.",
  words: [],
  utterances: [
    {
      confidence: 0.91,
      start: 0,
      end: 32000,
      text: "This is Jennifer Martinez, I'm 35. I just got out of the hospital and I have nowhere to go tonight. I was living with my ex but he kicked me out. I need emergency shelter immediately. I'm outside right now and it's freezing. My phone number is 555-234-5678. Please help, I have a medical condition and can't be on the street. I'm in Seattle near Pike Place Market.",
      speaker: 'A'
    }
  ],
  confidence: 0.91,
  audio_duration: 32.8
};

export const RENTAL_ASSISTANCE_TRANSCRIPT = {
  id: 'aai_rental_001',
  status: 'completed',
  text: "Hello, my name is David Chen, age 42. I've been working as a rideshare driver but my car broke down two weeks ago and I can't afford to fix it. Without the car I can't work and I'm three months behind on rent. My landlord is starting the eviction process. I need about three thousand dollars to catch up and avoid eviction. I have three kids who go to school here and we can't lose our home. You can email me at davidchen1982@gmail.com or text 555-876-5432. We live in Los Angeles, California. Thank you for listening.",
  words: [],
  utterances: [
    {
      confidence: 0.94,
      start: 0,
      end: 48000,
      text: "Hello, my name is David Chen, age 42. I've been working as a rideshare driver but my car broke down two weeks ago and I can't afford to fix it. Without the car I can't work and I'm three months behind on rent. My landlord is starting the eviction process. I need about three thousand dollars to catch up and avoid eviction. I have three kids who go to school here and we can't lose our home. You can email me at davidchen1982@gmail.com or text 555-876-5432. We live in Los Angeles, California. Thank you for listening.",
      speaker: 'A'
    }
  ],
  confidence: 0.94,
  audio_duration: 48.5
};

export const MULTI_SPEAKER_TRANSCRIPT = {
  id: 'aai_multi_001',
  status: 'completed',
  text: "Speaker A: Hi, I'm Maria Rodriguez and I need help. Speaker B: What's your situation? Speaker A: I lost my apartment and I'm staying with friends but they can't keep me much longer. I'm 29 and I work part time but it's not enough. Speaker B: Do you have contact information? Speaker A: Yes, call me at 555-345-6789 or email maria.r@email.com. I'm in Miami.",
  words: [],
  utterances: [
    {
      confidence: 0.89,
      start: 0,
      end: 5000,
      text: "Hi, I'm Maria Rodriguez and I need help.",
      speaker: 'A'
    },
    {
      confidence: 0.92,
      start: 5100,
      end: 7000,
      text: "What's your situation?",
      speaker: 'B'
    },
    {
      confidence: 0.88,
      start: 7200,
      end: 18000,
      text: "I lost my apartment and I'm staying with friends but they can't keep me much longer. I'm 29 and I work part time but it's not enough.",
      speaker: 'A'
    },
    {
      confidence: 0.91,
      start: 18100,
      end: 20000,
      text: "Do you have contact information?",
      speaker: 'B'
    },
    {
      confidence: 0.90,
      start: 20200,
      end: 26000,
      text: "Yes, call me at 555-345-6789 or email maria.r@email.com. I'm in Miami.",
      speaker: 'A'
    }
  ],
  confidence: 0.90,
  audio_duration: 26.3
};

export const NO_NAME_TRANSCRIPT = {
  id: 'aai_noname_001',
  status: 'completed',
  text: "I need help finding a place to stay. I'm currently homeless and sleeping in my car. I have a part-time job but can't afford first and last month's rent. If anyone can help, please call 555-111-2222. I'm in Boston area.",
  words: [],
  utterances: [
    {
      confidence: 0.87,
      start: 0,
      end: 22000,
      text: "I need help finding a place to stay. I'm currently homeless and sleeping in my car. I have a part-time job but can't afford first and last month's rent. If anyone can help, please call 555-111-2222. I'm in Boston area.",
      speaker: 'A'
    }
  ],
  confidence: 0.87,
  audio_duration: 22.5
};

/**
 * Expected extracted signals for each transcript
 */
export const EXPECTED_SIGNALS = {
  complete: {
    name: 'Sarah Johnson',
    age: 28,
    email: 'sarah.johnson@email.com',
    phone: '555-123-4567',
    location: 'Portland, Oregon',
    housingNeeds: ['emergency', 'rental_assistance'],
    goalAmount: 1500,
    urgency: 'high',
    keyPoints: [
      'lost job last month',
      'facing eviction',
      'has 2 children (ages 5 and 7)',
      'needs $1500 for rent'
    ]
  },
  partial: {
    name: 'Mike',
    age: null,
    email: null,
    phone: '555-999-8888',
    location: 'Chicago',
    housingNeeds: ['shelter'],
    goalAmount: null,
    urgency: 'medium',
    keyPoints: [
      'needs place to stay',
      'winter approaching',
      'no email access'
    ]
  },
  dry: {
    name: null,
    age: null,
    email: null,
    phone: null,
    location: null,
    housingNeeds: [],
    goalAmount: null,
    urgency: 'low',
    keyPoints: []
  },
  emergency: {
    name: 'Jennifer Martinez',
    age: 35,
    email: null,
    phone: '555-234-5678',
    location: 'Seattle',
    housingNeeds: ['emergency', 'shelter'],
    goalAmount: null,
    urgency: 'high',
    keyPoints: [
      'just released from hospital',
      'needs immediate shelter',
      'medical condition',
      'outside in freezing weather'
    ]
  },
  rental: {
    name: 'David Chen',
    age: 42,
    email: 'davidchen1982@gmail.com',
    phone: '555-876-5432',
    location: 'Los Angeles, California',
    housingNeeds: ['rental_assistance'],
    goalAmount: 3000,
    urgency: 'high',
    keyPoints: [
      'car breakdown affecting income',
      '3 months behind on rent',
      'eviction process started',
      'has 3 children'
    ]
  }
};
