import { defineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\.github\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      },
      manifest: {
        name: 'Local Rabbit',
        short_name: 'Local Rabbit',
        description: 'Git Repository Analysis Tool',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ] as UserConfig['plugins'],
  build: {
    manifest: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: 'src/main.tsx',
      },
      output: {
        manualChunks: (id) => {
          // Create separate chunks for major dependencies
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router-dom/')) {
              return 'vendor-react';
            }
            if (id.includes('@mui/material/')) {
              return 'vendor-mui-core';
            }
            if (id.includes('@mui/icons-material/')) {
              return 'vendor-mui-icons';
            }
            if (id.includes('@emotion/')) {
              return 'vendor-emotion';
            }
            if (id.includes('framer-motion/')) {
              return 'vendor-motion';
            }
            // Group remaining node_modules into a shared vendor chunk
            return 'vendor-shared';
          }
          // Split features into separate chunks
          if (id.includes('/components/')) {
            if (id.includes('/Products/') || id.includes('/BranchSelector/')) {
              return 'features-products';
            }
            if (id.includes('/DiffViewer/')) {
              return 'features-diff';
            }
            if (id.includes('/ImpactView/') || id.includes('/QualityCheck/') || id.includes('/AIAnalyzer')) {
              return 'features-analysis';
            }
            if (id.includes('/Documentation/') || id.includes('/About/') || id.includes('/Contact/')) {
              return 'features-docs';
            }
          }
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: !process.env.VITE_DEBUG,
        drop_debugger: !process.env.VITE_DEBUG
      }
    }
  },
  ssr: {
    noExternal: ['@emotion/react', '@emotion/styled', '@mui/material', '@mui/icons-material']
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion'
    ]
  }
}) as UserConfig; 