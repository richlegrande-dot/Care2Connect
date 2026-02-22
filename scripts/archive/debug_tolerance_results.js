// Debug script to check tolerance fix results
const fs = require('fs');
const path = require('path');

// Find the most recent evaluation report
const reportsDir = path.join(__dirname, 'backend/eval/v4plus/reports');
const files = fs.readdirSync(reportsDir)
    .filter(f => f.startsWith('v4plus_all_') && f.endsWith('.json'))
    .sort()
    .reverse();

if (files.length === 0) {
    console.log('No evaluation reports found');
    process.exit(1);
}

const latestReport = path.join(reportsDir, files[0]);
console.log('Reading:', latestReport);

const data = JSON.parse(fs.readFileSync(latestReport, 'utf8'));

// Check amount_outside_tolerance cases specifically
console.log('\n=== AMOUNT TOLERANCE ANALYSIS ===');
console.log('Total cases:', data.metadata.totalCases);
console.log('Pass rate:', data.summary.strictPassRate);

// Find tolerance failure bucket
const toleranceFailureBucket = data.failureBuckets.top10Strict.find(b => 
    b.bucket === 'amount_outside_tolerance'
);

if (toleranceFailureBucket) {
    console.log('\nAmount outside tolerance cases:', toleranceFailureBucket.count);
    console.log('Percentage:', toleranceFailureBucket.percentage);
    console.log('Examples:', toleranceFailureBucket.exampleCases);
} else {
    console.log('\nAmount outside tolerance: RESOLVED! No cases found.');
}

console.log('\n=== PROGRESS SUMMARY ===');
const currentPasses = data.summary.strictPasses;
const targetPasses = Math.ceil(data.metadata.totalCases * 0.70); // 70% of 340
const passesNeeded = targetPasses - currentPasses;

console.log(`Current passes: ${currentPasses}/${data.metadata.totalCases} (${data.summary.strictPassRate})`);
console.log(`Target passes: ${targetPasses}/${data.metadata.totalCases} (70.0%)`);
console.log(`Passes needed: ${passesNeeded}`);

// Show improvement from tolerance fix
const toleranceBeforeExpected = 9; // Previous run showed 9 cases
const toleranceAfter = toleranceFailureBucket ? toleranceFailureBucket.count : 0;
const toleranceImprovement = toleranceBeforeExpected - toleranceAfter;

if (toleranceImprovement > 0) {
    console.log(`\n✅ Tolerance fix improved: ${toleranceImprovement} cases`);
} else if (toleranceImprovement === 0) {
    console.log(`\n⚠️ Tolerance fix: No improvement detected`);
}

// Show top remaining opportunities
console.log('\n=== TOP REMAINING OPPORTUNITIES ===');
data.failureBuckets.top10Strict.slice(0, 5).forEach((bucket, i) => {
    const impact = (bucket.count / data.metadata.totalCases * 100).toFixed(1);
    console.log(`${i+1}. ${bucket.bucket}: ${bucket.count} cases (${impact}%)`);
});