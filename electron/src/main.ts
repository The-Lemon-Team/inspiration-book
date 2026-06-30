import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { registerAuthStorageHandlers } from './auth-storage';

const isDev = !app.isPackaged;
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

function frontendIndexPath() {
  return join(process.resourcesPath, 'frontend', 'index.html');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 640,
    title: 'Lemon Party',
    backgroundColor: '#f3f4f6',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL(`${FRONTEND_URL}/chats/general`);
  } else {
    win.loadFile(frontendIndexPath(), { hash: '/chats/general' });
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  registerAuthStorageHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
