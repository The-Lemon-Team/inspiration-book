import { computed, onMounted, onUnmounted, ref, type Ref } from 'vue';

export const MAX_SELECTED_MESSAGES = 100;

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest('a, button, input, textarea, [contenteditable]'));
}

export function useChatMessageSelection(messages: Ref<{ id: string }[]>) {
  const isSelectionMode = ref(false);
  const selectedMessageIds = ref<Set<string>>(new Set());
  const anchorMessageId = ref<string | null>(null);
  const limitNotice = ref('');
  const dragActive = ref(false);
  const dragStartId = ref<string | null>(null);
  const suppressNextClick = ref(false);

  const selectedCount = computed(() => selectedMessageIds.value.size);

  const orderedMessageIds = computed(() => messages.value.map((message) => message.id));

  function clearLimitNotice() {
    limitNotice.value = '';
  }

  function showLimitNotice() {
    limitNotice.value = `Можно выбрать не более ${MAX_SELECTED_MESSAGES} сообщений`;
  }

  function syncSelectionMode() {
    isSelectionMode.value = selectedMessageIds.value.size > 0;
    if (!isSelectionMode.value) {
      anchorMessageId.value = null;
    }
  }

  function setSelection(ids: string[]) {
    if (ids.length > MAX_SELECTED_MESSAGES) {
      showLimitNotice();
      selectedMessageIds.value = new Set(ids.slice(0, MAX_SELECTED_MESSAGES));
    } else {
      clearLimitNotice();
      selectedMessageIds.value = new Set(ids);
    }
    syncSelectionMode();
  }

  function getRangeIds(fromId: string, toId: string) {
    const ids = orderedMessageIds.value;
    const fromIndex = ids.indexOf(fromId);
    const toIndex = ids.indexOf(toId);
    if (fromIndex === -1 || toIndex === -1) return [];
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    return ids.slice(start, end + 1);
  }

  function enterSelectionMode(messageId?: string) {
    if (messageId) {
      setSelection([messageId]);
      anchorMessageId.value = messageId;
      return;
    }
    isSelectionMode.value = true;
  }

  function exitSelectionMode() {
    isSelectionMode.value = false;
    selectedMessageIds.value = new Set();
    anchorMessageId.value = null;
    dragActive.value = false;
    dragStartId.value = null;
    clearLimitNotice();
  }

  function toggleMessage(messageId: string) {
    const next = new Set(selectedMessageIds.value);
    if (next.has(messageId)) {
      next.delete(messageId);
    } else if (next.size >= MAX_SELECTED_MESSAGES) {
      showLimitNotice();
      return;
    } else {
      next.add(messageId);
    }
    selectedMessageIds.value = next;
    anchorMessageId.value = messageId;
    syncSelectionMode();
    if (next.size > 0) clearLimitNotice();
  }

  function selectRange(toMessageId: string) {
    const anchor = anchorMessageId.value ?? toMessageId;
    const rangeIds = getRangeIds(anchor, toMessageId);
    if (rangeIds.length === 0) return;

    if (rangeIds.length > MAX_SELECTED_MESSAGES) {
      showLimitNotice();
      selectedMessageIds.value = new Set(rangeIds.slice(0, MAX_SELECTED_MESSAGES));
    } else {
      clearLimitNotice();
      selectedMessageIds.value = new Set(rangeIds);
    }
    anchorMessageId.value = toMessageId;
    syncSelectionMode();
  }

  function applyDragRange(toMessageId: string) {
    if (!dragStartId.value) return;
    const rangeIds = getRangeIds(dragStartId.value, toMessageId);
    setSelection(rangeIds);
    anchorMessageId.value = toMessageId;
  }

  function startDragSelect(messageId: string) {
    dragActive.value = true;
    dragStartId.value = messageId;
    suppressNextClick.value = true;
    applyDragRange(messageId);
  }

  function updateDragSelect(messageId: string) {
    if (!dragActive.value) return;
    applyDragRange(messageId);
  }

  function endDragSelect() {
    dragActive.value = false;
    dragStartId.value = null;
  }

  function removeMessageFromSelection(messageId: string) {
    if (!selectedMessageIds.value.has(messageId)) return;
    const next = new Set(selectedMessageIds.value);
    next.delete(messageId);
    selectedMessageIds.value = next;
    syncSelectionMode();
  }

  function isSelected(messageId: string) {
    return selectedMessageIds.value.has(messageId);
  }

  function onMessageMouseDown(messageId: string, event: MouseEvent) {
    if (event.button !== 0) return false;
    if (event.ctrlKey || event.metaKey || event.shiftKey) return false;
    if (isInteractiveTarget(event.target)) return false;

    event.preventDefault();
    startDragSelect(messageId);
    return true;
  }

  function onMessageMouseEnter(messageId: string) {
    if (!dragActive.value) return;
    updateDragSelect(messageId);
  }

  function onMessageClick(messageId: string, event: MouseEvent) {
    if (isInteractiveTarget(event.target)) return;

    if (suppressNextClick.value) {
      suppressNextClick.value = false;
      return;
    }

    if (event.shiftKey) {
      event.preventDefault();
      if (!isSelectionMode.value) enterSelectionMode(messageId);
      selectRange(messageId);
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      if (!isSelectionMode.value) enterSelectionMode();
      toggleMessage(messageId);
      return;
    }

    if (isSelectionMode.value) {
      event.preventDefault();
      toggleMessage(messageId);
    }
  }

  function onCheckboxClick(messageId: string, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!isSelectionMode.value) enterSelectionMode(messageId);
    else toggleMessage(messageId);
  }

  function onContextMenuSelect(messageId: string) {
    enterSelectionMode(messageId);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    if (!isSelectionMode.value) return;
    exitSelectionMode();
  }

  onMounted(() => {
    window.addEventListener('mouseup', endDragSelect);
    window.addEventListener('keydown', onKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('mouseup', endDragSelect);
    window.removeEventListener('keydown', onKeyDown);
  });

  return {
    isSelectionMode,
    selectedMessageIds,
    selectedCount,
    limitNotice,
    dragActive,
    enterSelectionMode,
    exitSelectionMode,
    toggleMessage,
    selectRange,
    isSelected,
    onMessageMouseDown,
    onMessageMouseEnter,
    onMessageClick,
    onCheckboxClick,
    onContextMenuSelect,
    clearLimitNotice,
    removeMessageFromSelection,
  };
}
