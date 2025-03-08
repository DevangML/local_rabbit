// Type declarations for the codebase

import { Request, Response } from 'express';

declare global {
  // Git file related interfaces
  interface GitFile {
    path: string;
    type: string;
    content?: string;
    hunks?: any[];
    issues?: FileIssue[];
  }

  interface FileIssue {
    severity: 'high' | 'medium' | 'low';
    message: string;
    code?: string;
    line?: number;
    column?: number;
  }

  interface FileReview {
    path: string;
    type: string;
    review?: string;
    issues?: FileIssue[];
  }

  interface FileDiff {
    path: string;
    hunks: string[] | any[];
    type: string;
  }

  // Response interfaces
  interface ApiResponse {
    success: boolean;
    data?: any;
    error?: string;
  }

  interface BranchResponse {
    name: string;
    current: boolean;
  }

  // Code review related interfaces
  interface ReviewResponse {
    candidates: {
      content: {
        parts: {
          text: string;
        }[];
      };
    }[];
  }

  // File type mapping
  interface FileTypeMap {
    [key: string]: string;
    js: string;
    jsx: string;
    ts: string;
    tsx: string;
    py: string;
    java: string;
    rb: string;
    go: string;
    rs: string;
    php: string;
    cs: string;
    cpp: string;
    c: string;
    swift: string;
    kt: string;
    md: string;
    json: string;
    yaml: string;
    yml: string;
    html: string;
    css: string;
    scss: string;
    xml: string;
  }

  // Logger interfaces
  interface Logger {
    debug: (message: string, meta?: any) => void;
    info: (message: string, meta?: any) => void;
    warn: (message: string, meta?: any) => void;
    error: (message: string, meta?: any) => void;
  }

  // Type guard functions
  function isError(error: unknown): error is Error;

  // Performance analyzer types
  interface PerformanceItem {
    value: number;
    score?: number;
    [key: string]: any;
  }

  // Directory entry type
  interface DirectoryEntry {
    name: string;
    isDirectory: () => boolean;
  }
}

// Extend Error type with additional properties
interface ExtendedError extends Error {
  response?: any;
  request?: any;
}

// Extend Express Request and Response if needed
declare module 'express' {
  interface Request {
    // Add any custom properties here
  }
} 