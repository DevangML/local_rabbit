/// <reference types="vite/client" />
declare module 'vite-plugin-pwa' {
  import { Plugin } from 'vite'
  export interface VitePWAOptions {
    strategies?: 'generateSW' | 'injectManifest'
    registerType?: 'autoUpdate' | 'prompt' | 'skipWaiting'
    injectRegister?: 'auto' | 'script' | 'inline' | null
    devOptions?: {
      enabled?: boolean
      type?: 'module' | 'classic'
    }
    workbox?: any
    manifest?: any
  }
  export function VitePWA(options?: VitePWAOptions): Plugin
} 