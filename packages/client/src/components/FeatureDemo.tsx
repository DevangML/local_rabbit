import React, { useState, useCallback } from 'react';
import { useWorker } from '../hooks/useWorker';

export const FeatureDemo: React.FC = () => {
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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Feature Demo</h2>
      
      <div className="space-y-6">
        {/* Fibonacci Calculator */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Web Worker Demo</h3>
          <button
            onClick={calculateFibonacci}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate Fibonacci(40)'}
          </button>
          {result !== null && (
            <p className="mt-2">Result: {result}</p>
          )}
        </div>

        {/* Image Processing */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Image Processing Demo</h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && processImage(e.target.files[0])}
            className="mb-4"
          />
          <div id="result-container" className="mt-4 space-y-4">
            {/* Processed images will be added here */}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}; 