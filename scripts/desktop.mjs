import { spawn } from 'node:child_process';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const electronDir = join(root, 'electron');
const shellOnly = process.argv.includes('--shell-only');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const children = [];

function run(label, args, cwd = root, env = process.env) {
  const child = spawn(npm, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env,
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${label}] exited with code ${code}`);
      shutdown(code ?? 1);
    }
  });

  children.push(child);
  return child;
}

function runRaw(label, command, args, cwd, env = process.env) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env,
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${label}] exited with code ${code}`);
      shutdown(code ?? 1);
    }
  });

  children.push(child);
  return child;
}

function waitForPort(port, host = '127.0.0.1', timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();

    const probe = () => {
      const socket = net.createConnection({ port, host }, () => {
        socket.end();
        resolve();
      });

      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
          return;
        }
        setTimeout(probe, 250);
      });
    };

    probe();
  });
}

function runOnce(label, args, cwd = root) {
  return new Promise((resolve, reject) => {
    const child = spawn(npm, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
      env: process.env,
    });

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`[${label}] exited with code ${code}`));
    });
  });
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

async function main() {
  console.log('[desktop] Dev mode: Vite HMR + Electron shell (no frontend rebuild)');

  if (!shellOnly) {
    run('backend', ['run', 'start:dev', '--prefix', 'backend']);
  }

  run('frontend', ['run', 'dev:desktop', '--prefix', 'frontend']);

  try {
    await waitForPort(5173);
    console.log('[desktop] Vite ready at http://localhost:5173');
  } catch (error) {
    console.error('[desktop]', error instanceof Error ? error.message : error);
    shutdown(1);
    return;
  }

  try {
    await runOnce('electron-build', ['run', 'build', '--prefix', 'electron']);
  } catch (error) {
    console.error('[desktop]', error instanceof Error ? error.message : error);
    shutdown(1);
    return;
  }

  runRaw('electron-tsc', npx, ['tsc', '-w', '-p', 'tsconfig.json'], electronDir);

  const electronEnv = {
    ...process.env,
    FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  };

  runRaw('electron', npx, ['electron', '.'], electronDir, electronEnv);
}

main().catch((error) => {
  console.error('[desktop]', error instanceof Error ? error.message : error);
  shutdown(1);
});
