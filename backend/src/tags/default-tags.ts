export const DEFAULT_TAGS = [
  { name: 'Узнал', slug: 'uznal', color: '#2563eb' },
  { name: 'Вспомнил', slug: 'vspomnil', color: '#7c3aed' },
  { name: 'Сделать', slug: 'sdelat', color: '#059669' },
] as const;

export const CUSTOM_TAG_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#059669',
  '#dc2626',
  '#ea580c',
  '#0891b2',
  '#9333ea',
  '#ca8a04',
  '#db2777',
  '#4f46e5',
];

export function slugifyTag(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0400-\u04ff-]/g, '');
}
