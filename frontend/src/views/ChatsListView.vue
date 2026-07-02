<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useChatsStore } from '@/stores/chats';
import type { Chat, ChatCollection } from '@/types';

const chats = useChatsStore();
const busy = ref(false);

type ChatListItem = {
  chat: Chat;
  title: string;
  subtitle: string;
  time: string;
  badge: number;
  pinned: boolean;
  canManage: boolean;
};

const chatItems = computed<ChatListItem[]>(() => {
  const all = chats.allChats.slice();
  all.sort((a, b) => {
    const aPinned = a.isPinned ? 1 : 0;
    const bPinned = b.isPinned ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    const aTs = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTs = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTs - aTs;
  });

  const childCountByParent = new Map<string, number>();
  for (const item of all) {
    if (!item.parentChatId) continue;
    childCountByParent.set(
      item.parentChatId,
      (childCountByParent.get(item.parentChatId) ?? 0) + 1,
    );
  }

  return all.map((chat) => {
    const collectionName = chat.collection?.name;
    const isGeneral = chat.kind === 'GENERAL';
    const isChild = Boolean(chat.parentChatId);
    const canManage = !isGeneral && !chat.collectionId && !chat.parentChatId;
    const childCount = childCountByParent.get(chat.id) ?? 0;
    const badge = childCount > 0 ? childCount : 0;

    return {
      chat,
      title: isGeneral ? 'Saved Messages' : chat.name,
      subtitle: isGeneral
        ? 'вместе с абстракциями ещё и'
        : isChild
          ? 'дочерний канал · linked to hierarchy'
          : collectionName
            ? `${collectionName} · независимая группа`
            : 'самостоятельный чат',
      time: formatChatTime(chat.createdAt),
      badge,
      pinned: Boolean(chat.isPinned) || isGeneral,
      canManage,
    };
  });
});

type CollectionSection = {
  collection: ChatCollection;
  items: ChatListItem[];
};

const generalItem = computed<ChatListItem | null>(
  () => chatItems.value.find((item) => item.chat.kind === 'GENERAL') ?? null,
);

const collectionSections = computed<CollectionSection[]>(() =>
  chats.collections.map((collection) => ({
    collection,
    items: chatItems.value.filter((item) => item.chat.collectionId === collection.id),
  })),
);

const standaloneItems = computed<ChatListItem[]>(() =>
  chatItems.value.filter((item) => item.chat.kind !== 'GENERAL' && !item.chat.collectionId),
);

const dragChatId = ref<string | null>(null);
const savingOrder = ref(false);

function routeForChat(chat: Chat) {
  return chat.kind === 'GENERAL' ? '/chats/general' : `/chats/${chat.id}`;
}

async function togglePinned(item: ChatListItem) {
  if (!item.canManage || savingOrder.value) return;
  savingOrder.value = true;
  try {
    await chats.setPinned(item.chat.id, !item.pinned);
  } finally {
    savingOrder.value = false;
  }
}

function onDragStart(item: ChatListItem) {
  if (!item.canManage) return;
  dragChatId.value = item.chat.id;
}

function onDragOver(item: ChatListItem, event: DragEvent) {
  if (!item.canManage || !dragChatId.value || dragChatId.value === item.chat.id) return;
  event.preventDefault();
}

async function onDrop(item: ChatListItem, event: DragEvent) {
  event.preventDefault();
  const activeId = dragChatId.value;
  dragChatId.value = null;
  if (!activeId || activeId === item.chat.id) return;

  const manageable = chatItems.value.filter((entry) => entry.canManage);
  const from = manageable.findIndex((entry) => entry.chat.id === activeId);
  const to = manageable.findIndex((entry) => entry.chat.id === item.chat.id);
  if (from < 0 || to < 0) return;

  const reordered = manageable.slice();
  const [moved] = reordered.splice(from, 1);
  reordered.splice(to, 0, moved);

  savingOrder.value = true;
  try {
    await chats.reorderChats(reordered.map((entry) => entry.chat.id));
  } finally {
    savingOrder.value = false;
  }
}

function onDragEnd() {
  dragChatId.value = null;
}

function formatChatTime(value?: string) {
  if (!value) return '--:--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function avatarText(chat: Chat) {
  if (chat.kind === 'GENERAL') return '🔖';
  const first = chat.name.trim().charAt(0).toUpperCase();
  return first || '💬';
}

async function createCollection() {
  const name = window.prompt('Название группы');
  if (!name?.trim()) return;
  busy.value = true;
  try {
    await chats.createCollection(name.trim());
  } finally {
    busy.value = false;
  }
}

async function createChat(collectionId?: string) {
  const name = window.prompt('Название чата');
  if (!name?.trim()) return;
  busy.value = true;
  try {
    await chats.createChat(name.trim(), collectionId);
  } finally {
    busy.value = false;
  }
}

