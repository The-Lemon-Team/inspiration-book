import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type LogoClickTarget = 'filters' | 'chat';

const LOGO_TARGET_KEY = 'lemon_logo_target';

function loadLogoTarget(): LogoClickTarget {
  const stored = localStorage.getItem(LOGO_TARGET_KEY);
  return stored === 'chat' ? 'chat' : 'filters';
}

export const useSettingsStore = defineStore('settings', () => {
  const logoClickTarget = ref<LogoClickTarget>(loadLogoTarget());

  const logoRoute = computed(() =>
    logoClickTarget.value === 'chat' ? '/chats' : '/filters',
  );

  function setLogoClickTarget(target: LogoClickTarget) {
    logoClickTarget.value = target;
    localStorage.setItem(LOGO_TARGET_KEY, target);
  }

  return {
    logoClickTarget,
    logoRoute,
    setLogoClickTarget,
  };
});
