<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { tagsApi } from '@/api/tags';
import TagBadge from '@/components/TagBadge.vue';
import { uiVisibleTags } from '@/constants/tags-ui';
import type { Tag, TagStatsResponse } from '@/types';
import { tagStyle } from '@/types';

const router = useRouter();
const stats = ref<TagStatsResponse | null>(null);
const loading = ref(true);
const error = ref('');

const topTags = computed(() => {
  if (!stats.value) return [];
  const visibleIds = new Set(uiVisibleTags(stats.value.topTags.map((item) => item.tag)).map((tag) => tag.id));
  return stats.value.topTags.filter((item) => visibleIds.has(item.tag.id));
});

const recentMentions = computed(() => {
  if (!stats.value) return [];
  const visibleIds = new Set(uiVisibleTags(stats.value.recentMentions.map((item) => item.tag)).map((tag) => tag.id));
  return stats.value.recentMentions.filter((item) => visibleIds.has(item.tag.id));
});

const recentMessages = computed(() => {
  if (!stats.value) return [];
  return stats.value.recentMessages
    .map((message) => ({
      ...message,
      tags: uiVisibleTags(message.tags),
      entries: message.entries.filter((entry) =>
        uiVisibleTags([entry.tag]).length > 0,
      ),
    }))
    .filter((message) => message.tags.length > 0);
});

const maxTopCount = computed(() =>
  Math.max(1, ...topTags.value.map((item) => item.entryCount)),
);

function formatCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(count);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

function messagePreview(rawText: string, max = 120) {
  const line = rawText
    .split(/\r?\n/)
    .map((part) => part.trim())
    .find(Boolean);
  if (!line) return 'Сообщение без текста';
  return line.length > max ? `${line.slice(0, max)}…` : line;
}

function openTag(tag: Tag) {
  router.push({ name: 'timeline', query: { tagId: tag.id } });
}

function openMessage(chatId: string | undefined | null, messageId: string) {
  if (!chatId) return;
  router.push({ name: 'chat-room', params: { chatId }, hash: `#msg-${messageId}` });
}

async function loadStats() {
  loading.value = true;
  error.value = '';
  try {
    stats.value = await tagsApi.getStats();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить статистику';
  } finally {
    loading.value = false;
  }
}

onMounted(loadStats);
</script>

