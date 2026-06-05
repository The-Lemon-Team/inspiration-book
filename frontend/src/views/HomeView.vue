<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/api/client';
import EntryCard from '@/components/EntryCard.vue';
import type { Entry } from '@/types';

const auth = useAuthStore();
const entries = ref<Entry[]>([]);
const loading = ref(true);
const error = ref('');

async function loadBoard() {
  loading.value = true;
  error.value = '';
  try {
    entries.value = await api.getPublicBoard(50);
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

onMounted(loadBoard);
</script>

<template>
  <section class="page">
    <header class="page-header home-header">
      <div>
        <h2>Публичный борд</h2>
        <p class="muted">Полезные записи от сообщества Inspiration Book</p>
      </div>
      <div class="home-actions">
        <template v-if="!auth.isAuthenticated">
          <RouterLink to="/login" class="btn-primary">Войти</RouterLink>
          <RouterLink to="/register" class="btn-secondary">Регистрация</RouterLink>
        </template>
        <RouterLink v-else to="/chat" class="btn-primary">Мой дневник</RouterLink>
      </div>
    </header>

    <p v-if="loading" class="muted">Загрузка…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="entries.length === 0" class="empty-state">
      Пока публичных записей нет. Войдите и отметьте свои записи как публичные.
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
