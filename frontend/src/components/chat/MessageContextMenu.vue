<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
  open: boolean;
  x: number;
  y: number;
}>();

const emit = defineEmits<{
  close: [];
  select: [];
}>();

const menuRef = ref<HTMLElement | null>(null);

function onDocumentPointerDown(event: MouseEvent) {
  if (!props.open) return;
  const target = event.target as Node;
  if (menuRef.value?.contains(target)) return;
  emit('close');
}

function onDocumentKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) {
    emit('close');
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    requestAnimationFrame(() => {
      const menu = menuRef.value;
      if (!menu) return;
      const rect = menu.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width - 8;
      const maxY = window.innerHeight - rect.height - 8;
      menu.style.left = `${Math.min(props.x, maxX)}px`;
      menu.style.top = `${Math.min(props.y, maxY)}px`;
    });
  },
);

onMounted(() => {
  document.addEventListener('mousedown', onDocumentPointerDown);
  document.addEventListener('keydown', onDocumentKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', onDocumentPointerDown);
  document.removeEventListener('keydown', onDocumentKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="menuRef"
      class="message-context-menu"
      :style="{ left: `${x}px`, top: `${y}px` }"
      role="menu"
      @contextmenu.prevent
    >
      <button type="button" class="message-context-menu__item" role="menuitem" @click="$emit('select')">
        <span class="material-symbols-outlined">check_circle</span>
        Выбрать
      </button>
    </div>
  </Teleport>
</template>
