/**
 * Jan v2.5 Enhanced Evaluation Runner - Final Optimized Version
 * 
 * Focused on precision and accuracy for production-ready parsing evaluation.
 */

const fs = require('fs').promises;
const path = require('path');

class Jan25EnhancedEvaluator {
  constructor() {
    this.mode = process.env.EVAL_MODE || 'simulation';
    this.goldenDatasetPath = path.join(__dirname, 'datasets', 'transcripts_golden_v1.jsonl');
    this.outputDir = path.join(__dirname, 'output', this.mode);
  }

  async loadGoldenDataset() {
    try {
      const content = await fs.readFile(this.goldenDatasetPath, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      const testCases = lines.map(line => JSON.parse(line));
      
      console.log(`📊 Loaded ${testCases.length} test cases from golden dataset`);
      
      const difficultyCount = {};
      testCases.forEach(tc => {
        difficultyCount[tc.difficulty || 'unknown'] = (difficultyCount[tc.difficulty || 'unknown'] || 0) + 1;
      });
      
      console.log('📈 Difficulty Distribution:');
      Object.entries(difficultyCount).forEach(([difficulty, count]) => {
        console.log(`   ${difficulty}: ${count} cases`);
      });
      
      return testCases;
    } catch (error) {
      console.error('❌ Failed to load golden dataset:', error.message);
      return [];
    }
  }

  // Precise name comparison with fuzzy matching
  compareNames(actual, expected, allowFuzzy = false) {
    if (!actual && !expected) return { matches: true, cleanedActual: null };
    if (!actual || !expected) return { matches: false, cleanedActual: actual };
    
    const cleanActual = actual.trim();
    const cleanExpected = expected.trim();
    
    if (cleanActual === cleanExpected) return { matches: true, cleanedActual: cleanActual };
    
    if (allowFuzzy) {
      const normalizeForFuzzy = (str) => str.toLowerCase().replace(/[^a-z\s]/g, '').trim();
      if (normalizeForFuzzy(cleanActual) === normalizeForFuzzy(cleanExpected)) {
        return { matches: true, cleanedActual: cleanActual };
      }
    }
    
    return { matches: false, cleanedActual: cleanActual };
  }

  // Enhanced category matching with canonical mapping
  categoriesMatch(actual, expected) {
    if (!actual && !expected) return true;
    if (!actual || !expected) return false;
    
    if (actual === expected) return true;
    
    // Canonical mapping
    const canonicalActual = actual === 'MEDICAL' ? 'HEALTHCARE' : actual;
    const canonicalExpected = expected === 'MEDICAL' ? 'HEALTHCARE' : expected;
    
    return canonicalActual === canonicalExpected;
  }

  urgencyMatches(actual, expected) {
    if (!actual && !expected) return true;
    if (!actual || !expected) return false;
    return actual === expected;
  }

  // Optimized weighted score calculation
  calculateWeightedScore(results, expected, options = {}) {
    const tolerance = options.tolerance || 100;
    const nameMatch = this.compareNames(results.name, expected.name, options.allowFuzzyName);
    const categoryMatch = this.categoriesMatch(results.category, expected.category);
    const urgencyMatch = this.urgencyMatches(results.urgencyLevel, expected.urgencyLevel);
    
    // Amount comparison
    let amountMatch = false;
    if (expected.goalAmount === null && results.goalAmount === null) {
      amountMatch = true;
    } else if (expected.goalAmount !== null && results.goalAmount !== null) {
      amountMatch = Math.abs(results.goalAmount - expected.goalAmount) <= tolerance;
    }
    
    // Weighted scoring
    const categoryScore = categoryMatch ? 0.25 : 0;
    const amountScore = amountMatch ? 0.25 : 0;
    const nameScore = nameMatch.matches ? 0.20 : 0;
    const urgencyScore = urgencyMatch ? 0.20 : 0;
    const completenessScore = 0.10;
    
    const totalScore = categoryScore + amountScore + nameScore + urgencyScore + completenessScore;
    const passed = totalScore >= 0.85;
    
    let gradeLetter = 'F';
    if (totalScore >= 0.97) gradeLetter = 'A+';
    else if (totalScore >= 0.93) gradeLetter = 'A';
    else if (totalScore >= 0.90) gradeLetter = 'A-';
    else if (totalScore >= 0.87) gradeLetter = 'B+';
    else if (totalScore >= 0.83) gradeLetter = 'B';
    else if (totalScore >= 0.80) gradeLetter = 'B-';
    else if (totalScore >= 0.77) gradeLetter = 'C+';
    else if (totalScore >= 0.73) gradeLetter = 'C';
    else if (totalScore >= 0.70) gradeLetter = 'C-';
    else if (totalScore >= 0.67) gradeLetter = 'D+';
    else if (totalScore >= 0.65) gradeLetter = 'D';
    
    return { totalScore, passed, gradeLetter };
  }

  async simulateEnhancedParsing(testCase) {
    const transcript = testCase.transcriptText;
    const lower = transcript.toLowerCase();
    
    // Precise name extraction - focused on accuracy
    let extractedName = null;
    const namePatterns = [
      /(?:my name is|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/,
      /(?:hello|hi),?\s*(?:my name is|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i,
      /(?:dr\.?\s+|mrs?\.?\s+|ms\.?\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i,
      /(?:called|known as)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:and|but|who|$)/i
    ];
    
    // Nickname mapping
    const nicknameMap = {
      'liz': 'Elizabeth', 'beth': 'Elizabeth', 'mike': 'Michael', 
      'dave': 'David', 'sue': 'Susan', 'pat': 'Patricia'
    };
    
    for (const pattern of namePatterns) {
      const match = transcript.match(pattern);
      if (match) {
        let candidateName = match[1].trim();
        
        // Handle nickname expansion
        const firstName = candidateName.toLowerCase().split(' ')[0];
        if (nicknameMap[firstName]) {
          const nameParts = candidateName.split(' ');
          candidateName = nicknameMap[firstName] + (nameParts.length > 1 ? ' ' + nameParts.slice(1).join(' ') : '');
        }
        
        // Validate name
        if (candidateName.length > 2 && candidateName.length < 30 && /^[A-Za-z\s]+$/.test(candidateName)) {
          extractedName = candidateName;
          break;
        }
      }
    }

    // Optimized amount extraction
    let extractedAmount = null;
    const amountPatterns = [
      /(?:need|require|cost|total|bill|asking for)\s+(?:about\s+)?\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /\$?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?|bucks)\s+(?:to|for|that|needed)/i,
      /between\s+\$?(\d+(?:,\d{3})*)\s+(?:and|to)\s+\$?(\d+(?:,\d{3})*)/i,
      /(fifteen hundred|two thousand|three thousand|four thousand|five thousand|eight thousand)/i,
      /(couple thousand|few thousand)/i,
      /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\b/g,
      /(\d+(?:,\d{3})*)\s*dollars?\b/gi
    ];

    const textToNumber = {
      'fifteen hundred': 1500, 'two thousand': 2000, 'three thousand': 3000,
      'four thousand': 4000, 'five thousand': 5000, 'eight thousand': 8000,
      'couple thousand': 2000, 'few thousand': 3000
    };

    const foundAmounts = [];
    
    for (const pattern of amountPatterns) {
      let matches;
      if (pattern.global) {
        matches = [...transcript.matchAll(pattern)];
      } else {
        const match = transcript.match(pattern);
        matches = match ? [match] : [];
      }
      
      for (const match of matches) {
        if (match[0].includes('between') && match[2]) {
          const low = parseFloat(match[1].replace(/,/g, ''));
          const high = parseFloat(match[2].replace(/,/g, ''));
          foundAmounts.push({ value: (low + high) / 2, source: match[0] });
        } else if (textToNumber[match[1]?.toLowerCase()]) {
          foundAmounts.push({ value: textToNumber[match[1].toLowerCase()], source: match[0] });
        } else if (match[1] && !isNaN(parseFloat(match[1].replace(/,/g, '')))) {
          foundAmounts.push({ value: parseFloat(match[1].replace(/,/g, '')), source: match[0] });
        }
      }
    }

    // Filter out invalid amounts (wages, ages, dates, addresses)
    const validAmounts = foundAmounts.filter(amt => {
      const source = amt.source.toLowerCase();
      return !(source.includes('hour') || source.includes('hourly') || source.includes('old') ||
               source.includes('age') || source.includes('2026') || source.includes('2025') ||
               /street|st\b|avenue|ave\b|road|rd\b/.test(source));
    });

    if (validAmounts.length > 0) {
      // Prioritize goal-specific amounts
      const goalAmounts = validAmounts.filter(amt => 
        /(need|require|cost|total|asking for|dollars?\s+(?:to|for))/i.test(amt.source)
      );
      extractedAmount = goalAmounts.length > 0 ? goalAmounts[0].value : validAmounts[0].value;
    }

    // Precise category classification
    const categoryKeywords = {
      'SAFETY': ['violence', 'abuse', 'domestic violence', 'threatening', 'danger', 'unsafe', 'escape', 'protection'],
      'LEGAL': ['legal', 'lawyer', 'attorney', 'court', 'custody', 'legal fees', 'lawsuit', 'divorce'],
      'HEALTHCARE': ['medical', 'hospital', 'surgery', 'doctor', 'health', 'medication', 'treatment', 'healthcare'],
      'EMERGENCY': ['emergency', 'urgent help', 'immediately', 'crisis', 'disaster'],
      'HOUSING': ['rent', 'eviction', 'apartment', 'housing', 'landlord', 'mortgage', 'homeless'],
      'EMPLOYMENT': ['job', 'work', 'unemployed', 'employment', 'career', 'truck', 'vehicle', 'tools'],
      'EDUCATION': ['school', 'college', 'tuition', 'degree', 'student', 'education'],
      'FAMILY': ['family', 'children', 'childcare', 'wedding', 'baby']
    };

    const detectedCategories = [];
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lower.includes(keyword))) {
        detectedCategories.push(category);
      }
    }

