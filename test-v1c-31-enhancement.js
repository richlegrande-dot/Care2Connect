/**
 * test-v1c-31-enhancement.js - V1c_3.1 Conservative Enhancement Test Script
 * 
 * Tests the refined V1c_3.1 conservative urgency enhancement against baseline
 * Ensures no regression below 304 cases (51.53% V1b+V2a proven baseline)
 * Target: 308-312 cases (52.2-52.9%) with +5-8 case improvement
 */

const path = require('path');

// Set V1c_3.1 environment variables for this test
process.env.USE_V1C_31_ENHANCEMENTS = 'true';
process.env.USE_V2A_ENHANCEMENTS = 'true'; // Keep proven V2a category enhancements
process.env.DEBUG_URGENCY_V1C_31 = 'true';

// Disable other versions to test V1c_3.1 isolation
process.env.USE_V1B_ENHANCEMENTS = 'false';
process.env.USE_V1C_ENHANCEMENTS = 'false';
process.env.USE_V1D_PRECISION_TUNING = 'false';
process.env.USE_V1D_31_PRECISION_TUNING = 'false';
process.env.USE_V2B_ENHANCEMENTS = 'false';

console.log('='.repeat(80));
console.log('V1c_3.1 CONSERVATIVE ENHANCEMENT TEST');
console.log('='.repeat(80));
console.log('Configuration:');
console.log('- V1c_3.1: ✅ ENABLED (Conservative patterns, max 0.15 boost)');
console.log('- V2a: ✅ ENABLED (Proven category intelligence)');
console.log('- V1b: ❌ DISABLED (Testing V1c_3.1 independently)');
console.log('- V1c: ❌ DISABLED (Replaced by V1c_3.1)');
console.log('- V1d/V1d_3.1: ❌ DISABLED (Testing urgency only)');
console.log('- V2b: ❌ DISABLED (Testing without category conflicts)');
console.log('Target: 308-312 cases (52.2-52.9%) with no regression below 304');
console.log('='.repeat(80));

