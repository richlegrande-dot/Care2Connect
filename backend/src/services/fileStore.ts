import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function appendJsonLine(filename: string, obj: any) {
  const file = path.join(DATA_DIR, filename);
  const line = JSON.stringify(obj) + '\n';
  fs.appendFileSync(file, line, { encoding: 'utf8' });
}

export const FileStore = {
  saveAnalysis: (analysis: any) => {
    appendJsonLine('analysis.jsonl', { ...analysis, _savedAt: new Date().toISOString() });
  },
  saveDonation: (donation: any) => {
    appendJsonLine('donations.jsonl', { ...donation, _savedAt: new Date().toISOString() });
  },
  updateDonationStatus: (sessionId: string, updates: any) => {
    // For simplicity, just append an update record to donations-updates.jsonl
    appendJsonLine('donations-updates.jsonl', { sessionId, ...updates, _updatedAt: new Date().toISOString() });
  },
  saveWebhookEvent: (event: any) => {
    appendJsonLine('webhooks.jsonl', { ...event, _receivedAt: new Date().toISOString() });
  },
  saveSupportTicket: (ticket: any) => {
    // Save each ticket as a separate JSON file under data/support-tickets
    const dir = path.join(DATA_DIR, 'support-tickets');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filename = `${Date.now()}-${Math.floor(Math.random() * 10000)}.json`;
    fs.writeFileSync(path.join(dir, filename), JSON.stringify({ ...ticket, _savedAt: new Date().toISOString() }, null, 2), 'utf8');
    return filename;
  },
};

export default FileStore;
