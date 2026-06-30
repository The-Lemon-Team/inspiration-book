import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api/auth';
import { clearToken, getToken, setToken } from '@/api/http';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!user.value);

  async function init() {
    if (!getToken()) return;
    try {
      user.value = await authApi.me();
    } catch {
      clearToken();
      user.value = null;
    }
  }

  async function register(email: string, password: string, name?: string) {
    loading.value = true;
    try {
      const response = await authApi.register(email, password, name);
      setToken(response.accessToken);
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
      setToken(response.accessToken);
      user.value = response.user;
      return response;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    clearToken();
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
    isAuthenticated,
    init,
    register,
    login,
    logout,
    changePassword,
    updateEmail,
  };
});
