<script setup lang="ts">
import { ref } from 'vue';
import { CONTENT_TEMPLATES, type ContentTemplate } from '@/constants/content-templates';
import { tagStyle } from '@/types';
import ChatTemplateForm from './ChatTemplateForm.vue';

const emit = defineEmits<{
  musicTemplate: [template: ContentTemplate];
  linkTemplate: [template: ContentTemplate, data: { url: string; note: string }];
}>();

const activeLinkTemplate = ref<ContentTemplate | null>(null);

function onChipClick(template: ContentTemplate) {
  if (template.form === 'youtube') {
    emit('musicTemplate', template);
    return;
  }

  activeLinkTemplate.value =
    activeLinkTemplate.value?.id === template.id ? null : template;
}

function onLinkApply(data: { url: string; note: string }) {
  const template = activeLinkTemplate.value;
  if (!template) return;
  emit('linkTemplate', template, data);
  activeLinkTemplate.value = null;
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
        :class="{ 'chat-templates__chip--active': activeLinkTemplate?.id === template.id }"
        :style="{
          color: tagStyle(template.color).badgeColor,
          background: tagStyle(template.color).badgeBackground,
          '--chip-color': template.color,
        }"
        @click="onChipClick(template)"
      >
        {{ template.chipLabel }}
      </button>
    </div>

    <ChatTemplateForm
      :template="activeLinkTemplate"
      @apply-link="onLinkApply"
      @close="activeLinkTemplate = null"
    />
  </div>
</template>
