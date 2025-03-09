import { defineConfig } from 'vite';
import type { PluginOption, SSROptions, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { comlink } from 'vite-plugin-comlink';
import WebfontDownload from 'vite-plugin-webfont-dl';
import optimizer from 'vite-plugin-optimizer';
import { robots } from 'vite-plugin-robots';
import VConsole from 'vite-plugin-vconsole';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
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
    comlink(),
    WebfontDownload([
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap'
    ]),
    optimizer({
      exclude: ['node_modules/**'],
      entries: ['./src/main.tsx'],
      esbuild: {
        minify: true,
        target: 'es2020',
        loader: { '.ts': 'ts', '.tsx': 'tsx' },
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        jsx: 'react',
      }
    }),
    robots(),
    VConsole({
      entry: path.resolve('src/main.tsx'),
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
  ] as PluginOption[],
  server: {
    port: 3000,
    strictPort: true,
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
    rollupOptions: process.env.SSR ? {
      input: './src/entry-server.tsx',
      output: {
        format: 'esm'
      },
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@emotion/server',
        '@emotion/server/create-instance',
        '@emotion/cache',
        '@emotion/react',
        '@emotion/styled',
        '@emotion/use-insertion-effect-with-fallbacks',
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
      preserveEntrySignatures: 'strict'
    },
    chunkSizeWarningLimit: 800,
    assetsInlineLimit: 4096,
    modulePreload: {
      polyfill: true
    },
    reportCompressedSize: true,
    cssCodeSplit: true,
    ssr: process.env.SSR ? './src/entry-server.tsx' : undefined
  },
  ssr: {
    noExternal: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@emotion/react',
      '@emotion/styled',
      '@emotion/cache',
      '@emotion/server',
      '@emotion/utils',
      '@emotion/serialize',
      '@emotion/use-insertion-effect-with-fallbacks',
      '@mui/material',
      '@mui/icons-material',
      '@mui/utils',
      '@mui/base',
      '@mui/system',
      '@mui/styles',
      '@mui/private-theming'
    ],
    target: 'node',
    optimizeDeps: {
      include: [
        '@emotion/react',
        '@emotion/styled',
        '@emotion/cache',
        '@emotion/server',
        '@emotion/use-insertion-effect-with-fallbacks'
      ]
    }
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
      '@': path.resolve(__dirname, './src'),
      '@mui/styled-engine': path.resolve(__dirname, './src/mui-patches/styled-engine.js'),
      '@emotion/use-insertion-effect-with-fallbacks': path.resolve(__dirname, './src/mui-patches/emotion/use-insertion-effect-with-fallbacks.js'),
      '@emotion/react': path.resolve(__dirname, '../../node_modules/@emotion/react'),
      '@emotion/styled': path.resolve(__dirname, '../../node_modules/@emotion/styled'),
      '@emotion/cache': path.resolve(__dirname, '../../node_modules/@emotion/cache'),
      '@mui/utils/useEnhancedEffect': path.resolve(__dirname, 'src/mui-patches/useEnhancedEffect.js')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    '__EMOTION_INSERTION_EFFECT__': true
  }
}); 