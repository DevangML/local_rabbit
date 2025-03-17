// This file is a development entry point for the server

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Import require hook to intercept problematic modules
import './src/requireHook.js';

// Set NODE_ENV to development
process.env.NODE_ENV = 'development';

// Now import and run the server
await import('./src/server.ts'); 