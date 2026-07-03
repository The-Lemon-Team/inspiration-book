<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { chatsApi } from '@/api/chats';
import { useChatsStore } from '@/stores/chats';
import type { Chat, UpwardGrant } from '@/types';

const props = defineProps<{
  chat: Chat;
  grants: UpwardGrant[];
}>();

const emit = defineEmits<{
  close: [];
  updated: [];
  selectChat: [chatId: string];
}>();

const chats = useChatsStore();
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const selectedParentId = ref('');
const newGroupName = ref('');

const isGeneral = computed(() => props.chat.kind === 'GENERAL');

const chatRoute = computed(() =>
  props.chat.kind === 'GENERAL' ? '/chats/general' : `/chats/${props.chat.id}`,
);

const kindLabel = computed(() => {
  if (props.chat.kind === 'GENERAL') return 'general';
  return props.chat.parentChatId ? 'дочерний' : 'самостоятельный';
});

const candidates = computed(() =>
  chats.allChats.filter(
    (item) =>
      item.id !== props.chat.id &&
      item.kind !== 'GENERAL' &&
      item.id !== props.chat.parentChatId,
  ),
);

const currentParentName = computed(() => props.chat.parentChat?.name ?? 'Не связана');

const childChats = computed(() =>
  chats.allChats.filter((item) => item.parentChatId === props.chat.id),
);

const grantsFrom = computed(() =>
  props.grants.filter((grant) => grant.fromChatId === props.chat.id),
);

const grantsTo = computed(() =>
  props.grants.filter((grant) => grant.toChatId === props.chat.id),
);

function chatNameById(chatId: string) {
  return chats.allChats.find((item) => item.id === chatId)?.name ?? 'Чат';
}

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    await chats.load(true);
    selectedParentId.value = props.chat.parentChatId ?? '';
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить данные';
  } finally {
    loading.value = false;
  }
}

async function saveParent() {
  if (isGeneral.value) return;
  saving.value = true;
  error.value = '';
  try {
    await chatsApi.setParent(props.chat.id, selectedParentId.value || null);
    await chats.load(true);
    emit('updated');
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось сохранить связь';
  } finally {
    saving.value = false;
  }
}

async function createGroupAndLink() {
  if (isGeneral.value) return;
  const name = newGroupName.value.trim();
  if (!name) return;

  saving.value = true;
  error.value = '';
  try {
    const created = await chats.createChat(name);
    await chatsApi.setParent(props.chat.id, created.id);
    newGroupName.value = '';
    await chats.load(true);
    selectedParentId.value = created.id;
    emit('updated');
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось создать группу';
  } finally {
    saving.value = false;
  }
}

async function removeGrant(grantId: string) {
  saving.value = true;
  error.value = '';
  try {
    await chatsApi.deleteUpwardGrant(grantId);
    emit('updated');
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось удалить grant';
  } finally {
    saving.value = false;
  }
}

watch(
  () => props.chat.id,
  () => {
    void loadData();
  },
  { immediate: true },
);
</script>

<template>
  <aside class="graph-node-panel" role="dialog" aria-labelledby="graph-node-panel-title">
    <header class="graph-node-panel__head">
      <div class="graph-node-panel__head-main">
        <p class="graph-node-panel__eyebrow">{{ kindLabel }}</p>
        <h2 id="graph-node-panel-title" class="graph-node-panel__title">{{ chat.name }}</h2>
      </div>
      <button type="button" class="graph-node-panel__close" aria-label="Закрыть" @click="emit('close')">
        <span class="material-symbols-outlined">close</span>
      </button>
    </header>

    <div class="graph-node-panel__body">
      <div class="graph-node-panel__actions">
        <RouterLink :to="chatRoute" class="graph-node-panel__action-btn">
          <span class="material-symbols-outlined">open_in_new</span>
          Открыть чат
        </RouterLink>
      </div>

      <section class="graph-node-panel__section">
        <h3 class="graph-node-panel__section-title">Родительская группа</h3>
        <p class="caption">Сейчас: <strong>{{ currentParentName }}</strong></p>

        <div v-if="loading" class="caption">Загрузка…</div>
        <template v-else>
          <label class="graph-node-panel__field">
            <span class="graph-node-panel__label">Группа</span>
            <select
              v-model="selectedParentId"
              class="graph-node-panel__input"
              :disabled="saving || isGeneral"
            >
              <option value="">Не связана</option>
              <option v-for="item in candidates" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </label>
          <button
            type="button"
            class="btn-secondary"
            :disabled="saving || isGeneral"
            @click="saveParent"
          >
            Сохранить связь
          </button>
        </template>
      </section>

      <section v-if="!isGeneral" class="graph-node-panel__section">
        <h3 class="graph-node-panel__section-title">Новая группа</h3>
        <p class="caption">Создаст чат-группу и привяжет текущий чат к ней.</p>
        <div class="graph-node-panel__inline-form">
          <input
            v-model="newGroupName"
            type="text"
            class="graph-node-panel__input"
            placeholder="Например: Видео канал"
            :disabled="saving"
          />
          <button
            type="button"
            class="btn-primary"
            :disabled="saving || !newGroupName.trim()"
            @click="createGroupAndLink"
          >
            Создать
          </button>
        </div>
      </section>

      <section v-if="childChats.length > 0" class="graph-node-panel__section">
        <h3 class="graph-node-panel__section-title">Дочерние чаты</h3>
        <ul class="graph-node-panel__list">
          <li v-for="child in childChats" :key="child.id">
            <button type="button" class="graph-node-panel__list-btn" @click="emit('selectChat', child.id)">
              {{ child.name }}
            </button>
          </li>
        </ul>
      </section>

      <section v-if="grantsFrom.length > 0 || grantsTo.length > 0" class="graph-node-panel__section">
        <h3 class="graph-node-panel__section-title">Upward grants</h3>
        <ul class="graph-node-panel__list">
          <li v-for="grant in grantsFrom" :key="grant.id" class="graph-node-panel__grant">
            <button type="button" class="graph-node-panel__list-btn" @click="emit('selectChat', grant.toChatId)">
              → {{ chatNameById(grant.toChatId) }}
            </button>
            <button
              type="button"
              class="graph-node-panel__icon-btn"
              :disabled="saving"
              aria-label="Удалить grant"
              @click="removeGrant(grant.id)"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </li>
          <li v-for="grant in grantsTo" :key="`in:${grant.id}`" class="graph-node-panel__grant">
            <button type="button" class="graph-node-panel__list-btn" @click="emit('selectChat', grant.fromChatId)">
              ← {{ chatNameById(grant.fromChatId) }}
            </button>
          </li>
        </ul>
      </section>

      <p v-if="error" class="graph-node-panel__error">{{ error }}</p>
    </div>
  </aside>
</template>
