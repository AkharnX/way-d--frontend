import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin pour ajouter les en-têtes de sécurité
const securityHeaders = () => {
  return {
    name: 'security-headers',
    configureServer(server: any) {
      server.middlewares.use((_req: any, res: any, next: any) => {
        // Content Security Policy
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "font-src 'self' https://fonts.gstatic.com; " +
          "img-src 'self' data: https:; " +
          "connect-src 'self' http://localhost:8080 http://localhost:8081 http://localhost:8082 ws://localhost:* wss://localhost:*; " +
          "frame-ancestors 'self';"
        )
        
        // Protection contre le clickjacking
        res.setHeader('X-Frame-Options', 'SAMEORIGIN')
        
        // Protection XSS
        res.setHeader('X-XSS-Protection', '1; mode=block')
        
        // Éviter le MIME sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff')
        
        // Référer Policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        
        // Permissions Policy
        res.setHeader(
          'Permissions-Policy',
          'geolocation=(self), microphone=(), camera=()'
        )
        
        // Force HTTPS (en production)
        if (process.env.NODE_ENV === 'production') {
          res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
        }
        
        next()
      })
    }
  }
}

// Configuration HTTPS pour le développement
const getHttpsConfig = () => {
  const certPath = path.resolve(__dirname, 'certs', 'localhost.crt')
  const keyPath = path.resolve(__dirname, 'certs', 'localhost.key')
  
  // Vérifier si les certificats existent
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  }
  
  return undefined
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), securityHeaders()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Allow external access from any IP
    
    // Configuration HTTPS optionnelle (si certificats présents)
    https: getHttpsConfig(),
    
    cors: {
      origin: true, // Allow all origins
      credentials: true,
    },
    proxy: {
      // Proxy pour rediriger les requêtes API vers les services backend
      '/api/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/auth/, ''),
      },
      '/api/profile': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/profile/, '/profile'),
      },
      '/api/interactions': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/interactions/, ''),
      },
    },
  },
  build: {
    // Configuration pour la production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    },
    // Source maps pour le débogage en production
    sourcemap: true,
  },
  // Variables d'environnement
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
