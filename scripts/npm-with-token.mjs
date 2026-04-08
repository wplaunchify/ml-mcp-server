import { readFileSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');

if (!existsSync(envPath)) {
  console.error('ml-mcp-server: missing .env (add NPM_TOKEN=... for npm).');
  process.exit(1);
}

const text = readFileSync(envPath, 'utf8');
for (const line of text.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq === -1) {
    process.env.NPM_TOKEN = t;
    break;
  }
  const k = t.slice(0, eq).trim();
  const v = t.slice(eq + 1).trim();
  if (k === 'NPM_TOKEN') {
    process.env.NPM_TOKEN = v;
    break;
  }
}

if (!process.env.NPM_TOKEN) {
  console.error('ml-mcp-server: NPM_TOKEN not set in .env');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/npm-with-token.mjs <npm arguments...>');
  process.exit(1);
}

const result = spawnSync('npm', args, {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
  shell: true,
});
process.exit(result.status === null ? 1 : result.status);
