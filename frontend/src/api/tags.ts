import type { Tag, TagStatsResponse } from '@/types';
import { request } from './http';

const API_BASE = '/api/tags';

export const tagsApi = {
  list() {
    return request<Tag[]>(API_BASE);
  },

  getStats() {
    return request<TagStatsResponse>(`${API_BASE}/stats`);
  },

  create(name: string, color?: string) {
    return request<Tag>(API_BASE, {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    });
  },

  update(id: string, data: { name?: string; color?: string }) {
    return request<Tag>(`${API_BASE}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  remove(id: string) {
    return request<{ ok: boolean }>(`${API_BASE}/${id}`, { method: 'DELETE' });
  },
};
