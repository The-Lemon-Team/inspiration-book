<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '@/api/client';
import EntryCard from '@/components/EntryCard.vue';
import type { Entry } from '@/types';

const entries = ref<Entry[]>([]);
const loading = ref(true);
const error = ref('');

async function loadTop() {
  loading.value = true;
  error.value = '';
  try {
    entries.value = await api.getTop(20);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить топ';
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

onMounted(loadTop);
</script>

<template>
  <section class="page">
    <header class="page-header">
      <h2>Топ полезных записей</h2>
    </header>

    <p v-if="loading" class="muted">Загрузка…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="entries.length === 0" class="empty-state">
      Пока никто не голосовал. Отметьте полезные записи в ленте.
    </p>

    <div v-else class="top-list">
      <div v-for="(entry, index) in entries" :key="entry.id" class="top-item">
        <span class="rank">#{{ index + 1 }}</span>
        <EntryCard :entry="entry" show-vote @vote="vote" />
      </div>
    </div>
  </section>
</template>
