import { request } from './http';
import type { Chat, ChatCollection, ChatListResponse } from '@/types';

const API_BASE = '/api/chats';

export const chatsApi = {
  list() {
    return request<ChatListResponse>(API_BASE);
  },

  createCollection(name: string) {
    return request<ChatCollection>(`${API_BASE}/collections`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  createChat(name: string, collectionId?: string) {
    return request<Chat>(API_BASE, {
      method: 'POST',
      body: JSON.stringify({ name, collectionId }),
    });
  },
};
