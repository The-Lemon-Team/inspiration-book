import { request } from './http';
import type {
  ChannelActivityResponse,
  Chat,
  ChatCollection,
  ChatListResponse,
  ReplaySchedule,
  UpwardGrant,
  UpwardTarget,
} from '@/types';

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

  createChat(name: string, collectionId?: string, parentChatId?: string) {
    return request<Chat>(API_BASE, {
      method: 'POST',
      body: JSON.stringify({ name, collectionId, parentChatId }),
    });
  },

  setParent(chatId: string, parentChatId: string | null) {
    return request<Chat>(`${API_BASE}/${chatId}/parent`, {
      method: 'PATCH',
      body: JSON.stringify({ parentChatId }),
    });
  },

  setPin(chatId: string, pinned: boolean) {
    return request<Chat>(`${API_BASE}/${chatId}/pin`, {
      method: 'PATCH',
      body: JSON.stringify({ pinned }),
    });
  },

  reorder(chatIds: string[]) {
    return request<ChatListResponse>(`${API_BASE}/reorder`, {
      method: 'POST',
      body: JSON.stringify({ chatIds }),
    });
  },

  getUpwardTargets(chatId: string) {
    return request<UpwardTarget[]>(`${API_BASE}/${chatId}/upward-targets`);
  },

  getChildren(chatId: string) {
    return request<Chat[]>(`${API_BASE}/${chatId}/children`);
  },

  getChannelActivity(chatId: string, limit = 30) {
    return request<ChannelActivityResponse>(
      `${API_BASE}/${chatId}/channel-activity?limit=${limit}`,
    );
  },

  getReplaySchedules(channelChatId: string) {
    return request<ReplaySchedule[]>(`${API_BASE}/${channelChatId}/replay-schedules`);
  },

  createReplaySchedule(
    channelChatId: string,
    payload: {
      signalTagId: string;
      scheduleTime: string;
      timezone?: string;
      skipIfEmpty?: boolean;
    },
  ) {
    return request<ReplaySchedule>(`${API_BASE}/${channelChatId}/replay-schedules`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateReplaySchedule(
    scheduleId: string,
    payload: Partial<{
      signalTagId: string;
      scheduleTime: string;
      timezone: string;
      enabled: boolean;
      skipIfEmpty: boolean;
    }>,
  ) {
    return request<ReplaySchedule>(`${API_BASE}/replay-schedules/${scheduleId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteReplaySchedule(scheduleId: string) {
    return request<{ ok: boolean }>(`${API_BASE}/replay-schedules/${scheduleId}`, {
      method: 'DELETE',
    });
  },

  runReplaySchedule(scheduleId: string) {
    return request<{ skipped: boolean; reason?: string; messageId?: string }>(
      `${API_BASE}/replay-schedules/${scheduleId}/run`,
      { method: 'POST' },
    );
  },

  createUpwardGrant(fromChatId: string, toChatId: string) {
    return request(`${API_BASE}/upward-grants`, {
      method: 'POST',
      body: JSON.stringify({ fromChatId, toChatId }),
    });
  },

  getUpwardGrants() {
    return request<UpwardGrant[]>(`${API_BASE}/upward-grants`);
  },

  deleteUpwardGrant(grantId: string) {
    return request(`${API_BASE}/upward-grants/${grantId}`, {
      method: 'DELETE',
    });
  },
};
