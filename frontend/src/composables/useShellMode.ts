import { computed, onMounted, onUnmounted, ref } from 'vue';

export const DESKTOP_VIEWPORT_BREAKPOINT = 768;

export function useShellMode() {
  const electronAPI = (window as Window & {
    electronAPI?: { isElectron: boolean };
  }).electronAPI;

  const isElectron = !!electronAPI?.isElectron;
  const isDesktopShell = isElectron || import.meta.env.VITE_SHELL === 'desktop';

  const windowWidth = ref(
    typeof window !== 'undefined' ? window.innerWidth : DESKTOP_VIEWPORT_BREAKPOINT,
  );

  function onResize() {
    windowWidth.value = window.innerWidth;
  }

  onMounted(() => window.addEventListener('resize', onResize));
  onUnmounted(() => window.removeEventListener('resize', onResize));

  const isDesktopViewport = computed(
    () => windowWidth.value >= DESKTOP_VIEWPORT_BREAKPOINT,
  );

  /** Unified rail shell: Electron, VITE_SHELL=desktop, or desktop browser viewport. */
  const usesUnifiedShell = computed(
    () => isDesktopShell || isDesktopViewport.value,
  );

  return { isElectron, isDesktopShell, isDesktopViewport, usesUnifiedShell };
}
