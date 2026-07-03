import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';

export const CHATS_LAYOUT_BREAKPOINT = 1280;

export function useChatsLayout() {
  const settings = useSettingsStore();
  const route = useRoute();
  const windowWidth = ref(
    typeof window !== 'undefined' ? window.innerWidth : CHATS_LAYOUT_BREAKPOINT,
  );

  function onResize() {
    windowWidth.value = window.innerWidth;
  }

  onMounted(() => window.addEventListener('resize', onResize));
  onUnmounted(() => window.removeEventListener('resize', onResize));

  const isNarrow = computed(() => windowWidth.value < CHATS_LAYOUT_BREAKPOINT);

  const effectiveMode = computed<'three' | 'two'>(() => {
    const pref = settings.chatsLayoutPreference;
    if (pref === 'three') return 'three';
    if (pref === 'two') return 'two';
    return isNarrow.value ? 'two' : 'three';
  });

  const hasActiveChat = computed(
    () => route.name === 'chat-room' && Boolean(route.params.chatId),
  );

  const showList = computed(() => true);

  const showChat = computed(() => hasActiveChat.value);

  const showChatPlaceholder = computed(
    () => effectiveMode.value === 'three' && !hasActiveChat.value,
  );

  const showBackButton = computed(
    () => effectiveMode.value === 'two' && hasActiveChat.value,
  );

  return {
    effectiveMode,
    isNarrow,
    hasActiveChat,
    showList,
    showChat,
    showChatPlaceholder,
    showBackButton,
  };
}
