<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <RouterLink to="/" class="brand">
        <span class="material-symbols-outlined brand-icon">menu_book</span>
        <h1 class="brand-title">inspiration book</h1>
      </RouterLink>
      <nav class="desktop-nav">
        <RouterLink to="/">борд</RouterLink>
        <RouterLink v-if="auth.isAuthenticated" to="/tags">группы</RouterLink>
        <RouterLink v-if="auth.isAuthenticated" to="/chat">чат</RouterLink>
        <RouterLink v-if="auth.isAuthenticated" to="/timeline">лента</RouterLink>
        <RouterLink v-if="!auth.isAuthenticated" to="/login">вход</RouterLink>
        <RouterLink v-if="!auth.isAuthenticated" to="/register">регистрация</RouterLink>
        <button
          v-if="auth.isAuthenticated"
          type="button"
          class="ghost-btn"
          @click="$emit('logout')"
        >
          выйти
        </button>
      </nav>
      <div v-if="auth.isAuthenticated" class="header-user caption">
        {{ auth.user?.name || auth.user?.email }}
      </div>
    </div>
  </header>
</template>
