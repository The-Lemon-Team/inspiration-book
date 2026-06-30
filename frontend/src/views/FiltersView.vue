<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/api/client';
import { tagsApi } from '@/api/tags';
import EntryCard from '@/components/EntryCard.vue';
import { uiVisibleTags } from '@/constants/tags-ui';
import type { Entry, Tag } from '@/types';

const auth = useAuthStore();
const entries = ref<Entry[]>([]);
const tags = ref<Tag[]>([]);
const filterTags = computed(() => uiVisibleTags(tags.value));
const activeTagId = ref('');
const loading = ref(true);
const error = ref('');

async function loadFilters() {
  loading.value = true;
  error.value = '';
  try {
    entries.value = await api.getPublicBoard(50, activeTagId.value || undefined);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить публикации';
    entries.value = [];
  } finally {
    loading.value = false;
  }
}

async function loadTags() {
  if (!auth.isAuthenticated) return;
  try {
    tags.value = await tagsApi.list();
  } catch {
    tags.value = [];
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
  await loadTags();
  await loadFilters();
});
</script>

<template>
  <section class="page">
    <header class="page-hero">
      <h2 class="page-title">Фильтры</h2>
      <p class="caption">Публикации по тегам — отчёты и заметки из чатов</p>
    </header>

    <div v-if="filterTags.length && !error" class="filter-row">
      <button
        class="filter-chip"
        :class="{ active: !activeTagId }"
        @click="activeTagId = ''; loadFilters()"
      >
        все
      </button>
      <button
        v-for="tag in filterTags"
        :key="tag.id"
        class="filter-chip"
        :class="{ active: activeTagId === tag.id }"
        @click="activeTagId = tag.id; loadFilters()"
      >
        {{ tag.name }}
      </button>
    </div>

    <div v-if="loading" class="page-state page-state--loading">
      <span class="material-symbols-outlined page-state__icon spin">progress_activity</span>
      <p class="caption">Загружаем публикации…</p>
    </div>

    <div v-else-if="error" class="page-state page-state--error">
      <span class="material-symbols-outlined page-state__icon">cloud_off</span>
      <h3 class="page-state__title">Не удалось загрузить</h3>
      <p class="caption page-state__text">{{ error }}</p>
      <button type="button" class="btn-primary" @click="loadFilters">
        Попробовать снова
      </button>
    </div>

    <div v-else-if="entries.length === 0" class="page-state page-state--empty">
      <span class="material-symbols-outlined page-state__icon">filter_alt</span>
      <h3 class="page-state__title">Пока пусто</h3>
      <p class="caption page-state__text">
        Опубликуйте сообщение из чата с тегом — оно появится здесь.
      </p>
      <RouterLink v-if="auth.isAuthenticated" to="/chat" class="btn-primary">
        Перейти в чаты
      </RouterLink>
    </div>

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
