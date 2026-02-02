/**
 * PM2 Production Configuration
 * 
 * For production deployment with compiled JavaScript.
 * Background services enabled by default.
 * Requires 'npm run build' in backend before use.
 * 
 * Usage:
 *   cd backend && npm run build
 *   cd frontend && npm run build
 *   pm2 start ecosystem.prod.config.js
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
    {
      name: 'careconnect-backend-prod',
      cwd: './backend',
      script: './dist/server.js',
      interpreter: 'node',
      // PRODUCTION INVARIANT: Pre-deployment critical path validation
      pre_start: 'powershell -ExecutionPolicy Bypass -File "../scripts/critical-path-regression-tests.ps1" -Quick',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        BACKEND_PORT: 3001,
        START_BACKGROUND_SERVICES: 'true', // Enabled in production
        HEALTHCHECKS_ENABLED: 'true',
        HEALTHCHECKS_INTERVAL_SEC: '60',
        STRICT_PORT_MODE: 'true', // Don't auto-switch ports in production
        V1_STABLE: 'true' // Force production hardening mode
      },
      error_file: './backend/logs/backend-prod-error.log',
      out_file: './backend/logs/backend-prod-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
      autorestart: true,
      
      // PRODUCTION HARDENING: Restart policies and crash loop protection
      max_restarts: 3,              // Limit restarts to prevent infinite loops
      min_uptime: '60s',            // Must stay up at least 1 minute to count as successful
      restart_delay: 10000,         // 10 second delay between restarts
      exp_backoff_restart_delay: 1000,  // Exponential backoff starting at 1 second
      max_memory_restart: '500M',   // Restart if memory exceeds 500MB
      
      // Health monitoring
      health_check_grace_period: 30000,  // 30s grace period for health checks
      
      // Crash loop detection logging
      error_file: './backend/logs/backend-prod-error.log',
      out_file: './backend/logs/backend-prod-out.log',
      merge_logs: true,             // Merge stdout and stderr for easier troubleshooting
      
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      
      // Signal handling for graceful shutdown
      kill_timeout: 10000,          // 10 seconds to gracefully shut down
      listen_timeout: 8000,         // 8 seconds to bind to port
      
      // Production hardening flags
      disable_source_map_support: true,  // Disable source maps in prod for performance
    },
    {
      name: 'careconnect-frontend-prod',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        FRONTEND_PORT: 3000,        // Explicit frontend port
        BACKEND_PORT: 3001,         // Reference to backend port for consistency
        NEXT_PUBLIC_API_URL: 'http://localhost:3001/api',
        STRICT_PORT_MODE: 'true'    // No port drift in production
      },
      
      // PRODUCTION HARDENING: Frontend restart policies  
      error_file: './frontend/logs/frontend-prod-error.log',
      out_file: './frontend/logs/frontend-prod-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
      autorestart: true,
      
      max_restarts: 3,              // Limit restarts to prevent infinite loops
      min_uptime: '60s',            // Must stay up at least 1 minute
      restart_delay: 10000,         // 10 second delay between restarts
      exp_backoff_restart_delay: 1000,  // Exponential backoff
      max_memory_restart: '300M',   // Restart if memory exceeds 300MB
      
      merge_logs: true,             // Easier troubleshooting
      kill_timeout: 10000,          // Graceful shutdown timeout
      listen_timeout: 8000,         // Port binding timeout
      
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};
