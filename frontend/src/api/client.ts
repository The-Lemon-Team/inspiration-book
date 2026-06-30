import type {
  CalendarDay,
  Entry,
  Message,
  MessageDocument,
  TimelineDay,
} from '@/types';
import { request } from './http';

const API_BASE = '/api/entries';

export const api = {
  createMessage(rawText: string, content?: MessageDocument) {
    return request<Message>(`${API_BASE}/messages`, {
      method: 'POST',
      body: JSON.stringify({ rawText, content }),
    });
  },

  getMessages() {
    return request<Message[]>(`${API_BASE}/messages`);
  },

  getPublicBoard(limit = 50, tagId?: string) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (tagId) params.set('tagId', tagId);
    return request<Entry[]>(`${API_BASE}/public?${params}`);
  },

  getEntries(params?: {
    tagId?: string;
    from?: string;
    to?: string;
    visibility?: 'all' | 'public' | 'private';
  }) {
    const search = new URLSearchParams();
    if (params?.tagId) search.set('tagId', params.tagId);
    if (params?.from) search.set('from', params.from);
    if (params?.to) search.set('to', params.to);
    if (params?.visibility && params.visibility !== 'all') {
      search.set('visibility', params.visibility);
    }
    const query = search.toString();
    return request<Entry[]>(`${API_BASE}${query ? `?${query}` : ''}`);
  },

  getTimeline(params?: {
    tagId?: string;
    visibility?: 'all' | 'public' | 'private';
  }) {
    const search = new URLSearchParams();
    if (params?.tagId) search.set('tagId', params.tagId);
    if (params?.visibility && params.visibility !== 'all') {
      search.set('visibility', params.visibility);
    }
    const query = search.toString();
    return request<TimelineDay[]>(`${API_BASE}/timeline${query ? `?${query}` : ''}`);
  },

  getCalendar(month: number, year: number) {
    return request<{ month: number; year: number; days: CalendarDay[] }>(
      `${API_BASE}/calendar?month=${month}&year=${year}`,
    );
  },

  getTop(limit = 10) {
    return request<Entry[]>(`${API_BASE}/top?limit=${limit}`);
  },

  vote(id: string) {
    return request<Entry>(`${API_BASE}/${id}/vote`, { method: 'POST' });
  },

  setPublic(id: string, isPublic: boolean) {
    return request<Entry>(`${API_BASE}/${id}/public`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublic }),
    });
  },

  publishMessage(messageId: string, tagId: string, isPublic = true) {
    return request<Message>(`${API_BASE}/messages/${messageId}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ tagId, isPublic }),
    });
  },

  deleteMessage(messageId: string) {
    return request<{ ok: boolean }>(`${API_BASE}/messages/${messageId}`, {
      method: 'DELETE',
    });
  },
};
