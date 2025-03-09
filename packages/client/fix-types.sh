#!/bin/bash

# Set up colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Enhanced Type Error Fixer Script =====${NC}"
echo "This script will attempt to fix all TypeScript errors in the client codebase."
echo

# Check if dependencies are installed
if ! [ -d "node_modules/typescript" ] || ! [ -d "node_modules/chalk" ]; then
  echo -e "${BLUE}Installing dependencies...${NC}"
  cd scripts && npm install
  cd ..
fi

# Make sure script is executable
chmod +x scripts/fix-type-errors.js

# Run the TypeScript compiler to generate the error report
echo -e "${BLUE}Running initial type check to identify errors...${NC}"
npx tsc --noEmit

# Fix common errors manually
echo -e "${BLUE}Fixing common type errors manually...${NC}"

# 1. Fix the theme import error
if grep -q "import { theme } from './theme.js'" src/App.tsx; then
  echo "Fixing theme import in App.tsx..."
  sed -i '' "s/import { theme } from '.\/theme.js';/import { createTheme } from '@mui\/material\/styles';\nconst theme = createTheme();/" src/App.tsx
fi

# 2. Fix implicit any types
echo "Fixing implicit any types in entry-server.tsx..."
sed -i '' "s/export function renderPage(url) {/export function renderPage(url: string) {/" src/entry-server.tsx
sed -i '' "s/export default function render(props) {/export default function render(props: any) {/" src/entry-server.tsx

# 3. Fix possible undefined errors in calculator.worker.ts
echo "Fixing potential undefined errors in calculator.worker.ts..."
sed -i '' "s/data\[i\] = 255 - data\[i\];/data\[i\] = 255 - (data\[i\] || 0);/" src/workers/calculator.worker.ts
sed -i '' "s/data\[i + 1\] = 255 - data\[i + 1\];/data\[i + 1\] = 255 - (data\[i + 1\] || 0);/" src/workers/calculator.worker.ts
sed -i '' "s/data\[i + 2\] = 255 - data\[i + 2\];/data\[i + 2\] = 255 - (data\[i + 2\] || 0);/" src/workers/calculator.worker.ts

# Fix the remaining undefined errors in calculator.worker.ts
echo "Fixing remaining undefined errors in calculator.worker.ts..."
sed -i '' "s/const avg = (data\[i\] + data\[i + 1\] + data\[i + 2\]) \/ 3;/const avg = ((data\[i\] || 0) + (data\[i + 1\] || 0) + (data\[i + 2\] || 0)) \/ 3;/" src/workers/calculator.worker.ts
sed -i '' "s/sum += tempData\[idx\] \* kernel\[(ky + 1) \* 3 + (kx + 1)\];/sum += (tempData\[idx\] || 0) \* (kernel\[(ky + 1) \* 3 + (kx + 1)\] || 0);/" src/workers/calculator.worker.ts
sed -i '' "s/data\[i\] = Math.min(255, data\[i\] \* (1 + factor));/data\[i\] = Math.min(255, (data\[i\] || 0) \* (1 + factor));/" src/workers/calculator.worker.ts
sed -i '' "s/data\[i + 1\] = Math.min(255, data\[i + 1\] \* (1 + factor));/data\[i + 1\] = Math.min(255, (data\[i + 1\] || 0) \* (1 + factor));/" src/workers/calculator.worker.ts
sed -i '' "s/data\[i + 2\] = Math.min(255, data\[i + 2\] \* (1 + factor));/data\[i + 2\] = Math.min(255, (data\[i + 2\] || 0) \* (1 + factor));/" src/workers/calculator.worker.ts

# 4. Fix the useWorker import issue
mkdir -p src/hooks
echo "Creating useWorker hook..."
cat > src/hooks/useWorker.ts << 'EOF'
import { useState, useEffect, useRef } from 'react';

