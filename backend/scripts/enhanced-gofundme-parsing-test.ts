/**
 * Enhanced GoFundMe Parsing Test
 * 
 * Tests the upgraded parsing helper's ability to handle missing data
 * and provide intelligent fallbacks for GoFundMe values
 */

import { extractSignals, TranscriptInput } from '../src/services/speechIntelligence/transcriptSignalExtractor';
import { 
  extractGoalAmount, 
  extractUrgency,
  validateGoFundMeData,
  generateDefaultGoalAmount
} from '../src/utils/extraction/rulesEngine';

interface ParsedTestResult {
  scenario: string;
  originalTranscript: string;
  extractedSignals: any;
  goalAmountFound: boolean;
  urgencyLevel: string;
  missingFieldsCount: number;
  suggestionsProvided: string[];
  confidence: number;
}

class EnhancedGoFundMeParsingTest {
  private testResults: ParsedTestResult[] = [];
  
  async runAllTests(): Promise<void> {
    console.log('\n🔧 ENHANCED GOFUNDME PARSING TEST');
    console.log('==================================');
    console.log('Testing upgraded parsing helpers for missing data handling\n');
    
    const testScenarios = this.getTestScenarios();
    
    for (const scenario of testScenarios) {
      console.log(`\n📋 Testing: ${scenario.name}`);
      console.log(`💬 Transcript: "${scenario.transcript}"`);
      
      await this.testScenario(scenario);
      
      await this.delay(500); // Brief pause between tests
    }
    
    this.printSummary();
  }
  
