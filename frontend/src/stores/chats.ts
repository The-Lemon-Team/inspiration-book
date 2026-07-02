import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { chatsApi } from '@/api/chats';
import type { Chat, ChatCollection, ChatListResponse } from '@/types';

export const useChatsStore = defineStore('chats', () => {
  const general = ref<Chat | null>(null);
  const collections = ref<ChatCollection[]>([]);
  const standalone = ref<Chat[]>([]);
  const loading = ref(false);
  const loaded = ref(false);

  const allChats = computed(() => {
    const fromCollections = collections.value.flatMap((collection) => collection.chats ?? []);
    const chats = [
      ...(general.value ? [general.value] : []),
      ...standalone.value,
      ...fromCollections,
    ];
    const seen = new Set<string>();
    return chats.filter((chat) => {
      if (seen.has(chat.id)) return false;
      seen.add(chat.id);
      return true;
    });
  });

  function applyList(data: ChatListResponse) {
    general.value = data.general;
    collections.value = data.collections;
    standalone.value = data.standalone;
    loaded.value = true;
  }

  async function load(force = false) {
    if (loaded.value && !force) return;
    loading.value = true;
    try {
      applyList(await chatsApi.list());
    } finally {
      loading.value = false;
    }
  }

  async function createCollection(name: string) {
    const collection = await chatsApi.createCollection(name);
    collections.value = [...collections.value, { ...collection, chats: [] }];
    return collection;
  }

  async function createChat(name: string, collectionId?: string) {
    const chat = await chatsApi.createChat(name, collectionId);
    if (collectionId) {
      collections.value = collections.value.map((collection) =>
        collection.id === collectionId
          ? { ...collection, chats: [...(collection.chats ?? []), chat] }
          : collection,
      );
    } else {
      standalone.value = [...standalone.value, chat];
    }
    return chat;
  }

  function chatById(chatId: string) {
    return allChats.value.find((chat) => chat.id === chatId) ?? null;
  }

  async function setPinned(chatId: string, pinned: boolean) {
    await chatsApi.setPin(chatId, pinned);
    await load(true);
  }

  async function reorderChats(chatIds: string[]) {
    if (!chatIds.length) return;
    applyList(await chatsApi.reorder(chatIds));
  }

  return {
    general,
    collections,
    standalone,
    allChats,
    loading,
    loaded,
    load,
    createCollection,
    createChat,
    chatById,
    setPinned,
    reorderChats,
  };
});
