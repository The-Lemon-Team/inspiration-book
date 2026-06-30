<script setup lang="ts">
import { onMounted, provide, ref } from 'vue';
import {
  templateForMusicTag,
  type ContentTemplate,
} from '@/constants/content-templates';
import {
  musicBlockEditorKey,
  type MusicBlockFormPayload,
} from '@/composables/music-block-editor';
import { tagsApi } from '@/api/tags';
import type { Tag } from '@/types';
import ChatBlockEditor from '@/editor/ChatBlockEditor.vue';
import { uploadImage } from '@/api/uploads';
import MusicBlockModal from './MusicBlockModal.vue';

defineProps<{
  loading?: boolean;
  error?: string;
}>();

const emit = defineEmits<{
  submit: [];
}>();

const editorRef = ref<InstanceType<typeof ChatBlockEditor> | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const uploadError = ref('');
const musicModalOpen = ref(false);
const musicModalMode = ref<'create' | 'edit'>('create');
const musicEditInitial = ref<MusicBlockFormPayload | null>(null);
const activeMusicTemplate = ref<ContentTemplate | null>(null);
const userTags = ref<Tag[]>([]);
let musicEditOnSave: ((payload: MusicBlockFormPayload) => void) | null = null;

onMounted(async () => {
  try {
    userTags.value = await tagsApi.list();
  } catch {
    userTags.value = [];
  }
});

provide(musicBlockEditorKey, {
  openEdit(initial, onSave) {
    activeMusicTemplate.value = templateForMusicTag(initial.tag);
    musicModalMode.value = 'edit';
    musicEditInitial.value = { ...initial };
    musicEditOnSave = onSave;
    musicModalOpen.value = true;
  },
});

function onSubmit() {
  emit('submit');
}

function openFilePicker() {
  fileInputRef.value?.click();
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);
  input.value = '';
  if (files.length === 0) return;

  uploading.value = true;
  uploadError.value = '';

  try {
    const urls: string[] = [];
    for (const file of files) {
      const result = await uploadImage(file);
      urls.push(result.url);
    }
    editorRef.value?.insertImages(urls);
  } catch (e) {
    uploadError.value = e instanceof Error ? e.message : 'Не удалось загрузить';
  } finally {
    uploading.value = false;
  }
}

function openMusicModal(template: ContentTemplate) {
  musicModalMode.value = 'create';
  musicEditInitial.value = null;
  musicEditOnSave = null;
  activeMusicTemplate.value = template;
  musicModalOpen.value = true;
}

function closeMusicModal() {
  musicModalOpen.value = false;
  musicModalMode.value = 'create';
  musicEditInitial.value = null;
  musicEditOnSave = null;
}

function onMusicInsert(payload: MusicBlockFormPayload) {
  editorRef.value?.insertMusicBlock(payload);
}

function onMusicSave(payload: MusicBlockFormPayload) {
  musicEditOnSave?.(payload);
  closeMusicModal();
}

function insertLinkTemplate(template: ContentTemplate, data: { url: string; note: string }) {
  editorRef.value?.insertLinkSection({
    tagName: template.tagName,
    tagColor: template.color,
    note: data.note,
    url: data.url,
  });
}

function isEmpty() {
  return editorRef.value?.isEmpty() ?? true;
}

function getDocument() {
  return editorRef.value?.getDocument();
}

function getRawText() {
  return editorRef.value?.getRawText() ?? '';
}

function clear() {
  editorRef.value?.clear();
}

defineExpose({
  openMusicModal,
  insertLinkTemplate,
  isEmpty,
  getDocument,
  getRawText,
  clear,
});
</script>

<template>
  <div class="chat-composer">
    <div class="chat-composer__input-wrap chat-composer__input-wrap--editor">
      <ChatBlockEditor ref="editorRef" :disabled="loading || uploading" class="chat-composer__editor" />
      <div class="chat-composer__actions">
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          multiple
          class="chat-composer__file"
          @change="onFileSelected"
        />
        <button
          type="button"
          class="chat-composer__icon-btn"
          :disabled="loading || uploading"
          aria-label="Прикрепить изображения"
          @click="openFilePicker"
        >
          <span class="material-symbols-outlined">attach_file</span>
        </button>
        <button
          type="button"
          class="chat-composer__send"
          :disabled="loading || uploading || isEmpty()"
          aria-label="Отправить"
          @click="onSubmit"
        >
          <span class="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>

    <p v-if="uploadError" class="error">{{ uploadError }}</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="uploading" class="caption">Загружаю изображения…</p>

    <MusicBlockModal
      :open="musicModalOpen"
      :template="activeMusicTemplate"
      :mode="musicModalMode"
      :initial="musicEditInitial"
      :user-tags="userTags"
      @close="closeMusicModal"
      @insert="onMusicInsert"
      @save="onMusicSave"
    />
  </div>
</template>
