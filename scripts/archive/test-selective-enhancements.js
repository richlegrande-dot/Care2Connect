// Test selective enhancement logic
const UrgencyEnhancements = require('./backend/src/services/UrgencyEnhancements_v1b.js');

console.log('Testing selective v1b enhancements:\n');

// T001: Expected HIGH (0.47+), should NOT boost to CRITICAL (0.77+) 
const t001Text = "Hi my name is Sarah Johnson and I need help with my rent. I'm about to be evicted and need fifteen hundred dollars to stay in my apartment.";
const t001BaseAssessment = { score: 0.60, urgency: 'HIGH', reasons: ['eviction_context'] }; // Simulated HIGH baseline
console.log('T001 (eviction, expected HIGH):');
console.log('  Base assessment:', t001BaseAssessment);
const t001Enhanced = UrgencyEnhancements.enhanceAssessment(t001Text, t001BaseAssessment);
console.log('  Enhanced assessment:', t001Enhanced);
console.log('  Correct? Should stay HIGH, not boost to CRITICAL');
console.log();

// T002: Expected CRITICAL (0.77+), if coming in as MEDIUM should boost to CRITICAL
const t002Text = "Hello, this is Michael Chen. My daughter was in a car accident and we need help paying for her surgery. The hospital says we need about eight thousand dollars for the operation.";
const t002BaseAssessment = { score: 0.45, urgency: 'MEDIUM', reasons: ['medical_context'] }; // Simulated under-assessment
console.log('T002 (surgery emergency, expected CRITICAL):');
console.log('  Base assessment:', t002BaseAssessment);
const t002Enhanced = UrgencyEnhancements.enhanceAssessment(t002Text, t002BaseAssessment);
console.log('  Enhanced assessment:', t002Enhanced);
console.log('  Correct? Should boost from MEDIUM to CRITICAL (0.77+)');
console.log();

// Test thresholds
console.log('Urgency thresholds:');
console.log('  CRITICAL: >=0.77');
console.log('  HIGH: >=0.47'); 
console.log('  MEDIUM: >=0.15');
console.log('  LOW: <0.15');

function getUrgencyLevel(score) {
  if (score >= 0.77) return 'CRITICAL';
  if (score >= 0.47) return 'HIGH';
  if (score >= 0.15) return 'MEDIUM';
  return 'LOW';
}

console.log('\nFinal urgency levels:');
console.log(`T001: ${getUrgencyLevel(t001Enhanced.score)} (${t001Enhanced.score.toFixed(2)})`);
console.log(`T002: ${getUrgencyLevel(t002Enhanced.score)} (${t002Enhanced.score.toFixed(2)})`);