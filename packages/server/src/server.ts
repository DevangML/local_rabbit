import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import sirv from 'sirv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import React from 'react';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === 'development';

// Read the client manifest
let manifest: Record<string, any>;
try {
  manifest = JSON.parse(
    fs.readFileSync(resolve(__dirname, '../../../packages/client/dist/manifest.json'), 'utf-8')
  );
} catch (error) {
  console.error('Failed to read manifest.json:', error);
  manifest = {};
}

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: isDev ? false : undefined,
}));
app.use(compression());
app.use(morgan(isDev ? 'dev' : 'combined'));
app.use(express.json());

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// API routes
app.use('/api', (req, res, next) => {
  // Your API routes here
  if (req.path === '/server-info') {
    res.json({ status: 'ok', mode: process.env.NODE_ENV });
  } else if (req.path === '/git/branches') {
    res.json({ branches: ['main', 'develop'] });
  } else {
    next();
  }
});

// Serve static files from client dist
app.use(sirv(resolve(__dirname, '../../../packages/client/dist'), {
  dev: isDev,
  etag: true,
  maxAge: isDev ? 0 : 31536000,
  immutable: !isDev,
}));

// SSR Route handler for all other routes
app.get('*', async (req: Request, res: Response) => {
  try {
    const { default: App } = await import('../../../packages/client/src/App');
    let didError = false;

    const stream = renderToPipeableStream(
      React.createElement(StaticRouter, { location: req.url },
        React.createElement(App)
      ),
      {
        bootstrapScripts: manifest['index.html']?.file ? ['/'+manifest['index.html'].file] : [],
        onShellReady() {
          res.statusCode = didError ? 500 : 200;
          res.setHeader('Content-type', 'text/html');
          res.write(`<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Local Rabbit</title>
                ${manifest['index.html']?.css?.map((css: string) => 
                  `<link rel="stylesheet" href="/${css}" />`
                ).join('\n') || ''}
              </head>
              <body>
                <div id="root">`);
          stream.pipe(res);
          res.write(`</div>
              </body>
            </html>`);
        },
        onError(error: unknown) {
          didError = true;
          console.error('Error during SSR:', error);
          res.statusCode = 500;
          res.end('<!DOCTYPE html><html><body><h1>Server Error</h1></body></html>');
        },
      }
    );
  } catch (error) {
    console.error('Failed to load App:', error);
    res.status(500).send('<!DOCTYPE html><html><body><h1>Server Error</h1></body></html>');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
}); 