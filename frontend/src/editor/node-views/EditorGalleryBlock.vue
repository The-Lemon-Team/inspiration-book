<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3';
import type { NodeViewProps } from '@tiptap/vue-3';
import type { GalleryImage } from '@inspiration-book/blocks';
import BlockGallery from '@/blocks/components/BlockGallery.vue';

const props = defineProps<NodeViewProps>();

const images = () => (props.node.attrs.images as GalleryImage[]) ?? [];
</script>

<template>
  <NodeViewWrapper class="editor-node editor-node--gallery" data-drag-handle>
    <BlockGallery :images="images()" />
  </NodeViewWrapper>
</template>
