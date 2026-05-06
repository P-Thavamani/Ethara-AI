import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Enable source maps only for debugging (disable in prod for smaller bundles)
    sourcemap: false,
    // Warn if a chunk exceeds 500kb
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'react-hot-toast'],
          'data-vendor': ['axios', 'zustand', 'socket.io-client'],
        },
      },
    },
  },
  server: {
    // Proxy API calls to backend during local dev (no CORS issues locally)
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