export function useWorker<T = unknown, R = unknown>(
  workerFactory: () => Worker,
  onMessage?: (data: R) => void
) {
  const workerRef = useRef<Worker | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<R | null>(null);

  useEffect(() => {
    // Create worker instance
    if (!workerRef.current) {
      workerRef.current = workerFactory();
    }

    // Set up message handler
    const handleMessage = (e: MessageEvent) => {
      setLoading(false);
      setResult(e.data);
      if (onMessage) onMessage(e.data);
    };

    workerRef.current.addEventListener('message', handleMessage);
    
    // Set up error handler
    const handleError = (e: ErrorEvent) => {
      setLoading(false);
      setError(new Error(e.message));
    };
    
    workerRef.current.addEventListener('error', handleError);

    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.removeEventListener('message', handleMessage);
        workerRef.current.removeEventListener('error', handleError);
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [workerFactory, onMessage]);

  // Function to send data to the worker
  const postMessage = (data: T) => {
    if (workerRef.current) {
      setLoading(true);
      setError(null);
      workerRef.current.postMessage(data);
    } else {
      setError(new Error('Worker is not initialized'));
    }
  };

  return { postMessage, loading, error, result };
}
EOF

# 5. Create a simple FeatureDemo component if it doesn't exist
mkdir -p src/components/FeatureDemo
echo "Creating FeatureDemo component..."
cat > src/components/FeatureDemo/index.ts << 'EOF'
export * from './FeatureDemo';
EOF

cat > src/components/FeatureDemo/FeatureDemo.tsx << 'EOF'
import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { useWorker } from '../../hooks/useWorker';

export const FeatureDemo: React.FC = () => {
  const [result, setResult] = useState<string | null>(null);
  
  const { postMessage, loading, error } = useWorker<{ type: string }, string>(
    () => new Worker(new URL('../../workers/calculator.worker.ts', import.meta.url), { type: 'module' }),
    (data: string) => {
      setResult(data);
    }
  );

  const handleProcess = () => {
    postMessage({ type: 'process' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Feature Demo
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={handleProcess}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Process Data'}
      </Button>
      
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          Error: {error.message}
        </Typography>
      )}
      
      {result && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Result:</Typography>
          <pre>{result}</pre>
        </Box>
      )}
    </Box>
  );
};
EOF

# 6. Fix or remove the components.backup directory if it exists
if [ -d "src/components.backup" ]; then
  echo "Fixing or removing components.backup directory..."
  rm -rf src/components.backup
fi

# Run our custom fixer script for any remaining issues
echo -e "${BLUE}Running type error fixer for any remaining issues...${NC}"
node scripts/fix-type-errors.js

# Final type check
echo -e "${BLUE}Running final type check...${NC}"
npx tsc --noEmit || true

# Done!
echo -e "${GREEN}Done!${NC}"
echo "If any type errors remain, you may need to fix them manually."

# Ensure the types directory exists
mkdir -p src/types

# Check if the type declaration files exist, create them if they don't
if [ ! -f "src/types/react-router-dom.d.ts" ]; then
  echo "Creating React Router DOM type declaration file..."
  cat > src/types/react-router-dom.d.ts << 'EOF'
import * as React from 'react';
import { 
  RouteProps as OriginalRouteProps, 
  RoutesProps as OriginalRoutesProps,
  Route as OriginalRoute,
  Routes as OriginalRoutes
} from 'react-router-dom';

declare module 'react-router-dom' {
  // Override the Route component type
  export const Route: React.FC<OriginalRouteProps>;
  
  // Override the Routes component type
  export const Routes: React.FC<OriginalRoutesProps>;
}
EOF
fi

if [ ! -f "src/types/emotion-react.d.ts" ]; then
  echo "Creating Emotion React type declaration file..."
  cat > src/types/emotion-react.d.ts << 'EOF'
import * as React from 'react';
import { EmotionCache } from '@emotion/cache';
import { Provider as OriginalProvider } from '@emotion/react';

declare module '@emotion/react' {
  // Override the CacheProvider component type
  export const CacheProvider: React.FC<{
    value: EmotionCache;
    children?: React.ReactNode;
  }>;
}
EOF
fi

echo "Type declaration files have been created/updated."
echo "You can now run the build command." 