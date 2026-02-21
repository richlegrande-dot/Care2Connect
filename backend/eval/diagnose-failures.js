/**
 * Diagnostic Script - Identify Name and Urgency Field Failures
 * Compares actual extraction vs expected values for all 30 tests
 */

const fs = require('fs').promises;
const path = require('path');

async function diagnoseFailures() {
  console.log('🔍 JAN v4.0 FIELD FAILURE DIAGNOSTIC TOOL\n');
  console.log('='.repeat(70));

  // Load test dataset
  const datasetPath = path.join(__dirname, 'datasets', 'transcripts_golden_v1.jsonl');
  const content = await fs.readFile(datasetPath, 'utf-8');
  const tests = content.trim().split('\n').map(line => JSON.parse(line));

  const nameFailures = [];
  const urgencyFailures = [];
  
  console.log('\n📋 Analyzing 30 test cases...\n');

  for (const test of tests) {
    const transcript = test.transcriptText || '';
    
    // Extract fields (simplified inline extraction)
    const extractedName = extractNameFromTranscript(transcript);
    const extractedUrgency = extractUrgencyFromTranscript(transcript);
    
    // Compare Name
    const expectedName = test.expected.name || null;
    const actualName = extractedName || null;
    
    let nameMatch = false;
    if (expectedName === null && actualName === null) {
      nameMatch = true;
    } else if (expectedName && actualName) {
      nameMatch = expectedName.toLowerCase().trim() === actualName.toLowerCase().trim();
    }
    
    if (!nameMatch) {
      nameFailures.push({
        id: test.id,
        expected: expectedName,
        actual: actualName,
        transcript: transcript.substring(0, 100) + '...'
      });
    }
    
    // Compare Urgency
    const expectedUrgency = test.expected.urgencyLevel;
    const actualUrgency = extractedUrgency;
    
    if (expectedUrgency !== actualUrgency) {
      urgencyFailures.push({
        id: test.id,
        expected: expectedUrgency,
        actual: actualUrgency,
        transcript: transcript.substring(0, 100) + '...'
      });
    }
  }

  // Display Name Failures
  console.log('\n📛 NAME EXTRACTION FAILURES (' + nameFailures.length + '/30):');
  console.log('='.repeat(70));
  
  if (nameFailures.length === 0) {
    console.log('✅ All name extractions correct! 100.0% accuracy\n');
  } else {
    nameFailures.forEach((failure, idx) => {
      console.log(`\n${idx + 1}. Test ${failure.id}:`);
      console.log(`   Expected: "${failure.expected}"`);
      console.log(`   Actual:   "${failure.actual}"`);
      console.log(`   Excerpt:  ${failure.transcript}`);
    });
    console.log(`\n❌ Name Accuracy: ${((30 - nameFailures.length) / 30 * 100).toFixed(1)}%`);
    console.log(`   Need ${Math.ceil((30 * 0.95) - (30 - nameFailures.length))} more fixes to reach 95%\n`);
  }

  // Display Urgency Failures
  console.log('\n📛 URGENCY ASSESSMENT FAILURES (' + urgencyFailures.length + '/30):');
  console.log('='.repeat(70));
  
  if (urgencyFailures.length === 0) {
    console.log('✅ All urgency assessments correct! 100.0% accuracy\n');
  } else {
    urgencyFailures.forEach((failure, idx) => {
      console.log(`\n${idx + 1}. Test ${failure.id}:`);
      console.log(`   Expected: ${failure.expected}`);
      console.log(`   Actual:   ${failure.actual}`);
      console.log(`   Excerpt:  ${failure.transcript}`);
    });
    console.log(`\n❌ Urgency Accuracy: ${((30 - urgencyFailures.length) / 30 * 100).toFixed(1)}%`);
    console.log(`   Need ${Math.ceil((30 * 0.95) - (30 - urgencyFailures.length))} more fixes to reach 95%\n`);
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 DIAGNOSTIC SUMMARY:');
  console.log('='.repeat(70));
  console.log(`Name Field:    ${30 - nameFailures.length}/30 correct (${((30 - nameFailures.length) / 30 * 100).toFixed(1)}%)`);
  console.log(`Urgency Field: ${30 - urgencyFailures.length}/30 correct (${((30 - urgencyFailures.length) / 30 * 100).toFixed(1)}%)`);
  console.log(`\nTotal fixes needed: ${nameFailures.length + urgencyFailures.length}`);
  console.log(`Target: 95%+ accuracy (29/30 or better) on each field\n`);
}

// Simplified extraction functions (inline versions)
function extractNameFromTranscript(transcript) {
  // Jan v4.0 Name extraction patterns
  const patterns = [
    // Direct intros
    /(?:my name is|i'm|this is|i am)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)\b/i,
    /(?:my full name is)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)\b/i,
    // Title patterns
    /\b(?:dr|doctor|mrs?|ms|mr|miss)\.?\s+([A-Z][a-z]+\s+[A-Z][a-z]+)\b/i,
    // Hesitant intro
    /(?:my name is|i'm)\s*\.{2,}\s*(?:it's|its)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)\b/i,
    // First name only
    /(?:my name is|i'm|this is|i am)\s+([A-Z][a-z]+)\b(?!\s+[A-Z][a-z]+)/i
  ];

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      const name = match[1].trim();
      // Blacklist check
      const blacklist = ['help', 'need', 'facing', 'urgent', 'emergency', 'this is an'];
      if (!blacklist.some(word => name.toLowerCase().includes(word))) {
        return name;
      }
    }
  }
  
  return null;
}

function extractUrgencyFromTranscript(transcript) {
  const lower = transcript.toLowerCase();
  
  // CRITICAL patterns
  if (/(eviction notice|foreclosure|surgery scheduled|emergency.*no|(?:daughter|son|child).*accident.*surgery)/i.test(lower)) {
    return 'CRITICAL';
  }
  
  // HIGH patterns
  if (/(behind on|can't afford|medical bills|pain getting worse|bills piling up)/i.test(lower)) {
    return 'HIGH';
  }
  
  // LOW patterns
  if (/(planning|not urgent|wedding|reception)/i.test(lower)) {
    return 'LOW';
  }
  
  // Default MEDIUM
  return 'MEDIUM';
}

// Run diagnostic
diagnoseFailures().catch(error => {
  console.error('❌ Diagnostic failed:', error);
  process.exit(1);
});
