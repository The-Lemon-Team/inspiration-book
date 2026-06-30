<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  url: string;
  label?: string;
}>();

const hostname = computed(() => {
  try {
    return new URL(props.url).hostname.replace(/^www\./, '');
  } catch {
    return props.url;
  }
});

const displayLabel = computed(() => props.label || props.url);
</script>

<template>
  <a class="block-link" :href="url" target="_blank" rel="noopener noreferrer">
    <span class="material-symbols-outlined block-link__icon">link</span>
    <span class="block-link__body">
      <span class="block-link__title">{{ displayLabel }}</span>
      <span class="block-link__host">{{ hostname }}</span>
    </span>
    <span class="material-symbols-outlined block-link__arrow">open_in_new</span>
  </a>
</template>
