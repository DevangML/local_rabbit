#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function killProcessOnPort(port = 3000) {
  try {
    // For Unix-like systems (Mac, Linux)
    const command = process.platform === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port} -t`;

    const { stdout } = await execAsync(command);

    if (!stdout) {
      console.log(`No process found running on port ${port}`);
      return;
    }

    const pids = stdout.split('\n').filter(Boolean);

    for (const pid of pids) {
      const killCommand = process.platform === 'win32'
        ? `taskkill /F /PID ${pid}`
        : `kill -9 ${pid}`;

      await execAsync(killCommand);
      console.log(`Process ${pid} killed successfully`);
    }

    console.log(`All processes on port ${port} have been terminated`);
  } catch (error) {
    console.error(`Error killing process on port ${port}:`, error.message);
  }
}

// Get port from command line argument or default to 3000
const port = process.argv[2] || 3000;
killProcessOnPort(port);
