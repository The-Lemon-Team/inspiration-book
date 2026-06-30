<script setup lang="ts">
defineProps<{
  url: string;
  alt?: string;
}>();
</script>

<template>
  <figure class="genui-image">
    <img :src="url" :alt="alt || 'Изображение'" loading="lazy" />
    <figcaption v-if="alt" class="genui-image__caption">{{ alt }}</figcaption>
  </figure>
</template>
