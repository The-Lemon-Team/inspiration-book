<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { chatsApi } from '@/api/chats';
import { tagsApi } from '@/api/tags';
import { useChatsStore } from '@/stores/chats';
import type { Chat, ReplaySchedule, Tag } from '@/types';

const props = defineProps<{
  open: boolean;
  chat: Chat | null;
}>();

const emit = defineEmits<{
  close: [];
  updated: [];
}>();

const chats = useChatsStore();
const tags = ref<Tag[]>([]);
const schedules = ref<ReplaySchedule[]>([]);
const childChats = ref<Chat[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');

const newTagId = ref('');
const newTime = ref('12:00');
const newTimezone = ref('Europe/Moscow');

const isGeneral = computed(() => props.chat?.kind === 'GENERAL');
const parentName = computed(() => props.chat?.parentChat?.name ?? '—');
const childNames = computed(() =>
  childChats.value.map((chat) => chat.name).join(', ') || 'нет дочерних чатов',
);

async function loadData() {
  if (!props.chat || isGeneral.value) return;

  loading.value = true;
  error.value = '';

  try {
    const [tagList, scheduleList, children] = await Promise.all([
      tagsApi.list(),
      chatsApi.getReplaySchedules(props.chat.id),
      chatsApi.getChildren(props.chat.id),
    ]);
    tags.value = tagList;
    schedules.value = scheduleList;
    childChats.value = children;

    if (!newTagId.value && tagList.length > 0) {
      const resumeTag = tagList.find((tag) =>
        ['резюме', 'resume'].includes(tag.slug.toLowerCase()),
      );
      newTagId.value = resumeTag?.id ?? tagList[0].id;
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить настройки';
  } finally {
    loading.value = false;
  }
}

async function onSetParent() {
  if (!props.chat) return;

  await chats.load();
  const candidates = chats.allChats.filter(
    (item) => item.id !== props.chat!.id && item.kind !== 'GENERAL',
  );

  if (candidates.length === 0) {
    window.alert('Нет доступных чатов для родителя');
    return;
  }

  const listing = candidates
    .map((item, index) => `${index + 1}. ${item.name}`)
    .join('\n');
  const pick = window.prompt(
    `Родительский канал для «${props.chat.name}»:\n${listing}\n\nНомер или 0 — отвязать`,
  );
  if (pick === null) return;

  const index = Number.parseInt(pick, 10);
  const parentChatId = index === 0 ? null : candidates[index - 1]?.id;
  if (index !== 0 && !parentChatId) {
    window.alert('Неверный номер');
    return;
  }

  saving.value = true;
  try {
    await chatsApi.setParent(props.chat.id, parentChatId);
    await chats.load(true);
    emit('updated');
  } catch (e) {
    window.alert(e instanceof Error ? e.message : 'Не удалось привязать');
  } finally {
    saving.value = false;
  }
}

async function addSchedule() {
  if (!props.chat || !newTagId.value || !newTime.value) return;

  saving.value = true;
  error.value = '';

  try {
    const created = await chatsApi.createReplaySchedule(props.chat.id, {
      signalTagId: newTagId.value,
      scheduleTime: newTime.value,
      timezone: newTimezone.value,
      skipIfEmpty: true,
    });
    schedules.value = [...schedules.value, created];
    emit('updated');
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось добавить расписание';
  } finally {
    saving.value = false;
  }
}

async function toggleSchedule(schedule: ReplaySchedule) {
  saving.value = true;
  try {
    const updated = await chatsApi.updateReplaySchedule(schedule.id, {
      enabled: !schedule.enabled,
    });
    schedules.value = schedules.value.map((item) =>
      item.id === schedule.id ? updated : item,
    );
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось обновить';
  } finally {
    saving.value = false;
  }
}

async function removeSchedule(schedule: ReplaySchedule) {
  if (!window.confirm('Удалить это расписание?')) return;

  saving.value = true;
  try {
    await chatsApi.deleteReplaySchedule(schedule.id);
    schedules.value = schedules.value.filter((item) => item.id !== schedule.id);
    emit('updated');
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось удалить';
  } finally {
    saving.value = false;
  }
}

async function runSchedule(schedule: ReplaySchedule) {
  saving.value = true;
  error.value = '';

  try {
    const result = await chatsApi.runReplaySchedule(schedule.id);
    if (result.skipped) {
      window.alert(
        result.reason === 'empty'
          ? 'Сегодня нет записей с этим тегом — сводка не создана'
          : 'Сводка уже была или нечего собирать',
      );
    } else {
      window.alert('Сводка отправлена в канал');
      emit('updated');
    }
    await loadData();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось запустить';
  } finally {
    saving.value = false;
  }
}

function formatLastRun(schedule: ReplaySchedule) {
  if (schedule.lastRunAt) {
    return new Date(schedule.lastRunAt).toLocaleString('ru-RU');
  }
  return 'ещё не запускалось';
}

watch(
  () => [props.open, props.chat?.id] as const,
  ([open]) => {
    if (open) loadData();
  },
);

onMounted(() => {
  if (props.open) loadData();
});
</script>

<template>
  <div v-if="open && chat" class="channel-settings">
    <div class="channel-settings__backdrop" @click="emit('close')" />
    <div class="channel-settings__dialog" role="dialog" aria-labelledby="channel-settings-title">
      <header class="channel-settings__head">
        <div>
          <p class="channel-settings__eyebrow">Настройки канала</p>
          <h2 id="channel-settings-title" class="channel-settings__title">{{ chat.name }}</h2>
        </div>
        <button type="button" class="channel-settings__close" @click="emit('close')">
          <span class="material-symbols-outlined">close</span>
        </button>
      </header>

      <div v-if="loading" class="channel-settings__body">
        <p class="caption">Загрузка…</p>
      </div>

      <div v-else class="channel-settings__body">
        <section class="channel-settings__section">
          <h3 class="channel-settings__section-title">Иерархия</h3>
          <p class="caption">
            Родитель: <strong>{{ parentName }}</strong>
          </p>
          <p class="caption">
            Дочерние чаты: {{ childNames }}
          </p>
          <button
            type="button"
            class="btn-secondary channel-settings__btn"
            :disabled="saving || isGeneral"
            @click="onSetParent"
          >
            Изменить родителя
          </button>
        </section>

        <section class="channel-settings__section">
          <h3 class="channel-settings__section-title">Scheduled replay</h3>
          <p class="caption channel-settings__hint">
            Ежедневная сводка из дочерних чатов по выбранному тегу. Если за день нет
            записей с тегом — сводка не создаётся.
          </p>
          <p v-if="childChats.length === 0" class="caption channel-settings__warn">
            У этого чата пока нет дочерних — привяжите к нему другие чаты как родителя
            или откройте настройки на канале-агрегаторе.
          </p>

          <ul v-if="schedules.length" class="channel-settings__list">
            <li v-for="schedule in schedules" :key="schedule.id" class="channel-settings__item">
              <div class="channel-settings__item-main">
                <span class="channel-settings__item-time">{{ schedule.scheduleTime }}</span>
                <span class="channel-settings__item-tag">
                  #{{ schedule.signalTag?.name ?? 'тег' }}
                </span>
                <span class="channel-settings__item-meta caption">
                  {{ schedule.timezone }} · {{ formatLastRun(schedule) }}
                </span>
              </div>
              <div class="channel-settings__item-actions">
                <button
                  type="button"
                  class="channel-settings__icon-btn"
                  :title="schedule.enabled ? 'Выключить' : 'Включить'"
                  :disabled="saving"
                  @click="toggleSchedule(schedule)"
                >
                  <span class="material-symbols-outlined">
                    {{ schedule.enabled ? 'toggle_on' : 'toggle_off' }}
                  </span>
                </button>
                <button
                  type="button"
                  class="channel-settings__icon-btn"
                  title="Запустить сейчас"
                  :disabled="saving"
                  @click="runSchedule(schedule)"
                >
                  <span class="material-symbols-outlined">play_arrow</span>
                </button>
                <button
                  type="button"
                  class="channel-settings__icon-btn channel-settings__icon-btn--danger"
                  title="Удалить"
                  :disabled="saving"
                  @click="removeSchedule(schedule)"
                >
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </li>
          </ul>

          <p v-else class="caption channel-settings__empty">Расписаний пока нет</p>

          <form class="channel-settings__form" @submit.prevent="addSchedule">
            <label class="channel-settings__field">
              <span class="channel-settings__label">Тег-сигнал</span>
              <select v-model="newTagId" class="channel-settings__input" required>
                <option v-for="tag in tags" :key="tag.id" :value="tag.id">
                  {{ tag.name }}
                </option>
              </select>
            </label>

            <label class="channel-settings__field">
              <span class="channel-settings__label">Время</span>
              <input
                v-model="newTime"
                type="time"
                class="channel-settings__input"
                required
              />
            </label>

            <label class="channel-settings__field">
              <span class="channel-settings__label">Часовой пояс</span>
              <select v-model="newTimezone" class="channel-settings__input">
                <option value="Europe/Moscow">Europe/Moscow</option>
                <option value="UTC">UTC</option>
                <option value="Europe/Berlin">Europe/Berlin</option>
              </select>
            </label>

            <button type="submit" class="btn-primary channel-settings__submit" :disabled="saving">
              Добавить ежедневный репорт
            </button>
          </form>
        </section>

        <p v-if="error" class="channel-settings__error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>
