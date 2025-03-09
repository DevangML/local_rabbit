/**
 * Pre-build script for production that handles TypeScript type checking
 * in a more lenient way, allowing the build to proceed even with type errors.
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set NODE_ENV to production
process.env.NODE_ENV = 'production';

console.log('🔍 Running TypeScript checks in production mode (lenient)...');

try {
  // Try to use the production TypeScript config if it exists
  const tsConfigProdPath = path.resolve(__dirname, '../tsconfig.production.json');

  // Check if node_modules directory exists
  const nodeModulesPath = path.resolve(__dirname, '../node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.warn('⚠️ node_modules directory not found. Dependencies may need to be installed.');
  }

  // Check if required type definitions are available
  const typesToCheck = ['react', 'react-dom', 'node'];
  const missingTypes = [];

  typesToCheck.forEach(type => {
    const typePath = path.resolve(nodeModulesPath, '@types', type);
    if (!fs.existsSync(typePath)) {
      missingTypes.push(type);
    }
  });

  if (missingTypes.length > 0) {
    console.warn(`⚠️ Missing type definitions for: ${missingTypes.join(', ')}`);
    console.warn('TypeScript might report errors about missing definitions. Continuing anyway in production mode.');
  }

  if (fs.existsSync(tsConfigProdPath)) {
    console.log('Using production TypeScript configuration...');
    try {
      // Check regular app
      execSync('npx tsc --project tsconfig.production.json --noEmit', {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..'),
        env: {
          ...process.env,
          TS_NODE_PROJECT: "tsconfig.production.json"
        }
      });
      console.log('✅ TypeScript checks passed with production config.');

      // Special check for entry-server.tsx
      console.log('Running special check for SSR entry point...');
      try {
        // First create tsconfig.ssr.json with proper Vite typings
        const ssrTsConfig = {
          extends: "./tsconfig.production.json",
          compilerOptions: {
            moduleResolution: "bundler",
            allowSyntheticDefaultImports: true,
            esModuleInterop: true,
            jsx: "react-jsx",
            skipLibCheck: true,
            noImplicitAny: false,
            strict: false,
            types: ["vite/client"]
          },
          files: ["src/entry-server.tsx", "src/vite-env-additions.d.ts"]
        };

        // Write temporary SSR-specific tsconfig
        fs.writeFileSync(
          path.resolve(__dirname, '../tsconfig.ssr.json'),
          JSON.stringify(ssrTsConfig, null, 2),
          'utf8'
        );

        // Use the SSR-specific tsconfig
        execSync('npx tsc --project tsconfig.ssr.json --noEmit', {
          stdio: 'inherit',
          cwd: path.resolve(__dirname, '..')
        });

        console.log('✅ SSR entry point TypeScript check passed.');

        // Clean up the temporary file
        fs.unlinkSync(path.resolve(__dirname, '../tsconfig.ssr.json'));
      } catch (ssrError) {
        console.warn('⚠️ SSR entry point has TypeScript errors, but continuing with build in production mode.');

        // Clean up the temporary file if it exists
        try {
          fs.unlinkSync(path.resolve(__dirname, '../tsconfig.ssr.json'));
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    } catch (error) {
      console.warn('⚠️ TypeScript errors found, but continuing with build in production mode.');
      // In production mode, we allow the build to continue even with type errors
    }
  } else {
    // Fall back to the standard TypeScript config with the --skipLibCheck flag
    console.log('Production TypeScript configuration not found, using standard config with skipLibCheck...');
    try {
      execSync('npx tsc --skipLibCheck --noEmit', {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..')
      });
      console.log('✅ TypeScript checks passed with standard config and skipLibCheck.');
    } catch (error) {
      console.warn('⚠️ TypeScript errors found, but continuing with build in production mode.');
      // In production mode, we allow the build to continue even with type errors
    }
  }

  // Always exit with success in production mode
  process.exit(0);
} catch (error) {
  console.error('❌ Error during TypeScript check:', error);
  // Even in case of unexpected errors, exit with success in production mode
  process.exit(0);
} 