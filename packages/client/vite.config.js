import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
// Remove or comment out comlink if not needed
// import { comlink } from 'vite-plugin-comlink';
import WebfontDownload from 'vite-plugin-webfont-dl';
import optimizer from 'vite-plugin-optimizer';
import { robots } from 'vite-plugin-robots';
import VConsole from 'vite-plugin-vconsole';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-runtime', { regenerator: true }],
          ['@emotion/babel-plugin', { sourceMap: true, autoLabel: 'dev-only' }]
        ],
        presets: [
          ['@babel/preset-react', {
            runtime: 'automatic',
            development: process.env.NODE_ENV !== 'production',
            importSource: '@emotion/react'
          }]
        ]
      },
      jsxRuntime: 'automatic',
      jsxImportSource: '@emotion/react'
    }),
    // Remove or comment out comlink() if not needed
    // comlink(),
    WebfontDownload([
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap'
    ]),
    optimizer({
      exclude: ['node_modules/**'],
      entries: ['./src/main.jsx'],
      esbuild: {
        minify: true,
        target: 'es2020',
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        jsx: 'react'
      }
    }),
    robots(),
    VConsole({
      entry: path.resolve('src/main.jsx'),
      localEnabled: true,
      enabled: process.env.NODE_ENV !== 'production',
      config: {
        maxLogNumber: 1000,
        theme: 'dark'
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Local Rabbit',
        short_name: 'LocalRabbit',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
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
          }
        ]
      }
    }),
    visualizer({
      filename: '.stats/stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    })
  ],
  server: {
    port: 5173, // Changed from 3000 to Vite's default 5173
    strictPort: false, // Changed to allow fallback ports
    headers: {
      'Service-Worker-Allowed': '/',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    },
    open: true,
    cors: true
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: true,
    rollupOptions: process.env.SSR === 'true' ? {
      input: './src/entry-server.jsx',
      output: {
        format: 'esm',
        dir: 'dist/server',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        exports: 'named',
        preserveModules: true,
        preserveModulesRoot: 'src'
      },
      external: [
        'react',
        'react-dom',
        'react-dom/server',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@emotion/server',
        '@emotion/server/create-instance',
        '@emotion/cache',
        '@emotion/react',
        '@emotion/styled',
        '@emotion/use-insertion-effect-with-fallbacks',
        '@mui/material',
        '@mui/system',
        '@mui/utils',
        '@mui/styled-engine',
        '@mui/styled-engine/StyledEngineProvider'
      ]
    } : {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('@mui') || id.includes('@emotion')) return 'mui-vendor';
            return 'vendor';
          }
        }
      },
      chunkSizeWarningLimit: 800,
      assetsInlineLimit: 4096,
      modulePreload: {
        polyfill: true
      },
      reportCompressedSize: true,
      cssCodeSplit: true
    },
    ssr: process.env.SSR === 'true' ? {
      noExternal: ['@emotion/*', '@mui/material/*', '@mui/system/*'],
      target: 'node',
      format: 'esm',
      entry: './src/entry-server.jsx'
    } : undefined
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
      '@emotion/cache',
      '@emotion/use-insertion-effect-with-fallbacks',
      '@mui/styled-engine',
      '@mui/styled-engine/StyledEngineProvider',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@reduxjs/toolkit',
      '@tanstack/react-query',
      'axios',
      'framer-motion'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.js', '.jsx', '.json']
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    '__EMOTION_INSERTION_EFFECT__': true
  }
});