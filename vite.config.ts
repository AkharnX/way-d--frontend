import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/auth': {
        target: 'http://127.0.0.1:8080',
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
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        rewrite: (path) => {
          // Special handling for health endpoint
          if (path === '/api/profile/health') {
            return '/health';
          }
          // Profile routes need to maintain /profile prefix
          return path.replace(/^\/api\/profile/, '/profile');
        }
      },
      '/api/interactions': {
        target: 'http://127.0.0.1:8082',
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
        target: 'http://127.0.0.1:8083',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/events/, '/api/events')
      },
      '/api/payments': {
        target: 'http://127.0.0.1:8084',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/payments/, '/api/payments')
      },
      '/api/notifications': {
        target: 'http://127.0.0.1:8085',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/notifications/, '/api/notifications')
      },
      '/api/moderation': {
        target: 'http://127.0.0.1:8086',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/moderation/, '/api/moderation')
      },
      '/api/analytics': {
        target: 'http://127.0.0.1:8087',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/analytics/, '/api/v1')
      },
      '/api/admin': {
        target: 'http://127.0.0.1:8088',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/admin/, '/api/v1')
      }
    }
  },
  preview: {
    port: 5173,
    host: true,
    proxy: {
      '/api/auth': {
        target: 'http://127.0.0.1:8080',
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
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        rewrite: (path) => {
          // Special handling for health endpoint
          if (path === '/api/profile/health') {
            return '/health';
          }
          // Profile routes need to maintain /profile prefix
          return path.replace(/^\/api\/profile/, '/profile');
        }
      },
      '/api/interactions': {
        target: 'http://127.0.0.1:8082',
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
        target: 'http://127.0.0.1:8083',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/events/, '/api/events')
      },
      '/api/payments': {
        target: 'http://127.0.0.1:8084',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/payments/, '/api/payments')
      },
      '/api/notifications': {
        target: 'http://127.0.0.1:8085',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/notifications/, '/api/notifications')
      },
      '/api/moderation': {
        target: 'http://127.0.0.1:8086',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/moderation/, '/api/moderation')
      },
      '/api/analytics': {
        target: 'http://127.0.0.1:8087',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/analytics/, '/api/v1')
      },
      '/api/admin': {
        target: 'http://127.0.0.1:8088',
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