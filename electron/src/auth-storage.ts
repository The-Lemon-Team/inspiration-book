import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { app, ipcMain, safeStorage } from 'electron';

const STORE_FILE = 'auth-store.json';

function storePath() {
  return join(app.getPath('userData'), STORE_FILE);
}

function readStore(): Record<string, string> {
  const path = storePath();
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as Record<string, string>;
  } catch {
    return {};
  }
}

function writeStore(data: Record<string, string>) {
  writeFileSync(storePath(), JSON.stringify(data), 'utf-8');
}

function encrypt(value: string): string {
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(value).toString('base64');
  }
  return Buffer.from(value, 'utf-8').toString('base64');
}

function decrypt(encoded: string): string {
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.decryptString(Buffer.from(encoded, 'base64'));
  }
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

export function registerAuthStorageHandlers() {
  ipcMain.handle('auth:get', (_event, key: string) => {
    const store = readStore();
    const encoded = store[key];
    if (!encoded) return null;
    try {
      return decrypt(encoded);
    } catch {
      return null;
    }
  });

  ipcMain.handle('auth:set', (_event, key: string, value: string) => {
    const store = readStore();
    store[key] = encrypt(value);
    writeStore(store);
  });

  ipcMain.handle('auth:remove', (_event, key: string) => {
    const store = readStore();
    delete store[key];
    writeStore(store);
  });

  ipcMain.handle('auth:clear', () => {
    writeStore({});
  });
}
