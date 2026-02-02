/**
 * PM2 Default Configuration (Legacy)
 * 
 * DEPRECATED: Use ecosystem.dev.config.js or ecosystem.prod.config.js instead.
 * This file kept for backwards compatibility.
 * 
 * Recommended:
 *   - Development: pm2 start ecosystem.dev.config.js
 *   - Production:  pm2 start ecosystem.prod.config.js
 */

module.exports = {
  apps: [
    {
      name: 'careconnect-backend',
      cwd: 'C:\\Users\\richl\\Care2system\\backend',
      script: 'start-backend.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        BACKEND_PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000
    },
    {
      name: 'careconnect-frontend',
      cwd: 'C:\\Users\\richl\\Care2system\\frontend',
      script: 'C:\\Users\\richl\\Care2system\\node_modules\\next\\dist\\bin\\next',
      args: 'start',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:3001'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000
    }
  ]
};
