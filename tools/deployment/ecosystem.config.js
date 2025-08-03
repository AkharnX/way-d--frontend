module.exports = {
  apps: [{
    name: 'way-d-frontend',
    script: './node_modules/.bin/vite',
    args: '--host --port 5173',
    cwd: '/home/akharn/way-d/frontend',
    env: {
      NODE_ENV: 'development',
      PORT: 5173
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    exec_mode: 'fork'
  }]
};
