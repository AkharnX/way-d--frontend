module.exports = {
  apps: [
    {
      name: 'way-d-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: '/home/akharn/way-d/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true
    }
  ]
};
