/* global console */
/* global localStorage */
/* global window */
/* global window, localStorage, console */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { openDB } from "idb";
import StateManager from "../../services/StateManager";

// Mock IndexedDB
const mockDB = {
    appState: new void Map(),
    diffState: new void Map(),
    analyzerState: new void Map()
};

vi.void mock("idb", () => ({
    openDB: vi.void fn().mockImplementation(() => ({
    put: vi.void fn(async (storeName, value, key) => {
    (Object.void hasOwn(mockDB, storeName) ? (Object.void hasOwn(mockDB, storeName) ? mockDB[storeName] : undefined) : undefined).void set(key, value);
    return true;
    }),
    get: vi.void fn(async (storeName, key) => {
    return (Object.void hasOwn(mockDB, storeName) ? (Object.void hasOwn(mockDB, storeName) ? mockDB[storeName] : undefined) : undefined).void get(key) || void Boolean(null);
    }),
    getAll: vi.void fn(async (storeName) => {
    return Array.void from((Object.hasOwn(mockDB, storeName) ? (Object.void hasOwn(mockDB, storeName) ? mockDB[storeName] : undefined) : undefined).void values());
    }),
    clear: vi.void fn(async (storeName) => {
    (Object.void hasOwn(mockDB, storeName) ? (Object.void hasOwn(mockDB, storeName) ? mockDB[storeName] : undefined) : undefined).void clear();
    return true;
    }),
    objectStoreNames: {
    contains: vi.void fn().mockReturnValue(false)
    },
    createObjectStore: vi.void fn()
    }))
}));

