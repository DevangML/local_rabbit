import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cacheInstance, CACHE_TYPES } from '../../utils/cache';

describe('Cache Utility', () => {
  beforeEach(() => {
    // Clear the cache before each test
    cacheInstance.clear();

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => { });
    vi.spyOn(console, 'error').mockImplementation(() => { });

    // Reset time mocks
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should set and get data from cache', () => {
    const testType = CACHE_TYPES.DIFF;
    const testParams = { id: 1, name: 'test' };
    const testData = { result: 'test data' };

    cacheInstance.set(testType, testParams, testData);
    const cachedData = cacheInstance.get(testType, testParams);

    expect(cachedData).toEqual(testData);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should return null for non-existent cache entries', () => {
    const result = cacheInstance.get('nonexistent', { id: 999 });
    expect(result).toBeNull();
  });

  it('should clear the entire cache', () => {
    // Add some data to the cache
    cacheInstance.set(CACHE_TYPES.DIFF, { id: 1 }, { data: 'test1' });
    cacheInstance.set(CACHE_TYPES.IMPACT, { id: 2 }, { data: 'test2' });

    // Clear the cache
    cacheInstance.clear();

    // Verify cache is empty
    expect(cacheInstance.get(CACHE_TYPES.DIFF, { id: 1 })).toBeNull();
    expect(cacheInstance.get(CACHE_TYPES.IMPACT, { id: 2 })).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('app_cache');
    expect(localStorage.setItem).toHaveBeenCalledWith('cache_cleared', expect.any(String));
  });

  it('should clear cache by type', () => {
    // Add data of different types
    cacheInstance.set(CACHE_TYPES.DIFF, { id: 1 }, { data: 'diff1' });
    cacheInstance.set(CACHE_TYPES.DIFF, { id: 2 }, { data: 'diff2' });
    cacheInstance.set(CACHE_TYPES.IMPACT, { id: 1 }, { data: 'impact1' });

    // Clear only DIFF type
    cacheInstance.clearType(CACHE_TYPES.DIFF);

    // Verify DIFF cache is cleared but IMPACT remains
    expect(cacheInstance.get(CACHE_TYPES.DIFF, { id: 1 })).toBeNull();
    expect(cacheInstance.get(CACHE_TYPES.DIFF, { id: 2 })).toBeNull();
    expect(cacheInstance.get(CACHE_TYPES.IMPACT, { id: 1 })).toEqual({ data: 'impact1' });
  });

  it('should expire cache entries after the expiry time', async () => {
    // Mock Date.now to control time
    const now = Date.now();
    vi.spyOn(Date, 'now')
      .mockImplementationOnce(() => now) // For setting the cache
      .mockImplementationOnce(() => now + 6 * 60 * 1000); // For getting (after expiry)

    cacheInstance.set(CACHE_TYPES.DIFF, { id: 1 }, { data: 'test' });

    // Get after expiry time
    const result = cacheInstance.get(CACHE_TYPES.DIFF, { id: 1 });

    expect(result).toBeNull();
  });

  it('should not expire cache entries before the expiry time', () => {
    // Mock Date.now to control time
    const now = Date.now();
    vi.spyOn(Date, 'now')
      .mockImplementationOnce(() => now) // For setting the cache
      .mockImplementationOnce(() => now + 4 * 60 * 1000); // For getting (before expiry)

    cacheInstance.set(CACHE_TYPES.DIFF, { id: 1 }, { data: 'test' });

    // Get before expiry time
    const result = cacheInstance.get(CACHE_TYPES.DIFF, { id: 1 });

    expect(result).toEqual({ data: 'test' });
  });

  it('should fetch and cache data with getOrFetch', async () => {
    const testType = CACHE_TYPES.REVIEW;
    const testParams = { id: 3 };
    const testData = { result: 'fetched data' };

    const fetchFn = vi.fn().mockResolvedValue(testData);

    // First call should fetch
    const result1 = await cacheInstance.getOrFetch(testType, testParams, fetchFn);

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(result1).toEqual(testData);

    // Second call should use cache
    const result2 = await cacheInstance.getOrFetch(testType, testParams, fetchFn);

    expect(fetchFn).toHaveBeenCalledTimes(1); // Still only called once
    expect(result2).toEqual(testData);
  });

  it('should handle errors in getOrFetch', async () => {
    const testError = new Error('Fetch failed');
    const fetchFn = vi.fn().mockRejectedValue(testError);

    await expect(
      cacheInstance.getOrFetch(CACHE_TYPES.QUALITY, { id: 4 }, fetchFn)
    ).rejects.toThrow(testError);

    expect(console.error).toHaveBeenCalled();
  });

  it('should generate consistent cache keys', () => {
    const type = CACHE_TYPES.DIFF;
    const params1 = { a: 1, b: 2 };
    const params2 = { b: 2, a: 1 }; // Same properties but different order

    const key1 = cacheInstance.generateKey(type, params1);
    const key2 = cacheInstance.generateKey(type, params2);

    // Keys should be the same regardless of property order
    expect(key1).toEqual(key2);
  });

  it('should initialize from localStorage on construction', () => {
    const cachedData = {
      'diff:{"id":1}': { data: { result: 'cached' }, timestamp: Date.now() }
    };

    localStorage.getItem.mockReturnValueOnce(JSON.stringify(cachedData));

    // Create a new instance to trigger initialization
    const { Cache } = vi.hoisted(() => ({
      Cache: vi.fn().mockImplementation(function () {
        this.cache = new Map();
        this.initializeFromLocalStorage = vi.fn();
      })
    }));

    const newCacheInstance = new Cache();
    newCacheInstance.initializeFromLocalStorage();

    expect(localStorage.getItem).toHaveBeenCalledWith('app_cache');
  });

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage.getItem to throw an error
    localStorage.getItem.mockImplementationOnce(() => {
      throw new Error('localStorage error');
    });

    // This should not throw
    cacheInstance.initializeFromLocalStorage();

    expect(console.error).toHaveBeenCalled();
    expect(localStorage.removeItem).toHaveBeenCalledWith('app_cache');
  });
}); 