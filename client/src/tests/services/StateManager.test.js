import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { stateManager } from '../../services/StateManager';

describe('StateManager', () => {
  beforeEach(async () => {
    await stateManager.resetAllState();
  });

  afterEach(async () => {
    await stateManager.resetAllState();
  });

  it('should save and retrieve state', async () => {
    const testData = { test: 'data' };
    await stateManager.saveState('appState', 'testKey', testData);
    const retrieved = await stateManager.getState('appState', 'testKey');
    expect(retrieved).toEqual(testData);
  });

  it('should handle getAllState', async () => {
    const testData1 = { test: 'data1' };
    const testData2 = { test: 'data2' };
    await stateManager.saveState('appState', 'key1', testData1);
    await stateManager.saveState('appState', 'key2', testData2);
    const allState = await stateManager.getAllState('appState');
    expect(allState).toHaveLength(2);
  });

  it('should clear state', async () => {
    await stateManager.saveState('appState', 'testKey', { test: 'data' });
    await stateManager.clearState('appState');
    const state = await stateManager.getState('appState', 'testKey');
    expect(state).toBeNull();
  });

  it('should handle backup and restore', async () => {
    const testData = { test: 'data' };
    await stateManager.saveState('appState', 'testKey', testData);
    await stateManager.createBackup();
    await stateManager.resetAllState();
    await stateManager.restoreFromBackup();
    const restored = await stateManager.getState('appState', 'testKey');
    expect(restored).toEqual(testData);
  });
});
