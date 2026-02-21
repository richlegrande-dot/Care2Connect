const JanV3 = require('./eval/jan-v3-analytics-runner');

const transcript = "Hi there, this is Maria Santos and I really need help right now with my situation. My landlord is threatening eviction and I need about eighteen hundred dollars to catch up on rent.";

const evaluator = new JanV3();
const result = evaluator.parseFullTranscript(transcript);

console.log("Category:", result.extractedCategory);
console.log("Urgency:", result.extractedUrgencyLevel);
console.log("Amount:", result.extractedGoalAmount);