async function runV1c31Test() {
    try {
        // Test configuration with V1c_3.1 + V2a baseline
        const config = {
            urgencyService: 'USE_V1C_31_ENHANCEMENTS=true', // V1c_3.1 conservative enhancement
            categoryService: 'USE_V2A_ENHANCEMENTS=true',   // Proven V2a category intelligence
            testName: 'V1c_3.1_Conservative_Enhancement',
            description: 'V1c_3.1 Conservative Urgency Enhancement (max 0.15 boost) with V2a Category Intelligence',
            baseline: {
                cases: 304,
                percentage: 51.53,
                version: 'V1b+V2a_Proven_Baseline'
            },
            target: {
                min: 308,
                max: 312,
                percentage: '52.2-52.9%',
                improvement: '+5-8 cases'
            },
            regressionThreshold: 304, // Strict no regression policy
            expectation: 'Conservative improvement without destabilizing proven baseline'
        };

        console.log('Loading Jan V3+ Analytics Runner...');
        const analyticsRunnerPath = path.resolve(__dirname, './backend/eval/jan-v3-analytics-runner.js');
        const JanV3AnalyticsEvaluator = require(analyticsRunnerPath);
        
        // Create evaluator instance and run the analysis
        const evaluator = new JanV3AnalyticsEvaluator();
        
        console.log(`\n📊 Testing Configuration:`);
        console.log(`   Enhancement: ${config.testName}`);
        console.log(`   Description: ${config.description}`);
        console.log(`   Baseline: ${config.baseline.cases} cases (${config.baseline.percentage}%)`);
        console.log(`   Target: ${config.target.min}-${config.target.max} cases (${config.target.percentage})`);
        console.log(`   Regression Threshold: < ${config.regressionThreshold} cases = FAILURE`);
        console.log('');

        console.log('🚀 Running V1c_3.1 Conservative Enhancement Test...');
        const results = await evaluator.runJanV3Evaluation();
        
        console.log('\n' + '='.repeat(80));
        console.log('V1c_3.1 CONSERVATIVE ENHANCEMENT RESULTS');
        console.log('='.repeat(80));
        
        const passRate = results.summary.strictPassRate;
        const totalPasses = results.summary.strictPasses;
        const totalCases = results.metadata.totalCases;
        
        console.log(`📈 Performance Results:`);
        console.log(`   Total Cases: ${totalCases}`);
        console.log(`   Passed Cases: ${totalPasses}`);
        console.log(`   Pass Rate: ${passRate}%`);
        console.log(`   Score: ${totalPasses}/${totalCases}`);
        
        // Calculate improvement from baseline
        const baselineCases = config.baseline.cases;
        const improvement = totalPasses - baselineCases;
        const improvementPercentage = ((totalPasses / baselineCases - 1) * 100).toFixed(2);
        
        console.log(`\n📊 Baseline Comparison:`);
        console.log(`   Baseline (V1b+V2a): ${baselineCases} cases (${config.baseline.percentage}%)`);
        console.log(`   V1c_3.1 Result: ${totalPasses} cases (${passRate}%)`);
        console.log(`   Change: ${improvement > 0 ? '+' : ''}${improvement} cases (${improvementPercentage > 0 ? '+' : ''}${improvementPercentage}%)`);
        
        // Regression check
        const regressionThreshold = config.regressionThreshold;
        const hasRegression = totalPasses < regressionThreshold;
        
        console.log(`\n🛡️ Regression Analysis:`);
        console.log(`   Regression Threshold: ${regressionThreshold} cases`);
        console.log(`   Current Result: ${totalPasses} cases`);
        console.log(`   Status: ${hasRegression ? '❌ REGRESSION DETECTED' : '✅ NO REGRESSION'}`);
        
        // Target achievement check
        const targetMin = config.target.min;
        const targetMax = config.target.max;
        const achievedTarget = totalPasses >= targetMin && totalPasses <= targetMax;
        const exceededTarget = totalPasses > targetMax;
        
        console.log(`\n🎯 Target Achievement:`);
        console.log(`   Target Range: ${targetMin}-${targetMax} cases`);
        console.log(`   Achieved: ${totalPasses} cases`);
        console.log(`   Status: ${achievedTarget ? '✅ TARGET ACHIEVED' : (exceededTarget ? '🎉 TARGET EXCEEDED' : '⚠️ BELOW TARGET')}`);
        
        // Overall assessment
        console.log(`\n📋 Overall Assessment:`);
        let overallStatus = 'UNKNOWN';
        let nextActions = [];
        
        if (hasRegression) {
            overallStatus = '❌ FAILED - REGRESSION';
            nextActions.push('Disable V1c_3.1 enhancement');
            nextActions.push('Return to proven V1b+V2a baseline');
            nextActions.push('Investigate V1c_3.1 patterns for over-aggressive adjustments');
        } else if (improvement <= 0) {
            overallStatus = '⚠️ NEUTRAL - NO IMPROVEMENT';
            nextActions.push('Consider refining V1c_3.1 patterns for better targeting');
            nextActions.push('V1c_3.1 may be too conservative, evaluate pattern thresholds');
            nextActions.push('Proceed with V1d_3.1 testing as planned');
        } else if (achievedTarget || exceededTarget) {
            overallStatus = '✅ SUCCESS';
            nextActions.push('V1c_3.1 validated for production use');
            nextActions.push('Proceed with V1d_3.1 boundary precision tuning');
            nextActions.push('Document V1c_3.1 success patterns for future use');
        } else {
            overallStatus = '📈 PARTIAL SUCCESS';
            nextActions.push('V1c_3.1 shows improvement but below target');
            nextActions.push('Consider proceeding with V1d_3.1 to achieve cumulative gains');
            nextActions.push('Monitor for any stability issues');
        }
        
        console.log(`   Status: ${overallStatus}`);
        console.log(`   Improvement: ${improvement} cases from baseline`);
        
        console.log(`\n📝 Next Actions:`);
        nextActions.forEach((action, index) => {
            console.log(`   ${index + 1}. ${action}`);
        });
        
        // Performance breakdown
        console.log(`\n📊 Detailed Performance Breakdown:`);
        if (results.summary.urgencyBreakdown) {
            console.log(`   Urgency Classification:`);
            Object.entries(results.summary.urgencyBreakdown).forEach(([level, data]) => {
                console.log(`     ${level}: ${data.correct}/${data.total} (${data.percentage}%)`);
            });
        }
        
        if (results.summary.categoryBreakdown) {
            console.log(`   Category Classification:`);
            Object.entries(results.summary.categoryBreakdown).forEach(([category, data]) => {
                console.log(`     ${category}: ${data.correct}/${data.total} (${data.percentage}%)`);
            });
        }
        
        // V1c_3.1 specific enhancements
        console.log(`\n🔧 V1c_3.1 Enhancement Analysis:`);
        console.log(`   Conservative Design: Max 0.15 total boost (vs V1c 0.5 boost)`);
        console.log(`   Precision Targeting: 0.35-0.6 sweet spot range only`);
        console.log(`   High-Confidence Patterns: Family crisis, medical emergency, housing critical`);
        console.log(`   Integration: Non-destructive coordination with V2a category intelligence`);
        
        // Export results for further analysis
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultData = {
            test: config.testName,
            timestamp: timestamp,
            configuration: config,
            results: {
                totalCases: totalCases,
                passedCases: totalPasses,
                passRate: passRate,
                improvement: improvement,
                improvementPercentage: parseFloat(improvementPercentage),
                hasRegression: hasRegression,
                achievedTarget: achievedTarget,
                overallStatus: overallStatus
            },
            rawResults: results
        };
        
        const fs = require('fs');
        const resultsDir = path.resolve(__dirname, './backend/eval/v4plus/reports');
        
        // Ensure reports directory exists
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }
        
        const resultsPath = path.resolve(resultsDir, `v1c_31_test_${timestamp}.json`);
        fs.writeFileSync(resultsPath, JSON.stringify(resultData, null, 2));
        console.log(`\n💾 Results saved to: ${resultsPath}`);
        
        console.log('\n' + '='.repeat(80));
        console.log('V1c_3.1 CONSERVATIVE ENHANCEMENT TEST COMPLETE');
        console.log('='.repeat(80));
        
        return resultData;
        
    } catch (error) {
        console.error('❌ Error running V1c_3.1 test:', error);
        console.error('Stack trace:', error.stack);
        throw error;
    }
}

// Run the test if this script is executed directly
if (require.main === module) {
    runV1c31Test().then((results) => {
        console.log('\n✅ V1c_3.1 test completed successfully');
        process.exit(0);
    }).catch((error) => {
        console.error('\n❌ V1c_3.1 test failed:', error.message);
        process.exit(1);
    });
}

module.exports = { runV1c31Test };