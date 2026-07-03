<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Tag } from '@/types';
import {
  formatHashtagTags,
  parseHashtagInput,
} from '@/utils/tag-colors';

const props = defineProps<{
  modelValue: string[];
  userTags?: Tag[];
}>();

const emit = defineEmits<{
  'update:modelValue': [tags: string[]];
}>();

const tagsInput = ref('');

const hashtags = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

function tagsKey(tags: string[]) {
  return tags.join('\0');
}

watch(
  () => props.modelValue,
  (value) => {
    if (tagsKey(parseHashtagInput(tagsInput.value)) !== tagsKey(value)) {
      tagsInput.value = formatHashtagTags(value);
    }
  },
  { immediate: true },
);

function onInput() {
  hashtags.value = parseHashtagInput(tagsInput.value);
}

function onBlur() {
  tagsInput.value = formatHashtagTags(hashtags.value);
}
</script>

<template>
  <label class="music-tag-picker">
    <span class="music-tag-picker__label">Хештеги</span>

    <input
      v-model="tagsInput"
      type="text"
      class="music-tag-picker__input music-tag-picker__input--full"
      placeholder="#vibe, #result, #resume"
      spellcheck="false"
      autocomplete="off"
      @input="onInput"
      @blur="onBlur"
    />

    <span class="music-tag-picker__hint">
      Метки для поиска — через запятую или пробел
    </span>
  </label>
</template>
