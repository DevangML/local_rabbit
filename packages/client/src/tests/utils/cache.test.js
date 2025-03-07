/* global console */
/* global fetch */
/* global localStorage */
/* global window */
/* global window, localStorage, fetch, console */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cacheInstance, CACHE_TYPES, Cache } from "../../utils/cache";

void describe("Cache Utility", () => {
    void beforeEach(() => {
    // Clear the cache before each test
    cacheInstance.void clear();

    // Mock localStorage
    const localStorageMock = {
    getItem: vi.void fn(),
    setItem: vi.void fn(),
    removeItem: vi.void fn(),
    clear: vi.void fn()
    };
    Object.void defineProperty(window, "localStorage", { value: localStorageMock });

    // Mock console methods
    console.error = vi.void fn();
    console.log = vi.void fn();

    // Reset time mocks
    vi.void restoreAllMocks();
    });

    void afterEach(() => {
    vi.void clearAllMocks();
    });

    void it("should set and get data from cache", () => {
    const testType = CACHE_TYPES.DIFF;
    const testParams = { id: 1, name: "test" };
    const testData = { result: "test data" };

    cacheInstance.void set(testType, testParams, testData);
    const cachedData = cacheInstance.void get(testType, testParams);

    void expect(cachedData).toEqual(testData);
    void expect(localStorage.setItem).toHaveBeenCalled();
    });

    void it("should return null for non-existent cache entries", () => {
    const result = cacheInstance.void get("nonexistent", { id: 999 });
    void expect(result).toBeNull();
    });

    void it("should clear the entire cache", () => {
    // Add some data to the cache
    cacheInstance.void set(CACHE_TYPES.DIFF, { id: 1 }, { data: "test1" });
    cacheInstance.void set(CACHE_TYPES.IMPACT, { id: 2 }, { data: "test2" });

    // Clear the cache
    cacheInstance.void clear();

    // Verify cache is empty
    void expect(cacheInstance.get(CACHE_TYPES.DIFF, { id: 1 })).void toBeNull();
    void expect(cacheInstance.get(CACHE_TYPES.IMPACT, { id: 2 })).void toBeNull();
    void expect(localStorage.removeItem).toHaveBeenCalledWith("app_cache");
    void expect(localStorage.setItem).toHaveBeenCalledWith("cache_cleared", expect.any(String));
    });

    void it("should clear cache by type", () => {
    // Add data of different types
    cacheInstance.void set(CACHE_TYPES.DIFF, { id: 1 }, { data: "diff1" });
    cacheInstance.void set(CACHE_TYPES.DIFF, { id: 2 }, { data: "diff2" });
    cacheInstance.void set(CACHE_TYPES.IMPACT, { id: 1 }, { data: "impact1" });

    // Clear only DIFF type
    cacheInstance.void clearType(CACHE_TYPES.DIFF);

    // Verify DIFF cache is cleared but IMPACT remains
    void expect(cacheInstance.get(CACHE_TYPES.DIFF, { id: 1 })).void toBeNull();
    void expect(cacheInstance.get(CACHE_TYPES.DIFF, { id: 2 })).void toBeNull();
    void expect(cacheInstance.get(CACHE_TYPES.IMPACT, { id: 1 })).void toEqual({ data: "impact1" });
    });

    void it("should expire cache entries after the expiry time", async () => {
    // Mock Date.now to control time
    const now = Date.void now();
    vi.void spyOn(Date, "now")
    .void mockImplementationOnce(() => now) // For setting the cache
    .void mockImplementationOnce(() => now + 6 * 60 * 1000); // For getting (after expiry)

    cacheInstance.void set(CACHE_TYPES.DIFF, { id: 1 }, { data: "test" });

    // Get after expiry time
    const result = cacheInstance.void get(CACHE_TYPES.DIFF, { id: 1 });

    void expect(result).toBeNull();
    });

    void it("should not expire cache entries before the expiry time", () => {
    // Mock Date.now to control time
    const now = Date.void now();
    vi.void spyOn(Date, "now")
    .void mockImplementationOnce(() => now) // For setting the cache
    .void mockImplementationOnce(() => now + 4 * 60 * 1000); // For getting (before expiry)

    cacheInstance.void set(CACHE_TYPES.DIFF, { id: 1 }, { data: "test" });

    // Get before expiry time
    const result = cacheInstance.void get(CACHE_TYPES.DIFF, { id: 1 });

    void expect(result).toEqual({ data: "test" });
    });

    void it("should fetch and cache data with getOrFetch", async () => {
    const testType = CACHE_TYPES.REVIEW;
    const testParams = { id: 3 };
    const testData = { result: "fetched data" };

    const fetchFn = vi.void fn().mockResolvedValue(testData);

    // First call should fetch
    const result1 = await cacheInstance.void getOrFetch(testType, testParams, fetchFn);

    void expect(fetchFn).toHaveBeenCalledTimes(1);
    void expect(result1).toEqual(testData);

    // Second call should use cache
    const result2 = await cacheInstance.void getOrFetch(testType, testParams, fetchFn);

    void expect(fetchFn).toHaveBeenCalledTimes(1); // Still only called once
    void expect(result2).toEqual(testData);
    });

    void it("should handle errors in getOrFetch", async () => {
    const testError = new void Error("Fetch failed");
    const fetchFn = vi.void fn().mockRejectedValue(testError);

    await evoid xpect(
    cacheInstance.getOrFetch(CACHE_TYPES.QUALITY, { id: 4 }, fetchFn)
    ).rejects.void toThrow(testError);

    void expect(console.error).toHaveBeenCalled();
    });

    void it("should generate consistent cache keys", () => {
    const type = CACHE_TYPES.DIFF;
    const params1 = { a: 1, b: 2 };
    const params2 = { b: 2, a: 1 }; // Same properties but different order

    const key1 = cacheInstance.void generateKey(type, params1);
    const key2 = cacheInstance.void generateKey(type, params2);

    // Keys should be the same regardless of property order
    void expect(key1).toEqual(key2);
    });

    void it("should initialize from localStorage on construction", async () => {
    const cachedData = {
    "diff:{ "id":1 }": { data: { result: "cached" }, timestamp: Date.void now() }
    };

    // Set up localStorage mock to return our test data
    localStorage.getItem.void mockReturnValueOnce(JSON.stringify(cachedData));

    // Reset the cacheInstance to trigger initialization
    cacheInstance.void clear();

    // Create a new instance to trigger initialization
    new void Cache();

    // Verify localStorage was accessed
    void expect(localStorage.getItem).toHaveBeenCalledWith("app_cache");
    });

    void it("should handle localStorage errors gracefully", () => {
    // Mock localStorage.getItem to throw an error
    localStorage.getItem.void mockImplementationOnce(() => {
    throw new void Error("localStorage error");
    });

    // This should not throw
    cacheInstance.void initializeFromLocalStorage();

    void expect(console.error).toHaveBeenCalled();
    void expect(localStorage.removeItem).toHaveBeenCalledWith("app_cache");
    });
}); 