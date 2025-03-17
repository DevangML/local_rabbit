import express, { Express, RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import sirv from 'sirv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import React from 'react';
import { renderToString, renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import { cpus } from 'os';

// Setup browser globals for SSR
class Element {
  attributes: Record<string, any> = {};
  style: Record<string, any> = {};
  childNodes: any[] = [];
  
  setAttribute(name: string, value: any) {
    this.attributes[name] = value;
  }
  
  getAttribute(name: string) {
    return this.attributes[name];
  }
  
  appendChild(child: any) {
    this.childNodes.push(child);
    return child;
  }
  
  cloneNode() {
    return new Element();
  }
}

// Only set globals if they don't exist
if (typeof global.document === 'undefined') {
  (global as any).document = {
    head: new Element(),
    body: new Element(),
    createElement: (tag: string) => new Element(),
    createTextNode: (text: string) => ({ text }),
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    documentElement: new Element()
  };

  (global as any).window = {
    document: (global as any).document,
    location: { pathname: '/' },
    navigator: { userAgent: 'node' },
    addEventListener: () => {}
  };

  (global as any).navigator = {
    userAgent: 'node'
  };
}

// Define types for the Emotion server functions
type EmotionCriticalToChunks = (html: React.ReactElement) => Array<{ key: string; ids: Array<string>; css: string }>;
type EmotionConstructStyleTags = (chunks: Array<{ key: string; ids: Array<string>; css: string }>) => string;

// Define type for entry server module
type EntryServer = {
  renderPage: (url: string) => React.ReactElement;
  renderToStream?: (url: string) => React.ReactElement;
  extractCriticalToChunks: EmotionCriticalToChunks;
  constructStyleTagsFromChunks: EmotionConstructStyleTags;
};

// Get the current directory
const __dirname = dirname(fileURLToPath(import.meta.url));

// Conditionally import the server-side rendering function
// This way we can run the server in development without the client build
const isDev = process.env.NODE_ENV === 'development';
let renderPage: (url: string) => React.ReactElement | null = () => null;
let renderToStream: (url: string) => React.ReactElement | null = () => null;
let extractCriticalToChunks: EmotionCriticalToChunks | null = null;
let constructStyleTagsFromChunks: EmotionConstructStyleTags | null = null;

// In production, import the entry-server module
// In development, use a dummy renderer
if (!isDev) {
  try {
    // First try the new path (from client workspace build)
    const clientDistPath = join(__dirname, '../../client/dist');
    const ssrEntryPath = join(clientDistPath, 'server/entry-server.js');
    
    try {
      if (fs.existsSync(ssrEntryPath)) {
        console.log('Found SSR entry at:', ssrEntryPath);
        // @ts-ignore - This file will be generated at build time
        const entryServer = await import(ssrEntryPath);
        
        renderPage = entryServer.renderPage || entryServer.default?.renderPage || (() => null);
        renderToStream = entryServer.renderToStream || entryServer.default?.renderToStream || renderPage;
        extractCriticalToChunks = entryServer.extractCriticalToChunks || entryServer.default?.extractCriticalToChunks || null;
        constructStyleTagsFromChunks = entryServer.constructStyleTagsFromChunks || entryServer.default?.constructStyleTagsFromChunks || null;
      } else {
        console.warn('SSR entry not found at expected path:', ssrEntryPath);
        
        // Try to load the custom entry server file
        const customEntryPath = join(__dirname, '../../client/src/entry-server-custom.js');
        if (fs.existsSync(customEntryPath)) {
          console.log('Found custom SSR entry at:', customEntryPath);
          // @ts-ignore - This file is a custom fallback
          const customEntry = await import(customEntryPath);
          
          renderPage = customEntry.renderPage || customEntry.default?.renderPage || (() => null);
          renderToStream = customEntry.renderToStream || customEntry.default?.renderToStream || renderPage;
          extractCriticalToChunks = customEntry.extractCriticalToChunks || customEntry.default?.extractCriticalToChunks || null;
          constructStyleTagsFromChunks = customEntry.constructStyleTagsFromChunks || customEntry.default?.constructStyleTagsFromChunks || null;
        }
      }
    } catch (importError) {
      console.error('Error importing SSR entry:', importError);
      
      // Fallback to custom entry-server if available
      try {
        const customEntryPath = join(__dirname, '../../client/src/entry-server-custom.js');
        if (fs.existsSync(customEntryPath)) {
          console.log('Falling back to custom SSR entry at:', customEntryPath);
          // @ts-ignore - This file is a custom fallback
          const customEntry = await import(customEntryPath);
          
          renderPage = customEntry.renderPage || customEntry.default?.renderPage || (() => null);
          renderToStream = customEntry.renderToStream || customEntry.default?.renderToStream || renderPage;
          extractCriticalToChunks = customEntry.extractCriticalToChunks || customEntry.default?.extractCriticalToChunks || null;
          constructStyleTagsFromChunks = customEntry.constructStyleTagsFromChunks || customEntry.default?.constructStyleTagsFromChunks || null;
        }
      } catch (fallbackError) {
        console.error('Error loading fallback SSR entry:', fallbackError);
      }
    }
  } catch (error) {
    console.error('Failed to load SSR module:', error);
  }
}

// Load environment variables
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Configure MIME types
express.static.mime.define({
  'application/javascript': ['js', 'mjs', 'jsx', 'ts', 'tsx'],
  'text/javascript': ['js', 'mjs', 'jsx', 'ts', 'tsx']
});

// PERFORMANCE BEST PRACTICES

// 1. Use gzip compression
app.use(compression({
  // Compress all responses over 1KB
  threshold: 1024,
  // Don't compress responses with this request header
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}) as unknown as RequestHandler);

// 2. Use helmet for security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  }
}));

