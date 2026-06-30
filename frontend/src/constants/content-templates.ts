export type ContentTemplateForm = 'youtube' | 'link';

export interface ContentTemplate {
  id: string;
  chipLabel: string;
  tagName: string;
  color: string;
  form: ContentTemplateForm;
  title: string;
  hint: string;
  urlPlaceholder: string;
}

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: 'music-youtube',
    chipLabel: 'музыка',
    tagName: 'музыка',
    color: '#7c3aed',
    form: 'youtube',
    title: 'Музыка с YouTube',
    hint: 'Вставьте ссылку на трек или плейлист с YouTube — в чате появится превью.',
    urlPlaceholder: 'https://www.youtube.com/watch?v=…',
  },
  {
    id: 'lofi',
    chipLabel: 'lo-fi',
    tagName: 'lo-fi',
    color: '#2563eb',
    form: 'youtube',
    title: 'Lo-fi с YouTube',
    hint: 'Плейлист или видео с YouTube для фона.',
    urlPlaceholder: 'https://www.youtube.com/watch?v=…',
  },
  {
    id: 'design',
    chipLabel: 'дизайн',
    tagName: 'дизайн',
    color: '#2563eb',
    form: 'link',
    title: 'Дизайн-референс',
    hint: 'Ссылка на статью, Behance, Pinterest или другой источник.',
    urlPlaceholder: 'https://…',
  },
];
