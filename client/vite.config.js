import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
    // Add security headers
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-site',
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
    // Restrict host access
    hmr: {
      host: 'localhost',
      clientPort: 3000,
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Skip certain warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        warn(warning)
      }
    }
  },
  optimizeDeps: {
    exclude: ['react-syntax-highlighter'],
    esbuildOptions: {
      target: 'esnext',
      supported: { 
        'top-level-await': true 
      },
    }
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    loader: 'jsx',
    include: /\.(jsx|js)$/,
    exclude: /node_modules/,
  }
})
