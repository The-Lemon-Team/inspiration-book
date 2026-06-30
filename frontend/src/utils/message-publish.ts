import type { Message, Tag } from '@/types';

export type MessagePublishStatus = 'private' | 'published';

export interface MessagePublishState {
  status: MessagePublishStatus;
  tag: Tag | null;
}

export function getMessagePublishState(message: Message): MessagePublishState {
  const publicEntries = message.entries.filter((entry) => entry.isPublic);
  if (publicEntries.length === 0) {
    return { status: 'private', tag: null };
  }

  return {
    status: 'published',
    tag: publicEntries[0]?.tag ?? null,
  };
}
