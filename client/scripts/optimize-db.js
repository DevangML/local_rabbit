require('fake-indexeddb/auto');
const { openDB } = require('idb');

const DB_NAME = 'localCodeRabbitDB';
const DB_VERSION = 1;

async function optimizeDatabase() {
  try {
    console.log('Starting database optimization...');

    const db = await openDB(DB_NAME, DB_VERSION);
    const stores = ['appState', 'diffState', 'analyzerState'];

    for (const store of stores) {
      console.log(`\nOptimizing store: ${store}`);
      
      // Get all records
      const allRecords = await db.getAll(store);
      console.log(`Found ${allRecords.length} records`);

      // Clear the store
      await db.clear(store);
      console.log('Store cleared');

      // Remove expired or invalid records
      const validRecords = allRecords.filter(record => {
        if (!record) return false;
        if (record.timestamp) {
          const age = Date.now() - new Date(record.timestamp).getTime();
          // Remove records older than 30 days
          if (age > 30 * 24 * 60 * 60 * 1000) return false;
        }
        return true;
      });

      // Reinsert valid records
      for (const record of validRecords) {
        await db.add(store, record);
      }

      console.log(`Reinserted ${validRecords.length} valid records`);
      console.log(`Removed ${allRecords.length - validRecords.length} invalid/expired records`);
    }

    // Compact the database
    console.log('\nCompacting database...');
    await db.close();
    
    // Reopen to ensure changes are persisted
    const newDb = await openDB(DB_NAME, DB_VERSION);
    await newDb.close();

    console.log('\nDatabase optimization completed successfully!');
  } catch (error) {
    console.error('Error optimizing database:', error);
    process.exit(1);
  }
}

// Run optimization
optimizeDatabase().then(() => {
  process.exit(0);
});