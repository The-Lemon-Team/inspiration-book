<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '@/api/client';
import TagBadge from '@/components/TagBadge.vue';
import type { Message } from '@/types';

const messages = ref<Message[]>([]);
const draft = ref('');
const isPublic = ref(false);
const loading = ref(false);
const error = ref('');

const placeholder = `Узнал:
 - Как варить суп
 - Как писать vibe code

lo-fi:
 - Jazz-hop плейлист для работы

Вспомнил:
 - Сходить к стоматологу

Сделать:
 - Поесть
 - Начать рабочий день`;

async function loadMessages() {
  messages.value = await api.getMessages();
}

async function sendMessage() {
  if (!draft.value.trim()) return;

  loading.value = true;
  error.value = '';

  try {
    await api.createMessage(draft.value, isPublic.value);
    draft.value = '';
    isPublic.value = false;
    await loadMessages();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось отправить';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  try {
    await loadMessages();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить сообщения';
  }
});
</script>

<template>
  <section class="page chat">
    <header class="page-hero">
      <h2 class="page-title">чат</h2>
      <p class="caption">Пишите блоками с тегами — Узнал, lo-fi, музыка, что угодно</p>
    </header>

    <div class="chat-feed">
      <p v-if="messages.length === 0" class="empty-state">
        Пока записей нет. Напишите первое сообщение.
      </p>

      <article v-for="message in messages" :key="message.id" class="message-bubble">
        <time class="caption">{{ new Date(message.createdAt).toLocaleString('ru-RU') }}</time>
        <pre class="message-text">{{ message.rawText }}</pre>
        <ul class="message-entries">
          <li v-for="entry in message.entries" :key="entry.id" class="message-entry-row">
            <TagBadge :tag="entry.tag" small />
            <span>{{ entry.content }}</span>
          </li>
        </ul>
      </article>
    </div>

    <form class="composer" @submit.prevent="sendMessage">
      <textarea
        v-model="draft"
        :placeholder="placeholder"
        rows="10"
        :disabled="loading"
      />
      <label class="checkbox-label">
        <input v-model="isPublic" type="checkbox" :disabled="loading" />
        Опубликовать на общем борде
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="loading || !draft.trim()">
        {{ loading ? 'Сохраняю…' : 'Записать' }}
      </button>
    </form>
  </section>
</template>
