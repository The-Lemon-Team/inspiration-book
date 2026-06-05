<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '@/api/client';
import type { Message } from '@/types';
import { CATEGORY_LABELS } from '@/types';

const messages = ref<Message[]>([]);
const draft = ref('');
const isPublic = ref(false);
const loading = ref(false);
const error = ref('');

const placeholder = `Узнал:
 - Как варить суп
 - Как писать vibe code

Вспомнил:
 - Сходить к стоматологу
 - Посадить смородину

Сделать:
 - Поесть
 - Сходить в душ
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
  <section class="chat">
    <div class="chat-feed">
      <p v-if="messages.length === 0" class="empty-state">
        Пока записей нет. Напишите первое сообщение в формате дневника.
      </p>

      <article v-for="message in messages" :key="message.id" class="message-bubble">
        <header class="message-time">
          {{ new Date(message.createdAt).toLocaleString('ru-RU') }}
        </header>
        <pre class="message-text">{{ message.rawText }}</pre>
        <ul class="message-entries">
          <li v-for="entry in message.entries" :key="entry.id">
            <span class="mini-badge">{{ CATEGORY_LABELS[entry.category] }}</span>
            {{ entry.content }}
            <span v-if="entry.isPublic" class="public-tag">публично</span>
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
        Опубликовать записи на общем борде
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="loading || !draft.trim()">
        {{ loading ? 'Сохраняю…' : 'Записать' }}
      </button>
    </form>
  </section>
</template>
