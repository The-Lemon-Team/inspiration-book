<script setup lang="ts">
import type { Tag } from '@/types';
import { tagStyle } from '@/types';

defineProps<{
  tag: Tag;
  small?: boolean;
}>();
</script>

<template>
  <span
    class="tag-badge"
    :class="{ 'tag-badge--small': small }"
    :style="{
      color: tagStyle(tag.color).badgeColor,
      background: tagStyle(tag.color).badgeBackground,
    }"
  >
    {{ tag.name }}
  </span>
</template>
