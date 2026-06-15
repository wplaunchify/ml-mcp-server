#!/usr/bin/env node
/**
 * MCP entrypoint: run ml-mcp-server-core from this package (no second npx, no registry wait).
 * Claude Desktop / Cursor spawn: npx -y --prefer-online @wplaunchify/ml-mcp-server@latest
 * npx installs the package; this script starts build/server.js with inherited stdio.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const core = join(dirname(fileURLToPath(import.meta.url)), 'build', 'server.js');

const child = spawn(process.execPath, [core], {
  stdio: 'inherit',
  env: process.env,
});

child.on('error', (err) => {
  console.error('[ml-mcp-server] Could not start:', err.message);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.exit(1);
  }
  process.exit(code ?? 0);
});
