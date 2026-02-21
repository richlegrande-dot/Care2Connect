/**
 * Frontend Port Configuration and Validation
 * 
 * PRODUCTION HARDENING: Ensures frontend port and API URL consistency
 * Fails fast if configuration is invalid or ports are occupied.
 */

const { spawn } = require('child_process');
const net = require('net');

/**
 * Get frontend configuration from environment
 */
function getFrontendConfig() {
  const frontendPort = parseInt(process.env.PORT || process.env.FRONTEND_PORT || '3000', 10);
  const backendPort = parseInt(process.env.BACKEND_PORT || '3001', 10);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${backendPort}/api`;
  const strictMode = process.env.STRICT_PORT_MODE === 'true';

  return {
    frontendPort,
    backendPort,
    apiUrl,
    strictMode
  };
}

/**
 * Validate frontend port configuration consistency
 */
function validateFrontendConfig(config) {
  const errors = [];

  // Validate port numbers
  if (isNaN(config.frontendPort) || config.frontendPort < 1024 || config.frontendPort > 65535) {
    errors.push(`Invalid frontend port: ${process.env.PORT || process.env.FRONTEND_PORT || '3000'}`);
  }

  if (isNaN(config.backendPort) || config.backendPort < 1024 || config.backendPort > 65535) {
    errors.push(`Invalid backend port: ${process.env.BACKEND_PORT || '3001'}`);
  }

  // Validate API URL points to correct backend port
  const expectedApiUrl = `http://localhost:${config.backendPort}/api`;
  if (config.apiUrl !== expectedApiUrl) {
    errors.push(`API URL mismatch: expected "${expectedApiUrl}", got "${config.apiUrl}"`);
  }

  // Check for port conflicts
  if (config.frontendPort === config.backendPort) {
    errors.push(`Frontend and backend cannot use the same port: ${config.frontendPort}`);
  }

  return errors;
}

/**
 * Check if a port is occupied (async version for Node.js)
 */
function checkPortOccupied(port) {
  return new Promise((resolve) => {
    const testServer = net.createServer();
    
    testServer.listen(port, '127.0.0.1', () => {
      testServer.close();
      resolve(null); // Port is available
    });
    
    testServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Try to get process info using netstat
        const netstat = spawn('netstat', ['-ano'], { shell: true });
        let output = '';
        
        netstat.stdout?.on('data', (data) => {
          output += data.toString();
        });
        
        netstat.on('close', () => {
          try {
            const lines = output.split('\n');
            const portLine = lines.find(line => 
              line.includes(`:${port} `) && line.includes('LISTENING')
            );
            
            if (portLine) {
              const parts = portLine.trim().split(/\s+/);
              const pid = parseInt(parts[parts.length - 1], 10);
              resolve({ pid });
            } else {
              resolve({ pid: null });
            }
          } catch {
            resolve({ pid: null });
          }
        });
      } else {
        resolve(null); // Other error, assume available
      }
    });
  });
}

/**
 * Main validation function - call before starting frontend
 */
async function validateFrontendStartup() {
  console.log('\n🔒 [FRONTEND HARDENING] Validating frontend configuration...');
  
  const config = getFrontendConfig();
  
  console.log('📋 [FRONTEND CONFIG] Configuration:');
  console.log(`📋 [FRONTEND CONFIG]   Frontend Port: ${config.frontendPort}`);
  console.log(`📋 [FRONTEND CONFIG]   Backend Port:  ${config.backendPort}`);
  console.log(`📋 [FRONTEND CONFIG]   API URL:       ${config.apiUrl}`);
  console.log(`📋 [FRONTEND CONFIG]   Mode:          ${config.strictMode ? 'STRICT' : 'FLEXIBLE'}`);
  
  // Validate configuration consistency
  const configErrors = validateFrontendConfig(config);
  if (configErrors.length > 0) {
    console.error('\n❌ CRITICAL: Frontend configuration errors:');
    configErrors.forEach(error => console.error(`   - ${error}`));
    
    console.error('\n📋 ACTIONS REQUIRED:');
    console.error('   • Check environment variables: PORT, BACKEND_PORT, NEXT_PUBLIC_API_URL');
    console.error('   • Ensure ports are different and valid (1024-65535)');
    console.error('   • Verify API URL matches backend port');
    
    if (config.strictMode) {
      console.error('\n🚨 Server cannot start in STRICT_PORT_MODE with config errors.');
      process.exit(1);
    } else {
      console.warn('⚠️  Proceeding in flexible mode despite config errors.');
    }
  }

  // Check port availability
  console.log('🔍 [FRONTEND HARDENING] Checking port availability...');
  const portOccupant = await checkPortOccupied(config.frontendPort);
  
  if (portOccupant !== null) {
    const errorMsg = `Frontend port ${config.frontendPort} is occupied${portOccupant.pid ? ` by PID ${portOccupant.pid}` : ''}`;
    console.error(`\n❌ CRITICAL: ${errorMsg}`);
    
    console.error('\n📋 ACTIONS REQUIRED:');
    if (portOccupant.pid) {
      console.error(`   • Kill process: taskkill /PID ${portOccupant.pid} /F`);
    }
    console.error(`   • Check what's using port: netstat -ano | findstr :${config.frontendPort}`);
    
    if (config.strictMode) {
      console.error('\n🚨 Frontend cannot start in STRICT_PORT_MODE with port conflict.');
      process.exit(1);
    } else {
      console.warn('⚠️  Port conflict detected but Next.js may handle it automatically.');
    }
  } else {
    console.log(`✅ [FRONTEND HARDENING] Frontend port ${config.frontendPort} is available`);
  }

  return config;
}

// Export for use in other scripts
module.exports = {
  getFrontendConfig,
  validateFrontendConfig,
  validateFrontendStartup
};

// If called directly, run validation
if (require.main === module) {
  validateFrontendStartup()
    .then(() => {
      console.log('✅ Frontend configuration validation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Frontend validation failed:', error.message);
      process.exit(1);
    });
}