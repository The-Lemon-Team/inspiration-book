<script setup lang="ts">
import { ref } from 'vue';
import { uploadImage } from '@/api/uploads';

const draft = defineModel<string>('draft', { required: true });
const isPublic = defineModel<boolean>('isPublic', { default: false });

defineProps<{
  loading?: boolean;
  error?: string;
}>();

const emit = defineEmits<{
  submit: [];
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const uploadError = ref('');

function onSubmit() {
  emit('submit');
}

function openFilePicker() {
  fileInputRef.value?.click();
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;

  uploading.value = true;
  uploadError.value = '';

  try {
    const result = await uploadImage(file);
    const insertion = draft.value.trim()
      ? `\n\n![](${result.url})\n`
      : `![](${result.url})\n`;
    draft.value += insertion;
  } catch (e) {
    uploadError.value = e instanceof Error ? e.message : 'Не удалось загрузить';
  } finally {
    uploading.value = false;
  }
}
</script>

<template>
  <div class="chat-composer">
    <div class="chat-composer__input-wrap">
      <textarea
        v-model="draft"
        class="chat-composer__input"
        rows="3"
        placeholder="Введите сообщение или выберите тег…"
        :disabled="loading || uploading"
        @keydown.enter.exact.prevent="onSubmit"
      />
      <div class="chat-composer__actions">
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="chat-composer__file"
          @change="onFileSelected"
        />
        <button
          type="button"
          class="chat-composer__icon-btn"
          :disabled="loading || uploading"
          aria-label="Прикрепить изображение"
          @click="openFilePicker"
        >
          <span class="material-symbols-outlined">attach_file</span>
        </button>
        <button
          type="button"
          class="chat-composer__send"
          :disabled="loading || uploading || !draft.trim()"
          aria-label="Отправить"
          @click="onSubmit"
        >
          <span class="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>

    <label class="checkbox-label chat-composer__public">
      <input v-model="isPublic" type="checkbox" :disabled="loading || uploading" />
      Опубликовать на общем Борде
    </label>

    <p v-if="uploadError" class="error">{{ uploadError }}</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="uploading" class="caption">Загружаю изображение…</p>
  </div>
</template>
