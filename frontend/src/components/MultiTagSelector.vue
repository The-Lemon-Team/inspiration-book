<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  DEFAULT_CHAT_TAGS,
  SUGGESTED_CHAT_TAGS,
  type TagChip,
} from '@/constants/chat-tags';
import type { Tag } from '@/types';
import { tagStyle } from '@/types';
import { parseActiveTagNames } from '@/utils/insert-tag-block';

const props = defineProps<{
  draft: string;
  userTags?: Tag[];
}>();

const emit = defineEmits<{
  insert: [tagName: string];
}>();

const customTag = ref('');

const activeNames = computed(() => parseActiveTagNames(props.draft));

const specialTags = computed<TagChip[]>(() => {
  const seen = new Set(DEFAULT_CHAT_TAGS.map((tag) => tag.name.toLowerCase()));
  const result: TagChip[] = [];

  for (const tag of props.userTags ?? []) {
    const key = tag.name.toLowerCase();
    if (!tag.isDefault && !seen.has(key)) {
      result.push({ name: tag.name, color: tag.color });
      seen.add(key);
    }
  }

  for (const tag of SUGGESTED_CHAT_TAGS) {
    const key = tag.name.toLowerCase();
    if (!seen.has(key)) {
      result.push(tag);
      seen.add(key);
    }
  }

  return result;
});

function isActive(name: string) {
  return activeNames.value.has(name.toLowerCase());
}

function selectTag(name: string) {
  emit('insert', name);
}

function addCustomTag() {
  const name = customTag.value.trim();
  if (!name) return;
  emit('insert', name);
  customTag.value = '';
}
</script>

<template>
  <div class="tag-selector">
    <div class="tag-selector__chips">
      <button
        v-for="tag in DEFAULT_CHAT_TAGS"
        :key="tag.name"
        type="button"
        class="tag-selector__chip"
        :class="{ 'tag-selector__chip--active': isActive(tag.name) }"
        :style="{
          color: tagStyle(tag.color).badgeColor,
          background: tagStyle(tag.color).badgeBackground,
          '--chip-color': tag.color,
        }"
        @click="selectTag(tag.name)"
      >
        {{ tag.name }}
      </button>

      <span v-if="specialTags.length" class="tag-selector__sep" aria-hidden="true" />

      <button
        v-for="tag in specialTags"
        :key="tag.name"
        type="button"
        class="tag-selector__chip"
        :class="{ 'tag-selector__chip--active': isActive(tag.name) }"
        :style="{
          color: tagStyle(tag.color).badgeColor,
          background: tagStyle(tag.color).badgeBackground,
          '--chip-color': tag.color,
        }"
        @click="selectTag(tag.name)"
      >
        {{ tag.name }}
      </button>

      <form class="tag-selector__custom" @submit.prevent="addCustomTag">
        <input
          v-model="customTag"
          type="text"
          class="tag-selector__input"
          placeholder="свой тег"
          maxlength="40"
        />
        <button
          type="submit"
          class="tag-selector__add"
          :disabled="!customTag.trim()"
          aria-label="Вставить свой тег"
        >
          <span class="material-symbols-outlined">add</span>
        </button>
      </form>
    </div>
  </div>
</template>
