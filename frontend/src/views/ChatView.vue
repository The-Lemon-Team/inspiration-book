<script setup lang="ts">
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/api/client';
import { chatsApi } from '@/api/chats';
import ChatHeaderMenuModal from '@/components/chat/ChatHeaderMenuModal.vue';
import ChatChannelPanel from '@/components/chat/ChatChannelPanel.vue';
import ChatChannelSettingsModal from '@/components/chat/ChatChannelSettingsModal.vue';
import ChatComposer from '@/components/chat/ChatComposer.vue';
import ChatContentTemplates from '@/components/chat/ChatContentTemplates.vue';
import ChatMessageBubble from '@/components/chat/ChatMessageBubble.vue';
import ForwardMessageModal from '@/components/chat/ForwardMessageModal.vue';
import MessageContextMenu from '@/components/chat/MessageContextMenu.vue';
import MessageSelectionBar from '@/components/chat/MessageSelectionBar.vue';
import type { ContentTemplate } from '@/constants/content-templates';
import { useChatMessageSelection } from '@/composables/useChatMessageSelection';
import { useShellMode } from '@/composables/useShellMode';
import { useChatsStore } from '@/stores/chats';
import type {
  ChatContentSummary,
  ChannelActivityResponse,
  Chat,
  Message,
  UpwardTarget,
} from '@/types';
const { usesUnifiedShell, isDesktopShell } = useShellMode();
const route = useRoute();
const chats = useChatsStore();

const chatsLayout = inject<{
  showBackButton: { value: boolean };
  goBackToList: () => void;
} | null>('chatsLayout', null);

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
const chatHeaderMenuOpen = ref(false);
const contentSummary = ref<ChatContentSummary | null>(null);
const forwardModalOpen = ref(false);
const selectionBusy = ref(false);
const selectionError = ref('');
const contextMenu = ref({
  open: false,
  x: 0,
  y: 0,
  messageId: null as string | null,
});

const {
  isSelectionMode,
  selectedCount,
  limitNotice,
  exitSelectionMode,
  isSelected,
  onMessageMouseDown,
  onMessageMouseEnter,
  onMessageClick,
  onCheckboxClick,
  onContextMenuSelect,
  removeMessageFromSelection,
} = useChatMessageSelection(messages);

const selectedMessages = computed(() =>
  messages.value.filter((message) => isSelected(message.id)),
);

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
const chatSubtitle = computed(() => {
  if (isGeneralChat.value) return 'личные заметки и черновики';
  const collectionName = activeChat.value?.collection?.name;
  if (collectionName) return collectionName;
  if (activeChat.value?.parentChatId) return 'дочерний канал';
  return 'самостоятельный чат';
});
const showBackButton = computed(() => chatsLayout?.showBackButton.value ?? false);
const isGeneralChat = computed(() => activeChat.value?.kind === 'GENERAL');
const hasChildren = computed(() => childChats.value.length > 0);

