import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/api/transactions': {
        target: 'http://localhost:3002',
        changeOrigin: true
      },
      '/api/budgets': {
        target: 'http://localhost:3003',
        changeOrigin: true
      },
      '/api/notifications': {
        target: 'http://localhost:3004',
        changeOrigin: true
      }
    }
  }
});