// 3. Configure CORS properly
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || false
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// 4. Use efficient logging
app.use(morgan(isDev ? 'dev' : 'combined', {
  skip: (req, res) => res.statusCode < 400 && process.env.NODE_ENV === 'production'
}));

// 5. Proper JSON handling with limits
app.use(express.json({ 
  limit: '1mb' 
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '1mb'
}));

// 6. Set proper cache headers for static assets
const clientDistPath = join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  // Serve service worker at root with no caching
  app.get('/sw.js', (req, res) => {
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(join(clientDistPath, 'sw.js'));
  });

  // Serve manifest.json with minimal caching
  app.get('/manifest.json', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(join(clientDistPath, 'manifest.json'));
  });

  // Serve static assets with proper caching
  app.use(sirv(clientDistPath, {
    dev: isDev,
    etag: true,
    maxAge: isDev ? 0 : 31536000, // 1 year for production
    immutable: !isDev,
    extensions: ['html', 'js', 'css', 'svg', 'png', 'jpg', 'jpeg', 'gif'],
    gzip: true,
    brotli: true
  }) as unknown as RequestHandler);
}

// 7. Add error handling for static files
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    console.error('Static file error:', err);
    res.status(404).send('File not found');
  } else {
    next();
  }
});

// Development support for Vite client
app.get('/@vite/client', (req, res) => {
  console.log('[DEBUG] Vite client request detected');
  // Redirect to the Vite dev server (if it's running)
  res.redirect('http://localhost:5173/@vite/client');
});

// Forward known Vite development endpoints
app.get('/@fs/*', (req, res) => {
  console.log(`[DEBUG] Vite filesystem request: ${req.path}`);
  res.redirect(`http://localhost:5173${req.path}`);
});

