module.exports = {
  apps: [
    {
      name: 'careconnect-backend',
      script: 'src/server.ts',
      interpreter: 'node',
      interpreter_args: '--require ts-node/register --require tsconfig-paths/register',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
        TS_NODE_TRANSPILE_ONLY: 'false',
      },
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      log_file: 'logs/pm2-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 10000,
      kill_timeout: 5000,
      wait_ready: true,
      // Health check
      healthCheck: {
        url: 'http://localhost:3001/health/live',
        interval: 30000,
        timeout: 5000,
      },
    },
  ],
};
