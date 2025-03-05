import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import StateManager from '../../services/StateManager';

// Mock indexedDB
vi.mock('idb', () => ({
  openDB: vi.fn().mockImplementation(() => ({
    put: vi.fn().mockImplementation((storeName, value, key) => {
      if (storeName && value && key) return Promise.resolve(true);
      return Promise.reject(new Error('Invalid parameters'));
    }),
    get: vi.fn().mockImplementation((storeName, key) => {
      if (storeName === 'appState' && key === 'lastBackup') {
        return Promise.resolve({
          state: {
            appState: [{ key: 'key1', value: 'value1' }],
            diffState: [{ key: 'key2', value: 'value2' }],
            analyzerState: [{ key: 'key3', value: 'value3' }],
            timestamp: new Date().toISOString()
          },
          backupDate: new Date().toISOString(),
          version: 1
        });
      }
      if (key === 'testKey') return Promise.resolve({ data: 'testValue' });
      if (key === 'nonExistentKey') return Promise.resolve(undefined);
      return Promise.resolve(null);
    }),
    getAll: vi.fn().mockImplementation((storeName) => {
      const mockData = {
        appState: [{ key: 'key1', value: 'value1' }],
        diffState: [{ key: 'key2', value: 'value2' }],
        analyzerState: [{ key: 'key3', value: 'value3' }]
      };
      return Promise.resolve(mockData[storeName] || []);
    }),
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
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn()
  };

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    // Clear mocks
    mockLocalStorage.getItem.mockReset();
    mockLocalStorage.setItem.mockReset();
    mockLocalStorage.clear.mockReset();

    stateManager = new StateManager();

    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.spyOn(console, 'warn').mockImplementation(() => { });
    vi.spyOn(console, 'log').mockImplementation(() => { });
    vi.spyOn(console, 'info').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes the database on construction', () => {
    expect(stateManager.dbPromise).toBeDefined();
  });

  it('saves state to the database', async () => {
    const result = await stateManager.saveState('appState', 'test', { value: 'test' });
    expect(result).toBe(true);
  });

  it('retrieves state from the database', async () => {
    await stateManager.saveState('appState', 'test', { value: 'test' });
    const result = await stateManager.getState('appState', 'test');
    expect(result).toEqual({ value: 'test' });
  });

  it('returns null when getting non-existent state', async () => {
    const result = await stateManager.getState('appState', 'nonexistent');
    expect(result).toBeNull();
  });

  it('handles errors when saving state', async () => {
    const result = await stateManager.saveState('invalidStore', 'test', { value: 'test' });
    expect(result).toBe(false);
  });

  it('handles errors when getting state', async () => {
    const result = await stateManager.getState('invalidStore', 'test');
    expect(result).toBeNull();
  });

  it('retrieves all state from a store', async () => {
    await stateManager.saveState('appState', 'test1', { value: 'test1' });
    await stateManager.saveState('appState', 'test2', { value: 'test2' });
    const result = await stateManager.getAllState('appState');
    expect(result).toEqual([{ value: 'test1' }, { value: 'test2' }]);
  });

  it('clears state from a specific store', async () => {
    await stateManager.saveState('appState', 'test', { value: 'test' });
    const result = await stateManager.clearState('appState');
    expect(result).toBe(true);
  });

  it('resets all state across all stores', async () => {
    await stateManager.saveState('appState', 'test', { value: 'test' });
    await stateManager.saveState('diffState', 'test', { value: 'test' });
    const result = await stateManager.resetAllState();
    expect(result).toBe(true);
  });

  it('exports state to a JSON string', async () => {
    await stateManager.saveState('appState', 'test', { value: 'test' });
    const result = await stateManager.exportState();
    expect(JSON.parse(result)).toEqual({
      appState: [{ value: 'test' }],
      diffState: [],
      analyzerState: [],
      timestamp: expect.any(String)
    });
  });

  it('imports state from a JSON string', async () => {
    const state = {
      appState: [{ key: 'test', value: { value: 'test' } }],
      diffState: [],
      analyzerState: [],
      timestamp: new Date().toISOString()
    };
    const result = await stateManager.importState(JSON.stringify(state));
    expect(result).toBe(true);
  });

  it('validates state before importing', async () => {
    const invalidState = {
      appState: [{ value: 'test' }]
      // Missing required fields
    };
    const result = await stateManager.importState(JSON.stringify(invalidState));
    expect(result).toBe(false);
  });

  it('creates a backup of the current state', async () => {
    await stateManager.saveState('appState', 'test', { value: 'test' });
    const result = await stateManager.createBackup();
    expect(result).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'localCodeRabbit_stateBackup',
      expect.any(String)
    );
  });

  it('restores state from a backup', async () => {
    const mockBackup = {
      state: JSON.stringify({
        appState: [{ key: 'test', value: { value: 'test' } }],
        diffState: [],
        analyzerState: [],
        timestamp: new Date().toISOString()
      }),
      backupDate: new Date().toISOString(),
      version: 1
    };

    await stateManager.saveState('appState', 'lastBackup', mockBackup);
    const result = await stateManager.restoreFromBackup();
    expect(result).toBe(true);
  });

  it('checks database health', async () => {
    const result = await stateManager.checkHealth();
    expect(result).toEqual({
      status: 'healthy',
      stores: {
        appState: { count: expect.any(Number) },
        diffState: { count: expect.any(Number) },
        analyzerState: { count: expect.any(Number) }
      }
    });
  });

  it('handles migration between versions', async () => {
    const result = await stateManager.migrateState(0, 1);
    expect(result).toBe(true);
  });
});
