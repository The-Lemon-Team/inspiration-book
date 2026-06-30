<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';

const auth = useAuthStore();
const settings = useSettingsStore();
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <div class="header-leading">
        <RouterLink :to="settings.logoRoute" class="brand">
          <span class="material-symbols-outlined brand-icon">menu_book</span>
          <h1 class="brand-title">Inspiration Book</h1>
        </RouterLink>

        <nav class="header-nav">
          <RouterLink to="/">Борд</RouterLink>
          <RouterLink to="/tags">Группы</RouterLink>
          <RouterLink v-if="auth.isAuthenticated" to="/chat" class="header-nav__wide">
            Чат
          </RouterLink>
          <RouterLink v-if="auth.isAuthenticated" to="/timeline" class="header-nav__wide">
            Лента
          </RouterLink>
        </nav>
      </div>

      <div class="header-actions">
        <template v-if="auth.isAuthenticated">
          <RouterLink to="/settings" class="header-settings" title="Настройки">
            <span class="material-symbols-outlined">settings</span>
          </RouterLink>
          <span class="header-user caption">{{ auth.user?.name || auth.user?.email }}</span>
          <button type="button" class="ghost-btn" @click="$emit('logout')">Выйти</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="header-auth-link">Вход</RouterLink>
          <RouterLink to="/register" class="header-auth-link header-auth-link--primary">
            Регистрация
          </RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>
