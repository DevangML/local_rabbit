import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env files
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react({
        // This is the key configuration to handle JSX in .js files
        include: "**/*.{jsx,js}",
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        assert: 'assert',
        util: 'util'
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
      // Add security headers
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'same-site',
        'Access-Control-Allow-Origin': '*',
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
        // Configure esbuild to handle JSX in .js files
        loader: {
          '.js': 'jsx',
          '.jsx': 'jsx'
        },
      }
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      // Configure esbuild to handle JSX in .js files
      loader: 'jsx',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      target: 'es2020'
    },
    define: {
      'process.env': {}, // This ensures process.env is defined but empty
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:3001'),
      'import.meta.env.VITE_NODE_ENV': JSON.stringify(env.VITE_NODE_ENV || 'development')
    },
  }
})
