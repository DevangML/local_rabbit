"use strict";

var _express = _interopRequireDefault(require("express"));
var _cors = _interopRequireDefault(require("cors"));
var _helmet = _interopRequireDefault(require("helmet"));
var _compression = _interopRequireDefault(require("compression"));
var _morgan = _interopRequireDefault(require("morgan"));
var _sirv = _interopRequireDefault(require("sirv"));
var _path = require("path");
var _url = require("url");
var _fs = _interopRequireDefault(require("fs"));
var _dotenv = _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
// Load environment variables
_dotenv.default.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});
const _dirname = (0, _url.fileURLToPath)(new URL('.', import.meta.url));
const app = (0, _express.default)();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === 'development';

// Read the client manifest
let manifest = {};
const clientDistPath = (0, _path.resolve)(_dirname, '../../../packages/client/dist');
const manifestPath = (0, _path.resolve)(clientDistPath, 'manifest.json');
const entryServerPath = (0, _path.resolve)(clientDistPath, 'server/entry-server.js');
try {
  if (_fs.default.existsSync(manifestPath)) {
    manifest = JSON.parse(_fs.default.readFileSync(manifestPath, 'utf-8'));
  } else {
    console.warn('Warning: manifest.json not found. Running in development mode or build not completed.');
  }
} catch (error) {
  console.error('Failed to read manifest.json:', error);
}

// Middleware
app.use((0, _cors.default)());
app.use((0, _helmet.default)({
  contentSecurityPolicy: isDev ? false : undefined
}));
app.use((0, _compression.default)());
app.use((0, _morgan.default)(isDev ? 'dev' : 'combined'));
app.use(_express.default.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// API routes
app.use('/api', (req, res, next) => {
  // Your API routes here
  if (req.path === '/server-info') {
    res.json({
      status: 'ok',
      mode: process.env.NODE_ENV
    });
  } else if (req.path === '/git/branches') {
    res.json({
      branches: ['main', 'develop']
    });
  } else {
    next();
  }
});

// Serve static files from client dist if the directory exists
if (_fs.default.existsSync(clientDistPath)) {
  app.use((0, _sirv.default)(clientDistPath, {
    dev: isDev,
    etag: true,
    maxAge: isDev ? 0 : 31536000,
    immutable: !isDev
  }));
} else {
  console.warn('Warning: Client dist directory not found. Static files will not be served.');
}

// SSR Route handler for all other routes
app.get('*', async (req, res) => {
  try {
    if (!_fs.default.existsSync(entryServerPath)) {
      throw new Error('Server entry point not found. Please run build:client:ssr first.');
    }

    // Import the entry-server module using dynamic import with the file URL
    const {
      renderPage
    } = await (specifier => new Promise(r => r(specifier)).then(s => _interopRequireWildcard(require(s))))(/* @vite-ignore */`file://${entryServerPath}`);
    const rendered = await renderPage(req.url);

    // Get the main client entry
    const mainFile = Object.entries(manifest).find(([key]) => key.includes('main'))?.['1']?.file || 'main.js';
    res.send(`<!DOCTYPE html>
      <html ${rendered.htmlAttrs || ''} lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="theme-color" content="#000000" />
          <meta name="description" content="Local Rabbit - Git Repository Analysis Tool" />
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/logo.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
          <link rel="manifest" href="/manifest.json" />
          <title>Local Rabbit</title>
          ${rendered.headTags || ''}
          ${Object.values(manifest).filter(chunk => chunk.css).map(chunk => chunk.css.map(css => `<link rel="stylesheet" href="/${css}" />`).join('\n')).join('\n')}
        </head>
        <body ${rendered.bodyAttrs || ''}>
          <div id="root">${rendered.appHtml}</div>
          <script type="module" src="/${mainFile}"></script>
          <script>
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(registration => {
                    console.log('SW registered:', registration);
                  })
                  .catch(error => {
                    console.log('SW registration failed:', error);
                  });
              });
            }
          </script>
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