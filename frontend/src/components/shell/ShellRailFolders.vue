<script setup lang="ts">
import ChatFoldersManageModal from '@/components/chats/ChatFoldersManageModal.vue';
import { useChatFolders } from '@/composables/useChatFolders';
import { useFoldersModal } from '@/composables/useFoldersModal';

const emit = defineEmits<{ select: [folderId: string] }>();

const { folderTabs, selectedFolderId, selectFolder } = useChatFolders();
const { foldersModalOpen, openFoldersModal, closeFoldersModal } = useFoldersModal();

function onFolderClick(folderId: string) {
  selectFolder(folderId);
  emit('select', folderId);
}

function onFolderCreated(collectionId: string) {
  selectFolder(collectionId);
  emit('select', collectionId);
}
</script>

<template>
  <button
    v-for="folder in folderTabs"
    :key="folder.id"
    type="button"
    class="tg-folders-rail__item"
    :class="{ 'tg-folders-rail__item--active': selectedFolderId === folder.id }"
    :title="folder.title"
    :aria-label="folder.title"
    :aria-current="selectedFolderId === folder.id ? 'true' : undefined"
    @click="onFolderClick(folder.id)"
  >
    <span
      v-if="folder.id === 'all'"
      class="tg-folders-rail__icon tg-folders-rail__icon--all"
    >
      <span class="material-symbols-outlined">{{ folder.icon }}</span>
    </span>
    <span
      v-else
      class="tg-folders-rail__icon tg-folders-rail__icon--collection"
      :style="{ background: folder.color }"
    >
      {{ folder.initial }}
    </span>
    <span class="tg-folders-rail__label">{{ folder.label }}</span>
  </button>

  <button
    type="button"
    class="tg-folders-rail__item tg-folders-rail__item--add"
    title="Управление папками"
    aria-label="Управление папками"
    @click="openFoldersModal"
  >
    <span class="tg-folders-rail__icon tg-folders-rail__icon--add">
      <span class="material-symbols-outlined">create_new_folder</span>
    </span>
  </button>

  <Teleport to="body">
    <ChatFoldersManageModal
      :open="foldersModalOpen"
      @close="closeFoldersModal"
      @created="onFolderCreated"
    />
  </Teleport>
</template>
