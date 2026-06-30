export function useShellMode() {
  const electronAPI = (window as Window & {
    electronAPI?: { isElectron: boolean };
  }).electronAPI;

  const isElectron = !!electronAPI?.isElectron;
  const isDesktopShell = isElectron || import.meta.env.VITE_SHELL === 'desktop';

  return { isElectron, isDesktopShell };
}
