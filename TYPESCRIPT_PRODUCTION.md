# TypeScript Configuration for Production Mode

This document explains how TypeScript is configured to be more lenient in production mode, allowing the build process to succeed even when there are TypeScript errors.

## Overview

In development mode, strict TypeScript checking helps catch type errors early. However, in production mode, we want to ensure the application can be built and deployed even if there are TypeScript errors that haven't been addressed yet.

## Key Changes Implemented

1. **Production-specific TypeScript configurations**:
   - Created `tsconfig.production.json` for both client and server packages
   - These configurations extend the base configurations but disable strict type checking
   - Added specific handling for common type definition files (react, react-dom, jest)

2. **Production build scripts**:
   - Added `build:prod` scripts to both client and server packages
   - These scripts use the lenient TypeScript configurations

3. **Pre-build TypeScript handling**:
   - Created helper scripts (`pre-build-prod.js`) that:
     - Run TypeScript checks with the lenient configuration
     - Continue with the build regardless of TypeScript errors
     - Ensure the exit code is always successful in production mode
     - Detect and report missing type definitions without failing
     - Use appropriate environment variables for TypeScript compilation

4. **Server-Side Rendering (SSR) Support**:
   - Enhanced the client's build:prod script to include SSR build
   - Added special TypeScript checking for the SSR entry point
   - Improved the server's handling of SSR module imports with fallback paths
   - Added proper type definitions for Vite's import.meta.env features
   - Created a temporary SSR-specific tsconfig for checking the entry-server.tsx file

5. **Vite Environment Type Definitions**:
   - Added custom type definitions for Vite's environment variables
   - Created a vite-env-additions.d.ts file to properly type import.meta.env
   - Modified the entry-server.tsx to safely handle import.meta.env access

6. **Missing Type Definition Handling**:
   - Added checks to detect missing @types packages
   - Provide warnings when type definitions are missing without failing the build
   - Use the skipLibCheck option to avoid errors related to third-party libraries
   - Clean up better after temporary files are created

7. **Updated `run.sh`**:
   - Modified to use the production build scripts when in production mode
   - Added fallback to standard build if production build fails

## How It Works

When running in production mode:

1. The `run.sh` script calls the `build:prod` scripts for both client and server
2. The pre-build script performs preliminary checks:
   - Verifies node_modules exists
   - Checks if required type definitions are available
   - Warns about missing types but continues regardless
3. TypeScript checking is performed with lenient settings:
   - Uses the production-specific TypeScript config
   - Runs with specific environment variables set
   - Allows the build to continue even with errors
4. The client build also generates the SSR-specific files
5. The server tries multiple paths to locate and import the SSR entry point

## Usage

To run the application in production mode with lenient TypeScript checking:

```bash
./run.sh production
```

## File Changes

1. Added configuration files:
   - `packages/client/tsconfig.production.json`
   - `packages/server/tsconfig.production.json`

2. Added helper scripts:
   - `packages/client/scripts/pre-build-prod.js`
   - `packages/server/scripts/pre-build-prod.js`

3. Added type definitions:
   - `packages/client/src/vite-env-additions.d.ts`

4. Updated build scripts:
   - `packages/client/package.json`
   - `packages/server/package.json`

5. Modified client code:
   - Updated `packages/client/src/entry-server.tsx` to safely handle import.meta.env

6. Modified server code:
   - Added robust import handling for SSR in `packages/server/src/server.ts`

7. Modified run script:
   - `run.sh` 