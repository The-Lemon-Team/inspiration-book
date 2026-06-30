<script setup lang="ts">
import { ref } from 'vue';
import { CONTENT_TEMPLATES, type ContentTemplate } from '@/constants/content-templates';
import { tagStyle } from '@/types';
import ChatTemplateForm from './ChatTemplateForm.vue';

const emit = defineEmits<{
  apply: [text: string];
}>();

const activeTemplate = ref<ContentTemplate | null>(null);

function openTemplate(template: ContentTemplate) {
  activeTemplate.value =
    activeTemplate.value?.id === template.id ? null : template;
}

function onApply(text: string) {
  emit('apply', text);
  activeTemplate.value = null;
}
</script>

<template>
  <div class="chat-templates">
    <div class="chat-templates__chips">
      <button
        v-for="template in CONTENT_TEMPLATES"
        :key="template.id"
        type="button"
        class="chat-templates__chip"
        :class="{ 'chat-templates__chip--active': activeTemplate?.id === template.id }"
        :style="{
          color: tagStyle(template.color).badgeColor,
          background: tagStyle(template.color).badgeBackground,
          '--chip-color': template.color,
        }"
        @click="openTemplate(template)"
      >
        {{ template.chipLabel }}
      </button>
    </div>

    <ChatTemplateForm
      :template="activeTemplate"
      @apply="onApply"
      @close="activeTemplate = null"
    />
  </div>
</template>
