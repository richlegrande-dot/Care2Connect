/**
 * V1c_3.1 Failure Root Cause Analysis Tool
 * 
 * Analyzes specific failure patterns between V1c_3.1+V2a and V1b+V2a baseline
 * to identify systematic issues and design corrective measures for V1d_3.2
 */

const fs = require('fs');
const path = require('path');

class V1cFailureAnalyzer {
  constructor() {
    this.reportsDir = path.join(__dirname, '../backend/eval/v4plus/reports');
    this.baseline = null;
    this.v1c31 = null;
  }

  loadReports() {
    // Load the most recent V1c_3.1 and baseline reports
    const files = fs.readdirSync(this.reportsDir)
      .filter(f => f.includes('v4plus_all500') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length < 2) {
      throw new Error('Need at least 2 evaluation reports to compare');
    }

    // V1c_3.1 report (2026-02-07T15-31-48)
    this.v1c31 = JSON.parse(fs.readFileSync(
      path.join(this.reportsDir, 'v4plus_all500_2026-02-07T15-31-48-809Z.json'), 
      'utf8'
    ));

    // Baseline V1b+V2a report (2026-02-07T15-32-52)  
    this.baseline = JSON.parse(fs.readFileSync(
      path.join(this.reportsDir, 'v4plus_all500_2026-02-07T15-32-52-353Z.json'),
      'utf8'
    ));

    console.log('📊 Reports Loaded:');
    console.log(`   V1c_3.1+V2a: ${this.v1c31.summary.strictPasses}/590 (${this.v1c31.summary.strictPassRate})`);
    console.log(`   V1b+V2a (Baseline): ${this.baseline.summary.strictPasses}/590 (${this.baseline.summary.strictPassRate})`);
    console.log(`   Delta: ${this.v1c31.summary.strictPasses - this.baseline.summary.strictPasses} cases`);
  }

