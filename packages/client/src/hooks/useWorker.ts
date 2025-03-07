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
    if (onMessage) { onMessage(e.data); }
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
