<script setup lang="ts">
defineProps<{
  url: string;
  alt?: string;
}>();
</script>

<template>
  <figure class="block-image">
    <img :src="url" :alt="alt || 'Изображение'" loading="lazy" />
    <figcaption v-if="alt" class="block-image__caption">{{ alt }}</figcaption>
  </figure>
</template>
