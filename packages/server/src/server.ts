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
        const entryServer = await import(ssrEntryPath) as EntryServer;
        renderPage = entryServer.renderPage;
        renderToStream = entryServer.renderToStream || entryServer.renderPage;
        extractCriticalToChunks = entryServer.extractCriticalToChunks;
        constructStyleTagsFromChunks = entryServer.constructStyleTagsFromChunks;
        console.log('Successfully loaded SSR from client workspace build');
      } else {
        console.warn('SSR entry file not found at:', ssrEntryPath);
        throw new Error('SSR entry file not found');
      }
    } catch (primaryError) {
      console.warn('Primary SSR load failed:', primaryError);
      
      // If that fails, try an alternative path
      const altPath = join(__dirname, '../../../dist/server/entry-server.js');
      try {
        if (fs.existsSync(altPath)) {
          console.log('Found SSR entry at alternate path:', altPath);
          // @ts-ignore - Try alternative path
          const entryServer = await import(altPath) as EntryServer;
          renderPage = entryServer.renderPage;
          renderToStream = entryServer.renderToStream || entryServer.renderPage;
          extractCriticalToChunks = entryServer.extractCriticalToChunks;
          constructStyleTagsFromChunks = entryServer.constructStyleTagsFromChunks;
          console.log('Successfully loaded SSR from alternative path');
        } else {
          console.warn('Alternative SSR entry file not found at:', altPath);
          throw new Error('Alternative SSR entry file not found');
        }
      } catch (secondaryError) {
        console.warn('Secondary SSR load failed:', secondaryError);
        
        // If still failing, try one more path
        try {
          const urlPath = new URL('../client/dist/server/entry-server.js', import.meta.url).href;
          // @ts-ignore - Try one more path
          const entryServer = await import(urlPath) as EntryServer;
          renderPage = entryServer.renderPage;
          renderToStream = entryServer.renderToStream || entryServer.renderPage;
          extractCriticalToChunks = entryServer.extractCriticalToChunks;
          constructStyleTagsFromChunks = entryServer.constructStyleTagsFromChunks;
          console.log('Successfully loaded SSR from resolved URL path');
        } catch (tertiaryError) {
          console.warn('Could not import entry-server.js. SSR will be disabled.', primaryError);
          console.warn('Alternative paths also failed:', secondaryError);
          console.warn('URL path also failed:', tertiaryError);
        }
      }
    }
  } catch (error) {
    console.warn('All attempts to load entry-server.js failed. SSR will be disabled.', error);
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
        
        // Create the stream
        const { pipe } = renderToPipeableStream(appElement, {
          bootstrapScripts: ['/assets/index.js'],
          onShellReady() {
            // The content above all Suspense boundaries is ready
            res.statusCode = 200;
            res.write(htmlStart);
            pipe(res);
            
            // Ensure we write the end HTML after the pipe has started
            // This helps prevent the variable reference error by ensuring
            // all React components are properly hydrated
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

// 9. Add a health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
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