const { extractSignals } = require('./backend/src/services/speechIntelligence/transcriptSignalExtractor');

async function testT011() {
  const transcript = "Hello, I'm Amanda Taylor. I need help with something personal that's hard to explain. It's not medical or housing related, just a personal situation. I need about one thousand dollars to resolve this.";

  const result = await extractSignals({ text: transcript });
  console.log('T011 signals result:', JSON.stringify(result, null, 2));
}

testT011().catch(console.error);