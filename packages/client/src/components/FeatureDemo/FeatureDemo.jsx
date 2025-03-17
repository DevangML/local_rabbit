import React, { useState, useCallback } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';

export function FeatureDemo() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);

  const handleCalculateClick = useCallback(async () => {
    setIsCalculating(true);
    try {
      // Simulate heavy calculation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResult(42);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Feature Demo
        </Typography>
        <Button
          variant="contained"
          onClick={handleCalculateClick}
          disabled={isCalculating}
        >
          {isCalculating ? <CircularProgress size={24} /> : 'Calculate'}
        </Button>
        {result && (
          <Typography sx={{ mt: 2 }}>
            Result: {result}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
