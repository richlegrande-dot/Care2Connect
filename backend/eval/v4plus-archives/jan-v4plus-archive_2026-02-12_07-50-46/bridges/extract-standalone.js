/**
 * Standalone AI Provider Extraction Script
 * 
 * This script runs independently and uses the same environment setup as V1
 * to extract data using the 80% baseline Rules-Based Provider.
 * 
 * Usage: node extract-standalone.js "<transcript_text>"  
 */

const dotenv = require('dotenv');
const path = require('path');
const { pathToFileURL } = require('url');

// Load environment variables from project root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function extractProfileData(transcriptText) {
  try {
    // Convert Windows path to file:// URL for proper ESM import
    const aiProviderPath = path.join(__dirname, '../../../src/providers/ai/index.js');
    const aiProviderURL = pathToFileURL(aiProviderPath).href;
    
    // Import the production AI provider using proper file URL
    const { getAIProvider } = await import(aiProviderURL);
    const aiProvider = getAIProvider();
    
    // Extract profile data using the same method as V1 system
    const result = await aiProvider.extractProfileData(transcriptText);
    
    // Output JSON result
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Extraction failed:', error.message);
    process.exit(1);
  }
}

// Get transcript from command line argument
const transcript = process.argv[2];
if (!transcript) {
  console.error('Usage: node extract-standalone.js "<transcript_text>"');
  process.exit(1);
}

// Run extraction
extractProfileData(transcript);