<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout();
  router.push('/');
}
</script>

<template>
  <div class="app">
    <header class="header">
      <RouterLink to="/" class="brand">
        <span class="brand-icon">📔</span>
        <h1>Inspiration Book</h1>
      </RouterLink>
      <nav class="nav">
        <RouterLink to="/">Борд</RouterLink>
        <template v-if="auth.isAuthenticated">
          <RouterLink to="/chat">Чат</RouterLink>
          <RouterLink to="/timeline">Лента</RouterLink>
          <RouterLink to="/calendar">Календарь</RouterLink>
          <RouterLink to="/top">Топ</RouterLink>
        </template>
        <template v-if="auth.isAuthenticated">
          <span class="user-label">{{ auth.user?.name || auth.user?.email }}</span>
          <button type="button" class="ghost-btn" @click="logout">
            Выйти
          </button>
        </template>
        <template v-else>
          <RouterLink to="/login">Вход</RouterLink>
          <RouterLink to="/register">Регистрация</RouterLink>
        </template>
      </nav>
    </header>
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>
