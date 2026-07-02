<script setup lang="ts">
import { computed } from 'vue';
import type { ChannelActivityResponse, FlowEventItem } from '@/types';

const props = defineProps<{
  activity: ChannelActivityResponse | null;
  loading?: boolean;
}>();

const parentName = computed(() => props.activity?.parentChat?.name ?? '');

function formatEventTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function eventLabel(event: FlowEventItem) {
  const count =
    event.entryCount != null && event.entryCount > 0
      ? ` · ${event.entryCount} ${event.entryCount === 1 ? 'пункт' : 'пункта'}`
      : '';

  if (event.isOwn) {
    if (event.kind === 'REPLAY_UP') {
      return `↑ ${formatEventTime(event.createdAt)} · Вы · в канал${count}`;
    }
    return `↓ ${formatEventTime(event.createdAt)} · Broadcast из канала${count}`;
  }

  if (event.kind === 'REPLAY_UP') {
    return `↑ ${formatEventTime(event.createdAt)} · ${event.sourceChatName}${count}`;
  }

  return `↓ ${formatEventTime(event.createdAt)} · ${event.sourceChatName} · broadcast${count}`;
}
</script>

<template>
  <aside v-if="activity?.parentChat" class="chat-channel-panel">
    <header class="chat-channel-panel__head">
      <span class="material-symbols-outlined chat-channel-panel__icon">hub</span>
      <div>
        <h3 class="chat-channel-panel__title">Канал: {{ parentName }}</h3>
        <p class="caption chat-channel-panel__subtitle">Активность за 7 дней — только факты</p>
      </div>
    </header>

    <p v-if="loading" class="caption chat-channel-panel__empty">Загрузка…</p>

    <ul v-else-if="activity.events.length" class="chat-channel-panel__list">
      <li
        v-for="event in activity.events"
        :key="event.id"
        class="chat-channel-panel__item"
        :class="{ 'chat-channel-panel__item--own': event.isOwn }"
      >
        {{ eventLabel(event) }}
      </li>
    </ul>

    <p v-else class="caption chat-channel-panel__empty">
      Пока нет replay в канал «{{ parentName }}».
    </p>
  </aside>
</template>
