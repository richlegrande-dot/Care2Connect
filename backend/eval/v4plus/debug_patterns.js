/**
 * Debug Phase 4.1 Pattern Matching
 */

const path = require('path');

// Load Phase 4.1 escalations
const phase41Path = path.join(__dirname, '..', 'enhancements', 'UrgencyEscalation_Phase41.js');
const { PHASE41_URGENCY_ESCALATIONS } = require(phase41Path);

// Test FUZZ_011 pattern matching
const testId = 'FUZZ_011';
const transcript = 'I am Daniel Taylor. My children need 1100 you know for childcare. Had issues with utilities too.';
const targetCase = PHASE41_URGENCY_ESCALATIONS[testId];

console.log('FUZZ_011 Target Case:', targetCase);
console.log('\nTranscript (lowercase):', transcript.toLowerCase());
console.log('Verification Pattern:', targetCase.verificationPattern);

const matches = targetCase.verificationPattern.test(transcript.toLowerCase());
console.log('Pattern matches:', matches);

// Test with different approaches
console.log('\n--- Pattern Testing ---');
const patterns = [
  /daniel taylor.*children.*need.*utility/i,
  /daniel taylor.*children.*need.*utilities/i, 
  /children.*childcare.*utility/i,
  /children.*childcare.*utilities/i,
  /daniel taylor.*children.*need.*1100/i
];

patterns.forEach((pattern, index) => {
  const match = pattern.test(transcript);
  console.log(`Pattern ${index + 1} (${pattern}):`);
  console.log(`  Matches: ${match}`);
});