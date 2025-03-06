import { useEffect, useRef } from 'react';
import * as Comlink from 'comlink';

type WorkerInstance = {
  fibonacci: (n: number) => Promise<number>;
  processData: (data: any[]) => Promise<any[]>;
  processImage: (imageData: ImageData) => Promise<ImageData>;
};

export function useWorker() {
  const workerRef = useRef<Worker | null>(null);
  const workerApiRef = useRef<WorkerInstance | null>(null);

  useEffect(() => {
    // Create worker instance
    workerRef.current = new Worker(
      new URL('../workers/calculator.worker.ts', import.meta.url),
      { type: 'module' }
    );

    // Create Comlink wrapper
    workerApiRef.current = Comlink.wrap<WorkerInstance>(workerRef.current);

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  return {
    fibonacci: async (n: number) => {
      if (!workerApiRef.current) throw new Error('Worker not initialized');
      return workerApiRef.current.fibonacci(n);
    },
    processData: async (data: any[]) => {
      if (!workerApiRef.current) throw new Error('Worker not initialized');
      return workerApiRef.current.processData(data);
    },
    processImage: async (imageData: ImageData) => {
      if (!workerApiRef.current) throw new Error('Worker not initialized');
      return workerApiRef.current.processImage(imageData);
    }
  };
} 