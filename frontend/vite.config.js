import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split mathjs as it is large and used specifically for core math functions
            if (id.includes('mathjs')) {
              return 'vendor-mathjs';
            }
            // Split framer-motion as it is used for animations
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            // Split routing and axios client
            if (id.includes('react-router-dom') || id.includes('react-router') || id.includes('axios')) {
              return 'vendor-routing-api';
            }
            // Split lucide-react icons
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Let dynamic imports handle chart.js and tesseract.js automatically,
            // but for any other node_modules, group them into a general vendor chunk
            return 'vendor-common';
          }
        }
      }
    },
    chunkSizeWarningLimit: 800
  }
})