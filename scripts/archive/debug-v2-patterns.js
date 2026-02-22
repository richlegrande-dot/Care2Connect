const UrgencyServiceV2 = require('./backend/src/services/UrgencyAssessmentService_v2.js');

async function debugPatternMatching() {
  // Test the individual layers
  const service = new UrgencyServiceV2();
  
  // Test temporal layer
  console.log('=== Testing Temporal Layer ===');
  const t001_text = "Hi my name is Sarah Johnson and I need help with my rent. I'm about to be evicted and need fifteen hundred dollars to stay in my apartment.";
  
  const temporalResult = service.temporalLayer.assess(t001_text);
  console.log('T001 Temporal:', temporalResult);
  
  // Test crisis layer
  console.log('\n=== Testing Crisis Layer ===');
  const crisisResult = service.crisisLayer.assess(t001_text);
  console.log('T001 Crisis:', crisisResult);
  
  // Test some specific patterns manually
  console.log('\n=== Manual Pattern Tests ===');
  const evictionPattern = /\b(?:eviction\s+notice.*(?:yesterday|today|tomorrow))\b/i;
  const aboutToBeEvictedPattern = /\b(?:about\s+to\s+be\s+evicted)\b/i;
  
  console.log('Eviction notice pattern:', evictionPattern.test(t001_text));
  console.log('About to be evicted pattern:', aboutToBeEvictedPattern.test(t001_text));
  
  // Test T002
  console.log('\n=== T002 Tests ===');
  const t002_text = "Hello, this is Michael Chen. My daughter was in a car accident and we need help paying for her surgery. The hospital says we need about eight thousand dollars for the operation.";
  
  const t002_temporal = service.temporalLayer.assess(t002_text);
  const t002_crisis = service.crisisLayer.assess(t002_text);
  
  console.log('T002 Temporal:', t002_temporal);
  console.log('T002 Crisis:', t002_crisis);
  
  // Test surgery pattern
  const surgeryPattern = /\b(?:surgery.*(?:today|tomorrow|this\s+week))\b/i;
  console.log('Surgery pattern (should NOT match):', surgeryPattern.test(t002_text));
  
  const surgeryGeneralPattern = /\bsurgery\b/i;
  console.log('Surgery general pattern:', surgeryGeneralPattern.test(t002_text));
}

debugPatternMatching().catch(console.error);