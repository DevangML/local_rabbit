// This file is a development entry point for the server
// It uses ESM hooks to load TypeScript files

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Set NODE_ENV to development
process.env.NODE_ENV = 'development';

// Register the TypeScript loader
register('ts-node/esm', pathToFileURL('./'));

// Now import and run the server
await import('./src/server.ts'); 