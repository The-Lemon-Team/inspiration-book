<script setup lang="ts">
defineProps<{
  count: number;
  limitNotice?: string;
}>();

defineEmits<{
  forward: [];
  delete: [];
  copy: [];
  cancel: [];
}>();
</script>

<template>
  <div class="message-selection-bar" role="toolbar" aria-label="Действия с сообщениями">
    <span class="message-selection-bar__count">Выбрано: {{ count }}</span>

    <div class="message-selection-bar__actions">
      <button type="button" class="message-selection-bar__btn" :disabled="count === 0" @click="$emit('forward')">
        <span class="material-symbols-outlined">forward</span>
        Переслать
      </button>
      <button type="button" class="message-selection-bar__btn" :disabled="count === 0" @click="$emit('copy')">
        <span class="material-symbols-outlined">content_copy</span>
        Копировать
      </button>
      <button
        type="button"
        class="message-selection-bar__btn message-selection-bar__btn--danger"
        :disabled="count === 0"
        @click="$emit('delete')"
      >
        <span class="material-symbols-outlined">delete</span>
        Удалить
      </button>
      <button
        type="button"
        class="message-selection-bar__btn message-selection-bar__btn--muted"
        @click="$emit('cancel')"
      >
        <span class="material-symbols-outlined">close</span>
        Отмена
      </button>
    </div>

    <p v-if="limitNotice" class="message-selection-bar__notice" role="status">{{ limitNotice }}</p>
  </div>
</template>
