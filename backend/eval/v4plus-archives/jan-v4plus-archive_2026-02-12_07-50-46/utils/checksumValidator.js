/**
 * Checksum Validator for Core30 Dataset
 * 
 * Protects against accidental modification of regression guard baseline.
 * Computes and verifies SHA-256 checksums of core30.jsonl.
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

class ChecksumValidator {
  constructor(datasetPath, checksumPath) {
    this.datasetPath = datasetPath;
    this.checksumPath = checksumPath;
  }

  /**
   * Compute SHA-256 checksum of dataset file
   */
  computeChecksum() {
    if (!fs.existsSync(this.datasetPath)) {
      throw new Error(`Dataset file not found: ${this.datasetPath}`);
    }

    const content = fs.readFileSync(this.datasetPath, 'utf8');
    const hash = crypto.createHash('sha256');
    hash.update(content);
    return hash.digest('hex');
  }

  /**
   * Read stored checksum from file
   */
  readStoredChecksum() {
    if (!fs.existsSync(this.checksumPath)) {
      return null;
    }

    const content = fs.readFileSync(this.checksumPath, 'utf8').trim();
    const lines = content.split('\n');
    
    // Parse checksum file format:
    // <checksum> <count> <timestamp>
    const firstLine = lines[0].trim();
    const parts = firstLine.split(/\s+/);
    
    return {
      checksum: parts[0],
      count: parseInt(parts[1]) || null,
      timestamp: parts.slice(2).join(' ') || null,
      raw: firstLine
    };
  }

  /**
   * Write checksum to file
   */
  writeChecksum(checksum, count) {
    const timestamp = new Date().toISOString();
    const content = `${checksum} ${count} ${timestamp}\n`;
    fs.writeFileSync(this.checksumPath, content, 'utf8');
    
    console.log(`✅ Checksum written: ${path.basename(this.checksumPath)}`);
    console.log(`   Checksum: ${checksum}`);
    console.log(`   Count: ${count} cases`);
    console.log(`   Timestamp: ${timestamp}\n`);
  }

  /**
   * Count cases in JSONL file
   */
  countCases() {
    if (!fs.existsSync(this.datasetPath)) {
      return 0;
    }

    const content = fs.readFileSync(this.datasetPath, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim().length > 0);
    return lines.length;
  }

  /**
   * Verify checksum matches stored value
   */
  verify() {
    const currentChecksum = this.computeChecksum();
    const currentCount = this.countCases();
    const stored = this.readStoredChecksum();

    if (!stored) {
      console.warn(`⚠️  No checksum file found: ${path.basename(this.checksumPath)}`);
      console.warn(`   Generating initial checksum...\n`);
      this.writeChecksum(currentChecksum, currentCount);
      return { valid: true, generated: true };
    }

    if (currentChecksum !== stored.checksum) {
      console.error('\n╔════════════════════════════════════════════════════════════════╗');
      console.error('║  ❌ CORE30 IMMUTABILITY CHECK FAILED                          ║');
      console.error('╚════════════════════════════════════════════════════════════════╝\n');
      
      console.error('Core30 dataset has been modified since last verification.');
      console.error('This baseline must remain immutable to detect regressions.\n');
      
      console.error('Expected Checksum:', stored.checksum);
      console.error('Current Checksum: ', currentChecksum);
      console.error('Stored Count:     ', stored.count || 'unknown');
      console.error('Current Count:    ', currentCount);
      console.error('Last Verified:    ', stored.timestamp || 'unknown');
      console.error('');
      
      console.error('If this change was intentional:');
      console.error('  1. Review the changes carefully');
      console.error('  2. Update checksum: node backend/eval/v4plus/utils/checksumValidator.js --update');
      console.error('  3. Document why core30 was modified\n');
      
      console.error('If this change was accidental:');
      console.error('  1. Restore core30.jsonl from version control');
      console.error('  2. Re-run verification\n');

      throw new Error('CORE30_MODIFIED: Baseline dataset checksum mismatch');
    }

    console.log(`✅ Core30 Immutability Check: PASSED`);
    console.log(`   Checksum: ${currentChecksum}`);
    console.log(`   Count: ${currentCount} cases`);
    console.log(`   Last Verified: ${stored.timestamp || 'unknown'}\n`);

    return { valid: true, generated: false };
  }

  /**
   * Force update checksum (after intentional modification)
   */
  update() {
    const currentChecksum = this.computeChecksum();
    const currentCount = this.countCases();
    
    console.log('Updating core30 checksum...\n');
    this.writeChecksum(currentChecksum, currentCount);
    
    return { checksum: currentChecksum, count: currentCount };
  }
}

// CLI support for manual checksum updates
if (require.main === module) {
  const datasetsDir = path.join(__dirname, '../datasets');
  const core30Path = path.join(datasetsDir, 'core30.jsonl');
  const checksumPath = path.join(datasetsDir, 'core30.checksum.txt');
  
  const validator = new ChecksumValidator(core30Path, checksumPath);
  
  const args = process.argv.slice(2);
  
  if (args.includes('--update') || args.includes('-u')) {
    console.log('Forcing checksum update for core30.jsonl...\n');
    validator.update();
  } else if (args.includes('--verify') || args.includes('-v')) {
    validator.verify();
  } else {
    console.log('Usage:');
    console.log('  node checksumValidator.js --verify   # Verify checksum');
    console.log('  node checksumValidator.js --update   # Update checksum (after intentional change)');
  }
}

module.exports = { ChecksumValidator };
