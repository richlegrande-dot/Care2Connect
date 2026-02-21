/**
 * V1d_3.2 Corrective Precision Test Script
 * 
 * Tests the V1d_3.2 implementation against specific failing test cases
 * identified in the root cause analysis to validate surgical corrections.
 */

const UrgencyEnhancements_v1d_32 = require('../backend/services/UrgencyEnhancements_v1d_32');
const path = require('path');

class V1d32TestValidator {
  constructor() {
    this.v1d32 = new UrgencyEnhancements_v1d_32();
    this.testCases = this.getFailingTestCases();
  }

  getFailingTestCases() {
    return {
      'T002': {
        expected: { urgencyLevel: 'CRITICAL' },
        baselineScore: 0.65, // Estimated baseline score that resulted in HIGH instead of CRITICAL
        transcriptText: "Hello, this is Michael Chen. My daughter was in a car accident and we need help paying for her surgery. The hospital says we need about eight thousand dollars for the operation.",
        expectedCorrection: '+0.15 boost',
        targetThreshold: 0.77
      },
      'T015': {
        expected: { urgencyLevel: 'HIGH' },
        baselineScore: 0.40, // Estimated baseline score that resulted in MEDIUM instead of HIGH  
        transcriptText: "I prefer not to give my name but I really need help. My family is facing eviction and we need about two thousand five hundred dollars to stay in our home. This is very urgent.",
        expectedCorrection: '+0.08 boost',
        targetThreshold: 0.47
      },
      'T025': {
        expected: { urgencyLevel: 'HIGH' },
        baselineScore: 0.42, // Estimated baseline score that resulted in MEDIUM instead of HIGH
        transcriptText: "Hi there, this is Maria Santos and I really need help right now with my situation. My landlord is threatening eviction and I need about eighteen hundred dollars to catch up on rent.",
        expectedCorrection: '+0.08 boost', 
        targetThreshold: 0.47
      },
      'T023': {
        expected: { urgencyLevel: 'MEDIUM' },
        baselineScore: 0.58, // Estimated baseline score that was over-boosted to HIGH by V1c_3.1
        transcriptText: "Hi, um, my name is... well, my name is Linda Torres, Linda Torres. I need help, I really need help with my mother's care. She's in the hospital and the bills are piling up. The bills are really piling up. We need maybe four thousand dollars, maybe four thousand to help with the costs.",
        expectedCorrection: '-0.05 dampen',
        targetThreshold: 0.55
      },
      'T024': {
        expected: { urgencyLevel: 'MEDIUM' },
        baselineScore: 0.28, // Estimated baseline score that was under-assessed to LOW
        transcriptText: "Hello, this is Brian Anderson. I lost my job and my wife is sick. We need help with basic living expenses. I think we need a couple thousand dollars to get through the next few months.",
        expectedCorrection: '+0.04 boost',
        targetThreshold: 0.30
      }
    };
  }

  runValidation() {
    console.log('🧪 V1d_3.2 Corrective Precision Validation');
    console.log('═══════════════════════════════════════════════════════════════');
    
    let passCount = 0;
    let totalTests = Object.keys(this.testCases).length;

    Object.entries(this.testCases).forEach(([testId, testCase]) => {
      const result = this.validateTestCase(testId, testCase);
      if (result.passed) passCount++;
    });

    console.log('\n📊 VALIDATION SUMMARY');
    console.log('───────────────────────────────────────────────────────────────');
    console.log(`Tests Passed: ${passCount}/${totalTests} (${(passCount/totalTests*100).toFixed(1)}%)`);
    console.log(`Tests Failed: ${totalTests - passCount}/${totalTests}`);
    
    if (passCount === totalTests) {
      console.log('✅ ALL TESTS PASSED - V1d_3.2 ready for implementation');
    } else {
      console.log('❌ SOME TESTS FAILED - V1d_3.2 needs refinement');
    }

    return { passed: passCount, total: totalTests, success: passCount === totalTests };
  }

  validateTestCase(testId, testCase) {
    console.log(`\n🔍 Testing ${testId}: ${testCase.expected.urgencyLevel}`);
    console.log(`   Baseline Score: ${testCase.baselineScore}`);
    console.log(`   Expected: ${testCase.expectedCorrection}`);
    console.log(`   Target: ${testCase.targetThreshold}+ threshold`);

    const story = { transcriptText: testCase.transcriptText };
    
    // Test pattern analysis
    const patternAnalysis = this.v1d32.analyzePatternMatches(story);
    console.log(`   Patterns: ${JSON.stringify(patternAnalysis.patterns)}`);

    // Test correction application
    const correctedScore = this.v1d32.tuneUrgencyPrecision(
      story, 
      testCase.baselineScore, 
      { category: testCase.expected.urgencyLevel }
    );

    const adjustment = correctedScore - testCase.baselineScore;
    const adjustmentStr = adjustment > 0 ? `+${adjustment.toFixed(3)}` : `${adjustment.toFixed(3)}`;
    
    console.log(`   Applied: ${adjustmentStr} correction`);
    console.log(`   Result: ${testCase.baselineScore} → ${correctedScore.toFixed(3)}`);

    // Validate correction meets expectations
    const result = this.evaluateCorrection(testId, testCase, correctedScore, adjustment);
    console.log(`   Status: ${result.passed ? '✅ PASS' : '❌ FAIL'} - ${result.reason}`);

    return result;
  }

