<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/api/client';
import ChatComposer from '@/components/chat/ChatComposer.vue';
import ChatContentTemplates from '@/components/chat/ChatContentTemplates.vue';
import ChatMessageBubble from '@/components/chat/ChatMessageBubble.vue';
import type { ContentTemplate } from '@/constants/content-templates';
import { useShellMode } from '@/composables/useShellMode';
import { useChatsStore } from '@/stores/chats';
import type { Message } from '@/types';

const { isDesktopShell } = useShellMode();
const route = useRoute();
const chats = useChatsStore();

const messages = ref<Message[]>([]);
const loading = ref(false);
const error = ref('');
const chatFeedRef = ref<HTMLElement | null>(null);
const composerRef = ref<InstanceType<typeof ChatComposer> | null>(null);

const chatId = computed(() => route.params.chatId as string);

const activeChat = computed(() => {
  if (chatId.value === 'general') {
    return chats.general;
  }
  return chats.chatById(chatId.value);
});

const chatTitle = computed(() => activeChat.value?.name ?? 'Чат');
const isGeneralChat = computed(() => activeChat.value?.kind === 'GENERAL');

function scrollToLatest() {
  nextTick(() => {
    const feed = chatFeedRef.value;
    if (feed) feed.scrollTop = feed.scrollHeight;
  });
}

async function loadMessages() {
  if (!chatId.value || chatId.value === 'general') {
    await chats.load();
    const id = chats.general?.id;
    if (!id) {
      messages.value = [];
      return;
    }
    messages.value = await api.getMessages(id);
  } else {
    messages.value = await api.getMessages(chatId.value);
  }
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
    const targetChatId =
      chatId.value === 'general' ? chats.general?.id : chatId.value;
    await api.createMessage(rawText, content, targetChatId);
    composer.clear();
    await loadMessages();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось отправить';
  } finally {
    loading.value = false;
  }
}

watch(chatId, async () => {
  try {
    await loadMessages();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить сообщения';
  }
});

onMounted(async () => {
  try {
    await chats.load();
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
        <h2 class="chat-page__title">{{ chatTitle }}</h2>
        <p v-if="!isDesktopShell" class="caption">
          Заметки, ссылки и картинки — своя история в каждом чате
        </p>
        <p v-else class="chat-page__status">
          <span class="chat-page__status-dot" />
          {{ isGeneralChat ? 'Общая атмосфера' : 'Тематический чат' }}
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
