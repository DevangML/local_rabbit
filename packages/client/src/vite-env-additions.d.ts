/// <reference types="vite/client" />

// This file extends the default Vite environment type definitions

interface ImportMeta {
  readonly env: {
    readonly MODE: string;
    readonly BASE_URL: string;
    readonly PROD: boolean;
    readonly DEV: boolean;
    readonly SSR: boolean;
    readonly [key: string]: string | boolean | undefined;
  }
} 