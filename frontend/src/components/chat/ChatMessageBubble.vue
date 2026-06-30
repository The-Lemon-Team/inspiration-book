<script setup lang="ts">
import { computed, ref } from 'vue';
import { api } from '@/api/client';
import PublishMessageModal from '@/components/chat/PublishMessageModal.vue';
import { BlockMessage } from '@/blocks';
import type { Message } from '@/types';
import { messageAuthorLabel, tagStyle } from '@/types';
import { getMessagePublishState } from '@/utils/message-publish';

const props = defineProps<{
  message: Message;
}>();

const emit = defineEmits<{
  updated: [message: Message];
  deleted: [messageId: string];
}>();

const publishModalOpen = ref(false);
const busy = ref(false);
const actionError = ref('');

const publishState = computed(() => getMessagePublishState(props.message));
const authorLabel = computed(() => messageAuthorLabel(props.message));

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
