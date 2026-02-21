import path from 'path';
// Use require here to avoid loader timing issues during early bootstrap
const envProof = require('./utils/envProof').default;

// Explicit dotenv loading from backend/.env to avoid ambiguity
const envPath = path.resolve(__dirname, '..', '.env');
const loaded = envProof.loadDotenvFile(envPath);

console.log(`[startup] dotenv loaded: ${loaded.loaded ? 'yes' : 'no'} path=${loaded.path} parsed=${loaded.parsed ? Object.keys(loaded.parsed).length : 0}`);

export { envPath };
