/**
 * PM2 Development Configuration
 * 
 * For local development with hot-reload and debugging.
 * Background services disabled by default in dev mode.
 * 
 * Usage:
 *   pm2 start ecosystem.dev.config.js
 *   pm2 logs
 */

module.exports = {
  apps: [
    {
      name: 'care2connect-backend-dev',
      script: 'C:\\Program Files\\nodejs\\npx.cmd',
      args: 'tsx watch src/server.ts',
      cwd: './backend',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        BACKEND_PORT: 3001,
        START_BACKGROUND_SERVICES: 'false', // Disabled in dev by default
        V1_STABLE: 'true',
        AI_PROVIDER: 'rules',
        HEALTHCHECKS_ENABLED: 'false'
      },
      error_file: './backend/logs/backend-dev-error.log',
      out_file: './backend/logs/backend-dev-out.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 2000,
      watch: false
    },
    {
      name: 'care2connect-frontend-dev',
      script: 'C:\\Program Files\\nodejs\\npx.cmd',
      args: 'next dev',
      cwd: './frontend',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:3001'
      },
      error_file: './frontend/logs/frontend-dev-error.log',
      out_file: './frontend/logs/frontend-dev-out.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 2000,
      watch: false
    }
  ]
};
