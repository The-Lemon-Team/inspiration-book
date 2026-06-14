<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink to="/" class="bottom-nav__item">
      <span class="material-symbols-outlined">public</span>
      <span>борд</span>
    </RouterLink>
    <RouterLink to="/tags" class="bottom-nav__item">
      <span class="material-symbols-outlined">label</span>
      <span>группы</span>
    </RouterLink>
    <RouterLink to="/chat" class="bottom-nav__item">
      <span class="material-symbols-outlined">edit_note</span>
      <span>чат</span>
    </RouterLink>
    <RouterLink to="/timeline" class="bottom-nav__item">
      <span class="material-symbols-outlined">view_timeline</span>
      <span>лента</span>
    </RouterLink>
  </nav>
</template>
