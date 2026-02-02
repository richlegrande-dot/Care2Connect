/**
 * V1 Stress Test Configuration
 * 
 * Predefined transcript fixtures for deterministic testing.
 * These transcripts cover all extraction patterns and edge cases.
 */

export const TEST_TRANSCRIPTS = [
  // Basic Profile - All fields present
  {
    id: 'test-001',
    transcript: `Hi, my name is John Smith and I'm 42 years old. I live in San Francisco, California. 
    I'm a skilled carpenter with 15 years of experience. I lost my job 6 months ago and I'm currently 
    homeless. I desperately need stable housing and help finding employment. I also need food assistance 
    and access to healthcare for my diabetes. My phone number is 415-555-1234 and my email is 
    john.smith@example.com.`,
    expectedExtraction: {
      name: 'John Smith',
      age: 42,
      location: 'San Francisco, California',
      skills: ['carpenter', 'carpentry'],
      urgentNeeds: ['HOUSING', 'EMPLOYMENT', 'FOOD'],
      phone: '415-555-1234',
      email: 'john.smith@example.com'
    }
  },

  // Minimal Profile - Name and age only
  {
    id: 'test-002',
    transcript: `My name is Maria Garcia. I'm 35 years old and I need help.`,
    expectedExtraction: {
      name: 'Maria Garcia',
      age: 35,
      urgentNeeds: []
    }
  },

  // Complex Name Formats
  {
    id: 'test-003',
    transcript: `This is Dr. James Wilson speaking. I'm 58 years old. I recently lost my medical license 
    due to personal issues and I'm seeking housing assistance.`,
    expectedExtraction: {
      name: 'James Wilson',
      age: 58,
      urgentNeeds: ['HOUSING']
    }
  },

  // Multi-part Hispanic name
  {
    id: 'test-004',
    transcript: `My full name is Elizabeth Martinez Rodriguez and I am 29 years old. I'm looking for 
    childcare support so I can go back to work.`,
    expectedExtraction: {
      name: 'Elizabeth Martinez Rodriguez',
      age: 29,
      urgentNeeds: ['CHILDCARE']
    }
  },

  // Multiple urgent needs
  {
    id: 'test-005',
    transcript: `Call me Robert Johnson. I'm 51. I'm a veteran dealing with PTSD. I need mental health 
    services, prescription medication, and stable housing. I also need food assistance immediately.`,
    expectedExtraction: {
      name: 'Robert Johnson',
      age: 51,
      urgentNeeds: ['HEALTHCARE', 'HOUSING', 'FOOD']
    }
  },

  // Informal speaking style
  {
    id: 'test-006',
    transcript: `I'm Jennifer Lee and I'm like 26 years old, you know? I got evicted last month and my 
    kids are staying with my sister. I really need to find a place to live and get my kids back.`,
    expectedExtraction: {
      name: 'Jennifer Lee',
      age: 26,
      urgentNeeds: ['HOUSING', 'CHILDCARE']
    }
  },

  // Technical skills emphasis
  {
    id: 'test-007',
    transcript: `Name is David Kim. I'm 38. I worked in IT for 10 years as a software developer and 
    network administrator. Lost my job during COVID and ended up homeless. I'm looking for work in 
    technology and temporary shelter.`,
    expectedExtraction: {
      name: 'David Kim',
      age: 38,
      skills: ['IT', 'software', 'technology'],
      urgentNeeds: ['EMPLOYMENT', 'HOUSING']
    }
  },

  // Healthcare and transportation needs
  {
    id: 'test-008',
    transcript: `This is Michael Davis here, calling about assistance. I'm 63 years old. I have declining 
    health and need regular doctor visits but have no way to get to appointments. I also need help with 
    my medications.`,
    expectedExtraction: {
      name: 'Michael Davis',
      age: 63,
      urgentNeeds: ['HEALTHCARE', 'TRANSPORTATION']
    }
  },

  // Education and job training
  {
    id: 'test-009',
    transcript: `Hi, Thomas Anderson speaking, I need help. I'm 22. I dropped out of high school but I 
    want to get my GED and learn a trade. I'm currently couch surfing and looking for stable housing.`,
    expectedExtraction: {
      name: 'Thomas Anderson',
      age: 22,
      urgentNeeds: ['EDUCATION', 'HOUSING']
    }
  },

  // Domestic violence and safety
  {
    id: 'test-010',
    transcript: `My name is Sarah Mitchell, I'm 31 years old. I left an abusive situation with my two 
    children and we're staying at a friend's house temporarily. I need immediate shelter, safety resources, 
    and childcare so I can look for work.`,
    expectedExtraction: {
      name: 'Sarah Mitchell',
      age: 31,
      urgentNeeds: ['SAFETY', 'HOUSING', 'CHILDCARE']
    }
  }
];

/**
 * Test mode configuration reader
 */
export function isTestModeEnabled(): boolean {
  return process.env.ENABLE_TEST_MODE === 'true';
}

export function isV1Stable(): boolean {
  return process.env.V1_STABLE === 'true';
}

export function getTestBatchSize(): number {
  return parseInt(process.env.TEST_BATCH_SIZE || '100', 10);
}

export function isDeterministicMode(): boolean {
  return process.env.TEST_DETERMINISTIC_MODE === 'true';
}

/**
 * Get a stubbed transcript for testing
 */
export function getStubbedTranscript(index: number = 0): { transcript: string; expected: any } {
  const test = TEST_TRANSCRIPTS[index % TEST_TRANSCRIPTS.length];
  return {
    transcript: test.transcript,
    expected: test.expectedExtraction
  };
}

/**
 * Get all test transcripts for batch testing
 */
export function getAllTestTranscripts() {
  return TEST_TRANSCRIPTS;
}
