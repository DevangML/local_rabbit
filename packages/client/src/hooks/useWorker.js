import { useState, useCallback } from 'react';

export function useWorker(workerFactory) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (data) => {
    setIsProcessing(true);
    setError(null);

    try {
      const worker = workerFactory();
      const result = await worker.process(data);
      worker.terminate();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [workerFactory]);

  return { execute, isProcessing, error };
}
