#!/usr/bin/env node
/**
 * Analyze actual failing urgency_under_assessed cases from the latest evaluation
 * to identify specific text patterns that need urgency upgrades.
 */
const fs = require('fs').promises;
const path = require('path');

async function analyzeFailingCases() {
  console.log("🔍 Analyzing actual failing urgency_under_assessed cases...\n");
  
  // Load the most recent evaluation report
  const reportsDir = path.join(__dirname, 'eval', 'v4plus', 'reports');
  
  try {
    const files = await fs.readdir(reportsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse();
    
    if (jsonFiles.length === 0) {
      console.log("❌ No evaluation reports found");
      return;
    }
    
    const latestReport = path.join(reportsDir, jsonFiles[0]);
    console.log(`📊 Loading report: ${jsonFiles[0]}\n`);
    
    const data = JSON.parse(await fs.readFile(latestReport, 'utf8'));
    
    console.log("📋 Report structure keys:", Object.keys(data));
    
    // Try different possible structures
    let results = data.results || data.testResults || data.cases || [];
    
    if (Array.isArray(data)) {
      results = data;
    } else if (data.evaluation && data.evaluation.results) {
      results = data.evaluation.results;
    }
    
    console.log(`📊 Found ${results.length} total results\n`);
    
    // Find urgency_under_assessed failures
    const urgencyUnderAssessed = results.filter(r => 
      (r.failures && r.failures.includes('urgency_under_assessed')) ||
      (r.failureTypes && r.failureTypes.includes('urgency_under_assessed'))
    );
    
    console.log(`Found ${urgencyUnderAssessed.length} urgency_under_assessed cases\n`);
    
    // Group by actual vs expected urgency patterns
    const urgencyPatterns = {};
    
    urgencyUnderAssessed.forEach(result => {
      const key = `${result.parsed.urgencyLevel} → ${result.expected.urgencyLevel}`;
      if (!urgencyPatterns[key]) {
        urgencyPatterns[key] = [];
      }
      urgencyPatterns[key].push({
        id: result.id,
        text: result.input.transcriptText,
        actual: result.parsed.urgencyLevel,
        expected: result.expected.urgencyLevel
      });
    });
    
    console.log("📈 Urgency Assessment Patterns:\n");
    Object.keys(urgencyPatterns).forEach(pattern => {
      const cases = urgencyPatterns[pattern];
      console.log(`${pattern}: ${cases.length} cases`);
      
      // Show first few examples for HIGH → CRITICAL (most impactful)
      if (pattern === 'HIGH → CRITICAL' && cases.length > 0) {
        console.log("  Top examples:");
        cases.slice(0, 5).forEach((c, i) => {
          const preview = c.text.substring(0, 80) + (c.text.length > 80 ? "..." : "");
          console.log(`    ${i+1}. ${c.id}: "${preview}"`);
        });
      }
      
      // Show first few examples for MEDIUM → HIGH/CRITICAL (next most impactful)  
      if ((pattern === 'MEDIUM → HIGH' || pattern === 'MEDIUM → CRITICAL') && cases.length > 0) {
        console.log("  Top examples:");
        cases.slice(0, 3).forEach((c, i) => {
          const preview = c.text.substring(0, 80) + (c.text.length > 80 ? "..." : "");
          console.log(`    ${i+1}. ${c.id}: "${preview}"`);
        });
      }
    });
    
    console.log("\n🎯 Priority Fix Targets (Highest Impact):");
    console.log("1. HIGH → CRITICAL upgrades (most impactful)");
    console.log("2. MEDIUM → CRITICAL upgrades");
    console.log("3. MEDIUM → HIGH upgrades");
    console.log("4. LOW → MEDIUM/HIGH/CRITICAL upgrades");
    
  } catch (error) {
    console.error("❌ Error analyzing reports:", error.message);
  }
}

analyzeFailingCases().catch(console.error);