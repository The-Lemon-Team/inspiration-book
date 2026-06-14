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

export function displayName(user?: User | null): string {
  if (!user) return 'Аноним';
  return user.name || user.email.split('@')[0];
}

export function tagStyle(color: string) {
  return {
    borderLeftColor: color,
    badgeBackground: `${color}1a`,
    badgeColor: color,
  };
}
