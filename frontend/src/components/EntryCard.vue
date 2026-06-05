<script setup lang="ts">
import type { Entry } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS, displayName } from '@/types';

defineProps<{
  entry: Entry;
  showVote?: boolean;
  showAuthor?: boolean;
  showPublicToggle?: boolean;
}>();

const emit = defineEmits<{
  vote: [id: string];
  togglePublic: [id: string, isPublic: boolean];
}>();
</script>

<template>
  <article class="entry-card" :style="{ borderLeftColor: CATEGORY_COLORS[entry.category] }">
    <div class="entry-meta">
      <span class="category-badge" :style="{ background: CATEGORY_COLORS[entry.category] }">
        {{ CATEGORY_LABELS[entry.category] }}
      </span>
      <time>{{ new Date(entry.createdAt).toLocaleString('ru-RU') }}</time>
    </div>
    <p v-if="showAuthor && entry.user" class="entry-author">
      {{ displayName(entry.user) }}
    </p>
    <p class="entry-content">{{ entry.content }}</p>
    <div v-if="showVote || showPublicToggle" class="entry-actions">
      <button v-if="showVote" class="vote-btn" @click="emit('vote', entry.id)">
        👍 Полезно · {{ entry.usefulVotes }}
      </button>
      <button
        v-if="showPublicToggle"
        class="public-btn"
        :class="{ active: entry.isPublic }"
        @click="emit('togglePublic', entry.id, !entry.isPublic)"
      >
        {{ entry.isPublic ? '🌐 Публично' : '🔒 Приватно' }}
      </button>
    </div>
  </article>
</template>
