<script setup lang="ts">
import { provide } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import ChatFoldersRail from '@/components/chats/ChatFoldersRail.vue';
import ChatListPanel from '@/components/chats/ChatListPanel.vue';
import { useChatsLayout } from '@/composables/useChatsLayout';
import { useShellMode } from '@/composables/useShellMode';

const router = useRouter();
const { usesUnifiedShell } = useShellMode();
const {
  effectiveMode,
  showList,
  showChat,
  showChatPlaceholder,
  showBackButton,
} = useChatsLayout();

function goBackToList() {
  router.push({ name: 'chats-list' });
}

provide('chatsLayout', {
  showBackButton,
  goBackToList,
});
</script>

<template>
  <section
    class="chats-layout"
    :class="{
      'chats-layout--three': effectiveMode === 'three',
      'chats-layout--two': effectiveMode === 'two',
      'chats-layout--chat-open': showChat,
    }"
  >
    <ChatFoldersRail v-if="!usesUnifiedShell" />

    <div
      v-show="showList"
      class="chats-layout__list"
    >
      <ChatListPanel />
    </div>

    <Transition :name="effectiveMode === 'two' ? 'chat-slide' : 'chat-none'">
      <div
        v-if="showChat"
        class="chats-layout__chat"
      >
        <RouterView />
      </div>
    </Transition>

    <div
      v-if="showChatPlaceholder"
      class="chats-layout__placeholder"
    >
      <span class="material-symbols-outlined chats-layout__placeholder-icon">forum</span>
      <p class="chats-layout__placeholder-title">Выберите чат</p>
      <p class="chats-layout__placeholder-hint caption">
        Откройте чат из списка слева, чтобы читать и писать сообщения
      </p>
    </div>
  </section>
</template>
