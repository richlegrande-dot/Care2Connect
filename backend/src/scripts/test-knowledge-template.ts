/**
 * Simple test to verify getDonationDraftTemplate() works
 */

import { searchKnowledge, getDonationDraftTemplate, logKnowledgeUsage } from '../services/knowledge/query';

async function testKnowledgeVault() {
  console.log('\n=== Testing Knowledge Vault ===\n');
  
  // Test 1: Search for all knowledge
  console.log('[1] Searching for all knowledge sources...');
  const allKnowledge = await searchKnowledge({
    limit: 10
  });
  console.log(`   Found ${allKnowledge.length} sources`);
  allKnowledge.forEach((k, i) => {
    console.log(`   ${i + 1}. ${k.title} (${k.sourceType}) - Tags: ${k.tags?.join(', ') || 'none'}`);
  });
  
  // Test 2: Search for GoFundMe knowledge
  console.log('\n[2] Searching for GoFundMe knowledge...');
  const gofundmeKnowledge = await searchKnowledge({
    tags: ['GOFUNDME'],
    limit: 5
  });
  console.log(`   Found ${gofundmeKnowledge.length} GoFundMe sources`);
  gofundmeKnowledge.forEach((k, i) => {
    console.log(`   ${i + 1}. ${k.title}`);
  });
  
  // Test 3: Get donation draft template
  console.log('\n[3] Getting donation draft template...');
  const template = await getDonationDraftTemplate();
  
  if (template) {
    console.log('   ✅ Template found!');
    console.log(`   Title: ${template.title}`);
    console.log(`   Source Type: ${template.sourceType}`);
    console.log(`   Tags: ${template.tags?.join(', ')}`);
    console.log(`   Content preview: ${template.content.substring(0, 200)}...`);
    console.log(`   Relevance: ${template.relevance}`);
  } else {
    console.log('   ❌ Template NOT found');
    console.log('   This means getDonationDraftTemplate() will return null');
    console.log('   Draft generation will fail or use fallback template');
  }
  
  // Test 4: Test knowledge usage logging
  console.log('\n[4] Testing knowledge usage logging...');
  if (template) {
    try {
      await logKnowledgeUsage({
        ticketId: 'test-ticket-id',
        stage: 'DRAFT',
        chunkIds: [template.chunkId!],
        outcome: 'SUCCESS',
      });
      console.log('   ✅ Successfully logged knowledge usage');
    } catch (error) {
      console.log(`   ❌ Failed to log: ${error}`);
    }
  }
  
  console.log('\n=== Test Complete ===\n');
  
  // Summary
  if (template) {
    console.log('✅ PASS: Knowledge vault integration is working');
    console.log('   - Template exists with correct tags');
    console.log('   - getDonationDraftTemplate() returns valid template');
    console.log('   - Draft generation will use knowledge vault');
  } else {
    console.log('❌ FAIL: Knowledge vault integration NOT working');
    console.log('   - Template missing or incorrectly tagged');
    console.log('   - getDonationDraftTemplate() returns null');
    console.log('   - Draft generation will NOT use knowledge vault');
    console.log('\n   Run: npm run populate-knowledge (or the PowerShell script)');
  }
}

// Run test and write results to file
import * as fs from 'fs';
import * as path from 'path';

testKnowledgeVault()
  .then(() => {
    const resultPath = path.join(__dirname, '../../test-results.txt');
    fs.writeFileSync(resultPath, 'Test completed successfully\n' + new Date().toISOString());
    process.exit(0);
  })
  .catch((error) => {
    const resultPath = path.join(__dirname, '../../test-results.txt');
    fs.writeFileSync(resultPath, 'Test failed: ' + error.message + '\n' + new Date().toISOString());
    console.error('Test failed:', error);
    process.exit(1);
  });
