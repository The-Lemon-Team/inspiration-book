<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const route = useRoute();

const navItems = [
  { to: '/chat', icon: 'chat', label: 'Чат' },
  { to: '/tags', icon: 'folder', label: 'Группы' },
  { to: '/timeline', icon: 'view_timeline', label: 'Лента' },
  { to: '/', icon: 'grid_view', label: 'Борд' },
  { to: '/calendar', icon: 'calendar_month', label: 'Календарь' },
  { to: '/settings', icon: 'settings', label: 'Настройки' },
];
</script>

<template>
  <div class="telegram-shell">
    <aside class="telegram-sidebar">
      <div class="telegram-sidebar__brand">
        <div class="telegram-sidebar__logo">
          <span class="material-symbols-outlined">menu_book</span>
        </div>
        <span class="telegram-sidebar__title">инспирация</span>
      </div>

      <nav class="telegram-sidebar__nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="telegram-sidebar__item"
          :class="{ active: route.path === item.to }"
        >
          <span
            class="material-symbols-outlined"
            :class="{ 'material-symbols-outlined--filled': route.path === item.to }"
          >
            {{ item.icon }}
          </span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="telegram-sidebar__user">
        <span class="telegram-sidebar__user-name">
          {{ auth.user?.name || auth.user?.email?.split('@')[0] || 'Пользователь' }}
        </span>
      </div>
    </aside>

    <main class="telegram-shell__main">
      <slot />
    </main>
  </div>
</template>
