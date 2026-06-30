<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { tagsApi } from '@/api/tags';
import { SUGGESTED_PUBLISH_TAGS } from '@/constants/publish-tags';
import { uiVisibleTags } from '@/constants/tags-ui';
import type { Tag } from '@/types';
import { tagStyle } from '@/types';

const props = defineProps<{
  open: boolean;
  messageId: string;
  initialTagId?: string | null;
}>();

const emit = defineEmits<{
  close: [];
  publish: [tagId: string];
}>();

const tags = ref<Tag[]>([]);
const selectedTagId = ref<string | null>(null);
const newTagName = ref('');
const loading = ref(false);
const creating = ref(false);
const error = ref('');

const visibleTags = computed(() => uiVisibleTags(tags.value));

const suggestedNames = computed(() => {
  const seen = new Set(visibleTags.value.map((tag) => tag.name.toLowerCase()));
  return SUGGESTED_PUBLISH_TAGS.filter((tag) => !seen.has(tag.name.toLowerCase()));
});

watch(
  () => [props.open, props.initialTagId] as const,
  async ([isOpen, initialTagId]) => {
    if (!isOpen) return;

    selectedTagId.value = initialTagId ?? null;
    newTagName.value = '';
    error.value = '';
    loading.value = true;

    try {
      tags.value = await tagsApi.list();
      if (!selectedTagId.value && visibleTags.value.length > 0) {
        selectedTagId.value = visibleTags.value[0].id;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Не удалось загрузить группы';
    } finally {
      loading.value = false;
    }
  },
);

function close() {
  emit('close');
}

function chipStyle(color: string) {
  return {
    color: tagStyle(color).badgeColor,
    background: tagStyle(color).badgeBackground,
  };
}

function selectTag(tagId: string) {
  selectedTagId.value = tagId;
}

async function createAndSelect(name: string, color?: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const existing = tags.value.find(
    (tag) => tag.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (existing) {
    selectedTagId.value = existing.id;
    return;
  }

  creating.value = true;
  error.value = '';

  try {
    const tag = await tagsApi.create(trimmed, color);
    tags.value = [...tags.value, tag];
    selectedTagId.value = tag.id;
    newTagName.value = '';
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось создать группу';
  } finally {
    creating.value = false;
  }
}

async function addCustomTag() {
  await createAndSelect(newTagName.value);
}

function submit() {
  if (!selectedTagId.value) {
    error.value = 'Выберите группу для публикации';
    return;
  }
  emit('publish', selectedTagId.value);
  close();
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="publish-modal" @click.self="close">
      <div class="publish-modal__dialog" role="dialog" aria-modal="true">
        <header class="publish-modal__head">
          <div>
            <p class="publish-modal__eyebrow">Публикация</p>
            <h3 class="publish-modal__title">Выберите группу</h3>
            <p class="publish-modal__hint">
              Запись появится на общем борде в выбранной секции
            </p>
          </div>
          <button type="button" class="publish-modal__close" aria-label="Закрыть" @click="close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>

        <div v-if="loading" class="publish-modal__state">
          <span class="material-symbols-outlined spin">progress_activity</span>
          <p class="caption">Загружаем группы…</p>
        </div>

        <section v-else class="publish-modal__body">
          <div v-if="visibleTags.length > 0" class="publish-modal__section">
            <span class="publish-modal__label">Ваши группы</span>
            <div class="publish-modal__tags">
              <button
                v-for="tag in visibleTags"
                :key="tag.id"
                type="button"
                class="publish-modal__tag"
                :class="{ 'publish-modal__tag--active': selectedTagId === tag.id }"
                :style="chipStyle(tag.color)"
                @click="selectTag(tag.id)"
              >
                {{ tag.name }}
              </button>
            </div>
          </div>

          <div v-if="suggestedNames.length > 0" class="publish-modal__section">
            <span class="publish-modal__label">Предложения</span>
            <div class="publish-modal__tags">
              <button
                v-for="tag in suggestedNames"
                :key="tag.name"
                type="button"
                class="publish-modal__tag publish-modal__tag--suggested"
                :style="chipStyle(tag.color)"
                :disabled="creating"
                @click="createAndSelect(tag.name, tag.color)"
              >
                <span class="material-symbols-outlined">add</span>
                {{ tag.name }}
              </button>
            </div>
          </div>

          <form class="publish-modal__create" @submit.prevent="addCustomTag">
            <span class="publish-modal__label">Новая группа</span>
            <div class="tag-create">
              <input
                v-model="newTagName"
                type="text"
                placeholder="Например, Книги"
                maxlength="40"
                :disabled="creating"
              />
              <button type="submit" class="btn-secondary" :disabled="creating || !newTagName.trim()">
                Создать
              </button>
            </div>
          </form>

          <p v-if="error" class="error">{{ error }}</p>

          <button
            type="button"
            class="btn-primary publish-modal__submit"
            :disabled="!selectedTagId || creating"
            @click="submit"
          >
            Опубликовать
          </button>
        </section>
      </div>
    </div>
  </Teleport>
</template>
