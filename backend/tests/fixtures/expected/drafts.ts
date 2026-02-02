/**
 * Expected GoFundMe Draft Values
 * 
 * These represent the expected output of the draft generation pipeline
 * for each transcript scenario.
 */

export const EXPECTED_DRAFTS = {
  complete: {
    title: 'Help Sarah Johnson and Family Avoid Homelessness',
    story: `Sarah Johnson, a 28-year-old mother of two young children (ages 5 and 7), is facing an urgent housing crisis. After losing her job at a local restaurant last month, she has fallen behind on rent and is now facing eviction from her apartment in Portland, Oregon.

Without immediate assistance, Sarah and her children may become homeless. She needs $1,500 to catch up on rent payments and keep a roof over her family's head.

Sarah is actively seeking employment and is committed to getting back on her feet. Your support during this difficult time will make a tremendous difference in ensuring her children have a stable home.`,
    goalAmount: 1500,
    category: 'Housing & Emergency Shelter',
    urgencyLevel: 'high',
    tags: ['housing', 'emergency', 'single_parent', 'eviction_prevention'],
    location: 'Portland, Oregon',
    contactName: 'Sarah Johnson',
    contactEmail: 'sarah.johnson@email.com',
    contactPhone: '555-123-4567',
    keyPoints: [
      'Lost job last month',
      'Facing eviction',
      'Has 2 children (ages 5 and 7)',
      'Needs $1500 for rent'
    ]
  },
  
  partial: {
    title: 'Help Mike Find Shelter This Winter',
    story: `Mike is facing homelessness as winter approaches in Chicago. He urgently needs a safe place to stay as temperatures drop.

Mike is without stable housing and is seeking temporary shelter to get through the harsh winter months. He is reachable by phone and is actively seeking assistance.

Your support can help Mike find safe shelter and work toward housing stability.`,
    goalAmount: null, // No specific amount mentioned
    category: 'Housing & Emergency Shelter',
    urgencyLevel: 'medium',
    tags: ['housing', 'shelter', 'winter', 'emergency'],
    location: 'Chicago',
    contactName: 'Mike',
    contactEmail: null,
    contactPhone: '555-999-8888',
    keyPoints: [
      'Needs place to stay',
      'Winter approaching',
      'No email access'
    ]
  },
  
  emergency: {
    title: 'Emergency Shelter Needed for Jennifer Martinez',
    story: `Jennifer Martinez, 35, was recently released from the hospital and has nowhere to go. After being forced to leave her previous living situation, she is now outside in freezing weather in Seattle with urgent medical needs.

Jennifer requires immediate emergency shelter due to her medical condition. She cannot safely remain on the street and needs help finding a warm, safe place to stay tonight.

This is a critical situation requiring immediate intervention. Your support can help Jennifer access emergency shelter and medical care.`,
    goalAmount: null,
    category: 'Housing & Emergency Shelter',
    urgencyLevel: 'high',
    tags: ['housing', 'emergency', 'medical', 'shelter', 'immediate'],
    location: 'Seattle',
    contactName: 'Jennifer Martinez',
    contactEmail: null,
    contactPhone: '555-234-5678',
    keyPoints: [
      'Just released from hospital',
      'Needs immediate shelter',
      'Medical condition',
      'Outside in freezing weather'
    ]
  },
  
  rental: {
    title: 'Help David Chen Prevent Eviction and Keep His Family Housed',
    story: `David Chen, a 42-year-old father of three, is facing eviction after falling three months behind on rent. David worked as a rideshare driver to support his family, but when his car broke down two weeks ago, he lost his income source and cannot afford repairs.

Without his vehicle, David cannot work, and his landlord has started the eviction process. He needs $3,000 to catch up on rent and prevent his family from losing their home in Los Angeles. His children attend local schools, and losing their housing would be devastating for the entire family.

David is committed to getting his car repaired and returning to work. Your support will help keep this family housed and stable during this difficult period.`,
    goalAmount: 3000,
    category: 'Housing & Emergency Shelter',
    urgencyLevel: 'high',
    tags: ['housing', 'eviction_prevention', 'family', 'rental_assistance'],
    location: 'Los Angeles, California',
    contactName: 'David Chen',
    contactEmail: 'davidchen1982@gmail.com',
    contactPhone: '555-876-5432',
    keyPoints: [
      'Car breakdown affecting income',
      '3 months behind on rent',
      'Eviction process started',
      'Has 3 children'
    ]
  }
};

/**
 * Missing fields for incomplete transcripts
 * Used to generate follow-up questions
 */
export const EXPECTED_MISSING_FIELDS = {
  dry: [
    'name',
    'age',
    'location',
    'email',
    'phone',
    'housing_needs',
    'goal_amount',
    'situation_description'
  ],
  
  partial: [
    'age',
    'email',
    'goal_amount',
    'employment_status',
    'detailed_situation'
  ],
  
  noname: [
    'name',
    'age',
    'email',
    'detailed_situation'
  ]
};

/**
 * Expected follow-up questions for incomplete data
 */
export const EXPECTED_FOLLOWUP_QUESTIONS = {
  dry: [
    'Could you please state your full name?',
    'What is your age?',
    'Where are you currently located (city/state)?',
    'What type of housing assistance do you need?',
    'How much financial assistance do you require?',
    'Can you describe your current situation?'
  ],
  
  partial: [
    'What is your age?',
    'Do you have an email address we can reach you at?',
    'How much financial assistance would help your situation?',
    'What is your current employment status?',
    'Can you provide more details about your housing situation?'
  ],
  
  emergency: [
    'Do you have an email address for follow-up communication?',
    'What specific amount would help with your emergency shelter needs?'
  ]
};
