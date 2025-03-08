import { defineConfig } from 'vite';
import type { PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import ViteComlink from 'vite-plugin-comlink';
import WebfontDownload from 'vite-plugin-webfont-dl';
import optimizer from 'vite-plugin-optimizer';
import { robots } from 'vite-plugin-robots';
import VConsole from 'vite-plugin-vconsole';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteComlink(),
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
      manifest: {
        name: 'Local Rabbit',
        short_name: 'Local Rabbit',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
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
            type: 'image/png'
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      },
      includeAssets: ['**/*'],
      registerType: 'prompt',
      strategies: 'generateSW',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,ico,png,svg}'],
        globIgnores: ['**/index.html'],
        cleanupOutdatedCaches: true,
        sourcemap: true,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/index\.html$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache'
            }
          }
        ]
      }
    })
  ] as PluginOption[],
  server: {
    port: 3000,
    strictPort: true,
    headers: {
      'Service-Worker-Allowed': '/',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    target: 'esnext',
    minify: 'esbuild'
  },
  optimizeDeps: {
    include: ['comlink'],
    exclude: []
  }
}); 