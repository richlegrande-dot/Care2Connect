const fs = require('fs');
const path = require('path');

const reportsDir = path.join(__dirname, '..', 'backend', 'eval', 'v4plus', 'reports');

function redactContent(str) {
  // Redact common masked credit-card like patterns and long digit sequences
  return str
    .replace(/\b\d{2}\*{4,}\d{2,4}\b/g, '[REDACTED_PII]')
    .replace(/\b\d[\d\s\-]{10,}\d\b/g, '[REDACTED_PII]')
    .replace(/\b\d{13,}\b/g, '[REDACTED_PII]');
}

function sanitizeFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const redacted = redactContent(raw);
    if (redacted !== raw) {
      fs.writeFileSync(filePath, redacted, 'utf8');
      console.log('Sanitized:', filePath);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Error sanitizing', filePath, e.message);
    return false;
  }
}

function main() {
  if (!fs.existsSync(reportsDir)) {
    console.error('Reports directory not found:', reportsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.json') || f.endsWith('.jsonl'));
  let changed = 0;
  for (const f of files) {
    const p = path.join(reportsDir, f);
    if (sanitizeFile(p)) changed++;
  }

  console.log(`Sanitization complete. Files modified: ${changed}`);
}

main();
