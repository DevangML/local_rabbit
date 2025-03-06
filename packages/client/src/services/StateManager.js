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
      return JSON.stringify(state);
    } catch (error) {
      console.error('Error exporting state:', error);
      return null;
    }
  }

  async importState(state) {
    try {
      // Parse the JSON string if it's a string
      let stateObj = state;
      if (typeof state === 'string') {
        try {
          stateObj = JSON.parse(state);
        } catch (parseError) {
          console.error('Error parsing state JSON:', parseError);
          return false;
        }
      }

      // Validate the state object
      const isValid = await this.validateState(stateObj);
      if (!isValid) {
        console.error('Invalid state structure');
        return false;
      }

      const db = await this.dbPromise;
      await this.resetAllState();

      for (const [storeName, items] of Object.entries(stateObj)) {
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

      // Check database connection
      await db.get('appState', 'test');

      // Get store counts
      const appStateCount = (await db.getAll('appState')).length;
      const diffStateCount = (await db.getAll('diffState')).length;
      const analyzerStateCount = (await db.getAll('analyzerState')).length;

      return {
        status: 'healthy',
        stores: {
          appState: { count: appStateCount },
          diffState: { count: diffStateCount },
          analyzerState: { count: analyzerStateCount }
        }
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        status: 'error',
        error: error.message
      };
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
      await this.saveState('appState', 'lastBackup', {
        state,
        backupDate: new Date().toISOString(),
        version: DB_VERSION
      });
      return true;
    } catch (error) {
      console.error('Error creating backup:', error);
      return false;
    }
  }

  async restoreFromBackup() {
    try {
      const backup = await this.getState('appState', 'lastBackup');
      if (!backup || !backup.state) {
        console.error('No backup found');
        return false;
      }

      // Validate backup version
      if (backup.version !== DB_VERSION) {
        console.error('Backup version mismatch');
        return false;
      }

      return await this.importState(backup.state);
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }
}

export const stateManager = new StateManager();
export default StateManager;