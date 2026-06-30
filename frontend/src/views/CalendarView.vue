<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { api } from '@/api/client';
import EntryCard from '@/components/EntryCard.vue';
import type { CalendarDay } from '@/types';

const now = new Date();
const month = ref(now.getMonth() + 1);
const year = ref(now.getFullYear());
const days = ref<CalendarDay[]>([]);
const selectedDate = ref<string | null>(null);
const loading = ref(true);
const error = ref('');

const monthLabel = computed(() =>
  new Date(year.value, month.value - 1).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  }),
);

const selectedEntries = computed(() =>
  days.value.find((day) => day.date === selectedDate.value)?.entries ?? [],
);

function daysInMonth() {
  return new Date(year.value, month.value, 0).getDate();
}

function weekdayOffset() {
  const first = new Date(year.value, month.value - 1, 1).getDay();
  return first === 0 ? 6 : first - 1;
}

const calendarCells = computed(() => {
  const cells: Array<{ date: string | null; count: number }> = [];
  for (let i = 0; i < weekdayOffset(); i += 1) {
    cells.push({ date: null, count: 0 });
  }
  for (let day = 1; day <= daysInMonth(); day += 1) {
    const date = `${year.value}-${String(month.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const bucket = days.value.find((item) => item.date === date);
    cells.push({ date, count: bucket?.count ?? 0 });
  }
  return cells;
});

async function loadCalendar() {
  loading.value = true;
  error.value = '';
  try {
    const data = await api.getCalendar(month.value, year.value);
    days.value = data.days;
    selectedDate.value = data.days[0]?.date ?? null;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить календарь';
  } finally {
    loading.value = false;
  }
}

function shiftMonth(delta: number) {
  let nextMonth = month.value + delta;
  let nextYear = year.value;
  if (nextMonth < 1) {
    nextMonth = 12;
    nextYear -= 1;
  } else if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  month.value = nextMonth;
  year.value = nextYear;
  loadCalendar();
}

onMounted(loadCalendar);
</script>

<template>
  <section class="page page--wide">
    <header class="page-header">
      <button type="button" class="ghost-btn" @click="shiftMonth(-1)">←</button>
      <h2>{{ monthLabel }}</h2>
      <button type="button" class="ghost-btn" @click="shiftMonth(1)">→</button>
    </header>

    <p v-if="loading" class="muted">Загрузка…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else>
      <div class="calendar-grid">
        <span v-for="label in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']" :key="label" class="weekday">
          {{ label }}
        </span>
        <button
          v-for="(cell, index) in calendarCells"
          :key="`${cell.date ?? 'empty'}-${index}`"
          type="button"
          class="calendar-cell"
          :class="{ active: cell.date === selectedDate, empty: !cell.date }"
          :disabled="!cell.date"
          @click="selectedDate = cell.date"
        >
          <span v-if="cell.date">{{ Number(cell.date.slice(-2)) }}</span>
          <small v-if="cell.count">{{ cell.count }}</small>
        </button>
      </div>

      <section v-if="selectedDate" class="calendar-details">
        <h3>
          {{ new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) }}
        </h3>
        <p v-if="selectedEntries.length === 0" class="empty-state">В этот день записей нет.</p>
        <EntryCard v-for="entry in selectedEntries" :key="entry.id" :entry="entry" />
      </section>
    </template>
  </section>
</template>
