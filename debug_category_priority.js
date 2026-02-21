// Debug script to analyze category_priority_violated cases
const JanV3AnalyticsEvaluator = require('./backend/eval/jan-v3-analytics-runner.js');

const evaluator = new JanV3AnalyticsEvaluator();

const testCases = [
    {
        id: 'HARD_031',
        transcriptText: "Someone threatening family...need $2,500 for rent/move", // Based on grep result
        expected: { category: 'SAFETY' }
    },
    {
        id: 'HARD_032', 
        transcriptText: "Need help with rent and medical bills, lost my job", // Hypothetical based on pattern
        expected: { category: 'HEALTHCARE' } // Assume healthcare priority  
    },
    {
        id: 'HARD_034',
        transcriptText: "Hi, this is Olivia Brooks. I need help with housing, lost my job, and my daughter needs surgery. I'm asking for $4,000 total.",
        expected: { category: 'HEALTHCARE' } // Surgery = CRITICAL, should win
    }
];

console.log('=== CATEGORY PRIORITY VIOLATION ANALYSIS ===\n');

(async () => {
  for (const testCase of testCases) {
    console.log(`--- ${testCase.id} ---`);
    console.log('Input:', testCase.transcriptText);
    console.log('Expected category:', testCase.expected.category);
    
    try {
        const result = await evaluator.simulateEnhancedParsing(testCase);

        const detectedCategory = result.results?.category;
        console.log('Detected category:', detectedCategory);
        console.log('Match:', detectedCategory === testCase.expected.category ? '✅ PASS' : '❌ FAIL');
        console.log('');
    } catch (error) {
        console.log('Error:', error.message);
        console.log('');
    }
  }

  console.log('=== DETAILED ANALYSIS FOR HARD_034 ===');
  // Let's debug the specific logic for HARD_034 which should be HEALTHCARE
  const hard34Case = {
    id: 'HARD_034_DEBUG',
    transcriptText: "Hi, this is Olivia Brooks. I need help with housing, lost my job, and my daughter needs surgery. I'm asking for $4,000 total."
  };
  
  try {
    const hard34Result = await evaluator.simulateEnhancedParsing(hard34Case);

    console.log('Result:', {
      category: hard34Result.results?.category,
      urgency: hard34Result.results?.urgencyLevel,
      amount: hard34Result.results?.goalAmount,
      name: hard34Result.results?.name
    });

    // Check what this should detect:
    const text = hard34Case.transcriptText;

    console.log('\nPattern analysis:');
    console.log('- Has housing keywords:', /(housing|rent|apartment|lease|landlord|evict)/i.test(text));
    console.log('- Has employment keywords:', /(job|work|employ|laid off|fired)/i.test(text)); 
    console.log('- Has healthcare keywords:', /(surgery|medical|doctor|healthcare|hospital|treatment)/i.test(text));
    console.log('- Has surgery (CRITICAL):', /surgery/i.test(text));

    console.log('\nExpected priority: HEALTHCARE should win because surgery = CRITICAL urgency');
    console.log('Priority order: SAFETY > LEGAL > HEALTHCARE > EMERGENCY > HOUSING > EMPLOYMENT > EDUCATION > FAMILY');
  } catch (error) {
    console.log('Error in detailed analysis:', error.message);
  }
})();