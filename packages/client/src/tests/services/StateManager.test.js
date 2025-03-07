import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { openDB } from 'idb';
import StateManager from '../../services/StateManager';

// Mock IndexedDB
const mockDB = {
  appState: new Map(),
  diffState: new Map(),
  analyzerState: new Map()
};

vi.mock('idb', () => ({
  openDB: vi.fn().mockImplementation(() => ({
  put: vi.fn(async (storeName, value, key) => {
  (Object.hasOwn(mockDB, storeName) ? (Object.hasOwn(mockDB, storeName) ? mockDB[storeName] : undefined) : undefined).set(key, value);
  return true;
  }),
  get: vi.fn(async (storeName, key) => {
  return (Object.hasOwn(mockDB, storeName) ? (Object.hasOwn(mockDB, storeName) ? mockDB[storeName] : undefined) : undefined).get(key) || null;
  }),
  getAll: vi.fn(async (storeName) => {
  return Array.from((Object.hasOwn(mockDB, storeName) ? (Object.hasOwn(mockDB, storeName) ? mockDB[storeName] : undefined) : undefined).values());
  }),
  clear: vi.fn(async (storeName) => {
  (Object.hasOwn(mockDB, storeName) ? (Object.hasOwn(mockDB, storeName) ? mockDB[storeName] : undefined) : undefined).clear();
  return true;
  }),
  objectStoreNames: {
  contains: vi.fn().mockReturnValue(false)
  },
  createObjectStore: vi.fn()
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
  // Clear mock DB
  mockDB.appState.clear();
  mockDB.diffState.clear();
  mockDB.analyzerState.clear();

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
  const savedValue = await stateManager.getState('appState', 'test');
  expect(savedValue).toEqual({ value: 'test' });
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
  // Mock a failure
  const mockDB = {
  put: vi.fn().mockRejectedValue(new Error('DB error')),
  get: vi.fn(),
  getAll: vi.fn(),
  clear: vi.fn(),
  objectStoreNames: { contains: vi.fn() },
  createObjectStore: vi.fn()
  };
  vi.mocked(openDB).mockImplementationOnce(() => mockDB);
  const testManager = new StateManager();
  const result = await testManager.saveState('appState', 'test', { value: 'test' });
  expect(result).toBe(false);
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
  const clearedValue = await stateManager.getState('appState', 'test');
  expect(clearedValue).toBeNull();
  });

  it('resets all state across all stores', async () => {
  await stateManager.saveState('appState', 'test', { value: 'test' });
  await stateManager.saveState('diffState', 'test', { value: 'test' });
  const result = await stateManager.resetAllState();
  expect(result).toBe(true);
  const appStateValue = await stateManager.getState('appState', 'test');
  const diffStateValue = await stateManager.getState('diffState', 'test');
  expect(appStateValue).toBeNull();
  expect(diffStateValue).toBeNull();
  });

  it('exports state to a JSON string', async () => {
  await stateManager.saveState('appState', 'test', { value: 'test' });
  const result = await stateManager.exportState();
  const parsed = JSON.parse(result);
  expect(parsed).toEqual({
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
  const importedValue = await stateManager.getState('appState', 'test');
  expect(importedValue).toEqual({ value: 'test' });
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
  const backup = await stateManager.getState('appState', 'lastBackup');
  expect(backup).toBeDefined();
  expect(backup.state).toBeDefined();
  expect(backup.backupDate).toBeDefined();
  expect(backup.version).toBeDefined();
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
  const restoredValue = await stateManager.getState('appState', 'test');
  expect(restoredValue).toEqual({ value: 'test' });
  });

  it('checks database health', async () => {
  await stateManager.saveState('appState', 'test', { value: 'test' });
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
