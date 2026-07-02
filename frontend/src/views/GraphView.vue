<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { chatsApi } from '@/api/chats';
import { useChatsStore } from '@/stores/chats';
import type { Chat, UpwardGrant } from '@/types';

type NodePoint = {
  chat: Chat;
  x: number;
  y: number;
};

type GraphEdge = {
  id: string;
  kind: 'parent' | 'grant';
  sourceId: string;
  targetId: string;
  source: NodePoint;
  target: NodePoint;
};

const chats = useChatsStore();
const grants = ref<UpwardGrant[]>([]);
const busy = ref(false);
const error = ref('');
const editMode = ref(false);
const connectMode = ref<'parent' | 'grant'>('parent');
const pendingSource = ref<Chat | null>(null);
const selectedEdgeId = ref<string | null>(null);

const nodes = computed<NodePoint[]>(() => {
  const all = chats.allChats;
  if (all.length === 0) return [];

  const general = all.find((chat) => chat.kind === 'GENERAL') ?? null;
  const regular = all.filter((chat) => chat.kind !== 'GENERAL');
  const radiusX = 330;
  const radiusY = 190;

  const points: NodePoint[] = [];
  if (general) {
    points.push({ chat: general, x: 420, y: 70 });
  }

  regular.forEach((chat, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(regular.length, 1) - Math.PI / 2;
    points.push({
      chat,
      x: 420 + Math.cos(angle) * radiusX,
      y: 280 + Math.sin(angle) * radiusY,
    });
  });

  return points;
});

const pointByChatId = computed(
  () => new Map(nodes.value.map((point) => [point.chat.id, point] as const)),
);

const graphEdges = computed<GraphEdge[]>(() => {
  const hierarchy = nodes.value
    .filter((point) => point.chat.parentChatId)
    .map((point) => {
      const source = pointByChatId.value.get(point.chat.id);
      const target = pointByChatId.value.get(point.chat.parentChatId!);
      if (!source || !target) return null;
      return {
        id: `parent:${point.chat.id}->${point.chat.parentChatId}`,
        kind: 'parent' as const,
        sourceId: source.chat.id,
        targetId: target.chat.id,
        source,
        target,
      };
    })
    .filter((edge) => Boolean(edge)) as GraphEdge[];

  const grantEdges = grants.value
    .map((grant) => {
      const source = pointByChatId.value.get(grant.fromChatId);
      const target = pointByChatId.value.get(grant.toChatId);
      if (!source || !target) return null;
      return {
        id: `grant:${grant.id}`,
        kind: 'grant' as const,
        sourceId: source.chat.id,
        targetId: target.chat.id,
        source,
        target,
      };
    })
    .filter((edge) => Boolean(edge)) as GraphEdge[];

  return [...hierarchy, ...grantEdges];
});

const selectedEdge = computed(() =>
  graphEdges.value.find((edge) => edge.id === selectedEdgeId.value) ?? null,
);

const collectionGroups = computed(() =>
  chats.collections
    .map((collection) => ({
      name: collection.name,
      chats: (collection.chats ?? []).map((chat) => chat.name),
    }))
    .filter((collection) => collection.chats.length > 0),
);

const allChatsList = computed(() =>
  chats.allChats
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    .map((chat) => ({
      id: chat.id,
      name: chat.name,
      kind: chat.kind,
      parentChatId: chat.parentChatId ?? null,
    })),
);

async function loadGraph() {
  busy.value = true;
  error.value = '';
  try {
    await chats.load(true);
    grants.value = await chatsApi.getUpwardGrants();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить граф';
  } finally {
    busy.value = false;
  }
}

function resetComposer() {
  pendingSource.value = null;
}

function onNodeClick(chat: Chat) {
  if (!editMode.value) return;

  if (!pendingSource.value) {
    pendingSource.value = chat;
    return;
  }

  if (pendingSource.value.id === chat.id) {
    resetComposer();
    return;
  }

  void connectNodes(pendingSource.value, chat);
}

async function connectNodes(source: Chat, target: Chat) {
  busy.value = true;
  error.value = '';
  try {
    if (connectMode.value === 'parent') {
      if (source.kind === 'GENERAL') {
        throw new Error('general не может быть дочерним в иерархии');
      }
      await chatsApi.setParent(source.id, target.id);
    } else {
      await chatsApi.createUpwardGrant(source.id, target.id);
    }
    await loadGraph();
    resetComposer();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось создать связь';
  } finally {
    busy.value = false;
  }
}

