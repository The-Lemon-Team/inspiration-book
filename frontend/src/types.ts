export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  isDefault: boolean;
  entryCount?: number;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Entry {
  id: string;
  content: string;
  tag: Tag;
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
  content?: MessageDocument | null;
  createdAt: string;
  user?: User;
  entries: Entry[];
}

import type { MessageDocument } from '@inspiration-book/blocks';

export type { MessageDocument };

export interface TimelineDay {
  date: string;
  entries: Entry[];
}

export interface CalendarDay {
  date: string;
  count: number;
  entries: Entry[];
}

export function displayName(user?: User | null): string {
  if (!user) return 'Аноним';
  return user.name || user.email.split('@')[0];
}

export function messageAuthorLabel(message: Message): string {
  if (message.user?.name) return message.user.name;
  const tagName = message.entries[0]?.tag?.name;
  if (tagName) return tagName;
  if (message.user?.email) return message.user.email;
  return 'Аноним';
}

export function tagStyle(color: string) {
  return {
    borderLeftColor: color,
    badgeBackground: `${color}1a`,
    badgeColor: color,
  };
}
