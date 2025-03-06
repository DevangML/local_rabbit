import { defineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()] as UserConfig['plugins'],
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