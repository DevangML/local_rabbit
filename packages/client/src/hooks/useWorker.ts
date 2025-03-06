import { useEffect, useRef } from 'react';
import * as Comlink from 'comlink';

interface WorkerInstance {
  fibonacci: (n: number) => Promise<number>;
  processArrayData: <T>(data: T[], options: {
    filterFn?: (item: T) => boolean;
    mapFn?: <R>(item: T) => R;
    sortFn?: (a: T, b: T) => number;
    groupFn?: (item: T) => string | number;
  }) => Promise<T[] | Record<string, T[]>>;
  processImage: (imageData: ImageData, operations: {
    invert?: boolean;
    grayscale?: boolean;
    blur?: boolean;
    brightness?: number;
  }) => Promise<ImageData>;
}

type WorkerApi = Comlink.Remote<WorkerInstance>;

export const useWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const workerApiRef = useRef<WorkerApi | null>(null);

  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/calculator.worker.ts', import.meta.url),
        { type: 'module' }
      );
      workerApiRef.current = Comlink.wrap<WorkerInstance>(workerRef.current);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        workerApiRef.current = null;
      }
    };
  }, []);

  const getWorker = () => {
    if (!workerApiRef.current) {
      throw new Error('Worker not initialized');
    }
    return workerApiRef.current;
  };

  return {
    fibonacci: (n: number) => getWorker().fibonacci(n),
    processArrayData: <T>(data: T[], options = {}) => 
      getWorker().processArrayData(data, options),
    processImage: (imageData: ImageData, operations = {}) =>
      getWorker().processImage(imageData, operations)
  };
} 