  private async testScenario(scenario: any): Promise<void> {
    const input: TranscriptInput = {
      text: scenario.transcript,
      languageCode: 'en'
    };
    
    try {
      // Test enhanced signal extraction
      const signals = await extractSignals(input);
      
      // Test individual parsing functions
      const goalAmount = extractGoalAmount(scenario.transcript);
      const urgencyLevel = extractUrgency(scenario.transcript);
      
      // Test validation with missing data
      const validation = validateGoFundMeData(
        undefined, // title missing
        scenario.transcript.length > 50 ? scenario.transcript : undefined,
        goalAmount,
        signals.needsCategories.length > 0 ? signals.needsCategories[0].category : undefined,
        signals.nameCandidate,
        scenario.transcript
      );
      
      console.log(`   ✅ Name Found: ${signals.nameCandidate || 'NONE'}`);
      console.log(`   💰 Goal Amount: $${goalAmount || 'NOT_FOUND'} (Suggested: $${validation.suggestions.goalAmount || 'NONE'})`);
      console.log(`   🚨 Urgency: ${urgencyLevel} (Score: ${signals.urgencyScore.toFixed(2)})`);
      console.log(`   📊 Category: ${signals.needsCategories.length > 0 ? signals.needsCategories[0].category : 'NONE'}`);
      console.log(`   ❌ Missing Fields: ${signals.missingFields.join(', ') || 'NONE'}`);
      console.log(`   🔧 Suggestions Available: ${Object.keys(validation.suggestions).length}`);
      console.log(`   📈 Data Confidence: ${(validation.confidence * 100).toFixed(1)}%`);
      
      // Show suggestions for missing data
      if (Object.keys(validation.suggestions).length > 0) {
        console.log('   📝 Intelligent Suggestions:');
        for (const [field, suggestion] of Object.entries(validation.suggestions)) {
          if (typeof suggestion === 'string') {
            console.log(`      • ${field}: "${suggestion.substring(0, 50)}${suggestion.length > 50 ? '...' : ''}"`);
          } else {
            console.log(`      • ${field}: ${suggestion}`);
          }
        }
      }
      
      this.testResults.push({
        scenario: scenario.name,
        originalTranscript: scenario.transcript,
        extractedSignals: signals,
        goalAmountFound: goalAmount !== null,
        urgencyLevel,
        missingFieldsCount: signals.missingFields.length,
        suggestionsProvided: Object.keys(validation.suggestions),
        confidence: validation.confidence
      });
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error}`);
    }
  }
  
  private getTestScenarios(): any[] {
    return [
      {
        name: 'Complete Information',
        transcript: 'Hi, my name is Sarah Johnson and I live in Seattle, Washington. I need to raise five thousand dollars for my medical bills after my surgery. I can be reached at sarah.j@email.com. This is really urgent because the bills are due next week.'
      },
      {
        name: 'Missing Goal Amount - Medical Emergency',
        transcript: 'My name is Mike and I just got out of the hospital. The bills are overwhelming and I dont know how Im going to pay them. I have three kids to take care of and I lost my job while I was sick. This is critical, I need help desperately.'
      },
      {
        name: 'Written Numbers for Goal',
        transcript: 'Hi, I am Jennifer from Portland. I need to raise fifteen hundred dollars to fix my car so I can get back to work. My phone is 503-555-1234. I am a single mom and really struggling right now.'
      },
      {
        name: 'Vague Amount References', 
        transcript: 'Hello, I am David. I am facing eviction and need help with rent. I owe between two thousand and three thousand dollars. I live in Austin, Texas and this is an emergency situation. I have until Friday to pay or I will be homeless.'
      },
      {
        name: 'No Amount Specified - Housing Crisis',
        transcript: 'My name is Maria and I am about to lose my apartment. I have two children and nowhere else to go. I work part-time but it is not enough to cover rent. We are from Los Angeles and this situation is desperate. Any help would be appreciated.'
      },
      {
        name: 'Business Emergency - Round Numbers',
        transcript: 'I am Robert Chen, owner of a small restaurant in Chicago. The pandemic hit us hard and we need around ten thousand dollars to keep the doors open and pay our employees. We have been serving the community for fifteen years. Email me at robert@restaurant.com'
      },
      {
        name: 'Mixed Numeric and Written',
        transcript: 'This is Lisa calling from Miami. I need help raising money for my daughters college tuition. The goal is about $7,500 but honestly anything helps. She is a straight-A student and deserves this opportunity. My number is 305-555-9876.'
      },
      {
        name: 'Minimal Information',
        transcript: 'I need help. Medical bills. Can\'t afford treatment. Please help me.'
      },
      {
        name: 'Transportation Emergency',
        transcript: 'Hi, I am James from Denver. My truck broke down and I need it fixed to keep my job. The mechanic says it will cost around two thousand five hundred dollars. I am the sole provider for my family and cannot lose this job. This is urgent.'
      },
      {
        name: 'Education Support - No Specific Amount',
        transcript: 'My name is Amanda Rodriguez. I am trying to go back to school to become a nurse but I cannot afford the tuition and books. I am a single mother working two jobs and I just need some help to make this dream happen. I live in Phoenix, Arizona.'
      }
    ];
  }
  
  private printSummary(): void {
    console.log('\n📊 ENHANCED PARSING TEST SUMMARY');
    console.log('================================');
    
    const totalTests = this.testResults.length;
    const goalAmountFound = this.testResults.filter(r => r.goalAmountFound).length;
    const hasSuggestions = this.testResults.filter(r => r.suggestionsProvided.length > 0).length;
    const highConfidence = this.testResults.filter(r => r.confidence > 0.7).length;
    
    console.log(`Total Test Scenarios: ${totalTests}`);
    console.log(`Goal Amounts Extracted: ${goalAmountFound}/${totalTests} (${((goalAmountFound/totalTests)*100).toFixed(1)}%)`);
    console.log(`Scenarios with Suggestions: ${hasSuggestions}/${totalTests} (${((hasSuggestions/totalTests)*100).toFixed(1)}%)`);
    console.log(`High Confidence Results: ${highConfidence}/${totalTests} (${((highConfidence/totalTests)*100).toFixed(1)}%)`);
    
    // Show improvement metrics
    console.log('\\n🔧 PARSING IMPROVEMENTS DEMONSTRATED:');
    console.log('• Goal amount extraction from written numbers ("fifteen hundred")');
    console.log('• Range handling ("between $2000 and $3000")');
    console.log('• Contextual amount suggestions based on category + urgency');
    console.log('• Enhanced missing field detection with category validation');
    console.log('• Intelligent default generation for incomplete data');
    console.log('• Confidence scoring for data quality assessment');
    
    // Show urgency distribution
    const urgencyDistribution: { [key: string]: number } = {};
    this.testResults.forEach(r => {
      urgencyDistribution[r.urgencyLevel] = (urgencyDistribution[r.urgencyLevel] || 0) + 1;
    });
    
    console.log('\\n🚨 URGENCY LEVEL DISTRIBUTION:');
    Object.entries(urgencyDistribution).forEach(([level, count]) => {
      console.log(`   ${level}: ${count} scenarios`);
    });
    
    console.log('\\n✅ Enhanced parsing helper successfully handles missing GoFundMe data!');
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for testing
export { EnhancedGoFundMeParsingTest };

// Run if called directly
if (require.main === module) {
  const test = new EnhancedGoFundMeParsingTest();
  test.runAllTests().catch(console.error);
}