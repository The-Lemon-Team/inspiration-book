import { ref } from 'vue';

export type ShellTransitionName = 'shell-overlay-in' | 'shell-overlay-out' | 'shell-none';

const shellTransitionName = ref<ShellTransitionName>('shell-none');

const OVERLAY_ROUTE_NAMES = new Set(['groups']);
const CHAT_ROUTE_NAMES = new Set(['chat-room', 'chats-list']);

export function resolveShellTransition(
  toName: string | undefined,
  fromName: string | undefined,
): ShellTransitionName {
  if (fromName === 'chat-room' && toName && OVERLAY_ROUTE_NAMES.has(toName)) {
    return 'shell-overlay-in';
  }
  if (fromName && OVERLAY_ROUTE_NAMES.has(fromName) && toName && CHAT_ROUTE_NAMES.has(toName)) {
    return 'shell-overlay-out';
  }
  return 'shell-none';
}

export function setShellTransitionName(name: ShellTransitionName) {
  shellTransitionName.value = name;
}

export function useShellRouteTransition() {
  return { shellTransitionName };
}
