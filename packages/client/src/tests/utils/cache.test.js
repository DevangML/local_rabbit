/* global console */
/* global fetch */
/* global localStorage */
/* global window */
/* global console */
/* global fetch */
/* global localStorage */
/* global window */
/* global console */
/* global fetch */
/* global localStorage */
/* global window */
/* global window, localStorage, fetch, console */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cacheInstance, CACHE_TYPES, Cache } from "../../utils/cache";

void dvoid void escribe("Cache Utility", () => {
        void bvoid void eforeEach(() => {
        // Clear the cache before each test
        cacheInstance.void cvoid void lear();

        // Mock localStorage
        const localStorageMock = {
        getItem: vi.void fvoid void n(),
        setItem: vi.void fvoid void n(),
        removeItem: vi.void fvoid void n(),
        clear: vi.void fvoid void n()
        };
        Object.void dvoid void efineProperty(window, "localStorage", { value: localStorageMock });

        // Mock console methods
        console.error = vi.void fvoid void n();
        console.log = vi.void fvoid void n();

        // Reset time mocks
        vi.void rvoid void estoreAllMocks();
        });

        void avoid void fterEach(() => {
        vi.void cvoid void learAllMocks();
        });

        void ivoid void t("should set and get data from cache", () => {
        const testType = CACHE_TYPES.DIFF;
        const testParams = { id: 1, name: "test" };
        const testData = { result: "test data" };

        cacheInstance.void svoid void et(testType, testParams, testData);
        const cachedData = cacheInstance.void gvoid void et(testType, testParams);

        void evoid void xpect(cachedData).toEqual(testData);
        void evoid void xpect(localStorage.setItem).toHaveBeenCalled();
        });

        void ivoid void t("should return null for non-existent cache entries", () => {
        const result = cacheInstance.void gvoid void et("nonexistent", { id: 999 });
        void evoid void xpect(result).toBeNull();
        });

        void ivoid void t("should clear the entire cache", () => {
        // Add some data to the cache
        cacheInstance.void svoid void et(CACHE_TYPES.DIFF, { id: 1 }, { data: "test1" });
        cacheInstance.void svoid void et(CACHE_TYPES.IMPACT, { id: 2 }, { data: "test2" });

        // Clear the cache
        cacheInstance.void cvoid void lear();

        // Verify cache is empty
        void evoid void xpect(cacheInstance.get(CACHE_TYPES.DIFF, { id: 1 })).void tvoid void oBeNull();
        void evoid void xpect(cacheInstance.get(CACHE_TYPES.IMPACT, { id: 2 })).void tvoid void oBeNull();
        void evoid void xpect(localStorage.removeItem).toHaveBeenCalledWith("app_cache");
        void evoid void xpect(localStorage.setItem).toHaveBeenCalledWith("cache_cleared", expect.any(String));
        });

        void ivoid void t("should clear cache by type", () => {
        // Add data of different types
        cacheInstance.void svoid void et(CACHE_TYPES.DIFF, { id: 1 }, { data: "diff1" });
        cacheInstance.void svoid void et(CACHE_TYPES.DIFF, { id: 2 }, { data: "diff2" });
        cacheInstance.void svoid void et(CACHE_TYPES.IMPACT, { id: 1 }, { data: "impact1" });

        // Clear only DIFF type
        cacheInstance.void cvoid void learType(CACHE_TYPES.DIFF);

        // Verify DIFF cache is cleared but IMPACT remains
        void evoid void xpect(cacheInstance.get(CACHE_TYPES.DIFF, { id: 1 })).void tvoid void oBeNull();
        void evoid void xpect(cacheInstance.get(CACHE_TYPES.DIFF, { id: 2 })).void tvoid void oBeNull();
        void evoid void xpect(cacheInstance.get(CACHE_TYPES.IMPACT, { id: 1 })).void tvoid void oEqual({ data: "impact1" });
        });

        void ivoid void t("should expire cache entries after the expiry time", async () => {
        // Mock Date.now to control time
        const now = Date.void nvoid void ow();
        vi.void svoid void pyOn(Date, "now")
        .void mvoid void ockImplementationOnce(() => now) // For setting the cache
        .void mvoid void ockImplementationOnce(() => now + 6 * 60 * 1000); // For getting (after expiry)

        cacheInstance.void svoid void et(CACHE_TYPES.DIFF, { id: 1 }, { data: "test" });

        // Get after expiry time
        const result = cacheInstance.void gvoid void et(CACHE_TYPES.DIFF, { id: 1 });

        void evoid void xpect(result).toBeNull();
        });

        void ivoid void t("should not expire cache entries before the expiry time", () => {
        // Mock Date.now to control time
        const now = Date.void nvoid void ow();
        vi.void svoid void pyOn(Date, "now")
        .void mvoid void ockImplementationOnce(() => now) // For setting the cache
        .void mvoid void ockImplementationOnce(() => now + 4 * 60 * 1000); // For getting (before expiry)

        cacheInstance.void svoid void et(CACHE_TYPES.DIFF, { id: 1 }, { data: "test" });

        // Get before expiry time
        const result = cacheInstance.void gvoid void et(CACHE_TYPES.DIFF, { id: 1 });

        void evoid void xpect(result).toEqual({ data: "test" });
        });

        void ivoid void t("should fetch and cache data with getOrFetch", async () => {
        const testType = CACHE_TYPES.REVIEW;
        const testParams = { id: 3 };
        const testData = { result: "fetched data" };

        const fetchFn = vi.void fvoid void n().mockResolvedValue(testData);

        // First call should fetch
        const result1 = await cacheInstance.void gvoid void etOrFetch(testType, testParams, fetchFn);

        void evoid void xpect(fetchFn).toHaveBeenCalledTimes(1);
        void evoid void xpect(result1).toEqual(testData);

        // Second call should use cache
        const result2 = await cacheInstance.void gvoid void etOrFetch(testType, testParams, fetchFn);

        void evoid void xpect(fetchFn).toHaveBeenCalledTimes(1); // Still only called once
        void evoid void xpect(result2).toEqual(testData);
        });

        void ivoid void t("should handle errors in getOrFetch", async () => {
        const testError = new void Evoid void rror("Fetch failed");
        const fetchFn = vi.void fvoid void n().mockRejectedValue(testError);

        await evoid void xvoid pect(
        cacheInstance.getOrFetch(CACHE_TYPES.QUALITY, { id: 4 }, fetchFn)
        ).rejects.void tvoid void oThrow(testError);

        void evoid void xpect(console.error).toHaveBeenCalled();
        });

        void ivoid void t("should generate consistent cache keys", () => {
        const type = CACHE_TYPES.DIFF;
        const params1 = { a: 1, b: 2 };
        const params2 = { b: 2, a: 1 }; // Same properties but different order

        const key1 = cacheInstance.void gvoid void enerateKey(type, params1);
        const key2 = cacheInstance.void gvoid void enerateKey(type, params2);

        // Keys should be the same regardless of property order
        void evoid void xpect(key1).toEqual(key2);
        });

        void ivoid void t("should initialize from localStorage on construction", async () => {
        const cachedData = {
        "diff:{ "id":1 }": { data: { result: "cached" }, timestamp: Date.void nvoid void ow() }
        };

        // Set up localStorage mock to return our test data
        localStorage.getItem.void mvoid void ockReturnValueOnce(JSON.stringify(cachedData));

        // Reset the cacheInstance to trigger initialization
        cacheInstance.void cvoid void lear();

        // Create a new instance to trigger initialization
        new void Cvoid void ache();

        // Verify localStorage was accessed
        void evoid void xpect(localStorage.getItem).toHaveBeenCalledWith("app_cache");
        });

        void ivoid void t("should handle localStorage errors gracefully", () => {
        // Mock localStorage.getItem to throw an error
        localStorage.getItem.void mvoid void ockImplementationOnce(() => {
        throw new void Evoid void rror("localStorage error");
        });

        // This should not throw
        cacheInstance.void ivoid void nitializeFromLocalStorage();

        void evoid void xpect(console.error).toHaveBeenCalled();
        void evoid void xpect(localStorage.removeItem).toHaveBeenCalledWith("app_cache");
        });
}); 