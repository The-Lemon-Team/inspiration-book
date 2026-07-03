<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { chatsApi } from '@/api/chats';
import { useChatsStore } from '@/stores/chats';
import type { Chat } from '@/types';

type HierarchyGroup = {
  parent: Chat;
  children: Chat[];
};

type GroupTile = {
  id: string;
  title: string;
  icon: string;
  tone: 'collection' | 'hierarchy';
  parent?: Chat;
  attachedChats: Chat[];
};

const chats = useChatsStore();
const busy = ref(false);
const error = ref('');

const collectionGroups = computed(() => chats.collections);
const hierarchyGroups = computed<HierarchyGroup[]>(() => {
  const byParent = new Map<string, Chat[]>();
  for (const chat of chats.allChats) {
    if (!chat.parentChatId) continue;
    const bucket = byParent.get(chat.parentChatId) ?? [];
    bucket.push(chat);
    byParent.set(chat.parentChatId, bucket);
  }

  return Array.from(byParent.entries())
    .map(([parentId, children]) => {
      const parent = chats.chatById(parentId);
      if (!parent) return null;
      return { parent, children };
    })
    .filter((group): group is HierarchyGroup => Boolean(group))
    .sort((a, b) => a.parent.name.localeCompare(b.parent.name, 'ru'));
});

const ungroupedChats = computed(() =>
  chats.allChats.filter(
    (chat) =>
      chat.kind !== 'GENERAL' && !chat.collectionId && !chat.parentChatId,
  ),
);

function groupRecency(tile: GroupTile) {
  const latestChat = tile.attachedChats.reduce(
    (latest, chat) => {
      const ts = new Date(chat.lastMessageAt ?? chat.createdAt ?? 0).getTime();
      return ts > latest ? ts : latest;
    },
    0,
  );
  return latestChat;
}

const groupTiles = computed<GroupTile[]>(() => {
  const collectionTiles: GroupTile[] = collectionGroups.value.map((collection) => ({
    id: `collection-${collection.id}`,
    title: collection.name,
    icon: 'folder',
    tone: 'collection',
    attachedChats: collection.chats ?? [],
  }));

  const hierarchyTiles: GroupTile[] = hierarchyGroups.value.map((group) => ({
    id: `hierarchy-${group.parent.id}`,
    title: group.parent.name,
    icon: 'account_tree',
    tone: 'hierarchy',
    parent: group.parent,
    attachedChats: group.children,
  }));

  return [...collectionTiles, ...hierarchyTiles].sort(
    (a, b) => groupRecency(b) - groupRecency(a),
  );
});

async function reload() {
  busy.value = true;
  error.value = '';
  try {
    await chats.load(true);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить группы';
  } finally {
    busy.value = false;
  }
}

function parseSelection(input: string, max: number) {
  const tokens = input
    .split(/[,\s]+/)
    .map((part) => Number.parseInt(part, 10))
    .filter((value) => Number.isFinite(value));
  const selected = new Set<number>();
  for (const token of tokens) {
    if (token >= 1 && token <= max) {
      selected.add(token - 1);
    }
  }
  return Array.from(selected.values());
}

async function createGroup() {
  const name = window.prompt('Название группы');
  if (!name?.trim()) return;

  await chats.load();
  const candidates = chats.allChats.filter((chat) => chat.kind !== 'GENERAL');
  let selectedChatIds: string[] = [];

  if (candidates.length > 0) {
    const listing = candidates
      .map((chat, idx) => `${idx + 1}. ${chat.name}`)
      .join('\n');
    const pick = window.prompt(
      `Выберите чаты для группы «${name.trim()}»:\n${listing}\n\nВведите номера через запятую. Пусто или 0 — независимая группа`,
      '0',
    );

    if (pick === null) return;
    const normalized = pick.trim();
    if (normalized && normalized !== '0') {
      const selectedIndices = parseSelection(normalized, candidates.length);
      if (selectedIndices.length === 0) {
        window.alert('Неверный выбор чатов');
        return;
      }
      selectedChatIds = selectedIndices.map((index) => candidates[index].id);
    }
  }

  busy.value = true;
  error.value = '';
  try {
    if (selectedChatIds.length === 0) {
      await chats.createCollection(name.trim());
      return;
    }

    const parent = await chats.createChat(name.trim());
    await Promise.all(
      selectedChatIds.map((chatId) => chatsApi.setParent(chatId, parent.id)),
    );
    await chats.load(true);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось создать группу';
  } finally {
    busy.value = false;
  }
}

