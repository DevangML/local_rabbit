import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import StateManager from '../../services/StateManager';

// Mock indexedDB
vi.mock('idb', () => ({
  openDB: vi.fn().mockImplementation(() => ({
    put: vi.fn().mockResolvedValue(true),
    get: vi.fn().mockImplementation((storeName, key) => {
      if (key === 'testKey') return Promise.resolve({ data: 'testValue' });
      if (key === 'nonExistentKey') return Promise.resolve(undefined);
      return Promise.resolve(null);
    }),
    getAll: vi.fn().mockResolvedValue([
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' }
    ]),
    clear: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    transaction: vi.fn().mockImplementation(() => ({
      objectStore: vi.fn().mockImplementation(() => ({
        getAllKeys: vi.fn().mockResolvedValue(['key1', 'key2']),
        get: vi.fn().mockImplementation((key) => {
          if (key === 'key1') return Promise.resolve({ data: 'value1' });
          if (key === 'key2') return Promise.resolve({ data: 'value2' });
          return Promise.resolve(null);
        }),
        put: vi.fn().mockResolvedValue(undefined)
      })),
      done: Promise.resolve()
    }))
  }))
}));

describe('StateManager Service', () => {
  let stateManager;

  beforeEach(() => {
    stateManager = new StateManager();

    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.spyOn(console, 'warn').mockImplementation(() => { });
    vi.spyOn(console, 'log').mockImplementation(() => { });

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes the database on construction', () => {
    expect(stateManager.dbPromise).toBeDefined();
  });

  it('saves state to the database', async () => {
    const result = await stateManager.saveState('appState', 'testKey', { data: 'testValue' });
    expect(result).toBe(true);
  });

  it('retrieves state from the database', async () => {
    const result = await stateManager.getState('appState', 'testKey');
    expect(result).toEqual({ data: 'testValue' });
  });

  it('returns null when getting non-existent state', async () => {
    const result = await stateManager.getState('appState', 'nonExistentKey');
    expect(result).toBeUndefined();
  });

  it('handles errors when saving state', async () => {
    // Mock the dbPromise to throw an error
    stateManager.dbPromise = Promise.reject(new Error('DB error'));

    const result = await stateManager.saveState('appState', 'testKey', { data: 'testValue' });
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });

  it('handles errors when getting state', async () => {
    // Mock the dbPromise to throw an error
    stateManager.dbPromise = Promise.reject(new Error('DB error'));

    const result = await stateManager.getState('appState', 'testKey');
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it('retrieves all state from a store', async () => {
    const result = await stateManager.getAllState('appState');
    expect(result).toHaveLength(2);
    expect(result).toEqual([
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' }
    ]);
  });

  it('clears state from a specific store', async () => {
    const result = await stateManager.clearState('appState');
    expect(result).toBe(true);
  });

  it('resets all state across all stores', async () => {
    const result = await stateManager.resetAllState();
    expect(result).toBe(true);
  });

  it('exports state to a JSON string', async () => {
    const result = await stateManager.exportState();
    expect(typeof result).toBe('string');

    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty('appState');
    expect(parsed).toHaveProperty('diffState');
    expect(parsed).toHaveProperty('analyzerState');
  });

  it('imports state from a JSON string', async () => {
    const stateJson = JSON.stringify({
      appState: { key1: { data: 'value1' } },
      diffState: { key2: { data: 'value2' } }
    });

    const result = await stateManager.importState(stateJson);
    expect(result).toBe(true);
  });

  it('validates state before importing', async () => {
    // Invalid JSON
    const invalidJson = '{ invalid: json }';
    const result1 = await stateManager.importState(invalidJson);
    expect(result1).toBe(false);

    // Valid JSON but invalid structure
    const invalidStructure = JSON.stringify({ notAValidStore: { key: 'value' } });
    const result2 = await stateManager.importState(invalidStructure);
    expect(result2).toBe(false);
  });

  it('creates a backup of the current state', async () => {
    const result = await stateManager.createBackup();
    expect(result).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'localCodeRabbit_stateBackup',
      expect.any(String)
    );
  });

  it('restores state from a backup', async () => {
    // Mock localStorage to return a backup
    const mockBackup = JSON.stringify({
      appState: { key1: { data: 'backup1' } },
      diffState: { key2: { data: 'backup2' } }
    });
    window.localStorage.getItem.mockReturnValueOnce(mockBackup);

    const result = await stateManager.restoreFromBackup();
    expect(result).toBe(true);
  });

  it('checks database health', async () => {
    const result = await stateManager.checkHealth();
    expect(result).toEqual({
      status: 'healthy',
      stores: {
        appState: { count: 2 },
        diffState: { count: 2 },
        analyzerState: { count: 2 }
      }
    });
  });

  it('handles migration between versions', async () => {
    const result = await stateManager.migrateState(1, 2);
    expect(result).toBe(true);
  });
});