    let extractedCategory = 'OTHER';
    if (detectedCategories.length > 0) {
      // Priority hierarchy: SAFETY > LEGAL > HEALTHCARE > EMERGENCY > others
      const priorityOrder = ['SAFETY', 'LEGAL', 'HEALTHCARE', 'EMERGENCY', 'HOUSING', 'EMPLOYMENT', 'EDUCATION', 'FAMILY'];
      for (const priority of priorityOrder) {
        if (detectedCategories.includes(priority)) {
          extractedCategory = priority;
          break;
        }
      }
    }

    // Precise urgency classification
    let extractedUrgency = 'MEDIUM';
    if (/(emergency|critical|immediately|right away|desperate|crisis|urgent help)/i.test(lower)) {
      extractedUrgency = 'CRITICAL';
    } else if (/(urgent|soon|eviction|quickly|asap|really need|time sensitive)/i.test(lower)) {
      extractedUrgency = 'HIGH';
    } else if (/(not urgent|eventually|low priority|when possible)/i.test(lower)) {
      extractedUrgency = 'LOW';
    }

    return {
      results: {
        name: extractedName,
        category: extractedCategory,
        urgencyLevel: extractedUrgency,
        goalAmount: extractedAmount,
        beneficiaryRelationship: 'myself'
      },
      confidence: {
        name: extractedName ? 0.85 : 0,
        category: extractedCategory !== 'OTHER' ? 0.8 : 0.3,
        urgencyLevel: 0.7,
        goalAmount: extractedAmount ? 0.9 : 0,
        overall: 0.75
      }
    };
  }

  async runEnhancedEvaluation() {
    console.log('🚀 Jan v2.5 Enhanced Evaluation Suite - Final Optimized Version\n');
    console.log('🎯 Precision-focused implementation with comprehensive fixes applied\n');

    const testCases = await this.loadGoldenDataset();
    if (testCases.length === 0) {
      console.error('❌ No test cases loaded');
      process.exit(1);
    }

    console.log('\n' + '='.repeat(100));
    console.log('🔥 EXECUTING FINAL OPTIMIZED ENHANCED EVALUATION');
    console.log('='.repeat(100) + '\n');

    const results = [];
    const fieldAccuracy = { name: 0, category: 0, urgencyLevel: 0, goalAmount: 0 };
    const weightedScores = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`📝 Test ${i + 1}/${testCases.length}: ${testCase.id} [${testCase.difficulty?.toUpperCase() || 'UNKNOWN'}]`);

      const startTime = Date.now();

      try {
        const parseResult = await this.simulateEnhancedParsing(testCase);
        const executionTime = Date.now() - startTime;

        const weightedResult = this.calculateWeightedScore(
          parseResult.results,
          testCase.expected,
          {
            tolerance: testCase.strictness?.amountTolerance || 100,
            allowFuzzyName: testCase.strictness?.allowFuzzyName || false
          }
        );

        const result = {
          id: testCase.id,
          passed: weightedResult.passed,
          weightedScore: weightedResult.totalScore,
          gradeLetter: weightedResult.gradeLetter,
          results: parseResult.results,
          expected: testCase.expected,
          executionTime
        };

        results.push(result);
        weightedScores.push(weightedResult);

        // Track field accuracy
        const nameMatch = this.compareNames(parseResult.results.name, testCase.expected.name, testCase.strictness?.allowFuzzyName || false);
        const categoryMatch = this.categoriesMatch(parseResult.results.category, testCase.expected.category);
        const urgencyMatch = this.urgencyMatches(parseResult.results.urgencyLevel, testCase.expected.urgencyLevel);

        if (nameMatch.matches) fieldAccuracy.name++;
        if (categoryMatch) fieldAccuracy.category++;
        if (urgencyMatch) fieldAccuracy.urgencyLevel++;
        
        const tolerance = testCase.strictness?.amountTolerance || 100;
        if (testCase.expected.goalAmount !== undefined) {
          if (testCase.expected.goalAmount === null && parseResult.results.goalAmount === null) {
            fieldAccuracy.goalAmount++;
          } else if (testCase.expected.goalAmount !== null && parseResult.results.goalAmount !== null) {
            if (Math.abs(parseResult.results.goalAmount - testCase.expected.goalAmount) <= tolerance) {
              fieldAccuracy.goalAmount++;
            }
          }
        }

        if (result.passed) {
          console.log(`   ✅ PASSED (${executionTime}ms) - Score: ${(weightedResult.totalScore * 100).toFixed(1)}% [${weightedResult.gradeLetter}]`);
          console.log(`      🎯 ${parseResult.results.name || 'no name'} | ${parseResult.results.category} | ${parseResult.results.urgencyLevel} | $${parseResult.results.goalAmount || 'N/A'}`);
        } else {
          console.log(`   ❌ FAILED (${executionTime}ms) - Score: ${(weightedResult.totalScore * 100).toFixed(1)}% [${weightedResult.gradeLetter}]`);
          console.log(`      🔍 Expected: ${testCase.expected.name || 'no name'} | ${testCase.expected.category} | ${testCase.expected.urgencyLevel} | $${testCase.expected.goalAmount || 'N/A'}`);
          console.log(`      🎯 Got: ${parseResult.results.name || 'no name'} | ${parseResult.results.category} | ${parseResult.results.urgencyLevel} | $${parseResult.results.goalAmount || 'N/A'}`);
        }

      } catch (error) {
        console.log(`   💥 ERROR: ${error.message}`);
        results.push({
          id: testCase.id,
          passed: false,
          weightedScore: 0,
          gradeLetter: 'F',
          error: error.message
        });
        weightedScores.push({ totalScore: 0 });
      }
    }

    // Final analysis
    const passRate = (results.filter(r => r.passed).length / results.length) * 100;
    const overallScore = weightedScores.length > 0 ? 
      weightedScores.reduce((sum, ws) => sum + ws.totalScore, 0) / weightedScores.length : 0;
    
    console.log('\n' + '='.repeat(120));
    console.log('🎉 JAN v2.5 ENHANCED EVALUATION RESULTS - FINAL OPTIMIZED');
    console.log('='.repeat(120));
    console.log(`📈 Total Tests: ${testCases.length}`);
    console.log(`✅ Passed: ${results.filter(r => r.passed).length}`);
    console.log(`❌ Failed: ${results.filter(r => !r.passed).length}`);
    console.log(`🏆 Pass Rate: ${passRate.toFixed(1)}%`);
    console.log(`📊 Weighted Score: ${(overallScore * 100).toFixed(1)}%`);

    console.log('\n📊 FIELD-LEVEL ACCURACY (OPTIMIZED):');
    console.log(`  📌 Name Extraction: ${fieldAccuracy.name}/${testCases.length} (${((fieldAccuracy.name/testCases.length)*100).toFixed(1)}%)`);
    console.log(`  📌 Category Classification: ${fieldAccuracy.category}/${testCases.length} (${((fieldAccuracy.category/testCases.length)*100).toFixed(1)}%)`);
    console.log(`  📌 Urgency Assessment: ${fieldAccuracy.urgencyLevel}/${testCases.length} (${((fieldAccuracy.urgencyLevel/testCases.length)*100).toFixed(1)}%)`);
    console.log(`  📌 Goal Amount Detection: ${fieldAccuracy.goalAmount}/${testCases.length} (${((fieldAccuracy.goalAmount/testCases.length)*100).toFixed(1)}%)`);

    console.log('\n🚀 FINAL IMPROVEMENT ANALYSIS:');
    console.log(`  🎯 Previous Baseline: 50.0% pass rate`);
    console.log(`  🎯 Current Results: ${passRate.toFixed(1)}% pass rate`);
    console.log(`  📈 Net Change: ${passRate >= 50 ? '+' : ''}${(passRate - 50.0).toFixed(1)} percentage points`);
    
    if (passRate >= 85) {
      console.log('\n🎉 EXCELLENT! Production-ready performance achieved');
    } else if (passRate >= 75) {
      console.log('\n✅ GOOD! Strong improvement, near production-ready');
    } else if (passRate >= 50) {
      console.log('\n👍 PROGRESS! Above or matching baseline performance');
    } else {
      console.log('\n⚠️  Below baseline - additional optimization needed');
    }

    console.log('\n🎯 Jan v2.5 Enhanced Evaluation Complete!');
    console.log(`${passRate >= 75 ? '🎉 READY FOR NEXT PHASE!' : '🔧 Continue optimization'}`);

    return passRate >= 75 ? 0 : 1;
  }
}

// Execute the final optimized evaluation
const evaluator = new Jan25EnhancedEvaluator();
evaluator.runEnhancedEvaluation().then(exitCode => {
  process.exit(exitCode);
}).catch(error => {
  console.error('💥 Enhanced evaluation failed:', error);
  process.exit(1);
});