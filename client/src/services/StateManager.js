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

  async migrateState(_oldVersion, _newVersion) {
    try {
      const _db = await this.dbPromise;
      // const currentState = {
      //   appState: await _db.getAll('appState'),
      //   diffState: await _db.getAll('diffState'),
      //   analyzerState: await _db.getAll('analyzerState')
      // };
      
      // Migration logic would go here
      
      console.info('State migration completed');
      return true;
    } catch (error) {
      console.error('Failed to migrate state:', error);
      return false;
    }
  }

  async validateState(state) {
    try {
      const requiredKeys = ['appState', 'diffState', 'analyzerState', 'timestamp'];
      const hasAllKeys = requiredKeys.every(key => key in state);
      if (!hasAllKeys) return false;

      // Add more validation as needed
      return true;
    } catch (error) {
      console.error('Error validating state:', error);
      return false;
    }
  }

  async createBackup() {
    try {
      const state = await this.exportState();
      if (!state) throw new Error('Failed to export state');

      const backup = {
        ...state,
        backupDate: new Date().toISOString(),
        version: DB_VERSION
      };

      await this.saveState('appState', 'lastBackup', backup);
      return true;
    } catch (error) {
      console.error('Error creating backup:', error);
      return false;
    }
  }

  async restoreFromBackup() {
    try {
      const backup = await this.getState('appState', 'lastBackup');
      if (!backup) throw new Error('No backup found');

      const success = await this.importState(backup);
      return success;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }
}

export const stateManager = new StateManager();