/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: any) => void;
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

declare module 'vite-plugin-comlink' {
  import { Plugin } from 'vite';
  export default function ViteComlink(): Plugin;
}

declare module 'vite-plugin-webfont-dl' {
  import { Plugin } from 'vite';
  export default function WebfontDownload(fonts: string[]): Plugin;
}

declare module 'vite-plugin-optimizer' {
  import { Plugin } from 'vite';
  interface OptimizerOptions {
    exclude?: string[];
    entries?: string[];
    esbuild?: {
      minify?: boolean;
      target?: string;
    };
  }
  export default function optimizer(options?: OptimizerOptions): Plugin;
}

declare module 'vite-plugin-robots' {
  import { Plugin } from 'vite';
  interface RobotsOptions {
    sitemap?: string[];
    policies?: Array<{
      userAgent: string;
      allow?: string[];
      disallow?: string[];
      crawlDelay?: number;
    }>;
  }
  export default function robots(options?: RobotsOptions): Plugin;
}

declare module 'vite-plugin-vconsole' {
  import { Plugin } from 'vite';
  interface VConsoleOptions {
    entry: string;
    localEnabled?: boolean;
    enabled?: boolean;
    config?: {
      maxLogNumber?: number;
      theme?: 'light' | 'dark';
    };
  }
  export default function VConsole(options: VConsoleOptions): Plugin;
} 