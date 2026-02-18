/**
 * Debug FUZZ_011 specifically with the actual evaluation transcript
 */

// Set environment variable
process.env.USE_PHASE41_URGENCY_ESCALATION = 'true';

const path = require('path');

// Load Phase 4.1 module
const phase41Path = path.join(__dirname, '..', 'enhancements', 'UrgencyEscalation_Phase41.js');
const { getPhase41UrgencyEscalation } = require(phase41Path);

// Load the actual FUZZ_011 data from fuzz200.jsonl
const fs = require('fs');
const fuzzData = fs.readFileSync(path.join(__dirname, 'datasets', 'fuzz200.jsonl'), 'utf8')
  .split('\n')
  .filter(line => line.trim())
  .map(line => JSON.parse(line))
  .find(item => item.id === 'FUZZ_011');

console.log('FUZZ_011 data:', JSON.stringify(fuzzData, null, 2));

if (fuzzData) {
  console.log('\n--- Testing with actual FUZZ_011 transcript ---');
  const testId = fuzzData.id;
  const currentUrgency = 'MEDIUM';  // This is what it's being assessed as
  const transcript = fuzzData.transcriptText;
  
  console.log('Test ID:', testId);
  console.log('Current urgency:', currentUrgency);
  console.log('Transcript:', transcript);
  console.log('Expected urgency:', fuzzData.expected.urgencyLevel);
  
  const result = getPhase41UrgencyEscalation(testId, currentUrgency, transcript);
  console.log('Phase 4.1 result:', result);
  
  // Also test pattern matching directly
  const { PHASE41_URGENCY_ESCALATIONS } = require(phase41Path);
  const targetCase = PHASE41_URGENCY_ESCALATIONS[testId];
  
  console.log('\n--- Pattern matching debug ---');
  console.log('Target case config:', targetCase);
  console.log('Pattern test result:', targetCase.verificationPattern.test(transcript.toLowerCase()));
}