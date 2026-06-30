<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useShellMode } from '@/composables/useShellMode';
import AppHeader from '@/components/AppHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import TelegramShell from '@/layouts/TelegramShell.vue';

const auth = useAuthStore();
const router = useRouter();
const { isDesktopShell } = useShellMode();

function logout() {
  auth.logout();
  router.push('/');
}
</script>

<template>
  <TelegramShell v-if="isDesktopShell && auth.isAuthenticated">
    <RouterView />
  </TelegramShell>

  <div v-else class="app-shell">
    <AppHeader @logout="logout" />
    <main class="app-main">
      <RouterView />
    </main>
    <BottomNav v-if="auth.isAuthenticated" />
  </div>
</template>
