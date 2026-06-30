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
  <a class="genui-link" :href="url" target="_blank" rel="noopener noreferrer">
    <span class="material-symbols-outlined genui-link__icon">link</span>
    <span class="genui-link__body">
      <span class="genui-link__title">{{ displayLabel }}</span>
      <span class="genui-link__host">{{ hostname }}</span>
    </span>
    <span class="material-symbols-outlined genui-link__arrow">open_in_new</span>
  </a>
</template>