function scrollToLatest() {
  nextTick(() => {
    requestAnimationFrame(() => {
      const feed = chatFeedRef.value;
      if (!feed) return;
      feed.scrollTop = feed.scrollHeight;
    });
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

async function loadContentSummary() {
  const id = resolvedChatId.value;
  if (!id) {
    contentSummary.value = null;
    return;
  }
  try {
    contentSummary.value = await chatsApi.getContentSummary(id);
  } catch {
    contentSummary.value = null;
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
  await loadContentSummary();
}

function onMessageUpdated(updated: Message) {
  const index = messages.value.findIndex((message) => message.id === updated.id);
  if (index >= 0) {
    messages.value[index] = updated;
  }
}

function onMessageDeleted(messageId: string) {
  messages.value = messages.value.filter((message) => message.id !== messageId);
  removeMessageFromSelection(messageId);
}

function clearMessageSelection() {
  exitSelectionMode();
  forwardModalOpen.value = false;
  selectionError.value = '';
  closeContextMenu();
}

function closeContextMenu() {
  contextMenu.value.open = false;
  contextMenu.value.messageId = null;
}

function onMessageContextMenu(messageId: string, event: MouseEvent) {
  if (!isDesktopShell) return;
  event.preventDefault();
  contextMenu.value = {
    open: true,
    x: event.clientX,
    y: event.clientY,
    messageId,
  };
}

function onContextMenuSelectAction() {
  if (!contextMenu.value.messageId) return;
  onContextMenuSelect(contextMenu.value.messageId);
  closeContextMenu();
}

function handleMessageMouseDown(messageId: string, event: MouseEvent) {
  if (!isDesktopShell) return;
  onMessageMouseDown(messageId, event);
}

function handleMessageClick(messageId: string, event: MouseEvent) {
  if (!isDesktopShell) return;
  onMessageClick(messageId, event);
}

function handleMessageEnter(messageId: string) {
  if (!isDesktopShell) return;
  onMessageMouseEnter(messageId);
}

function handleCheckboxClick(messageId: string, event: MouseEvent) {
  if (!isDesktopShell) return;
  onCheckboxClick(messageId, event);
}

function onSelectionForward() {
  forwardModalOpen.value = true;
}

async function onSelectionDelete() {
  const targets = selectedMessages.value;
  if (targets.length === 0 || selectionBusy.value) return;

  const label =
    targets.length === 1
      ? 'Удалить это сообщение и все связанные записи? Это действие нельзя отменить.'
      : `Удалить ${targets.length} сообщений и все связанные записи? Это действие нельзя отменить.`;

  if (!window.confirm(label)) return;

  selectionBusy.value = true;
  selectionError.value = '';

  try {
    for (const message of targets) {
      await api.deleteMessage(message.id);
      messages.value = messages.value.filter((item) => item.id !== message.id);
    }
    clearMessageSelection();
  } catch (e) {
    selectionError.value = e instanceof Error ? e.message : 'Не удалось удалить';
  } finally {
    selectionBusy.value = false;
  }
}

async function onSelectionCopy() {
  const targets = selectedMessages.value;
  if (targets.length === 0) return;

  const text = targets.map((message) => message.rawText).join('\n\n');
  try {
    await navigator.clipboard.writeText(text);
    selectionError.value = '';
  } catch {
    selectionError.value = 'Не удалось скопировать текст';
  }
}

async function onForwardToChat(targetChatId: string) {
  const targets = selectedMessages.value;
  if (targets.length === 0 || selectionBusy.value) return;

  selectionBusy.value = true;
  selectionError.value = '';

  try {
    for (const message of targets) {
      await api.createMessage(
        message.rawText,
        message.content ?? undefined,
        targetChatId,
      );
    }
    forwardModalOpen.value = false;
    clearMessageSelection();
  } catch (e) {
    selectionError.value = e instanceof Error ? e.message : 'Не удалось переслать';
  } finally {
    selectionBusy.value = false;
  }
}

function onFeedClick(event: MouseEvent) {
  if (!isDesktopShell || !isSelectionMode.value) return;
  const target = event.target as HTMLElement;
  if (target.closest('.chat-message-wrap')) return;
  clearMessageSelection();
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
  await loadContentSummary();
  if (resolvedChatId.value) {
    messages.value = await api.getMessages(resolvedChatId.value);
  }
}

watch(chatId, async () => {
  clearMessageSelection();
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
  <section
    class="chat-page"
    :class="{
      'chat-page--shell': usesUnifiedShell,
      'chat-page--embedded': Boolean(chatsLayout),
      'chat-page--electron-select': isDesktopShell,
    }"
  >
    <header class="chat-page__header">
      <div class="chat-page__header-main">
        <button
          v-if="showBackButton"
          type="button"
          class="chat-page__back-btn"
          aria-label="Назад к списку чатов"
          @click="chatsLayout?.goBackToList()"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div v-if="showBackButton" class="chat-page__header-avatar" aria-hidden="true">
          {{ isGeneralChat ? '🔖' : (chatTitle.charAt(0).toUpperCase() || '💬') }}
        </div>
        <div class="chat-page__header-info">
          <button
            type="button"
            class="chat-page__title-btn"
            @click="chatHeaderMenuOpen = true"
          >
            <h2 class="chat-page__title">{{ chatTitle }}</h2>
            <span class="material-symbols-outlined">expand_more</span>
          </button>
          <p v-if="showBackButton" class="chat-page__status">
            {{ chatSubtitle }}
          </p>
          <p v-else-if="!usesUnifiedShell" class="caption">
            Заметки, ссылки и картинки — своя история в каждом чате
          </p>
          <p v-else class="chat-page__status">
            <span class="chat-page__status-dot" />
            {{ isGeneralChat ? 'Общая атмосфера' : 'Тематический чат' }}
          </p>
        </div>
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
    <ChatHeaderMenuModal
      :open="chatHeaderMenuOpen"
      :chat="activeChat ?? null"
      :content-summary="contentSummary"
      @close="chatHeaderMenuOpen = false"
      @updated="onChannelSettingsUpdated"
      @open-settings="
        () => {
          chatHeaderMenuOpen = false;
          channelSettingsOpen = true;
        }
      "
    />
    <ForwardMessageModal
      :open="forwardModalOpen"
      :exclude-chat-id="resolvedChatId"
      @close="forwardModalOpen = false"
      @forward="onForwardToChat"
    />
    <MessageContextMenu
      :open="contextMenu.open"
      :x="contextMenu.x"
      :y="contextMenu.y"
      @close="closeContextMenu"
      @select="onContextMenuSelectAction"
    />

    <div class="chat-page__layout">
      <ChatChannelPanel
        :activity="channelActivity"
        :loading="channelLoading"
      />

      <div
        ref="chatFeedRef"
        class="chat-page__feed"
        :class="{
          'chat-page__feed--selection-open': isDesktopShell && isSelectionMode,
          'chat-page__feed--selection-error':
            isDesktopShell && isSelectionMode && (selectionError || limitNotice),
        }"
        @click="onFeedClick"
      >
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
            :selected="isSelected(message.id)"
            :selection-mode="isSelectionMode"
            :desktop-select-enabled="isDesktopShell"
            @updated="onMessageUpdated"
            @deleted="onMessageDeleted"
            @replayed="loadReplayContext"
            @message-mousedown="handleMessageMouseDown"
            @message-click="handleMessageClick"
            @message-enter="handleMessageEnter"
            @context-menu="onMessageContextMenu"
            @checkbox-click="handleCheckboxClick"
          />
        </div>

        <div v-if="isDesktopShell && isSelectionMode" class="chat-page__selection-dock">
          <p v-if="selectionError" class="chat-page__selection-error">{{ selectionError }}</p>
          <MessageSelectionBar
            :count="selectedCount"
            :limit-notice="limitNotice"
            @forward="onSelectionForward"
            @delete="onSelectionDelete"
            @copy="onSelectionCopy"
            @cancel="clearMessageSelection"
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
