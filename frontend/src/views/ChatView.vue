<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/api/client';
import { chatsApi } from '@/api/chats';
import ChatChannelPanel from '@/components/chat/ChatChannelPanel.vue';
import ChatChannelSettingsModal from '@/components/chat/ChatChannelSettingsModal.vue';
import ChatComposer from '@/components/chat/ChatComposer.vue';
import ChatContentTemplates from '@/components/chat/ChatContentTemplates.vue';
import ChatMessageBubble from '@/components/chat/ChatMessageBubble.vue';
import type { ContentTemplate } from '@/constants/content-templates';
import { useShellMode } from '@/composables/useShellMode';
import { useChatsStore } from '@/stores/chats';
import type {
  ChannelActivityResponse,
  Chat,
  Message,
  UpwardTarget,
} from '@/types';

const { isDesktopShell } = useShellMode();
const route = useRoute();
const chats = useChatsStore();

const messages = ref<Message[]>([]);
const loading = ref(false);
const error = ref('');
const chatFeedRef = ref<HTMLElement | null>(null);
const composerRef = ref<InstanceType<typeof ChatComposer> | null>(null);
const upwardTargets = ref<UpwardTarget[]>([]);
const childChats = ref<Chat[]>([]);
const channelActivity = ref<ChannelActivityResponse | null>(null);
const channelLoading = ref(false);
const channelSettingsOpen = ref(false);

const chatId = computed(() => route.params.chatId as string);

const activeChat = computed(() => {
  if (chatId.value === 'general') {
    return chats.general;
  }
  return chats.chatById(chatId.value);
});

const resolvedChatId = computed(() => {
  if (chatId.value === 'general') {
    return chats.general?.id ?? null;
  }
  return chatId.value || null;
});

const chatTitle = computed(() => activeChat.value?.name ?? 'Чат');
const isGeneralChat = computed(() => activeChat.value?.kind === 'GENERAL');
const hasChildren = computed(() => childChats.value.length > 0);

function scrollToLatest() {
  nextTick(() => {
    const feed = chatFeedRef.value;
    if (feed) feed.scrollTop = feed.scrollHeight;
  });
}

async function loadReplayContext() {
  const id = resolvedChatId.value;
  if (!id || isGeneralChat.value) {
    upwardTargets.value = [];
    childChats.value = [];
    channelActivity.value = null;
    return;
  }

  channelLoading.value = true;
  try {
    const [targets, children, activity] = await Promise.all([
      chatsApi.getUpwardTargets(id),
      chatsApi.getChildren(id),
      chatsApi.getChannelActivity(id),
    ]);
    upwardTargets.value = targets;
    childChats.value = children;
    channelActivity.value = activity;
  } catch {
    upwardTargets.value = [];
    childChats.value = [];
    channelActivity.value = null;
  } finally {
    channelLoading.value = false;
  }
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

async function reloadChatData() {
  await loadMessages();
  await loadReplayContext();
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
    await reloadChatData();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось отправить';
  } finally {
    loading.value = false;
  }
}

async function onChannelSettingsUpdated() {
  await chats.load(true);
  await loadReplayContext();
  if (resolvedChatId.value) {
    messages.value = await api.getMessages(resolvedChatId.value);
  }
}

watch(chatId, async () => {
  try {
    await reloadChatData();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить сообщения';
  }
});

onMounted(async () => {
  try {
    await chats.load();
    await reloadChatData();
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
      <button
        v-if="!isGeneralChat && resolvedChatId"
        type="button"
        class="chat-page__link-btn"
        @click="channelSettingsOpen = true"
      >
        <span class="material-symbols-outlined">tune</span>
        Настройки канала
      </button>
    </header>

    <ChatChannelSettingsModal
      :open="channelSettingsOpen"
      :chat="activeChat ?? null"
      @close="channelSettingsOpen = false"
      @updated="onChannelSettingsUpdated"
    />

    <div class="chat-page__layout">
      <ChatChannelPanel
        :activity="channelActivity"
        :loading="channelLoading"
      />

      <div ref="chatFeedRef" class="chat-page__feed">
        <p v-if="messages.length === 0" class="empty-state">
          Пока записей нет. Напишите первое сообщение.
        </p>

        <div class="chat-page__messages">
          <ChatMessageBubble
            v-for="message in messages"
            :key="message.id"
            :message="message"
            :upward-targets="upwardTargets"
            :has-children="hasChildren"
            @updated="onMessageUpdated"
            @deleted="onMessageDeleted"
            @replayed="loadReplayContext"
          />
        </div>
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
