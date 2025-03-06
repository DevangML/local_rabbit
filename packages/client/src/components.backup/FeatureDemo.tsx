// @ts-check
import React, { useState, useCallback } from 'react';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { useWorker } from '../hooks/useWorker';

interface FeatureDemoProps {}

export const FeatureDemo: React.FC<FeatureDemoProps> = React.memo(function FeatureDemo() {
  const worker = useWorker();
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateFibonacci = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const startTime = performance.now();
      const result = await worker.fibonacci(40);
      const endTime = performance.now();
      setResult(result);
      console.log(`Calculation took ${endTime - startTime}ms`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [worker]);

  const processImage = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);

      // Create canvas and load image
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Load image and process it
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image to canvas
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Process image in worker
      const processedImageData = await worker.processImage(imageData);

      // Put processed data back to canvas
      ctx.putImageData(processedImageData, 0, 0);

      // Convert to data URL and display
      const dataUrl = canvas.toDataURL('image/png');
      const resultImage = document.createElement('img');
      resultImage.src = dataUrl;
      document.getElementById('result-container')?.appendChild(resultImage);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [worker]);

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Web Worker Demo
        </Typography>
        <Typography variant="body1" paragraph>
          This demo calculates Fibonacci(40) using a web worker to avoid blocking the main thread.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Button
            variant="contained"
            onClick={calculateFibonacci}
            disabled={loading}
          >
            Calculate Fibonacci(40)
          </Button>
          {loading && <CircularProgress size={24} />}
        </Box>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            Error: {error}
          </Typography>
        )}
        {result !== null && (
          <Typography variant="h6" sx={{ mt: 2 }}>
            Result: {result}
          </Typography>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Image Processing Demo
        </Typography>
        <Typography variant="body1" paragraph>
          This demo processes an image using a web worker.
        </Typography>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && processImage(e.target.files[0])}
          className="mb-4"
        />
        <div id="result-container" className="mt-4 space-y-4">
          {/* Processed images will be added here */}
        </div>
      </Paper>
    </Box>
  );
}); 