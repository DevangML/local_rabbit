/**
 * Simple test script to verify SSR rendering
 */

// Create a more complete document mock
class Element {
  constructor() {
    this.attributes = {};
    this.style = {};
    this.childNodes = [];
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  getAttribute(name) {
    return this.attributes[name];
  }

  appendChild(child) {
    this.childNodes.push(child);
    return child;
  }

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

// Import React
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test rendering
async function testSSR() {
  try {
    console.log('Testing SSR rendering...');

    // Dynamically import the entry-server module
    const serverEntryPath = join(__dirname, '../dist/server/entry-server.js');

    if (!fs.existsSync(serverEntryPath)) {
      console.error(`Server entry file not found at: ${serverEntryPath}`);
      return;
    }

    const { renderToStream } = await import(serverEntryPath);

    // Render a simple page
    const element = renderToStream('/');

    // Convert to string
    const html = ReactDOMServer.renderToString(element);

    console.log('SSR rendering successful!');
    console.log('HTML output:');
    console.log(html.substring(0, 500) + '...');
  } catch (error) {
    console.error('SSR rendering failed:', error);
  }
}

// Run the test
testSSR(); 