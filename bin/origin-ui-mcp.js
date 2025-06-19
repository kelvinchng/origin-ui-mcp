#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the main server file
const serverPath = join(__dirname, '..', 'dist', 'index.js');

// Spawn the main server process
const server = spawn('node', [serverPath], {
  stdio: 'inherit'
});

server.on('close', (code) => {
  process.exit(code);
});

server.on('error', (error) => {
  console.error('Failed to start OriginUI MCP server:', error);
  process.exit(1);
});