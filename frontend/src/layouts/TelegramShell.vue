<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { tagsApi } from '@/api/tags';
import { uiVisibleTags } from '@/constants/tags-ui';
import { useAuthStore } from '@/stores/auth';
import type { Tag, User } from '@/types';

defineEmits<{ logout: [] }>();

const auth = useAuthStore();
const route = useRoute();

const tags = ref<Tag[]>([]);
const tagsLoading = ref(true);

const navItems = [
  { to: '/chat', icon: 'chat', label: 'Чат' },
  { to: '/tags', icon: 'folder', label: 'Группы' },
  { to: '/timeline', icon: 'view_timeline', label: 'Лента' },
  { to: '/', icon: 'grid_view', label: 'Борд' },
  { to: '/calendar', icon: 'calendar_month', label: 'Календарь' },
  { to: '/settings', icon: 'settings', label: 'Настройки' },
];

const sidebarTags = computed(() =>
  [...uiVisibleTags(tags.value)]
    .sort((a, b) => (b.entryCount ?? 0) - (a.entryCount ?? 0))
    .slice(0, 8),
);

const displayName = computed(
  () => auth.user?.name || auth.user?.email?.split('@')[0] || 'Пользователь',
);

const userSubtitle = computed(() => auth.user?.email ?? '');

function userInitials(user: User | null): string {
  if (user?.name) {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return user.name.slice(0, 2).toUpperCase();
  }
  if (user?.email) return user.email.slice(0, 2).toUpperCase();
  return '?';
}

function isNavActive(path: string) {
  return route.path === path;
}

function isTagActive(tagId: string) {
  return route.path === '/timeline' && route.query.tagId === tagId;
}

async function loadTags() {
  tagsLoading.value = true;
  try {
    tags.value = await tagsApi.list();
  } catch {
    tags.value = [];
  } finally {
    tagsLoading.value = false;
  }
}

onMounted(loadTags);
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
          :class="{ active: isNavActive(item.to) }"
        >
          <span
            class="material-symbols-outlined"
            :class="{ 'material-symbols-outlined--filled': isNavActive(item.to) }"
          >
            {{ item.icon }}
          </span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <section v-if="sidebarTags.length > 0" class="telegram-sidebar__folders">
        <h3 class="telegram-sidebar__folders-title">Папки контента</h3>
        <ul class="telegram-sidebar__folder-list">
          <li v-for="tag in sidebarTags" :key="tag.id">
            <RouterLink
              :to="{ name: 'timeline', query: { tagId: tag.id } }"
              class="telegram-sidebar__folder"
              :class="{ active: isTagActive(tag.id) }"
            >
              <span class="telegram-sidebar__folder-dot" :style="{ background: tag.color }" />
              <span class="telegram-sidebar__folder-name">{{ tag.name }}</span>
              <span v-if="tag.entryCount != null" class="telegram-sidebar__folder-count">
                {{ tag.entryCount }}
              </span>
            </RouterLink>
          </li>
        </ul>
      </section>
      <p v-else-if="!tagsLoading" class="telegram-sidebar__folders-empty caption">
        Теги появятся после первых записей в чате
      </p>

      <div class="telegram-sidebar__footer">
        <div class="telegram-sidebar__profile">
          <div class="telegram-sidebar__avatar" aria-hidden="true">
            {{ userInitials(auth.user) }}
          </div>
          <div class="telegram-sidebar__profile-text">
            <span class="telegram-sidebar__profile-name">{{ displayName }}</span>
            <span v-if="userSubtitle" class="telegram-sidebar__profile-email">{{ userSubtitle }}</span>
          </div>
        </div>
        <button type="button" class="telegram-sidebar__logout" @click="$emit('logout')">
          <span class="material-symbols-outlined">logout</span>
          Выйти
        </button>
      </div>
    </aside>

    <main class="telegram-shell__main">
      <slot />
    </main>
  </div>
</template>
