export type EntryCategory = 'LEARNED' | 'REMEMBERED' | 'TODO';

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Entry {
  id: string;
  content: string;
  category: EntryCategory;
  usefulVotes: number;
  completed: boolean;
  isPublic: boolean;
  createdAt: string;
  messageId?: string | null;
  user?: User;
}

export interface Message {
  id: string;
  rawText: string;
  createdAt: string;
  entries: Entry[];
}

export interface TimelineDay {
  date: string;
  entries: Entry[];
}

export interface CalendarDay {
  date: string;
  count: number;
  entries: Entry[];
}

export interface CategoryInfo {
  key: EntryCategory;
  label: string;
}

export const CATEGORY_LABELS: Record<EntryCategory, string> = {
  LEARNED: 'Узнал',
  REMEMBERED: 'Вспомнил',
  TODO: 'Сделать',
};

export const CATEGORY_COLORS: Record<EntryCategory, string> = {
  LEARNED: '#2563eb',
  REMEMBERED: '#7c3aed',
  TODO: '#059669',
};

export function displayName(user?: User | null): string {
  if (!user) return 'Аноним';
  return user.name || user.email.split('@')[0];
}
