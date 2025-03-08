/**
 * Type guard utilities for TypeScript
 */

// Import the GitFile interface from our types file
import '../types';

/**
 * Type guard to check if an unknown object is an Error
 * @param error - The unknown error object
 * @returns boolean indicating if the object is an Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error || (typeof error === 'object' && error !== null && 'message' in error);
}

/**
 * Type guard to check if a file object conforms to GitFile interface
 * @param file - The object to check
 * @returns boolean indicating if the object is a GitFile
 */
export function isGitFile(file: any): file is GitFile {
  return (
    typeof file === 'object' && 
    file !== null && 
    typeof file.path === 'string' && 
    typeof file.type === 'string'
  );
}

/**
 * Safely get a property from an object or return a default value
 * @param obj - The object to access
 * @param path - The property path
 * @param defaultValue - Default value if property doesn't exist
 * @returns The property value or default value
 */
export function safeGet<T, D = undefined>(obj: any, path: string, defaultValue?: D): T | D {
  if (obj == null) return defaultValue as D;
  
  const keys = path.split('.');
  let result: any = obj;
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') return defaultValue as D;
    result = result[key];
  }
  
  return (result === undefined ? defaultValue : result) as T | D;
}

/**
 * Type guard to check if an array contains valid GitFile objects
 * @param files - The array to check
 * @returns boolean indicating if the array contains GitFile objects
 */
export function isGitFileArray(files: any[]): files is GitFile[] {
  return Array.isArray(files) && files.every(isGitFile);
}

/**
 * Safe access to array indices with boundary checks
 * @param array - The array to access
 * @param index - The index to access
 * @param defaultValue - Default value if index is out of bounds
 * @returns The value at the index or default value
 */
export function safeIndex<T>(array: T[] | undefined, index: number, defaultValue?: T): T | undefined {
  if (!array || index < 0 || index >= array.length) {
    return defaultValue;
  }
  return array[index];
}

/**
 * Type guard for file issue severity
 * @param severity - The severity string to check
 * @returns boolean indicating if the severity is valid
 */
export function isValidSeverity(severity: string): severity is 'high' | 'medium' | 'low' {
  return ['high', 'medium', 'low'].includes(severity);
} 