<template>
  <section class="page tags-page">
    <header class="page-hero">
      <h2 class="page-title">Теги</h2>
      <p class="caption">Статистика упоминаний и сообщений с тегами</p>
    </header>

    <div v-if="loading" class="page-state page-state--loading">
      <span class="material-symbols-outlined page-state__icon spin">progress_activity</span>
      <p class="caption">Загружаем статистику…</p>
    </div>

    <div v-else-if="error" class="page-state page-state--error">
      <span class="material-symbols-outlined page-state__icon">cloud_off</span>
      <h3 class="page-state__title">Не удалось загрузить</h3>
      <p class="caption page-state__text">{{ error }}</p>
      <button type="button" class="btn-primary" @click="loadStats">Попробовать снова</button>
    </div>

    <template v-else-if="stats">
      <div class="tags-summary">
        <article class="tags-summary__card">
          <span class="tags-summary__value">{{ stats.summary.mentionedTags }}</span>
          <span class="tags-summary__label">тегов упомянуто</span>
        </article>
        <article class="tags-summary__card">
          <span class="tags-summary__value">{{ formatCount(stats.summary.totalMentions) }}</span>
          <span class="tags-summary__label">записей</span>
        </article>
        <article class="tags-summary__card">
          <span class="tags-summary__value">{{ formatCount(stats.summary.totalMessages) }}</span>
          <span class="tags-summary__label">сообщений</span>
        </article>
      </div>

      <section v-if="topTags.length" class="tags-section">
        <div class="tags-section__head">
          <h3 class="tags-section__title">Топ тегов</h3>
          <p class="caption">По числу упоминаний в записях</p>
        </div>
        <ol class="tags-top-list">
          <li
            v-for="(item, index) in topTags"
            :key="item.tag.id"
            class="tags-top-item"
          >
            <button type="button" class="tags-top-item__btn" @click="openTag(item.tag)">
              <span class="tags-top-item__rank">#{{ index + 1 }}</span>
              <div class="tags-top-item__main">
                <div class="tags-top-item__row">
                  <TagBadge :tag="item.tag" />
                  <span class="tags-top-item__count">{{ item.entryCount }} · {{ item.messageCount }} сообщ.</span>
                </div>
                <div
                  class="tags-top-item__bar"
                  :style="{
                    width: `${Math.max(12, (item.entryCount / maxTopCount) * 100)}%`,
                    background: tagStyle(item.tag.color).badgeBackground,
                  }"
                />
                <p v-if="item.lastMentionedAt" class="caption tags-top-item__meta">
                  Последний раз {{ formatShortDate(item.lastMentionedAt) }}
                </p>
              </div>
            </button>
          </li>
        </ol>
      </section>

      <section v-if="recentMentions.length" class="tags-section">
        <div class="tags-section__head">
          <h3 class="tags-section__title">Недавно упомянутые</h3>
          <p class="caption">Лента последних записей с тегами</p>
        </div>
        <div class="tags-mentions-rail" tabindex="0">
          <article
            v-for="mention in recentMentions"
            :key="mention.id"
            class="tags-mention-card"
            :style="{ borderLeftColor: tagStyle(mention.tag.color).borderLeftColor }"
          >
            <TagBadge :tag="mention.tag" />
            <p class="tags-mention-card__content">{{ mention.content }}</p>
            <div class="tags-mention-card__meta">
              <time class="caption">{{ formatDate(mention.createdAt) }}</time>
              <button
                v-if="mention.messageId && mention.chat"
                type="button"
                class="tags-mention-card__link"
                @click="openMessage(mention.chat?.id, mention.messageId)"
              >
                {{ mention.chat.name }}
              </button>
            </div>
          </article>
        </div>
      </section>

      <section class="tags-section">
        <div class="tags-section__head">
          <h3 class="tags-section__title">Сообщения с тегами</h3>
          <p class="caption">Теги вместе с исходным сообщением</p>
        </div>

        <div v-if="recentMessages.length === 0" class="page-state page-state--empty">
          <span class="material-symbols-outlined page-state__icon">label</span>
          <h3 class="page-state__title">Пока нет сообщений</h3>
          <p class="caption page-state__text">
            Напишите в чате сообщение с тегом — оно появится здесь.
          </p>
          <RouterLink to="/chats" class="btn-primary">Перейти в чаты</RouterLink>
        </div>

        <div v-else class="tags-messages-list">
          <article
            v-for="message in recentMessages"
            :key="message.id"
            class="tags-message-card card-hover"
          >
            <header class="tags-message-card__head">
              <div class="tags-message-card__tags">
                <TagBadge v-for="tag in message.tags" :key="tag.id" :tag="tag" />
              </div>
              <time class="caption">{{ formatDate(message.createdAt) }}</time>
            </header>

            <p class="tags-message-card__preview">{{ messagePreview(message.rawText) }}</p>

            <ul v-if="message.entries.length" class="tags-message-card__entries">
              <li
                v-for="entry in message.entries"
                :key="entry.id"
                class="tags-message-card__entry"
                :style="{ borderLeftColor: tagStyle(entry.tag.color).borderLeftColor }"
              >
                <TagBadge :tag="entry.tag" />
                <span>{{ entry.content }}</span>
              </li>
            </ul>

            <footer class="tags-message-card__footer">
              <span v-if="message.chat" class="caption">
                {{ message.chat.name }}
              </span>
              <button
                v-if="message.chat"
                type="button"
                class="ghost-btn"
                @click="openMessage(message.chat?.id, message.id)"
              >
                Открыть в чате
              </button>
            </footer>
          </article>
        </div>
      </section>
    </template>
  </section>
</template>
