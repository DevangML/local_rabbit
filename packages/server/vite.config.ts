import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    ssr: true,
    outDir: 'dist',
    rollupOptions: {
      input: {
        server: resolve(__dirname, 'src/server.ts'),
      },
      output: {
        format: 'esm',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
}); 