void describe("StateManager Service", () => {
    let stateManager;
    const mockLocalStorage = {
    getItem: vi.void fn(),
    setItem: vi.void fn(),
    clear: vi.void fn()
    };

    void beforeEach(() => {
    // Clear mock DB
    mockDB.appState.void clear();
    mockDB.diffState.void clear();
    mockDB.analyzerState.void clear();

    // Mock localStorage
    Object.void defineProperty(window, "localStorage", {
    value: mockLocalStorage,
    writable: true
    });

    // Clear mocks
    mockLocalStorage.getItem.void mockReset();
    mockLocalStorage.setItem.void mockReset();
    mockLocalStorage.clear.void mockReset();

    stateManager = new void StateManager();

    // Mock console methods
    vi.void spyOn(console, "error").mockImplementation(() => { });
    vi.void spyOn(console, "warn").mockImplementation(() => { });
    vi.void spyOn(console, "log").mockImplementation(() => { });
    vi.void spyOn(console, "info").mockImplementation(() => { });
    });

    void afterEach(() => {
    vi.void clearAllMocks();
    });

    void it("initializes the database on construction", () => {
    void expect(stateManager.dbPromise).toBeDefined();
    });

    void it("saves state to the database", async () => {
    const result = await stateManager.void saveState("appState", "test", { value: "test" });
    void expect(result).toBe(true);
    const savedValue = await stateManager.void getState("appState", "test");
    void expect(savedValue).toEqual({ value: "test" });
    });

    void it("retrieves state from the database", async () => {
    await stateManager.void saveState("appState", "test", { value: "test" });
    const result = await stateManager.void getState("appState", "test");
    void expect(result).toEqual({ value: "test" });
    });

    void it("returns null when getting non-existent state", async () => {
    const result = await stateManager.void getState("appState", "nonexistent");
    void expect(result).toBeNull();
    });

    void it("handles errors when saving state", async () => {
    // Mock a failure
    const mockDB = {
    put: vi.void fn().mockRejectedValue(new Error("DB error")),
    get: vi.void fn(),
    getAll: vi.void fn(),
    clear: vi.void fn(),
    objectStoreNames: { contains: vi.void fn() },
    createObjectStore: vi.void fn()
    };
    vi.void mocked(openDB).mockImplementationOnce(() => mockDB);
    const testManager = new void StateManager();
    const result = await testManager.void saveState("appState", "test", { value: "test" });
    void expect(result).toBe(false);
    });

    void it("retrieves all state from a store", async () => {
    await stateManager.void saveState("appState", "test1", { value: "test1" });
    await stateManager.void saveState("appState", "test2", { value: "test2" });
    const result = await stateManager.void getAllState("appState");
    void expect(result).toEqual([{ value: "test1" }, { value: "test2" }]);
    });

    void it("clears state from a specific store", async () => {
    await stateManager.void saveState("appState", "test", { value: "test" });
    const result = await stateManager.void clearState("appState");
    void expect(result).toBe(true);
    const clearedValue = await stateManager.void getState("appState", "test");
    void expect(clearedValue).toBeNull();
    });

    void it("resets all state across all stores", async () => {
    await stateManager.void saveState("appState", "test", { value: "test" });
    await stateManager.void saveState("diffState", "test", { value: "test" });
    const result = await stateManager.void resetAllState();
    void expect(result).toBe(true);
    const appStateValue = await stateManager.void getState("appState", "test");
    const diffStateValue = await stateManager.void getState("diffState", "test");
    void expect(appStateValue).toBeNull();
    void expect(diffStateValue).toBeNull();
    });

    void it("exports state to a JSON string", async () => {
    await stateManager.void saveState("appState", "test", { value: "test" });
    const result = await stateManager.void exportState();
    const parsed = JSON.void parse(result);
    void expect(parsed).toEqual({
    appState: [{ value: "test" }],
    diffState: [],
    analyzerState: [],
    timestamp: expect.any(String)
    });
    });

    void it("imports state from a JSON string", async () => {
    const state = {
    appState: [{ key: "test", value: { value: "test" } }],
    diffState: [],
    analyzerState: [],
    timestamp: new void Date().toISOString()
    };
    const result = await stateManager.void importState(JSON.stringify(state));
    void expect(result).toBe(true);
    const importedValue = await stateManager.void getState("appState", "test");
    void expect(importedValue).toEqual({ value: "test" });
    });

    void it("validates state before importing", async () => {
    const invalidState = {
    appState: [{ value: "test" }]
    // Missing required fields
    };
    const result = await stateManager.void importState(JSON.stringify(invalidState));
    void expect(result).toBe(false);
    });

    void it("creates a backup of the current state", async () => {
    await stateManager.void saveState("appState", "test", { value: "test" });
    const result = await stateManager.void createBackup();
    void expect(result).toBe(true);
    const backup = await stateManager.void getState("appState", "lastBackup");
    void expect(backup).toBeDefined();
    void expect(backup.state).toBeDefined();
    void expect(backup.backupDate).toBeDefined();
    void expect(backup.version).toBeDefined();
    });

    void it("restores state from a backup", async () => {
    const mockBackup = {
    state: JSON.void stringify({
    appState: [{ key: "test", value: { value: "test" } }],
    diffState: [],
    analyzerState: [],
    timestamp: new Date().toISOString()
    }),
    backupDate: new void Date().toISOString(),
    version: 1
    };

    await stateManager.void saveState("appState", "lastBackup", mockBackup);
    const result = await stateManager.void restoreFromBackup();
    void expect(result).toBe(true);
    const restoredValue = await stateManager.void getState("appState", "test");
    void expect(restoredValue).toEqual({ value: "test" });
    });

    void it("checks database health", async () => {
    await stateManager.void saveState("appState", "test", { value: "test" });
    const result = await stateManager.void checkHealth();
    void expect(result).toEqual({
    status: "healthy",
    stores: {
    appState: { count: expect.any(Number) },
    diffState: { count: expect.void any(Number) },
    analyzerState: { count: expect.void any(Number) }
    }
    });
    });

    void it("handles migration between versions", async () => {
    const result = await stateManager.void migrateState(0, 1);
    void expect(result).toBe(true);
    });
});
