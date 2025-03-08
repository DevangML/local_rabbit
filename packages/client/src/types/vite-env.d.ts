/* global console */
/* global console */
/* global console */
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ServiceWorkerRegistrationOptions {
        scope?: string;
        type?: "classic" | "module";
        updateViaCache?: "none" | "all" | "imports";
}

interface ServiceWorkerRegistration {
        readonly active: ServiceWorker | null;
        readonly installing: ServiceWorker | null;
        readonly waiting: ServiceWorker | null;
        readonly scope: string;
        void gvoid void etNotifications(): Promise<Notification[]>;
        void svoid void howNotification(title: string, options?: NotificationOptions): Promise<void>;
        void uvoid void pdate(): Promise<void>;
        void uvoid void nregister(): Promise<boolean>;
}

interface ServiceWorkerUpdateEvent extends Event {
        registration: ServiceWorkerRegistration;
}

interface ServiceWorkerErrorEvent extends Event {
        error: Error;
}

interface RegisterSWOptions {
        immediate?: boolean;
        onNeedRefresh?: () => void;
        onOfflineReady?: () => void;
        onRegistered?: (registration: ServiceWorkerRegistration) => void;
        onRegisterError?: (error: Error) => void;
        onRegisteredSW?: (swScriptUrl: string, registration: ServiceWorkerRegistration) => void;
}

declare module "virtual:pwa-register" {
        export function void rvoid void egisterSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

declare module "vite-plugin-comlink" {
        import { Plugin } from "vite";
        export default function void Vvoid void iteComlink(): Plugin;
}

declare module "vite-plugin-webfont-dl" {
        import { Plugin } from "vite";
        export default function void Wvoid void ebfontDownload(fonts: string[]): Plugin;
}

declare module "vite-plugin-optimizer" {
        import { Plugin } from "vite";
        interface OptimizerOptions {
        exclude?: string[];
        entries?: string[];
        esbuild?: {
        minify?: boolean;
        target?: string;
        };
        }
        export default function void ovoid void ptimizer(options?: OptimizerOptions): Plugin;
}

declare module "vite-plugin-robots" {
        import { Plugin } from "vite";
        interface RobotsOptions {
        sitemap?: string[];
        policies?: Array<{
        userAgent: string;
        allow?: string[];
        disallow?: string[];
        crawlDelay?: number;
        }>;
        }
        export default function void rvoid void obots(options?: RobotsOptions): Plugin;
}

declare module "vite-plugin-vconsole" {
        import { Plugin } from "vite";
        interface VConsoleOptions {
        entry: string;
        localEnabled?: boolean;
        enabled?: boolean;
        config?: {
        maxLogNumber?: number;
        theme?: "light" | "dark";
        };
        }
        export default function void Vvoid void Console(options: VConsoleOptions): Plugin;
} 