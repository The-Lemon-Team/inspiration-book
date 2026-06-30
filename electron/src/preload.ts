import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  tokenStorage: {
    get: (key: string) => ipcRenderer.invoke('auth:get', key) as Promise<string | null>,
    set: (key: string, value: string) =>
      ipcRenderer.invoke('auth:set', key, value) as Promise<void>,
    remove: (key: string) => ipcRenderer.invoke('auth:remove', key) as Promise<void>,
    clear: () => ipcRenderer.invoke('auth:clear') as Promise<void>,
  },
});
