const UrgencyServiceV2 = require('./backend/src/services/UrgencyAssessmentService_v2.js');

async function testV2Engine() {
  const service = new UrgencyServiceV2();
  
  // Test T001: Housing eviction (expected HIGH, getting lower)
  const t001_text = "Hi my name is Sarah Johnson and I need help with my rent. I'm about to be evicted and need fifteen hundred dollars to stay in my apartment.";
  const t001_result = await service.assessUrgency(t001_text, { category: 'HOUSING' });
  
  console.log('=== T001 Test (Expected: HIGH) ===');
  console.log('Text:', t001_text.substring(0, 80) + '...');
  console.log('Result:', t001_result.urgencyLevel);
  console.log('Score:', t001_result.score);
  console.log('Confidence:', t001_result.confidence);
  console.log('Reasons:', t001_result.reasons);
  console.log('Debug:', JSON.stringify(t001_result.debug, null, 2));
  
  console.log('\n=== T002 Test (Expected: CRITICAL) ===');
  // Test T002: Medical emergency (expected CRITICAL)
  const t002_text = "Hello, this is Michael Chen. My daughter was in a car accident and we need help paying for her surgery. The hospital says we need about eight thousand dollars for the operation.";
  const t002_result = await service.assessUrgency(t002_text, { category: 'HEALTHCARE' });
  
  console.log('Text:', t002_text.substring(0, 80) + '...');
  console.log('Result:', t002_result.urgencyLevel);
  console.log('Score:', t002_result.score);
  console.log('Confidence:', t002_result.confidence);
  console.log('Reasons:', t002_result.reasons);
  console.log('Debug:', JSON.stringify(t002_result.debug, null, 2));
}

testV2Engine().catch(console.error);