// 8. Implement streaming SSR with React 19
const ssrHandler: RequestHandler = async (req, res) => {
  try {
    // Initial state that will be hydrated on the client
    const initialState = {
      url: req.url,
      env: process.env.NODE_ENV
    };

    // In development, use a simpler template without SSR
    if (isDev) {
      const template = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="description" content="Local Rabbit Application (Dev Mode)" />
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/manifest.json" />
            <title>Local Rabbit (Dev)</title>
          </head>
          <body>
            <div id="root">
              <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
                <h1>Development Mode</h1>
                <p>This is a development server. SSR is disabled in dev mode.</p>
                <p>Build the client with 'npm run build:ssr' for full SSR.</p>
              </div>
            </div>
            <script>
              window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
            </script>
            <script type="module" src="/src/main.tsx"></script>
          </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-store, must-revalidate');
      return res.send(template);
    }

    // Production mode with SSR enabled
    // Use React 19 streaming capabilities
    if (renderToStream && renderToPipeableStream) {
      const appElement = renderToStream(req.url);
      
      // Check if appElement is null before proceeding
      if (!appElement) {
        console.warn('renderToStream returned null, falling back to traditional SSR');
      } else {
        // Extract critical CSS if available
        let styleTag = '';
        if (extractCriticalToChunks && constructStyleTagsFromChunks) {
          try {
            const chunks = extractCriticalToChunks(appElement);
            styleTag = constructStyleTagsFromChunks(chunks);
          } catch (cssError) {
            console.warn('Failed to extract critical CSS:', cssError);
          }
        }
        
        // Prepare the HTML shell
        const htmlStart = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <meta name="description" content="Local Rabbit Application" />
              <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
              <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
              <link rel="manifest" href="/manifest.json" />
              <title>Local Rabbit</title>
              ${styleTag}
            </head>
            <body>
              <div id="root">
        `;
        
        const htmlEnd = `
              </div>
              <script>
                window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
              </script>
              <script type="module" src="/assets/index.js"></script>
            </body>
          </html>
        `;
        
        // Set headers for streaming
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Ensure we have a valid React element
        try {
          // Create the stream
          const { pipe } = renderToPipeableStream(appElement, {
            bootstrapScripts: ['/assets/index.js'],
            onShellReady() {
              // The content above all Suspense boundaries is ready
              res.statusCode = 200;
              res.write(htmlStart);
              pipe(res);
              
              // Write the end HTML after the component stream with a slight delay
              // to ensure proper order of rendering
              setTimeout(() => {
                if (!res.writableEnded) {
                  res.write(htmlEnd);
                }
              }, 100);
            },
            onAllReady() {
              // If you don't want streaming, you can use this instead of onShellReady
              // All the content is now ready, including Suspense boundaries
              // Don't write to the response here as it might cause "write after end" errors
              // Instead, ensure htmlEnd is written only if the response is still writable
              if (!res.writableEnded) {
                res.write(htmlEnd);
              }
            },
            onError(error) {
              // Log the error
              console.error('Streaming SSR error:', error);
              
              // If headers haven't been sent yet, we can send an error response
              if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/html');
                res.end(`<!DOCTYPE html>
                  <html>
                    <head>
                      <title>Error</title>
                    </head>
                    <body>
                      <h1>Something went wrong</h1>
                      <p>The server encountered an error.</p>
                      <script>
                        window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
                      </script>
                      <script type="module" src="/assets/index.js"></script>
                    </body>
                  </html>`);
              } else {
                // If headers were sent, just end the response
                if (!res.writableEnded) {
                  res.end(htmlEnd);
                }
              }
            }
          });
        } catch (streamError) {
          console.error('Error creating stream:', streamError);
          
          // Fall back to simple string rendering if streaming fails
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/html');
            res.send(`<!DOCTYPE html>
              <html>
                <head>
                  <title>Streaming Error</title>
                </head>
                <body>
                  <h1>Streaming Error</h1>
                  <p>There was an error streaming the application. Please try again later.</p>
                  <script>
                    window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
                  </script>
                  <script type="module" src="/assets/index.js"></script>
                </body>
              </html>`);
          }
        }
        
        return;
      }
    }
    
    // Fallback to traditional SSR if streaming is not available
    const app = renderPage(req.url);
    
    // If SSR is not available, return a basic HTML shell
    if (!app) {
      const template = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="description" content="Local Rabbit Application" />
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/manifest.json" />
            <title>Local Rabbit</title>
          </head>
          <body>
            <div id="root"></div>
            <script>
              window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
            </script>
            <script type="module" src="/assets/index.js"></script>
          </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(template);
    }
    
    // Extract critical CSS if available
    let styleTag = '';
    if (extractCriticalToChunks && constructStyleTagsFromChunks) {
      try {
        const chunks = extractCriticalToChunks(app);
        styleTag = constructStyleTagsFromChunks(chunks);
      } catch (cssError) {
        console.warn('Failed to extract critical CSS:', cssError);
      }
    }
    
    // Render the app to string
    const appHtml = renderToString(app);
    
    // Create the full HTML response
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="Local Rabbit Application" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest.json" />
          <title>Local Rabbit</title>
          ${styleTag}
        </head>
        <body>
          <div id="root">${appHtml}</div>
          <script>
            window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
          </script>
          <script type="module" src="/assets/index.js"></script>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (error) {
    console.error('SSR error:', error);
    res.status(500).send('Server Error');
  }
};

// Set up route handlers
// 1. API routes - mounted at /api/*
// If API routes exist, mount them here
if (fs.existsSync(join(__dirname, 'routes/api.js'))) {
  import(join(__dirname, 'routes/api.js')).then(api => {
    app.use('/api', api.default);
  }).catch(err => {
    console.warn('API routes not available:', err);
  });
}

// 2. Special handling for client source files in development
// Master handler for ALL source files
app.use('/src', (req, res, next) => {
  console.log(`[DEBUG] Source file request: ${req.path}`);
  
  // Calculate the full path to the requested file
  const relativePath = req.path.startsWith('/') ? req.path.substring(1) : req.path;
  const clientSrcPath = join(__dirname, '../../client/src', relativePath);
  
  console.log(`[DEBUG] Looking for file at: ${clientSrcPath}`);
  
  // Check if the file exists
  if (fs.existsSync(clientSrcPath)) {
    console.log(`[DEBUG] File found: ${clientSrcPath}`);
    
    // Determine content type based on file extension
    let contentType = 'text/plain';
    if (clientSrcPath.endsWith('.js') || clientSrcPath.endsWith('.jsx')) {
      contentType = 'application/javascript; charset=utf-8';
    } else if (clientSrcPath.endsWith('.css')) {
      contentType = 'text/css; charset=utf-8';
    } else if (clientSrcPath.endsWith('.json')) {
      contentType = 'application/json; charset=utf-8';
    } else if (clientSrcPath.endsWith('.html')) {
      contentType = 'text/html; charset=utf-8';
    } else if (clientSrcPath.endsWith('.svg')) {
      contentType = 'image/svg+xml';
    } else if (clientSrcPath.endsWith('.png')) {
      contentType = 'image/png';
    } else if (clientSrcPath.endsWith('.jpg') || clientSrcPath.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    }
    
    // Set headers for proper content delivery
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    try {
      // For binary files, use readFileSync with buffer
      if (contentType.startsWith('image/')) {
        const content = fs.readFileSync(clientSrcPath);
        return res.send(content);
      } else {
        // For text files, use readFileSync with utf8 encoding
        const content = fs.readFileSync(clientSrcPath, 'utf8');
        console.log(`[DEBUG] Serving file with content type: ${contentType}`);
        console.log(`[DEBUG] First 100 chars: ${content.substring(0, 100)}...`);
        return res.send(content);
      }
    } catch (error) {
      console.error(`[ERROR] Error reading file ${relativePath}:`, error);
      res.status(500);
      
      // Send appropriate error content based on file type
      if (contentType.startsWith('text/css')) {
        return res.send('/* Error loading file */');
      } else if (contentType.startsWith('application/javascript')) {
        return res.send('console.error("Error loading script file");');
      } else {
        return res.send('Error loading file');
      }
    }
  } else {
    console.log(`[DEBUG] File not found: ${clientSrcPath}`);
    next();
  }
});

// Special route for direct HTML access (for debugging)
app.get('/index.html', (req, res) => {
  console.log('DEBUG: Serving index.html');
  const indexPath = join(__dirname, '../../client/src/index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache');
    const content = fs.readFileSync(indexPath, 'utf-8');
    res.send(content);
  } else {
    res.status(404).send('index.html not found');
  }
});

// Special route for test HTML page
app.get('/test', (req, res) => {
  console.log('DEBUG: Serving test HTML');
  const testPath = join(__dirname, '../src/main-test.html');
  if (fs.existsSync(testPath)) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache');
    const content = fs.readFileSync(testPath, 'utf-8');
    res.send(content);
  } else {
    res.status(404).send('Test HTML not found');
  }
});

// Route for serving main-browser.js
app.get('/src/main-browser.js', (req, res) => {
  console.log('DEBUG: Serving main-browser.js');
  const filePath = join(__dirname, '../../client/src/main-browser.js');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache');
    const content = fs.readFileSync(filePath, 'utf-8');
    res.send(content);
  } else {
    res.status(404).send('main-browser.js not found');
  }
});

// 3. Health check endpoint - useful for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 10. Add a route for all paths to use SSR
app.get('*', ssrHandler);

// 11. Start the server with proper error handling
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// 12. Implement graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Attempt to close the server gracefully
  server.close(() => {
    console.log('HTTP server closed due to uncaught exception');
    process.exit(1);
  });
  
  // If server doesn't close in 5 seconds, force exit
  setTimeout(() => {
    console.error('Forcing exit after uncaught exception');
    process.exit(1);
  }, 5000);
});

export default app; 