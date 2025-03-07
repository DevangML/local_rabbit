import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

// This is a simplified version of FeatureDemo for SSR only
export const FeatureDemo = React.memo(function FeatureDemo() {
  return (
  <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
  <Paper elevation={ 3 } sx={{ p: 3, mb: 3 }}>
  <Typography variant='h4' gutterBottom>
    Web Worker Demo
  </Typography>
  <Typography variant='body1' paragraph>
    This demo calculates Fibonacci(40) using a web worker to avoid blocking the main thread.
    (Interactive features available in client-side rendering)
  </Typography>
  </Paper>

  <Paper elevation={ 3 } sx={{ p: 3, mt: 3 }}>
  <Typography variant='h4' gutterBottom>
    Image Processing Demo
  </Typography>
  <Typography variant='body1' paragraph>
    This demo processes an image using a web worker.
    (Interactive features available in client-side rendering)
  </Typography>
  </Paper>
  </Box>
  );
}); 