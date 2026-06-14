<script setup lang="ts">
import type { Entry } from '@/types';
import { displayName, tagStyle } from '@/types';
import TagBadge from './TagBadge.vue';

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
  <article
    class="entry-card card-hover"
    :style="{ borderLeftColor: tagStyle(entry.tag.color).borderLeftColor }"
  >
    <div class="entry-meta">
      <TagBadge :tag="entry.tag" />
      <time class="caption">{{ new Date(entry.createdAt).toLocaleString('ru-RU') }}</time>
    </div>
    <p v-if="showAuthor && entry.user" class="entry-author caption">
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
