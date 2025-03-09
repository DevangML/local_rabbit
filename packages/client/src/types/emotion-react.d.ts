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