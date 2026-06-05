import type { AuthResponse, User } from '@/types';
import { request } from './http';

const API_BASE = '/api/auth';

export const authApi = {
  register(email: string, password: string, name?: string) {
    return request<AuthResponse>(`${API_BASE}/register`, {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  login(email: string, password: string) {
    return request<AuthResponse>(`${API_BASE}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  me() {
    return request<User>(`${API_BASE}/me`);
  },
};
