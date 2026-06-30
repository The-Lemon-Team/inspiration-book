<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { api } from '@/api/client';
import ChatComposer from '@/components/chat/ChatComposer.vue';
import ChatContentTemplates from '@/components/chat/ChatContentTemplates.vue';
import ChatMessageBubble from '@/components/chat/ChatMessageBubble.vue';
import type { ContentTemplate } from '@/constants/content-templates';
import { useShellMode } from '@/composables/useShellMode';
import type { Message } from '@/types';

const { isDesktopShell } = useShellMode();

const messages = ref<Message[]>([]);
const loading = ref(false);
const error = ref('');
const chatFeedRef = ref<HTMLElement | null>(null);
const composerRef = ref<InstanceType<typeof ChatComposer> | null>(null);

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

function onMessageUpdated(updated: Message) {
  const index = messages.value.findIndex((message) => message.id === updated.id);
  if (index >= 0) {
    messages.value[index] = updated;
  }
}

function onMessageDeleted(messageId: string) {
  messages.value = messages.value.filter((message) => message.id !== messageId);
}

function onMusicTemplate(template: ContentTemplate) {
  composerRef.value?.openMusicModal(template);
}

function onLinkTemplate(
  template: ContentTemplate,
  data: { url: string; note: string },
) {
  composerRef.value?.insertLinkTemplate(template, data);
}

async function sendMessage() {
  const composer = composerRef.value;
  if (!composer || composer.isEmpty()) return;

  const rawText = composer.getRawText();
  const content = composer.getDocument();
  if (!rawText.trim()) return;

  loading.value = true;
  error.value = '';

  try {
    await api.createMessage(rawText, content);
    composer.clear();
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
  <section class="chat-page" :class="{ 'chat-page--shell': isDesktopShell }">
    <header class="chat-page__header">
      <div>
        <h2 class="chat-page__title">Чат</h2>
        <p v-if="!isDesktopShell" class="caption">
          Пишите заметки, ссылки и картинки — теги в заголовках по желанию
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
          @updated="onMessageUpdated"
          @deleted="onMessageDeleted"
        />
      </div>
    </div>

    <footer class="chat-page__footer">
      <ChatContentTemplates
        @music-template="onMusicTemplate"
        @link-template="onLinkTemplate"
      />
      <ChatComposer
        ref="composerRef"
        :loading="loading"
        :error="error"
        @submit="sendMessage"
      />
    </footer>
  </section>
</template>
