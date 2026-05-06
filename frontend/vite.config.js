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
        // Split vendor chunks for better caching (function form required by Vite 8/rolldown)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'react-vendor';
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('react-hot-toast')) return 'ui-vendor';
            if (id.includes('axios') || id.includes('zustand') || id.includes('socket.io')) return 'data-vendor';
          }
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
