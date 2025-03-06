import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Try to get server port from the server-info file
const getServerPort = () => {
  try {
    // Check for server info file in the server directory
    const serverInfoPath = path.resolve(__dirname, '../server/.server-info.json');

    if (fs.existsSync(serverInfoPath)) {
      const serverInfo = JSON.parse(fs.readFileSync(serverInfoPath, 'utf8'));

      // Check if the data is fresh (less than 1 hour old)
      const isDataFresh = Date.now() - serverInfo.timestamp < 3600000;

      if (isDataFresh && serverInfo.port) {
        console.log(`[VITE] Found server running on port ${serverInfo.port}`);
        return serverInfo.port;
      }
    }
  } catch (err) {
    console.warn('[VITE] Could not read server port from info file:', err.message);
  }

  return null; // Default to null if not found
};

export default defineConfig(({ mode }) => {
  // Load env files
  const env = loadEnv(mode, process.cwd(), '');

  // Determine server port with fallbacks
  const serverPort = getServerPort() || env.VITE_API_PORT || 3001;
  const serverUrl = env.VITE_API_BASE_URL || `http://127.0.0.1:${serverPort}`;

  console.log(`[VITE] Configuring API proxy to: ${serverUrl}`);

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
      // Use available port from env or default to common development port
      port: parseInt(env.VITE_CLIENT_PORT || 3000),
      strictPort: true, // Don't allow falling back to another port
      host: '127.0.0.1', // Force IPv4
      proxy: {
        '/api': {
          target: serverUrl,
          changeOrigin: true,
          secure: false,
          ws: true, // Enable WebSocket proxy
          xfwd: true, // Add x-forward headers
          rewrite: (path) => path,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.error('[VITE] Proxy error:', err);
              if (!res.headersSent) {
                res.writeHead(500, {
                  'Content-Type': 'application/json',
                });
                res.end(JSON.stringify({
                  error: 'Proxy Error',
                  message: 'Failed to connect to the API server. Please ensure it is running.',
                  details: err.message
                }));
              }
            });

            proxy.on('proxyReq', (proxyReq, req, res) => {
              proxyReq.setHeader('Origin', serverUrl);
            });
          },
        }
      },
      // Add security headers
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'same-site',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      },
      // Restrict host access
      hmr: {
        host: '127.0.0.1', // Force IPv4
        // Use env port or fallback to prevent hardcoding
        clientPort: parseInt(env.VITE_CLIENT_PORT || 3000),
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
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(serverUrl),
      'import.meta.env.VITE_NODE_ENV': JSON.stringify(env.VITE_NODE_ENV || 'development')
    },
  }
})