async function attachToParent(child: Chat) {
  const candidates = chats.allChats.filter(
    (chat) =>
      chat.id !== child.id &&
      chat.kind !== 'GENERAL' &&
      chat.id !== child.parentChatId,
  );

  if (candidates.length === 0) {
    window.alert('Нет доступных главных чатов');
    return;
  }

  const listing = candidates
    .map((chat, idx) => `${idx + 1}. ${chat.name}`)
    .join('\n');
  const pick = window.prompt(
    `Выберите главный чат для «${child.name}»:\n${listing}\n\nНомер или 0 — отвязать`,
  );
  if (pick === null) return;

  const index = Number.parseInt(pick, 10);
  const parentId = index === 0 ? null : candidates[index - 1]?.id;
  if (index !== 0 && !parentId) {
    window.alert('Неверный номер');
    return;
  }

  busy.value = true;
  try {
    await chatsApi.setParent(child.id, parentId);
    await chats.load(true);
  } finally {
    busy.value = false;
  }
}

onMounted(() => {
  chats.load();
});
</script>

<template>
  <section class="groups-page">
    <header class="groups-page__header">
      <h2 class="page-title">Группы</h2>
      <p class="caption">
        Создайте группу. Если прикрепить чаты, она станет иерархической.
      </p>
      <div class="groups-actions groups-actions--compact">
        <button type="button" class="btn-primary" :disabled="busy" @click="createGroup">
          + Группа
        </button>
        <button type="button" class="btn-secondary" :disabled="busy" @click="reload">
          Обновить
        </button>
      </div>
    </header>

    <div class="groups-page__scroll">
      <p v-if="error" class="groups-error">{{ error }}</p>

      <section class="groups-block">
      <h3 class="groups-block__title">Список групп</h3>
      <div v-if="groupTiles.length === 0" class="page-state page-state--empty">
        <p class="caption">Пока нет групп. Создайте первую группу.</p>
      </div>
      <div v-else class="groups-unified-list">
        <article
          v-for="tile in groupTiles"
          :key="tile.id"
          class="groups-tile"
          :class="{
            'groups-tile--collection': tile.tone === 'collection',
            'groups-tile--hierarchy': tile.tone === 'hierarchy',
          }"
        >
          <div class="groups-tile__head">
            <span class="material-symbols-outlined groups-tile__icon">{{ tile.icon }}</span>
            <div class="groups-tile__title-wrap">
              <h4 class="groups-tile__title">{{ tile.title }}</h4>
              <p class="groups-tile__subtitle">
                {{
                  tile.tone === 'collection'
                    ? 'Независимая группа'
                    : 'Иерархическая группа'
                }}
              </p>
            </div>
          </div>

          <p v-if="tile.parent" class="groups-tile__parent">
            Главный чат:
            <RouterLink :to="`/chats/${tile.parent.id}`">{{ tile.parent.name }}</RouterLink>
          </p>

          <div class="groups-tile__attached">
            <p class="groups-tile__attached-title">
              <span class="material-symbols-outlined">link</span>
              Прикрепленные чаты
            </p>
            <ul class="groups-tile__attached-list">
              <li v-for="chat in tile.attachedChats" :key="chat.id">
                <RouterLink :to="`/chats/${chat.id}`">{{ chat.name }}</RouterLink>
              </li>
              <li v-if="tile.attachedChats.length === 0" class="caption">— пока пусто —</li>
            </ul>
          </div>
        </article>
      </div>
    </section>

    <section class="groups-block">
      <h3 class="groups-block__title">Свободные чаты</h3>
      <p class="caption">Чаты, которые можно прикрепить к главному чату</p>
      <ul class="groups-ungrouped groups-ungrouped--compact">
        <li v-for="chat in ungroupedChats" :key="chat.id" class="groups-ungrouped__item">
          <RouterLink :to="`/chats/${chat.id}`" class="groups-ungrouped__link">
            <span class="material-symbols-outlined">chat</span>
            {{ chat.name }}
          </RouterLink>
          <button
            type="button"
            class="btn-secondary groups-inline-action"
            :disabled="busy"
            @click="attachToParent(chat)"
          >
            Привязать
          </button>
        </li>
        <li v-if="ungroupedChats.length === 0" class="caption">Все чаты уже в иерархии</li>
      </ul>
    </section>
    </div>
  </section>
</template>
