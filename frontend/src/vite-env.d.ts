/// <reference types="vite/client" />

interface ElectronAPI {
  isElectron: boolean;
}

interface Window {
  electronAPI?: ElectronAPI;
}

interface ImportMetaEnv {
  readonly VITE_SHELL?: string;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
