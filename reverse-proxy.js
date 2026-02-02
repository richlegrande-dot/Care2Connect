/**
 * Reverse Proxy for Split Routing
 * 
 * This proxy handles routing based on hostname:
 * - care2connects.org -> localhost:3000 (Frontend)
 * - api.care2connects.org -> localhost:3001 (Backend)
 * 
 * Cloudflare Tunnel points BOTH domains to this proxy on port 8080
 */

const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const FRONTEND_TARGET = 'http://localhost:3000';
const BACKEND_TARGET = 'http://localhost:3001';

const server = http.createServer((req, res) => {
  const hostname = req.headers.host?.split(':')[0] || '';
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${hostname}${req.url}`);
  
  // Route based on hostname
  if (hostname === 'api.care2connects.org' || hostname.startsWith('api.')) {
    console.log(`  → Routing to BACKEND (${BACKEND_TARGET})`);
    proxy.web(req, res, { target: BACKEND_TARGET }, (err) => {
      console.error('Backend proxy error:', err);
      res.writeHead(502);
      res.end('Backend unavailable');
    });
  } else {
    // Default to frontend for root domain
    console.log(`  → Routing to FRONTEND (${FRONTEND_TARGET})`);
    proxy.web(req, res, { target: FRONTEND_TARGET }, (err) => {
      console.error('Frontend proxy error:', err);
      res.writeHead(502);
      res.end('Frontend unavailable');
    });
  }
});

// Handle WebSocket upgrades
server.on('upgrade', (req, socket, head) => {
  const hostname = req.headers.host?.split(':')[0] || '';
  const target = hostname.startsWith('api.') ? BACKEND_TARGET : FRONTEND_TARGET;
  
  console.log(`[WS] Upgrading connection for ${hostname} -> ${target}`);
  proxy.ws(req, socket, head, { target });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   REVERSE PROXY FOR SPLIT ROUTING');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Listening on port ${PORT}`);
  console.log('');
  console.log('Routing configuration:');
  console.log(`  care2connects.org     → ${FRONTEND_TARGET} (Frontend)`);
  console.log(`  api.care2connects.org → ${BACKEND_TARGET} (Backend)`);
  console.log('');
  console.log('Cloudflare Tunnel should point BOTH domains to:');
  console.log(`  http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down reverse proxy...');
  server.close(() => {
    console.log('Reverse proxy stopped');
    process.exit(0);
  });
});
