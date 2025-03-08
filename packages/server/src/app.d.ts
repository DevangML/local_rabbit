import { Request, Response } from 'express';

// Declare morgan write function signature
declare module 'morgan' {
  interface StreamOptions {
    write(message: string): void;
  }
}

// Add types for the app.js 404 handler
declare global {
  interface ExpressHandler {
    (req: Request, res: Response): void;
  }
} 