<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { DESKTOP_SHELL_NAV_ITEMS, isAppNavActive, type AppNavItem } from '@/config/app-nav';
import { ALL_CHATS_FOLDER_ID, useChatFolders } from '@/composables/useChatFolders';
import { useMoreModal } from '@/composables/useMoreModal';

const route = useRoute();
const { moreModalOpen, openMoreModal } = useMoreModal();
const { selectFolder } = useChatFolders();

function navItemLabel(item: AppNavItem): string {
  return item.to === '/settings' ? 'Ещё' : item.label;
}

function isNavItemActive(item: AppNavItem): boolean {
  if (item.to === '/settings') {
    return moreModalOpen.value || isAppNavActive(item, route);
  }
  return isAppNavActive(item, route);
}

function isMoreNavItem(item: AppNavItem): boolean {
  return item.to === '/settings';
}

function isChatsNavItem(item: AppNavItem): boolean {
  return item.to === '/chats';
}

function onNavClick(item: AppNavItem) {
  if (isChatsNavItem(item)) {
    selectFolder(ALL_CHATS_FOLDER_ID);
  }
}

function navItemTo(item: AppNavItem) {
  return isChatsNavItem(item) ? { name: 'chats-list' } : item.to;
}
</script>

<template>
  <nav class="bottom-nav">
    <template v-for="item in DESKTOP_SHELL_NAV_ITEMS" :key="item.to">
      <button
        v-if="isMoreNavItem(item)"
        type="button"
        class="bottom-nav__item"
        :class="{ 'router-link-active': isNavItemActive(item) }"
        @click="openMoreModal"
      >
        <span class="material-symbols-outlined">{{ item.icon }}</span>
        <span>{{ navItemLabel(item) }}</span>
      </button>
      <RouterLink
        v-else
        :to="navItemTo(item)"
        class="bottom-nav__item"
        :class="{ 'router-link-active': isNavItemActive(item) }"
        @click="onNavClick(item)"
      >
        <span class="material-symbols-outlined">{{ item.icon }}</span>
        <span>{{ navItemLabel(item) }}</span>
      </RouterLink>
    </template>
  </nav>
</template>