  evaluateCorrection(testId, testCase, correctedScore, adjustment) {
    const result = { passed: false, reason: '', correctedScore, adjustment };

    // Check if correction moves score in the right direction
    if (testCase.expectedCorrection.startsWith('+')) {
      // Should boost score
      if (adjustment <= 0) {
        result.reason = `Expected boost but got ${adjustment.toFixed(3)}`;
        return result;
      }
      
      // Check if boost reaches target threshold
      if (correctedScore < testCase.targetThreshold) {
        result.reason = `Boost insufficient: ${correctedScore.toFixed(3)} < ${testCase.targetThreshold}`;
        return result;
      }
    } else if (testCase.expectedCorrection.startsWith('-')) {
      // Should dampen score
      if (adjustment >= 0) {
        result.reason = `Expected dampen but got ${adjustment.toFixed(3)}`;
        return result;
      }

      // Check if dampening brings score below problematic threshold
      if (correctedScore >= testCase.targetThreshold) {
        result.reason = `Dampen insufficient: ${correctedScore.toFixed(3)} >= ${testCase.targetThreshold}`;
        return result;
      }
    }

    // Validate adjustment magnitude is reasonable (not too extreme)
    const expectedMagnitude = parseFloat(testCase.expectedCorrection.replace(/[+-]/, '').split(' ')[0]);
    const actualMagnitude = Math.abs(adjustment);
    
    if (Math.abs(actualMagnitude - expectedMagnitude) > 0.03) {
      result.reason = `Adjustment magnitude off: expected ~${expectedMagnitude}, got ${actualMagnitude.toFixed(3)}`;
      return result;
    }

    result.passed = true;
    result.reason = 'Correction applied successfully within expected parameters';
    return result;
  }

  testPatternCoverage() {
    console.log('\n🔍 PATTERN COVERAGE ANALYSIS');
    console.log('───────────────────────────────────────────────────────────────');

    const patternCounts = {
      critical: 0,
      high: 0,
      medium_boost: 0,
      medium_dampen: 0
    };

    Object.entries(this.testCases).forEach(([testId, testCase]) => {
      const story = { transcriptText: testCase.transcriptText };
      const analysis = this.v1d32.analyzePatternMatches(story);
      
      if (analysis.patterns.critical.length > 0) patternCounts.critical++;
      if (analysis.patterns.high.length > 0) patternCounts.high++;
      if (analysis.patterns.medium.includes('job_loss_family_stress_boost')) patternCounts.medium_boost++;
      if (analysis.patterns.medium.includes('non_critical_medical_dampen')) patternCounts.medium_dampen++;
    });

    console.log(`Critical Patterns: ${patternCounts.critical}/1 expected (T002)`);
    console.log(`High Patterns: ${patternCounts.high}/2 expected (T015, T025)`);
    console.log(`Medium Boost: ${patternCounts.medium_boost}/1 expected (T024)`);
    console.log(`Medium Dampen: ${patternCounts.medium_dampen}/1 expected (T023)`);

    const totalExpected = 5;
    const totalMatched = Object.values(patternCounts).reduce((sum, count) => sum + count, 0);
    
    console.log(`Overall Coverage: ${totalMatched}/${totalExpected} (${(totalMatched/totalExpected*100).toFixed(1)}%)`);
    
    return totalMatched === totalExpected;
  }
}

// Main execution
if (require.main === module) {
  const validator = new V1d32TestValidator();
  
  console.log('🎯 V1d_3.2 Design Validation Starting...\n');
  
  const coverageResult = validator.testPatternCoverage();
  const validationResult = validator.runValidation();
  
  console.log('\n' + '═'.repeat(65));
  console.log('📋 FINAL DESIGN VALIDATION REPORT');
  console.log('═'.repeat(65));
  console.log(`Pattern Coverage: ${coverageResult ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
  console.log(`Test Validation: ${validationResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Overall Status: ${coverageResult && validationResult.success ? '✅ READY FOR IMPLEMENTATION' : '❌ NEEDS REFINEMENT'}`);
  
  if (coverageResult && validationResult.success) {
    console.log('\n🚀 V1d_3.2 design validated successfully!');
    console.log('Next step: Integrate into UrgencyAssessmentService.js');
  } else {
    console.log('\n⚠️  V1d_3.2 design needs refinement before implementation.');
  }
}

module.exports = V1d32TestValidator;