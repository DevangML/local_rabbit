import { openDB } from 'idb';

const DB_NAME = 'localCodeRabbitDB';
const DB_VERSION = 1;

class StateManager {
  constructor() {
    this.dbPromise = this.initDB();
  }

  async initDB() {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Store for app-wide state
        if (!db.objectStoreNames.contains('appState')) {
          db.createObjectStore('appState');
        }
        // Store for diff viewer state
        if (!db.objectStoreNames.contains('diffState')) {
          db.createObjectStore('diffState');
        }
        // Store for analyzer state
        if (!db.objectStoreNames.contains('analyzerState')) {
          db.createObjectStore('analyzerState');
        }
      },
    });
  }

  async saveState(storeName, key, value) {
    try {
      const db = await this.dbPromise;
      await db.put(storeName, value, key);
      return true;
    } catch (error) {
      console.error(`Error saving state for ${storeName}:${key}:`, error);
      return false;
    }
  }

  async getState(storeName, key) {
    try {
      const db = await this.dbPromise;
      return await db.get(storeName, key);
    } catch (error) {
      console.error(`Error getting state for ${storeName}:${key}:`, error);
      return null;
    }
  }

  async getAllState(storeName) {
    try {
      const db = await this.dbPromise;
      return await db.getAll(storeName);
    } catch (error) {
      console.error(`Error getting all state for ${storeName}:`, error);
      return [];
    }
  }

  async clearState(storeName) {
    try {
      const db = await this.dbPromise;
      await db.clear(storeName);
      return true;
    } catch (error) {
      console.error(`Error clearing state for ${storeName}:`, error);
      return false;
    }
  }

  async resetAllState() {
    try {
      const db = await this.dbPromise;
      await Promise.all([
        db.clear('appState'),
        db.clear('diffState'),
        db.clear('analyzerState')
      ]);
      return true;
    } catch (error) {
      console.error('Error resetting all state:', error);
      return false;
    }
  }

  // Recovery methods
  async exportState() {
    try {
      const db = await this.dbPromise;
      const state = {
        appState: await db.getAll('appState'),
        diffState: await db.getAll('diffState'),
        analyzerState: await db.getAll('analyzerState'),
        timestamp: new Date().toISOString(),
      };
      return state;
    } catch (error) {
      console.error('Error exporting state:', error);
      return null;
    }
  }

  async importState(state) {
    try {
      const db = await this.dbPromise;
      await this.resetAllState();
      
      for (const [storeName, items] of Object.entries(state)) {
        if (storeName === 'timestamp') continue;
        for (const item of items) {
          await db.put(storeName, item.value, item.key);
        }
      }
      return true;
    } catch (error) {
      console.error('Error importing state:', error);
      return false;
    }
  }

  // Health check method
  async checkHealth() {
    try {
      const db = await this.dbPromise;
      await db.get('appState', 'test');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export const stateManager = new StateManager(); 