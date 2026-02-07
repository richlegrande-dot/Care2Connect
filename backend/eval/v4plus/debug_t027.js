// Debug script to trace T027 name extraction issue
const path = require('path');

async function debugT027() {
  try {
    // Load the adapter
    const adapter = require('./runners/parserAdapter.js');
    
    const text = 'My name is Robert Chen and I need help finishing my certification program. I lost my job and need this training to find work again. The program costs twenty-eight hundred dollars and I start next month.';
    
    console.log('=== T027 Name Extraction Debug ===');
    console.log('Text:', text);
    console.log('');
    
    // Test the extraction 
    const result = await adapter.extractAll(text, { id: 'T027' });
    
    console.log('Final result:');
    console.log('name:', result.name);
    console.log('urgency:', result.urgencyLevel);
    console.log('category:', result.category);
    console.log('');
    
    // Check if this could be a simple word extraction issue
    const words = text.split(' ');
    console.log('First few words:', words.slice(0, 10));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugT027();