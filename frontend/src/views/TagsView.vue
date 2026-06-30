<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { tagsApi } from '@/api/tags';
import TagGroupCard from '@/components/TagGroupCard.vue';
import type { Tag } from '@/types';

const router = useRouter();
const tags = ref<Tag[]>([]);
const search = ref('');
const newTagName = ref('');
const loading = ref(true);
const error = ref('');
const creating = ref(false);
const showCreate = ref(false);

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
    showCreate.value = false;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось создать группу';
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
  <section class="page groups-page">
    <header class="page-hero">
      <h2 class="page-title">Группы</h2>
      <p class="caption">Темы и теги для ваших записей</p>
    </header>

    <div class="search-field">
      <span class="material-symbols-outlined search-field__icon">search</span>
      <input v-model="search" type="search" placeholder="Поиск тем..." />
    </div>

    <div v-if="loading" class="page-state page-state--loading">
      <span class="material-symbols-outlined page-state__icon spin">progress_activity</span>
      <p class="caption">Загружаем группы…</p>
    </div>

    <div v-else-if="error" class="page-state page-state--error">
      <span class="material-symbols-outlined page-state__icon">cloud_off</span>
      <h3 class="page-state__title">Не удалось загрузить</h3>
      <p class="caption page-state__text">{{ error }}</p>
      <button type="button" class="btn-primary" @click="loadTags">Попробовать снова</button>
    </div>

    <template v-else>
      <div v-if="filtered.length === 0" class="page-state page-state--empty">
        <span class="material-symbols-outlined page-state__icon">label</span>
        <h3 class="page-state__title">Групп пока нет</h3>
        <p class="caption page-state__text">
          Создайте первую группу или напишите новый тег прямо в чате — он появится автоматически.
        </p>
        <button type="button" class="btn-primary" @click="showCreate = true">
          Создать группу
        </button>
      </div>

      <div v-else class="group-grid">
        <TagGroupCard
          v-for="tag in filtered"
          :key="tag.id"
          :tag="tag"
          @select="openTag"
        />
        <button type="button" class="group-card group-card--add" @click="showCreate = true">
          <span class="material-symbols-outlined">add</span>
          <span>Новая группа</span>
        </button>
      </div>
    </template>

    <form v-if="showCreate" class="group-create" @submit.prevent="createTag">
      <input
        v-model="newTagName"
        type="text"
        placeholder="lo-fi, Музыка, Книги..."
        autofocus
      />
      <button type="submit" class="btn-primary" :disabled="creating || !newTagName.trim()">
        {{ creating ? '…' : 'Создать' }}
      </button>
      <button type="button" class="ghost-btn" @click="showCreate = false">Отмена</button>
    </form>
  </section>
</template>
