<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3';
import type { NodeViewProps } from '@tiptap/vue-3';
import BlockImage from '@/blocks/components/BlockImage.vue';

const props = defineProps<NodeViewProps>();
</script>

<template>
  <NodeViewWrapper class="editor-node editor-node--image" data-drag-handle>
    <BlockImage
      :url="String(props.node.attrs.url)"
      :alt="props.node.attrs.alt ? String(props.node.attrs.alt) : undefined"
    />
  </NodeViewWrapper>
</template>
