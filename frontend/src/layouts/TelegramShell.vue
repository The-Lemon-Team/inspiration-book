<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useChatsStore } from '@/stores/chats';
import type { Chat, User } from '@/types';

defineEmits<{ logout: [] }>();

const auth = useAuthStore();
const chats = useChatsStore();
const route = useRoute();
const router = useRouter();

const creating = ref(false);

const navItems = [
  { to: '/filters', icon: 'filter_alt', label: 'Фильтры' },
  { to: '/groups', icon: 'account_tree', label: 'Группы' },
  { to: '/graph', icon: 'graph_5', label: 'Graph' },
  { to: '/timeline', icon: 'view_timeline', label: 'Лента' },
  { to: '/calendar', icon: 'calendar_month', label: 'Календарь' },
  { to: '/settings', icon: 'settings', label: 'Настройки' },
];

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

function chatRoute(chat: Chat) {
  return chat.kind === 'GENERAL'
    ? { name: 'chat-room', params: { chatId: 'general' } }
    : { name: 'chat-room', params: { chatId: chat.id } };
}

function isChatActive(chat: Chat) {
  if (route.name !== 'chat-room') return false;
  const param = route.params.chatId as string;
  if (chat.kind === 'GENERAL') {
    return param === 'general' || param === chat.id;
  }
  return param === chat.id;
}

async function onCreateCollection() {
  const name = window.prompt('Название журнала или темы (например, «Лето 2026»)');
  if (!name?.trim()) return;
  creating.value = true;
  try {
    await chats.createCollection(name.trim());
  } finally {
    creating.value = false;
  }
}

async function onCreateChat(collectionId?: string) {
  const name = window.prompt('Название чата');
  if (!name?.trim()) return;
  creating.value = true;
  try {
    const chat = await chats.createChat(name.trim(), collectionId);
    await router.push(chatRoute(chat));
  } finally {
    creating.value = false;
  }
}

onMounted(() => chats.load());
</script>

<template>
  <div class="telegram-shell">
    <aside class="telegram-sidebar">
      <RouterLink to="/filters" class="telegram-sidebar__brand">
        <img src="/favicon.svg" alt="" class="telegram-sidebar__logo-img" width="32" height="32" />
        <span class="telegram-sidebar__title">lemon party</span>
      </RouterLink>

      <section class="telegram-sidebar__chats">
        <div class="telegram-sidebar__chats-head">
          <h3 class="telegram-sidebar__folders-title">Чаты</h3>
          <button
            type="button"
            class="telegram-sidebar__icon-btn"
            title="Новый чат"
            :disabled="creating"
            @click="onCreateChat()"
          >
            <span class="material-symbols-outlined">add</span>
          </button>
        </div>

        <ul v-if="chats.general" class="telegram-sidebar__chat-list">
          <li>
            <RouterLink
              :to="chatRoute(chats.general)"
              class="telegram-sidebar__chat"
              :class="{ active: isChatActive(chats.general) }"
            >
              <span class="material-symbols-outlined telegram-sidebar__chat-icon">forum</span>
              <span class="telegram-sidebar__folder-name">general</span>
            </RouterLink>
          </li>
        </ul>

        <div
          v-for="collection in chats.collections"
          :key="collection.id"
          class="telegram-sidebar__collection"
        >
          <div class="telegram-sidebar__collection-head">
            <span class="telegram-sidebar__collection-name">{{ collection.name }}</span>
            <button
              type="button"
              class="telegram-sidebar__icon-btn"
              title="Чат в группе"
              :disabled="creating"
              @click="onCreateChat(collection.id)"
            >
              <span class="material-symbols-outlined">add</span>
            </button>
          </div>
          <ul class="telegram-sidebar__chat-list">
            <li v-for="chat in collection.chats ?? []" :key="chat.id">
              <RouterLink
                :to="chatRoute(chat)"
                class="telegram-sidebar__chat"
                :class="{ active: isChatActive(chat) }"
              >
                <span class="material-symbols-outlined telegram-sidebar__chat-icon">chat</span>
                <span class="telegram-sidebar__folder-name">{{ chat.name }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>

        <ul v-if="chats.standalone.length" class="telegram-sidebar__chat-list">
          <li v-for="chat in chats.standalone" :key="chat.id">
            <RouterLink
              :to="chatRoute(chat)"
              class="telegram-sidebar__chat"
              :class="{ active: isChatActive(chat) }"
            >
              <span class="material-symbols-outlined telegram-sidebar__chat-icon">chat</span>
              <span class="telegram-sidebar__folder-name">{{ chat.name }}</span>
            </RouterLink>
          </li>
        </ul>

        <button
          type="button"
          class="telegram-sidebar__new-collection"
          :disabled="creating"
          @click="onCreateCollection"
        >
          <span class="material-symbols-outlined">library_books</span>
          Новый журнал
        </button>
      </section>

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
