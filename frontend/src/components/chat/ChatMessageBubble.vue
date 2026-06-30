<script setup lang="ts">
import { GenUiMessage } from '@/genui';
import type { Message } from '@/types';

defineProps<{
  message: Message;
}>();

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<template>
  <article class="chat-message">
    <div class="chat-message__avatar" aria-hidden="true">
      <span class="material-symbols-outlined">person</span>
    </div>
    <div class="chat-message__body">
      <GenUiMessage :raw-text="message.rawText" :entries="message.entries" />
      <time class="chat-message__time">{{ formatTime(message.createdAt) }}</time>
    </div>
  </article>
</template>