async function deleteSelectedEdge() {
  if (!selectedEdge.value) return;

  busy.value = true;
  error.value = '';
  try {
    if (selectedEdge.value.kind === 'parent') {
      await chatsApi.setParent(selectedEdge.value.sourceId, null);
    } else {
      const grantId = selectedEdge.value.id.split(':')[1];
      await chatsApi.deleteUpwardGrant(grantId);
    }
    selectedEdgeId.value = null;
    await loadGraph();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось удалить связь';
  } finally {
    busy.value = false;
  }
}

onMounted(() => {
  void loadGraph();
});
</script>

<template>
  <section class="page page--wide">
    <header class="page-hero">
      <h2 class="page-title">Graph View</h2>
      <p class="caption">
        MVP визуального редактора: соединяйте чаты и удаляйте связи прямо на графе.
      </p>
      <div class="graph-toolbar">
        <button type="button" class="btn-secondary" @click="editMode = !editMode">
          {{ editMode ? 'Завершить редактирование' : 'Редактировать связи' }}
        </button>
        <select v-if="editMode" v-model="connectMode">
          <option value="parent">parent-child</option>
          <option value="grant">upward grant</option>
        </select>
        <button
          v-if="editMode && selectedEdge"
          type="button"
          class="btn-secondary"
          :disabled="busy"
          @click="deleteSelectedEdge"
        >
          Удалить выбранную связь
        </button>
        <button v-if="editMode && pendingSource" type="button" class="btn-secondary" @click="resetComposer">
          Сбросить выбор
        </button>
      </div>
      <p v-if="editMode" class="caption">
        1) Кликните исходный чат, 2) кликните целевой чат. Для parent-child: исходный = дочерний, целевой = родитель.
      </p>
      <p v-if="pendingSource" class="caption">
        Выбран исходный чат: <strong>{{ pendingSource.name }}</strong>
      </p>
      <p v-if="error" class="groups-error">{{ error }}</p>
    </header>

    <div class="graph-stage">
      <svg class="graph-stage__svg" viewBox="0 0 840 560" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker
            id="graphArrow"
            markerWidth="8"
            markerHeight="8"
            refX="6.5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L7,3 L0,6 Z" fill="#8b7cf8" />
          </marker>
        </defs>

        <line
          v-for="edge in graphEdges"
          :key="edge.id"
          :x1="edge.source.x"
          :y1="edge.source.y"
          :x2="edge.target.x"
          :y2="edge.target.y"
          class="graph-stage__edge"
          :class="{
            'graph-stage__edge--grant': edge.kind === 'grant',
            'graph-stage__edge--selected': edge.id === selectedEdgeId,
          }"
          marker-end="url(#graphArrow)"
          @click.stop="editMode ? (selectedEdgeId = edge.id) : null"
        />
      </svg>

      <RouterLink
        v-for="point in nodes"
        :key="point.chat.id"
        class="graph-node"
        :class="{
          'graph-node--general': point.chat.kind === 'GENERAL',
          'graph-node--child': point.chat.parentChatId,
          'graph-node--pending': pendingSource?.id === point.chat.id,
        }"
        :style="{ left: `${point.x}px`, top: `${point.y}px` }"
        :to="point.chat.kind === 'GENERAL' ? '/chats/general' : `/chats/${point.chat.id}`"
        @click.prevent="onNodeClick(point.chat)"
      >
        <span class="graph-node__title">{{ point.chat.name }}</span>
        <span class="graph-node__meta">
          {{ point.chat.parentChatId ? 'дочерний' : 'самостоятельный' }}
        </span>
      </RouterLink>
    </div>

    <section class="groups-block">
      <h3 class="groups-block__title">Независимые группы (журналы)</h3>
      <div v-if="collectionGroups.length === 0" class="page-state page-state--empty">
        <p class="caption">Пока нет журналов с чатами</p>
      </div>
      <div v-else class="groups-grid">
        <article v-for="group in collectionGroups" :key="group.name" class="groups-card">
          <h4 class="groups-card__title">{{ group.name }}</h4>
          <p class="caption">{{ group.chats.join(' · ') }}</p>
        </article>
      </div>
    </section>

    <section class="groups-block">
      <h3 class="groups-block__title">Все чаты</h3>
      <ul class="groups-ungrouped">
        <li v-for="chat in allChatsList" :key="chat.id" class="groups-ungrouped__item">
          <RouterLink :to="chat.kind === 'GENERAL' ? '/chats/general' : `/chats/${chat.id}`">
            {{ chat.name }}
          </RouterLink>
          <span class="caption">
            {{
              chat.kind === 'GENERAL'
                ? 'general'
                : chat.parentChatId
                  ? 'дочерний'
                  : 'самостоятельный'
            }}
          </span>
        </li>
      </ul>
    </section>
  </section>
</template>
