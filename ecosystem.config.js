module.exports = {
  apps: [{
    name: 'realsourcing-api',
    script: 'server/_core/index.ts',
    interpreter: 'tsx',
    cwd: '/var/www/realsourcing',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
