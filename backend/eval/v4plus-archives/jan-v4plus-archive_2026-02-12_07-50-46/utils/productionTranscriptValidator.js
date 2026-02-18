/**
 * Production Transcript Validator
 * 
 * Utility to validate urgency patterns against real production transcripts
 * WITHOUT looking at individual test cases (avoiding overfitting)
 * 
 * Usage:
 * 1. Export anonymized transcripts from production DB
 * 2. Run validation to see pattern match statistics
 * 3. Identify gaps in pattern coverage
 */

const fs = require('fs');
const path = require('path');

class ProductionTranscriptValidator {
  constructor() {
    this.stats = {
      totalTranscripts: 0,
      patternsMatched: {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
        NONE: 0
      },
      vocabularyCoverage: {},
      missingPatterns: []
    };
  }

  /**
   * Anonymize a transcript for safe analysis
   * Removes PII but keeps linguistic structure
   */
  anonymizeTranscript(transcript) {
    let anonymized = transcript;

    // Replace names with placeholders (keep capitalization pattern)
    anonymized = anonymized.replace(/\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/g, '[NAME]');
    
    // Replace phone numbers
    anonymized = anonymized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
    
    // Replace emails
    anonymized = anonymized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
    
    // Replace addresses
    anonymized = anonymized.replace(/\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln)\b/gi, '[ADDRESS]');
    
    // Replace SSN
    anonymized = anonymized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
    
    // Replace specific dollar amounts (keep for pattern testing but round)
    anonymized = anonymized.replace(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, (match, amount) => {
      const num = parseFloat(amount.replace(/,/g, ''));
      const rounded = Math.round(num / 100) * 100; // Round to nearest $100
      return `$${rounded}`;
    });

    return anonymized;
  }

  /**
   * Extract urgency keywords from transcript
   * To identify what vocabulary is being used in production
   */
  extractUrgencyKeywords(transcript) {
    const lower = transcript.toLowerCase();
    const keywords = [];

    // Critical vocabulary
    const criticalTerms = [
      'emergency', 'critical', 'crisis', 'urgent', 'immediately',
      'eviction', 'violence', 'threat', 'danger', 'accident'
    ];

    // High vocabulary
    const highTerms = [
      'asap', 'deadline', 'lost job', 'homeless', 'shut off',
      'court date', 'behind rent', 'struggling'
    ];

    // Medium vocabulary
    const mediumTerms = [
      'help', 'need', 'support', 'assistance', 'difficult',
      'medical', 'bills', 'rent', 'food'
    ];

    // Low vocabulary
    const lowTerms = [
      'eventually', 'no rush', 'when possible', 'wedding',
      'would like', 'someday'
    ];

    const checkTerms = (terms, level) => {
      terms.forEach(term => {
        if (lower.includes(term)) {
          keywords.push({ term, level });
          this.stats.vocabularyCoverage[term] = (this.stats.vocabularyCoverage[term] || 0) + 1;
        }
      });
    };

    checkTerms(criticalTerms, 'CRITICAL');
    checkTerms(highTerms, 'HIGH');
    checkTerms(mediumTerms, 'MEDIUM');
    checkTerms(lowTerms, 'LOW');

    return keywords;
  }

  /**
   * Validate patterns against production transcripts
   * WITHOUT revealing individual transcript content
   */
  async validateAgainstProduction(transcriptsFile) {
    console.log('📊 Production Transcript Validator\n');
    console.log('⚠️  Privacy Note: This tool analyzes patterns without displaying individual transcripts\n');

    // Read transcripts
    const content = fs.readFileSync(transcriptsFile, 'utf8');
    const transcripts = JSON.parse(content);

    console.log(`📄 Loaded ${transcripts.length} production transcripts\n`);

    // Load urgency patterns
    const UrgencyService = require('../../../src/services/UrgencyAssessmentService');
    
    for (const item of transcripts) {
      this.stats.totalTranscripts++;
      
      const transcript = item.transcript || item.transcriptText || '';
      
      // Extract keywords (aggregate statistics only)
      this.extractUrgencyKeywords(transcript);
      
      // Assess urgency using service
      const assessment = UrgencyService.assessUrgency(transcript, {
        category: item.category || 'OTHER'
      });
      
      this.stats.patternsMatched[assessment.urgencyLevel]++;
    }

    this.displayReport();
  }

  /**
   * Display aggregate statistics (no individual transcripts)
   */
  displayReport() {
    console.log('═'.repeat(80));
    console.log('           PRODUCTION PATTERN VALIDATION REPORT');
    console.log('═'.repeat(80));
    console.log();

    console.log('📊 URGENCY DISTRIBUTION:');
    console.log(`   CRITICAL: ${this.stats.patternsMatched.CRITICAL} (${this.percentage('CRITICAL')}%)`);
    console.log(`   HIGH:     ${this.stats.patternsMatched.HIGH} (${this.percentage('HIGH')}%)`);
    console.log(`   MEDIUM:   ${this.stats.patternsMatched.MEDIUM} (${this.percentage('MEDIUM')}%)`);
    console.log(`   LOW:      ${this.stats.patternsMatched.LOW} (${this.percentage('LOW')}%)`);
    console.log(`   NONE:     ${this.stats.patternsMatched.NONE} (${this.percentage('NONE')}%)`);
    console.log();

    console.log('🔤 TOP 20 URGENCY KEYWORDS FOUND:');
    const sortedVocab = Object.entries(this.stats.vocabularyCoverage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    sortedVocab.forEach(([term, count], idx) => {
      const percentage = ((count / this.stats.totalTranscripts) * 100).toFixed(1);
      console.log(`   ${(idx + 1).toString().padStart(2)}. "${term}" - ${count} transcripts (${percentage}%)`);
    });
    console.log();

    console.log('💡 RECOMMENDATIONS:');
    
    // Identify gaps
    const criticalPercent = this.percentage('CRITICAL');
    const highPercent = this.percentage('HIGH');
    const nonePercent = this.percentage('NONE');

    if (nonePercent > 20) {
      console.log('   ⚠️  HIGH: ' + nonePercent + '% of transcripts matched NO urgency patterns');
      console.log('      → Review vocabulary coverage - may be missing common phrases');
    }

    if (criticalPercent < 5) {
      console.log('   ℹ️  LOW: Only ' + criticalPercent + '% CRITICAL - verify patterns are not too strict');
    }

    if (criticalPercent > 30) {
      console.log('   ⚠️  MEDIUM: ' + criticalPercent + '% CRITICAL - patterns may be too aggressive');
    }

    console.log();
    console.log('✅ Validation complete - patterns analyzed against ' + this.stats.totalTranscripts + ' transcripts');
    console.log('═'.repeat(80));
  }

  percentage(level) {
    if (this.stats.totalTranscripts === 0) return '0.0';
    return ((this.stats.patternsMatched[level] / this.stats.totalTranscripts) * 100).toFixed(1);
  }
}

// Export for use in scripts
module.exports = { ProductionTranscriptValidator };

// CLI usage
if (require.main === module) {
  const validator = new ProductionTranscriptValidator();
  
  const transcriptsFile = process.argv[2];
  
  if (!transcriptsFile) {
    console.log('Usage: node productionTranscriptValidator.js <transcripts.json>');
    console.log();
    console.log('Expected JSON format:');
    console.log('[');
    console.log('  { "transcript": "...", "category": "HOUSING" },');
    console.log('  { "transcript": "...", "category": "HEALTHCARE" }');
    console.log(']');
    process.exit(1);
  }

  validator.validateAgainstProduction(transcriptsFile)
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
