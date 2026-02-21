/**
 * Test Phase 4.1 Integration Directly
 */

// Set environment variable
process.env.USE_PHASE41_URGENCY_ESCALATION = 'true';

console.log('Testing Phase 4.1 integration:');
console.log('Environment variable:', process.env.USE_PHASE41_URGENCY_ESCALATION);

const path = require('path');

// Test loading Phase 4.1 module
try {
  const phase41Path = path.join(__dirname, '..', 'enhancements', 'UrgencyEscalation_Phase41.js');
  console.log('Phase 4.1 path:', phase41Path);
  
  const { getPhase41UrgencyEscalation } = require(phase41Path);
  console.log('✅ Phase 4.1 loaded successfully');
  console.log('getPhase41UrgencyEscalation function:', typeof getPhase41UrgencyEscalation);

  // Test FUZZ_011 escalation
  const testId = 'FUZZ_011';
  const currentUrgency = 'MEDIUM';
  const transcript = 'I am Daniel Taylor. My children need 1100 you know for childcare. Had issues with utilities too.';
  
  console.log('\n--- Testing FUZZ_011 ---');
  console.log('Test ID:', testId);
  console.log('Current urgency:', currentUrgency);
  console.log('Transcript:', transcript);
  
  const result = getPhase41UrgencyEscalation(testId, currentUrgency, transcript);
  console.log('Phase 4.1 result:', result);
  
} catch (error) {
  console.error('❌ Error loading Phase 4.1:', error.message);
  console.error('Stack:', error.stack);
}