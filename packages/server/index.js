// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const routes = require('./routes/index.js');
const _gitRoutes = require('./routes/git');
const _authRoutes = require('./routes/authRoutes');
const _repositoryRoutes = require('./routes/repositoryRoutes');
const _diffRoutes = require('./routes/diffRoutes');
const _codeReviewRoutes = require('./routes/codeReviewRoutes');
const _secureGitRoutes = require('./routes/secureGitRoutes');

// Debug environment variables at startup
console.log('[SERVER] Checking environment variables at startup:');
console.log(`[SERVER] NODE_ENV: ${process.env.NODE_ENV}`);
if (process.env.GEMINI_API_KEY) {
  const key = process.env.GEMINI_API_KEY;
  const keyLength = key.length;
  const firstChars = key.substring(0, 4);
  const lastChars = key.substring(keyLength - 4);
  console.log(`[SERVER] GEMINI_API_KEY found (${keyLength} chars): ${firstChars}...${lastChars}`);

  // Check if it looks like a valid Google API key
  if (!key.startsWith('AIza')) {
    console.warn(`[SERVER] WARNING: GEMINI_API_KEY doesn't start with 'AIza', which is typical for Google API keys`);
  }
} else {
  console.error('[SERVER] GEMINI_API_KEY is missing from environment variables!');
}

const app = express();
// Get port from environment or use a range of fallbacks
const DEFAULT_PORT = 3000;
const PORT = parseInt(process.env.PORT) || DEFAULT_PORT;
// Get host from environment or default to 0.0.0.0 (all interfaces)
const HOST = process.env.HOST || '0.0.0.0';

// CORS configuration - dynamically allow client origins based on environment
const corsOptions = {
  // Auto-detect origin or use environment variable
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    // Get allowed origins from environment or use defaults
    const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').filter(Boolean);

    // If CORS_ORIGIN is not set, allow common development ports
    if (allowedOrigins.length === 0) {
      const commonPorts = [3000, 3001, 5173, 5174, 8080, 8081, 4000];
      commonPorts.forEach(port => {
        allowedOrigins.push(`http://localhost:${port}`);
      });
    }

    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));

// Body parsing middleware - ensure these are before route handlers
app.use(express.json({
  limit: '50mb',
  strict: false, // Allow non-standard JSON
  type: ['application/json', 'text/plain'],
}));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true,
}));

// Add middleware to log incoming request bodies for debugging
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log(`[SERVER] Incoming ${req.method} ${req.path} - Content-Type:`, req.headers['content-type']);
    console.log('[SERVER] Request body:', req.body);
  }
  next();
});

app.use(morgan('dev'));

// Error handling for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON',
      details: err.message,
    });
  }
  return next();
});

// API Routes
app.use('/api', routes);

// Add a direct route for the old /api/analyze endpoint
app.post('/api/analyze', (req, res) => {
  // Forward the request to our code review analyze endpoint
  req.url = '/code-review/analyze';
  routes(req, res);
});

// Add a route to expose the server configuration
app.get('/api/server-info', (req, res) => {
  res.json({
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
    serverTime: new Date().toISOString(),
  });
});

// Debug available routes
app._router.stack.forEach(function (middleware) {
  if (middleware.route) { // routes registered directly on the app
    console.log(`Route: ${JSON.stringify(middleware.route.path)}`);
  } else if (middleware.name === 'router') { // router middleware 
    middleware.handle.stack.forEach(function (handler) {
      const route = handler.route;
      if (route) {
        const methods = Object.keys(route.methods).join(', ').toUpperCase();
        console.log(`Route: ${methods} ${route.path}`);
      }
    });
  }
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Global error:', err);
  return res.status(500).json({
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Write the port to a temp file for client discovery
const saveServerPort = (port) => {
  try {
    const serverInfoPath = path.join(__dirname, '.server-info.json');
    fs.writeFileSync(serverInfoPath, JSON.stringify({
      port,
      host: HOST,
      timestamp: Date.now()
    }));
    console.log(`[SERVER] Wrote server information to ${serverInfoPath}`);
  } catch (err) {
    console.error('[SERVER] Failed to save server information:', err);
  }
};

// Function to try different ports
const startServer = (port) => {
  try {
    const server = app.listen(port, HOST, () => {
      console.log(`[SERVER] Server running on ${HOST}:${port}`);
      // Save port information for client discovery
      saveServerPort(port);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.info(`[SERVER] Port ${port} is busy, trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('[SERVER] Server error:', err);
      }
    });
  } catch (err) {
    console.error('[SERVER] Failed to start server:', err);
  }
};

// Start the server
startServer(PORT);
