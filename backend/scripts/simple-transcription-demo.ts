/**
 * Simple Intensive Test - Minimal version to demonstrate speech transcription
 */

import { StubTranscriptionProvider } from '../src/providers/transcription/stub';

async function simpleTranscriptionTest() {
  console.log('\n🎤 SIMPLE TRANSCRIPTION DEMONSTRATION');
  console.log('=====================================');
  
  const provider = new StubTranscriptionProvider();
  
  const testScenarios = [
    {
      id: 1,
      title: "Housing Crisis",
      audioFile: "test-audio-housing.mp3"
    },
    {
      id: 2,
      title: "Medical Emergency",
      audioFile: "test-audio-medical.mp3"
    }
  ];
  
  for (const scenario of testScenarios) {
    console.log(`\n🎯 Scenario ${scenario.id}: ${scenario.title}`);
    console.log('----------------------------------------');
    
    try {
      console.log(`   🎤 Transcribing: ${scenario.audioFile}...`);
      
      const result = await provider.transcribe(scenario.audioFile);
      
      console.log(`   ✅ Transcription successful!`);
      console.log(`   📝 Word count: ${result.transcript.split(' ').length}`);
      console.log(`   📊 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`\n   📄 TRANSCRIBED SPEECH:`);
      console.log(`   "${result.transcript}"`);
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  console.log('\n🎉 Simple transcription test completed!\n');
}

// Run if called directly
if (require.main === module) {
  simpleTranscriptionTest()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

export { simpleTranscriptionTest };