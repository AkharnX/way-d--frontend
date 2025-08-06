import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => {
          // Special handling for health endpoint
          if (path === '/api/auth/health') {
            return '/health';
          }
          // Default rewrite for other auth endpoints
          return path.replace(/^\/api\/auth/, '');
        }
      },
      '/api/profile': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => {
          // Special handling for health endpoint
          if (path === '/api/profile/health') {
            return '/health';
          }
          // Default rewrite for other profile endpoints
          return path.replace(/^\/api\/profile/, '');
        }
      },
      '/api/interactions': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        rewrite: (path) => {
          // Special handling for health endpoint
          if (path === '/api/interactions/health') {
            return '/health';
          }
          // Default rewrite for other interactions endpoints
          return path.replace(/^\/api\/interactions/, '/api');
        }
      },
      '/api/events': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/events/, '/api/events')
      },
      '/api/payments': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/payments/, '/api/payments')
      },
      '/api/notifications': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/notifications/, '/api/notifications')
      },
      '/api/moderation': {
        target: 'http://localhost:8086',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/moderation/, '/api/moderation')
      },
      '/api/analytics': {
        target: 'http://localhost:8087',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/analytics/, '/api/v1')
      },
      '/api/admin': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/admin/, '/api/v1')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    }
  }
})