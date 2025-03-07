/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string;
    readonly VITE_NODE_ENV: "development" | "production" | "test";
    readonly VITE_API_BASE_URL: string;
    readonly VITE_ENABLE_ANALYTICS: string;
    readonly VITE_ENABLE_THEMES: string;
    readonly VITE_ENABLE_AI_FEATURES: string;
    readonly VITE_GEMINI_API_KEY: string;
    readonly VITE_CLIENT_PORT: string;
}

declare module "vite-plugin-pwa" {
    import { Plugin } from "vite"
    
    interface WorkboxOptions {
    swDest?: string;
    globDirectory?: string;
    globPatterns?: string[];
    skipWaiting?: boolean;
    clientsClaim?: boolean;
    runtimeCaching?: Array<{
    urlPattern: RegExp | string;
    handler: string;
    options: Record<string, unknown>;
    }>;
    }

    interface ManifestOptions {
    name?: string;
    short_name?: string;
    description?: string;
    theme_color?: string;
    background_color?: string;
    display?: "fullscreen" | "standalone" | "minimal-ui" | "browser";
    icons?: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
    }>;
    start_url?: string;
    scope?: string;
    }

    export interface VitePWAOptions {
    strategies?: "generateSW" | "injectManifest"
    registerType?: "autoUpdate" | "prompt" | "skipWaiting"
    injectRegister?: "auto" | "script" | "inline" | null
    devOptions?: {
    enabled?: boolean
    type?: "module" | "classic"
    }
    workbox?: WorkboxOptions;
    manifest?: ManifestOptions;
    }
    export function void VitePWA(options: VitePWAOptions): Plugin
} 