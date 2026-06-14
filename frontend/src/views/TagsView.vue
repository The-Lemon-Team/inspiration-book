<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { tagsApi } from '@/api/tags';
import type { Tag } from '@/types';

const router = useRouter();
const tags = ref<Tag[]>([]);
const search = ref('');
const newTagName = ref('');
const loading = ref(true);
const error = ref('');
const creating = ref(false);

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return tags.value;
  return tags.value.filter((tag) => tag.name.toLowerCase().includes(q));
});

async function loadTags() {
  loading.value = true;
  error.value = '';
  try {
    tags.value = await tagsApi.list();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить группы';
  } finally {
    loading.value = false;
  }
}

async function createTag() {
  if (!newTagName.value.trim()) return;
  creating.value = true;
  error.value = '';
  try {
    const tag = await tagsApi.create(newTagName.value.trim());
    tags.value = [...tags.value, { ...tag, entryCount: 0 }];
    newTagName.value = '';
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось создать тег';
  } finally {
    creating.value = false;
  }
}

function openTag(tag: Tag) {
  router.push({ name: 'timeline', query: { tagId: tag.id } });
}

onMounted(loadTags);
</script>

<template>
  <section class="page">
    <header class="page-hero">
      <h2 class="page-title">группы</h2>
      <p class="caption">Теги для записей: узнал, lo-fi, музыка — любые свои</p>
    </header>

    <div class="search-field">
      <span class="material-symbols-outlined search-field__icon">search</span>
      <input v-model="search" type="search" placeholder="поиск тем..." />
    </div>

    <form class="tag-create" @submit.prevent="createTag">
      <input v-model="newTagName" type="text" placeholder="новый тег: lo-fi, музыка..." />
      <button type="submit" class="btn-primary" :disabled="creating || !newTagName.trim()">
        {{ creating ? '…' : '+' }}
      </button>
    </form>

    <p v-if="loading" class="muted">Загрузка…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="filtered.length === 0" class="empty-state">Тегов пока нет</p>

    <div v-else class="tag-grid">
      <button
        v-for="tag in filtered"
        :key="tag.id"
        type="button"
        class="tag-card card-hover"
        :style="{ borderLeftColor: tag.color }"
        @click="openTag(tag)"
      >
        <div class="tag-card__head">
          <h3>{{ tag.name }}</h3>
          <span class="caption">{{ tag.entryCount ?? 0 }} записей</span>
        </div>
        <p class="caption tag-card__hint">
          {{ tag.isDefault ? 'базовый тег' : 'свой тег' }}
        </p>
      </button>
    </div>
  </section>
</template>
