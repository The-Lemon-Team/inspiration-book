<script setup lang="ts">
import { computed } from 'vue';
import {
  extractStandaloneImages,
  parseInlineContent,
  parseStructuredMessage,
  type GenUiBlock,
} from '@inspiration-book/genui';
import GenUiRenderer from './GenUiRenderer.vue';

const props = defineProps<{
  rawText: string;
  entries?: Array<{ tag: { name: string; color: string }; content: string }>;
}>();

type DisplaySection = {
  tag: string;
  tagColor?: string;
  blocks: GenUiBlock[];
};

const sections = computed<DisplaySection[]>(() => {
  const parsed = parseStructuredMessage(props.rawText);
  if (parsed.length > 0) return parsed;

  return (props.entries ?? []).map((entry) => ({
    tag: entry.tag.name,
    tagColor: entry.tag.color,
    blocks: parseInlineContent(entry.content),
  }));
});

const standaloneImages = computed(() => extractStandaloneImages(props.rawText));
</script>

<template>
  <div class="genui-message">
    <div v-for="(section, i) in sections" :key="`s-${i}`" class="genui-message__section">
      <span
        class="genui-message__tag"
        :style="section.tagColor ? { color: section.tagColor } : undefined"
      >
        {{ section.tag }}
      </span>
      <GenUiRenderer :blocks="section.blocks" />
    </div>

    <GenUiRenderer v-if="standaloneImages.length" :blocks="standaloneImages" />
  </div>
</template>
