import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api/auth';
import {
  clearToken,
  getRefreshToken,
  getToken,
  initTokenStorage,
  refreshAccessToken,
  setTokens,
} from '@/api/http';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const authReady = ref(false);

  let initPromise: Promise<void> | null = null;

  const isAuthenticated = computed(() => !!user.value);

  async function init() {
    if (initPromise) {
      await initPromise;
      return;
    }

    initPromise = (async () => {
      await initTokenStorage();

      if (!getToken() && getRefreshToken()) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          await clearToken();
          return;
        }
      }

      if (!getToken()) return;

      try {
        user.value = await authApi.me();
      } catch {
        user.value = null;
      }
    })();

    try {
      await initPromise;
    } finally {
      authReady.value = true;
    }
  }

  async function register(email: string, password: string, name?: string) {
    loading.value = true;
    try {
      const response = await authApi.register(email, password, name);
      await setTokens(response.accessToken, response.refreshToken);
      user.value = response.user;
      return response;
    } finally {
      loading.value = false;
    }
  }

  async function login(email: string, password: string) {
    loading.value = true;
    try {
      const response = await authApi.login(email, password);
      await setTokens(response.accessToken, response.refreshToken);
      user.value = response.user;
      return response;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        await authApi.logout(refresh);
      } catch {
        // ignore — local session is cleared regardless
      }
    }
    await clearToken();
    user.value = null;
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    loading.value = true;
    try {
      return await authApi.changePassword(currentPassword, newPassword);
    } finally {
      loading.value = false;
    }
  }

  async function updateEmail(email: string, currentPassword: string) {
    loading.value = true;
    try {
      user.value = await authApi.updateEmail(email, currentPassword);
      return user.value;
    } finally {
      loading.value = false;
    }
  }

  return {
    user,
    loading,
    authReady,
    isAuthenticated,
    init,
    register,
    login,
    logout,
    changePassword,
    updateEmail,
  };
});
