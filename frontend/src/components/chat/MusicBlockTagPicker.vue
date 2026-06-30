<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Tag } from '@/types';
import {
  formatHashtagTags,
  normalizeExtraTags,
  parseHashtagInput,
} from '@/utils/tag-colors';

const props = defineProps<{
  primaryTag: string;
  primaryColor: string;
  modelValue: string[];
  userTags?: Tag[];
}>();

const emit = defineEmits<{
  'update:modelValue': [tags: string[]];
}>();

const tagsInput = ref('');

const extraTags = computed({
  get: () => normalizeExtraTags(props.primaryTag, props.modelValue),
  set: (value) => emit('update:modelValue', normalizeExtraTags(props.primaryTag, value)),
});

const primaryLabel = computed(() => {
  const name = props.primaryTag.trim().toLowerCase();
  return name ? `#${name}` : '#музыка';
});

function tagsKey(tags: string[]) {
  return normalizeExtraTags(props.primaryTag, tags).join('\0');
}

watch(
  () => props.modelValue,
  (value) => {
    const normalized = normalizeExtraTags(props.primaryTag, value);
    if (tagsKey(parseHashtagInput(tagsInput.value, props.primaryTag)) !== tagsKey(normalized)) {
      tagsInput.value = formatHashtagTags(normalized);
    }
  },
  { immediate: true },
);

function onInput() {
  extraTags.value = parseHashtagInput(tagsInput.value, props.primaryTag);
}

function onBlur() {
  tagsInput.value = formatHashtagTags(extraTags.value);
}
</script>

<template>
  <label class="music-tag-picker">
    <span class="music-tag-picker__label">Теги</span>

    <div class="music-tag-picker__row">
      <span
        class="music-tag-picker__primary"
        :style="{ color: primaryColor }"
        :title="`${primaryTag} — основной тег, нельзя убрать`"
      >
        <span class="material-symbols-outlined music-tag-picker__lock" aria-hidden="true">
          lock
        </span>
        {{ primaryLabel }}
      </span>

      <input
        v-model="tagsInput"
        type="text"
        class="music-tag-picker__input"
        placeholder="#lofi, #todo, #vibe, #vibe_timelapse"
        spellcheck="false"
        autocomplete="off"
        @input="onInput"
        @blur="onBlur"
      />
    </div>

    <span class="music-tag-picker__hint">
      Введите дополнительные теги через запятую или пробел
    </span>
  </label>
</template>
