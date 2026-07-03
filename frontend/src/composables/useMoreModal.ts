import { ref } from 'vue';

const moreModalOpen = ref(false);

export function useMoreModal() {
  function openMoreModal() {
    moreModalOpen.value = true;
  }

  function closeMoreModal() {
    moreModalOpen.value = false;
  }

  return {
    moreModalOpen,
    openMoreModal,
    closeMoreModal,
  };
}
