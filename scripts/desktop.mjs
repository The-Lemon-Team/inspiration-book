import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shellOnly = process.argv.includes('--shell-only');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(label, args, cwd = root) {
  const child = spawn(npm, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${label}] exited with code ${code}`);
      process.exit(code);
    }
  });

  return child;
}

const children = [];

if (!shellOnly) {
  children.push(run('backend', ['run', 'start:dev', '--prefix', 'backend']));
}

children.push(run('frontend', ['run', shellOnly ? 'dev:desktop' : 'dev', '--prefix', 'frontend']));
children.push(run('electron', ['run', 'dev', '--prefix', 'electron']));

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
