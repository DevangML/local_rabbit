import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import sirv from 'sirv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
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
let manifest: Record<string, any> = {};
const clientDistPath = resolve(__dirname, '../../../packages/client/dist');
const manifestPath = resolve(clientDistPath, 'manifest.json');

try {
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } else {
    console.warn('Warning: manifest.json not found. Running in development mode or build not completed.');
  }
} catch (error) {
  console.error('Failed to read manifest.json:', error);
}

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: isDev ? false : undefined,
}));
app.use(compression() as express.RequestHandler);
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

// Serve static files from client dist if the directory exists
if (fs.existsSync(clientDistPath)) {
  app.use(sirv(clientDistPath, {
    dev: isDev,
    etag: true,
    maxAge: isDev ? 0 : 31536000,
    immutable: !isDev,
  }));
} else {
  console.warn('Warning: Client dist directory not found. Static files will not be served.');
}

// SSR Route handler for all other routes
app.get('*', async (req: Request, res: Response) => {
  try {
    const { renderPage } = await import('@client/entry-server');
    const rendered = await renderPage(req.url);
    
    // Get the main client entry
    const mainFile = Object.entries(manifest).find(([key]) => key.includes('main'))?.['1']?.file || 'main.js';

    res.send(`<!DOCTYPE html>
      <html ${rendered.htmlAttrs || ''} lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Local Rabbit</title>
          ${rendered.headTags || ''}
          ${Object.values(manifest)
            .filter((chunk: any) => chunk.css)
            .map((chunk: any) => chunk.css.map((css: string) => 
              `<link rel="stylesheet" href="/${css}" />`
            ).join('\n')).join('\n')}
        </head>
        <body ${rendered.bodyAttrs || ''}>
          <div id="root">${rendered.appHtml}</div>
          <script type="module" src="/${mainFile}"></script>
        </body>
      </html>`);
  } catch (error) {
    console.error('Failed to render:', error);
    res.status(500).send('<!DOCTYPE html><html><body><h1>Server Error</h1></body></html>');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
}); 