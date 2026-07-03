<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/api/client';
import { tagsApi } from '@/api/tags';
import EntryCard from '@/components/EntryCard.vue';
import { uiVisibleTags } from '@/constants/tags-ui';
import type { Tag, TimelineDay } from '@/types';

const route = useRoute();
const timeline = ref<TimelineDay[]>([]);
const tags = ref<Tag[]>([]);
const filterTags = computed(() => uiVisibleTags(tags.value));
const tagId = ref('');
const visibility = ref<'all' | 'public' | 'private'>('all');
const loading = ref(true);
const error = ref('');

async function loadTimeline() {
  loading.value = true;
  error.value = '';
  try {
    timeline.value = await api.getTimeline({
      tagId: tagId.value || undefined,
      visibility: visibility.value,
    });
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

onMounted(async () => {
  try {
    tags.value = await tagsApi.list();
    tagId.value = (route.query.tagId as string) || '';
    await loadTimeline();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка загрузки';
  }
});

watch(
  () => route.query.tagId,
  (value) => {
    tagId.value = (value as string) || '';
    loadTimeline();
  },
);
</script>

<template>
  <section class="page">
    <header class="page-hero">
      <h2 class="page-title">Лента по Дням</h2>
      <p class="caption">Все ваши публикации</p>
    </header>

    <div class="page-filters">
      <div class="filter-row" aria-label="Фильтр по тегам">
        <button
          type="button"
          class="filter-chip"
          :class="{ active: !tagId }"
          @click="tagId = ''; loadTimeline()"
        >
          все теги
        </button>
        <button
          v-for="tag in filterTags"
          :key="tag.id"
          type="button"
          class="filter-chip"
          :class="{ active: tagId === tag.id }"
          @click="tagId = tag.id; loadTimeline()"
        >
          {{ tag.name }}
        </button>
      </div>

      <div class="filter-row" aria-label="Видимость записей">
        <button
          v-for="option in ['all', 'public', 'private'] as const"
          :key="option"
          type="button"
          class="filter-chip"
          :class="{ active: visibility === option }"
          @click="visibility = option; loadTimeline()"
        >
          {{ option === 'all' ? 'все' : option === 'public' ? 'публичные' : 'приватные' }}
        </button>
      </div>
    </div>

    <p v-if="loading" class="muted">Загрузка…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="timeline.length === 0" class="empty-state">Записей пока нет.</p>

    <div v-else class="timeline">
      <section v-for="day in timeline" :key="day.date" class="timeline-day">
        <h3>
          {{
            new Date(day.date).toLocaleDateString('ru-RU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })
          }}
        </h3>
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
