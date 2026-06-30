<script setup lang="ts">
import { NodeViewContent, NodeViewWrapper } from '@tiptap/vue-3';
import type { NodeViewProps } from '@tiptap/vue-3';

const props = defineProps<NodeViewProps>();
</script>

<template>
  <NodeViewWrapper class="editor-section" data-drag-handle>
    <span
      class="editor-section__tag"
      :style="props.node.attrs.tagColor ? { color: String(props.node.attrs.tagColor) } : undefined"
    >
      {{ props.node.attrs.tag }}
    </span>
    <div class="editor-section__body">
      <NodeViewContent />
    </div>
  </NodeViewWrapper>
</template>
