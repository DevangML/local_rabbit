import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDistPath = join(__dirname, '../../client/dist');
const serverDistPath = join(__dirname, '../dist/server');

try {
  // Create server dist directory if it doesn't exist
  mkdirSync(serverDistPath, { recursive: true });

  // Copy client files to server dist
  copyFileSync(
    join(clientDistPath, 'server/entry-server.js'),
    join(serverDistPath, 'client/entry-server.js')
  );

  console.log('Successfully copied client files to server dist');
} catch (error) {
  console.error('Error copying client files:', error);
  process.exit(1);
} 