import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'CalcNova',
        short_name: 'CalcNova',
        description: 'Your Intelligent SaaS Calculator',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/final-calc\.onrender\.com\/api\/(?!health).*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
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