/**
 * Targeted test for Phase 4.7 - T009 and T019 regression validation
 */

const path = require('path');

// Test transcript samples from T009 and T019
const testCases = [
    {
        id: 'T009',
        transcript: "Hi, this is Sarah from Boston. We need help with college expenses. Our daughter is going to start college in the fall, and we're not sure how we're going to cover everything. My husband and I live in Portland Oregon and need about four thousand dollars for tuition. We've applied for financial aid but are still waiting to hear back. Is there anything you can do to help us? Our daughter has been looking forward to this for years, and we don't want to disappoint her. Please let me know what kind of assistance might be available.",
        expected: { urgency: 'MEDIUM' },
        current: { urgency: 'HIGH' }  // Over-assessed
    },
    {
        id: 'T019', 
        transcript: "Hello, this is Mark Davis. My son has a chronic condition that requires expensive medication costs. The pharmacy says it'll be between fifteen hundred and two thousand dollars per month. We're trying to figure out how to afford his treatment. I'm a single dad and work full time, but it's still not enough to cover these medical expenses. Can you provide any assistance or point us toward resources that might help? We live here in Arizona and really need some guidance.",
        expected: { urgency: 'MEDIUM' },
        current: { urgency: 'HIGH' }  // Over-assessed  
    }
];

async function testPhase47() {
    console.log('🎯 Phase 4.7 Targeted Test - T009 & T019 Regression Cases');
    console.log('=======================================================');
    
    // Load Phase 4.7
    const phase47Path = path.join(__dirname, 'PrecisionUrgencyCorrection_Phase47.js');
    const PrecisionUrgencyCorrection_Phase47 = require(phase47Path);
    const phase47 = new PrecisionUrgencyCorrection_Phase47();
    
    for (const testCase of testCases) {
        console.log(`\n--- Testing ${testCase.id} ---`);
        console.log(`Transcript: "${testCase.transcript.substring(0, 60)}..."`);
        console.log(`Expected: ${testCase.expected.urgency}, Current: ${testCase.current.urgency}`);
        
        const result = phase47.applyCorrection(testCase.transcript, {
            urgency: testCase.current.urgency,
            name: 'Test User',
            category: 'EDUCATION',
            goalAmount: 4000
        });
        
        console.log(`Phase 4.7 Result: ${result.urgency}`);
        console.log(`Applied: ${result.phase47Applied || false}`);
        console.log(`Reason: ${result.phase47Reason || 'No correction'}`);
        
        const fixed = result.urgency === testCase.expected.urgency;
        console.log(`✅ ${fixed ? 'FIXED' : 'STILL FAILING'}: ${testCase.current.urgency} → ${result.urgency}`);
    }
}

// Run the test
testPhase47().catch(console.error);