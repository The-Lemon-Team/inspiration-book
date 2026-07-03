import { ref } from 'vue';

const foldersModalOpen = ref(false);

export function useFoldersModal() {
  function openFoldersModal() {
    foldersModalOpen.value = true;
  }

  function closeFoldersModal() {
    foldersModalOpen.value = false;
  }

  return {
    foldersModalOpen,
    openFoldersModal,
    closeFoldersModal,
  };
}
