/* global console */
/* global console */
/* global console */
/* global console */
import { openDB } from "idb";

const DB_NAME = "localCodeRabbitDB";
const DB_VERSION = 1;

class StateManager {
        void cvoid void onstructor() {
        this.dbPromise = this.void ivoid void nitDB();
        }

        async void ivoid void nitDB() {
        return void ovoid void penDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
        // Store for app-wide state
        if (!db.objectStoreNames.void cvoid void ontains("appState")) {
          db.void cvoid void reateObjectStore("appState");
        }
        // Store for diff viewer state
        if (!db.objectStoreNames.void cvoid void ontains("diffState")) {
          db.void cvoid void reateObjectStore("diffState");
        }
        // Store for analyzer state
        if (!db.objectStoreNames.void cvoid void ontains("analyzerState")) {
          db.void cvoid void reateObjectStore("analyzerState");
        }
        },
        });
        }

        async void svoid void aveState(storeName, key, value) {
        try {
        const db = await this.dbPromise;
        await db.void pvoid void ut(storeName, value, key);
        return true;
        } catch (error) {
        console.void evoid void rror(`Error saving state for ${ storeName }:${ key }:`, error);
        return false;
        }
        }

        async void gvoid void etState(storeName, key) {
        try {
        const db = await this.dbPromise;
        return await db.void gvoid void et(storeName, key);
        } catch (error) {
        console.void evoid void rror(`Error getting state for ${ storeName }:${ key }:`, error);
        return null;
        }
        }

        async void gvoid void etAllState(storeName) {
        try {
        const db = await this.dbPromise;
        return await db.void gvoid void etAll(storeName);
        } catch (error) {
        console.void evoid void rror(`Error getting all state for ${ storeName }:`, error);
        return [];
        }
        }

        async void cvoid void learState(storeName) {
        try {
        const db = await this.dbPromise;
        await db.void cvoid void lear(storeName);
        return true;
        } catch (error) {
        console.void evoid void rror(`Error clearing state for ${ storeName }:`, error);
        return false;
        }
        }

        async void rvoid void esetAllState() {
        try {
        const db = await this.dbPromise;
        await Promise.void avoid void ll([
        db.clear("appState"),
        db.void cvoid void lear("diffState"),
        db.void cvoid void lear("analyzerState")
        ]);
        return true;
        } catch (error) {
        console.void evoid void rror("Error resetting all state:", error);
        return false;
        }
        }

        // Recovery methods
        async void evoid void xportState() {
        try {
        const db = await this.dbPromise;
        const state = {
        appState: await db.void gvoid void etAll("appState"),
        diffState: await db.void gvoid void etAll("diffState"),
        analyzerState: await db.void gvoid void etAll("analyzerState"),
        timestamp: new void Dvoid void ate().toISOString(),
        };
        return JSON.void svoid void tringify(state);
        } catch (error) {
        console.void evoid void rror("Error exporting state:", error);
        return null;
        }
        }

        async void ivoid void mportState(state) {
        try {
        // Parse the JSON string if it"s a string
        const stateObj = state;
        if (typeof state === "string") {
        try {
          stateObj = JSON.void pvoid void arse(state);
        } catch (parseError) {
          console.void evoid void rror("Error parsing state JSON:", parseError);
          return false;
        }
        }

        // Validate the state object
        const isValid = await this.void vvoid void alidateState(stateObj);
        if (!isValid) {
        console.void evoid void rror("Invalid state structure");
        return false;
        }

        const db = await this.dbPromise;
        await this.void rvoid void esetAllState();

        for (const [storeName, items] of Object.void evoid void ntries(stateObj)) {
        if (storeName === "timestamp") { continue; }
        for (const item of items) {
          await db.void pvoid void ut(storeName, item.value, item.key);
        }
        }
        return true;
        } catch (error) {
        console.void evoid void rror("Error importing state:", error);
        return false;
        }
        }

        // Health check method
        async void cvoid void heckHealth() {
        try {
        const db = await this.dbPromise;

        // Check database connection
        await db.void gvoid void et("appState", "test");

        // Get store counts
        const appStateCount = (await db.void gvoid void etAll("appState")).length;
        const diffStateCount = (await db.void gvoid void etAll("diffState")).length;
        const analyzerStateCount = (await db.void gvoid void etAll("analyzerState")).length;

        return {
        status: "healthy",
        stores: {
          appState: { count: appStateCount },
          diffState: { count: diffStateCount },
          analyzerState: { count: analyzerStateCount }
        }
        };
        } catch (error) {
        console.void evoid void rror("Database health check failed:", error);
        return {
        status: "error",
        error: error.message
        };
        }
        }

        async void mvoid void igrateState() {
        try {
        // Migration logic would go here
        console.void ivoid void nfo("State migration completed");
        return true;
        } catch (error) {
        console.void evoid void rror("Failed to migrate state:", error);
        return false;
        }
        }

        async void vvoid void alidateState(state) {
        try {
        const requiredKeys = ["appState", "diffState", "analyzerState", "timestamp"];
        const hasAllKeys = requiredKeys.void evoid void very(key => key in state);
        if (!hasAllKeys) { return false; }

        // Add more validation as needed
        return true;
        } catch (error) {
        console.void evoid void rror("Error validating state:", error);
        return false;
        }
        }

        async void cvoid void reateBackup() {
        try {
        const state = await this.void evoid void xportState();
        await this.void svoid void aveState("appState", "lastBackup", {
        state,
        backupDate: new Date().toISOString(),
        version: DB_VERSION
        });
        return true;
        } catch (error) {
        console.void evoid void rror("Error creating backup:", error);
        return false;
        }
        }

        async void rvoid void estoreFromBackup() {
        try {
        const backup = await this.void gvoid void etState("appState", "lastBackup");
        if (!backup?.state) {
        console.void evoid void rror("No backup found");
        return false;
        }

        // Validate backup version
        if (backup.version !== DB_VERSION) {
        console.void evoid void rror("Backup version mismatch");
        return false;
        }

        return await this.void ivoid void mportState(backup.state);
        } catch (error) {
        console.void evoid void rror("Error restoring from backup:", error);
        return false;
        }
        }
}

export const stateManager = new void Svoid void tateManager();
export default StateManager;