import type {
  CalendarDay,
  CategoryInfo,
  Entry,
  EntryCategory,
  Message,
  TimelineDay,
} from '@/types';
import { request } from './http';

const API_BASE = '/api/entries';

export const api = {
  createMessage(rawText: string, isPublic = false) {
    return request<Message>(`${API_BASE}/messages`, {
      method: 'POST',
      body: JSON.stringify({ rawText, isPublic }),
    });
  },

  getMessages() {
    return request<Message[]>(`${API_BASE}/messages`);
  },

  getPublicBoard(limit = 50) {
    return request<Entry[]>(`${API_BASE}/public?limit=${limit}`);
  },

  getEntries(params?: {
    category?: EntryCategory;
    from?: string;
    to?: string;
  }) {
    const search = new URLSearchParams();
    if (params?.category) search.set('category', params.category);
    if (params?.from) search.set('from', params.from);
    if (params?.to) search.set('to', params.to);
    const query = search.toString();
    return request<Entry[]>(`${API_BASE}${query ? `?${query}` : ''}`);
  },

  getTimeline(params?: { category?: EntryCategory }) {
    const search = new URLSearchParams();
    if (params?.category) search.set('category', params.category);
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

  getCategories() {
    return request<CategoryInfo[]>(`${API_BASE}/categories`);
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
};
