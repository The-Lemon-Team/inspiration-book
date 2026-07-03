<script setup lang="ts">
import { RouterView } from 'vue-router';
import DesktopShellRail from '@/components/shell/DesktopShellRail.vue';
import { useShellRouteTransition } from '@/composables/useShellRouteTransition';

defineEmits<{ logout: [] }>();

const { shellTransitionName } = useShellRouteTransition();
</script>

<template>
  <div class="telegram-shell">
    <DesktopShellRail @logout="$emit('logout')" />

    <main class="telegram-shell__main telegram-shell__main--routed">
      <RouterView v-slot="{ Component, route: viewRoute }">
        <Transition :name="shellTransitionName">
          <component
            :is="Component"
            :key="viewRoute.path"
            class="telegram-shell__view"
          />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>
