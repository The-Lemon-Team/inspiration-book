<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const isChatsActive = computed(() => {
  if (route.name === 'chats-list' || route.name === 'chat-room' || route.name === 'chat') {
    return true;
  }
  return route.path.startsWith('/chats') || route.path === '/chat';
});
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink to="/filters" class="bottom-nav__item">
      <span class="material-symbols-outlined">filter_alt</span>
      <span>Фильтры</span>
    </RouterLink>
    <RouterLink to="/chats" class="bottom-nav__item" :class="{ 'router-link-active': isChatsActive }">
      <span class="material-symbols-outlined">forum</span>
      <span>Чаты</span>
    </RouterLink>
    <RouterLink to="/groups" class="bottom-nav__item">
      <span class="material-symbols-outlined">account_tree</span>
      <span>Группы</span>
    </RouterLink>
    <RouterLink to="/graph" class="bottom-nav__item">
      <span class="material-symbols-outlined">graph_5</span>
      <span>Graph</span>
    </RouterLink>
    <RouterLink to="/timeline" class="bottom-nav__item">
      <span class="material-symbols-outlined">view_timeline</span>
      <span>Лента</span>
    </RouterLink>
    <RouterLink to="/settings" class="bottom-nav__item">
      <span class="material-symbols-outlined">settings</span>
      <span>Ещё</span>
    </RouterLink>
  </nav>
</template>
