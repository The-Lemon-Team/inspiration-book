<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '@/api/client';
import EntryCard from '@/components/EntryCard.vue';
import type { EntryCategory, TimelineDay } from '@/types';

const timeline = ref<TimelineDay[]>([]);
const category = ref<EntryCategory | ''>('');
const loading = ref(true);
const error = ref('');

async function loadTimeline() {
  loading.value = true;
  error.value = '';
  try {
    timeline.value = await api.getTimeline(
      category.value ? { category: category.value } : undefined,
    );
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить ленту';
  } finally {
    loading.value = false;
  }
}

async function vote(id: string) {
  const updated = await api.vote(id);
  for (const day of timeline.value) {
    const index = day.entries.findIndex((entry) => entry.id === id);
    if (index >= 0) {
      day.entries[index] = updated;
      break;
    }
  }
}

async function togglePublic(id: string, isPublic: boolean) {
  const updated = await api.setPublic(id, isPublic);
  for (const day of timeline.value) {
    const index = day.entries.findIndex((entry) => entry.id === id);
    if (index >= 0) {
      day.entries[index] = { ...day.entries[index], ...updated };
      break;
    }
  }
}

onMounted(loadTimeline);
</script>

<template>
  <section class="page">
    <header class="page-header">
      <h2>Лента по дням</h2>
      <select v-model="category" @change="loadTimeline">
        <option value="">Все категории</option>
        <option value="LEARNED">Узнал</option>
        <option value="REMEMBERED">Вспомнил</option>
        <option value="TODO">Сделать</option>
      </select>
    </header>

    <p v-if="loading" class="muted">Загрузка…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="timeline.length === 0" class="empty-state">Записей пока нет.</p>

    <div v-else class="timeline">
      <section v-for="day in timeline" :key="day.date" class="timeline-day">
        <h3>{{ new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }) }}</h3>
        <EntryCard
          v-for="entry in day.entries"
          :key="entry.id"
          :entry="entry"
          show-vote
          show-public-toggle
          @vote="vote"
          @toggle-public="togglePublic"
        />
      </section>
    </div>
  </section>
</template>