  analyzeFailureBucketChanges() {
    console.log('\n🔍 FAILURE BUCKET ANALYSIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const baseline = this.baseline.failureBuckets.top10Strict;
    const v1c31 = this.v1c31.failureBuckets.top10Strict;

    // Create lookup maps
    const baselineMap = {};
    const v1c31Map = {};
    
    baseline.forEach(bucket => baselineMap[bucket.bucket] = bucket);
    v1c31.forEach(bucket => v1c31Map[bucket.bucket] = bucket);

    // Analyze changes
    const allBuckets = new Set([...Object.keys(baselineMap), ...Object.keys(v1c31Map)]);
    
    console.log('| Failure Bucket | Baseline | V1c_3.1 | Change | Analysis |');
    console.log('|----------------|----------|---------|---------|----------|');

    for (const bucket of allBuckets) {
      const baseCount = baselineMap[bucket]?.count || 0;
      const v1cCount = v1c31Map[bucket]?.count || 0;
      const change = v1cCount - baseCount;
      const changeStr = change > 0 ? `+${change}` : `${change}`;
      const analysis = this.getChangeAnalysis(bucket, change);

      console.log(`| ${bucket.replace('_', ' ')} | ${baseCount} | ${v1cCount} | ${changeStr} | ${analysis} |`);
    }

    return { baselineMap, v1c31Map };
  }

  getChangeAnalysis(bucket, change) {
    if (change === 0) return 'No change';
    if (change > 0) {
      switch (bucket) {
        case 'urgency_over_assessed':
          return '🔴 V1c_3.1 causing more over-assessment';
        case 'urgency_under_assessed':
          return '🔴 V1c_3.1 causing more under-assessment';
        case 'category_wrong':
          return '⚠️ Category degradation';
        default:
          return '📈 Increased failures';
      }
    } else {
      switch (bucket) {
        case 'urgency_over_assessed':
          return '✅ V1c_3.1 reducing over-assessment';
        case 'urgency_under_assessed':
          return '✅ V1c_3.1 reducing under-assessment';
        case 'category_wrong':
          return '✅ Category improvement';
        default:
          return '📉 Reduced failures';
      }
    }
  }

  analyzeCoreRegressions() {
    console.log('\n🚨 CORE30 REGRESSION ANALYSIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const baselineRegressions = this.baseline.regressions.cases;
    const v1c31Regressions = this.v1c31.regressions.cases;

    console.log(`Baseline Core30 Regressions: ${baselineRegressions.length}`);
    console.log(`V1c_3.1 Core30 Regressions: ${v1c31Regressions.length}`);

    // Compare regression patterns
    console.log('\n| Test ID | Baseline Score | V1c_3.1 Score | Baseline Fields | V1c_3.1 Fields | Analysis |');
    console.log('|---------|----------------|---------------|-----------------|-----------------|----------|');

    const baselineMap = {};
    baselineRegressions.forEach(r => baselineMap[r.testId] = r);

    v1c31Regressions.forEach(regression => {
      const baseline = baselineMap[regression.testId];
      if (baseline) {
        const baseFields = baseline.failedFields.join(', ');
        const v1cFields = regression.failedFields.join(', ');
        const analysis = this.compareRegressionFields(baseline, regression);
        
        console.log(`| ${regression.testId} | ${baseline.actualScore} | ${regression.actualScore} | ${baseFields} | ${v1cFields} | ${analysis} |`);
      } else {
        console.log(`| ${regression.testId} | N/A | ${regression.actualScore} | N/A | ${regression.failedFields.join(', ')} | 🆕 New regression |`);
      }
    });
  }

  compareRegressionFields(baseline, v1c31) {
    const baseFields = new Set(baseline.failedFields);
    const v1cFields = new Set(v1c31.failedFields);

    if (baseline.actualScore === v1c31.actualScore && 
        JSON.stringify([...baseFields].sort()) === JSON.stringify([...v1cFields].sort())) {
      return '🟰 Same pattern';
    }

    if (v1c31.actualScore < baseline.actualScore) {
      return '🔴 V1c_3.1 worse';
    }

    if (v1c31.actualScore > baseline.actualScore) {
      return '🟢 V1c_3.1 better';
    }

    return '🔄 Different fields';
  }

  generateV1d32Recommendations() {
    console.log('\n🎯 V1D_3.2 CORRECTIVE PRECISION RECOMMENDATIONS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const { baselineMap, v1c31Map } = this.analyzeFailureBucketChanges();

    const overAssessed = {
      baseline: baselineMap.urgency_over_assessed?.count || 0,
      v1c31: v1c31Map.urgency_over_assessed?.count || 0
    };

    const underAssessed = {
      baseline: baselineMap.urgency_under_assessed?.count || 0,
      v1c31: v1c31Map.urgency_under_assessed?.count || 0
    };

    console.log('\n🔧 PRIORITY 1: Over-Assessment Correction');
    console.log(`   Current Impact: ${overAssessed.v1c31} cases (${(overAssessed.v1c31/590*100).toFixed(1)}%)`);
    console.log(`   V1c_3.1 Change: ${overAssessed.v1c31 - overAssessed.baseline > 0 ? '+' : ''}${overAssessed.v1c31 - overAssessed.baseline} cases`);
    console.log('   Recommended Fix:');
    console.log('   - Implement CRITICAL threshold dampening (0.77+ → 0.75)');
    console.log('   - Add HIGH threshold precision (0.55+ → 0.52)');
    console.log('   - Category-specific correction factors');
    console.log(`   Target Recovery: ${Math.min(20, Math.floor(overAssessed.v1c31 * 0.2))} cases`);

    console.log('\n🔧 PRIORITY 2: Under-Assessment Correction');
    console.log(`   Current Impact: ${underAssessed.v1c31} cases (${(underAssessed.v1c31/590*100).toFixed(1)}%)`);
    console.log(`   V1c_3.1 Change: ${underAssessed.v1c31 - underAssessed.baseline > 0 ? '+' : ''}${underAssessed.v1c31 - underAssessed.baseline} cases`);
    console.log('   Recommended Fix:');
    console.log('   - Implement HIGH threshold boosting (0.45- → 0.47)');
    console.log('   - Add CRITICAL boundary precision (0.75- → 0.77)');
    console.log('   - Medical/Housing urgency pattern detection');
    console.log(`   Target Recovery: ${Math.min(15, Math.floor(underAssessed.v1c31 * 0.15))} cases`);

    const totalTargetRecovery = Math.min(20, Math.floor(overAssessed.v1c31 * 0.2)) + 
                               Math.min(15, Math.floor(underAssessed.v1c31 * 0.15));

    console.log('\n📊 V1D_3.2 SUCCESS CRITERIA');
    console.log(`   Minimum Success: 262+ cases (baseline + 3)`);
    console.log(`   Target Recovery: ${totalTargetRecovery} cases from urgency corrections`);
    console.log(`   Expected Result: ${259 + totalTargetRecovery} cases (${((259 + totalTargetRecovery)/590*100).toFixed(1)}%)`);
    console.log(`   Stretch Goal: 270+ cases (45.8%)`);
  }

  generateReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, `V1C_31_FAILURE_ANALYSIS_${timestamp}.md`);
    
    // Redirect console output to capture analysis
    const originalLog = console.log;
    let reportContent = '# V1c_3.1 Failure Root Cause Analysis\n\n';
    
    console.log = (message) => {
      reportContent += message + '\n';
      originalLog(message);
    };

    this.loadReports();
    this.analyzeFailureBucketChanges();
    this.analyzeCoreRegressions();
    this.generateV1d32Recommendations();

    console.log = originalLog;

    fs.writeFileSync(reportPath, reportContent);
    console.log(`\n📁 Analysis report saved: ${reportPath}`);
  }

  run() {
    console.log('🔍 V1c_3.1 Failure Root Cause Analysis');
    console.log('════════════════════════════════════════════════════════════════');
    
    this.loadReports();
    this.analyzeFailureBucketChanges();
    this.analyzeCoreRegressions(); 
    this.generateV1d32Recommendations();
    
    console.log('\n✅ Analysis complete. Use generateReport() to save detailed findings.');
  }
}

// Main execution
if (require.main === module) {
  const analyzer = new V1cFailureAnalyzer();
  analyzer.run();
  analyzer.generateReport();
}

module.exports = V1cFailureAnalyzer;