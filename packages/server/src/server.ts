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
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';

// Define types for the Emotion server functions
type EmotionCriticalToChunks = (html: React.ReactElement) => Array<{ key: string; ids: Array<string>; css: string }>;
type EmotionConstructStyleTags = (chunks: Array<{ key: string; ids: Array<string>; css: string }>) => string;

// Define type for entry server module
type EntryServer = {
  renderPage: (url: string) => React.ReactElement;
  extractCriticalToChunks: EmotionCriticalToChunks;
  constructStyleTagsFromChunks: EmotionConstructStyleTags;
};

// Get the current directory
const __dirname = dirname(fileURLToPath(import.meta.url));

// Conditionally import the server-side rendering function
// This way we can run the server in development without the client build
const isDev = process.env.NODE_ENV === 'development';
let renderPage: (url: string) => React.ReactElement | null = () => null;
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

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(compression() as unknown as RequestHandler);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
const clientDistPath = join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  // Serve service worker at root
  app.get('/sw.js', (req, res) => {
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(join(clientDistPath, 'sw.js'));
  });

  // Serve manifest.json
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

// Add error handling for static files
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    console.error('Static file error:', err);
    res.status(404).send('File not found');
  } else {
    next();
  }
});

// Handle SSR
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
    const app = renderPage(req.url);
    if (!app || !extractCriticalToChunks || !constructStyleTagsFromChunks) {
      throw new Error('SSR components not properly initialized');
    }

    const html = renderToString(app);

    // Extract critical CSS
    const emotionChunks = extractCriticalToChunks(app);
    const emotionTags = constructStyleTagsFromChunks(emotionChunks);

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
          ${emotionTags}
          <title>Local Rabbit</title>
        </head>
        <body>
          <div id="root">${html}</div>
          <script>
            window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
          </script>
          <script type="module" src="${isDev ? '/src/main.tsx' : '/assets/main.js'}"></script>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-store, must-revalidate');
    res.send(template);
  } catch (error) {
    console.error('SSR Error:', error);
    // Fallback to client-side rendering in case of SSR error
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
          <script type="module" src="${isDev ? '/src/main.tsx' : '/assets/main.js'}"></script>
        </body>
      </html>
    `;
    res.status(500).send(template);
  }
};

// Handle all routes
app.get('*', ssrHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
}); 