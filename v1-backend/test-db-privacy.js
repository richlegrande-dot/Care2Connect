// Quick database query for testing
const { prisma } = require('./db');

async function checkIssues() {
  console.log('\n=== Recording Issue Logs (Privacy Check) ===\n');
  
  const issues = await prisma.recordingIssueLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });
  
  console.log(`Total issues found: ${issues.length}\n`);
  
  issues.forEach((issue, index) => {
    console.log(`Issue #${index + 1}:`);
    console.log(`  ID: ${issue.id.substring(0, 8)}...`);
    console.log(`  Kiosk ID: ${issue.kioskId}`);
    console.log(`  Connectivity: ${issue.connectivity}`);
    console.log(`  Error Name: ${issue.errorName}`);
    console.log(`  Permission: ${issue.permissionState || 'N/A'}`);
    console.log(`  Has Audio: ${issue.hasAudioInput === null ? 'N/A' : issue.hasAudioInput}`);
    console.log(`  User Agent: ${issue.userAgentSnippet || 'N/A'}`);
    console.log(`  Created: ${issue.createdAt.toISOString()}`);
    console.log(`  Columns in this record:`, Object.keys(issue));
    console.log('');
  });
  
  // Check for any PII fields
  console.log('\n=== Privacy Verification ===');
  const sampleIssue = issues[0] || {};
  const fields = Object.keys(sampleIssue);
  const dangerousFields = ['userId', 'recordingId', 'name', 'email', 'phone', 'phoneNumber'];
  const foundPII = fields.filter(f => dangerousFields.includes(f));
  
  if (foundPII.length > 0) {
    console.log('❌ PRIVACY VIOLATION: Found PII fields:', foundPII);
  } else {
    console.log('✓ No PII fields found in recording_issue_logs');
    console.log('✓ Table contains only device-level telemetry');
  }
  
  await prisma.$disconnect();
}

checkIssues().catch(console.error);
