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

// Import the server-side rendering function from the client
// @ts-ignore - This file will be generated at build time
import { renderPage } from '../../client/dist/server/entry-server.js';

// Load environment variables
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const app: Express = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === 'development';

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

    const html = renderToString(
      renderPage(req.url)
    );

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