<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink to="/filters" class="bottom-nav__item">
      <span class="material-symbols-outlined">filter_alt</span>
      <span>Фильтры</span>
    </RouterLink>
    <RouterLink to="/chat" class="bottom-nav__item">
      <span class="material-symbols-outlined">forum</span>
      <span>Чаты</span>
    </RouterLink>
    <RouterLink to="/timeline" class="bottom-nav__item">
      <span class="material-symbols-outlined">view_timeline</span>
      <span>Лента</span>
    </RouterLink>
    <RouterLink to="/settings" class="bottom-nav__item">
      <span class="material-symbols-outlined">settings</span>
      <span>Ещё</span>
    </RouterLink>
  </nav>
</template>
