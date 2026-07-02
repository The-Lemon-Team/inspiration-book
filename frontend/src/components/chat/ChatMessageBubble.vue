<script setup lang="ts">
import { computed, ref } from 'vue';
import { api } from '@/api/client';
import PublishMessageModal from '@/components/chat/PublishMessageModal.vue';
import { BlockMessage } from '@/blocks';
import type { Message, UpwardTarget } from '@/types';
import { messageAuthorLabel, tagStyle } from '@/types';
import { getMessagePublishState } from '@/utils/message-publish';

const props = defineProps<{
  message: Message;
  upwardTargets?: UpwardTarget[];
  hasChildren?: boolean;
}>();

const emit = defineEmits<{
  updated: [message: Message];
  deleted: [messageId: string];
  replayed: [];
}>();

const publishModalOpen = ref(false);
const busy = ref(false);
const actionError = ref('');

const publishState = computed(() => getMessagePublishState(props.message));
const authorLabel = computed(() => messageAuthorLabel(props.message));

const flowBadge = computed(() => {
  const meta = props.message.flowMeta;
  if (!meta?.kind) return null;
  if (meta.kind === 'SCHEDULED_DIGEST') {
    return `авто-сводка · #${meta.signalTagName ?? 'тег'} · ${meta.localDate ?? ''}`.trim();
  }
  if (!meta.sourceChatName) return null;
  if (meta.kind === 'REPLAY_DOWN') {
    return `из канала «${meta.sourceChatName}»`;
  }
  return `из «${meta.sourceChatName}»`;
});

const canShareToGeneral = computed(
  () => props.message.chat?.kind && props.message.chat.kind !== 'GENERAL',
);

const canReplayDown = computed(
  () => props.hasChildren && props.message.chat?.kind !== 'GENERAL',
);

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function openPublishModal() {
  actionError.value = '';
  publishModalOpen.value = true;
}

async function onPublish(tagId: string) {
  busy.value = true;
  actionError.value = '';

  try {
    const updated = await api.publishMessage(props.message.id, tagId);
    emit('updated', updated);
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Не удалось опубликовать';
  } finally {
    busy.value = false;
  }
}

async function unpublish() {
  busy.value = true;
  actionError.value = '';

  try {
    const tagId = publishState.value.tag?.id ?? props.message.entries[0]?.tag.id;
    if (!tagId) return;

    const updated = await api.publishMessage(props.message.id, tagId, false);
    emit('updated', updated);
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Не удалось снять с публикации';
  } finally {
    busy.value = false;
  }
}

async function replayUp(target: UpwardTarget) {
  busy.value = true;
  actionError.value = '';

  try {
    await api.replayMessage(props.message.id, 'UP', target.chatId);
    emit('replayed');
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Не удалось отправить в канал';
  } finally {
    busy.value = false;
  }
}

async function replayDown() {
  if (
    !window.confirm(
      'Разослать это сообщение во все дочерние чаты?',
    )
  ) {
    return;
  }

  busy.value = true;
  actionError.value = '';

  try {
    const result = await api.replayMessage(props.message.id, 'DOWN');
    const count = 'count' in result ? result.count : 1;
    emit('replayed');
    window.alert(`Отправлено в ${count} чат(ов)`);
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Не удалось разослать';
  } finally {
    busy.value = false;
  }
}

async function shareToGeneral() {
  busy.value = true;
  actionError.value = '';

  try {
    await api.shareMessageToGeneral(props.message.id);
    emit('replayed');
    window.alert('Сообщение отправлено в general');
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Не удалось отправить в general';
  } finally {
    busy.value = false;
  }
}

async function removeMessage() {
  if (
    !window.confirm(
      'Удалить это сообщение и все связанные записи? Это действие нельзя отменить.',
    )
  ) {
    return;
  }

  busy.value = true;
  actionError.value = '';

  try {
    await api.deleteMessage(props.message.id);
    emit('deleted', props.message.id);
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : 'Не удалось удалить';
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <article class="chat-message">
    <div class="chat-message__avatar" aria-hidden="true">
      <span class="material-symbols-outlined">person</span>
    </div>
    <div class="chat-message__body">
      <header class="chat-message__header">
        <span class="chat-message__author">{{ authorLabel }}</span>
        <time class="chat-message__time">{{ formatTime(message.createdAt) }}</time>
      </header>

      <p v-if="flowBadge" class="chat-message__flow-badge caption">
        <span class="material-symbols-outlined">sync_alt</span>
        {{ flowBadge }}
      </p>

      <BlockMessage :raw-text="message.rawText" :content="message.content" />
      <footer class="chat-message__footer">
        <div class="chat-message__controls">
          <span
            v-if="publishState.status === 'published' && publishState.tag"
            class="chat-message__badge"
            :style="{
              color: tagStyle(publishState.tag.color).badgeColor,
              background: tagStyle(publishState.tag.color).badgeBackground,
            }"
          >
            <span class="material-symbols-outlined">public</span>
            {{ publishState.tag.name }}
          </span>

          <button
            v-if="publishState.status === 'private'"
            type="button"
            class="chat-message__action"
            :disabled="busy"
            @click="openPublishModal"
          >
            <span class="material-symbols-outlined">upload</span>
            Опубликовать
          </button>

          <template v-else>
            <button
              type="button"
              class="chat-message__action"
              :disabled="busy"
              @click="openPublishModal"
            >
              <span class="material-symbols-outlined">edit</span>
              Группа
            </button>
            <button
              type="button"
              class="chat-message__action chat-message__action--muted"
              :disabled="busy"
              @click="unpublish"
            >
              <span class="material-symbols-outlined">visibility_off</span>
              Снять
            </button>
          </template>

          <button
            v-for="target in upwardTargets ?? []"
            :key="target.chatId"
            type="button"
            class="chat-message__action"
            :disabled="busy"
            @click="replayUp(target)"
          >
            <span class="material-symbols-outlined">north</span>
            {{ target.chatName }}
          </button>

          <button
            v-if="canReplayDown"
            type="button"
            class="chat-message__action"
            :disabled="busy"
            @click="replayDown"
          >
            <span class="material-symbols-outlined">south</span>
            Детям
          </button>

          <button
            v-if="canShareToGeneral"
            type="button"
            class="chat-message__action"
            :disabled="busy"
            @click="shareToGeneral"
          >
            <span class="material-symbols-outlined">forward</span>
            general
          </button>

          <button
            type="button"
            class="chat-message__action chat-message__action--danger"
            :disabled="busy"
            aria-label="Удалить сообщение"
            @click="removeMessage"
          >
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </footer>
      <p v-if="actionError" class="chat-message__error">{{ actionError }}</p>
    </div>

    <PublishMessageModal
      :open="publishModalOpen"
      :message-id="message.id"
      :initial-tag-id="publishState.tag?.id"
      @close="publishModalOpen = false"
      @publish="onPublish"
    />
  </article>
</template>
