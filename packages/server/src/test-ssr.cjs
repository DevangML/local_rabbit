/**
 * Simple test script to verify SSR rendering with our fixes
 * 
 * This file uses JavaScript with JSDoc comments for minimal type checking
 * while allowing us to mock browser globals for SSR testing.
 * 
 * @ts-ignore
 * @ts-nocheck
 * @jsxImportSource react
 */

// Create a more complete document mock
class Element {
  constructor() {
    this.attributes = {};
    this.style = {};
    /** @type {any[]} */
    this.childNodes = [];
  }

  /**
   * @param {string} name
   * @param {any} value
   */
  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  /**
   * @param {string} name
   * @returns {any}
   */
  getAttribute(name) {
    return this.attributes[name];
  }

  /**
   * @param {Element} child
   * @returns {Element}
   */
  appendChild(child) {
    this.childNodes.push(child);
    return child;
  }

  /**
   * @returns {Element}
   */
  cloneNode() {
    return new Element();
  }
}

// Mock browser globals before importing React
global.document = {
  head: new Element(),
  body: new Element(),
  createElement: (tag) => new Element(),
  createTextNode: (text) => ({ text }),
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  documentElement: new Element()
};

global.window = {
  document: global.document,
  location: { pathname: '/' },
  navigator: { userAgent: 'node' },
  addEventListener: () => { }
};

global.navigator = {
  userAgent: 'node'
};

// Import required modules
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import express from 'express';
import { renderToPipeableStream } from 'react-dom/server';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a simple Express server
const app = express();
const port = 3001;

// Test rendering
async function setupSSR() {
  try {
    console.log('Setting up SSR rendering...');

    // Dynamically import the entry-server module
    const clientDistPath = join(__dirname, '../../client/dist');
    const serverEntryPath = join(clientDistPath, 'server/entry-server.js');

    if (!fs.existsSync(serverEntryPath)) {
      console.error(`Server entry file not found at: ${serverEntryPath}`);
      return;
    }

    console.log('Found SSR entry at:', serverEntryPath);
    const { renderToStream, renderPage, extractCriticalToChunks, constructStyleTagsFromChunks } = await import(serverEntryPath);

    // Add a route to test SSR
    app.get('*', (req, res) => {
      try {
        const url = req.url;
        console.log(`Rendering page for URL: ${url}`);

        // Use streaming SSR if available
        if (renderToStream && renderToPipeableStream) {
          const appElement = renderToStream(url);

          // Extract critical CSS
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
                <title>Local Rabbit</title>
                ${styleTag}
              </head>
              <body>
                <div id="root">
          `;

          const htmlEnd = `
                </div>
                <script>
                  window.__INITIAL_STATE__ = ${JSON.stringify({ url })};
                </script>
              </body>
            </html>
          `;

          // Set headers for streaming
          res.setHeader('Content-Type', 'text/html');

          // Create the stream
          const { pipe } = renderToPipeableStream(appElement, {
            onShellReady() {
              // The content above all Suspense boundaries is ready
              res.statusCode = 200;
              res.write(htmlStart);
              pipe(res);

              // Ensure we write the end HTML after the pipe has started
              setTimeout(() => {
                if (!res.writableEnded) {
                  res.write(htmlEnd);
                }
              }, 100);
            },
            onAllReady() {
              // If you don't want streaming, you can use this instead of onShellReady
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
        } else {
          // Fallback to traditional SSR
          const app = renderPage(url);
          const html = ReactDOMServer.renderToString(app);

          res.setHeader('Content-Type', 'text/html');
          res.send(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="description" content="Local Rabbit Application" />
                <title>Local Rabbit</title>
              </head>
              <body>
                <div id="root">${html}</div>
                <script>
                  window.__INITIAL_STATE__ = ${JSON.stringify({ url })};
                </script>
              </body>
            </html>
          `);
        }
      } catch (error) {
        console.error('Error rendering page:', error);
        res.status(500).send('Server error');
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Test SSR server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('SSR setup failed:', error);
  }
}

// Run the test
setupSSR(); 