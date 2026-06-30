<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { api } from '@/api/client';
import { tagsApi } from '@/api/tags';
import ChatComposer from '@/components/chat/ChatComposer.vue';
import ChatMessageBubble from '@/components/chat/ChatMessageBubble.vue';
import MultiTagSelector from '@/components/MultiTagSelector.vue';
import { useShellMode } from '@/composables/useShellMode';
import type { Message, Tag } from '@/types';
import { insertTagBlock } from '@/utils/insert-tag-block';

const { isDesktopShell } = useShellMode();

const messages = ref<Message[]>([]);
const userTags = ref<Tag[]>([]);
const draft = ref('');
const isPublic = ref(false);
const loading = ref(false);
const error = ref('');
const chatFeedRef = ref<HTMLElement | null>(null);

function scrollToLatest() {
  nextTick(() => {
    const feed = chatFeedRef.value;
    if (feed) feed.scrollTop = feed.scrollHeight;
  });
}

async function loadMessages() {
  messages.value = await api.getMessages();
  scrollToLatest();
}

async function loadTags() {
  try {
    userTags.value = await tagsApi.list();
  } catch {
    userTags.value = [];
  }
}

function insertTag(tagName: string) {
  const { text } = insertTagBlock(
    draft.value,
    tagName,
    draft.value.length,
    draft.value.length,
  );
  draft.value = text;
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
    await loadTags();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось отправить';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  try {
    await Promise.all([loadMessages(), loadTags()]);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить сообщения';
  }
});
</script>

<template>
  <section class="chat-page" :class="{ 'chat-page--shell': isDesktopShell }">
    <header class="chat-page__header">
      <div>
        <h2 class="chat-page__title">Чат</h2>
        <p v-if="!isDesktopShell" class="caption">
          Пишите блоками с тегами — Узнал, lo-fi, музыка, что угодно
        </p>
        <p v-else class="chat-page__status">
          <span class="chat-page__status-dot" />
          Личный дневник
        </p>
      </div>
    </header>

    <div ref="chatFeedRef" class="chat-page__feed">
      <p v-if="messages.length === 0" class="empty-state">
        Пока записей нет. Напишите первое сообщение.
      </p>

      <div class="chat-page__messages">
        <ChatMessageBubble
          v-for="message in messages"
          :key="message.id"
          :message="message"
        />
      </div>
    </div>

    <footer class="chat-page__footer">
      <MultiTagSelector
        :draft="draft"
        :user-tags="userTags"
        @insert="insertTag"
      />
      <ChatComposer
        v-model:draft="draft"
        v-model:is-public="isPublic"
        :loading="loading"
        :error="error"
        @submit="sendMessage"
      />
    </footer>
  </section>
</template>
