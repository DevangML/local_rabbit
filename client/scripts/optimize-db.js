import 'fake-indexeddb/auto';
import { openDB } from 'idb';

const optimizeIndexedDB = async () => {
  try {
    const db = await openDB('localCodeRabbit', 1, {
      upgrade(db) {
        // Define object stores if they don't exist
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache');
        }
      },
    });

    // List of stores to optimize
    const stores = [...db.objectStoreNames];

    // Optimize each store
    for (const store of stores) {
      const tx = db.transaction(store, 'readwrite');
      const objectStore = tx.objectStore(store);

      // Clear old data (older than 7 days)
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const request = objectStore.openCursor();

      request.then(cursor => {
        while (cursor) {
          if (cursor.value.timestamp < sevenDaysAgo) {
            cursor.delete();
          }
          cursor.continue();
        }
      });

      await tx.done;
    }

    console.log('Database optimization completed successfully');
    return true;
  } catch (error) {
    console.error('Database optimization failed:', error);
    return false;
  }
};

// Run optimization
optimizeIndexedDB()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(() => {
    process.exit(1);
  });