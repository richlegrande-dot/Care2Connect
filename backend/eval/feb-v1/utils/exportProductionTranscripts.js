/**
 * Database Export Utility for Production Transcript Validation
 * 
 * Safely exports and anonymizes transcripts from production database
 * for pattern validation without exposing PII
 */

const sql = require('mssql');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class TranscriptExporter {
  constructor(config) {
    this.config = config;
    this.pool = null;
  }

  /**
   * Connect to database
   */
  async connect() {
    try {
      this.pool = await sql.connect(this.config);
      console.log('✅ Connected to database');
    } catch (err) {
      console.error('❌ Database connection failed:', err.message);
      throw err;
    }
  }

  /**
   * Anonymize a transcript
   */
  anonymize(transcript) {
    if (!transcript) return transcript;

    let anonymized = transcript;

    // Replace names (keep pattern but hash actual value)
    anonymized = anonymized.replace(/\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g, (match) => {
      const hash = crypto.createHash('md5').update(match).digest('hex').slice(0, 6);
      return `[NAME_${hash}]`;
    });

    // Replace phone numbers
    anonymized = anonymized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');

    // Replace emails
    anonymized = anonymized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');

    // Replace addresses
    anonymized = anonymized.replace(/\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/gi, '[ADDRESS]');

    // Replace SSN
    anonymized = anonymized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');

    // Round dollar amounts
    anonymized = anonymized.replace(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, (match, amount) => {
      const num = parseFloat(amount.replace(/,/g, ''));
      const rounded = Math.round(num / 100) * 100;
      return `$${rounded}`;
    });

    return anonymized;
  }

  /**
   * Export transcripts from database
   */
  async exportTranscripts(options = {}) {
    const {
      sampleSize = 100,
      monthsBack = 3,
      minLength = 50,
      outputFile = 'production_transcripts.json'
    } = options;

    console.log(`\n📊 Exporting ${sampleSize} transcripts from last ${monthsBack} months...\n`);

    try {
      // Query database for transcripts
      const query = `
        SELECT TOP ${sampleSize}
          id,
          transcript_text,
          category,
          urgency_level,
          created_at
        FROM transcripts
        WHERE created_at >= DATEADD(month, -${monthsBack}, GETDATE())
          AND transcript_text IS NOT NULL
          AND LEN(transcript_text) > ${minLength}
          AND status != 'test'  -- Exclude test data
        ORDER BY NEWID()  -- Random sampling
      `;

      const result = await this.pool.request().query(query);

      console.log(`✅ Retrieved ${result.recordset.length} transcripts from database`);

      // Anonymize and transform
      const anonymized = result.recordset.map(row => ({
        id: crypto.createHash('md5').update(row.id.toString()).digest('hex').slice(0, 8),
        transcript: this.anonymize(row.transcript_text),
        category: row.category || 'OTHER',
        urgency_assigned: row.urgency_level || null,
        created_at: row.created_at ? row.created_at.toISOString() : null
      }));

      // Write to file
      const outputPath = path.join(__dirname, '..', 'data', outputFile);
      
      // Ensure data directory exists
      const dataDir = path.join(__dirname, '..', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, JSON.stringify(anonymized, null, 2));

      console.log(`✅ Anonymized transcripts saved to: ${outputPath}`);
      console.log(`\n📈 Statistics:`);
      console.log(`   Total exported: ${anonymized.length}`);
      console.log(`   Avg length: ${Math.round(anonymized.reduce((sum, t) => sum + t.transcript.length, 0) / anonymized.length)} chars`);
      console.log(`\n⚠️  Remember to delete this file after validation!`);

      return outputPath;

    } catch (err) {
      console.error('❌ Export failed:', err.message);
      throw err;
    }
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.pool) {
      await this.pool.close();
      console.log('\n✅ Database connection closed');
    }
  }
}

// CLI usage
if (require.main === module) {
  const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'care2system',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: true,
      trustServerCertificate: true
    }
  };

  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    
    if (key === 'sample-size') options.sampleSize = parseInt(value);
    if (key === 'months-back') options.monthsBack = parseInt(value);
    if (key === 'output') options.outputFile = value;
  }

  const exporter = new TranscriptExporter(config);

  exporter.connect()
    .then(() => exporter.exportTranscripts(options))
    .then((outputPath) => {
      console.log(`\n✨ Next steps:`);
      console.log(`   1. Review the anonymized file: ${outputPath}`);
      console.log(`   2. Run validation: node productionTranscriptValidator.js ${outputPath}`);
      console.log(`   3. Delete the file when done for security`);
    })
    .catch(err => {
      console.error('\n❌ Error:', err.message);
      process.exit(1);
    })
    .finally(() => exporter.close());
}

module.exports = { TranscriptExporter };
