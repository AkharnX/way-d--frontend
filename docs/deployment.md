# Way-d Deployment Guide

## Overview
This guide covers the deployment process for the Way-d frontend application using PM2 and Nginx.

## Prerequisites
- Node.js 18+ installed
- PM2 installed globally (`npm install -g pm2`)
- Nginx configured as reverse proxy
- SSL certificates (for production)

## Environment Setup

### Development
```bash
# Clone the repository
git clone https://github.com/AkharnX/way-d--frontend.git
cd way-d--frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production

#### Step 1: Build the Application
```bash
# Build for production
npm run build

# Verify build
ls -la dist/
```

#### Step 2: PM2 Deployment
```bash
# Deploy with PM2
npm run deploy:pm2

# Or manually
pm2 start tools/deployment/ecosystem.config.cjs --env production
```

#### Step 3: Nginx Configuration
Ensure Nginx is configured to proxy requests to port 5173:
```nginx
location / {
    proxy_pass http://localhost:5173;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## PM2 Management

### Basic Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs way-d-frontend

# Restart application
pm2 restart way-d-frontend

# Stop application
pm2 stop way-d-frontend

# Delete from PM2
pm2 delete way-d-frontend
```

### Monitoring
```bash
# Real-time monitoring
pm2 monit

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

## Environment Variables
Create `.env` file for environment-specific configuration:
```bash
# API Configuration
VITE_API_BASE_URL=https://api.way-d.com
VITE_APP_ENV=production

# Analytics
VITE_ANALYTICS_ID=your-analytics-id

# Feature Flags
VITE_PREMIUM_ENABLED=true
VITE_EVENTS_ENABLED=true
```

## SSL/HTTPS Setup

### Using Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual Certificate
```bash
# Generate self-signed certificate (development only)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

## Health Checks

### Application Health
```bash
# Check if application is running
curl http://localhost:5173/

# Check through Nginx
curl https://your-domain.com/
```

### System Health
```bash
# Check PM2 processes
pm2 list

# Check Nginx status
sudo systemctl status nginx

# Check logs
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Common Issues

#### Application Won't Start
1. Check PM2 logs: `pm2 logs way-d-frontend`
2. Verify Node.js version: `node --version`
3. Check port availability: `lsof -i :5173`
4. Verify build exists: `ls -la dist/`

#### 502 Bad Gateway
1. Verify application is running: `pm2 status`
2. Check Nginx configuration: `nginx -t`
3. Verify proxy settings in Nginx config
4. Check firewall settings

#### Performance Issues
1. Monitor PM2 metrics: `pm2 monit`
2. Check system resources: `htop`
3. Review application logs for errors
4. Consider scaling with PM2 cluster mode

### Debugging Commands
```bash
# Verbose PM2 logs
pm2 logs --lines 100

# Check system resources
free -h
df -h

# Network diagnostics
netstat -tlnp | grep :5173
```

## Backup and Recovery

### Application Backup
```bash
# Backup configuration
cp -r tools/deployment/ ~/backups/

# Backup environment files
cp .env* ~/backups/
```

### Database Backup (if applicable)
```bash
# PostgreSQL backup
pg_dump way_d_db > ~/backups/way_d_$(date +%Y%m%d).sql
```

## Scaling

### PM2 Cluster Mode
```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'way-d-frontend',
    script: 'npm',
    args: 'run preview',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster'
  }]
};
```

### Load Balancer Setup
For high traffic, consider:
- Multiple server instances
- Load balancer (Nginx/HAProxy)
- CDN for static assets
- Database replication

## Security Checklist
- [ ] SSL/TLS certificates installed and configured
- [ ] Security headers configured in Nginx
- [ ] Environment variables secured
- [ ] Regular security updates applied
- [ ] Access logs monitored
- [ ] Firewall configured properly

## Monitoring and Logging
- Application logs: PM2 logs
- Access logs: Nginx access logs
- Error logs: Nginx error logs
- System monitoring: Consider Prometheus + Grafana
- Uptime monitoring: Consider external services

For additional support, refer to the [API Documentation](api.md) and [Contributing Guidelines](../CONTRIBUTING.md).