onMounted(() => {
  chats.load(true);
});
</script>

<template>
  <section class="chats-list-page">
    <header class="chats-list-page__header">
      <h2 class="chats-list-page__title">Чаты</h2>
      <div class="chats-list-page__actions">
        <button type="button" class="btn-secondary" :disabled="busy" @click="createCollection">
          + Группа
        </button>
        <button type="button" class="btn-primary" :disabled="busy" @click="createChat()">
          + Чат
        </button>
      </div>
    </header>

    <div v-if="generalItem" class="tg-chat-list">
      <article class="tg-chat-row" :class="{ 'tg-chat-row--pinned': generalItem.pinned }">
        <RouterLink :to="routeForChat(generalItem.chat)" class="tg-chat-row__main">
          <div class="tg-chat-row__avatar">{{ avatarText(generalItem.chat) }}</div>
          <div class="tg-chat-row__body">
            <div class="tg-chat-row__top">
              <h3 class="tg-chat-row__title">{{ generalItem.title }}</h3>
              <time class="tg-chat-row__time">{{ generalItem.time }}</time>
            </div>
            <div class="tg-chat-row__bottom">
              <p class="tg-chat-row__preview">{{ generalItem.subtitle }}</p>
              <span v-if="generalItem.badge > 0" class="tg-chat-row__badge">{{ generalItem.badge }}</span>
            </div>
          </div>
        </RouterLink>
      </article>
    </div>

    <section
      v-for="section in collectionSections"
      :key="section.collection.id"
      class="tg-collection-section"
    >
      <header class="tg-collection-section__header">
        <h3 class="tg-collection-section__title">{{ section.collection.name }}</h3>
        <button
          type="button"
          class="btn-secondary tg-collection-section__action"
          :disabled="busy"
          @click="createChat(section.collection.id)"
        >
          + Чат
        </button>
      </header>

      <div class="tg-chat-list">
        <article
          v-for="item in section.items"
          :key="item.chat.id"
          class="tg-chat-row"
          :class="{ 'tg-chat-row--pinned': item.pinned }"
        >
          <RouterLink :to="routeForChat(item.chat)" class="tg-chat-row__main">
            <div class="tg-chat-row__avatar">{{ avatarText(item.chat) }}</div>
            <div class="tg-chat-row__body">
              <div class="tg-chat-row__top">
                <h3 class="tg-chat-row__title">{{ item.title }}</h3>
                <time class="tg-chat-row__time">{{ item.time }}</time>
              </div>
              <div class="tg-chat-row__bottom">
                <p class="tg-chat-row__preview">{{ item.subtitle }}</p>
                <span v-if="item.badge > 0" class="tg-chat-row__badge">{{ item.badge }}</span>
              </div>
            </div>
          </RouterLink>
        </article>
        <p v-if="section.items.length === 0" class="tg-chat-list__empty">В этой группе пока нет чатов</p>
      </div>
    </section>

    <div class="tg-chat-list">
      <article
        v-for="item in standaloneItems"
        :key="item.chat.id"
        class="tg-chat-row"
        :class="{
          'tg-chat-row--pinned': item.pinned,
          'tg-chat-row--dragging': dragChatId === item.chat.id,
          'tg-chat-row--draggable': item.canManage,
        }"
        :draggable="item.canManage && !savingOrder"
        @dragstart="onDragStart(item)"
        @dragover="onDragOver(item, $event)"
        @drop="onDrop(item, $event)"
        @dragend="onDragEnd"
      >
        <RouterLink :to="routeForChat(item.chat)" class="tg-chat-row__main">
          <div class="tg-chat-row__avatar">{{ avatarText(item.chat) }}</div>
          <div class="tg-chat-row__body">
            <div class="tg-chat-row__top">
              <h3 class="tg-chat-row__title">{{ item.title }}</h3>
              <time class="tg-chat-row__time">{{ item.time }}</time>
            </div>
            <div class="tg-chat-row__bottom">
              <p class="tg-chat-row__preview">{{ item.subtitle }}</p>
              <span v-if="item.badge > 0" class="tg-chat-row__badge">{{ item.badge }}</span>
            </div>
          </div>
        </RouterLink>
        <div v-if="item.canManage" class="tg-chat-row__actions">
          <button
            type="button"
            class="tg-chat-row__icon-btn"
            :disabled="savingOrder"
            :title="item.pinned ? 'Открепить чат' : 'Закрепить чат'"
            @click="togglePinned(item)"
          >
            <span class="material-symbols-outlined">
              {{ item.pinned ? 'keep_off' : 'keep' }}
            </span>
          </button>
          <span class="material-symbols-outlined">drag_indicator</span>
        </div>
      </article>
      <p v-if="standaloneItems.length === 0" class="tg-chat-list__empty">Нет отдельных чатов</p>
    </div>
  </section>
</template>
