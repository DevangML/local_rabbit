// Development server entry point with hot reloading support
import './requireHook.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';

// Load environment variables from .env file
dotenv.config();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the server implementation - the server.js file exports the Express app
import app from './server.js';

// Create and start the development server
const PORT = process.env.PORT || 3001;

// Configure the server for development mode
app.set('env', 'development');

// Start listening on a different port to avoid conflicts
console.log(`Starting development server on port ${PORT}...`);
const server = app.listen(PORT, () => {
  console.log(`✅ Development server listening on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Gracefully shutting down development server...');
  server.close(() => {
    console.log('Server shut down successfully');
    process.exit(0);
  });
});
