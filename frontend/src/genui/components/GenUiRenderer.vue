<script setup lang="ts">
import type { GenUiBlock } from '@inspiration-book/genui';
import GenUiImage from './GenUiImage.vue';
import GenUiLinkCard from './GenUiLinkCard.vue';
import GenUiNote from './GenUiNote.vue';
import GenUiYoutubeCard from './GenUiYoutubeCard.vue';

defineProps<{
  blocks: GenUiBlock[];
}>();
</script>

<template>
  <div class="genui-renderer">
    <template v-for="(block, index) in blocks" :key="index">
      <GenUiNote v-if="block.type === 'note'" :text="block.text" />
      <GenUiLinkCard
        v-else-if="block.type === 'link'"
        :url="block.url"
        :label="block.label"
      />
      <GenUiImage
        v-else-if="block.type === 'image'"
        :url="block.url"
        :alt="block.alt"
      />
      <GenUiYoutubeCard
        v-else-if="block.type === 'youtube'"
        :url="block.url"
        :video-id="block.videoId"
        :title="block.title"
      />
    </template>
  </div>
</template>
