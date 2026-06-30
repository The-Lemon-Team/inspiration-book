<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { youtubeThumbnailUrl, youtubeWatchUrl } from '@inspiration-book/genui';

const props = defineProps<{
  url: string;
  videoId: string;
  title?: string;
}>();

const fetchedTitle = ref('');
const displayTitle = computed(() => props.title || fetchedTitle.value || 'Видео с YouTube');
const thumb = computed(() => youtubeThumbnailUrl(props.videoId));
const watchUrl = computed(() => props.url || youtubeWatchUrl(props.videoId));

onMounted(async () => {
  if (props.title) return;
  try {
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl.value)}&format=json`;
    const response = await fetch(endpoint);
    if (response.ok) {
      const data = (await response.json()) as { title?: string };
      if (data.title) fetchedTitle.value = data.title;
    }
  } catch {
    // oEmbed недоступен — остаётся заглушка
  }
});
</script>

<template>
  <a
    class="genui-youtube"
    :href="watchUrl"
    target="_blank"
    rel="noopener noreferrer"
  >
    <div class="genui-youtube__thumb-wrap">
      <img :src="thumb" alt="" class="genui-youtube__thumb" loading="lazy" />
      <span class="genui-youtube__play material-symbols-outlined">play_circle</span>
    </div>
    <div class="genui-youtube__meta">
      <span class="genui-youtube__badge">YouTube</span>
      <span class="genui-youtube__title">{{ displayTitle }}</span>
      <span class="genui-youtube__host">youtube.com</span>
    </div>
  </a>
</template>
