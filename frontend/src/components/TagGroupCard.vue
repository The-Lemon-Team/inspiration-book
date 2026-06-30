<script setup lang="ts">
import type { Tag } from '@/types';
import { tagStyle } from '@/types';

defineProps<{
  tag: Tag;
}>();

const emit = defineEmits<{
  select: [tag: Tag];
}>();

function formatCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(count);
}
</script>

<template>
  <button
    type="button"
    class="group-card card-hover"
    @click="emit('select', tag)"
  >
    <div class="group-card__accent" :style="{ background: tag.color }" />
    <div class="group-card__body">
      <div class="group-card__top">
        <h3 class="group-card__title">{{ tag.name }}</h3>
        <span
          class="group-card__badge"
          :style="{
            color: tagStyle(tag.color).badgeColor,
            background: tagStyle(tag.color).badgeBackground,
          }"
        >
          {{ tag.isDefault ? 'Базовый' : 'Свой' }}
        </span>
      </div>
      <p class="caption group-card__count">
        {{ formatCount(tag.entryCount ?? 0) }} записей
      </p>
    </div>
    <div class="group-card__footer">
      <span class="material-symbols-outlined group-card__arrow">arrow_forward_ios</span>
    </div>
  </button>
</template>
