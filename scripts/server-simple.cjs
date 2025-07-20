const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

console.log('🚀 Démarrage du serveur HTTPS Way-d...');

// Chemin absolu vers le répertoire du projet
const PROJECT_ROOT = '/home/akharn/way-d/frontend';

console.log(`📁 Répertoire du projet: ${PROJECT_ROOT}`);

// En-têtes de sécurité
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss: http: https:;");
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Powered-By', 'Way-d HTTPS Server');
  next();
});

// Servir les fichiers statiques depuis le build
const distPath = path.join(PROJECT_ROOT, 'dist');
console.log(`📦 Serving static files from: ${distPath}`);
app.use(express.static(distPath));

// Configuration des proxies vers les APIs backend
const proxyOptions = {
  changeOrigin: true,
  timeout: 10000,
  proxyTimeout: 10000,
  onError: (err, req, res) => {
    console.error(`❌ Proxy Error for ${req.url}:`, err.message);
    res.status(503).json({ error: 'Service temporairement indisponible' });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying ${req.method} ${req.url} -> ${proxyReq.path}`);
  }
};

// Proxy vers les APIs backend
console.log('🔧 Configuring API proxies...');

app.use('/api/auth', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://localhost:8080',
  pathRewrite: { '^/api/auth': '' }
}));

app.use('/api/profile', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://localhost:8081',
  pathRewrite: { '^/api/profile': '' }
}));

app.use('/api/interactions', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://localhost:8082',
  pathRewrite: { '^/api/interactions': '' }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('💚 Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      https: true,
      frontend: 'running',
      backend_auth: 'proxy_to_8080',
      backend_profile: 'proxy_to_8081', 
      backend_interactions: 'proxy_to_8082'
    }
  });
});

// SPA fallback - toutes les routes non-API retournent index.html
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log(`📄 Serving SPA: ${req.url} -> ${indexPath}`);
  res.sendFile(indexPath);
});

// Configuration SSL avec chemins absolus
const certPath = path.join(PROJECT_ROOT, 'certs', 'localhost.crt');
const keyPath = path.join(PROJECT_ROOT, 'certs', 'localhost.key');

console.log(`🔐 SSL Certificate: ${certPath}`);
console.log(`🗝️  SSL Key: ${keyPath}`);

try {
  const sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
  console.log('✅ SSL certificates loaded successfully');
  
  // Ports non-privilégiés pour éviter les problèmes de permissions
  const HTTP_PORT = 8880;  // Redirection HTTP
  const HTTPS_PORT = 8443; // HTTPS principal 
  
  // Application de redirection HTTP -> HTTPS
  const httpApp = express();
  httpApp.use((req, res) => {
    const httpsUrl = `https://${req.headers.host.replace(':8880', ':8443')}${req.url}`;
    console.log(`🔄 HTTP -> HTTPS redirect: ${httpsUrl}`);
    res.redirect(301, httpsUrl);
  });
  
  // Démarrage des serveurs
  const httpServer = http.createServer(httpApp);
  const httpsServer = https.createServer(sslOptions, app);
  
  httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`🔄 HTTP Server (redirection) running on port ${HTTP_PORT}`);
    console.log(`   http://localhost:${HTTP_PORT} -> https://localhost:${HTTPS_PORT}`);
  });
  
  httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`🔒 HTTPS Server running on port ${HTTPS_PORT}`);
    console.log(`   ✅ Way-d is now running securely at https://localhost:${HTTPS_PORT}`);
    console.log(`   📱 Frontend: https://localhost:${HTTPS_PORT}`);
    console.log(`   🔧 Backend APIs: /api/auth, /api/profile, /api/interactions`);
    console.log(`   💚 Health Check: https://localhost:${HTTPS_PORT}/health`);
  });
  
  // Gestion des signaux pour un arrêt propre
  process.on('SIGTERM', () => {
    console.log('📴 Graceful shutdown initiated...');
    httpsServer.close(() => {
      httpServer.close(() => {
        console.log('✅ Servers closed successfully');
        process.exit(0);
      });
    });
  });
  
  process.on('SIGINT', () => {
    console.log('📴 Graceful shutdown initiated...');
    httpsServer.close(() => {
      httpServer.close(() => {
        console.log('✅ Servers closed successfully');
        process.exit(0);
      });
    });
  });
  
} catch (error) {
  console.error('❌ Error starting HTTPS server:', error.message);
  process.exit(1);
}
