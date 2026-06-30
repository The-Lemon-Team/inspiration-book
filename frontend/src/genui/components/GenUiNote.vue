<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>

<template>
  <p class="genui-note">{{ text }}</p>
</template>
