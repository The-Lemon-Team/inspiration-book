<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/api/client';
import { tagsApi } from '@/api/tags';
import EntryCard from '@/components/EntryCard.vue';
import type { Entry, Tag } from '@/types';

const auth = useAuthStore();
const entries = ref<Entry[]>([]);
const tags = ref<Tag[]>([]);
const activeTagId = ref('');
const loading = ref(true);
const error = ref('');

async function loadBoard() {
  loading.value = true;
  error.value = '';
  try {
    entries.value = await api.getPublicBoard(50, activeTagId.value || undefined);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить борд';
  } finally {
    loading.value = false;
  }
}

async function vote(id: string) {
  const updated = await api.vote(id);
  const index = entries.value.findIndex((entry) => entry.id === id);
  if (index >= 0) {
    entries.value[index] = updated;
    entries.value.sort((a, b) => b.usefulVotes - a.usefulVotes);
  }
}

onMounted(async () => {
  try {
    if (auth.isAuthenticated) {
      tags.value = await tagsApi.list();
    }
    await loadBoard();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка загрузки';
  }
});
</script>

<template>
  <section class="page">
    <header class="page-hero">
      <h2 class="page-title">публичный борд</h2>
      <p class="caption">Полезные заметки нашего сообщества</p>
      <div class="home-actions">
        <template v-if="!auth.isAuthenticated">
          <RouterLink to="/login" class="btn-primary">войти</RouterLink>
          <RouterLink to="/register" class="btn-secondary">регистрация</RouterLink>
        </template>
        <RouterLink v-else to="/chat" class="btn-primary">мой дневник</RouterLink>
      </div>
    </header>

    <div v-if="tags.length" class="filter-row">
      <button
        class="filter-chip"
        :class="{ active: !activeTagId }"
        @click="activeTagId = ''; loadBoard()"
      >
        все
      </button>
      <button
        v-for="tag in tags"
        :key="tag.id"
        class="filter-chip"
        :class="{ active: activeTagId === tag.id }"
        @click="activeTagId = tag.id; loadBoard()"
      >
        {{ tag.name }}
      </button>
    </div>

    <p v-if="loading" class="muted">Загрузка…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="entries.length === 0" class="empty-state">
      Пока публичных записей нет
    </p>

    <div v-else class="board-list">
      <EntryCard
        v-for="entry in entries"
        :key="entry.id"
        :entry="entry"
        show-author
        show-vote
        @vote="vote"
      />
    </div>
  </section>
</template>
