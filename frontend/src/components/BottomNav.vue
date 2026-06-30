<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink to="/" class="bottom-nav__item">
      <span class="material-symbols-outlined">public</span>
      <span>Борд</span>
    </RouterLink>
    <RouterLink to="/tags" class="bottom-nav__item">
      <span class="material-symbols-outlined">label</span>
      <span>Группы</span>
    </RouterLink>
    <RouterLink to="/chat" class="bottom-nav__item">
      <span class="material-symbols-outlined">edit_note</span>
      <span>Чат</span>
    </RouterLink>
    <RouterLink to="/timeline" class="bottom-nav__item">
      <span class="material-symbols-outlined">view_timeline</span>
      <span>Лента</span>
    </RouterLink>
  </nav>
</template>
